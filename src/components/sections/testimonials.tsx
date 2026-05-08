"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    stars: 5,
    quote: "J'avais l'impression d'être le seul catholique pratiquant de ma génération dans ma ville. Fraternitas m'a prouvé que j'avais tort. En trois semaines, j'avais un cercle d'amis.",
    name: "Thomas M.",
    role: "Ingénieur, Lyon — 29 ans",
    avatar: "👨",
  },
  {
    stars: 5,
    quote: "Après mon déménagement à Paris, j'avais tout perdu de ma communauté. Fraternitas m'a aidée à reconstruire un cercle qui me ressemble en quelques semaines.",
    name: "Laure D.",
    role: "Avocate, Paris — 33 ans",
    avatar: "👩",
  },
  {
    stars: 5,
    quote: "Le premier événement était une soirée jeux. Aujourd'hui, deux de ces gens-là sont mes meilleurs amis. C'est ça Fraternitas : du lien réel, pas du like.",
    name: "Antoine B.",
    role: "Médecin, Bordeaux — 31 ans",
    avatar: "👨",
  },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="temoignages" className="py-32 px-6 bg-[#EEE8DA]" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 text-[#B8973A] text-xs font-semibold uppercase tracking-[0.14em] mb-4 font-body justify-center">
            Témoignages
          </div>
          <h2 className="font-display font-light text-[clamp(36px,5vw,64px)] text-[#111009]">
            Ils ont <em className="italic text-[#B8973A]">trouvé</em> leur communauté
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white rounded-3xl p-10 border border-[rgba(17,16,9,0.10)] shadow-sm hover:-translate-y-1.5 hover:shadow-xl transition-all duration-250"
            >
              <div className="text-[#D4AF5A] tracking-widest mb-5 text-sm">
                {"★".repeat(t.stars)}
              </div>
              <p className="font-display text-lg font-normal italic text-[#111009] leading-relaxed mb-8">
                « {t.quote} »
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#EEE8DA] flex items-center justify-center text-xl flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111009] font-body">{t.name}</p>
                  <p className="text-xs text-[rgba(17,16,9,0.45)] font-body">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
