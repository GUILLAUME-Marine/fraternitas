"use client";
// ─── tabs/TabJour.tsx v3 ──────────────────────────────────────────────────────
// Saint du jour : uniquement en carte sous l'évangile.
// SaintStrip supprimée du layout principal (plus de doublon).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

interface GospelData {
  title:   string;
  ref:     string;
  preview: string;
  rest:    string;
  url:     string;
}

interface TabJourProps {
  gospel:   GospelData | null;
  saint:    { name: string; dates: string; description: string };
  loading?: boolean;
}

function Skel({ w, h="13px" }: { w:string; h?:string }) {
  return <div className="skel" style={{width:w,height:h,borderRadius:6,background:"rgba(17,16,9,.09)",flexShrink:0}}/>;
}

export default function TabJour({ gospel, saint, loading }: TabJourProps) {
  const [restOpen, setRestOpen] = useState(false);

  return (
    <div className="prayer-body">

      {/* ── Évangile du jour ── */}
      <div className="gospel-block" style={{ borderRadius:13, marginBottom:16 }}>
        <div className="gospel-bh">
          {loading
            ? <Skel w="140px" h="12px"/>
            : gospel?.ref
              ? <span className="gospel-ref" style={{fontSize:13,fontWeight:500}}>{gospel.ref}</span>
              : null}
        </div>

        <div className="gospel-bb">
          {loading ? (
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              <Skel w="100%"/><Skel w="88%"/><Skel w="92%"/>
            </div>
          ) : gospel ? (
            <div className="gospel-text">
              <span style={{display:"block"}}>
                {gospel.preview.split("\n").map((line,i) => (
                  <span key={i}>{line}{i<gospel.preview.split("\n").length-1&&<br/>}</span>
                ))}
              </span>
              {gospel.rest && (
                <span className={`gospel-rest${restOpen?" open":""}`} style={restOpen?{}:{display:"none"}}>
                  {gospel.rest.split("\n").map((line,i) => (
                    <span key={i}>{line}{i<gospel.rest.split("\n").length-1&&<br/>}</span>
                  ))}
                </span>
              )}
            </div>
          ) : (
            <p style={{fontSize:13,color:"var(--ink35)",lineHeight:1.6}}>
              L&apos;évangile n&apos;a pas pu être chargé.{" "}
              <a href="https://www.aelf.org" target="_blank" rel="noopener" style={{color:"var(--gold)"}}>AELF.org →</a>
            </p>
          )}
        </div>

        <div className="gospel-bf">
          <a href={gospel?.url??"https://www.aelf.org"} target="_blank" rel="noopener noreferrer">
            Source : AELF →
          </a>
          {gospel?.rest && (
            <button className={`rbtn${restOpen?" open":""}`} onClick={()=>setRestOpen(v=>!v)}>
              {restOpen?"Fermer ":"Lire la suite "}
              <svg width="12" height="12" fill="none" viewBox="0 0 16 16">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Saint du jour — uniquement ici, pas dans SaintStrip ── */}
      {!loading && saint?.name && saint.name !== "—" && (
        <div className="prayer-saint-card">
          <div className="psi">✦</div>
          <div>
            <small>Saint du jour</small>
            <strong>{saint.name}{saint.dates?` · ${saint.dates}`:""}</strong>
            <p>{saint.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
