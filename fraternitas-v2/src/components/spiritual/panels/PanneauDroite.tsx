"use client";
// ─── panels/PanneauDroite.tsx ─────────────────────────────────────────────────
// Panneau droite du dashboard — reproduit exactement l'aside #intentions du HTML.
// Combine deux fonctionnalités :
//   1. Personnes à porter (renderPeopleHome) — localStorage
//   2. Intentions du cercle (Prisma /api/intentions) — base de données
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";

interface CircleIntention {
  id:       string;
  text:     string;
  user:     { name: string; image: string | null } | null;
  prayCount:number;
  at:       string;
}

interface PanneauDroiteProps {
  people:               string[];
  onOpenPeoplePage:     () => void;
  onOpenIntentionsList: () => void;
  onOpenIntentionModal: () => void;
}

export default function PanneauDroite({
  people,
  onOpenPeoplePage,
  onOpenIntentionsList,
  onOpenIntentionModal,
}: PanneauDroiteProps) {
  const [intentions, setIntentions]   = useState<CircleIntention[]>([]);
  const [loadingInt, setLoadingInt]   = useState(true);
  const [prayingId, setPrayingId]     = useState<string | null>(null);

  // Charger les intentions du cercle depuis Prisma
  useEffect(() => {
    setLoadingInt(true);
    fetch("/api/intentions?filter=all&page=1")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.intentions) setIntentions(data.intentions.slice(0, 5));
      })
      .catch(() => { /* silencieux */ })
      .finally(() => setLoadingInt(false));
  }, []);

  const handlePray = async (id: string) => {
    setPrayingId(id);
    try {
      await fetch(`/api/intentions/${id}/pray`, { method: "POST" });
      setIntentions(prev => prev.map(i => i.id === id ? { ...i, prayCount: i.prayCount + 1 } : i));
    } catch { /* silencieux */ }
    finally { setPrayingId(null); }
  };

  // ── Section "Personnes à porter" ──────────────────────────────────────────
  const renderPeopleSection = () => {
    if (!people.length) {
      return (
        <>
          <p className="people-home-copy">
            Gardez ici les personnes que vous souhaitez confier dans vos prières quotidiennes.
          </p>
          <div className="people-home-count">
            <strong>Aucune personne</strong>
            <span>Ajoutez une première personne à porter.</span>
          </div>
          <div className="people-home-actions">
            <button className="btn-dark-small" onClick={onOpenPeoplePage}>
              Gérer ma liste →
            </button>
            <button className="btn-int" onClick={onOpenIntentionsList}>
              Voir les intentions du cercle →
            </button>
          </div>
        </>
      );
    }

    const chips = people.slice(0, 4).map((p, i) => <span key={i}>{p}</span>);
    const extra = people.length > 4 ? <span>+{people.length - 4}</span> : null;

    return (
      <>
        <p className="people-home-copy">
          Personnes confiées dans votre prière quotidienne.
        </p>
        <div className="people-home-count">
          <strong>{people.length} personne{people.length > 1 ? "s" : ""}</strong>
          <span>Votre liste est prête pour la prière.</span>
          <div className="people-mini-list">
            {chips}{extra}
          </div>
        </div>
        <div className="people-home-actions">
          <button className="btn-dark-small" onClick={onOpenPeoplePage}>
            Gérer ma liste →
          </button>
          <button className="btn-int" onClick={onOpenIntentionsList}>
            Voir les intentions du cercle →
          </button>
        </div>
      </>
    );
  };

  // ── Section "Intentions du cercle" ────────────────────────────────────────
  const renderIntentionsSection = () => {
    if (loadingInt) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          {[1, 2].map(i => (
            <div key={i} style={{ height: 60, borderRadius: 12, background: "rgba(17,16,9,.06)" }} />
          ))}
        </div>
      );
    }

    if (!intentions.length) {
      return (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--ink12)" }}>
          <p className="pk" style={{ marginBottom: 6 }}>Intentions du cercle</p>
          <p style={{ fontSize: 13, color: "var(--ink50)", lineHeight: 1.55, marginBottom: 10 }}>
            Personne dans votre cercle n&apos;a encore partagé d&apos;intention aujourd&apos;hui.
          </p>
          <button className="btn-int" onClick={onOpenIntentionModal}>
            Partager une intention →
          </button>
        </div>
      );
    }

    return (
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--ink12)" }}>
        <p className="pk" style={{ marginBottom: 8 }}>Intentions du cercle</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {intentions.map(intent => (
            <div key={intent.id} style={{
              background: "var(--cream3)", border: "1px solid var(--gold-b)",
              borderRadius: 12, padding: "11px 13px",
            }}>
              <p style={{
                fontFamily: "var(--serif)", fontSize: 14, fontStyle: "italic",
                color: "var(--ink80)", lineHeight: 1.5, marginBottom: 6,
              }}>
                {intent.text}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "var(--ink35)" }}>
                  {intent.user?.name ?? "Anonyme"}
                </span>
                <button
                  style={{
                    fontSize: 11, fontWeight: 600, color: "var(--gold)",
                    background: "none", border: "none", cursor: "pointer",
                    opacity: prayingId === intent.id ? 0.5 : 1,
                  }}
                  onClick={() => handlePray(intent.id)}
                  disabled={prayingId === intent.id}
                >
                  🙏 {intent.prayCount > 0 ? intent.prayCount : ""} Je prie
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          className="btn-int"
          style={{ marginTop: 10, width: "100%", justifyContent: "center" }}
          onClick={onOpenIntentionModal}
        >
          Partager une intention →
        </button>
      </div>
    );
  };

  return (
    <aside id="intentions" className="intentions-panel fu" style={{ animationDelay: ".12s" }}>
      <p className="pk">Liste de prière</p>
      <p className="panel-title">Personnes à porter</p>
      <div className="int-empty">
        {renderPeopleSection()}
      </div>
      {renderIntentionsSection()}
    </aside>
  );
}
