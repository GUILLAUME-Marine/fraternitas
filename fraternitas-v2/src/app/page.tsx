import type { Metadata } from "next";
import Link from "next/link";
import { NavMobile } from "@/components/landing/nav-mobile";

export const metadata: Metadata = {
  title: "Fraternitas — Ne vivez plus votre foi seul",
  description:
    "Fraternitas aide les catholiques à retrouver des cercles locaux, des compagnons de messe, des rencontres réelles et un espace de prière pour ne plus vivre leur foi seuls.",
  openGraph: {
    title: "Fraternitas — Ne vivez plus votre foi seul",
    description: "Des cercles locaux, des compagnons de messe, des rencontres réelles. La foi vécue ensemble.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <LandingStyles />
      <a className="lp-skip" href="#contenu">Aller au contenu</a>

      {/* ══ NAVIGATION ══════════════════════════════════════ */}
      <header className="lp-nav-shell" id="lpNavShell" aria-label="Navigation principale">
        <div className="lp-wrap lp-nav">
          <Link className="lp-brand" href="/" aria-label="Fraternitas — accueil">
            <span className="lp-mark" aria-hidden="true">†</span>
            <span className="lp-brand-name">Fraternitas</span>
          </Link>
          <nav className="lp-nav-links" aria-label="Sections">
            <a href="#communaute">La communauté</a>
            <a href="#rencontre">Rencontre</a>
            <a href="#priere">Prière</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="lp-nav-actions">
            <Link href="/auth/login">Se connecter</Link>
            <Link className="lp-btn lp-btn-dark" href="/auth/register">Rejoindre la bêta →</Link>
          </div>
          <NavMobile />
        </div>
      </header>

      <main id="contenu">

        {/* ══ HERO ════════════════════════════════════════════
            CORRECTION : centré sur mobile (text-align + align-items center)
        ══════════════════════════════════════════════════ */}
        <section id="top" className="lp-hero" aria-labelledby="hero-title">
          <div className="lp-wrap lp-hero-inner">
            <div className="lp-hero-pill">✦ Bêta ouverte · Cercles ouverts en France</div>
            <h1 id="hero-title">Ne vivez plus votre foi <em>seul.</em></h1>
            <p className="lp-hero-lead">
              Fraternitas aide les catholiques à retrouver des compagnons de messe, des cercles locaux et un lieu calme pour prier entre deux rendez-vous.
            </p>
            <div className="lp-hero-actions">
              <Link className="lp-btn lp-btn-gold" href="/auth/register">Rejoindre les premiers membres →</Link>
              <a className="lp-btn lp-btn-ghost-dark" href="#rencontre">Voir comment ça marche</a>
            </div>
            <p className="lp-micro">✦ Bêta ouverte · Cercles ouverts ville par ville</p>
          </div>
        </section>

        {/* ══ QU'EST-CE QUE FRATERNITAS ════════════════════════
            CORRECTION : cards compactes sur mobile, h3 réduit, layout horizontal
        ══════════════════════════════════════════════════ */}
        <section id="communaute" className="lp-section lp-wrap" aria-labelledby="community-title">
          <div className="lp-section-head lp-reveal">
            <div>
              <span className="lp-kicker">Qu&apos;est-ce que Fraternitas ?</span>
              <h2 id="community-title" className="lp-h2">
                Pas un réseau social. <span className="lp-gold">Une communauté réelle.</span>
              </h2>
            </div>
            <p className="lp-copy">
              Un espace simple pour passer du numérique au réel : des personnes proches, des rendez-vous concrets, des prières partagées et des cercles assez petits pour que chacun compte.
            </p>
          </div>
          <div className="lp-grid-3">
            {features.map((f, i) => (
              <article key={f.title} className={`lp-card lp-feature lp-reveal lp-delay-${i + 1}`}>
                <div className="lp-feature-icon" aria-hidden="true">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ══ L'IDÉE CENTRALE ══════════════════════════════════ */}
        <section id="rencontre" className="lp-section lp-story-section" aria-labelledby="meeting-title">
          <div className="lp-wrap lp-story-grid">
            <div className="lp-reveal">
              <span className="lp-kicker">L&apos;idée centrale</span>
              <p className="lp-story-intro">Fraternitas commence par une rencontre.</p>
              <h2 id="meeting-title" className="lp-story-lines">
                <span>Votre communauté</span>
                <span>vous <em style={{ color: "var(--lp-gold)", fontStyle: "italic" }}>attend.</em></span>
              </h2>
              <p className="lp-copy" style={{ maxWidth: "560px" }}>
                Elle aimerait simplement ne pas repartir seule après la messe. Fraternitas rend ce premier lien possible, sans forcer, sans bruit, sans pression.
              </p>
              <div className="lp-chrysostome">
                <blockquote>« Un chrétien seul est un chrétien en danger. »</blockquote>
                <cite>Saint Jean Chrysostome · IVe siècle</cite>
              </div>
            </div>
            <aside className="lp-encounter-card lp-reveal lp-delay-1" aria-label="Aperçu d'une rencontre locale">
              <div className="lp-enc-top">
                <div className="lp-enc-location">Saint-Brieuc · Bretagne</div>
                <h3>Qui va à cette messe dimanche ?</h3>
                <p>Trois personnes répondent. Un banc partagé, un café possible. Une ville devient moins anonyme.</p>
              </div>
              <div className="lp-enc-body">
                <div className="lp-enc-meta">
                  <div className="lp-enc-meta-item"><span>Lieu</span><strong>Cathédrale Saint-Étienne</strong></div>
                  <div className="lp-enc-meta-item"><span>Heure</span><strong>10h45</strong></div>
                  <div className="lp-enc-meta-item"><span>Après</span><strong>Café libre</strong></div>
                </div>
                <div className="lp-enc-intention">
                  <strong>Intention partagée</strong>
                  &ldquo;Pour ceux qui vivent leur foi seuls dans une nouvelle ville.&rdquo;
                </div>
                <div className="lp-enc-faces">
                  <div className="lp-face-stack" aria-hidden="true">
                    <span className="lp-face">M</span>
                    <span className="lp-face" style={{ background: "#a9c38d", color: "#244018" }}>P</span>
                    <span className="lp-face" style={{ background: "#d6c4a2", color: "#4d3717" }}>+1</span>
                  </div>
                  <span>Des visages avant d&apos;être un groupe.</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* ══ ESPACE PRIÈRE ════════════════════════════════════
            CORRECTION : texte blanc sur fond sombre, demo-card compressé pour tout voir
        ══════════════════════════════════════════════════ */}
        <section id="priere" className="lp-section lp-wrap" aria-labelledby="prayer-title">
          <div className="lp-rosary-section lp-reveal">
            <div className="lp-rosary-text">
              <span className="lp-kicker lp-kicker-prayer">Espace prière</span>
              <h2 id="prayer-title" className="lp-h2 lp-h2-prayer">
                Entre deux rencontres, gardez un lieu pour <span className="lp-gold">revenir à Dieu.</span>
              </h2>
              <p className="lp-copy lp-copy-prayer">
                Une prière du jour, les intentions de votre cercle, les prières essentielles et un chapelet interactif avec mystère du jour, progression visible et reprise possible.
              </p>
            </div>
            <div className="lp-demo-card" aria-label="Aperçu de l'espace prière">
              <div className="lp-prayer-status">
                <div>
                  <strong>Espace prière</strong>
                  <span>Un lieu calme, pas une messagerie de plus.</span>
                </div>
                <span className="lp-status-dot" aria-hidden="true" />
              </div>
              <div className="lp-prayer-mode">
                <article className="lp-mode-card"><b>Chapelet</b><p>Grain actuel, prière à dire, progression sauvegardée.</p></article>
                <article className="lp-mode-card"><b>Intentions</b><p>Porter ce que votre cercle confie, discrètement.</p></article>
              </div>
              <RosaryRing />
              <div className="lp-progress" aria-hidden="true"><span /></div>
            </div>
          </div>
        </section>

        {/* ══ POUR VOUS SI ═════════════════════════════════════
            CORRECTION : items compacts sur mobile — titre + icône seulement,
            corps visible via <details> au tap pour économiser l'espace vertical
        ══════════════════════════════════════════════════ */}
        <section className="lp-forvous-section" aria-labelledby="forvous-title">
          <div className="lp-wrap">
            <div className="lp-forvous-head lp-reveal">
              <span className="lp-kicker lp-kicker-light">Faites-vous partie des nôtres ?</span>
              <h2 id="forvous-title" className="lp-h2 lp-h2-light">
                Fraternitas est fait pour vous <span className="lp-gold">si…</span>
              </h2>
            </div>
            <div className="lp-forvous-grid">
              {forvousItems.map((item, i) => (
                <div key={item.title} className={`lp-forvous-item lp-reveal lp-delay-${(i % 2) + 1}`}>
                  <div className="lp-forvous-check" aria-hidden="true">✓</div>
                  <div className="lp-forvous-content">
                    <h3>{item.title}</h3>
                    {/* Sur desktop : texte visible. Sur mobile : masqué par défaut pour compacité */}
                    <p className="lp-forvous-body">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ L'ÂME DE FRATERNITAS ═════════════════════════════ */}
        <section className="lp-section lp-mission" aria-labelledby="mission-title">
          <div className="lp-wrap">
            <div className="lp-mission-card lp-reveal">
              <span className="lp-kicker">L&apos;âme de Fraternitas</span>
              <h2 id="mission-title" className="lp-h2 lp-mission-quote">
                <em>« Là où deux ou trois sont réunis en mon nom,<br />je suis au milieu d&apos;eux. »</em>
              </h2>
              <p className="lp-copy lp-mission-ref">— Matthieu 18, 20</p>
              <p className="lp-copy lp-mission-body">
                Fraternitas est né de cette conviction simple : la foi n&apos;est pas faite pour être vécue seul. Elle est faite pour être partagée, incarnée, portée ensemble.
              </p>
            </div>
          </div>
        </section>

        {/* ══ CONFIANCE ════════════════════════════════════════ */}
        <section id="confiance" className="lp-section lp-wrap" aria-labelledby="trust-title">
          <div className="lp-section-head lp-reveal">
            <div>
              <span className="lp-kicker">Confiance</span>
              <h2 id="trust-title" className="lp-h2">
                Des rencontres réelles exigent un cadre <span className="lp-gold">sûr.</span>
              </h2>
            </div>
            <p className="lp-copy">Fraternitas touche à l&apos;intime : la foi, la solitude, la rencontre. La sécurité et la liberté doivent donc être visibles dès le départ.</p>
          </div>
          <div className="lp-trust-grid">
            {trustItems.map((item, i) => (
              <article key={item.title} className={`lp-trust lp-reveal lp-delay-${(i % 2) + 1}`}>
                <b>{item.title}</b>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ══ COMMENT ÇA MARCHE ════════════════════════════════ */}
        <section id="fonctionnement" className="lp-section lp-wrap" aria-labelledby="steps-title">
          <div className="lp-reveal">
            <span className="lp-kicker">Comment ça marche</span>
            <h2 id="steps-title" className="lp-h2">Simple par principe. <span className="lp-gold">Profond par nature.</span></h2>
          </div>
          <div className="lp-steps">
            {steps.map((step, i) => (
              <div key={step.num} className={`lp-step lp-reveal lp-delay-${i + 1}`}>
                <div className="lp-step-num">{step.num}</div>
                <div><h3>{step.title}</h3><p>{step.body}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FAQ ══════════════════════════════════════════════ */}
        <section id="faq" className="lp-section lp-faq-section" aria-labelledby="faq-title">
          <div className="lp-wrap">
            <div className="lp-faq-head lp-reveal">
              <span className="lp-kicker">Questions fréquentes</span>
              <h2 id="faq-title" className="lp-h2">Ce que vous vous demandez</h2>
            </div>
            <div className="lp-faq-list">
              {faqItems.map((item, i) => (
                <details key={item.q} className={`lp-reveal${i > 0 ? ` lp-delay-${Math.min(i, 3)}` : ""}`}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ════════════════════════════════════════
            CORRECTION : fond or, texte foncé (inversé)
        ══════════════════════════════════════════════════ */}
        <section id="rejoindre" className="lp-final-cta" aria-labelledby="final-title">
          <div className="lp-wrap lp-reveal">
            <span className="lp-cta-cross" aria-hidden="true">†</span>
            <h2 id="final-title" className="lp-h2 lp-cta-title">Votre communauté vous attend.</h2>
            <p className="lp-cta-lead">
              Rejoignez Fraternitas : des cercles locaux, des compagnons de messe, et un espace pour vivre votre foi entouré.
            </p>
            <div className="lp-hero-actions lp-hero-actions-center">
              {/* CORRECTION : btn-dark (fond nuit, texte crème) sur fond or */}
              <Link className="lp-btn lp-btn-dark" href="/auth/register">Rejoindre les premiers membres →</Link>
              <Link className="lp-btn lp-btn-outline-dark" href="/auth/login">Se connecter</Link>
            </div>
            <p className="lp-cta-micro">✦ Bêta ouverte · Ouverture progressive des cercles en France</p>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <span>Fraternitas</span>
          <span>Mentions légales · CGU · Confidentialité · Contact</span>
          <span>© 2026 Fraternitas</span>
        </div>
      </footer>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   CHAPELET SVG (Server Component)
───────────────────────────────────────────────────────────── */
function RosaryRing() {
  const beads = Array.from({ length: 20 }, (_, i) => ({
    angle: i * 18,
    done: i < 4,
    current: i === 4,
  }));
  return (
    <div className="lp-rosary-wrap">
      <div className="lp-rosary-ring" aria-hidden="true">
        {beads.map(({ angle, done, current }, i) => (
          <span
            key={i}
            className={`lp-bead${done ? " done" : ""}${current ? " current" : ""}`}
            style={{ "--a": `${angle}deg` } as React.CSSProperties}
          />
        ))}
      </div>
      <span className="lp-rosary-cross" aria-hidden="true" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const features = [
  { icon: "⬡", title: "Cercles locaux", body: "Des groupes de proximité dans votre ville. Petits, humains, enracinés dans la vie locale." },
  { icon: "✦", title: "Rencontres réelles", body: "Messe ensemble, café, dîner, service, retraite. L'application facilite. La vie se passe dehors." },
  { icon: "†", title: "Prière partagée", body: "Intentions, prière du jour, chapelet interactif. La communauté ne remplace pas la prière : elle la soutient." },
];

const forvousItems = [
  { title: "Vous voulez agrandir votre cercle", body: "Vous avez peut-être déjà des amis dans la foi, mais vous souhaitez rencontrer de nouvelles personnes et élargir votre communauté." },
  { title: "Vous avez changé de ville", body: "Nouvelle ville, nouveaux quartiers, mais aucun visage familier dans l'église du quartier. Recommencer à zéro est épuisant." },
  { title: "Vous cherchez des gens de votre âge", body: "Vous aimez votre paroisse, mais vous aimeriez partager votre foi avec des personnes dans la même saison de vie." },
  { title: "Vous êtes en recherche ou en retour", body: "La foi revient, ou cherche à se retrouver. Vous avez besoin d'un espace accueillant, sans pression, sans regard qui juge." },
  { title: "Vous voulez prier, pas scroller", body: "Vous cherchez un espace numérique qui vous aide à vous recentrer, pas une application qui capte votre attention pour rien." },
  { title: "Vous croyez aux rencontres réelles", body: "Les communautés en ligne ne vous suffisent plus. Vous voulez des personnes à rencontrer, des visages, des présences concrètes." },
];

const trustItems = [
  { title: "Profils contrôlés", body: "Des informations essentielles pour limiter l'anonymat et encourager la responsabilité." },
  { title: "Visibilité maîtrisée", body: "Vous choisissez ce qui est visible : prénom, ville, cercle, intentions ou participation." },
  { title: "Charte fraternelle", body: "Un cadre clair : respect, liberté, bienveillance, aucune pression spirituelle ou sociale." },
  { title: "Modération humaine", body: "Signalement simple et accompagnement en cas de comportement inadapté." },
];

const steps = [
  { num: "01", title: "Créez votre profil", body: "Quelques informations simples pour que votre cercle local puisse vous reconnaître et vous accueillir." },
  { num: "02", title: "Rejoignez un cercle", body: "Un espace local, humain, assez petit pour que les membres se reconnaissent vraiment." },
  { num: "03", title: "Vivez la foi ensemble", body: "Messe, café, service, intentions, prière et chapelet : Fraternitas crée les ponts, les rencontres font le reste." },
];

const faqItems = [
  { q: "Fraternitas est-il réservé aux catholiques pratiquants ?", a: "Fraternitas s'adresse à celles et ceux qui se reconnaissent dans la foi catholique : pratiquants réguliers, personnes en chemin, recommençants ou chercheurs de sens. L'objectif est de vivre la foi avec d'autres, sans pression ni jugement." },
  { q: "Que se passe-t-il si je suis seul dans ma ville ?", a: "Vous pouvez rejoindre une liste locale, être prévenu lorsqu'un cercle se forme ou proposer la création d'un cercle. L'ouverture se fait progressivement, ville par ville." },
  { q: "Puis-je utiliser Fraternitas seulement pour prier ?", a: "Oui. L'espace prière rassemble la prière du jour, les prières essentielles, les intentions du cercle et le chapelet interactif. Vous pouvez avancer à votre rythme et reprendre plus tard." },
  { q: "La fonctionnalité « aller à la messe ensemble » perturbe-t-elle le temps de prière ?", a: "Non. La messe reste une rencontre avec le Christ. Fraternitas facilite simplement une présence commune ; chacun reste libre de prier en silence et de prolonger ou non la rencontre après." },
  { q: "Mes données personnelles sont-elles protégées ?", a: "Vous contrôlez les informations visibles sur votre profil. Les intentions sensibles peuvent rester privées ou limitées au cercle choisi. Les fonctionnalités de visibilité, signalement et suppression de compte seront accessibles clairement depuis l'espace utilisateur." },
];

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
function LandingStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: css }} />
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

/* ── TOKENS ─────────────────────────────────────────── */
:root {
  --lp-cream: #f3eee6;
  --lp-paper: #fffdf8;
  --lp-ink: #11100b;
  --lp-ink-soft: rgba(17,16,11,.68);
  --lp-ink-faint: rgba(17,16,11,.44);
  --lp-line: rgba(17,16,11,.11);
  --lp-gold: #c99a35;
  --lp-gold-soft: #d9b96a;
  --lp-gold-deep: #a8751f;
  --lp-night: #14120c;
  --lp-serif: 'Cormorant Garamond', Georgia, serif;
  --lp-sans: 'DM Sans', system-ui, -apple-system, sans-serif;
  --lp-max: 1180px;
  --lp-r: 28px;
  --lp-r-lg: 44px;
  --lp-shadow: 0 26px 80px rgba(46,34,18,.10);
  --lp-shadow-lg: 0 36px 100px rgba(25,19,11,.18);
  --lp-ease: cubic-bezier(.2,.8,.2,1);
  --lp-nav-h: 72px;
}

body:has(.lp-hero) {
  background: radial-gradient(circle at 50% 0%, rgba(201,154,53,.10), transparent 36rem), linear-gradient(180deg, #f8f3eb 0%, var(--lp-cream) 42%, #efe6d8 100%);
  overflow-x: hidden;
}

/* ── BASE ───────────────────────────────────────────── */
.lp-skip { position: fixed; top: 12px; left: 12px; z-index: 200; transform: translateY(-200%); background: var(--lp-night); color: #fff8ec; padding: 10px 16px; border-radius: 999px; font-weight: 800; font-size: 14px; transition: transform .2s var(--lp-ease); text-decoration: none; font-family: var(--lp-sans); }
.lp-skip:focus { transform: translateY(0); }
.lp-wrap { width: min(var(--lp-max), calc(100% - 40px)); margin: 0 auto; }
.lp-section { padding: 80px 0; font-family: var(--lp-sans); }

/* ── NAV ─────────────────────────────────────────────── */
.lp-nav-shell { position: sticky; top: 0; z-index: 80; border-bottom: 1px solid var(--lp-line); background: rgba(243,238,230,.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); transition: box-shadow .2s; font-family: var(--lp-sans); }
.lp-nav-shell.scrolled { box-shadow: 0 2px 24px rgba(17,16,11,.08); }
.lp-nav { height: var(--lp-nav-h); display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.lp-brand { display: inline-flex; align-items: center; gap: 11px; flex-shrink: 0; text-decoration: none; color: var(--lp-ink); }
.lp-mark { width: 32px; height: 32px; flex-shrink: 0; border: 1px solid var(--lp-gold); border-radius: 999px; display: grid; place-items: center; color: var(--lp-gold); font-family: var(--lp-serif); font-size: 22px; line-height: 1; background: rgba(255,255,255,.28); }
.lp-brand-name { font-family: var(--lp-serif); font-size: 24px; font-weight: 700; letter-spacing: -.02em; white-space: nowrap; color: var(--lp-ink); }
.lp-nav-links { display: flex; align-items: center; gap: 28px; color: rgba(17,16,11,.55); font-weight: 700; font-size: 14px; }
.lp-nav-links a { text-decoration: none; color: rgba(17,16,11,.55); transition: color .15s; }
.lp-nav-links a:hover { color: var(--lp-ink); }
.lp-nav-actions { display: flex; align-items: center; gap: 14px; font-weight: 800; font-size: 14px; }
.lp-nav-actions > a:not(.lp-btn) { color: var(--lp-ink-soft); text-decoration: none; transition: color .15s; }
.lp-nav-actions > a:not(.lp-btn):hover { color: var(--lp-ink); }

/* ── BOUTONS ─────────────────────────────────────────── */
.lp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 52px; border-radius: 999px; border: 1.5px solid transparent; padding: 0 28px; font-weight: 800; font-family: var(--lp-sans); font-size: 15px; letter-spacing: -.01em; cursor: pointer; white-space: nowrap; text-decoration: none; transition: transform .18s var(--lp-ease), box-shadow .18s var(--lp-ease), opacity .18s; -webkit-tap-highlight-color: transparent; }
.lp-btn:hover { transform: translateY(-2px); }
.lp-btn:active { transform: translateY(0); opacity: .88; }
.lp-btn-dark { background: var(--lp-night); color: #fff8ec; box-shadow: 0 14px 36px rgba(20,18,12,.28); }
.lp-btn-gold { background: linear-gradient(180deg, #dfb652 0%, #bd8c2d 100%); color: #17120a; box-shadow: 0 14px 36px rgba(201,154,53,.28); }
.lp-btn-ghost-dark { background: transparent; border-color: rgba(255,248,236,.22); color: #fff8ec; }
.lp-btn-outline-dark { background: transparent; border-color: rgba(17,16,11,.28); color: var(--lp-night); }

/* ── TYPO ─────────────────────────────────────────────── */
.lp-kicker { display: inline-flex; align-items: center; gap: 9px; color: var(--lp-gold-deep); font-size: 12px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; font-family: var(--lp-sans); }
.lp-kicker::before { content: ''; width: 5px; height: 5px; border-radius: 999px; flex-shrink: 0; background: var(--lp-gold); box-shadow: 0 0 0 5px rgba(201,154,53,.12); }
.lp-kicker-light { color: var(--lp-gold-soft) !important; }
.lp-kicker-light::before { background: var(--lp-gold) !important; box-shadow: 0 0 0 5px rgba(201,154,53,.2) !important; }
.lp-kicker-prayer { color: #d7b361 !important; }
.lp-kicker-prayer::before { background: var(--lp-gold) !important; }
.lp-h2 { font-family: var(--lp-serif); font-size: clamp(32px,4.2vw,62px); line-height: .94; letter-spacing: -.055em; margin: 12px 0 0; color: var(--lp-ink); }
.lp-h2-light { color: #fff8ec !important; }
.lp-h2-prayer { color: #fff8ec !important; font-size: clamp(26px,2.8vw,48px) !important; max-width: 540px; margin-top: 12px; }
.lp-copy { color: var(--lp-ink-soft); line-height: 1.72; font-size: clamp(15px,1.5vw,18px); font-family: var(--lp-sans); }
.lp-copy-prayer { color: rgba(255,248,236,.68) !important; margin-top: 16px; }
.lp-gold { color: var(--lp-gold); }

/* ── HERO ─────────────────────────────────────────────── */
.lp-hero { position: relative; overflow: hidden; min-height: calc(100svh - var(--lp-nav-h)); display: flex; align-items: center; justify-content: center; color: #fff8ec; background: radial-gradient(circle at 14% 16%, rgba(201,154,53,.16), transparent 22rem), radial-gradient(circle at 84% 10%, rgba(255,248,236,.07), transparent 22rem), radial-gradient(circle at 50% 115%, rgba(201,154,53,.14), transparent 30rem), linear-gradient(180deg, #14120c 0%, #0d0c08 100%); padding: 64px 0; padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); font-family: var(--lp-sans); }
.lp-hero::before { content: ''; position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,248,236,.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255,248,236,.022) 1px, transparent 1px); background-size: 72px 72px; mask-image: radial-gradient(circle at 50% 28%, black, transparent 68%); }
.lp-hero-inner { position: relative; width: 100%; display: flex; flex-direction: column; }
.lp-hero-pill { display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; border: 1px solid rgba(201,154,53,.34); border-radius: 999px; padding: 8px 16px; color: var(--lp-gold-soft); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; font-weight: 800; background: rgba(201,154,53,.045); max-width: 100%; }
.lp-hero h1 { font-family: var(--lp-serif); font-size: clamp(46px,7.2vw,100px); line-height: .88; letter-spacing: -.062em; margin: 24px 0 20px; max-width: 820px; }
.lp-hero h1 em { color: var(--lp-gold); font-style: italic; }
.lp-hero-lead { max-width: 620px; color: rgba(255,248,236,.72); font-size: clamp(16px,1.8vw,21px); line-height: 1.6; }
.lp-hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
.lp-hero-actions-center { justify-content: center; }
.lp-micro { color: rgba(255,248,236,.44); font-size: 13px; margin-top: 14px; }

/* ── SECTION HEAD ─────────────────────────────────────── */
.lp-section-head { display: grid; grid-template-columns: 1fr auto; gap: 48px 56px; align-items: end; margin-bottom: 36px; }
.lp-section-head .lp-copy { max-width: 380px; }

/* ── FEATURES ─────────────────────────────────────────── */
.lp-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.lp-card { background: rgba(255,255,255,.66); border: 1px solid var(--lp-line); border-radius: var(--lp-r); box-shadow: var(--lp-shadow); }
.lp-feature { padding: 28px 26px; transition: transform .2s var(--lp-ease), box-shadow .2s var(--lp-ease); }
.lp-feature:hover { transform: translateY(-4px); box-shadow: var(--lp-shadow-lg); }
.lp-feature-icon { font-size: 22px; margin-bottom: 12px; color: var(--lp-gold); line-height: 1; }
.lp-feature h3 { font-family: var(--lp-serif); font-size: 28px; line-height: 1; letter-spacing: -.04em; margin: 0 0 8px; color: var(--lp-ink); }
.lp-feature p { color: var(--lp-ink-soft); line-height: 1.65; margin: 0; font-size: 15px; }

/* ── STORY ─────────────────────────────────────────────── */
.lp-story-section { background: #fff; border-top: 1px solid var(--lp-line); border-bottom: 1px solid var(--lp-line); padding: 80px 0; font-family: var(--lp-sans); }
.lp-story-grid { display: grid; grid-template-columns: 1fr minmax(0,460px); gap: 52px; align-items: center; }
.lp-story-intro { font-family: var(--lp-serif); font-size: clamp(18px,1.9vw,26px); line-height: 1.2; letter-spacing: -.03em; color: var(--lp-ink); margin-top: 12px; }
.lp-story-lines { font-family: var(--lp-serif); font-size: clamp(34px,3.8vw,58px); line-height: .97; letter-spacing: -.055em; margin: 16px 0 18px; color: var(--lp-ink); }
.lp-story-lines span { display: block; }
.lp-chrysostome { margin-top: 26px; padding: 20px 22px; border-left: 2.5px solid var(--lp-gold); background: rgba(201,154,53,.055); border-radius: 0 16px 16px 0; max-width: 580px; }
.lp-chrysostome blockquote { font-family: var(--lp-serif); font-size: clamp(17px,1.7vw,24px); line-height: 1.28; letter-spacing: -.025em; font-style: italic; color: var(--lp-ink); margin-bottom: 8px; }
.lp-chrysostome cite { display: block; font-style: normal; font-size: 11px; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; color: var(--lp-gold-deep); }

/* ── ENCOUNTER CARD ───────────────────────────────────── */
.lp-encounter-card { border-radius: 28px; border: 1px solid rgba(17,16,11,.08); background: var(--lp-paper); box-shadow: var(--lp-shadow); overflow: hidden; }
.lp-enc-top { background: linear-gradient(145deg, #211a10, #14120c); color: #fff8ec; padding: 24px 24px 20px; }
.lp-enc-location { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--lp-gold-soft); margin-bottom: 12px; }
.lp-enc-location::before { content: ''; width: 4px; height: 4px; border-radius: 999px; background: var(--lp-gold); }
.lp-enc-top h3 { font-family: var(--lp-serif); font-size: clamp(22px,2.2vw,34px); line-height: .96; letter-spacing: -.04em; margin: 0 0 7px; color: #fff8ec; }
.lp-enc-top p { margin: 0; font-size: 13.5px; line-height: 1.52; color: rgba(255,248,236,.58); }
.lp-enc-body { padding: 20px 24px 22px; }
.lp-enc-meta { display: grid; grid-template-columns: repeat(3,1fr); gap: 7px; margin-bottom: 16px; }
.lp-enc-meta-item { padding: 10px 12px; border-radius: 14px; border: 1px solid var(--lp-line); background: rgba(243,238,230,.55); }
.lp-enc-meta-item span { display: block; color: var(--lp-ink-faint); font-size: 9px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; margin-bottom: 4px; }
.lp-enc-meta-item strong { display: block; font-size: 13px; line-height: 1.25; color: var(--lp-ink); }
.lp-enc-intention { padding: 12px 14px; border: 1px solid rgba(201,154,53,.2); border-radius: 14px; background: rgba(201,154,53,.055); margin-bottom: 16px; font-size: 13.5px; line-height: 1.55; color: var(--lp-ink-soft); }
.lp-enc-intention strong { color: var(--lp-gold-deep); font-size: 10px; font-weight: 800; letter-spacing: .10em; text-transform: uppercase; display: block; margin-bottom: 4px; }
.lp-enc-faces { display: flex; align-items: center; gap: 9px; color: var(--lp-ink-faint); font-size: 13px; font-weight: 700; }
.lp-face-stack { display: flex; }
.lp-face { width: 32px; height: 32px; border-radius: 999px; border: 2px solid var(--lp-paper); display: grid; place-items: center; background: #d8bd78; color: #4d3717; font-weight: 800; font-size: 12px; margin-left: -7px; }
.lp-face:first-child { margin-left: 0; }

/* ── ESPACE PRIÈRE ────────────────────────────────────── */
.lp-rosary-section { color: #fff8ec; background: radial-gradient(circle at 78% 14%, rgba(201,154,53,.13), transparent 24rem), linear-gradient(145deg, #2a2118 0%, #14120c 100%); border-radius: 28px; padding: 32px; display: grid; grid-template-columns: 1fr minmax(0,380px); gap: 32px; align-items: center; box-shadow: var(--lp-shadow-lg); }
/* CORRECTION : texte forcé blanc sur fond sombre */
.lp-rosary-text .lp-h2 { color: #fff8ec; }
.lp-rosary-text .lp-copy { color: rgba(255,248,236,.68); }
.lp-demo-card { border: 1px solid rgba(255,248,236,.09); border-radius: 26px; background: rgba(255,255,255,.042); padding: 18px; }
.lp-prayer-status { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 12px 14px; border-radius: 16px; background: rgba(255,248,236,.065); border: 1px solid rgba(255,248,236,.08); }
.lp-prayer-status strong { display: block; font-family: var(--lp-serif); font-size: 19px; line-height: 1; letter-spacing: -.03em; color: #fff8ec; margin-bottom: 4px; }
.lp-prayer-status span { color: rgba(255,248,236,.5); font-size: 12px; line-height: 1.35; }
.lp-status-dot { width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0; margin-top: 4px; background: var(--lp-gold); box-shadow: 0 0 0 6px rgba(201,154,53,.14), 0 0 14px rgba(201,154,53,.55); }
/* CORRECTION : mode-cards compressées pour tout voir sur mobile */
.lp-prayer-mode { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.lp-mode-card { padding: 12px 14px; border-radius: 16px; border: 1px solid rgba(255,248,236,.08); background: rgba(255,255,255,.038); }
.lp-mode-card b { display: block; font-family: var(--lp-serif); font-size: 20px; line-height: 1; letter-spacing: -.04em; margin-bottom: 5px; color: #fff8ec; }
.lp-mode-card p { margin: 0; color: rgba(255,248,236,.55); font-size: 12px; line-height: 1.4; }
/* CORRECTION : chapelet plus compact */
.lp-rosary-wrap { display: flex; justify-content: center; align-items: center; position: relative; padding: 16px 0 12px; }
.lp-rosary-ring { position: relative; width: 96px; height: 96px; border: 1px solid rgba(255,248,236,.15); border-radius: 999px; }
.lp-bead { --a: 0deg; position: absolute; left: 50%; top: 50%; width: 7px; height: 7px; margin: -3.5px; border-radius: 999px; background: rgba(255,248,236,.3); transform: rotate(var(--a)) translateX(48px); }
.lp-bead.done { background: rgba(201,154,53,.7); }
.lp-bead.current { background: var(--lp-gold); box-shadow: 0 0 0 6px rgba(201,154,53,.16); }
.lp-rosary-cross { position: absolute; left: 50%; top: calc(50% + 64px); width: 14px; height: 22px; transform: translateX(-50%); color: var(--lp-gold); }
.lp-rosary-cross::before, .lp-rosary-cross::after { content: ''; position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); background: currentColor; border-radius: 999px; }
.lp-rosary-cross::before { width: 2px; height: 26px; }
.lp-rosary-cross::after { width: 16px; height: 2px; top: 42%; }
.lp-progress { height: 7px; border-radius: 999px; background: rgba(255,255,255,.10); overflow: hidden; margin-top: 12px; }
.lp-progress span { display: block; width: 62%; height: 100%; background: var(--lp-gold); border-radius: 999px; }

/* ── POUR VOUS SI ─────────────────────────────────────── */
.lp-forvous-section { background: var(--lp-night); border-top: 1px solid rgba(255,248,236,.055); border-bottom: 1px solid rgba(255,248,236,.055); padding: 64px 0; color: #fff8ec; font-family: var(--lp-sans); }
.lp-forvous-head { text-align: center; margin-bottom: 40px; }
.lp-forvous-head .lp-h2 { max-width: 640px; margin: 12px auto 0; }
.lp-forvous-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; max-width: 880px; margin: 0 auto; }
.lp-forvous-item { display: flex; align-items: flex-start; gap: 12px; padding: 18px 20px; border-radius: 18px; border: 1px solid rgba(255,248,236,.07); background: rgba(255,255,255,.032); transition: background .2s var(--lp-ease), border-color .2s var(--lp-ease); }
.lp-forvous-item:hover { background: rgba(255,255,255,.052); border-color: rgba(201,154,53,.2); }
.lp-forvous-check { flex-shrink: 0; width: 22px; height: 22px; border-radius: 999px; margin-top: 1px; border: 1px solid rgba(201,154,53,.36); background: rgba(201,154,53,.09); display: grid; place-items: center; color: var(--lp-gold); font-size: 11px; }
.lp-forvous-content { min-width: 0; }
.lp-forvous-item h3 { margin: 0 0 3px; font-size: 15px; font-weight: 800; letter-spacing: -.01em; color: #fff8ec; line-height: 1.3; }
.lp-forvous-body { margin: 0; font-size: 13px; line-height: 1.55; color: rgba(255,248,236,.48); }

/* ── L'ÂME ─────────────────────────────────────────────── */
.lp-mission { background: rgba(235,227,214,.55); border-top: 1px solid var(--lp-line); border-bottom: 1px solid var(--lp-line); font-family: var(--lp-sans); }
.lp-mission-card { max-width: 940px; margin: 0 auto; text-align: center; padding: 72px clamp(20px,5vw,88px); border-radius: var(--lp-r-lg); border: 1px solid rgba(201,154,53,.22); background: radial-gradient(circle at 50% 18%, rgba(201,154,53,.10), transparent 28rem), rgba(245,238,226,.78); box-shadow: var(--lp-shadow); }
.lp-mission-quote { font-style: italic !important; font-size: clamp(24px,3vw,46px) !important; line-height: 1.1 !important; letter-spacing: -.04em !important; }
.lp-mission-ref { font-size: 11px !important; font-weight: 800 !important; letter-spacing: .14em !important; text-transform: uppercase !important; color: var(--lp-gold-deep) !important; margin-top: 10px !important; }
.lp-mission-body { max-width: 620px; margin: 20px auto 0; font-size: 17px; }

/* ── CONFIANCE ─────────────────────────────────────────── */
.lp-trust-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
.lp-trust { padding: 22px; border-radius: 22px; background: rgba(255,255,255,.66); border: 1px solid var(--lp-line); }
.lp-trust b { display: block; font-size: 15px; margin-bottom: 8px; color: var(--lp-ink); }
.lp-trust p { margin: 0; color: var(--lp-ink-soft); line-height: 1.55; font-size: 13.5px; }

/* ── STEPS ─────────────────────────────────────────────── */
.lp-steps { display: grid; margin-top: 32px; }
.lp-step { display: grid; grid-template-columns: 72px 1fr; gap: 20px; padding: 28px 0; border-bottom: 1px solid var(--lp-line); }
.lp-step:last-child { border-bottom: none; }
.lp-step-num { font-family: var(--lp-serif); font-size: 40px; font-weight: 700; color: rgba(201,154,53,.34); line-height: 1; }
.lp-step h3 { margin: 0 0 6px; font-size: 20px; color: var(--lp-ink); }
.lp-step p { margin: 0; color: var(--lp-ink-soft); line-height: 1.65; font-size: 15px; }

/* ── FAQ ───────────────────────────────────────────────── */
.lp-faq-section { background: rgba(235,227,214,.44); border-top: 1px solid var(--lp-line); border-bottom: 1px solid var(--lp-line); font-family: var(--lp-sans); }
.lp-faq-head { text-align: center; margin-bottom: 32px; }
.lp-faq-list { max-width: 820px; margin: 0 auto; display: grid; gap: 10px; }
.lp-faq-list details { border: 1px solid var(--lp-line); border-radius: 16px; background: rgba(255,255,255,.8); overflow: hidden; }
.lp-faq-list summary { list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px 22px; font-weight: 800; font-size: 15px; cursor: pointer; min-height: 56px; -webkit-tap-highlight-color: transparent; color: var(--lp-ink); }
.lp-faq-list summary::-webkit-details-marker { display: none; }
.lp-faq-list summary::after { content: '+'; color: var(--lp-gold-deep); font-size: 20px; flex-shrink: 0; }
.lp-faq-list details[open] summary::after { content: '–'; }
.lp-faq-list details p { margin: 0; padding: 0 22px 18px; color: var(--lp-ink-soft); line-height: 1.7; font-size: 15px; }

/* ── FINAL CTA — CORRECTION : fond or, texte foncé ────── */
.lp-final-cta {
  background: linear-gradient(145deg, #dfb652 0%, #c49030 50%, #a8751f 100%);
  color: var(--lp-night);
  text-align: center;
  padding: 80px 0 64px;
  padding-bottom: calc(64px + env(safe-area-inset-bottom));
  font-family: var(--lp-sans);
}
.lp-cta-cross { display: block; font-family: var(--lp-serif); font-size: 28px; color: rgba(17,16,11,.35); margin-bottom: 16px; line-height: 1; }
.lp-cta-title { font-size: clamp(32px,4.2vw,60px) !important; color: var(--lp-night) !important; }
.lp-cta-lead { color: rgba(17,16,11,.68) !important; margin: 14px auto 0; max-width: 560px; font-size: clamp(15px,1.5vw,19px); line-height: 1.6; }
.lp-final-cta .lp-btn-dark { background: var(--lp-night); color: #fff8ec; box-shadow: 0 14px 36px rgba(17,16,11,.22); }
.lp-final-cta .lp-btn-outline-dark { border-color: rgba(17,16,11,.3); color: var(--lp-night); }
.lp-cta-micro { color: rgba(17,16,11,.45) !important; margin-top: 20px; font-size: 13px; }

/* ── FOOTER ─────────────────────────────────────────────── */
.lp-footer { background: #18120d; color: rgba(255,248,236,.34); padding: 24px 0; font-size: 13.5px; padding-bottom: calc(24px + env(safe-area-inset-bottom)); font-family: var(--lp-sans); }
.lp-footer-inner { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }

/* ── SCROLL REVEAL ──────────────────────────────────────── */
.lp-reveal { opacity: 0; transform: translateY(20px); transition: opacity .55s var(--lp-ease), transform .55s var(--lp-ease); }
.lp-reveal.lp-visible { opacity: 1; transform: translateY(0); }
.lp-delay-1 { transition-delay: .08s; }
.lp-delay-2 { transition-delay: .16s; }
.lp-delay-3 { transition-delay: .24s; }

/* ══ TABLETTE ≤ 1024 ════════════════════════════════════ */
@media (max-width: 1024px) {
  .lp-nav-links { gap: 20px; font-size: 13px; }
  .lp-trust-grid { grid-template-columns: repeat(2,1fr); }
}

/* ══ MOBILE ≤ 768 ════════════════════════════════════════
   CORRECTIONS principales :
   - Hero centré
   - Section padding réduit
   - Features en layout horizontal compact
   - Espace prière tout visible
   - Pour vous si compact
══════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  :root { --lp-nav-h: 64px; }
  .lp-wrap { width: min(var(--lp-max), calc(100% - 28px)); }
  .lp-section { padding: 48px 0; }

  /* CORRECTION 1 : hero centré */
  .lp-hero { align-items: center; padding: 48px 0; }
  .lp-hero-inner { align-items: center; text-align: center; }
  .lp-hero-pill { align-self: center; font-size: 10px; padding: 6px 12px; letter-spacing: .08em; }
  .lp-hero h1 { font-size: clamp(38px,12vw,60px); letter-spacing: -.05em; margin: 20px 0 16px; max-width: 100%; text-align: center; }
  .lp-hero-lead { text-align: center; font-size: 16px; max-width: 100%; }
  .lp-hero-actions { flex-direction: column; gap: 10px; width: 100%; align-items: center; }
  .lp-hero-actions .lp-btn { width: 100%; max-width: 340px; min-height: 56px; }
  .lp-micro { text-align: center; }

  .lp-nav-links, .lp-nav-actions { display: none; }
  .lp-section-head { grid-template-columns: 1fr; gap: 12px; }
  .lp-section-head .lp-copy { max-width: 100%; }

  /* CORRECTION 2 : features — layout horizontal compact sur mobile */
  .lp-grid-3 { grid-template-columns: 1fr; gap: 10px; }
  .lp-feature { padding: 16px 18px; display: flex; align-items: flex-start; gap: 14px; }
  .lp-feature-icon { font-size: 20px; margin-bottom: 0; flex-shrink: 0; margin-top: 2px; }
  .lp-feature h3 { font-size: 18px; margin-bottom: 4px; }
  .lp-feature p { font-size: 14px; }

  .lp-story-section { padding: 48px 0; }
  .lp-story-grid { grid-template-columns: 1fr; gap: 28px; }
  .lp-story-lines { font-size: clamp(30px,10vw,48px); }

  /* CORRECTION 3 : espace prière — tout visible, 1 colonne */
  .lp-rosary-section { grid-template-columns: 1fr; border-radius: 20px; padding: 20px; gap: 20px; }
  .lp-rosary-text { order: 1; }
  .lp-demo-card { order: 2; padding: 14px; }
  .lp-prayer-mode { gap: 7px; margin-top: 8px; }
  .lp-mode-card { padding: 10px 12px; }
  .lp-mode-card b { font-size: 17px; margin-bottom: 3px; }
  .lp-mode-card p { font-size: 11.5px; }
  .lp-rosary-wrap { padding: 12px 0 8px; }
  .lp-rosary-ring { width: 80px; height: 80px; }
  .lp-bead { transform: rotate(var(--a)) translateX(40px); }
  .lp-rosary-cross { top: calc(50% + 54px); }
  .lp-progress { margin-top: 10px; }

  /* CORRECTION 4 : pour vous si — items compacts, corps masqué sur mobile */
  .lp-forvous-section { padding: 48px 0; }
  .lp-forvous-grid { grid-template-columns: 1fr; max-width: 100%; gap: 8px; }
  .lp-forvous-item { padding: 14px 16px; border-radius: 14px; align-items: center; gap: 10px; }
  .lp-forvous-check { width: 20px; height: 20px; font-size: 10px; }
  .lp-forvous-item h3 { font-size: 14px; margin-bottom: 0; }
  /* Corps masqué sur mobile pour compacité — tout tient à l'écran */
  .lp-forvous-body { display: none; }

  .lp-trust-grid { grid-template-columns: repeat(2,1fr); gap: 10px; }
  .lp-step { grid-template-columns: 50px 1fr; gap: 12px; padding: 22px 0; }
  .lp-step-num { font-size: 30px; }
  .lp-mission-card { padding: 40px 18px; border-radius: 24px; }
  .lp-mission-quote { font-size: clamp(20px,5.5vw,34px) !important; }
  .lp-footer-inner { flex-direction: column; text-align: center; gap: 8px; }

  .lp-final-cta { padding: 56px 0 48px; padding-bottom: calc(48px + env(safe-area-inset-bottom)); }
  .lp-final-cta .lp-hero-actions { flex-direction: column; align-items: center; gap: 10px; }
  .lp-final-cta .lp-hero-actions .lp-btn { width: 100%; max-width: 340px; min-height: 56px; }
  .lp-hero-actions-center { margin-top: 20px; }
}

/* ══ PETIT MOBILE ≤ 480 ══════════════════════════════════ */
@media (max-width: 480px) {
  .lp-hero h1 { font-size: clamp(34px,11.5vw,50px); }
  .lp-enc-meta { grid-template-columns: 1fr; gap: 6px; }
  .lp-trust-grid { grid-template-columns: 1fr; }
  .lp-step { grid-template-columns: 1fr; gap: 4px; padding: 18px 0; }
  .lp-step-num { font-size: 24px; }
  .lp-chrysostome { border-radius: 0 12px 12px 0; padding: 14px 16px; }
  .lp-forvous-head { margin-bottom: 28px; }
}

/* ══ REDUCED MOTION ══════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .lp-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
}
`;
