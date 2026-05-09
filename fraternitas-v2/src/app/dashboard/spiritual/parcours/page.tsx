"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const C = {
  bg: "#F2EBE0",
  card: "#FFFFFF",
  cardBorder: "rgba(17,16,9,0.10)",
  cream: "#E8DDD0",
  creamGold: "#F5EDE0",
  gold: "#B8893A",
  goldBorder: "rgba(184,137,58,0.35)",
  ink: "#111009",
  ink80: "rgba(17,16,9,0.80)",
  ink65: "rgba(17,16,9,0.65)",
  ink50: "rgba(17,16,9,0.50)",
  ink35: "rgba(17,16,9,0.35)",
  ink12: "rgba(17,16,9,0.12)",
  serif: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  sans: "'DM Sans',system-ui,sans-serif",
};

type Level = "debutant" | "confirme" | "";
type Step = 0 | 1 | 2 | 3 | 4 | 5;

const TOTAL_STEPS = 6;

export default function ParcoursPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [level, setLevel] = useState<Level>("");
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [prayer, setPrayer] = useState("Seigneur, je suis là.");

  function buildPrayer(q1val: string, q2val: string, lv: Level): string {
    if (lv === "confirme") {
      let txt = "Seigneur,\nje viens à toi.";
      if (q1val && q1val !== "rien de particulier — juste être là")
        txt += "\nJe te remets " + q1val + ".";
      if (q2val && q2val !== "personne en particulier")
        txt += "\nJe te confie " + q2val + " dans ta miséricorde.";
      txt += "\nFais de moi ce que tu veux.\nAmen.";
      return txt;
    } else {
      let txt = "Seigneur, je suis là.";
      if (q1val && q1val !== "rien de particulier — juste être là")
        txt += "\nJe te confie " + q1val + ".";
      if (q2val && q2val !== "personne en particulier")
        txt += "\nJe prie pour " + q2val + ".";
      txt += "\nC'est tout ce que j'ai.\nMerci de m'écouter.";
      return txt;
    }
  }

  function next(overrideStep?: Step) {
    const nextStep = overrideStep !== undefined ? overrideStep : ((step + 1) as Step);
    if (nextStep === 4) {
      const lv = level || "debutant";
      setPrayer(buildPrayer(q1, q2, lv));
    }
    setStep(nextStep);
    window.scrollTo(0, 0);
  }

  const effectiveLevel = level || "debutant";

  // Dots : combien on a d'étapes affichées (hors étape 0)
  const dotsCount = TOTAL_STEPS - 1; // 5 dots pour étapes 1-5

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .fu{animation:fu .4s cubic-bezier(.16,1,.3,1) both}
        .choice-btn:hover{border-color:rgba(196,154,60,0.45)!important;background:#FBF4E5!important}
        .level-card:hover{border-color:rgba(196,154,60,0.40)!important;background:#FBF4E5!important}
      `}</style>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(242,235,224,0.95)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.ink12}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
      }}>
        <button onClick={() => step === 0 ? router.push("/dashboard/spiritual") : setStep((step - 1) as Step)} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          fontSize: "12px", color: C.ink50, fontFamily: C.sans,
          display: "flex", alignItems: "center", gap: "4px",
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {step === 0 ? "Retour" : "Précédent"}
        </button>

        <span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>
          Commencer à prier
        </span>

        <div style={{ width: "60px" }} />
      </header>

      <main style={{ maxWidth: "520px", margin: "0 auto", padding: "28px 20px 60px" }}>

        {/* ── ÉTAPE 0 : Choix niveau ── */}
        {step === 0 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, marginBottom: "10px" }}>
                Tu en es où<br/>avec la prière ?
              </p>
              <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, color: C.ink65, lineHeight: 1.72 }}>
                Pour t&apos;accompagner au bon niveau,<br/>dis-moi où tu en es.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { key: "debutant" as Level, icon: "🌱", title: "Débutant", sub: "Je découvre la prière ou j'ai du mal à trouver les mots." },
                { key: "confirme" as Level, icon: "✝️", title: "Pratiquant", sub: "Je connais les bases. Je cherche à aller plus loin." },
              ].map(opt => (
                <button
                  key={opt.key}
                  className="level-card"
                  onClick={() => { setLevel(opt.key); }}
                  style={{
                    flex: 1, padding: "18px 12px", borderRadius: "14px",
                    border: `2px solid ${level === opt.key ? "#C49A3C" : C.ink12}`,
                    background: level === opt.key
                      ? "linear-gradient(135deg,#1A1410,#2C1E08)"
                      : C.card,
                    cursor: "pointer", textAlign: "center",
                    transition: "all .20s", fontFamily: C.sans,
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "8px", lineHeight: 1 }}>{opt.icon}</div>
                  <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 400, color: level === opt.key ? "#F5EFE4" : C.ink, marginBottom: "4px", lineHeight: 1.2, transition: "color .2s" }}>
                    {opt.title}
                  </p>
                  <p style={{ fontSize: "11px", fontWeight: 300, color: level === opt.key ? "rgba(245,239,228,0.55)" : C.ink50, lineHeight: 1.5, transition: "color .2s", margin: 0 }}>
                    {opt.sub}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={() => { if (!level) setLevel("debutant"); next(1); }}
              style={{
                width: "100%", padding: "14px", background: "#C49A3C",
                border: "none", borderRadius: "14px", color: "#1A1410",
                fontSize: "14px", fontWeight: 500, cursor: "pointer",
                fontFamily: C.sans,
              }}
            >
              Continuer →
            </button>
          </div>
        )}

        {/* ── ÉTAPE 1 : Ce que tu portes ── */}
        {step === 1 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, textAlign: "center" }}>
              Question 1 / 2
            </p>
            <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              Qu&apos;est-ce que tu portes<br/>en ce moment ?
            </p>
            <div style={{ background: C.card, borderRadius: "14px", border: "1.5px solid rgba(196,154,60,0.22)", padding: "16px 18px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {[
                  "Une inquiétude ou une peur",
                  "Une grande fatigue",
                  "Une relation difficile",
                  "Un manque de sens",
                  "De la gratitude",
                  "Rien de particulier — juste être là",
                ].map(opt => (
                  <button
                    key={opt}
                    className="choice-btn"
                    onClick={() => { setQ1(opt.toLowerCase()); next(2); }}
                    style={{
                      padding: "12px 15px", borderRadius: "11px",
                      border: `1.5px solid ${q1 === opt.toLowerCase() ? "#C49A3C" : C.ink12}`,
                      background: q1 === opt.toLowerCase()
                        ? "linear-gradient(135deg,#1A1410,#2C1E08)"
                        : "#F5EDE0",
                      fontFamily: C.serif, fontSize: "15px", fontWeight: 300,
                      color: q1 === opt.toLowerCase() ? "#F5EFE4" : C.ink,
                      cursor: "pointer", textAlign: "left",
                      transition: "all .18s", lineHeight: 1.4,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : Pour qui prier ── */}
        {step === 2 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, textAlign: "center" }}>
              Question 2 / 2
            </p>
            <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              Y a-t-il quelqu&apos;un<br/>pour qui tu veux prier ?
            </p>
            <div style={{ background: C.card, borderRadius: "14px", border: "1.5px solid rgba(196,154,60,0.22)", padding: "16px 18px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {[
                  "Un proche malade ou en difficulté",
                  "Quelqu'un qui est loin",
                  "Ma famille",
                  "Moi-même",
                  "Personne en particulier",
                ].map(opt => (
                  <button
                    key={opt}
                    className="choice-btn"
                    onClick={() => { setQ2(opt.toLowerCase()); next(3); }}
                    style={{
                      padding: "12px 15px", borderRadius: "11px",
                      border: `1.5px solid ${q2 === opt.toLowerCase() ? "#C49A3C" : C.ink12}`,
                      background: q2 === opt.toLowerCase()
                        ? "linear-gradient(135deg,#1A1410,#2C1E08)"
                        : "#F5EDE0",
                      fontFamily: C.serif, fontSize: "15px", fontWeight: 300,
                      color: q2 === opt.toLowerCase() ? "#F5EFE4" : C.ink,
                      cursor: "pointer", textAlign: "left",
                      transition: "all .18s", lineHeight: 1.4,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : Signe de croix ── */}
        {step === 3 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {effectiveLevel === "debutant" ? (
              <>
                <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
                  Le signe de croix.
                </p>
                <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, color: C.ink65, lineHeight: 1.72, textAlign: "center" }}>
                  C&apos;est comme ça que les chrétiens entrent dans la prière depuis deux mille ans.
                </p>
                <div style={{ background: "linear-gradient(135deg,rgba(196,154,60,0.08),rgba(196,154,60,0.04))", borderRadius: "14px", border: "1.5px solid rgba(196,154,60,0.28)", padding: "20px", textAlign: "center" }}>
                  <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, fontStyle: "italic", color: C.ink, marginBottom: "14px", lineHeight: 1.5 }}>
                    Pose ta main droite sur ton front, puis ta poitrine,<br/>puis ton épaule gauche, puis ton épaule droite.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" as const, marginBottom: "14px" }}>
                    {["Front", "→", "Poitrine", "→", "Épaule gauche", "→", "Épaule droite"].map((s, i) => (
                      <span key={i} style={{
                        background: s === "→" ? "transparent" : C.card,
                        border: s === "→" ? "none" : "1px solid rgba(196,154,60,0.22)",
                        borderRadius: "8px", padding: s === "→" ? "0" : "6px 10px",
                        fontSize: "11px", fontWeight: 500, color: s === "→" ? C.ink35 : "#8A6520",
                        fontFamily: C.sans,
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.65, margin: 0 }}>
                    Au nom du Père,<br/>et du Fils,<br/>et du Saint-Esprit.<br/>Amen.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
                  Commence par un<br/>signe de croix.
                </p>
                <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "24px", textAlign: "center" }}>
                  <p style={{ fontFamily: C.serif, fontSize: "20px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.80 }}>
                    Au nom du Père,<br/>et du Fils,<br/>et du Saint-Esprit.<br/>Amen.
                  </p>
                </div>
              </>
            )}
            <button
              onClick={() => next(4)}
              style={{ width: "100%", padding: "14px", background: "#C49A3C", border: "none", borderRadius: "14px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}
            >
              C&apos;est fait →
            </button>
          </div>
        )}

        {/* ── ÉTAPE 4 : Prière personnalisée ── */}
        {step === 4 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              Dis-lui ça.
            </p>
            <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "24px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "19px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.80, textAlign: "center", whiteSpace: "pre-line", margin: 0 }}>
                {prayer}
              </p>
            </div>
            <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink50, textAlign: "center", lineHeight: 1.6 }}>
              Ce n&apos;est pas éloquent. Ce n&apos;est pas nécessaire.<br/>Dieu écoute ce qu&apos;on lui donne.
            </p>
            <button
              onClick={() => next(5)}
              style={{ width: "100%", padding: "14px", background: "#C49A3C", border: "none", borderRadius: "14px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}
            >
              Je l&apos;ai dit →
            </button>
          </div>
        )}

        {/* ── ÉTAPE 5 : Je vous salue Marie + signe de croix final ── */}
        {step === 5 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              Pour terminer.
            </p>
            <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, color: C.ink65, lineHeight: 1.72, textAlign: "center" }}>
              Confie ce que tu viens de dire à Marie — puis fais un dernier signe de croix.
            </p>

            {/* Je vous salue Marie */}
            <div style={{ background: "#FAF5EC", borderRadius: "14px", border: "1.5px solid rgba(184,137,58,0.28)", padding: "18px" }}>
              <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: "#B8973A", fontFamily: C.sans, marginBottom: "10px" }}>
                Je vous salue Marie
              </p>
              <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: "rgba(17,16,9,0.82)", lineHeight: 1.80, whiteSpace: "pre-line", margin: 0 }}>
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

            {/* Signe de croix final */}
            <div style={{ background: "#F5EDE0", borderRadius: "14px", border: "1px solid rgba(196,154,60,0.22)", padding: "18px", textAlign: "center" }}>
              <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#B8973A", fontFamily: C.sans, marginBottom: "10px" }}>
                Pour conclure
              </p>
              <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.65 }}>
                Au nom du Père,<br/>et du Fils,<br/>et du Saint-Esprit.<br/>Amen.
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard/spiritual")}
              style={{ width: "100%", padding: "14px", background: "#1A1410", border: "none", borderRadius: "14px", color: "#F5EFE4", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}
            >
              C&apos;est fait. Terminer →
            </button>
          </div>
        )}

        {/* Dots de progression */}
        {step > 0 && (
          <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "28px" }}>
            {Array.from({ length: dotsCount }, (_, i) => (
              <div key={i} style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: i < step ? "#C49A3C" : "rgba(17,16,9,0.15)",
                transition: "background .2s",
              }} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
