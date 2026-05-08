import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const footerLinks = {
  Produit: [
    { label: "Fonctionnalités", href: "#fonctionnalites" },
    { label: "Tarifs", href: "#tarifs" },
    { label: "Événements", href: "#" },
    { label: "Cercles locaux", href: "#" },
  ],
  Communauté: [
    { label: "À propos", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Partenaires", href: "#" },
    { label: "Presse", href: "#" },
  ],
  Légal: [
    { label: "Confidentialité", href: "#" },
    { label: "CGU", href: "#" },
    { label: "Mentions légales", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#0D0C08] border-t border-[rgba(255,255,255,0.08)]">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 pb-12 border-b border-[rgba(255,255,255,0.08)]">
          <div className="md:col-span-2">
            <Logo variant="light" size="md" className="mb-4" />
            <p className="text-sm text-[rgba(247,243,236,0.4)] leading-relaxed max-w-xs font-body font-light">
              La communauté catholique du XXI<sup>e</sup> siècle. Des liens
              authentiques, ancrés dans des valeurs partagées.
            </p>
          </div>
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[rgba(247,243,236,0.5)] mb-4 font-body">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-[rgba(247,243,236,0.4)] hover:text-[rgba(247,243,236,0.75)] transition-colors font-body font-light"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-4">
          <p className="text-xs text-[rgba(247,243,236,0.25)] font-body">
            © {new Date().getFullYear()} Fraternitas. Fait avec ✦ et foi.
          </p>
          <p className="text-xs text-[rgba(247,243,236,0.25)] font-body">
            Conçu pour rapprocher, pas pour remplacer.
          </p>
        </div>
      </div>
    </footer>
  );
}
