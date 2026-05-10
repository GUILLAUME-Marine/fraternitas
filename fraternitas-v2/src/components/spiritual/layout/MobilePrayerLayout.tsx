"use client";
// ─── layout/MobilePrayerLayout.tsx ───────────────────────────────────────────
// Layout mobile exclusif — 3 pavés distincts :
//   1. PAVÉ PRIÈRE  — sélecteur de type de prière
//   2. PAVÉ CHAPELET — identique à RosaryCard existant (inchangé)
//   3. PAVÉ INTENTIONS — personnes à porter + intentions du cercle
//
// Ce composant n'est rendu que sur mobile (< 768px).
// Le layout desktop reste géré par page.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { MYSTERIES } from "../data";
import { type RosaryProgress } from "../hooks";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CircleIntention {
  id: string;
  text: string;
  user: { name: string } | null;
  prayCount: number;
  at: string;
}

interface MobilePrayerLayoutProps {
  // Données API
  apiLoading:   boolean;
  saint:        { name: string; dates: string; description: string };

  // Prière
  doneTabs:     Set<string>;
  onOpenJour:   () => void;
  onOpenMatin:  () => void;
  onOpenSoir:   () => void;
  onOpenInquiet:() => void;
  onOpenMarie:  () => void;
  onOpenAide:   () => void;
  onOpenBiblio: () => void;

  // Chapelet (exact RosaryCard)
  progress:        RosaryProgress;
  hasProgress:     boolean;
  percent:         number;
  humanPosition:   () => string;
  onOpenChapelet:  () => void;
  onChangeMystery: () => void;
  chapeletDone:    boolean;

  // Intentions
  people:               string[];
  onOpenPeoplePage:     () => void;
  onOpenIntentionModal: () => void;
  onOpenIntentionsList: () => void;
}

// ── Mini SVG chapelet (identique drawMiniRosary) ──────────────────────────────

function drawMiniRosary(svg: SVGSVGElement, progress: RosaryProgress) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const ns = "http://www.w3.org/2000/svg";
  const cx = 110, cy = 100, rx = 98, ry = 76;
  const startA = Math.PI / 2 + Math.PI * 0.11;
  const endA   = Math.PI / 2 - Math.PI * 0.11 + 2 * Math.PI;
  const step   = (endA - startA) / 55;

  const el = document.createElementNS(ns, "ellipse");
  el.setAttribute("cx", String(cx)); el.setAttribute("cy", String(cy));
  el.setAttribute("rx", String(rx)); el.setAttribute("ry", String(ry));
  el.setAttribute("fill", "none"); el.setAttribute("stroke", "rgba(245,239,228,.15)");
  el.setAttribute("stroke-width", "1.5");
  svg.appendChild(el);

  const current = progress.decadeIndex * 11 + (progress.grainIndex + 1);
  let idx = 0;

  for (let d = 0; d < 5; d++) {
    const a = startA + idx * step;
    const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
    const done = d * 11 < current, isCur = d * 11 === current;
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1));
    c.setAttribute("r", isCur ? "7" : "5");
    c.setAttribute("fill", done ? "#8A6A2A" : isCur ? "#C49A3C" : "rgba(245,239,228,.22)");
    svg.appendChild(c); idx++;

    for (let i = 0; i < 10; i++) {
      const a2 = startA + idx * step;
      const x2 = cx + rx * Math.cos(a2), y2 = cy + ry * Math.sin(a2);
      const gi2 = d * 11 + i + 1;
      const done2 = gi2 < current, isCur2 = gi2 === current;
      const c2 = document.createElementNS(ns, "circle");
      c2.setAttribute("cx", x2.toFixed(1)); c2.setAttribute("cy", y2.toFixed(1));
      c2.setAttribute("r", isCur2 ? "5" : "3.5");
      c2.setAttribute("fill", done2 ? "#6A4818" : isCur2 ? "#C49A3C" : "rgba(245,239,228,.18)");
      svg.appendChild(c2); idx++;
    }
  }
}

// ── Séparateur section ────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "4px 0 2px",
    }}>
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: ".16em",
        textTransform: "uppercase", color: "var(--gold)",
        whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--gold-b)" }} />
    </div>
  );
}

