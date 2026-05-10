"use client";
// ─── tabs/TabJour.tsx ─────────────────────────────────────────────────────────
// Onglet "Prière du jour" — reproduit exactement renderJourTab() du HTML.
// Données : saint + évangile via /api/spiritual (pas le tableau statique).
// Citation : extraite de l'évangile par l'API si disponible, fallback QUOTES[].
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
  quote:    { text: string; author: string };
  saint:    { name: string; dates: string; description: string };
  loading?: boolean;
}

function Skeleton({ w, h = "13px" }: { w: string; h?: string }) {
  return (
    <div
      className="skel"
      style={{ width: w, height: h, borderRadius: 6, background: "rgba(17,16,9,.09)", flexShrink: 0 }}
    />
  );
}

export default function TabJour({ gospel, quote, saint, loading }: TabJourProps) {
  const [restOpen, setRestOpen] = useState(false);

  return (
    <div className="prayer-body">
      <div className="jour-panel">

        {/* ── Citation du jour ── */}
        <div className="citation-block">
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Skeleton w="90%" h="15px" />
              <Skeleton w="70%" h="15px" />
              <Skeleton w="40%" h="11px" />
            </div>
          ) : (
            <>
              <p>{quote.text}</p>
              <cite>— {quote.author}</cite>
            </>
          )}
        </div>

        {/* ── Évangile du jour ── */}
        <div className="gospel-block">
          <div className="gospel-bh">
            {loading ? (
              <>
                <Skeleton w="200px" h="18px" />
                <Skeleton w="80px" h="12px" />
              </>
            ) : (
              <>
                <h3>{gospel ? gospel.title : "Évangile du jour"}</h3>
                {gospel?.ref && <span className="gospel-ref">{gospel.ref}</span>}
              </>
            )}
          </div>

          <div className="gospel-bb">
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <Skeleton w="100%" /><Skeleton w="88%" /><Skeleton w="95%" />
                <Skeleton w="70%" /><Skeleton w="80%" />
              </div>
            ) : gospel ? (
              <div className="gospel-text">
                <span style={{ display: "block" }}>
                  {gospel.preview.split("\n").map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </span>
                {gospel.rest && (
                  <span
                    className={`gospel-rest${restOpen ? " open" : ""}`}
                    style={restOpen ? {} : { display: "none" }}
                  >
                    {gospel.rest.split("\n").map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))}
                  </span>
                )}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--ink35)", lineHeight: 1.6 }}>
                L&apos;évangile n&apos;a pas pu être chargé. Consultez{" "}
                <a href="https://www.aelf.org" target="_blank" rel="noopener" style={{ color: "var(--gold)" }}>
                  AELF.org →
                </a>
              </p>
            )}
          </div>

          {/* ── Footer évangile ── */}
          <div className="gospel-bf">
            <a
              href={gospel?.url ?? "https://www.aelf.org"}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source : AELF →
            </a>
            {gospel?.rest && (
              <button
                className={`rbtn${restOpen ? " open" : ""}`}
                onClick={() => setRestOpen(v => !v)}
              >
                {restOpen ? "Fermer " : "Lire la suite "}
                <svg width="12" height="12" fill="none" viewBox="0 0 16 16">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Saint du jour ── */}
      {!loading && (
        <div className="prayer-saint-card">
          <div className="psi">✦</div>
          <div>
            <small>Saint du jour</small>
            <strong>
              {saint.name}
              {saint.dates ? ` · ${saint.dates}` : ""}
            </strong>
            <p>{saint.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
