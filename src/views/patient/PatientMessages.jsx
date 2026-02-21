import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Stethoscope,
  ChevronRight,
  ArrowLeft,
  User,
  Headphones,
  Clock,
  Loader2,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ChatWindow from "../../components/chat/ChatWindow";
import { useAuth } from "../../contexts/AuthContext";
import { chatAPI } from "../../lib/api";

export default function PatientMessages() {
  const { user } = useAuth();

  const [mode, setMode] = useState("rooms"); // rooms, chat
  const [activeRoom, setActiveRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      // Mark as read
      await chatAPI.markAsRead(roomId).catch(() => {});
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.Id || activeRoom.id);
    }
  }, [activeRoom, fetchMessages]);

  const handleSendMessage = async (msgData) => {
    const roomId = activeRoom?.Id || activeRoom?.id;
    if (!roomId) return;

    try {
      const response = await chatAPI.sendMessage(roomId, msgData.content);
      if (response?.IsSuccess !== false) {
        // Add message to local state immediately
        const newMessage = {
          id: Date.now(),
          sender: "current-user",
          content: msgData.content,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleOpenRoom = (room) => {
    setActiveRoom(room);
    setMode("chat");
  };

  // Build conversation object for ChatWindow
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
        })),
      }
    : null;

  const filteredRooms = rooms.filter((r) => {
    const name = (r.OtherParticipantName || r.Name || "").toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-text-heading">Messages</h1>
                <p className="text-text-muted text-sm mt-1">Your conversations</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchRooms} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background-paper border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-text"
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
                <h3 className="text-xl font-bold text-text-heading mb-2">No Conversations</h3>
                <p className="text-text-muted">You don't have any chat conversations yet.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredRooms.map((room) => (
                  <button
                    key={room.Id || room.id}
                    onClick={() => handleOpenRoom(room)}
                    className="w-full p-4 bg-background-paper border border-border rounded-xl text-left transition-all hover:border-primary/50 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {room.OtherParticipantImage ? (
                          <img
                            src={room.OtherParticipantImage}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <Stethoscope className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
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
                          {room.LastMessage || "No messages yet"}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0" />
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
                onBack={() => {
                  setMode("rooms");
                  setActiveRoom(null);
                  setMessages([]);
                }}
                onSendMessage={handleSendMessage}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
