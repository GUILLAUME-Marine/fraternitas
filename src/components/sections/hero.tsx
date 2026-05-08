"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden px-6 pt-24 pb-20">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(184,151,58,0.14)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(184,151,58,0.07)_0%,transparent_70%)]" />
      </div>

      {/* Rings */}
      <div className="absolute top-1/2 left-1/2 pointer-events-none">
        {[560, 820, 1080].map((size, i) => (
          <div
            key={size}
            className="absolute rounded-full border border-[rgba(184,151,58,0.12)]"
            style={{
              width: size,
              height: size,
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              animation: `pulse-ring 4s ease-in-out ${i * 0.8}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
        >
          <div className="inline-flex items-center gap-2.5 bg-white border border-[rgba(17,16,9,0.12)] rounded-full px-4 py-1.5 mb-12 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F0E3C0] to-[#D4AF5A] flex items-center justify-content-center text-xs flex items-center justify-center">
              ✦
            </div>
            <span className="text-sm text-[rgba(17,16,9,0.65)] font-body">
              La communauté catholique du XXI<sup>e</sup> siècle
            </span>
          </div>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.1}
          className="font-display font-light text-[clamp(52px,8vw,108px)] leading-[1.02] tracking-tight text-[#111009] mb-7"
        >
          Ne vivez plus
          <br />
          votre foi{" "}
          <em className="italic font-light text-[#B8973A] not-italic" style={{ fontStyle: "italic" }}>
            seul
          </em>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.2}
          className="text-[clamp(16px,1.8vw,20px)] font-light text-[rgba(17,16,9,0.65)] max-w-xl mx-auto leading-relaxed mb-12 font-body"
        >
          Fraternitas réunit les catholiques pratiquants qui cherchent des amis
          authentiques, une communauté locale et une vie de foi incarnée dans le
          monde réel.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.3}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap"
        >
          <Button variant="default" size="xl" asChild>
            <Link href="/auth/register">
              Rejoindre gratuitement
              <ArrowRight size={16} />
            </Link>
          </Button>
          <Button variant="ghost" size="xl" asChild>
            <a href="#fonctionnalites">Découvrir →</a>
          </Button>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.45}
          className="flex items-center justify-center gap-5 mt-16"
        >
          <div className="flex">
            {["🙂", "😊", "🤗", "😌", "🙏"].map((emoji, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full border-2 border-cream bg-[#EEE8DA] flex items-center justify-center text-base -ml-3 first:ml-0"
              >
                {emoji}
              </div>
            ))}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#111009] font-body">
              +8 400 membres
            </p>
            <p className="text-xs text-[rgba(17,16,9,0.45)] font-body">
              dans 40 villes françaises
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
