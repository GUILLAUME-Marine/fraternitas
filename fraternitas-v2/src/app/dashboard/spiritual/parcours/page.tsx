"use client";

import { useState, useCallback, useEffect } from "react";
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

// ─── Questions ────────────────────────────────────────────────────────────────
// Labels exacts du spec — formulation directe, à la première personne
const Q1_CHOICES = [
  { id: "fatigue",    label: "Épuisé. Je n'en peux plus.",         hasFollowUp: true },
  { id: "inquietude", label: "Anxieux. J'ai peur de quelque chose.", hasFollowUp: true },
  { id: "relation",   label: "Blessé. Une relation me fait souffrir.", hasFollowUp: true },
  { id: "sens",       label: "Perdu. Je cherche quelque chose.",    hasFollowUp: true },
  { id: "gratitude",  label: "En paix. Je veux juste remercier.",   hasFollowUp: true },
  { id: "rien",       label: "Curieux. Je veux essayer.",           hasFollowUp: false },
];

const FOLLOWUPS: Record<string, { question: string; choices: Array<{ id: string; label: string }> }> = {
  fatigue: {
    question: "Qu'est-ce qui t'épuise le plus ?",
    choices: [
      { id: "travail", label: "Le travail" },
      { id: "famille", label: "La famille" },
      { id: "perte",   label: "Moi-même" },
      { id: "global",  label: "Tout à la fois" },
    ],
  },
  inquietude: {
    question: "Qu'est-ce qui t'inquiète ?",
    choices: [
      { id: "avenir",  label: "L'avenir" },
      { id: "maladie", label: "Ma santé ou celle d'un proche" },
      { id: "chemin",  label: "Une décision à prendre" },
      { id: "seul",    label: "Je ne sais pas" },
    ],
  },
  relation: {
    question: "Avec qui c'est difficile ?",
    choices: [
      { id: "proche",  label: "Un proche" },
      { id: "travail", label: "Au travail" },
      { id: "moi",     label: "Avec moi-même" },
      { id: "dieu",    label: "Avec Dieu" },
    ],
  },
  sens: {
    question: "Dans quel domaine ?",
    choices: [
      { id: "travail",   label: "Mon travail, ma vocation" },
      { id: "foi",       label: "Ma foi, mes doutes" },
      { id: "relations", label: "Mes relations" },
      { id: "global",    label: "Ma vie en général" },
    ],
  },
  gratitude: {
    question: "Pour quoi tu es reconnaissant ?",
    choices: [
      { id: "personne",    label: "Une personne" },
      { id: "evenement",   label: "Quelque chose qui s'est bien passé" },
      { id: "sante",       label: "La vie simplement" },
      { id: "dieu_direct", label: "Dieu lui-même" },
    ],
  },
};

const Q2_CHOICES = [
  { id: "proche_malade",  label: "Un proche malade ou en difficulté" },
  { id: "quelqu_un_loin", label: "Quelqu'un qui est loin" },
  { id: "famille",        label: "Ma famille" },
  { id: "moi_meme",       label: "Moi-même" },
  { id: "personne",       label: "Personne en particulier" },
];

