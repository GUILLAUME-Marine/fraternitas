"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Intention {
  id: string;
  type: "PRAYER" | "MASS";
  text: string;
  massChurch: string | null;
  massCity: string | null;
  massDate: string | null;
  city: string | null;
  anonymous: boolean;
  createdAt: string;
  userId: string;
  userName: string | null;
  userImage: string | null;
  prayerCount: number;
  hasPrayed: boolean;
  isOwn: boolean;
}

type Filter = "all" | "prayer" | "mass" | "mine";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ style = {} }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(17,16,9,0.07)",
      borderRadius: "8px",
      animation: "sk 1.8s ease-in-out infinite",
      ...style,
    }} />
  );
}

// ─── Avatar sobre ─────────────────────────────────────────────────────────────
function Avatar({ name, image, size = 36 }: { name: string | null; image: string | null; size?: number }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const colors = [
    ["#D4C5A0", "#C4A96C", "#5A3E1B"],
    ["#C5D4A0", "#6CA469", "#1B3A1B"],
    ["#A0C5D4", "#6A9CB8", "#1B2A3A"],
    ["#D4A0C5", "#B86AB8", "#3A1B3A"],
    ["#D4B5A0", "#C47850", "#3A1E0A"],
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  const [bg1, bg2, text] = colors[idx];

  if (image) {
    return (
      <img src={image} alt={name || "Membre"} width={size} height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg,${bg1},${bg2})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 500, color: text, letterSpacing: "0.02em",
    }}>
      {initials}
    </div>
  );
}

