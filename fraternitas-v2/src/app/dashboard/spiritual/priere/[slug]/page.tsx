"use client";

import { use } from "react";
import { useRouter } from "next/navigation";

const C = {
  bg: "#F2EBE0", card: "#FFFFFF", cardBorder: "rgba(17,16,9,0.10)",
  cream: "#E8DDD0", creamGold: "#F5EDE0", gold: "#B8893A",
  goldBorder: "rgba(184,137,58,0.35)", ink: "#111009",
  ink80: "rgba(17,16,9,0.80)", ink65: "rgba(17,16,9,0.65)",
  ink50: "rgba(17,16,9,0.50)", ink35: "rgba(17,16,9,0.35)", ink12: "rgba(17,16,9,0.12)",
  serif: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  sans: "'DM Sans',system-ui,sans-serif",
};

// ─── Toutes les prières — 100% complet, aucun slug manquant ──────────────────
const PRAYERS_DATA: Record<string, {
  title: string; subtitle: string; origin: string;
  text: string; verses?: string; purpose: string;
}> = {

  // ── MATIN ──────────────────────────────────────────────────────────────────
  "matin-offre": {
    title: "Je vous offre, Seigneur",
    subtitle: "Offrande du matin",
    origin: "Prière traditionnelle catholique pour offrir sa journée à Dieu dès le réveil.",
    text: `Mon Dieu, je vous offre toute ma journée :
mes prières, mes pensées, mes paroles,
mes actions, mes joies et mes peines,
en union avec Jésus-Christ,
qui s'offre chaque jour dans la sainte Messe
pour la gloire de Dieu et le salut des âmes.

Amen.`,
    purpose: "Commencer la journée en la plaçant sous le regard de Dieu. Ce geste simple transforme chaque moment ordinaire — le trajet, le travail, les repas — en offrande. Ce n'est pas de la piété superficielle : c'est une façon concrète de vivre en présence de Dieu.",
  },

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
    purpose: "La prière centrale du christianisme, donnée par Jésus lui-même. Elle résume tout : reconnaissance de Dieu comme Père, demande du nécessaire, pardon des offenses, et protection contre le mal. La prier, c'est entrer dans la relation même que Jésus a avec le Père.",
  },

  "acte-de-foi": {
    title: "Acte de foi",
    subtitle: "Actus Fidei",
    origin: "Profession de foi personnelle exprimant l'adhésion libre et totale au mystère de Dieu révélé en Jésus-Christ.",
    text: `Mon Dieu, je crois fermement
toutes les vérités que vous avez révélées
et que la sainte Église nous enseigne,
parce que vous êtes la vérité même.

Je crois en vous, Père, Fils et Saint-Esprit,
Dieu unique et Dieu en trois personnes.

Augmentez en moi cette foi.

Amen.`,
    verses: "« Celui qui croit au Fils a la vie éternelle. » — Jn 3, 36",
    purpose: "Renouveler son acte de foi librement et consciemment. La foi traverse des doutes et des nuits. Cet acte de foi dit : même si je ne ressens rien, je choisis de croire. C'est un acte de volonté autant que de cœur.",
  },

  "acte-esperance": {
    title: "Acte d'espérance",
    subtitle: "Actus Spei",
    origin: "Prière classique exprimant la confiance en Dieu et en ses promesses.",
    text: `Mon Dieu, j'espère avec une ferme confiance
que vous me donnerez,
par les mérites de Jésus-Christ,
votre grâce en ce monde
et votre gloire en l'autre,
parce que vous l'avez promis
et que vous êtes infiniment fidèle.

Amen.`,
    purpose: "L'espérance chrétienne n'est pas un vague optimisme — c'est une certitude fondée sur la fidélité de Dieu. Prier cet acte, c'est refuser le découragement et s'ancrer dans une promesse qui tient.",
  },

  "acte-charite": {
    title: "Acte de charité",
    subtitle: "Actus Caritatis",
    origin: "Expression des deux grands commandements donnés par Jésus.",
    text: `Mon Dieu, je vous aime de tout mon cœur,
par-dessus toutes choses,
parce que vous êtes infiniment bon
et infiniment aimable.

Et pour l'amour de vous,
j'aime mon prochain comme moi-même.

Amen.`,
    verses: "« Tu aimeras le Seigneur ton Dieu de tout ton cœur. » — Mt 22, 37",
    purpose: "L'amour de Dieu et l'amour du prochain sont les deux faces d'un même mouvement. Cet acte de charité recentre sur l'essentiel : la relation, pas la règle. La prier, c'est choisir d'aimer même quand on ne le ressent pas.",
  },

  "angelus": {
    title: "L'Angélus",
    subtitle: "Angelus Domini",
    origin: "Prière médiévale récitée trois fois par jour — 6h, 12h, 18h — en souvenir de l'Incarnation.",
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
afin que nous qui avons connu l'Incarnation
de votre Fils Jésus-Christ,
nous arrivions à la gloire de la Résurrection.
Par Jésus-Christ notre Seigneur. Amen.`,
    verses: "« L'ange dit à Marie : Réjouis-toi, comblée de grâce. » — Lc 1, 28",
    purpose: "Sanctifier le temps trois fois par jour. L'Angélus interrompt l'activité pour se souvenir que Dieu s'est fait homme. C'est une façon de ne jamais laisser Dieu hors de sa journée — dans les transports, au bureau, à la maison.",
  },

  "gloire-au-pere": {
    title: "Gloire au Père",
    subtitle: "Gloria Patri",
    origin: "Doxologie trinitaire très ancienne, récitée à la fin des psaumes et du chapelet.",
    text: `Gloire au Père,
et au Fils,
et au Saint-Esprit,

comme il était au commencement,
maintenant et toujours,
dans les siècles des siècles.

Amen.`,
    purpose: "Pure adoration — on ne demande rien, on rend gloire. Cette prière reconnaît que Dieu existait avant toutes choses et existera pour toujours. La prier, c'est sortir de soi pour contempler la grandeur de Dieu.",
  },

  // ── AVANT DE MANGER ────────────────────────────────────────────────────────
  "benedicite-court": {
    title: "Bénédicité bref",
    subtitle: "Avant le repas",
    origin: "Prière simple de bénédiction avant les repas dans la tradition catholique.",
    text: `Bénissez-nous, Seigneur,
bénissez ce repas,
ceux qui l'ont préparé
et procurez du pain
à ceux qui n'en ont pas.

Amen.`,
    purpose: "Créer une pause sacrée avant de manger. Reconnaître que la nourriture est un don, pas un dû. En quelques secondes, on sort de l'automatisme pour se souvenir qu'il y a une main derrière ce qu'on reçoit.",
  },

  "benedicite-long": {
    title: "Bénédicité complet",
    subtitle: "Oculi omnium in te sperant…",
    origin: "Version longue de la tradition monastique bénédictine.",
    text: `Les yeux de tous les êtres se tournent vers vous,
Seigneur,
et vous leur donnez la nourriture en temps voulu.

Vous ouvrez la main
et vous rassasiez avec bienveillance
tout ce qui vit.

Bénissez-nous, Seigneur,
ainsi que ces dons que nous allons recevoir
de votre libéralité,
par Jésus-Christ, notre Seigneur.

Amen.`,
    verses: "« Les yeux de tous se tournent vers toi : tu leur donnes la nourriture en temps voulu. » — Ps 145, 15",
    purpose: "La version longue du bénédicité enracine le repas dans une contemplation plus large : Dieu nourrit toute créature. Prier ceci à table, c'est transformer un geste quotidien en acte de foi.",
  },

  "benedicite-famille": {
    title: "Bénédicité en famille",
    subtitle: "Pour les repas avec enfants",
    origin: "Version courte et accessible, adaptée aux repas en famille avec des enfants.",
    text: `Seigneur, bénis ce repas,
ceux qui l'ont préparé
et ceux qui vont le manger.

Merci pour ce que tu nous donnes chaque jour.

Amen.`,
    purpose: "Initier les enfants à la prière dans les moments ordinaires. Les enfants qui grandissent avec la prière à table intègrent naturellement que Dieu est présent dans le quotidien — pas seulement à l'église.",
  },

  // ── APRÈS LE REPAS ─────────────────────────────────────────────────────────
  "grace-apres-repas": {
    title: "Action de grâces",
    subtitle: "Après le repas",
    origin: "Prière de remerciement après les repas, pratiquée dans les monastères et familles chrétiennes.",
    text: `Nous vous rendons grâces, Seigneur,
pour tous vos bienfaits,
vous qui vivez et régnez
pour les siècles des siècles.

Amen.`,
    verses: "« Rendez grâces en toutes circonstances. » — 1 Th 5, 18",
    purpose: "Remercier après avoir reçu, pas seulement avant de demander. C'est l'attitude de l'un des dix lépreux guéris qui revint vers Jésus pour le remercier. Dans une culture qui oublie la gratitude, cette prière est un acte de mémoire spirituelle.",
  },

  // ── CE SOIR ────────────────────────────────────────────────────────────────
  "examen-soir": {
    title: "Examen de conscience",
    subtitle: "Bilan de la journée",
    origin: "Exercice spirituel ignatien — passer sa journée en revue avec Dieu avant de dormir.",
    text: `Seigneur,
je viens devant vous à la fin de cette journée.

Je vous remercie pour les grâces reçues.

Je vous présente ce qui a été difficile,
ce où j'ai manqué d'amour.

Pardon pour mes fautes.

Entre vos mains je remets ma nuit.

Amen.`,
    purpose: "Clore la journée avec Dieu, pas dans la distraction. L'examen ignatien est une pratique de 500 ans qui aide à voir Dieu dans les événements ordinaires — les consolations, les tensions, les manquements. Cinq minutes qui changent progressivement le regard sur sa vie.",
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
    purpose: "Exprimer le regret sincère de ses fautes et la volonté de s'en corriger. Cette prière n'est pas un exercice de culpabilité — c'est un acte de confiance. Reconnaître qu'on a mal agi, c'est croire que Dieu peut pardonner. Elle prépare à la confession.",
  },

  "salve-regina": {
    title: "Salve Regina",
    subtitle: "Je vous salue, Reine",
    origin: "Attribuée à Hermann le Boiteux (XIe siècle). Chantée à la fin du chapelet et des Complies.",
    text: `Je vous salue, Reine, Mère de miséricorde,
notre vie, notre douceur, notre espérance, salut !

Enfants d'Ève, nous crions vers vous,
gémissants et pleurants dans cette vallée de larmes.

Tournez donc vers nous vos yeux miséricordieux,
ô notre Avocate.

Et après cet exil, montrez-nous Jésus,
le fruit béni de vos entrailles.

Ô clémente, ô pieuse, ô douce Vierge Marie.

Amen.`,
    verses: "« Femme, voilà ton fils. » Puis au disciple : « Voilà ta mère. » — Jn 19, 26-27",
    purpose: "Clore une prière ou une journée en se confiant à Marie. Cette antienne dit avec beauté la condition humaine : nous sommes en exil, dans une vallée de larmes, mais nous ne sommes pas seuls. Marie nous accompagne et intercède pour nous.",
  },

  "complies": {
    title: "Complies",
    subtitle: "Prière du soir de l'Église",
    origin: "Dernière heure canoniale de la journée dans la Liturgie des Heures. Tradition monastique millénaire.",
    text: `Garde-nous, Seigneur,
comme la prunelle de l'œil.

Abrite-nous à l'ombre de tes ailes.

Dans ta main je remets mon esprit.
Tu nous as rachetés, Seigneur,
Dieu de vérité.

Que la nuit soit pour moi une prière.

Amen.`,
    purpose: "La prière du soir de toute l'Église. Chaque soir, des milliers de moines et de religieux du monde entier récitent les Complies avant de dormir. La prier, c'est rejoindre cette voix universelle et s'endormir dans la confiance.",
  },

  // ── DANS L'ÉPREUVE ─────────────────────────────────────────────────────────
  "pour-les-defunts": {
    title: "Pour les défunts",
    subtitle: "Requiem aeternam",
    origin: "Prière de l'Église pour les âmes du purgatoire, tirée de la Liturgie des morts.",
    text: `Donnez-leur, Seigneur,
le repos éternel,
et que la lumière sans fin les illumine.

Qu'ils reposent en paix.

Amen.`,
    purpose: "Prier pour ceux qui nous ont précédés dans la mort. La foi chrétienne enseigne que le lien d'amour ne s'arrête pas à la mort. Prier pour les défunts, c'est continuer à les aimer et les confier à la miséricorde de Dieu.",
  },

  "de-profundis": {
    title: "De profundis",
    subtitle: "Psaume 130",
    origin: "Psaume pénitentiel dit lors des offices pour les défunts. L'un des sept psaumes de la pénitence.",
    text: `Du fond de l'abîme je crie vers toi, Seigneur.
Seigneur, écoute mon appel.

Si tu retiens les fautes, Seigneur,
qui pourra subsister ?
Mais près de toi se trouve le pardon.

J'espère le Seigneur,
mon âme espère,
et j'attends sa parole.

Mon âme attend le Seigneur
plus qu'un veilleur de nuit ne guette l'aurore.

C'est lui qui délivrera Israël
de toutes ses fautes.`,
    verses: "« Du fond de l'abîme je crie vers toi, Seigneur. » — Ps 130, 1",
    purpose: "Prier depuis le fond de la détresse. Ce psaume commence dans la profondeur de la souffrance et se termine dans l'espérance. Il dit que même depuis le plus bas, on peut encore appeler Dieu. C'est la prière de ceux qui n'ont plus rien que l'espoir.",
  },

  "memorare": {
    title: "Memorare",
    subtitle: "Souviens-toi, ô Marie",
    origin: "Attribuée à saint Bernard de Clairvaux (XIIe siècle). Tradition catholique depuis le XVe siècle.",
    text: `Souvenez-vous, ô très pieuse Vierge Marie,
qu'on n'a jamais entendu dire
qu'aucun de ceux qui ont eu recours à votre protection
ait été abandonné.

Animé d'une telle confiance,
je cours vers vous, ô Vierge des vierges.

Je viens vers vous et, pécheur repentant,
je me prosterne à vos pieds.

Ô Mère du Verbe incarné,
ne méprisez pas mes prières,
mais dans votre bonté, écoutez-les et exaucez-les.

Amen.`,
    purpose: "Prier avec une confiance absolue en l'intercession de Marie. Ce qui distingue le Memorare, c'est sa promesse radicale : personne n'a jamais été abandonné. C'est une prière pour les moments de détresse extrême — quand on ne sait plus vers qui se tourner.",
  },

  "maladie": {
    title: "Dans la maladie",
    subtitle: "Pour soi ou un proche",
    origin: "Prière de remise entre les mains de Dieu dans la souffrance physique.",
    text: `Seigneur,
me voici dans la souffrance.
Je ne comprends pas tout ce que tu permets,
mais je sais que tu es là.

Toi qui as souffert aussi,
toi qui as guéri — sois proche.

Donne-moi la force de traverser.
Je m'abandonne à ta volonté,
qui est toujours amour.

Amen.`,
    purpose: "S'adresser à Dieu dans la maladie, la sienne ou celle d'un proche. Cette prière ne demande pas la guérison à tout prix — elle demande la présence de Dieu dans la souffrance. C'est souvent plus puissant : trouver Dieu au cœur de la douleur, pas seulement quand elle disparaît.",
  },

  // ── AVEC MARIE ─────────────────────────────────────────────────────────────
  "je-vous-salue-marie": {
    title: "Je vous salue Marie",
    subtitle: "Ave Maria",
    origin: "Composée à partir des paroles de l'ange Gabriel (Lc 1, 28), d'Élisabeth (Lc 1, 42) et d'une invocation médiévale.",
    text: `Je vous salue, Marie pleine de grâce,
le Seigneur est avec vous.
Vous êtes bénie entre toutes les femmes
et Jésus, le fruit de vos entrailles, est béni.

Sainte Marie, Mère de Dieu,
priez pour nous pauvres pécheurs,
maintenant et à l'heure de notre mort.

Amen.`,
    verses: "« Je vous salue, comblée de grâce, le Seigneur est avec vous. » — Lc 1, 28",
    purpose: "Se confier à Marie comme à une mère. Ce n'est pas adorer Marie — c'est lui demander d'intercéder, comme on demande à un proche de prier pour soi. La seconde partie est une supplication pour deux moments décisifs : maintenant, et à l'heure de la mort.",
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
il se souvient de son amour.

Amen.`,
    verses: "« Mon âme exalte le Seigneur, exulte mon esprit en Dieu, mon Sauveur. » — Lc 1, 46-47",
    purpose: "La plus grande prière de Marie — et l'une des plus fortes de la Bible. Le Magnificat dit que Dieu prend le parti des pauvres et des humbles. Ce n'est pas une prière de résignation : c'est un cri de joie et de justice. La prier, c'est voir le monde avec les yeux de Marie.",
  },

  "je-vous-salue-reine": {
    title: "Je vous salue, Reine",
    subtitle: "Salve Regina",
    origin: "Antienne mariale du XIe siècle, chantée à la fin du chapelet.",
    text: `Je vous salue, Reine, Mère de miséricorde,
notre vie, notre douceur, notre espérance, salut !

Enfants d'Ève, nous crions vers vous
du fond de cet exil.

Tournez vers nous vos yeux miséricordieux.

Ô clémente, ô pieuse,
ô douce Vierge Marie.

Amen.`,
    purpose: "Clore une prière ou une journée en se confiant à Marie. Cette antienne ancienne dit que nous sommes en exil et que Marie intercède pour nous. Prière de paix avant de dormir.",
  },

  // ── EN LATIN ──────────────────────────────────────────────────────────────
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
    purpose: "Prier dans la langue qui a traversé deux mille ans d'histoire chrétienne. Le latin n'est pas une barrière : c'est un pont vers l'Église universelle. Ce Notre Père a été prié par des saints, des moines, des martyrs sur tous les continents.",
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
    purpose: "Se recueillir dans la prière mariale la plus ancienne. L'Ave Maria en latin a été murmuré dans les tranchées, dans les prisons, sur les lits de mort. Le prier, c'est rejoindre une immense chaîne de fidèles à travers les siècles.",
  },

  // ── EN CHEMIN ─────────────────────────────────────────────────────────────
  "avant-examen": {
    title: "Avant un examen",
    subtitle: "Confier son effort à Dieu",
    origin: "Prière de remise avant une épreuve scolaire ou professionnelle.",
    text: `Seigneur,
me voici devant cette épreuve.
J'ai travaillé, je me suis préparé.
Maintenant je te confie le reste.

Donne-moi la paix du cœur
et la clarté de l'esprit.

Que le meilleur de moi-même
puisse s'exprimer aujourd'hui.

Amen.`,
    purpose: "Confier son effort à Dieu avant une épreuve. Cette prière ne demande pas de miracle — elle demande la paix et la clarté. C'est une façon de lâcher prise sur ce qu'on ne contrôle pas, après avoir fait ce qui dépendait de soi.",
  },

  "voyageur": {
    title: "Prière du voyageur",
    subtitle: "Saint Christophe",
    origin: "Saint Christophe est le patron des voyageurs. Sa statue trônait jadis à l'entrée des villes.",
    text: `Seigneur, guide mes pas dans ce voyage.

Saint Christophe, patron des voyageurs,
protège-nous sur la route.

Que nous partions et revenions en paix,
dans ta main à chaque instant.

Amen.`,
    purpose: "Se confier à Dieu avant un voyage. Cette prière très ancienne rappelle que chaque départ et chaque retour est une grâce. Sur la route, en avion ou dans les transports, elle crée un espace de confiance dans l'imprévu.",
  },

  "decision": {
    title: "Avant une décision",
    subtitle: "Veni Sancte Spiritus",
    origin: "Invocation du Saint-Esprit avant un choix important. Tradition catholique millénaire.",
    text: `Viens, Esprit Saint,
remplis le cœur de tes fidèles
et allume en eux le feu de ton amour.

Seigneur, devant ce choix,
ouvre mon cœur à ta lumière.

Donne-moi de vouloir ce que tu veux,
de désirer ce que tu désires.

Amen.`,
    verses: "« L'Esprit Saint vous enseignera toutes choses. » — Jn 14, 26",
    purpose: "Demander la lumière avant une décision importante. Cette prière reconnaît qu'on ne peut pas tout voir seul. L'Esprit Saint, dans la tradition catholique, est celui qui guide vers la vérité — non pas en supprimant la liberté, mais en l'éclairant.",
  },

  "mariage": {
    title: "Pour un mariage",
    subtitle: "Pour les époux",
    origin: "Prière nuptiale pour bénir l'alliance de deux époux.",
    text: `Seigneur, bénis ces deux qui s'aiment.

Fais que leur amour soit plus fort
que leurs peurs et leurs blessures.

Donne-leur la grâce de se choisir encore
quand tout semblera difficile.

Qu'ils soient l'un pour l'autre
signe de ton amour fidèle.

Amen.`,
    purpose: "Prier pour des époux — le jour de leur mariage, ou n'importe quel autre jour. L'amour conjugal est dans la tradition catholique un sacrement — un signe visible de l'amour invisible de Dieu. Prier pour un couple, c'est prier pour que cet amour tienne.",
  },
};

