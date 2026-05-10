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

  "je-vous-salue-marie": {
    title: "Je vous salue Marie",
    subtitle: "Ave Maria",
    origin: "Prière issue des paroles de l'archange Gabriel et d'Élisabeth. Complétée par l'Église au XVe siècle.",
    text: `Je vous salue, Marie pleine de grâce,
le Seigneur est avec vous.
Vous êtes bénie entre toutes les femmes
et Jésus, le fruit de vos entrailles, est béni.

Sainte Marie, Mère de Dieu,
priez pour nous pauvres pécheurs,
maintenant et à l'heure de notre mort.

Amen.`,
    verses: "« Réjouis-toi, comblée de grâce, le Seigneur est avec toi. » — Lc 1, 28",
    purpose: "La prière mariale par excellence. Elle rappelle l'Annonciation, la Visitation, et demande l'intercession de Marie à deux moments décisifs : maintenant, et à l'heure de la mort. La prier, c'est s'unir à l'Église qui prie depuis vingt siècles.",
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
    purpose: "Glorifier la Trinité en quelques mots. Cette prière clôt chaque dizaine du chapelet et chaque psaume de la Liturgie des Heures. Elle est un rappel que toute prière revient au Père, par le Fils, dans l'Esprit.",
  },

  "salve-regina": {
    title: "Salve Regina",
    subtitle: "Je vous salue, Reine",
    origin: "Antienne mariale du XIe siècle, attribuée à Herman de Reichenau. Chantée par des millions de moines depuis neuf siècles.",
    text: `Je vous salue, Reine, Mère de miséricorde,
notre vie, notre douceur, notre espérance, salut !

Enfants d'Ève, nous crions vers vous,
gémissants et pleurants
dans cette vallée de larmes.

Ô notre avocate, tournez vers nous
vos yeux miséricordieux.

Et, après cet exil,
montrez-nous Jésus, le fruit béni de vos entrailles.

Ô clémente, ô pieuse,
ô douce Vierge Marie.

Amen.`,
    purpose: "La prière du soir par excellence. Elle reconnaît la condition humaine — exil, larmes, espérance — et la confie à Marie. Chantée complets dans toutes les abbayes bénédictines depuis mille ans. La prier le soir, c'est rejoindre ce chœur invisible.",
  },

  "magnificat": {
    title: "Magnificat",
    subtitle: "Le cantique de Marie",
    origin: "Paroles de Marie à sa cousine Élisabeth. Luc 1, 46-55. Récité chaque soir aux Vêpres.",
    text: `Mon âme exalte le Seigneur,
mon esprit exulte en Dieu mon Sauveur.

Il s'est penché sur son humble servante ;
désormais tous les âges me diront bienheureuse.

Le Puissant fit pour moi des merveilles ;
Saint est son nom !

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
    verses: "« Mon âme exalte le Seigneur. » — Lc 1, 46",
    purpose: "Le chant de Marie en réponse à l'Annonciation. Ce cantique révolutionnaire proclame un Dieu qui renverse l'ordre du monde — qui élève les humbles et renvoie les puissants. Prier le Magnificat, c'est entrer dans la vision de Marie sur l'histoire.",
  },

  "examen-soir": {
    title: "Examen de conscience",
    subtitle: "Revue de journée ignatienne",
    origin: "Pratique spirituelle proposée par saint Ignace de Loyola. Cinq minutes le soir pour regarder sa journée avec Dieu.",
    text: `Seigneur, je reviens vers toi ce soir.

Je te rends grâce pour ce que j'ai reçu aujourd'hui —
les moments de joie, les rencontres, les petites grâces.

Je te demande de regarder avec moi ma journée :
où ai-je été présent à toi ?
où m'en suis-je éloigné ?

Je te confie mes manquements
sans me juger moi-même.
Ta miséricorde est plus grande que mes fautes.

Apprends-moi ce dont j'ai besoin pour demain.

Amen.`,
    purpose: "L'examen ignatien n'est pas une liste de péchés — c'est un regard d'amour sur sa journée avec Dieu. Cinq minutes le soir pour reconnaître le bien reçu, les moments de détournement, et ce qu'on peut apprendre. Une pratique qui transforme en profondeur ceux qui la tiennent.",
  },

  "acte-de-contrition": {
    title: "Acte de contrition",
    subtitle: "Actus Contritionis",
    origin: "Prière pénitentielle classique exprimant le regret du péché et la résolution de s'amender.",
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
    purpose: "La contrition n'est pas la culpabilité — c'est le regret d'avoir manqué d'amour. Cet acte ne s'appuie pas sur la peur mais sur l'amour de Dieu. Le dire le soir est une façon de terminer la journée réconcilié, sans porter le poids de ce qui s'est mal passé.",
  },

  "complies": {
    title: "Complies",
    subtitle: "Prière du soir de l'Église",
    origin: "Dernière heure canoniale de la journée, chantée ou récitée avant de dormir dans toutes les monastères du monde.",
    text: `Protège-nous, Seigneur, quand nous veillons,
garde-nous quand nous dormons.

Que nous veillions avec le Christ,
et que nous reposions en paix.

Dans tes mains, Seigneur,
je remets mon esprit.

Tu nous as rachetés, Seigneur, Dieu de vérité.

Amen.`,
    purpose: "Remettre la nuit à Dieu. Les Complies clôturent la journée liturgique depuis saint Benoît au VIe siècle. Prier avant de dormir, c'est reconnaître que le sommeil est un acte de confiance : on lâche le contrôle, on se remet entre des mains plus grandes.",
  },

  "benedicite-court": {
    title: "Bénédicité bref",
    subtitle: "Avant le repas",
    origin: "Prière traditionnelle avant les repas, récitée dans les familles catholiques depuis des siècles.",
    text: `Seigneur, bénissez-nous,
ainsi que la nourriture que nous allons prendre.
Donnez du pain à ceux qui n'en ont pas.

Amen.`,
    purpose: "Trois secondes pour ne pas manger seul. Le bénédicité rappelle que la nourriture est un don, que d'autres n'en ont pas, et que même un repas peut être un acte de prière. Simple, direct, honnête.",
  },

  "benedicite-long": {
    title: "Bénédicité complet",
    subtitle: "Oculi omnium",
    origin: "Version longue du bénédicité, issue du Psaume 145. Souvent récitée dans les communautés religieuses.",
    text: `Les yeux de tous espèrent en vous, Seigneur,
et vous leur donnez la nourriture en son temps.

Vous ouvrez votre main
et vous comble de bénédictions
tout ce qui vit.

Bénissez-nous, Seigneur, et ces dons
que nous allons recevoir de votre bonté.

Par Jésus-Christ notre Seigneur. Amen.`,
    verses: "« Les yeux de tous espèrent en toi. » — Ps 145, 15",
    purpose: "Le bénédicité long rappelle que Dieu nourrit toute créature. Il place le repas dans la perspective de la Providence : si nous mangeons, c'est parce que Dieu ouvre sa main. Une façon de ne jamais oublier que rien n'est acquis.",
  },

  "benedicite-famille": {
    title: "En famille",
    subtitle: "Pour les repas avec enfants",
    origin: "Version adaptée aux familles, accessible aux plus jeunes.",
    text: `Seigneur, merci pour ce repas,
merci pour nos mains qui l'ont préparé,
merci pour ceux qui sont avec nous.

Pense à ceux qui ont faim.

Amen.`,
    purpose: "Enseigner la gratitude aux enfants sans les perdre avec des formules compliquées. Ce bénédicité est court, concret, et ouvre sur la solidarité. Les enfants comprennent : remercier, et penser aux autres.",
  },

  "grace-apres-repas": {
    title: "Action de grâces",
    subtitle: "Après le repas",
    origin: "Prière de remerciement après les repas dans la tradition catholique.",
    text: `Nous vous rendons grâces, Seigneur,
pour tous les bienfaits que vous nous accordez.
Vous qui vivez et régnez pour les siècles des siècles.

Amen.

Que les âmes des fidèles défunts
reposent en paix.

Amen.`,
    purpose: "Clore le repas par un remerciement. La tradition de rendre grâces après manger est aussi ancienne que le christianisme lui-même. Ce moment bref dit : nous n'avons pas mangé seuls, nous ne sommes pas nos propres sources.",
  },

  "pour-les-defunts": {
    title: "Pour les défunts",
    subtitle: "Requiem aeternam",
    origin: "Prière liturgique classique pour les défunts. Récitée depuis les premiers siècles de l'Église.",
    text: `Seigneur, donnez-leur le repos éternel,
et que la lumière perpétuelle les illumine.

Qu'ils reposent en paix.

Amen.`,
    verses: "« Je suis la résurrection et la vie. » — Jn 11, 25",
    purpose: "La mort ne rompt pas les liens. Prier pour les défunts, c'est croire que notre prière rejoint ceux qui nous ont précédés. La tradition catholique de prier pour les morts est une façon de ne jamais les abandonner — de maintenir vivant ce lien d'amour.",
  },

  "de-profundis": {
    title: "De profundis",
    subtitle: "Psaume 130",
    origin: "Psaume pénitentiel de la Bible hébraïque. Chanté aux offices des morts depuis des siècles.",
    text: `Du fond de l'abîme je crie vers toi, Seigneur,
Seigneur, écoute mon appel.

Que ton oreille se fasse attentive
au cri de ma prière.

Si tu retiens nos fautes, Seigneur,
Seigneur, qui peut subsister ?

Mais près de toi se trouve le pardon
pour que l'homme te craigne.

Mon âme espère le Seigneur
plus qu'un veilleur n'attend l'aurore.

Auprès du Seigneur est la grâce,
auprès de lui, abondante, la rédemption.

Amen.`,
    verses: "« Du fond de l'abîme je crie vers toi. » — Ps 130, 1",
    purpose: "Le psaume de la détresse totale qui devient espérance. De profundis — du fond de l'abîme. C'est la prière de ceux qui n'ont plus rien à offrir que leur cri. Traditionnellement prié pour les défunts, il est aussi la prière de quiconque traverse une nuit profonde.",
  },

  "memorare": {
    title: "Memorare",
    subtitle: "Souviens-toi, ô très pieuse Vierge",
    origin: "Prière attribuée à saint Bernard de Clairvaux, XIIe siècle.",
    text: `Souvenez-vous, ô très pieuse Vierge Marie,
qu'on n'a jamais entendu dire
que quelqu'un de ceux qui ont eu recours
à votre protection,
imploré votre assistance,
ou réclamé votre secours,
ait été abandonné.

Animé d'une pareille confiance,
je recours à vous, ô Vierge des vierges, ma Mère.
Je viens à vous, je suis devant vous,
pécheur repentant.

Ne méprisez pas mes paroles, ô Mère du Verbe,
mais écoutez favorablement ma prière.

Amen.`,
    purpose: "Une prière de confiance totale. Le Memorare ne commence pas par nos mérites mais par une promesse : personne n'a jamais été abandonné. Prier cela dans l'épreuve, c'est s'ancrer dans une certitude qui dépasse le ressenti du moment.",
  },

  "maladie": {
    title: "Dans la maladie",
    subtitle: "Pour soi ou un proche",
    origin: "Prière contemporaine pour les moments d'épreuve physique ou d'accompagnement d'un malade.",
    text: `Seigneur,
tu as vu Jésus souffrir dans son corps.
Tu sais ce que c'est.

Je te confie ce corps qui souffre,
ou celui de quelqu'un que j'aime.

Donne-nous la paix dans l'incertitude.
Donne-nous ta présence là où les mots ne suffisent plus.

Que la maladie ne soit pas le dernier mot.

Amen.`,
    verses: "« Par ses blessures nous sommes guéris. » — Is 53, 5",
    purpose: "Prier dans la maladie, c'est refuser que la souffrance soit sans sens et sans témoin. Jésus a souffert dans un corps réel. Cette prière rejoint cette solidarité : Dieu n'est pas étranger à la douleur physique. Elle peut être priée pour soi ou pour un proche malade.",
  },

  "avant-examen": {
    title: "Avant un examen",
    subtitle: "Confier son effort à Dieu",
    origin: "Prière pour les moments d'évaluation, de concours, ou de tout défi intellectuel ou professionnel.",
    text: `Seigneur,
j'ai préparé ce que j'ai pu.
Je viens te demander la clarté et le calme.

Aide-moi à donner le meilleur
sans me laisser envahir par la peur.

Je te confie ce moment.
Que le résultat soit ou non ce que j'espère,
aide-moi à savoir que je ne suis pas défini par mes notes.

Amen.`,
    purpose: "Remettre son effort à Dieu, pas pour obtenir un miracle, mais pour ne pas être seul dans la pression. Cette prière rappelle que l'identité ne dépend pas du résultat. Elle peut aider à sortir de la spirale anxieuse avant un moment important.",
  },

  "voyageur": {
    title: "Prière du voyageur",
    subtitle: "Saint Christophe",
    origin: "Prière traditionnelle confiée à saint Christophe, patron des voyageurs.",
    text: `Seigneur, je pars.
Garde ma route, protège ma vie.
Que je revienne en paix
vers ceux que j'aime.

Saint Christophe, accompagne mes pas.

Amen.`,
    purpose: "Une prière courte pour les départs — en voiture, en avion, pour un long voyage. Confier le trajet à Dieu, ce n'est pas croire qu'on sera magiquement protégé. C'est reconnaître que la vie est fragile, et qu'on ne la tient pas seul.",
  },

  "decision": {
    title: "Avant une décision",
    subtitle: "Veni Sancte Spiritus",
    origin: "Invocation de l'Esprit Saint avant un choix important.",
    text: `Esprit Saint, viens.

Je dois choisir et je ne sais pas bien.
Éclaire ce que je ne vois pas encore.
Donne-moi la paix du bon choix,
et le courage de l'assumer.

Si je me trompe, relève-moi.

Amen.`,
    verses: "« L'Esprit viendra vous enseigner toutes choses. » — Jn 14, 26",
    purpose: "La décision est l'un des moments où l'on se sent le plus seul. Cette prière invite l'Esprit Saint à éclairer ce que la raison seule ne peut voir. Elle reconnaît aussi l'imperfection de tout choix humain — et la miséricorde qui peut relever si on se trompe.",
  },

  "mariage": {
    title: "Pour un mariage",
    subtitle: "Pour les époux",
    origin: "Prière pour les époux, le jour du mariage ou en tout temps.",
    text: `Seigneur,
tu as béni ce couple en les appelant l'un vers l'autre.

Aide-les à tenir leur promesse
les jours où c'est facile
et les jours où c'est difficile.

Donne-leur la grâce de se choisir encore
quand tout semblera dur.

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
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400&family=DM+Sans:wght@300;400;500&display=swap'); *{box-sizing:border-box}`}</style>
        <p style={{ fontFamily: C.serif, fontSize: "20px", color: C.ink, marginBottom: "6px" }}>Prière introuvable.</p>
        <p style={{ fontSize: "12px", color: C.ink50, fontFamily: C.sans, marginBottom: "20px" }}>Cette prière n&apos;est pas encore disponible.</p>
        <button onClick={goBack} style={{ padding: "12px 24px", borderRadius: "99px", border: `1.5px solid ${C.ink12}`, background: "none", cursor: "pointer", fontSize: "13px", color: C.ink, fontFamily: C.sans, minHeight: "44px" }}>
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
        @media (min-width: 768px) {
          .prayer-inner { max-width: 620px !important; padding: 24px 24px 60px !important; }
          .prayer-title { font-size: 32px !important; }
          .prayer-text  { font-size: 17px !important; line-height: 1.85 !important; }
        }
      `}</style>

      {/* Header doré */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "linear-gradient(180deg, #D4A83A 0%, #C49A3C 55%, #B8893A 100%)",
        borderBottom: "1.5px solid #8A6520",
        padding: "0 16px", height: "50px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={goBack} style={{ display: "flex", alignItems: "center", gap: "5px", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.85)", fontSize: "12px", padding: 0, fontFamily: C.sans, minHeight: "44px" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Prières
        </button>
        <span style={{ fontFamily: C.serif, fontSize: "15px", color: "#fff", fontStyle: "italic" }}>{prayer.title}</span>
        <div style={{ width: "50px" }} />
      </header>

      <main className="prayer-inner" style={{ maxWidth: "500px", margin: "0 auto", padding: "16px 16px 50px" }}>
        <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* En-tête */}
          <div style={{ textAlign: "center", padding: "4px 0 0" }}>
            <p style={{ fontSize: "10px", fontWeight: 400, letterSpacing: "1.8px", textTransform: "uppercase", color: C.ink35, marginBottom: "4px", fontFamily: C.sans }}>
              {prayer.subtitle}
            </p>
            <h1 className="prayer-title" style={{ fontFamily: C.serif, fontSize: "26px", fontWeight: 300, color: C.ink, lineHeight: 1.1, marginBottom: "8px" }}>
              {prayer.title}
            </h1>
            <p style={{ fontSize: "12px", fontWeight: 300, lineHeight: 1.55, color: C.ink50, maxWidth: "340px", margin: "0 auto" }}>
              {prayer.origin}
            </p>
          </div>

          {/* Séparateur */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(17,16,9,0.08)" }} />
            <span style={{ color: C.gold, fontSize: "11px" }}>✦</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(17,16,9,0.08)" }} />
          </div>

          {/* Texte de la prière */}
          <div style={{ background: C.card, borderRadius: "16px", padding: "20px 18px", border: `1.5px solid ${C.cardBorder}` }}>
            <p className="prayer-text" style={{
              fontFamily: C.serif,
              fontSize: "15px",
              fontWeight: 300,
              lineHeight: 1.78,
              color: C.ink80,
              whiteSpace: "pre-line",
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
            <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "8px" }}>
              Pourquoi cette prière ?
            </p>
            <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink65, lineHeight: 1.65, margin: 0 }}>
              {prayer.purpose}
            </p>
          </div>

          {/* FIX BUG 11 : Section "Autres prières" supprimée — elle distrait de la prière en cours */}
          {/* Le bouton retour reste, sobre et discret */}
          <button onClick={goBack} style={{ width: "100%", padding: "13px", borderRadius: "12px", border: `1.5px solid ${C.ink12}`, background: "none", fontSize: "13px", color: C.ink50, cursor: "pointer", fontFamily: C.sans, minHeight: "44px" }}>
            ← Retour aux prières
          </button>

        </div>
      </main>
    </div>
  );
}
