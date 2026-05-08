"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: "🏘️",
    title: "Cercles locaux",
    desc: "Rejoignez ou créez un groupe catholique géolocalisé dans votre ville. Chat, agenda, organisation d'événements réels.",
  },
  {
    icon: "🗓️",
    title: "Événements & Retraites",
    desc: "Découvrez les événements catholiques près de chez vous — soirées, week-ends, retraites, pèlerinages.",
  },
  {
    icon: "🤝",
    title: "Profil de valeurs",
    desc: "Pas un profil de rencontre : un profil de vie. Foi, projets, intentions — ce que vous cherchez vraiment.",
  },
  {
    icon: "📖",
    title: "Contenu spirituel",
    desc: "Lectures quotidiennes personnalisées, intentions de prière et réflexions adaptées à votre cheminement.",
  },
  {
    icon: "💼",
    title: "Réseau professionnel",
    desc: "Trouvez des professionnels catholiques de confiance. Construisez des projets alignés avec vos valeurs.",
  },
  {
    icon: "🧭",
    title: "Mentorat de vie",
    desc: "Connectez-vous à un accompagnateur spirituel, trouvez un mentor ou devenez une ressource pour d'autres.",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="fonctionnalites" className="py-32 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 text-[#B8973A] text-xs font-semibold uppercase tracking-[0.14em] mb-4 font-body">
            <span className="w-5 h-px bg-[#B8973A]" />
            Fonctionnalités
          </div>
          <h2 className="font-display font-light text-[clamp(36px,5vw,64px)] text-[#111009] mb-5">
            Tout ce dont une{" "}
            <em className="italic text-[#B8973A]">fraternité</em> a besoin
          </h2>
          <p className="text-lg font-light text-[rgba(17,16,9,0.65)] max-w-lg mx-auto font-body leading-relaxed">
            Une plateforme pensée pour des liens réels — pas pour des likes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgba(17,16,9,0.12)] rounded-3xl overflow-hidden">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-[#F7F3EC] p-12 group hover:bg-white transition-colors duration-250 relative overflow-hidden cursor-default"
            >
              {/* Gold underline on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4AF5A] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F0E3C0] to-[#EEE8DA] flex items-center justify-center text-2xl mb-7 shadow-sm">
                {f.icon}
              </div>
              <h3 className="font-display text-xl font-medium text-[#111009] mb-3">
                {f.title}
              </h3>
              <p className="text-sm text-[rgba(17,16,9,0.65)] leading-relaxed font-body font-light">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
