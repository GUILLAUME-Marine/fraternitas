"use client";
// ─── src/app/dashboard/spiritual/page.tsx ────────────────────────────────────
// Page principale prière/spiritualité — orchestre tous les composants.
// Reproduit fidèlement fraternitas-v3-consolidated.html dans Next.js.
//
// Fichiers requis :
//   - src/components/spiritual/spiritual.css
//   - src/components/spiritual/data.ts
//   - src/components/spiritual/hooks.ts
//   - src/components/spiritual/layout/Topbar.tsx
//   - src/components/spiritual/layout/HeroSection.tsx
//   - src/components/spiritual/layout/SaintStrip.tsx
//   - src/components/spiritual/layout/RosaryCard.tsx
//   - src/components/spiritual/tabs/PrayerZone.tsx
//   - src/components/spiritual/panels/PanneauDroite.tsx
//   - src/components/spiritual/panels/Bibliotheque.tsx
//   - src/components/spiritual/pages/ChapeletPage.tsx
//   - src/components/spiritual/pages/AidePage.tsx
//   - src/components/spiritual/pages/SequencePage.tsx
//   - src/components/spiritual/pages/BiblioPage.tsx
//   - src/components/spiritual/pages/IntentionModal.tsx
//   - src/components/spiritual/pages/IntentionsListPage.tsx
//   - src/components/spiritual/pages/PersonnesPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import "@/components/spiritual/spiritual.css";

// ── Layout ────────────────────────────────────────────────────────────────────
import Topbar       from "@/components/spiritual/layout/Topbar";
import HeroSection  from "@/components/spiritual/layout/HeroSection";
import SaintStrip   from "@/components/spiritual/layout/SaintStrip";
import RosaryCard   from "@/components/spiritual/layout/RosaryCard";

// ── Tabs + Panels ─────────────────────────────────────────────────────────────
import PrayerZone   from "@/components/spiritual/tabs/PrayerZone";
import PanneauDroite from "@/components/spiritual/panels/PanneauDroite";
import Bibliotheque  from "@/components/spiritual/panels/Bibliotheque";

// ── Pages plein écran ─────────────────────────────────────────────────────────
import ChapeletPage      from "@/components/spiritual/pages/ChapeletPage";
import AidePage          from "@/components/spiritual/pages/AidePage";
import SequencePage      from "@/components/spiritual/pages/SequencePage";
import BiblioPage        from "@/components/spiritual/pages/BiblioPage";
import IntentionModal    from "@/components/spiritual/pages/IntentionModal";
import IntentionsListPage from "@/components/spiritual/pages/IntentionsListPage";
import PersonnesPage     from "@/components/spiritual/pages/PersonnesPage";

// ── Hooks ────────────────────────────────────────────────────────────────────
import { useRosary, usePeople } from "@/components/spiritual/hooks";

// ── Types ────────────────────────────────────────────────────────────────────
type PrayTab = "jour" | "matin" | "soir" | "inquiet" | "marie";

interface ApiData {
  gospel: {
    reference: string; title: string; intro: string;
    text: string; aelfUrl: string;
  } | null;
  saint: { name: string; dates: string; description: string };
  quote: { text: string; author: string };
}

// ═════════════════════════════════════════════════════════════════════════════
//   PAGE PRINCIPALE
// ═════════════════════════════════════════════════════════════════════════════

