"use client";
// ─── pages/ChapeletPage.tsx v4 ────────────────────────────────────────────────
// Fix : vrai SVG ellipse chapelet sur mobile (compact, ~160px)
// Fix : pause → scroll en haut de la page prière
// Fix : prayTextOpen = false par défaut sur mobile
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { MYSTERIES, PRAYERS_TEXT } from "../data";
import { type RosaryProgress } from "../hooks";

type Phase = "accueil" | "setup" | "praying" | "done" | "mystery" | "pourquoi";
type SoundMode = "silence" | "chant" | "organ";

interface ChapeletPageProps {
  progress:      RosaryProgress;
  hasProgress:   boolean;
  percent:       number;
  humanPosition: () => string;
  onSave:        (p: RosaryProgress) => void;
  onClear:       () => void;
  onClose:       () => void;
  onCompleted?:  () => void;
}

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

// ── SVG plein (desktop) ───────────────────────────────────────────────────────

function buildRosarySVG(current: number): string {
  const W = 560, H = 235, cx = 280, cy = 96, rx = 220, ry = 76, total = 55;
  const cur   = Math.max(0, Math.min(total, current));
  const start = Math.PI / 2 + Math.PI * 0.12;
  const end   = Math.PI / 2 - Math.PI * 0.12 + Math.PI * 2;
  const step  = (end - start) / (total - 1);
  let s = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="rgba(17,16,9,.12)" stroke-width="2"/>`;
  s += `<line x1="${cx}" y1="${cy+ry}" x2="${cx}" y2="214" stroke="rgba(17,16,9,.14)" stroke-width="2"/>`;
  s += `<line x1="${cx}" y1="194" x2="${cx}" y2="229" stroke="#B8893A" stroke-width="4" stroke-linecap="round"/>`;
  s += `<line x1="${cx-18}" y1="210" x2="${cx+18}" y2="210" stroke="#B8893A" stroke-width="4" stroke-linecap="round"/>`;
  for (let i = 0; i < total; i++) {
    const a = start + i * step, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
    const big = i % 11 === 0, done = i < cur, isCur = i === cur;
    const r = isCur ? (big ? 13 : 10) : (big ? 9 : 6);
    const fill = done ? "#7A551D" : isCur ? "#C49A3C" : "#E7DDD0";
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}" stroke="${isCur ? "rgba(184,137,58,.45)" : "rgba(17,16,9,.10)"}" stroke-width="${isCur ? 5 : 1}"/>`;
  }
  return s;
}

// ── SVG ellipse compact (mobile) — vraie forme chapelet, ~160px de haut ───────
// Même ellipse que le grand, juste réduite. viewBox 0 0 320 170.

function buildMobileRosarySVG(current: number): string {
  const W = 320, H = 170;
  const cx = 160, cy = 72, rx = 138, ry = 54, total = 55;
  const cur   = Math.max(0, Math.min(total, current));
  const start = Math.PI / 2 + Math.PI * 0.12;
  const end   = Math.PI / 2 - Math.PI * 0.12 + Math.PI * 2;
  const step  = (end - start) / (total - 1);

  // Ellipse + croix
  let s = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="rgba(17,16,9,.14)" stroke-width="1.5"/>`;
  s += `<line x1="${cx}" y1="${cy+ry}" x2="${cx}" y2="155" stroke="rgba(17,16,9,.16)" stroke-width="1.5"/>`;
  s += `<line x1="${cx}" y1="142" x2="${cx}" y2="168" stroke="#B8893A" stroke-width="3" stroke-linecap="round"/>`;
  s += `<line x1="${cx-12}" y1="153" x2="${cx+12}" y2="153" stroke="#B8893A" stroke-width="3" stroke-linecap="round"/>`;

  // Grains
  for (let i = 0; i < total; i++) {
    const a = start + i * step, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
    const big = i % 11 === 0, done = i < cur, isCur = i === cur;
    const r = isCur ? (big ? 8 : 6) : (big ? 5.5 : 3.5);
    const fill = done ? "#7A551D" : isCur ? "#C49A3C" : "#E2D8CC";
    const sw = isCur ? 3.5 : 0.8;
    const st = isCur ? "rgba(184,137,58,.50)" : "rgba(17,16,9,.12)";
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}" stroke="${st}" stroke-width="${sw}"/>`;
  }

  return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true" style="width:100%;height:auto;max-height:170px">${s}</svg>`;
}

