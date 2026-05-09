"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
type MysteryType = "joyeux" | "lumineux" | "douloureux" | "glorieux";
type Phase = "select" | "debut" | "intention" | "praying" | "fatima" | "mystery-detail" | "complete";
type SoundMode = "silence" | "gregorian" | "ave-maria" | "communal";

interface RosaryProgress {
  mysteryType: MysteryType;
  decadeIndex: number;
  grainIndex: number;  // -1=Notre Père, 0-9=Ave Maria, 10=Gloria+Fatima
  soundMode: SoundMode;
  intention: string;
  startedAt: string;
  history?: HistoryEntry[];
}

interface HistoryEntry {
  mysteryType: string;
  completedAt: string;
  intention?: string;
}

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#F5EFE4", card: "#FFFFFF", cream: "#EDE6D8", creamGold: "#FBF7F0",
  gold: "#C49A3C", goldBorder: "rgba(196,154,60,0.28)", ink: "#111009",
  ink70: "rgba(17,16,9,0.70)", ink55: "rgba(17,16,9,0.55)",
  ink40: "rgba(17,16,9,0.40)", ink30: "rgba(17,16,9,0.30)",
  ink15: "rgba(17,16,9,0.15)", ink08: "rgba(17,16,9,0.08)",
  serif: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  sans: "'DM Sans',system-ui,sans-serif",
};

// ─── Mystères ─────────────────────────────────────────────────────────────────
const MYSTERIES: Record<MysteryType, {
  label: string; short: string; days: string; color: string;
  items: Array<{ title: string; ref: string; verse: string; meditation: string; question: string }>;
}> = {
  joyeux: {
    label: "Mystères Joyeux", short: "Joyeux", days: "Lun · Sam", color: "#B8973A",
    items: [
      { title: "L'Annonciation", ref: "Lc 1, 26-38", verse: "L'ange dit à Marie : « Réjouis-toi, comblée de grâce, le Seigneur est avec toi. »", meditation: "Marie dit oui sans tout comprendre. La foi n'est pas la certitude — c'est la confiance dans Celui qui appelle.", question: "À quoi Dieu vous invite-t-il en ce moment, même sans tout voir ?" },
      { title: "La Visitation", ref: "Lc 1, 39-56", verse: "Dès qu'Élisabeth entendit la salutation de Marie, l'enfant tressaillit en elle.", meditation: "La joie de Marie devient joie pour les autres. La présence de Dieu en nous réjouit ceux que nous approchons.", question: "Qui a besoin que vous lui apportiez de la joie cette semaine ?" },
      { title: "La Nativité", ref: "Lc 2, 1-20", verse: "Elle enfanta son fils premier-né et le coucha dans une mangeoire, car il n'y avait pas de place.", meditation: "Dieu choisit la pauvreté, le silence, la nuit. Ce que le monde ignore, Dieu l'habite.", question: "Quelle pauvreté dans votre vie est peut-être un lieu où Dieu est présent ?" },
      { title: "La Présentation au Temple", ref: "Lc 2, 22-40", verse: "Siméon prit l'enfant dans ses bras : « Mes yeux ont vu ton salut. »", meditation: "Siméon a attendu toute sa vie pour ce moment. Certaines promesses de Dieu demandent du temps.", question: "Quelle promesse de Dieu attendez-vous encore ?" },
      { title: "Le Recouvrement au Temple", ref: "Lc 2, 41-52", verse: "« Pourquoi me cherchiez-vous ? Ne saviez-vous pas que je dois être chez mon Père ? »", meditation: "Jésus grandissait en sagesse et en grâce. La foi aussi grandit dans les questions et les silences.", question: "Où cherchez-vous Jésus en ce moment dans votre vie ?" },
    ],
  },
  lumineux: {
    label: "Mystères Lumineux", short: "Lumineux", days: "Jeudi", color: "#4A7C59",
    items: [
      { title: "Le Baptême de Jésus", ref: "Mt 3, 13-17", verse: "« Celui-ci est mon Fils bien-aimé, en qui je trouve ma joie. »", meditation: "Avant toute mission, Dieu dit à Jésus qu'il est aimé. Nous aussi, avant toute action, nous sommes aimés.", question: "Croyez-vous vraiment être aimé de Dieu tel que vous êtes, maintenant ?" },
      { title: "Les Noces de Cana", ref: "Jn 2, 1-11", verse: "Marie dit : « Faites tout ce qu'il vous dira. »", meditation: "Marie remarque le manque et intercède. La grâce travaille dans les détails du quotidien.", question: "Quel manque dans votre vie pourriez-vous confier à Marie aujourd'hui ?" },
      { title: "L'Annonce du Royaume", ref: "Mc 1, 14-15", verse: "« Le Règne de Dieu est tout proche. Convertissez-vous et croyez à la Bonne Nouvelle. »", meditation: "Le Royaume n'est pas un lieu futur — il est déjà là, caché dans le réel.", question: "Où avez-vous entrevu le Royaume de Dieu cette semaine ?" },
      { title: "La Transfiguration", ref: "Mt 17, 1-8", verse: "« Son visage resplendit comme le soleil, ses vêtements devinrent blancs comme la lumière. »", meditation: "Sur le Thabor, la gloire divine transparaît à travers l'humanité de Jésus.", question: "Quelle lumière avez-vous reçue ou donnée ces derniers jours ?" },
      { title: "L'Institution de l'Eucharistie", ref: "Lc 22, 14-20", verse: "« Ceci est mon corps, donné pour vous. Faites cela en mémoire de moi. »", meditation: "Jésus se donne entièrement. L'Eucharistie n'est pas un rite — c'est une présence réelle.", question: "Comment votre participation à la messe peut-elle devenir plus vivante ?" },
    ],
  },
  douloureux: {
    label: "Mystères Douloureux", short: "Douloureux", days: "Mar · Ven", color: "#7A4A4A",
    items: [
      { title: "L'Agonie à Gethsémani", ref: "Lc 22, 39-46", verse: "« Père, si tu veux, éloigne de moi cette coupe. Cependant, que ta volonté soit faite. »", meditation: "Jésus a peur et tremble. La prière n'est pas l'absence de l'angoisse — c'est la confiance au milieu d'elle.", question: "Quelle coupe vous est-il difficile d'accepter en ce moment ?" },
      { title: "La Flagellation", ref: "Jn 19, 1", verse: "« Pilate prit alors Jésus et le fit flageller. »", meditation: "Le corps de Jésus porte les blessures de nos violences. Il rejoint chaque personne brisée.", question: "Comment porter avec Jésus la souffrance de ceux qui vous entourent ?" },
      { title: "Le Couronnement d'épines", ref: "Jn 19, 2-3", verse: "« Les soldats tressèrent une couronne d'épines et la posèrent sur sa tête. »", meditation: "Jésus est couronné dans l'humiliation — et c'est dans cette faiblesse qu'il règne.", question: "Où dans votre vie avez-vous du mal à accepter l'humiliation ?" },
      { title: "Le Portement de Croix", ref: "Lc 23, 26-32", verse: "« Ils imposèrent à Simon de Cyrène la croix pour qu'il la porte derrière Jésus. »", meditation: "Simon aide Jésus sans l'avoir choisi. Parfois, c'est précisément là que se trouve la grâce.", question: "Quelle croix portez-vous en ce moment ? La portez-vous seul ?" },
      { title: "La Crucifixion", ref: "Jn 19, 17-30", verse: "« Tout est accompli. » Et, inclinant la tête, il remit l'esprit.", meditation: "Tout est accompli — ce ne sont pas des mots de défaite mais l'achèvement d'un amour total.", question: "Qu'est-ce que vous n'arrivez pas encore à remettre entièrement à Dieu ?" },
    ],
  },
  glorieux: {
    label: "Mystères Glorieux", short: "Glorieux", days: "Mer · Dim", color: "#3A5A8A",
    items: [
      { title: "La Résurrection", ref: "Jn 20, 11-18", verse: "« Jésus lui dit : Marie ! Elle se retourna et lui dit : Rabbouni ! »", meditation: "Jésus appelle Marie par son prénom. Il nous appelle chacun par notre nom.", question: "Vous sentez-vous appelé personnellement par Dieu aujourd'hui ?" },
      { title: "L'Ascension", ref: "Ac 1, 6-11", verse: "« Je suis avec vous tous les jours jusqu'à la fin du monde. »", meditation: "Jésus part, mais sa présence demeure. L'Ascension n'est pas une absence — c'est une présence différente.", question: "Comment reconnaissez-vous la présence de Jésus dans votre quotidien ?" },
      { title: "La Pentecôte", ref: "Ac 2, 1-13", verse: "« Ils furent tous remplis de l'Esprit Saint et se mirent à parler. »", meditation: "L'Esprit rassemble ce que la peur avait dispersé. La communauté naît dans le feu d'un amour partagé.", question: "Quel don de l'Esprit manque le plus à votre communauté ?" },
      { title: "L'Assomption de Marie", ref: "Ap 12, 1", verse: "« Une femme enveloppée du soleil, la lune sous ses pieds. »", meditation: "Marie est élevée en corps et en âme — signe de notre propre destinée.", question: "Quelle espérance la résurrection vous donne-t-elle pour votre vie ?" },
      { title: "Le Couronnement de Marie", ref: "Ps 45, 10", verse: "« La Reine se tient à ta droite, parée d'or. »", meditation: "Marie règne non par la puissance mais par l'amour. Son couronnement est le triomphe de l'humilité.", question: "Comment Marie vous aide-t-elle à vivre votre foi aujourd'hui ?" },
    ],
  },
};

