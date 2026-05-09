"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
type MysteryType = "joyeux" | "lumineux" | "douloureux" | "glorieux";
type Phase = "select" | "sound" | "intention" | "praying" | "mystery-detail" | "complete";

interface RosaryProgress {
  mysteryType: MysteryType;
  decadeIndex: number;   // 0–4
  grainIndex: number;    // -1=Notre Père, 0–9=Ave Maria, 10=Gloria+Fatima, 11=fin
  soundMode: SoundMode;
  intention: string;
  startedAt: string;
}

type SoundMode = "silence" | "gregorian" | "ave-maria" | "communal";

// ─── Design tokens ────────────────────────────────────────────────────────────
// Fond principal  : #F5EFE4 (crème chaud)
// Fond card       : #FFFFFF
// Fond crème doré : #EDE6D8
// Fond crème OR   : #FBF7F0
// Or accent       : #C49A3C
// Encre           : #111009

const T = {
  bg: "#F5EFE4",
  bgCard: "#FFFFFF",
  bgCream: "#EDE6D8",
  bgCreemGold: "#FBF7F0",
  gold: "#C49A3C",
  goldLight: "rgba(196,154,60,0.15)",
  goldBorder: "rgba(196,154,60,0.3)",
  ink: "#111009",
  ink60: "rgba(17,16,9,0.60)",
  ink45: "rgba(17,16,9,0.45)",
  ink35: "rgba(17,16,9,0.35)",
  ink15: "rgba(17,16,9,0.15)",
  ink08: "rgba(17,16,9,0.08)",
  serif: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  sans: "'DM Sans',system-ui,sans-serif",
};

