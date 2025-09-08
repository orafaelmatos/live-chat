import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { messagesAPI, getWebSocketURL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Users } from "lucide-react";
import { AddMember } from "@/components/AddMember";

interface Message {
  id: string;
  user_id: number;
  content: string;
  timestamp: string;
  room_id: string;
}

const Chat = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomName = location.state?.roomName || `Room ${roomId}`;

  useEffect(() => {
    if (!roomId) return;

    loadMessages();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const messagesData = await messagesAPI.getMessages(roomId!);

      const formatted = messagesData.map((m: any) => {
        let messageContent = m.content;
        try {
          // Parse only if it's JSON
          const parsed = JSON.parse(m.content);
          if (parsed && parsed.content) {
            messageContent = parsed.content;
          }
        } catch (err) {
          // leave messageContent as-is if parsing fails
        }

        return {
          id: m.id.toString(),
          room_id: m.room_id,
          user_id: m.user_id,
          content: messageContent,
          timestamp: m.created_at,
        };
      });

      setMessages(formatted);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const wsUrl = getWebSocketURL(roomId!);
    const token = localStorage.getItem("token");

    const ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onopen = () => {
      setConnected(true);
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const rawMessage = JSON.parse(event.data);

        // Parse content if JSON string
        let content = rawMessage.content;
        try {
          const parsed = JSON.parse(rawMessage.content);
          if (parsed && parsed.content) content = parsed.content;
        } catch {}

        const formattedMessage: Message = {
          id: rawMessage.id?.toString() || Date.now().toString(),
          room_id: rawMessage.room_id,
          user_id: rawMessage.user_id,
          content,
          timestamp: rawMessage.created_at || new Date().toISOString(),
        };

        setMessages((prev) => [...prev, formattedMessage]);
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("WebSocket disconnected");
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (roomId) connectWebSocket();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat",
        variant: "destructive",
      });
    };

    wsRef.current = ws;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !connected) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      // Send via WebSocket for real-time delivery
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            content: messageContent,
            room_id: roomId,
          })
        );
      } else {
        // Fallback to HTTP API
        await messagesAPI.sendMessage(roomId!, messageContent);
        await loadMessages();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      // Restore message on error
      setNewMessage(messageContent);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/rooms")} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div>
            <h1 className="text-xl font-semibold">{roomName}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${connected ? "bg-online" : "bg-destructive"}`} />
              {connected ? "Connected" : "Disconnected"}
            </div>
          </div>
          <div className="p-4 bg-card">
            <AddMember roomId={roomId!} />
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message, index) => {
            const isOwn = message.user_id === user?.id;

            return (
              <div key={message.id} className={`animate-message-in flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md ${isOwn ? "text-right" : "text-left"}`}>
                  { !isOwn && (
                    <p className="text-sm text-primary font-medium mb-1 px-1">{user?.email}</p>
                  )}

                  <Card
                    className={`p-3 ${
                      isOwn
                        ? "bg-green-500 text-white rounded-2xl rounded-br-sm"
                        : "bg-gray-700 text-white rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-timestamp"}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </Card>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-card border-t border-border p-4">
        <form onSubmit={sendMessage} className="flex gap-3">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-chat-input border-border focus:ring-primary"
            disabled={!connected}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || !connected}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {!connected && <p className="text-sm text-destructive mt-2 text-center">Reconnecting to chat...</p>}
      </div>
    </div>
  );
};

export default Chat;
