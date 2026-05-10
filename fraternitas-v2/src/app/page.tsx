import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fraternitas — Ne vivez plus votre foi seul",
  description:
    "Fraternitas aide les catholiques à retrouver des cercles locaux, des compagnons de messe, des rencontres réelles et un espace de prière pour ne plus vivre leur foi seuls.",
  openGraph: {
    title: "Fraternitas — Ne vivez plus votre foi seul",
    description:
      "Des cercles locaux, des compagnons de messe, des rencontres réelles. La foi vécue ensemble.",
    type: "website",
  },
};

/* ─────────────────────────────────────────────────────────────
   CSS injecté via <style> dans le layout global (globals.css)
   Les classes ci-dessous sont déclarées dans globals.css.
   Ce composant est un Server Component pur — aucun "use client".
───────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* ── SKIP LINK ─────────────────────────────────────── */}
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>

      {/* ── NAVIGATION ────────────────────────────────────── */}
      <header className="nav-shell" aria-label="Navigation principale">
        <div className="wrap nav">
          <Link className="brand" href="/" aria-label="Fraternitas accueil">
            <span className="mark" aria-hidden="true">†</span>
            <span className="brand-name">Fraternitas</span>
          </Link>
          <nav className="nav-links" aria-label="Sections">
            <a href="#communaute">La communauté</a>
            <a href="#rencontre">Rencontre</a>
            <a href="#priere">Prière</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="nav-actions">
            <Link href="/auth/login">Se connecter</Link>
            <Link className="btn btn-dark" href="/auth/register">
              Rejoindre la bêta →
            </Link>
          </div>
        </div>
      </header>

      <main id="contenu">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section id="top" className="hero" aria-labelledby="hero-title">
          <div className="wrap hero-grid">
            <div>
              <div className="hero-pill">
                ✦ Bêta ouverte · Ouverture progressive des cercles en France
              </div>
              <h1 id="hero-title">
                Ne vivez plus votre foi <em>seul.</em>
              </h1>
              <p className="hero-lead">
                Fraternitas aide les catholiques à retrouver des compagnons de
                messe, des cercles locaux, des rencontres réelles et un lieu
                calme pour prier entre deux rendez-vous.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-gold" href="/auth/register">
                  Rejoindre les premiers membres →
                </Link>
                <a className="btn btn-ghost-dark" href="#rencontre">
                  Voir comment ça marche
                </a>
              </div>
              <p className="micro">
                ✦ Bêta ouverte · Ouverture progressive des cercles en France
              </p>
            </div>
          </div>
        </section>

        {/* ── QU'EST-CE QUE FRATERNITAS ─────────────────────── */}
        <section
          id="communaute"
          className="section wrap"
          aria-labelledby="community-title"
        >
          <div className="section-head">
            <div>
              <span className="kicker">Qu&apos;est-ce que Fraternitas ?</span>
              <h2 id="community-title" className="h2">
                Pas un réseau social.{" "}
                <span className="gold-text">Une communauté réelle.</span>
              </h2>
            </div>
            <p className="copy">
              Un espace simple pour passer du numérique au réel : des personnes
              proches, des rendez-vous concrets, des prières partagées et des
              cercles assez petits pour que chacun compte.
            </p>
          </div>

          <div className="grid-3">
            <article className="card feature">
              <h3>Cercles locaux</h3>
              <p>
                Des groupes de proximité dans votre ville. Petits, humains,
                enracinés dans la vie locale.
              </p>
            </article>
            <article className="card feature">
              <h3>Rencontres réelles</h3>
              <p>
                Messe ensemble, café, dîner, service, retraite. L&apos;application
                facilite. La vie se passe dehors.
              </p>
            </article>
            <article className="card feature">
              <h3>Prière partagée</h3>
              <p>
                Intentions, prière du jour, chapelet interactif. La communauté
                ne remplace pas la prière : elle la soutient.
              </p>
            </article>
          </div>
        </section>

        {/* ── L'IDÉE CENTRALE ───────────────────────────────── */}
        <section
          id="rencontre"
          className="section story-section"
          aria-labelledby="meeting-title"
        >
          <div className="wrap story-grid">
            <div>
              <span className="kicker">L&apos;idée centrale</span>
              <p className="story-intro">
                Fraternitas commence par une rencontre.
              </p>
              <h2 id="meeting-title" className="story-lines">
                <span>Votre communauté</span>
                <span>
                  vous{" "}
                  <em style={{ color: "var(--gold)", fontStyle: "italic" }}>
                    attend.
                  </em>
                </span>
              </h2>
              <p className="copy" style={{ maxWidth: "620px" }}>
                Elle aimerait simplement ne pas repartir seule après la messe.
                Fraternitas rend ce premier lien possible, sans forcer, sans
                bruit, sans pression.
              </p>
              <div className="chrysostome">
                <blockquote>
                  « Un chrétien seul est un chrétien en danger. »
                </blockquote>
                <cite>Saint Jean Chrysostome · IVe siècle</cite>
              </div>
            </div>

            <aside
              className="encounter-card"
              aria-label="Aperçu d'une rencontre locale sur Fraternitas"
            >
              <div className="encounter-top">
                <div className="encounter-location">
                  Saint-Brieuc · Bretagne
                </div>
                <h3>Qui va à cette messe dimanche ?</h3>
                <p>
                  Trois personnes répondent. Un banc partagé, un café possible.
                  Une ville devient moins anonyme.
                </p>
              </div>
              <div className="encounter-body">
                <div className="enc-meta">
                  <div className="enc-meta-item">
                    <span>Lieu</span>
                    <strong>Cathédrale Saint-Étienne</strong>
                  </div>
                  <div className="enc-meta-item">
                    <span>Heure</span>
                    <strong>10h45</strong>
                  </div>
                  <div className="enc-meta-item">
                    <span>Après</span>
                    <strong>Café libre</strong>
                  </div>
                </div>
                <div className="enc-intention">
                  <strong>Intention partagée</strong>
                  &ldquo;Pour ceux qui vivent leur foi seuls dans une nouvelle
                  ville.&rdquo;
                </div>
                <div className="enc-faces">
                  <div className="face-stack" aria-hidden="true">
                    <span className="face">M</span>
                    <span
                      className="face"
                      style={{ background: "#a9c38d", color: "#244018" }}
                    >
                      P
                    </span>
                    <span
                      className="face"
                      style={{ background: "#d6c4a2", color: "#4d3717" }}
                    >
                      +1
                    </span>
                  </div>
                  <span>Des visages avant d&apos;être un groupe.</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ── FRATERNITAS EST POUR VOUS SI… ─────────────────── */}
        <section
          className="forvous-section"
          aria-labelledby="forvous-title"
        >
          <div className="wrap">
            <div className="forvous-head">
              <span className="kicker">Faites-vous partie des nôtres ?</span>
              <h2
                id="forvous-title"
                className="h2"
                style={{
                  color: "#fff8ec",
                  maxWidth: "680px",
                  margin: "14px auto 0",
                }}
              >
                Fraternitas est fait pour vous{" "}
                <span className="gold-text">si…</span>
              </h2>
            </div>
            <div className="forvous-grid">
              {forvousItems.map((item) => (
                <div className="forvous-item" key={item.title}>
                  <div className="forvous-check" aria-hidden="true">
                    ✓
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── L'ÂME DE FRATERNITAS ──────────────────────────── */}
        <section className="section mission" aria-labelledby="mission-title">
          <div className="wrap">
            <div className="mission-card">
              <span className="kicker">L&apos;âme de Fraternitas</span>
              <h2 id="mission-title" className="h2 mission-quote">
                <em>
                  « Là où deux ou trois sont réunis en mon nom,
                  <br />
                  je suis au milieu d&apos;eux. »
                </em>
              </h2>
              <p className="copy mission-ref">— Matthieu 18, 20</p>
              <p className="copy" style={{ maxWidth: "680px", margin: "24px auto 0" }}>
                Fraternitas est né de cette conviction simple : la foi n&apos;est
                pas faite pour être vécue seul. Elle est faite pour être
                partagée, incarnée, portée ensemble.
              </p>
            </div>
          </div>
        </section>

        {/* ── ESPACE PRIÈRE ─────────────────────────────────── */}
        <section
          id="priere"
          className="section wrap"
          aria-labelledby="prayer-title"
        >
          <div className="rosary-section">
            <div>
              <span className="kicker">Espace prière</span>
              <h2
                id="prayer-title"
                className="h2"
                style={{ fontSize: "clamp(32px,3.3vw,54px)", maxWidth: "650px" }}
              >
                Entre deux rencontres, gardez un lieu pour{" "}
                <span className="gold-text">revenir à Dieu.</span>
              </h2>
              <p className="copy">
                Une prière du jour, les intentions de votre cercle, les prières
                essentielles et un chapelet interactif avec mystère du jour,
                progression visible et reprise possible.
              </p>
            </div>

            <div className="demo-card" aria-label="Aperçu de l'espace prière">
              <div className="prayer-status">
                <div>
                  <strong>Espace prière</strong>
                  <span>
                    Un lieu calme dans l&apos;application, pas une messagerie de
                    plus.
                  </span>
                </div>
                <span className="status-dot" aria-hidden="true" />
              </div>
              <div className="prayer-mode">
                <article className="mode-card">
                  <b>Chapelet</b>
                  <p>Grain actuel, prière à dire, progression sauvegardée.</p>
                </article>
                <article className="mode-card">
                  <b>Intentions</b>
                  <p>Porter ce que votre cercle confie, discrètement.</p>
                </article>
              </div>
              <RosaryRing />
              <div className="progress" aria-hidden="true">
                <span />
              </div>
            </div>
          </div>
        </section>

        {/* ── CONFIANCE ─────────────────────────────────────── */}
        <section
          id="confiance"
          className="section wrap"
          aria-labelledby="trust-title"
        >
          <div className="section-head">
            <div>
              <span className="kicker">Confiance</span>
              <h2 id="trust-title" className="h2">
                Des rencontres réelles exigent un cadre{" "}
                <span className="gold-text">sûr.</span>
              </h2>
            </div>
            <p className="copy">
              Fraternitas touche à l&apos;intime : la foi, la solitude, la
              rencontre. La sécurité et la liberté doivent donc être visibles
              dès le départ.
            </p>
          </div>
          <div className="trust-grid">
            {trustItems.map((item) => (
              <article className="trust" key={item.title}>
                <b>{item.title}</b>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── COMMENT ÇA MARCHE ─────────────────────────────── */}
        <section
          id="fonctionnement"
          className="section wrap"
          aria-labelledby="steps-title"
        >
          <span className="kicker">Comment ça marche</span>
          <h2 id="steps-title" className="h2">
            Simple par principe.{" "}
            <span className="gold-text">Profond par nature.</span>
          </h2>
          <div className="steps">
            {steps.map((step) => (
              <div className="step" key={step.num}>
                <div className="step-num">{step.num}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────── */}
        <section
          id="faq"
          className="section faq-section"
          aria-labelledby="faq-title"
        >
          <div className="wrap">
            <div className="faq-head">
              <span className="kicker">Questions fréquentes</span>
              <h2 id="faq-title" className="h2">
                Ce que vous vous demandez
              </h2>
            </div>
            <div className="faq-list">
              {faqItems.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────── */}
        <section
          id="rejoindre"
          className="final-cta"
          aria-labelledby="final-title"
        >
          <div className="wrap">
            <span className="mark" aria-hidden="true">
              †
            </span>
            <h2 id="final-title" className="h2">
              Votre communauté vous attend.
            </h2>
            <p>
              Rejoignez Fraternitas : des cercles locaux, des compagnons de
              messe, et un espace pour vivre votre foi entouré.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-gold" href="/auth/register">
                Rejoindre les premiers membres →
              </Link>
              <Link className="btn btn-ghost-dark" href="/auth/login">
                Se connecter
              </Link>
            </div>
            <p className="micro">
              ✦ Bêta ouverte · Ouverture progressive des cercles en France
            </p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer>
        <div className="wrap footer-inner">
          <span>Fraternitas</span>
          <span>Mentions légales · CGU · Confidentialité · Contact</span>
          <span>© 2026 Fraternitas</span>
        </div>
      </footer>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMPOSANT SERVER : Chapelet SVG (pas besoin de client)
───────────────────────────────────────────────────────────── */
function RosaryRing() {
  const beads = Array.from({ length: 20 }, (_, i) => {
    const angle = i * 18;
    const done = i < 4;
    const current = i === 4;
    return { angle, done, current };
  });

  return (
    <div className="rosary-ring-wrap">
      <div className="rosary-ring" aria-hidden="true">
        {beads.map(({ angle, done, current }, i) => (
          <span
            key={i}
            className={`bead${done ? " done" : ""}${current ? " current" : ""}`}
            style={{ "--a": `${angle}deg` } as React.CSSProperties}
          />
        ))}
      </div>
      <span className="rosary-cross" aria-hidden="true" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DATA — centralisée ici pour éviter le bruit dans le JSX
───────────────────────────────────────────────────────────── */
const forvousItems = [
  {
    title: "Vous voulez agrandir votre cercle",
    body: "Vous avez peut-être déjà des amis dans la foi, mais vous souhaitez rencontrer de nouvelles personnes, tisser de nouveaux liens, élargir votre communauté.",
  },
  {
    title: "Vous avez changé de ville",
    body: "Nouvelle ville, nouveaux quartiers, mais aucun visage familier dans l'église du quartier. Recommencer à zéro est épuisant.",
  },
  {
    title: "Vous cherchez des gens de votre âge",
    body: "Vous aimez votre paroisse, mais vous aimeriez aussi partager votre foi avec des personnes dans la même saison de vie que vous.",
  },
  {
    title: "Vous êtes en recherche ou en retour",
    body: "La foi revient, ou cherche à se retrouver. Vous avez besoin d'un espace accueillant, sans pression, sans regard qui juge.",
  },
  {
    title: "Vous voulez prier, pas scroller",
    body: "Vous cherchez un espace numérique qui vous aide à vous recentrer — pas une application qui capte votre attention pour rien.",
  },
  {
    title: "Vous croyez aux rencontres réelles",
    body: "Les communautés en ligne ne vous suffisent plus. Vous voulez des personnes à rencontrer, des visages, des présences concrètes.",
  },
];

const trustItems = [
  {
    title: "Profils contrôlés",
    body: "Des informations essentielles pour limiter l'anonymat et encourager la responsabilité.",
  },
  {
    title: "Visibilité maîtrisée",
    body: "Vous choisissez ce qui est visible : prénom, ville, cercle, intentions ou participation.",
  },
  {
    title: "Charte fraternelle",
    body: "Un cadre clair : respect, liberté, bienveillance, aucune pression spirituelle ou sociale.",
  },
  {
    title: "Modération humaine",
    body: "Signalement simple et accompagnement en cas de comportement inadapté.",
  },
];

const steps = [
  {
    num: "01",
    title: "Créez votre profil",
    body: "Quelques informations simples pour que votre cercle local puisse vous reconnaître et vous accueillir.",
  },
  {
    num: "02",
    title: "Rejoignez un cercle",
    body: "Un espace local, humain, assez petit pour que les membres se reconnaissent vraiment.",
  },
  {
    num: "03",
    title: "Vivez la foi ensemble",
    body: "Messe, café, service, intentions, prière et chapelet : Fraternitas crée les ponts, les rencontres font le reste.",
  },
];

const faqItems = [
  {
    q: "Fraternitas est-il réservé aux catholiques pratiquants ?",
    a: "Fraternitas s'adresse à celles et ceux qui se reconnaissent dans la foi catholique : pratiquants réguliers, personnes en chemin, recommençants ou chercheurs de sens. L'objectif est de vivre la foi avec d'autres, sans pression ni jugement.",
  },
  {
    q: "Que se passe-t-il si je suis seul dans ma ville ?",
    a: "Vous pouvez rejoindre une liste locale, être prévenu lorsqu'un cercle se forme ou proposer la création d'un cercle. L'ouverture se fait progressivement, ville par ville.",
  },
  {
    q: "Puis-je utiliser Fraternitas seulement pour prier ?",
    a: "Oui. L'espace prière rassemble la prière du jour, les prières essentielles, les intentions du cercle et le chapelet interactif. Vous pouvez avancer à votre rythme et reprendre plus tard.",
  },
  {
    q: "La fonctionnalité « aller à la messe ensemble » perturbe-t-elle le temps de prière ?",
    a: "Non. La messe reste une rencontre avec le Christ. Fraternitas facilite simplement une présence commune ; chacun reste libre de prier en silence et de prolonger ou non la rencontre après.",
  },
  {
    q: "Mes données personnelles sont-elles protégées ?",
    a: "Vous contrôlez les informations visibles sur votre profil. Les intentions sensibles peuvent rester privées ou limitées au cercle choisi. Les fonctionnalités de visibilité, signalement et suppression de compte seront accessibles clairement depuis l'espace utilisateur.",
  },
];
