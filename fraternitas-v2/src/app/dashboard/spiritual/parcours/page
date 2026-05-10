"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const C = {
  bg: "#F2EBE0", card: "#FFFFFF", cardBorder: "rgba(17,16,9,0.10)",
  cream: "#E8DDD0", creamGold: "#F5EDE0", gold: "#B8893A",
  goldBorder: "rgba(184,137,58,0.35)", ink: "#111009",
  ink80: "rgba(17,16,9,0.80)", ink65: "rgba(17,16,9,0.65)",
  ink50: "rgba(17,16,9,0.50)", ink35: "rgba(17,16,9,0.35)", ink12: "rgba(17,16,9,0.12)",
  serif: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  sans: "'DM Sans',system-ui,sans-serif",
};

type Level = "debutant" | "confirme" | "";

// ─── Données des questions situationnelles ─────────────────────────────────────
const Q1_CHOICES = [
  { id: "fatigue", label: "Une grande fatigue", hasFollowUp: true },
  { id: "inquietude", label: "Une inquiétude ou une peur", hasFollowUp: true },
  { id: "relation", label: "Une relation difficile", hasFollowUp: true },
  { id: "sens", label: "Un manque de sens", hasFollowUp: false },
  { id: "gratitude", label: "De la gratitude", hasFollowUp: false },
  { id: "rien", label: "Rien de particulier — juste être là", hasFollowUp: false },
];

const FOLLOWUP: Record<string, { question: string; choices: Array<{ id: string; label: string }> }> = {
  fatigue: {
    question: "D'où vient cette fatigue ?",
    choices: [
      { id: "travail", label: "Le travail — je donne trop" },
      { id: "famille", label: "La famille — je porte les autres" },
      { id: "perte", label: "Une perte, un deuil" },
      { id: "vie", label: "La vie en général — je ne sais plus" },
    ],
  },
  inquietude: {
    question: "De quoi as-tu peur ?",
    choices: [
      { id: "avenir", label: "De l'avenir — ce que je ne contrôle pas" },
      { id: "maladie", label: "La maladie — pour moi ou un proche" },
      { id: "chemin", label: "De me tromper de chemin" },
      { id: "seul", label: "De rester seul" },
    ],
  },
  relation: {
    question: "Avec qui ?",
    choices: [
      { id: "proche", label: "Un proche — famille ou ami" },
      { id: "travail_rel", label: "Au travail" },
      { id: "moi", label: "Avec moi-même" },
      { id: "dieu", label: "Avec Dieu — je me sens loin de lui" },
    ],
  },
};

