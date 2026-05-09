"use client";

import { use } from "react";
import { useRouter } from "next/navigation";

const C = {
  bg: "#F2EBE0", card: "#FFFFFF", cardBorder: "rgba(17,16,9,0.10)",
  cream: "#E8DDD0", creamGold: "#F5EDE0", gold: "#B8893A",
  goldBorder: "rgba(184,137,58,0.35)", ink: "#111009",
  ink80: "rgba(17,16,9,0.80)", ink65: "rgba(17,16,9,0.65)",
  ink50: "rgba(17,16,9,0.50)", ink35: "rgba(17,16,9,0.35)",
  ink12: "rgba(17,16,9,0.12)",
  serif: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  sans: "'DM Sans',system-ui,sans-serif",
};

const PRAYERS_DATA: Record<string, {
  title: string;
  subtitle: string;
  origin: string;
  text: string;
  verses?: string;
  purpose: string; // ← explication du but de la prière
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
    purpose: "La prière centrale du christianisme, donnée par Jésus lui-même. Elle résume tout : reconnaissance de Dieu comme Père, demande du pain quotidien (le nécessaire), pardon des offenses, et protection contre le mal. La prier, c'est entrer dans la relation même que Jésus a avec le Père.",
  },
  "je-vous-salue-marie": {
    title: "Je vous salue Marie",
    subtitle: "Ave Maria",
    origin: "Composée à partir des paroles de l'ange Gabriel (Lc 1, 28), d'Élisabeth (Lc 1, 42) et d'une invocation de l'Église médiévale.",
    text: `Je vous salue, Marie pleine de grâce,
le Seigneur est avec vous.
Vous êtes bénie entre toutes les femmes
et Jésus, le fruit de vos entrailles, est béni.

Sainte Marie, Mère de Dieu,
priez pour nous pauvres pécheurs,
maintenant et à l'heure de notre mort.

Amen.`,
    verses: "« Je vous salue, comblée de grâce, le Seigneur est avec vous. » — Lc 1, 28",
    purpose: "Se confier à Marie, Mère de Dieu et notre mère. Elle n'est pas un intermédiaire qui nous éloigne du Christ — elle nous y conduit. La prier, c'est demander à une mère d'intercéder pour nous auprès de son Fils. La seconde partie est une supplication pour deux moments décisifs : maintenant, et à l'heure de notre mort.",
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

Prions.

Répandez, Seigneur, votre grâce en nos âmes,
afin que nous qui avons connu l'Incarnation de votre Fils,
nous arrivions par sa Passion et par sa Croix
à la gloire de la Résurrection.
Par Jésus-Christ notre Seigneur. Amen.`,
    verses: "« L'ange dit à Marie : Réjouis-toi, comblée de grâce. » — Lc 1, 28",
    purpose: "Sanctifier le temps. Récitée trois fois par jour depuis le Moyen Âge, cette prière interrompt l'activité quotidienne pour se souvenir que Dieu s'est fait homme. En trois couplets, elle relit l'Annonciation à Marie. C'est une façon de ne jamais laisser Dieu hors de sa journée.",
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
    purpose: "Rendre gloire à Dieu pour ce qu'il est, sans rien demander. Cette prière est pure adoration : elle reconnaît que Dieu existait avant toutes choses, qu'il existe maintenant, et qu'il existera pour toujours. La prier, c'est sortir de soi pour contempler la grandeur de Dieu.",
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
    purpose: "Renouveler son acte de foi librement et consciemment. La foi n'est pas une évidence permanente — elle traverse des doutes, des sécheresses, des nuits. Cet acte de foi dit : même si je ne ressens rien, même si je doute, je choisis de croire. C'est un acte de volonté autant que de cœur.",
  },
  "acte-de-contrition": {
    title: "Acte de contrition",
    subtitle: "Actus Contritionis",
    origin: "Prière de repentance exprimant le regret sincère des péchés et la résolution de s'en corriger.",
    text: `Mon Dieu, j'ai un très grand regret
de vous avoir offensé,
parce que vous êtes infiniment bon
et que le péché vous déplaît.

Je prends la ferme résolution,
avec le secours de votre sainte grâce,
de ne plus vous offenser
et de faire pénitence.

Amen.`,
    verses: "« Repentez-vous, car le Royaume des cieux est tout proche. » — Mt 4, 17",
    purpose: "Exprimer le regret sincère de ses fautes et la volonté de s'en corriger. Cette prière n'est pas un exercice de culpabilité — c'est un acte de confiance. Reconnaître qu'on a mal agi, c'est croire que Dieu peut pardonner. Elle prépare à recevoir le sacrement de réconciliation.",
  },
  "avant-le-repas": {
    title: "Bénédicité",
    subtitle: "Avant le repas",
    origin: "Prière de bénédiction avant les repas, issue de la tradition juive et chrétienne de rendre grâce pour la nourriture.",
    text: `Bénissez-nous, Seigneur,
bénissez ce repas,
ceux qui l'ont préparé,
et procurez du pain
à ceux qui n'en ont pas.

Amen.`,
    verses: "« Il prit les cinq pains et les deux poissons, leva les yeux au ciel, prononça la bénédiction, rompit les pains. » — Mc 6, 41",
    purpose: "Sanctifier le repas et reconnaître que la nourriture est un don. Cette prière de quelques mots crée une pause sacrée avant de manger. Elle rappelle que nous ne sommes pas seuls — d'autres n'ont pas ce pain — et que tout ce que nous recevons vient d'une main invisible.",
  },
  "grace-apres-repas": {
    title: "Grâces après le repas",
    subtitle: "Action de grâces",
    origin: "Prière de remerciement après les repas, pratiquée dans les monastères et les familles chrétiennes.",
    text: `Nous vous rendons grâces, Seigneur,
pour tous vos bienfaits,
vous qui vivez et régnez
pour les siècles des siècles.

Amen.`,
    verses: "« Rendez grâces en toutes circonstances. » — 1 Th 5, 18",
    purpose: "Remercier après avoir reçu, pas seulement avant de demander. C'est l'attitude de l'un des dix lépreux guéris qui revint vers Jésus pour le remercier. Dans une culture qui oublie facilement la gratitude, cette prière après le repas est un acte de mémoire spirituelle.",
  },
  "pour-les-defunts": {
    title: "Pour les défunts",
    subtitle: "Requiem aeternam",
    origin: "Prière de l'Église pour les âmes du purgatoire, tirée de la Liturgie des morts.",
    text: `Donnez-leur, Seigneur,
le repos éternel,
et que la lumière sans fin les illumine.

Qu'ils reposent en paix.

Amen.`,
    verses: "« Bienheureux les morts qui meurent dans le Seigneur. » — Ap 14, 13",
    purpose: "Prier pour ceux qui nous ont précédés dans la mort. La foi chrétienne enseigne que le lien d'amour ne s'arrête pas à la mort. Prier pour les défunts, c'est continuer à les aimer, à les confier à la miséricorde de Dieu. C'est aussi une manière de se préparer soi-même à la mort.",
  },
  "de-profundis": {
    title: "De profundis",
    subtitle: "Psaume 130",
    origin: "Psaume pénitentiel dit lors des offices pour les défunts. L'un des sept psaumes de la pénitence.",
    text: `Du fond de l'abîme je crie vers toi, Seigneur.
Seigneur, écoute mon appel.

Que ton oreille se fasse attentive
au cri de ma supplication.

Si tu retiens les fautes, Seigneur,
Seigneur, qui pourra subsister ?
Mais près de toi se trouve le pardon
pour que l'homme te craigne.

J'espère le Seigneur,
mon âme espère,
et j'attends sa parole.

Mon âme attend le Seigneur
plus qu'un veilleur de nuit ne guette l'aurore.

Israël, espère le Seigneur,
car près du Seigneur est la grâce,
et chez lui abonde la délivrance.

C'est lui qui délivrera Israël
de toutes ses fautes.`,
    verses: "« Du fond de l'abîme je crie vers toi, Seigneur. » — Ps 130, 1",
    purpose: "Prier depuis le fond de la détresse — pour soi ou pour les défunts. Ce psaume commence dans la profondeur de la souffrance et de la faute, et se termine dans l'espérance. Il dit que même depuis le plus bas, on peut encore appeler Dieu. C'est la prière de ceux qui n'ont plus rien que l'espoir.",
  },
  "salve-regina": {
    title: "Salve Regina",
    subtitle: "Je vous salue, Reine",
    origin: "Attribuée à Hermann le Boiteux (XIe siècle). Chantée à la fin du chapelet et des Complies.",
    text: `Je vous salue, Reine, Mère de miséricorde,
notre vie, notre douceur, notre espérance, salut !

Enfants d'Ève, nous crions vers vous du fond de cet exil.
Nous soupirons vers vous en gémissant,
dans cette vallée de larmes.

Tournez donc vers nous vos yeux miséricordieux,
ô notre Avocate.
Et après cet exil, montrez-nous Jésus,
le fruit béni de vos entrailles.

Ô clémente, ô pieuse,
ô douce Vierge Marie.

Amen.`,
    verses: "« Voilà ta mère. » — Jn 19, 27",
    purpose: "Une supplication à Marie dans la condition humaine de l'exil et de la souffrance. Cette prière ancienne est une des plus belles de la tradition catholique. Elle ne minimise pas la douleur humaine — elle la nomme ('vallée de larmes') — mais la confie à Marie. Prière de clôture de la journée ou du chapelet.",
  },
  "memorare": {
    title: "Memorare",
    subtitle: "Souviens-toi, ô Marie",
    origin: "Attribuée à saint Bernard de Clairvaux (XIIe siècle). Tradition catholique depuis le XVe siècle.",
    text: `Souvenez-vous, ô très pieuse Vierge Marie,
qu'on n'a jamais entendu dire
qu'aucun de ceux qui ont eu recours à votre protection,
imploré votre assistance
ou réclamé votre intercession
ait été abandonné.

Animé d'une telle confiance,
je cours vers vous,
ô Vierge des vierges, ô ma Mère.

Je viens vers vous et, pécheur repentant,
je me prosterne à vos pieds.

Ô Mère du Verbe incarné,
ne méprisez pas mes prières,
mais dans votre bonté, écoutez-les et exaucez-les.

Amen.`,
    verses: "« Femme, voilà ton fils. » Puis au disciple : « Voilà ta mère. » — Jn 19, 26-27",
    purpose: "Prier avec une confiance absolue en l'intercession de Marie. Ce qui distingue le Memorare, c'est sa promesse radicale : personne n'a jamais été abandonné par Marie. C'est une prière de détresse extrême autant que de confiance sereine. La prier, c'est s'abandonner à la tendresse maternelle de Marie.",
  },
  "magnificat": {
    title: "Magnificat",
    subtitle: "Le cantique de Marie",
    origin: "Cantique de Marie à Élisabeth (Lc 1, 46-55). Prié chaque soir aux Vêpres dans la Liturgie des Heures.",
    text: `Mon âme exalte le Seigneur,
exulte mon esprit en Dieu, mon Sauveur.

Il s'est penché sur son humble servante,
désormais tous les âges me diront bienheureuse.

Le Puissant fit pour moi des merveilles,
saint est son nom.

Son amour s'étend d'âge en âge
sur ceux qui le craignent.

Déployant la force de son bras,
il disperse les superbes.
Il renverse les puissants de leurs trônes,
il élève les humbles.

Il comble de biens les affamés,
renvoie les riches les mains vides.

Il relève Israël son serviteur,
il se souvient de son amour,
de la promesse faite à nos pères,
en faveur d'Abraham et de sa race à jamais.

Amen.`,
    verses: "« Mon âme exalte le Seigneur, exulte mon esprit en Dieu, mon Sauveur. » — Lc 1, 46-47",
    purpose: "La plus grande prière de Marie — et l'une des plus subversives de la Bible. Le Magnificat dit que Dieu prend le parti des pauvres, des humbles, des affamés. Ce n'est pas une prière de pieuse résignation : c'est un cri de joie et de justice. La prier, c'est voir le monde avec les yeux de Marie.",
  },
  "je-vous-salue-reine": {
    title: "Je vous salue, Reine",
    subtitle: "Salve Regina",
    origin: "Antienne mariale chantée à la fin du chapelet, attribuée à Hermann le Boiteux (XIe siècle).",
    text: `Je vous salue, Reine, Mère de miséricorde,
notre vie, notre douceur, notre espérance, salut !

Enfants d'Ève, nous crions vers vous du fond de cet exil.
Nous soupirons vers vous en gémissant,
dans cette vallée de larmes.

Tournez donc vers nous vos yeux miséricordieux.
Et après cet exil, montrez-nous Jésus,
le fruit béni de vos entrailles.

Ô clémente, ô pieuse, ô douce Vierge Marie.

Amen.`,
    purpose: "Clore une prière ou une journée en se confiant à Marie. Cette prière ancienne dit avec une grande beauté la condition humaine : nous sommes en exil, dans une vallée de larmes, mais nous ne sommes pas seuls. Marie nous accompagne et intercède pour nous.",
  },
  "pater-noster": {
    title: "Pater Noster",
    subtitle: "Notre Père en latin",
    origin: "Version originale latine du Notre Père, en usage dans l'Église depuis les premiers siècles.",
    text: `Pater noster, qui es in caelis,
sanctificetur nomen tuum.
Adveniat regnum tuum.
Fiat voluntas tua,
sicut in caelo et in terra.

Panem nostrum quotidianum da nobis hodie.
Et dimitte nobis debita nostra,
sicut et nos dimittimus debitoribus nostris.
Et ne nos inducas in tentationem,
sed libera nos a malo.

Amen.`,
    verses: "« Voici donc comment vous devez prier. » — Mt 6, 9",
    purpose: "Prier dans la langue qui a traversé deux mille ans d'histoire chrétienne. Le latin n'est pas une barrière : c'est un pont vers l'Église universelle. Prié par des générations de saints, de moines, de fidèles sur tous les continents, ce Notre Père unit à l'Église de tous les temps.",
  },
  "ave-maria-latin": {
    title: "Ave Maria",
    subtitle: "Je vous salue Marie en latin",
    origin: "Version latine de la prière mariale, héritée de la tradition romaine.",
    text: `Ave Maria, gratia plena,
Dominus tecum.
Benedicta tu in mulieribus,
et benedictus fructus ventris tui, Iesus.

Sancta Maria, Mater Dei,
ora pro nobis peccatoribus,
nunc et in hora mortis nostrae.

Amen.`,
    purpose: "Se recueillir dans la prière mariale la plus ancienne. Comme le Pater Noster, l'Ave Maria en latin unit à des siècles de prière. Il a été murmuré dans les tranchées, dans les prisons, sur les lits de mort. Le prier en latin, c'est rejoindre une immense chaîne de fidèles.",
  },
};

export default function PrayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const prayer = PRAYERS_DATA[slug];

  const goBack = () => {
    router.push("/dashboard/spiritual#prieres");
  };

  if (!prayer) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <p style={{ fontFamily: C.serif, fontSize: "22px", color: C.ink, marginBottom: "14px" }}>Prière introuvable</p>
        <button onClick={goBack} style={{ padding: "10px 24px", borderRadius: "99px", border: `1.5px solid ${C.ink12}`, background: "none", cursor: "pointer", fontSize: "13px", color: C.ink }}>
          ← Retour
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .fu{animation:fu .4s cubic-bezier(.16,1,.3,1) both}
      `}</style>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(242,235,224,0.96)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.ink12}`, padding: "0 16px", height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={goBack} style={{ display: "flex", alignItems: "center", gap: "5px", background: "none", border: "none", cursor: "pointer", color: C.ink50, fontSize: "12px", padding: 0, fontFamily: C.sans }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Prières
        </button>
        <span style={{ fontFamily: C.serif, fontSize: "15px", color: C.ink65, fontStyle: "italic" }}>{prayer.title}</span>
        <div style={{ width: "50px" }} />
      </header>

      <main style={{ maxWidth: "520px", margin: "0 auto", padding: "20px 16px 60px" }}>
        <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* En-tête compact */}
          <div style={{ textAlign: "center", paddingBottom: "4px" }}>
            <p style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase", color: C.ink35, marginBottom: "6px", fontFamily: C.sans }}>{prayer.subtitle}</p>
            <h1 style={{ fontFamily: C.serif, fontSize: "30px", fontWeight: 300, color: C.ink, lineHeight: 1.1, marginBottom: "8px" }}>{prayer.title}</h1>
            <p style={{ fontSize: "12px", fontWeight: 300, lineHeight: 1.55, color: C.ink50, maxWidth: "340px", margin: "0 auto" }}>{prayer.origin}</p>
          </div>

          {/* Séparateur */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: `rgba(17,16,9,0.08)` }} />
            <span style={{ color: C.gold, fontSize: "12px" }}>✦</span>
            <div style={{ flex: 1, height: "1px", background: `rgba(17,16,9,0.08)` }} />
          </div>

          {/* Texte de la prière — compact, lineHeight 1.55 */}
          <div style={{ background: C.card, borderRadius: "16px", padding: "20px 18px", border: `1.5px solid ${C.cardBorder}` }}>
            <p style={{ fontFamily: C.serif, fontSize: "19px", fontWeight: 300, lineHeight: 1.55, color: C.ink80, whiteSpace: "pre-line", textAlign: "center", margin: 0 }}>
              {prayer.text}
            </p>
          </div>

          {/* Verset biblique */}
          {prayer.verses && (
            <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(196,154,60,0.06)", border: "1px solid rgba(196,154,60,0.15)", textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "14px", fontStyle: "italic", fontWeight: 300, color: C.ink50, lineHeight: 1.55, margin: 0 }}>
                {prayer.verses}
              </p>
            </div>
          )}

          {/* Explication / But de la prière */}
          <div style={{ background: C.creamGold, borderRadius: "14px", padding: "16px 16px", border: `1.5px solid ${C.goldBorder}` }}>
            <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "8px" }}>
              Pourquoi cette prière ?
            </p>
            <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink65, lineHeight: 1.60, margin: 0 }}>
              {prayer.purpose}
            </p>
          </div>

          {/* Autres prières */}
          <div style={{ marginTop: "4px" }}>
            <p style={{ fontSize: "10px", fontWeight: 500, color: C.ink35, marginBottom: "8px", letterSpacing: "1px", textTransform: "uppercase", fontFamily: C.sans }}>
              Autres prières
            </p>
            <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
              {Object.entries(PRAYERS_DATA)
                .filter(([s]) => s !== slug)
                .slice(0, 5)
                .map(([s, p], i, arr) => (
                  <button key={s} onClick={() => router.push(`/dashboard/spiritual/prieres/${s}`)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: "none", border: "none", borderBottom: i < arr.length - 1 ? `1px solid ${C.ink12}` : "none", cursor: "pointer", textAlign: "left", width: "100%" }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: C.ink, margin: "0 0 1px", fontFamily: C.sans }}>{p.title}</p>
                      <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink50, margin: 0, fontFamily: C.sans }}>{p.subtitle}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M6 4L10 8L6 12" stroke={C.ink35} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ))}
            </div>
          </div>

          {/* Retour */}
          <button onClick={goBack} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: `1.5px solid ${C.ink12}`, background: "none", fontSize: "13px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>
            ← Retour aux prières
          </button>

        </div>
      </main>
    </div>
  );
}
