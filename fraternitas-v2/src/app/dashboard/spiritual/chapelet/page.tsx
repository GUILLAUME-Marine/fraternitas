"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type MysteryType = "joyeux" | "lumineux" | "douloureux" | "glorieux";
type Phase = "select" | "intention" | "praying" | "fatima" | "mystery-detail" | "complete";

interface RosaryProgress {
  mysteryType: MysteryType;
  decadeIndex: number;
  grainIndex: number;
  intention: string;
  startedAt: string;
}
interface HistoryEntry { mysteryType: string; completedAt: string; intention?: string }

const C = {
  bg: "#F2EBE0", card: "#FFFFFF", cardBorder: "rgba(17,16,9,0.11)",
  cream: "#E8DDD0", creamGold: "#F5EDE0",
  gold: "#B8893A", goldBorder: "rgba(184,137,58,0.35)",
  ink: "#111009", ink80: "rgba(17,16,9,0.80)", ink65: "rgba(17,16,9,0.65)",
  ink50: "rgba(17,16,9,0.50)", ink35: "rgba(17,16,9,0.35)", ink12: "rgba(17,16,9,0.12)",
  serif: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  sans: "'DM Sans',system-ui,sans-serif",
};

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

const NP = `Notre Père, qui es aux cieux,\nque ton nom soit sanctifié,\nque ton règne vienne,\nque ta volonté soit faite\nsur la terre comme au ciel.\n\nDonne-nous aujourd'hui notre pain de ce jour.\nPardonne-nous nos offenses,\ncomme nous pardonnons aussi\nà ceux qui nous ont offensés.\n\nEt ne nous soumets pas à la tentation,\nmais délivre-nous du mal. Amen.`;
const AM = `Je vous salue, Marie pleine de grâce,\nle Seigneur est avec vous.\nVous êtes bénie entre toutes les femmes\net Jésus, le fruit de vos entrailles, est béni.\n\nSainte Marie, Mère de Dieu,\npriez pour nous pauvres pécheurs,\nmaintenant et à l'heure de notre mort. Amen.`;
const GL = `Gloire au Père, et au Fils, et au Saint-Esprit,\ncomme il était au commencement,\nmaintenant et toujours,\ndans les siècles des siècles. Amen.`;
const FATIMA_TXT = `Ô mon Jésus, pardonnez-nous nos péchés,\npréservez-nous du feu de l'enfer,\net conduisez au Ciel toutes les âmes,\nspécialement celles qui ont le plus besoin\nde votre miséricorde. Amen.`;
const SALVE_TXT = `Je vous salue, Reine, Mère de miséricorde,\nnotre vie, notre douceur, notre espérance, salut !\n\nEnfants d'Ève, nous crions vers vous,\ngémissants et pleurants dans cette vallée de larmes.\n\nÔ clémente, ô pieuse, ô douce Vierge Marie.`;

// ── Clé v3 pour casser le conflit avec l'ancienne version ──
const STORAGE_KEY = "fraternitas_rosary_v3";
const HISTORY_KEY = "fraternitas_rosary_history";

function getPrayer(g: number) {
  if (g === -1) return { label: "Notre Père", preview: "Notre Père, qui es aux cieux…", full: NP };
  if (g >= 0 && g <= 9) return { label: `Je vous salue Marie ${g + 1}/10`, preview: "Je vous salue, Marie pleine de grâce…", full: AM };
  return { label: "Gloire au Père", preview: "Gloire au Père, et au Fils…", full: GL };
}
function getTodayMystery(): MysteryType {
  const d = new Date().getDay();
  if (d === 1 || d === 6) return "joyeux";
  if (d === 2 || d === 5) return "douloureux";
  if (d === 4) return "lumineux";
  return "glorieux";
}
function saveP(p: RosaryProgress) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { } }
function clearP() { try { localStorage.removeItem(STORAGE_KEY); } catch { } }
function loadP(): RosaryProgress | null { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; } }
function loadHistory(): HistoryEntry[] { try { const s = localStorage.getItem(HISTORY_KEY); return s ? JSON.parse(s) : []; } catch { return []; } }
function saveHistory(h: HistoryEntry[]) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 30))); } catch { } }

