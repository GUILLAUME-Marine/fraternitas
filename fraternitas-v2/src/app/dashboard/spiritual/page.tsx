"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════════════
   FRATERNITAS — src/app/dashboard/spiritual/page.tsx
   
   Architecture :
   - Onglet "Du jour"    → évangile AELF réel + saint + citation + intentions panel
   - Onglet "Chapelet"   → aperçu progression + lien vers /spiritual/chapelet (page dédiée complète)
   - Onglet "Prières"    → séquences guidées intégrées + aide à la prière intégrée + bibliothèque
   
   Dépendances repo intactes :
   - /api/spiritual        → évangile AELF + saints réels par date
   - /spiritual/chapelet   → chapelet SVG interactif complet (733 lignes existantes)
   - /spiritual/parcours   → aide guidée complète (existante)
   - localStorage key "fraternitas_rosary_v3" → compatible avec chapelet/page.tsx
═══════════════════════════════════════════════════════════════════════════════ */

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpiritualData {
  date: string;
  liturgicalInfo: {
    label: string; season: string; week: string;
    color: string; colorHex: string;
  };
  gospel: {
    reference: string; title: string; intro: string;
    text: string; aelfUrl: string;
  } | null;
  saint: { name: string; dates: string; description: string };
  quote: { text: string; author: string };
  error?: string;
}

type Tab = "jour" | "chapelet" | "prieres";

interface Intention { id: string; text: string; at: string }

// ─── Constantes ───────────────────────────────────────────────────────────────

const ROSARY_KEY     = "fraternitas_rosary_v3";   // partagé avec chapelet/page.tsx
const CONFIER_KEY    = "fraternitas_confier_v1";
const INTENTIONS_KEY = "fraternitas_intentions_v2";

const C = {
  bg: "#F2EBE0", cream: "#E8DDD0", cream3: "#F5EDE0",
  paper: "#FFFFFF", dark: "#1A1410", dark2: "#2C1E08",
  gold: "#B8893A", gold2: "#C49A3C", goldB: "rgba(184,137,58,0.28)",
  ink: "#111009",
  ink80: "rgba(17,16,9,0.80)", ink65: "rgba(17,16,9,0.65)",
  ink50: "rgba(17,16,9,0.50)", ink35: "rgba(17,16,9,0.35)", ink12: "rgba(17,16,9,0.12)",
  serif: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  sans:  "'DM Sans',system-ui,sans-serif",
};

const MYSTERY_LABELS: Record<string, string> = {
  joyeux:     "Mystères Joyeux",
  lumineux:   "Mystères Lumineux",
  douloureux: "Mystères Douloureux",
  glorieux:   "Mystères Glorieux",
};

// ─── Séquences de prière ──────────────────────────────────────────────────────

const SEQUENCES: Record<string, {
  kicker: string; title: string; desc: string; duration: string; icon: string;
  steps: Array<{ num: string; title: string; text: string; note?: string }>;
}> = {
  matin: {
    kicker: "Prière du matin · Séquence complète",
    title: "Commencer sa journée.", desc: "De la croix à l'offrande, en 5 minutes.", duration: "5 min", icon: "☀",
    steps: [
      { num:"1", title:"Signe de croix",
        text:"Au nom du Père,\net du Fils,\net du Saint-Esprit.\nAmen.",
        note:"aide|Posez la main droite sur le front, puis la poitrine, puis l'épaule gauche, puis l'épaule droite." },
      { num:"2", title:"Offrande du matin",
        text:"Mon Dieu, je vous offre toute ma journée :\nmes prières, mes pensées, mes paroles,\nmes actions, mes joies et mes peines,\nen union avec Jésus-Christ,\nqui s'offre chaque jour dans la sainte Messe.\nAmen.",
        note:"Prenez un instant pour penser à votre journée à venir." },
      { num:"3", title:"Acte de foi",
        text:"Mon Dieu, je crois fermement\ntoutes les vérités que vous avez révélées\net que la sainte Église nous enseigne,\nparce que vous êtes la vérité même.\nAmen." },
      { num:"4", title:"L'Angélus",
        text:"L'ange du Seigneur a annoncé à Marie.\nEt elle a conçu du Saint-Esprit.\n\nJe vous salue Marie…\n\nVoici la servante du Seigneur.\nQu'il me soit fait selon votre parole.\n\nJe vous salue Marie…\n\nEt le Verbe s'est fait chair.\nEt il a habité parmi nous.\n\nJe vous salue Marie…\n\nSeigneur, répandez votre grâce en nos âmes. Amen.",
        note:"Se prie à 6h, 12h et 18h." },
      { num:"5", title:"Signe de croix final",
        text:"Au nom du Père,\net du Fils,\net du Saint-Esprit.\nAmen.",
        note:"Votre journée est remise à Dieu. Commencez." },
    ],
  },
  soir: {
    kicker: "Prière du soir · Séquence complète",
    title: "Relire sa journée.", desc: "Examen de conscience et remise de la nuit à Dieu.", duration: "5 min", icon: "🌙",
    steps: [
      { num:"1", title:"Signe de croix",
        text:"Au nom du Père,\net du Fils,\net du Saint-Esprit.\nAmen." },
      { num:"2", title:"Examen de conscience",
        text:"Seigneur, je reviens vers toi ce soir.\n\nJe te rends grâce pour ce que j'ai reçu aujourd'hui —\nles moments de joie, les rencontres, les petites grâces.\n\nJe te demande de regarder avec moi ma journée :\noù ai-je été présent à toi ?\noù m'en suis-je éloigné ?\n\nJe te confie mes manquements\nsans me juger moi-même.\nTa miséricorde est plus grande que mes fautes.\n\nAmen.",
        note:"Prenez 2 à 3 minutes de silence pour relire votre journée." },
      { num:"3", title:"Acte de contrition",
        text:"Mon Dieu, j'ai un très grand regret\nde vous avoir offensé,\nparce que vous êtes infiniment bon,\ninfiniment aimable,\net que le péché vous déplaît.\n\nJe prends la ferme résolution,\navec le secours de votre sainte grâce,\nde ne plus vous offenser.\n\nAmen." },
      { num:"4", title:"Salve Regina",
        text:"Je vous salue, Reine, Mère de miséricorde,\nnotre vie, notre douceur, notre espérance, salut !\n\nEnfants d'Ève, nous crions vers vous,\ngémissants et pleurants\ndans cette vallée de larmes.\n\nÔ clémente, ô pieuse,\nô douce Vierge Marie.\nAmen.",
        note:"Prière traditionnelle du soir. Dans les abbayes, elle clôt la journée." },
      { num:"5", title:"Confier la nuit",
        text:"Seigneur, je te confie cette nuit.\nProtège-nous quand nous dormons.\nQue nous reposions en ta paix.\nAmen." },
    ],
  },
  inquiet: {
    kicker: "Dans l'inquiétude · 3 min",
    title: "Déposer ce qui pèse.", desc: "Quand on ne sait plus comment avancer.", duration: "3 min", icon: "🕯",
    steps: [
      { num:"1", title:"Ouvrir les mains",
        text:"Seigneur,\ntu vois ce qui m'écrase.\nJe ne sais pas toujours mettre des mots dessus.\n\nTu tiens le temps entre tes mains.\nApprends-moi à vivre aujourd'hui\nsans porter demain.\n\nAmen.",
        note:"Si vous ne savez pas quoi dire, dites juste : « Seigneur, aide-moi. »" },
      { num:"2", title:"Memorare",
        text:"Souvenez-vous, ô très pieuse Vierge Marie,\nqu'on n'a jamais entendu dire\nque quelqu'un de ceux qui ont eu recours\nà votre protection\nait été abandonné.\n\nAnimé d'une pareille confiance,\nje recours à vous.\nNe méprisez pas ma prière.\n\nAmen.",
        note:"Cette prière a 800 ans. Des millions de personnes l'ont priée dans des situations désespérées." },
      { num:"3", title:"Laisser Dieu tenir",
        text:"Père,\nje ne sais pas comment ça va finir.\nJe n'ai pas besoin de tout comprendre.\n\nJe te fais confiance.\nC'est tout.\n\nAmen." },
    ],
  },
  marie: {
    kicker: "Avec Marie · 4 min",
    title: "Se confier à celle qui a dit oui.", desc: "Ave Maria, Memorare, Salve Regina.", duration: "4 min", icon: "☽",
    steps: [
      { num:"1", title:"Je vous salue Marie",
        text:"Je vous salue, Marie pleine de grâce,\nle Seigneur est avec vous.\nVous êtes bénie entre toutes les femmes\net Jésus, le fruit de vos entrailles, est béni.\n\nSainte Marie, Mère de Dieu,\npriez pour nous pauvres pécheurs,\nmaintenant et à l'heure de notre mort.\nAmen.",
        note:"L'Ave Maria est la prière mariale la plus ancienne et la plus priée au monde." },
      { num:"2", title:"Memorare",
        text:"Souvenez-vous, ô très pieuse Vierge Marie,\nqu'on n'a jamais entendu dire\nque quelqu'un de ceux qui ont eu recours\nà votre protection ait été abandonné.\n\nAnimé d'une pareille confiance,\nje recours à vous, ô Vierge des vierges, ma Mère.\n\nÔ Mère du Verbe, ne méprisez pas ma prière.\n\nAmen.",
        note:"Attribuée à saint Bernard. Prière de confiance absolue." },
      { num:"3", title:"Salve Regina",
        text:"Je vous salue, Reine, Mère de miséricorde,\nnotre vie, notre douceur, notre espérance, salut !\n\nEnfants d'Ève, nous crions vers vous,\ngémissants et pleurants\ndans cette vallée de larmes.\n\nÔ clémente, ô pieuse,\nô douce Vierge Marie.\nAmen." },
    ],
  },
};

