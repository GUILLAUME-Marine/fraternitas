"use client";
// ─── layout/SaintStrip.tsx ────────────────────────────────────────────────────
// Bandeau saint du jour — reproduit exactement :
//   <div class="saint-strip fu">
//     <div class="saint-icon">✦</div>
//     <div class="saint-info">
//       <small>Saint du jour</small>
//       <strong id="saint-name">—</strong>
//       <p id="saint-desc"></p>
//     </div>
//   </div>
// Données via /api/spiritual (vrais saints par date), pas le tableau statique du HTML.
// ─────────────────────────────────────────────────────────────────────────────

interface SaintStripProps {
  name: string;
  dates: string;
  description: string;
  loading?: boolean;
}

function Skeleton({ w, h = "12px" }: { w: string; h?: string }) {
  return (
    <div style={{ width: w, height: h, borderRadius: 6, background: "rgba(17,16,9,.09)", flexShrink: 0 }}
      className="skel" />
  );
}

export default function SaintStrip({ name, dates, description, loading }: SaintStripProps) {
  return (
    <div className="saint-strip fu" style={{ animationDelay: ".16s" }}>
      <div className="saint-icon">✦</div>
      <div className="saint-info">
        <small>Saint du jour</small>
        {loading ? (
          <>
            <Skeleton w="180px" h="15px" />
            <Skeleton w="280px" h="12px" />
          </>
        ) : (
          <>
            <strong>{name}{dates ? ` · ${dates}` : ""}</strong>
            <p>{description}</p>
          </>
        )}
      </div>
    </div>
  );
}
