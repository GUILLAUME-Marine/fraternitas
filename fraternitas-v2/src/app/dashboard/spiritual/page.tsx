"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpiritualData {
  date: string;
  liturgicalInfo: { label: string; season: string; week: string; color: string; colorHex: string };
  gospel: { reference: string; title: string; intro: string; text: string; aelfUrl: string } | null;
  saint: { name: string; dates: string; description: string };
  quote: { text: string; author: string };
  error?: string;
}

type Tab = "jour" | "chapelet" | "prieres";

// ─── Tokens ───────────────────────────────────────────────────────────────────

const C = {
  bg: "#F2EBE0", card: "#FFFFFF", cardBorder: "rgba(17,16,9,0.10)",
  cream: "#E8DDD0", creamGold: "#F5EDE0", gold: "#B8893A",
  goldBorder: "rgba(184,137,58,0.35)", ink: "#111009",
  ink80: "rgba(17,16,9,0.80)", ink65: "rgba(17,16,9,0.65)",
  ink50: "rgba(17,16,9,0.50)", ink35: "rgba(17,16,9,0.35)", ink12: "rgba(17,16,9,0.12)",
  dark: "#1A1410", dark2: "#2C1E08",
  serif: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  sans: "'DM Sans',system-ui,sans-serif",
};

// ─── localStorage keys ────────────────────────────────────────────────────────

const CONFIER_KEY    = "fraternitas_confier_v1";
const INTENTIONS_KEY = "fraternitas_intentions_v2";
const ROSARY_KEY     = "fraternitas_rosary_v3";

// ─── Séquences de prière ──────────────────────────────────────────────────────

const SEQUENCES: Record<string, {
  kicker: string; title: string; desc: string; duration: string;
  steps: Array<{ num: string; title: string; text: string; note?: string }>;
}> = {
  matin: {
    kicker: "Prière du matin · Séquence complète",
    title: "Commencer sa journée.",
    desc: "De la croix à l'offrande : tout ce qu'on peut faire en 5 minutes au réveil.",
    duration: "5 min",
    steps: [
      { num: "1", title: "Signe de croix", text: "Au nom du Père,\net du Fils,\net du Saint-Esprit.\nAmen.", note: "aide|Posez la main droite sur le front, puis la poitrine, puis l'épaule gauche, puis l'épaule droite." },
      { num: "2", title: "Offrande du matin", text: "Mon Dieu, je vous offre toute ma journée :\nmes prières, mes pensées, mes paroles,\nmes actions, mes joies et mes peines,\nen union avec Jésus-Christ,\nqui s'offre chaque jour dans la sainte Messe.\nAmen.", note: "Prenez un instant pour penser à votre journée à venir." },
      { num: "3", title: "Acte de foi", text: "Mon Dieu, je crois fermement\ntoutes les vérités que vous avez révélées\net que la sainte Église nous enseigne,\nparce que vous êtes la vérité même.\nAmen." },
      { num: "4", title: "L'Angélus", text: "L'ange du Seigneur a annoncé à Marie.\nEt elle a conçu du Saint-Esprit.\n\nJe vous salue Marie…\n\nVoici la servante du Seigneur.\nQu'il me soit fait selon votre parole.\n\nJe vous salue Marie…\n\nEt le Verbe s'est fait chair.\nEt il a habité parmi nous.\n\nJe vous salue Marie…\n\nSeigneur, répandez votre grâce en nos âmes. Amen.", note: "L'Angélus se prie à 6h, 12h et 18h." },
      { num: "5", title: "Signe de croix final", text: "Au nom du Père,\net du Fils,\net du Saint-Esprit.\nAmen.", note: "Votre journée est remise à Dieu. Commencez." },
    ],
  },
  soir: {
    kicker: "Prière du soir · Séquence complète",
    title: "Relire sa journée.",
    desc: "Examen de conscience, action de grâce, demande de pardon. 5 minutes avant de dormir.",
    duration: "5 min",
    steps: [
      { num: "1", title: "Signe de croix", text: "Au nom du Père,\net du Fils,\net du Saint-Esprit.\nAmen." },
      { num: "2", title: "Examen de conscience", text: "Seigneur, je reviens vers toi ce soir.\n\nJe te rends grâce pour ce que j'ai reçu aujourd'hui —\nles moments de joie, les rencontres, les petites grâces.\n\nJe te demande de regarder avec moi ma journée :\noù ai-je été présent à toi ?\noù m'en suis-je éloigné ?\n\nJe te confie mes manquements\nsans me juger moi-même.\nTa miséricorde est plus grande que mes fautes.\n\nAmen.", note: "Prenez 2 à 3 minutes de silence pour relire votre journée concrètement." },
      { num: "3", title: "Acte de contrition", text: "Mon Dieu, j'ai un très grand regret\nde vous avoir offensé,\nparce que vous êtes infiniment bon,\ninfiniment aimable,\net que le péché vous déplaît.\n\nJe prends la ferme résolution,\navec le secours de votre sainte grâce,\nde ne plus vous offenser.\n\nAmen." },
      { num: "4", title: "Salve Regina", text: "Je vous salue, Reine, Mère de miséricorde,\nnotre vie, notre douceur, notre espérance, salut !\n\nEnfants d'Ève, nous crions vers vous,\ngémissants et pleurants\ndans cette vallée de larmes.\n\nÔ clémente, ô pieuse,\nô douce Vierge Marie.\nAmen.", note: "Prière traditionnelle du soir. Dans les abbayes, elle clôt la journée." },
      { num: "5", title: "Confier la nuit", text: "Seigneur, je te confie cette nuit.\nProtège-nous quand nous dormons.\nQue nous reposions en ta paix.\nAmen." },
    ],
  },
  inquiet: {
    kicker: "Dans l'inquiétude · 3 min",
    title: "Déposer ce qui pèse.",
    desc: "Quand on ne sait plus comment avancer. Trois prières courtes.",
    duration: "3 min",
    steps: [
      { num: "1", title: "Ouvrir les mains", text: "Seigneur,\ntu vois ce qui m'écrase.\nJe ne sais pas toujours mettre des mots dessus.\n\nTu tiens le temps entre tes mains.\nApprends-moi à vivre aujourd'hui\nsans porter demain.\n\nAmen.", note: "Si vous ne savez pas quoi dire, dites juste : « Seigneur, aide-moi. »" },
      { num: "2", title: "Memorare", text: "Souvenez-vous, ô très pieuse Vierge Marie,\nqu'on n'a jamais entendu dire\nque quelqu'un de ceux qui ont eu recours\nà votre protection\nait été abandonné.\n\nAnimé d'une pareille confiance,\nje recours à vous.\nNe méprisez pas ma prière.\n\nAmen.", note: "Cette prière a 800 ans. Des millions de personnes l'ont priée dans des situations désespérées." },
      { num: "3", title: "Laisser Dieu tenir", text: "Père,\nje ne sais pas comment ça va finir.\nJe n'ai pas besoin de tout comprendre.\n\nJe te fais confiance.\nC'est tout.\n\nAmen." },
    ],
  },
  marie: {
    kicker: "Avec Marie · 4 min",
    title: "Se confier à celle qui a dit oui.",
    desc: "Je vous salue Marie, Memorare, Salve Regina.",
    duration: "4 min",
    steps: [
      { num: "1", title: "Je vous salue Marie", text: "Je vous salue, Marie pleine de grâce,\nle Seigneur est avec vous.\nVous êtes bénie entre toutes les femmes\net Jésus, le fruit de vos entrailles, est béni.\n\nSainte Marie, Mère de Dieu,\npriez pour nous pauvres pécheurs,\nmaintenant et à l'heure de notre mort.\nAmen.", note: "L'Ave Maria est la prière mariale la plus ancienne et la plus priée au monde." },
      { num: "2", title: "Memorare", text: "Souvenez-vous, ô très pieuse Vierge Marie,\nqu'on n'a jamais entendu dire\nque quelqu'un de ceux qui ont eu recours\nà votre protection ait été abandonné.\n\nAnimé d'une pareille confiance,\nje recours à vous, ô Vierge des vierges, ma Mère.\n\nÔ Mère du Verbe, ne méprisez pas ma prière.\n\nAmen.", note: "Attribuée à saint Bernard. Prière de confiance absolue." },
      { num: "3", title: "Salve Regina", text: "Je vous salue, Reine, Mère de miséricorde,\nnotre vie, notre douceur, notre espérance, salut !\n\nEnfants d'Ève, nous crions vers vous,\ngémissants et pleurants\ndans cette vallée de larmes.\n\nÔ clémente, ô pieuse,\nô douce Vierge Marie.\nAmen." },
    ],
  },
};

