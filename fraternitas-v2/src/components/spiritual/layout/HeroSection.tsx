"use client";
// ─── layout/HeroSection.tsx v3 ────────────────────────────────────────────────
// Fix : quick-link "Prière du jour" renommé "Prière"
// Sur mobile, cliquer dessus amène à la zone de choix du type de prière
// ─────────────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  onSelectTab:          (tab: "jour" | "matin" | "soir" | "inquiet" | "marie") => void;
  onOpenChapelet:       () => void;
  onOpenIntentionModal: () => void;
}

export default function HeroSection({
  onSelectTab,
  onOpenChapelet,
  onOpenIntentionModal,
}: HeroSectionProps) {
  return (
    <div className="hero hero-compact">
      <span className="hero-quote">
        « Là où deux ou trois sont réunis en mon nom, je suis là, au milieu d&apos;eux. »
        <small>Matthieu 18, 20</small>
      </span>

      <div className="quick-links">
        {/* Fix : renommé "Prière" — clique → scroll vers zone onglets */}
        <button
          className="ql"
          onClick={() => onSelectTab("jour")}
        >
          <strong>Prière</strong>
          <span>Choisir le type de prière.</span>
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
