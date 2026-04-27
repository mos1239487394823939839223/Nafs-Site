import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Stethoscope, ChevronRight, User, Headphones, Clock, Loader2, MessageSquare, RefreshCw, AlertTriangle, Receipt, Wrench, HeartPulse } from 'lucide-react';
const SupportAgent = Headphones;
import Button from "../../components/ui/Button";
import ChatWindow from "../../components/chat/ChatWindow";
import { useAuth } from "../../contexts/AuthContext";
import { chatAPI, filesAPI, MessageType } from "../../lib/api";
import { startChatConnection } from "../../lib/signalr";
import { useLanguage } from "../../contexts/LanguageContext";

const ROOM_CASE_KEY = 'nafs_room_case_types';

const SUPPORT_CASE_TYPES = [
  {
    key: 'technical',
    icon: Wrench,
    labelEn: 'Technical Issue',
    labelAr: 'مشكلة تقنية',
    descEn: 'Platform issues, login problems, bugs',
    descAr: 'مشاكل المنصة، تسجيل الدخول، الأخطاء',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    activeColor: 'bg-blue-600 text-white border-blue-600',
  },
  {
    key: 'medical',
    icon: HeartPulse,
    labelEn: 'Medical Inquiry',
    labelAr: 'استفسار طبي',
    descEn: 'Questions about your treatment plan',
    descAr: 'أسئلة حول خطة علاجك',
    color: 'bg-green-50 text-green-700 border-green-200',
    activeColor: 'bg-green-600 text-white border-green-600',
  },
  {
    key: 'billing',
    icon: Receipt,
    labelEn: 'Billing',
    labelAr: 'الفواتير والمدفوعات',
    descEn: 'Payment, refunds, billing questions',
    descAr: 'المدفوعات، المبالغ المستردة، الفواتير',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    activeColor: 'bg-yellow-600 text-white border-yellow-600',
  },
  {
    key: 'emergency',
    icon: AlertTriangle,
    labelEn: 'Emergency',
    labelAr: 'طارئ',
    descEn: 'Immediate mental health crisis',
    descAr: 'أزمة صحة نفسية فورية',
    color: 'bg-red-50 text-red-700 border-red-200',
    activeColor: 'bg-red-600 text-white border-red-600',
  },
];

