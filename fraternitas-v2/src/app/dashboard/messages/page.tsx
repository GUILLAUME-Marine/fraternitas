"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Search } from "lucide-react";
import { formatRelative } from "@/lib/utils";
import { motion } from "framer-motion";

interface ConversationMember {
  user: { id: string; name: string | null; image: string | null };
}

interface Conversation {
  id: string;
  updatedAt: string;
  members: ConversationMember[];
  messages: { content: string; senderId: string }[];
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string | null; image: string | null };
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    // Get current user ID from session
    fetch("/api/profile").then(r => r.json()).then(d => setCurrentUserId(d.user?.id || ""));
  }, []);

  useEffect(() => {
    if (selectedId) fetchMessages(selectedId);
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    const res = await fetch("/api/messages");
    const data = await res.json();
    setConversations(data.conversations || []);
    setLoading(false);
  };

  const fetchMessages = async (convId: string) => {
    const res = await fetch(`/api/messages/${convId}`);
    const data = await res.json();
    setMessages(data.messages || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedId || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedId, content }),
    });

    const data = await res.json();
    if (res.ok && data.message) {
      setMessages(prev => [...prev, data.message]);
      fetchConversations();
    }
    setSending(false);
  };

  const selectedConv = conversations.find(c => c.id === selectedId);
  const otherMember = selectedConv?.members.find(m => m.user.id !== currentUserId);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations list */}
      <div className={`w-full md:w-72 border-r border-[rgba(17,16,9,0.08)] bg-white flex flex-col ${selectedId ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-[rgba(17,16,9,0.08)]">
          <h1 className="font-display text-xl font-medium text-[#111009] mb-3">Messages</h1>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(17,16,9,0.35)]" />
            <input placeholder="Rechercher…"
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-[rgba(17,16,9,0.12)] bg-[#F7F3EC] text-sm text-[#111009] outline-none focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/10 placeholder:text-[rgba(17,16,9,0.35)]" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-[#F7F3EC] rounded-xl animate-pulse" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-3xl mb-3">💬</div>
              <p className="text-sm text-[rgba(17,16,9,0.5)]">Aucune conversation.<br />Connectez-vous à des membres pour leur envoyer un message.</p>
            </div>
          ) : (
            conversations.map(conv => {
              const other = conv.members.find(m => m.user.id !== currentUserId);
              const lastMsg = conv.messages[0];
              return (
                <button key={conv.id} onClick={() => setSelectedId(conv.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors border-b border-[rgba(17,16,9,0.05)] ${
                    selectedId === conv.id ? "bg-[#F7F3EC]" : "hover:bg-[#F7F3EC]"
                  }`}>
                  <div className="w-11 h-11 rounded-full bg-[#EEE8DA] flex items-center justify-center text-lg flex-shrink-0">
                    {other?.user.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111009] truncate">{other?.user.name || "Membre"}</p>
                    {lastMsg && <p className="text-xs text-[rgba(17,16,9,0.45)] truncate">{lastMsg.content}</p>}
                  </div>
                  <span className="text-xs text-[rgba(17,16,9,0.35)] flex-shrink-0">{formatRelative(conv.updatedAt)}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      {selectedId ? (
        <div className={`flex-1 flex flex-col ${selectedId ? "flex" : "hidden md:flex"}`}>
          {/* Chat header */}
          <div className="h-16 border-b border-[rgba(17,16,9,0.08)] bg-white flex items-center gap-3 px-6">
            <button onClick={() => setSelectedId(null)} className="md:hidden p-2 -ml-2 text-[rgba(17,16,9,0.5)]">←</button>
            <div className="w-9 h-9 rounded-full bg-[#EEE8DA] flex items-center justify-center text-base">
              {otherMember?.user.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111009]">{otherMember?.user.name || "Membre"}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F7F3EC]">
            {messages.map((msg, i) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i < 5 ? 0 : 0 }}
                  className={`flex gap-2.5 max-w-[75%] ${isMe ? "ml-auto flex-row-reverse" : ""}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-[#EEE8DA] flex items-center justify-center text-sm flex-shrink-0 self-end">
                      {msg.sender.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-[#111009] text-[#F7F3EC] rounded-br-sm"
                        : "bg-white border border-[rgba(17,16,9,0.08)] text-[#111009] rounded-bl-sm"
                    }`}>
                      {msg.content}
                    </div>
                    <p className={`text-xs text-[rgba(17,16,9,0.35)] mt-1 ${isMe ? "text-right" : ""}`}>
                      {formatRelative(msg.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-[rgba(17,16,9,0.08)] flex gap-3 items-end">
            <div className="flex-1 border border-[rgba(17,16,9,0.12)] rounded-2xl px-4 py-2.5 focus-within:border-[#B8973A] focus-within:ring-2 focus-within:ring-[#B8973A]/10 transition-all bg-[#F7F3EC]">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Écrire un message…"
                rows={1}
                className="w-full bg-transparent text-sm text-[#111009] outline-none resize-none placeholder:text-[rgba(17,16,9,0.35)] max-h-28"
                style={{ minHeight: "20px" }}
              />
            </div>
            <button onClick={sendMessage} disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-full bg-[#111009] text-white flex items-center justify-center hover:bg-[#B8973A] transition-colors disabled:opacity-40 flex-shrink-0">
              <Send size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center bg-[#F7F3EC]">
          <div className="text-center">
            <div className="text-5xl mb-4">💬</div>
            <p className="font-display text-xl text-[#111009] mb-2">Vos messages</p>
            <p className="text-sm text-[rgba(17,16,9,0.5)]">Sélectionnez une conversation pour commencer</p>
          </div>
        </div>
      )}
    </div>
  );
}
