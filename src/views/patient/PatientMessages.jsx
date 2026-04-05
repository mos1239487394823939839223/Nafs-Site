import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MedicalServices as Stethoscope,
  ChevronRight,
  Person as User,
  Headphones,
  AccessTime as Clock,
  Sync as Loader2,
  ChatBubbleOutline as MessageSquare,
  Refresh as RefreshCw,
  Support as SupportAgent,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import Button from "../../components/ui/Button";
import ChatWindow from "../../components/chat/ChatWindow";
import { useAuth } from "../../contexts/AuthContext";
import { chatAPI, filesAPI, MessageType } from "../../lib/api";
import { startChatConnection } from "../../lib/signalr";
import { useLanguage } from "../../contexts/LanguageContext";

// Contact type selector
const CONTACT_TYPES = [
  {
    key: 'doctors',
    icon: Stethoscope,
    labelEn: 'Doctors',
    labelAr: 'الأطباء',
    descEn: 'Chat with your treating physicians',
    descAr: 'تحدث مع الأطباء المعالجين',
    color: 'from-primary/20 to-primary/5',
    iconColor: 'text-primary',
    borderColor: 'border-primary/40',
  },
  {
    key: 'support',
    icon: SupportAgent,
    labelEn: 'Technical Team',
    labelAr: 'الفريق التقني',
    descEn: 'Get help with platform issues',
    descAr: 'احصل على مساعدة بمشاكل المنصة',
    color: 'from-secondary/20 to-secondary/5',
    iconColor: 'text-secondary',
    borderColor: 'border-secondary/40',
  },
];

