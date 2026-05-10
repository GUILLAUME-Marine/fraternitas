"use client";
// ─── layout/RosaryCard.tsx v2 ─────────────────────────────────────────────────
// Fix #8 : affiche une coche dorée si chapelet fait aujourd'hui
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { MYSTERIES } from "../data";
import { type RosaryProgress } from "../hooks";

interface RosaryCardProps {
  progress:        RosaryProgress;
  hasProgress:     boolean;
  percent:         number;
  humanPosition:   () => string;
  onOpen:          () => void;
  onChangeMystery: () => void;
  isDone?:         boolean;
}

function drawMiniRosary(svg: SVGSVGElement, progress: RosaryProgress) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const ns = "http://www.w3.org/2000/svg";
  const cx = 110, cy = 100, rx = 98, ry = 76;
  const gapA   = Math.PI * 0.11;
  const startA = Math.PI / 2 + gapA;
  const endA   = Math.PI / 2 - gapA + 2 * Math.PI;
  const step   = (endA - startA) / 55;

  const ellipse = document.createElementNS(ns, "ellipse");
  ellipse.setAttribute("cx", String(cx)); ellipse.setAttribute("cy", String(cy));
  ellipse.setAttribute("rx", String(rx)); ellipse.setAttribute("ry", String(ry));
  ellipse.setAttribute("fill", "none"); ellipse.setAttribute("stroke", "rgba(245,239,228,.15)");
  ellipse.setAttribute("stroke-width", "1.5");
  svg.appendChild(ellipse);

  const current = progress.decadeIndex * 11 + (progress.grainIndex + 1);
  let idx = 0;

  for (let d = 0; d < 5; d++) {
    const a = startA + idx * step;
    const x = cx + rx * Math.cos(a);
    const y = cy + ry * Math.sin(a);
    const done = d * 11 < current, isCur = d * 11 === current;
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1));
    c.setAttribute("r", isCur ? "7" : "5");
    c.setAttribute("fill", done ? "#8A6A2A" : isCur ? "#C49A3C" : "rgba(245,239,228,.22)");
    svg.appendChild(c);
    idx++;

    for (let i = 0; i < 10; i++) {
      const a2 = startA + idx * step;
      const x2 = cx + rx * Math.cos(a2);
      const y2 = cy + ry * Math.sin(a2);
      const gi2 = d * 11 + i + 1;
      const done2 = gi2 < current, isCur2 = gi2 === current;
      const c2 = document.createElementNS(ns, "circle");
      c2.setAttribute("cx", x2.toFixed(1)); c2.setAttribute("cy", y2.toFixed(1));
      c2.setAttribute("r", isCur2 ? "5" : "3.5");
      c2.setAttribute("fill", done2 ? "#6A4818" : isCur2 ? "#C49A3C" : "rgba(245,239,228,.18)");
      svg.appendChild(c2);
      idx++;
    }
  }
}

export default function RosaryCard({
  progress, hasProgress, percent, humanPosition, onOpen, onChangeMystery, isDone,
}: RosaryCardProps) {
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
    <section id="chapelet-card" className="rosary-card fu" style={{ animationDelay: ".28s" }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        <p className="rc-k">
          Chapelet interactif
          {/* Fix #8 : coche si fait aujourd'hui */}
          {isDone && (
            <span style={{
              marginLeft: 8, fontSize: 11, fontWeight: 700,
              color: "var(--gold2)", background: "rgba(196,154,60,.15)",
              border: "1px solid rgba(196,154,60,.30)",
              borderRadius: 99, padding: "2px 8px",
            }}>
              ✓ Fait aujourd&apos;hui
            </span>
          )}
        </p>
        <h2 className="rc-title">{mystery?.label ?? "Mystères du jour"}.</h2>
        <p className="rc-desc">
          Progression sauvegardée, méditation courte, reprise automatique.
        </p>

        <div className="rc-prog">
          <div className="rc-bar" style={{ width: `${hasProgress ? percent : 0}%` }} />
        </div>
        <p className="rc-status">{statusText}</p>

        <div className="rc-actions">
          <button className="btn-gold" onClick={onOpen}>{btnLabel}</button>
          <button
            className="btn-sec"
            style={{ color: "rgba(245,239,228,.55)", width: "auto", padding: 0 }}
            onClick={onChangeMystery}
          >
            Changer de mystère
          </button>
        </div>
      </div>

      <div className="rosary-visual-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg ref={svgRef} id="rosary-mini-svg" width="220" height="220" viewBox="0 0 220 220" aria-hidden="true" />
      </div>
    </section>
  );
}
