"use client";
// ─── src/app/dashboard/spiritual/page.tsx v4 ─────────────────────────────────
// Architecture :
//   MOBILE  → MobilePrayerLayout (3 pavés : Prière / Chapelet / Intentions)
//   DESKTOP → Layout existant (sidebar + zones habituelles)
//
// Les overlays sont partagés : ChapeletPage, AidePage, SequencePage, etc.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import "@/components/spiritual/spiritual.css";

// Layout
import Topbar              from "@/components/spiritual/layout/Topbar";
import HeroSection         from "@/components/spiritual/layout/HeroSection";
import RosaryCard          from "@/components/spiritual/layout/RosaryCard";
import MobilePrayerLayout  from "@/components/spiritual/layout/MobilePrayerLayout";

// Desktop
import PrayerZone    from "@/components/spiritual/tabs/PrayerZone";
import PanneauDroite from "@/components/spiritual/panels/PanneauDroite";
import Bibliotheque  from "@/components/spiritual/panels/Bibliotheque";

// Overlays (partagés mobile + desktop)
import ChapeletPage       from "@/components/spiritual/pages/ChapeletPage";
import AidePage           from "@/components/spiritual/pages/AidePage";
import SequencePage       from "@/components/spiritual/pages/SequencePage";
import BiblioPage         from "@/components/spiritual/pages/BiblioPage";
import IntentionModal     from "@/components/spiritual/pages/IntentionModal";
import IntentionsListPage from "@/components/spiritual/pages/IntentionsListPage";
import PersonnesPage      from "@/components/spiritual/pages/PersonnesPage";
import TabJour            from "@/components/spiritual/tabs/TabJour";

import { useRosary, usePeople } from "@/components/spiritual/hooks";
import { stripHtml } from "@/components/spiritual/data";

// ── Types ─────────────────────────────────────────────────────────────────────

type PrayTab = "jour" | "matin" | "soir" | "inquiet" | "marie";

interface ApiData {
  gospel: { reference:string; title:string; intro:string; text:string; aelfUrl:string; }|null;
  saint:  { name:string; dates:string; description:string };
  quote:  { text:string; author:string };
}

type Overlay =
  | { type: "chapelet" }
  | { type: "aide" }
  | { type: "sequence"; key: string }
  | { type: "biblio"; key: string }
  | { type: "intention-modal" }
  | { type: "intentions-list" }
  | { type: "personnes" }
  | { type: "jour" }  // Prière du jour en overlay mobile
  | null;

// ── Helpers "fait aujourd'hui" ─────────────────────────────────────────────────

function todayKey(tab: string) { return `fraternitas_done_${new Date().toISOString().slice(0,10)}_${tab}`; }
function isDone(tab: string): boolean { try { return localStorage.getItem(todayKey(tab))==="1"; } catch { return false; } }
function markDone(tab: string): void { try { localStorage.setItem(todayKey(tab),"1"); } catch {} }

function getEvangelist(intro: string): string {
  const m = intro?.match(/selon\s+saint\s+([A-Za-z\u00C0-\u017E]+)/i);
  if (m) return `Évangile selon saint ${m[1]}`;
  const m2 = intro?.match(/selon\s+([A-Za-z\u00C0-\u017E\s]+)/i);
  if (m2) return `Évangile selon ${m2[1].trim()}`;
  return "Évangile du jour";
}

// ── Overlay Prière du Jour (mobile) ───────────────────────────────────────────
// Page plein écran légère pour afficher l'évangile sur mobile

