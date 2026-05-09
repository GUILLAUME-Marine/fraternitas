"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";

const PLANS = [
  {
    name: "Gratuit",
    price: { monthly: "0€", annual: "0€" },
    desc: "Pour découvrir Fraternitas",
    color: "bg-white border-[rgba(17,16,9,0.12)]",
    cta: "Votre plan actuel",
    ctaStyle: "bg-[#F7F3EC] text-[rgba(17,16,9,0.65)] cursor-default",
    features: [
      "3 profils visibles par jour",
      "5 messages par jour",
      "1 cercle local",
      "5 événements visibles",
      "1 inscription à un événement/mois",
      "Contenu spirituel quotidien complet",
      "Profil basique",
    ],
    notIncluded: [
      "Profils illimités",
      "Messages illimités",
      "Cercles illimités",
      "Badge Premium",
      "Mode voyage avancé",
      "Priorité dans les recherches",
    ],
  },
  {
    name: "Premium",
    price: { monthly: "9,99€", annual: "89€" },
    desc: "Pour vivre pleinement Fraternitas",
    color: "bg-[#111009] border-[#111009]",
    cta: "Commencer Premium",
    ctaStyle: "bg-gradient-to-br from-[#D4AF5A] to-[#B8973A] text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#B8973A]/30",
    badge: "⭐ Recommandé",
    features: [
      "Profils illimités",
      "Messages illimités",
      "Cercles illimités",
      "Tous les événements visibles",
      "Inscriptions illimitées aux événements",
      "Badge Premium sur votre profil",
      "Priorité dans les recherches",
      "Mode voyage avancé",
      "Statistiques de profil",
      "Filtres avancés",
      "Contenu spirituel complet",
      "Support prioritaire",
    ],
    notIncluded: [],
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    // Stripe Checkout — à connecter
    alert("Paiement Stripe à configurer. Ajoutez STRIPE_SECRET_KEY dans vos variables d'environnement Netlify.");
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[rgba(184,151,58,0.1)] border border-[rgba(184,151,58,0.2)] rounded-full px-4 py-1.5 mb-6">
          <span className="text-sm font-semibold text-[#B8973A]">✦ Fraternitas Premium</span>
        </div>
        <h1 className="font-display font-light text-4xl text-[#111009] mb-4">
          Vivez pleinement<br />votre communauté
        </h1>
        <p className="text-[rgba(17,16,9,0.55)] max-w-md mx-auto leading-relaxed">
          Passez Premium pour rencontrer plus de catholiques, rejoindre plus de cercles et participer à tous les événements.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <button onClick={() => setBilling("monthly")}
          className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${billing === "monthly" ? "bg-[#111009] text-white" : "text-[rgba(17,16,9,0.55)]"}`}>
          Mensuel
        </button>
        <button onClick={() => setBilling("annual")}
          className={`relative text-sm font-medium px-4 py-2 rounded-xl transition-all ${billing === "annual" ? "bg-[#111009] text-white" : "text-[rgba(17,16,9,0.55)]"}`}>
          Annuel
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">-25%</span>
        </button>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {PLANS.map((plan, i) => (
          <motion.div key={plan.name}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-3xl border p-8 ${plan.color} relative`}>
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF5A] to-[#B8973A] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                {plan.badge}
              </div>
            )}

            <div className="mb-6">
              <h2 className={`font-display text-2xl font-medium mb-1 ${plan.name === "Premium" ? "text-[#F7F3EC]" : "text-[#111009]"}`}>
                {plan.name}
              </h2>
              <p className={`text-sm mb-4 ${plan.name === "Premium" ? "text-[rgba(247,243,236,0.55)]" : "text-[rgba(17,16,9,0.5)]"}`}>
                {plan.desc}
              </p>
              <div className="flex items-end gap-2">
                <span className={`font-display text-5xl font-light ${plan.name === "Premium" ? "text-[#F7F3EC]" : "text-[#111009]"}`}>
                  {billing === "monthly" ? plan.price.monthly : plan.price.annual}
                </span>
                {plan.name === "Premium" && (
                  <span className={`text-sm mb-2 ${plan.name === "Premium" ? "text-[rgba(247,243,236,0.45)]" : "text-[rgba(17,16,9,0.45)]"}`}>
                    /{billing === "monthly" ? "mois" : "an"}
                  </span>
                )}
              </div>
              {billing === "annual" && plan.name === "Premium" && (
                <p className="text-xs text-[#D4AF5A] mt-1">Économisez 30,88€ par rapport au mensuel</p>
              )}
            </div>

            <button
              onClick={plan.name === "Premium" ? handleUpgrade : undefined}
              disabled={loading || plan.name === "Gratuit"}
              className={`w-full py-3.5 rounded-2xl text-sm font-medium transition-all mb-6 ${plan.ctaStyle} disabled:opacity-60`}>
              {loading && plan.name === "Premium" ? "Redirection…" : plan.cta}
            </button>

            <div className="space-y-2.5">
              {plan.features.map((f, j) => (
                <div key={j} className="flex items-start gap-2.5">
                  <Check size={14} className={`flex-shrink-0 mt-0.5 ${plan.name === "Premium" ? "text-[#D4AF5A]" : "text-[#B8973A]"}`} />
                  <span className={`text-sm ${plan.name === "Premium" ? "text-[rgba(247,243,236,0.8)]" : "text-[rgba(17,16,9,0.7)]"}`}>
                    {f}
                  </span>
                </div>
              ))}
              {plan.notIncluded.map((f, j) => (
                <div key={j} className="flex items-start gap-2.5 opacity-30">
                  <span className="text-sm text-[rgba(17,16,9,0.4)] mt-0.5">✕</span>
                  <span className="text-sm text-[rgba(17,16,9,0.5)] line-through">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Micro-transactions événements */}
      <div className="bg-white rounded-3xl border border-[rgba(17,16,9,0.08)] p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#F0E3C0] flex items-center justify-center text-xl">🗓️</div>
          <div>
            <h3 className="font-display text-xl font-medium text-[#111009]">Événements payants</h3>
            <p className="text-sm text-[rgba(17,16,9,0.5)]">Participez à des événements organisés par la communauté</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "💶", title: "Prix libre", desc: "Chaque organisateur fixe le prix de 0€ à 50€" },
            { icon: "✓", title: "Paiement sécurisé", desc: "Via Stripe — CB, Apple Pay, Google Pay" },
            { icon: "↩️", title: "Remboursement", desc: "Annulation >48h avant = remboursement complet" },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-2xl bg-[#F7F3EC] border border-[rgba(17,16,9,0.06)]">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-sm font-semibold text-[#111009] mb-1">{item.title}</p>
              <p className="text-xs text-[rgba(17,16,9,0.5)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="text-center">
        <p className="text-sm text-[rgba(17,16,9,0.45)]">
          Des questions ? Écrivez-nous à{" "}
          <a href="mailto:hello@fraternitas.fr" className="text-[#B8973A] hover:underline">hello@fraternitas.fr</a>
        </p>
      </div>
    </div>
  );
}
