"use client";

import { useState, useEffect } from "react";
import { formatRelative } from "@/lib/utils";
import { motion } from "framer-motion";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  CONNECTION_REQUEST: "👥",
  CONNECTION_ACCEPTED: "✅",
  NEW_MESSAGE: "💬",
  EVENT_REMINDER: "🗓️",
  EVENT_CANCELLED: "❌",
  CIRCLE_INVITE: "🏘️",
  CIRCLE_MESSAGE: "💬",
  NEW_MEMBER_COMPATIBLE: "✨",
  SYSTEM: "ℹ️",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setLoading(false);
      });
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClick = (notif: Notification) => {
    if (!notif.read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (notif.link) window.location.href = notif.link;
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-light text-3xl text-[#111009] mb-1">Notifications</h1>
          <p className="text-sm text-[rgba(17,16,9,0.45)]">
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout est lu ✓"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="text-sm text-[rgba(17,16,9,0.5)] hover:text-[#111009] transition-colors">
            Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-[rgba(17,16,9,0.08)]" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔔</div>
          <p className="font-display text-xl text-[#111009] mb-2">Aucune notification</p>
          <p className="text-sm text-[rgba(17,16,9,0.5)]">Vous êtes à jour !</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => (
            <motion.div key={notif.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => handleClick(notif)}
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${
                notif.read
                  ? "bg-white border-[rgba(17,16,9,0.08)]"
                  : "bg-white border-l-4 border-[#B8973A] border-t-[rgba(17,16,9,0.08)] border-r-[rgba(17,16,9,0.08)] border-b-[rgba(17,16,9,0.08)]"
              }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                notif.read ? "bg-[#F7F3EC]" : "bg-[rgba(184,151,58,0.12)]"
              }`}>
                {TYPE_ICONS[notif.type] || "ℹ️"}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm mb-0.5 ${notif.read ? "font-normal text-[rgba(17,16,9,0.7)]" : "font-semibold text-[#111009]"}`}>
                  {notif.title}
                </p>
                <p className="text-xs text-[rgba(17,16,9,0.5)] leading-relaxed">{notif.body}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-xs text-[rgba(17,16,9,0.35)]">{formatRelative(notif.createdAt)}</span>
                {!notif.read && <span className="w-2 h-2 rounded-full bg-[#B8973A]" />}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