// ─── Prières ──────────────────────────────────────────────────────────────────
const NOTRE_PERE = `Notre Père, qui es aux cieux,\nque ton nom soit sanctifié,\nque ton règne vienne,\nque ta volonté soit faite\nsur la terre comme au ciel.\n\nDonne-nous aujourd'hui notre pain de ce jour.\nPardonne-nous nos offenses,\ncomme nous pardonnons aussi\nà ceux qui nous ont offensés.\n\nEt ne nous soumets pas à la tentation,\nmais délivre-nous du mal. Amen.`;
const AVE_MARIA = `Je vous salue, Marie pleine de grâce,\nle Seigneur est avec vous.\nVous êtes bénie entre toutes les femmes\net Jésus, le fruit de vos entrailles, est béni.\n\nSainte Marie, Mère de Dieu,\npriez pour nous pauvres pécheurs,\nmaintenant et à l'heure de notre mort. Amen.`;
const GLOIRE = `Gloire au Père, et au Fils, et au Saint-Esprit,\ncomme il était au commencement,\nmaintenant et toujours,\ndans les siècles des siècles. Amen.`;
const FATIMA = `Ô mon Jésus, pardonnez-nous nos péchés,\npréservez-nous du feu de l'enfer,\net conduisez au Ciel toutes les âmes,\nspécialement celles qui ont le plus besoin\nde votre miséricorde. Amen.`;
const CREDO = `Je crois en Dieu, le Père tout-puissant,\nCréateur du ciel et de la terre.\nEt en Jésus-Christ, son Fils unique, notre Seigneur,\nqui a été conçu du Saint-Esprit,\nest né de la Vierge Marie,\na souffert sous Ponce Pilate,\na été crucifié, est mort, et a été enseveli,\nest descendu aux enfers,\nle troisième jour est ressuscité des morts,\nest monté aux cieux,\nest assis à la droite de Dieu le Père tout-puissant,\nd'où il viendra juger les vivants et les morts.\nJe crois en l'Esprit Saint,\nà la sainte Église catholique,\nà la communion des saints,\nà la rémission des péchés,\nà la résurrection de la chair,\nà la vie éternelle. Amen.`;
const SALVE = `Salve, Regina, Mater misericordiae,\nvita, dulcedo et spes nostra, salve.\nAd te clamamus, exsules filii Evae,\nad te suspiramus, gementes et flentes\nin hac lacrimarum valle.\nEia ergo, advocata nostra,\nillos tuos misericordes oculos ad nos converte.\nEt Jesum, benedictum fructum ventris tui,\nnobis post hoc exsilium ostende.\nO clemens, o pia, o dulcis Virgo Maria.`;

