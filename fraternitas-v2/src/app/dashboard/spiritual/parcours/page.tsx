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

type Level = "debutant" | "confirme";

// ─── Données des questions ────────────────────────────────────────────────────

const Q1_CHOICES = [
  { id: "fatigue",    label: "Une grande fatigue",            hasFollowUp: true },
  { id: "inquietude", label: "Une inquiétude, une peur",       hasFollowUp: true },
  { id: "relation",   label: "Une relation difficile",          hasFollowUp: true },
  { id: "sens",       label: "Un manque de sens",               hasFollowUp: true },
  { id: "gratitude",  label: "De la gratitude",                 hasFollowUp: true },
  { id: "rien",       label: "Rien de particulier — juste être là", hasFollowUp: false },
];

const FOLLOWUPS: Record<string, { question: string; choices: Array<{ id: string; label: string }> }> = {
  fatigue: {
    question: "D'où vient cette fatigue ?",
    choices: [
      { id: "travail",  label: "Le travail — je donne trop de moi" },
      { id: "famille",  label: "La famille — je porte les autres" },
      { id: "perte",    label: "Un deuil, une perte" },
      { id: "global",   label: "La vie en général — je ne sais plus" },
    ],
  },
  inquietude: {
    question: "De quoi as-tu peur ?",
    choices: [
      { id: "avenir",  label: "De l'avenir, de ce que je ne contrôle pas" },
      { id: "maladie", label: "La maladie — pour moi ou un proche" },
      { id: "chemin",  label: "De me tromper de chemin" },
      { id: "seul",    label: "De rester seul" },
    ],
  },
  relation: {
    question: "Avec qui c'est difficile ?",
    choices: [
      { id: "proche",   label: "Un proche — famille ou ami" },
      { id: "travail",  label: "Quelqu'un au travail" },
      { id: "moi",      label: "Avec moi-même" },
      { id: "dieu",     label: "Avec Dieu — je me sens loin" },
    ],
  },
  sens: {
    question: "Dans quel domaine surtout ?",
    choices: [
      { id: "travail",   label: "Mon travail — je ne sais plus pourquoi" },
      { id: "foi",       label: "Ma foi — je doute, je cherche" },
      { id: "relations", label: "Mes relations — je me sens seul" },
      { id: "global",    label: "Ma vie en général" },
    ],
  },
  gratitude: {
    question: "Pour quoi es-tu reconnaissant ?",
    choices: [
      { id: "personne",    label: "Une personne dans ma vie" },
      { id: "evenement",   label: "Quelque chose qui s'est bien passé" },
      { id: "sante",       label: "Ma santé, ma vie" },
      { id: "dieu_direct", label: "Dieu lui-même — je veux juste le remercier" },
    ],
  },
};

const Q2_CHOICES = [
  { id: "proche_malade", label: "Un proche malade ou en difficulté" },
  { id: "quelqu_un_loin", label: "Quelqu'un qui est loin" },
  { id: "famille",       label: "Ma famille" },
  { id: "moi_meme",      label: "Moi-même" },
  { id: "personne",      label: "Personne en particulier" },
];

// ─── Génération de prière ─────────────────────────────────────────────────────
// Toujours personnalisée selon Q1 + Q1b + Q2, pour les deux niveaux.
// La différence débutant/pratiquant est dans le TON et les EXPLICATIONS,
// pas dans la qualité de personnalisation.

