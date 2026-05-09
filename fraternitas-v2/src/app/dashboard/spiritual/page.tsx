"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CITATIONS = [
  { text: "Notre cœur est sans repos tant qu'il ne trouve pas son repos en Toi.", author: "Saint Augustin" },
  { text: "La joie est le signe infaillible de la présence de Dieu.", author: "Teilhard de Chardin" },
  { text: "Aimez-vous les uns les autres comme je vous ai aimés.", author: "Jean 13, 34" },
  { text: "La prière est l'élévation de l'âme vers Dieu.", author: "Saint Jean Damascène" },
  { text: "Dieu est amour, et celui qui demeure dans l'amour demeure en Dieu.", author: "1 Jean 4, 16" },
  { text: "La foi, c'est voir la lumière avec son cœur quand les yeux ne voient que l'obscurité.", author: "Saint Augustin" },
  { text: "Sans amour, les œuvres ne valent rien.", author: "Sainte Thérèse de l'Enfant-Jésus" },
  { text: "Seigneur, faites de moi un instrument de votre paix.", author: "Saint François d'Assise" },
];

const CHAPELET = {
  mysteres: [
    {
      nom: "Mystères joyeux",
      emoji: "😊",
      jours: "Lundi, Samedi",
      couleur: "from-amber-100 to-amber-50",
      liste: [
        "L'Annonciation de l'Ange Gabriel à Marie",
        "La Visitation de Marie à sa cousine Élisabeth",
        "La Naissance de Jésus à Bethléem",
        "La Présentation de Jésus au Temple",
        "Le Recouvrement de Jésus au Temple",
      ],
    },
    {
      nom: "Mystères lumineux",
      emoji: "✨",
      jours: "Jeudi",
      couleur: "from-yellow-100 to-yellow-50",
      liste: [
        "Le Baptême de Jésus au Jourdain",
        "Les Noces de Cana",
        "L'Annonce du Royaume de Dieu",
        "La Transfiguration",
        "L'Institution de l'Eucharistie",
      ],
    },
    {
      nom: "Mystères douloureux",
      emoji: "✝️",
      jours: "Mardi, Vendredi",
      couleur: "from-red-100 to-red-50",
      liste: [
        "L'Agonie de Jésus à Gethsémani",
        "La Flagellation de Jésus",
        "Le Couronnement d'épines",
        "Le Portement de la Croix",
        "La Crucifixion et la mort de Jésus",
      ],
    },
    {
      nom: "Mystères glorieux",
      emoji: "👑",
      jours: "Mercredi, Dimanche",
      couleur: "from-purple-100 to-purple-50",
      liste: [
        "La Résurrection de Jésus",
        "L'Ascension de Jésus au Ciel",
        "La Pentecôte",
        "L'Assomption de Marie",
        "Le Couronnement de Marie",
      ],
    },
  ],
  prieres: [
    { nom: "Je vous salue Marie", texte: "Je vous salue Marie, pleine de grâce ; le Seigneur est avec vous. Vous êtes bénie entre toutes les femmes et Jésus, le fruit de vos entrailles, est béni. Sainte Marie, Mère de Dieu, priez pour nous pauvres pécheurs, maintenant et à l'heure de notre mort. Amen." },
    { nom: "Notre Père", texte: "Notre Père qui es aux cieux, que ton nom soit sanctifié, que ton règne vienne, que ta volonté soit faite sur la terre comme au ciel. Donne-nous aujourd'hui notre pain de ce jour. Pardonne-nous nos offenses, comme nous pardonnons aussi à ceux qui nous ont offensés. Et ne nous soumets pas à la tentation, mais délivre-nous du Mal. Amen." },
    { nom: "Gloire au Père", texte: "Gloire au Père, au Fils et au Saint-Esprit. Comme il était au commencement, maintenant et toujours, dans les siècles des siècles. Amen." },
    { nom: "Je crois en Dieu", texte: "Je crois en Dieu, le Père tout-puissant, Créateur du ciel et de la terre. Et en Jésus-Christ, son Fils unique, Notre Seigneur, qui a été conçu du Saint-Esprit, est né de la Vierge Marie, a souffert sous Ponce Pilate, a été crucifié, est mort et a été enseveli, est descendu aux enfers, le troisième jour est ressuscité des morts, est monté aux cieux, est assis à la droite de Dieu le Père tout-puissant, d'où il viendra juger les vivants et les morts. Je crois en l'Esprit Saint, à la sainte Église catholique, à la communion des saints, à la rémission des péchés, à la résurrection de la chair, à la vie éternelle. Amen." },
  ],
};