// ── Pavé 1 : PRIÈRE ───────────────────────────────────────────────────────────

interface PrayRowProps {
  emoji: string;
  title: string;
  sub: string;
  pill?: string;
  done?: boolean;
  dark?: boolean;
  onClick: () => void;
}

function PrayRow({ emoji, title, sub, pill, done, dark, onClick }: PrayRowProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left",
        background: dark ? "var(--dark)" : done ? "#FFFBF2" : "var(--cream3)",
        border: `1.5px solid ${dark ? "transparent" : done ? "var(--gold-b)" : "rgba(17,16,9,.08)"}`,
        borderRadius: 18, padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 14,
        cursor: "pointer",
        transition: "border-color .15s, transform .12s",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Icône */}
      <span style={{
        fontSize: 20, width: 36, textAlign: "center",
        flexShrink: 0, lineHeight: 1,
        color: dark ? "rgba(196,154,60,.85)" : "var(--ink65)",
      }}>
        {emoji}
      </span>

      {/* Corps */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "var(--serif)", fontSize: 17, fontWeight: 400,
          color: dark ? "#F5EFE4" : "var(--ink)",
          marginBottom: 2, lineHeight: 1.15,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 11, color: dark ? "rgba(245,239,228,.52)" : "var(--ink50)",
          lineHeight: 1.35,
        }}>
          {sub}
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
        {done && (
          <span style={{
            fontSize: 9, fontWeight: 700, color: "var(--gold)",
            background: "rgba(184,137,58,.12)", border: "1px solid var(--gold-b)",
            borderRadius: 99, padding: "3px 7px",
          }}>✓ Fait</span>
        )}
        {pill && (
          <span style={{
            fontSize: 9, fontWeight: 600, color: "var(--ink35)",
            background: "rgba(17,16,9,.06)", borderRadius: 99, padding: "3px 7px",
          }}>⏱ {pill}</span>
        )}
        {!dark && (
          <svg width="13" height="13" fill="none" viewBox="0 0 16 16">
            <path d="M6 4l4 4-4 4" stroke={done ? "var(--gold)" : "var(--ink35)"}
              strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </div>
    </button>
  );
}

