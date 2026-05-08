"use client";

import { useState, useEffect } from "react";
import { UserPlus, MessageCircle, Search } from "lucide-react";
import { motion } from "framer-motion";

interface Member {
  id: string;
  name: string | null;
  image: string | null;
  compatibilityScore: number;
  profile: {
    city: string | null;
    bio: string | null;
    seeking: string[];
    interests: { interest: { name: string; emoji: string } }[];
  } | null;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchMembers = async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (cityFilter) params.set("city", cityFilter);
    const res = await fetch(`/api/members?${params}`);
    const data = await res.json();
    if (p === 1) setMembers(data.members || []);
    else setMembers(prev => [...prev, ...(data.members || [])]);
    setTotal(data.total || 0);
    setPage(p);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(1); }, [cityFilter]);

  const handleConnect = async (memberId: string) => {
    setConnecting(memberId);
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: memberId }),
    });
    if (res.ok) setConnected(prev => new Set([...prev, memberId]));
    setConnecting(null);
  };

  const startChat = async (memberId: string) => {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: memberId, content: "Bonjour ! 👋" }),
    });
    if (res.ok) window.location.href = "/dashboard/messages";
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-display font-light text-3xl text-[#111009] mb-1">Membres proches</h1>
        <p className="text-sm text-[rgba(17,16,9,0.45)]">
          {total > 0 ? `${total} membre${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}` : "Découvrez des catholiques compatibles"}
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(17,16,9,0.35)]" />
          <input
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            placeholder="Filtrer par ville…"
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[rgba(17,16,9,0.15)] bg-white text-sm text-[#111009] outline-none focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/10 placeholder:text-[rgba(17,16,9,0.35)]"
          />
        </div>
      </div>

      {loading && members.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-[rgba(17,16,9,0.08)]" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">👥</div>
          <p className="font-display text-xl text-[#111009] mb-2">Aucun membre trouvé</p>
          <p className="text-sm text-[rgba(17,16,9,0.5)]">Complétez votre profil pour voir des membres compatibles.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {members.map((member, i) => {
              const isConnected = connected.has(member.id);
              const interests = member.profile?.interests.slice(0, 3) || [];

              return (
                <motion.div key={member.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-[rgba(17,16,9,0.08)] p-6 hover:-translate-y-1 hover:shadow-xl transition-all">
                  {/* Avatar + compatibility */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-full bg-[#EEE8DA] flex items-center justify-center text-2xl">
                      {member.image
                        ? <img src={member.image} alt={member.name || ""} className="w-full h-full rounded-full object-cover" />
                        : member.name?.[0]?.toUpperCase() || "👤"}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-display font-light text-[#B8973A]">{member.compatibilityScore}%</div>
                      <div className="text-xs text-[rgba(17,16,9,0.4)]">compatible</div>
                    </div>
                  </div>

                  {/* Compat bar */}
                  <div className="h-1.5 bg-[#EEE8DA] rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#D4AF5A] to-[#B8973A] rounded-full transition-all"
                      style={{ width: `${member.compatibilityScore}%` }} />
                  </div>

                  <h3 className="font-display text-lg font-medium text-[#111009] mb-1">{member.name}</h3>
                  {member.profile?.city && (
                    <p className="text-xs text-[rgba(17,16,9,0.45)] mb-3">📍 {member.profile.city}</p>
                  )}

                  {member.profile?.bio && (
                    <p className="text-sm text-[rgba(17,16,9,0.65)] leading-relaxed mb-3 line-clamp-2">
                      {member.profile.bio}
                    </p>
                  )}

                  {interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {interests.map(({ interest }) => (
                        <span key={interest.name}
                          className="text-xs bg-[#F7F3EC] border border-[rgba(17,16,9,0.08)] text-[rgba(17,16,9,0.65)] px-2 py-0.5 rounded-full">
                          {interest.emoji} {interest.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-[rgba(17,16,9,0.06)]">
                    <button
                      onClick={() => !isConnected && handleConnect(member.id)}
                      disabled={isConnected || connecting === member.id}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all ${
                        isConnected
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-[#111009] text-white hover:-translate-y-0.5 disabled:opacity-50"
                      }`}>
                      <UserPlus size={14} />
                      {connecting === member.id ? "…" : isConnected ? "Envoyé ✓" : "Connecter"}
                    </button>
                    <button onClick={() => startChat(member.id)}
                      className="px-3 py-2 rounded-xl border border-[rgba(17,16,9,0.15)] text-[rgba(17,16,9,0.65)] hover:bg-[#F7F3EC] transition-colors">
                      <MessageCircle size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {members.length < total && (
            <div className="text-center mt-8">
              <button onClick={() => fetchMembers(page + 1)} disabled={loading}
                className="px-6 py-3 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[rgba(17,16,9,0.65)] hover:bg-white hover:shadow-sm transition-all disabled:opacity-50">
                {loading ? "Chargement…" : "Voir plus de membres"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
