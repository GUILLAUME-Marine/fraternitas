"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#temoignages", label: "Témoignages" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F7F3EC]/90 backdrop-blur-xl border-b border-[rgba(17,16,9,0.12)] shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" aria-label="Fraternitas">
          <Logo variant="dark" size="md" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[rgba(17,16,9,0.65)] hover:text-[#111009] transition-colors font-body"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Se connecter</Link>
          </Button>
          <Button variant="gold" size="sm" asChild>
            <Link href="/auth/register">Rejoindre →</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[rgba(17,16,9,0.06)] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-[#F7F3EC]/98 backdrop-blur-xl border-b border-[rgba(17,16,9,0.12)] px-6 pb-6"
          >
            <nav className="flex flex-col gap-1 pt-2 mb-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="py-3 text-sm text-[rgba(17,16,9,0.7)] hover:text-[#111009] transition-colors font-body border-b border-[rgba(17,16,9,0.06)] last:border-0"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="default" className="w-full" asChild>
                <Link href="/auth/login">Se connecter</Link>
              </Button>
              <Button variant="gold" size="default" className="w-full" asChild>
                <Link href="/auth/register">Rejoindre gratuitement</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