function CrossIcon({ size = 14, color = "#B8893A" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="1.3" />
      <line x1="14" y1="5" x2="14" y2="23" stroke={color} strokeWidth="1.3" />
      <line x1="8" y1="11" x2="20" y2="11" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}

// ── SVG Chapelet avec vrais grains en ellipse ──────────────────────────────────
function RosarySVG({ decadeIndex, grainIndex, mysteryType }: {
  decadeIndex: number; grainIndex: number; mysteryType: MysteryType;
}) {
  const color = MYSTERIES[mysteryType].color;
  const cx = 170, cy = 108, rx = 138, ry = 86;
  const gapA = Math.PI * 0.11;
  const startA = Math.PI / 2 + gapA;
  const endA = Math.PI / 2 - gapA + 2 * Math.PI;
  const totalSteps = 55;
  const step = (endA - startA) / totalSteps;

  const beads: Array<{ x: number; y: number; type: "NP" | "AM"; d: number; g: number }> = [];
  let idx = 0;
  for (let d = 0; d < 5; d++) {
    const a = startA + idx * step;
    beads.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), type: "NP", d, g: -1 });
    idx++;
    for (let i = 0; i < 10; i++) {
      const a2 = startA + idx * step;
      beads.push({ x: cx + rx * Math.cos(a2), y: cy + ry * Math.sin(a2), type: "AM", d, g: i });
      idx++;
    }
  }

  const currentGlobal = decadeIndex * 11 + (grainIndex + 1);

  return (
    <svg width="340" height="240" viewBox="0 0 340 240" style={{ display: "block" }}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="rgba(17,16,9,0.12)" strokeWidth="1.4" />
      <line x1={cx} y1={cy + ry} x2={cx} y2={228} stroke="rgba(17,16,9,0.12)" strokeWidth="1.4" />
      {/* Croix */}
      <line x1={cx} y1={220} x2={cx} y2={236} stroke="#C49A3C" strokeWidth="2.2" strokeLinecap="round" />
      <line x1={cx - 8} y1={226} x2={cx + 8} y2={226} stroke="#C49A3C" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx={cx} cy={cy + ry + 7} r="5.5" fill="rgba(196,154,60,0.38)" stroke="#C49A3C" strokeWidth="1" />
      {beads.map((b, i) => {
        const gi = b.d * 11 + (b.g + 1);
        const done = gi < currentGlobal;
        const current = gi === currentGlobal;
        const r = b.type === "NP" ? (current ? 9 : 7) : (current ? 6.5 : 5);
        const fill = done ? (b.type === "NP" ? "#6A4A18" : "#8A6A2A") : current ? "#C49A3C" : "rgba(17,16,9,0.09)";
        const stroke = current ? "rgba(196,154,60,0.45)" : done ? "none" : "rgba(17,16,9,0.20)";
        return (
          <circle key={i} cx={b.x} cy={b.y} r={r} fill={fill} stroke={stroke} strokeWidth={current ? 2 : 0.8} opacity={done ? 0.82 : 1}
            style={current ? { filter: `drop-shadow(0 0 5px ${color}88)`, transition: "all .3s" } : { transition: "all .3s" }}
          />
        );
      })}
    </svg>
  );
}

// ── Audio ─────────────────────────────────────────────────────────────────────
function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioScheduledSourceNode[]>([]);

  function getCtx() {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.connect(ctxRef.current.destination);
      masterRef.current.gain.setValueAtTime(0, ctxRef.current.currentTime);
    }
    return ctxRef.current;
  }

  function stop(immediate = false) {
    const ctx = ctxRef.current; const mg = masterRef.current;
    if (!ctx || !mg) return;
    const t = ctx.currentTime;
    if (immediate) {
      mg.gain.cancelScheduledValues(t); mg.gain.setValueAtTime(0, t);
      nodesRef.current.forEach(n => { try { n.stop(t + 0.01); } catch { } });
      nodesRef.current = [];
    } else {
      mg.gain.cancelScheduledValues(t); mg.gain.setValueAtTime(mg.gain.value, t);
      mg.gain.linearRampToValueAtTime(0, t + 1.8);
      const s = [...nodesRef.current]; nodesRef.current = [];
      setTimeout(() => s.forEach(n => { try { n.stop(); } catch { } }), 2200);
    }
  }

  // Plain-chant grégorien : La2 110Hz + harmoniques naturels + bourdon désaccordé
  function playGregorian() {
    const ctx = getCtx(); stop(true);
    const t = ctx.currentTime;
    masterRef.current!.gain.setValueAtTime(0, t);
    masterRef.current!.gain.linearRampToValueAtTime(0.72, t + 2.5);
    // Harmoniques — gains réduits pour éviter la saturation
    const partials = [
      { mult: 1, gain: 0.30, vibAmt: 0.5, vibRate: 0.09 },
      { mult: 2, gain: 0.18, vibAmt: 0.6, vibRate: 0.13 },
      { mult: 3, gain: 0.09, vibAmt: 0.7, vibRate: 0.11 },
      { mult: 4, gain: 0.05, vibAmt: 0.4, vibRate: 0.15 },
      { mult: 5, gain: 0.02, vibAmt: 0.3, vibRate: 0.17 },
      { mult: 6, gain: 0.01, vibAmt: 0.2, vibRate: 0.19 },
    ];
    partials.forEach(p => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      const lfo = ctx.createOscillator(); const lg = ctx.createGain();
      osc.type = "sine"; osc.frequency.setValueAtTime(110 * p.mult, t);
      lfo.type = "sine"; lfo.frequency.setValueAtTime(p.vibRate, t);
      lg.gain.setValueAtTime(p.vibAmt, t); lfo.connect(lg); lg.connect(osc.frequency);
      g.gain.setValueAtTime(p.gain, t); osc.connect(g); g.connect(masterRef.current!);
      osc.start(t); lfo.start(t); nodesRef.current.push(osc, lfo);
    });
    // Bourdon légèrement désaccordé — battement naturel doux
    const b = ctx.createOscillator(); const bg = ctx.createGain();
    b.type = "sine"; b.frequency.setValueAtTime(110.28, t);
    bg.gain.setValueAtTime(0.12, t); b.connect(bg); bg.connect(masterRef.current!);
    b.start(t); nodesRef.current.push(b);
  }

  // Chant marial : accord parfait Sol2–Ré3–Sol3–La3–Ré4
  function playMarial() {
    const ctx = getCtx(); stop(true);
    const t = ctx.currentTime;
    masterRef.current!.gain.setValueAtTime(0, t);
    masterRef.current!.gain.linearRampToValueAtTime(0.68, t + 2.2);
    const voices = [
      { freq: 98,   gain: 0.24, vibRate: 0.18, vibAmt: 1.2 },
      { freq: 146.8,gain: 0.18, vibRate: 0.22, vibAmt: 1.4 },
      { freq: 196,  gain: 0.14, vibRate: 0.17, vibAmt: 1.0 },
      { freq: 220,  gain: 0.08, vibRate: 0.15, vibAmt: 0.7 },
      { freq: 293.6,gain: 0.04, vibRate: 0.20, vibAmt: 0.5 },
    ];
    voices.forEach(v => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      const lfo = ctx.createOscillator(); const lg = ctx.createGain();
      osc.type = "sine"; osc.frequency.setValueAtTime(v.freq, t);
      lfo.type = "sine"; lfo.frequency.setValueAtTime(v.vibRate, t);
      lg.gain.setValueAtTime(v.vibAmt, t); lfo.connect(lg); lg.connect(osc.frequency);
      g.gain.setValueAtTime(v.gain, t); osc.connect(g); g.connect(masterRef.current!);
      osc.start(t); lfo.start(t); nodesRef.current.push(osc, lfo);
    });
  }

  useEffect(() => () => stop(true), []);
  return { stop, playGregorian, playMarial };
}

