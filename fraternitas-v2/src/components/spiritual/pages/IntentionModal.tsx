"use client";
// ─── pages/IntentionModal.tsx ─────────────────────────────────────────────────
// Modale "Publier une intention" — reproduit exactement intent-modal du HTML.
// Connectée à /api/intentions (Prisma) — pas localStorage.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

interface IntentionModalProps {
  onClose:     () => void;
  onPublished: () => void; // Pour rafraîchir le panneau droite
}

export default function IntentionModal({ onClose, onPublished }: IntentionModalProps) {
  const [text, setText]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const publish = async () => {
    const v = text.trim();
    if (!v) { setError("Veuillez écrire votre intention."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/intentions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: v, type: "PRAYER", anonymous: false }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Une erreur est survenue. Réessayez.");
        return;
      }
      onPublished();
      onClose();
    } catch {
      setError("Impossible de publier. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-page visible" id="intent-modal">
      <header className="chap-hdr">
        <button className="chap-back" onClick={onClose}>
          <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Retour
        </button>
        <span className="chap-hdr-title">Publier une intention</span>
        <div style={{ width: 60 }} />
      </header>

      <div className="aide-inner">
        <div className="modal-card intent-form">
          <p className="pk">Intention de prière</p>
          <h2 className="guided-title" style={{ marginBottom: 10 }}>
            Que voulez-vous confier ?
          </h2>

          <label htmlFor="intent-text">Votre intention</label>
          <textarea
            id="intent-text"
            className="intent-input"
            maxLength={280}
            placeholder="Pour mon père malade… Pour la paix… Pour une décision difficile…"
            value={text}
            onChange={e => setText(e.target.value)}
            autoFocus
          />

          <p className="guided-note">
            Votre intention sera visible dans l&apos;espace « Intentions du cercle ».
          </p>

          {error && (
            <p style={{ color: "#B44", fontSize: 13, marginTop: 8 }}>{error}</p>
          )}

          <button
            className="btn-primary"
            style={{ marginTop: 14, opacity: loading ? 0.6 : 1 }}
            onClick={publish}
            disabled={loading}
          >
            {loading ? "Publication…" : "Publier l'intention →"}
          </button>
        </div>
      </div>
    </div>
  );
}
