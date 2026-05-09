"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const C = {
  bg: "#F2EBE0", card: "#FFFFFF", cardBorder: "rgba(17,16,9,0.10)",
  cream: "#E8DDD0", creamGold: "#F5EDE0", gold: "#B8973A",
  goldBorder: "rgba(184,137,58,0.35)", ink: "#111009",
  ink80: "rgba(17,16,9,0.80)", ink65: "rgba(17,16,9,0.65)",
  ink50: "rgba(17,16,9,0.50)", ink35: "rgba(17,16,9,0.35)",
  ink12: "rgba(17,16,9,0.12)",
  serif: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  sans: "'DM Sans',system-ui,sans-serif",
};

type Level = "debutant" | "confirme" | "";
// Étapes : 0=niveau, 1=q1, 2=q2, 3=croix, 4=prière, 5=ave+croix finale
type Step = 0 | 1 | 2 | 3 | 4 | 5;

function buildPrayer(q1: string, q2: string, level: Level): string {
  if (level === "confirme") {
    let txt = "Seigneur,\nje viens à toi.";
    if (q1 && q1 !== "rien de particulier — juste être là")
      txt += "\nJe te remets " + q1 + ".";
    if (q2 && q2 !== "personne en particulier")
      txt += "\nJe te confie " + q2 + " dans ta miséricorde.";
    txt += "\nFais de moi ce que tu veux.\nAmen.";
    return txt;
  }
  let txt = "Seigneur, je suis là.";
  if (q1 && q1 !== "rien de particulier — juste être là")
    txt += "\nJe te confie " + q1 + ".";
  if (q2 && q2 !== "personne en particulier")
    txt += "\nJe prie pour " + q2 + ".";
  txt += "\nC'est tout ce que j'ai.\nMerci de m'écouter.";
  return txt;
}

