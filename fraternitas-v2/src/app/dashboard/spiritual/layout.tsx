// src/app/dashboard/spiritual/layout.tsx
//
// Ce layout couvre visuellement la DashboardTopNav globale (logo + initiale + déco)
// pendant toutes les pages spirituelles. La topnav est fixed z-50 et haute de 64px.
// On place un overlay fixed qui la recouvre, puis on décale le contenu de 0
// (le header doré de chaque page prend la place).
//
// Stratégie : overflow hidden sur le wrapper + paddingTop 0 pour annuler le pt-16
// du layout parent, sans toucher à la topnav globale.

export default function SpiritualLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Overlay qui recouvre la topnav globale (fixed, z-50, h-16) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "64px",
          background: "#F2EBE0",
          zIndex: 51, // au-dessus de la topnav (z-50)
          pointerEvents: "none", // ne bloque pas les clics du header doré en-dessous
        }}
      />
      {/* Contenu décalé vers le haut pour annuler le pt-16 du layout parent */}
      <div style={{ marginTop: "-64px", position: "relative", zIndex: 52 }}>
        {children}
      </div>
    </>
  );
}
