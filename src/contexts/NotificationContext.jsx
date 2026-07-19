import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { notificationAPI } from "../lib/api";
import { useAuth, Roles } from "./AuthContext";
import { useFirebaseMessaging } from "../hooks/useFirebaseMessaging";
import { useSignalR } from "../hooks/useSignalR";
import { useAppointmentReminders } from "../hooks/useAppointmentReminders";
import {
  isChatMessagePayload,
  mapChatMessageToNotification,
  mapRealtimeNotification,
  messageFromCurrentUser,
  normalizeNotification,
  getIncomingRoomId,
  shouldPushChatNotification,
} from "../lib/notificationUtils";

const CHAT_MESSAGE_EVENTS = new Set([
  "ReceiveMessage",
  "NewMessage",
  "MessageReceived",
  "ChatMessageCreated",
]);

const NotificationContext = createContext(null);

const REALTIME_EVENTS = [
  "ReceiveNotification",
  "NewNotification",
  "NotificationCreated",
  "ReceiveMessage",
  "NewMessage",
  "MessageReceived",
  "ChatMessageCreated",
  "BookingCreated",
  "NewBooking",
  "BookingConfirmed",
  "BookingCancelled",
  "BookingCanceled",
  "BookingUpdated",
  "BookingStatusUpdated",
  "BookingRescheduled",
  "SessionStarted",
  "LiveSessionStarted",
  "MeetingStarted",
  "NewSupportTicket",
  "SupportTicketCreated",
  "PatientUpdate",
  "PatientStatusUpdated",
  "AppointmentReminder",
  "SessionReminder",
  "SupportStatusUpdated",
  "SupportCaseUpdated",
  "EmergencyAlert",
  "EmergencyCaseOpened",
  "BlackmailAlert",
  "BlackmailCaseOpened",
  "HighPrioritySupportCase",
];

export function NotificationProvider({ children }) {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const upsertNotification = useCallback((notification) => {
    setNotifications((prev) => {
      const withoutDuplicate = prev.filter((item) => item.id !== notification.id);
      return [notification, ...withoutDuplicate];
    });
  }, []);

  const handleRealtime = useCallback(
    (eventName, payload) => {
      if (CHAT_MESSAGE_EVENTS.has(eventName) && isChatMessagePayload(payload)) {
        if (messageFromCurrentUser(payload, user)) return;
        const roomId = getIncomingRoomId(payload);
        if (!shouldPushChatNotification(roomId)) return;
        upsertNotification(mapChatMessageToNotification(payload, role));
        return;
      }
      upsertNotification(mapRealtimeNotification(eventName, payload, role));
    },
    [role, upsertNotification, user],
  );

  const addNotification = useCallback((payload) => {
    if (payload?.id && payload?.category) {
      upsertNotification(payload);
      return;
    }

    // Firebase foreground payloads arrive as { notification, data }; chat fields
    // live in `data`. Route chat messages through the same path as SignalR so the
    // stable id (local-chat-<room>-<messageId>) dedups against an already-handled
    // message and active-room / own-message suppression applies — and so Firebase
    // never forces a full message reload when SignalR already appended it.
    const chatSource =
      payload?.notification || payload?.data
        ? { ...(payload.notification || {}), ...(payload.data || {}) }
        : payload;
    if (isChatMessagePayload(chatSource)) {
      handleRealtime("ReceiveMessage", chatSource);
      return;
    }

    upsertNotification(normalizeNotification(chatSource, role));
  }, [handleRealtime, role, upsertNotification]);

  const fetchNotifications = useCallback(async (pageIndex = 1, pageSize = 100) => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await notificationAPI.getNotifications(pageIndex, pageSize);
      const data = response?.Data ?? response?.data ?? response;
      const items = Array.isArray(data?.Items)
        ? data.Items
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [];
      setNotifications(items.map((item) => normalizeNotification(item, role)));
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  const signalRHandlers = useMemo(
    () =>
      REALTIME_EVENTS.reduce((handlers, eventName) => {
        handlers[eventName] = (payload) => handleRealtime(eventName, payload);
        return handlers;
      }, {}),
    [handleRealtime],
  );

  useFirebaseMessaging(Boolean(user), addNotification);
  useSignalR({
    enabled: Boolean(user),
    handlers: signalRHandlers,
  });

  useAppointmentReminders({
    enabled: Boolean(user) && (role === Roles.PATIENT || role === Roles.DOCTOR),
    role,
    onReminder: upsertNotification,
  });

  useEffect(() => {
    if (user) fetchNotifications();
    else setNotifications([]);
  }, [fetchNotifications, user]);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((item) => (item.id === String(id) ? { ...item, isRead: true } : item)));
    if (!String(id).startsWith("local-")) {
      await notificationAPI.markAsRead(id).catch((error) => console.error("Failed to mark notification as read", error));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((item) => !item.isRead);
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    await Promise.allSettled(
      unread.filter((item) => !item.id.startsWith("local-")).map((item) => notificationAPI.markAsRead(item.id)),
    );
  }, [notifications]);

  const deleteNotification = useCallback(
    async (id) => {
      const notificationId = String(id);
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
      if (!notificationId.startsWith("local-")) {
        await notificationAPI.deleteNotification(id).catch((error) => {
          console.error("Failed to delete notification", error);
          fetchNotifications();
        });
      }
    },
    [fetchNotifications],
  );

  const unreadByCategory = useMemo(
    () =>
      notifications.reduce((counts, item) => {
        if (!item.isRead) counts[item.category] = (counts[item.category] || 0) + 1;
        return counts;
      }, {}),
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter((item) => !item.isRead).length,
      unreadByCategory,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      addNotification,
    }),
    [addNotification, deleteNotification, fetchNotifications, loading, markAllAsRead, markAsRead, notifications, unreadByCategory],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
