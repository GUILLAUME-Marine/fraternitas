"use client";
// ─── src/app/dashboard/spiritual/page.tsx ────────────────────────────────────
// VERSION 2 — tous les correctifs appliqués :
//  1. Sidebar propre (layout.tsx masque l'ancienne sur /spiritual)
//  2. "Aide à la prière" supprimée de la sidebar
//  3. MobileBar spécifique supprimée
//  4. Tab "Prière du jour" → scroll correct
//  5. TabJour : pas de citation, titre évangile propre
//  6. En-tête inutile supprimé
//  7. Duplication header séquences corrigée
//  8. Coches "fait aujourd'hui" (localStorage + reset J+1)
//  9. "Masquer" chapelet persiste entre les grains
// 10. Hero compact
// 11. CSS mobile optimisé
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import "@/components/spiritual/spiritual.css";

import Topbar        from "@/components/spiritual/layout/Topbar";
import HeroSection   from "@/components/spiritual/layout/HeroSection";
import SaintStrip    from "@/components/spiritual/layout/SaintStrip";
import RosaryCard    from "@/components/spiritual/layout/RosaryCard";
import PrayerZone    from "@/components/spiritual/tabs/PrayerZone";
import PanneauDroite from "@/components/spiritual/panels/PanneauDroite";
import Bibliotheque  from "@/components/spiritual/panels/Bibliotheque";

import ChapeletPage       from "@/components/spiritual/pages/ChapeletPage";
import AidePage           from "@/components/spiritual/pages/AidePage";
import SequencePage       from "@/components/spiritual/pages/SequencePage";
import BiblioPage         from "@/components/spiritual/pages/BiblioPage";
import IntentionModal     from "@/components/spiritual/pages/IntentionModal";
import IntentionsListPage from "@/components/spiritual/pages/IntentionsListPage";
import PersonnesPage      from "@/components/spiritual/pages/PersonnesPage";

import { useRosary, usePeople } from "@/components/spiritual/hooks";

type PrayTab = "jour" | "matin" | "soir" | "inquiet" | "marie";

interface ApiData {
  gospel: {
    reference: string; title: string; intro: string;
    text: string; aelfUrl: string;
  } | null;
  saint: { name: string; dates: string; description: string };
  quote: { text: string; author: string };
}

// ── Coches "fait aujourd'hui" ─────────────────────────────────────────────────
function todayKey(tab: string): string {
  const d = new Date().toISOString().slice(0, 10);
  return `fraternitas_done_${d}_${tab}`;
}
function isDone(tab: string): boolean {
  try { return localStorage.getItem(todayKey(tab)) === "1"; } catch { return false; }
}
function markDone(tab: string): void {
  try { localStorage.setItem(todayKey(tab), "1"); } catch { /* silencieux */ }
}

// ═════════════════════════════════════════════════════════════════════════════

export default function SpiritualPage() {
  const [userId, setUserId]         = useState("");
  const [apiData, setApiData]       = useState<ApiData | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [activeTab, setActiveTab]   = useState<PrayTab>("jour");
  const [doneTabs, setDoneTabs]     = useState<Set<string>>(new Set());
  const [intentionsRefresh, setIntentionsRefresh] = useState(0);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.ok ? r.json() : null)
      .then(s => { if (s?.user?.id) setUserId(s.user.id); })
      .catch(() => {});
  }, []);

  const loadApi = useCallback(async () => {
    setApiLoading(true);
    try {
      const r = await fetch("/api/spiritual");
      if (r.ok) setApiData(await r.json());
    } catch { /* silencieux */ }
    finally { setApiLoading(false); }
  }, []);

  useEffect(() => { loadApi(); }, [loadApi]);

  // Charger les coches du jour
  useEffect(() => {
    const done = new Set<string>();
    ["matin", "soir", "inquiet", "marie", "chapelet"].forEach(t => {
      if (isDone(t)) done.add(t);
    });
    setDoneTabs(done);
  }, []);

  const handleTabDone = useCallback((tab: string) => {
    markDone(tab);
    setDoneTabs(prev => new Set([...prev, tab]));
  }, []);

  const rosary = useRosary();
  const { people, add: addPerson, remove: removePerson } = usePeople(userId);

  type Overlay =
    | { type: "chapelet" }
    | { type: "aide" }
    | { type: "sequence"; key: string }
    | { type: "biblio"; key: string }
    | { type: "intention-modal" }
    | { type: "intentions-list" }
    | { type: "personnes" }
    | null;

  const [overlay, setOverlay] = useState<Overlay>(null);

  const openChapelet       = () => setOverlay({ type: "chapelet" });
  const openAide           = () => setOverlay({ type: "aide" });
  const openSequence       = (key: string) => setOverlay({ type: "sequence", key });
  const openBiblio         = (key: string) => setOverlay({ type: "biblio", key });
  const openIntentionModal = () => setOverlay({ type: "intention-modal" });
  const openIntentionsList = () => setOverlay({ type: "intentions-list" });
  const openPersonnes      = () => setOverlay({ type: "personnes" });
  const closeOverlay       = () => setOverlay(null);

  // Fix #4 : scroll vers #priere avec délai pour laisser React re-render
  const scrollToPriere = useCallback((tab: PrayTab) => {
    setActiveTab(tab);
    setTimeout(() => {
      document.getElementById("priere")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  const onIntentionPublished = () => {
    setIntentionsRefresh(k => k + 1);
    closeOverlay();
  };

  const handleSequenceClose = useCallback((key: string) => {
    handleTabDone(key);
    closeOverlay();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleTabDone]);

  return (
    <div className="spiritual-page">
      <div className="spiritual-inner">

        {/* ── Sidebar desktop ── */}
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
              <span style={{ fontSize: 15, color: "var(--gold)", fontFamily: "var(--serif)" }}>†</span>
            </a>
          </nav>
          {/* Fix #2 : "Aide à la prière" supprimée */}
        </aside>

        <main className="main">
          <Topbar />
          <div className="content">

            <section className="dash-grid fu" style={{ animationDelay: ".05s" }}>
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

            <SaintStrip
              name={apiData?.saint?.name ?? "—"}
              dates={apiData?.saint?.dates ?? ""}
              description={apiData?.saint?.description ?? ""}
              loading={apiLoading}
            />

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
          {/* Fix #3 : plus de mobilebar spécifique ici */}
        </main>
      </div>

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
        <AidePage people={people} onClose={closeOverlay} />
      )}
      {overlay?.type === "sequence" && (
        <SequencePage
          seqKey={overlay.key}
          people={people}
          onClose={() => handleSequenceClose(overlay.key)}
        />
      )}
      {overlay?.type === "biblio" && (
        <BiblioPage categoryKey={overlay.key} onClose={closeOverlay} />
      )}
      {overlay?.type === "intention-modal" && (
        <IntentionModal onClose={closeOverlay} onPublished={onIntentionPublished} />
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
