"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Intention {
  id: string; type: "PRAYER" | "MASS"; text: string;
  massChurch: string | null; massCity: string | null; massDate: string | null;
  city: string | null; anonymous: boolean; createdAt: string;
  userId: string; userName: string | null; userImage: string | null;
  prayerCount: number; hasPrayed: boolean; isOwn: boolean;
}

interface Defunt {
  id: string; prenom: string; lien: string | null;
  annee: number | null; note: string | null;
  anonymous: boolean; createdAt: string;
  userId: string; userName: string | null;
  prayerCount: number; hasPrayed: boolean; isOwn: boolean;
}

type Tab = "prayer" | "mass" | "defunts";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skel({ w = "100%", h = "13px", r = "6px" }: { w?: string; h?: string; r?: string }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "rgba(17,16,9,0.08)", animation: "sk 1.8s ease-in-out infinite", flexShrink: 0 }} />;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, image, size = 34 }: { name: string | null; image: string | null; size?: number }) {
  const initials = name ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  const colors = [["#D4C5A0","#C4A96C","#5A3E1B"],["#C5D4A0","#6CA469","#1B3A1B"],["#A0C5D4","#6A9CB8","#1B2A3A"],["#D4A0C5","#B86AB8","#3A1B3A"]];
  const [bg1, bg2, txt] = colors[(name ? name.charCodeAt(0) % 4 : 0)];
  if (image) return <img src={image} alt={name || ""} width={size} height={size} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg,${bg1},${bg2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 500, color: txt }}>
      {initials}
    </div>
  );
}

