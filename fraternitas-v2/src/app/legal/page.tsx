import Link from "next/link";

export const metadata = {
  title: "Mentions légales — Fraternitas",
};

function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
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

      {/* Contenu */}
      <div className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-xs font-medium tracking-widest uppercase mb-6" style={{ color: "rgba(196,154,60,0.7)" }}>
          Informations légales
        </p>
        <h1 style={{
          fontFamily: "'Cormorant Garamond',Georgia,serif",
          fontSize: "clamp(32px,5vw,52px)", fontWeight: 400,
          color: "#111009", lineHeight: 1.1, marginBottom: "3rem",
        }}>
          {title}
        </h1>
        <div style={{ color: "rgba(17,16,9,0.68)", fontSize: "15px", lineHeight: 1.8 }}>
          {children}
        </div>
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

export default function LegalPage() {
  return (
    <LegalLayout title="Mentions légales">
      <Section title="Éditeur du site">
        <p>Le site <strong>fraternitas.app</strong> est édité par :</p>
        <ul>
          <li><strong>Raison sociale :</strong> Fraternitas (en cours d&rsquo;immatriculation)</li>
          <li><strong>Forme juridique :</strong> À préciser selon l&rsquo;immatriculation</li>
          <li><strong>Adresse :</strong> France</li>
          <li><strong>Email :</strong> <a href="mailto:contact@fraternitas.app" style={{ color: "#C49A3C" }}>contact@fraternitas.app</a></li>
        </ul>
        <p className="mt-4 text-sm" style={{ color: "rgba(17,16,9,0.45)" }}>
          Les présentes mentions légales seront mises à jour dès l&rsquo;immatriculation officielle de la structure juridique.
        </p>
      </Section>

      <Section title="Directeur de la publication">
        <p>Le directeur de la publication est le représentant légal de Fraternitas.</p>
      </Section>

      <Section title="Hébergement">
        <p>Le site est hébergé par :</p>
        <ul>
          <li><strong>Hébergeur :</strong> Netlify, Inc.</li>
          <li><strong>Adresse :</strong> 512 2nd Street, Suite 200, San Francisco, CA 94107, États-Unis</li>
          <li><strong>Site :</strong> <a href="https://www.netlify.com" target="_blank" rel="noreferrer" style={{ color: "#C49A3C" }}>netlify.com</a></li>
        </ul>
        <p className="mt-2">La base de données est hébergée par :</p>
        <ul>
          <li><strong>Fournisseur :</strong> Neon, Inc.</li>
          <li><strong>Site :</strong> <a href="https://neon.tech" target="_blank" rel="noreferrer" style={{ color: "#C49A3C" }}>neon.tech</a></li>
        </ul>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          L&rsquo;ensemble des contenus présents sur Fraternitas (textes, logos, graphismes, interfaces)
          sont la propriété exclusive de Fraternitas et sont protégés par les lois françaises et
          internationales relatives à la propriété intellectuelle.
        </p>
        <p className="mt-3">
          Toute reproduction, distribution, modification ou utilisation de ces contenus sans
          autorisation préalable écrite est strictement interdite.
        </p>
      </Section>

      <Section title="Limitation de responsabilité">
        <p>
          Fraternitas s&rsquo;efforce d&rsquo;assurer l&rsquo;exactitude et la mise à jour des informations diffusées
          sur ce site. Cependant, Fraternitas ne peut garantir l&rsquo;exactitude, la précision ou
          l&rsquo;exhaustivité des informations mises à disposition.
        </p>
        <p className="mt-3">
          Fraternitas ne saurait être tenu responsable des dommages directs ou indirects résultant
          de l&rsquo;utilisation du site ou de l&rsquo;impossibilité d&rsquo;y accéder.
        </p>
      </Section>

      <Section title="Droit applicable">
        <p>
          Les présentes mentions légales sont soumises au droit français. En cas de litige,
          les tribunaux français seront seuls compétents.
        </p>
      </Section>

      <p className="mt-12 text-xs" style={{ color: "rgba(17,16,9,0.35)" }}>
        Dernière mise à jour : mai 2026
      </p>
    </LegalLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 style={{
        fontFamily: "'Cormorant Garamond',Georgia,serif",
        fontSize: "22px", fontWeight: 400,
        color: "#111009", marginBottom: "1rem",
      }}>
        {title}
      </h2>
      <div style={{ color: "rgba(17,16,9,0.65)", fontSize: "15px", lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}
