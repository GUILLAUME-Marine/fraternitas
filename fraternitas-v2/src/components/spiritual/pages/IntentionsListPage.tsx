"use client";
// ─── pages/IntentionsListPage.tsx ─────────────────────────────────────────────
// Page intentions du cercle — reproduit exactement intent-list-page du HTML.
// Chargée depuis /api/intentions (Prisma). Édition / suppression.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { fmtShortDate } from "../data";

interface CircleIntention {
  id: string; text: string; at: string;
  user: { name: string } | null; prayCount: number;
}

interface IntentionsListPageProps {
  onClose:           () => void;
  onOpenNewIntention:() => void;
  refreshKey?:       number; // incrémenter pour forcer le rechargement
}

export default function IntentionsListPage({
  onClose, onOpenNewIntention, refreshKey = 0,
}: IntentionsListPageProps) {
  const [items, setItems]     = useState<CircleIntention[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId]   = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/intentions?filter=all&page=1")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.intentions) setItems(data.intentions); })
      .catch(() => { /* silencieux */ })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const saveEdit = async (id: string) => {
    const v = editVal.trim(); if (!v) return;
    try {
      await fetch(`/api/intentions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: v }),
      });
      setItems(prev => prev.map(i => i.id === id ? { ...i, text: v } : i));
      setEditId(null);
    } catch { /* silencieux */ }
  };

  const deleteItem = async (id: string) => {
    try {
      await fetch(`/api/intentions/${id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { /* silencieux */ }
  };

  return (
    <div className="intent-list-page visible" id="intent-list-page">
      <header className="chap-hdr">
        <button className="chap-back" onClick={onClose}>
          <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Retour
        </button>
        <span className="chap-hdr-title">Intentions de prière</span>
        <div style={{ width: 60 }} />
      </header>

      <div className="intent-list-inner">
        <section className="intent-list-hero">
          <p className="pk">Intentions du cercle</p>
          <h2>Porter les intentions ensemble.</h2>
          <p>
            Les intentions restent dans une page dédiée pour garder l&apos;accueil lisible,
            même si la liste devient longue.
          </p>
        </section>

        <section className="intent-list-card">
          <div className="intent-list-feed">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ height: 80, borderRadius: 14, background: "rgba(17,16,9,.06)" }} />
              ))
            ) : items.length === 0 ? (
              <div className="intent-list-empty">Aucune intention partagée pour le moment.</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="intent-edit-item">
                  <div className="intent-edit-top">
                    <span className="intent-edit-date">
                      {item.user?.name ?? "Anonyme"} · {fmtShortDate(item.at)}
                    </span>
                    <span className="intent-edit-actions">
                      <button onClick={() => { setEditId(item.id); setEditVal(item.text); }}>
                        Modifier
                      </button>
                      <button onClick={() => deleteItem(item.id)}>Supprimer</button>
                    </span>
                  </div>
                  {editId === item.id ? (
                    <>
                      <textarea
                        className="intent-edit-text"
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                      />
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          className="intent-edit-actions"
                          style={{ fontSize: 12, cursor: "pointer" }}
                          onClick={() => saveEdit(item.id)}
                        >
                          Enregistrer
                        </button>
                        <button
                          style={{ fontSize: 12, color: "var(--ink35)", background: "none", border: "none", cursor: "pointer" }}
                          onClick={() => setEditId(null)}
                        >
                          Annuler
                        </button>
                      </div>
                    </>
                  ) : (
                    <textarea
                      className="intent-edit-text"
                      defaultValue={item.text}
                      readOnly
                    />
                  )}
                </div>
              ))
            )}
          </div>

          <button className="btn-gold" onClick={onOpenNewIntention}>
            Partager une intention →
          </button>
        </section>
      </div>
    </div>
  );
}
