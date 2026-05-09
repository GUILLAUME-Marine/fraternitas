"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Données des mystères ─────────────────────────────────────────────────────
const MYSTERIES = [
  {
    id: "joyeux",
    name: "Les Mystères Joyeux",
    days: "Lundi et Samedi",
    color: "#C49A3C",
    items: [
      { number: 1, title: "L'Annonciation", verse: "L'ange Gabriel est envoyé à Marie pour lui annoncer qu'elle concevra le Fils de Dieu. — Lc 1, 26-38" },
      { number: 2, title: "La Visitation", verse: "Marie visite sa cousine Élisabeth, enceinte de Jean-Baptiste. — Lc 1, 39-56" },
      { number: 3, title: "La Nativité", verse: "Jésus naît à Bethléem dans une crèche. — Lc 2, 1-20" },
      { number: 4, title: "La Présentation au Temple", verse: "Marie et Joseph présentent Jésus au Temple selon la Loi. — Lc 2, 22-40" },
      { number: 5, title: "Le Recouvrement de Jésus au Temple", verse: "Jésus, à 12 ans, est retrouvé au Temple discutant avec les docteurs. — Lc 2, 41-52" },
    ],
  },
  {
    id: "lumineux",
    name: "Les Mystères Lumineux",
    days: "Jeudi",
    color: "#B8973A",
    items: [
      { number: 1, title: "Le Baptême de Jésus", verse: "Jésus est baptisé par Jean dans le Jourdain. Une voix du ciel dit : « Celui-ci est mon Fils bien-aimé. » — Mt 3, 13-17" },
      { number: 2, title: "Les Noces de Cana", verse: "Jésus accomplit son premier miracle à la demande de sa mère Marie. — Jn 2, 1-11" },
      { number: 3, title: "L'Annonce du Royaume", verse: "Jésus proclame : « Convertissez-vous, car le Royaume des cieux est tout proche. » — Mc 1, 14-15" },
      { number: 4, title: "La Transfiguration", verse: "Jésus transfiguré sur le mont Thabor révèle sa gloire divine à Pierre, Jacques et Jean. — Mt 17, 1-8" },
      { number: 5, title: "L'Institution de l'Eucharistie", verse: "À la Cène, Jésus donne son corps et son sang sous les espèces du pain et du vin. — Lc 22, 14-20" },
    ],
  },
  {
    id: "douloureux",
    name: "Les Mystères Douloureux",
    days: "Mardi et Vendredi",
    color: "#7A4A4A",
    items: [
      { number: 1, title: "L'Agonie à Gethsémani", verse: "Jésus prie son Père dans l'angoisse. « Père, si tu veux, éloigne de moi cette coupe. » — Lc 22, 39-46" },
      { number: 2, title: "La Flagellation", verse: "Jésus est flagellé sur ordre de Pilate. — Jn 19, 1" },
      { number: 3, title: "Le Couronnement d'épines", verse: "Les soldats couronnent Jésus d'épines et le bafouent. — Jn 19, 2-3" },
      { number: 4, title: "Le Portement de Croix", verse: "Jésus porte sa croix jusqu'au Golgotha. Simon de Cyrène est réquisitionné pour l'aider. — Lc 23, 26-32" },
      { number: 5, title: "La Crucifixion", verse: "Jésus est crucifié entre deux larrons. Marie et Jean se tiennent au pied de la croix. — Jn 19, 17-30" },
    ],
  },
  {
    id: "glorieux",
    name: "Les Mystères Glorieux",
    days: "Mercredi et Dimanche",
    color: "#4A6B8A",
    items: [
      { number: 1, title: "La Résurrection", verse: "Le troisième jour, Jésus ressuscite d'entre les morts. Marie-Madeleine est la première à le voir. — Jn 20, 11-18" },
      { number: 2, title: "L'Ascension", verse: "Jésus monte au ciel quarante jours après Pâques, sous les yeux de ses disciples. — Ac 1, 6-11" },
      { number: 3, title: "La Pentecôte", verse: "L'Esprit Saint descend sur les apôtres réunis avec Marie. L'Église naît. — Ac 2, 1-13" },
      { number: 4, title: "L'Assomption de Marie", verse: "Marie est élevée au ciel en corps et en âme à la fin de sa vie terrestre." },
      { number: 5, title: "Le Couronnement de Marie", verse: "Marie est couronnée Reine du ciel et de la terre, intercédant pour tous ses enfants." },
    ],
  },
];

