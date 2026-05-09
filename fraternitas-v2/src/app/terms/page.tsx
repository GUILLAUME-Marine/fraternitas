import Link from "next/link";

export const metadata = {
  title: "Conditions Générales d'Utilisation — Fraternitas",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 style={{
        fontFamily: "'Cormorant Garamond',Georgia,serif",
        fontSize: "22px", fontWeight: 400,
        color: "#111009", marginBottom: "1rem",
        paddingTop: "1.5rem",
        borderTop: "1px solid rgba(17,16,9,0.08)",
      }}>
        {title}
      </h2>
      <div style={{ color: "rgba(17,16,9,0.65)", fontSize: "15px", lineHeight: 1.85 }}>
        {children}
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div style={{ background: "#F7F3EC", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#111009", borderBottom: "1px solid rgba(247,243,236,0.06)" }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12.5" stroke="#C49A3C" strokeWidth="1" />
              <line x1="14" y1="4.5" x2="14" y2="23.5" stroke="#C49A3C" strokeWidth="1.3" />
              <line x1="8.5" y1="11" x2="19.5" y2="11" stroke="#C49A3C" strokeWidth="1.3" />
            </svg>
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "17px", color: "rgba(247,243,236,0.8)" }}>
              Fraternitas
            </span>
          </Link>
          <Link href="/" className="text-xs font-medium transition-opacity hover:opacity-60" style={{ color: "rgba(247,243,236,0.4)" }}>
            ← Retour à l&rsquo;accueil
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-xs font-medium tracking-widest uppercase mb-6" style={{ color: "rgba(196,154,60,0.7)" }}>
          Conditions d&rsquo;utilisation
        </p>
        <h1 style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif",
          fontSize: "clamp(30px,5vw,50px)", fontWeight: 400,
          color: "#111009", lineHeight: 1.12, marginBottom: "1rem",
        }}>
          Conditions Générales d&rsquo;Utilisation
        </h1>
        <p className="mb-12 text-sm font-light" style={{ color: "rgba(17,16,9,0.45)" }}>
          En vigueur au 1er mai 2026
        </p>

        <div style={{ color: "rgba(17,16,9,0.65)", fontSize: "15px", lineHeight: 1.85 }}>
          <p className="mb-8">
            Les présentes Conditions Générales d&rsquo;Utilisation (ci-après « CGU ») régissent
            l&rsquo;accès et l&rsquo;utilisation de la plateforme Fraternitas, accessible à l&rsquo;adresse
            <strong style={{ color: "#111009" }}> fraternitas.app</strong>.
            En vous inscrivant sur Fraternitas, vous acceptez sans réserve les présentes CGU.
          </p>
        </div>

        <Section title="Article 1 — Objet">
          <p>
            Fraternitas est une plateforme communautaire catholique dont l&rsquo;objet est de permettre
            à ses membres de se rencontrer, de rejoindre des cercles locaux, de participer à des
            événements et de partager une vie spirituelle commune.
          </p>
          <p className="mt-3">
            La plateforme est accessible à toute personne majeure qui se reconnaît dans la foi catholique
            ou qui souhaite en apprendre davantage sur elle.
          </p>
        </Section>

        <Section title="Article 2 — Création de compte">
          <p>
            Pour accéder aux fonctionnalités de Fraternitas, vous devez créer un compte en fournissant
            des informations exactes, complètes et à jour. Vous êtes responsable de la confidentialité
            de vos identifiants de connexion.
          </p>
          <p className="mt-3">
            Vous vous engagez à ne créer qu&rsquo;un seul compte et à ne pas usurper l&rsquo;identité d&rsquo;un autre
            membre ou d&rsquo;une personne réelle.
          </p>
          <p className="mt-3">
            Fraternitas se réserve le droit de suspendre ou supprimer tout compte en cas de violation
            des présentes CGU, sans préavis.
          </p>
        </Section>

        <Section title="Article 3 — Règles de comportement">
          <p>En utilisant Fraternitas, vous vous engagez à :</p>
          <ul className="mt-3 space-y-2 ml-4" style={{ listStyleType: "disc" }}>
            <li>Respecter les autres membres en toutes circonstances</li>
            <li>Ne pas publier de contenus haineux, diffamatoires, obscènes ou illégaux</li>
            <li>Ne pas harceler, menacer ou intimider d&rsquo;autres membres</li>
            <li>Ne pas utiliser la plateforme à des fins commerciales sans autorisation</li>
            <li>Ne pas tenter de contourner les mesures de sécurité de la plateforme</li>
            <li>Ne pas collecter les données personnelles d&rsquo;autres membres sans leur consentement</li>
          </ul>
          <p className="mt-4">
            Fraternitas est un espace de fraternité et de respect. Tout comportement contraire à
            l&rsquo;esprit de la communauté pourra entraîner la suspension immédiate du compte.
          </p>
        </Section>

        <Section title="Article 4 — Contenus publiés par les membres">
          <p>
            Vous êtes seul responsable des contenus que vous publiez sur Fraternitas (messages,
            photos, descriptions d&rsquo;événements, profil). En publiant un contenu, vous accordez à
            Fraternitas une licence non exclusive d&rsquo;utilisation pour l&rsquo;affichage et le
            fonctionnement de la plateforme.
          </p>
          <p className="mt-3">
            Fraternitas ne modère pas les contenus en temps réel mais se réserve le droit de
            supprimer tout contenu signalé comme contraire aux CGU.
          </p>
        </Section>

        <Section title="Article 5 — Accès et disponibilité">
          <p>
            Fraternitas s&rsquo;efforce d&rsquo;assurer un accès continu à la plateforme, mais ne peut
            garantir une disponibilité sans interruption. Des opérations de maintenance peuvent
            entraîner des interruptions temporaires.
          </p>
        </Section>

        <Section title="Article 6 — Abonnement Premium">
          <p>
            Fraternitas propose un accès de base gratuit. Des fonctionnalités avancées pourront
            être proposées dans le cadre d&rsquo;un abonnement payant, dont les conditions seront
            précisées au moment de la souscription.
          </p>
          <p className="mt-3">
            L&rsquo;abonnement premium est sans engagement, résiliable à tout moment depuis les
            paramètres du compte.
          </p>
        </Section>

        <Section title="Article 7 — Données personnelles">
          <p>
            Le traitement des données personnelles est décrit dans notre{" "}
            <Link href="/privacy" style={{ color: "#C49A3C" }}>Politique de Confidentialité</Link>.
            Conformément au RGPD, vous disposez d&rsquo;un droit d&rsquo;accès, de rectification,
            d&rsquo;effacement et de portabilité de vos données.
          </p>
          <p className="mt-3">
            Pour exercer ces droits, contactez-nous à{" "}
            <a href="mailto:contact@fraternitas.app" style={{ color: "#C49A3C" }}>contact@fraternitas.app</a>.
          </p>
        </Section>

        <Section title="Article 8 — Modification des CGU">
          <p>
            Fraternitas se réserve le droit de modifier les présentes CGU à tout moment.
            Les membres seront informés de toute modification substantielle par email ou
            par notification sur la plateforme. La poursuite de l&rsquo;utilisation de la
            plateforme après notification vaut acceptation des nouvelles CGU.
          </p>
        </Section>

        <Section title="Article 9 — Droit applicable">
          <p>
            Les présentes CGU sont régies par le droit français. Tout litige relatif à
            leur interprétation ou leur exécution sera soumis à la compétence des
            tribunaux français.
          </p>
        </Section>

        <p className="mt-12 text-xs" style={{ color: "rgba(17,16,9,0.35)" }}>
          Dernière mise à jour : mai 2026
        </p>
      </div>

      {/* Footer minimal */}
      <div className="py-8 px-6 border-t" style={{ borderColor: "rgba(17,16,9,0.08)" }}>
        <div className="max-w-3xl mx-auto flex flex-wrap gap-5">
          {[{ label: "Mentions légales", href: "/legal" }, { label: "CGU", href: "/terms" }, { label: "Confidentialité", href: "/privacy" }, { label: "Contact", href: "/contact" }].map(link => (
            <Link key={link.href} href={link.href} className="text-xs font-light transition-opacity hover:opacity-60" style={{ color: "rgba(17,16,9,0.4)" }}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