// ─── Mystères ─────────────────────────────────────────────────────────────────
const MYSTERIES: Record<MysteryType, {
  label: string; days: string; color: string;
  items: Array<{ title: string; reference: string; verse: string; meditation: string; question: string }>;
}> = {
  joyeux: {
    label: "Mystères Joyeux", days: "Lundi · Samedi", color: "#B8973A",
    items: [
      { title: "L'Annonciation", reference: "Lc 1, 26-38", verse: "L'ange Gabriel dit à Marie : « Réjouis-toi, comblée de grâce, le Seigneur est avec toi. »", meditation: "Marie dit oui sans tout comprendre. La foi n'est pas la certitude — c'est la confiance dans Celui qui appelle.", question: "À quoi Dieu vous invite-t-il en ce moment, même sans tout voir clairement ?" },
      { title: "La Visitation", reference: "Lc 1, 39-56", verse: "Dès qu'Élisabeth entendit la salutation de Marie, l'enfant tressaillit en elle. Et elle fut remplie de l'Esprit Saint.", meditation: "La joie de Marie devient joie pour les autres. La présence de Dieu en nous réjouit ceux que nous approchons.", question: "Qui dans votre entourage a besoin que vous lui apportiez de la joie cette semaine ?" },
      { title: "La Nativité", reference: "Lc 2, 1-20", verse: "Elle enfanta son fils premier-né, l'emmaillota et le coucha dans une mangeoire, parce qu'il n'y avait pas de place pour eux dans la salle commune.", meditation: "Dieu choisit la pauvreté, le silence, la nuit. Ce que le monde ignore, Dieu l'habite.", question: "Quelle pauvreté ou fragilité dans votre vie est peut-être un lieu où Dieu est déjà présent ?" },
      { title: "La Présentation au Temple", reference: "Lc 2, 22-40", verse: "Siméon prit l'enfant dans ses bras et bénit Dieu en disant : « Mes yeux ont vu ton salut. »", meditation: "Siméon a attendu toute sa vie pour ce moment. Certaines promesses de Dieu demandent du temps — et de la fidélité.", question: "Quelle promesse de Dieu attendez-vous encore en ce moment ?" },
      { title: "Le Recouvrement au Temple", reference: "Lc 2, 41-52", verse: "Il leur dit : « Pourquoi me cherchiez-vous ? Ne saviez-vous pas qu'il me faut être chez mon Père ? »", meditation: "Jésus grandissait en sagesse et en grâce. La foi aussi grandit — dans les questions, les cherchements, les silences.", question: "Où cherchez-vous Jésus en ce moment dans votre vie ?" },
    ],
  },
  lumineux: {
    label: "Mystères Lumineux", days: "Jeudi", color: "#4A7C59",
    items: [
      { title: "Le Baptême de Jésus", reference: "Mt 3, 13-17", verse: "Une voix venant des cieux disait : « Celui-ci est mon Fils bien-aimé, en qui je trouve ma joie. »", meditation: "Avant toute mission, Dieu dit à Jésus qu'il est aimé. Nous aussi, avant toute action, nous sommes aimés.", question: "Croyez-vous vraiment que vous êtes aimé de Dieu tel que vous êtes, maintenant ?" },
      { title: "Les Noces de Cana", reference: "Jn 2, 1-11", verse: "Jésus leur dit : « Remplissez d'eau ces jarres. » Ils les remplirent jusqu'au bord. Et l'eau était devenue du vin.", meditation: "Marie remarque le manque et intercède. Jésus transforme l'ordinaire en extraordinaire. La grâce travaille dans les détails.", question: "Quel manque dans votre vie pourriez-vous confier à Marie aujourd'hui ?" },
      { title: "L'Annonce du Royaume", reference: "Mc 1, 14-15", verse: "Jésus proclamait la Bonne Nouvelle de Dieu : « Les temps sont accomplis, le Règne de Dieu est tout proche. Convertissez-vous et croyez à la Bonne Nouvelle. »", meditation: "Le Royaume n'est pas un lieu futur — il est déjà là, caché dans le réel. La conversion, c'est apprendre à le voir.", question: "Où avez-vous entrevu le Royaume de Dieu cette semaine ?" },
      { title: "La Transfiguration", reference: "Mt 17, 1-8", verse: "Il fut transfiguré devant eux : son visage resplendit comme le soleil, ses vêtements devinrent blancs comme la lumière.", meditation: "Sur le Thabor, la gloire divine transparaît à travers l'humanité de Jésus. Un avant-goût de ce que nous sommes appelés à devenir.", question: "Quelle lumière avez-vous reçue ou donnée ces derniers jours ?" },
      { title: "L'Institution de l'Eucharistie", reference: "Lc 22, 14-20", verse: "Il prit du pain, le rompit et le leur donna en disant : « Ceci est mon corps, donné pour vous. Faites cela en mémoire de moi. »", meditation: "Jésus se donne entièrement. L'Eucharistie n'est pas un rite — c'est une présence réelle, offerte à chaque messe.", question: "Comment votre participation à la messe peut-elle devenir plus consciente et vivante ?" },
    ],
  },
  douloureux: {
    label: "Mystères Douloureux", days: "Mardi · Vendredi", color: "#7A4A4A",
    items: [
      { title: "L'Agonie à Gethsémani", reference: "Lc 22, 39-46", verse: "Il se prosterna et pria : « Père, si tu veux, éloigne de moi cette coupe. Cependant, que ce soit ta volonté, et non la mienne. »", meditation: "Jésus a peur. Il tremble. Et pourtant, il remet tout. La prière n'est pas l'absence de l'angoisse — c'est la confiance au milieu d'elle.", question: "Quelle coupe vous est-il difficile d'accepter en ce moment ?" },
      { title: "La Flagellation", reference: "Jn 19, 1", verse: "Pilate prit alors Jésus et le fit flageller.", meditation: "Le corps de Jésus porte les blessures de nos violences. Il rejoint chaque personne humiliée, maltraitée, brisée.", question: "Comment porter avec Jésus la souffrance de ceux qui vous entourent ?" },
      { title: "Le Couronnement d'épines", reference: "Jn 19, 2-3", verse: "Les soldats tressèrent une couronne d'épines et la posèrent sur sa tête, et ils lui donnaient des coups de poing.", meditation: "Les soldats se moquent d'un roi. Jésus est couronné dans l'humiliation — et c'est dans cette faiblesse qu'il règne.", question: "Où dans votre vie avez-vous du mal à accepter l'humiliation ou l'échec ?" },
      { title: "Le Portement de Croix", reference: "Lc 23, 26-32", verse: "Simon de Cyrène revenait des champs. Ils lui imposèrent la croix pour qu'il la porte derrière Jésus.", meditation: "Simon aide Jésus sans l'avoir choisi. Parfois, nous portons la croix de l'autre malgré nous — et c'est précisément là que se trouve la grâce.", question: "Quelle croix portez-vous en ce moment ? La portez-vous seul ou avec d'autres ?" },
      { title: "La Crucifixion", reference: "Jn 19, 17-30", verse: "Quand Jésus eut pris le vinaigre, il dit : « Tout est accompli. » Et, inclinant la tête, il remit l'esprit.", meditation: "Tout est accompli. Ces mots ne sont pas une défaite — ils sont l'achèvement d'un amour total. Rien n'a été retenu.", question: "Qu'est-ce que vous n'arrivez pas encore à remettre entièrement à Dieu ?" },
    ],
  },
  glorieux: {
    label: "Mystères Glorieux", days: "Mercredi · Dimanche", color: "#3A5A8A",
    items: [
      { title: "La Résurrection", reference: "Jn 20, 11-18", verse: "Jésus lui dit : « Marie ! » Elle se retourna et lui dit en hébreu : « Rabbouni ! », c'est-à-dire : Maître.", meditation: "Jésus appelle Marie par son prénom. Il nous appelle chacun par notre nom. La Résurrection est personnelle avant d'être universelle.", question: "Vous sentez-vous appelé personnellement par Dieu aujourd'hui ?" },
      { title: "L'Ascension", reference: "Ac 1, 6-11", verse: "Il leur dit : « Je suis avec vous tous les jours jusqu'à la fin du monde. »", meditation: "Jésus part, mais sa présence demeure. L'Ascension n'est pas une absence — c'est une présence différente, plus proche encore.", question: "Comment reconnaissez-vous la présence de Jésus dans votre quotidien ?" },
      { title: "La Pentecôte", reference: "Ac 2, 1-13", verse: "Ils furent tous remplis de l'Esprit Saint et se mirent à parler en d'autres langues, selon ce que l'Esprit leur donnait d'exprimer.", meditation: "L'Esprit rassemble ce que la peur avait dispersé. La communauté chrétienne naît dans le feu d'un amour partagé.", question: "Quel don de l'Esprit manque le plus à votre communauté aujourd'hui ?" },
      { title: "L'Assomption de Marie", reference: "Ap 12, 1", verse: "Un signe grandiose apparut dans le ciel : une femme enveloppée du soleil, la lune sous ses pieds, et sur sa tête une couronne de douze étoiles.", meditation: "Marie est élevée en corps et en âme — signe de notre propre destinée. Ce que Dieu a fait pour elle, il le promet à chacun de nous.", question: "Quelle espérance la mort et la résurrection vous donnent-elles pour votre propre vie ?" },
      { title: "Le Couronnement de Marie", reference: "Ps 45, 10", verse: "La Reine se tient à ta droite, parée d'or de Ophir.", meditation: "Marie règne non par la puissance mais par l'amour. Son couronnement est le triomphe de l'humilité, de la confiance, du fiat.", question: "Comment Marie vous aide-t-elle à vivre votre foi aujourd'hui ?" },
    ],
  },
};

// ─── Prières textes ───────────────────────────────────────────────────────────
const NOTRE_PERE = `Notre Père, qui es aux cieux,
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

Amen.`;

const AVE_MARIA = `Je vous salue, Marie pleine de grâce,
le Seigneur est avec vous.
Vous êtes bénie entre toutes les femmes
et Jésus, le fruit de vos entrailles, est béni.

Sainte Marie, Mère de Dieu,
priez pour nous pauvres pécheurs,
maintenant et à l'heure de notre mort.

Amen.`;

