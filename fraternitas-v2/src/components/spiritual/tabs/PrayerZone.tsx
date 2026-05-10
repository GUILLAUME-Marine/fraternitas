"use client";
// ─── tabs/PrayerZone.tsx ──────────────────────────────────────────────────────
// Zone de prière complète — reproduit exactement la section #priere du HTML :
//   - Colonne gauche : prayer-tabs (5 onglets + aide-tab)
//   - Colonne droite : prayer-display (injecté selon l'onglet)
// Chaque onglet affiche soit TabJour soit un aperçu de séquence.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import TabJour from "./TabJour";
import { SEQUENCES, getTodayQuote, stripHtml } from "../data";

type TabKey = "jour" | "matin" | "soir" | "inquiet" | "marie";

interface SpiritualApiData {
  gospel: {
    reference: string; title: string; intro: string;
    text: string; aelfUrl: string;
  } | null;
  saint: { name: string; dates: string; description: string };
  quote: { text: string; author: string };
}

interface PrayerZoneProps {
  activeTab:           TabKey;
  onTabChange:         (t: TabKey) => void;
  onOpenAide:          () => void;
  onOpenSequence:      (key: string) => void;
  apiData:             SpiritualApiData | null;
  apiLoading:          boolean;
  people:              string[];
}

// ── Aperçu séquence (renderSequenceTab du HTML) ───────────────────────────────

function SequencePreview({
  tabKey, people, onStart,
}: {
  tabKey: string; people: string[]; onStart: () => void;
}) {
  const seq = SEQUENCES[tabKey];
  if (!seq) return null;

  const peopleBlock = people.length > 0 ? (
    <div style={{
      background: "#FFF8EA", border: "1px solid var(--gold-b)",
      borderRadius: 14, padding: "12px 15px", marginBottom: 14,
    }}>
      <strong style={{
        display: "block", fontSize: 10, fontWeight: 700,
        letterSpacing: ".11em", textTransform: "uppercase",
        color: "var(--gold)", marginBottom: 4,
      }}>
        À porter aujourd&apos;hui
      </strong>
      <p style={{
        fontFamily: "var(--serif)", fontStyle: "italic",
        fontSize: 16, color: "var(--ink80)", lineHeight: 1.45,
      }}>
        {people.join(" · ")}
      </p>
    </div>
  ) : null;

  return (
    <div className="prayer-body">
      <div className="prayer-head" style={{ padding: 0, border: "none", marginBottom: 16 }}>
        <p className="prayer-k">{seq.kicker}</p>
        <h2 style={{
          fontFamily: "var(--serif)", fontSize: 28, fontWeight: 300,
          color: "var(--ink)", letterSpacing: "-.03em", marginBottom: 5, lineHeight: 1.1,
        }}>
          {seq.title}
        </h2>
        <p className="prayer-desc">{seq.desc}</p>
      </div>
      {peopleBlock}
      <button
        className="btn-dark"
        onClick={onStart}
        style={{ width: "100%", justifyContent: "center", padding: "14px 18px", fontSize: 15 }}
      >
        Commencer →
      </button>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function PrayerZone({
  activeTab, onTabChange, onOpenAide, onOpenSequence,
  apiData, apiLoading, people,
}: PrayerZoneProps) {

  const [displayKey, setDisplayKey] = useState(0);

  useEffect(() => {
    setDisplayKey(k => k + 1);
  }, [activeTab]);

  // Transformer les données API en format attendu par TabJour
  const gospel = apiData?.gospel ? {
    title:   apiData.gospel.title || apiData.gospel.intro || "Évangile du jour",
    ref:     apiData.gospel.reference,
    preview: (() => {
      const lines = stripHtml(apiData.gospel!.text).split("\n").filter(Boolean);
      return lines.slice(0, 5).join("\n");
    })(),
    rest: (() => {
      const lines = stripHtml(apiData.gospel!.text).split("\n").filter(Boolean);
      return lines.slice(5).join("\n");
    })(),
    url: apiData.gospel.aelfUrl,
  } : null;

  const quote  = apiData?.quote  ?? getTodayQuote();
  const saint  = apiData?.saint  ?? { name: "—", dates: "", description: "" };

  const TABS: { key: TabKey; label: string; sub: string; pill?: string }[] = [
    { key: "jour",    label: "Prière du jour",   sub: "Évangile, saint & citation." },
    { key: "matin",   label: "Matin",            sub: "Séquence complète.",        pill: "5 min" },
    { key: "soir",    label: "Soir",             sub: "Examen de conscience.",     pill: "5 min" },
    { key: "inquiet", label: "Dans l'inquiétude",sub: "Quand quelque chose pèse.", pill: "3 min" },
    { key: "marie",   label: "Avec Marie",       sub: "Ave Maria, Memorare.",      pill: "4 min" },
  ];

  return (
    <section id="priere" className="prayer-zone fu" style={{ animationDelay: ".22s" }}>
      {/* Colonne gauche : onglets */}
      <div className="prayer-tabs" role="tablist">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`ptab${activeTab === t.key ? " active" : ""}`}
            onClick={() => onTabChange(t.key)}
            role="tab"
            aria-selected={activeTab === t.key}
          >
            <strong>
              {t.label}{" "}
              {t.pill && <em className="time-pill">⏱ {t.pill}</em>}
            </strong>
            <span>{t.sub}</span>
          </button>
        ))}

        {/* Onglet aide — stylé différemment (fond sombre) */}
        <button className="ptab aide-tab" onClick={onOpenAide}>
          <strong>Aide à la prière</strong>
          <span>Question / réponse pour commencer.</span>
        </button>
      </div>

      {/* Colonne droite : affichage */}
      <div className="prayer-display">
        <div
          key={displayKey}
          id="pdisplay"
          className="pdisplay-content"
        >
          {/* En-tête commun */}
          <div className="prayer-head">
            {activeTab === "jour" ? (
              <>
                <p className="prayer-k">Aujourd&apos;hui · Évangile, saint &amp; citation</p>
                <h2 style={{
                  fontFamily: "var(--serif)", fontSize: 28, fontWeight: 300,
                  color: "var(--ink)", letterSpacing: "-.03em", marginBottom: 4, lineHeight: 1.1,
                }}>
                  Ce que l&apos;Église donne aujourd&apos;hui.
                </h2>
                <p className="prayer-desc">
                  L&apos;évangile du jour, le saint et une citation pour nourrir votre journée.
                </p>
              </>
            ) : (
              <>
                <p className="prayer-k">{SEQUENCES[activeTab]?.kicker}</p>
                <h2 style={{
                  fontFamily: "var(--serif)", fontSize: 28, fontWeight: 300,
                  color: "var(--ink)", letterSpacing: "-.03em", marginBottom: 5, lineHeight: 1.1,
                }}>
                  {SEQUENCES[activeTab]?.title}
                </h2>
                <p className="prayer-desc">{SEQUENCES[activeTab]?.desc}</p>
              </>
            )}
          </div>

          {/* Contenu selon l'onglet */}
          {activeTab === "jour" ? (
            <TabJour gospel={gospel} quote={quote} saint={saint} loading={apiLoading} />
          ) : (
            <SequencePreview
              tabKey={activeTab}
              people={people}
              onStart={() => onOpenSequence(activeTab)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