export default function PatientMessages() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Restore state from URL params on mount
  const initialType = searchParams.get('type'); // 'doctors' | 'support'
  const initialRoomId = searchParams.get('room');

  // contact type: null (selector), 'doctors', 'support'
  const [contactType, setContactType] = useState(
    CONTACT_TYPES.some(ct => ct.key === initialType) ? initialType : null
  );
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

  // Keep ref in sync with state
  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  // Sync state → URL search params
  useEffect(() => {
    const params = {};
    if (contactType) params.type = contactType;
    if (activeRoom) params.room = String(activeRoom.Id || activeRoom.id);
    setSearchParams(params, { replace: true });
  }, [contactType, activeRoom, setSearchParams]);

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

  const fetchMessages = useCallback(async (roomId) => {
    setMessagesLoading(true);
    try {
      const response = await chatAPI.getRoomMessages(roomId);
      if (response?.Data) {
        const msgs = Array.isArray(response.Data) ? response.Data : response.Data.Items || [];
        setMessages(msgs);
      } else if (Array.isArray(response)) {
        setMessages(response);
      }
      await chatAPI.markAsRead(roomId).catch(() => { });
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

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
          const msgRoomId = String(msg.RoomId || msg.roomId || '');

          console.log('📨 [Patient ReceiveMessage]', {
            msgRoom: msgRoomId,
            activeRoom: currentRoomId,
            match: currentRoomId === msgRoomId,
            from: msg.SenderName || msg.senderName || msg.SenderId || msg.senderId,
            text: (msg.Content || msg.content || '').substring(0, 50),
          });

          if (currentRoomId && currentRoomId === msgRoomId) {
            const attachmentUrl = msg.AttachmentUrl || msg.attachmentUrl;
            const attachmentName = msg.AttachmentName || msg.attachmentName;
            const uiMessage = {
              id: msg.Id || msg.id || Date.now(),
              sender: (msg.SenderId || msg.senderId) === (user?.ID || user?.id) ? "current-user" : "other",
              content: msg.Content || msg.content || "",
              messageType: msg.MessageType || msg.messageType,
              timestamp: msg.CreatedAt || msg.createdAt || new Date().toISOString(),
              attachments: attachmentUrl ? [{
                name: attachmentName || 'Attachment',
                url: attachmentUrl,
                type: (attachmentUrl || '').match(/\.(png|jpg|jpeg|gif|webp)$/i) ? 'image' : 'file'
              }] : []
            };
            setMessages((prev) => [...prev, uiMessage]);
            chatAPI.markAsRead(msgRoomId).catch(() => { });
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
      if (connectionRef.current) {
        connectionRef.current.off('ReceiveMessage');
      }
    };
  }, [user, fetchRooms]); // NO activeRoom — use ref

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
        if (response?.IsSuccess !== false) {
          const newMessage = {
            id: Date.now(),
            sender: "current-user",
            content: msgData.content,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, newMessage]);
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
    setContactType(null);
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
        sender: msg.SenderId === (user?.ID || user?.id) ? "current-user" : "other",
        content: msg.Content || msg.content || "",
        timestamp: msg.CreatedAt || msg.timestamp || new Date().toISOString(),
        attachments: msg.AttachmentUrl
          ? [{
              name: msg.AttachmentName || 'Attachment',
              url: msg.AttachmentUrl,
              type: (msg.AttachmentUrl || '').match(/\.(png|jpg|jpeg|gif|webp)$/i) ? 'image' : 'file',
              size: '',
            }]
          : [],
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

  // ─── Contact Type Selector ────────────────────────────────────────────────
  if (!contactType) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-heading">{t('chat.messages')}</h1>
          <p className="text-text-muted text-sm mt-1">
            {isRTL ? 'كيف تريد التواصل؟' : 'Who would you like to contact?'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto w-full">
          {CONTACT_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.key}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setContactType(type.key)}
                className={`relative overflow-hidden group p-8 rounded-2xl border-2 bg-gradient-to-br text-left transition-all shadow-sm hover:shadow-lg ${type.color} ${type.borderColor}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {/* Decorative circle */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/20 -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500" />

                <div className={`relative z-10 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className={`w-16 h-16 rounded-2xl bg-white/60 flex items-center justify-center mb-5 shadow-sm ${isRTL ? 'mr-auto' : ''}`}>
                    <Icon className={`w-8 h-8 ${type.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-text-heading mb-2">
                    {isRTL ? type.labelAr : type.labelEn}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {isRTL ? type.descAr : type.descEn}
                  </p>
                  <div className={`flex items-center gap-2 mt-5 text-sm font-semibold ${type.iconColor} ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                    <span>{isRTL ? 'فتح المحادثات' : 'Open Conversations'}</span>
                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Recent conversations quick access */}
        <div className="mt-8 p-4 bg-background-subtle/50 rounded-xl border border-border text-center">
          <p className="text-sm text-text-muted">
            {isRTL
              ? 'يمكنك التبديل بين الأطباء والفريق التقني في أي وقت'
              : 'You can switch between Doctors and Technical Team at any time'}
          </p>
        </div>
      </div>
    );
  }

  // ─── Rooms List + Chat ────────────────────────────────────────────────────
  const activeType = CONTACT_TYPES.find(t => t.key === contactType);
  const TypeIcon = activeType?.icon || MessageSquare;

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
            <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* Back to type selector */}
                <button
                  onClick={handleBackToSelector}
                  className="p-2 rounded-xl hover:bg-background-subtle transition-colors text-text-muted hover:text-text"
                >
                  <ChevronRight className={`w-5 h-5 ${isRTL ? '' : 'rotate-180'}`} />
                </button>
                <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center`}>
                  <TypeIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-heading">
                    {isRTL ? activeType?.labelAr : activeType?.labelEn}
                  </h1>
                  <p className="text-text-muted text-xs mt-0.5">
                    {isRTL ? activeType?.descAr : activeType?.descEn}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={fetchRooms} disabled={loading} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                {t('common.refresh')}
              </Button>
            </div>

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
                        <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <h4 className="font-bold text-text-heading truncate">
                            {room.OtherParticipantName || room.Name || "Chat"}
                          </h4>
                          {room.UnreadCount > 0 && (
                            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                              {room.UnreadCount}
                            </span>
                          )}
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