// ─── Génération de prière personnalisée ──────────────────────────────────────
function buildPrayer(q1id: string, q1bId: string, q2id: string): { title: string; text: string } {
  const forWho = q2id && q2id !== "personne"
    ? q2id === "moi_meme" ? "\nJe prie aussi pour moi."
    : q2id === "famille"  ? "\nJe te confie ma famille."
    : q2id === "quelqu_un_loin" ? "\nJe prie pour quelqu'un qui est loin de moi."
    : "\nJe te confie ce proche dans ta miséricorde."
    : "";

  const prayers: Record<string, Record<string, { title: string; text: string }>> = {
    fatigue: {
      travail: {
        title: "Une prière pour la fatigue au travail",
        text: `Seigneur,\nje suis épuisé.\nLe travail prend tout — et il ne reste plus rien.\n\nJe ne sais pas comment tu vas m'aider.\nMais je crois que tu vois ce que je vis.\nTiens-moi.${forWho}\n\nAmen.`,
      },
      famille: {
        title: "Une prière pour celui qui porte les autres",
        text: `Seigneur,\nje porte tellement.\nLes autres, leurs soucis, leurs peines.\nEt parfois il ne reste plus rien pour moi.\n\nJe te donne cette fatigue.\nC'est tout ce que j'ai ce soir.${forWho}\n\nAmen.`,
      },
      perte: {
        title: "Une prière dans le deuil",
        text: `Seigneur,\nj'ai perdu quelqu'un. Ou quelque chose.\nEt ça pèse encore.\n\nJe ne comprends pas toujours.\nMais je suis là, devant toi.${forWho}\n\nAmen.`,
      },
      global: {
        title: "Une prière dans la fatigue profonde",
        text: `Seigneur,\nje suis fatigué — sans vraiment savoir pourquoi.\nJuste fatigué d'avancer.\n\nSois là.\nC'est tout ce que je te demande.${forWho}\n\nAmen.`,
      },
    },
    inquietude: {
      avenir: {
        title: "Une prière face à l'avenir",
        text: `Seigneur,\nj'ai peur de demain.\nDe ce que je ne contrôle pas.\n\nTu tiens le temps entre tes mains.\nApprends-moi à vivre aujourd'hui\nsans porter demain.${forWho}\n\nAmen.`,
      },
      maladie: {
        title: "Une prière face à la maladie",
        text: `Seigneur,\nla maladie fait peur.\nPour moi, ou pour quelqu'un que j'aime.\n\nSois proche.\nDonne-nous la paix dans l'incertitude.${forWho}\n\nAmen.`,
      },
      chemin: {
        title: "Une prière avant un choix",
        text: `Seigneur,\nje ne sais pas si je vais dans la bonne direction.\nJ'ai besoin de lumière.\n\nPas toute la route — juste le prochain pas.${forWho}\n\nAmen.`,
      },
      seul: {
        title: "Une prière contre la solitude",
        text: `Seigneur,\nj'ai peur d'être seul.\nD'être oublié.\n\nTu as dit que tu ne nous abandonnes jamais.\nAide-moi à y croire ce soir.${forWho}\n\nAmen.`,
      },
    },
    relation: {
      proche: {
        title: "Une prière pour une relation difficile",
        text: `Seigneur,\ncette relation me pèse.\nJe ne sais plus comment aimer cette personne.\n\nAide-moi à ne pas abandonner.${forWho}\n\nAmen.`,
      },
      travail: {
        title: "Une prière pour la paix au travail",
        text: `Seigneur,\nc'est difficile au travail en ce moment.\n\nDonne-moi la sagesse pour discerner,\nla patience pour tenir,\nla paix pour continuer.${forWho}\n\nAmen.`,
      },
      moi: {
        title: "Une prière pour la paix intérieure",
        text: `Seigneur,\nj'ai du mal avec moi-même.\nJe me juge, je me décourage.\n\nTu m'aimes tel que je suis.\nAide-moi à me voir avec tes yeux.${forWho}\n\nAmen.`,
      },
      dieu: {
        title: "Une prière pour celui qui se sent loin",
        text: `Seigneur,\nje me sens loin de toi.\nJe ne sais plus si tu es là.\n\nMais je suis là, moi.\nEt le fait que je te parle ce soir\nc'est peut-être déjà une réponse.${forWho}\n\nAmen.`,
      },
    },
    sens: {
      travail: {
        title: "Une prière pour trouver le sens au travail",
        text: `Seigneur,\nje ne sais plus pourquoi je fais ce que je fais.\nLe travail me vide sans me nourrir.\n\nDonne-moi de voir ce que tu vois dans tout ça.${forWho}\n\nAmen.`,
      },
      foi: {
        title: "Une prière pour celui qui cherche",
        text: `Seigneur,\nje doute.\nJe ne suis pas sûr de croire vraiment.\n\nMais si tu es là, j'ai besoin que tu te montres.\nÀ mon rythme.${forWho}\n\nAmen.`,
      },
      relations: {
        title: "Une prière dans la solitude",
        text: `Seigneur,\nje me sens seul.\nPas entouré des bonnes personnes, ou pas entouré du tout.\n\nAide-moi à trouver ma place.${forWho}\n\nAmen.`,
      },
      global: {
        title: "Une prière pour retrouver le cap",
        text: `Seigneur,\nje cherche.\nJe ne sais pas vraiment ce que je veux ni où je vais.\n\nGuide mes pas.${forWho}\n\nAmen.`,
      },
    },
    gratitude: {
      personne: {
        title: "Une prière de gratitude pour quelqu'un",
        text: `Seigneur,\nmerci pour cette personne dans ma vie.\nJe ne sais pas toujours comment le dire,\nmais ce soir je voulais te le dire à toi.${forWho}\n\nAmen.`,
      },
      evenement: {
        title: "Une prière d'action de grâces",
        text: `Seigneur,\nmerci pour ce qui s'est passé.\nJe ne veux pas laisser ça s'oublier.\nJe voulais te le dire.${forWho}\n\nAmen.`,
      },
      sante: {
        title: "Une prière pour la vie reçue",
        text: `Seigneur,\nmerci pour la vie.\nPour ma santé, pour ce que j'ai.\nJe l'oublie trop souvent.${forWho}\n\nAmen.`,
      },
      dieu_direct: {
        title: "Une prière de pur remerciement",
        text: `Seigneur,\nmerci.\nC'est tout ce que je voulais dire ce soir.\nJuste : merci.${forWho}\n\nAmen.`,
      },
    },
    rien: {
      "": {
        title: "Une prière pour être simplement là",
        text: `Seigneur,\nje suis là.\nSans raison particulière, sans grande demande.\nJuste là.\n\nC'est peut-être déjà une prière.${forWho}\n\nAmen.`,
      },
    },
  };

  const situation = prayers[q1id];
  if (!situation) {
    return { title: "Une prière pour ce soir", text: `Seigneur,\nje viens à toi tel que je suis.${forWho}\nAmen.` };
  }
  const variant = situation[q1bId] || situation[""] || Object.values(situation)[0];
  return variant;
}

