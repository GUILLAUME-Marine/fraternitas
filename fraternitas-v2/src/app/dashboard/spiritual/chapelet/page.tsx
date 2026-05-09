"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type MysteryType = "joyeux" | "lumineux" | "douloureux" | "glorieux";
type Phase = "select" | "debut" | "intention" | "praying" | "fatima" | "mystery-detail" | "complete";
type SoundMode = "silence" | "gregorian" | "ave-maria" | "communal";

interface RosaryProgress {
  mysteryType: MysteryType; decadeIndex: number; grainIndex: number;
  soundMode: SoundMode; intention: string; startedAt: string;
}
interface HistoryEntry { mysteryType: string; completedAt: string; intention?: string }

// ─── Tokens lisibilité renforcée ──────────────────────────────────────────────
const C = {
  bg: "#F2EBE0",
  card: "#FFFFFF",
  cardBorder: "rgba(17,16,9,0.11)",
  cream: "#E8DDD0",
  creamGold: "#F5EDE0",
  dark: "#1A1612",
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

// ─── Mystères ─────────────────────────────────────────────────────────────────
const MYSTERIES: Record<MysteryType, {
  label: string; short: string; days: string; color: string;
  items: Array<{ title: string; ref: string; verse: string; meditation: string; question: string }>;
}> = {
  joyeux: {
    label: "Mystères Joyeux", short: "Joyeux", days: "Lun · Sam", color: "#8A6A20",
    items: [
      { title: "L'Annonciation", ref: "Lc 1, 26-38", verse: "L'ange dit à Marie : « Réjouis-toi, comblée de grâce, le Seigneur est avec toi. »", meditation: "Marie dit oui sans tout comprendre. La foi n'est pas la certitude — c'est la confiance dans Celui qui appelle.", question: "À quoi Dieu vous invite-t-il en ce moment, même sans tout voir clairement ?" },
      { title: "La Visitation", ref: "Lc 1, 39-56", verse: "Dès qu'Élisabeth entendit Marie, l'enfant tressaillit en elle. Elle fut remplie de l'Esprit Saint.", meditation: "La joie de Marie devient joie pour les autres. La présence de Dieu en nous réjouit ceux que nous approchons.", question: "Qui a besoin que vous lui apportiez de la joie cette semaine ?" },
      { title: "La Nativité", ref: "Lc 2, 1-20", verse: "Elle enfanta son fils premier-né et le coucha dans une mangeoire, car il n'y avait pas de place.", meditation: "Dieu choisit la pauvreté, le silence, la nuit. Ce que le monde ignore, Dieu l'habite.", question: "Quelle pauvreté dans votre vie est peut-être un lieu où Dieu est présent ?" },
      { title: "La Présentation au Temple", ref: "Lc 2, 22-40", verse: "Siméon prit l'enfant dans ses bras : « Mes yeux ont vu ton salut. »", meditation: "Siméon a attendu toute sa vie pour ce moment. Certaines promesses de Dieu demandent du temps.", question: "Quelle promesse de Dieu attendez-vous encore ?" },
      { title: "Le Recouvrement au Temple", ref: "Lc 2, 41-52", verse: "« Pourquoi me cherchiez-vous ? Ne saviez-vous pas que je dois être chez mon Père ? »", meditation: "La foi grandit dans les questions, les cherchements, les silences.", question: "Où cherchez-vous Jésus en ce moment dans votre vie ?" },
    ],
  },
  lumineux: {
    label: "Mystères Lumineux", short: "Lumineux", days: "Jeudi", color: "#2D5A35",
    items: [
      { title: "Le Baptême de Jésus", ref: "Mt 3, 13-17", verse: "« Celui-ci est mon Fils bien-aimé, en qui je trouve ma joie. »", meditation: "Avant toute mission, Dieu dit à Jésus qu'il est aimé. Nous aussi, avant toute action, nous sommes aimés.", question: "Croyez-vous vraiment être aimé de Dieu tel que vous êtes, maintenant ?" },
      { title: "Les Noces de Cana", ref: "Jn 2, 1-11", verse: "Marie dit : « Faites tout ce qu'il vous dira. »", meditation: "Marie remarque le manque et intercède. La grâce travaille dans les détails du quotidien.", question: "Quel manque dans votre vie pourriez-vous confier à Marie aujourd'hui ?" },
      { title: "L'Annonce du Royaume", ref: "Mc 1, 14-15", verse: "« Le Règne de Dieu est tout proche. Convertissez-vous et croyez à la Bonne Nouvelle. »", meditation: "Le Royaume n'est pas un lieu futur — il est déjà là, caché dans le réel.", question: "Où avez-vous entrevu le Royaume de Dieu cette semaine ?" },
      { title: "La Transfiguration", ref: "Mt 17, 1-8", verse: "« Son visage resplendit comme le soleil, ses vêtements devinrent blancs comme la lumière. »", meditation: "Sur le Thabor, la gloire divine transparaît à travers l'humanité de Jésus.", question: "Quelle lumière avez-vous reçue ou donnée ces derniers jours ?" },
      { title: "L'Institution de l'Eucharistie", ref: "Lc 22, 14-20", verse: "« Ceci est mon corps, donné pour vous. Faites cela en mémoire de moi. »", meditation: "Jésus se donne entièrement. L'Eucharistie n'est pas un rite — c'est une présence réelle.", question: "Comment votre participation à la messe peut-elle devenir plus vivante ?" },
    ],
  },
  douloureux: {
    label: "Mystères Douloureux", short: "Douloureux", days: "Mar · Ven", color: "#5A2D2D",
    items: [
      { title: "L'Agonie à Gethsémani", ref: "Lc 22, 39-46", verse: "« Père, si tu veux, éloigne de moi cette coupe. Cependant, que ta volonté soit faite. »", meditation: "Jésus a peur. La prière n'est pas l'absence de l'angoisse — c'est la confiance au milieu d'elle.", question: "Quelle coupe vous est-il difficile d'accepter en ce moment ?" },
      { title: "La Flagellation", ref: "Jn 19, 1", verse: "« Pilate prit alors Jésus et le fit flageller. »", meditation: "Le corps de Jésus porte les blessures de nos violences. Il rejoint chaque personne brisée.", question: "Comment porter avec Jésus la souffrance de ceux qui vous entourent ?" },
      { title: "Le Couronnement d'épines", ref: "Jn 19, 2-3", verse: "Les soldats tressèrent une couronne d'épines et la posèrent sur sa tête.", meditation: "Jésus est couronné dans l'humiliation — et c'est dans cette faiblesse qu'il règne.", question: "Où dans votre vie avez-vous du mal à accepter l'humiliation ?" },
      { title: "Le Portement de Croix", ref: "Lc 23, 26-32", verse: "Ils imposèrent à Simon de Cyrène la croix pour qu'il la porte derrière Jésus.", meditation: "Simon aide Jésus sans l'avoir choisi. Parfois, c'est précisément là que se trouve la grâce.", question: "Quelle croix portez-vous en ce moment ? La portez-vous seul ?" },
      { title: "La Crucifixion", ref: "Jn 19, 17-30", verse: "« Tout est accompli. » Et, inclinant la tête, il remit l'esprit.", meditation: "Tout est accompli — l'achèvement d'un amour total. Rien n'a été retenu.", question: "Qu'est-ce que vous n'arrivez pas encore à remettre entièrement à Dieu ?" },
    ],
  },
  glorieux: {
    label: "Mystères Glorieux", short: "Glorieux", days: "Mer · Dim", color: "#1A3A5A",
    items: [
      { title: "La Résurrection", ref: "Jn 20, 11-18", verse: "Jésus lui dit : « Marie ! » Elle se retourna et lui dit : « Rabbouni ! »", meditation: "Jésus appelle Marie par son prénom. Il nous appelle chacun par notre nom.", question: "Vous sentez-vous appelé personnellement par Dieu aujourd'hui ?" },
      { title: "L'Ascension", ref: "Ac 1, 6-11", verse: "« Je suis avec vous tous les jours jusqu'à la fin du monde. »", meditation: "Jésus part, mais sa présence demeure. L'Ascension n'est pas une absence — c'est une présence différente.", question: "Comment reconnaissez-vous la présence de Jésus dans votre quotidien ?" },
      { title: "La Pentecôte", ref: "Ac 2, 1-13", verse: "Ils furent tous remplis de l'Esprit Saint et se mirent à parler.", meditation: "L'Esprit rassemble ce que la peur avait dispersé. La communauté naît dans le feu d'un amour partagé.", question: "Quel don de l'Esprit manque le plus à votre communauté ?" },
      { title: "L'Assomption de Marie", ref: "Ap 12, 1", verse: "Une femme enveloppée du soleil, la lune sous ses pieds.", meditation: "Marie est élevée en corps et en âme — signe de notre propre destinée.", question: "Quelle espérance la résurrection vous donne-t-elle pour votre vie ?" },
      { title: "Le Couronnement de Marie", ref: "Ps 45, 10", verse: "La Reine se tient à ta droite, parée d'or.", meditation: "Marie règne non par la puissance mais par l'amour.", question: "Comment Marie vous aide-t-elle à vivre votre foi aujourd'hui ?" },
    ],
  },
};

// ─── Prières textes ───────────────────────────────────────────────────────────
const PRIERES_DEBUT = [
  {
    label: "Je crois en Dieu — Credo",
    preview: "Je crois en Dieu, le Père tout-puissant, Créateur du ciel et de la terre…",
    full: `Je crois en Dieu, le Père tout-puissant,\nCréateur du ciel et de la terre.\nEt en Jésus-Christ, son Fils unique, notre Seigneur,\nqui a été conçu du Saint-Esprit,\nest né de la Vierge Marie,\na souffert sous Ponce Pilate,\na été crucifié, est mort, et a été enseveli,\nest descendu aux enfers,\nle troisième jour est ressuscité des morts,\nest monté aux cieux,\nest assis à la droite de Dieu le Père tout-puissant,\nd'où il viendra juger les vivants et les morts.\nJe crois en l'Esprit Saint,\nà la sainte Église catholique,\nà la communion des saints,\nà la rémission des péchés,\nà la résurrection de la chair,\nà la vie éternelle. Amen.`,
  },
  {
    label: "Notre Père",
    preview: "Notre Père, qui es aux cieux, que ton nom soit sanctifié…",
    full: `Notre Père, qui es aux cieux,\nque ton nom soit sanctifié,\nque ton règne vienne,\nque ta volonté soit faite\nsur la terre comme au ciel.\n\nDonne-nous aujourd'hui notre pain de ce jour.\nPardonne-nous nos offenses,\ncomme nous pardonnons aussi\nà ceux qui nous ont offensés.\n\nEt ne nous soumets pas à la tentation,\nmais délivre-nous du mal. Amen.`,
  },
  {
    label: "3 × Je vous salue Marie",
    preview: "Je vous salue, Marie pleine de grâce…",
    full: `Je vous salue, Marie pleine de grâce,\nle Seigneur est avec vous.\nVous êtes bénie entre toutes les femmes\net Jésus, le fruit de vos entrailles, est béni.\n\nSainte Marie, Mère de Dieu,\npriez pour nous pauvres pécheurs,\nmaintenant et à l'heure de notre mort. Amen.`,
  },
  {
    label: "Gloire au Père",
    preview: "Gloire au Père, et au Fils, et au Saint-Esprit…",
    full: `Gloire au Père, et au Fils, et au Saint-Esprit,\ncomme il était au commencement,\nmaintenant et toujours,\ndans les siècles des siècles. Amen.`,
  },
];

const NOTRE_PERE = `Notre Père, qui es aux cieux,\nque ton nom soit sanctifié,\nque ton règne vienne,\nque ta volonté soit faite\nsur la terre comme au ciel.\n\nDonne-nous aujourd'hui notre pain de ce jour.\nPardonne-nous nos offenses,\ncomme nous pardonnons aussi\nà ceux qui nous ont offensés.\n\nEt ne nous soumets pas à la tentation,\nmais délivre-nous du mal. Amen.`;
const AVE_MARIA = `Je vous salue, Marie pleine de grâce,\nle Seigneur est avec vous.\nVous êtes bénie entre toutes les femmes\net Jésus, le fruit de vos entrailles, est béni.\n\nSainte Marie, Mère de Dieu,\npriez pour nous pauvres pécheurs,\nmaintenant et à l'heure de notre mort. Amen.`;
const GLOIRE = `Gloire au Père, et au Fils, et au Saint-Esprit,\ncomme il était au commencement,\nmaintenant et toujours,\ndans les siècles des siècles. Amen.`;
const FATIMA = `Ô mon Jésus, pardonnez-nous nos péchés,\npréservez-nous du feu de l'enfer,\net conduisez au Ciel toutes les âmes,\nspécialement celles qui ont le plus besoin\nde votre miséricorde. Amen.`;
const SALVE = `Salve, Regina, Mater misericordiae,\nvita, dulcedo et spes nostra, salve.\nAd te clamamus, exsules filii Evae,\nad te suspiramus, gementes et flentes\nin hac lacrimarum valle.\nEia ergo, advocata nostra,\nillos tuos misericordes oculos ad nos converte.\nEt Jesum, benedictum fructum ventris tui,\nnobis post hoc exsilium ostende.\nO clemens, o pia, o dulcis Virgo Maria.`;

const STORAGE_KEY = "fraternitas_rosary_v2";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPrayer(g: number): { label: string; preview: string; full: string } {
  if (g === -1) return { label: "Notre Père", preview: "Notre Père, qui es aux cieux…", full: NOTRE_PERE };
  if (g >= 0 && g <= 9) return { label: `Ave Maria ${g + 1}/10`, preview: "Je vous salue, Marie pleine de grâce…", full: AVE_MARIA };
  return { label: "Gloire au Père", preview: "Gloire au Père, et au Fils…", full: GLOIRE };
}
function getTodayMystery(): MysteryType {
  const d = new Date().getDay();
  if (d === 1 || d === 6) return "joyeux";
  if (d === 2 || d === 5) return "douloureux";
  if (d === 4) return "lumineux";
  return "glorieux";
}
function saveP(p: RosaryProgress) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /**/ } }
function clearP() { try { localStorage.removeItem(STORAGE_KEY); } catch { /**/ } }
function loadP(): RosaryProgress | null { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; } }
const HISTORY_KEY = "fraternitas_rosary_history";
function loadHistory(): HistoryEntry[] { try { const s = localStorage.getItem(HISTORY_KEY); return s ? JSON.parse(s) : []; } catch { return []; } }
function saveHistory(h: HistoryEntry[]) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 30))); } catch { /**/ } }

