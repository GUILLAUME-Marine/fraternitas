"use client";
// ─── tabs/PrayerZone.tsx v2 ───────────────────────────────────────────────────
// Fix #4 : activeTab reflété immédiatement visuellement
// Fix #5 : TabJour sans bloc citation, juste titre évangile + texte + lire la suite
// Fix #6 : en-tête "Ce que l'Église donne aujourd'hui" → titre de l'évangile
// Fix #7 : header pas dupliqué — PrayerZone ne rend plus l'en-tête pour les séquences
// Fix #8 : coches ✓ sur les onglets qui ont été faits aujourd'hui
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import TabJour from "./TabJour";
import { SEQUENCES, stripHtml } from "../data";

type TabKey = "jour" | "matin" | "soir" | "inquiet" | "marie";

interface ApiData {
  gospel: {
    reference: string; title: string; intro: string;
    text: string; aelfUrl: string;
  } | null;
  saint: { name: string; dates: string; description: string };
  quote: { text: string; author: string };
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

// ── Helper : extraire le nom de l'évangéliste ─────────────────────────────────
function getEvangelist(intro: string): string {
  const m = intro?.match(/selon\s+saint\s+([A-Za-z\u00C0-\u017E]+)/i);
  if (m) return `Évangile selon saint ${m[1]}`;
  const m2 = intro?.match(/selon\s+([A-Za-z\u00C0-\u017E\s]+)/i);
  if (m2) return `Évangile selon ${m2[1].trim()}`;
  return "Évangile du jour";
}

// ── Aperçu séquence — Fix #7 : header géré ici, pas dupliqué ─────────────────
function SequencePreview({
  tabKey, people, onStart,
}: { tabKey: string; people: string[]; onStart: () => void; }) {
  const seq = SEQUENCES[tabKey];
  if (!seq) return null;

  return (
    <div className="prayer-body">
      {/* Fix #7 : pas de prayer-head ici, PrayerZone le gère déjà */}
      {people.length > 0 && (
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
      )}
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
  apiData, apiLoading, people, doneTabs,
}: PrayerZoneProps) {

  const [displayKey, setDisplayKey] = useState(0);

  useEffect(() => {
    setDisplayKey(k => k + 1);
  }, [activeTab]);

  // Fix #5 : transformer les données API → format TabJour (sans citation)
  const gospel = apiData?.gospel ? {
    title:   getEvangelist(apiData.gospel.intro),
    ref:     apiData.gospel.reference,
    preview: (() => {
      const lines = stripHtml(apiData.gospel!.text).split("\n").filter(Boolean);
      return lines.slice(0, 3).join("\n"); // 3 lignes seulement
    })(),
    rest: (() => {
      const lines = stripHtml(apiData.gospel!.text).split("\n").filter(Boolean);
      return lines.slice(3).join("\n");
    })(),
    url: apiData.gospel.aelfUrl,
  } : null;

  const saint = apiData?.saint ?? { name: "—", dates: "", description: "" };

  const TABS: { key: TabKey; label: string; sub: string; pill?: string }[] = [
    { key: "jour",    label: "Prière du jour",    sub: "Évangile, saint & citation." },
    { key: "matin",   label: "Matin",             sub: "Séquence complète.",          pill: "5 min" },
    { key: "soir",    label: "Soir",              sub: "Examen de conscience.",        pill: "5 min" },
    { key: "inquiet", label: "Dans l'inquiétude", sub: "Quand quelque chose pèse.",   pill: "3 min" },
    { key: "marie",   label: "Avec Marie",        sub: "Ave Maria, Memorare.",         pill: "4 min" },
  ];

  // Fix #6 : titre de l'onglet "jour" = titre de l'évangile, pas le texte générique
  const jourTitle = gospel?.title ?? "Évangile du jour";

  return (
    <section id="priere" className="prayer-zone fu" style={{ animationDelay: ".22s" }}>

      {/* Onglets */}
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
              {/* Fix #8 : coche si fait aujourd'hui */}
              {t.key !== "jour" && doneTabs.has(t.key) && (
                <span style={{
                  display: "inline-block", marginRight: 5,
                  color: "var(--gold)", fontSize: 11,
                }}>✓</span>
              )}
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

          {/* Fix #6 : en-tête : titre évangile pour "jour", kicker séquence pour les autres */}
          <div className="prayer-head">
            {activeTab === "jour" ? (
              <>
                {/* Fix #6 : juste le titre de l'évangile — pas le texte générique */}
                {apiLoading ? (
                  <div style={{ height: 28, width: "60%", borderRadius: 6, background: "rgba(17,16,9,.09)" }} />
                ) : (
                  <h2 style={{
                    fontFamily: "var(--serif)", fontSize: 28, fontWeight: 300,
                    color: "var(--ink)", letterSpacing: "-.03em", lineHeight: 1.1,
                  }}>
                    {jourTitle}
                  </h2>
                )}
              </>
            ) : (
              /* Fix #7 : pour les séquences, on affiche le kicker + titre une seule fois ici */
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

          {/* Contenu */}
          {activeTab === "jour" ? (
            /* Fix #5 : TabJour sans citation, juste évangile propre */
            <TabJour
              gospel={gospel}
              saint={saint}
              loading={apiLoading}
            />
          ) : (
            /* Fix #7 : SequencePreview sans son propre header */
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
