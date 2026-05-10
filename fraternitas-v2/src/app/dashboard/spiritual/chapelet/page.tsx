"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type MysteryType = "joyeux" | "lumineux" | "douloureux" | "glorieux";
// Suppression de "select" — on commence directement à l'intention
type Phase = "intention" | "praying" | "fatima" | "mystery-detail" | "complete" | "why";

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

const STORAGE_KEY = "fraternitas_rosary_v3";
const HISTORY_KEY = "fraternitas_rosary_history";

function getPrayer(g: number) {
  if (g === -1) return { label: "Notre Père", full: NP };
  if (g >= 0 && g <= 9) return { label: `Je vous salue Marie ${g + 1}/10`, full: AM };
  return { label: "Gloire au Père", full: GL };
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

// ── SVG Chapelet — vrais grains en ellipse ─────────────────────────────────────
function RosarySVG({ decadeIndex, grainIndex, mysteryType }: {
  decadeIndex: number; grainIndex: number; mysteryType: MysteryType;
}) {
  const color = MYSTERIES[mysteryType].color;
  const cx = 170, cy = 108, rx = 138, ry = 86;
  const gapA = Math.PI * 0.11;
  const startA = Math.PI / 2 + gapA;
  const endA = Math.PI / 2 - gapA + 2 * Math.PI;
  const step = (endA - startA) / 55;

  const beads: Array<{ x: number; y: number; type: "NP" | "AM"; d: number; g: number }> = [];
  let idx = 0;
  for (let d = 0; d < 5; d++) {
    beads.push({ x: cx + rx * Math.cos(startA + idx * step), y: cy + ry * Math.sin(startA + idx * step), type: "NP", d, g: -1 });
    idx++;
    for (let i = 0; i < 10; i++) {
      beads.push({ x: cx + rx * Math.cos(startA + idx * step), y: cy + ry * Math.sin(startA + idx * step), type: "AM", d, g: i });
      idx++;
    }
  }
  const currentGlobal = decadeIndex * 11 + (grainIndex + 1);

  return (
    <svg width="340" height="230" viewBox="0 0 340 230" style={{ display: "block" }}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="rgba(17,16,9,0.12)" strokeWidth="1.4" />
      <line x1={cx} y1={cy + ry} x2={cx} y2={218} stroke="rgba(17,16,9,0.12)" strokeWidth="1.4" />
      <line x1={cx} y1={210} x2={cx} y2={224} stroke="#C49A3C" strokeWidth="2.2" strokeLinecap="round" />
      <line x1={cx - 8} y1={216} x2={cx + 8} y2={216} stroke="#C49A3C" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx={cx} cy={cy + ry + 7} r="5.5" fill="rgba(196,154,60,0.38)" stroke="#C49A3C" strokeWidth="1" />
      {beads.map((b, i) => {
        const gi = b.d * 11 + (b.g + 1);
        const done = gi < currentGlobal;
        const current = gi === currentGlobal;
        const r = b.type === "NP" ? (current ? 9 : 7) : (current ? 6.5 : 5);
        const fill = done ? (b.type === "NP" ? "#6A4A18" : "#8A6A2A") : current ? "#C49A3C" : "rgba(17,16,9,0.09)";
        return (
          <circle key={i} cx={b.x} cy={b.y} r={r} fill={fill}
            stroke={current ? "rgba(196,154,60,0.45)" : done ? "none" : "rgba(17,16,9,0.20)"}
            strokeWidth={current ? 2 : 0.8} opacity={done ? 0.82 : 1}
            style={current ? { filter: `drop-shadow(0 0 5px ${color}88)`, transition: "all .3s" } : { transition: "all .3s" }}
          />
        );
      })}
    </svg>
  );
}

// ── Audio — synthèse filtrée plus chaleureuse ──────────────────────────────────
function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

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
    mg.gain.cancelScheduledValues(t);
    if (immediate) {
      mg.gain.setValueAtTime(0, t);
      nodesRef.current.forEach(n => { try { (n as AudioScheduledSourceNode).stop(t + 0.01); } catch { } });
    } else {
      mg.gain.setValueAtTime(mg.gain.value, t);
      mg.gain.linearRampToValueAtTime(0, t + 2.0);
      const s = [...nodesRef.current];
      setTimeout(() => s.forEach(n => { try { (n as AudioScheduledSourceNode).stop(); } catch { } }), 2400);
    }
    nodesRef.current = [];
  }

  // Orgue de tuyaux : onde en dents de scie filtrée lowpass — beaucoup plus chaud que sinus
  function playOrgan() {
    const ctx = getCtx(); stop(true);
    const t = ctx.currentTime;
    masterRef.current!.gain.setValueAtTime(0, t);
    masterRef.current!.gain.linearRampToValueAtTime(0.55, t + 3.0);

    // Filtre passe-bas global pour adoucir — effet tuyau d'orgue
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, t);
    filter.Q.setValueAtTime(0.8, t);
    filter.connect(masterRef.current!);

    // Reverb léger via ConvolverNode artificiel (delay + feedback)
    const delay = ctx.createDelay(0.5);
    delay.delayTime.setValueAtTime(0.08, t);
    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.28, t);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(filter);

    // Voix d'orgue : La2 (110Hz) + La3 + Mi3 — accord parfait
    const pipes = [
      { freq: 110,   gain: 0.42, type: "sawtooth" as OscillatorType },
      { freq: 220,   gain: 0.22, type: "sawtooth" as OscillatorType },
      { freq: 164.8, gain: 0.18, type: "sawtooth" as OscillatorType },
      { freq: 329.6, gain: 0.09, type: "sawtooth" as OscillatorType },
      { freq: 55,    gain: 0.28, type: "sawtooth" as OscillatorType }, // basse profonde
    ];

    pipes.forEach(p => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const tremolo = ctx.createOscillator();
      const tg = ctx.createGain();
      osc.type = p.type;
      osc.frequency.setValueAtTime(p.freq, t);
      // Légère instabilité naturelle
      osc.frequency.setValueAtTime(p.freq * (1 + (Math.random() - 0.5) * 0.001), t);
      // Tremolo très léger
      tremolo.type = "sine";
      tremolo.frequency.setValueAtTime(3.2 + Math.random() * 0.8, t);
      tg.gain.setValueAtTime(p.gain * 0.04, t);
      tremolo.connect(tg); tg.connect(g.gain);
      g.gain.setValueAtTime(p.gain, t);
      osc.connect(g); g.connect(delay); g.connect(filter);
      osc.start(t); tremolo.start(t);
      nodesRef.current.push(osc, tremolo);
    });
    nodesRef.current.push(delay, feedback, filter);
  }

  // Mélodie mariale : accord de tierce + voix douce filtrée
  function playMarial() {
    const ctx = getCtx(); stop(true);
    const t = ctx.currentTime;
    masterRef.current!.gain.setValueAtTime(0, t);
    masterRef.current!.gain.linearRampToValueAtTime(0.50, t + 2.8);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(1.2, t);
    filter.connect(masterRef.current!);

    const reverb = ctx.createDelay(0.6);
    reverb.delayTime.setValueAtTime(0.12, t);
    const rfb = ctx.createGain(); rfb.gain.setValueAtTime(0.22, t);
    reverb.connect(rfb); rfb.connect(reverb); reverb.connect(filter);

    // Sol2-Ré3-Sol3-Si3 — accord parfait majeur chaleureux
    const voices = [
      { freq: 98,   gain: 0.30, vibRate: 5.2, vibAmt: 0.8 },
      { freq: 146.8,gain: 0.22, vibRate: 5.5, vibAmt: 0.6 },
      { freq: 196,  gain: 0.18, vibRate: 4.8, vibAmt: 0.5 },
      { freq: 246.9,gain: 0.12, vibRate: 5.0, vibAmt: 0.4 }, // Si3
    ];
    voices.forEach(v => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      const lfo = ctx.createOscillator(); const lg = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(v.freq, t);
      lfo.type = "sine"; lfo.frequency.setValueAtTime(v.vibRate, t);
      lg.gain.setValueAtTime(v.vibAmt, t);
      lfo.connect(lg); lg.connect(osc.frequency);
      g.gain.setValueAtTime(v.gain, t);
      osc.connect(g); g.connect(reverb); g.connect(filter);
      osc.start(t); lfo.start(t);
      nodesRef.current.push(osc, lfo);
    });
    nodesRef.current.push(reverb, rfb, filter);
  }

  useEffect(() => () => stop(true), []);
  return { stop, playOrgan, playMarial };
}

