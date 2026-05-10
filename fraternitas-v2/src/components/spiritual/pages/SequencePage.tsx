"use client";
// ─── pages/SequencePage.tsx ───────────────────────────────────────────────────
// Page séquence interactive — reproduit exactement :
//   openSequencePrayer() + renderSequencePrayerStep() + closeSequencePrayer()
// Gère : affichage étape par étape, note toggle, injection personnes, Amen/Précédent
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { SEQUENCES } from "../data";

interface SequencePageProps {
  seqKey:  string;
  people:  string[];
  onClose: () => void;
}

export default function SequencePage({ seqKey, people, onClose }: SequencePageProps) {
  const seq = SEQUENCES[seqKey];
  const [index, setIndex]       = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);

  if (!seq) return null;

  const step   = seq.steps[index];
  const isLast = index >= seq.steps.length - 1;
  const isFirst= index === 0;

  // Injection des personnes au signe de croix final (comme dans l'original)
  let displayText = step.text;
  if (people.length > 0 && /signe de croix final/i.test(step.title)) {
    displayText = `Seigneur, je vous confie ${people.join(", ")}.\nGardez-les dans votre paix.\n\n${step.text}`;
  }

  const hasAideNote = step.note?.startsWith("aide|");
  const noteBody    = hasAideNote ? step.note!.slice(5) : step.note;

  const advance = () => {
    setNoteOpen(false);
    if (isLast) { onClose(); return; }
    setIndex(i => i + 1);
  };

  const goBack = () => {
    setNoteOpen(false);
    setIndex(i => Math.max(0, i - 1));
  };

  return (
    <div className="modal-page seq-pray-page visible" id="seq-pray-page">
      {/* Header */}
      <header className="chap-hdr">
        <button className="chap-back" onClick={onClose}>
          <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Retour
        </button>
        <span className="chap-hdr-title">{seq.title.replace(".", "")}</span>
        <span style={{ fontSize: 12, color: "var(--ink50)", fontWeight: 600 }}>
          {index + 1}/{seq.steps.length}
        </span>
      </header>

      {/* Contenu */}
      <div className="seq-pray-inner">
        {/* Carte prière */}
        <div style={{
          background: "var(--paper)", border: "1px solid var(--ink12)",
          borderRadius: 22, boxShadow: "var(--sh)", overflow: "hidden", marginBottom: 14,
        }}>
          {/* En-tête carte */}
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid var(--ink12)",
            background: "var(--cream3)", display: "flex",
            alignItems: "baseline", justifyContent: "space-between",
          }}>
            <small style={{
              fontSize: 10, fontWeight: 700, letterSpacing: ".12em",
              textTransform: "uppercase", color: "var(--gold)",
            }}>
              {step.num} — {step.title}
            </small>
          </div>

          {/* Corps carte */}
          <div style={{ padding: "24px 22px", textAlign: "center" }}>
            <p style={{
              fontFamily: "var(--serif)", fontSize: 20, fontWeight: 300,
              fontStyle: "italic", color: "var(--ink)", lineHeight: 1.72,
              whiteSpace: "pre-line",
            }}>
              {displayText}
            </p>

            {/* Note / Aide */}
            {step.note && (
              <>
                {hasAideNote ? (
                  <>
                    <button
                      style={{
                        fontSize: 11, fontWeight: 600, color: "var(--gold)",
                        background: "var(--gold-pale)", border: "1px solid var(--gold-b)",
                        borderRadius: 99, padding: "4px 10px", cursor: "pointer", marginTop: 10,
                      }}
                      onClick={() => setNoteOpen(v => !v)}
                    >
                      {noteOpen ? "Masquer" : "Comment faire ?"}
                    </button>
                    {noteOpen && (
                      <p style={{
                        fontSize: 12, color: "var(--ink35)", marginTop: 8,
                        lineHeight: 1.5, textAlign: "left",
                      }}>
                        {noteBody}
                      </p>
                    )}
                  </>
                ) : (
                  <p style={{
                    fontSize: 12, color: "var(--ink35)", marginTop: 8, lineHeight: 1.5,
                  }}>
                    {noteBody}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Boutons navigation */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          {!isFirst && (
            <button
              className="btn-sec"
              style={{
                width: "auto", padding: "12px 16px",
                border: "1px solid var(--ink12)", borderRadius: 99, color: "var(--ink65)",
              }}
              onClick={goBack}
            >
              ← Précédent
            </button>
          )}
          <button
            style={{
              flex: 1, padding: 14, background: "var(--dark)", color: "#F5EFE4",
              borderRadius: 16, fontSize: 16, fontWeight: 600, cursor: "pointer", border: "none",
            }}
            onClick={advance}
          >
            {isLast ? "Terminer ✓" : "Amen →"}
          </button>
        </div>

        <p style={{
          textAlign: "center", fontFamily: "var(--serif)",
          fontSize: 13, fontStyle: "italic", color: "var(--ink35)",
        }}>
          L&apos;Église prie avec vous
        </p>
      </div>
    </div>
  );
}
