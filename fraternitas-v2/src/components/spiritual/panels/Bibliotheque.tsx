"use client";
// ─── panels/Bibliotheque.tsx ──────────────────────────────────────────────────
// Grille bibliothèque — reproduit exactement la section du HTML :
//   <div class="lib-grid">
//     6 lib-card : Matin / Soir / Épreuve / Chapelet / Marie / Guidez-moi
// ─────────────────────────────────────────────────────────────────────────────

import { LIBRARY_CARDS } from "../data";

interface BibliothequeProps {
  onOpenCategory: (key: string) => void;
  onOpenChapelet: () => void;
  onOpenAide:     () => void;
}

export default function Bibliotheque({
  onOpenCategory, onOpenChapelet, onOpenAide,
}: BibliothequeProps) {
  const handleCard = (key: string) => {
    if (key === "chapelet") { onOpenChapelet(); return; }
    if (key === "aide")     { onOpenAide();     return; }
    onOpenCategory(key);
  };

  return (
    <section className="fu" style={{ animationDelay: ".34s" }}>
      <p className="pk" style={{ marginBottom: 6 }}>Bibliothèque</p>
      <h2 style={{
        fontFamily: "var(--serif)",
        fontSize: "clamp(26px, 3vw, 38px)",
        fontWeight: 300,
        letterSpacing: "-.04em",
        color: "var(--ink)",
        marginBottom: 18,
        lineHeight: 1.05,
      }}>
        Toutes les prières,<br />sans jargon.
      </h2>
      <div className="lib-grid">
        {LIBRARY_CARDS.map(card => (
          <div
            key={card.key}
            className="lib-card"
            onClick={() => handleCard(card.key)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && handleCard(card.key)}
          >
            <h3>{card.label}</h3>
            <p>{card.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