export default function PatientMessages() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Restore state from URL params on mount
  const initialType = searchParams.get('type'); // 'doctors' | 'support'
  const initialRoomId = searchParams.get('room');
  const initialCaseTypeKey = searchParams.get('caseType'); // 'technical' | 'medical' | 'billing' | 'emergency'

  // contact type: defaults to 'doctors' tab
  const [contactType, setContactType] = useState(
    initialType === 'support' ? 'support' : 'doctors'
  );

  // Support case type selection
  const [supportCaseType, setSupportCaseType] = useState(
    () => SUPPORT_CASE_TYPES.find(ct => ct.key === initialCaseTypeKey) || null
  );

  // Room → case type mapping (persisted in localStorage)
  const [localRoomCaseTypes, setLocalRoomCaseTypes] = useState(
    () => {
      try { return JSON.parse(localStorage.getItem(ROOM_CASE_KEY) || '{}'); }
      catch { return {}; }
    }
  );

  const saveRoomCaseType = useCallback((roomId, caseKey) => {
    const updated = { ...localRoomCaseTypes, [String(roomId)]: caseKey };
    setLocalRoomCaseTypes(updated);
    try { localStorage.setItem(ROOM_CASE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }, [localRoomCaseTypes]);
  const [mode, setMode] = useState(initialRoomId ? "chat" : "rooms"); // rooms, chat
  const [activeRoom, setActiveRoom] = useState(null);
  const [pendingRoomId] = useState(initialRoomId || null); // room to restore after rooms load
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const connectionRef = useRef(null);
  const activeRoomRef = useRef(null);
  const hydrationTimersRef = useRef({});

  const getIncomingRoomId = (msg) =>
    String(
      msg?.RoomId ||
      msg?.roomId ||
      msg?.ActiveRoom ||
      msg?.activeRoom ||
      msg?.ChatRoomId ||
      msg?.chatRoomId ||
      ''
    );

  const getIncomingContent = (msg) =>
    msg?.Content ?? msg?.content ?? msg?.Text ?? msg?.text ?? '';

  const getIncomingAttachmentUrl = (msg) =>
    msg?.AttachmentUrl ??
    msg?.attachmentUrl ??
    msg?.FileUrl ??
    msg?.fileUrl ??
    msg?.MediaUrl ??
    msg?.mediaUrl ??
    msg?.Url ??
    msg?.url ??
    '';

  const getIncomingAttachmentName = (msg) =>
    msg?.AttachmentName ??
    msg?.attachmentName ??
    msg?.FileName ??
    msg?.fileName ??
    msg?.Name ??
    msg?.name ??
    'Attachment';

  const getIncomingMessageType = (msg) =>
    Number(msg?.MessageType ?? msg?.messageType ?? msg?.Type ?? msg?.type ?? 0);

  const buildIncomingAttachments = (msg) => {
    const attachmentUrl = getIncomingAttachmentUrl(msg);
    if (!attachmentUrl) return [];
    const attachmentName = getIncomingAttachmentName(msg);
    return [{
      name: attachmentName,
      url: attachmentUrl,
      type: (attachmentUrl || '').match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) ? 'image' : 'file',
    }];
  };

  const getMessageUniqueKey = (msg) => {
    const id = msg?.Id ?? msg?.id;
    if (id !== undefined && id !== null && String(id).trim() !== '') {
      return `id:${String(id)}`;
    }

    const sender = normalizeValue(msg?.SenderId ?? msg?.senderId ?? msg?.From ?? msg?.from ?? msg?.sender);
    const content = normalizeValue(getIncomingContent(msg));
    const createdAt = normalizeValue(msg?.CreatedAt ?? msg?.createdAt ?? msg?.timestamp);
    const attachmentUrl = normalizeValue(getIncomingAttachmentUrl(msg));

    return `fallback:${sender}|${content}|${createdAt}|${attachmentUrl}`;
  };

  const mergeMessages = (currentMessages, fetchedMessages) => {
    const fetchedKeys = new Set(fetchedMessages.map(getMessageUniqueKey));
    const onlyCurrent = currentMessages.filter((msg) => !fetchedKeys.has(getMessageUniqueKey(msg)));
    return [...fetchedMessages, ...onlyCurrent];
  };

  const sortMessagesByTime = (msgs) => {
    const withIndex = msgs.map((msg, idx) => ({ msg, idx }));
    withIndex.sort((a, b) => {
      const ta = new Date(a.msg?.CreatedAt || a.msg?.createdAt || a.msg?.timestamp || 0).getTime();
      const tb = new Date(b.msg?.CreatedAt || b.msg?.createdAt || b.msg?.timestamp || 0).getTime();
      if (ta === tb) return a.idx - b.idx;
      return ta - tb;
    });
    return withIndex.map((item) => item.msg);
  };

  const extractMessagesFromResponse = (response) => {
    if (!response) return [];
    if (Array.isArray(response?.Data)) return response.Data;
    if (Array.isArray(response?.Data?.Items)) return response.Data.Items;
    if (Array.isArray(response)) return response;
    return [];
  };

  const fetchLatestMessages = useCallback(async (roomId) => {
    const [pageZero, pageOne] = await Promise.allSettled([
      chatAPI.getRoomMessages(roomId, 0, 100),
      chatAPI.getRoomMessages(roomId, 1, 100),
    ]);

    const merged = [];
    if (pageZero.status === 'fulfilled') {
      merged.push(...extractMessagesFromResponse(pageZero.value));
    }
    if (pageOne.status === 'fulfilled') {
      merged.push(...extractMessagesFromResponse(pageOne.value));
    }

    const deduped = [];
    const seen = new Set();
    for (const msg of merged) {
      const key = getMessageUniqueKey(msg);
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(msg);
    }

    return sortMessagesByTime(deduped);
  }, []);

  const normalizeValue = (value) =>
    String(value ?? '').trim().toLowerCase();

  const isCurrentUserMessage = (msg) => {
    if (msg?.sender === 'current-user') return true;
    if (msg?.sender === 'other') return false;

    if (msg?.IsMine === true || msg?.isMine === true || msg?.IsCurrentUser === true || msg?.isCurrentUser === true) {
      return true;
    }

    const currentUserId = normalizeValue(user?.ID ?? user?.Id ?? user?.id);
    const senderId = normalizeValue(msg?.SenderId ?? msg?.senderId ?? msg?.FromUserId ?? msg?.fromUserId);
    if (currentUserId && senderId) {
      return currentUserId === senderId;
    }

    const currentUserName = normalizeValue(user?.Name ?? user?.name ?? user?.UserName ?? user?.Username);
    const senderName = normalizeValue(msg?.SenderName ?? msg?.senderName ?? msg?.From ?? msg?.from);
    if (currentUserName && senderName) {
      return currentUserName === senderName;
    }

    return false;
  };

  // Keep ref in sync with state
  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  // Sync state → URL search params
  useEffect(() => {
    const params = {};
    if (contactType) params.type = contactType;
    if (activeRoom) params.room = String(activeRoom.Id || activeRoom.id);
    if (contactType === 'support' && supportCaseType) params.caseType = supportCaseType.key;
    setSearchParams(params, { replace: true });
  }, [contactType, activeRoom, supportCaseType, setSearchParams]);

  // Restore active room from URL after rooms load
  useEffect(() => {
    if (pendingRoomId && rooms.length > 0 && !activeRoom) {
      const match = rooms.find(
        (r) => String(r.Id || r.id) === String(pendingRoomId)
      );
      if (match) {
        setActiveRoom(match);
        setMode('chat');
      }
    }
  }, [rooms, pendingRoomId, activeRoom]);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await chatAPI.getRooms();
      if (response?.Data) {
        setRooms(Array.isArray(response.Data) ? response.Data : response.Data.Items || []);
      } else if (Array.isArray(response)) {
        setRooms(response);
      }
    } catch (error) {
      console.error("Failed to fetch chat rooms:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (roomId, options = {}) => {
    const { silent = false } = options;
    if (!silent) setMessagesLoading(true);
    try {
      const msgs = await fetchLatestMessages(roomId);
      if (silent) {
        setMessages((prev) => sortMessagesByTime(mergeMessages(prev, msgs)));
      } else {
        setMessages(msgs);
      }
      await chatAPI.markAsRead(roomId).catch(() => { });
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  }, []);

  const scheduleSilentHydration = useCallback((roomId) => {
    const key = String(roomId || '');
    if (!key) return;

    const existing = hydrationTimersRef.current[key];
    if (existing) clearTimeout(existing);

    hydrationTimersRef.current[key] = setTimeout(() => {
      fetchMessages(key, { silent: true });
      delete hydrationTimersRef.current[key];
    }, 450);
  }, [fetchMessages]);

  // SignalR — register ONCE on mount
  useEffect(() => {
    let mounted = true;

    const setupSignalR = async () => {
      try {
        const conn = await startChatConnection();
        if (!mounted) return;
        connectionRef.current = conn;
        console.log('📡 [Patient] SignalR Connected');

        conn.on('ReceiveMessage', (msg) => {
          const currentRoom = activeRoomRef.current;
          const currentRoomId = String(currentRoom?.Id || currentRoom?.id || '');
          const msgRoomId = getIncomingRoomId(msg);
          const incomingContent = getIncomingContent(msg);
          const incomingType = getIncomingMessageType(msg);
          const incomingAttachments = buildIncomingAttachments(msg);
          const fromCurrentUser = isCurrentUserMessage(msg);
          const hasStableId = msg?.Id !== undefined && msg?.Id !== null
            ? true
            : msg?.id !== undefined && msg?.id !== null;

          console.log('📨 [Patient ReceiveMessage]', {
            msgRoom: msgRoomId,
            activeRoom: currentRoomId,
            match: currentRoomId === msgRoomId,
            from: msg.SenderName || msg.senderName || msg.SenderId || msg.senderId,
            text: String(incomingContent).substring(0, 50),
          });

          if (currentRoomId && currentRoomId === msgRoomId) {
            // Backend can emit an optimistic self-echo before DB persistence.
            // Render only confirmed self messages that have a stable id.
            if (fromCurrentUser && !hasStableId) {
              scheduleSilentHydration(msgRoomId);
              return;
            }

            const uiMessage = {
              id: msg.Id || msg.id || Date.now(),
              sender: fromCurrentUser ? "current-user" : "other",
              content: incomingContent,
              messageType: incomingType,
              timestamp: msg.CreatedAt || msg.createdAt || new Date().toISOString(),
              attachments: incomingAttachments,
            };
            setMessages((prev) => [...prev, uiMessage]);
            chatAPI.markAsRead(msgRoomId).catch(() => { });
            // Reconcile authoritative server state without UI spinner.
            scheduleSilentHydration(msgRoomId);
          }

          fetchRooms();
        });
      } catch (err) {
        console.error("SignalR Setup Error:", err);
      }
    };

    setupSignalR();

    return () => {
      mounted = false;
      Object.values(hydrationTimersRef.current).forEach((timerId) => clearTimeout(timerId));
      hydrationTimersRef.current = {};
      if (connectionRef.current) {
        connectionRef.current.off('ReceiveMessage');
      }
    };
  }, [user, fetchRooms, scheduleSilentHydration]); // NO activeRoom — use ref

  useEffect(() => {
    if (contactType) fetchRooms();
  }, [fetchRooms, contactType]);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.Id || activeRoom.id);
    }
  }, [activeRoom, fetchMessages]);

  const handleSendMessage = async (msgData) => {
    const roomId = activeRoom?.Id || activeRoom?.id;
    if (!roomId) return;
    try {
      const outgoingAttachments = msgData.attachments || [];

      if (outgoingAttachments.length === 0) {
        const response = await chatAPI.sendMessage(roomId, msgData.content);
        if (response?.IsSuccess === false) {
          throw new Error(response?.Message || 'Failed to send message');
        }
        return;
      }

      for (let i = 0; i < outgoingAttachments.length; i += 1) {
        const attachment = outgoingAttachments[i];
        const uploadResponse = await filesAPI.uploadFile(attachment.file);
        const url = uploadResponse?.Data?.PublicUrl;
        const name = uploadResponse?.Data?.FileName || attachment.name;

        await chatAPI.sendMessage(
          roomId,
          i === 0 ? (msgData.content || '') : '',
          MessageType.Attachment,
          url || attachment.url,
          name,
        );
      }

      await fetchMessages(roomId);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleOpenRoom = (room) => {
    setActiveRoom(room);
    setMode("chat");
  };

  const handleBackToRooms = () => {
    setMode("rooms");
    setActiveRoom(null);
    setMessages([]);
  };

  const handleBackToSelector = () => {
    setRooms([]);
    setSearchQuery('');
    setActiveRoom(null);
    setMessages([]);
    setMode('rooms');
  };

  const currentConversation = activeRoom
    ? {
      id: activeRoom.Id || activeRoom.id,
      participant: {
        name: activeRoom.OtherParticipantName || activeRoom.Name || "Chat",
        avatar: activeRoom.OtherParticipantImage || null,
        role: activeRoom.OtherParticipantRole || "doctor",
        online: true,
      },
      messages: messages.map((msg) => ({
        id: msg.Id || msg.id || Math.random(),
        sender: isCurrentUserMessage(msg) ? "current-user" : "other",
        content: getIncomingContent(msg),
        timestamp: msg.CreatedAt || msg.timestamp || new Date().toISOString(),
        attachments: buildIncomingAttachments(msg).map((item) => ({ ...item, size: '' })),
      })),
    }
    : null;

  // Filter rooms by contact type (doctor vs support)
  const filteredByType = rooms.filter(r => {
    if (!contactType) return true;
    const role = (r.OtherParticipantRole || '').toLowerCase();
    if (contactType === 'doctors') return role === 'doctor' || role === '1' || !role;
    if (contactType === 'support') return role === 'staff' || role === 'admin' || role === 'support' || role === '2' || role === '3';
    return true;
  });

  const filteredRooms = filteredByType.filter((r) => {
    const name = (r.OtherParticipantName || r.Name || "").toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  // ─── Rooms List + Chat ────────────────────────────────────────────────────
  const TypeIcon = contactType === 'support' ? SupportAgent : Stethoscope;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <AnimatePresence mode="wait">
        {mode === "rooms" && (
          <motion.div
            key="rooms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <h1 className="text-2xl font-bold text-text-heading">{t('chat.messages', 'Messages')}</h1>
              </div>
              <Button variant="outline" size="sm" onClick={fetchRooms} disabled={loading} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {t('common.refresh')}
              </Button>
            </div>

            {/* Tab bar – Talk to Doctors / Talk to Support */}
            <div className="inline-flex p-1 rounded-2xl border border-border bg-background-subtle mb-4 gap-1 self-start">
              <button
                onClick={() => { setContactType('doctors'); setMode('rooms'); setActiveRoom(null); }}
                className={`px-5 py-2.5 font-semibold transition-all whitespace-nowrap rounded-xl text-sm flex items-center gap-2 ${
                  contactType === 'doctors'
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-text-muted hover:text-text-heading hover:bg-background-paper'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                {t('chat.talkToDoctors', 'Talk to Doctors')}
              </button>
              <button
                onClick={() => { setContactType('support'); setMode('rooms'); setActiveRoom(null); }}
                className={`px-5 py-2.5 font-semibold transition-all whitespace-nowrap rounded-xl text-sm flex items-center gap-2 ${
                  contactType === 'support'
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-text-muted hover:text-text-heading hover:bg-background-paper'
                }`}
              >
                <SupportAgent className="w-4 h-4" />
                {t('chat.talkToSupport', 'Talk to Support')}
              </button>
            </div>

            {/* Case type selector (support tab only) */}
            {contactType === 'support' && (
              <div className="mb-4">
                <p className="text-xs text-text-muted mb-2 font-medium">
                  {t('chat.selectCaseType', 'Select case type:')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUPPORT_CASE_TYPES.map((ct) => {
                    const Icon = ct.icon;
                    const isActive = supportCaseType?.key === ct.key;
                    return (
                      <button
                        key={ct.key}
                        onClick={() => setSupportCaseType(isActive ? null : ct)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                          isActive ? ct.activeColor : ct.color
                        } ${ct.key === 'emergency' && !isActive ? 'animate-pulse' : ''}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {isRTL ? ct.labelAr : ct.labelEn}
                      </button>
                    );
                  })}
                </div>
                {supportCaseType?.key === 'emergency' && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {t('chat.emergencyWarning', 'This will flag your request as urgent. Emergency support will be alerted.')}
                  </p>
                )}
              </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-text-light`} />
              <input
                type="text"
                placeholder={t('chat.searchConversations')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-text`}
              />
            </div>

            {/* Rooms List */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-heading mb-2">{t('chat.noConversations')}</h3>
                <p className="text-text-muted">{t('chat.noConversationsDesc')}</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredRooms.map((room) => (
                  <button
                    key={room.Id || room.id}
                    onClick={() => handleOpenRoom(room)}
                    className="w-full p-4 bg-background-paper border border-border rounded-xl text-left transition-all hover:border-primary/50 hover:bg-primary/5"
                  >
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {room.OtherParticipantImage ? (
                          <img src={room.OtherParticipantImage} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          contactType === 'support'
                            ? <SupportAgent className="w-6 h-6 text-secondary" />
                            : <Stethoscope className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className={`flex justify-between items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <h4 className="font-bold text-text-heading truncate">
                            {room.OtherParticipantName || room.Name || "Chat"}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {contactType === 'support' && localRoomCaseTypes[String(room.Id || room.id)] && (() => {
                              const cType = SUPPORT_CASE_TYPES.find(ct => ct.key === localRoomCaseTypes[String(room.Id || room.id)]);
                              return cType ? (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${cType.color}`}>
                                  {isRTL ? cType.labelAr : cType.labelEn}
                                </span>
                              ) : null;
                            })()}
                            {room.UnreadCount > 0 && (
                              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                {room.UnreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-text-muted truncate">
                          {room.LastMessage || t('chat.noMessagesYet')}
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-text-muted flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {mode === "chat" && currentConversation && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-background-paper rounded-2xl shadow-sm overflow-hidden flex flex-col border border-border"
          >
            {messagesLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <ChatWindow
                conversation={currentConversation}
                onBack={handleBackToRooms}
                onSendMessage={handleSendMessage}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
