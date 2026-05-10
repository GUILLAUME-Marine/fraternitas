"use client";
// ─── tabs/PrayerZone.tsx v3 ───────────────────────────────────────────────────
// Sélecteur de type de prière sur mobile : quand on clique "Prière" dans le hero,
// une page plein écran simple s'ouvre avec les 6 choix clairs.
// Sur desktop : les onglets latéraux habituels.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import TabJour from "./TabJour";
import { SEQUENCES, stripHtml } from "../data";

type TabKey = "jour" | "matin" | "soir" | "inquiet" | "marie";

interface ApiData {
  gospel: { reference:string; title:string; intro:string; text:string; aelfUrl:string; } | null;
  saint:  { name:string; dates:string; description:string };
  quote:  { text:string; author:string };
}

interface PrayerZoneProps {
  activeTab:       TabKey;
  onTabChange:     (t: TabKey) => void;
  onOpenAide:      () => void;
  onOpenSequence:  (key: string) => void;
  apiData:         ApiData | null;
  apiLoading:      boolean;
  people:          string[];
  doneTabs:        Set<string>;
}

function getEvangelist(intro: string): string {
  const m = intro?.match(/selon\s+saint\s+([A-Za-z\u00C0-\u017E]+)/i);
  if (m) return `Évangile selon saint ${m[1]}`;
  const m2 = intro?.match(/selon\s+([A-Za-z\u00C0-\u017E\s]+)/i);
  if (m2) return `Évangile selon ${m2[1].trim()}`;
  return "Évangile du jour";
}

// ── Sélecteur de type de prière (mobile plein écran) ─────────────────────────
interface PrayerTypeSelectorProps {
  doneTabs:       Set<string>;
  onSelect:       (tab: TabKey) => void;
  onOpenAide:     () => void;
  onClose:        () => void;
}