function JourOverlay({
  apiData, apiLoading, onClose,
}: { apiData: ApiData|null; apiLoading: boolean; onClose: () => void }) {
  const gospel = apiData?.gospel ? {
    title:   getEvangelist(apiData.gospel.intro),
    ref:     apiData.gospel.reference,
    preview: (() => { const l=stripHtml(apiData.gospel!.text).split("\n").filter(Boolean); return l.slice(0,3).join("\n"); })(),
    rest:    (() => { const l=stripHtml(apiData.gospel!.text).split("\n").filter(Boolean); return l.slice(3).join("\n"); })(),
    url:     apiData.gospel.aelfUrl,
  } : null;
  const saint = apiData?.saint ?? { name:"—", dates:"", description:"" };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:100,
      background:"var(--cream)", overflowY:"auto",
    }}>
      <header style={{
        height:60, background:"rgba(242,235,224,.96)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid var(--ink12)", display:"flex", alignItems:"center",
        justifyContent:"space-between", padding:"0 20px",
        position:"sticky", top:0, zIndex:10,
      }}>
        <button onClick={onClose} style={{
          display:"flex", alignItems:"center", gap:5, fontSize:13,
          color:"var(--ink65)", border:"1px solid var(--ink12)",
          background:"rgba(255,255,255,.5)", borderRadius:99, padding:"6px 13px",
          cursor:"pointer", minHeight:44, fontFamily:"var(--sans)",
        }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Retour
        </button>
        <span style={{ fontFamily:"var(--serif)", fontSize:18, fontWeight:400, color:"var(--ink)" }}>
          {gospel?.title ?? "Prière du jour"}
        </span>
        <div style={{ width:80 }}/>
      </header>
      <div style={{ padding:"20px 16px 80px" }}>
        <TabJour gospel={gospel} saint={saint} loading={apiLoading}/>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════

export default function SpiritualPage() {
  const [userId, setUserId]         = useState("");
  const [apiData, setApiData]       = useState<ApiData|null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [activeTab, setActiveTab]   = useState<PrayTab>("jour");
  const [doneTabs, setDoneTabs]     = useState<Set<string>>(new Set());
  const [overlay, setOverlay]       = useState<Overlay>(null);
  const [intentionsRefresh, setIntentionsRefresh] = useState(0);
  const [isMobile, setIsMobile]     = useState(false);

  // Détecter mobile au mount
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch("/api/auth/session").then(r=>r.ok?r.json():null)
      .then(s=>{ if(s?.user?.id) setUserId(s.user.id); }).catch(()=>{});
  }, []);

  const loadApi = useCallback(async () => {
    setApiLoading(true);
    try { const r=await fetch("/api/spiritual"); if(r.ok) setApiData(await r.json()); }
    catch {} finally { setApiLoading(false); }
  }, []);

  useEffect(() => { loadApi(); }, [loadApi]);

  useEffect(() => {
    const done = new Set<string>();
    ["matin","soir","inquiet","marie","chapelet"].forEach(t => { if(isDone(t)) done.add(t); });
    setDoneTabs(done);
  }, []);

  const handleTabDone = useCallback((tab: string) => {
    markDone(tab);
    setDoneTabs(prev => new Set([...prev, tab]));
  }, []);

  const rosary = useRosary();
  const { people, add: addPerson, remove: removePerson } = usePeople(userId);

  // ── Handlers overlay ──────────────────────────────────────────────────────

  const openChapelet        = () => setOverlay({ type:"chapelet" });
  const openAide            = () => setOverlay({ type:"aide" });
  const openSequence        = (key:string) => setOverlay({ type:"sequence", key });
  const openBiblio          = (key:string) => setOverlay({ type:"biblio", key });
  const openIntentionModal  = () => setOverlay({ type:"intention-modal" });
  const openIntentionsList  = () => setOverlay({ type:"intentions-list" });
  const openPersonnes       = () => setOverlay({ type:"personnes" });
  const openJourOverlay     = () => setOverlay({ type:"jour" });
  const closeOverlay        = () => setOverlay(null);

  const scrollToPriere = useCallback((tab: PrayTab) => {
    setActiveTab(tab);
    setTimeout(() => {
      document.getElementById("priere")?.scrollIntoView({ behavior:"smooth", block:"start" });
    }, 50);
  }, []);

  const onIntentionPublished = () => { setIntentionsRefresh(k=>k+1); closeOverlay(); };

  const handleSequenceClose = useCallback((key: string) => {
    handleTabDone(key);
    closeOverlay();
  }, [handleTabDone]);

  // ── Clic sur type de prière (mobile) ─────────────────────────────────────
  // "jour" → overlay évangile ; autres → overlay séquence

  const handleMobilePrayerSelect = (type: string) => {
    if (type === "jour") { openJourOverlay(); return; }
    openSequence(type);
  };

  return (
    <div className="spiritual-page">
      <div className="spiritual-inner">

        {/* ── SIDEBAR DESKTOP ── */}
        <aside className="side">
          <a className="brand" href="/dashboard">
            <span className="brand-mark">†</span>
            <span className="brand-name">Fraternitas</span>
          </a>
          <nav className="side-nav">
            <a className="snl" href="/dashboard">Accueil</a>
            <a className="snl" href="/dashboard/profile">Profil</a>
            <a className="snl" href="/dashboard/messages">Messages</a>
            <a className="snl" href="/dashboard/circles">Cercles</a>
            <a className="snl" href="/dashboard/events">Événements</a>
            <a className="snl active" href="/dashboard/spiritual">
              Prières
              <span style={{ fontSize:15, color:"var(--gold)", fontFamily:"var(--serif)" }}>†</span>
            </a>
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <main className="main">
          <Topbar/>

          {/* ════ MOBILE — 3 PAVÉS ════ */}
          {isMobile ? (
            <MobilePrayerLayout
              apiLoading={apiLoading}
              saint={apiData?.saint ?? { name:"—", dates:"", description:"" }}
              doneTabs={doneTabs}
              onOpenJour={openJourOverlay}
              onOpenMatin={() => openSequence("matin")}
              onOpenSoir={() => openSequence("soir")}
              onOpenInquiet={() => openSequence("inquiet")}
              onOpenMarie={() => openSequence("marie")}
              onOpenAide={openAide}
              onOpenBiblio={() => openBiblio("matin")}
              progress={rosary.progress}
              hasProgress={rosary.hasProgress}
              percent={rosary.percent}
              humanPosition={rosary.humanPosition}
              onOpenChapelet={openChapelet}
              onChangeMystery={rosary.changeMystery}
              chapeletDone={doneTabs.has("chapelet")}
              people={people}
              onOpenPeoplePage={openPersonnes}
              onOpenIntentionModal={openIntentionModal}
              onOpenIntentionsList={openIntentionsList}
            />
          ) : (
            /* ════ DESKTOP — LAYOUT EXISTANT ════ */
            <div className="content">
              <section className="dash-grid fu" style={{ animationDelay:".05s" }}>
                <HeroSection
                  onSelectTab={scrollToPriere}
                  onOpenChapelet={openChapelet}
                  onOpenIntentionModal={openIntentionModal}
                />
                <PanneauDroite
                  people={people}
                  onOpenPeoplePage={openPersonnes}
                  onOpenIntentionsList={openIntentionsList}
                  onOpenIntentionModal={openIntentionModal}
                />
              </section>

              <PrayerZone
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onOpenAide={openAide}
                onOpenSequence={openSequence}
                apiData={apiData}
                apiLoading={apiLoading}
                people={people}
                doneTabs={doneTabs}
              />

              <RosaryCard
                progress={rosary.progress}
                hasProgress={rosary.hasProgress}
                percent={rosary.percent}
                humanPosition={rosary.humanPosition}
                onOpen={openChapelet}
                onChangeMystery={rosary.changeMystery}
                isDone={doneTabs.has("chapelet")}
              />

              <Bibliotheque
                onOpenCategory={openBiblio}
                onOpenChapelet={openChapelet}
                onOpenAide={openAide}
              />
            </div>
          )}
        </main>
      </div>

      {/* ════ OVERLAYS — partagés mobile + desktop ════ */}

      {overlay?.type === "jour" && (
        <JourOverlay
          apiData={apiData}
          apiLoading={apiLoading}
          onClose={closeOverlay}
        />
      )}

      {overlay?.type === "chapelet" && (
        <ChapeletPage
          progress={rosary.progress}
          hasProgress={rosary.hasProgress}
          percent={rosary.percent}
          humanPosition={rosary.humanPosition}
          onSave={rosary.save}
          onClear={rosary.clear}
          onClose={closeOverlay}
          onCompleted={() => handleTabDone("chapelet")}
        />
      )}

      {overlay?.type === "aide" && (
        <AidePage people={people} onClose={closeOverlay}/>
      )}

      {overlay?.type === "sequence" && (
        <SequencePage
          seqKey={overlay.key}
          people={people}
          onClose={() => handleSequenceClose(overlay.key)}
        />
      )}

      {overlay?.type === "biblio" && (
        <BiblioPage categoryKey={overlay.key} onClose={closeOverlay}/>
      )}

      {overlay?.type === "intention-modal" && (
        <IntentionModal onClose={closeOverlay} onPublished={onIntentionPublished}/>
      )}

      {overlay?.type === "intentions-list" && (
        <IntentionsListPage
          onClose={closeOverlay}
          onOpenNewIntention={openIntentionModal}
          refreshKey={intentionsRefresh}
        />
      )}

      {overlay?.type === "personnes" && (
        <PersonnesPage
          people={people}
          onAdd={addPerson}
          onRemove={removePerson}
          onClose={closeOverlay}
        />
      )}
    </div>
  );
}