export default function SpiritualPage() {
  // ── Session utilisateur ───────────────────────────────────────────────────
  const [userId, setUserId]       = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.ok ? r.json() : null)
      .then(s => { if (s?.user?.id) setUserId(s.user.id); })
      .catch(() => { /* silencieux */ });
  }, []);

  // ── API spirituelle ───────────────────────────────────────────────────────
  const [apiData, setApiData]     = useState<ApiData | null>(null);
  const [apiLoading, setApiLoading] = useState(true);

  const loadApi = useCallback(async () => {
    setApiLoading(true);
    try {
      const r = await fetch("/api/spiritual");
      if (r.ok) setApiData(await r.json());
    } catch { /* silencieux */ }
    finally { setApiLoading(false); }
  }, []);

  useEffect(() => { loadApi(); }, [loadApi]);

  // ── Chapelet ──────────────────────────────────────────────────────────────
  const rosary = useRosary();

  // ── Personnes ─────────────────────────────────────────────────────────────
  const { people, add: addPerson, remove: removePerson } = usePeople(userId);

  // ── Onglet actif ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<PrayTab>("jour");

  // ── Overlays ouverts (une seule à la fois) ────────────────────────────────
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
  const [intentionsRefresh, setIntentionsRefresh] = useState(0);

  const openChapelet       = () => setOverlay({ type: "chapelet" });
  const openAide           = () => setOverlay({ type: "aide" });
  const openSequence       = (key: string) => setOverlay({ type: "sequence", key });
  const openBiblio         = (key: string) => setOverlay({ type: "biblio", key });
  const openIntentionModal = () => setOverlay({ type: "intention-modal" });
  const openIntentionsList = () => setOverlay({ type: "intentions-list" });
  const openPersonnes      = () => setOverlay({ type: "personnes" });
  const closeOverlay       = () => setOverlay(null);

  const onIntentionPublished = () => {
    setIntentionsRefresh(k => k + 1);
    closeOverlay();
  };

  // ── Scrolling vers #priere ────────────────────────────────────────────────
  const scrollToPriere = (tab: PrayTab) => {
    setActiveTab(tab);
    document.getElementById("priere")?.scrollIntoView({ behavior: "smooth" });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="spiritual-page">
      <div className="spiritual-inner">

        {/* ── Sidebar (desktop uniquement) ── */}
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
              Prière
              <span style={{ fontSize: 15, color: "var(--gold)", fontFamily: "var(--serif)" }}>†</span>
            </a>
          </nav>
          <div className="side-pause">
            <p>Aide à la prière</p>
            <small>Je ne sais pas comment prier. Guidez-moi.</small>
            <button className="btn-gold" onClick={openAide}>Me guider →</button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main">
          <Topbar />

          <div className="content">

            {/* Dashboard grid : Hero + Panneau droite */}
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

            {/* Saint du jour */}
            <SaintStrip
              name={apiData?.saint?.name ?? "—"}
              dates={apiData?.saint?.dates ?? ""}
              description={apiData?.saint?.description ?? ""}
              loading={apiLoading}
            />

            {/* Zone de prière */}
            <PrayerZone
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onOpenAide={openAide}
              onOpenSequence={openSequence}
              apiData={apiData}
              apiLoading={apiLoading}
              people={people}
            />

            {/* Carte chapelet */}
            <RosaryCard
              progress={rosary.progress}
              hasProgress={rosary.hasProgress}
              percent={rosary.percent}
              humanPosition={rosary.humanPosition}
              onOpen={openChapelet}
              onChangeMystery={rosary.changeMystery}
            />

            {/* Bibliothèque */}
            <Bibliotheque
              onOpenCategory={openBiblio}
              onOpenChapelet={openChapelet}
              onOpenAide={openAide}
            />

          </div>

          {/* Mobile nav */}
          <div className="mobilebar">
            <nav>
              <a href="/dashboard">Accueil</a>
              <a href="#priere" onClick={() => setActiveTab("jour")}>Évangile</a>
              <a href="#chapelet-card" onClick={openChapelet}>Chapelet</a>
              <a href="#" onClick={e => { e.preventDefault(); openIntentionsList(); }}>Intentions</a>
            </nav>
          </div>

        </main>
      </div>

      {/* ═══ PAGES PLEIN ÉCRAN ═══ */}

      {overlay?.type === "chapelet" && (
        <ChapeletPage
          progress={rosary.progress}
          hasProgress={rosary.hasProgress}
          percent={rosary.percent}
          humanPosition={rosary.humanPosition}
          onSave={rosary.save}
          onClear={rosary.clear}
          onClose={closeOverlay}
        />
      )}

      {overlay?.type === "aide" && (
        <AidePage people={people} onClose={closeOverlay} />
      )}

      {overlay?.type === "sequence" && (
        <SequencePage
          seqKey={overlay.key}
          people={people}
          onClose={closeOverlay}
        />
      )}

      {overlay?.type === "biblio" && (
        <BiblioPage
          categoryKey={overlay.key}
          onClose={closeOverlay}
        />
      )}

      {overlay?.type === "intention-modal" && (
        <IntentionModal
          onClose={closeOverlay}
          onPublished={onIntentionPublished}
        />
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