function buildPrayer(
  q1id: string, q1bId: string, q2id: string, level: Level
): { title: string; text: string } {

  const forWho = q2id && q2id !== "personne"
    ? q2id === "moi_meme" ? "\nJe prie aussi pour moi."
    : q2id === "famille" ? "\nJe te confie ma famille."
    : q2id === "quelqu_un_loin" ? "\nJe prie pour quelqu'un qui est loin de moi ce soir."
    : "\nJe te confie ce proche dans ta miséricorde."
    : "";

  // ── Prières selon la situation ─────────────────────────────────────────────
  const prayers: Record<string, Record<string, { title: string; debutant: string; confirme: string }>> = {
    fatigue: {
      travail: {
        title: "Une prière pour la fatigue au travail",
        debutant: `Seigneur,\nje suis épuisé.\nLe travail prend tout — et il ne reste plus rien.\n\nJe ne sais pas comment tu vas m'aider.\nMais je crois que tu vois ce que je vis.\nTiens-moi.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntu as dit que ton joug est doux et ton fardeau léger.\nAujourd'hui ce n'est pas ce que je ressens.\n\nJe m'abandonne à toi.\nApprends-moi à travailler sans me consumer,\nà donner sans me vider.${forWho}\n\nFais de moi ce que tu veux.\nAmen.`,
      },
      famille: {
        title: "Une prière pour celui qui porte les autres",
        debutant: `Seigneur,\nje porte tellement.\nLes autres, leurs soucis, leurs peines.\nEt parfois il ne reste plus rien pour moi.\n\nJe te donne cette fatigue.\nC'est tout ce que j'ai ce soir.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntu connais la fatigue de ceux qui aiment.\nMarie elle-même a porté ce qu'elle ne comprenait pas.\n\nApprends-moi à aimer sans m'épuiser,\nà être présent sans me perdre.\nToi seul peux tenir ce que je ne peux plus tenir.${forWho}\n\nAmen.`,
      },
      perte: {
        title: "Une prière dans le deuil",
        debutant: `Seigneur,\nj'ai perdu quelqu'un.\nOu quelque chose.\nEt ça pèse encore.\n\nJe ne comprends pas toujours.\nMais je suis là, devant toi.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntu connais la mort de l'intérieur.\nTu as pleuré Lazare.\nTu n'es pas étranger au deuil.\n\nReste proche de moi dans cette obscurité.\nJe te confie ce que j'ai perdu.${forWho}\n\nAmen.`,
      },
      global: {
        title: "Une prière dans la fatigue profonde",
        debutant: `Seigneur,\nje suis fatigué — sans vraiment savoir pourquoi.\nJuste fatigué d'avancer.\n\nSois là.\nC'est tout ce que je te demande.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\nil y a une fatigue qui vient du fond,\ncelle que le sommeil ne guérit pas.\n\nTu as dit : « Venez à moi, vous qui êtes fatigués. »\nMe voici.\nJe viens.${forWho}\n\nAmen.`,
      },
    },
    inquietude: {
      avenir: {
        title: "Une prière face à l'avenir",
        debutant: `Seigneur,\nj'ai peur de demain.\nDe ce que je ne contrôle pas.\n\nJe ne sais pas comment faire confiance.\nMais j'essaie.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntu tiens le temps entre tes mains.\nL'avenir n'est pas une surprise pour toi.\n\nApprends-moi à vivre aujourd'hui\nsans porter demain.\n« Chaque jour a sa peine. » — Tu l'as dit toi-même.${forWho}\n\nAmen.`,
      },
      maladie: {
        title: "Une prière face à la maladie",
        debutant: `Seigneur,\nla maladie fait peur.\nPour moi, ou pour quelqu'un que j'aime.\n\nJe ne sais quoi te demander d'autre que : sois là.\nSois proche.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntu as guéri les malades.\nTu n'es pas indifférent à la souffrance du corps.\n\nDonne-nous la paix dans l'incertitude.\nEt si la guérison tarde, donne la force de traverser.${forWho}\n\nAmen.`,
      },
      chemin: {
        title: "Une prière avant un choix",
        debutant: `Seigneur,\nje ne sais pas si je vais dans la bonne direction.\nJ'ai besoin de lumière.\n\nPas toute la route — juste le prochain pas.${forWho}\n\nAmen.`,
        confirme: `Viens, Esprit Saint.\nÉclaire mon intelligence et mon cœur.\n\nTu connais mes désirs mieux que moi.\nAligne ma volonté sur la tienne.${forWho}\n\nAmen.`,
      },
      seul: {
        title: "Une prière contre la solitude",
        debutant: `Seigneur,\nj'ai peur d'être seul.\nD'être oublié.\n\nTu as dit que tu ne nous abandonnes jamais.\nAide-moi à y croire ce soir.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntu as choisi des amis, pas des serviteurs.\nTu m'appelles par mon nom.\n\nDans ce sentiment de solitude,\nrappelle-moi que tu es là —\nmême quand je ne le ressens pas.${forWho}\n\nAmen.`,
      },
    },
    relation: {
      proche: {
        title: "Une prière pour une relation difficile",
        debutant: `Seigneur,\ncette relation me pèse.\nJe ne sais plus comment aimer cette personne.\n\nAide-moi à ne pas abandonner.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntu as aimé ceux qui te trahissaient.\nApprends-moi à aimer sans conditions,\nsans calcul, sans attente.\n\nGuéris ce qui est blessé entre nous.${forWho}\n\nAmen.`,
      },
      travail: {
        title: "Une prière pour la paix au travail",
        debutant: `Seigneur,\nc'est difficile au travail en ce moment.\nLes relations sont tendues.\n\nDonne-moi la sagesse de bien agir.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ndonne-moi la sagesse pour discerner,\nla patience pour tenir,\nla paix pour continuer à avancer malgré tout.${forWho}\n\nAmen.`,
      },
      moi: {
        title: "Une prière pour la paix intérieure",
        debutant: `Seigneur,\nj'ai du mal avec moi-même.\nJe me juge, je me décourage.\n\nTu m'aimes tel que je suis.\nAide-moi à me voir avec tes yeux.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntu m'as créé et tu m'aimes — tout entier, tout de suite.\nPas la version améliorée que je voudrais être.\nMoi. Maintenant.\n\nApprends-moi cette vérité jusqu'au fond.${forWho}\n\nAmen.`,
      },
      dieu: {
        title: "Une prière pour celui qui se sent loin",
        debutant: `Seigneur,\nje me sens loin de toi.\nJe ne sais plus si tu es là.\n\nMais je suis là, moi.\nEt le fait que je te parle ce soir — c'est peut-être déjà une réponse.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\nles saints ont connu cette nuit aussi.\nThérèse de Lisieux, mère Teresa — ils ont douté.\nEt ils ont continué.\n\nJe choisis de venir à toi\nmême quand je ne te sens pas.${forWho}\n\nAmen.`,
      },
    },
    sens: {
      travail: {
        title: "Une prière pour trouver le sens au travail",
        debutant: `Seigneur,\nje ne sais plus pourquoi je fais ce que je fais.\nLe travail me vide sans me nourrir.\n\nDonne-moi de voir ce que tu vois dans tout ça.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntu as travaillé de tes mains à Nazareth.\nAucun travail honnête n'est indigne de toi.\n\nAide-moi à trouver en quoi mon travail te sert,\nmême dans les tâches les plus ordinaires.${forWho}\n\nAmen.`,
      },
      foi: {
        title: "Une prière pour celui qui cherche",
        debutant: `Seigneur,\nje doute.\nJe ne suis pas sûr de croire vraiment.\n\nMais si tu es là, j'ai besoin que tu me le montres.\nÀ mon rythme.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntu as dit : « Cherchez et vous trouverez. »\nJe cherche.\nParfois en aveugle, parfois avec colère.\n\nTu connais mes doutes. Reste avec moi malgré eux.${forWho}\n\nAmen.`,
      },
      relations: {
        title: "Une prière dans la solitude",
        debutant: `Seigneur,\nje me sens seul.\nPas entouré des bonnes personnes, ou pas entouré du tout.\n\nAide-moi à trouver ma place.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntu as voulu que l'homme ne soit pas seul.\nTu connais ce besoin de l'intérieur.\n\nEnvoie sur ma route ceux dont j'ai besoin.${forWho}\n\nAmen.`,
      },
      global: {
        title: "Une prière pour retrouver le cap",
        debutant: `Seigneur,\nje cherche.\nJe ne sais pas vraiment ce que je veux ni où je vais.\n\nGuide mes pas.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntu es le chemin, la vérité et la vie.\nQuand je perds le sens, je reviens à cette phrase.\n\nSois mon nord quand tout le reste vacille.${forWho}\n\nAmen.`,
      },
    },
    gratitude: {
      personne: {
        title: "Une prière de gratitude pour quelqu'un",
        debutant: `Seigneur,\nmerci pour cette personne dans ma vie.\nJe ne sais pas toujours comment le dire,\nmais ce soir je voulais te le dire à toi.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntoute grâce vient d'en haut.\nCette personne — tu me l'as donnée.\n\nMerci. Protège-la.\nEt aide-moi à lui montrer ce que je ressens.${forWho}\n\nAmen.`,
      },
      evenement: {
        title: "Une prière d'action de grâces",
        debutant: `Seigneur,\nmerci pour ce qui s'est passé.\nJe ne veux pas laisser ça s'oublier.\nJe voulais te le dire.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\ntu n'es pas seulement le Dieu des tempêtes.\nTu es aussi le Dieu des jours ordinaires qui se passent bien.\n\nMerci pour cette grâce. Je n'y avais pas droit.${forWho}\n\nAmen.`,
      },
      sante: {
        title: "Une prière pour la vie reçue",
        debutant: `Seigneur,\nmerci pour la vie.\nPour ma santé, pour ce que j'ai.\nJe l'oublie trop souvent.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\nje ne suis pas l'auteur de ma vie.\nJe l'ai reçue, chaque jour, sans le mériter.\n\nQue cette gratitude change la façon dont je vois les choses.${forWho}\n\nAmen.`,
      },
      dieu_direct: {
        title: "Une prière de pur remerciement",
        debutant: `Seigneur,\nmerci.\nC'est tout ce que je voulais dire ce soir.\nJuste : merci.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\nle Magnificat de Marie commence par là :\n« Mon âme exalte le Seigneur. »\n\nJe veux que ce soit ma prière aussi ce soir.\nMerci pour ce que tu es.${forWho}\n\nAmen.`,
      },
    },
    rien: {
      "": {
        title: "Une prière pour être simplement là",
        debutant: `Seigneur,\nje suis là.\nSans raison particulière, sans grande demande.\nJuste là.\n\nC'est peut-être déjà une prière.${forWho}\n\nAmen.`,
        confirme: `Seigneur,\nla contemplation commence dans le silence.\nPas besoin de beaucoup de mots.\n\nJe suis là. Tu es là.\nC'est suffisant.${forWho}\n\nAmen.`,
      },
    },
  };

  const situation = prayers[q1id];
  if (!situation) {
    return {
      title: "Une prière pour ce soir",
      text: `Seigneur,\nje viens à toi tel que je suis.\n${forWho}\nAmen.`,
    };
  }

  const variant = situation[q1bId] || situation[""] || Object.values(situation)[0];
  return {
    title: variant.title,
    text: level === "confirme" ? variant.confirme : variant.debutant,
  };
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function ParcoursPage() {
  const router = useRouter();

  // Steps :
  // 0 = choix niveau
  // 1 = Q1 (comment tu te sens)
  // 2 = Q1b (question de suivi — seulement si hasFollowUp)
  // 3 = Q2 (pour qui prier)
  // 4 = signe de croix
  // 5 = Notre Père
  // 6 = prière personnalisée
  // 7 = explication Marie (débutant seulement)
  // 8 = Je vous salue Marie
  // 9 = signe de croix final + conclusion
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<Level>("debutant");
  const [q1id, setQ1id] = useState("");
  const [q1bId, setQ1bId] = useState("");
  const [q2id, setQ2id] = useState("");
  const [prayerResult, setPrayerResult] = useState<{ title: string; text: string } | null>(null);
  const [levelSaved, setLevelSaved] = useState(false);

  // Mémoriser le niveau entre sessions
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fraternitas_parcours_level") as Level | null;
      if (saved) { setLevel(saved); setLevelSaved(true); }
    } catch { }
  }, []);

  const goTo = useCallback((n: number) => {
    setStep(n);
    window.scrollTo(0, 0);
  }, []);

  const goBack = () => {
    if (step === 0) router.push("/dashboard/spiritual#prieres");
    else if (step === 2) goTo(1);
    else if (step === 3) {
      const q1choice = Q1_CHOICES.find(c => c.id === q1id);
      goTo(q1choice?.hasFollowUp ? 2 : 1);
    }
    else goTo(step - 1);
  };

  const selectLevel = (lv: Level) => {
    setLevel(lv);
    try { localStorage.setItem("fraternitas_parcours_level", lv); } catch { }
    goTo(1);
  };

  const selectQ1 = (id: string) => {
    setQ1id(id);
    setQ1bId("");
    const choice = Q1_CHOICES.find(c => c.id === id);
    if (choice?.hasFollowUp && FOLLOWUPS[id]) goTo(2);
    else goTo(3);
  };

  const selectQ1b = (id: string) => {
    setQ1bId(id);
    goTo(3);
  };

  const selectQ2 = (id: string) => {
    setQ2id(id);
    goTo(4); // → signe de croix
  };

  const afterCroix = () => {
    const result = buildPrayer(q1id, q1bId, q2id, level);
    setPrayerResult(result);
    goTo(5); // → Notre Père
  };

  const followupData = q1id ? FOLLOWUPS[q1id] : null;
  const q1Label = Q1_CHOICES.find(c => c.id === q1id)?.label || "";

  // Total de steps visibles pour la barre de progression (hors step 0)
  // Débutant : 1(Q1) + éventuel(Q1b) + 1(Q2) + 1(croix) + 1(NP) + 1(prière) + 1(Marie expl) + 1(Ave) + 1(croix fin) = 8-9
  // Pratiquant : idem sans l'explication Marie = 7-8
  // On simplifie : on affiche juste un indicateur de progression fluide

  function ChoiceBtn({ label, onClick, icon }: { label: string; onClick: () => void; icon?: string }) {
    return (
      <button
        onClick={onClick}
        style={{
          padding: "13px 15px", borderRadius: "13px",
          border: `1.5px solid rgba(17,16,9,0.12)`,
          background: C.creamGold,
          fontFamily: C.serif, fontSize: "15px", fontWeight: 300,
          color: C.ink, cursor: "pointer", textAlign: "left" as const,
          transition: "all .16s", lineHeight: 1.4, width: "100%",
          display: "flex", alignItems: "center", gap: "10px",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "#EDE0C8";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(184,137,58,0.45)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = C.creamGold;
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(17,16,9,0.12)";
        }}
      >
        {icon && <span style={{ fontSize: "16px", flexShrink: 0 }}>{icon}</span>}
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

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(242,235,224,0.97)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.ink12}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
      }}>
        <button onClick={goBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "12px", color: C.ink50, fontFamily: C.sans, display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {step === 0 ? "Retour" : "Précédent"}
        </button>
        <span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>Commencer à prier</span>
        {/* Indicateur niveau */}
        {step > 0 && (
          <span style={{ fontSize: "10px", fontWeight: 500, color: C.gold, fontFamily: C.sans }}>
            {level === "confirme" ? "Pratiquant" : "Découverte"}
          </span>
        )}
      </header>

      <main style={{ maxWidth: "500px", margin: "0 auto", padding: "24px 18px 60px" }}>

        {/* ── 0 : Choix niveau ── */}
        {step === 0 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, marginBottom: "8px" }}>
                Tu en es où<br />avec la prière ?
              </p>
              <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink50, lineHeight: 1.65 }}>
                Pour t&apos;accompagner là où tu en es.
              </p>
            </div>

            {/* Cartes lisibles — fond crème, pas noir */}
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                {
                  key: "debutant" as Level,
                  title: "Je découvre",
                  line1: "Je cherche à prier",
                  line2: "ou je ne sais pas encore comment.",
                },
                {
                  key: "confirme" as Level,
                  title: "Je prie déjà",
                  line1: "Et je veux aller",
                  line2: "plus loin avec Dieu.",
                },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => selectLevel(opt.key)}
                  style={{
                    flex: 1, padding: "20px 14px", borderRadius: "16px",
                    border: levelSaved && level === opt.key
                      ? `2px solid ${C.gold}`
                      : `1.5px solid rgba(17,16,9,0.12)`,
                    background: levelSaved && level === opt.key ? C.creamGold : C.card,
                    cursor: "pointer", textAlign: "center" as const,
                    transition: "all .18s", fontFamily: C.sans,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
                  }}
                >
                  {/* Croix SVG sobre au lieu d'émojis */}
                  <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="12" stroke={C.gold} strokeWidth="1.2" />
                    <line x1="14" y1="6" x2="14" y2="22" stroke={C.gold} strokeWidth="1.2" />
                    <line x1="8" y1="12" x2="20" y2="12" stroke={C.gold} strokeWidth="1.2" />
                  </svg>
                  <div>
                    <p style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 400, color: C.ink, marginBottom: "4px", lineHeight: 1.2 }}>{opt.title}</p>
                    <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, lineHeight: 1.5, margin: 0 }}>{opt.line1}<br />{opt.line2}</p>
                  </div>
                </button>
              ))}
            </div>

            {levelSaved && (
              <p style={{ fontSize: "11px", color: C.ink35, textAlign: "center", fontFamily: C.sans }}>
                Ton niveau est mémorisé — tu peux changer à tout moment
              </p>
            )}
          </div>
        )}

        {/* ── 1 : Q1 ── */}
        {step === 1 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ textAlign: "center", marginBottom: "4px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.25 }}>
                Qu&apos;est-ce qui occupe<br />ton cœur en ce moment ?
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {Q1_CHOICES.map(c => (
                <ChoiceBtn key={c.id} label={c.label} onClick={() => selectQ1(c.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── 2 : Q1b — Question de suivi ── */}
        {step === 2 && followupData && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Rappel discret de Q1 */}
            <div style={{ background: C.cream, borderRadius: "10px", padding: "8px 12px", border: `1px solid ${C.goldBorder}` }}>
              <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, fontStyle: "italic", margin: 0, fontFamily: C.serif }}>
                {q1Label.toLowerCase()}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 300, color: C.ink, lineHeight: 1.25 }}>
                {followupData.question}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {followupData.choices.map(c => (
                <ChoiceBtn key={c.id} label={c.label} onClick={() => selectQ1b(c.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── 3 : Q2 — Pour qui ── */}
        {step === 3 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 300, color: C.ink, lineHeight: 1.25 }}>
                Y a-t-il quelqu&apos;un<br />pour qui tu veux prier ?
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {Q2_CHOICES.map(c => (
                <ChoiceBtn key={c.id} label={c.label} onClick={() => selectQ2(c.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── 4 : Signe de croix ── */}
        {step === 4 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              {level === "debutant" ? "Le signe de croix." : "Commence par un signe de croix."}
            </p>
            {level === "debutant" && (
              <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, textAlign: "center" }}>
                C&apos;est la façon dont les chrétiens entrent dans la prière depuis deux mille ans.
              </p>
            )}
            <div style={{ background: level === "debutant" ? "linear-gradient(135deg,rgba(196,154,60,0.08),rgba(196,154,60,0.04))" : C.card, borderRadius: "14px", border: `1.5px solid ${level === "debutant" ? "rgba(196,154,60,0.28)" : C.cardBorder}`, padding: "20px", textAlign: "center" }}>
              {level === "debutant" && (
                <>
                  <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, fontStyle: "italic", color: C.ink, marginBottom: "12px", lineHeight: 1.55 }}>
                    Pose ta main droite sur ton front,<br />puis ta poitrine, puis ton épaule gauche,<br />puis ton épaule droite.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "4px", flexWrap: "wrap" as const, marginBottom: "14px" }}>
                    {["Front", "→", "Poitrine", "→", "Épaule G", "→", "Épaule D"].map((s, i) => (
                      <span key={i} style={{ background: s === "→" ? "transparent" : C.card, border: s === "→" ? "none" : "1px solid rgba(196,154,60,0.22)", borderRadius: "7px", padding: s === "→" ? "0 2px" : "5px 8px", fontSize: "10px", fontWeight: 500, color: s === "→" ? C.ink35 : "#8A6520", fontFamily: C.sans }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </>
              )}
              <p style={{ fontFamily: C.serif, fontSize: level === "debutant" ? "18px" : "20px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.75, margin: 0 }}>
                Au nom du Père,<br />et du Fils,<br />et du Saint-Esprit.<br />Amen.
              </p>
            </div>
            <button onClick={afterCroix} style={{ width: "100%", padding: "13px", background: "#C49A3C", border: "none", borderRadius: "13px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
              C&apos;est fait →
            </button>
          </div>
        )}

        {/* ── 5 : Notre Père ── */}
        {step === 5 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.25, marginBottom: "6px" }}>
                Le Notre Père.
              </p>
              {level === "debutant" && (
                <p style={{ fontFamily: C.serif, fontSize: "13px", fontWeight: 300, color: C.ink50, lineHeight: 1.55 }}>
                  La seule prière que Jésus a enseignée lui-même.
                </p>
              )}
            </div>
            <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "20px 18px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.78, whiteSpace: "pre-line", margin: 0, textAlign: "center" }}>
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
            <button onClick={() => goTo(6)} style={{ width: "100%", padding: "13px", background: "#C49A3C", border: "none", borderRadius: "13px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
              Je l&apos;ai dit →
            </button>
          </div>
        )}

        {/* ── 6 : Prière personnalisée ── */}
        {step === 6 && prayerResult && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 300, color: C.ink, lineHeight: 1.25, marginBottom: "5px" }}>
                Dis-lui ça.
              </p>
              {/* Titre de la prière */}
              <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans }}>
                {prayerResult.title}
              </p>
            </div>
            <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "20px 18px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.75, textAlign: "center", whiteSpace: "pre-line", margin: 0 }}>
                {prayerResult.text}
              </p>
            </div>
            <p style={{ fontFamily: C.serif, fontSize: "13px", fontWeight: 300, color: C.ink50, textAlign: "center", lineHeight: 1.6 }}>
              Ce n&apos;est pas éloquent. Ce n&apos;est pas nécessaire.<br />Dieu écoute ce qu&apos;on lui donne.
            </p>
            {/* Partager — idée F */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ text: prayerResult.text + "\n\n— Fraternitas" });
                } else {
                  navigator.clipboard?.writeText(prayerResult.text);
                }
              }}
              style={{ background: "none", border: `1.5px solid ${C.ink12}`, borderRadius: "11px", padding: "9px 14px", fontSize: "12px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}
            >
              Envoyer cette prière à quelqu&apos;un →
            </button>
            <button onClick={() => goTo(level === "debutant" ? 7 : 8)} style={{ width: "100%", padding: "13px", background: "#C49A3C", border: "none", borderRadius: "13px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
              Je l&apos;ai dit →
            </button>
          </div>
        )}

        {/* ── 7 : Explication Marie (débutant seulement) ── */}
        {step === 7 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              Qui est Marie ?
            </p>
            <div style={{ background: C.creamGold, borderRadius: "14px", border: "1.5px solid rgba(196,154,60,0.28)", padding: "18px 16px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink, lineHeight: 1.70, margin: 0 }}>
                Marie est la mère de Jésus. Dans la tradition catholique, on lui confie ses prières comme à une mère — elle les porte jusqu&apos;à son Fils.
              </p>
            </div>
            <div style={{ background: C.card, borderRadius: "13px", border: `1.5px solid ${C.cardBorder}`, padding: "14px 16px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, margin: 0 }}>
                Ce n&apos;est pas adorer Marie — c&apos;est lui demander d&apos;intercéder, comme on demande à un ami proche de prier pour soi. L&apos;objectif reste toujours Dieu.
              </p>
            </div>
            <button onClick={() => goTo(8)} style={{ width: "100%", padding: "13px", background: "#C49A3C", border: "none", borderRadius: "13px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
              Je comprends →
            </button>
          </div>
        )}

        {/* ── 8 : Je vous salue Marie ── */}
        {step === 8 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 300, color: C.ink, lineHeight: 1.25, marginBottom: "5px" }}>
                Confie tout ça à Marie.
              </p>
              {level === "confirme" && (
                <p style={{ fontFamily: C.serif, fontSize: "13px", fontWeight: 300, color: C.ink50, lineHeight: 1.55 }}>
                  Elle porte nos prières jusqu&apos;à son Fils.
                </p>
              )}
            </div>
            <div style={{ background: "#FAF5EC", borderRadius: "14px", border: "1.5px solid rgba(184,137,58,0.28)", padding: "18px" }}>
              <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "10px" }}>Je vous salue Marie</p>
              <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, fontStyle: "italic", color: "rgba(17,16,9,0.82)", lineHeight: 1.72, whiteSpace: "pre-line", margin: 0 }}>
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
            <button onClick={() => goTo(9)} style={{ width: "100%", padding: "13px", background: "#C49A3C", border: "none", borderRadius: "13px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
              C&apos;est dit → Suivant
            </button>
          </div>
        )}

        {/* ── 9 : Signe de croix final + conclusion ── */}
        {step === 9 && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.25, textAlign: "center" }}>
              Pour clore.
            </p>
            <div style={{ background: "#F5EDE0", borderRadius: "14px", border: "1px solid rgba(196,154,60,0.22)", padding: "18px", textAlign: "center" }}>
              <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "10px" }}>Signe de croix</p>
              <p style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.75, margin: 0 }}>
                Au nom du Père,<br />et du Fils,<br />et du Saint-Esprit.<br />Amen.
              </p>
            </div>

            {/* Conclusion — idée F : proposition vers le chapelet */}
            <div style={{ background: "linear-gradient(135deg,#1A1410,#2C1E08)", borderRadius: "13px", padding: "14px 16px", border: "1.5px solid rgba(196,154,60,0.20)" }}>
              <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: "#F5EFE4", lineHeight: 1.60, marginBottom: "10px" }}>
                Tu viens de prier. C&apos;est concret. Ça compte.
              </p>
              <p style={{ fontSize: "12px", fontWeight: 300, color: "rgba(245,239,228,0.55)", fontFamily: C.sans, lineHeight: 1.5, marginBottom: "10px" }}>
                Si tu veux aller plus loin, le chapelet guidé t&apos;accompagne dans les mystères de la vie du Christ.
              </p>
              <button
                onClick={() => router.push("/dashboard/spiritual#chapelet")}
                style={{ background: "rgba(196,154,60,0.15)", border: "1px solid rgba(196,154,60,0.35)", borderRadius: "99px", padding: "6px 14px", fontSize: "12px", fontWeight: 500, color: "rgba(196,154,60,0.90)", cursor: "pointer", fontFamily: C.sans }}
              >
                Essayer le chapelet →
              </button>
            </div>

            {/* Terminer — retour Prières */}
            <button
              onClick={() => router.push("/dashboard/spiritual#prieres")}
              style={{ width: "100%", padding: "13px", background: "#1A1410", border: "none", borderRadius: "13px", color: "#F5EFE4", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}
            >
              C&apos;est fait. Terminer →
            </button>
          </div>
        )}

        {/* Barre de progression */}
        {step > 0 && step < 10 && (
          <div style={{ display: "flex", gap: "5px", justifyContent: "center", marginTop: "24px" }}>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} style={{
                width: i < step ? "14px" : "7px",
                height: "7px", borderRadius: "99px",
                background: i < step ? "#C49A3C" : "rgba(17,16,9,0.12)",
                transition: "all .3s",
              }} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