function PavePriere({
  doneTabs, onOpenJour, onOpenMatin, onOpenSoir,
  onOpenInquiet, onOpenMarie, onOpenAide, onOpenBiblio,
}: Pick<MobilePrayerLayoutProps,
  "doneTabs"|"onOpenJour"|"onOpenMatin"|"onOpenSoir"|
  "onOpenInquiet"|"onOpenMarie"|"onOpenAide"|"onOpenBiblio"
>) {
  return (
    <div style={{
      background: "var(--paper)",
      border: "1.5px solid rgba(17,16,9,.09)",
      borderRadius: 24, overflow: "hidden",
      boxShadow: "0 4px 24px rgba(17,16,9,.06)",
    }}>
      {/* Header pavé */}
      <div style={{
        padding: "18px 18px 14px",
        borderBottom: "1px solid var(--ink12)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <p style={{
            fontSize: 9, fontWeight: 700, letterSpacing: ".14em",
            textTransform: "uppercase", color: "var(--gold)", marginBottom: 3,
          }}>
            Prière
          </p>
          <h2 style={{
            fontFamily: "var(--serif)", fontSize: 24, fontWeight: 300,
            color: "var(--ink)", letterSpacing: "-.04em", lineHeight: 1.05,
          }}>
            Comment voulez-<br/>vous prier ?
          </h2>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "var(--cream3)", border: "1px solid var(--gold-b)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--serif)", fontSize: 16, color: "var(--gold)",
          flexShrink: 0,
        }}>✦</div>
      </div>

      {/* Rows */}
      <div style={{ padding: "12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        <PrayRow emoji="☩" title="Prière du jour" sub="Évangile · Saint du jour"
          onClick={onOpenJour}/>
        <PrayRow emoji="☀" title="Matin" sub="Offrande, Angélus, signe de croix"
          pill="5 min" done={doneTabs.has("matin")} onClick={onOpenMatin}/>
        <PrayRow emoji="🌙" title="Soir" sub="Examen de conscience, Salve Regina"
          pill="5 min" done={doneTabs.has("soir")} onClick={onOpenSoir}/>
        <PrayRow emoji="🕯" title="Dans l'inquiétude" sub="Quand quelque chose pèse"
          pill="3 min" done={doneTabs.has("inquiet")} onClick={onOpenInquiet}/>
        <PrayRow emoji="☽" title="Avec Marie" sub="Ave Maria, Memorare, Salve Regina"
          pill="4 min" done={doneTabs.has("marie")} onClick={onOpenMarie}/>

        {/* Séparateur */}
        <div style={{ height: 1, background: "var(--ink12)", margin: "2px 0" }}/>

        {/* Aide à la prière — accent doré doux, pas sombre */}
        <button
          onClick={onOpenAide}
          style={{
            width: "100%", textAlign: "left",
            background: "linear-gradient(135deg, #FFF8EC, #FFF3E0)",
            border: "1.5px solid var(--gold-b)",
            borderRadius: 18, padding: "15px 16px",
            display: "flex", alignItems: "center", gap: 14,
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontSize: 20, width: 36, textAlign: "center", flexShrink: 0 }}>✝</span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "var(--serif)", fontSize: 17, fontWeight: 400,
              color: "var(--ink)", marginBottom: 2,
            }}>
              Aidez-moi à prier
            </div>
            <div style={{ fontSize: 11, color: "var(--ink50)" }}>
              Je ne sais pas comment commencer
            </div>
          </div>
          <svg width="13" height="13" fill="none" viewBox="0 0 16 16">
            <path d="M6 4l4 4-4 4" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Bibliothèque — sobre, lien texte */}
        <button
          onClick={onOpenBiblio}
          style={{
            width: "100%", background: "none", border: "none",
            padding: "10px 4px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            color: "var(--ink50)", fontSize: 12, fontWeight: 600,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontSize: 14 }}>📖</span>
          Bibliothèque de prières
          <svg width="12" height="12" fill="none" viewBox="0 0 16 16">
            <path d="M6 4l4 4-4 4" stroke="var(--ink35)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Pavé 2 : CHAPELET (identique à RosaryCard — ne rien changer) ──────────────

function PaveChapelet({
  progress, hasProgress, percent, humanPosition,
  onOpenChapelet, onChangeMystery, chapeletDone,
}: Pick<MobilePrayerLayoutProps,
  "progress"|"hasProgress"|"percent"|"humanPosition"|
  "onOpenChapelet"|"onChangeMystery"|"chapeletDone"
>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mystery = MYSTERIES[progress.mysteryType];

  useEffect(() => {
    if (svgRef.current) drawMiniRosary(svgRef.current, progress);
  }, [progress]);

  const statusText = hasProgress && percent > 0
    ? `${percent}% commencé · ${humanPosition()}`
    : `${mystery?.label ?? ""} · ${mystery?.days ?? ""}`;

  const btnLabel = hasProgress && percent > 0
    ? "Poursuivre le chapelet →"
    : "Commencer le chapelet →";

  return (
    <div style={{
      background: "linear-gradient(145deg, #2C1E08, #1A1410)",
      borderRadius: 24, padding: "22px 20px",
      position: "relative", overflow: "hidden",
      boxShadow: "0 8px 40px rgba(17,16,9,.18)",
    }}>
      {/* Déco cercles */}
      <div style={{
        position: "absolute", bottom: -50, left: -50,
        width: 200, height: 200, borderRadius: "50%",
        border: "1px solid rgba(196,154,60,.06)",
      }}/>
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 120, height: 120, borderRadius: "50%",
        border: "1px solid rgba(196,154,60,.04)",
      }}/>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Kicker */}
        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: ".14em",
          textTransform: "uppercase", color: "rgba(196,154,60,.80)", marginBottom: 4,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          Chapelet interactif
          {chapeletDone && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: "var(--gold2)",
              background: "rgba(196,154,60,.15)",
              border: "1px solid rgba(196,154,60,.30)",
              borderRadius: 99, padding: "2px 7px",
            }}>
              ✓ Fait aujourd&apos;hui
            </span>
          )}
        </p>

        {/* Titre mystère */}
        <h2 style={{
          fontFamily: "var(--serif)", fontSize: 26, fontWeight: 300,
          color: "#F5EFE4", letterSpacing: "-.04em", lineHeight: 1.05, marginBottom: 4,
        }}>
          {mystery?.label ?? "Mystères du jour"}.
        </h2>
        <p style={{
          fontSize: 12, color: "rgba(245,239,228,.50)", marginBottom: 16, lineHeight: 1.4,
        }}>
          Progression sauvegardée · reprise automatique
        </p>

        {/* Mini SVG chapelet */}
        <div style={{
          background: "rgba(255,255,255,.04)", borderRadius: 16,
          padding: "12px 8px", marginBottom: 14,
          display: "flex", justifyContent: "center",
        }}>
          <svg
            ref={svgRef}
            width="220" height="220" viewBox="0 0 220 220"
            aria-hidden="true"
            style={{ display: "block" }}
          />
        </div>

        {/* Barre progression */}
        <div style={{
          height: 5, background: "rgba(255,255,255,.10)",
          borderRadius: 99, overflow: "hidden", marginBottom: 6,
        }}>
          <div style={{
            height: "100%", width: `${hasProgress ? percent : 0}%`,
            background: "linear-gradient(90deg, var(--gold), #C49A3C)",
            borderRadius: 99, transition: "width .5s ease",
          }}/>
        </div>
        <p style={{
          fontSize: 11, color: "rgba(245,239,228,.38)", marginBottom: 16,
        }}>
          {statusText}
        </p>

        {/* Boutons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onOpenChapelet}
            style={{
              flex: 1, padding: "14px 16px", border: "none", borderRadius: 14,
              background: "linear-gradient(135deg, #C49A3C, #B8893A)",
              color: "#1A1410", fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "var(--sans)",
              boxShadow: "0 6px 20px rgba(184,137,58,.30)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {btnLabel}
          </button>
          <button
            onClick={onChangeMystery}
            style={{
              padding: "14px 14px", border: "1px solid rgba(245,239,228,.15)",
              borderRadius: 14, background: "rgba(255,255,255,.06)",
              color: "rgba(245,239,228,.65)", fontSize: 12, fontWeight: 500,
              cursor: "pointer", fontFamily: "var(--sans)", whiteSpace: "nowrap",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Changer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pavé 3 : INTENTIONS ───────────────────────────────────────────────────────

function PaveIntentions({
  people, onOpenPeoplePage, onOpenIntentionModal, onOpenIntentionsList,
}: Pick<MobilePrayerLayoutProps,
  "people"|"onOpenPeoplePage"|"onOpenIntentionModal"|"onOpenIntentionsList"
>) {
  const [intentions, setIntentions] = useState<CircleIntention[]>([]);
  const [loading, setLoading]       = useState(true);
  const [prayingId, setPrayingId]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/intentions?filter=all&page=1")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.intentions) setIntentions(d.intentions.slice(0, 4)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePray = async (id: string) => {
    setPrayingId(id);
    try {
      await fetch(`/api/intentions/${id}/pray`, { method: "POST" });
      setIntentions(prev => prev.map(i => i.id === id ? { ...i, prayCount: i.prayCount + 1 } : i));
    } catch { /* silencieux */ }
    finally { setPrayingId(null); }
  };

  return (
    <div style={{
      background: "var(--paper)",
      border: "1.5px solid rgba(17,16,9,.09)",
      borderRadius: 24, overflow: "hidden",
      boxShadow: "0 4px 24px rgba(17,16,9,.06)",
    }}>
      {/* Header */}
      <div style={{
        padding: "18px 18px 14px",
        borderBottom: "1px solid var(--ink12)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <p style={{
            fontSize: 9, fontWeight: 700, letterSpacing: ".14em",
            textTransform: "uppercase", color: "var(--gold)", marginBottom: 3,
          }}>
            Cercle de prière
          </p>
          <h2 style={{
            fontFamily: "var(--serif)", fontSize: 24, fontWeight: 300,
            color: "var(--ink)", letterSpacing: "-.04em", lineHeight: 1.05,
          }}>
            Porter ensemble.
          </h2>
        </div>
        <button
          onClick={onOpenIntentionModal}
          style={{
            fontSize: 12, fontWeight: 600, color: "var(--gold)",
            background: "rgba(184,137,58,.10)", border: "1.5px solid var(--gold-b)",
            borderRadius: 99, padding: "8px 14px", cursor: "pointer",
            fontFamily: "var(--sans)", flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          + Partager
        </button>
      </div>

      <div style={{ padding: "14px 14px" }}>

        {/* Personnes à porter — compact */}
        <div style={{
          background: "var(--cream3)", border: "1.5px solid var(--gold-b)",
          borderRadius: 16, padding: "12px 14px", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(184,137,58,.12)", border: "1px solid var(--gold-b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--serif)", fontSize: 14, color: "var(--gold)", flexShrink: 0,
          }}>♦</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "var(--serif)", fontSize: 16, fontWeight: 400,
              color: "var(--ink)", marginBottom: people.length > 0 ? 4 : 0,
            }}>
              {people.length > 0
                ? `${people.length} personne${people.length > 1 ? "s" : ""} portée${people.length > 1 ? "s" : ""}`
                : "Aucune personne ajoutée"}
            </div>
            {people.length > 0 && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {people.slice(0, 4).map((p, i) => (
                  <span key={i} style={{
                    fontSize: 10, background: "rgba(184,137,58,.10)",
                    border: "1px solid var(--gold-b)", borderRadius: 99,
                    padding: "2px 7px", color: "var(--ink65)",
                  }}>{p}</span>
                ))}
                {people.length > 4 && (
                  <span style={{ fontSize: 10, color: "var(--ink35)" }}>
                    +{people.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onOpenPeoplePage}
            style={{
              fontSize: 11, fontWeight: 600, color: "var(--gold)",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "var(--sans)", flexShrink: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {people.length > 0 ? "Gérer →" : "Ajouter →"}
          </button>
        </div>

        {/* Label intentions */}
        <p style={{
          fontSize: 9, fontWeight: 700, letterSpacing: ".14em",
          textTransform: "uppercase", color: "var(--gold)", marginBottom: 10,
        }}>
          Intentions du cercle
        </p>

        {/* Feed intentions */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 64, borderRadius: 14, background: "rgba(17,16,9,.05)",
                animation: "skelPulse 1.8s ease-in-out infinite",
              }}/>
            ))}
          </div>
        ) : intentions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <p style={{ fontSize: 13, color: "var(--ink35)", marginBottom: 12, lineHeight: 1.55 }}>
              Personne n&apos;a encore partagé d&apos;intention.
            </p>
            <button
              onClick={onOpenIntentionModal}
              style={{
                background: "var(--cream3)", border: "1.5px solid var(--gold-b)",
                borderRadius: 99, padding: "10px 18px",
                fontSize: 13, fontWeight: 600, color: "var(--ink)",
                cursor: "pointer", fontFamily: "var(--sans)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Partager la première intention →
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              {intentions.map(intent => (
                <div key={intent.id} style={{
                  background: "var(--cream3)",
                  border: "1px solid rgba(17,16,9,.08)",
                  borderRadius: 16, padding: "12px 14px",
                }}>
                  <p style={{
                    fontFamily: "var(--serif)", fontSize: 14, fontStyle: "italic",
                    color: "var(--ink80)", lineHeight: 1.5, marginBottom: 8,
                  }}>
                    « {intent.text} »
                  </p>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: 10, color: "var(--ink35)" }}>
                      {intent.user?.name ?? "Anonyme"}
                    </span>
                    <button
                      onClick={() => handlePray(intent.id)}
                      disabled={prayingId === intent.id}
                      style={{
                        fontSize: 12, fontWeight: 600, color: "var(--gold)",
                        background: "rgba(184,137,58,.08)",
                        border: "1px solid var(--gold-b)",
                        borderRadius: 99, padding: "5px 10px",
                        cursor: "pointer", fontFamily: "var(--sans)",
                        opacity: prayingId === intent.id ? 0.5 : 1,
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      🙏 {intent.prayCount > 0 ? intent.prayCount : ""} Je prie
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={onOpenIntentionsList}
              style={{
                width: "100%", textAlign: "center",
                fontSize: 12, fontWeight: 600, color: "var(--ink50)",
                background: "none", border: "1px solid var(--ink12)",
                borderRadius: 99, padding: "11px",
                cursor: "pointer", fontFamily: "var(--sans)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Voir toutes les intentions →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Layout principal ──────────────────────────────────────────────────────────

export default function MobilePrayerLayout({
  apiLoading, saint,
  doneTabs, onOpenJour, onOpenMatin, onOpenSoir,
  onOpenInquiet, onOpenMarie, onOpenAide, onOpenBiblio,
  progress, hasProgress, percent, humanPosition,
  onOpenChapelet, onChangeMystery, chapeletDone,
  people, onOpenPeoplePage, onOpenIntentionModal, onOpenIntentionsList,
}: MobilePrayerLayoutProps) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 10,
      padding: "14px 14px",
      paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
    }}>

      {/* ── HERO STRIP ── */}
      <div style={{
        background: "linear-gradient(145deg, #2C1E08, #1A1410)",
        borderRadius: 22, padding: "18px 20px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 140, height: 140, borderRadius: "50%",
          border: "1px solid rgba(196,154,60,.07)",
        }}/>
        <blockquote style={{
          fontFamily: "var(--serif)", fontSize: 15, fontStyle: "italic",
          color: "rgba(255,248,234,.88)", lineHeight: 1.6,
          borderLeft: "2px solid rgba(196,154,60,.70)",
          paddingLeft: 14, margin: "0 0 16px", position: "relative", zIndex: 1,
        }}>
          « Là où deux ou trois sont réunis en mon nom, je suis là, au milieu d&apos;eux. »
          <small style={{
            display: "block", marginTop: 4,
            fontFamily: "var(--sans)", fontSize: 9, fontStyle: "normal",
            fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase",
            color: "rgba(196,154,60,.85)",
          }}>
            Matthieu 18, 20
          </small>
        </blockquote>

        {/* 3 boutons de navigation rapide */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7,
          position: "relative", zIndex: 1,
        }}>
          {[
            { label: "Prière", icon: "✦", id: "mob-priere" },
            { label: "Chapelet", icon: "†", id: "mob-chapelet" },
            { label: "Intentions", icon: "🙏", id: "mob-intentions" },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => {
                document.getElementById(btn.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={{
                background: "rgba(255,255,255,.07)",
                border: "1px solid rgba(245,239,228,.12)",
                borderRadius: 14, padding: "11px 8px",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 4,
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{
                fontSize: 18, lineHeight: 1,
                fontFamily: btn.icon === "†" ? "var(--serif)" : "inherit",
                color: "rgba(196,154,60,.90)",
              }}>
                {btn.icon}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: "rgba(245,239,228,.78)", letterSpacing: ".01em",
              }}>
                {btn.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── PAVÉ 1 : PRIÈRE ── */}
      <div id="mob-priere">
        <SectionLabel label="Prière"/>
      </div>
      <PavePriere
        doneTabs={doneTabs}
        onOpenJour={onOpenJour}
        onOpenMatin={onOpenMatin}
        onOpenSoir={onOpenSoir}
        onOpenInquiet={onOpenInquiet}
        onOpenMarie={onOpenMarie}
        onOpenAide={onOpenAide}
        onOpenBiblio={onOpenBiblio}
      />

      {/* ── PAVÉ 2 : CHAPELET ── */}
      <div id="mob-chapelet" style={{ paddingTop: 4 }}>
        <SectionLabel label="Chapelet"/>
      </div>
      <PaveChapelet
        progress={progress}
        hasProgress={hasProgress}
        percent={percent}
        humanPosition={humanPosition}
        onOpenChapelet={onOpenChapelet}
        onChangeMystery={onChangeMystery}
        chapeletDone={chapeletDone}
      />

      {/* ── PAVÉ 3 : INTENTIONS ── */}
      <div id="mob-intentions" style={{ paddingTop: 4 }}>
        <SectionLabel label="Intentions &amp; prière"/>
      </div>
      <PaveIntentions
        people={people}
        onOpenPeoplePage={onOpenPeoplePage}
        onOpenIntentionModal={onOpenIntentionModal}
        onOpenIntentionsList={onOpenIntentionsList}
      />

    </div>
  );
}
