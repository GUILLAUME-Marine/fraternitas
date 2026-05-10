// src/app/dashboard/spiritual/layout.tsx
// Ce layout override le layout parent pour les pages spirituelles.
// Il masque la DashboardTopNav globale (logo + initiale + déconnexion)
// qui casse l'ambiance contemplative pendant la prière.
// Le padding-top:0 compense le pt-16 du layout parent.

export default function SpiritualLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "-64px" }}>
      {children}
    </div>
  );
}