export default function PrayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const prayer = PRAYERS_DATA[slug];

  const goBack = () => router.push("/dashboard/spiritual#prieres");

  if (!prayer) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <p style={{ fontFamily: C.serif, fontSize: "20px", color: C.ink, marginBottom: "6px" }}>Prière introuvable</p>
        <p style={{ fontSize: "12px", color: C.ink50, fontFamily: C.sans, marginBottom: "20px" }}>Slug : {slug}</p>
        <button onClick={goBack} style={{ padding: "10px 24px", borderRadius: "99px", border: `1.5px solid ${C.ink12}`, background: "none", cursor: "pointer", fontSize: "13px", color: C.ink, fontFamily: C.sans }}>
          ← Retour aux prières
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

      {/* Header doré */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "linear-gradient(180deg, #D4A83A 0%, #C49A3C 55%, #B8893A 100%)",
        borderBottom: "1.5px solid #8A6520",
        padding: "0 16px", height: "50px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={goBack} style={{ display: "flex", alignItems: "center", gap: "5px", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.85)", fontSize: "12px", padding: 0, fontFamily: C.sans }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Prières
        </button>
        <span style={{ fontFamily: C.serif, fontSize: "15px", color: "#fff", fontStyle: "italic" }}>{prayer.title}</span>
        <div style={{ width: "50px" }} />
      </header>

      <main style={{ maxWidth: "500px", margin: "0 auto", padding: "16px 16px 50px" }}>
        <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* En-tête compact */}
          <div style={{ textAlign: "center", padding: "4px 0 0" }}>
            <p style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "1.8px", textTransform: "uppercase", color: C.ink35, marginBottom: "4px", fontFamily: C.sans }}>
              {prayer.subtitle}
            </p>
            <h1 style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.1, marginBottom: "6px" }}>
              {prayer.title}
            </h1>
            <p style={{ fontSize: "11px", fontWeight: 300, lineHeight: 1.50, color: C.ink50, maxWidth: "320px", margin: "0 auto" }}>
              {prayer.origin}
            </p>
          </div>

          {/* Séparateur */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(17,16,9,0.08)" }} />
            <span style={{ color: C.gold, fontSize: "11px" }}>✦</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(17,16,9,0.08)" }} />
          </div>

          {/* Texte de la prière — 15px compact, aligné gauche pour les longues, centré pour les courtes */}
          <div style={{ background: C.card, borderRadius: "16px", padding: "16px 16px", border: `1.5px solid ${C.cardBorder}` }}>
            <p style={{
              fontFamily: C.serif,
              fontSize: "15px",
              fontWeight: 300,
              lineHeight: 1.78,
              color: C.ink80,
              whiteSpace: "pre-line",
              // Centré pour prières courtes (< 200 chars), gauche pour longues
              textAlign: prayer.text.length > 200 ? "left" : "center",
              margin: 0,
            }}>
              {prayer.text}
            </p>
          </div>

          {/* Verset biblique */}
          {prayer.verses && (
            <div style={{ padding: "12px 14px", borderRadius: "12px", background: "rgba(196,154,60,0.06)", border: "1px solid rgba(196,154,60,0.14)", textAlign: "center" }}>
              <p style={{ fontFamily: C.serif, fontSize: "13px", fontStyle: "italic", fontWeight: 300, color: C.ink50, lineHeight: 1.55, margin: 0 }}>
                {prayer.verses}
              </p>
            </div>
          )}

          {/* Pourquoi cette prière */}
          <div style={{ background: C.creamGold, borderRadius: "14px", padding: "14px 16px", border: `1.5px solid ${C.goldBorder}` }}>
            <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "7px" }}>
              Pourquoi cette prière ?
            </p>
            <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink65, lineHeight: 1.60, margin: 0 }}>
              {prayer.purpose}
            </p>
          </div>

          {/* Autres prières */}
          <div>
            <p style={{ fontSize: "10px", fontWeight: 500, color: C.ink35, marginBottom: "7px", letterSpacing: "1px", textTransform: "uppercase", fontFamily: C.sans }}>
              Autres prières
            </p>
            <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
              {Object.entries(PRAYERS_DATA)
                .filter(([s]) => s !== slug)
                .slice(0, 5)
                .map(([s, p], i, arr) => (
                  <button key={s} onClick={() => router.push(`/dashboard/spiritual/prieres/${s}`)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: "none", border: "none", borderBottom: i < arr.length - 1 ? `1px solid ${C.ink12}` : "none", cursor: "pointer", textAlign: "left", width: "100%", transition: "background .12s" }}>
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

          <button onClick={goBack} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: `1.5px solid ${C.ink12}`, background: "none", fontSize: "13px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>
            ← Retour aux prières
          </button>
        </div>
      </main>
    </div>
  );
}
