"use client";

import { useRouter } from "next/navigation";

// ─── Données des prières ──────────────────────────────────────────────────────
const PRAYERS_DATA: Record<string, {
  title: string;
  subtitle: string;
  origin: string;
  text: string;
  verses?: string;
}> = {
  "notre-pere": {
    title: "Notre Père",
    subtitle: "Oratio Dominica",
    origin: "Enseignée par Jésus-Christ lui-même à ses disciples. Matthieu 6, 9-13.",
    text: `Notre Père, qui es aux cieux,
que ton nom soit sanctifié,
que ton règne vienne,
que ta volonté soit faite
sur la terre comme au ciel.

Donne-nous aujourd'hui notre pain de ce jour.
Pardonne-nous nos offenses,
comme nous pardonnons aussi
à ceux qui nous ont offensés.

Et ne nous soumets pas à la tentation,
mais délivre-nous du mal.

Amen.`,
    verses: "« Voici donc comment vous devez prier : Notre Père qui es aux cieux… » — Mt 6, 9",
  },

  "je-vous-salue-marie": {
    title: "Je vous salue Marie",
    subtitle: "Ave Maria",
    origin: "Prière composée à partir des paroles de l'ange Gabriel (Lc 1, 28), d'Élisabeth (Lc 1, 42) et d'une invocation de l'Église médiévale.",
    text: `Je vous salue, Marie pleine de grâce,
le Seigneur est avec vous.
Vous êtes bénie entre toutes les femmes
et Jésus, le fruit de vos entrailles, est béni.

Sainte Marie, Mère de Dieu,
priez pour nous pauvres pécheurs,
maintenant et à l'heure de notre mort.

Amen.`,
    verses: "« Je vous salue, comblée de grâce, le Seigneur est avec vous. » — Lc 1, 28",
  },

  "angelus": {
    title: "L'Angélus",
    subtitle: "Angelus Domini",
    origin: "Prière médiévale récitée traditionnellement trois fois par jour — à 6h, 12h et 18h — en souvenir de l'Incarnation.",
    text: `V. L'ange du Seigneur a annoncé à Marie.
R. Et elle a conçu du Saint-Esprit.

Je vous salue Marie…

V. Voici la servante du Seigneur.
R. Qu'il me soit fait selon votre parole.

Je vous salue Marie…

V. Et le Verbe s'est fait chair.
R. Et il a habité parmi nous.

Je vous salue Marie…

V. Priez pour nous, Sainte Mère de Dieu.
R. Afin que nous devenions dignes des promesses de Jésus-Christ.

Prions.

Répandez, Seigneur, votre grâce en nos âmes,
afin que, nous qui avons connu, par le message de l'ange,
l'Incarnation de votre Fils Jésus-Christ,
nous arrivions par sa Passion et par sa Croix
à la gloire de la Résurrection.
Par le même Jésus-Christ, Notre Seigneur.

Amen.`,
    verses: "« Le Verbe s'est fait chair et il a habité parmi nous. » — Jn 1, 14",
  },

  "acte-de-contrition": {
    title: "Acte de contrition",
    subtitle: "Actus Contritionis",
    origin: "Prière de repentance exprimant le regret sincère de ses péchés et la ferme résolution de ne plus les commettre.",
    text: `Mon Dieu, j'ai un très grand regret
de vous avoir offensé,
parce que vous êtes infiniment bon,
infiniment aimable,
et que le péché vous déplaît.

Je prends la ferme résolution,
avec le secours de votre sainte grâce,
de ne plus vous offenser
et de faire pénitence.

Amen.`,
    verses: "« Ayez pitié de moi, mon Dieu, dans votre bonté… effacez mon péché. » — Ps 51, 3",
  },

  "gloire-au-pere": {
    title: "Gloire au Père",
    subtitle: "Gloria Patri",
    origin: "Doxologie trinitaire d'origine très ancienne, récitée à la fin des psaumes et des prières du chapelet.",
    text: `Gloire au Père,
et au Fils,
et au Saint-Esprit,

comme il était au commencement,
maintenant et toujours,
dans les siècles des siècles.

Amen.`,
    verses: "« Allez, faites des disciples parmi toutes les nations, baptisez-les au nom du Père, et du Fils, et du Saint-Esprit. » — Mt 28, 19",
  },

  "acte-de-foi": {
    title: "Acte de foi",
    subtitle: "Actus Fidei",
    origin: "Profession de foi personnelle exprimant l'adhésion libre et totale au mystère de Dieu révélé en Jésus-Christ.",
    text: `Mon Dieu, je crois fermement
toutes les vérités que vous avez révélées
et que la sainte Église nous enseigne,
parce que vous êtes la vérité même,
qui ne peut ni se tromper ni nous tromper.

Je crois en vous, Père, Fils et Saint-Esprit,
Dieu unique et Dieu en trois personnes.

Je crois en Jésus-Christ, Fils de Dieu incarné,
mort pour nos péchés et ressuscité pour notre vie.

Augmentez en moi cette foi.

Amen.`,
    verses: "« Celui qui croit au Fils a la vie éternelle. » — Jn 3, 36",
  },
};

