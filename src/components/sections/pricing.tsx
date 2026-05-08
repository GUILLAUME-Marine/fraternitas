"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Gratuit",
    tagline: "Pour découvrir la communauté",
    price: "0",
    featured: false,
    features: [
      "Profil de valeurs complet",
      "Accès aux cercles locaux publics",
      "3 événements par mois",
      "Contenu spirituel de base",
      "Messagerie communautaire",
    ],
    cta: "Commencer gratuitement",
    href: "/auth/register",
  },
  {
    name: "Premium",
    tagline: "Pour une vie communautaire complète",
    price: "12",
    featured: true,
    badge: "✦ Recommandé",
    features: [
      "Tout le plan Gratuit",
      "Événements & retraites illimités",
      "Matching affinitaire avancé",
      "Réseau professionnel catholique",
      "Mentorat & accompagnement",
      "Contenu spirituel personnalisé IA",
      "Priorité sur les événements premium",
    ],
    cta: "Rejoindre Premium →",
    href: "/auth/register",
  },
];

export function PricingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="tarifs" className="py-32 px-6 bg-white" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 text-[#B8973A] text-xs font-semibold uppercase tracking-[0.14em] mb-4 font-body">
            Tarifs
          </div>
          <h2 className="font-display font-light text-[clamp(36px,5vw,64px)] text-[#111009] mb-4">
            Simple et <em className="italic text-[#B8973A]">transparent</em>
          </h2>
          <p className="text-lg font-light text-[rgba(17,16,9,0.65)] font-body">
            Commencez gratuitement. Passez Premium quand vous êtes prêt.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-3xl p-12 border transition-all duration-250 hover:shadow-2xl ${
                plan.featured
                  ? "bg-[#111009] border-[#111009] scale-[1.02] shadow-xl"
                  : "bg-[#F7F3EC] border-[rgba(17,16,9,0.12)]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF5A] to-[#B8973A] text-white text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full whitespace-nowrap font-body">
                  {plan.badge}
                </div>
              )}
              <p className={`font-display text-2xl font-medium mb-1.5 ${plan.featured ? "text-[#F7F3EC]" : "text-[#111009]"}`}>
                {plan.name}
              </p>
              <p className={`text-sm font-light mb-8 font-body ${plan.featured ? "text-[rgba(247,243,236,0.5)]" : "text-[rgba(17,16,9,0.45)]"}`}>
                {plan.tagline}
              </p>
              <div className="flex items-baseline gap-1.5 mb-10">
                <span className={`font-display text-6xl font-light tracking-tight ${plan.featured ? "text-[#F7F3EC]" : "text-[#111009]"}`}>
                  {plan.price}€
                </span>
                <span className={`text-sm font-body font-light ${plan.featured ? "text-[rgba(247,243,236,0.45)]" : "text-[rgba(17,16,9,0.45)]"}`}>
                  /mois
                </span>
              </div>
              <ul className="space-y-3.5 mb-10">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.featured ? "bg-[rgba(212,175,90,0.2)]" : "bg-[rgba(184,151,58,0.12)]"}`}>
                      <Check size={11} className={plan.featured ? "text-[#D4AF5A]" : "text-[#B8973A]"} />
                    </span>
                    <span className={`text-sm font-body font-light leading-snug ${plan.featured ? "text-[rgba(247,243,236,0.75)]" : "text-[rgba(17,16,9,0.7)]"}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.featured ? "gold" : "ghost"}
                size="lg"
                className="w-full"
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