const GLOIRE_FATIMA = `Gloire au Père, et au Fils, et au Saint-Esprit,
comme il était au commencement,
maintenant et toujours,
dans les siècles des siècles. Amen.

Ô mon Jésus, pardonnez-nous nos péchés,
préservez-nous du feu de l'enfer,
conduisez au paradis toutes les âmes,
surtout celles qui ont le plus besoin
de votre miséricorde. Amen.`;

const SALVE_REGINA = `Salve, Regina, Mater misericordiae,
vita, dulcedo et spes nostra, salve.

Ad te clamamus, exsules filii Evae,
ad te suspiramus, gementes et flentes
in hac lacrimarum valle.

Eia ergo, Advocata nostra,
illos tuos misericordes oculos
ad nos converte.

Et Jesum, benedictum fructum ventris tui,
nobis post hoc exsilium ostende.

O clemens, o pia, o dulcis Virgo Maria.`;

const CREDO = `Je crois en Dieu, le Père tout-puissant,
Créateur du ciel et de la terre.
Et en Jésus-Christ, son Fils unique, notre Seigneur,
qui a été conçu du Saint-Esprit,
est né de la Vierge Marie,
a souffert sous Ponce Pilate,
a été crucifié, est mort, et a été enseveli,
est descendu aux enfers,
le troisième jour est ressuscité des morts,
est monté aux cieux,
est assis à la droite de Dieu le Père tout-puissant,
d'où il viendra juger les vivants et les morts.
Je crois en l'Esprit Saint,
à la sainte Église catholique,
à la communion des saints,
à la rémission des péchés,
à la résurrection de la chair,
à la vie éternelle. Amen.`;

const STORAGE_KEY = "fraternitas_rosary_v2";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPrayerForGrain(grainIndex: number): { label: string; text: string } {
  if (grainIndex === -2) return { label: "Credo", text: CREDO };
  if (grainIndex === -1) return { label: "Notre Père", text: NOTRE_PERE };
  if (grainIndex >= 0 && grainIndex <= 9) return { label: `Je vous salue Marie ${grainIndex + 1}/10`, text: AVE_MARIA };
  return { label: "Gloire au Père · Ô mon Jésus", text: GLOIRE_FATIMA };
}

function getTodaySuggestion(): MysteryType {
  const day = new Date().getDay(); // 0=dim
  if (day === 1 || day === 6) return "joyeux";
  if (day === 2 || day === 5) return "douloureux";
  if (day === 3) return "glorieux";
  if (day === 4) return "lumineux";
  return "glorieux"; // dimanche
}