// ─── Carte intention ──────────────────────────────────────────────────────────
function IntentionCard({ item, onPray, onDelete }: {
  item: Intention; onPray: (id: string) => void; onDelete: (id: string) => void;
}) {
  const [praying, setPraying] = useState(item.hasPrayed);
  const [count, setCount] = useState(item.prayerCount);
  const [loading, setLoading] = useState(false);

  const handlePray = async () => {
    if (loading || item.isOwn) return;
    setPraying(v => !v); setCount(c => c + (praying ? -1 : 1));
    setLoading(true);
    const res = await fetch(`/api/intentions/${item.id}/pray`, { method: "POST" });
    if (!res.ok) { setPraying(v => !v); setCount(c => c + (praying ? 1 : -1)); }
    else onPray(item.id);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!item.isOwn || !confirm("Supprimer cette intention ?")) return;
    await fetch(`/api/intentions/${item.id}`, { method: "DELETE" });
    onDelete(item.id);
  };

  const isMass = item.type === "MASS";
  const name = item.anonymous ? "Membre anonyme" : (item.userName || "Membre");
  const ago = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: fr });

  return (
    <div style={{ background: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1.5px solid rgba(17,16,9,0.07)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
          {item.anonymous && !item.isOwn
            ? <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(17,16,9,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "14px", color: "rgba(17,16,9,0.3)" }}>?</div>
            : <Avatar name={item.userName} image={item.userImage} size={34} />}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 500, color: "#111009", margin: 0 }}>{name}</p>
            <p style={{ fontSize: "11px", color: "rgba(17,16,9,0.35)", margin: "1px 0 0", fontWeight: 300 }}>{ago}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: "99px", background: isMass ? "rgba(196,154,60,0.1)" : "rgba(74,107,80,0.1)", color: isMass ? "#8A6A20" : "#2D5A35", border: isMass ? "1px solid rgba(196,154,60,0.2)" : "1px solid rgba(74,107,80,0.2)" }}>
            {isMass ? "⛪ Messe" : "🙏 Prière"}
          </span>
          {item.isOwn && (
            <button onClick={handleDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(17,16,9,0.22)", fontSize: "16px", padding: "0 2px", lineHeight: 1 }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = "#C0392B")}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = "rgba(17,16,9,0.22)")}
            >×</button>
          )}
        </div>
      </div>

      {isMass && (item.massChurch || item.massCity) && (
        <div style={{ background: "rgba(247,243,236,0.8)", borderRadius: "10px", padding: "8px 12px", marginBottom: "10px", border: "1px solid rgba(196,154,60,0.15)" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "#111009", margin: 0 }}>
            {[item.massChurch, item.massCity].filter(Boolean).join(" · ")}
          </p>
          {item.massDate && (
            <p style={{ fontSize: "11px", fontWeight: 300, color: "rgba(17,16,9,0.5)", margin: "2px 0 0", textTransform: "capitalize" }}>
              {new Date(item.massDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", ...(new Date(item.massDate).getHours() > 0 ? { hour: "2-digit", minute: "2-digit" } : {}) })}
            </p>
          )}
        </div>
      )}

      <p style={{ fontSize: "14px", fontWeight: 300, lineHeight: 1.7, color: "rgba(17,16,9,0.7)", margin: "0 0 14px" }}>
        {item.text}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {!item.isOwn && (
          <button onClick={handlePray} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 13px", borderRadius: "99px", background: praying ? "rgba(74,107,80,0.1)" : "rgba(17,16,9,0.04)", border: praying ? "1.5px solid rgba(74,107,80,0.25)" : "1.5px solid rgba(17,16,9,0.1)", color: praying ? "#2D5A35" : "rgba(17,16,9,0.58)", fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", opacity: loading ? 0.6 : 1 }}>
            <span style={{ fontSize: "13px" }}>{praying ? "✓" : "🙏"}</span>
            {praying ? "Je prie pour cela" : "Je prie pour cette intention"}
          </button>
        )}
        {isMass && !item.isOwn && (
          <a href={`/dashboard/messages?new=${item.userId}`} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 13px", borderRadius: "99px", border: "1.5px solid rgba(196,154,60,0.25)", color: "#8A6A20", fontSize: "12px", fontWeight: 500, textDecoration: "none", background: "rgba(196,154,60,0.06)", transition: "all 0.2s" }}>
            ⛪ Je vous accompagne
          </a>
        )}
        {count > 0 && (
          <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 300, color: "rgba(17,16,9,0.32)" }}>
            {count} {count === 1 ? "personne prie" : "personnes prient"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Carte défunt — sobre, recueillie ─────────────────────────────────────────
function DefuntCard({ defunt, onPray, onDelete }: {
  defunt: Defunt; onPray: (id: string) => void; onDelete: (id: string) => void;
}) {
  const [praying, setPraying] = useState(defunt.hasPrayed);
  const [count, setCount] = useState(defunt.prayerCount);
  const [loading, setLoading] = useState(false);

  const handlePray = async () => {
    if (loading) return;
    setPraying(v => !v); setCount(c => c + (praying ? -1 : 1));
    setLoading(true);
    const res = await fetch(`/api/defunts/${defunt.id}/pray`, { method: "POST" });
    if (!res.ok) { setPraying(v => !v); setCount(c => c + (praying ? 1 : -1)); }
    else onPray(defunt.id);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!defunt.isOwn || !confirm(`Supprimer ${defunt.prenom} de votre liste ?`)) return;
    await fetch(`/api/defunts/${defunt.id}`, { method: "DELETE" });
    onDelete(defunt.id);
  };

  const name = defunt.anonymous ? "Membre anonyme" : (defunt.userName || "Membre");
  const ago = formatDistanceToNow(new Date(defunt.createdAt), { addSuffix: true, locale: fr });

  return (
    <div style={{
      background: "#FFFFFF", borderRadius: "18px",
      padding: "18px",
      border: "1.5px solid rgba(17,16,9,0.07)",
      position: "relative",
      // Traitement visuel différent — plus doux, plus recueilli
      borderLeft: "3px solid rgba(196,154,60,0.3)",
    }}>
      {/* Cierge discret */}
      <div style={{ position: "absolute", top: "14px", right: "14px", display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{ fontSize: "13px", opacity: 0.4 }}>🕯</span>
        {defunt.isOwn && (
          <button onClick={handleDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(17,16,9,0.2)", fontSize: "15px", padding: "0 2px", lineHeight: 1 }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = "#C0392B")}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = "rgba(17,16,9,0.2)")}
          >×</button>
        )}
      </div>

      {/* Prénom + info */}
      <div style={{ marginBottom: "12px", paddingRight: "40px" }}>
        <p style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif",
          fontSize: "20px", fontWeight: 400, color: "#111009",
          marginBottom: "3px", lineHeight: 1.15,
        }}>
          {defunt.prenom}
          {defunt.annee && (
            <span style={{ fontSize: "14px", fontWeight: 300, color: "rgba(17,16,9,0.38)", marginLeft: "8px" }}>
              † {defunt.annee}
            </span>
          )}
        </p>
        {defunt.lien && (
          <p style={{ fontSize: "12px", fontWeight: 300, color: "rgba(17,16,9,0.45)", margin: 0, fontStyle: "italic" }}>
            {defunt.lien}
          </p>
        )}
      </div>

      {/* Note de l'auteur */}
      {defunt.note && (
        <div style={{ background: "rgba(247,243,236,0.7)", borderRadius: "10px", padding: "9px 12px", marginBottom: "12px", border: "1px solid rgba(196,154,60,0.12)" }}>
          <p style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "14px", fontWeight: 300, fontStyle: "italic",
            color: "rgba(17,16,9,0.62)", lineHeight: 1.65, margin: 0,
          }}>
            {defunt.note}
          </p>
        </div>
      )}

      {/* Auteur du dépôt */}
      <p style={{ fontSize: "11px", fontWeight: 300, color: "rgba(17,16,9,0.32)", marginBottom: "12px" }}>
        Déposé par {name} · {ago}
      </p>

      {/* Action — Allumer un cierge numérique */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button onClick={handlePray} disabled={loading} style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "8px 14px", borderRadius: "99px",
          background: praying ? "rgba(196,154,60,0.1)" : "rgba(17,16,9,0.04)",
          border: praying ? "1.5px solid rgba(196,154,60,0.3)" : "1.5px solid rgba(17,16,9,0.1)",
          color: praying ? "#8A6A20" : "rgba(17,16,9,0.55)",
          fontSize: "12px", fontWeight: 500, cursor: "pointer",
          transition: "all 0.2s", opacity: loading ? 0.6 : 1,
        }}>
          <span style={{ fontSize: "13px" }}>{praying ? "🕯" : "🕯"}</span>
          {praying ? "Vous priez pour lui / elle" : "Prier pour cette âme"}
        </button>
        {count > 0 && (
          <span style={{ fontSize: "11px", fontWeight: 300, color: "rgba(17,16,9,0.32)", marginLeft: "auto" }}>
            {count} {count === 1 ? "cierge allumé" : "cierges allumés"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Formulaire nouvelle intention ────────────────────────────────────────────
function NewIntentionForm({ tab, onCreated }: {
  tab: "prayer" | "mass";
  onCreated: (item: Intention) => void;
}) {
  const [open, setOpen] = useState(false);
  const [type] = useState<"PRAYER" | "MASS">(tab === "mass" ? "MASS" : "PRAYER");
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [massChurch, setMassChurch] = useState("");
  const [massCity, setMassCity] = useState("");
  const [massDate, setMassDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const charLeft = 300 - text.length;

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 13px", borderRadius: "11px", border: "1.5px solid rgba(17,16,9,0.12)", background: "#F7F3EC", color: "#111009", fontSize: "14px", fontWeight: 300, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.length < 10) { setError("Minimum 10 caractères."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/intentions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, text, anonymous, massChurch: massChurch || undefined, massCity: massCity || undefined, massDate: massDate ? new Date(massDate).toISOString() : null }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erreur."); setLoading(false); return; }
    onCreated(data.intention);
    setText(""); setMassChurch(""); setMassCity(""); setMassDate(""); setAnonymous(false); setOpen(false);
    setLoading(false);
  };

  if (!open) return (
    <button onClick={() => { setOpen(true); setTimeout(() => ref.current?.focus(), 80); }} style={{ width: "100%", padding: "15px 18px", borderRadius: "18px", border: "1.5px dashed rgba(17,16,9,0.14)", background: "transparent", cursor: "pointer", textAlign: "left", color: "rgba(17,16,9,0.38)", fontSize: "14px", fontWeight: 300, display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,154,60,0.4)"; (e.currentTarget as HTMLElement).style.background = "rgba(196,154,60,0.03)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,16,9,0.14)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <span style={{ fontSize: "16px", opacity: 0.4 }}>{tab === "mass" ? "⛪" : "🙏"}</span>
      {tab === "mass" ? "Proposer d'aller à la messe ensemble…" : "Déposer une intention de prière…"}
    </button>
  );

  return (
    <div style={{ background: "#FFFFFF", borderRadius: "18px", border: "1.5px solid rgba(196,154,60,0.25)", padding: "18px", boxShadow: "0 4px 24px rgba(17,16,9,0.07)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "#111009", margin: 0 }}>Nouvelle intention</p>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "rgba(17,16,9,0.3)" }}>×</button>
      </div>
      <form onSubmit={submit}>
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <textarea ref={ref} value={text} onChange={e => setText(e.target.value.slice(0, 300))} rows={4}
            placeholder={tab === "mass" ? "Décrivez votre intention (messe, lieu, heure…)" : "Partagez votre intention de prière…"}
            style={{ ...inputStyle, resize: "none", display: "block" }}
            onFocus={e => (e.target.style.borderColor = "#C49A3C")} onBlur={e => (e.target.style.borderColor = "rgba(17,16,9,0.12)")}
          />
          <span style={{ position: "absolute", bottom: "8px", right: "10px", fontSize: "11px", color: charLeft < 50 ? "#C0392B" : "rgba(17,16,9,0.28)" }}>{charLeft}</span>
        </div>
        {tab === "mass" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <input type="text" placeholder="Église" value={massChurch} onChange={e => setMassChurch(e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = "#C49A3C")} onBlur={e => (e.target.style.borderColor = "rgba(17,16,9,0.12)")} />
              <input type="text" placeholder="Ville" value={massCity} onChange={e => setMassCity(e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = "#C49A3C")} onBlur={e => (e.target.style.borderColor = "rgba(17,16,9,0.12)")} />
            </div>
            <input type="datetime-local" value={massDate} onChange={e => setMassDate(e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = "#C49A3C")} onBlur={e => (e.target.style.borderColor = "rgba(17,16,9,0.12)")} />
          </div>
        )}
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "14px" }}>
          <div onClick={() => setAnonymous(v => !v)} style={{ width: "16px", height: "16px", borderRadius: "4px", border: "1.5px solid rgba(17,16,9,0.2)", background: anonymous ? "#111009" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", cursor: "pointer" }}>
            {anonymous && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#F7F3EC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <span style={{ fontSize: "12px", fontWeight: 300, color: "rgba(17,16,9,0.55)" }}>Anonyme</span>
        </label>
        {error && <p style={{ fontSize: "12px", color: "#C0392B", marginBottom: "10px" }}>{error}</p>}
        <div style={{ display: "flex", gap: "8px" }}>
          <button type="button" onClick={() => setOpen(false)} style={{ padding: "10px 16px", borderRadius: "99px", border: "1.5px solid rgba(17,16,9,0.12)", background: "none", cursor: "pointer", fontSize: "13px", color: "rgba(17,16,9,0.5)" }}>Annuler</button>
          <button type="submit" disabled={loading || text.length < 10} style={{ flex: 1, padding: "10px", borderRadius: "99px", background: loading || text.length < 10 ? "rgba(17,16,9,0.15)" : "#111009", color: "#F7F3EC", border: "none", cursor: loading || text.length < 10 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 500 }}>
            {loading ? "Envoi…" : "Déposer"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Formulaire nouveau défunt ─────────────────────────────────────────────────
function NewDefuntForm({ onCreated }: { onCreated: (d: Defunt) => void }) {
  const [open, setOpen] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [lien, setLien] = useState("");
  const [annee, setAnnee] = useState("");
  const [note, setNote] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 13px", borderRadius: "11px", border: "1.5px solid rgba(17,16,9,0.12)", background: "#F7F3EC", color: "#111009", fontSize: "14px", fontWeight: 300, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom.trim()) { setError("Le prénom est requis."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/defunts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prenom: prenom.trim(), lien: lien || undefined, annee: annee ? parseInt(annee) : null, note: note || undefined, anonymous }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Erreur."); setLoading(false); return; }
    onCreated(data.defunt);
    setPrenom(""); setLien(""); setAnnee(""); setNote(""); setAnonymous(false); setOpen(false);
    setLoading(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ width: "100%", padding: "15px 18px", borderRadius: "18px", border: "1.5px dashed rgba(196,154,60,0.3)", background: "transparent", cursor: "pointer", textAlign: "left", color: "rgba(17,16,9,0.38)", fontSize: "14px", fontWeight: 300, display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,154,60,0.5)"; (e.currentTarget as HTMLElement).style.background = "rgba(196,154,60,0.03)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,154,60,0.3)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <span style={{ fontSize: "16px", opacity: 0.5 }}>🕯</span>
      Ajouter un défunt à prier…
    </button>
  );

  return (
    <div style={{ background: "#FFFFFF", borderRadius: "18px", border: "1.5px solid rgba(196,154,60,0.25)", padding: "18px", boxShadow: "0 4px 24px rgba(17,16,9,0.07)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "#111009", margin: 0 }}>Ajouter un défunt</p>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "rgba(17,16,9,0.3)" }}>×</button>
      </div>
      <p style={{ fontSize: "12px", fontWeight: 300, color: "rgba(17,16,9,0.45)", marginBottom: "16px", lineHeight: 1.55 }}>
        La communauté priera pour lui / elle. Son prénom sera visible. Vous pouvez rester anonyme.
      </p>

      <form onSubmit={submit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 500, color: "rgba(17,16,9,0.5)", display: "block", marginBottom: "5px" }}>Prénom *</label>
            <input type="text" placeholder="Marie" value={prenom} onChange={e => setPrenom(e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = "#C49A3C")} onBlur={e => (e.target.style.borderColor = "rgba(17,16,9,0.12)")} />
          </div>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 500, color: "rgba(17,16,9,0.5)", display: "block", marginBottom: "5px" }}>Lien</label>
            <input type="text" placeholder="Mère, ami…" value={lien} onChange={e => setLien(e.target.value.slice(0, 40))} style={inputStyle} onFocus={e => (e.target.style.borderColor = "#C49A3C")} onBlur={e => (e.target.style.borderColor = "rgba(17,16,9,0.12)")} />
          </div>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label style={{ fontSize: "11px", fontWeight: 500, color: "rgba(17,16,9,0.5)", display: "block", marginBottom: "5px" }}>Année du décès</label>
          <input type="number" placeholder="2024" min="1900" max={new Date().getFullYear()} value={annee} onChange={e => setAnnee(e.target.value)} style={{ ...inputStyle }} onFocus={e => (e.target.style.borderColor = "#C49A3C")} onBlur={e => (e.target.style.borderColor = "rgba(17,16,9,0.12)")} />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "11px", fontWeight: 500, color: "rgba(17,16,9,0.5)", display: "block", marginBottom: "5px" }}>
            Une pensée pour lui / elle <span style={{ fontWeight: 300, color: "rgba(17,16,9,0.35)" }}>(optionnel)</span>
          </label>
          <div style={{ position: "relative" }}>
            <textarea value={note} onChange={e => setNote(e.target.value.slice(0, 200))} rows={3}
              placeholder="Il avait une foi simple et profonde…"
              style={{ ...inputStyle, resize: "none", display: "block", fontStyle: "italic" }}
              onFocus={e => (e.target.style.borderColor = "#C49A3C")} onBlur={e => (e.target.style.borderColor = "rgba(17,16,9,0.12)")}
            />
            <span style={{ position: "absolute", bottom: "7px", right: "9px", fontSize: "10px", color: "rgba(17,16,9,0.28)" }}>{200 - note.length}</span>
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "14px" }}>
          <div onClick={() => setAnonymous(v => !v)} style={{ width: "16px", height: "16px", borderRadius: "4px", border: "1.5px solid rgba(17,16,9,0.2)", background: anonymous ? "#111009" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {anonymous && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#F7F3EC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <span style={{ fontSize: "12px", fontWeight: 300, color: "rgba(17,16,9,0.55)" }}>Déposer de manière anonyme</span>
        </label>

        {error && <p style={{ fontSize: "12px", color: "#C0392B", marginBottom: "10px" }}>{error}</p>}

        <div style={{ display: "flex", gap: "8px" }}>
          <button type="button" onClick={() => setOpen(false)} style={{ padding: "10px 16px", borderRadius: "99px", border: "1.5px solid rgba(17,16,9,0.12)", background: "none", cursor: "pointer", fontSize: "13px", color: "rgba(17,16,9,0.5)" }}>Annuler</button>
          <button type="submit" disabled={loading || !prenom.trim()} style={{ flex: 1, padding: "10px", borderRadius: "99px", background: loading || !prenom.trim() ? "rgba(17,16,9,0.15)" : "#111009", color: "#F7F3EC", border: "none", cursor: loading || !prenom.trim() ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 500 }}>
            {loading ? "Dépôt…" : "Confier au prières de la communauté"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function IntentionsPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("prayer");

  // Intentions
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [intLoading, setIntLoading] = useState(true);
  const [intError, setIntError] = useState(false);

  // Défunts
  const [defunts, setDefunts] = useState<Defunt[]>([]);
  const [defLoading, setDefLoading] = useState(true);
  const [defError, setDefError] = useState(false);

  const loadIntentions = useCallback(async (type: "prayer" | "mass") => {
    setIntLoading(true); setIntError(false);
    try {
      const res = await fetch(`/api/intentions?filter=${type}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIntentions(data.intentions);
    } catch { setIntError(true); }
    finally { setIntLoading(false); }
  }, []);

  const loadDefunts = useCallback(async () => {
    setDefLoading(true); setDefError(false);
    try {
      const res = await fetch("/api/defunts");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDefunts(data.defunts);
    } catch { setDefError(true); }
    finally { setDefLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === "prayer" || tab === "mass") loadIntentions(tab);
    else loadDefunts();
  }, [tab, loadIntentions, loadDefunts]);

  const TABS: Array<{ key: Tab; label: string; icon: string }> = [
    { key: "prayer", label: "Prières", icon: "🙏" },
    { key: "mass", label: "Messes", icon: "⛪" },
    { key: "defunts", label: "Défunts", icon: "🕯" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F5EFE4", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes sk{0%,100%{opacity:.4}50%{opacity:.9}}
        *{box-sizing:border-box}
      `}</style>

      {/* En-tête */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 20px 0" }}>
        <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(17,16,9,0.33)", marginBottom: "8px" }}>Communauté</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(26px,5vw,36px)", fontWeight: 300, color: "#111009", lineHeight: 1.1, marginBottom: "6px" }}>
          Intentions de prière
        </h1>
        <p style={{ fontSize: "14px", fontWeight: 300, color: "rgba(17,16,9,0.48)", lineHeight: 1.6, marginBottom: "20px" }}>
          Priez avec la communauté. Déposez vos intentions. Confiez vos défunts.
        </p>

        {/* Citation Jacques 5,16 */}
        <div style={{ padding: "12px 16px", borderRadius: "12px", background: "rgba(196,154,60,0.07)", border: "1px solid rgba(196,154,60,0.18)", marginBottom: "24px" }}>
          <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "14px", fontStyle: "italic", fontWeight: 300, color: "rgba(17,16,9,0.6)", lineHeight: 1.65, margin: 0 }}>
            « Priez les uns pour les autres, afin que vous soyez guéris. »
          </p>
          <p style={{ fontSize: "11px", color: "rgba(17,16,9,0.33)", margin: "5px 0 0", fontWeight: 300 }}>— Jacques 5, 16</p>
        </div>

        {/* Onglets */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "8px 16px", borderRadius: "99px",
              border: tab === t.key ? "1.5px solid rgba(17,16,9,0.5)" : "1.5px solid rgba(17,16,9,0.1)",
              background: tab === t.key ? "#111009" : "transparent",
              color: tab === t.key ? "#F7F3EC" : "rgba(17,16,9,0.55)",
              fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "13px" }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Formulaire selon l'onglet */}
        <div style={{ marginBottom: "20px" }}>
          {(tab === "prayer" || tab === "mass") && (
            <NewIntentionForm tab={tab} onCreated={item => setIntentions(p => [item, ...p])} />
          )}
          {tab === "defunts" && (
            <NewDefuntForm onCreated={d => setDefunts(p => [d, ...p])} />
          )}
        </div>

        {/* Séparateur */}
        <div style={{ height: "1px", background: "rgba(17,16,9,0.07)", marginBottom: "20px" }} />
      </div>

      {/* Liste */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 20px 100px" }}>

        {/* Onglets intentions */}
        {(tab === "prayer" || tab === "mass") && (
          intLoading ? <SkeletonList /> : intError ? (
            <ErrorState onRetry={() => loadIntentions(tab)} />
          ) : intentions.length === 0 ? (
            <EmptyState
              icon={tab === "mass" ? "⛪" : "🙏"}
              title={tab === "mass" ? "Aucune messe ensemble" : "Aucune intention de prière"}
              desc={tab === "mass" ? "Proposez d'aller à la messe — quelqu'un vous rejoindra." : "Soyez le premier à déposer une intention pour la communauté."}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {intentions.map(item => (
                <IntentionCard key={item.id} item={item}
                  onPray={() => {}} onDelete={id => setIntentions(p => p.filter(i => i.id !== id))} />
              ))}
            </div>
          )
        )}

        {/* Onglet défunts */}
        {tab === "defunts" && (
          defLoading ? <SkeletonList /> : defError ? (
            <ErrorState onRetry={loadDefunts} />
          ) : defunts.length === 0 ? (
            <div>
              <EmptyState
                icon="🕯"
                title="Aucun défunt déposé"
                desc="Confiez vos défunts à la prière de la communauté. Leur prénom sera porté dans les intentions."
              />
              <div style={{ marginTop: "24px", padding: "16px", borderRadius: "14px", background: "rgba(196,154,60,0.06)", border: "1px solid rgba(196,154,60,0.15)" }}>
                <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "15px", fontWeight: 300, fontStyle: "italic", color: "rgba(17,16,9,0.55)", lineHeight: 1.7, margin: 0, textAlign: "center" }}>
                  « Donnez-leur, Seigneur, le repos éternel,<br />et que la lumière perpétuelle les illumine. »
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* En-tête sobre section défunts */}
              <div style={{ padding: "12px 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right,rgba(196,154,60,0.3),transparent)" }} />
                <span style={{ fontSize: "11px", fontWeight: 300, color: "rgba(17,16,9,0.35)", fontStyle: "italic" }}>
                  {defunts.length} {defunts.length === 1 ? "âme confiée" : "âmes confiées"} à la prière
                </span>
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left,rgba(196,154,60,0.3),transparent)" }} />
              </div>
              {defunts.map(d => (
                <DefuntCard key={d.id} defunt={d}
                  onPray={() => {}} onDelete={id => setDefunts(p => p.filter(x => x.id !== id))} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ─── Composants utilitaires ───────────────────────────────────────────────────
function SkeletonList() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ background: "#FFFFFF", borderRadius: "18px", padding: "18px", border: "1.5px solid rgba(17,16,9,0.07)" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <Skel w="34px" h="34px" r="50%" />
            <div style={{ flex: 1 }}><Skel w="40%" h="11px" /><div style={{ height: "5px" }} /><Skel w="25%" h="10px" /></div>
          </div>
          <Skel w="100%" h="12px" /><div style={{ height: "7px" }} />
          <Skel w="80%" h="12px" /><div style={{ height: "14px" }} />
          <Skel w="140px" h="30px" r="99px" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <p style={{ fontSize: "14px", color: "rgba(17,16,9,0.45)", marginBottom: "16px" }}>
        Contenu indisponible en ce moment.
      </p>
      <button onClick={onRetry} style={{ padding: "9px 22px", borderRadius: "99px", border: "1.5px solid rgba(17,16,9,0.14)", background: "none", cursor: "pointer", fontSize: "13px", color: "#111009" }}>
        Réessayer
      </button>
    </div>
  );
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 24px", border: "1.5px dashed rgba(17,16,9,0.1)", borderRadius: "18px" }}>
      <div style={{ fontSize: "28px", opacity: 0.3, marginBottom: "12px" }}>{icon}</div>
      <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "18px", fontWeight: 400, color: "#111009", marginBottom: "6px" }}>{title}</p>
      <p style={{ fontSize: "13px", fontWeight: 300, color: "rgba(17,16,9,0.45)", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
