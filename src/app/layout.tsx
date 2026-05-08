import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fraternitas — La communauté catholique vivante",
    template: "%s | Fraternitas",
  },
  description:
    "Fraternitas réunit les catholiques pratiquants qui cherchent des amis authentiques, une communauté locale et une vie de foi incarnée dans le monde réel.",
  keywords: ["catholique", "communauté", "foi", "fraternité", "cercle local"],
  openGraph: {
    title: "Fraternitas — La communauté catholique vivante",
    description: "Ne vivez plus votre foi seul. Rejoignez Fraternitas.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-cream antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