// ─── Composant page dynamique ─────────────────────────────────────────────────
export default function PrayerPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const prayer = PRAYERS_DATA[params.slug];

  if (!prayer) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5EFE4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", color: "#111009", marginBottom: "16px" }}>
          Prière introuvable
        </p>
        <button
          onClick={() => router.push("/dashboard/spiritual")}
          style={{ padding: "10px 24px", borderRadius: "999px", border: "1.5px solid rgba(17,16,9,0.15)", background: "none", cursor: "pointer", fontSize: "13px", color: "#111009" }}>
          ← Retour à la vie spirituelle
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5EFE4", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "rgba(245,239,228,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(17,16,9,0.07)",
        padding: "0 24px", height: "56px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={() => router.push("/dashboard/spiritual")}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "rgba(17,16,9,0.5)", fontSize: "13px", padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Vie spirituelle
        </button>
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "15px", color: "rgba(17,16,9,0.6)" }}>
          Prière
        </span>
        <div style={{ width: "80px" }} />
      </header>

      <main style={{ maxWidth: "560px", margin: "0 auto", padding: "56px 24px 100px" }}>

        {/* En-tête */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={{
            fontSize: "12px", fontWeight: 400, letterSpacing: "2px",
            textTransform: "uppercase", color: "rgba(17,16,9,0.35)", marginBottom: "12px",
          }}>
            {prayer.subtitle}
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(34px, 6vw, 52px)", fontWeight: 300,
            color: "#111009", lineHeight: 1.1, marginBottom: "20px",
          }}>
            {prayer.title}
          </h1>
          <p style={{
            fontSize: "13px", fontWeight: 300, lineHeight: 1.7,
            color: "rgba(17,16,9,0.45)",
            maxWidth: "360px", margin: "0 auto",
          }}>
            {prayer.origin}
          </p>
        </div>

        {/* Séparateur avec croix */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "56px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(17,16,9,0.08)" }} />
          <span style={{ color: "#C49A3C", fontSize: "14px" }}>✦</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(17,16,9,0.08)" }} />
        </div>

        {/* Texte de la prière */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: "24px",
          padding: "clamp(32px, 6vw, 56px)",
          border: "1.5px solid rgba(17,16,9,0.06)",
          boxShadow: "0 4px 32px rgba(17,16,9,0.04)",
          marginBottom: "32px",
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(20px, 3vw, 26px)",
            fontWeight: 300,
            lineHeight: 2,
            color: "rgba(17,16,9,0.78)",
            whiteSpace: "pre-line",
            textAlign: "center",
            margin: 0,
          }}>
            {prayer.text}
          </p>
        </div>

        {/* Verset biblique */}
        {prayer.verses && (
          <div style={{
            padding: "20px 24px",
            borderRadius: "16px",
            background: "rgba(196,154,60,0.06)",
            border: "1px solid rgba(196,154,60,0.15)",
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "15px", fontStyle: "italic", fontWeight: 300,
              color: "rgba(17,16,9,0.55)", lineHeight: 1.7, margin: 0,
            }}>
              {prayer.verses}
            </p>
          </div>
        )}

        {/* Navigation vers d'autres prières */}
        <div style={{ marginTop: "48px" }}>
          <p style={{ fontSize: "12px", fontWeight: 500, color: "rgba(17,16,9,0.35)", marginBottom: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>
            Autres prières
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {Object.entries(PRAYERS_DATA)
              .filter(([slug]) => slug !== params.slug)
              .map(([slug, p]) => (
                <button
                  key={slug}
                  onClick={() => router.push(`/dashboard/spiritual/prieres/${slug}`)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "13px 0", background: "none", border: "none",
                    borderBottom: "1px solid rgba(17,16,9,0.07)", cursor: "pointer",
                    textAlign: "left", width: "100%",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.6"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#111009", margin: "0 0 1px" }}>{p.title}</p>
                    <p style={{ fontSize: "12px", fontWeight: 300, color: "rgba(17,16,9,0.4)", margin: 0 }}>{p.subtitle}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="rgba(17,16,9,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
          </div>
        </div>

      </main>
    </div>
  );
}