// ─── Catégories bibliothèque ──────────────────────────────────────────────────

const PRAYER_CATEGORIES = [
  { id: "matin",     label: "Ce matin",         icon: "☀",  desc: "Offrir sa journée avant qu'elle commence.",      duration: "5 min" },
  { id: "soir",      label: "Ce soir",           icon: "🌙", desc: "Faire le point et remettre sa nuit à Dieu.",     duration: "5 min" },
  { id: "inquiet",   label: "Dans l'inquiétude", icon: "🕯", desc: "Quand quelque chose pèse.",                      duration: "3 min" },
  { id: "marie",     label: "Avec Marie",        icon: "☽",  desc: "Se confier à celle qui a dit oui.",             duration: "4 min" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(str: string): string {
  return str
    .replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, "")
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&ldquo;/g, "«")
    .replace(/&rdquo;/g, "»").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
    .replace(/&eacute;/g, "é").replace(/&egrave;/g, "è").replace(/&agrave;/g, "à")
    .replace(/&#[0-9]+;/g, "").replace(/&[a-z]+;/g, " ")
    .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function getEvangelist(intro: string): string {
  const m = intro.match(/selon\s+saint\s+([A-Za-z\u00C0-\u017E]+)/i);
  if (m) return `Évangile selon saint ${m[1]}`;
  return "Évangile du jour";
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bonjour.";
  if (h >= 12 && h < 14) return "Midi. L'Angélus sonne.";
  if (h >= 14 && h < 18) return "Bonne après-midi.";
  if (h >= 18 && h < 21) return "Ce soir.";
  return "Bonne nuit.";
}

function getRosaryProgress() {
  try { const s = localStorage.getItem(ROSARY_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
const MYSTERY_LABELS: Record<string, string> = {
  joyeux: "Mystères Joyeux", lumineux: "Mystères Lumineux",
  douloureux: "Mystères Douloureux", glorieux: "Mystères Glorieux",
};

// ─── Micro-composants ─────────────────────────────────────────────────────────

function Skel({ w = "100%", h = "13px", r = "6px" }: { w?: string; h?: string; r?: string }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "rgba(17,16,9,0.09)", animation: "sk 1.8s ease-in-out infinite", flexShrink: 0 }} />;
}
function Chev({ color = C.ink50 }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M6 4L10 8L6 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Cross({ size = 14, color = C.gold }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="1.3" />
      <line x1="14" y1="5" x2="14" y2="23" stroke={color} strokeWidth="1.3" />
      <line x1="8" y1="11" x2="20" y2="11" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function PriresPage() {
  const router = useRouter();

  const [tab, setTab]               = useState<Tab>("jour");
  const [tabKey, setTabKey]         = useState(0);
  const [data, setData]             = useState<SpiritualData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [gospelOpen, setGospelOpen] = useState(false);
  const [rosary, setRosary]         = useState<ReturnType<typeof getRosaryProgress>>(null);

  // Séquence interactive
  const [seqOpen, setSeqOpen]       = useState(false);
  const [seqKey, setSeqKey]         = useState<string>("matin");
  const [seqIdx, setSeqIdx]         = useState(0);
  const [seqHelpOpen, setSeqHelpOpen] = useState(false);

  // Panel confier + intentions
  const [confierOpen, setConfierOpen]         = useState(false);
  const [intentionsOpen, setIntentionsOpen]   = useState(false);
  const [confierInput, setConfierInput]       = useState("");
  const [confierList, setConfierList]         = useState<string[]>([]);
  const [intentionsList, setIntentionsList]   = useState<Array<{ id: string; text: string; at: string }>>([]);
  const [newIntention, setNewIntention]       = useState("");

  // Accordéons bibliothèque
  const [openCat, setOpenCat]       = useState<string | null>(null);

  // ── Chargement données ──────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/spiritual");
      if (res.ok) setData(await res.json());
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setRosary(getRosaryProgress()); }, []);

  // ── Hash navigation ─────────────────────────────────────────────────────────
  useEffect(() => {
    const readHash = () => {
      const h = window.location.hash.replace("#", "") as Tab;
      if (h === "chapelet" || h === "prieres" || h === "jour") {
        setTab(h); setTabKey(k => k + 1);
      }
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  // ── localStorage confier & intentions ──────────────────────────────────────
  useEffect(() => {
    try { setConfierList(JSON.parse(localStorage.getItem(CONFIER_KEY) || "[]")); } catch { setConfierList([]); }
    try { setIntentionsList(JSON.parse(localStorage.getItem(INTENTIONS_KEY) || "[]")); } catch { setIntentionsList([]); }
  }, []);

  const saveConfier = (list: string[]) => {
    setConfierList(list);
    try { localStorage.setItem(CONFIER_KEY, JSON.stringify(list)); } catch { /* noop */ }
  };
  const saveIntentions = (list: typeof intentionsList) => {
    setIntentionsList(list);
    try { localStorage.setItem(INTENTIONS_KEY, JSON.stringify(list)); } catch { /* noop */ }
  };

  const addConfier = () => {
    const v = confierInput.trim();
    if (!v || confierList.includes(v)) return;
    saveConfier([...confierList, v]);
    setConfierInput("");
  };
  const removeConfier = (i: number) => saveConfier(confierList.filter((_, idx) => idx !== i));

  const addIntention = () => {
    const v = newIntention.trim();
    if (!v) return;
    saveIntentions([{ id: Date.now().toString(), text: v, at: new Date().toISOString() }, ...intentionsList]);
    setNewIntention("");
  };
  const deleteIntention = (id: string) => saveIntentions(intentionsList.filter(i => i.id !== id));
  const updateIntention = (id: string, text: string) =>
    saveIntentions(intentionsList.map(i => i.id === id ? { ...i, text } : i));

  // ── Bloc "Je confie en ce jour" (injecté dans séquences) ───────────────────
  const confierBlock = () => {
    if (!confierList.length && !intentionsList.length) return null;
    const names = confierList.length
      ? confierList.length === 1
        ? confierList[0]
        : confierList.slice(0, -1).join(", ") + " et " + confierList[confierList.length - 1]
      : null;
    const activeIntentions = intentionsList.filter(i => i.text.trim());
    return (
      <div style={{ background: C.creamGold, border: `1px solid ${C.goldBorder}`, borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: 6 }}>Je confie en ce jour</p>
        {names && <p style={{ fontFamily: C.serif, fontSize: 16, fontWeight: 300, fontStyle: "italic", color: C.ink80, lineHeight: 1.6, margin: 0 }}>{names}.</p>}
        {activeIntentions.length > 0 && (
          <p style={{ fontFamily: C.serif, fontSize: 14, color: C.ink65, fontStyle: "italic", marginTop: 4, lineHeight: 1.55 }}>
            {activeIntentions.map(i => i.text.trim()).join(" · ")}
          </p>
        )}
      </div>
    );
  };

  // ── Navigation onglets ──────────────────────────────────────────────────────
  const switchTab = (t: Tab) => {
    setTab(t); setTabKey(k => k + 1);
    window.history.replaceState(null, "", `#${t}`);
    window.scrollTo(0, 0);
  };

  // ── Séquence interactive ────────────────────────────────────────────────────
  const openSeq = (key: string) => { setSeqKey(key); setSeqIdx(0); setSeqHelpOpen(false); setSeqOpen(true); };
  const closeSeq = () => setSeqOpen(false);
  const advanceSeq = () => {
    const seq = SEQUENCES[seqKey];
    setSeqHelpOpen(false);
    if (seqIdx < seq.steps.length - 1) { setSeqIdx(i => i + 1); return; }
    setSeqIdx(seq.steps.length); // écran fin
  };

  const seq = SEQUENCES[seqKey];
  const seqStep = seq?.steps[seqIdx];
  const seqIsFirst = seqIdx === 0;
  const seqIsEnd = seqIdx >= (seq?.steps.length ?? 0);

  // ── Gospel ──────────────────────────────────────────────────────────────────
  const gospelText  = data?.gospel?.text ? stripHtml(data.gospel.text) : "";
  const gospelLines = gospelText.split("\n").filter(Boolean);
  const previewLines = gospelLines.slice(0, 4).join("\n");
  const restLines    = gospelLines.slice(4).join("\n");

  const rosaryPercent = rosary
    ? Math.round(((rosary.decadeIndex * 10 + Math.max(0, rosary.grainIndex + 1)) / 50) * 100)
    : 0;

  const now = new Date();
  const dayNames   = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const dateLabel  = `${dayNames[now.getDay()]} ${now.getDate()} ${monthNames[now.getMonth()]}`;
  const todayShort = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][now.getDay()];

  const TABS = [
    { key: "jour" as Tab, label: "Du jour" },
    { key: "chapelet" as Tab, label: "Chapelet" },
    { key: "prieres" as Tab, label: "Prières" },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>

      {/* ── Styles globaux ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes sk  { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes fu  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes sl  { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:none} }
        .fu  { animation: fu .4s cubic-bezier(.16,1,.3,1) both; }
        .sl  { animation: sl .3s cubic-bezier(.16,1,.3,1) both; }
        .rh:hover { background: rgba(17,16,9,0.04) !important; cursor: pointer; }
        .btn-tap:active { opacity: 0.75; transform: scale(0.98); }

        /* ── Layout ── */
        .page-inner   { max-width: 600px; margin: 0 auto; padding: 14px 14px 80px; }
        .tab-header   { max-width: 600px; margin: 0 auto; }

        /* ── Desktop (≥768px) ── */
        @media (min-width: 768px) {
          .page-inner { max-width: 900px !important; padding: 24px 28px 80px !important; }
          .tab-header { max-width: 900px !important; padding: 0 8px; }
          .deux-col   { display: grid !important; grid-template-columns: 1fr 320px; gap: 18px; align-items: start; }
          .col-right  { display: flex !important; flex-direction: column; gap: 12px; }
          .date-lbl   { font-size: 22px !important; }
          .gospel-tit { font-size: 22px !important; }
          .gospel-txt { font-size: 16px !important; line-height: 1.72 !important; }
          .saint-nom  { font-size: 20px !important; }
        }
        @media (min-width: 1100px) {
          .deux-col { grid-template-columns: 1fr 360px; }
        }

        /* ── Overlay panel ── */
        .panel-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(17,16,9,0.38);
          display: flex; align-items: flex-end;
          animation: fadeIn .18s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .panel-sheet {
          width: 100%; max-height: 92vh; overflow-y: auto;
          background: ${C.bg};
          border-radius: 24px 24px 0 0;
          padding: 0 0 env(safe-area-inset-bottom);
          animation: slideUp .25s cubic-bezier(.16,1,.3,1);
        }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:none} }
        @media (min-width: 640px) {
          .panel-overlay { align-items: center; justify-content: center; }
          .panel-sheet {
            max-width: 520px; border-radius: 20px;
            max-height: 85vh;
          }
        }
        .panel-hdr {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px 12px;
          border-bottom: 1px solid ${C.ink12};
          position: sticky; top: 0; background: ${C.bg}; z-index: 1;
          border-radius: 24px 24px 0 0;
        }
        @media (min-width: 640px) { .panel-hdr { border-radius: 20px 20px 0 0; } }
        .panel-body { padding: 16px 20px 24px; display: flex; flex-direction: column; gap: 14px; }

        /* ── Séquence plein écran ── */
        .seq-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: ${C.bg};
          overflow-y: auto;
          animation: fu .25s cubic-bezier(.16,1,.3,1);
        }
        .seq-hdr {
          height: 56px;
          background: rgba(242,235,224,0.96);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid ${C.ink12};
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 18px;
          position: sticky; top: 0; z-index: 10;
        }
        .seq-inner { max-width: 540px; margin: 0 auto; padding: 20px 16px 80px; }
        .seq-card {
          background: ${C.card};
          border: 1px solid ${C.cardBorder};
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(17,16,9,0.07);
        }
        .seq-card-head {
          background: linear-gradient(135deg, ${C.dark2}, ${C.dark});
          padding: 22px; color: #F5EFE4;
        }
        .seq-card-body { padding: 22px; }
        .seq-pray-text {
          font-family: ${C.serif};
          font-size: 20px; line-height: 1.72;
          color: ${C.ink}; white-space: pre-line; font-weight: 300;
        }
        .seq-btn-primary {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #C49A3C, #B8893A);
          border: none; border-radius: 99px; color: ${C.dark};
          font-size: 16px; font-weight: 700; cursor: pointer;
          font-family: ${C.sans}; transition: opacity .14s;
        }
        .seq-btn-primary:hover { opacity: .88; }
        .seq-btn-sec {
          width: 100%; padding: 13px;
          background: ${C.creamGold}; border: 1px solid ${C.goldBorder};
          border-radius: 99px; color: ${C.dark};
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: ${C.sans};
        }
        .progress-bar {
          height: 6px; border-radius: 99px;
          background: rgba(255,255,255,.15); overflow: hidden; margin-top: 12px;
        }
        .progress-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #C49A3C, #E0BD68);
          transition: width .25s ease;
        }

        /* ── Responsive mobile fine tuning ── */
        @media (max-width: 420px) {
          .seq-pray-text { font-size: 17px !important; }
          .panel-body    { padding: 14px 16px 20px; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════
          HEADER DORÉ (onglets)
      ════════════════════════════════════════════════════════ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "linear-gradient(180deg,#D4A83A 0%,#C49A3C 55%,#B8893A 100%)",
        borderBottom: "1.5px solid #8A6520",
        boxShadow: "0 2px 8px rgba(139,101,32,0.20)",
      }}>
        <div className="tab-header" style={{ display: "flex" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => switchTab(t.key)} className="btn-tap" style={{
              flex: 1, padding: "13px 4px 11px", textAlign: "center",
              fontSize: 13, fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? "#fff" : "rgba(255,255,255,0.55)",
              background: "none", border: "none", cursor: "pointer",
              borderBottom: `3px solid ${tab === t.key ? "#fff" : "transparent"}`,
              fontFamily: C.sans, transition: "all .15s",
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          CONTENU PRINCIPAL
      ════════════════════════════════════════════════════════ */}
      <main className="page-inner">

        {/* ──────────────────────────────────────────────────────
            ONGLET : DU JOUR
        ────────────────────────────────────────────────────── */}
        {tab === "jour" && (
          <div key={`jour-${tabKey}`} className="fu" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Date + couleur liturgique */}
            <div style={{ padding: "6px 4px 2px", display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
              <span className="date-lbl" style={{ fontFamily: C.serif, fontSize: 18, fontWeight: 300, color: C.ink, lineHeight: 1.2 }}>
                {dateLabel}
              </span>
              {!loading && data?.liturgicalInfo?.week && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: data.liturgicalInfo.color === "white" ? "transparent" : data.liturgicalInfo.colorHex,
                    border: data.liturgicalInfo.color === "white" ? "1.5px solid rgba(184,137,58,.60)" : "none",
                    flexShrink: 0,
                  }} />
                  <span style={{ fontFamily: C.sans, fontSize: 11, fontWeight: 500, color: C.gold, letterSpacing: "0.03em" }}>
                    {data.liturgicalInfo.week}
                  </span>
                </div>
              )}
            </div>

            {/* Layout 2 colonnes sur desktop */}
            <div className="deux-col" style={{ display: "contents" }}>

              {/* Colonne gauche */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Citation */}
                {loading ? (
                  <div style={{ background: C.dark, borderRadius: 14, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <Skel w="85%" h="16px" r="4px" /><Skel w="60%" h="14px" r="4px" /><Skel w="35%" h="10px" r="4px" />
                  </div>
                ) : data?.quote && (
                  <div style={{ background: C.dark, borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 4, left: 12, fontFamily: C.serif, fontSize: 52, lineHeight: 1, color: "rgba(184,137,58,0.12)", pointerEvents: "none", userSelect: "none" }}>«</div>
                    <p style={{ fontFamily: C.serif, fontSize: 17, fontWeight: 300, fontStyle: "italic", color: "#F5EFE4", lineHeight: 1.55, marginBottom: 8, position: "relative", zIndex: 1 }}>
                      {data.quote.text}
                    </p>
                    <p style={{ fontSize: 11, fontWeight: 500, color: "rgba(196,154,60,0.80)", position: "relative", zIndex: 1, fontFamily: C.sans }}>
                      — {data.quote.author}
                    </p>
                  </div>
                )}

                {/* Évangile */}
                <div style={{ background: C.card, borderRadius: 14, border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
                  {loading ? (
                    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                      <Skel w="65%" h="20px" r="4px" /><Skel w="30%" h="11px" /><Skel w="90%" h="14px" /><Skel w="75%" h="14px" />
                    </div>
                  ) : data?.gospel ? (
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                        <span className="gospel-tit" style={{ fontFamily: C.serif, fontSize: 20, fontWeight: 400, color: C.ink, lineHeight: 1.2 }}>
                          {getEvangelist(data.gospel.intro)}
                        </span>
                        {data.gospel.reference && (
                          <span style={{ fontSize: 12, color: C.gold, fontFamily: C.sans }}>{data.gospel.reference}</span>
                        )}
                      </div>
                      <p className="gospel-txt" style={{ fontFamily: C.serif, fontSize: 15, fontWeight: 300, fontStyle: "italic", color: C.ink80, lineHeight: 1.55, whiteSpace: "pre-line", margin: 0 }}>
                        {previewLines}
                      </p>
                      {restLines && gospelOpen && (
                        <p style={{ fontFamily: C.serif, fontSize: 15, fontWeight: 300, color: "rgba(17,16,9,0.74)", lineHeight: 1.55, whiteSpace: "pre-line", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.ink12}` }}>
                          {restLines}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, marginTop: 10, borderTop: `1px solid ${C.ink12}` }}>
                        <a href={data.gospel.aelfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: C.ink35, textDecoration: "none", fontFamily: C.sans }}>
                          Source AELF →
                        </a>
                        {restLines && (
                          <button onClick={() => setGospelOpen(v => !v)} style={{ fontSize: 12, color: C.gold, fontWeight: 500, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontFamily: C.sans }}>
                            {gospelOpen ? "Fermer" : "Lire la suite"} <Chev color={C.gold} />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 14 }}>
                      <p style={{ fontSize: 13, color: C.ink50, fontFamily: C.sans }}>{data?.error || "L'évangile du jour n'est pas disponible."}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne droite */}
              <div className="col-right" style={{ display: "contents" }}>

                {/* Saint du jour */}
                {loading ? (
                  <div style={{ background: C.cream, borderRadius: 14, padding: "12px 14px", border: `1.5px solid ${C.goldBorder}`, display: "flex", flexDirection: "column", gap: 7, marginTop: 10 }}>
                    <Skel w="50%" h="16px" /><Skel w="25%" h="10px" /><Skel w="90%" h="12px" />
                  </div>
                ) : data?.saint && (
                  <div style={{ background: C.cream, borderRadius: 14, padding: "12px 14px", border: `1.5px solid ${C.goldBorder}`, marginTop: 10 }}>
                    <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: 5 }}>Saint du jour</p>
                    <p className="saint-nom" style={{ fontFamily: C.serif, fontSize: 18, fontWeight: 400, color: C.ink, marginBottom: 2, lineHeight: 1.2 }}>{data.saint.name}</p>
                    {data.saint.dates && <p style={{ fontSize: 11, color: C.ink50, marginBottom: 7, fontFamily: C.sans }}>{data.saint.dates}</p>}
                    <p style={{ fontFamily: C.serif, fontSize: 14, fontWeight: 300, color: C.ink65, lineHeight: 1.55 }}>{data.saint.description}</p>
                  </div>
                )}

                {/* Mes intentions (accès rapide) */}
                <div style={{ background: C.card, borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${C.cardBorder}`, marginTop: 10 }}>
                  <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: 5 }}>Mes intentions</p>
                  <p style={{ fontFamily: C.serif, fontSize: 16, fontWeight: 300, color: C.ink, marginBottom: 10, lineHeight: 1.2 }}>Ce que je confie.</p>
                  {intentionsList.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                      {intentionsList.slice(0, 2).map(i => (
                        <div key={i.id} style={{ background: C.creamGold, border: `1px solid ${C.goldBorder}`, borderRadius: 8, padding: "8px 11px" }}>
                          <p style={{ fontFamily: C.serif, fontSize: 13, fontStyle: "italic", color: C.ink80, lineHeight: 1.5, margin: 0 }}>{i.text.length > 60 ? i.text.slice(0, 57) + "…" : i.text}</p>
                        </div>
                      ))}
                      {intentionsList.length > 2 && <p style={{ fontSize: 11, color: C.ink35, fontFamily: C.sans }}>+{intentionsList.length - 2} autre{intentionsList.length > 3 ? "s" : ""}</p>}
                    </div>
                  ) : (
                    <p style={{ fontFamily: C.serif, fontSize: 13, color: C.ink35, fontStyle: "italic", marginBottom: 10 }}>Aucune intention pour le moment.</p>
                  )}
                  <button onClick={() => setIntentionsOpen(true)} style={{ width: "100%", padding: "9px 14px", background: C.creamGold, border: `1px solid ${C.goldBorder}`, borderRadius: 99, fontSize: 12, fontWeight: 600, color: C.dark, cursor: "pointer", fontFamily: C.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Écrire une intention
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────
            ONGLET : CHAPELET
        ────────────────────────────────────────────────────── */}
        {tab === "chapelet" && (
          <div key={`chapelet-${tabKey}`} className="fu" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Carte mystère */}
            <div style={{ background: `linear-gradient(135deg,${C.dark2},${C.dark})`, borderRadius: 16, border: "1.5px solid rgba(196,154,60,0.22)", padding: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
                  <circle cx="80" cy="80" r="72" stroke="#C49A3C" strokeWidth="0.5" opacity="0.10" />
                  <circle cx="80" cy="80" r="52" stroke="#C49A3C" strokeWidth="0.4" opacity="0.07" />
                </svg>
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(196,154,60,0.85)", fontFamily: C.sans, marginBottom: 5 }}>
                  Mystère du jour · {todayShort}
                </p>
                <p style={{ fontFamily: C.serif, fontSize: 22, fontWeight: 300, color: "#F5EFE4", lineHeight: 1.15, marginBottom: 6 }}>
                  {rosary ? MYSTERY_LABELS[rosary.mysteryType] : "Mystères du jour"}
                </p>
                <p style={{ fontFamily: C.serif, fontSize: 13, fontWeight: 300, fontStyle: "italic", color: "rgba(245,239,228,0.72)", lineHeight: 1.4, margin: 0 }}>
                  Cinq mystères à contempler avec Marie
                </p>
              </div>
            </div>

            {/* Reprise ou démarrage */}
            {rosary ? (
              <div style={{ background: C.card, borderRadius: 14, padding: 16, border: `1.5px solid ${C.goldBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.ink, margin: "0 0 2px", fontFamily: C.sans }}>{MYSTERY_LABELS[rosary.mysteryType]}</p>
                    <p style={{ fontSize: 12, color: C.ink50, margin: 0, fontFamily: C.sans }}>Dizaine {rosary.decadeIndex + 1} · {rosaryPercent}%</p>
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 300, color: "#C49A3C", fontFamily: C.serif }}>{rosaryPercent}%</span>
                </div>
                <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < rosary.decadeIndex ? C.dark : i === rosary.decadeIndex ? "#C49A3C" : C.ink12 }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href="/dashboard/spiritual/chapelet?resume=1" style={{ textDecoration: "none", flex: 2 }}>
                    <button style={{ width: "100%", padding: 13, borderRadius: 12, background: "#C49A3C", border: "none", color: C.dark, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: C.sans }}>Reprendre →</button>
                  </Link>
                  <button onClick={() => { try { localStorage.removeItem(ROSARY_KEY); } catch {} setRosary(null); }} style={{ flex: 1, padding: 13, borderRadius: 12, border: `1.5px solid ${C.ink12}`, background: "none", fontSize: 12, color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>Effacer</button>
                </div>
              </div>
            ) : (
              <Link href="/dashboard/spiritual/chapelet" style={{ textDecoration: "none" }}>
                <button style={{ width: "100%", padding: 15, background: "#C49A3C", border: "none", borderRadius: 14, color: C.dark, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: C.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Cross size={15} color={C.dark} /> Commencer le chapelet →
                </button>
              </Link>
            )}

            {/* Citation */}
            <div style={{ background: C.card, borderRadius: 13, border: `1.5px solid ${C.cardBorder}`, padding: "13px 16px" }}>
              <p style={{ fontFamily: C.serif, fontSize: 14, fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.5, marginBottom: 4 }}>
                « Le chapelet est l&apos;arme de notre temps. »
              </p>
              <p style={{ fontSize: 11, fontWeight: 400, color: C.ink50, fontFamily: C.sans, marginBottom: 8 }}>— Saint Jean-Paul II</p>
              <Link href="/dashboard/spiritual/chapelet?pourquoi=1" style={{ fontSize: 12, fontWeight: 500, color: C.gold, textDecoration: "none", display: "flex", alignItems: "center", gap: 3, fontFamily: C.sans }}>
                Pourquoi prier le chapelet <Chev color={C.gold} />
              </Link>
            </div>

            <p style={{ fontSize: 10, fontWeight: 300, color: C.ink35, textAlign: "center", fontFamily: C.sans }}>
              Progression sauvegardée automatiquement
            </p>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────
            ONGLET : PRIÈRES
        ────────────────────────────────────────────────────── */}
        {tab === "prieres" && (
          <div key={`prieres-${tabKey}`} className="fu" style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* En-tête */}
            <div style={{ marginBottom: 2 }}>
              <p style={{ fontFamily: C.serif, fontSize: 24, fontWeight: 300, color: C.ink, margin: "0 0 2px" }}>Prières</p>
              <p style={{ fontFamily: C.sans, fontSize: 12, fontWeight: 300, color: C.ink50, margin: 0 }}>{getGreeting()}</p>
            </div>

            {/* Séquences guidées */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {PRAYER_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => openSeq(cat.id)} className="btn-tap" style={{
                  background: C.card, border: `1.5px solid ${C.cardBorder}`, borderRadius: 14,
                  padding: "14px 14px 12px", textAlign: "left", cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: 4,
                }}>
                  <span style={{ fontSize: 18 }}>{cat.icon}</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: C.sans, margin: 0 }}>{cat.label}</p>
                  <p style={{ fontSize: 11, color: C.ink50, fontFamily: C.sans, margin: 0, lineHeight: 1.4 }}>{cat.desc}</p>
                  <p style={{ fontSize: 10, color: C.gold, fontFamily: C.sans, margin: "2px 0 0", fontWeight: 500 }}>⏱ {cat.duration}</p>
                </button>
              ))}
            </div>

            {/* Parcours guidé */}
            <div onClick={() => router.push("/dashboard/spiritual/parcours")} className="rh" style={{
              background: `linear-gradient(135deg,${C.dark2},${C.dark})`,
              borderRadius: 16, border: "1.5px solid rgba(196,154,60,0.30)",
              padding: 16, cursor: "pointer",
            }}>
              <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(196,154,60,0.80)", fontFamily: C.sans, marginBottom: 5 }}>Nouveau ici ?</p>
              <p style={{ fontFamily: C.serif, fontSize: 20, fontWeight: 300, color: "#F5EFE4", marginBottom: 3, lineHeight: 1.25 }}>Commencer à prier.</p>
              <p style={{ fontSize: 12, color: "rgba(245,239,228,0.70)", fontFamily: C.sans, marginBottom: 10, lineHeight: 1.5 }}>Un parcours guidé · 5 minutes.</p>
              <span style={{ display: "inline-flex", alignItems: "center", background: "#C49A3C", borderRadius: 99, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: C.dark, fontFamily: C.sans }}>Je commence →</span>
            </div>

            {/* Bibliothèque toutes prières */}
            <div style={{ marginTop: 4 }}>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.ink35, fontFamily: C.sans, marginBottom: 8 }}>Bibliothèque</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {PRAYER_CATEGORIES.map(cat => (
                  <div key={cat.id} style={{ background: C.card, borderRadius: 12, border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
                    <button onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)} style={{
                      width: "100%", background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", fontFamily: C.sans,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, color: C.gold }}>{cat.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{cat.label}</span>
                        <span style={{ fontSize: 10, color: C.gold, fontWeight: 500 }}>{cat.duration}</span>
                      </div>
                      <span style={{ fontSize: 16, color: C.ink35, transform: openCat === cat.id ? "rotate(90deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>›</span>
                    </button>
                    {openCat === cat.id && (
                      <div style={{ borderTop: `1px solid ${C.ink12}` }}>
                        {SEQUENCES[cat.id].steps.map((step, i) => (
                          <button key={i} onClick={() => openSeq(cat.id)} style={{
                            width: "100%", background: "none", border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "11px 14px",
                            borderBottom: i < SEQUENCES[cat.id].steps.length - 1 ? `1px solid ${C.ink12}` : "none",
                            fontFamily: C.sans, textAlign: "left",
                          }}>
                            <div>
                              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.gold, margin: "0 0 1px" }}>{step.num}</p>
                              <p style={{ fontSize: 13, fontWeight: 500, color: C.ink, margin: 0 }}>{step.title}</p>
                            </div>
                            <Chev />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════════════
          SÉQUENCE INTERACTIVE (plein écran)
      ════════════════════════════════════════════════════════ */}
      {seqOpen && seq && (
        <div className="seq-overlay">
          <header className="seq-hdr">
            <button onClick={closeSeq} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.55)", border: `1px solid ${C.ink12}`, borderRadius: 99, padding: "0 14px", minHeight: 40, fontSize: 13, color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 16 16"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Retour
            </button>
            <span style={{ fontFamily: C.serif, fontSize: 17, color: C.ink65, fontStyle: "italic" }}>{seq.title.replace(".", "")}</span>
            <span style={{ fontSize: 12, color: C.ink50, fontWeight: 600, fontFamily: C.sans }}>
              {seqIsEnd ? "Terminé" : `${seqIdx + 1}/${seq.steps.length}`}
            </span>
          </header>

          <div className="seq-inner">
            {/* Fin de séquence */}
            {seqIsEnd ? (
              <div className="sl" style={{ background: C.card, borderRadius: 22, border: `1px solid ${C.cardBorder}`, padding: 28, textAlign: "center", display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ fontFamily: C.serif, fontSize: 30, fontWeight: 300, color: C.ink, letterSpacing: "-.04em" }}>Prière terminée.</p>
                <p style={{ fontSize: 14, color: C.ink50, lineHeight: 1.6, fontFamily: C.sans }}>Prenez quelques secondes de silence. Ce moment est confié.</p>
                {confierBlock()}
                <button onClick={closeSeq} className="seq-btn-primary">Retour aux prières →</button>
              </div>
            ) : (
              <>
                {/* Bloc confier avant signe de croix */}
                {seqIsFirst && confierBlock()}

                <div className="seq-card sl">
                  <div className="seq-card-head">
                    <small style={{ display: "block", color: "rgba(196,154,60,0.85)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
                      {seq.kicker}
                    </small>
                    <h2 style={{ fontFamily: C.serif, fontSize: 28, fontWeight: 300, lineHeight: 1.08, letterSpacing: "-.03em", margin: 0 }}>
                      {seqStep?.title}
                    </h2>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${((seqIdx + 1) / seq.steps.length) * 100}%` }} />
                    </div>
                  </div>

                  <div className="seq-card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="seq-pray-text">{seqStep?.text}</div>

                    {/* Aide contextuelle */}
                    {seqStep?.note && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button onClick={() => setSeqHelpOpen(v => !v)} className="seq-btn-sec">
                          {seqHelpOpen ? "Masquer l'aide" : "+ Aide"}
                        </button>
                        {seqHelpOpen && (
                          <div style={{ background: C.creamGold, border: `1px solid ${C.goldBorder}`, borderRadius: 12, padding: "11px 14px" }}>
                            <p style={{ fontSize: 13, color: C.ink65, lineHeight: 1.6, fontFamily: C.sans, margin: 0 }}>
                              {seqStep.note.startsWith("aide|") ? seqStep.note.slice(5) : seqStep.note}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <button onClick={advanceSeq} className="seq-btn-primary btn-tap">
                      {seqIdx < seq.steps.length - 1 ? "Amen →" : "Terminer →"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          PANEL : CONFIER LES PERSONNES
      ════════════════════════════════════════════════════════ */}
      {confierOpen && (
        <div className="panel-overlay" onClick={e => e.target === e.currentTarget && setConfierOpen(false)}>
          <div className="panel-sheet">
            <div className="panel-hdr">
              <div>
                <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: 2 }}>Confier les personnes</p>
                <p style={{ fontFamily: C.serif, fontSize: 20, fontWeight: 300, color: C.ink, margin: 0 }}>Pour qui voulez-vous prier ?</p>
              </div>
              <button onClick={() => setConfierOpen(false)} style={{ width: 32, height: 32, borderRadius: "50%", background: C.cream, border: "none", fontSize: 16, color: C.ink50, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div className="panel-body">
              <p style={{ fontSize: 13, color: C.ink50, lineHeight: 1.6, fontFamily: C.sans }}>
                Ces prénoms apparaîtront à la fin de chaque prière : <em style={{ fontFamily: C.serif }}>« Je confie en ce jour… »</em>
              </p>

              {/* Champ ajout */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={confierInput}
                  onChange={e => setConfierInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addConfier()}
                  placeholder="Ex : Maman, Paul, Marie…"
                  maxLength={60}
                  style={{ flex: 1, border: `1.5px solid ${C.ink12}`, borderRadius: 10, padding: "10px 13px", fontFamily: C.serif, fontSize: 15, fontStyle: "italic", color: C.ink, background: C.card, outline: "none" }}
                />
                <button onClick={addConfier} style={{ background: C.dark, color: "#F5EFE4", border: "none", borderRadius: 10, padding: "0 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: C.sans, minHeight: 44, whiteSpace: "nowrap" }}>
                  Ajouter
                </button>
              </div>

              {/* Liste */}
              {confierList.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {confierList.map((name, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.creamGold, border: `1px solid ${C.goldBorder}`, borderRadius: 10, padding: "9px 12px" }}>
                      <span style={{ fontFamily: C.serif, fontSize: 15, fontStyle: "italic", color: C.ink }}>{name}</span>
                      <button onClick={() => removeConfier(i)} style={{ fontSize: 16, color: C.ink35, background: "none", border: "none", cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: C.ink35, fontStyle: "italic", fontFamily: C.serif, textAlign: "center", padding: "8px 0" }}>Aucun prénom ajouté.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          PANEL : MES INTENTIONS
      ════════════════════════════════════════════════════════ */}
      {intentionsOpen && (
        <div className="panel-overlay" onClick={e => e.target === e.currentTarget && setIntentionsOpen(false)}>
          <div className="panel-sheet">
            <div className="panel-hdr">
              <div>
                <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: 2 }}>Mes intentions</p>
                <p style={{ fontFamily: C.serif, fontSize: 20, fontWeight: 300, color: C.ink, margin: 0 }}>Ce que je confie à Dieu.</p>
              </div>
              <button onClick={() => setIntentionsOpen(false)} style={{ width: 32, height: 32, borderRadius: "50%", background: C.cream, border: "none", fontSize: 16, color: C.ink50, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div className="panel-body">
              <p style={{ fontSize: 13, color: C.ink50, lineHeight: 1.6, fontFamily: C.sans }}>
                Écrivez librement. Chaque intention est sauvegardée et modifiable.
              </p>

              {/* Nouvelle intention */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <textarea
                  value={newIntention}
                  onChange={e => setNewIntention(e.target.value)}
                  placeholder="Pour mon père malade… Pour la paix… Pour une décision difficile…"
                  maxLength={280}
                  rows={3}
                  style={{ width: "100%", border: `1.5px solid ${C.ink12}`, borderRadius: 12, padding: "12px 14px", fontFamily: C.serif, fontSize: 15, fontStyle: "italic", color: C.ink, background: C.card, outline: "none", resize: "none", lineHeight: 1.55 }}
                />
                <button onClick={addIntention} style={{ width: "100%", padding: 12, background: C.dark, border: "none", borderRadius: 99, color: "#F5EFE4", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: C.sans }}>
                  Ajouter cette intention →
                </button>
              </div>

              {/* Liste intentions existantes */}
              {intentionsList.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                  <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.ink35, fontFamily: C.sans }}>Intentions enregistrées</p>
                  {intentionsList.map(item => (
                    <IntentionEditRow
                      key={item.id}
                      item={item}
                      onSave={text => updateIntention(item.id, text)}
                      onDelete={() => deleteIntention(item.id)}
                      C={C}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Composant intention éditable ─────────────────────────────────────────────

function IntentionEditRow({
  item, onSave, onDelete, C,
}: {
  item: { id: string; text: string; at: string };
  onSave: (text: string) => void;
  onDelete: () => void;
  C: Record<string, string>;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(item.text);

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    const m = ["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"][d.getMonth()];
    return `${d.getDate()} ${m}.`;
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "11px 13px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.ink35, fontFamily: C.sans }}>{fmtDate(item.at)}</span>
        <button onClick={onDelete} style={{ fontSize: 12, color: "#B44", background: "none", border: "none", cursor: "pointer", fontFamily: C.sans }}>Supprimer</button>
      </div>
      {editing ? (
        <>
          <textarea
            value={val}
            onChange={e => setVal(e.target.value)}
            rows={2}
            style={{ width: "100%", border: `1.5px solid ${C.gold}`, borderRadius: 8, padding: "9px 11px", fontFamily: C.serif, fontSize: 14, fontStyle: "italic", color: C.ink, background: C.creamGold, outline: "none", resize: "none", lineHeight: 1.55 }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => { setVal(item.text); setEditing(false); }} style={{ fontSize: 12, color: C.ink50, background: "none", border: "none", cursor: "pointer", fontFamily: C.sans }}>Annuler</button>
            <button onClick={() => { onSave(val); setEditing(false); }} style={{ fontSize: 12, fontWeight: 600, color: C.gold, background: "rgba(184,137,58,0.10)", border: `1px solid ${C.goldBorder}`, borderRadius: 99, padding: "4px 12px", cursor: "pointer", fontFamily: C.sans }}>Enregistrer</button>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <p style={{ fontFamily: C.serif, fontSize: 14, fontStyle: "italic", color: C.ink80, lineHeight: 1.55, flex: 1, margin: 0 }}>{item.text}</p>
          <button onClick={() => setEditing(true)} style={{ fontSize: 12, color: C.gold, background: "none", border: "none", cursor: "pointer", fontFamily: C.sans, whiteSpace: "nowrap", flexShrink: 0 }}>Modifier</button>
        </div>
      )}
    </div>
  );
}