// ─── Prières du chapelet ──────────────────────────────────────────────────────
const ROSARY_PRAYERS = {
  "Credo": `Je crois en Dieu, le Père tout-puissant,\nCréateur du ciel et de la terre.\nEt en Jésus-Christ, son Fils unique, notre Seigneur,\nqui a été conçu du Saint-Esprit,\nest né de la Vierge Marie,\na souffert sous Ponce Pilate,\na été crucifié, est mort, et a été enseveli,\nest descendu aux enfers,\nle troisième jour est ressuscité des morts,\nest monté aux cieux,\nest assis à la droite de Dieu le Père tout-puissant,\nd'où il viendra juger les vivants et les morts.\nJe crois en l'Esprit Saint,\nà la sainte Église catholique,\nà la communion des saints,\nà la rémission des péchés,\nà la résurrection de la chair,\nà la vie éternelle. Amen.`,
  "Notre Père": `Notre Père, qui es aux cieux,\nque ton nom soit sanctifié,\nque ton règne vienne,\nque ta volonté soit faite\nsur la terre comme au ciel.\nDonne-nous aujourd'hui notre pain de ce jour.\nPardonne-nous nos offenses,\ncomme nous pardonnons aussi à ceux qui nous ont offensés.\nEt ne nous soumets pas à la tentation,\nmais délivre-nous du mal. Amen.`,
  "Je vous salue Marie": `Je vous salue, Marie pleine de grâce,\nle Seigneur est avec vous.\nVous êtes bénie entre toutes les femmes\net Jésus, le fruit de vos entrailles, est béni.\nSainte Marie, Mère de Dieu,\npriez pour nous pauvres pécheurs,\nmaintenant et à l'heure de notre mort. Amen.`,
  "Gloire au Père": `Gloire au Père, et au Fils,\net au Saint-Esprit,\ncomme il était au commencement,\nmaintenant et toujours,\ndans les siècles des siècles. Amen.`,
  "Salve Regina": `Salve, Regina, mater misericordiae ;\nvita, dulcedo et spes nostra, salve.\nAd te clamamus, exsules filii Evae ;\nad te suspiramus, gementes et flentes\nin hac lacrimarum valle.\nEia ergo, advocata nostra,\nillos tuos misericordes oculos ad nos converte.\nEt Iesum, benedictum fructum ventris tui,\nnobis post hoc exsilium ostende.\nO clemens, o pia, o dulcis Virgo Maria.`,
};

