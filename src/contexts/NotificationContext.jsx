import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { notificationAPI } from "../lib/api";
import { useAuth } from "./AuthContext";
import { useFirebaseMessaging } from "../hooks/useFirebaseMessaging";
import { useSignalR } from "../hooks/useSignalR";
import { normalizeNotification } from "../lib/notificationUtils";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const addNotification = useCallback((payload) => {
    const source = payload?.notification
      ? { ...payload.notification, ...(payload.data || {}) }
      : payload;
    const normalized = normalizeNotification(source, role);
    setNotifications((prev) => {
      const withoutDuplicate = prev.filter((item) => item.id !== normalized.id);
      return [normalized, ...withoutDuplicate];
    });
  }, [role]);

  const fetchNotifications = useCallback(async (pageIndex = 1, pageSize = 100) => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await notificationAPI.getNotifications(pageIndex, pageSize);
      const data = response?.Data ?? response?.data ?? response;
      const items = Array.isArray(data?.Items) ? data.Items : Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setNotifications(items.map((item) => normalizeNotification(item, role)));
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  useFirebaseMessaging(Boolean(user), addNotification, fetchNotifications);
  useSignalR({
    enabled: Boolean(user),
    handlers: {
      ReceiveNotification: addNotification,
      NewNotification: addNotification,
      NotificationCreated: addNotification,
      ReceiveMessage: (payload) => addNotification({ ...payload, Type: "messages", Title: "New message" }),
      BookingStatusUpdated: (payload) => addNotification({ ...payload, Type: "appointments", Title: "Booking status updated" }),
      BookingConfirmed: (payload) => addNotification({ ...payload, Type: "appointments", Title: "Booking confirmed" }),
      AppointmentReminder: (payload) => addNotification({ ...payload, Type: "appointments", Title: "Session reminder" }),
      SupportStatusUpdated: (payload) => addNotification({ ...payload, Type: "support", Title: "Support request updated" }),
      EmergencyAlert: (payload) => addNotification({ ...payload, Type: "emergency", Title: "Emergency alert" }),
    },
  });

  useEffect(() => {
    if (user) fetchNotifications();
    else setNotifications([]);
  }, [fetchNotifications, user]);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((item) => item.id === String(id) ? { ...item, isRead: true } : item));
    if (!String(id).startsWith("local-")) {
      await notificationAPI.markAsRead(id).catch((error) => console.error("Failed to mark notification as read", error));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((item) => !item.isRead);
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    await Promise.allSettled(unread.filter((item) => !item.id.startsWith("local-")).map((item) => notificationAPI.markAsRead(item.id)));
  }, [notifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount: notifications.filter((item) => !item.isRead).length,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }), [fetchNotifications, loading, markAllAsRead, markAsRead, notifications]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