// ─── Construction de la prière adaptée ────────────────────────────────────────
function buildPrayer(
  q1id: string,
  q1followupId: string,
  q2id: string,
  level: Level
): string {
  // Prières situationnelles pour débutant
  const prayers: Record<string, Record<string, string>> = {
    fatigue: {
      travail: `Seigneur,\nje suis épuisé par le travail.\nJe n'ai plus rien à donner.\n\nJe m'abandonne entre tes mains.\nTu sais ce dont j'ai besoin\nmieux que je ne le sais moi-même.\n\nDonne-moi le repos que le monde ne peut pas donner.\nAmen.`,
      famille: `Seigneur,\nje porte les autres depuis si longtemps.\nJ'ai oublié de me reposer en toi.\n\nApprends-moi à donner sans me vider,\nà aimer sans m'épuiser.\nJe te confie ceux que j'aime.\nAmen.`,
      perte: `Seigneur,\nle deuil est lourd.\nJe ne comprends pas toujours ce que tu permets.\n\nMais je sais que tu n'abandonnes pas.\nTiens-moi dans ta main\ncette nuit et les suivantes.\nAmen.`,
      vie: `Seigneur,\nje suis fatigué — sans raison précise.\nJuste fatigué d'être moi, d'avancer.\n\nSois là.\nC'est tout ce que je te demande.\nJuste ta présence.\nAmen.`,
    },
    inquietude: {
      avenir: `Seigneur,\nj'ai peur de ce que je ne contrôle pas.\nL'avenir m'inquiète.\n\nTu tiens le temps entre tes mains.\nApprends-moi à vivre aujourd'hui\nsans porter demain.\nAmen.`,
      maladie: `Seigneur,\nla maladie fait peur.\nPour moi, ou pour quelqu'un que j'aime.\n\nToi qui as guéri, toi qui as souffert aussi —\nsois proche de nous.\nDonne-nous la paix au milieu de l'inquiétude.\nAmen.`,
      chemin: `Seigneur,\nje ne sais pas si je vais dans la bonne direction.\nJ'ai besoin de lumière.\n\nÉclaire mon chemin.\nPas toute la route — juste le prochain pas.\nAmen.`,
      seul: `Seigneur,\nj'ai peur d'être seul.\nD'être oublié.\n\nTu as dit que tu ne nous abandonnes jamais.\nAide-moi à croire ça\nmême quand je ne le ressens pas.\nAmen.`,
    },
    relation: {
      proche: `Seigneur,\ncette relation me pèse.\nJe ne sais plus comment aimer cette personne.\n\nApprends-moi à aimer comme tu aimes —\nsans conditions, sans épuisement.\nAide-nous à nous retrouver.\nAmen.`,
      travail_rel: `Seigneur,\nle travail est difficile à cause des autres.\nOu peut-être à cause de moi.\n\nDonne-moi la sagesse pour discerner,\nla patience pour tenir,\nla paix pour continuer.\nAmen.`,
      moi: `Seigneur,\nj'ai du mal avec moi-même.\nJe me juge, je me décourage.\n\nTu m'as créé et tu m'aimes\ntout entier, tout de suite.\nAide-moi à me voir avec tes yeux.\nAmen.`,
      dieu: `Seigneur,\nje me sens loin de toi.\nJe ne sais plus si tu es là.\n\nMais je suis là, moi.\nEt le fait que je te parle ce soir\nc'est peut-être déjà une réponse.\nAmen.`,
    },
  };

  // Prière pour pratiquant — sobre, plus intérieure
  if (level === "confirme") {
    const forWho = q2id && q2id !== "personne" ? `\nJe te confie ${q2id} dans ta miséricorde.` : "";
    if (q1id === "rien" || q1id === "gratitude") {
      return `Seigneur,\nje viens à toi dans le silence.\nPas pour demander — juste pour être.\n\nMerci pour ce que tu donnes\nsans que je le mérite.\nFais de moi ce que tu veux.${forWho}\nAmen.`;
    }
    if (q1id === "sens") {
      return `Seigneur,\ntu es la source de tout sens.\nQuand les miens s'épuisent, rappelle-moi le tien.\n\nFais que ma vie serve quelque chose\nqui dépasse ce que je vois.${forWho}\nAmen.`;
    }
    const situational = prayers[q1id]?.[q1followupId];
    if (situational) return situational.replace("Amen.", forWho ? `${forWho}\nAmen.` : "Amen.");
    return `Seigneur,\nje viens à toi avec ce que je porte.\nFais de moi ce que tu veux.${forWho}\nAmen.`;
  }

  // Débutant — utiliser les prières situationnelles
  if (q1id === "rien") {
    return `Seigneur,\nje suis là.\nC'est tout ce que j'ai à te donner ce soir.\n\nC'est peut-être suffisant.\nMerci d'être là toi aussi.\nAmen.`;
  }
  if (q1id === "gratitude") {
    return `Seigneur,\nmerci.\nJe ne sais pas toujours comment le dire,\nmais aujourd'hui je le sens.\n\nMerci pour ce que tu donnes\net pour ce que tu gardes.\nAmen.`;
  }
  if (q1id === "sens") {
    return `Seigneur,\nje cherche le sens de tout ça.\nPourquoi suis-je là, qu'est-ce que je suis censé faire ?\n\nJe n'attends pas une réponse immédiate.\nJuste être proche de toi.\nAmen.`;
  }
  const situational = prayers[q1id]?.[q1followupId];
  if (situational) {
    const forWho = q2id && q2id !== "personne" ? `\nJe prie pour ${q2id}.` : "";
    return situational.replace("Amen.", forWho ? `${forWho}\nAmen.` : "Amen.");
  }
  return `Seigneur, je suis là.\nC'est tout ce que j'ai.\nMerci de m'écouter.\nAmen.`;
}

