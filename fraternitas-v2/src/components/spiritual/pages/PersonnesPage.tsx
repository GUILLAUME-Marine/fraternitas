"use client";
// ─── pages/PersonnesPage.tsx ──────────────────────────────────────────────────
// Page "Personnes à porter" — reproduit exactement people-page du HTML.
// Gestion de la liste de prénoms (localStorage scopé userId).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

interface PersonnesPageProps {
  people:   string[];
  onAdd:    (names: string) => void;
  onRemove: (index: number) => void;
  onClose:  () => void;
}

export default function PersonnesPage({ people, onAdd, onRemove, onClose }: PersonnesPageProps) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (!input.trim()) return;
    onAdd(input);
    setInput("");
  };

  return (
    <div className="people-page visible" id="people-page">
      <header className="chap-hdr">
        <button className="chap-back" onClick={onClose}>
          <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Retour
        </button>
        <span className="chap-hdr-title">Personnes à porter</span>
        <div style={{ width: 84 }} />
      </header>

      <div className="people-page-inner">
        <section className="people-page-hero">
          <p className="pk">Prière quotidienne</p>
          <h2>Garder les prénoms dans la prière.</h2>
          <p>
            Ajoutez ici toutes les personnes pour qui vous voulez prier.
            Elles seront rappelées dans vos prières quotidiennes et pendant le chapelet.
          </p>
        </section>

        <section className="people-manager">
          <div className="people-manager-row">
            <input
              id="people-page-input"
              placeholder="Ex. Maman, Paul, les malades…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
              autoFocus
            />
            <button onClick={handleAdd}>Ajouter</button>
          </div>

          {people.length === 0 ? (
            <div className="people-empty">Aucune personne ajoutée pour le moment.</div>
          ) : (
            <div className="people-manager-list">
              {people.map((person, i) => (
                <div key={i} className="person-chip">
                  <span>{person}</span>
                  <button onClick={() => onRemove(i)}>×</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