// ─── Aide à la prière ─────────────────────────────────────────────────────────

const AIDE_Q1 = [
  { id:"fatigue",  label:"Épuisé. Je n'en peux plus.",           hasFollowup: true  },
  { id:"anxieux",  label:"Anxieux. J'ai peur de quelque chose.",  hasFollowup: true  },
  { id:"blesse",   label:"Blessé. Une relation me fait souffrir.", hasFollowup: true  },
  { id:"perdu",    label:"Perdu. Je cherche quelque chose.",       hasFollowup: true  },
  { id:"paix",     label:"En paix. Je veux juste remercier.",      hasFollowup: false },
  { id:"curieux",  label:"Curieux. Je veux essayer.",              hasFollowup: false },
];
const AIDE_FOLLOWUPS: Record<string, { q: string; choices: string[] }> = {
  fatigue:  { q:"Qu'est-ce qui t'épuise le plus ?",    choices:["Le travail","La famille","Moi-même","Tout à la fois"] },
  anxieux:  { q:"Qu'est-ce qui t'inquiète ?",           choices:["L'avenir","Ma santé ou celle d'un proche","Une décision à prendre","Je ne sais pas"] },
  blesse:   { q:"Avec qui c'est difficile ?",            choices:["Un proche","Au travail","Avec moi-même","Avec Dieu"] },
  perdu:    { q:"Dans quel domaine ?",                   choices:["Mon travail, ma vocation","Ma foi, mes doutes","Mes relations","Ma vie en général"] },
};
const AIDE_PRAYERS: Record<string, { title: string; text: string }> = {
  fatigue: { title:"Une prière pour la fatigue",         text:"Seigneur,\nje suis épuisé.\nJe te donne cette fatigue —\nc'est tout ce que j'ai ce soir.\n\nSois là.\n\nAmen." },
  anxieux: { title:"Une prière pour l'inquiétude",       text:"Seigneur,\nj'ai peur de demain.\nDe ce que je ne contrôle pas.\n\nTu tiens le temps entre tes mains.\nApprends-moi à vivre aujourd'hui.\n\nAmen." },
  blesse:  { title:"Une prière pour une relation",       text:"Seigneur,\ncette relation me pèse.\nJe ne sais plus comment aimer cette personne.\n\nAide-moi à ne pas abandonner.\n\nAmen." },
  perdu:   { title:"Une prière pour retrouver le cap",   text:"Seigneur,\nje cherche.\nGuide mes pas — juste le prochain.\n\nAmen." },
  paix:    { title:"Une prière de pur remerciement",     text:"Seigneur,\nmerci.\nC'est tout ce que je voulais te dire.\nJuste : merci.\n\nAmen." },
  curieux: { title:"Une prière pour commencer",          text:"Seigneur,\nje ne sais pas si tu es là.\nMais je suis là, moi.\n\nEt le fait que je te parle ce soir\nc'est peut-être déjà quelque chose.\n\nAmen." },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(str: string): string {
  return str
    .replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, "")
    .replace(/&rsquo;/g,"'").replace(/&lsquo;/g,"'").replace(/&ldquo;/g,"«").replace(/&rdquo;/g,"»")
    .replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/&eacute;/g,"é").replace(/&egrave;/g,"è")
    .replace(/&agrave;/g,"à").replace(/&#[0-9]+;/g,"").replace(/&[a-z]+;/g," ")
    .replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim();
}

function getTodayMystery(): string {
  const d = new Date().getDay();
  if (d===1||d===6) return "joyeux";
  if (d===2||d===5) return "douloureux";
  if (d===4)        return "lumineux";
  return "glorieux";
}

function lsGet(key: string): string { try { return localStorage.getItem(key)||""; } catch { return ""; } }
function lsSet(key: string, v: string) { try { localStorage.setItem(key,v); } catch { /**/ } }

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const m = ["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"][d.getMonth()];
  return `${d.getDate()} ${m}.`;
}

// ─── Micro-composants ─────────────────────────────────────────────────────────

function Skel({ w="100%", h="13px", r="6px" }: { w?: string; h?: string; r?: string }) {
  return <div style={{ width:w, height:h, borderRadius:r, background:"rgba(17,16,9,0.09)", animation:"sk 1.8s ease-in-out infinite", flexShrink:0 }} />;
}

