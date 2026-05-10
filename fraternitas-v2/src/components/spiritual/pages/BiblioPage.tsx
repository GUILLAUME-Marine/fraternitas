"use client";
// ─── pages/BiblioPage.tsx ─────────────────────────────────────────────────────
// Bibliothèque détail — reproduit openLibraryCategory() + openLibraryPrayer()
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { SEQUENCES } from "../data";

interface BiblioPageProps {
  categoryKey: string;
  onClose:     () => void;
}

export default function BiblioPage({ categoryKey, onClose }: BiblioPageProps) {
  const [selectedPrayer, setSelectedPrayer] = useState<number | null>(null);
  const seq = SEQUENCES[categoryKey];

  const TITLES: Record<string, string> = {
    matin: "Prière du matin", soir: "Prière du soir",
    inquiet: "Dans l'épreuve", marie: "Avec Marie",
  };

  if (!seq) return null;

  // Vue prière individuelle
  if (selectedPrayer !== null) {
    const st = seq.steps[selectedPrayer];
    return (
      <div className="modal-page visible" id="library-page">
        <header className="chap-hdr">
          <button className="chap-back" onClick={() => setSelectedPrayer(null)}>
            <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Retour
          </button>
          <span className="chap-hdr-title">{TITLES[categoryKey] ?? seq.title}</span>
          <div style={{ width: 60 }} />
        </header>
        <div className="aide-inner">
          <button
            className="btn-sec"
            style={{ textAlign: "left", paddingLeft: 0, width: "auto" }}
            onClick={() => setSelectedPrayer(null)}
          >
            ← Toutes les prières
          </button>
          <div className="modal-card">
            <p className="guided-count">{seq.title}</p>
            <h2 className="guided-title">{st.title}</h2>
            <div className="guided-text">{st.text}</div>
            {st.note && !st.note.startsWith("aide|") && (
              <p className="guided-note">{st.note}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vue liste catégorie
  return (
    <div className="modal-page visible" id="library-page">
      <header className="chap-hdr">
        <button className="chap-back" onClick={onClose}>
          <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Retour
        </button>
        <span className="chap-hdr-title">{TITLES[categoryKey] ?? seq.title}</span>
        <div style={{ width: 60 }} />
      </header>
      <div className="aide-inner">
        <p className="pk">Bibliothèque</p>
        <h2 className="guided-title">{seq.title}</h2>
        <p className="aide-sub" style={{ textAlign: "left", marginBottom: 12 }}>
          Choisissez une prière à lire directement.
        </p>
        <div className="lib-list">
          {seq.steps.map((st, idx) => (
            <button
              key={idx}
              className="lib-prayer-row"
              onClick={() => setSelectedPrayer(idx)}
            >
              <span>
                <strong>{st.title}</strong>
                <span>
                  {st.note
                    ? st.note.replace(/^aide\|/, "").substring(0, 60)
                    : "Prière complète"}
                </span>
              </span>
              <span style={{ fontSize: 18, color: "var(--ink35)" }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