// ─── Composants réutilisables ─────────────────────────────────────────────────
function Header({ onBack, title, right }: { onBack: () => void; title: string; right?: React.ReactNode }) {
  return (
    <div style={{
      padding: "11px 14px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: `1px solid ${T.ink08}`,
      background: "rgba(245,239,228,0.92)",
    }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", gap: "4px",
        color: T.ink45, fontSize: "13px", padding: 0,
        fontFamily: T.sans,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Retour
      </button>
      <span style={{ fontFamily: T.serif, fontSize: "16px", color: T.ink60 }}>{title}</span>
      <div style={{ minWidth: "60px", display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}

// ─── Arc SVG du chapelet ──────────────────────────────────────────────────────
function RosaryArc({ mysteryType, decadeIndex, grainIndex }: {
  mysteryType: MysteryType; decadeIndex: number; grainIndex: number;
}) {
  const m = MYSTERIES[mysteryType];
  const totalPrayed = decadeIndex * 10 + Math.max(0, grainIndex + 1);
  const totalGrains = 50;
  const progress = totalPrayed / totalGrains;

  // Arc : 241px de longueur totale, offset = 241 - (progress * 241)
  const arcLength = 241;
  const offset = arcLength - progress * arcLength;

  // Positions des 10 grains de la dizaine actuelle
  const grainPositions = [
    { cx: 22, cy: 61 }, { cx: 34, cy: 41 }, { cx: 51, cy: 26 },
    { cx: 71, cy: 20 }, { cx: 92, cy: 21 }, { cx: 111, cy: 29 },
    { cx: 126, cy: 44 }, { cx: 136, cy: 63 }, { cx: 140, cy: 83 },
    { cx: 136, cy: 100 },
  ];

  return (
    <svg width="156" height="110" viewBox="0 0 156 110">
      <defs>
        <radialGradient id="gGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4AF5A" />
          <stop offset="100%" stopColor="#A07828" />
        </radialGradient>
      </defs>

      {/* Arc de fond */}
      <path d="M14 85 A63 63 0 0 1 140 85"
        fill="none" stroke={T.ink08} strokeWidth="2" strokeLinecap="round" />

      {/* Arc progressif prié */}
      <path d="M14 85 A63 63 0 0 1 140 85"
        fill="none" stroke={T.gold} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray={arcLength} strokeDashoffset={offset}
        opacity="0.6"
        style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(0.16,1,0.3,1)" }}
      />

      {/* Notre Père (grain gauche) */}
      <circle cx="14" cy="85" r="5.5" fill={T.gold} opacity="0.85" />

      {/* Grains de la dizaine actuelle */}
      {grainPositions.map((pos, i) => {
        const isDone = i < grainIndex;
        const isCurrent = i === grainIndex;
        const isPending = i > grainIndex || grainIndex >= 10;
        return (
          <g key={i}>
            <circle
              cx={pos.cx} cy={pos.cy}
              r={isCurrent ? 6.5 : 3.5}
              fill={isDone ? T.gold : isCurrent ? "url(#gGold)" : "rgba(17,16,9,0.1)"}
              stroke={isCurrent ? "none" : isPending ? "rgba(17,16,9,0.12)" : "none"}
              strokeWidth="0.8"
              opacity={isDone ? 0.85 : isCurrent ? 1 : 0.7}
              style={{ transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
            />
            {isCurrent && (
              <circle cx={pos.cx} cy={pos.cy} r="10"
                fill="none" stroke="rgba(196,154,60,0.25)" strokeWidth="1"
                style={{ animation: "grainPulse 1.9s ease-in-out infinite" }}
              />
            )}
          </g>
        );
      })}

      {/* Indicateur dizaine */}
      <text x="78" y="108" textAnchor="middle"
        style={{ fontFamily: T.sans, fontSize: "8px", fill: T.ink35, fontWeight: 300 }}>
        Dizaine {decadeIndex + 1}/5
      </text>
    </svg>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ChapeletPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedType, setSelectedType] = useState<MysteryType>(getTodaySuggestion());
  const [soundMode, setSoundMode] = useState<SoundMode>("silence");
  const [intention, setIntention] = useState("");
  const [progress, setProgress] = useState<RosaryProgress | null>(null);
  const [showPrayer, setShowPrayer] = useState(false);
  const [tapFeedback, setTapFeedback] = useState(false);
  const [selectedMysteryDetail, setSelectedMysteryDetail] = useState(0);

  // Charger progression sauvegardée
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p: RosaryProgress = JSON.parse(saved);
        setProgress(p);
        setSelectedType(p.mysteryType);
      }
    } catch { /* silencieux */ }
  }, []);

  const save = useCallback((p: RosaryProgress) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* silencieux */ }
  }, []);

  const clearSave = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* silencieux */ }
    setProgress(null);
  }, []);

  // Démarrer
  const start = useCallback((resume = false) => {
    if (resume && progress) { setPhase("praying"); return; }
    const p: RosaryProgress = {
      mysteryType: selectedType,
      decadeIndex: 0,
      grainIndex: -1,
      soundMode,
      intention,
      startedAt: new Date().toISOString(),
    };
    setProgress(p); save(p); setPhase("praying");
  }, [selectedType, soundMode, intention, progress, save]);

  // Avancer d'un grain
  const advance = useCallback(() => {
    if (!progress) return;
    setTapFeedback(true);
    setTimeout(() => setTapFeedback(false), 200);
    setShowPrayer(false);

    const { decadeIndex, grainIndex } = progress;
    let next: RosaryProgress;

    if (grainIndex < 9) {
      next = { ...progress, grainIndex: grainIndex + 1 };
    } else if (grainIndex === 9) {
      next = { ...progress, grainIndex: 10 }; // Gloria + Fatima
    } else if (grainIndex === 10) {
      if (decadeIndex < 4) {
        next = { ...progress, decadeIndex: decadeIndex + 1, grainIndex: -1 };
      } else {
        next = { ...progress, grainIndex: 11 };
        save(next); setProgress(next);
        setPhase("complete");
        clearSave();
        return;
      }
    } else {
      return;
    }
    setProgress(next); save(next);
  }, [progress, save, clearSave]);

  const currentPrayer = progress ? getPrayerForGrain(progress.grainIndex) : null;
  const currentMystery = progress ? MYSTERIES[progress.mysteryType].items[progress.decadeIndex] : null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes grainPulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes breathe { 0%,100%{opacity:.4} 50%{opacity:1} }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .tap-active { transform: scale(0.97); }
      `}</style>

      {/* ════════════════════════════════════════════════════
          PHASE : SÉLECTION DU MYSTÈRE
      ════════════════════════════════════════════════════ */}
      {phase === "select" && (
        <SelectPhase
          selected={selectedType}
          onSelect={setSelectedType}
          savedProgress={progress}
          onStart={() => setPhase("sound")}
          onResume={() => start(true)}
          onClearSave={clearSave}
          onBack={() => router.push("/dashboard/spiritual")}
        />
      )}

      {/* ════════════════════════════════════════════════════
          PHASE : CHOIX SONORE
      ════════════════════════════════════════════════════ */}
      {phase === "sound" && (
        <SoundPhase
          selected={soundMode}
          onSelect={setSoundMode}
          onNext={() => setPhase("intention")}
          onBack={() => setPhase("select")}
        />
      )}

      {/* ════════════════════════════════════════════════════
          PHASE : INTENTION
      ════════════════════════════════════════════════════ */}
      {phase === "intention" && (
        <IntentionPhase
          value={intention}
          onChange={setIntention}
          onStart={() => start(false)}
          onSkip={() => start(false)}
          onBack={() => setPhase("sound")}
        />
      )}

      {/* ════════════════════════════════════════════════════
          PHASE : PRIÈRE EN COURS
      ════════════════════════════════════════════════════ */}
      {phase === "praying" && progress && currentMystery && currentPrayer && (
        <>
          <Header
            title="Le Chapelet"
            onBack={() => setPhase("select")}
            right={<span style={{ fontSize: "12px", color: T.ink35 }}>Pause</span>}
          />
          <main style={{ maxWidth: "560px", margin: "0 auto", padding: "20px 18px 80px" }}>
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Intention */}
              {progress.intention && (
                <div style={{
                  background: "rgba(196,154,60,0.08)", borderRadius: "12px",
                  padding: "9px 14px", border: `1px solid ${T.goldBorder}`,
                }}>
                  <p style={{ fontSize: "12px", fontWeight: 300, color: T.ink60, fontStyle: "italic", margin: 0 }}>
                    🙏 {progress.intention}
                  </p>
                </div>
              )}

              {/* Arc de lumière */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <RosaryArc
                  mysteryType={progress.mysteryType}
                  decadeIndex={progress.decadeIndex}
                  grainIndex={progress.grainIndex}
                />
              </div>

              {/* Mystère du moment */}
              <div
                style={{
                  background: T.bgCard, borderRadius: "18px",
                  padding: "14px 16px", border: `1.5px solid ${T.ink08}`,
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onClick={() => { setSelectedMysteryDetail(progress.decadeIndex); setPhase("mystery-detail"); }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = T.goldBorder)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = T.ink08)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold }}>
                    {progress.decadeIndex + 1}e mystère · {MYSTERIES[progress.mysteryType].label}
                  </p>
                  <span style={{ fontSize: "11px", color: T.ink35 }}>
                    Appuyer pour méditer →
                  </span>
                </div>
                <p style={{ fontFamily: T.serif, fontSize: "19px", fontWeight: 400, color: T.ink, marginBottom: "4px", lineHeight: 1.15 }}>
                  {currentMystery.title}
                </p>
                <p style={{ fontFamily: T.serif, fontSize: "12px", fontWeight: 300, fontStyle: "italic", color: T.ink45, lineHeight: 1.55 }}>
                  « {currentMystery.verse.slice(0, 80)}… »
                </p>
              </div>

              {/* Prière courante */}
              <div style={{
                background: T.bgCream, borderRadius: "16px",
                padding: "12px 16px", border: `1px solid ${T.goldBorder}`,
              }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: T.ink35, marginBottom: "7px" }}>
                  {currentPrayer.label}
                </p>
                <p style={{ fontFamily: T.serif, fontSize: "clamp(16px,2.5vw,19px)", fontWeight: 300, fontStyle: "italic", color: T.ink60, lineHeight: 1.65 }}>
                  {currentPrayer.text.split("\n\n")[0]}…
                </p>
                <button onClick={() => setShowPrayer(v => !v)} style={{
                  marginTop: "8px", background: "none", border: "none", cursor: "pointer",
                  fontSize: "12px", fontWeight: 500, color: T.gold, padding: 0,
                }}>
                  {showPrayer ? "Réduire" : "Lire la prière complète"}
                </button>
                {showPrayer && (
                  <div className="fade-up" style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${T.ink08}` }}>
                    <p style={{ fontFamily: T.serif, fontSize: "17px", fontWeight: 300, lineHeight: 1.85, color: T.ink60, whiteSpace: "pre-line" }}>
                      {currentPrayer.text}
                    </p>
                  </div>
                )}
              </div>

              {/* Zone tap principale */}
              <button
                onClick={advance}
                style={{
                  width: "100%", minHeight: "100px",
                  background: tapFeedback ? "rgba(196,154,60,0.1)" : T.bgCard,
                  borderRadius: "20px",
                  border: `1.5px solid ${tapFeedback ? "rgba(196,154,60,0.5)" : T.goldBorder}`,
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px",
                  transition: "all 0.15s",
                  boxShadow: tapFeedback ? `0 0 0 4px rgba(196,154,60,0.15)` : "none",
                }}
              >
                <div style={{
                  width: "52px", height: "52px", borderRadius: "50%",
                  background: "rgba(196,154,60,0.12)",
                  border: `1.5px solid rgba(196,154,60,0.35)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: tapFeedback ? "scale(0.92)" : "scale(1)",
                  transition: "transform 0.1s",
                }}>
                  <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="12" stroke={T.gold} strokeWidth="1.2" />
                    <line x1="14" y1="5" x2="14" y2="23" stroke={T.gold} strokeWidth="1.3" />
                    <line x1="8" y1="11" x2="20" y2="11" stroke={T.gold} strokeWidth="1.3" />
                  </svg>
                </div>
                <p style={{ fontSize: "12px", fontWeight: 300, color: T.ink45 }}>
                  {progress.grainIndex === 10 ? "Passer à la dizaine suivante" : "Grain suivant"}
                </p>
              </button>

              {/* Communion invisible */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", paddingTop: "4px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: T.gold, opacity: 0.45, animation: "breathe 2.4s ease-in-out infinite" }} />
                <p style={{ fontSize: "12px", fontWeight: 300, color: T.ink35 }}>
                  Priez avec la communauté Fraternitas
                </p>
              </div>

            </div>
          </main>
        </>
      )}

      {/* ════════════════════════════════════════════════════
          PHASE : DÉTAIL D'UN MYSTÈRE
      ════════════════════════════════════════════════════ */}
      {phase === "mystery-detail" && progress && (
        <MysteryDetailPhase
          mysteryType={progress.mysteryType}
          mysteryIndex={selectedMysteryDetail}
          onBack={() => setPhase("praying")}
          onPray={() => setPhase("praying")}
        />
      )}

      {/* ════════════════════════════════════════════════════
          PHASE : CHAPELET TERMINÉ
      ════════════════════════════════════════════════════ */}
      {phase === "complete" && (
        <CompletePhase
          onRestart={() => { setPhase("select"); setProgress(null); }}
          onClose={() => router.push("/dashboard/spiritual")}
        />
      )}
    </div>
  );
}

// ─── Phase Sélection ──────────────────────────────────────────────────────────
function SelectPhase({ selected, onSelect, savedProgress, onStart, onResume, onClearSave, onBack }: {
  selected: MysteryType; onSelect: (t: MysteryType) => void;
  savedProgress: RosaryProgress | null;
  onStart: () => void; onResume: () => void;
  onClearSave: () => void; onBack: () => void;
}) {
  const today = getTodaySuggestion();

  return (
    <>
      <Header title="Le Chapelet" onBack={onBack} />
      <main style={{ maxWidth: "560px", margin: "0 auto", padding: "24px 18px 80px" }}>

        {/* Reprendre */}
        {savedProgress && (
          <div className="fade-up" style={{
            background: T.bgCard, borderRadius: "16px", padding: "14px 16px",
            marginBottom: "20px", border: `1.5px solid rgba(196,154,60,0.35)`,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, color: T.ink, margin: "0 0 2px" }}>
                Reprendre là où vous en étiez
              </p>
              <p style={{ fontSize: "12px", fontWeight: 300, color: T.ink45, margin: 0 }}>
                {MYSTERIES[savedProgress.mysteryType].label} · Dizaine {savedProgress.decadeIndex + 1}
              </p>
            </div>
            <div style={{ display: "flex", gap: "7px" }}>
              <button onClick={onClearSave} style={{
                background: "none", border: `1.5px solid ${T.ink15}`, borderRadius: "99px",
                padding: "6px 12px", fontSize: "11px", cursor: "pointer", color: T.ink45,
                fontFamily: T.sans,
              }}>
                Recommencer
              </button>
              <button onClick={onResume} style={{
                background: T.gold, border: "none", borderRadius: "99px",
                padding: "6px 14px", fontSize: "11px", fontWeight: 500,
                cursor: "pointer", color: "#1C1A12", fontFamily: T.sans,
              }}>
                Reprendre →
              </button>
            </div>
          </div>
        )}

        {/* Titre */}
        <div className="fade-up" style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: T.ink35, marginBottom: "6px" }}>
            Choisir un mystère
          </p>
          <p style={{ fontFamily: T.serif, fontSize: "28px", fontWeight: 300, color: T.ink, lineHeight: 1.1, marginBottom: "4px" }}>
            Le Chapelet
          </p>
          <p style={{ fontSize: "13px", fontWeight: 300, color: T.ink45, lineHeight: 1.55 }}>
            Aujourd&rsquo;hui, les {MYSTERIES[today].label.toLowerCase()} sont conseillés.
          </p>
        </div>

        {/* Grille 2×2 mystères */}
        <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
          {(Object.entries(MYSTERIES) as [MysteryType, typeof MYSTERIES.joyeux][]).map(([type, m]) => (
            <button key={type} onClick={() => onSelect(type)} style={{
              background: selected === type ? T.bgCreemGold : T.bgCard,
              border: selected === type ? `2px solid rgba(196,154,60,0.45)` : `1.5px solid ${T.ink08}`,
              borderRadius: "15px", padding: "13px 12px",
              textAlign: "left", cursor: "pointer",
              transition: "all 0.2s", position: "relative",
              fontFamily: T.sans,
            }}>
              {type === today && (
                <div style={{
                  position: "absolute", top: "-1px", right: "10px",
                  background: T.gold, borderRadius: "0 0 6px 6px",
                  padding: "2px 7px",
                }}>
                  <span style={{ fontSize: "8px", fontWeight: 500, color: "#1C1A12" }}>Aujourd&rsquo;hui</span>
                </div>
              )}
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: m.color, marginBottom: "8px" }} />
              <p style={{ fontFamily: T.serif, fontSize: "15px", fontWeight: 400, color: T.ink, marginBottom: "3px", lineHeight: 1.2 }}>
                {m.label.replace("Mystères ", "")}
              </p>
              <p style={{ fontSize: "10px", fontWeight: 300, color: T.ink35 }}>{m.days}</p>
            </button>
          ))}
        </div>

        {/* Preview 5 mystères */}
        <div className="fade-up" style={{
          background: T.bgCard, borderRadius: "16px",
          border: `1.5px solid ${T.ink08}`, overflow: "hidden", marginBottom: "18px",
        }}>
          <div style={{ padding: "11px 14px", borderBottom: `1px solid ${T.ink08}` }}>
            <p style={{ fontSize: "11px", fontWeight: 500, color: T.ink35, letterSpacing: "0.05em" }}>
              {MYSTERIES[selected].label}
            </p>
          </div>
          {MYSTERIES[selected].items.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: "12px", padding: "11px 14px",
              borderBottom: i < 4 ? `1px solid ${T.ink08}` : "none",
            }}>
              <div style={{
                width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                background: `${MYSTERIES[selected].color}18`, color: MYSTERIES[selected].color,
                fontSize: "11px", fontWeight: 500,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{i + 1}</div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: T.ink, margin: "0 0 2px" }}>{item.title}</p>
                <p style={{ fontFamily: T.serif, fontSize: "11px", fontWeight: 300, fontStyle: "italic", color: T.ink45, margin: 0, lineHeight: 1.5 }}>
                  {item.reference}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onStart} className="fade-up" style={{
          width: "100%", padding: "15px", borderRadius: "14px",
          background: T.ink, color: T.bg, border: "none",
          fontSize: "15px", fontWeight: 500, cursor: "pointer",
          fontFamily: T.sans, transition: "opacity 0.15s",
        }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
          Commencer ce chapelet →
        </button>
      </main>
    </>
  );
}

// ─── Phase Son ────────────────────────────────────────────────────────────────
function SoundPhase({ selected, onSelect, onNext, onBack }: {
  selected: SoundMode; onSelect: (m: SoundMode) => void; onNext: () => void; onBack: () => void;
}) {
  const options: Array<{ key: SoundMode; icon: string; label: string; desc: string }> = [
    { key: "silence", icon: "◯", label: "Silence", desc: "Contemplation pure" },
    { key: "gregorian", icon: "♪", label: "Plain-chant grégorien", desc: "Mélodie médiévale douce" },
    { key: "ave-maria", icon: "♫", label: "Ave Maria chanté", desc: "Schubert · Caccini · Gounod" },
    { key: "communal", icon: "♬", label: "Chant communautaire", desc: "Taizé · Emmanuel · Glenstal" },
  ];

  return (
    <>
      <Header title="Ambiance" onBack={onBack} />
      <main style={{ maxWidth: "560px", margin: "0 auto", padding: "28px 18px 80px" }}>
        <div className="fade-up">
          <p style={{ fontFamily: T.serif, fontSize: "26px", fontWeight: 300, color: T.ink, marginBottom: "4px" }}>
            Choisir l&rsquo;ambiance
          </p>
          <p style={{ fontSize: "13px", fontWeight: 300, color: T.ink45, marginBottom: "22px", lineHeight: 1.6 }}>
            Vous pourrez changer à tout moment pendant la prière.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "22px" }}>
            {options.map(opt => (
              <button key={opt.key} onClick={() => onSelect(opt.key)} style={{
                background: selected === opt.key ? T.bgCreemGold : T.bgCard,
                border: selected === opt.key ? `2px solid rgba(196,154,60,0.4)` : `1.5px solid ${T.ink08}`,
                borderRadius: "14px", padding: "13px 15px",
                display: "flex", alignItems: "center", gap: "12px",
                cursor: "pointer", textAlign: "left", fontFamily: T.sans,
                transition: "all 0.2s",
              }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                  background: selected === opt.key ? "rgba(196,154,60,0.15)" : T.bgCream,
                  border: selected === opt.key ? `1.5px solid rgba(196,154,60,0.4)` : `1.5px solid ${T.ink15}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", color: selected === opt.key ? T.gold : T.ink45,
                }}>
                  {opt.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: T.ink, margin: "0 0 2px" }}>{opt.label}</p>
                    {selected === opt.key && (
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.gold }} />
                    )}
                  </div>
                  <p style={{ fontSize: "11px", fontWeight: 300, color: T.ink45, margin: 0 }}>{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <button onClick={onNext} style={{
            width: "100%", padding: "15px", borderRadius: "14px",
            background: T.ink, color: T.bg, border: "none",
            fontSize: "15px", fontWeight: 500, cursor: "pointer", fontFamily: T.sans,
          }}>
            Continuer →
          </button>
        </div>
      </main>
    </>
  );
}