export default function ChapeletPage() {
  const router = useRouter();
  const [selectedMystery, setSelectedMystery] = useState<string | null>(null);
  const [showPrayer, setShowPrayer] = useState<string | null>(null);

  const mystery = MYSTERIES.find(m => m.id === selectedMystery);

  return (
    <div style={{ minHeight: "100vh", background: "#F5EFE4", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .mystery-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(17,16,9,0.08); }
        .prayer-row:hover { background: rgba(17,16,9,0.04) !important; }
      `}</style>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "rgba(245,239,228,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(17,16,9,0.07)",
        padding: "0 24px", height: "56px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={() => selectedMystery ? setSelectedMystery(null) : router.back()}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "rgba(17,16,9,0.5)", fontSize: "13px", padding: 0, transition: "opacity 0.15s" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {selectedMystery ? "Les mystères" : "Vie spirituelle"}
        </button>

        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "16px", color: "rgba(17,16,9,0.7)" }}>
          Le Chapelet
        </span>
        <div style={{ width: "80px" }} />
      </header>

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {!selectedMystery ? (
          <>
            {/* Intro */}
            <div style={{ marginBottom: "40px" }}>
              <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(17,16,9,0.35)", marginBottom: "12px" }}>
                Le Rosaire
              </p>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 300,
                color: "#111009", lineHeight: 1.1, marginBottom: "16px",
              }}>
                Prier le Chapelet
              </h1>
              <p style={{ fontSize: "15px", fontWeight: 300, color: "rgba(17,16,9,0.55)", lineHeight: 1.7 }}>
                Le Rosaire est une prière méditative qui contemple la vie du Christ à travers les yeux de Marie.
                Il se compose de vingt mystères répartis en quatre groupes.
              </p>
            </div>

            {/* Guide rapide */}
            <div style={{
              background: "#FFFFFF", borderRadius: "20px",
              border: "1.5px solid rgba(17,16,9,0.07)", marginBottom: "32px", overflow: "hidden",
            }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(17,16,9,0.06)" }}>
                <p style={{ fontSize: "12px", fontWeight: 500, color: "rgba(17,16,9,0.4)", margin: 0, letterSpacing: "1px", textTransform: "uppercase" }}>
                  Structure d'une dizaine
                </p>
              </div>
              {[
                { step: "1", label: "Annoncer le mystère", desc: "Nommer et méditer le mystère de la dizaine" },
                { step: "2", label: "Notre Père", desc: "1 fois" },
                { step: "3", label: "Je vous salue Marie", desc: "10 fois, en méditant le mystère" },
                { step: "4", label: "Gloire au Père", desc: "1 fois" },
                { step: "5", label: "Répéter", desc: "Pour les 5 mystères du chapelet" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: "16px",
                  padding: "14px 24px",
                  borderBottom: i < 4 ? "1px solid rgba(17,16,9,0.05)" : "none",
                }}>
                  <div style={{
                    width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(196,154,60,0.1)",
                    fontSize: "12px", fontWeight: 500, color: "#C49A3C",
                  }}>{item.step}</div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "#111009", margin: "0 0 1px" }}>{item.label}</p>
                    <p style={{ fontSize: "12px", fontWeight: 300, color: "rgba(17,16,9,0.45)", margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Prières à connaître */}
            <div style={{ marginBottom: "32px" }}>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(17,16,9,0.5)", marginBottom: "12px" }}>
                Les prières du chapelet
              </p>
              <div style={{ background: "#FFFFFF", borderRadius: "20px", border: "1.5px solid rgba(17,16,9,0.07)", overflow: "hidden" }}>
                {Object.entries(ROSARY_PRAYERS).map(([name, text], i) => (
                  <div key={name}>
                    <button
                      className="prayer-row"
                      onClick={() => setShowPrayer(showPrayer === name ? null : name)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer",
                        borderBottom: showPrayer === name || i < Object.keys(ROSARY_PRAYERS).length - 1 ? "1px solid rgba(17,16,9,0.06)" : "none",
                        transition: "background 0.15s",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#111009" }}>{name}</span>
                      <span style={{ color: "#C49A3C", fontSize: "18px", transform: showPrayer === name ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
                    </button>
                    {showPrayer === name && (
                      <div style={{ padding: "16px 20px 20px", borderBottom: i < Object.keys(ROSARY_PRAYERS).length - 1 ? "1px solid rgba(17,16,9,0.06)" : "none" }}>
                        <p style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: "17px", fontWeight: 300, lineHeight: 1.85,
                          color: "rgba(17,16,9,0.72)", whiteSpace: "pre-line", margin: 0,
                        }}>
                          {text}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Les 4 mystères */}
            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(17,16,9,0.5)", marginBottom: "12px" }}>
                Choisir un groupe de mystères
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {MYSTERIES.map(m => (
                  <button
                    key={m.id}
                    className="mystery-card"
                    onClick={() => setSelectedMystery(m.id)}
                    style={{
                      background: "#FFFFFF", border: "1.5px solid rgba(17,16,9,0.08)",
                      borderRadius: "16px", padding: "20px 18px", textAlign: "left",
                      cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: "8px",
                    }}
                  >
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: m.color }} />
                    <p style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "16px", fontWeight: 400, color: "#111009",
                      margin: 0, lineHeight: 1.25,
                    }}>
                      {m.name.replace("Les Mystères ", "")}
                    </p>
                    <p style={{ fontSize: "11px", fontWeight: 300, color: "rgba(17,16,9,0.4)", margin: 0 }}>
                      {m.days}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : mystery ? (
          <>
            {/* En-tête du mystère */}
            <div style={{ marginBottom: "36px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: mystery.color }} />
                <p style={{ fontSize: "12px", fontWeight: 300, color: "rgba(17,16,9,0.4)", margin: 0 }}>{mystery.days}</p>
              </div>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 300,
                color: "#111009", margin: "0 0 12px", lineHeight: 1.2,
              }}>
                {mystery.name}
              </h2>
              <p style={{ fontSize: "14px", fontWeight: 300, color: "rgba(17,16,9,0.5)", lineHeight: 1.6 }}>
                Pour chaque mystère : annoncer · Notre Père · 10 Je vous salue Marie · Gloire au Père
              </p>
            </div>

            {/* Les 5 mystères */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {mystery.items.map((item, i) => (
                <div key={i} style={{
                  background: "#FFFFFF", borderRadius: "16px",
                  border: "1.5px solid rgba(17,16,9,0.07)", padding: "20px 22px",
                  display: "flex", gap: "14px", alignItems: "flex-start",
                }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                    background: mystery.color + "18",
                    border: `1.5px solid ${mystery.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 500, color: mystery.color,
                    marginTop: "2px",
                  }}>
                    {item.number}
                  </div>
                  <div>
                    <p style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "18px", fontWeight: 400,
                      color: "#111009", margin: "0 0 6px",
                    }}>
                      {item.title}
                    </p>
                    <p style={{
                      fontSize: "13px", fontWeight: 300, lineHeight: 1.6,
                      color: "rgba(17,16,9,0.5)", margin: 0,
                      fontStyle: "italic",
                    }}>
                      {item.verse}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Salve Regina finale */}
            <div style={{
              marginTop: "32px",
              background: "#111009", borderRadius: "20px", padding: "28px 24px",
            }}>
              <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(196,154,60,0.6)", marginBottom: "12px" }}>
                Pour terminer le chapelet
              </p>
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "17px", fontWeight: 300, fontStyle: "italic",
                color: "rgba(245,239,228,0.7)", lineHeight: 1.8, whiteSpace: "pre-line",
              }}>
                {ROSARY_PRAYERS["Salve Regina"]}
              </p>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
