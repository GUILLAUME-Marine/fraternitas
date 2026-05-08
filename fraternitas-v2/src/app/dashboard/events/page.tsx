"use client";

import { useState, useEffect } from "react";
import { Plus, MapPin, Calendar, Users, Filter } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { motion } from "framer-motion";

const EVENT_TYPES = [
  { value: "", label: "Tous" },
  { value: "REPAS", label: "🍽️ Repas" },
  { value: "RETRAITE", label: "🏔️ Retraite" },
  { value: "PRIERE", label: "🙏 Prière" },
  { value: "RANDONNEE", label: "🥾 Randonnée" },
  { value: "LECTURE", label: "📚 Lecture" },
  { value: "BENEVOLAT", label: "🤲 Bénévolat" },
  { value: "SPORT", label: "⚽ Sport" },
  { value: "CULTURE", label: "🎨 Culture" },
  { value: "PRO", label: "💼 Pro" },
  { value: "AUTRE", label: "✨ Autre" },
];

const TYPE_EMOJIS: Record<string, string> = {
  REPAS: "🍽️", RETRAITE: "🏔️", PRIERE: "🙏", RANDONNEE: "🥾",
  LECTURE: "📚", BENEVOLAT: "🤲", SPORT: "⚽", CULTURE: "🎨", PRO: "💼", AUTRE: "✨",
};

interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  city: string;
  startDate: string;
  maxAttendees: number | null;
  price: number;
  host: { name: string | null; image: string | null };
  _count: { registrations: number };
  myRegistration?: { status: string } | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [registering, setRegistering] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (cityFilter) params.set("city", cityFilter);
    const res = await fetch(`/api/events?${params}`);
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, [typeFilter, cityFilter]);

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId);
    const res = await fetch(`/api/events/${eventId}/register`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setEvents(prev => prev.map(e => e.id === eventId
        ? { ...e, _count: { registrations: e._count.registrations + 1 }, myRegistration: { status: data.registration.status } }
        : e
      ));
    }
    setRegistering(null);
  };

  const handleUnregister = async (eventId: string) => {
    setRegistering(eventId);
    await fetch(`/api/events/${eventId}/register`, { method: "DELETE" });
    setEvents(prev => prev.map(e => e.id === eventId
      ? { ...e, _count: { registrations: Math.max(0, e._count.registrations - 1) }, myRegistration: null }
      : e
    ));
    setRegistering(null);
  };

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display font-light text-3xl text-[#111009] mb-1">Événements</h1>
          <p className="text-sm text-[rgba(17,16,9,0.45)]">Trouvez des événements près de chez vous</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111009] text-white text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <Plus size={16} /> Créer un événement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          placeholder="🔍 Filtrer par ville…"
          className="px-4 py-2 rounded-xl border border-[rgba(17,16,9,0.15)] bg-white text-sm text-[#111009] outline-none focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/10 w-48"
        />
        <div className="flex gap-2 flex-wrap">
          {EVENT_TYPES.map((t) => (
            <button key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                typeFilter === t.value
                  ? "bg-[#111009] text-white border-[#111009]"
                  : "bg-white text-[rgba(17,16,9,0.65)] border-[rgba(17,16,9,0.15)] hover:border-[#B8973A]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-[rgba(17,16,9,0.08)]" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🗓️</div>
          <p className="font-display text-xl text-[#111009] mb-2">Aucun événement trouvé</p>
          <p className="text-sm text-[rgba(17,16,9,0.5)] mb-6">Soyez le premier à créer un événement dans votre ville !</p>
          <button onClick={() => setShowCreate(true)}
            className="px-6 py-3 rounded-xl bg-[#111009] text-white text-sm font-medium hover:-translate-y-0.5 transition-all">
            Créer un événement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event, i) => {
            const isFull = event.maxAttendees ? event._count.registrations >= event.maxAttendees : false;
            const isRegistered = !!event.myRegistration;
            const spotsLeft = event.maxAttendees ? event.maxAttendees - event._count.registrations : null;

            return (
              <motion.div key={event.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-[rgba(17,16,9,0.08)] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all">
                {/* Card top colored bar */}
                <div className="h-2 bg-gradient-to-r from-[#D4AF5A] to-[#B8973A]" />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{TYPE_EMOJIS[event.type] || "✨"}</span>
                    <span className="text-xs font-semibold text-[#B8973A] uppercase tracking-wider">
                      {EVENT_TYPES.find(t => t.value === event.type)?.label.split(" ").slice(1).join(" ") || event.type}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-medium text-[#111009] mb-2 leading-tight">{event.title}</h3>
                  <p className="text-sm text-[rgba(17,16,9,0.6)] leading-relaxed mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[rgba(17,16,9,0.5)]">
                      <Calendar size={12} />
                      {formatDateTime(event.startDate)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[rgba(17,16,9,0.5)]">
                      <MapPin size={12} />
                      {event.city}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[rgba(17,16,9,0.5)]">
                      <Users size={12} />
                      {event._count.registrations} participant{event._count.registrations !== 1 ? "s" : ""}
                      {spotsLeft !== null && <span className={spotsLeft <= 3 ? "text-orange-500 font-medium" : ""}>
                        · {spotsLeft > 0 ? `${spotsLeft} place${spotsLeft > 1 ? "s" : ""} restante${spotsLeft > 1 ? "s" : ""}` : "Complet"}
                      </span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[rgba(17,16,9,0.06)]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#EEE8DA] flex items-center justify-center text-xs">
                        {event.host.name?.[0] || "?"}
                      </div>
                      <span className="text-xs text-[rgba(17,16,9,0.5)]">{event.host.name}</span>
                    </div>

                    {isRegistered ? (
                      <button onClick={() => handleUnregister(event.id)}
                        disabled={registering === event.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all disabled:opacity-50">
                        {registering === event.id ? "…" : "✓ Inscrit(e)"}
                      </button>
                    ) : (
                      <button onClick={() => handleRegister(event.id)}
                        disabled={isFull || registering === event.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#111009] text-white hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:transform-none">
                        {registering === event.id ? "…" : isFull ? "Complet" : "Rejoindre →"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreate && <CreateEventModal onClose={() => { setShowCreate(false); fetchEvents(); }} />}
    </div>
  );
}

function CreateEventModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", type: "REPAS", city: "",
    address: "", startDate: "", maxAttendees: "", price: "0", isPublic: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : undefined,
        price: parseFloat(form.price),
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[rgba(17,16,9,0.08)] flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-[#111009]">Créer un événement</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F7F3EC] flex items-center justify-center hover:bg-[#EEE8DA] transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Titre *</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required
              placeholder="Ex: Soirée jeux de société"
              className="w-full h-10 px-3.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/10" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} required rows={3}
              placeholder="Décrivez votre événement…"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/10 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Type *</label>
              <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}
                className="w-full h-10 px-3.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A] bg-white">
                {EVENT_TYPES.filter(t => t.value).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Ville *</label>
              <input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} required placeholder="Lyon"
                className="w-full h-10 px-3.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/10" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Adresse</label>
            <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="Ex: 12 rue de la Paix"
              className="w-full h-10 px-3.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/10" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Date et heure *</label>
            <input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} required
              className="w-full h-10 px-3.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Places max</label>
              <input type="number" value={form.maxAttendees} onChange={e => setForm(f => ({...f, maxAttendees: e.target.value}))} min={2} placeholder="Illimité"
                className="w-full h-10 px-3.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A]" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Prix (€)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} min={0} step={0.5}
                className="w-full h-10 px-3.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A]" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="isPublic" checked={form.isPublic} onChange={e => setForm(f => ({...f, isPublic: e.target.checked}))}
              className="w-4 h-4 rounded accent-[#B8973A]" />
            <label htmlFor="isPublic" className="text-sm text-[rgba(17,16,9,0.7)]">Événement public (visible par tous les membres)</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[rgba(17,16,9,0.65)] hover:bg-[#F7F3EC] transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-br from-[#D4AF5A] to-[#B8973A] text-white text-sm font-medium hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {loading ? "Création…" : "Créer l'événement"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
