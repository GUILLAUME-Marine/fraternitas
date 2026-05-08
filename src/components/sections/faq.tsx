"use client";
import { useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Fraternitas est-il réservé aux catholiques pratiquants ?",
    a: "Fraternitas accueille tous les catholiques, quelle que soit l'intensité de leur pratique. Que vous soyez pratiquant régulier, en chemin ou simplement en recherche, vous avez votre place dans notre communauté.",
  },
  {
    q: "Est-ce une application de rencontre ?",
    a: "Non. Fraternitas est une plateforme communautaire axée sur l'amitié, la fraternité et l'entraide. L'objectif principal est de créer des liens authentiques, des groupes locaux et des événements — pas du dating.",
  },
  {
    q: "Comment fonctionne le matching ?",
    a: "Notre algorithme analyse votre profil de valeurs (foi, intérêts, projets, localisation) pour vous suggérer des membres compatibles et des cercles adaptés à votre situation. Plus votre profil est complet, plus les suggestions sont pertinentes.",
  },
  {
    q: "Puis-je créer mon propre cercle local ?",
    a: "Absolument ! Tout membre Premium peut créer un cercle dans sa ville, y inviter des membres, organiser des événements et gérer les discussions. C'est souvent la meilleure façon de dynamiser une communauté locale.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Vos données sont hébergées en Europe, chiffrées, et ne sont jamais revendues à des tiers. Votre profil n'est visible que par les autres membres de la communauté. Vous pouvez supprimer votre compte à tout moment.",
  },
  {
    q: "Comment annuler mon abonnement Premium ?",
    a: "Vous pouvez annuler votre abonnement à tout moment depuis les paramètres de votre compte, sans pénalité. Vous continuerez à bénéficier du Premium jusqu'à la fin de la période payée.",
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="border-b border-[rgba(17,16,9,0.10)] last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="text-base font-display font-medium text-[#111009] group-hover:text-[#B8973A] transition-colors">
          {q}
        </span>
        <span className="flex-shrink-0 w-7 h-7 rounded-full border border-[rgba(17,16,9,0.15)] flex items-center justify-center text-[rgba(17,16,9,0.5)] group-hover:border-[#B8973A] group-hover:text-[#B8973A] transition-all">
          {open ? <Minus size={13} /> : <Plus size={13} />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-[rgba(17,16,9,0.65)] leading-relaxed font-body font-light">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FaqSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="faq" className="py-32 px-6 bg-[#F7F3EC]" ref={ref}>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 text-[#B8973A] text-xs font-semibold uppercase tracking-[0.14em] mb-4 font-body">
            FAQ
          </div>
          <h2 className="font-display font-light text-[clamp(36px,5vw,60px)] text-[#111009]">
            Questions <em className="italic text-[#B8973A]">fréquentes</em>
          </h2>
        </motion.div>

        <div className={`transition-opacity duration-700 ${inView ? "opacity-100" : "opacity-0"}`}>
          {faqs.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
