"use client";

import { useState, useEffect } from "react";
import { Plus, Users, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Circle {
  id: string;
  name: string;
  description: string | null;
  city: string;
  isPrivate: boolean;
  owner: { name: string | null };
  _count: { members: number };
  members: { role: string }[];
}

export default function CirclesPage() {
  const [myCircles, setMyCircles] = useState<Circle[]>([]);
  const [allCircles, setAllCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [tab, setTab] = useState<"mine" | "discover">("mine");

  const fetchCircles = async () => {
    setLoading(true);
    const [mine, all] = await Promise.all([
      fetch("/api/circles?mine=true").then(r => r.json()),
      fetch("/api/circles").then(r => r.json()),
    ]);
    setMyCircles(mine.circles || []);
    setAllCircles(all.circles || []);
    setLoading(false);
  };

  useEffect(() => { fetchCircles(); }, []);

  const handleJoin = async (circleId: string) => {
    setJoining(circleId);
    await fetch(`/api/circles/${circleId}/join`, { method: "POST" });
    await fetchCircles();
    setJoining(null);
  };

  const displayed = tab === "mine" ? myCircles : allCircles.filter(c => !myCircles.find(m => m.id === c.id));

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display font-light text-3xl text-[#111009] mb-1">Cercles</h1>
          <p className="text-sm text-[rgba(17,16,9,0.45)]">Vos communautés locales</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111009] text-white text-sm font-medium hover:-translate-y-0.5 transition-all">
          <Plus size={16} /> Créer un cercle
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { key: "mine", label: `Mes cercles (${myCircles.length})` },
          { key: "discover", label: "Découvrir" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.key ? "bg-[#111009] text-white" : "bg-white border border-[rgba(17,16,9,0.12)] text-[rgba(17,16,9,0.65)] hover:bg-[#F7F3EC]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-[rgba(17,16,9,0.08)]" />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">{tab === "mine" ? "🏘️" : "🔍"}</div>
          <p className="font-display text-xl text-[#111009] mb-2">
            {tab === "mine" ? "Pas encore dans un cercle" : "Aucun cercle disponible"}
          </p>
          <p className="text-sm text-[rgba(17,16,9,0.5)] mb-6">
            {tab === "mine" ? "Rejoignez ou créez votre premier cercle local." : "Créez le premier cercle de votre ville !"}
          </p>
          <button onClick={() => tab === "mine" ? setTab("discover") : setShowCreate(true)}
            className="px-6 py-3 rounded-xl bg-[#111009] text-white text-sm font-medium hover:-translate-y-0.5 transition-all">
            {tab === "mine" ? "Découvrir des cercles" : "Créer un cercle"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayed.map((circle, i) => {
            const isMine = myCircles.find(c => c.id === circle.id);
            const myRole = circle.members[0]?.role;
            return (
              <motion.div key={circle.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-[rgba(17,16,9,0.08)] p-6 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F0E3C0] to-[#EEE8DA] flex items-center justify-center text-2xl">
                    🏘️
                  </div>
                  <div className="flex gap-2">
                    {circle.isPrivate && (
                      <span className="text-xs bg-[#F7F3EC] border border-[rgba(17,16,9,0.12)] text-[rgba(17,16,9,0.5)] px-2 py-0.5 rounded-full">
                        🔒 Privé
                      </span>
                    )}
                    {isMine && myRole && (
                      <span className="text-xs bg-[rgba(184,151,58,0.12)] text-[#B8973A] border border-[rgba(184,151,58,0.2)] px-2 py-0.5 rounded-full">
                        {myRole === "ADMIN" ? "Admin" : myRole === "MODERATOR" ? "Modo" : "Membre"}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-display text-xl font-medium text-[#111009] mb-2">{circle.name}</h3>
                {circle.description && (
                  <p className="text-sm text-[rgba(17,16,9,0.6)] leading-relaxed mb-3 line-clamp-2">{circle.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-[rgba(17,16,9,0.45)] mb-4">
                  <span className="flex items-center gap-1"><Users size={12} /> {circle._count.members} membres</span>
                  <span>📍 {circle.city}</span>
                </div>

                <div className="flex gap-2 pt-3 border-t border-[rgba(17,16,9,0.06)]">
                  {isMine ? (
                    <>
                      <button onClick={() => window.location.href = `/dashboard/circles/${circle.id}`}
                        className="flex-1 py-2 rounded-xl bg-[#111009] text-white text-sm font-medium hover:-translate-y-0.5 transition-all text-center">
                        Ouvrir le cercle →
                      </button>
                      <button className="px-3 py-2 rounded-xl border border-[rgba(17,16,9,0.12)] text-[rgba(17,16,9,0.5)] hover:bg-[#F7F3EC] transition-colors">
                        <MessageCircle size={15} />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleJoin(circle.id)} disabled={joining === circle.id}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-br from-[#D4AF5A] to-[#B8973A] text-white text-sm font-medium hover:-translate-y-0.5 transition-all disabled:opacity-50">
                      {joining === circle.id ? "…" : "Rejoindre"}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {showCreate && <CreateCircleModal onClose={() => { setShowCreate(false); fetchCircles(); }} />}
    </div>
  );
}

function CreateCircleModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", city: "", isPrivate: false, rules: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/circles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
        <div className="p-6 border-b border-[rgba(17,16,9,0.08)] flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-[#111009]">Créer un cercle</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F7F3EC] flex items-center justify-center">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

          {[
            { key: "name", label: "Nom du cercle *", placeholder: "Ex: Cercle catholique Lyon Sud" },
            { key: "city", label: "Ville *", placeholder: "Lyon" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} required placeholder={f.placeholder}
                className="w-full h-10 px-3.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/10" />
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={3} placeholder="Décrivez votre cercle…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A] resize-none" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="isPrivate" checked={form.isPrivate} onChange={e => setForm(p => ({...p, isPrivate: e.target.checked}))}
              className="w-4 h-4 rounded accent-[#B8973A]" />
            <label htmlFor="isPrivate" className="text-sm text-[rgba(17,16,9,0.7)]">Cercle privé (sur invitation uniquement)</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[rgba(17,16,9,0.65)]">Annuler</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-br from-[#D4AF5A] to-[#B8973A] text-white text-sm font-medium disabled:opacity-50">
              {loading ? "Création…" : "Créer le cercle"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
