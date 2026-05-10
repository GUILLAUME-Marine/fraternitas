"use client";
// ─── layout/HeroSection.tsx ───────────────────────────────────────────────────
// Héro sombre exact du HTML :
// - h1 "Entre rencontres, rester unis dans la prière."
// - Citation Matthieu 18, 20 (injectée par initHero() dans le JS)
// - 3 quick-links : Prière du jour / Chapelet / Intentions
// ─────────────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  onSelectTab:         (tab: "jour" | "matin" | "soir" | "inquiet" | "marie") => void;
  onOpenChapelet:      () => void;
  onOpenIntentionModal:() => void;
}

export default function HeroSection({
  onSelectTab,
  onOpenChapelet,
  onOpenIntentionModal,
}: HeroSectionProps) {
  return (
    <div className="hero">
      <h1>Entre rencontres,<br />rester unis dans la prière.</h1>

      <p>
        Retrouvez l&apos;évangile du jour, les prières de votre cercle,
        le chapelet et les intentions portées ensemble.
      </p>

      {/* Citation Mt 18,20 — injectée par initHero() dans l'original */}
      <span className="hero-quote">
        « Là où deux ou trois sont réunis en mon nom, je suis là, au milieu d&apos;eux. »
        <small>Matthieu 18, 20</small>
      </span>

      <div className="quick-links">
        <button
          className="ql"
          onClick={() => { onSelectTab("jour"); document.getElementById("priere")?.scrollIntoView({ behavior: "smooth" }); }}
        >
          <strong>Prière du jour</strong>
          <span>Évangile, saint, citation.</span>
        </button>

        <button className="ql" onClick={onOpenChapelet}>
          <strong>Chapelet</strong>
          <span>Mystères, grains, reprise.</span>
        </button>

        <button className="ql" onClick={onOpenIntentionModal}>
          <strong>Intentions</strong>
          <span>Publier une intention.</span>
        </button>
      </div>
    </div>
  );
}
