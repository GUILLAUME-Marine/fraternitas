"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
   NAV MOBILE — hamburger + menu overlay
   Import dans page.tsx : import { NavMobile } from "@/components/landing/nav-mobile"
───────────────────────────────────────────────────────────── */
export function NavMobile() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  /* Fermer sur Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  /* Bloquer le scroll body quand menu ouvert */
  useEffect(() => {
    document.body.classList.toggle("lp-menu-open", open);
    return () => document.body.classList.remove("lp-menu-open");
  }, [open]);

  return (
    <>
      {/* Hamburger button */}
      <button
        className="lp-nav-toggle"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          style={{
            transform: open ? "translateY(7px) rotate(45deg)" : undefined,
          }}
        />
        <span
          style={{
            opacity: open ? 0 : undefined,
            transform: open ? "scaleX(0)" : undefined,
          }}
        />
        <span
          style={{
            transform: open ? "translateY(-7px) rotate(-45deg)" : undefined,
          }}
        />
      </button>

      {/* Menu overlay */}
      {open && (
        <nav className="lp-mobile-menu" aria-label="Menu principal mobile">
          <a href="#communaute" onClick={close} className="lp-mobile-link">
            La communauté
          </a>
          <a href="#rencontre" onClick={close} className="lp-mobile-link">
            Rencontre
          </a>
          <a href="#priere" onClick={close} className="lp-mobile-link">
            Prière
          </a>
          <a href="#faq" onClick={close} className="lp-mobile-link">
            FAQ
          </a>
          <div className="lp-mobile-sep" />
          <Link href="/auth/login" onClick={close} className="lp-mobile-link">
            Se connecter
          </Link>
          <Link
            href="/auth/register"
            onClick={close}
            className="lp-btn lp-btn-gold lp-mobile-link"
          >
            Rejoindre la bêta →
          </Link>
        </nav>
      )}

      {/* Styles Client-only du hamburger + menu overlay */}
      <style>{`
        .lp-nav-toggle {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 44px; height: 44px;
          border-radius: 12px;
          background: rgba(17,16,11,.06);
          border: none; cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .lp-nav-toggle span {
          display: block; width: 22px; height: 2px;
          background: var(--lp-ink, #11100b);
          border-radius: 999px;
          transition: transform .26s cubic-bezier(.2,.8,.2,1), opacity .26s;
        }
        body.lp-menu-open { overflow: hidden; }

        .lp-mobile-menu {
          position: fixed; inset: 0; z-index: 70;
          background: rgba(243,238,230,.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 8px;
          padding: calc(var(--lp-nav-h, 64px) + 20px) 24px calc(40px + env(safe-area-inset-bottom));
          font-family: var(--lp-sans, 'DM Sans', sans-serif);
        }
        .lp-mobile-link {
          display: flex; align-items: center; justify-content: center;
          width: 100%; max-width: 360px; min-height: 56px;
          border-radius: 16px; padding: 0 24px;
          font-weight: 700; font-size: 17px;
          color: rgba(17,16,11,.65) !important;
          border: 1px solid rgba(17,16,11,.11);
          background: rgba(255,255,255,.6);
          text-decoration: none;
          transition: background .15s, color .15s;
          -webkit-tap-highlight-color: transparent;
        }
        .lp-mobile-link:hover,
        .lp-mobile-link:active { background: rgba(255,255,255,.9); color: #11100b !important; }
        .lp-mobile-link.lp-btn-gold {
          background: linear-gradient(180deg, #dfb652 0%, #bd8c2d 100%) !important;
          color: #17120a !important;
          border-color: transparent !important;
          font-size: 16px; min-height: 58px;
        }
        .lp-mobile-sep {
          width: 100%; max-width: 360px;
          height: 1px; background: rgba(17,16,11,.11);
          margin: 6px 0;
        }

        @media (max-width: 768px) {
          .lp-nav-toggle { display: flex; }
        }
      `}</style>

      {/* Scroll reveal — monté une seule fois côté client */}
      <ScrollReveal />

      {/* Nav scroll shadow */}
      <NavScrollShadow />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCROLL REVEAL — IntersectionObserver
───────────────────────────────────────────────────────────── */
function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".lp-reveal");
    if (!els.length) return;

    // Respecter prefers-reduced-motion
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      els.forEach((el) => el.classList.add("lp-visible"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("lp-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px -28px 0px" }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return null;
}

/* ─────────────────────────────────────────────────────────────
   NAV SCROLL SHADOW
───────────────────────────────────────────────────────────── */
function NavScrollShadow() {
  useEffect(() => {
    const nav = document.getElementById("lpNavShell");
    if (!nav) return;

    const handler = () => {
      nav.classList.toggle("scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return null;
}