// ─── Carte intention ──────────────────────────────────────────────────────────
function IntentionCard({
  intention,
  onPray,
  onDelete,
}: {
  intention: Intention;
  onPray: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [prayLoading, setPrayLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [localHasPrayed, setLocalHasPrayed] = useState(intention.hasPrayed);
  const [localCount, setLocalCount] = useState(intention.prayerCount);

  const handlePray = async () => {
    if (prayLoading || intention.isOwn) return;
    setPrayLoading(true);
    // Optimistic update
    const next = !localHasPrayed;
    setLocalHasPrayed(next);
    setLocalCount((c) => c + (next ? 1 : -1));
    try {
      const res = await fetch(`/api/intentions/${intention.id}/pray`, { method: "POST" });
      if (!res.ok) {
        // Rollback
        setLocalHasPrayed(!next);
        setLocalCount((c) => c + (next ? -1 : 1));
      } else {
        onPray(intention.id);
      }
    } catch {
      setLocalHasPrayed(!next);
      setLocalCount((c) => c + (next ? -1 : 1));
    } finally {
      setPrayLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteLoading || !intention.isOwn) return;
    if (!confirm("Supprimer cette intention ?")) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/intentions/${intention.id}`, { method: "DELETE" });
      onDelete(intention.id);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isMass = intention.type === "MASS";
  const displayName = intention.anonymous ? "Membre anonyme" : (intention.userName || "Membre");
  const timeAgo = formatDistanceToNow(new Date(intention.createdAt), { addSuffix: true, locale: fr });

  // Date de messe formatée
  const massDateStr = intention.massDate
    ? new Date(intention.massDate).toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long",
        ...(new Date(intention.massDate).getHours() > 0 ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : null;

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: "20px",
      padding: "22px",
      border: "1.5px solid rgba(17,16,9,0.07)",
      transition: "box-shadow 0.2s",
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(17,16,9,0.07)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
          {intention.anonymous && !intention.isOwn
            ? (
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: "rgba(17,16,9,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", color: "rgba(17,16,9,0.35)",
              }}>?</div>
            )
            : <Avatar name={intention.userName} image={intention.userImage} size={36} />
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#111009", margin: 0 }}>
                {displayName}
              </p>
              {intention.city && (
                <span style={{
                  fontSize: "11px", color: "rgba(17,16,9,0.35)",
                  padding: "1px 7px", borderRadius: "99px",
                  background: "rgba(17,16,9,0.05)",
                }}>
                  {intention.city}
                </span>
              )}
            </div>
            <p style={{ fontSize: "11px", color: "rgba(17,16,9,0.35)", margin: "1px 0 0", fontWeight: 300 }}>
              {timeAgo}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Badge type */}
          <div style={{
            fontSize: "10px", fontWeight: 500, letterSpacing: "0.08em",
            textTransform: "uppercase", padding: "3px 8px", borderRadius: "99px",
            background: isMass ? "rgba(196,154,60,0.1)" : "rgba(74,107,80,0.1)",
            color: isMass ? "#8A6A20" : "#2D5A35",
            border: isMass ? "1px solid rgba(196,154,60,0.2)" : "1px solid rgba(74,107,80,0.2)",
          }}>
            {isMass ? "⛪ Messe" : "🙏 Prière"}
          </div>

          {/* Supprimer (propre intention) */}
          {intention.isOwn && (
            <button onClick={handleDelete} disabled={deleteLoading}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(17,16,9,0.25)", fontSize: "16px", padding: "2px",
                transition: "color 0.15s", lineHeight: 1,
              }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = "#C0392B")}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = "rgba(17,16,9,0.25)")}
              title="Supprimer cette intention"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Informations messe */}
      {isMass && (intention.massChurch || intention.massCity || massDateStr) && (
        <div style={{
          background: "rgba(247,243,236,0.8)", borderRadius: "12px",
          padding: "10px 14px", marginBottom: "12px",
          border: "1px solid rgba(196,154,60,0.15)",
        }}>
          {(intention.massChurch || intention.massCity) && (
            <p style={{ fontSize: "12px", fontWeight: 500, color: "#111009", margin: "0 0 2px" }}>
              {[intention.massChurch, intention.massCity].filter(Boolean).join(" · ")}
            </p>
          )}
          {massDateStr && (
            <p style={{ fontSize: "12px", fontWeight: 300, color: "rgba(17,16,9,0.55)", margin: 0, textTransform: "capitalize" }}>
              {massDateStr}
            </p>
          )}
        </div>
      )}

      {/* Texte de l'intention */}
      <p style={{
        fontSize: "14px", fontWeight: 300, lineHeight: 1.7,
        color: "rgba(17,16,9,0.72)", margin: "0 0 16px",
      }}>
        {intention.text}
      </p>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {/* Prier */}
        {!intention.isOwn && (
          <button onClick={handlePray} disabled={prayLoading}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", borderRadius: "99px",
              background: localHasPrayed ? "rgba(74,107,80,0.1)" : "rgba(17,16,9,0.04)",
              border: localHasPrayed ? "1.5px solid rgba(74,107,80,0.25)" : "1.5px solid rgba(17,16,9,0.1)",
              color: localHasPrayed ? "#2D5A35" : "rgba(17,16,9,0.6)",
              cursor: prayLoading ? "wait" : "pointer",
              fontSize: "12px", fontWeight: 500,
              transition: "all 0.2s",
              opacity: prayLoading ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: "14px" }}>{localHasPrayed ? "✓" : "🙏"}</span>
            {localHasPrayed ? "Je prie pour cela" : "Je prie pour cette intention"}
          </button>
        )}

        {/* Accompagner à la messe */}
        {isMass && !intention.isOwn && (
          <a href={`/dashboard/messages?new=${intention.userId}&context=mass&intentionId=${intention.id}`}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 14px", borderRadius: "99px",
              border: "1.5px solid rgba(196,154,60,0.25)",
              color: "#8A6A20", fontSize: "12px", fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s",
              background: "rgba(196,154,60,0.06)",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(196,154,60,0.12)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(196,154,60,0.06)")}
          >
            <span>⛪</span>
            Je vous accompagne
          </a>
        )}

        {/* Compteur sobre — pas un like, une présence */}
        {localCount > 0 && (
          <span style={{
            marginLeft: "auto", fontSize: "12px", fontWeight: 300,
            color: "rgba(17,16,9,0.35)",
          }}>
            {localCount} {localCount === 1 ? "personne prie" : "personnes prient"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Formulaire nouvelle intention ────────────────────────────────────────────
function NewIntentionForm({ onCreated }: { onCreated: (i: Intention) => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"PRAYER" | "MASS">("PRAYER");
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [massChurch, setMassChurch] = useState("");
  const [massCity, setMassCity] = useState("");
  const [massDate, setMassDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textRef = useRef<HTMLTextAreaElement>(null);

  const charLeft = 300 - text.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.length < 10) {
      setError("Votre intention doit faire au moins 10 caractères.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/intentions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          text: text.trim(),
          anonymous,
          massChurch: massChurch || undefined,
          massCity: massCity || undefined,
          massDate: massDate ? new Date(massDate).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }
      onCreated(data.intention);
      // Reset
      setText(""); setMassChurch(""); setMassCity(""); setMassDate("");
      setAnonymous(false); setType("PRAYER"); setOpen(false);
    } catch {
      setError("Une erreur réseau est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: "12px",
    border: "1.5px solid rgba(17,16,9,0.12)", background: "#F7F3EC",
    color: "#111009", fontSize: "14px", fontWeight: 300,
    outline: "none", fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); setTimeout(() => textRef.current?.focus(), 100); }}
        style={{
          width: "100%", padding: "16px 20px", borderRadius: "20px",
          border: "1.5px dashed rgba(17,16,9,0.15)", background: "transparent",
          cursor: "pointer", textAlign: "left", transition: "all 0.2s",
          display: "flex", alignItems: "center", gap: "10px",
          color: "rgba(17,16,9,0.4)", fontSize: "14px", fontWeight: 300,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,154,60,0.4)";
          (e.currentTarget as HTMLElement).style.background = "rgba(196,154,60,0.03)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,16,9,0.15)";
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <span style={{ fontSize: "18px", opacity: 0.5 }}>🙏</span>
        Déposer une intention de prière…
      </button>
    );
  }

  return (
    <div style={{
      background: "#FFFFFF", borderRadius: "20px",
      border: "1.5px solid rgba(196,154,60,0.25)",
      padding: "20px", boxShadow: "0 4px 24px rgba(17,16,9,0.08)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <p style={{ fontSize: "14px", fontWeight: 500, color: "#111009", margin: 0 }}>
          Nouvelle intention
        </p>
        <button onClick={() => setOpen(false)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "rgba(17,16,9,0.35)", padding: "0 4px" }}>
          ×
        </button>
      </div>

      {/* Type selector */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {(["PRAYER", "MASS"] as const).map((t) => (
          <button key={t} onClick={() => setType(t)}
            style={{
              flex: 1, padding: "9px", borderRadius: "12px",
              border: type === t ? "1.5px solid rgba(196,154,60,0.4)" : "1.5px solid rgba(17,16,9,0.1)",
              background: type === t ? "rgba(196,154,60,0.08)" : "transparent",
              color: type === t ? "#8A6A20" : "rgba(17,16,9,0.5)",
              fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
            }}>
            {t === "PRAYER" ? "🙏 Intention de prière" : "⛪ Aller à la messe"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Texte */}
        <div style={{ position: "relative", marginBottom: "12px" }}>
          <textarea
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 300))}
            placeholder={
              type === "PRAYER"
                ? "Partagez votre intention de prière… (ex : Priez pour mon père qui traverse une période difficile.)"
                : "Décrivez votre intention… (ex : Je cherche quelqu'un pour m'accompagner, je ne connais pas encore bien la messe.)"
            }
            rows={4}
            style={{ ...inputStyle, resize: "none", display: "block" }}
            onFocus={(e) => (e.target.style.borderColor = "#C49A3C")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(17,16,9,0.12)")}
          />
          <span style={{
            position: "absolute", bottom: "8px", right: "12px",
            fontSize: "11px", color: charLeft < 50 ? "#C0392B" : "rgba(17,16,9,0.3)",
          }}>
            {charLeft}
          </span>
        </div>

        {/* Champs messe */}
        {type === "MASS" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <input type="text" placeholder="Église (ex : Saint-Eustache)" value={massChurch}
                onChange={(e) => setMassChurch(e.target.value)} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#C49A3C")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(17,16,9,0.12)")} />
              <input type="text" placeholder="Ville" value={massCity}
                onChange={(e) => setMassCity(e.target.value)} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#C49A3C")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(17,16,9,0.12)")} />
            </div>
            <input type="datetime-local" value={massDate}
              onChange={(e) => setMassDate(e.target.value)} style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#C49A3C")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(17,16,9,0.12)")} />
          </div>
        )}

        {/* Anonymat */}
        <label style={{
          display: "flex", alignItems: "center", gap: "10px",
          cursor: "pointer", marginBottom: "16px",
        }}>
          <div onClick={() => setAnonymous((v) => !v)}
            style={{
              width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
              border: "1.5px solid rgba(17,16,9,0.2)",
              background: anonymous ? "#111009" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s", cursor: "pointer",
            }}>
            {anonymous && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4 7L8 3" stroke="#F7F3EC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span style={{ fontSize: "13px", fontWeight: 300, color: "rgba(17,16,9,0.6)" }}>
            Publier de manière anonyme
          </span>
        </label>

        {error && (
          <p style={{ fontSize: "13px", color: "#C0392B", marginBottom: "12px", fontWeight: 300 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <button type="button" onClick={() => setOpen(false)}
            style={{
              padding: "10px 18px", borderRadius: "99px", border: "1.5px solid rgba(17,16,9,0.12)",
              background: "none", cursor: "pointer", fontSize: "13px", color: "rgba(17,16,9,0.55)",
            }}>
            Annuler
          </button>
          <button type="submit" disabled={loading || text.length < 10}
            style={{
              flex: 1, padding: "10px 18px", borderRadius: "99px",
              background: loading || text.length < 10 ? "rgba(17,16,9,0.2)" : "#111009",
              color: "#F7F3EC", border: "none", cursor: loading || text.length < 10 ? "not-allowed" : "pointer",
              fontSize: "13px", fontWeight: 500, transition: "all 0.15s",
            }}>
            {loading ? "Envoi…" : "Déposer cette intention"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function IntentionsPage() {
  const { data: session } = useSession();
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchIntentions = useCallback(async (f: Filter, p: number, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    setError(false);
    try {
      const res = await fetch(`/api/intentions?filter=${f}&page=${p}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIntentions((prev) => append ? [...prev, ...data.intentions] : data.intentions);
      setTotalPages(data.pages);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchIntentions(filter, 1, false);
  }, [filter, fetchIntentions]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchIntentions(filter, next, true);
  };

  const handlePray = (_id: string) => {
    // La mise à jour optimiste est gérée dans IntentionCard
  };

  const handleDelete = (id: string) => {
    setIntentions((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCreated = (newIntention: Intention) => {
    setIntentions((prev) => [newIntention, ...prev]);
  };

  const FILTERS: Array<{ key: Filter; label: string }> = [
    { key: "all", label: "Toutes" },
    { key: "prayer", label: "Prières" },
    { key: "mass", label: "Messes ensemble" },
    { key: "mine", label: "Mes intentions" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F5EFE4", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes sk { 0%,100%{opacity:.45} 50%{opacity:.9} }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── En-tête de page ── */}
      <div style={{
        background: "#F5EFE4",
        padding: "32px 24px 0",
        maxWidth: "680px", margin: "0 auto",
      }}>

        {/* Titre */}
        <div style={{ marginBottom: "24px" }}>
          <p style={{
            fontSize: "11px", fontWeight: 500, letterSpacing: "2px",
            textTransform: "uppercase", color: "rgba(17,16,9,0.35)", marginBottom: "8px",
          }}>
            Communauté
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "clamp(28px,5vw,38px)", fontWeight: 300,
            color: "#111009", lineHeight: 1.1, marginBottom: "8px",
          }}>
            Intentions de prière
          </h1>
          <p style={{ fontSize: "14px", fontWeight: 300, color: "rgba(17,16,9,0.5)", lineHeight: 1.6 }}>
            Déposez une intention. Priez pour celles des autres.
            Proposez d&rsquo;aller à la messe ensemble.
          </p>
        </div>

        {/* Citation sobre — rappel spirituel */}
        <div style={{
          padding: "14px 18px", borderRadius: "14px",
          background: "rgba(196,154,60,0.07)",
          border: "1px solid rgba(196,154,60,0.18)",
          marginBottom: "24px",
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "15px", fontStyle: "italic", fontWeight: 300,
            color: "rgba(17,16,9,0.6)", lineHeight: 1.65, margin: 0,
          }}>
            « Priez les uns pour les autres, afin que vous soyez guéris. »
          </p>
          <p style={{ fontSize: "11px", color: "rgba(17,16,9,0.35)", margin: "6px 0 0", fontWeight: 300 }}>
            — Jacques 5, 16
          </p>
        </div>

        {/* Formulaire nouvelle intention */}
        <div style={{ marginBottom: "24px" }}>
          <NewIntentionForm onCreated={handleCreated} />
        </div>

        {/* Filtres */}
        <div style={{
          display: "flex", gap: "6px", flexWrap: "wrap",
          paddingBottom: "20px",
          borderBottom: "1px solid rgba(17,16,9,0.07)",
          marginBottom: "0",
        }}>
          {FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{
                padding: "7px 14px", borderRadius: "99px",
                border: filter === key ? "1.5px solid rgba(17,16,9,0.5)" : "1.5px solid rgba(17,16,9,0.1)",
                background: filter === key ? "#111009" : "transparent",
                color: filter === key ? "#F7F3EC" : "rgba(17,16,9,0.55)",
                fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Liste ── */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "20px 24px 80px" }}>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "8px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                background: "#FFFFFF", borderRadius: "20px",
                padding: "22px", border: "1.5px solid rgba(17,16,9,0.07)",
              }}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                  <Skeleton style={{ width: 36, height: 36, borderRadius: "50%" }} />
                  <div style={{ flex: 1 }}>
                    <Skeleton style={{ width: "40%", height: "12px", marginBottom: "6px" }} />
                    <Skeleton style={{ width: "25%", height: "10px" }} />
                  </div>
                </div>
                <Skeleton style={{ width: "100%", height: "13px", marginBottom: "6px" }} />
                <Skeleton style={{ width: "85%", height: "13px", marginBottom: "6px" }} />
                <Skeleton style={{ width: "60%", height: "13px", marginBottom: "16px" }} />
                <Skeleton style={{ width: "160px", height: "32px", borderRadius: "99px" }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <p style={{ fontSize: "15px", color: "rgba(17,16,9,0.45)", marginBottom: "16px" }}>
              Les intentions ne sont pas disponibles en ce moment.
            </p>
            <button onClick={() => fetchIntentions(filter, 1, false)}
              style={{
                padding: "10px 24px", borderRadius: "99px",
                border: "1.5px solid rgba(17,16,9,0.15)", background: "none",
                cursor: "pointer", fontSize: "13px", color: "#111009",
              }}>
              Réessayer
            </button>
          </div>
        ) : intentions.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "8px" }}>
              {intentions.map((intention) => (
                <IntentionCard
                  key={intention.id}
                  intention={intention}
                  onPray={handlePray}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Charger plus */}
            {page < totalPages && (
              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <button onClick={handleLoadMore} disabled={loadingMore}
                  style={{
                    padding: "11px 28px", borderRadius: "99px",
                    border: "1.5px solid rgba(17,16,9,0.12)",
                    background: "none", cursor: loadingMore ? "wait" : "pointer",
                    fontSize: "13px", color: "rgba(17,16,9,0.6)", opacity: loadingMore ? 0.5 : 1,
                    transition: "all 0.15s",
                  }}>
                  {loadingMore ? "Chargement…" : "Voir plus d'intentions"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── État vide ────────────────────────────────────────────────────────────────
function EmptyState({ filter }: { filter: Filter }) {
  const messages: Record<Filter, { icon: string; title: string; desc: string }> = {
    all: {
      icon: "🙏",
      title: "Aucune intention pour le moment",
      desc: "Soyez le premier à déposer une intention de prière pour votre communauté.",
    },
    prayer: {
      icon: "🙏",
      title: "Aucune intention de prière",
      desc: "Déposez une intention — la communauté priera avec vous.",
    },
    mass: {
      icon: "⛪",
      title: "Personne ne cherche à aller à la messe ensemble",
      desc: "Proposez d'aller à la messe — quelqu'un vous rejoindra peut-être.",
    },
    mine: {
      icon: "◎",
      title: "Vous n'avez pas encore d'intention",
      desc: "Déposez une intention de prière ou proposez d'aller à la messe ensemble.",
    },
  };

  const { icon, title, desc } = messages[filter];

  return (
    <div style={{
      textAlign: "center", padding: "60px 24px",
      border: "1.5px dashed rgba(17,16,9,0.1)", borderRadius: "20px",
      marginTop: "8px",
    }}>
      <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.4 }}>{icon}</div>
      <h3 style={{
        fontFamily: "'Cormorant Garamond',Georgia,serif",
        fontSize: "20px", fontWeight: 400, color: "#111009",
        marginBottom: "8px",
      }}>{title}</h3>
      <p style={{ fontSize: "14px", fontWeight: 300, color: "rgba(17,16,9,0.45)", lineHeight: 1.6 }}>
        {desc}
      </p>
    </div>
  );
}
