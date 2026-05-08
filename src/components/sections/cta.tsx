"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-32 px-6 bg-[#0D0C08] relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(184,151,58,0.12)_0%,transparent_70%)]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-2xl mx-auto text-center"
      >
        <div className="inline-flex items-center gap-3 text-[#D4AF5A] text-xs font-semibold uppercase tracking-[0.14em] mb-6 font-body">
          Rejoindre
        </div>
        <h2 className="font-display font-light text-[clamp(36px,5vw,68px)] text-[#F7F3EC] mb-6">
          Votre communauté
          <br />
          vous <em className="italic text-[#D4AF5A]">attend</em>
        </h2>
        <p className="text-lg font-light text-[rgba(247,243,236,0.6)] mb-12 font-body leading-relaxed">
          Plus de 8 400 catholiques pratiquants ont déjà rejoint Fraternitas
          dans 40 villes. Trouvez votre cercle dès aujourd'hui.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="gold" size="xl" asChild>
            <Link href="/auth/register">Rejoindre gratuitement →</Link>
          </Button>
          <Button variant="ghost-light" size="xl" asChild>
            <Link href="/auth/login">Se connecter</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-[rgba(247,243,236,0.25)] font-body">
          Gratuit pour commencer. Aucune carte de crédit requise.
        </p>
      </motion.div>
    </section>
  );
}