// ─── Steps ────────────────────────────────────────────────────────────────────
// 0 = Q1 (comment tu te sens) — plus d'écran de niveau
// 1 = Q1b (suivi si hasFollowUp)
// 2 = Q2 (pour qui)
// 3 = signe de croix
// 4 = Notre Père
// 5 = prière personnalisée
// 6 = explication Marie (accordéon inline — pas une étape séparée)
// 7 = Je vous salue Marie
// 8 = conclusion (signe de croix + fin intégrés)

export default function ParcoursPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [q1id, setQ1id] = useState("");
  const [q1bId, setQ1bId] = useState("");
  const [q2id, setQ2id] = useState("");
  const [prayerResult, setPrayerResult] = useState<{ title: string; text: string } | null>(null);
  const [marieOpen, setMarieOpen] = useState(false);

  const goTo = useCallback((n: number) => {
    setStep(n); window.scrollTo(0, 0);
  }, []);

  const goBack = () => {
    if (step === 0) router.push("/dashboard/spiritual#prieres");
    else if (step === 1) goTo(0);
    else if (step === 2) {
      const q1choice = Q1_CHOICES.find(c => c.id === q1id);
      goTo(q1choice?.hasFollowUp ? 1 : 0);
    }
    else goTo(step - 1);
  };

  const selectQ1 = (id: string) => {
    setQ1id(id);
    setQ1bId("");
    const choice = Q1_CHOICES.find(c => c.id === id);
    if (choice?.hasFollowUp && FOLLOWUPS[id]) goTo(1);
    else goTo(2);
  };

  const selectQ1b = (id: string) => { setQ1bId(id); goTo(2); };
  const selectQ2  = (id: string) => { setQ2id(id); goTo(3); };

  const afterCroix = () => {
    setPrayerResult(buildPrayer(q1id, q1bId, q2id));
    goTo(4);
  };

  const followupData = q1id ? FOLLOWUPS[q1id] : null;
  const q1Label = Q1_CHOICES.find(c => c.id === q1id)?.label || "";

  // Total steps affichés = 8 (0-7)
  const totalSteps = 8;

  function ChoiceBtn({ label, onClick }: { label: string; onClick: () => void }) {
    return (
      <button onClick={onClick} style={{
        padding: "14px 16px", borderRadius: "13px",
        border: `1.5px solid rgba(17,16,9,0.12)`,
        background: C.creamGold,
        fontFamily: C.serif, fontSize: "16px", fontWeight: 300,
        color: C.ink, cursor: "pointer", textAlign: "left" as const,
        transition: "background .14s, border-color .14s",
        lineHeight: 1.4, width: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = "#EDE0C8";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(184,137,58,0.45)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = C.creamGold;
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,16,9,0.12)";
        }}
      >
        <span>{label}</span>
        <span style={{ fontSize: "16px", color: C.ink35, marginLeft: "8px" }}>›</span>
      </button>
    );
  }

  function PrimaryBtn({ label, onClick }: { label: string; onClick: () => void }) {
    return (
      <button onClick={onClick} style={{ width: "100%", padding: "14px", background: "#C49A3C", border: "none", borderRadius: "13px", color: "#1A1410", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: C.sans }}>
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
        <button onClick={goBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "13px", color: C.ink50, fontFamily: C.sans, display: "flex", alignItems: "center", gap: "5px" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {step === 0 ? "Retour" : "Précédent"}
        </button>
        <span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>Commencer à prier</span>
        <div style={{ width: "60px" }} />
      </header>

      <main style={{ maxWidth: "500px", margin: "0 auto", padding: "24px 18px 60px" }}>

        {/* ── 0 : Q1 — Qu'est-ce qui occupe ton cœur ── */}
        {step === 0 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, marginBottom: "6px" }}>
                Qu&apos;est-ce qui occupe<br />ton cœur en ce moment ?
              </p>
              <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink50, lineHeight: 1.55 }}>
                Pour t&apos;accompagner là où tu en es.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Q1_CHOICES.map(c => (
                <ChoiceBtn key={c.id} label={c.label} onClick={() => selectQ1(c.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── 1 : Q1b — Question de suivi ── */}
        {step === 1 && followupData && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Rappel Q1 */}
            <div style={{ background: C.cream, borderRadius: "10px", padding: "8px 14px", border: `1px solid ${C.goldBorder}` }}>
              <p style={{ fontSize: "12px", fontWeight: 300, color: C.ink50, fontStyle: "italic", margin: 0, fontFamily: C.serif }}>{q1Label}</p>
            </div>
            <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              {followupData.question}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {followupData.choices.map(c => (
                <ChoiceBtn key={c.id} label={c.label} onClick={() => selectQ1b(c.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── 2 : Q2 — Pour qui ── */}
        {step === 2 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              Y a-t-il quelqu&apos;un<br />pour qui tu veux prier ?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Q2_CHOICES.map(c => (
                <ChoiceBtn key={c.id} label={c.label} onClick={() => selectQ2(c.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── 3 : Signe de croix ── */}
        {step === 3 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              Le signe de croix.
            </p>
            <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, textAlign: "center" }}>
              C&apos;est la façon dont les chrétiens entrent dans la prière depuis deux mille ans.
            </p>
            <div style={{ background: "linear-gradient(135deg,rgba(196,154,60,0.08),rgba(196,154,60,0.04))", borderRadius: "14px", border: "1.5px solid rgba(196,154,60,0.28)", padding: "20px", textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, fontStyle: "italic", color: C.ink, marginBottom: "14px", lineHeight: 1.55 }}>
                Pose ta main droite sur ton front,<br />puis ta poitrine, puis ton épaule gauche,<br />puis ton épaule droite.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "4px", flexWrap: "wrap" as const, marginBottom: "16px" }}>
                {["Front", "→", "Poitrine", "→", "Épaule G", "→", "Épaule D"].map((s, i) => (
                  <span key={i} style={{ background: s === "→" ? "transparent" : C.card, border: s === "→" ? "none" : "1px solid rgba(196,154,60,0.22)", borderRadius: "7px", padding: s === "→" ? "0 3px" : "5px 10px", fontSize: "11px", fontWeight: 500, color: s === "→" ? C.ink35 : "#8A6520", fontFamily: C.sans }}>
                    {s}
                  </span>
                ))}
              </div>
              <p style={{ fontFamily: C.serif, fontSize: "20px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.75, margin: 0 }}>
                Au nom du Père,<br />et du Fils,<br />et du Saint-Esprit.<br />Amen.
              </p>
            </div>
            <PrimaryBtn label="C'est fait →" onClick={afterCroix} />
          </div>
        )}

        {/* ── 4 : Notre Père ── */}
        {step === 4 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              Le Notre Père.
            </p>
            <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink50, lineHeight: 1.55, textAlign: "center" }}>
              La seule prière que Jésus a enseignée lui-même à ses disciples.
            </p>
            <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "20px 18px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.78, whiteSpace: "pre-line", margin: 0, textAlign: "center" }}>
                {`Notre Père, qui es aux cieux,
que ton nom soit sanctifié,
que ton règne vienne,
que ta volonté soit faite
sur la terre comme au ciel.

Donne-nous aujourd'hui notre pain de ce jour.
Pardonne-nous nos offenses,
comme nous pardonnons aussi
à ceux qui nous ont offensés.

Et ne nous soumets pas à la tentation,
mais délivre-nous du mal.

Amen.`}
              </p>
            </div>
            <PrimaryBtn label="Je l'ai dit →" onClick={() => goTo(5)} />
          </div>
        )}

        {/* ── 5 : Prière personnalisée ── */}
        {step === 5 && prayerResult && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.25, marginBottom: "5px" }}>
                Dis-lui ça.
              </p>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans }}>
                {prayerResult.title}
              </p>
            </div>
            <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "22px 18px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.75, textAlign: "center", whiteSpace: "pre-line", margin: 0 }}>
                {prayerResult.text}
              </p>
            </div>
            <p style={{ fontFamily: C.serif, fontSize: "13px", fontWeight: 300, color: C.ink50, textAlign: "center", lineHeight: 1.6 }}>
              Ce n&apos;est pas éloquent. Ce n&apos;est pas nécessaire.<br />Dieu écoute ce qu&apos;on lui donne.
            </p>
            {/* Partager */}
            <button
              onClick={() => {
                if (navigator.share) navigator.share({ text: prayerResult.text + "\n\n— Fraternitas" });
                else if (navigator.clipboard) navigator.clipboard.writeText(prayerResult.text);
              }}
              style={{ background: "none", border: `1.5px solid ${C.ink12}`, borderRadius: "11px", padding: "10px 14px", fontSize: "13px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}
            >
              Envoyer cette prière à quelqu&apos;un →
            </button>
            <PrimaryBtn label="Je l'ai dit →" onClick={() => goTo(6)} />
          </div>
        )}

        {/* ── 6 : Je vous salue Marie — avec explication inline accordéon ── */}
        {step === 6 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              Confie tout ça à Marie.
            </p>

            {/* Explication Marie — accordéon discret */}
            <button
              onClick={() => setMarieOpen(v => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: "0", fontFamily: C.sans, fontSize: "12px", fontWeight: 500, color: C.gold }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ transform: marieOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }}>
                <path d="M6 4l4 4-4 4" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {marieOpen ? "Masquer l'explication" : "Qui est Marie ? En savoir plus"}
            </button>

            {marieOpen && (
              <div style={{ background: C.creamGold, borderRadius: "12px", border: "1.5px solid rgba(196,154,60,0.28)", padding: "14px 16px" }}>
                <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink, lineHeight: 1.68, margin: 0 }}>
                  Marie est la mère de Jésus. Dans la tradition catholique, on lui confie ses prières comme à une mère — elle les porte jusqu&apos;à son Fils. Ce n&apos;est pas l&apos;adorer : c&apos;est lui demander d&apos;intercéder, comme on demanderait à un ami proche de prier pour soi.
                </p>
              </div>
            )}

            <div style={{ background: "#FAF5EC", borderRadius: "14px", border: "1.5px solid rgba(184,137,58,0.28)", padding: "20px 18px" }}>
              <p style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "12px" }}>Je vous salue Marie</p>
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
            <PrimaryBtn label="C'est dit →" onClick={() => goTo(7)} />
          </div>
        )}

        {/* ── 7 : Conclusion — signe de croix intégré + boutons hiérarchisés ── */}
        {step === 7 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Signe de croix final — intégré dans la conclusion, pas une étape séparée */}
            <div style={{ background: "#F5EDE0", borderRadius: "14px", border: "1px solid rgba(196,154,60,0.22)", padding: "18px", textAlign: "center" }}>
              <p style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "10px" }}>Pour clore — signe de croix</p>
              <p style={{ fontFamily: C.serif, fontSize: "19px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.75, margin: 0 }}>
                Au nom du Père,<br />et du Fils,<br />et du Saint-Esprit.<br />Amen.
              </p>
            </div>

            {/* Message d'encouragement */}
            <div style={{ background: "linear-gradient(135deg,#1A1410,#2C1E08)", borderRadius: "13px", padding: "16px 18px", border: "1.5px solid rgba(196,154,60,0.20)" }}>
              <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, color: "#F5EFE4", lineHeight: 1.60, marginBottom: "8px" }}>
                Tu viens de prier.<br />C&apos;est concret. Ça compte.
              </p>
              <p style={{ fontSize: "13px", fontWeight: 300, color: "rgba(245,239,228,0.55)", fontFamily: C.sans, lineHeight: 1.5 }}>
                Si tu veux aller plus loin, le chapelet t&apos;accompagne dans les mystères du Christ.
              </p>
            </div>

            {/* BOUTON PRINCIPAL — doré, bien visible */}
            <button
              onClick={() => router.push("/dashboard/spiritual#prieres")}
              style={{ width: "100%", padding: "15px", background: "#C49A3C", border: "none", borderRadius: "13px", color: "#1A1410", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: C.sans }}
            >
              C&apos;est fait. Terminer →
            </button>

            {/* Lien secondaire — chapelet — discret sous le bouton */}
            <button
              onClick={() => router.push("/dashboard/spiritual#chapelet")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: C.gold, fontFamily: C.sans, padding: "4px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
            >
              Essayer le chapelet
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Barre de progression — dots */}
        <div style={{ display: "flex", gap: "5px", justifyContent: "center", marginTop: "28px" }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} style={{
              width: i < step ? "16px" : "7px",
              height: "7px", borderRadius: "99px",
              background: i < step ? "#C49A3C" : "rgba(17,16,9,0.12)",
              transition: "all .3s",
            }} />
          ))}
        </div>
      </main>
    </div>
  );
}