// ── SVG intro ─────────────────────────────────────────────────────────────────

function IntroRosarySVG() {
  const cx = 280, cy = 128, rx = 220, ry = 86;
  const start = Math.PI / 2 + Math.PI * 0.12;
  const end   = Math.PI / 2 - Math.PI * 0.12 + Math.PI * 2;
  const step  = (end - start) / 54;
  let circles = "";
  for (let i = 0; i < 55; i++) {
    const a = start + i * step, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
    const big = i % 11 === 0;
    circles += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${big ? 9 : 5.5}" fill="${i === 0 ? "#C49A3C" : "#E9DFD1"}" stroke="rgba(17,16,9,.12)"/>`;
  }
  return (
    <svg viewBox="0 0 560 300" aria-hidden="true">
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="rgba(17,16,9,.12)" strokeWidth="2"/>
      <line x1={cx} y1={cy+ry} x2={cx} y2="254" stroke="rgba(17,16,9,.15)" strokeWidth="2"/>
      <line x1={cx} y1="236" x2={cx} y2="282" stroke="#B8893A" strokeWidth="4" strokeLinecap="round"/>
      <line x1={cx-22} y1="258" x2={cx+22} y2="258" stroke="#B8893A" strokeWidth="4" strokeLinecap="round"/>
      <g dangerouslySetInnerHTML={{ __html: circles }}/>
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════════════════════

export default function ChapeletPage({
  progress, hasProgress, percent, humanPosition, onSave, onClear, onClose, onCompleted,
}: ChapeletPageProps) {
  const [phase, setPhase]          = useState<Phase>("accueil");
  const [intentionInput, setInput] = useState(progress.intention ?? "");
  const [soundMode, setSoundMode]  = useState<SoundMode>("silence");
  const [prayTextOpen, setPrayText] = useState(false);
  const [amenTap, setAmenTap]      = useState(false);
  const audioRef                   = useRef<HTMLAudioElement | null>(null);
  const [localProgress, setLocal]  = useState<RosaryProgress>(progress);
  const [isMobile, setIsMobile]    = useState(false);

  useEffect(() => {
    const mobile = isMobileViewport();
    setIsMobile(mobile);
    if (!mobile) setPrayText(true); // desktop : texte ouvert par défaut
  }, []);

  useEffect(() => { setLocal(progress); }, [progress]);

  const mystery     = MYSTERIES[localProgress.mysteryType];
  const mysteryItem = mystery?.items[localProgress.decadeIndex];
  const localPct    = Math.max(0, Math.min(100,
    Math.round(((localProgress.decadeIndex * 11 + (localProgress.grainIndex + 1)) / 55) * 100)
  ));

  const getCurrentPrayer = () => {
    const gi = localProgress.grainIndex;
    if (gi === -1)          return { label: "Notre Père",                      text: PRAYERS_TEXT.NP };
    if (gi >= 0 && gi <= 9) return { label: `Je vous salue Marie ${gi + 1}/10`, text: PRAYERS_TEXT.AM };
    return { label: "Gloire au Père", text: PRAYERS_TEXT.GL };
  };

  const save = (p: RosaryProgress) => { setLocal(p); onSave(p); };

  const startSound = useCallback(() => {
    if (soundMode === "silence") return;
    const src = soundMode === "chant" ? "/audio/gregorian-kyrie.mp3" : "/audio/organ-bach.mp3";
    stopSound();
    try {
      const audio = new Audio(src);
      audio.loop = true; audio.volume = 0;
      audio.play().then(() => {
        let v = 0;
        const fade = setInterval(() => { v = Math.min(v + 0.04, 0.45); audio.volume = v; if (v >= 0.45) clearInterval(fade); }, 200);
      }).catch(() => {});
      audioRef.current = audio;
    } catch { /* silencieux */ }
  }, [soundMode]);

  const stopSound = () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  useEffect(() => { return () => stopSound(); }, []);

  const advanceGrain = () => {
    setAmenTap(true);
    setTimeout(() => setAmenTap(false), 140);
    const p = { ...localProgress };
    const gi = p.grainIndex;
    if (gi < 9)        { p.grainIndex++; }
    else if (gi === 9) { p.grainIndex = 10; }
    else if (gi === 10) {
      if (p.decadeIndex < 4) { p.decadeIndex++; p.grainIndex = -1; }
      else { stopSound(); onClear(); onCompleted?.(); setPhase("done"); return; }
    }
    save(p);
    // Mobile : on referme le texte à chaque nouveau grain
    if (isMobile) setPrayText(false);
  };

  const startPraying = () => {
    let p = { ...localProgress };
    if (!hasProgress) {
      p = { ...p, decadeIndex: 0, grainIndex: -1, intention: intentionInput, startedAt: new Date().toISOString() };
    } else {
      p.intention = intentionInput;
    }
    save(p);
    startSound();
    setPhase("praying");
    setPrayText(!isMobile);
  };

  // Fix pause : ferme l'overlay ET scrolle en haut de la page prière
  const pause = () => {
    save(localProgress);
    stopSound();
    onClose();
    // Scroll vers le haut de la page prière après fermeture
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const { label: prayLabel, text: prayText } = getCurrentPrayer();
  const svgHtml       = buildRosarySVG(localProgress.decadeIndex * 11 + (localProgress.grainIndex + 1));
  const mobileSvgHtml = buildMobileRosarySVG(localProgress.decadeIndex * 11 + (localProgress.grainIndex + 1));

  // Bouton retour commun
  const BackBtn = ({ onClick, label = "Retour" }: { onClick: () => void; label?: string }) => (
    <button className="chap-back" onClick={onClick}>
      <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
        <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {label}
    </button>
  );

  return (
    <div className="chap-page visible" id="chap-page">

      {/* ═══ ACCUEIL ═══ */}
      {phase === "accueil" && (
        <div className="chap-intent">
          <header className="chap-hdr">
            <BackBtn onClick={onClose}/>
            <span className="chap-hdr-title">Le Chapelet</span>
            <div style={{ width: 60 }}/>
          </header>
          <div className="chap-inner">
            <div className="chap-intro-grid-final">
              <section className="chap-intro-copy">
                <p className="over">Chapelet interactif</p>
                <h1>Entrer dans la prière,<br/>avec Marie et l&apos;Église.</h1>
                <p>Contemplez le mystère du jour, choisissez votre intention et priez grain après grain.</p>
              </section>
              <section className="chap-intro-visual">
                <IntroRosarySVG/>
                <p className="chap-fatima">« Priez le chapelet chaque jour. »<span>Notre-Dame à Fatima</span></p>
              </section>
            </div>
            <div className="rosary-start-card">
              <h2>{hasProgress && percent > 0 ? "Poursuivre le chapelet" : "Commencer le chapelet"}</h2>
              <p>{hasProgress && percent > 0 ? `${humanPosition()} · ${percent}% avancé.` : `${mystery?.label ?? ""} · ${mystery?.days ?? ""}.`}</p>
              {hasProgress && percent > 0 && (
                <div className="chap-progress-track"><div className="chap-progress-fill" style={{ width: `${percent}%` }}/></div>
              )}
              <div className="rosary-actions">
                <button className="btn-primary" onClick={() => setPhase("setup")}>
                  {hasProgress && percent > 0 ? "Poursuivre →" : "Commencer →"}
                </button>
                {hasProgress && percent > 0 && (
                  <button className="btn-secondary-clean" onClick={() => { onClear(); setPhase("setup"); }}>
                    Recommencer depuis le début
                  </button>
                )}
              </div>
            </div>
            <button className="why-link" onClick={() => setPhase("pourquoi")}>
              Lire pourquoi on prie le chapelet →
            </button>
          </div>
        </div>
      )}

      {/* ═══ SETUP ═══ */}
      {phase === "setup" && (
        <div className="chap-intent">
          <header className="chap-hdr">
            <BackBtn onClick={() => setPhase("accueil")}/>
            <span className="chap-hdr-title">Intention &amp; ambiance</span>
            <div style={{ width: 60 }}/>
          </header>
          <div className="chap-inner">
            <div className="chap-setup" style={{ display: "flex" }}>
              <p className="int-label">Pour qui priez-vous ?</p>
              <textarea className="int-ta" rows={2} placeholder="Pour mon père malade… Pour la paix en Europe…" maxLength={200} value={intentionInput} onChange={e => setInput(e.target.value)}/>
              <div className="son-block">
                <span className="son-label">Ambiance sonore</span>
                <div className="son-btns">
                  {(["silence","chant","organ"] as SoundMode[]).map(mode => (
                    <button key={mode} className={`son-btn${soundMode===mode?" active":""}`} onClick={() => setSoundMode(mode)}>
                      {mode==="silence"?"Silence":mode==="chant"?"Chant grégorien":"Orgue"}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-primary" onClick={startPraying}>Entrer en prière →</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PRIÈRE GRAIN PAR GRAIN ═══ */}
      {phase === "praying" && (
        <div className="chap-pray visible">
          <header className="chap-hdr">
            <BackBtn onClick={pause} label="Pause"/>
            <span className="chap-hdr-title">Chapelet</span>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--gold)", background:"var(--cream3)", border:"1px solid var(--gold-b)", borderRadius:99, padding:"6px 10px" }}>
              {localPct}%
            </span>
          </header>

          {/* ══ MOBILE ══ */}
          {isMobile ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10, padding:"12px 14px", paddingBottom:"calc(14px + env(safe-area-inset-bottom,0px))" }}>

              {/* Bandeau mystère compact */}
              <button
                onClick={() => setPhase("mystery")}
                style={{ width:"100%", background:"linear-gradient(145deg,#2C1E08,#1A1410)", border:"1px solid rgba(196,154,60,.24)", borderRadius:16, padding:"12px 14px", textAlign:"left", cursor:"pointer" }}
              >
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(217,181,91,.88)", marginBottom:3, fontFamily:"var(--sans)" }}>
                  {localProgress.decadeIndex + 1}e mystère · {mysteryItem?.ref}
                </p>
                <p style={{ fontFamily:"var(--serif)", fontSize:18, fontWeight:300, color:"#FFF8EA", lineHeight:1.1, marginBottom:6 }}>
                  {mysteryItem?.title}
                </p>
                <p style={{ fontFamily:"var(--serif)", fontSize:13, fontStyle:"italic", color:"rgba(255,248,234,.65)", lineHeight:1.45 }}>
                  {mysteryItem?.verse}
                </p>
              </button>

              {/* SVG chapelet — vraie forme ellipse compacte */}
              <div style={{
                background:"#FFFDF8", border:"1px solid rgba(17,16,9,.08)",
                borderRadius:14, padding:"10px 8px",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <div dangerouslySetInnerHTML={{ __html: mobileSvgHtml }} style={{ width:"100%" }}/>
              </div>

              {/* Intention */}
              {localProgress.intention && (
                <div style={{ background:"rgba(255,255,255,.76)", border:"1px solid var(--gold-b)", borderRadius:12, padding:"9px 13px" }}>
                  <p style={{ fontSize:13, fontWeight:300, color:"var(--ink65)", fontStyle:"italic" }}>🙏 {localProgress.intention}</p>
                </div>
              )}

              {/* Nom prière + Lire */}
              <div style={{ background:"#FFFDF8", border:"1px solid rgba(17,16,9,.10)", borderRadius:16, padding:"14px 16px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                <span style={{ fontFamily:"var(--serif)", fontSize:20, fontWeight:300, letterSpacing:"-.03em", color:"var(--ink)", lineHeight:1.1, flex:1 }}>
                  {prayLabel}
                </span>
                <button onClick={() => setPrayText(v => !v)} style={{ fontSize:12, fontWeight:700, color:"var(--gold)", background:"#FFF8EC", border:"1px solid var(--gold-b)", borderRadius:99, padding:"6px 12px", cursor:"pointer", flexShrink:0, minHeight:36 }}>
                  {prayTextOpen ? "Masquer" : "Lire"}
                </button>
              </div>

              {/* Texte prière — visible uniquement si ouvert */}
              {prayTextOpen && (
                <div style={{ background:"#FFFDF8", border:"1px solid rgba(17,16,9,.10)", borderRadius:16, padding:"16px", fontFamily:"var(--serif)", fontSize:16, fontWeight:300, lineHeight:1.72, color:"var(--ink80)", whiteSpace:"pre-line" }}>
                  {prayText}
                </div>
              )}

              {/* Amen */}
              <button className={`amen-btn${amenTap?" tap":""}`} onClick={advanceGrain} style={{ minHeight:100 }}>
                <div className="amen-icon">
                  <svg width="15" height="15" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="12" stroke="#C49A3C" strokeWidth="1.3"/>
                    <line x1="14" y1="5" x2="14" y2="23" stroke="#C49A3C" strokeWidth="1.3"/>
                    <line x1="8" y1="11" x2="20" y2="11" stroke="#C49A3C" strokeWidth="1.3"/>
                  </svg>
                </div>
                <span className="amen-text">{localProgress.grainIndex === 10 ? "Amen — mystère suivant" : "Amen"}</span>
              </button>

              <p style={{ fontFamily:"var(--serif)", fontSize:13, fontStyle:"italic", color:"var(--ink50)", textAlign:"center" }}>
                L&apos;Église prie avec vous
              </p>
            </div>

          ) : (
            /* ══ DESKTOP ══ */
            <div className="chap-pray-shell">
              <div className="chap-pray-inner">
                <div className="chap-mystery-bar">
                  <button onClick={() => setPhase("mystery")} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", textAlign:"left", padding:0 }}>
                    <div className="cmb-inner">
                      <p className="cmb-label">{localProgress.decadeIndex+1}e mystère {mystery?.label.split(" ")[1]?.toLowerCase()??""} · {mysteryItem?.ref}</p>
                      <p className="cmb-title">{mysteryItem?.title}</p>
                      <p className="cmb-verse">{mysteryItem?.verse}</p>
                      <div className="chap-progress-track"><div className="chap-progress-fill" style={{ width:`${localPct}%` }}/></div>
                    </div>
                    <div className="contempler-btn">
                      <span>→ Contempler ce mystère</span>
                      <svg width="14" height="14" fill="none" viewBox="0 0 16 16"><path d="M6 4l4 4-4 4" stroke="#C49A3C" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                  </button>
                </div>
                <div className="chap-pray-main">
                  <div className="chap-svg-wrap">
                    <svg viewBox="0 0 560 235" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svgHtml }} style={{ width:"min(100%,560px)", height:"auto", maxHeight:300 }}/>
                  </div>
                  <div className="chap-prayer-actions">
                    {localProgress.intention && (
                      <div style={{ background:"rgba(255,255,255,.76)", border:"1px solid var(--gold-b)", borderRadius:20, padding:"12px 16px" }}>
                        <p style={{ fontSize:13, fontWeight:300, color:"var(--ink65)", fontStyle:"italic" }}>🙏 <span>{localProgress.intention}</span></p>
                      </div>
                    )}
                    <div className="pray-label-block">
                      <span className="pl">{prayLabel}</span>
                      <button className="pread" onClick={() => setPrayText(v => !v)}>{prayTextOpen?"Masquer":"Lire"}</button>
                    </div>
                    <div className={`pray-full-text${prayTextOpen?" open":""}`} style={prayTextOpen?{}:{display:"none"}}>{prayText}</div>
                    <button className={`amen-btn${amenTap?" tap":""}`} onClick={advanceGrain}>
                      <div className="amen-icon">
                        <svg width="15" height="15" viewBox="0 0 28 28" fill="none">
                          <circle cx="14" cy="14" r="12" stroke="#C49A3C" strokeWidth="1.3"/>
                          <line x1="14" y1="5" x2="14" y2="23" stroke="#C49A3C" strokeWidth="1.3"/>
                          <line x1="8" y1="11" x2="20" y2="11" stroke="#C49A3C" strokeWidth="1.3"/>
                        </svg>
                      </div>
                      <span className="amen-text">{localProgress.grainIndex===10?"Amen — mystère suivant":"Amen"}</span>
                    </button>
                    <p className="church-line">L&apos;Église prie avec vous</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ DONE ═══ */}
      {phase === "done" && (
        <div className="chap-pray visible">
          <header className="chap-hdr">
            <div style={{ width:64 }}/><span className="chap-hdr-title">Chapelet terminé</span><div style={{ width:64 }}/>
          </header>
          <div style={{ maxWidth:460, margin:"0 auto", padding:"40px 22px 80px", display:"flex", flexDirection:"column", alignItems:"center", gap:16, textAlign:"center" }}>
            <div style={{ width:46, height:46, borderRadius:"50%", background:"var(--cream3)", border:"1.5px solid var(--gold-b)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--serif)", fontSize:20, color:"var(--gold)" }}>†</div>
            <h2 style={{ fontFamily:"var(--serif)", fontSize:30, fontWeight:300, letterSpacing:"-.04em", color:"var(--ink)" }}>Chapelet terminé.</h2>
            <p style={{ fontSize:14, color:"var(--ink50)", lineHeight:1.65, maxWidth:320 }}>Prenez un moment de silence avant de reprendre votre journée. L&apos;Église a prié avec vous.</p>
            <div style={{ background:"var(--cream3)", borderRadius:16, padding:17, border:"1.5px solid var(--gold-b)", width:"100%", textAlign:"left" }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:".10em", textTransform:"uppercase", color:"var(--gold)", marginBottom:8 }}>Prière de Fatima</p>
              <p style={{ fontFamily:"var(--serif)", fontSize:14, fontWeight:300, fontStyle:"italic", color:"var(--ink80)", lineHeight:1.68 }}>
                Ô mon Jésus, pardonnez-nous nos péchés,<br/>préservez-nous du feu de l&apos;enfer,<br/>et conduisez au Ciel toutes les âmes,<br/>spécialement celles qui ont le plus besoin<br/>de votre miséricorde. Amen.
              </p>
            </div>
            <button className="btn-primary" style={{ maxWidth:300 }} onClick={onClose}>Terminer →</button>
          </div>
        </div>
      )}

      {/* ═══ MYSTÈRE ═══ */}
      {phase === "mystery" && (
        <div className="mystery-detail-page visible">
          <header className="chap-hdr">
            <BackBtn onClick={() => setPhase("praying")}/>
            <span className="chap-hdr-title">Contempler le mystère</span>
            <div style={{ width:60 }}/>
          </header>
          <div className="aide-inner">
            <div className="mystery-detail-card">
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(196,154,60,.80)", marginBottom:5 }}>{mystery?.label} · {mysteryItem?.ref}</p>
              <h2>{mysteryItem?.title}</h2>
              <p>{mysteryItem?.verse}</p>
            </div>
            <div className="meditation-card"><h3>À contempler</h3><p>Regardez ce mystère comme une scène vivante. Qu&apos;est-ce que le Christ veut vous montrer aujourd&apos;hui ?</p></div>
            <div className="meditation-card"><h3>Intention possible</h3><p>Confiez à Marie une personne ou une situation liée à ce mystère. Donnez simplement un nom, une inquiétude, une action de grâce.</p></div>
            <button className="btn-primary" onClick={() => setPhase("praying")}>Revenir au chapelet →</button>
          </div>
        </div>
      )}

      {/* ═══ POURQUOI ═══ */}
      {phase === "pourquoi" && (
        <div className="rosary-info-page visible">
          <header className="chap-hdr">
            <BackBtn onClick={() => setPhase("accueil")}/>
            <span className="chap-hdr-title">Pourquoi prier le chapelet ?</span>
            <div style={{ width:60 }}/>
          </header>
          <div className="aide-inner" style={{ maxWidth:760 }}>
            <div className="ri-hero"><p className="pk">Le chapelet</p><h2>Pourquoi prier le chapelet ?</h2><p>Une prière simple qui met le cœur au rythme de l&apos;Évangile, avec Marie, quand les mots manquent.</p></div>
            <div className="ri-card"><h3>Comment vivre ce moment ?</h3><p>Contemplez le mystère, avancez grain après grain. Si votre esprit part ailleurs : revenez doucement. Dieu connaît vos limites.</p></div>
            <div className="ri-card"><h3>Qui a demandé de prier le chapelet ?</h3><p>À Fatima, Marie demande de prier le chapelet chaque jour pour la paix et la conversion des cœurs.</p></div>
            <div className="ri-card">
              <h3>Les promesses de Marie</h3>
              <p>La tradition rapporte quinze promesses attachées au Rosaire, exprimant la confiance dans l&apos;intercession de Marie.</p>
              <details>
                <summary>Voir les 15 promesses</summary>
                <ol className="promise-list">
                  {["Protection spéciale et grandes grâces.","Aide pour grandir dans la foi.","Croissance des vertus et confiance en Dieu.","Détachement de ce qui éloigne du Christ.","Secours maternel dans les combats spirituels.","Consolation dans les épreuves.","Lumière pour mieux connaître Jésus.","Soutien pour les âmes confiées à Marie.","Espérance du ciel et désir de sainteté.","Grâces demandées conduisant au salut.","Aide pour ceux qui font connaître le Rosaire.","Intercession de Marie et des saints.","Union plus profonde avec Jésus-Christ.","Signe d'un cœur tourné vers Dieu.","Protection maternelle de Marie."].map((p,i)=><li key={i}>{p}</li>)}
                </ol>
              </details>
            </div>
            <button className="btn-primary" onClick={() => setPhase("accueil")}>Retour au chapelet →</button>
          </div>
        </div>
      )}
    </div>
  );
}