// ─── Composants ───────────────────────────────────────────────────────────────
function BackBtn({ onClick, label = "Retour" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", cursor: "pointer", padding: 0,
      fontSize: "12px", color: C.ink50, fontFamily: C.sans,
      display: "flex", alignItems: "center", gap: "4px",
    }}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}

function Header({ left, center, right }: { left: React.ReactNode; center: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 30,
      background: "rgba(242,235,224,0.95)", backdropFilter: "blur(14px)",
      borderBottom: `1px solid ${C.ink12}`,
      padding: "10px 14px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ minWidth: "64px" }}>{left}</div>
      <div style={{ textAlign: "center" }}>{center}</div>
      <div style={{ minWidth: "64px", display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}

function CrossIcon({ size = 14, color = C.gold }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="1.3" />
      <line x1="14" y1="5" x2="14" y2="23" stroke={color} strokeWidth="1.3" />
      <line x1="8" y1="11" x2="20" y2="11" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}

// Visualisation des grains
function GrainTrack({ decadeIndex, grainIndex, mysteryType }: {
  decadeIndex: number; grainIndex: number; mysteryType: MysteryType;
}) {
  const color = MYSTERIES[mysteryType].color;
  return (
    <div style={{ background: "rgba(242,235,224,0.96)", padding: "6px 14px 7px", borderBottom: `1px solid ${C.ink12}` }}>
      {/* 5 dizaines */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} style={{
            flex: 1, height: "3px", borderRadius: "99px",
            background: i < decadeIndex ? "#111009" : i === decadeIndex ? color : "rgba(17,16,9,0.12)",
            opacity: i < decadeIndex ? 0.65 : i === decadeIndex ? 0.75 : 1,
            transition: "background .3s",
          }} />
        ))}
      </div>
      {/* Grains dizaine */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: "11px", height: "11px", borderRadius: "50%",
          background: grainIndex >= 0 ? "#111009" : color,
          opacity: grainIndex >= 0 ? 0.7 : 1,
          boxShadow: grainIndex === -1 ? `0 0 8px ${color}70` : "none",
          transition: "all .25s", flexShrink: 0,
        }} />
        <div style={{ width: "4px", height: "1px", background: C.ink12 }} />
        {Array.from({ length: 10 }, (_, i) => {
          const done = grainIndex > i || grainIndex >= 10;
          const current = grainIndex === i;
          return (
            <div key={i} style={{
              width: current ? "11px" : "8px", height: current ? "11px" : "8px",
              borderRadius: "50%", flexShrink: 0,
              background: done ? "#111009" : current ? color : "rgba(17,16,9,0.14)",
              opacity: done ? 0.7 : 1,
              boxShadow: current ? `0 0 9px ${color}70` : "none",
              transition: "all .25s cubic-bezier(.34,1.56,.64,1)",
            }} />
          );
        })}
      </div>
      <p style={{ fontSize: "9px", color: C.ink50, textAlign: "center", margin: "4px 0 0", fontFamily: C.sans }}>
        {decadeIndex + 1}/5 ·{" "}
        {grainIndex === -1 ? "Notre Père" : grainIndex >= 10 ? "Gloire au Père" : `Ave Maria ${grainIndex + 1}/10`}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ChapeletPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("select");
  const [selected, setSelected] = useState<MysteryType>(getTodayMystery());
  const [progress, setProgress] = useState<RosaryProgress | null>(null);
  const [intention, setIntention] = useState("");
  const [showFullPrayer, setShowFullPrayer] = useState(false);
  const [tapFeedback, setTapFeedback] = useState(false);
  const [silenceActive, setSilenceActive] = useState(false);
  const [silenceLeft, setSilenceLeft] = useState(120);
  const [openDebut, setOpenDebut] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const silenceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const p = loadP();
    if (p) { setProgress(p); setSelected(p.mysteryType); setIntention(p.intention || ""); }
    setHistory(loadHistory());
  }, []);

  const doSave = useCallback((p: RosaryProgress) => { saveP(p); setProgress(p); }, []);

  const startFresh = useCallback(() => {
    const p: RosaryProgress = {
      mysteryType: selected, decadeIndex: 0, grainIndex: -1,
      soundMode: "silence", intention, startedAt: new Date().toISOString(),
    };
    doSave(p); setPhase("praying"); setShowFullPrayer(false);
  }, [selected, intention, doSave]);

  const advance = useCallback(() => {
    if (!progress) return;
    setTapFeedback(true);
    setTimeout(() => setTapFeedback(false), 160);
    setShowFullPrayer(false);
    const { decadeIndex, grainIndex } = progress;
    if (grainIndex < 9) { doSave({ ...progress, grainIndex: grainIndex + 1 }); }
    else if (grainIndex === 9) { doSave({ ...progress, grainIndex: 10 }); }
    else if (grainIndex === 10) { setPhase("fatima"); }
  }, [progress, doSave]);

  const afterFatima = useCallback(() => {
    if (!progress) return;
    if (progress.decadeIndex < 4) {
      doSave({ ...progress, decadeIndex: progress.decadeIndex + 1, grainIndex: -1 });
      setPhase("praying");
    } else {
      const entry: HistoryEntry = { mysteryType: progress.mysteryType, completedAt: new Date().toISOString(), intention: progress.intention };
      const newH = [entry, ...history].slice(0, 20);
      saveHistory(newH); setHistory(newH);
      clearP(); setProgress(null);
      setPhase("complete");
    }
  }, [progress, history, doSave]);

  const rosaryPercent = progress
    ? Math.round(((progress.decadeIndex * 10 + Math.max(0, progress.grainIndex + 1)) / 50) * 100)
    : 0;

  const prayerInfo = progress ? getPrayer(progress.grainIndex) : null;
  const currentMystery = progress ? MYSTERIES[progress.mysteryType].items[progress.decadeIndex] : null;
  const todayType = getTodayMystery();

  const startSilence = (s: number) => {
    setSilenceLeft(s); setSilenceActive(true);
    silenceRef.current = setInterval(() => {
      setSilenceLeft(p => { if (p <= 1) { clearInterval(silenceRef.current!); setSilenceActive(false); return 0; } return p - 1; });
    }, 1000);
  };
  const stopSilence = () => { if (silenceRef.current) clearInterval(silenceRef.current); setSilenceActive(false); setSilenceLeft(120); };
  useEffect(() => () => { if (silenceRef.current) clearInterval(silenceRef.current); }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        @keyframes gp{0%,100%{box-shadow:0 0 6px rgba(184,137,58,.5)}50%{box-shadow:0 0 14px rgba(184,137,58,.8)}}
        @keyframes bp{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .fu{animation:fu .4s cubic-bezier(.16,1,.3,1) both}
        .ga{animation:gp 2s ease-in-out infinite}
        .ba{animation:bp 2.4s ease-in-out infinite}
        .tap:active{transform:scale(.96)}
        .row:hover{background:rgba(17,16,9,0.03)!important}
      `}</style>

      {/* ════ SÉLECTION ════ */}
      {phase === "select" && (
        <>
          <Header
            left={<BackBtn onClick={() => router.push("/dashboard/spiritual")} label="Prions" />}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65 }}>Le Chapelet</span>}
            right={progress ? <span style={{ fontSize: "12px", color: C.gold, fontWeight: 500 }}>{rosaryPercent}%</span> : undefined}
          />
          <main style={{ maxWidth: "540px", margin: "0 auto", padding: "16px 14px 60px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Reprendre */}
              {progress && (
                <div style={{ background: C.card, borderRadius: "14px", padding: "12px 14px", border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: C.ink, margin: "0 0 2px" }}>En cours</p>
                    <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, margin: 0 }}>
                      {MYSTERIES[progress.mysteryType].label} · Dizaine {progress.decadeIndex + 1} · {rosaryPercent}%
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "7px" }}>
                    <button onClick={() => { clearP(); setProgress(null); }} style={{ background: "none", border: `1.5px solid ${C.ink12}`, borderRadius: "99px", padding: "6px 11px", fontSize: "11px", cursor: "pointer", color: C.ink50, fontFamily: C.sans }}>
                      Réinitialiser
                    </button>
                    <button onClick={() => setPhase("praying")} style={{ background: C.gold, border: "none", borderRadius: "99px", padding: "6px 13px", fontSize: "11px", fontWeight: 500, cursor: "pointer", color: "#fff", fontFamily: C.sans }}>
                      Reprendre →
                    </button>
                  </div>
                </div>
              )}

              {/* Mystères */}
              <div>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.ink35, marginBottom: "8px" }}>
                  Mystère
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {(Object.entries(MYSTERIES) as [MysteryType, typeof MYSTERIES.joyeux][]).map(([key, m]) => (
                    <button key={key} onClick={() => setSelected(key)} style={{
                      background: selected === key ? C.creamGold : C.card,
                      border: selected === key ? `2px solid ${C.gold}55` : `1.5px solid ${C.cardBorder}`,
                      borderRadius: "14px", padding: "12px 13px",
                      textAlign: "left", cursor: "pointer", position: "relative",
                      transition: "all .15s", fontFamily: C.sans,
                    }}>
                      {key === todayType && (
                        <div style={{ position: "absolute", top: "-1px", right: "10px", background: C.gold, borderRadius: "0 0 5px 5px", padding: "1px 6px" }}>
                          <span style={{ fontSize: "7px", fontWeight: 500, color: "#fff" }}>
                            {new Date().toLocaleDateString("fr-FR", { weekday: "short" }).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: m.color, marginBottom: "7px" }} />
                      <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 400, color: C.ink, lineHeight: 1.1, marginBottom: "3px" }}>{m.short}</p>
                      <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink50, margin: 0 }}>{m.days}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prières du début — accordéon */}
              <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
                <div style={{ padding: "11px 14px", borderBottom: `1px solid ${C.ink12}` }}>
                  <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.ink35, margin: 0 }}>
                    Prières du début
                  </p>
                  <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, margin: "2px 0 0" }}>
                    Récitées avant la 1re dizaine — guide guidé pendant le chapelet
                  </p>
                </div>
                {PRIERES_DEBUT.map((p, i) => (
                  <div key={i} style={{ borderBottom: i < PRIERES_DEBUT.length - 1 ? `1px solid ${C.ink12}` : "none" }}>
                    <button onClick={() => setOpenDebut(openDebut === i ? null : i)} style={{
                      width: "100%", background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "11px 14px", fontFamily: C.sans,
                    }}>
                      <div style={{ textAlign: "left" }}>
                        <p style={{ fontSize: "13px", fontWeight: 500, color: C.ink, margin: 0 }}>{p.label}</p>
                        {openDebut !== i && (
                          <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, margin: "2px 0 0", fontStyle: "italic" }}>
                            {p.preview}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: "16px", color: C.ink50, transform: openDebut === i ? "rotate(90deg)" : "none", transition: "transform .2s", flexShrink: 0, marginLeft: "8px" }}>›</span>
                    </button>
                    {openDebut === i && (
                      <div style={{ padding: "0 14px 13px" }}>
                        <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink65, lineHeight: 1.75, whiteSpace: "pre-line", margin: 0 }}>
                          {p.full}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bouton commencer */}
              <button onClick={() => setPhase("intention")} style={{
                width: "100%", background: "#111009", borderRadius: "14px", padding: "15px",
                border: "none", fontSize: "15px", fontWeight: 500, color: "#F5EFE4",
                cursor: "pointer", fontFamily: C.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
                <CrossIcon size={14} color="#F5EFE4" />
                {progress ? "Nouveau chapelet" : "Commencer le chapelet"} →
              </button>

              {/* Historique */}
              {history.length > 0 && (
                <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
                  <div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.ink12}` }}>
                    <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink35, margin: 0 }}>Historique</p>
                  </div>
                  {history.slice(0, 5).map((h, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: i < Math.min(history.length, 5) - 1 ? `1px solid ${C.ink12}` : "none" }}>
                      <span style={{ fontSize: "13px", color: C.ink }}>{MYSTERIES[h.mysteryType as MysteryType]?.short || h.mysteryType}</span>
                      <span style={{ fontSize: "11px", color: C.ink50, fontWeight: 300 }}>
                        {new Date(h.completedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {new Date(h.completedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} ✓
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {/* ════ INTENTION ════ */}
      {phase === "intention" && (
        <>
          <Header
            left={<BackBtn onClick={() => setPhase("select")} />}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65 }}>Intention</span>}
          />
          <div style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 16px 40px", textAlign: "center" }}>
            <div className="fu">
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: C.creamGold, border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CrossIcon size={20} />
              </div>
              <p style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 300, color: C.ink, marginBottom: "8px" }}>
                Pour qui priez-vous ?
              </p>
              <p style={{ fontSize: "13px", fontWeight: 300, color: C.ink50, lineHeight: 1.6, marginBottom: "22px", maxWidth: "300px", margin: "0 auto 22px" }}>
                Une intention transforme la récitation en acte d&rsquo;amour.
              </p>
              <textarea
                value={intention}
                onChange={e => setIntention(e.target.value.slice(0, 200))}
                placeholder="Pour mon père malade… Pour la paix… Pour ceux qui doutent…"
                rows={3}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: "12px",
                  border: `1.5px solid ${C.ink12}`, background: C.card, color: C.ink80,
                  fontSize: "16px", fontWeight: 300, lineHeight: 1.6,
                  fontFamily: C.serif, fontStyle: "italic",
                  resize: "none", outline: "none", marginBottom: "12px",
                  transition: "border-color .2s",
                }}
                onFocus={e => (e.target.style.borderColor = C.gold)}
                onBlur={e => (e.target.style.borderColor = C.ink12)}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={startFresh} style={{ flex: 1, padding: "12px", borderRadius: "11px", border: `1.5px solid ${C.ink12}`, background: "none", fontSize: "13px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>
                  Sans intention
                </button>
                <button onClick={startFresh} style={{ flex: 2, padding: "12px", borderRadius: "11px", background: "#111009", border: "none", color: "#F5EFE4", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
                  {intention ? "Commencer →" : "Passer →"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════ PRIÈRE EN COURS ════ */}
      {phase === "praying" && progress && currentMystery && prayerInfo && (
        <>
          <Header
            left={<button onClick={() => setPhase("select")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: C.ink50, fontFamily: C.sans }}>⏸ Pause</button>}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65 }}>Chapelet</span>}
            right={<span style={{ fontSize: "11px", color: C.gold, fontWeight: 500 }}>{MYSTERIES[progress.mysteryType].short}</span>}
          />
          <GrainTrack decadeIndex={progress.decadeIndex} grainIndex={progress.grainIndex} mysteryType={progress.mysteryType} />

          <main style={{ maxWidth: "540px", margin: "0 auto", padding: "12px 14px 40px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

              {/* Intention */}
              {progress.intention && (
                <div style={{ background: C.creamGold, borderRadius: "11px", padding: "9px 13px", border: `1px solid ${C.goldBorder}` }}>
                  <p style={{ fontSize: "12px", fontWeight: 300, color: C.ink65, fontStyle: "italic", margin: 0 }}>
                    🙏 {progress.intention}
                  </p>
                </div>
              )}

              {/* Mystère cliquable */}
              <button onClick={() => setPhase("mystery-detail")} style={{
                background: C.card, borderRadius: "13px", padding: "11px 14px",
                border: `1.5px solid ${C.cardBorder}`, textAlign: "left", width: "100%", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "10px", fontFamily: C.sans,
                transition: "border-color .15s",
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: MYSTERIES[progress.mysteryType].color, margin: "0 0 3px" }}>
                    {progress.decadeIndex + 1}e mystère {MYSTERIES[progress.mysteryType].short.toLowerCase()}
                  </p>
                  <p style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 400, color: C.ink, lineHeight: 1.15, margin: 0 }}>
                    {currentMystery.title}
                  </p>
                </div>
                <span style={{ fontSize: "11px", color: C.ink35, flexShrink: 0 }}>Méditer →</span>
              </button>

              {/* Prière courante */}
              <div style={{ background: C.cream, borderRadius: "13px", padding: "11px 14px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink50, marginBottom: "7px" }}>
                  {prayerInfo.label}
                </p>
                <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, fontStyle: "italic", color: C.ink80, lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>
                  {showFullPrayer ? prayerInfo.full : prayerInfo.preview}
                </p>
                <button onClick={() => setShowFullPrayer(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: C.gold, fontWeight: 500, padding: "5px 0 0", fontFamily: C.sans }}>
                  {showFullPrayer ? "Réduire" : "Lire en entier +"}
                </button>
              </div>

              {/* Bouton grain — grand et clair */}
              <button className="tap" onClick={advance} style={{
                width: "100%", background: tapFeedback ? C.creamGold : C.card,
                border: `2px solid ${tapFeedback ? C.gold : C.goldBorder}`,
                borderRadius: "16px", padding: "16px 14px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                cursor: "pointer", fontFamily: C.sans,
                boxShadow: tapFeedback ? `0 0 0 4px rgba(184,137,58,0.15)` : "none",
                transition: "all .12s",
              }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: C.creamGold, border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", transform: tapFeedback ? "scale(.93)" : "scale(1)", transition: "transform .1s" }}>
                  <CrossIcon size={20} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 500, color: C.ink }}>
                  {progress.grainIndex === 10 ? "Fin de dizaine" : "Grain suivant"}
                </span>
              </button>

              {/* Bas */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div className="ba" style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.gold }} />
                  <span style={{ fontSize: "11px", color: C.ink35, fontWeight: 300 }}>41 prient avec vous</span>
                </div>
                <button style={{ background: C.creamGold, border: `1px solid ${C.goldBorder}`, borderRadius: "99px", padding: "4px 11px", fontSize: "11px", color: "#6A4E20", cursor: "pointer", fontFamily: C.sans, fontWeight: 500 }}>
                  ♪ Son
                </button>
              </div>
            </div>
          </main>
        </>
      )}

      {/* ════ FATIMA — inter-dizaine ════ */}
      {phase === "fatima" && progress && (
        <>
          <Header
            left={<button onClick={() => setPhase("praying")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: C.ink50, fontFamily: C.sans }}>⏸ Pause</button>}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65 }}>Chapelet</span>}
            right={<span style={{ fontSize: "11px", color: C.gold, fontWeight: 500 }}>{progress.decadeIndex + 1}/5</span>}
          />
          <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 16px 40px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center" }}>
              <div>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: C.creamGold, border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <span style={{ color: C.gold, fontSize: "16px", fontWeight: 500 }}>✓</span>
                </div>
                <p style={{ fontSize: "15px", fontWeight: 500, color: C.ink, margin: "0 0 3px" }}>{progress.decadeIndex + 1}e dizaine terminée</p>
                <p style={{ fontSize: "12px", fontWeight: 300, color: C.ink50 }}>Gloire au Père récité</p>
              </div>

              <div style={{ background: C.creamGold, borderRadius: "16px", padding: "16px", border: `1.5px solid ${C.goldBorder}`, width: "100%", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "10px", color: C.gold }}>✦</span>
                  <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.ink50 }}>Prière de Fatima</span>
                </div>
                <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, fontStyle: "italic", color: C.ink80, lineHeight: 1.72, margin: 0 }}>
                  {FATIMA}
                </p>
              </div>

              {progress.decadeIndex < 4 && (
                <div style={{ background: C.card, borderRadius: "13px", padding: "11px 14px", border: `1.5px solid ${C.cardBorder}`, width: "100%", textAlign: "left" }}>
                  <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink35, margin: "0 0 3px" }}>
                    {progress.decadeIndex + 2}e mystère
                  </p>
                  <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 400, color: C.ink, margin: 0 }}>
                    {MYSTERIES[progress.mysteryType].items[progress.decadeIndex + 1].title}
                  </p>
                </div>
              )}

              <button onClick={afterFatima} style={{ width: "100%", background: "#111009", borderRadius: "13px", padding: "14px", border: "none", fontSize: "14px", fontWeight: 500, color: "#F5EFE4", cursor: "pointer", fontFamily: C.sans }}>
                {progress.decadeIndex < 4 ? `Continuer la ${progress.decadeIndex + 2}e dizaine →` : "Terminer le chapelet →"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ════ MYSTÈRE DÉTAIL ════ */}
      {phase === "mystery-detail" && progress && currentMystery && (
        <>
          <Header
            left={<BackBtn onClick={() => setPhase("praying")} label="Chapelet" />}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65 }}>{currentMystery.title}</span>}
            right={<span style={{ fontSize: "11px", color: C.ink35 }}>{progress.decadeIndex + 1}/5</span>}
          />
          <div style={{ maxWidth: "540px", margin: "0 auto", padding: "14px 14px 40px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Art sacré */}
              <div style={{ background: C.card, borderRadius: "16px", height: "110px", border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                {[64, 46, 30, 18].map((r, i) => (
                  <div key={i} style={{ position: "absolute", width: r * 2, height: r * 2, borderRadius: "50%", border: `1px solid rgba(184,137,58,${0.10 + i * 0.06})` }} />
                ))}
                <div style={{ position: "absolute", width: "1px", height: "60px", background: `linear-gradient(to bottom,transparent,${C.gold}55,transparent)` }} />
                <div style={{ position: "absolute", width: "32px", height: "1px", background: `linear-gradient(to right,transparent,${C.gold}45,transparent)`, top: "41%" }} />
                <p style={{ position: "absolute", bottom: "8px", right: "12px", fontSize: "10px", color: C.ink35, fontFamily: C.serif, fontStyle: "italic" }}>{currentMystery.ref}</p>
              </div>

              {/* Titre */}
              <div>
                <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: MYSTERIES[progress.mysteryType].color, margin: "0 0 4px" }}>
                  {progress.decadeIndex + 1}e mystère {MYSTERIES[progress.mysteryType].short.toLowerCase()}
                </p>
                <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.1, margin: 0 }}>
                  {currentMystery.title}
                </p>
              </div>

              {/* Verset */}
              <div style={{ background: C.card, borderRadius: "13px", padding: "13px 15px", border: `1.5px solid ${C.cardBorder}`, borderLeft: `3px solid ${C.gold}` }}>
                <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, fontStyle: "italic", color: C.ink80, lineHeight: 1.68, margin: 0 }}>
                  « {currentMystery.verse} »
                </p>
              </div>

              {/* Méditation */}
              <div style={{ background: C.cream, borderRadius: "13px", padding: "13px 15px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.ink35, marginBottom: "7px" }}>Méditation</p>
                <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, color: C.ink65, lineHeight: 1.7, margin: 0 }}>
                  {currentMystery.meditation}
                </p>
              </div>

              {/* Question */}
              <div style={{ background: C.creamGold, borderRadius: "13px", padding: "13px 15px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, marginBottom: "7px" }}>Pour vous</p>
                <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink65, lineHeight: 1.7, margin: 0 }}>
                  {currentMystery.question}
                </p>
              </div>

              {/* Silence ou retour */}
              {silenceActive ? (
                <div style={{ background: C.card, borderRadius: "13px", padding: "20px", textAlign: "center", border: `1.5px solid ${C.goldBorder}` }}>
                  <p style={{ fontFamily: C.serif, fontSize: "38px", fontWeight: 300, color: C.ink, marginBottom: "5px" }}>
                    {Math.floor(silenceLeft / 60)}:{String(silenceLeft % 60).padStart(2, "0")}
                  </p>
                  <p style={{ fontSize: "12px", color: C.ink50, marginBottom: "14px" }}>Temps de silence</p>
                  <button onClick={stopSilence} style={{ background: "none", border: `1.5px solid ${C.ink12}`, borderRadius: "99px", padding: "7px 18px", fontSize: "12px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>
                    Arrêter
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => startSilence(120)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: `1.5px solid ${C.ink12}`, background: "none", fontSize: "13px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>
                    ⏱ 2 min
                  </button>
                  <button onClick={() => setPhase("praying")} style={{ flex: 2, padding: "12px", borderRadius: "12px", background: "#111009", border: "none", color: "#F5EFE4", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
                    Prier ce mystère →
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ════ TERMINÉ ════ */}
      {phase === "complete" && (
        <>
          <Header
            left={<div style={{ width: "50px" }} />}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65 }}>Chapelet terminé</span>}
          />
          <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 14px 40px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: C.creamGold, border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <CrossIcon size={22} />
                </div>
                <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, marginBottom: "5px" }}>Chapelet terminé.</p>
                <p style={{ fontSize: "13px", fontWeight: 300, color: C.ink50, lineHeight: 1.6 }}>
                  Prenez un moment de silence avant de reprendre votre journée.
                </p>
              </div>

              {/* Fatima finale */}
              <div style={{ background: C.creamGold, borderRadius: "14px", padding: "14px 16px", border: `1.5px solid ${C.goldBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "10px", color: C.gold }}>✦</span>
                  <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.ink50 }}>Prière de Fatima</span>
                </div>
                <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink80, lineHeight: 1.7, margin: 0 }}>
                  {FATIMA}
                </p>
              </div>

              {/* Prières finales */}
              <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
                {([
                  { label: "Salve Regina", content: SALVE },
                  { label: "Ô Marie conçue sans péché, priez pour nous qui avons recours à vous." },
                  { label: "Sacré-Cœur de Jésus, j'ai confiance en vous." },
                ] as Array<{ label: string; content?: string }>).map((item, i) => {
                  const [open, setOpen] = useState(false);
                  return (
                    <div key={i} style={{ borderBottom: i < 2 ? `1px solid ${C.ink12}` : "none" }}>
                      <button onClick={() => setOpen(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 15px", background: "none", border: "none", cursor: "pointer", fontFamily: C.sans }}>
                        <span style={{ fontSize: "13px", fontWeight: 400, color: C.ink, textAlign: "left" }}>{item.label.slice(0, 45)}{item.label.length > 45 ? "…" : ""}</span>
                        {item.content && <span style={{ fontSize: "15px", color: C.ink50, transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>}
                      </button>
                      {open && item.content && (
                        <div style={{ padding: "0 15px 13px" }}>
                          <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, fontStyle: "italic", color: C.ink65, lineHeight: 1.75, whiteSpace: "pre-line", margin: 0 }}>{item.content}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Fidélité */}
              <div style={{ background: C.cream, borderRadius: "13px", padding: "12px 14px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "11px", fontWeight: 500, color: C.ink50, marginBottom: "7px" }}>Cette semaine</p>
                <div style={{ display: "flex", gap: "3px", marginBottom: "5px" }}>
                  {Array.from({ length: 7 }, (_, i) => (
                    <div key={i} style={{ flex: 1, height: "3px", borderRadius: "99px", background: i < history.length % 7 + 1 ? C.gold : C.ink12, opacity: 0.7 }} />
                  ))}
                </div>
                <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, margin: 0 }}>
                  {history.length} chapelet{history.length > 1 ? "s" : ""} prié{history.length > 1 ? "s" : ""} · Votre chemin continue demain
                </p>
              </div>

              {/* Historique */}
              {history.length > 0 && (
                <div style={{ background: C.card, borderRadius: "13px", border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
                  <div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.ink12}` }}>
                    <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink35, margin: 0 }}>Historique récent</p>
                  </div>
                  {history.slice(0, 5).map((h, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", borderBottom: i < Math.min(history.length, 5) - 1 ? `1px solid ${C.ink12}` : "none" }}>
                      <span style={{ fontSize: "13px", color: C.ink }}>{MYSTERIES[h.mysteryType as MysteryType]?.short || h.mysteryType}</span>
                      <span style={{ fontSize: "11px", fontWeight: 300, color: C.ink50 }}>
                        {new Date(h.completedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {new Date(h.completedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} ✓
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => router.push("/dashboard/spiritual")} style={{ flex: 1, padding: "13px", borderRadius: "12px", border: `1.5px solid ${C.ink12}`, background: "none", fontSize: "13px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>
                  Fermer
                </button>
                <button onClick={() => { setPhase("select"); }} style={{ flex: 2, padding: "13px", borderRadius: "12px", background: "#111009", border: "none", color: "#F5EFE4", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
                  Revenir demain →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
