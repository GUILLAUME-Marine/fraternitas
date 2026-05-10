"use client";
// ─── pages/AidePage.tsx ───────────────────────────────────────────────────────
// Aide à la prière — reproduit exactement renderAideStep() du HTML (8 étapes).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { AIDE_Q1, AIDE_FOLLOWUPS, AIDE_PRAYERS } from "../data";

interface AidePageProps {
  people:  string[];
  onClose: () => void;
}

function Dots({ step, total = 8 }: { step: number; total?: number }) {
  return (
    <div className="progress-dots">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`dot ${i < step ? "done" : "todo"}`} />
      ))}
    </div>
  );
}

function ChoiceBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="choice-btn" onClick={onClick}>
      <span>{label}</span>
      <span className="arr">›</span>
    </button>
  );
}

export default function AidePage({ people, onClose }: AidePageProps) {
  const [step, setStep]  = useState(0);
  const [q1Id, setQ1Id]  = useState("");

  const go = (s: number) => setStep(s);

  const prayer = AIDE_PRAYERS[q1Id] ?? AIDE_PRAYERS.curieux;
  const fu      = AIDE_FOLLOWUPS[q1Id];

  return (
    <div className="aide-page visible" id="aide-page">
      <header className="chap-hdr">
        <button className="chap-back" onClick={onClose}>
          <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Retour
        </button>
        <span className="chap-hdr-title">Aide à la prière</span>
        <div style={{ width: 60 }} />
      </header>

      <div className="aide-inner">
        {/* ── Étape 0 : Comment vous sentez-vous ? ── */}
        {step === 0 && (
          <>
            <p className="aide-q">Comment vous sentez-vous ?</p>
            <p className="aide-sub">Choisissez ce qui vous ressemble le plus.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {AIDE_Q1.map(q => (
                <ChoiceBtn
                  key={q.id}
                  label={q.label}
                  onClick={() => {
                    setQ1Id(q.id);
                    go(q.hasFollowup && AIDE_FOLLOWUPS[q.id] ? 1 : 2);
                  }}
                />
              ))}
            </div>
            <Dots step={0} />
          </>
        )}

        {/* ── Étape 1 : Followup ── */}
        {step === 1 && fu && (
          <>
            <p className="aide-q">{fu.q}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {fu.choices.map(ch => (
                <ChoiceBtn key={ch} label={ch} onClick={() => go(2)} />
              ))}
            </div>
            <Dots step={1} />
          </>
        )}

        {/* ── Étape 2 : Signe de croix ── */}
        {step === 2 && (
          <>
            <p className="aide-q">Le signe de croix.</p>
            <p className="aide-sub">Entrer doucement dans la prière.</p>
            <div className="aide-breath">
              <p style={{
                fontFamily: "var(--serif)", fontSize: 20, color: "var(--ink)",
                lineHeight: 1.75, textAlign: "center",
              }}>
                Au nom du Père,<br />et du Fils,<br />et du Saint-Esprit.<br />Amen.
              </p>
            </div>
            <button className="btn-primary" onClick={() => go(3)}>Amen →</button>
            <Dots step={2} />
          </>
        )}

        {/* ── Étape 3 : Commencer simplement ── */}
        {step === 3 && (
          <>
            <p className="aide-q">Commencez simplement.</p>
            <div className="aide-breath">
              <h3>&ldquo;Jésus, je ne sais pas quoi te dire, mais je suis là.&rdquo;</h3>
              <p>
                Parfois, la seule prière possible est celle-là.
                Dieu ne vous demande pas une belle formule : il connaît votre cœur et vos limites.
              </p>
            </div>
            <button className="btn-primary" onClick={() => go(4)}>Continuer →</button>
            <Dots step={3} />
          </>
        )}

        {/* ── Étape 4 : Notre Père ── */}
        {step === 4 && (
          <>
            <p className="aide-q">Notre Père.</p>
            <div className="aide-prayer-result">
              <p className="apr-text">
                Notre Père, qui es aux cieux,<br />
                que ton nom soit sanctifié,<br />
                que ton règne vienne,<br />
                que ta volonté soit faite sur la terre comme au ciel.<br /><br />
                Donne-nous aujourd&apos;hui notre pain de ce jour.<br />
                Pardonne-nous nos offenses,<br />
                comme nous pardonnons aussi à ceux qui nous ont offensés.<br />
                Et ne nous laisse pas entrer en tentation,<br />
                mais délivre-nous du mal. Amen.
              </p>
            </div>
            <button className="btn-primary" onClick={() => go(5)}>Amen →</button>
            <Dots step={4} />
          </>
        )}

        {/* ── Étape 5 : Intention ── */}
        {step === 5 && (
          <>
            <p className="aide-q">Votre intention.</p>
            <div className="aide-breath">
              <p>
                {people.length > 0 ? (
                  <>
                    Seigneur, je vous confie{" "}
                    <strong>{people.join(", ")}</strong>.
                    {" "}Gardez-les dans votre paix.
                  </>
                ) : (
                  "Confiez maintenant une personne, une inquiétude ou votre journée à Dieu."
                )}
              </p>
            </div>
            <button className="btn-primary" onClick={() => go(6)}>Je confie cela →</button>
            <Dots step={5} />
          </>
        )}

        {/* ── Étape 6 : Prière personnalisée ── */}
        {step === 6 && (
          <>
            <p className="aide-q">Une prière pour maintenant.</p>
            <div className="aide-prayer-result">
              <p className="apr-k">{prayer.title}</p>
              <p className="apr-text" style={{ whiteSpace: "pre-line" }}>{prayer.text}</p>
            </div>
            <button className="btn-primary" onClick={() => go(7)}>Amen →</button>
            <Dots step={6} />
          </>
        )}

        {/* ── Étape 7 : Je vous salue Marie ── */}
        {step === 7 && (
          <>
            <p className="aide-q">Je vous salue Marie.</p>
            <div className="aide-prayer-result">
              <p className="apr-text">
                Je vous salue Marie, pleine de grâce,<br />
                le Seigneur est avec vous.<br />
                Vous êtes bénie entre toutes les femmes,<br />
                et Jésus, le fruit de vos entrailles, est béni.<br /><br />
                Sainte Marie, Mère de Dieu,<br />
                priez pour nous pauvres pécheurs,<br />
                maintenant et à l&apos;heure de notre mort. Amen.
              </p>
            </div>
            <button className="btn-primary" onClick={() => go(8)}>Amen →</button>
            <Dots step={7} />
          </>
        )}

        {/* ── Étape 8 : Fin ── */}
        {step === 8 && (
          <>
            <p className="aide-q">Vous venez de prier.</p>
            <p className="aide-sub">
              Restez quelques secondes devant Dieu, sans chercher à réussir.
              Ce simple retour vers Lui compte déjà.
            </p>
            <button className="btn-primary" onClick={onClose}>Terminer →</button>
            <Dots step={8} />
          </>
        )}
      </div>
    </div>
  );
}