// ─── Composant SVG croix sobre ─────────────────────────────────────────────────
function CrossSVG({ size = 28, color = "rgba(184,137,58,0.60)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="1.2" />
      <line x1="14" y1="5" x2="14" y2="23" stroke={color} strokeWidth="1.2" />
      <line x1="8" y1="11" x2="20" y2="11" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

export default function ParcoursPage() {
  const router = useRouter();

  // step : 0=niveau, 1=q1, 2=q1_followup, 3=q2, 4=croix, 5=prière, 6=marie_explication, 7=ave_maria, 8=croix_finale
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<Level>("");
  const [q1id, setQ1id] = useState("");
  const [q1followupId, setQ1followupId] = useState("");
  const [q2id, setQ2id] = useState("");
  const [prayer, setPrayer] = useState("");
  const totalSteps = 8;

  const go = useCallback((n: number) => {
    setStep(n);
    window.scrollTo(0, 0);
  }, []);

  const goBack = () => {
    if (step === 0) router.push("/dashboard/spiritual#prieres");
    else go(step - 1);
  };

  const q1Choice = Q1_CHOICES.find(c => c.id === q1id);
  const followupData = q1id ? FOLLOWUP[q1id] : null;
  const effectiveLevel = level || "debutant";

  const Q2_CHOICES = [
    { id: "proche_malade", label: "Un proche malade ou en difficulté" },
    { id: "quelqu_un_loin", label: "Quelqu'un qui est loin" },
    { id: "ma_famille", label: "Ma famille" },
    { id: "moi_meme", label: "Moi-même" },
    { id: "personne", label: "Personne en particulier" },
  ];

  const handleQ1 = (id: string) => {
    setQ1id(id);
    const choice = Q1_CHOICES.find(c => c.id === id);
    if (choice?.hasFollowUp && FOLLOWUP[id]) {
      go(2); // question de suivi
    } else {
      setQ1followupId("");
      go(3); // passer à Q2
    }
  };

  const handleFollowup = (id: string) => {
    setQ1followupId(id);
    go(3);
  };

  const handleQ2 = (id: string) => {
    setQ2id(id);
    go(4); // signe de croix
  };

  const handleCroixFaite = () => {
    const p = buildPrayer(q1id, q1followupId, q2id, effectiveLevel);
    setPrayer(p);
    go(5);
  };

  // Bouton stilisé sans émojis
  function LevelCard({ levelKey, title, line1, line2, onClick }: {
    levelKey: string; title: string; line1: string; line2: string; onClick: () => void;
  }) {
    return (
      <button onClick={onClick} style={{
        flex: 1, padding: "22px 14px", borderRadius: "16px",
        border: `1.5px solid ${C.ink12}`,
        background: "linear-gradient(135deg,#1A1410 0%,#2C1E08 100%)",
        cursor: "pointer", textAlign: "center", transition: "all .18s",
        fontFamily: C.sans, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
      }}>
        <CrossSVG size={28} color="rgba(196,154,60,0.55)" />
        <div>
          <p style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 400, color: "#F5EFE4", marginBottom: "4px", lineHeight: 1.2 }}>{title}</p>
          <p style={{ fontSize: "11px", fontWeight: 300, color: "rgba(245,239,228,0.50)", lineHeight: 1.5, margin: 0 }}>{line1}</p>
          {line2 && <p style={{ fontSize: "11px", fontWeight: 300, color: "rgba(245,239,228,0.40)", lineHeight: 1.5, margin: "2px 0 0" }}>{line2}</p>}
        </div>
      </button>
    );
  }

  function ChoiceBtn({ label, onClick }: { label: string; onClick: () => void }) {
    return (
      <button onClick={onClick} style={{
        padding: "13px 15px", borderRadius: "12px",
        border: `1.5px solid ${C.ink12}`, background: C.creamGold,
        fontFamily: C.serif, fontSize: "15px", fontWeight: 300,
        color: C.ink, cursor: "pointer", textAlign: "left",
        transition: "all .16s", lineHeight: 1.4, width: "100%",
      }}>
        {label}
      </button>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .fu{animation:fu .38s cubic-bezier(.16,1,.3,1) both}
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(242,235,224,0.97)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.ink12}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
        <button onClick={goBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "12px", color: C.ink50, fontFamily: C.sans, display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {step === 0 ? "Retour" : "Précédent"}
        </button>
        <span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>Commencer à prier</span>
        <div style={{ width: "60px" }} />
      </header>

      <main style={{ maxWidth: "500px", margin: "0 auto", padding: "28px 18px 60px" }}>

        {/* ── 0 : Choix niveau — sans émojis ── */}
        {step === 0 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, marginBottom: "10px" }}>
                Tu en es où<br/>avec la prière ?
              </p>
              <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink65, lineHeight: 1.65 }}>
                Pour t&apos;accompagner là où tu en es.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <LevelCard
                levelKey="debutant"
                title="Je découvre"
                line1="Je cherche à prier"
                line2="ou je ne sais pas encore comment."
                onClick={() => { setLevel("debutant"); go(1); }}
              />
              <LevelCard
                levelKey="confirme"
                title="Je prie déjà"
                line1="Et je veux aller plus loin"
                line2="dans cette rencontre avec Dieu."
                onClick={() => { setLevel("confirme"); go(1); }}
              />
            </div>
            <p style={{ fontSize: "11px", color: C.ink35, textAlign: "center", fontFamily: C.sans }}>
              Appuie sur une carte pour commencer
            </p>
          </div>
        )}

        {/* ── 1 : Q1 — Ce que tu portes ── */}
        {step === 1 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, textAlign: "center" }}>Ce que tu portes</p>
            <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              Qu&apos;est-ce que tu portes<br/>en ce moment ?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {Q1_CHOICES.map(c => (
                <ChoiceBtn key={c.id} label={c.label} onClick={() => handleQ1(c.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── 2 : Question de suivi situationnelle ── */}
        {step === 2 && followupData && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              {followupData.question}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {followupData.choices.map(c => (
                <ChoiceBtn key={c.id} label={c.label} onClick={() => handleFollowup(c.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── 3 : Pour qui prier ── */}
        {step === 3 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, textAlign: "center" }}>Intention</p>
            <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              Y a-t-il quelqu&apos;un<br/>pour qui tu veux prier ?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {Q2_CHOICES.map(c => (
                <ChoiceBtn key={c.id} label={c.label} onClick={() => handleQ2(c.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── 4 : Signe de croix ── */}
        {step === 4 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {effectiveLevel === "debutant" ? (
              <>
                <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>Le signe de croix.</p>
                <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, textAlign: "center" }}>
                  C&apos;est la façon dont les chrétiens entrent<br/>dans la prière depuis deux mille ans.
                </p>
                <div style={{ background: "linear-gradient(135deg,rgba(196,154,60,0.08),rgba(196,154,60,0.04))", borderRadius: "14px", border: "1.5px solid rgba(196,154,60,0.28)", padding: "20px", textAlign: "center" }}>
                  <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, fontStyle: "italic", color: C.ink, marginBottom: "14px", lineHeight: 1.55 }}>
                    Pose ta main droite sur ton front,<br/>puis ta poitrine, puis ton épaule gauche,<br/>puis ton épaule droite.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "5px", flexWrap: "wrap" as const, marginBottom: "16px" }}>
                    {["Front", "→", "Poitrine", "→", "Épaule G", "→", "Épaule D"].map((s, i) => (
                      <span key={i} style={{ background: s === "→" ? "transparent" : C.card, border: s === "→" ? "none" : "1px solid rgba(196,154,60,0.22)", borderRadius: "7px", padding: s === "→" ? "0 2px" : "5px 9px", fontSize: "10px", fontWeight: 500, color: s === "→" ? C.ink35 : "#8A6520", fontFamily: C.sans }}>{s}</span>
                    ))}
                  </div>
                  <p style={{ fontFamily: C.serif, fontSize: "19px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.70, margin: 0 }}>
                    Au nom du Père,<br/>et du Fils,<br/>et du Saint-Esprit.<br/>Amen.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>Commence par<br/>un signe de croix.</p>
                <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "24px", textAlign: "center" }}>
                  <p style={{ fontFamily: C.serif, fontSize: "20px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.75, margin: 0 }}>
                    Au nom du Père,<br/>et du Fils,<br/>et du Saint-Esprit.<br/>Amen.
                  </p>
                </div>
              </>
            )}
            <button onClick={handleCroixFaite} style={{ width: "100%", padding: "14px", background: "#C49A3C", border: "none", borderRadius: "14px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
              C&apos;est fait →
            </button>
          </div>
        )}

        {/* ── 5 : Prière personnalisée ── */}
        {step === 5 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>Dis-lui ça.</p>
            <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "22px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.72, textAlign: "center", whiteSpace: "pre-line", margin: 0 }}>
                {prayer}
              </p>
            </div>
            <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink50, textAlign: "center", lineHeight: 1.6 }}>
              Ce n&apos;est pas éloquent. Ce n&apos;est pas nécessaire.<br/>Dieu écoute ce qu&apos;on lui donne.
            </p>
            <button onClick={() => go(effectiveLevel === "debutant" ? 6 : 7)} style={{ width: "100%", padding: "14px", background: "#C49A3C", border: "none", borderRadius: "14px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
              Je l&apos;ai dit →
            </button>
          </div>
        )}

        {/* ── 6 : Explication Marie (débutant uniquement) ── */}
        {step === 6 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>Qui est Marie ?</p>
            <div style={{ background: C.creamGold, borderRadius: "14px", border: "1.5px solid rgba(196,154,60,0.28)", padding: "20px 18px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, color: C.ink, lineHeight: 1.70, margin: 0 }}>
                Marie est la mère de Jésus. Dans la tradition catholique, on lui confie ses prières comme à une mère — elle les porte jusqu'à son Fils.
              </p>
            </div>
            <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "16px 18px" }}>
              <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "8px" }}>Ce que ça veut dire</p>
              <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, margin: 0 }}>
                Ce n&apos;est pas adorer Marie — c&apos;est lui demander d&apos;intercéder, comme on demanderait à un ami proche de prier pour soi. L&apos;objectif reste toujours Dieu.
              </p>
            </div>
            <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, fontStyle: "italic", color: C.ink50, textAlign: "center", lineHeight: 1.6 }}>
              On va maintenant lui confier ce que tu viens de dire à Dieu.
            </p>
            <button onClick={() => go(7)} style={{ width: "100%", padding: "14px", background: "#C49A3C", border: "none", borderRadius: "14px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
              Je suis prêt →
            </button>
          </div>
        )}

        {/* ── 7 : Je vous salue Marie ── */}
        {step === 7 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              Confie tout ça à Marie.
            </p>
            <div style={{ background: "#FAF5EC", borderRadius: "14px", border: "1.5px solid rgba(184,137,58,0.28)", padding: "20px" }}>
              <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "12px" }}>Je vous salue Marie</p>
              <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: "rgba(17,16,9,0.82)", lineHeight: 1.72, whiteSpace: "pre-line", margin: 0 }}>
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
            <button onClick={() => go(8)} style={{ width: "100%", padding: "14px", background: "#C49A3C", border: "none", borderRadius: "14px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
              C&apos;est dit → Suivant
            </button>
          </div>
        )}

        {/* ── 8 : Signe de croix final ── */}
        {step === 8 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>Pour terminer.</p>
            <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, textAlign: "center" }}>
              Un dernier signe de croix pour clore cette prière.
            </p>
            <div style={{ background: "#F5EDE0", borderRadius: "14px", border: "1px solid rgba(196,154,60,0.22)", padding: "20px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "10px" }}>Signe de croix</p>
              <p style={{ fontFamily: C.serif, fontSize: "19px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.70, margin: 0 }}>
                Au nom du Père,<br/>et du Fils,<br/>et du Saint-Esprit.<br/>Amen.
              </p>
            </div>
            {/* Retour sur Prières — pas Du jour */}
            <button onClick={() => router.push("/dashboard/spiritual#prieres")} style={{ width: "100%", padding: "14px", background: "#1A1410", border: "none", borderRadius: "14px", color: "#F5EFE4", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
              C&apos;est fait. Terminer →
            </button>
          </div>
        )}

        {/* Dots de progression */}
        {step > 0 && (
          <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "28px" }}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} style={{ width: i < step ? "14px" : "7px", height: "7px", borderRadius: "99px", background: i < step ? "#C49A3C" : "rgba(17,16,9,0.15)", transition: "all .3s" }} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