export default function ParcoursPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [level, setLevel] = useState<Level>("");
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [prayer, setPrayer] = useState("");

  const goTo = useCallback((n: Step, opts?: { q1v?: string; q2v?: string; lv?: Level }) => {
    const lv = opts?.lv ?? level;
    const q1v = opts?.q1v ?? q1;
    const q2v = opts?.q2v ?? q2;
    if (n === 4) setPrayer(buildPrayer(q1v, q2v, lv || "debutant"));
    setStep(n);
    window.scrollTo(0, 0);
  }, [level, q1, q2]);

  const goBack = () => {
    if (step === 0) router.push("/dashboard/spiritual#prieres");
    else goTo((step - 1) as Step);
  };

  // Quand on choisit le niveau pratiquant → aller directement à l'étape 1
  const selectLevel = (lv: Level) => {
    setLevel(lv);
    // Navigation directe sans cliquer sur "Continuer"
    goTo(1, { lv });
  };

  // Choisir q1 → aller directement à q2
  const selectQ1 = (val: string) => {
    setQ1(val);
    goTo(2, { q1v: val });
  };

  // Choisir q2 → aller directement à l'étape croix
  const selectQ2 = (val: string) => {
    setQ2(val);
    goTo(3, { q2v: val });
  };

  const effectiveLevel = level || "debutant";
  const totalDots = 5; // étapes 1-5

  const CHOICES_Q1 = [
    "Une inquiétude ou une peur",
    "Une grande fatigue",
    "Une relation difficile",
    "Un manque de sens",
    "De la gratitude",
    "Rien de particulier — juste être là",
  ];
  const CHOICES_Q2 = [
    "Un proche malade ou en difficulté",
    "Quelqu'un qui est loin",
    "Ma famille",
    "Moi-même",
    "Personne en particulier",
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .fu{animation:fu .38s cubic-bezier(.16,1,.3,1) both}
        .ch:active{background:linear-gradient(135deg,#1A1410,#2C1E08)!important;color:#F5EFE4!important}
      `}</style>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(242,235,224,0.97)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.ink12}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
        <button onClick={goBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "12px", color: C.ink50, fontFamily: C.sans, display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {step === 0 ? "Retour" : "Précédent"}
        </button>
        <span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>Commencer à prier</span>
        <div style={{ width: "60px" }} />
      </header>

      <main style={{ maxWidth: "500px", margin: "0 auto", padding: "28px 18px 60px" }}>

        {/* ── 0 : Choix niveau ── */}
        {step === 0 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, marginBottom: "10px" }}>Tu en es où<br/>avec la prière ?</p>
              <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, color: C.ink65, lineHeight: 1.65 }}>Dis-moi où tu en es.<br/>Je t&apos;accompagne au bon niveau.</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { key: "debutant" as Level, icon: "🌱", title: "Débutant", sub: "Je découvre la prière ou j'ai du mal à trouver les mots." },
                { key: "confirme" as Level, icon: "✝️", title: "Pratiquant", sub: "Je connais les bases. Je cherche à approfondir." },
              ].map(opt => (
                <button key={opt.key} onClick={() => selectLevel(opt.key)} style={{ flex: 1, padding: "18px 12px", borderRadius: "14px", border: `2px solid ${C.ink12}`, background: C.card, cursor: "pointer", textAlign: "center", transition: "all .18s", fontFamily: C.sans }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>{opt.icon}</div>
                  <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 400, color: C.ink, marginBottom: "4px", lineHeight: 1.2 }}>{opt.title}</p>
                  <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, lineHeight: 1.5, margin: 0 }}>{opt.sub}</p>
                </button>
              ))}
            </div>
            <p style={{ fontSize: "11px", color: C.ink35, textAlign: "center", fontFamily: C.sans }}>Appuie sur une carte pour commencer →</p>
          </div>
        )}

        {/* ── 1 : Q1 — Ce que tu portes ── */}
        {step === 1 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, textAlign: "center" }}>Question 1 / 2</p>
            <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>Qu&apos;est-ce que tu portes<br/>en ce moment ?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {CHOICES_Q1.map(opt => (
                <button key={opt} className="ch" onClick={() => selectQ1(opt.toLowerCase())} style={{ padding: "13px 15px", borderRadius: "12px", border: `1.5px solid ${C.ink12}`, background: "#F5EDE0", fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink, cursor: "pointer", textAlign: "left", transition: "all .16s", lineHeight: 1.4 }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 2 : Q2 — Pour qui ── */}
        {step === 2 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, textAlign: "center" }}>Question 2 / 2</p>
            <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>Y a-t-il quelqu&apos;un<br/>pour qui tu veux prier ?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {CHOICES_Q2.map(opt => (
                <button key={opt} className="ch" onClick={() => selectQ2(opt.toLowerCase())} style={{ padding: "13px 15px", borderRadius: "12px", border: `1.5px solid ${C.ink12}`, background: "#F5EDE0", fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink, cursor: "pointer", textAlign: "left", transition: "all .16s", lineHeight: 1.4 }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 3 : Signe de croix ── */}
        {step === 3 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {effectiveLevel === "debutant" ? (
              <>
                <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>Le signe de croix.</p>
                <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, textAlign: "center" }}>C&apos;est la façon dont les chrétiens entrent<br/>dans la prière depuis deux mille ans.</p>
                <div style={{ background: "linear-gradient(135deg,rgba(196,154,60,0.08),rgba(196,154,60,0.04))", borderRadius: "14px", border: "1.5px solid rgba(196,154,60,0.28)", padding: "20px", textAlign: "center" }}>
                  <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink, marginBottom: "14px", lineHeight: 1.5 }}>
                    Pose ta main droite sur ton front,<br/>puis ta poitrine, puis ton épaule gauche,<br/>puis ton épaule droite.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "5px", flexWrap: "wrap" as const, marginBottom: "14px" }}>
                    {["Front", "→", "Poitrine", "→", "Épaule G", "→", "Épaule D"].map((s, i) => (
                      <span key={i} style={{ background: s === "→" ? "transparent" : C.card, border: s === "→" ? "none" : "1px solid rgba(196,154,60,0.22)", borderRadius: "7px", padding: s === "→" ? "0 2px" : "5px 9px", fontSize: "10px", fontWeight: 500, color: s === "→" ? C.ink35 : "#8A6520", fontFamily: C.sans }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontFamily: C.serif, fontSize: "19px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.70, margin: 0 }}>
                    Au nom du Père,<br/>et du Fils,<br/>et du Saint-Esprit.<br/>Amen.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>Commence par un<br/>signe de croix.</p>
                <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "24px", textAlign: "center" }}>
                  <p style={{ fontFamily: C.serif, fontSize: "20px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.75, margin: 0 }}>
                    Au nom du Père,<br/>et du Fils,<br/>et du Saint-Esprit.<br/>Amen.
                  </p>
                </div>
              </>
            )}
            <button onClick={() => goTo(4)} style={{ width: "100%", padding: "14px", background: "#C49A3C", border: "none", borderRadius: "14px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
              C&apos;est fait →
            </button>
          </div>
        )}

        {/* ── 4 : Prière personnalisée ── */}
        {step === 4 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>Dis-lui ça.</p>
            <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "22px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.75, textAlign: "center", whiteSpace: "pre-line", margin: 0 }}>
                {prayer}
              </p>
            </div>
            <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink50, textAlign: "center", lineHeight: 1.6 }}>
              Ce n&apos;est pas éloquent. Ce n&apos;est pas nécessaire.<br/>Dieu écoute ce qu&apos;on lui donne.
            </p>
            <button onClick={() => goTo(5)} style={{ width: "100%", padding: "14px", background: "#C49A3C", border: "none", borderRadius: "14px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
              Je l&apos;ai dit →
            </button>
          </div>
        )}

        {/* ── 5 : Je vous salue Marie + signe de croix final ── */}
        {step === 5 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>Pour terminer.</p>
            <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, textAlign: "center" }}>
              Confie ce que tu viens de dire à Marie — puis fais un dernier signe de croix.
            </p>
            <div style={{ background: "#FAF5EC", borderRadius: "14px", border: "1.5px solid rgba(184,137,58,0.28)", padding: "18px" }}>
              <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: "#B8973A", fontFamily: C.sans, marginBottom: "10px" }}>Je vous salue Marie</p>
              <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, fontStyle: "italic", color: "rgba(17,16,9,0.82)", lineHeight: 1.70, whiteSpace: "pre-line", margin: 0 }}>
                {`Je vous salue, Marie pleine de grâce,
le Seigneur est avec vous.
Vous êtes bénie entre toutes les femmes
et Jésus, le fruit de vos entrailles, est béni.

Sainte Marie, Mère de Dieu,
priez pour nous pauvres pécheurs,
maintenant et à l'heure de notre mort.
Amen.`}
              </p>
            </div>
            <div style={{ background: "#F5EDE0", borderRadius: "14px", border: "1px solid rgba(196,154,60,0.22)", padding: "16px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#B8973A", fontFamily: C.sans, marginBottom: "8px" }}>Signe de croix final</p>
              <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.65, margin: 0 }}>
                Au nom du Père,<br/>et du Fils,<br/>et du Saint-Esprit.<br/>Amen.
              </p>
            </div>
            {/* Retour vers l'onglet Prières */}
            <button onClick={() => router.push("/dashboard/spiritual#prieres")} style={{ width: "100%", padding: "14px", background: "#1A1410", border: "none", borderRadius: "14px", color: "#F5EFE4", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
              C&apos;est fait. Terminer →
            </button>
          </div>
        )}

        {/* Dots de progression (visibles sur étapes 1-5) */}
        {step > 0 && (
          <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "28px" }}>
            {Array.from({ length: totalDots }, (_, i) => (
              <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: i < step ? "#C49A3C" : "rgba(17,16,9,0.15)", transition: "background .2s" }} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