export default function SpiritualPage() {
  const [evangile, setEvangile] = useState<any>(null);
  const [saintDuJour, setSaintDuJour] = useState<any>(null);
  const [loadingEvangile, setLoadingEvangile] = useState(true);
  const [tab, setTab] = useState<"jour" | "chapelet" | "prieres">("jour");
  const [chapeletStep, setChapeletStep] = useState<null | { mystereIdx: number; step: number }>(null);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [prayerOpen, setPrayerOpen] = useState<number | null>(null);

  const todayIdx = new Date().getDate() % CITATIONS.length;
  const citation = CITATIONS[todayIdx];

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    // Fetch évangile from Aelf
    fetch(`https://api.aelf.org/v1/messes/${yyyy}-${mm}-${dd}/france`)
      .then((r) => r.json())
      .then((data) => {
        const messe = data?.messes?.[0];
        if (messe) {
          const ev = messe.lectures?.find((l: any) => l.type === "lecture_évangile" || l.type?.includes("vangile"));
          setEvangile({
            titre: ev?.titre || messe.nom || "Évangile du jour",
            texte: ev?.contenu?.replace(/<[^>]*>/g, "")?.slice(0, 600) || "Chargement...",
            ref: ev?.ref || "",
          });
          setSaintDuJour({
            nom: data?.informations?.jour_liturgique_nom || `${dd} ${new Date().toLocaleDateString("fr-FR", { month: "long" })}`,
            fete: data?.informations?.semaine || "",
          });
        }
      })
      .catch(() => {
        setEvangile({
          titre: "Évangile selon saint Jean",
          texte: "Jésus dit à ses disciples : « Je suis la vigne véritable, et mon Père est le vigneron. Tout sarment qui est en moi et ne porte pas de fruit, il l'enlève ; tout sarment qui porte du fruit, il le taille pour qu'il en porte davantage... »",
          ref: "Jn 15, 1-8",
        });
        setSaintDuJour({ nom: "Sainte Marie", fete: "Mémoire de la Vierge Marie" });
      })
      .finally(() => setLoadingEvangile(false));
  }, []);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  const formatTimer = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-light text-3xl text-[#111009] mb-1">Contenu spirituel</h1>
        <p className="text-sm text-[rgba(17,16,9,0.45)]">Votre nourriture quotidienne pour l'âme</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 border border-[rgba(17,16,9,0.08)]">
        {[
          { key: "jour", label: "📖 Du jour" },
          { key: "chapelet", label: "📿 Chapelet" },
          { key: "prieres", label: "🙏 Prières" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t.key ? "bg-[#111009] text-white" : "text-[rgba(17,16,9,0.65)] hover:bg-[#F7F3EC]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB: DU JOUR */}
        {tab === "jour" && (
          <motion.div key="jour" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Saint du jour */}
            <div className="bg-gradient-to-br from-[#F0E3C0] to-[#EEE8DA] rounded-2xl p-6 border border-[rgba(184,151,58,0.2)]">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#B8973A] mb-2">✦ Saint du jour</p>
              {loadingEvangile ? (
                <div className="h-6 bg-[rgba(184,151,58,0.2)] rounded animate-pulse" />
              ) : (
                <>
                  <h2 className="font-display text-2xl font-medium text-[#111009] mb-1">{saintDuJour?.nom}</h2>
                  {saintDuJour?.fete && <p className="text-sm text-[rgba(17,16,9,0.6)]">{saintDuJour.fete}</p>}
                </>
              )}
            </div>

            {/* Évangile du jour */}
            <div className="bg-[#111009] rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#D4AF5A] mb-3">📖 Évangile du jour</p>
              {loadingEvangile ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-4 bg-[rgba(255,255,255,0.1)] rounded animate-pulse" />)}
                </div>
              ) : (
                <>
                  <h3 className="font-display text-lg text-[#F7F3EC] mb-3">{evangile?.titre}</h3>
                  <p className="text-sm text-[rgba(247,243,236,0.7)] leading-relaxed mb-4 italic">
                    "{evangile?.texte}..."
                  </p>
                  {evangile?.ref && (
                    <p className="text-xs text-[#D4AF5A] font-semibold">— {evangile.ref}</p>
                  )}
                </>
              )}
            </div>

            {/* Citation du jour */}
            <div className="bg-white rounded-2xl p-6 border border-[rgba(17,16,9,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#B8973A] mb-3">💭 Citation du jour</p>
              <blockquote className="font-display text-xl font-light italic text-[#111009] leading-relaxed mb-3">
                « {citation.text} »
              </blockquote>
              <p className="text-sm text-[rgba(17,16,9,0.5)]">— {citation.author}</p>
            </div>

            {/* Angélus */}
            <div className="bg-white rounded-2xl p-6 border border-[rgba(17,16,9,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#B8973A] mb-3">🕊️ L'Angélus</p>
              <p className="text-sm text-[rgba(17,16,9,0.7)] leading-relaxed">
                L'Ange du Seigneur apporta l'annonce à Marie, et elle conçut du Saint-Esprit.<br/>
                <em className="text-[rgba(17,16,9,0.5)]">Je vous salue Marie...</em><br/><br/>
                Voici la servante du Seigneur ; qu'il me soit fait selon votre parole.<br/>
                <em className="text-[rgba(17,16,9,0.5)]">Je vous salue Marie...</em><br/><br/>
                Et le Verbe s'est fait chair et il a habité parmi nous.<br/>
                <em className="text-[rgba(17,16,9,0.5)]">Je vous salue Marie...</em>
              </p>
            </div>
          </motion.div>
        )}

        {/* TAB: CHAPELET */}
        {tab === "chapelet" && (
          <motion.div key="chapelet" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {!chapeletStep ? (
              <>
                <div className="bg-[#111009] rounded-2xl p-6 text-[#F7F3EC]">
                  <div className="text-3xl mb-3">📿</div>
                  <h2 className="font-display text-2xl mb-2">Prier le chapelet</h2>
                  <p className="text-sm text-[rgba(247,243,236,0.6)] leading-relaxed">
                    Le chapelet est une prière méditative centrée sur la vie du Christ et de Marie. 
                    Choisissez vos mystères selon le jour de la semaine.
                  </p>
                </div>

                <div className="space-y-3">
                  {CHAPELET.mysteres.map((m, i) => (
                    <button key={i} onClick={() => setChapeletStep({ mystereIdx: i, step: 0 })}
                      className={`w-full text-left p-5 rounded-2xl bg-gradient-to-br ${m.couleur} border border-[rgba(17,16,9,0.08)] hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{m.emoji}</span>
                            <span className="font-display text-lg font-medium text-[#111009]">{m.nom}</span>
                          </div>
                          <p className="text-xs text-[rgba(17,16,9,0.5)]">📅 {m.jours}</p>
                        </div>
                        <span className="text-[rgba(17,16,9,0.35)]">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => { setChapeletStep(null); setTimer(0); setTimerRunning(false); }}
                    className="p-2 rounded-xl bg-white border border-[rgba(17,16,9,0.12)] text-sm text-[rgba(17,16,9,0.65)]">
                    ← Retour
                  </button>
                  <div>
                    <p className="text-xs text-[rgba(17,16,9,0.45)]">{CHAPELET.mysteres[chapeletStep.mystereIdx].nom}</p>
                    <p className="text-sm font-semibold text-[#111009]">
                      Mystère {chapeletStep.step + 1} / 5
                    </p>
                  </div>
                </div>

                {/* Mystère actuel */}
                <div className="bg-[#111009] rounded-2xl p-6 text-[#F7F3EC]">
                  <p className="text-xs uppercase tracking-widest text-[#D4AF5A] mb-2">
                    {chapeletStep.step + 1}e mystère
                  </p>
                  <p className="font-display text-xl leading-relaxed">
                    {CHAPELET.mysteres[chapeletStep.mystereIdx].liste[chapeletStep.step]}
                  </p>
                </div>

                {/* Timer */}
                <div className="bg-white rounded-2xl p-5 border border-[rgba(17,16,9,0.08)] text-center">
                  <div className="font-display text-5xl font-light text-[#111009] mb-4">
                    {formatTimer(timer)}
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button onClick={() => setTimerRunning(!timerRunning)}
                      className="px-6 py-2.5 rounded-xl bg-[#111009] text-white text-sm font-medium hover:-translate-y-0.5 transition-all">
                      {timerRunning ? "⏸ Pause" : "▶ Démarrer"}
                    </button>
                    <button onClick={() => { setTimer(0); setTimerRunning(false); }}
                      className="px-4 py-2.5 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[rgba(17,16,9,0.65)]">
                      ↺ Reset
                    </button>
                  </div>
                </div>

                {/* Rappel prières */}
                <div className="bg-[#F7F3EC] rounded-2xl p-4 border border-[rgba(17,16,9,0.08)]">
                  <p className="text-xs font-semibold text-[rgba(17,16,9,0.5)] mb-2">Pour chaque dizaine :</p>
                  <p className="text-xs text-[rgba(17,16,9,0.65)] leading-relaxed">
                    1 Notre Père · 10 Je vous salue Marie · 1 Gloire au Père
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  {chapeletStep.step > 0 && (
                    <button onClick={() => setChapeletStep(s => s ? { ...s, step: s.step - 1 } : null)}
                      className="flex-1 py-3 rounded-xl border border-[rgba(17,16,9,0.15)] text-sm text-[rgba(17,16,9,0.65)]">
                      ← Précédent
                    </button>
                  )}
                  {chapeletStep.step < 4 ? (
                    <button onClick={() => { setChapeletStep(s => s ? { ...s, step: s.step + 1 } : null); setTimer(0); setTimerRunning(false); }}
                      className="flex-1 py-3 rounded-xl bg-[#111009] text-white text-sm font-medium hover:-translate-y-0.5 transition-all">
                      Mystère suivant →
                    </button>
                  ) : (
                    <button onClick={() => { setChapeletStep(null); setTimer(0); setTimerRunning(false); }}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-br from-[#D4AF5A] to-[#B8973A] text-white text-sm font-medium hover:-translate-y-0.5 transition-all">
                      ✓ Chapelet terminé 🙏
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB: PRIÈRES */}
        {tab === "prieres" && (
          <motion.div key="prieres" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {CHAPELET.prieres.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[rgba(17,16,9,0.08)] overflow-hidden">
                <button onClick={() => setPrayerOpen(prayerOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F7F3EC] transition-colors">
                  <span className="font-display text-lg font-medium text-[#111009]">{p.nom}</span>
                  <span className="text-[rgba(17,16,9,0.35)] transition-transform"
                    style={{ transform: prayerOpen === i ? "rotate(180deg)" : "rotate(0deg)" }}>
                    ↓
                  </span>
                </button>
                <AnimatePresence>
                  {prayerOpen === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <div className="px-5 pb-5">
                        <p className="text-sm text-[rgba(17,16,9,0.7)] leading-relaxed italic border-l-2 border-[#D4AF5A] pl-4">
                          {p.texte}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Acte de contrition */}
            <div className="bg-white rounded-2xl border border-[rgba(17,16,9,0.08)] overflow-hidden">
              <button onClick={() => setPrayerOpen(prayerOpen === 99 ? null : 99)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F7F3EC] transition-colors">
                <span className="font-display text-lg font-medium text-[#111009]">Acte de contrition</span>
                <span className="text-[rgba(17,16,9,0.35)]">↓</span>
              </button>
              <AnimatePresence>
                {prayerOpen === 99 && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-5">
                      <p className="text-sm text-[rgba(17,16,9,0.7)] leading-relaxed italic border-l-2 border-[#D4AF5A] pl-4">
                        Mon Dieu, j'ai un très grand regret de vous avoir offensé, parce que vous êtes infiniment bon, infiniment aimable, et que le péché vous déplaît. Je prends la ferme résolution, avec le secours de votre sainte grâce, de ne plus vous offenser et de faire pénitence. Amen.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