export default function ChapeletPage() {
  const router = useRouter();
  const audio = useAudio();
  const [soundMode, setSoundMode] = useState<"silence" | "organ" | "marial">("silence");
  const [showPromises, setShowPromises] = useState(false);

  // Détecter #pourquoi dans l'URL pour ouvrir directement la page Pourquoi
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window !== "undefined" && window.location.hash === "#pourquoi") return "why";
    return "intention";
  });

  const todayMystery = getTodayMystery();
  const [mysteryType] = useState<MysteryType>(todayMystery); // automatique, non modifiable
  const [progress, setProgress] = useState<RosaryProgress | null>(null);
  const [intention, setIntention] = useState("");
  const [showFullPrayer, setShowFullPrayer] = useState(false);
  const [tapFeedback, setTapFeedback] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [silenceActive, setSilenceActive] = useState(false);
  const [silenceLeft, setSilenceLeft] = useState(120);
  const silenceRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Détecter changement de hash (retour depuis autre page)
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#pourquoi") setPhase("why");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const p = loadP();
    if (p) { setProgress(p); setIntention(p.intention || ""); }
    setHistory(loadHistory());
  }, []);

  const doSave = useCallback((p: RosaryProgress) => { saveP(p); setProgress(p); }, []);

  const startFresh = useCallback(() => {
    const p: RosaryProgress = {
      mysteryType, decadeIndex: 0, grainIndex: -1,
      intention, startedAt: new Date().toISOString(),
    };
    doSave(p); setPhase("praying"); setShowFullPrayer(false);
  }, [mysteryType, intention, doSave]);

  const applySound = useCallback((mode: "silence" | "organ" | "marial") => {
    setSoundMode(mode);
    if (mode === "silence") audio.stop(false);
    else if (mode === "organ") audio.playOrgan();
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

  const prayerInfo = progress ? getPrayer(progress.grainIndex) : null;
  const currentMystery = progress ? MYSTERIES[progress.mysteryType].items[progress.decadeIndex] : null;
  const rosaryPercent = progress
    ? Math.round(((progress.decadeIndex * 10 + Math.max(0, progress.grainIndex + 1)) / 50) * 100)
    : 0;

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
  function SoundBtns() {
    return (
      <div style={{ display: "flex", gap: "5px" }}>
        {(["silence", "organ", "marial"] as const).map((m, i) => (
          <button key={m} onClick={() => applySound(m)} style={{ padding: "5px 8px", borderRadius: "7px", border: `1px solid ${soundMode === m ? "#1A1410" : C.ink12}`, background: soundMode === m ? "#1A1410" : "transparent", fontSize: "10px", fontWeight: soundMode === m ? 600 : 400, color: soundMode === m ? "#C49A3C" : C.ink50, cursor: "pointer", fontFamily: C.sans, transition: "all .15s" }}>
            {["Silence", "Orgue", "Chant"][i]}
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
      `}</style>

      {/* ════ POURQUOI PRIER ════ */}
      {phase === "why" && (
        <>
          <Hdr
            left={<BackBtn onClick={() => { window.location.hash = ""; setPhase("intention"); }} label="Chapelet" />}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>Le Chapelet</span>}
          />
          <main style={{ maxWidth: "540px", margin: "0 auto", padding: "16px 14px 60px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.2 }}>À quoi ça sert,<br />le chapelet ?</p>
              <div style={{ background: "linear-gradient(135deg,#1A1410,#2C1E08)", borderRadius: "16px", padding: "18px", border: "1.5px solid rgba(196,154,60,0.25)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "6px", left: "14px", fontFamily: C.serif, fontSize: "56px", lineHeight: 1, color: "rgba(196,154,60,0.10)", pointerEvents: "none" }}>«</div>
                <p style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 300, fontStyle: "italic", color: "#F5EFE4", lineHeight: 1.60, marginBottom: "8px", position: "relative", zIndex: 1 }}>
                  « Le chapelet est l'arme de notre temps. »
                </p>
                <p style={{ fontSize: "12px", color: "rgba(196,154,60,0.85)", fontFamily: C.sans, fontWeight: 500, position: "relative", zIndex: 1 }}>— Saint Jean-Paul II</p>
              </div>
              <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "14px 16px" }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "8px" }}>Qui nous a demandé de le prier ?</p>
                <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, margin: 0 }}>
                  À Fatima en 1917, la Vierge Marie a demandé une seule chose : « Priez le chapelet chaque jour. » La même demande s'est répétée à Lourdes, La Salette, Pontmain. Sur deux siècles d'apparitions reconnues par l'Église.
                </p>
              </div>
              {/* 15 promesses — résumé d'abord, détail en accordéon */}
              <div style={{ background: "#FAF5EC", borderRadius: "14px", border: "1.5px solid rgba(196,154,60,0.28)", overflow: "hidden" }}>
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "6px" }}>Les 15 promesses de Marie</p>
                  <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, marginBottom: "12px" }}>
                    Marie a promis 15 grâces à ceux qui prient le chapelet avec fidélité : protection de l'âme et du corps, paix dans les familles, persévérance dans la foi, consolation dans les épreuves, et sa présence à l'heure de la mort.
                  </p>
                  <button onClick={() => setShowPromises(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 500, color: C.gold, fontFamily: C.sans, padding: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                    {showPromises ? "Masquer le détail" : "Voir les 15 promesses en détail"}
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ transform: showPromises ? "rotate(90deg)" : "none", transition: "transform .2s" }}>
                      <path d="M6 4l4 4-4 4" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
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
              <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "14px 16px" }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "8px" }}>Contempler le Christ avec Marie</p>
                <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, margin: 0 }}>
                  Prier le chapelet, c'est traverser la vie du Christ — sa naissance, sa mission, sa mort, sa gloire — avec les yeux de sa Mère. La répétition des Ave Maria n'est pas mécanique : elle est le fond musical sur lequel se dépose la méditation. Une prière du corps autant que de l'âme.
                </p>
              </div>
              <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, padding: "14px 16px" }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "10px" }}>Pour réussir</p>
                {["Un moment fixe — matin, soir, ou en marchant.", "Commencez par un seul mystère si le chapelet complet semble trop long.", "Confiez une intention avant de commencer.", "Ne cherchez pas à vous concentrer parfaitement — revenir suffit."].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: i < 3 ? "8px" : 0 }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C49A3C", flexShrink: 0, marginTop: "6px" }} />
                    <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink65, lineHeight: 1.60, margin: 0 }}>{s}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => { window.location.hash = ""; setPhase("intention"); }} style={{ width: "100%", padding: "14px", background: "#C49A3C", border: "none", borderRadius: "14px", fontSize: "14px", fontWeight: 500, color: "#1A1410", cursor: "pointer", fontFamily: C.sans }}>
                Commencer le chapelet →
              </button>
            </div>
          </main>
        </>
      )}

      {/* ════ INTENTION + SON — mystère auto affiché ════ */}
      {phase === "intention" && (
        <>
          <Hdr
            left={<BackBtn onClick={() => router.push("/dashboard/spiritual")} label="Prions" />}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>Le Chapelet</span>}
            right={progress ? <span style={{ fontSize: "12px", color: C.gold, fontWeight: 500 }}>{rosaryPercent}%</span> : undefined}
          />
          <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 16px 40px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Mystère du jour — automatique, affiché en bandeau */}
              <div style={{ background: "linear-gradient(135deg,#1A1410,#2C1E08)", borderRadius: "14px", padding: "16px 18px", border: "1.5px solid rgba(196,154,60,0.22)" }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(196,154,60,0.70)", fontFamily: C.sans, marginBottom: "4px" }}>
                  Mystère du jour · {MYSTERIES[mysteryType].days}
                </p>
                <p style={{ fontFamily: C.serif, fontSize: "20px", fontWeight: 300, color: "#F5EFE4", lineHeight: 1.15, margin: 0 }}>
                  {MYSTERIES[mysteryType].label}
                </p>
              </div>

              {/* Reprise en cours */}
              {progress && (
                <div style={{ background: C.card, borderRadius: "12px", padding: "12px 14px", border: `1.5px solid ${C.goldBorder}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: C.ink, margin: 0 }}>Chapelet en cours · {rosaryPercent}%</p>
                    <button onClick={() => { clearP(); setProgress(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: C.ink50, fontFamily: C.sans }}>Effacer</button>
                  </div>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} style={{ flex: 1, height: "3px", borderRadius: "99px", background: i < progress.decadeIndex ? "#1A1410" : i === progress.decadeIndex ? "#C49A3C" : C.ink12 }} />
                    ))}
                  </div>
                  <button onClick={() => setPhase("praying")} style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "#C49A3C", border: "none", color: "#1A1410", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
                    Reprendre →
                  </button>
                </div>
              )}

              {/* Intention */}
              <div>
                <p style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 300, color: C.ink, marginBottom: "10px", textAlign: "center" }}>
                  Pour qui priez-vous ?
                </p>
                <textarea
                  value={intention}
                  onChange={e => setIntention(e.target.value.slice(0, 200))}
                  placeholder="Pour mon père malade… Pour la paix… Pour ceux qui doutent…"
                  rows={3}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: `1.5px solid ${C.ink12}`, background: C.card, color: C.ink80, fontSize: "15px", fontWeight: 300, lineHeight: 1.6, fontFamily: C.serif, fontStyle: "italic", resize: "none", outline: "none", transition: "border-color .2s" }}
                  onFocus={e => (e.target.style.borderColor = C.gold)}
                  onBlur={e => (e.target.style.borderColor = C.ink12)}
                />
              </div>

              {/* Son */}
              <div style={{ background: C.card, borderRadius: "12px", border: `1.5px solid ${C.cardBorder}`, padding: "14px 16px" }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.ink35, fontFamily: C.sans, marginBottom: "10px" }}>Ambiance sonore</p>
                <div style={{ display: "flex", gap: "7px" }}>
                  {(["silence", "organ", "marial"] as const).map((mode, i) => (
                    <button key={mode} onClick={() => applySound(mode)} style={{ flex: 1, padding: "10px 4px", borderRadius: "11px", border: `1.5px solid ${soundMode === mode ? "#1A1410" : C.ink12}`, background: soundMode === mode ? "#1A1410" : "#F5EDE0", cursor: "pointer", fontFamily: C.sans, transition: "all .18s", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                      <span style={{ fontSize: "10px", fontWeight: soundMode === mode ? 600 : 400, color: soundMode === mode ? "#C49A3C" : C.ink50 }}>
                        {["Silence", "Orgue", "Chant marial"][i]}
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

              <button onClick={startFresh} style={{ width: "100%", padding: "14px", background: "#C49A3C", border: "none", borderRadius: "14px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <CrossIcon size={14} color="#1A1410" />
                {intention ? "Commencer →" : "Commencer sans intention →"}
              </button>

              <button onClick={() => setPhase("why")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 500, color: C.gold, fontFamily: C.sans, padding: "2px 0", display: "flex", alignItems: "center", gap: "4px" }}>
                Pourquoi prier le chapelet ?
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>

              {history.length > 0 && (
                <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
                  <div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.ink12}` }}>
                    <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink35, margin: 0, fontFamily: C.sans }}>Historique</p>
                  </div>
                  {history.slice(0, 4).map((h, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderBottom: i < Math.min(history.length, 4) - 1 ? `1px solid ${C.ink12}` : "none" }}>
                      <span style={{ fontSize: "13px", color: C.ink, fontFamily: C.sans }}>{MYSTERIES[h.mysteryType as MysteryType]?.short || h.mysteryType}</span>
                      <span style={{ fontSize: "11px", color: C.ink50, fontFamily: C.sans }}>{new Date(h.completedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} ✓</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ════ PRIÈRE ════ */}
      {phase === "praying" && progress && currentMystery && prayerInfo && (
        <>
          <Hdr
            left={<button onClick={() => setPhase("intention")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: C.ink50, fontFamily: C.sans }}>⏸ Pause</button>}
            center={<span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink65, fontStyle: "italic" }}>Chapelet</span>}
            right={<span style={{ fontSize: "11px", color: C.gold, fontWeight: 500 }}>{MYSTERIES[progress.mysteryType].short}</span>}
          />

          {/* Bandeau mystère + citation — EN HAUT, avant le SVG */}
          <div style={{ background: "linear-gradient(135deg,#1A1410,#2C1E08)", padding: "12px 16px", borderBottom: "1px solid rgba(196,154,60,0.15)" }}>
            <button onClick={() => setPhase("mystery-detail")} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, width: "100%" }}>
              <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(196,154,60,0.65)", fontFamily: C.sans, marginBottom: "3px" }}>
                {progress.decadeIndex + 1}e mystère {MYSTERIES[progress.mysteryType].short.toLowerCase()} · Méditer →
              </p>
              <p style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 300, color: "#F5EFE4", lineHeight: 1.15, marginBottom: "5px" }}>
                {currentMystery.title}
              </p>
              <p style={{ fontFamily: C.serif, fontSize: "13px", fontWeight: 300, fontStyle: "italic", color: "rgba(245,239,228,0.55)", lineHeight: 1.50, margin: 0 }}>
                {currentMystery.verse}
              </p>
            </button>
          </div>

          {/* SVG chapelet */}
          <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 0", background: C.bg }}>
            <RosarySVG decadeIndex={progress.decadeIndex} grainIndex={progress.grainIndex} mysteryType={progress.mysteryType} />
          </div>

          <main style={{ maxWidth: "540px", margin: "0 auto", padding: "6px 14px 40px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {progress.intention && (
                <div style={{ background: C.creamGold, borderRadius: "11px", padding: "8px 12px", border: `1px solid ${C.goldBorder}` }}>
                  <p style={{ fontSize: "12px", fontWeight: 300, color: C.ink65, fontStyle: "italic", margin: 0 }}>🙏 {progress.intention}</p>
                </div>
              )}

              {/* Prière courante — lineHeight compact */}
              <div style={{ background: C.cream, borderRadius: "13px", padding: "11px 14px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink50, marginBottom: "6px", fontFamily: C.sans }}>{prayerInfo.label}</p>
                <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink80, lineHeight: 1.45, margin: 0, whiteSpace: "pre-line" }}>
                  {showFullPrayer ? prayerInfo.full : prayerInfo.full.split("\n").slice(0, 2).join("\n")}
                </p>
                <button onClick={() => setShowFullPrayer(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: C.gold, fontWeight: 500, padding: "5px 0 0", fontFamily: C.sans }}>
                  {showFullPrayer ? "Réduire" : "Lire en entier +"}
                </button>
              </div>

              {/* AMEN noir */}
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
                <SoundBtns />
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

      {/* ════ MYSTÈRE DÉTAIL — sans cercles concentriques ════ */}
      {phase === "mystery-detail" && progress && currentMystery && (
        <>
          <Hdr
            left={<BackBtn onClick={() => setPhase("praying")} label="Chapelet" />}
            center={<span style={{ fontFamily: C.serif, fontSize: "16px", color: C.ink65, fontStyle: "italic" }}>{currentMystery.title}</span>}
            right={<span style={{ fontSize: "11px", color: C.ink35 }}>{progress.decadeIndex + 1}/5</span>}
          />
          {/* Bandeau sombre sobre à la place des cercles */}
          <div style={{ background: "linear-gradient(135deg,#1A1410,#2C1E08)", padding: "20px 18px" }}>
            <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: MYSTERIES[progress.mysteryType].color, margin: "0 0 6px", fontFamily: C.sans }}>
              {progress.decadeIndex + 1}e mystère {MYSTERIES[progress.mysteryType].short.toLowerCase()} · {currentMystery.ref}
            </p>
            <p style={{ fontFamily: C.serif, fontSize: "24px", fontWeight: 300, color: "#F5EFE4", lineHeight: 1.15, margin: 0 }}>
              {currentMystery.title}
            </p>
          </div>
          <div style={{ maxWidth: "540px", margin: "0 auto", padding: "14px 14px 40px" }}>
            <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
              <SalveAccordionFinal salve={SALVE_TXT} C={C} />
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
                <button onClick={() => setPhase("intention")} style={{ flex: 2, padding: "13px", borderRadius: "12px", background: "#111009", border: "none", color: "#F5EFE4", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>Nouveau chapelet →</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SalveAccordionFinal({ salve, C }: { salve: string; C: Record<string, string> }) {
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