// ─── Phase Intention ──────────────────────────────────────────────────────────
function IntentionPhase({ value, onChange, onStart, onSkip, onBack }: {
  value: string; onChange: (v: string) => void;
  onStart: () => void; onSkip: () => void; onBack: () => void;
}) {
  return (
    <>
      <Header title="Intention" onBack={onBack} />
      <main style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 18px 80px", textAlign: "center" }}>
        <div className="fade-up">
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: "rgba(196,154,60,0.1)", border: `1.5px solid ${T.goldBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
          }}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke={T.gold} strokeWidth="1.2" />
              <line x1="14" y1="5" x2="14" y2="23" stroke={T.gold} strokeWidth="1.2" />
              <line x1="8" y1="11" x2="20" y2="11" stroke={T.gold} strokeWidth="1.2" />
            </svg>
          </div>

          <p style={{ fontFamily: T.serif, fontSize: "24px", fontWeight: 300, color: T.ink, marginBottom: "10px", lineHeight: 1.2 }}>
            Pour qui priez-vous ce chapelet ?
          </p>
          <p style={{ fontSize: "14px", fontWeight: 300, color: T.ink45, lineHeight: 1.65, marginBottom: "28px", maxWidth: "340px", margin: "0 auto 28px" }}>
            Formuler une intention transforme la récitation en acte d&rsquo;amour. Elle restera présente pendant toute votre prière.
          </p>

          <textarea
            value={value}
            onChange={e => onChange(e.target.value.slice(0, 200))}
            placeholder="Pour mon père malade… Pour la paix… Pour ceux qui doutent…"
            rows={4}
            style={{
              width: "100%", padding: "14px 16px",
              borderRadius: "14px", border: `1.5px solid ${T.ink15}`,
              background: T.bgCard, color: T.ink,
              fontSize: "16px", fontWeight: 300, lineHeight: 1.65,
              fontFamily: T.serif, fontStyle: "italic",
              resize: "none", outline: "none",
              transition: "border-color 0.2s",
              marginBottom: "14px",
            }}
            onFocus={e => (e.target.style.borderColor = T.gold)}
            onBlur={e => (e.target.style.borderColor = T.ink15)}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onSkip} style={{
              flex: 1, padding: "13px", borderRadius: "12px",
              border: `1.5px solid ${T.ink15}`, background: "none",
              fontSize: "14px", color: T.ink45, cursor: "pointer", fontFamily: T.sans,
            }}>
              Sans intention
            </button>
            <button onClick={onStart} style={{
              flex: 2, padding: "13px", borderRadius: "12px",
              background: T.ink, border: "none", color: T.bg,
              fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: T.sans,
            }}>
              {value ? "Commencer →" : "Passer →"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

// ─── Phase Mystère Détail ─────────────────────────────────────────────────────
function MysteryDetailPhase({ mysteryType, mysteryIndex, onBack, onPray }: {
  mysteryType: MysteryType; mysteryIndex: number; onBack: () => void; onPray: () => void;
}) {
  const [silenceTimer, setSilenceTimer] = useState<number | null>(null);
  const [silenceLeft, setSilenceLeft] = useState(120);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const m = MYSTERIES[mysteryType];
  const mystery = m.items[mysteryIndex];

  const startSilence = (secs: number) => {
    setSilenceTimer(secs); setSilenceLeft(secs);
    intervalRef.current = setInterval(() => {
      setSilenceLeft(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current!); setSilenceTimer(null); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <>
      <Header title="Mystère" onBack={onBack} />
      <main style={{ maxWidth: "560px", margin: "0 auto", padding: "20px 18px 80px" }}>
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Art sacré lumineux */}
          <div style={{
            background: T.bgCard, borderRadius: "20px", height: "130px",
            border: `1.5px solid rgba(196,154,60,0.25)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
          }}>
            {/* Halos concentriques */}
            {[70, 52, 36, 22].map((r, i) => (
              <div key={i} style={{
                position: "absolute", width: r*2, height: r*2, borderRadius: "50%",
                border: `1px solid rgba(196,154,60,${0.1 + i * 0.06})`,
              }} />
            ))}
            {/* Croix de lumière */}
            <div style={{ position: "absolute", width: "1px", height: "70px", background: "linear-gradient(to bottom,transparent,rgba(196,154,60,0.45),transparent)" }} />
            <div style={{ position: "absolute", width: "40px", height: "1px", background: "linear-gradient(to right,transparent,rgba(196,154,60,0.35),transparent)", top: "42%" }} />
            {/* Référence */}
            <p style={{ position: "absolute", bottom: "8px", right: "12px", fontSize: "10px", color: T.ink35, fontFamily: T.serif, fontStyle: "italic" }}>
              {mystery.reference}
            </p>
          </div>

          {/* Titre */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: m.color, marginBottom: "4px" }}>
              {mysteryIndex + 1}e mystère · {m.label}
            </p>
            <p style={{ fontFamily: T.serif, fontSize: "28px", fontWeight: 300, color: T.ink, lineHeight: 1.1 }}>
              {mystery.title}
            </p>
          </div>

          {/* Verset */}
          <div style={{
            background: T.bgCard, borderRadius: "14px", padding: "14px 16px",
            border: `1.5px solid ${T.ink08}`, borderLeft: `2.5px solid rgba(196,154,60,0.45)`,
          }}>
            <p style={{ fontFamily: T.serif, fontSize: "clamp(16px,2.5vw,19px)", fontWeight: 300, fontStyle: "italic", color: T.ink60, lineHeight: 1.7, margin: 0 }}>
              « {mystery.verse} »
            </p>
          </div>

          {/* Méditation */}
          <div style={{
            background: T.bgCream, borderRadius: "14px", padding: "14px 16px",
            border: `1px solid rgba(196,154,60,0.2)`,
          }}>
            <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: T.ink35, marginBottom: "8px" }}>
              Méditation
            </p>
            <p style={{ fontFamily: T.serif, fontSize: "clamp(15px,2.2vw,18px)", fontWeight: 300, color: T.ink60, lineHeight: 1.72, margin: 0 }}>
              {mystery.meditation}
            </p>
          </div>

          {/* Question contemplative */}
          <div style={{
            background: "rgba(196,154,60,0.06)", borderRadius: "14px", padding: "14px 16px",
            border: `1px solid rgba(196,154,60,0.22)`,
          }}>
            <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold, marginBottom: "8px" }}>
              Pour vous
            </p>
            <p style={{ fontFamily: T.serif, fontSize: "clamp(15px,2.2vw,18px)", fontWeight: 300, fontStyle: "italic", color: T.ink60, lineHeight: 1.72, margin: 0 }}>
              {mystery.question}
            </p>
          </div>

          {/* Silence ou prier */}
          {silenceTimer !== null ? (
            <div style={{ background: T.bgCard, borderRadius: "14px", padding: "20px", textAlign: "center", border: `1.5px solid ${T.goldBorder}` }}>
              <p style={{ fontFamily: T.serif, fontSize: "38px", fontWeight: 300, color: T.ink, marginBottom: "6px" }}>
                {Math.floor(silenceLeft / 60)}:{String(silenceLeft % 60).padStart(2, "0")}
              </p>
              <p style={{ fontSize: "13px", fontWeight: 300, color: T.ink45 }}>Temps de silence</p>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => startSilence(120)} style={{
                flex: 1, padding: "13px", borderRadius: "12px",
                border: `1.5px solid ${T.ink15}`, background: "none",
                fontSize: "13px", color: T.ink45, cursor: "pointer", fontFamily: T.sans,
              }}>
                ⏱ 2 min de silence
              </button>
              <button onClick={onPray} style={{
                flex: 2, padding: "13px", borderRadius: "12px",
                background: T.ink, border: "none", color: T.bg,
                fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: T.sans,
              }}>
                Prier ce mystère →
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ─── Phase Terminé ────────────────────────────────────────────────────────────
function CompletePhase({ onRestart, onClose }: { onRestart: () => void; onClose: () => void }) {
  const [showSalve, setShowSalve] = useState(false);

  return (
    <>
      <Header title="Le Chapelet" onBack={onClose} />
      <main style={{ maxWidth: "480px", margin: "0 auto", padding: "48px 18px 80px", textAlign: "center" }}>
        <div className="fade-up">
          <div style={{
            width: "60px", height: "60px", borderRadius: "50%",
            background: "rgba(196,154,60,0.1)", border: `1.5px solid ${T.goldBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px",
          }}>
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke={T.gold} strokeWidth="1.2" />
              <line x1="14" y1="5" x2="14" y2="23" stroke={T.gold} strokeWidth="1.2" />
              <line x1="8" y1="11" x2="20" y2="11" stroke={T.gold} strokeWidth="1.2" />
            </svg>
          </div>

          <p style={{ fontFamily: T.serif, fontSize: "32px", fontWeight: 300, color: T.ink, marginBottom: "10px" }}>
            Chapelet terminé.
          </p>
          <p style={{ fontSize: "15px", fontWeight: 300, color: T.ink45, lineHeight: 1.7, marginBottom: "28px", maxWidth: "340px", margin: "0 auto 28px" }}>
            Vous venez de contempler les mystères avec Marie.
            Prenez un moment de silence avant de reprendre votre journée.
          </p>

          {/* Salve Regina */}
          <button onClick={() => setShowSalve(v => !v)} style={{
            width: "100%", padding: "12px", borderRadius: "12px",
            border: `1.5px solid ${T.ink15}`, background: "none",
            fontSize: "14px", color: T.ink45, cursor: "pointer",
            marginBottom: showSalve ? "12px" : "20px", fontFamily: T.sans,
          }}>
            {showSalve ? "Masquer" : "Salve Regina"}
          </button>

          {showSalve && (
            <div className="fade-up" style={{
              background: T.bgCream, borderRadius: "16px",
              padding: "22px", marginBottom: "20px",
              border: `1.5px solid rgba(196,154,60,0.22)`,
            }}>
              <p style={{ fontFamily: T.serif, fontSize: "17px", fontWeight: 300, fontStyle: "italic", color: T.ink60, lineHeight: 1.85, whiteSpace: "pre-line", margin: 0 }}>
                {SALVE_REGINA}
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "13px", borderRadius: "12px",
              border: `1.5px solid ${T.ink15}`, background: "none",
              fontSize: "14px", color: T.ink45, cursor: "pointer", fontFamily: T.sans,
            }}>
              Fermer
            </button>
            <button onClick={onRestart} style={{
              flex: 2, padding: "13px", borderRadius: "12px",
              background: T.ink, border: "none", color: T.bg,
              fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: T.sans,
            }}>
              Nouveau chapelet →
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
