"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Edit3, CheckCircle } from "lucide-react";

interface Interest {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

interface Props {
  user: any;
  allInterests: Interest[];
  stats: { events: number; circles: number; connections: number };
}

const SEEKING_OPTIONS = [
  { value: "amis", label: "👥 Des amis cathos" },
  { value: "groupe", label: "🏘️ Un groupe local" },
  { value: "mentor", label: "🧭 Un mentor" },
  { value: "priere", label: "🙏 Prier ensemble" },
  { value: "evenements", label: "🗓️ Des événements" },
  { value: "reseau_pro", label: "💼 Réseau pro" },
  { value: "projets", label: "🚀 Des projets" },
];

const PRACTICE_LEVELS = [
  "Pratiquant régulier",
  "En chemin",
  "En recherche",
  "Très pratiquant",
  "Pratique en famille",
];

export function ProfileEditor({ user, allInterests, stats }: Props) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.profile?.bio || "",
    city: user?.profile?.city || "",
    age: user?.profile?.age || "",
    practiceLevel: user?.profile?.practiceLevel || "",
    seeking: user?.profile?.seeking || [],
    quote: user?.profile?.quote || "",
    interests: user?.profile?.interests?.map((i: any) => i.interestId) || [],
  });

  const toggleInterest = (id: string) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(id)
        ? f.interests.filter((i: string) => i !== id)
        : [...f.interests, id],
    }));
  };

  const toggleSeeking = (val: string) => {
    setForm(f => ({
      ...f,
      seeking: f.seeking.includes(val)
        ? f.seeking.filter((s: string) => s !== val)
        : [...f.seeking, val],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, age: form.age ? parseInt(String(form.age)) : undefined }),
    });
    if (res.ok) {
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const interestsByCategory = allInterests.reduce((acc, i) => {
    if (!acc[i.category]) acc[i.category] = [];
    acc[i.category].push(i);
    return acc;
  }, {} as Record<string, Interest[]>);

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-light text-3xl text-[#111009] mb-1">Mon profil</h1>
          <p className="text-sm text-[rgba(17,16,9,0.45)]">Gérez vos informations et préférences</p>
        </div>
        <div className="flex gap-2">
          {success && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm border border-green-200">
              <CheckCircle size={15} /> Sauvegardé !
            </div>
          )}
          {editing ? (
            <>
              <button onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[rgba(17,16,9,0.65)] hover:bg-[#F7F3EC] transition-colors">
                Annuler
              </button>
              <button onClick={handleSave} disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#111009] text-white text-sm font-medium hover:-translate-y-0.5 transition-all disabled:opacity-50">
                <Save size={15} />
                {loading ? "Sauvegarde…" : "Sauvegarder"}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[rgba(17,16,9,0.65)] hover:bg-[#F7F3EC] transition-colors">
              <Edit3 size={15} /> Modifier
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-[rgba(17,16,9,0.08)] p-6">
            <h2 className="font-display text-lg font-medium text-[#111009] mb-4 pb-3 border-b border-[rgba(17,16,9,0.06)]">
              Informations de base
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Prénom", type: "text", placeholder: "Votre prénom" },
                { key: "city", label: "Ville", type: "text", placeholder: "Lyon" },
                { key: "age", label: "Âge", type: "number", placeholder: "28" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">{f.label}</label>
                  {editing ? (
                    <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                      placeholder={f.placeholder}
                      className="w-full h-10 px-3.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A] focus:ring-2 focus:ring-[#B8973A]/10" />
                  ) : (
                    <p className="text-sm text-[#111009] py-2">{(form as any)[f.key] || <span className="text-[rgba(17,16,9,0.35)] italic">Non renseigné</span>}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Niveau de pratique</label>
                {editing ? (
                  <select value={form.practiceLevel} onChange={e => setForm(p => ({...p, practiceLevel: e.target.value}))}
                    className="w-full h-10 px-3.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A] bg-white">
                    <option value="">Choisir…</option>
                    {PRACTICE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                ) : (
                  <p className="text-sm text-[#111009] py-2">{form.practiceLevel || <span className="text-[rgba(17,16,9,0.35)] italic">Non renseigné</span>}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Bio</label>
              {editing ? (
                <textarea value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} rows={4}
                  placeholder="Parlez de vous, de ce qui vous anime, de ce que vous cherchez…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A] resize-none" />
              ) : (
                <p className="text-sm text-[rgba(17,16,9,0.7)] leading-relaxed">
                  {form.bio || <span className="italic text-[rgba(17,16,9,0.35)]">Pas encore de bio</span>}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.5)] block mb-1.5">Citation favorite</label>
              {editing ? (
                <input value={form.quote} onChange={e => setForm(p => ({...p, quote: e.target.value}))}
                  placeholder="Ex: « Notre cœur est sans repos… » — Saint Augustin"
                  className="w-full h-10 px-3.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[#111009] outline-none focus:border-[#B8973A]" />
              ) : (
                <p className="text-sm font-display italic text-[#111009]">
                  {form.quote || <span className="not-italic font-body text-[rgba(17,16,9,0.35)]">Aucune citation</span>}
                </p>
              )}
            </div>
          </div>

          {/* Seeking */}
          <div className="bg-white rounded-2xl border border-[rgba(17,16,9,0.08)] p-6">
            <h2 className="font-display text-lg font-medium text-[#111009] mb-4 pb-3 border-b border-[rgba(17,16,9,0.06)]">
              Ce que je cherche
            </h2>
            <div className="flex flex-wrap gap-2">
              {SEEKING_OPTIONS.map(opt => {
                const selected = form.seeking.includes(opt.value);
                return (
                  <button key={opt.value} type="button"
                    onClick={() => editing && toggleSeeking(opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                      selected
                        ? "bg-[#111009] text-white border-[#111009]"
                        : "bg-[#F7F3EC] text-[rgba(17,16,9,0.65)] border-[rgba(17,16,9,0.12)]"
                    } ${editing ? "cursor-pointer hover:border-[#B8973A]" : "cursor-default"}`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-2xl border border-[rgba(17,16,9,0.08)] p-6">
            <h2 className="font-display text-lg font-medium text-[#111009] mb-4 pb-3 border-b border-[rgba(17,16,9,0.06)]">
              Centres d'intérêt
            </h2>
            {Object.entries(interestsByCategory).map(([category, interests]) => (
              <div key={category} className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,16,9,0.4)] mb-2">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {interests.map(interest => {
                    const selected = form.interests.includes(interest.id);
                    return (
                      <button key={interest.id} type="button"
                        onClick={() => editing && toggleInterest(interest.id)}
                        className={`px-3 py-1.5 rounded-xl text-sm border transition-all flex items-center gap-1.5 ${
                          selected
                            ? "bg-[#111009] text-white border-[#111009]"
                            : "bg-[#F7F3EC] text-[rgba(17,16,9,0.65)] border-[rgba(17,16,9,0.12)]"
                        } ${editing ? "cursor-pointer" : "cursor-default"}`}>
                        <span>{interest.emoji}</span>
                        {interest.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[rgba(17,16,9,0.08)] p-6">
            <h3 className="font-display text-lg font-medium text-[#111009] mb-4">Mes statistiques</h3>
            {[
              { label: "Connexions", value: stats.connections },
              { label: "Événements inscrits", value: stats.events },
              { label: "Cercles rejoints", value: stats.circles },
            ].map(s => (
              <div key={s.label} className="flex justify-between py-3 border-b border-[rgba(17,16,9,0.06)] last:border-0">
                <span className="text-sm text-[rgba(17,16,9,0.65)]">{s.label}</span>
                <span className="text-sm font-semibold text-[#111009]">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#111009] rounded-2xl p-6 text-[#F7F3EC]">
            <div className="text-2xl mb-3">✦</div>
            <p className="font-display text-lg mb-2">Profil complet</p>
            <p className="text-sm text-[rgba(247,243,236,0.65)] leading-relaxed mb-4">
              Un profil complet attire 3x plus de connexions et améliore le matching.
            </p>
            <div className="h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#D4AF5A] to-[#B8973A] rounded-full"
                style={{ width: `${Math.min(100, [form.name, form.bio, form.city, form.practiceLevel, form.interests.length > 0].filter(Boolean).length * 20)}%` }} />
            </div>
            <p className="text-xs text-[rgba(247,243,236,0.45)] mt-2">
              {Math.min(100, [form.name, form.bio, form.city, form.practiceLevel, form.interests.length > 0].filter(Boolean).length * 20)}% complété
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[rgba(17,16,9,0.08)] p-6">
            <h3 className="text-sm font-semibold text-[rgba(17,16,9,0.5)] uppercase tracking-wider mb-3">Actions rapides</h3>
            <div className="space-y-2">
              <a href="/dashboard/settings/security"
                className="flex items-center gap-2 p-3 rounded-xl hover:bg-[#F7F3EC] transition-colors text-sm text-[rgba(17,16,9,0.7)]">
                🔒 Changer mon mot de passe
              </a>
              <a href="/dashboard/settings"
                className="flex items-center gap-2 p-3 rounded-xl hover:bg-[#F7F3EC] transition-colors text-sm text-[rgba(17,16,9,0.7)]">
                ⚙️ Paramètres du compte
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