const STORAGE_KEY = "fraternitas_rosary_v2";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPrayer(grainIndex: number): { label: string; preview: string; full: string } {
  if (grainIndex === -1) return { label: "Notre Père", preview: "Notre Père, qui es aux cieux,\nque ton nom soit sanctifié…", full: NOTRE_PERE };
  if (grainIndex >= 0 && grainIndex <= 9) return { label: `Ave Maria ${grainIndex + 1}/10`, preview: "Je vous salue, Marie pleine de grâce,\nle Seigneur est avec vous…", full: AVE_MARIA };
  return { label: "Gloire au Père", preview: "Gloire au Père, et au Fils, et au Saint-Esprit…", full: GLOIRE };
}

function getTodayMystery(): MysteryType {
  const d = new Date().getDay();
  if (d === 1 || d === 6) return "joyeux";
  if (d === 2 || d === 5) return "douloureux";
  if (d === 4) return "lumineux";
  return "glorieux";
}

function saveProgress(p: RosaryProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* silencieux */ }
}
function clearProgress() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* silencieux */ }
}
function loadProgress(): RosaryProgress | null {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

// ─── Composants réutilisables ─────────────────────────────────────────────────
function Header({ left, right, title, subtitle }: {
  left: React.ReactNode; right?: React.ReactNode; title: string; subtitle?: string;
}) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 30,
      background: "rgba(245,239,228,0.94)", backdropFilter: "blur(14px)",
      borderBottom: `1px solid ${C.ink08}`,
      padding: "10px 14px 8px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ minWidth: "60px" }}>{left}</div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: C.serif, fontSize: "16px", color: C.ink70, margin: 0, lineHeight: 1.2 }}>{title}</p>
        {subtitle && <p style={{ fontSize: "9px", color: C.ink40, margin: "1px 0 0", fontFamily: C.sans }}>{subtitle}</p>}
      </div>
      <div style={{ minWidth: "60px", display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}

function BackBtn({ onClick, label = "Retour" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", cursor: "pointer", padding: 0,
      fontSize: "12px", color: C.ink40, fontFamily: C.sans,
      display: "flex", alignItems: "center", gap: "4px",
    }}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}

// Visualisation des grains du chapelet
function GrainTrack({ decadeIndex, grainIndex, mysteryType }: {
  decadeIndex: number; grainIndex: number; mysteryType: MysteryType;
}) {
  const color = MYSTERIES[mysteryType].color;
  return (
    <div style={{
      background: "rgba(245,239,228,0.95)", padding: "6px 14px 7px",
      borderBottom: `1px solid ${C.ink08}`,
    }}>
      {/* 5 dizaines */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} style={{
            flex: 1, height: "2px", borderRadius: "99px",
            background: i < decadeIndex ? "#111009" : i === decadeIndex ? color : "rgba(17,16,9,0.10)",
            opacity: i < decadeIndex ? 0.65 : i === decadeIndex ? 0.6 : 1,
            transition: "all .3s",
          }} />
        ))}
      </div>
      {/* Grains de la dizaine */}
      <div style={{ display: "flex", gap: "4px", alignItems: "center", justifyContent: "center" }}>
        {/* Notre Père */}
        <div style={{
          width: "10px", height: "10px", borderRadius: "50%",
          background: grainIndex >= 0 ? "#111009" : color,
          opacity: grainIndex >= 0 ? 0.7 : 1,
          boxShadow: grainIndex === -1 ? `0 0 8px ${color}66` : "none",
          transition: "all .25s",
          flexShrink: 0,
        }} />
        <div style={{ width: "3px", height: "1px", background: C.ink15 }} />
        {/* 10 Ave Maria */}
        {Array.from({ length: 10 }, (_, i) => {
          const done = grainIndex > i || grainIndex >= 10;
          const current = grainIndex === i;
          const pending = grainIndex < i && grainIndex < 10;
          return (
            <div key={i} style={{
              width: current ? "10px" : "7px",
              height: current ? "10px" : "7px",
              borderRadius: "50%",
              background: done ? "#111009" : current ? color : "rgba(17,16,9,0.12)",
              opacity: done ? 0.7 : 1,
              boxShadow: current ? `0 0 8px ${color}66` : "none",
              transition: "all .25s cubic-bezier(.34,1.56,.64,1)",
              flexShrink: 0,
            }} />
          );
        })}
      </div>
      <p style={{ fontSize: "8px", color: C.ink30, textAlign: "center", margin: "3px 0 0", fontFamily: C.sans }}>
        Dizaine {decadeIndex + 1}/5 ·{" "}
        {grainIndex === -1 ? "Notre Père" : grainIndex >= 10 ? "Gloire au Père" : `Ave Maria ${grainIndex + 1}/10`}
      </p>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ChapeletPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("select");
  const [selected, setSelected] = useState<MysteryType>(getTodayMystery());
  const [sound, setSound] = useState<SoundMode>("silence");
  const [intention, setIntention] = useState("");
  const [progress, setProgress] = useState<RosaryProgress | null>(null);
  const [showFullPrayer, setShowFullPrayer] = useState(false);
  const [showDebut, setShowDebut] = useState(false);
  const [tapFeedback, setTapFeedback] = useState(false);
  const [silenceActive, setSilenceActive] = useState(false);
  const [silenceLeft, setSilenceLeft] = useState(120);
  const silenceRef = useRef<NodeJS.Timeout | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const p = loadProgress();
    if (p) { setProgress(p); setSelected(p.mysteryType); setHistory(p.history || []); }
  }, []);

  const doSave = useCallback((p: RosaryProgress) => {
    saveProgress(p); setProgress(p);
  }, []);

  const startFresh = useCallback(() => {
    const p: RosaryProgress = {
      mysteryType: selected, decadeIndex: 0, grainIndex: -1,
      soundMode: sound, intention, startedAt: new Date().toISOString(),
      history,
    };
    doSave(p); setPhase("praying"); setShowFullPrayer(false);
  }, [selected, sound, intention, history, doSave]);

  const advance = useCallback(() => {
    if (!progress) return;
    setTapFeedback(true);
    setTimeout(() => setTapFeedback(false), 180);
    setShowFullPrayer(false);
    const { decadeIndex, grainIndex } = progress;

    if (grainIndex === -1) {
      // Notre Père → Ave Maria 0
      doSave({ ...progress, grainIndex: 0 });
    } else if (grainIndex < 9) {
      doSave({ ...progress, grainIndex: grainIndex + 1 });
    } else if (grainIndex === 9) {
      doSave({ ...progress, grainIndex: 10 });
    } else if (grainIndex === 10) {
      // Après Gloria → afficher Fatima
      setPhase("fatima");
    }
  }, [progress, doSave]);

  const afterFatima = useCallback(() => {
    if (!progress) return;
    if (progress.decadeIndex < 4) {
      doSave({ ...progress, decadeIndex: progress.decadeIndex + 1, grainIndex: -1 });
      setPhase("praying");
    } else {
      // Fin du chapelet
      const entry: HistoryEntry = {
        mysteryType: progress.mysteryType,
        completedAt: new Date().toISOString(),
        intention: progress.intention,
      };
      const newHistory = [entry, ...history].slice(0, 20);
      clearProgress();
      setHistory(newHistory);
      setPhase("complete");
    }
  }, [progress, history, doSave]);

  const prayerInfo = progress ? getPrayer(progress.grainIndex) : null;
  const currentMystery = progress ? MYSTERIES[progress.mysteryType].items[progress.decadeIndex] : null;

  // Silence timer
  const startSilence = (secs: number) => {
    setSilenceLeft(secs); setSilenceActive(true);
    silenceRef.current = setInterval(() => {
      setSilenceLeft(prev => {
        if (prev <= 1) { clearInterval(silenceRef.current!); setSilenceActive(false); return 0; }
        return prev - 1;
      });
    }, 1000);
  };
  const stopSilence = () => {
    if (silenceRef.current) clearInterval(silenceRef.current);
    setSilenceActive(false); setSilenceLeft(120);
  };
  useEffect(() => () => { if (silenceRef.current) clearInterval(silenceRef.current); }, []);

  const todayMystery = getTodayMystery();
  const rosaryPercent = progress
    ? Math.round(((progress.decadeIndex * 10 + Math.max(0, progress.grainIndex + 1)) / 50) * 100)
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes grainPulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .fu { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) both; }
        .pulse { animation: grainPulse 2s ease-in-out infinite; }
        .btn-tap { cursor:pointer; transition: transform .1s; }
        .btn-tap:active { transform: scale(0.96); }
      `}</style>

      {/* ══════════════════════════════════════════
          PHASE : SÉLECTION
      ══════════════════════════════════════════ */}
      {phase === "select" && (
        <>
          <Header
            title="Le Chapelet"
            left={<BackBtn onClick={() => router.push("/dashboard/spiritual")} label="Prions" />}
            right={progress ? (
              <span style={{ fontSize: "11px", color: C.gold, fontWeight: 500 }}>{rosaryPercent}%</span>
            ) : undefined}
          />
          <main style={{ maxWidth: "540px", margin: "0 auto", padding: "14px 14px 80px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Reprendre si en cours */}
              {progress && (
                <div style={{
                  background: C.card, borderRadius: "14px", padding: "12px 14px",
                  border: `1.5px solid ${C.goldBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
                }}>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 500, color: C.ink, margin: "0 0 2px" }}>En cours</p>
                    <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink40, margin: 0 }}>
                      {MYSTERIES[progress.mysteryType].label} · Dizaine {progress.decadeIndex + 1}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => { clearProgress(); setProgress(null); }} style={{
                      background: "none", border: `1.5px solid ${C.ink15}`, borderRadius: "99px",
                      padding: "6px 12px", fontSize: "11px", cursor: "pointer", color: C.ink40, fontFamily: C.sans,
                    }}>Recommencer</button>
                    <button onClick={() => setPhase("praying")} style={{
                      background: C.gold, border: "none", borderRadius: "99px",
                      padding: "6px 14px", fontSize: "11px", fontWeight: 500,
                      cursor: "pointer", color: "#1C1A12", fontFamily: C.sans,
                    }}>Reprendre →</button>
                  </div>
                </div>
              )}

              {/* 4 mystères */}
              <div>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink30, marginBottom: "8px" }}>
                  Choisir un mystère
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {(Object.entries(MYSTERIES) as [MysteryType, typeof MYSTERIES.joyeux][]).map(([key, m]) => (
                    <button key={key} onClick={() => setSelected(key)} style={{
                      background: selected === key ? C.creamGold : C.card,
                      border: selected === key ? `2px solid rgba(196,154,60,0.45)` : `1.5px solid ${C.ink08}`,
                      borderRadius: "14px", padding: "11px 12px",
                      textAlign: "left", cursor: "pointer", position: "relative",
                      transition: "all .15s", fontFamily: C.sans,
                    }}>
                      {key === todayMystery && (
                        <div style={{ position: "absolute", top: "-1px", right: "10px", background: C.gold, borderRadius: "0 0 5px 5px", padding: "1px 6px" }}>
                          <span style={{ fontSize: "7px", fontWeight: 500, color: "#1C1A12" }}>
                            {new Date().toLocaleDateString("fr-FR", { weekday: "short" }).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: m.color, marginBottom: "7px" }} />
                      <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 400, color: C.ink, lineHeight: 1.1, marginBottom: "3px" }}>
                        {m.short}
                      </p>
                      <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink40, margin: 0 }}>{m.days}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prières du début */}
              <div style={{ borderTop: `1px solid ${C.ink08}`, paddingTop: "10px" }}>
                <button onClick={() => setShowDebut(v => !v)} style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0 0 8px", fontFamily: C.sans,
                }}>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "12px", fontWeight: 500, color: C.ink, margin: 0 }}>Prières du début</p>
                    <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink40, margin: "1px 0 0" }}>Credo · Notre Père · 3 Ave · Gloire au Père</p>
                  </div>
                  <span style={{ fontSize: "12px", color: C.gold, transform: showDebut ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
                </button>
                {showDebut && (
                  <div className="fu" style={{ background: C.cream, borderRadius: "12px", padding: "12px 14px", border: `1px solid ${C.goldBorder}` }}>
                    {[
                      { label: "Je crois en Dieu (Credo)", full: CREDO },
                      { label: "Notre Père", full: NOTRE_PERE },
                      { label: "3 × Je vous salue Marie", full: AVE_MARIA },
                      { label: "Gloire au Père", full: GLOIRE },
                    ].map((item, i) => (
                      <div key={i} style={{ marginBottom: i < 3 ? "10px" : 0 }}>
                        <p style={{ fontSize: "11px", fontWeight: 500, color: C.ink, marginBottom: "4px" }}>{item.label}</p>
                        <p style={{ fontFamily: C.serif, fontSize: "13px", fontWeight: 300, fontStyle: "italic", color: C.ink55, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                          {item.full.split("\n\n")[0]}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bouton commencer */}
              <button onClick={() => setPhase("intention")} style={{
                width: "100%", background: "#111009", borderRadius: "14px", padding: "14px",
                border: "none", fontSize: "14px", fontWeight: 500, color: "#F5EFE4",
                cursor: "pointer", fontFamily: C.sans, transition: "opacity .15s",
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                {progress ? "Nouveau chapelet →" : "Commencer le chapelet →"}
              </button>

              {/* Historique */}
              {history.length > 0 && (
                <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.ink08}`, overflow: "hidden" }}>
                  <div style={{ padding: "8px 14px", borderBottom: `1px solid ${C.ink08}` }}>
                    <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.ink30, margin: 0 }}>
                      Historique récent
                    </p>
                  </div>
                  {history.slice(0, 5).map((h, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 14px", borderBottom: i < Math.min(history.length, 5) - 1 ? `1px solid ${C.ink08}` : "none",
                    }}>
                      <span style={{ fontSize: "12px", color: C.ink }}>{MYSTERIES[h.mysteryType as MysteryType]?.short || h.mysteryType}</span>
                      <span style={{ fontSize: "10px", color: C.ink40, fontWeight: 300 }}>
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

      {/* ══════════════════════════════════════════
          PHASE : INTENTION
      ══════════════════════════════════════════ */}
      {phase === "intention" && (
        <>
          <Header title="Intention" left={<BackBtn onClick={() => setPhase("select")} />} />
          <main style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 16px 80px", textAlign: "center" }}>
            <div className="fu">
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(196,154,60,0.1)", border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke={C.gold} strokeWidth="1.2"/><line x1="14" y1="5" x2="14" y2="23" stroke={C.gold} strokeWidth="1.2"/><line x1="8" y1="11" x2="20" y2="11" stroke={C.gold} strokeWidth="1.2"/></svg>
              </div>
              <p style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 300, color: C.ink, marginBottom: "8px" }}>
                Pour qui priez-vous ?
              </p>
              <p style={{ fontSize: "13px", fontWeight: 300, color: C.ink40, lineHeight: 1.6, marginBottom: "24px", maxWidth: "320px", margin: "0 auto 24px" }}>
                Une intention transforme la récitation en acte d&rsquo;amour. Elle restera présente pendant toute votre prière.
              </p>
              <textarea
                value={intention}
                onChange={e => setIntention(e.target.value.slice(0, 200))}
                placeholder="Pour mon père malade… Pour la paix… Pour ceux qui doutent…"
                rows={4}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: "12px",
                  border: `1.5px solid ${C.ink15}`, background: C.card, color: C.ink,
                  fontSize: "15px", fontWeight: 300, lineHeight: 1.65,
                  fontFamily: C.serif, fontStyle: "italic",
                  resize: "none", outline: "none", marginBottom: "12px",
                  transition: "border-color .2s",
                }}
                onFocus={e => (e.target.style.borderColor = C.gold)}
                onBlur={e => (e.target.style.borderColor = C.ink15)}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={startFresh} style={{
                  flex: 1, padding: "12px", borderRadius: "11px",
                  border: `1.5px solid ${C.ink15}`, background: "none",
                  fontSize: "13px", color: C.ink40, cursor: "pointer", fontFamily: C.sans,
                }}>
                  Sans intention
                </button>
                <button onClick={startFresh} style={{
                  flex: 2, padding: "12px", borderRadius: "11px",
                  background: "#111009", border: "none", color: "#F5EFE4",
                  fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans,
                }}>
                  {intention ? "Commencer →" : "Passer →"}
                </button>
              </div>
            </div>
          </main>
        </>
      )}

      {/* ══════════════════════════════════════════
          PHASE : PRIÈRE EN COURS
      ══════════════════════════════════════════ */}
      {phase === "praying" && progress && currentMystery && prayerInfo && (
        <>
          <Header
            title="Chapelet"
            subtitle={MYSTERIES[progress.mysteryType].short}
            left={
              <button onClick={() => setPhase("select")} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "12px", color: C.ink40, fontFamily: C.sans,
                display: "flex", alignItems: "center", gap: "3px",
              }}>
                ⏸ Pause
              </button>
            }
            right={
              <span style={{ fontSize: "10px", color: C.gold, fontWeight: 500 }}>{rosaryPercent}%</span>
            }
          />

          {/* Grains — toujours visible */}
          <GrainTrack
            decadeIndex={progress.decadeIndex}
            grainIndex={progress.grainIndex}
            mysteryType={progress.mysteryType}
          />

          <main style={{ maxWidth: "540px", margin: "0 auto", padding: "12px 14px 80px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

              {/* Intention si présente */}
              {progress.intention && (
                <div style={{ background: "rgba(196,154,60,0.07)", borderRadius: "10px", padding: "8px 12px", border: `1px solid ${C.goldBorder}` }}>
                  <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink55, fontStyle: "italic", margin: 0 }}>
                    🙏 {progress.intention}
                  </p>
                </div>
              )}

              {/* Mystère cliquable */}
              <button onClick={() => setPhase("mystery-detail")} style={{
                background: C.card, borderRadius: "13px", padding: "10px 13px",
                border: `1.5px solid ${C.ink08}`, textAlign: "left", width: "100%", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "10px", fontFamily: C.sans,
                transition: "border-color .15s",
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = C.goldBorder)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = C.ink08)}
              >
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: MYSTERIES[progress.mysteryType].color }}>
                    {progress.decadeIndex + 1}e mystère {MYSTERIES[progress.mysteryType].short.toLowerCase()}
                  </span>
                  <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 400, color: C.ink, lineHeight: 1.15, margin: "2px 0 0" }}>
                    {currentMystery.title}
                  </p>
                </div>
                <span style={{ fontSize: "10px", color: C.ink30, flexShrink: 0 }}>Méditer →</span>
              </button>

              {/* Prière courante */}
              <div style={{ background: C.cream, borderRadius: "13px", padding: "10px 13px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.ink40, marginBottom: "6px" }}>
                  {prayerInfo.label}
                </p>
                <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink70, lineHeight: 1.55, margin: 0, whiteSpace: "pre-line" }}>
                  {showFullPrayer ? prayerInfo.full : prayerInfo.preview}
                </p>
                <button onClick={() => setShowFullPrayer(v => !v)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "10px", color: C.gold, fontWeight: 500,
                  padding: "5px 0 0", fontFamily: C.sans,
                }}>
                  {showFullPrayer ? "Réduire" : "Lire en entier +"}
                </button>
              </div>

              {/* Bouton grain — grand, sticky */}
              <button className="btn-tap" onClick={advance} style={{
                width: "100%", background: tapFeedback ? "rgba(196,154,60,0.1)" : C.card,
                border: `2px solid rgba(196,154,60,${tapFeedback ? 0.55 : 0.32})`,
                borderRadius: "16px", padding: "16px 14px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                cursor: "pointer", fontFamily: C.sans,
                boxShadow: tapFeedback ? `0 0 0 4px rgba(196,154,60,0.12)` : "none",
                transition: "all .12s",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%",
                  background: "rgba(196,154,60,0.1)", border: `1.5px solid rgba(196,154,60,0.3)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: tapFeedback ? "scale(0.93)" : "scale(1)", transition: "transform .1s",
                }}>
                  <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="12" stroke={C.gold} strokeWidth="1.2" />
                    <line x1="14" y1="5" x2="14" y2="23" stroke={C.gold} strokeWidth="1.2" />
                    <line x1="8" y1="11" x2="20" y2="11" stroke={C.gold} strokeWidth="1.2" />
                  </svg>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 500, color: C.ink }}>
                  {progress.grainIndex === 10 ? "Gloire au Père · Continuer" : "Grain suivant"}
                </span>
              </button>

              {/* Bas d'écran */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div className="pulse" style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.gold, opacity: 0.5 }} />
                  <span style={{ fontSize: "10px", color: C.ink30, fontWeight: 300 }}>41 prient avec vous</span>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button style={{
                    background: "rgba(17,16,9,0.05)", border: "none", borderRadius: "99px",
                    padding: "4px 10px", fontSize: "10px", color: C.ink40, cursor: "pointer", fontFamily: C.sans,
                  }}>♪ Son</button>
                  <button style={{
                    background: "rgba(196,154,60,0.08)", border: `1px solid ${C.goldBorder}`, borderRadius: "99px",
                    padding: "4px 10px", fontSize: "10px", color: "#8A6A20", cursor: "pointer", fontFamily: C.sans,
                  }}>🙏 Offrir</button>
                </div>
              </div>
            </div>
          </main>
        </>
      )}

      {/* ══════════════════════════════════════════
          PHASE : PRIÈRE DE FATIMA (inter-dizaine)
      ══════════════════════════════════════════ */}
      {phase === "fatima" && progress && (
        <>
          <Header
            title="Chapelet"
            subtitle={MYSTERIES[progress.mysteryType].short}
            left={<button onClick={() => setPhase("praying")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: C.ink40, fontFamily: C.sans }}>⏸ Pause</button>}
          />
          <main style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 16px 80px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center" }}>

              {/* Dizaine terminée */}
              <div>
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(196,154,60,0.1)", border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <span style={{ color: C.gold, fontSize: "16px" }}>✓</span>
                </div>
                <p style={{ fontSize: "14px", fontWeight: 500, color: C.ink, margin: "0 0 3px" }}>
                  {progress.decadeIndex + 1}e dizaine terminée
                </p>
                <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink40 }}>Gloire au Père récité</p>
              </div>

              {/* Prière de Fatima */}
              <div style={{
                background: C.creamGold, borderRadius: "16px", padding: "14px 16px",
                border: `1.5px solid rgba(196,154,60,0.3)`, width: "100%", textAlign: "left",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "9px", color: C.gold }}>✦</span>
                  <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink40 }}>Prière de Fatima</span>
                </div>
                <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, fontStyle: "italic", color: C.ink70, lineHeight: 1.7, margin: 0 }}>
                  {FATIMA}
                </p>
              </div>

              {/* Mystère suivant si pas dernier */}
              {progress.decadeIndex < 4 && (
                <div style={{ background: C.card, borderRadius: "12px", padding: "10px 14px", border: `1.5px solid ${C.ink08}`, width: "100%", textAlign: "left" }}>
                  <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.ink30 }}>
                    {progress.decadeIndex + 2}e mystère
                  </span>
                  <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 400, color: C.ink, lineHeight: 1.15, margin: "2px 0 1px" }}>
                    {MYSTERIES[progress.mysteryType].items[progress.decadeIndex + 1].title}
                  </p>
                  <p style={{ fontSize: "10px", color: C.ink40, margin: 0 }}>Appuyer pour méditer →</p>
                </div>
              )}

              {/* Bouton continuer */}
              <button onClick={afterFatima} style={{
                width: "100%", background: "#111009", borderRadius: "13px", padding: "14px",
                border: "none", fontSize: "14px", fontWeight: 500, color: "#F5EFE4",
                cursor: "pointer", fontFamily: C.sans,
              }}>
                {progress.decadeIndex < 4
                  ? `Continuer la ${progress.decadeIndex + 2}e dizaine →`
                  : "Terminer le chapelet →"}
              </button>
            </div>
          </main>
        </>
      )}

      {/* ══════════════════════════════════════════
          PHASE : DÉTAIL MYSTÈRE
      ══════════════════════════════════════════ */}
      {phase === "mystery-detail" && progress && currentMystery && (
        <>
          <Header
            title="Mystère"
            subtitle={`${progress.decadeIndex + 1}/5`}
            left={<BackBtn onClick={() => setPhase("praying")} label="Chapelet" />}
          />
          <main style={{ maxWidth: "540px", margin: "0 auto", padding: "14px 14px 80px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Art sacré lumineux */}
              <div style={{
                background: C.card, borderRadius: "18px", height: "120px",
                border: `1.5px solid rgba(196,154,60,0.22)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}>
                {[68, 50, 34, 20].map((r, i) => (
                  <div key={i} style={{ position: "absolute", width: r * 2, height: r * 2, borderRadius: "50%", border: `1px solid rgba(196,154,60,${0.09 + i * 0.05})` }} />
                ))}
                <div style={{ position: "absolute", width: "1px", height: "66px", background: "linear-gradient(to bottom,transparent,rgba(196,154,60,0.42),transparent)" }} />
                <div style={{ position: "absolute", width: "36px", height: "1px", background: "linear-gradient(to right,transparent,rgba(196,154,60,0.35),transparent)", top: "41%" }} />
                <p style={{ position: "absolute", bottom: "8px", right: "12px", fontSize: "9px", color: C.ink30, fontFamily: C.serif, fontStyle: "italic" }}>
                  {currentMystery.ref}
                </p>
              </div>

              {/* Titre */}
              <div>
                <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: MYSTERIES[progress.mysteryType].color }}>
                  {progress.decadeIndex + 1}e mystère {MYSTERIES[progress.mysteryType].short.toLowerCase()}
                </span>
                <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.1, margin: "4px 0 0" }}>
                  {currentMystery.title}
                </p>
              </div>

              {/* Verset */}
              <div style={{ background: C.card, borderRadius: "13px", padding: "12px 14px", border: `1.5px solid ${C.ink08}`, borderLeft: `2.5px solid rgba(196,154,60,0.45)` }}>
                <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink70, lineHeight: 1.65, margin: 0 }}>
                  « {currentMystery.verse} »
                </p>
              </div>

              {/* Méditation */}
              <div style={{ background: C.cream, borderRadius: "13px", padding: "12px 14px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: C.ink30, marginBottom: "6px" }}>Méditation</p>
                <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink55, lineHeight: 1.68, margin: 0 }}>
                  {currentMystery.meditation}
                </p>
              </div>

              {/* Question */}
              <div style={{ background: "rgba(196,154,60,0.06)", borderRadius: "13px", padding: "12px 14px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold, marginBottom: "6px" }}>Pour vous</p>
                <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, fontStyle: "italic", color: C.ink55, lineHeight: 1.68, margin: 0 }}>
                  {currentMystery.question}
                </p>
              </div>

              {/* Silence ou retour */}
              {silenceActive ? (
                <div style={{ background: C.card, borderRadius: "13px", padding: "20px", textAlign: "center", border: `1.5px solid ${C.goldBorder}` }}>
                  <p style={{ fontFamily: C.serif, fontSize: "36px", fontWeight: 300, color: C.ink, marginBottom: "4px" }}>
                    {Math.floor(silenceLeft / 60)}:{String(silenceLeft % 60).padStart(2, "0")}
                  </p>
                  <p style={{ fontSize: "11px", color: C.ink40, marginBottom: "12px" }}>Temps de silence</p>
                  <button onClick={stopSilence} style={{
                    background: "none", border: `1.5px solid ${C.ink15}`, borderRadius: "99px",
                    padding: "6px 16px", fontSize: "11px", color: C.ink40, cursor: "pointer", fontFamily: C.sans,
                  }}>
                    Arrêter
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => startSilence(120)} style={{
                    flex: 1, padding: "12px", borderRadius: "11px",
                    border: `1.5px solid ${C.ink15}`, background: "none",
                    fontSize: "12px", color: C.ink40, cursor: "pointer", fontFamily: C.sans,
                  }}>
                    ⏱ 2 min silence
                  </button>
                  <button onClick={() => setPhase("praying")} style={{
                    flex: 2, padding: "12px", borderRadius: "11px",
                    background: "#111009", border: "none", color: "#F5EFE4",
                    fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans,
                  }}>
                    Prier ce mystère →
                  </button>
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {/* ══════════════════════════════════════════
          PHASE : CHAPELET TERMINÉ
      ══════════════════════════════════════════ */}
      {phase === "complete" && (
        <>
          <Header title="Chapelet terminé" left={<div style={{ width: "50px" }} />} />
          <main style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 16px 80px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Clôture */}
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(196,154,60,0.1)", border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <svg width="20" height="20" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke={C.gold} strokeWidth="1.2"/><line x1="14" y1="5" x2="14" y2="23" stroke={C.gold} strokeWidth="1.2"/><line x1="8" y1="11" x2="20" y2="11" stroke={C.gold} strokeWidth="1.2"/></svg>
                </div>
                <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, marginBottom: "4px" }}>Chapelet terminé.</p>
                <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink40, lineHeight: 1.6 }}>
                  Prenez un moment de silence avant de reprendre votre journée.
                </p>
              </div>

              {/* Fatima clôture */}
              <div style={{ background: C.creamGold, borderRadius: "14px", padding: "12px 14px", border: `1px solid ${C.goldBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "9px", color: C.gold }}>✦</span>
                  <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink40 }}>Prière de Fatima</span>
                </div>
                <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, fontStyle: "italic", color: C.ink70, lineHeight: 1.65, margin: 0 }}>
                  {FATIMA}
                </p>
              </div>

              {/* Prières finales */}
              <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.ink08}`, overflow: "hidden" }}>
                {[
                  { label: "Salve Regina", content: SALVE },
                  { label: "Ô Marie conçue sans péché, priez pour nous qui avons recours à vous." },
                  { label: "Sacré-Cœur de Jésus, j'ai confiance en vous." },
                ].map((item, i) => {
                  const [open, setOpen] = useState(false);
                  return (
                    <div key={i} style={{ borderBottom: i < 2 ? `1px solid ${C.ink08}` : "none" }}>
                      <button onClick={() => setOpen(v => !v)} style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "11px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: C.sans,
                      }}>
                        <span style={{ fontSize: "12px", color: C.ink, fontWeight: 400 }}>{item.label.slice(0, 40)}{item.label.length > 40 ? "…" : ""}</span>
                        <span style={{ fontSize: "13px", color: C.gold, transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
                      </button>
                      {open && item.content && (
                        <div style={{ padding: "0 14px 12px" }}>
                          <p style={{ fontFamily: C.serif, fontSize: "13px", fontWeight: 300, fontStyle: "italic", color: C.ink55, lineHeight: 1.75, whiteSpace: "pre-line", margin: 0 }}>
                            {item.content}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Fidélité */}
              <div style={{ background: C.cream, borderRadius: "13px", padding: "11px 14px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "10px", fontWeight: 500, color: C.ink40, marginBottom: "6px" }}>Cette semaine</p>
                <div style={{ display: "flex", gap: "3px", marginBottom: "5px" }}>
                  {Array.from({ length: 7 }, (_, i) => (
                    <div key={i} style={{
                      flex: 1, height: "3px", borderRadius: "99px",
                      background: i < history.filter(h => {
                        const d = new Date(h.completedAt);
                        const now = new Date();
                        const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
                        return diff <= 6;
                      }).length ? C.gold : "rgba(17,16,9,0.1)",
                      opacity: 0.7,
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: "10px", color: C.ink40, fontWeight: 300, margin: 0 }}>
                  {history.length} chapelet{history.length > 1 ? "s" : ""} prié{history.length > 1 ? "s" : ""} · Votre chemin continue demain
                </p>
              </div>

              {/* Historique */}
              {history.length > 0 && (
                <div style={{ background: C.card, borderRadius: "13px", border: `1.5px solid ${C.ink08}`, overflow: "hidden" }}>
                  <div style={{ padding: "8px 14px", borderBottom: `1px solid ${C.ink08}` }}>
                    <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.ink30, margin: 0 }}>Historique récent</p>
                  </div>
                  {history.slice(0, 5).map((h, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 14px", borderBottom: i < Math.min(history.length, 5) - 1 ? `1px solid ${C.ink08}` : "none",
                    }}>
                      <span style={{ fontSize: "12px", color: C.ink }}>{MYSTERIES[h.mysteryType as MysteryType]?.short || h.mysteryType}</span>
                      <span style={{ fontSize: "10px", color: C.ink40, fontWeight: 300 }}>
                        {new Date(h.completedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {new Date(h.completedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} ✓
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Boutons fin */}
              <div style={{ display: "flex", gap: "8px", paddingBottom: "8px" }}>
                <button onClick={() => router.push("/dashboard/spiritual")} style={{
                  flex: 1, padding: "12px", borderRadius: "11px",
                  border: `1.5px solid ${C.ink15}`, background: "none",
                  fontSize: "12px", color: C.ink40, cursor: "pointer", fontFamily: C.sans,
                }}>
                  Fermer
                </button>
                <button onClick={() => { setPhase("select"); setProgress(null); }} style={{
                  flex: 2, padding: "12px", borderRadius: "11px",
                  background: "#111009", border: "none", color: "#F5EFE4",
                  fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans,
                }}>
                  Revenir demain →
                </button>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
