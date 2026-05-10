"use client";
// ─── layout/Topbar.tsx ────────────────────────────────────────────────────────
// Reproduit exactement la topbar du HTML :
//   <small id="tb-greeting">Bonjour</small>
//   <strong id="tb-date">—</strong>
//   <div id="tb-liturgy">—</div>
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { getGreeting, formatDate, getLiturgicalLabel } from "../data";

export default function Topbar() {
  const [greeting, setGreeting]   = useState("Bonjour");
  const [date, setDate]           = useState("—");
  const [liturgy, setLiturgy]     = useState("—");

  useEffect(() => {
    setGreeting(getGreeting());
    setDate(formatDate());
    setLiturgy(getLiturgicalLabel());
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <small>{greeting}</small>
        <strong>{date}</strong>
      </div>
      <div className="topbar-right">{liturgy}</div>
    </header>
  );
}
