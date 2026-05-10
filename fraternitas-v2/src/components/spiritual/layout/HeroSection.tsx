"use client";
// ─── layout/HeroSection.tsx v2 ────────────────────────────────────────────────
// Fix #10 : hero compact — suppression du grand titre et de la description
// Reste : citation Mt 18,20 + 3 quick-links
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
      {/* Citation Mt 18,20 uniquement */}
      <span className="hero-quote">
        « Là où deux ou trois sont réunis en mon nom, je suis là, au milieu d&apos;eux. »
        <small>Matthieu 18, 20</small>
      </span>

      {/* 3 quick-links */}
      <div className="quick-links">
        <button
          className="ql"
          onClick={() => onSelectTab("jour")}
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