function PrayerTypeSelector({ doneTabs, onSelect, onOpenAide, onClose }: PrayerTypeSelectorProps) {
  const types: { key: TabKey|"aide"; emoji: string; label: string; desc: string; pill?: string }[] = [
    { key:"jour",    emoji:"✦", label:"Prière du jour",    desc:"Évangile, saint du jour." },
    { key:"matin",   emoji:"☀", label:"Matin",             desc:"Offrande, Angélus, signe de croix.", pill:"5 min" },
    { key:"soir",    emoji:"🌙", label:"Soir",              desc:"Examen de conscience, Salve.",        pill:"5 min" },
    { key:"inquiet", emoji:"🕯", label:"Dans l'inquiétude", desc:"Quand quelque chose pèse.",           pill:"3 min" },
    { key:"marie",   emoji:"☽", label:"Avec Marie",        desc:"Ave Maria, Memorare, Salve.",         pill:"4 min" },
    { key:"aide",    emoji:"✝", label:"Guidez-moi",        desc:"Je ne sais pas comment prier." },
  ];

  return (
    <div style={{position:"fixed",inset:0,zIndex:102,background:"var(--cream)",overflowY:"auto"}}>
      <header style={{height:60,background:"rgba(242,235,224,.94)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--ink12)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",position:"sticky",top:0,zIndex:10}}>
        <button onClick={onClose} style={{display:"flex",alignItems:"center",gap:5,fontSize:13,color:"var(--ink65)",border:"1px solid var(--ink12)",background:"rgba(255,255,255,.5)",borderRadius:99,padding:"6px 13px",cursor:"pointer",minHeight:44}}>
          <svg width="14" height="14" fill="none" viewBox="0 0 16 16"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Retour
        </button>
        <span style={{fontFamily:"var(--serif)",fontSize:18,fontWeight:400,color:"var(--ink)"}}>Choisir une prière</span>
        <div style={{width:80}}/>
      </header>

      <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:10}}>
        <p style={{fontFamily:"var(--serif)",fontSize:14,fontWeight:300,color:"var(--ink50)",textAlign:"center",marginBottom:4}}>
          Que voulez-vous faire aujourd&apos;hui ?
        </p>

        {types.map(t => {
          const isDone = t.key !== "jour" && t.key !== "aide" && doneTabs.has(t.key);
          return (
            <button
              key={t.key}
              onClick={() => {
                if (t.key === "aide") { onOpenAide(); }
                else { onSelect(t.key as TabKey); }
                onClose();
              }}
              style={{
                width:"100%", textAlign:"left",
                background:isDone?"#FFFDF8":"var(--paper)",
                border:`1.5px solid ${isDone?"var(--gold-b)":"rgba(17,16,9,.10)"}`,
                borderRadius:18, padding:"16px 18px",
                display:"flex", alignItems:"center", gap:14, cursor:"pointer",
                boxShadow:"0 2px 12px rgba(17,16,9,.05)",
                minHeight:72,
              }}
            >
              <span style={{fontSize:22,width:36,textAlign:"center",flexShrink:0}}>{t.emoji}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                  <span style={{fontFamily:"var(--serif)",fontSize:18,fontWeight:400,color:"var(--ink)"}}>{t.label}</span>
                  {t.pill && <span style={{fontSize:10,fontWeight:600,color:"var(--ink35)",background:"rgba(17,16,9,.06)",borderRadius:99,padding:"2px 7px"}}>⏱ {t.pill}</span>}
                  {isDone && <span style={{fontSize:10,fontWeight:700,color:"var(--gold)",background:"rgba(184,137,58,.10)",borderRadius:99,padding:"2px 7px"}}>✓ Fait</span>}
                </div>
                <span style={{fontSize:12,color:"var(--ink50)",fontFamily:"var(--sans)"}}>{t.desc}</span>
              </div>
              <svg width="14" height="14" fill="none" viewBox="0 0 16 16" style={{flexShrink:0}}>
                <path d="M6 4l4 4-4 4" stroke="var(--ink35)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Aperçu séquence ───────────────────────────────────────────────────────────
function SequencePreview({tabKey, people, onStart}: {tabKey:string;people:string[];onStart:()=>void}) {
  const seq = SEQUENCES[tabKey]; if (!seq) return null;
  return (
    <div className="prayer-body">
      {people.length > 0 && (
        <div style={{background:"#FFF8EA",border:"1px solid var(--gold-b)",borderRadius:14,padding:"12px 15px",marginBottom:14}}>
          <strong style={{display:"block",fontSize:10,fontWeight:700,letterSpacing:".11em",textTransform:"uppercase",color:"var(--gold)",marginBottom:4}}>À porter aujourd&apos;hui</strong>
          <p style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:16,color:"var(--ink80)",lineHeight:1.45}}>{people.join(" · ")}</p>
        </div>
      )}
      <button className="btn-dark" onClick={onStart} style={{width:"100%",justifyContent:"center",padding:"14px 18px",fontSize:15}}>
        Commencer →
      </button>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function PrayerZone({
  activeTab, onTabChange, onOpenAide, onOpenSequence,
  apiData, apiLoading, people, doneTabs,
}: PrayerZoneProps) {
  const [displayKey, setDisplayKey] = useState(0);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);
  useEffect(() => { setDisplayKey(k=>k+1); }, [activeTab]);

  const gospel = apiData?.gospel ? {
    title:   getEvangelist(apiData.gospel.intro),
    ref:     apiData.gospel.reference,
    preview: (() => { const lines=stripHtml(apiData.gospel!.text).split("\n").filter(Boolean); return lines.slice(0,3).join("\n"); })(),
    rest:    (() => { const lines=stripHtml(apiData.gospel!.text).split("\n").filter(Boolean); return lines.slice(3).join("\n"); })(),
    url:     apiData.gospel.aelfUrl,
  } : null;

  const saint = apiData?.saint ?? {name:"—",dates:"",description:""};

  const TABS: { key:TabKey; label:string; sub:string; pill?:string }[] = [
    {key:"jour",    label:"Prière du jour",    sub:"Évangile, saint."},
    {key:"matin",   label:"Matin",             sub:"Séquence complète.", pill:"5 min"},
    {key:"soir",    label:"Soir",              sub:"Examen de conscience.", pill:"5 min"},
    {key:"inquiet", label:"Dans l'inquiétude", sub:"Quand quelque chose pèse.", pill:"3 min"},
    {key:"marie",   label:"Avec Marie",        sub:"Ave Maria, Memorare.", pill:"4 min"},
  ];

  const jourTitle = gospel?.title ?? "Évangile du jour";

  return (
    <>
      {/* Sélecteur mobile plein écran */}
      {showTypeSelector && (
        <PrayerTypeSelector
          doneTabs={doneTabs}
          onSelect={tab => { onTabChange(tab); }}
          onOpenAide={onOpenAide}
          onClose={() => setShowTypeSelector(false)}
        />
      )}

      <section id="priere" className="prayer-zone fu" style={{animationDelay:".22s"}}>
        {/* Onglets */}
        <div className="prayer-tabs" role="tablist">
          {TABS.map(t => (
            <button key={t.key} className={`ptab${activeTab===t.key?" active":""}`}
              onClick={() => onTabChange(t.key)} role="tab" aria-selected={activeTab===t.key}>
              <strong>
                {t.key!=="jour" && doneTabs.has(t.key) && <span style={{color:"var(--gold)",fontSize:11,marginRight:4}}>✓</span>}
                {t.label}
                {t.pill && <em className="time-pill"> ⏱ {t.pill}</em>}
              </strong>
              <span>{t.sub}</span>
            </button>
          ))}
          <button className="ptab aide-tab" onClick={onOpenAide}>
            <strong>Aide à la prière</strong>
            <span>Question / réponse pour commencer.</span>
          </button>
        </div>

        {/* Affichage */}
        <div className="prayer-display">
          <div key={displayKey} id="pdisplay" className="pdisplay-content">
            <div className="prayer-head">
              {activeTab==="jour" ? (
                apiLoading
                  ? <div style={{height:28,width:"60%",borderRadius:6,background:"rgba(17,16,9,.09)"}}/>
                  : <h2 style={{fontFamily:"var(--serif)",fontSize:28,fontWeight:300,color:"var(--ink)",letterSpacing:"-.03em",lineHeight:1.1}}>{jourTitle}</h2>
              ) : (
                <>
                  <p className="prayer-k">{SEQUENCES[activeTab]?.kicker}</p>
                  <h2 style={{fontFamily:"var(--serif)",fontSize:28,fontWeight:300,color:"var(--ink)",letterSpacing:"-.03em",marginBottom:5,lineHeight:1.1}}>{SEQUENCES[activeTab]?.title}</h2>
                  <p className="prayer-desc">{SEQUENCES[activeTab]?.desc}</p>
                </>
              )}
            </div>

            {activeTab==="jour"
              ? <TabJour gospel={gospel} saint={saint} loading={apiLoading}/>
              : <SequencePreview tabKey={activeTab} people={people} onStart={()=>onOpenSequence(activeTab)}/>
            }
          </div>
        </div>
      </section>
    </>
  );
}