export default function ChapeletPage() {
  const router = useRouter();
  const audio = useAudio();
  const [soundMode, setSoundMode] = useState<"silence" | "gregorian" | "marial">("silence");

  // Check hash for "pourquoi"
  const [showWhy, setShowWhy] = useState(() =>
    typeof window !== "undefined" && window.location.hash === "#pourquoi"
  );
  const [showPromises, setShowPromises] = useState(false);

  const [phase, setPhase] = useState<Phase>("select");
  const [selected, setSelected] = useState<MysteryType>(getTodayMystery());
  const [progress, setProgress] = useState<RosaryProgress | null>(null);
  const [intention, setIntention] = useState("");
  const [showFullPrayer, setShowFullPrayer] = useState(false);
  const [tapFeedback, setTapFeedback] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [silenceActive, setSilenceActive] = useState(false);
  const [silenceLeft, setSilenceLeft] = useState(120);
  const silenceRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const p = loadP();
    if (p) { setProgress(p); setSelected(p.mysteryType); setIntention(p.intention || ""); }
    setHistory(loadHistory());
  }, []);

  const doSave = useCallback((p: RosaryProgress) => { saveP(p); setProgress(p); }, []);

  const startFresh = useCallback(() => {
    const p: RosaryProgress = {
      mysteryType: selected, decadeIndex: 0, grainIndex: -1,
      intention, startedAt: new Date().toISOString(),
    };
    doSave(p); setPhase("praying"); setShowFullPrayer(false);
  }, [selected, intention, doSave]);

  const applySound = useCallback((mode: "silence" | "gregorian" | "marial") => {
    setSoundMode(mode);
    if (mode === "silence") audio.stop(false);
    else if (mode === "gregorian") audio.playGregorian();
    else audio.playMarial();
  }, [audio]);

  const advance = useCallback(() => {
    if (!progress) return;
    setTapFeedback(true);
    setTimeout(() => setTapFeedback(false), 160);
    setShowFullPrayer(false);
    const { decadeIndex, grainIndex } = progress;
    if (grainIndex < 9) doSave({ ...progress, grainIndex: grainIndex + 1 });
    else if (grainIndex === 9) doSave({ ...progress, grainIndex: 10 });
    else if (grainIndex === 10) setPhase("fatima");
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
      clearP(); setProgress(null); audio.stop(false);
      setPhase("complete");
    }
  }, [progress, history, doSave, audio]);

  const rosaryPercent = progress
    ? Math.round(((progress.decadeIndex * 10 + Math.max(0, progress.grainIndex + 1)) / 50) * 100)
    : 0;

  const prayerInfo = progress ? getPrayer(progress.grainIndex) : null;
  const currentMystery = progress ? MYSTERIES[progress.mysteryType].items[progress.decadeIndex] : null;
  const todayType = getTodayMystery();

  const startSilenceTimer = (s: number) => {
    setSilenceLeft(s); setSilenceActive(true);
    silenceRef.current = setInterval(() => {
      setSilenceLeft(p => { if (p <= 1) { clearInterval(silenceRef.current!); setSilenceActive(false); return 0; } return p - 1; });
    }, 1000);
  };
  const stopSilenceTimer = () => { if (silenceRef.current) clearInterval(silenceRef.current); setSilenceActive(false); setSilenceLeft(120); };
  useEffect(() => () => { if (silenceRef.current) clearInterval(silenceRef.current); }, []);

  function Hdr({ left, center, right }: { left: React.ReactNode; center: React.ReactNode; right?: React.ReactNode }) {
    return (
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(242,235,224,0.96)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${C.ink12}`, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ minWidth: "64px" }}>{left}</div>
        <div style={{ textAlign: "center" }}>{center}</div>
        <div style={{ minWidth: "64px", display: "flex", justifyContent: "flex-end" }}>{right}</div>
      </div>
    );
  }
  function BackBtn({ onClick, label = "Retour" }: { onClick: () => void; label?: string }) {
    return (
      <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "12px", color: C.ink50, fontFamily: C.sans, display: "flex", alignItems: "center", gap: "4px" }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {label}
      </button>
    );
  }
  function SoundBtns({ current, onChange }: { current: string; onChange: (m: "silence" | "gregorian" | "marial") => void }) {
    return (
      <div style={{ display: "flex", gap: "5px" }}>
        {(["silence", "gregorian", "marial"] as const).map((m, i) => (
          <button key={m} onClick={() => onChange(m)} style={{ padding: "5px 8px", borderRadius: "7px", border: `1px solid ${current === m ? "#1A1410" : C.ink12}`, background: current === m ? "#1A1410" : "transparent", fontSize: "10px", fontWeight: current === m ? 600 : 400, color: current === m ? "#C49A3C" : C.ink50, cursor: "pointer", fontFamily: C.sans, transition: "all .15s" }}>
            {["Silence", "Plain-chant", "Marial"][i]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        @keyframes bp{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes sw{0%,100%{transform:scaleY(.6)}50%{transform:scaleY(1.4)}}
        .fu{animation:fu .4s cubic-bezier(.16,1,.3,1) both}
        .ba{animation:bp 2.4s ease-in-out infinite}
        .tap:active{transform:scale(.96)}
        .rh:hover{background:rgba(17,16,9,0.03)!important}
      `}</style>

      {/* ════ SÉLECTION ════ */}
      {phase === "select" && !showWhy && (
        <>
          <Hdr
            left={<BackBtn onClick={() => router.push("/dashboard/spiritual")} label="Prions" />}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>Le Chapelet</span>}
            right={progress ? <span style={{ fontSize: "12px", color: C.gold, fontWeight: 500 }}>{rosaryPercent}%</span> : undefined}
          />
          <main style={{ maxWidth: "540px", margin: "0 auto", padding: "16px 14px 60px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Reprendre en cours */}
              {progress && (
                <div style={{ background: C.card, borderRadius: "14px", padding: "12px 14px", border: `1.5px solid ${C.goldBorder}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: C.ink, margin: "0 0 2px" }}>Chapelet en cours</p>
                      <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, margin: 0 }}>
                        {MYSTERIES[progress.mysteryType].label} · Dizaine {progress.decadeIndex + 1} · {rosaryPercent}%
                      </p>
                    </div>
                    <span style={{ fontSize: "20px", fontWeight: 300, color: C.gold, fontFamily: C.serif }}>{rosaryPercent}%</span>
                  </div>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} style={{ flex: 1, height: "3px", borderRadius: "99px", background: i < progress.decadeIndex ? "#1A1410" : i === progress.decadeIndex ? "#C49A3C" : C.ink12, opacity: i <= progress.decadeIndex ? 0.7 : 1 }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "7px" }}>
                    <button onClick={() => setPhase("praying")} style={{ flex: 2, padding: "9px", borderRadius: "10px", background: "#C49A3C", border: "none", color: "#1A1410", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
                      Reprendre →
                    </button>
                    <button onClick={() => { clearP(); setProgress(null); }} style={{ flex: 1, padding: "9px", borderRadius: "10px", border: `1.5px solid ${C.ink12}`, background: "none", fontSize: "12px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>
                      Effacer
                    </button>
                  </div>
                </div>
              )}

              {/* Mystères */}
              <div>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.ink35, marginBottom: "8px", fontFamily: C.sans }}>Choisir le mystère</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {(Object.entries(MYSTERIES) as [MysteryType, typeof MYSTERIES.joyeux][]).map(([key, m]) => (
                    <button key={key} onClick={() => setSelected(key)} style={{ background: selected === key ? C.creamGold : C.card, border: selected === key ? `2px solid ${C.gold}66` : `1.5px solid ${C.cardBorder}`, borderRadius: "14px", padding: "12px 13px", textAlign: "left", cursor: "pointer", position: "relative", transition: "all .15s", fontFamily: C.sans }}>
                      {key === todayType && (
                        <div style={{ position: "absolute", top: "-1px", right: "10px", background: C.gold, borderRadius: "0 0 5px 5px", padding: "1px 6px" }}>
                          <span style={{ fontSize: "7px", fontWeight: 500, color: "#fff" }}>{new Date().toLocaleDateString("fr-FR", { weekday: "short" }).toUpperCase()}</span>
                        </div>
                      )}
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: m.color, marginBottom: "7px" }} />
                      <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 400, color: C.ink, lineHeight: 1.1, marginBottom: "3px" }}>{m.short}</p>
                      <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink50, margin: 0 }}>{m.days}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Commencer */}
              <button onClick={() => setPhase("intention")} style={{ width: "100%", background: "#C49A3C", borderRadius: "14px", padding: "15px", border: "none", fontSize: "15px", fontWeight: 500, color: "#1A1410", cursor: "pointer", fontFamily: C.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <CrossIcon size={14} color="#1A1410" />
                {progress ? "Nouveau chapelet" : "Commencer le chapelet"} →
              </button>

              {/* Pourquoi */}
              <button onClick={() => setShowWhy(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 500, color: C.gold, fontFamily: C.sans, textAlign: "left", padding: "2px 0", display: "flex", alignItems: "center", gap: "4px" }}>
                Pourquoi prier le chapelet ?
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>

              {history.length > 0 && (
                <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
                  <div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.ink12}` }}>
                    <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink35, margin: 0, fontFamily: C.sans }}>Historique</p>
                  </div>
                  {history.slice(0, 4).map((h, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: i < Math.min(history.length, 4) - 1 ? `1px solid ${C.ink12}` : "none" }}>
                      <span style={{ fontSize: "13px", color: C.ink, fontFamily: C.sans }}>{MYSTERIES[h.mysteryType as MysteryType]?.short || h.mysteryType}</span>
                      <span style={{ fontSize: "11px", color: C.ink50, fontWeight: 300, fontFamily: C.sans }}>
                        {new Date(h.completedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} ✓
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {/* ════ POURQUOI PRIER ════ */}
      {phase === "select" && showWhy && (
        <>
          <Hdr
            left={<BackBtn onClick={() => setShowWhy(false)} label="Chapelet" />}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>Le Chapelet</span>}
          />
          <main style={{ maxWidth: "540px", margin: "0 auto", padding: "16px 14px 60px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.2 }}>À quoi ça sert,<br />le chapelet ?</p>
              {/* Hero */}
              <div style={{ background: "linear-gradient(135deg,#1A1410,#2C1E08)", borderRadius: "16px", padding: "18px", border: "1.5px solid rgba(196,154,60,0.25)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "6px", left: "14px", fontFamily: C.serif, fontSize: "56px", lineHeight: 1, color: "rgba(196,154,60,0.10)", pointerEvents: "none" }}>«</div>
                <p style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 300, fontStyle: "italic", color: "#F5EFE4", lineHeight: 1.60, marginBottom: "8px", position: "relative", zIndex: 1 }}>
                  « Le chapelet est l'arme de notre temps. »
                </p>
                <p style={{ fontSize: "12px", color: "rgba(196,154,60,0.85)", fontFamily: C.sans, fontWeight: 500, position: "relative", zIndex: 1 }}>— Saint Jean-Paul II</p>
              </div>
              {/* Qui a demandé */}
              <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "14px 16px" }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "8px" }}>Qui nous a demandé de le prier ?</p>
                <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, margin: 0 }}>
                  À Fatima en 1917, la Vierge Marie a demandé une seule chose : « Priez le chapelet chaque jour. » La même demande s'est répétée à Lourdes, La Salette, Pontmain. Sur deux siècles d'apparitions reconnues par l'Église.
                </p>
              </div>
              {/* 15 promesses */}
              <div style={{ background: "#FAF5EC", borderRadius: "14px", border: "1.5px solid rgba(196,154,60,0.28)", overflow: "hidden" }}>
                <button onClick={() => setShowPromises(v => !v)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "10px", padding: "14px 16px", textAlign: "left" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg,#1A1410,#2C1E08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                    <span style={{ color: "rgba(196,154,60,0.90)", fontSize: "12px" }}>✦</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "3px" }}>Tradition dominicaine · XVe siècle</p>
                    <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 400, color: C.ink, lineHeight: 1.2, marginBottom: "3px" }}>Les 15 promesses de Marie</p>
                    <p style={{ fontFamily: C.serif, fontSize: "13px", fontWeight: 300, fontStyle: "italic", color: C.ink50, lineHeight: 1.45, margin: 0 }}>Marie a promis 15 grâces à ceux qui prient le chapelet régulièrement.</p>
                  </div>
                  <span style={{ fontSize: "16px", color: C.ink50, transform: showPromises ? "rotate(90deg)" : "none", transition: "transform .2s", flexShrink: 0, marginTop: "6px" }}>›</span>
                </button>
                {showPromises && (
                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(196,154,60,0.18)" }}>
                    <p style={{ fontFamily: C.serif, fontSize: "13px", fontWeight: 300, fontStyle: "italic", color: C.ink50, lineHeight: 1.6, marginBottom: "12px", paddingTop: "10px" }}>
                      Transmises par le bienheureux Alain de la Roche, fondées sur les apparitions de la Vierge.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                      {[
                        "La paix véritable dans les familles et l'apaisement des foyers divisés.",
                        "La lumière de Dieu accordée sur la vie et les décisions importantes.",
                        "La grâce de persévérer dans la foi jusqu'à la fin de sa vie.",
                        "La victoire sur les tentations et la grâce de résister au mal.",
                        "La protection dans les dangers de l'âme et du corps.",
                        "La confiance totale dans la miséricorde divine et l'abandon à Dieu.",
                        "La dévotion à Marie grandissant au fil des années.",
                        "Le feu de l'amour de Dieu s'embrasant dans le cœur.",
                        "La purification des âmes du purgatoire auxquelles on est uni.",
                        "Les enfants pris sous la protection de Marie dès leur naissance.",
                        "La grâce de convertir les pécheurs qui nous sont proches.",
                        "La consolation dans les épreuves et les moments de détresse.",
                        "La guérison des blessures intérieures portées depuis longtemps.",
                        "La présence de Marie à l'heure de la mort, intercédant pour nous.",
                        "La miséricorde de Dieu accordée à l'heure de la mort à ceux qui ont prié fidèlement.",
                      ].map((g, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                          <div style={{ width: "19px", height: "19px", borderRadius: "50%", background: "linear-gradient(135deg,#1A1410,#2C1E08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 500, color: "rgba(196,154,60,0.90)", flexShrink: 0, marginTop: "1px", fontFamily: C.sans }}>{i + 1}</div>
                          <p style={{ fontFamily: C.serif, fontSize: "13px", fontWeight: 300, color: C.ink65, lineHeight: 1.55, margin: 0 }}>{g}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Objectif */}
              <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "14px 16px" }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "8px" }}>Quel est l'objectif ?</p>
                <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, margin: 0 }}>
                  Prier le chapelet, c'est se laisser guider à travers la vie entière du Christ — naissance, mission, mort, résurrection — avec Marie comme guide. L'objectif n'est pas la récitation : c'est la contemplation.
                </p>
              </div>
              {/* Comment */}
              <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "14px 16px" }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "10px" }}>Comment réussir à le prier ?</p>
                {["Choisissez un moment fixe — matin, soir, ou en marchant.", "Commencez par un seul mystère si le chapelet complet semble trop long.", "Confiez une intention avant de commencer — cela ancre la prière.", "Ne cherchez pas à vous concentrer parfaitement. Revenir suffit.", "Priez-le en marchant ou dans les transports."].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: i < 4 ? "8px" : 0 }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C49A3C", flexShrink: 0, marginTop: "6px" }} />
                    <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink65, lineHeight: 1.60, margin: 0 }}>{s}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => { setShowWhy(false); setPhase("intention"); }} style={{ width: "100%", padding: "14px", background: "#C49A3C", border: "none", borderRadius: "14px", fontSize: "14px", fontWeight: 500, color: "#1A1410", cursor: "pointer", fontFamily: C.sans }}>
                Commencer le chapelet →
              </button>
            </div>
          </main>
        </>
      )}

      {/* ════ INTENTION + SON ════ */}
      {phase === "intention" && (
        <>
          <Hdr
            left={<BackBtn onClick={() => setPhase("select")} />}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>Avant de commencer</span>}
          />
          <div style={{ maxWidth: "480px", margin: "0 auto", padding: "28px 16px 40px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: C.creamGold, border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <CrossIcon size={20} />
                </div>
                <p style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 300, color: C.ink, marginBottom: "6px" }}>Pour qui priez-vous ?</p>
                <p style={{ fontSize: "13px", fontWeight: 300, color: C.ink50, lineHeight: 1.6, maxWidth: "300px", margin: "0 auto 18px" }}>
                  Une intention transforme la récitation en acte d&rsquo;amour.
                </p>
              </div>
              <textarea
                value={intention}
                onChange={e => setIntention(e.target.value.slice(0, 200))}
                placeholder="Pour mon père malade… Pour la paix… Pour ceux qui doutent…"
                rows={3}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: `1.5px solid ${C.ink12}`, background: C.card, color: C.ink80, fontSize: "16px", fontWeight: 300, lineHeight: 1.6, fontFamily: C.serif, fontStyle: "italic", resize: "none", outline: "none", transition: "border-color .2s" }}
                onFocus={e => (e.target.style.borderColor = C.gold)}
                onBlur={e => (e.target.style.borderColor = C.ink12)}
              />
              {/* Son — sur la même page que l'intention comme convenu */}
              <div style={{ background: C.card, borderRadius: "12px", border: `1.5px solid ${C.cardBorder}`, padding: "14px 16px" }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.ink35, fontFamily: C.sans, marginBottom: "10px" }}>Ambiance sonore</p>
                <div style={{ display: "flex", gap: "7px" }}>
                  {(["silence", "gregorian", "marial"] as const).map((mode, i) => (
                    <button key={mode} onClick={() => applySound(mode)} style={{ flex: 1, padding: "10px 4px", borderRadius: "11px", border: `1.5px solid ${soundMode === mode ? "#1A1410" : C.ink12}`, background: soundMode === mode ? "#1A1410" : "#F5EDE0", cursor: "pointer", fontFamily: C.sans, transition: "all .18s", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                      <span style={{ fontSize: "10px", fontWeight: soundMode === mode ? 600 : 400, color: soundMode === mode ? "#C49A3C" : C.ink50 }}>
                        {["Silence", "Plain-chant", "Chant marial"][i]}
                      </span>
                      {soundMode === mode && mode !== "silence" && (
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "10px" }}>
                          {[4, 7, 10, 6].map((h, j) => (
                            <div key={j} style={{ width: "2px", height: `${h}px`, borderRadius: "99px", background: "#C49A3C", animation: `sw 1s ease-in-out ${j * 0.15}s infinite` }} />
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={startFresh} style={{ flex: 1, padding: "12px", borderRadius: "11px", border: `1.5px solid ${C.ink12}`, background: "none", fontSize: "13px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>Sans intention</button>
                <button onClick={startFresh} style={{ flex: 2, padding: "12px", borderRadius: "11px", background: "#C49A3C", border: "none", color: "#1A1410", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
                  {intention ? "Commencer →" : "Passer →"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════ PRIÈRE ════ */}
      {phase === "praying" && progress && currentMystery && prayerInfo && (
        <>
          <Hdr
            left={<button onClick={() => setPhase("select")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: C.ink50, fontFamily: C.sans }}>⏸ Pause</button>}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>Chapelet</span>}
            right={<span style={{ fontSize: "11px", color: C.gold, fontWeight: 500 }}>{MYSTERIES[progress.mysteryType].short}</span>}
          />
          {/* SVG chapelet vrais grains */}
          <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 2px", background: C.bg }}>
            <RosarySVG decadeIndex={progress.decadeIndex} grainIndex={progress.grainIndex} mysteryType={progress.mysteryType} />
          </div>
          <main style={{ maxWidth: "540px", margin: "0 auto", padding: "6px 14px 40px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {progress.intention && (
                <div style={{ background: C.creamGold, borderRadius: "11px", padding: "8px 12px", border: `1px solid ${C.goldBorder}` }}>
                  <p style={{ fontSize: "12px", fontWeight: 300, color: C.ink65, fontStyle: "italic", margin: 0 }}>🙏 {progress.intention}</p>
                </div>
              )}
              <button onClick={() => setPhase("mystery-detail")} style={{ background: C.card, borderRadius: "13px", padding: "11px 14px", border: `1.5px solid ${C.cardBorder}`, textAlign: "left", width: "100%", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontFamily: C.sans, transition: "border-color .15s" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: MYSTERIES[progress.mysteryType].color, margin: "0 0 3px" }}>
                    {progress.decadeIndex + 1}e mystère {MYSTERIES[progress.mysteryType].short.toLowerCase()}
                  </p>
                  <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 400, color: C.ink, lineHeight: 1.15, margin: 0 }}>{currentMystery.title}</p>
                </div>
                <span style={{ fontSize: "11px", color: C.ink35, flexShrink: 0 }}>Méditer →</span>
              </button>
              {/* Citation mystère visible directement */}
              <p style={{ fontFamily: C.serif, fontSize: "13px", fontWeight: 300, fontStyle: "italic", color: C.ink50, lineHeight: 1.55, margin: "0 2px" }}>
                {currentMystery.verse}
              </p>
              <div style={{ background: C.cream, borderRadius: "13px", padding: "11px 14px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink50, marginBottom: "6px", fontFamily: C.sans }}>{prayerInfo.label}</p>
                <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink80, lineHeight: 1.58, margin: 0, whiteSpace: "pre-line" }}>
                  {showFullPrayer ? prayerInfo.full : prayerInfo.preview}
                </p>
                <button onClick={() => setShowFullPrayer(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: C.gold, fontWeight: 500, padding: "5px 0 0", fontFamily: C.sans }}>
                  {showFullPrayer ? "Réduire" : "Lire en entier +"}
                </button>
              </div>
              {/* AMEN — noir grand */}
              <button className="tap" onClick={advance} style={{ width: "100%", background: tapFeedback ? "#2C1E08" : "#111009", border: "none", borderRadius: "16px", padding: "18px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", transition: "all .12s" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "rgba(196,154,60,0.15)", border: "1.5px solid rgba(196,154,60,0.40)", display: "flex", alignItems: "center", justifyContent: "center", transform: tapFeedback ? "scale(.93)" : "scale(1)", transition: "transform .1s" }}>
                  <CrossIcon size={20} color="#C49A3C" />
                </div>
                <span style={{ fontSize: "20px", fontWeight: 300, fontStyle: "italic", color: "#F5EFE4", fontFamily: C.serif, letterSpacing: "0.04em" }}>
                  {progress.grainIndex === 10 ? "Fin de dizaine — Amen" : "Amen"}
                </span>
              </button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div className="ba" style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.gold }} />
                  <span style={{ fontSize: "11px", color: C.ink35, fontWeight: 300, fontFamily: C.sans }}>L&apos;Église prie avec vous</span>
                </div>
                <SoundBtns current={soundMode} onChange={applySound} />
              </div>
            </div>
          </main>
        </>
      )}

      {/* ════ FATIMA ════ */}
      {phase === "fatima" && progress && (
        <>
          <Hdr
            left={<button onClick={() => setPhase("praying")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: C.ink50, fontFamily: C.sans }}>⏸ Pause</button>}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>Chapelet</span>}
            right={<span style={{ fontSize: "11px", color: C.gold, fontWeight: 500 }}>{progress.decadeIndex + 1}/5</span>}
          />
          <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 16px 40px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center" }}>
              <div>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: C.creamGold, border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <span style={{ color: C.gold, fontSize: "16px", fontWeight: 500 }}>✓</span>
                </div>
                <p style={{ fontSize: "15px", fontWeight: 500, color: C.ink, margin: "0 0 3px", fontFamily: C.sans }}>{progress.decadeIndex + 1}e dizaine terminée</p>
                <p style={{ fontSize: "12px", fontWeight: 300, color: C.ink50, fontFamily: C.sans }}>Gloire au Père récité</p>
              </div>
              <div style={{ background: C.creamGold, borderRadius: "16px", padding: "16px", border: `1.5px solid ${C.goldBorder}`, width: "100%", textAlign: "left" }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.ink50, marginBottom: "8px", fontFamily: C.sans }}>✦ Prière de Fatima</p>
                <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink80, lineHeight: 1.72, margin: 0 }}>{FATIMA_TXT}</p>
              </div>
              {progress.decadeIndex < 4 && (
                <div style={{ background: C.card, borderRadius: "13px", padding: "11px 14px", border: `1.5px solid ${C.cardBorder}`, width: "100%", textAlign: "left" }}>
                  <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink35, margin: "0 0 3px", fontFamily: C.sans }}>Prochain mystère</p>
                  <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 400, color: C.ink, margin: 0 }}>{MYSTERIES[progress.mysteryType].items[progress.decadeIndex + 1].title}</p>
                </div>
              )}
              <p className="ba" style={{ fontSize: "11px", fontStyle: "italic", color: C.ink35, fontFamily: C.serif }}>Prenez un moment de silence…</p>
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
          <Hdr
            left={<BackBtn onClick={() => setPhase("praying")} label="Chapelet" />}
            center={<span style={{ fontFamily: C.serif, fontSize: "16px", color: C.ink65, fontStyle: "italic" }}>{currentMystery.title}</span>}
            right={<span style={{ fontSize: "11px", color: C.ink35 }}>{progress.decadeIndex + 1}/5</span>}
          />
          <div style={{ maxWidth: "540px", margin: "0 auto", padding: "14px 14px 40px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ background: C.card, borderRadius: "16px", height: "100px", border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                {[60, 44, 28, 16].map((r, i) => (<div key={i} style={{ position: "absolute", width: r * 2, height: r * 2, borderRadius: "50%", border: `1px solid rgba(184,137,58,${0.10 + i * 0.06})` }} />))}
                <div style={{ position: "absolute", width: "1px", height: "55px", background: `linear-gradient(to bottom,transparent,${C.gold}55,transparent)` }} />
                <p style={{ position: "absolute", bottom: "8px", right: "12px", fontSize: "10px", color: C.ink35, fontFamily: C.serif, fontStyle: "italic" }}>{currentMystery.ref}</p>
              </div>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: MYSTERIES[progress.mysteryType].color, margin: "0 0 4px", fontFamily: C.sans }}>
                  {progress.decadeIndex + 1}e mystère {MYSTERIES[progress.mysteryType].short.toLowerCase()}
                </p>
                <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: C.ink, lineHeight: 1.1, margin: 0 }}>{currentMystery.title}</p>
              </div>
              <div style={{ background: C.card, borderRadius: "13px", padding: "13px 15px", border: `1.5px solid ${C.cardBorder}`, borderLeft: `3px solid ${C.gold}` }}>
                <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink80, lineHeight: 1.65, margin: 0 }}>« {currentMystery.verse} »</p>
              </div>
              <div style={{ background: C.cream, borderRadius: "13px", padding: "13px 15px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.ink35, marginBottom: "7px", fontFamily: C.sans }}>Méditation</p>
                <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink65, lineHeight: 1.68, margin: 0 }}>{currentMystery.meditation}</p>
              </div>
              <div style={{ background: C.creamGold, borderRadius: "13px", padding: "13px 15px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, marginBottom: "7px", fontFamily: C.sans }}>Pour vous</p>
                <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, fontStyle: "italic", color: C.ink65, lineHeight: 1.68, margin: 0 }}>{currentMystery.question}</p>
              </div>
              {silenceActive ? (
                <div style={{ background: C.card, borderRadius: "13px", padding: "20px", textAlign: "center", border: `1.5px solid ${C.goldBorder}` }}>
                  <p style={{ fontFamily: C.serif, fontSize: "36px", fontWeight: 300, color: C.ink, marginBottom: "5px" }}>
                    {Math.floor(silenceLeft / 60)}:{String(silenceLeft % 60).padStart(2, "0")}
                  </p>
                  <p style={{ fontSize: "12px", color: C.ink50, marginBottom: "14px", fontFamily: C.sans }}>Temps de silence</p>
                  <button onClick={stopSilenceTimer} style={{ background: "none", border: `1.5px solid ${C.ink12}`, borderRadius: "99px", padding: "7px 18px", fontSize: "12px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>Arrêter</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => startSilenceTimer(120)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: `1.5px solid ${C.ink12}`, background: "none", fontSize: "13px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>⏱ 2 min</button>
                  <button onClick={() => setPhase("praying")} style={{ flex: 2, padding: "12px", borderRadius: "12px", background: "#111009", border: "none", color: "#F5EFE4", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>Prier ce mystère →</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ════ TERMINÉ ════ */}
      {phase === "complete" && (
        <>
          <Hdr left={<div />} center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>Chapelet terminé</span>} />
          <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 14px 40px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: C.creamGold, border: `1.5px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <CrossIcon size={22} />
                </div>
                <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, marginBottom: "5px" }}>Chapelet terminé.</p>
                <p style={{ fontSize: "13px", fontWeight: 300, color: C.ink50, lineHeight: 1.6, fontFamily: C.sans }}>Prenez un moment de silence avant de reprendre votre journée.</p>
              </div>
              <div style={{ background: C.creamGold, borderRadius: "14px", padding: "14px 16px", border: `1.5px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.ink50, marginBottom: "8px", fontFamily: C.sans }}>✦ Prière de Fatima</p>
                <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, fontStyle: "italic", color: C.ink80, lineHeight: 1.70, margin: 0 }}>{FATIMA_TXT}</p>
              </div>
              <SalveAccordion salve={SALVE_TXT} C={C} />
              <div style={{ background: C.cream, borderRadius: "13px", padding: "12px 14px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "11px", fontWeight: 500, color: C.ink50, marginBottom: "7px", fontFamily: C.sans }}>Cette semaine</p>
                <div style={{ display: "flex", gap: "3px", marginBottom: "5px" }}>
                  {Array.from({ length: 7 }, (_, i) => (
                    <div key={i} style={{ flex: 1, height: "3px", borderRadius: "99px", background: i < history.length % 7 + 1 ? C.gold : C.ink12, opacity: 0.7 }} />
                  ))}
                </div>
                <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, margin: 0, fontFamily: C.sans }}>
                  {history.length} chapelet{history.length > 1 ? "s" : ""} prié{history.length > 1 ? "s" : ""} · Votre chemin continue demain
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => router.push("/dashboard/spiritual")} style={{ flex: 1, padding: "13px", borderRadius: "12px", border: `1.5px solid ${C.ink12}`, background: "none", fontSize: "13px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>Fermer</button>
                <button onClick={() => setPhase("select")} style={{ flex: 2, padding: "13px", borderRadius: "12px", background: "#111009", border: "none", color: "#F5EFE4", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>Nouveau chapelet →</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SalveAccordion({ salve, C }: { salve: string; C: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 15px", background: "none", border: "none", cursor: "pointer", fontFamily: C.sans }}>
        <span style={{ fontSize: "13px", fontWeight: 400, color: C.ink }}>Salve Regina</span>
        <span style={{ fontSize: "15px", color: C.ink50, transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
      </button>
      {open && (
        <div style={{ padding: "0 15px 13px" }}>
          <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, fontStyle: "italic", color: C.ink65, lineHeight: 1.75, whiteSpace: "pre-line", margin: 0 }}>{salve}</p>
        </div>
      )}
      <div style={{ padding: "12px 15px", borderTop: `1px solid ${C.ink12}` }}>
        <p style={{ fontSize: "13px", color: C.ink, fontFamily: C.sans, margin: 0 }}>Ô Marie conçue sans péché, priez pour nous.</p>
      </div>
      <div style={{ padding: "12px 15px", borderTop: `1px solid ${C.ink12}` }}>
        <p style={{ fontSize: "13px", color: C.ink, fontFamily: C.sans, margin: 0 }}>Sacré-Cœur de Jésus, j&apos;ai confiance en vous.</p>
      </div>
    </div>
  );
}