function Chev({ color=C.ink50 }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0 }}>
      <path d="M6 4L10 8L6 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function OverlayPage({
  onBack, backLabel="Retour", title, countLabel, children
}: {
  onBack: () => void; backLabel?: string; title: string; countLabel?: string; children: React.ReactNode;
}) {
  // Verrouiller le scroll de la page sous-jacente
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:C.bg, overflowY:"auto", animation:"pageIn .3s cubic-bezier(.16,1,.3,1)" }}>
      <header style={{ height:56, background:"rgba(242,235,224,.96)", backdropFilter:"blur(16px)", borderBottom:`1px solid ${C.ink12}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px", position:"sticky", top:0, zIndex:10 }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,.55)", border:`1px solid ${C.ink12}`, borderRadius:99, padding:"0 14px", minHeight:40, fontSize:13, color:C.ink50, cursor:"pointer", fontFamily:C.sans }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 16 16"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          {backLabel}
        </button>
        <span style={{ fontFamily:C.serif, fontSize:17, color:C.ink65, fontStyle:"italic" }}>{title}</span>
        <span style={{ fontSize:12, color:C.ink50, fontWeight:600, fontFamily:C.sans, minWidth:48, textAlign:"right" }}>{countLabel||""}</span>
      </header>
      <div style={{ maxWidth:540, margin:"0 auto", padding:"20px 16px 80px", display:"flex", flexDirection:"column", gap:14 }}>
        {children}
      </div>
    </div>
  );
}

function BottomSheet({ onClose, title, subtitle, children }: {
  onClose: () => void; title: string; subtitle?: string; children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(17,16,9,.38)", display:"flex", alignItems:"flex-end", animation:"fade .18s ease" }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ width:"100%", maxHeight:"92vh", overflowY:"auto", background:C.bg, borderRadius:"24px 24px 0 0", animation:"sheetUp .25s cubic-bezier(.16,1,.3,1)", paddingBottom:"env(safe-area-inset-bottom,0px)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px 12px", borderBottom:`1px solid ${C.ink12}`, position:"sticky", top:0, background:C.bg, borderRadius:"24px 24px 0 0" }}>
          <div>
            <p style={{ fontSize:9, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:C.gold, fontFamily:C.sans, marginBottom:2 }}>{title}</p>
            {subtitle && <p style={{ fontFamily:C.serif, fontSize:20, fontWeight:300, color:C.ink, margin:0 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", background:C.cream, border:"none", fontSize:18, color:C.ink50, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"16px 20px 28px", display:"flex", flexDirection:"column", gap:14 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function GoldBtn({ onClick, children, style }: { onClick?: () => void; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{ width:"100%", padding:15, background:`linear-gradient(135deg,${C.gold2},${C.gold})`, border:"none", borderRadius:99, color:C.dark, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:C.sans, transition:"opacity .14s", ...style }}>
      {children}
    </button>
  );
}

// ─── Panneau Intentions ───────────────────────────────────────────────────────

function IntentionsPanel() {
  const [open, setOpen]           = useState(false);
  const [list, setList]           = useState<Intention[]>([]);
  const [newText, setNewText]     = useState("");
  const [editId, setEditId]       = useState<string|null>(null);
  const [editVal, setEditVal]     = useState("");

  useEffect(() => {
    try { setList(JSON.parse(lsGet(INTENTIONS_KEY)||"[]")); } catch { setList([]); }
  }, []);

  const save = (l: Intention[]) => { setList(l); lsSet(INTENTIONS_KEY, JSON.stringify(l)); };
  const add  = () => { const v=newText.trim(); if(!v)return; save([{ id:Date.now().toString(), text:v, at:new Date().toISOString() }, ...list]); setNewText(""); };
  const del  = (id: string) => save(list.filter(i=>i.id!==id));
  const upd  = (id: string, text: string) => save(list.map(i=>i.id===id?{...i,text}:i));

  return (
    <>
      {/* Preview panel */}
      <div style={{ background:C.paper, borderRadius:14, padding:"14px 16px", border:`1.5px solid ${C.ink12}` }}>
        <p style={{ fontSize:9, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:C.gold, fontFamily:C.sans, marginBottom:5 }}>Mes intentions</p>
        <p style={{ fontFamily:C.serif, fontSize:16, fontWeight:300, color:C.ink, marginBottom:10 }}>Ce que je confie.</p>
        {list.length>0 ? (
          <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
            {list.slice(0,2).map(i=>(
              <div key={i.id} style={{ background:C.cream3, border:`1px solid ${C.goldB}`, borderRadius:8, padding:"8px 11px" }}>
                <p style={{ fontFamily:C.serif, fontSize:13, fontStyle:"italic", color:C.ink80, lineHeight:1.5, margin:0 }}>{i.text.length>60?i.text.slice(0,57)+"…":i.text}</p>
              </div>
            ))}
            {list.length>2 && <p style={{ fontSize:11, color:C.ink35, fontFamily:C.sans }}>+{list.length-2} autre{list.length>3?"s":""}</p>}
          </div>
        ) : (
          <p style={{ fontFamily:C.serif, fontSize:13, color:C.ink35, fontStyle:"italic", marginBottom:10 }}>Aucune intention pour le moment.</p>
        )}
        <button onClick={()=>setOpen(true)} style={{ width:"100%", padding:"9px 14px", background:C.cream3, border:`1px solid ${C.goldB}`, borderRadius:99, fontSize:12, fontWeight:600, color:C.dark, cursor:"pointer", fontFamily:C.sans, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <span style={{ fontSize:14, lineHeight:1 }}>+</span> Écrire une intention
        </button>
      </div>

      {/* Sheet */}
      {open && (
        <BottomSheet onClose={()=>setOpen(false)} title="Mes intentions" subtitle="Ce que je confie à Dieu.">
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <textarea value={newText} onChange={e=>setNewText(e.target.value)} placeholder="Pour mon père malade… Pour la paix…" maxLength={280} rows={3}
              style={{ width:"100%", border:`1.5px solid ${C.ink12}`, borderRadius:12, padding:"12px 14px", fontFamily:C.serif, fontSize:15, fontStyle:"italic", color:C.ink, background:C.paper, outline:"none", resize:"none", lineHeight:1.55 }}/>
            <button onClick={add} style={{ width:"100%", padding:13, background:C.dark, border:"none", borderRadius:99, color:"#F5EFE4", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:C.sans }}>Ajouter cette intention →</button>
          </div>
          {list.length>0 && (
            <>
              <p style={{ fontSize:10, fontWeight:500, letterSpacing:"0.10em", textTransform:"uppercase", color:C.ink35, fontFamily:C.sans }}>Enregistrées</p>
              {list.map(item=>(
                <div key={item.id} style={{ background:C.paper, border:`1px solid ${C.ink12}`, borderRadius:12, padding:"11px 13px", display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:10, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", color:C.ink35, fontFamily:C.sans }}>{fmtDate(item.at)}</span>
                    <button onClick={()=>del(item.id)} style={{ fontSize:12, color:"#B44", background:"none", border:"none", cursor:"pointer", fontFamily:C.sans }}>Supprimer</button>
                  </div>
                  {editId===item.id ? (
                    <>
                      <textarea value={editVal} onChange={e=>setEditVal(e.target.value)} rows={2}
                        style={{ width:"100%", border:`1.5px solid ${C.gold2}`, borderRadius:8, padding:"9px 11px", fontFamily:C.serif, fontSize:14, fontStyle:"italic", color:C.ink, background:C.cream3, outline:"none", resize:"none" }}/>
                      <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                        <button onClick={()=>setEditId(null)} style={{ fontSize:12, color:C.ink50, background:"none", border:"none", cursor:"pointer", fontFamily:C.sans }}>Annuler</button>
                        <button onClick={()=>{ upd(item.id, editVal); setEditId(null); }} style={{ fontSize:12, fontWeight:600, color:C.gold, background:"rgba(184,137,58,.10)", border:`1px solid ${C.goldB}`, borderRadius:99, padding:"4px 12px", cursor:"pointer", fontFamily:C.sans }}>Enregistrer</button>
                      </div>
                    </>
                  ) : (
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                      <p style={{ fontFamily:C.serif, fontSize:14, fontStyle:"italic", color:C.ink80, lineHeight:1.55, flex:1, margin:0 }}>{item.text}</p>
                      <button onClick={()=>{ setEditId(item.id); setEditVal(item.text); }} style={{ fontSize:12, color:C.gold, background:"none", border:"none", cursor:"pointer", fontFamily:C.sans, whiteSpace:"nowrap", flexShrink:0 }}>Modifier</button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </BottomSheet>
      )}
    </>
  );
}

// ─── Panel Confier les personnes ──────────────────────────────────────────────

function ConfierSheet({ onClose }: { onClose: () => void }) {
  const [list, setList]   = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    try { setList(JSON.parse(lsGet(CONFIER_KEY)||"[]")); } catch { setList([]); }
  }, []);

  const save = (l: string[]) => { setList(l); lsSet(CONFIER_KEY, JSON.stringify(l)); };
  const add  = () => { const v=input.trim(); if(!v||list.includes(v))return; save([...list,v]); setInput(""); };

  return (
    <BottomSheet onClose={onClose} title="Confier les personnes" subtitle="Ceux que je porte.">
      <p style={{ fontSize:13, color:C.ink50, lineHeight:1.6, fontFamily:C.sans }}>
        Ces prénoms apparaîtront à la fin de chaque prière : <em style={{ fontFamily:C.serif }}>«&nbsp;Je confie en ce jour…&nbsp;»</em>
      </p>
      <div style={{ display:"flex", gap:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
          placeholder="Ex : Maman, Paul, Marie…" maxLength={60}
          style={{ flex:1, border:`1.5px solid ${C.ink12}`, borderRadius:10, padding:"10px 13px", fontFamily:C.serif, fontSize:15, fontStyle:"italic", color:C.ink, background:C.paper, outline:"none" }}/>
        <button onClick={add} style={{ background:C.dark, color:"#F5EFE4", border:"none", borderRadius:10, padding:"0 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:C.sans, minHeight:44, whiteSpace:"nowrap" }}>Ajouter</button>
      </div>
      {list.length>0 ? (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {list.map((name,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:C.cream3, border:`1px solid ${C.goldB}`, borderRadius:10, padding:"9px 12px" }}>
              <span style={{ fontFamily:C.serif, fontSize:15, fontStyle:"italic", color:C.ink }}>{name}</span>
              <button onClick={()=>save(list.filter((_,idx)=>idx!==i))} style={{ fontSize:16, color:C.ink35, background:"none", border:"none", cursor:"pointer" }}>×</button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize:13, color:C.ink35, fontStyle:"italic", fontFamily:C.serif, textAlign:"center", padding:"8px 0" }}>Aucun prénom ajouté.</p>
      )}
    </BottomSheet>
  );
}

// ─── Bloc "Je confie en ce jour" ──────────────────────────────────────────────

function ConfierBlock() {
  const [prenoms, setPrenoms]   = useState<string[]>([]);
  const [intentions, setIntentions] = useState<Intention[]>([]);

  useEffect(() => {
    try { setPrenoms(JSON.parse(lsGet(CONFIER_KEY)||"[]")); } catch { setPrenoms([]); }
    try { setIntentions(JSON.parse(lsGet(INTENTIONS_KEY)||"[]")); } catch { setIntentions([]); }
  }, []);

  if (!prenoms.length && !intentions.length) return null;

  const names = prenoms.length===1 ? prenoms[0]
    : prenoms.length>1 ? prenoms.slice(0,-1).join(", ")+" et "+prenoms[prenoms.length-1] : null;
  const active = intentions.filter(i=>i.text.trim());

  return (
    <div style={{ background:C.cream3, border:`1px solid ${C.goldB}`, borderRadius:14, padding:"14px 16px", marginBottom:14 }}>
      <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.10em", textTransform:"uppercase", color:C.gold, fontFamily:C.sans, marginBottom:6 }}>Je confie en ce jour</p>
      {names && <p style={{ fontFamily:C.serif, fontSize:16, fontWeight:300, fontStyle:"italic", color:C.ink80, lineHeight:1.6, margin:0 }}>{names}.</p>}
      {active.length>0 && <p style={{ fontFamily:C.serif, fontSize:14, color:C.ink65, fontStyle:"italic", marginTop:4, lineHeight:1.55 }}>{active.map(i=>i.text.trim()).join(" · ")}</p>}
    </div>
  );
}

// ─── Séquence interactive ─────────────────────────────────────────────────────

function SequencePage({ seqKey, onClose }: { seqKey: string; onClose: () => void }) {
  const seq  = SEQUENCES[seqKey];
  const [idx, setIdx]     = useState(0);
  const [help, setHelp]   = useState(false);
  const isEnd = idx >= seq.steps.length;
  const step  = seq.steps[idx];

  const advance = () => { setHelp(false); if(idx<seq.steps.length-1){setIdx(i=>i+1);}else{setIdx(seq.steps.length);} };

  return (
    <OverlayPage onBack={onClose} title={seq.title.replace(".","").replace("sa ","").slice(0,18)} countLabel={isEnd?"Terminé":`${idx+1}/${seq.steps.length}`}>
      {isEnd ? (
        <div style={{ background:C.paper, borderRadius:22, border:`1px solid ${C.ink12}`, padding:28, textAlign:"center", display:"flex", flexDirection:"column", gap:16, animation:"slideIn .28s cubic-bezier(.16,1,.3,1)" }}>
          <p style={{ fontFamily:C.serif, fontSize:30, fontWeight:300, color:C.ink, letterSpacing:"-.04em" }}>Prière terminée.</p>
          <p style={{ fontSize:14, color:C.ink50, lineHeight:1.6, fontFamily:C.sans }}>Prenez quelques secondes de silence. Ce moment est confié.</p>
          <ConfierBlock/>
          <GoldBtn onClick={onClose}>Retour aux prières →</GoldBtn>
        </div>
      ) : (
        <>
          {idx===0 && <ConfierBlock/>}
          <div style={{ background:C.paper, border:`1px solid ${C.ink12}`, borderRadius:22, overflow:"hidden", boxShadow:"0 4px 24px rgba(17,16,9,.07)", animation:"slideIn .28s cubic-bezier(.16,1,.3,1)" }}>
            <div style={{ background:`linear-gradient(135deg,${C.dark2},${C.dark})`, padding:22, color:"#F5EFE4" }}>
              <small style={{ display:"block", color:"rgba(196,154,60,.85)", fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>{seq.kicker}</small>
              <h2 style={{ fontFamily:C.serif, fontSize:28, fontWeight:300, lineHeight:1.08, letterSpacing:"-.03em", margin:0 }}>{step.title}</h2>
              <div style={{ height:6, borderRadius:99, background:"rgba(255,255,255,.15)", overflow:"hidden", marginTop:12 }}>
                <div style={{ height:"100%", width:`${((idx+1)/seq.steps.length)*100}%`, background:"linear-gradient(90deg,#C49A3C,#E0BD68)", borderRadius:99, transition:"width .25s" }}/>
              </div>
            </div>
            <div style={{ padding:22, display:"flex", flexDirection:"column", gap:14 }}>
              <p style={{ fontFamily:C.serif, fontSize:20, lineHeight:1.72, color:C.ink, whiteSpace:"pre-line", fontWeight:300 }}>{step.text}</p>
              {step.note && (
                <>
                  <button onClick={()=>setHelp(v=>!v)} style={{ width:"100%", padding:12, background:C.cream3, border:`1px solid ${C.goldB}`, borderRadius:99, color:C.dark, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:C.sans }}>
                    {help?"Masquer l'aide":"+ Aide"}
                  </button>
                  {help && (
                    <div style={{ background:C.cream3, border:`1px solid ${C.goldB}`, borderRadius:12, padding:"11px 14px" }}>
                      <p style={{ fontSize:13, color:C.ink65, lineHeight:1.6, fontFamily:C.sans, margin:0 }}>{step.note.startsWith("aide|")?step.note.slice(5):step.note}</p>
                    </div>
                  )}
                </>
              )}
              <GoldBtn onClick={advance}>{idx<seq.steps.length-1?"Amen →":"Terminer →"}</GoldBtn>
            </div>
          </div>
        </>
      )}
    </OverlayPage>
  );
}

// ─── Aide à la prière ─────────────────────────────────────────────────────────

function AidePage({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [id, setId]     = useState("");
  const fu = id ? AIDE_FOLLOWUPS[id] : null;
  const pr = AIDE_PRAYERS[id] || AIDE_PRAYERS.curieux;

  const ChoiceBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick} style={{ padding:"15px 18px", borderRadius:14, border:`1.5px solid ${C.ink12}`, background:C.cream3, fontFamily:C.serif, fontSize:16, fontWeight:300, color:C.ink, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}>
      <span>{label}</span><span style={{ fontSize:16, color:C.ink35 }}>›</span>
    </button>
  );

  const Q = ({ text }: { text: string }) => (
    <p style={{ fontFamily:C.serif, fontSize:24, fontWeight:300, color:C.ink, textAlign:"center" }}>{text}</p>
  );

  const dots = (total: number, current: number) => (
    <div style={{ display:"flex", gap:6, justifyContent:"center", marginTop:4 }}>
      {Array.from({length:total},(_,i)=>(
        <div key={i} style={{ height:7, borderRadius:99, background:i<current?"#C49A3C":C.ink12, width:i<current?16:7, transition:"all .3s" }}/>
      ))}
    </div>
  );

  return (
    <OverlayPage onBack={onClose} title="Aide à la prière">
      {step===0 && <>
        <Q text="Comment voulez-vous entrer dans la prière ?"/>
        <p style={{ fontFamily:C.sans, fontSize:13, color:C.ink50, textAlign:"center" }}>Un parcours de 5 minutes, pas à pas.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {AIDE_Q1.map(q=><ChoiceBtn key={q.id} label={q.label} onClick={()=>{ setId(q.id); setStep(q.hasFollowup?1:2); }}/>)}
        </div>
        {dots(7,0)}
      </>}
      {step===1 && fu && <>
        <Q text={fu.q}/>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {fu.choices.map(ch=><ChoiceBtn key={ch} label={ch} onClick={()=>setStep(2)}/>)}
        </div>
        {dots(7,1)}
      </>}
      {step===2 && <>
        <Q text="Qui peux-tu porter dans ta prière ?"/>
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {["Quelqu'un de malade ou en difficulté","Quelqu'un qui est loin","Ma famille","Moi-même","Personne en particulier"].map(ch=><ChoiceBtn key={ch} label={ch} onClick={()=>setStep(3)}/>)}
        </div>
        {dots(7,2)}
      </>}
      {step===3 && <>
        <Q text="Respirer une minute."/>
        <div style={{ background:C.paper, borderRadius:18, border:`1px solid ${C.ink12}`, padding:18 }}>
          <h3 style={{ fontFamily:C.serif, fontSize:22, fontWeight:300, marginBottom:8 }}>Revenir ici.</h3>
          <p style={{ fontSize:14, color:C.ink65, lineHeight:1.65, fontFamily:C.sans }}>Inspirez doucement. Expirez doucement. Vous n&apos;avez pas besoin d&apos;être parfait pour prier.</p>
        </div>
        <GoldBtn onClick={()=>setStep(4)}>Continuer →</GoldBtn>
        {dots(7,3)}
      </>}
      {step===4 && <>
        <Q text="Le signe de croix."/>
        <div style={{ background:C.cream3, borderRadius:14, border:`1.5px solid ${C.goldB}`, padding:22, textAlign:"center" }}>
          <p style={{ fontFamily:C.serif, fontSize:20, fontWeight:300, color:C.ink, fontStyle:"italic", lineHeight:1.75 }}>Au nom du Père,<br/>et du Fils,<br/>et du Saint-Esprit.<br/>Amen.</p>
        </div>
        <GoldBtn onClick={()=>setStep(5)}>Amen →</GoldBtn>
        {dots(7,4)}
      </>}
      {step===5 && <>
        <Q text="Dis-lui ça lentement."/>
        <div style={{ background:C.paper, borderRadius:16, border:`1.5px solid ${C.ink12}`, padding:22, textAlign:"center" }}>
          <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.10em", textTransform:"uppercase", color:C.gold, fontFamily:C.sans, marginBottom:6 }}>{pr.title}</p>
          <p style={{ fontFamily:C.serif, fontSize:17, fontWeight:300, fontStyle:"italic", color:C.ink, lineHeight:1.75, whiteSpace:"pre-line" }}>{pr.text}</p>
        </div>
        <p style={{ fontSize:13, color:C.ink50, lineHeight:1.6, textAlign:"center", fontFamily:C.sans }}>Ce n&apos;est pas une performance. Le Seigneur écoute le cœur qui revient vers lui.</p>
        <GoldBtn onClick={()=>setStep(6)}>Je l&apos;ai dit →</GoldBtn>
        {dots(7,5)}
      </>}
      {step===6 && <>
        <Q text="Rester encore un instant."/>
        <div style={{ background:C.paper, borderRadius:18, border:`1px solid ${C.ink12}`, padding:18 }}>
          <h3 style={{ fontFamily:C.serif, fontSize:22, fontWeight:300, marginBottom:8 }}>Silence.</h3>
          <p style={{ fontSize:14, color:C.ink65, lineHeight:1.65, fontFamily:C.sans }}>Répétez simplement : « Seigneur, je suis là. »</p>
        </div>
        <GoldBtn onClick={()=>setStep(7)}>Terminer →</GoldBtn>
        {dots(7,6)}
      </>}
      {step===7 && <>
        <Q text="Vous venez de prier."/>
        <p style={{ fontSize:14, color:C.ink50, textAlign:"center", fontFamily:C.sans }}>C&apos;est concret. Ça compte.</p>
        <div style={{ background:`linear-gradient(135deg,${C.dark2},${C.dark})`, borderRadius:16, padding:22, border:"1.5px solid rgba(196,154,60,.20)", textAlign:"center" }}>
          <p style={{ fontFamily:C.serif, fontSize:20, fontWeight:300, color:"#F5EFE4", lineHeight:1.5, marginBottom:6 }}>Je vous salue Marie,<br/>pleine de grâce.</p>
          <p style={{ fontSize:13, color:"rgba(245,239,228,.55)", fontFamily:C.sans }}>Confier tout ça à Marie.</p>
        </div>
        <ConfierBlock/>
        <GoldBtn onClick={onClose}>Terminer →</GoldBtn>
        {dots(7,7)}
      </>}
    </OverlayPage>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//   PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════

export default function PriresPage() {
  // Onglets
  const [tab, setTab]       = useState<Tab>("jour");
  const [tabKey, setTabKey] = useState(0);

  // Du jour
  const [data, setData]         = useState<SpiritualData|null>(null);
  const [loading, setLoading]   = useState(true);
  const [gospelOpen, setGospelOpen] = useState(false);

  // Chapelet (progression en lecture seule — édition dans /spiritual/chapelet)
  const [rosaryMystery, setRosaryMystery] = useState<string>("");
  const [rosaryPct, setRosaryPct]         = useState(0);
  const [hasRosary, setHasRosary]         = useState(false);

  // Overlays
  const [seqKey, setSeqKey]     = useState<string|null>(null);
  const [aideOpen, setAideOpen] = useState(false);
  const [confierOpen, setConfierOpen] = useState(false);
  const [libCat, setLibCat]     = useState<string|null>(null);

  // Load API
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch("/api/spiritual"); if(r.ok) setData(await r.json()); } catch {/**/}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Load rosary progress (shared with chapelet/page.tsx)
  useEffect(() => {
    try {
      const s = lsGet(ROSARY_KEY);
      if (s) {
        const p = JSON.parse(s);
        setRosaryMystery(p.mysteryType||"");
        const pct = Math.max(0,Math.min(100,Math.round(((p.decadeIndex*11+(p.grainIndex+1))/55)*100)));
        setRosaryPct(pct);
        setHasRosary(pct>0);
      }
    } catch {/**/}
  }, [tab]); // re-read when switching to chapelet tab

  // Hash nav
  useEffect(() => {
    const read = () => {
      const h = window.location.hash.replace("#","") as Tab;
      if(["jour","chapelet","prieres"].includes(h)){ setTab(h); setTabKey(k=>k+1); }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const switchTab = (t: Tab) => {
    setTab(t); setTabKey(k=>k+1);
    window.history.replaceState(null,"",`#${t}`);
    window.scrollTo(0,0);
  };

  // Gospel text
  const gospelText  = data?.gospel?.text ? stripHtml(data.gospel.text) : "";
  const gospelLines = gospelText.split("\n").filter(Boolean);
  const previewL    = gospelLines.slice(0,4).join("\n");
  const restL       = gospelLines.slice(4).join("\n");
  const evangelist  = data?.gospel?.intro?.match(/selon\s+saint\s+(\w+)/i)?.[1];
  const gospelTitle = evangelist ? `Évangile selon saint ${evangelist}` : "Évangile du jour";

  // Date
  const now      = new Date();
  const dayN     = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"][now.getDay()];
  const monN     = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"][now.getMonth()];
  const dateStr  = `${dayN} ${now.getDate()} ${monN}`;
  const todayS   = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][now.getDay()];

  const todayMystery = getTodayMystery();
  const displayMystery = MYSTERY_LABELS[rosaryMystery||todayMystery];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Styles globaux ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes sk      { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes pageIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes slideIn { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:none} }
        @keyframes fade    { from{opacity:0} to{opacity:1} }
        @keyframes sheetUp { from{transform:translateY(100%)} to{transform:none} }
        .page-inner { max-width:600px; margin:0 auto; padding:14px 14px 80px; }
        .tab-hdr    { max-width:600px; margin:0 auto; }
        .tap:active { opacity:.72; transform:scale(.98); transition:transform .08s; }
        @media (min-width: 768px) {
          .page-inner { max-width:900px !important; padding:24px 28px 80px !important; }
          .tab-hdr    { max-width:900px !important; }
          .deux-col   { display:grid !important; grid-template-columns:1fr 320px; gap:18px; align-items:start; }
          .col-r      { display:flex !important; flex-direction:column; gap:12px; }
        }
        @media (min-width: 1100px) { .deux-col { grid-template-columns:1fr 360px; } }
        @media (min-width: 640px) {
          .sheet-overlay-inner { max-width:520px; border-radius:20px; margin:auto; max-height:88vh; }
        }
      `}</style>

      {/* ── Header doré ── */}
      <header style={{ position:"sticky", top:0, zIndex:40, background:"linear-gradient(180deg,#D4A83A 0%,#C49A3C 55%,#B8893A 100%)", borderBottom:"1.5px solid #8A6520", boxShadow:"0 2px 8px rgba(139,101,32,.20)" }}>
        <div className="tab-hdr" style={{ display:"flex" }}>
          {(["jour","chapelet","prieres"] as Tab[]).map(t=>(
            <button key={t} onClick={()=>switchTab(t)} className="tap" style={{ flex:1, padding:"13px 4px 11px", textAlign:"center", fontSize:13, fontWeight:tab===t?700:400, color:tab===t?"#fff":"rgba(255,255,255,.55)", background:"none", border:"none", cursor:"pointer", borderBottom:`3px solid ${tab===t?"#fff":"transparent"}`, fontFamily:C.sans, transition:"all .15s" }}>
              {t==="jour"?"Du jour":t==="chapelet"?"Chapelet":"Prières"}
            </button>
          ))}
        </div>
      </header>

      <main className="page-inner">

        {/* ═══════════ ONGLET DU JOUR ═══════════ */}
        {tab==="jour" && (
          <div key={`jour-${tabKey}`} style={{ display:"flex", flexDirection:"column", gap:12, animation:"pageIn .38s cubic-bezier(.16,1,.3,1)" }}>
            
            {/* Date + temps liturgique */}
            <div style={{ padding:"6px 4px 2px", display:"flex", alignItems:"baseline", justifyContent:"space-between", flexWrap:"wrap", gap:4 }}>
              <span style={{ fontFamily:C.serif, fontSize:18, fontWeight:300, color:C.ink }}>{dateStr}</span>
              {!loading && data?.liturgicalInfo?.week && (
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:5, height:5, borderRadius:"50%", background:data.liturgicalInfo.color==="white"?"transparent":data.liturgicalInfo.colorHex, border:data.liturgicalInfo.color==="white"?"1.5px solid rgba(184,137,58,.60)":"none" }}/>
                  <span style={{ fontFamily:C.sans, fontSize:11, fontWeight:500, color:C.gold, letterSpacing:"0.03em" }}>{data.liturgicalInfo.week}</span>
                </div>
              )}
            </div>

            <div className="deux-col" style={{ display:"contents" }}>
              {/* Col gauche */}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                
                {/* Citation */}
                {loading ? (
                  <div style={{ background:C.dark, borderRadius:14, padding:"16px 18px", display:"flex", flexDirection:"column", gap:8 }}>
                    <Skel w="85%" h="16px" r="4px"/><Skel w="60%" h="14px" r="4px"/><Skel w="35%" h="10px" r="4px"/>
                  </div>
                ) : data?.quote && (
                  <div style={{ background:C.dark, borderRadius:14, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
                    <div style={{ position:"absolute", top:4, left:12, fontFamily:C.serif, fontSize:52, lineHeight:1, color:"rgba(184,137,58,0.12)", pointerEvents:"none", userSelect:"none" }}>«</div>
                    <p style={{ fontFamily:C.serif, fontSize:17, fontWeight:300, fontStyle:"italic", color:"#F5EFE4", lineHeight:1.55, marginBottom:8, position:"relative", zIndex:1 }}>{data.quote.text}</p>
                    <p style={{ fontSize:11, fontWeight:500, color:"rgba(196,154,60,.80)", fontFamily:C.sans, position:"relative", zIndex:1 }}>— {data.quote.author}</p>
                  </div>
                )}

                {/* Évangile */}
                <div style={{ background:C.paper, borderRadius:14, border:`1.5px solid ${C.ink12}`, overflow:"hidden" }}>
                  {loading ? (
                    <div style={{ padding:14, display:"flex", flexDirection:"column", gap:8 }}>
                      <Skel w="65%" h="20px" r="4px"/><Skel w="30%" h="11px"/><Skel w="90%" h="14px"/><Skel w="75%" h="14px"/>
                    </div>
                  ) : data?.gospel ? (
                    <div style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", alignItems:"baseline", flexWrap:"wrap", gap:8, marginBottom:10 }}>
                        <span style={{ fontFamily:C.serif, fontSize:20, fontWeight:400, color:C.ink }}>{gospelTitle}</span>
                        {data.gospel.reference && <span style={{ fontSize:12, color:C.gold, fontFamily:C.sans }}>{data.gospel.reference}</span>}
                      </div>
                      <p style={{ fontFamily:C.serif, fontSize:15, fontWeight:300, fontStyle:"italic", color:C.ink80, lineHeight:1.55, whiteSpace:"pre-line", margin:0 }}>{previewL}</p>
                      {restL && gospelOpen && (
                        <p style={{ fontFamily:C.serif, fontSize:15, fontWeight:300, color:"rgba(17,16,9,.74)", lineHeight:1.55, whiteSpace:"pre-line", marginTop:10, paddingTop:10, borderTop:`1px solid ${C.ink12}` }}>{restL}</p>
                      )}
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:10, marginTop:10, borderTop:`1px solid ${C.ink12}` }}>
                        <a href={data.gospel.aelfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:C.ink35, textDecoration:"none", fontFamily:C.sans }}>Source AELF →</a>
                        {restL && <button onClick={()=>setGospelOpen(v=>!v)} style={{ fontSize:12, color:C.gold, fontWeight:500, background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:3, fontFamily:C.sans }}>{gospelOpen?"Fermer":"Lire la suite"} <Chev color={C.gold}/></button>}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding:14 }}><p style={{ fontSize:13, color:C.ink50, fontFamily:C.sans }}>{data?.error||"L'évangile du jour n'est pas disponible."}</p></div>
                  )}
                </div>
              </div>

              {/* Col droite */}
              <div className="col-r" style={{ display:"contents" }}>
                {/* Saint */}
                {loading ? (
                  <div style={{ background:C.cream, borderRadius:14, padding:"12px 14px", border:`1.5px solid ${C.goldB}`, display:"flex", flexDirection:"column", gap:7, marginTop:10 }}>
                    <Skel w="50%" h="16px"/><Skel w="25%" h="10px"/><Skel w="90%" h="12px"/>
                  </div>
                ) : data?.saint && (
                  <div style={{ background:C.cream, borderRadius:14, padding:"12px 14px", border:`1.5px solid ${C.goldB}`, marginTop:10 }}>
                    <p style={{ fontSize:9, fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", color:C.gold, fontFamily:C.sans, marginBottom:5 }}>Saint du jour</p>
                    <p style={{ fontFamily:C.serif, fontSize:18, fontWeight:400, color:C.ink, marginBottom:2, lineHeight:1.2 }}>{data.saint.name}</p>
                    {data.saint.dates && <p style={{ fontSize:11, color:C.ink50, marginBottom:7, fontFamily:C.sans }}>{data.saint.dates}</p>}
                    <p style={{ fontFamily:C.serif, fontSize:14, fontWeight:300, color:C.ink65, lineHeight:1.55 }}>{data.saint.description}</p>
                  </div>
                )}

                {/* Intentions */}
                <div style={{ marginTop:10 }}>
                  <IntentionsPanel/>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ ONGLET CHAPELET ═══════════ */}
        {tab==="chapelet" && (
          <div key={`chap-${tabKey}`} style={{ display:"flex", flexDirection:"column", gap:12, animation:"pageIn .38s cubic-bezier(.16,1,.3,1)" }}>
            
            {/* Card mystère */}
            <div style={{ background:`linear-gradient(135deg,${C.dark2},${C.dark})`, borderRadius:16, border:"1.5px solid rgba(196,154,60,.22)", padding:20, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                <svg width="150" height="150" viewBox="0 0 160 160" fill="none">
                  <circle cx="80" cy="80" r="72" stroke="#C49A3C" strokeWidth="0.5" opacity="0.10"/>
                  <circle cx="80" cy="80" r="52" stroke="#C49A3C" strokeWidth="0.4" opacity="0.07"/>
                </svg>
              </div>
              <div style={{ position:"relative", zIndex:1 }}>
                <p style={{ fontSize:10, fontWeight:500, letterSpacing:"0.10em", textTransform:"uppercase", color:"rgba(196,154,60,.85)", fontFamily:C.sans, marginBottom:5 }}>Mystère du jour · {todayS}</p>
                <p style={{ fontFamily:C.serif, fontSize:22, fontWeight:300, color:"#F5EFE4", lineHeight:1.15, marginBottom:6 }}>{displayMystery}</p>
                <p style={{ fontFamily:C.serif, fontSize:13, fontStyle:"italic", color:"rgba(245,239,228,.72)", lineHeight:1.4, margin:0 }}>Cinq mystères à contempler avec Marie</p>
                {hasRosary && (
                  <div style={{ marginTop:12 }}>
                    <div style={{ height:5, background:"rgba(255,255,255,.10)", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${rosaryPct}%`, background:"#C49A3C", borderRadius:99, transition:"width .6s" }}/>
                    </div>
                    <p style={{ fontSize:11, color:"rgba(245,239,228,.55)", marginTop:5, fontFamily:C.sans }}>{rosaryPct}% · {displayMystery}</p>
                  </div>
                )}
              </div>
            </div>

            {/* CTA → page chapelet dédiée */}
            <Link href={hasRosary?"/dashboard/spiritual/chapelet?resume=1":"/dashboard/spiritual/chapelet"} style={{ textDecoration:"none" }}>
              <button className="tap" style={{ width:"100%", padding:15, background:`linear-gradient(135deg,${C.gold2},${C.gold})`, border:"none", borderRadius:99, color:C.dark, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:C.sans, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <svg width="15" height="15" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke={C.dark} strokeWidth="1.3"/><line x1="14" y1="5" x2="14" y2="23" stroke={C.dark} strokeWidth="1.3"/><line x1="8" y1="11" x2="20" y2="11" stroke={C.dark} strokeWidth="1.3"/></svg>
                {hasRosary?"Reprendre le chapelet →":"Commencer le chapelet →"}
              </button>
            </Link>

            {hasRosary && (
              <button onClick={()=>{ lsSet(ROSARY_KEY,""); setHasRosary(false); setRosaryPct(0); }} style={{ fontSize:12, color:C.ink35, background:"none", border:"none", cursor:"pointer", fontFamily:C.sans, textAlign:"center", padding:"2px 0" }}>
                Effacer la progression
              </button>
            )}

            {/* Citation */}
            <div style={{ background:C.paper, borderRadius:13, border:`1.5px solid ${C.ink12}`, padding:"13px 16px" }}>
              <p style={{ fontFamily:C.serif, fontSize:14, fontWeight:300, fontStyle:"italic", color:C.ink, lineHeight:1.5, marginBottom:4 }}>
                «&nbsp;Le chapelet est l&apos;arme de notre temps.&nbsp;»
              </p>
              <p style={{ fontSize:11, color:C.ink50, fontFamily:C.sans, marginBottom:8 }}>— Saint Jean-Paul II</p>
              <Link href="/dashboard/spiritual/chapelet?pourquoi=1" style={{ fontSize:12, fontWeight:500, color:C.gold, textDecoration:"none", display:"flex", alignItems:"center", gap:3, fontFamily:C.sans }}>
                Pourquoi prier le chapelet <Chev color={C.gold}/>
              </Link>
            </div>

            <p style={{ fontSize:10, color:C.ink35, textAlign:"center", fontFamily:C.sans }}>Progression sauvegardée automatiquement</p>
          </div>
        )}

        {/* ═══════════ ONGLET PRIÈRES ═══════════ */}
        {tab==="prieres" && (
          <div key={`prieres-${tabKey}`} style={{ display:"flex", flexDirection:"column", gap:10, animation:"pageIn .38s cubic-bezier(.16,1,.3,1)" }}>
            <div>
              <p style={{ fontFamily:C.serif, fontSize:24, fontWeight:300, color:C.ink, margin:"0 0 2px" }}>Prières</p>
              <p style={{ fontFamily:C.sans, fontSize:12, color:C.ink50, margin:0 }}>Pour commencer, prenez un moment de silence.</p>
            </div>

            {/* Grille séquences */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {Object.entries(SEQUENCES).map(([key, seq])=>(
                <button key={key} onClick={()=>setSeqKey(key)} className="tap" style={{ background:C.paper, border:`1.5px solid ${C.ink12}`, borderRadius:14, padding:"14px 14px 12px", textAlign:"left", cursor:"pointer", display:"flex", flexDirection:"column", gap:4 }}>
                  <span style={{ fontSize:18 }}>{seq.icon}</span>
                  <p style={{ fontSize:14, fontWeight:600, color:C.ink, fontFamily:C.sans, margin:0 }}>{seq.icon==="☀"?"Ce matin":seq.icon==="🌙"?"Ce soir":seq.icon==="🕯"?"Dans l'inquiétude":"Avec Marie"}</p>
                  <p style={{ fontSize:10, color:C.gold, fontFamily:C.sans, margin:0, fontWeight:500 }}>⏱ {seq.duration}</p>
                </button>
              ))}
            </div>

            {/* Aide à la prière */}
            <button onClick={()=>setAideOpen(true)} className="tap" style={{ background:`linear-gradient(135deg,${C.dark2},${C.dark})`, borderRadius:16, border:"1.5px solid rgba(196,154,60,.30)", padding:16, cursor:"pointer", textAlign:"left", width:"100%" }}>
              <p style={{ fontSize:9, fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(196,154,60,.80)", fontFamily:C.sans, marginBottom:5 }}>Je ne sais pas par où commencer</p>
              <p style={{ fontFamily:C.serif, fontSize:20, fontWeight:300, color:"#F5EFE4", marginBottom:3, lineHeight:1.25 }}>Aide à la prière.</p>
              <p style={{ fontSize:12, color:"rgba(245,239,228,.70)", fontFamily:C.sans, marginBottom:10 }}>Un parcours guidé · 5 minutes.</p>
              <span style={{ display:"inline-flex", alignItems:"center", background:C.gold2, borderRadius:99, padding:"6px 14px", fontSize:12, fontWeight:600, color:C.dark, fontFamily:C.sans }}>Je commence →</span>
            </button>

            {/* Confier les personnes */}
            <button onClick={()=>setConfierOpen(true)} className="tap" style={{ background:C.cream, border:`1.5px solid ${C.goldB}`, borderRadius:14, padding:"13px 16px", cursor:"pointer", textAlign:"left", width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <p style={{ fontSize:9, fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", color:C.gold, fontFamily:C.sans, marginBottom:3 }}>Confier les personnes</p>
                <p style={{ fontFamily:C.serif, fontSize:16, fontWeight:300, color:C.ink, margin:0 }}>Ceux que je porte dans mes prières.</p>
              </div>
              <Chev color={C.gold}/>
            </button>

            {/* Bibliothèque */}
            <p style={{ fontSize:10, fontWeight:500, letterSpacing:"0.10em", textTransform:"uppercase", color:C.ink35, fontFamily:C.sans, marginTop:4 }}>Bibliothèque</p>
            {Object.entries(SEQUENCES).map(([key, seq])=>{
              const icons: Record<string,string> = { matin:"☀", soir:"🌙", inquiet:"🕯", marie:"☽" };
              const labels: Record<string,string> = { matin:"Ce matin", soir:"Ce soir", inquiet:"Dans l'inquiétude", marie:"Avec Marie" };
              return (
                <div key={key} style={{ background:C.paper, borderRadius:12, border:`1.5px solid ${C.ink12}`, overflow:"hidden" }}>
                  <button onClick={()=>setLibCat(libCat===key?null:key)} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", fontFamily:C.sans }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:14 }}>{icons[key]}</span>
                      <span style={{ fontSize:14, fontWeight:600, color:C.ink }}>{labels[key]}</span>
                      <span style={{ fontSize:10, color:C.gold, fontWeight:500 }}>{seq.duration}</span>
                    </div>
                    <span style={{ fontSize:16, color:C.ink35, transform:libCat===key?"rotate(90deg)":"none", transition:"transform .2s" }}>›</span>
                  </button>
                  {libCat===key && (
                    <div style={{ borderTop:`1px solid ${C.ink12}` }}>
                      {seq.steps.map((step,i)=>(
                        <button key={i} onClick={()=>setSeqKey(key)} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", borderBottom:i<seq.steps.length-1?`1px solid ${C.ink12}`:"none", fontFamily:C.sans, textAlign:"left" }}>
                          <div>
                            <p style={{ fontSize:10, fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", color:C.gold, margin:"0 0 1px" }}>{step.num}</p>
                            <p style={{ fontSize:13, fontWeight:500, color:C.ink, margin:0 }}>{step.title}</p>
                          </div>
                          <Chev/>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ═══ OVERLAYS ═══ */}
      {seqKey && <SequencePage seqKey={seqKey} onClose={()=>setSeqKey(null)}/>}
      {aideOpen && <AidePage onClose={()=>setAideOpen(false)}/>}
      {confierOpen && <ConfierSheet onClose={()=>setConfierOpen(false)}/>}
    </>
  );
}
