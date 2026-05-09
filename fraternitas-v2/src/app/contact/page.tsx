"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1.5px solid rgba(17,16,9,0.12)",
    background: "#FFFFFF",
    color: "#111009",
    fontSize: "14px",
    fontWeight: 300,
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  };

  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#111009", borderBottom: "1px solid rgba(247,243,236,0.06)" }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12.5" stroke="#C49A3C" strokeWidth="1" />
              <line x1="14" y1="4.5" x2="14" y2="23.5" stroke="#C49A3C" strokeWidth="1.3" />
              <line x1="8.5" y1="11" x2="19.5" y2="11" stroke="#C49A3C" strokeWidth="1.3" />
            </svg>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "17px", color: "rgba(247,243,236,0.8)" }}>
              Fraternitas
            </span>
          </Link>
          <Link href="/" className="text-xs font-medium transition-opacity hover:opacity-60" style={{ color: "rgba(247,243,236,0.4)" }}>
            ← Retour à l&rsquo;accueil
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* Gauche — infos */}
          <div>
            <p className="text-xs font-medium tracking-widest uppercase mb-6" style={{ color: "rgba(196,154,60,0.7)" }}>
              Nous écrire
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(30px,4.5vw,50px)", fontWeight: 400,
              color: "#111009", lineHeight: 1.12, marginBottom: "1.5rem",
            }}>
              Une question ?<br />
              <em className="italic" style={{ color: "#C49A3C" }}>On vous répond.</em>
            </h1>
            <p className="font-light text-sm leading-relaxed mb-10" style={{ color: "rgba(17,16,9,0.58)" }}>
              Que ce soit pour un bug, une suggestion, une question sur la communauté
              ou simplement pour nous dire bonjour — écrivez-nous. Nous lisons chaque
              message et répondons dans les 48h.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(196,154,60,0.1)", border: "1px solid rgba(196,154,60,0.2)" }}>
                  <span style={{ color: "#C49A3C", fontSize: "14px" }}>✉</span>
                </div>
                <div>
                  <p className="font-medium text-sm mb-0.5" style={{ color: "#111009" }}>Email</p>
                  <a href="mailto:contact@fraternitas.app" className="text-sm font-light transition-opacity hover:opacity-70"
                    style={{ color: "#C49A3C" }}>
                    contact@fraternitas.app
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(196,154,60,0.1)", border: "1px solid rgba(196,154,60,0.2)" }}>
                  <span style={{ color: "#C49A3C", fontSize: "14px" }}>◎</span>
                </div>
                <div>
                  <p className="font-medium text-sm mb-0.5" style={{ color: "#111009" }}>Délai de réponse</p>
                  <p className="text-sm font-light" style={{ color: "rgba(17,16,9,0.55)" }}>
                    Nous répondons sous 24 à 48 heures.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(196,154,60,0.1)", border: "1px solid rgba(196,154,60,0.2)" }}>
                  <span style={{ color: "#C49A3C", fontSize: "14px" }}>✦</span>
                </div>
                <div>
                  <p className="font-medium text-sm mb-0.5" style={{ color: "#111009" }}>Signaler un problème</p>
                  <p className="text-sm font-light" style={{ color: "rgba(17,16,9,0.55)" }}>
                    Un bug, un contenu inapproprié, un problème de sécurité — merci de nous le signaler.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Droite — formulaire */}
          <div>
            {status === "success" ? (
              <div className="rounded-2xl p-10 text-center"
                style={{ background: "#FFFFFF", border: "1.5px solid rgba(17,16,9,0.08)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(196,154,60,0.1)" }}>
                  <span style={{ color: "#C49A3C", fontSize: "20px" }}>✓</span>
                </div>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond',Georgia,serif",
                  fontSize: "24px", fontWeight: 400, color: "#111009", marginBottom: "0.75rem",
                }}>
                  Message envoyé
                </h2>
                <p className="font-light text-sm leading-relaxed mb-6" style={{ color: "rgba(17,16,9,0.55)" }}>
                  Merci de nous avoir écrit. Nous vous répondrons dans les 48 heures.
                </p>
                <button onClick={() => setStatus("idle")}
                  className="text-sm font-medium px-5 py-2.5 rounded-full transition-all hover:bg-black/5"
                  style={{ border: "1.5px solid rgba(17,16,9,0.12)", color: "#111009" }}>
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl p-8"
                style={{ background: "#FFFFFF", border: "1.5px solid rgba(17,16,9,0.08)", boxShadow: "0 4px 40px rgba(17,16,9,0.04)" }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(17,16,9,0.6)" }}>
                        Prénom *
                      </label>
                      <input
                        type="text" required placeholder="Marie"
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "#C49A3C")}
                        onBlur={e => (e.target.style.borderColor = "rgba(17,16,9,0.12)")}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(17,16,9,0.6)" }}>
                        Email *
                      </label>
                      <input
                        type="email" required placeholder="marie@email.fr"
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "#C49A3C")}
                        onBlur={e => (e.target.style.borderColor = "rgba(17,16,9,0.12)")}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(17,16,9,0.6)" }}>
                      Sujet
                    </label>
                    <select
                      value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="">Choisir un sujet…</option>
                      <option value="question">Question générale</option>
                      <option value="bug">Signaler un bug</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="account">Problème de compte</option>
                      <option value="report">Signaler un contenu</option>
                      <option value="partnership">Partenariat</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(17,16,9,0.6)" }}>
                      Message *
                    </label>
                    <textarea
                      required rows={5} placeholder="Votre message…"
                      value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      style={{ ...inputStyle, resize: "none" }}
                      onFocus={e => (e.target.style.borderColor = "#C49A3C")}
                      onBlur={e => (e.target.style.borderColor = "rgba(17,16,9,0.12)")}
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-xs font-medium text-center" style={{ color: "#C0392B" }}>
                      Une erreur est survenue. Écrivez-nous directement à contact@fraternitas.app
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3.5 rounded-full font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: "#111009", color: "#F7F3EC" }}>
                    {status === "loading" ? "Envoi en cours…" : "Envoyer le message →"}
                  </button>

                  <p className="text-xs text-center font-light" style={{ color: "rgba(17,16,9,0.35)" }}>
                    Vos données ne sont utilisées qu&rsquo;pour vous répondre.
                  </p>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Footer minimal */}
      <div className="py-8 px-6 border-t" style={{ borderColor: "rgba(17,16,9,0.08)" }}>
        <div className="max-w-5xl mx-auto flex flex-wrap gap-5">
          {[{ label: "Mentions légales", href: "/legal" }, { label: "CGU", href: "/terms" }, { label: "Confidentialité", href: "/privacy" }, { label: "Contact", href: "/contact" }].map(link => (
            <Link key={link.href} href={link.href} className="text-xs font-light transition-opacity hover:opacity-60" style={{ color: "rgba(17,16,9,0.4)" }}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
