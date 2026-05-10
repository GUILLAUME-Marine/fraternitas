// ─── data.ts v2 ───────────────────────────────────────────────────────────────
// Ajout des étapes officielles du chapelet catholique :
//   INTRO : Signe de croix → Credo → Notre Père → 3× Ave (vertus) → Gloire
//   DIZAINE (×5) : Mystère → Notre Père → 10× Ave → Gloire → Fatima
//   FIN : Salve Regina
// ─────────────────────────────────────────────────────────────────────────────

export interface PrayerStep { num:string; title:string; text:string; note:string|null; }
export interface Sequence { kicker:string; title:string; desc:string; steps:PrayerStep[]; }
export interface MysteryItem { title:string; ref:string; verse:string; }
export interface Mystery { label:string; days:string; items:MysteryItem[]; }
export interface Quote { text:string; author:string; }
export interface AideQ1Item { id:string; label:string; hasFollowup:boolean; }
export interface AideFollowup { q:string; choices:string[]; }
export interface AidePrayer { title:string; text:string; }

// ── Séquences ─────────────────────────────────────────────────────────────────

export const SEQUENCES: Record<string,Sequence> = {
  matin: {
    kicker:"Prière du matin · Séquence complète", title:"Commencer sa journée.",
    desc:"De la croix à l'offrande : tout ce qu'on peut faire en 5 minutes au réveil.",
    steps:[
      {num:"1",title:"Signe de croix",text:"Au nom du Père,\net du Fils,\net du Saint-Esprit.\nAmen.",note:"aide|Posez la main droite sur le front, puis la poitrine, puis l'épaule gauche, puis l'épaule droite."},
      {num:"2",title:"Offrande du matin",text:"Mon Dieu, je vous offre toute ma journée :\nmes prières, mes pensées, mes paroles,\nmes actions, mes joies et mes peines,\nen union avec Jésus-Christ,\nqui s'offre chaque jour dans la sainte Messe.\nAmen.",note:"Prenez un instant pour penser à votre journée à venir."},
      {num:"3",title:"Acte de foi",text:"Mon Dieu, je crois fermement\ntoutes les vérités que vous avez révélées\net que la sainte Église nous enseigne,\nparce que vous êtes la vérité même.\nAmen.",note:null},
      {num:"4",title:"L'Angélus (si c'est l'heure)",text:"L'ange du Seigneur a annoncé à Marie.\nEt elle a conçu du Saint-Esprit.\n\nJe vous salue Marie…\n\nVoici la servante du Seigneur.\nQu'il me soit fait selon votre parole.\n\nJe vous salue Marie…\n\nEt le Verbe s'est fait chair.\nEt il a habité parmi nous.\n\nJe vous salue Marie…\n\nSeigneur, répandez votre grâce en nos âmes. Amen.",note:"L'Angélus se prie à 6h, 12h et 18h."},
      {num:"5",title:"Signe de croix final",text:"Au nom du Père,\net du Fils,\net du Saint-Esprit.\nAmen.",note:"Votre journée est remise à Dieu. Commencez."},
    ],
  },
  soir: {
    kicker:"Prière du soir · Séquence complète", title:"Relire sa journée.",
    desc:"Examen de conscience, action de grâce, demande de pardon. 5 minutes avant de dormir.",
    steps:[
      {num:"1",title:"Signe de croix",text:"Au nom du Père,\net du Fils,\net du Saint-Esprit.\nAmen.",note:null},
      {num:"2",title:"Examen de conscience",text:"Seigneur, je reviens vers toi ce soir.\n\nJe te rends grâce pour ce que j'ai reçu aujourd'hui —\nles moments de joie, les rencontres, les petites grâces.\n\nJe te demande de regarder avec moi ma journée :\noù ai-je été présent à toi ?\noù m'en suis-je éloigné ?\n\nJe te confie mes manquements\nsans me juger moi-même.\nTa miséricorde est plus grande que mes fautes.\n\nAmen.",note:"Prenez 2 à 3 minutes de silence pour relire votre journée concrètement."},
      {num:"3",title:"Acte de contrition",text:"Mon Dieu, j'ai un très grand regret\nde vous avoir offensé,\nparce que vous êtes infiniment bon,\ninfiniment aimable,\net que le péché vous déplaît.\n\nJe prends la ferme résolution,\navec le secours de votre sainte grâce,\nde ne plus vous offenser.\n\nAmen.",note:null},
      {num:"4",title:"Salve Regina",text:"Je vous salue, Reine, Mère de miséricorde,\nnotre vie, notre douceur, notre espérance, salut !\n\nEnfants d'Ève, nous crions vers vous,\ngémissants et pleurants\ndans cette vallée de larmes.\n\nÔ clémente, ô pieuse,\nô douce Vierge Marie.\nAmen.",note:"Prière traditionnelle du soir."},
      {num:"5",title:"Confier la nuit",text:"Seigneur, je te confie cette nuit.\nProtège-nous quand nous dormons.\nQue nous reposions en ta paix.\nAmen.",note:null},
    ],
  },
  inquiet: {
    kicker:"Dans l'inquiétude · 3 min", title:"Déposer ce qui pèse.",
    desc:"Quand on ne sait plus comment avancer. Trois prières courtes.",
    steps:[
      {num:"1",title:"Ouvrir les mains",text:"Seigneur,\ntu vois ce qui m'écrase.\nJe ne sais pas toujours mettre des mots dessus.\n\nTu tiens le temps entre tes mains.\nApprends-moi à vivre aujourd'hui\nsans porter demain.\n\nAmen.",note:"Si vous ne savez pas quoi dire, dites juste : « Seigneur, aide-moi. »"},
      {num:"2",title:"Memorare",text:"Souvenez-vous, ô très pieuse Vierge Marie,\nqu'on n'a jamais entendu dire\nque quelqu'un de ceux qui ont eu recours\nà votre protection\nait été abandonné.\n\nAnimé d'une pareille confiance,\nje recours à vous.\nNe méprisez pas ma prière.\n\nAmen.",note:"Cette prière a 800 ans."},
      {num:"3",title:"Laisser Dieu tenir",text:"Père,\nje ne sais pas comment ça va finir.\nJe n'ai pas besoin de tout comprendre.\n\nJe te fais confiance.\nC'est tout.\n\nAmen.",note:null},
    ],
  },
  marie: {
    kicker:"Avec Marie · 4 min", title:"Se confier à celle qui a dit oui.",
    desc:"Je vous salue Marie, Memorare, Salve Regina.",
    steps:[
      {num:"1",title:"Je vous salue Marie",text:"Je vous salue, Marie pleine de grâce,\nle Seigneur est avec vous.\nVous êtes bénie entre toutes les femmes\net Jésus, le fruit de vos entrailles, est béni.\n\nSainte Marie, Mère de Dieu,\npriez pour nous pauvres pécheurs,\nmaintenant et à l'heure de notre mort.\nAmen.",note:"L'Ave Maria est la prière mariale la plus ancienne."},
      {num:"2",title:"Memorare",text:"Souvenez-vous, ô très pieuse Vierge Marie,\nqu'on n'a jamais entendu dire\nque quelqu'un de ceux qui ont eu recours\nà votre protection ait été abandonné.\n\nAnimé d'une pareille confiance,\nje recours à vous, ô Vierge des vierges, ma Mère.\n\nÔ Mère du Verbe, ne méprisez pas ma prière.\n\nAmen.",note:"Attribuée à saint Bernard."},
      {num:"3",title:"Salve Regina",text:"Je vous salue, Reine, Mère de miséricorde,\nnotre vie, notre douceur, notre espérance, salut !\n\nEnfants d'Ève, nous crions vers vous,\ngémissants et pleurants\ndans cette vallée de larmes.\n\nÔ clémente, ô pieuse,\nô douce Vierge Marie.\nAmen.",note:null},
    ],
  },
};

// ── Mystères ──────────────────────────────────────────────────────────────────

export const MYSTERIES: Record<string,Mystery> = {
  joyeux:{ label:"Mystères Joyeux",days:"Lundi · Samedi",items:[
    {title:"L'Annonciation",ref:"Lc 1, 26-38",verse:"« Réjouis-toi, comblée de grâce, le Seigneur est avec toi. »"},
    {title:"La Visitation",ref:"Lc 1, 39-56",verse:"« Dès qu'Élisabeth entendit Marie, l'enfant tressaillit en elle. »"},
    {title:"La Nativité",ref:"Lc 2, 1-20",verse:"« Elle enfanta son fils premier-né et le coucha dans une mangeoire. »"},
    {title:"La Présentation au Temple",ref:"Lc 2, 22-40",verse:"« Mes yeux ont vu ton salut. »"},
    {title:"Le Recouvrement au Temple",ref:"Lc 2, 41-52",verse:"« Ne saviez-vous pas que je dois être chez mon Père ? »"},
  ]},
  lumineux:{ label:"Mystères Lumineux",days:"Jeudi",items:[
    {title:"Le Baptême de Jésus",ref:"Mt 3, 13-17",verse:"« Celui-ci est mon Fils bien-aimé. »"},
    {title:"Les Noces de Cana",ref:"Jn 2, 1-11",verse:"« Faites tout ce qu'il vous dira. »"},
    {title:"L'Annonce du Royaume",ref:"Mc 1, 14-15",verse:"« Le Règne de Dieu est tout proche. »"},
    {title:"La Transfiguration",ref:"Mt 17, 1-8",verse:"« Son visage resplendit comme le soleil. »"},
    {title:"L'Institution de l'Eucharistie",ref:"Lc 22, 14-20",verse:"« Ceci est mon corps, donné pour vous. »"},
  ]},
  douloureux:{ label:"Mystères Douloureux",days:"Mardi · Vendredi",items:[
    {title:"L'Agonie à Gethsémani",ref:"Lc 22, 39-46",verse:"« Que ta volonté soit faite, et non la mienne. »"},
    {title:"La Flagellation",ref:"Jn 19, 1",verse:"« Pilate prit alors Jésus et le fit flageller. »"},
    {title:"Le Couronnement d'épines",ref:"Jn 19, 2-3",verse:"« Ils posèrent sur sa tête une couronne d'épines. »"},
    {title:"Le Portement de Croix",ref:"Lc 23, 26-32",verse:"« Ils imposèrent la croix à Simon de Cyrène. »"},
    {title:"La Crucifixion",ref:"Jn 19, 17-30",verse:"« Tout est accompli. »"},
  ]},
  glorieux:{ label:"Mystères Glorieux",days:"Mercredi · Dimanche",items:[
    {title:"La Résurrection",ref:"Jn 20, 11-18",verse:"« Marie ! » Elle se retourna : « Rabbouni ! »"},
    {title:"L'Ascension",ref:"Ac 1, 6-11",verse:"« Je suis avec vous jusqu'à la fin du monde. »"},
    {title:"La Pentecôte",ref:"Ac 2, 1-13",verse:"« Ils furent tous remplis de l'Esprit Saint. »"},
    {title:"L'Assomption de Marie",ref:"Ap 12, 1",verse:"« Une femme enveloppée du soleil. »"},
    {title:"Le Couronnement de Marie",ref:"Ps 45, 10",verse:"« La Reine se tient à ta droite, parée d'or. »"},
  ]},
};

// ── Textes officiels ──────────────────────────────────────────────────────────

export const PRAYERS_TEXT = {
  CROIX: "Au nom du Père,\net du Fils,\net du Saint-Esprit.\nAmen.",
  CREDO: "Je crois en Dieu, le Père tout-puissant,\nCréateur du ciel et de la terre.\n\nEt en Jésus-Christ, son Fils unique, notre Seigneur,\nqui a été conçu du Saint-Esprit,\nest né de la Vierge Marie,\na souffert sous Ponce Pilate,\na été crucifié, est mort et a été enseveli,\nest descendu aux enfers,\nest ressuscité le troisième jour,\nest monté aux cieux,\nest assis à la droite de Dieu le Père tout-puissant,\nd'où il viendra juger les vivants et les morts.\n\nJe crois au Saint-Esprit,\nà la sainte Église catholique,\nà la communion des saints,\nà la rémission des péchés,\nà la résurrection de la chair,\nà la vie éternelle.\nAmen.",
  NP: "Notre Père, qui es aux cieux,\nque ton nom soit sanctifié,\nque ton règne vienne,\nque ta volonté soit faite\nsur la terre comme au ciel.\n\nDonne-nous aujourd'hui notre pain de ce jour.\nPardonne-nous nos offenses,\ncomme nous pardonnons aussi\nà ceux qui nous ont offensés.\n\nEt ne nous soumets pas à la tentation,\nmais délivre-nous du mal.\nAmen.",
  AM: "Je vous salue, Marie pleine de grâce,\nle Seigneur est avec vous.\nVous êtes bénie entre toutes les femmes\net Jésus, le fruit de vos entrailles, est béni.\n\nSainte Marie, Mère de Dieu,\npriez pour nous pauvres pécheurs,\nmaintenant et à l'heure de notre mort.\nAmen.",
  GL: "Gloire au Père, et au Fils, et au Saint-Esprit,\ncomme il était au commencement,\nmaintenant et toujours,\ndans les siècles des siècles.\nAmen.",
  FATIMA: "Ô mon Jésus, pardonnez-nous nos péchés,\npréservez-nous du feu de l'enfer,\net conduisez au Ciel toutes les âmes,\nspécialement celles qui ont le plus besoin\nde votre miséricorde.\nAmen.",
  SALVE: "Je vous salue, Reine, Mère de miséricorde,\nnotre vie, notre douceur, notre espérance, salut !\n\nEnfants d'Ève, nous crions vers vous,\ngémissants et pleurants\ndans cette vallée de larmes.\n\nTournez vers nous vos regards miséricordieux,\net après cet exil, montrez-nous Jésus,\nle fruit béni de vos entrailles.\n\nÔ clémente, ô pieuse,\nô douce Vierge Marie.\nAmen.",
};

// ── Étapes d'introduction officielles du chapelet ─────────────────────────────
// Jouées UNE SEULE FOIS avant la première dizaine

export type IntroStep = "croix"|"credo"|"np"|"ave1"|"ave2"|"ave3"|"gloria";

export interface IntroStepDef {
  key: IntroStep;
  label: string;
  text: string;
  note?: string;
}

export const INTRO_STEPS: IntroStepDef[] = [
  { key:"croix",  label:"Signe de croix",                    text:PRAYERS_TEXT.CROIX,
    note:"Posez la main droite sur le front, puis la poitrine, puis l'épaule gauche, puis l'épaule droite." },
  { key:"credo",  label:"Je crois en Dieu",                  text:PRAYERS_TEXT.CREDO,
    note:"Le Symbole des Apôtres — profession de foi catholique." },
  { key:"np",     label:"Notre Père",                        text:PRAYERS_TEXT.NP },
  { key:"ave1",   label:"Je vous salue Marie · Foi",         text:PRAYERS_TEXT.AM,
    note:"Pour l'augmentation de la foi." },
  { key:"ave2",   label:"Je vous salue Marie · Espérance",   text:PRAYERS_TEXT.AM,
    note:"Pour l'augmentation de l'espérance." },
  { key:"ave3",   label:"Je vous salue Marie · Charité",     text:PRAYERS_TEXT.AM,
    note:"Pour l'augmentation de la charité." },
  { key:"gloria", label:"Gloire au Père",                    text:PRAYERS_TEXT.GL },
];

// ── Aide ──────────────────────────────────────────────────────────────────────

export const AIDE_Q1: AideQ1Item[] = [
  {id:"fatigue",label:"Épuisé. Je n'en peux plus.",hasFollowup:true},
  {id:"anxieux",label:"Anxieux. J'ai peur de quelque chose.",hasFollowup:true},
  {id:"blesse",label:"Blessé. Une relation me fait souffrir.",hasFollowup:true},
  {id:"perdu",label:"Perdu. Je cherche quelque chose.",hasFollowup:true},
  {id:"paix",label:"En paix. Je veux juste remercier.",hasFollowup:false},
  {id:"curieux",label:"Curieux. Je veux essayer.",hasFollowup:false},
];

export const AIDE_FOLLOWUPS: Record<string,AideFollowup> = {
  fatigue:{q:"Qu'est-ce qui t'épuise le plus ?",choices:["Le travail","La famille","Moi-même","Tout à la fois"]},
  anxieux:{q:"Qu'est-ce qui t'inquiète ?",choices:["L'avenir","Ma santé ou celle d'un proche","Une décision à prendre","Je ne sais pas"]},
  blesse:{q:"Avec qui c'est difficile ?",choices:["Un proche","Au travail","Avec moi-même","Avec Dieu"]},
  perdu:{q:"Dans quel domaine ?",choices:["Mon travail, ma vocation","Ma foi, mes doutes","Mes relations","Ma vie en général"]},
};

export const AIDE_PRAYERS: Record<string,AidePrayer> = {
  fatigue:{title:"Une prière pour la fatigue",text:"Seigneur,\nje suis épuisé.\nJe te donne cette fatigue —\nc'est tout ce que j'ai ce soir.\n\nSois là.\n\nAmen."},
  anxieux:{title:"Une prière pour l'inquiétude",text:"Seigneur,\nj'ai peur de demain.\nDe ce que je ne contrôle pas.\n\nTu tiens le temps entre tes mains.\nApprends-moi à vivre aujourd'hui.\n\nAmen."},
  blesse:{title:"Une prière pour une relation",text:"Seigneur,\ncette relation me pèse.\nJe ne sais plus comment aimer cette personne.\n\nAide-moi à ne pas abandonner.\n\nAmen."},
  perdu:{title:"Une prière pour retrouver le cap",text:"Seigneur,\nje cherche.\nGuide mes pas — juste le prochain.\n\nAmen."},
  paix:{title:"Une prière de pur remerciement",text:"Seigneur,\nmerci.\nC'est tout ce que je voulais te dire.\nJuste : merci.\n\nAmen."},
  curieux:{title:"Une prière pour commencer",text:"Seigneur,\nje ne sais pas si tu es là.\nMais je suis là, moi.\n\nEt le fait que je te parle ce soir\nc'est peut-être déjà quelque chose.\n\nAmen."},
};

export const QUOTES: Quote[] = [
  {text:"La prière est l'élévation de l'âme vers Dieu.",author:"Catéchisme de l'Église catholique"},
  {text:"Cherchez d'abord le royaume de Dieu et sa justice, et tout le reste vous sera donné par surcroît.",author:"Mt 6, 33"},
  {text:"Ne craignez pas ! Je suis avec vous tous les jours jusqu'à la fin du monde.",author:"Mt 28, 20"},
  {text:"L'homme est fait pour Dieu, et son cœur est sans repos jusqu'à ce qu'il trouve le repos en lui.",author:"Saint Augustin"},
  {text:"Priez sans cesse.",author:"1 Th 5, 17"},
  {text:"La paix de Dieu, qui dépasse toute intelligence, gardera vos cœurs et vos pensées.",author:"Ph 4, 7"},
  {text:"Je suis la résurrection et la vie. Celui qui croit en moi vivra, même s'il meurt.",author:"Jn 11, 25"},
];

export const LIBRARY_CARDS = [
  {key:"matin",label:"Matin",desc:"Séquence complète : offrande, Angélus, intention."},
  {key:"soir",label:"Soir",desc:"Examen, acte de contrition, Salve Regina."},
  {key:"inquiet",label:"Épreuve",desc:"Memorare, De Profundis, prière dans l'angoisse."},
  {key:"chapelet",label:"Chapelet",desc:"20 mystères, méditations, grain par grain."},
  {key:"marie",label:"Marie",desc:"Ave Maria, Salve Regina, Memorare."},
  {key:"aide",label:"Guidez-moi",desc:"Je ne sais pas comment prier. Parcours simple."},
];

export function getTodayMystery(): string {
  const d = new Date().getDay();
  if (d===1||d===6) return "joyeux";
  if (d===2||d===5) return "douloureux";
  if (d===4) return "lumineux";
  return "glorieux";
}
export function getTodayQuote(): Quote { return QUOTES[new Date().getDay()%QUOTES.length]; }
export function getGreeting(): string {
  const h=new Date().getHours();
  if(h>=5&&h<12) return "Bonjour"; if(h>=12&&h<14) return "Midi";
  if(h>=14&&h<18) return "Bonne après-midi"; if(h>=18&&h<21) return "Ce soir";
  return "Bonne nuit";
}
export function getLiturgicalLabel(): string {
  const now=new Date(),y=now.getFullYear(),m=now.getMonth()+1,d=now.getDate();
  const ed:Record<number,[number,number]>={2025:[4,20],2026:[4,5],2027:[3,28],2028:[4,16]};
  const [em,edv]=ed[y]??[4,5];
  const diff=Math.floor((new Date(y,m-1,d).getTime()-new Date(y,em-1,edv).getTime())/86400000);
  if(diff>=0&&diff<=49){if(diff===49)return "Pentecôte";return ["1re","2e","3e","4e","5e","6e","7e"][Math.min(Math.floor(diff/7),6)]+" semaine de Pâques";}
  if((m===12&&d>=25)||(m===1&&d<=13)) return "Temps de Noël";
  return "Temps ordinaire";
}
export function formatDate(): string {
  const now=new Date();
  return ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"][now.getDay()]+" "+now.getDate()+" "+["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"][now.getMonth()];
}
export function fmtShortDate(iso:string): string {
  try{return new Intl.DateTimeFormat("fr-FR",{day:"numeric",month:"short"}).format(new Date(iso));}catch{return "";}
}
export function stripHtml(s:string): string {
  return s.replace(/<br\s*\/?>/gi,"\n").replace(/<\/p>/gi,"\n").replace(/<[^>]+>/g,"")
    .replace(/&rsquo;/g,"'").replace(/&lsquo;/g,"'").replace(/&ldquo;/g,"«").replace(/&rdquo;/g,"»")
    .replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/&eacute;/g,"é").replace(/&egrave;/g,"è")
    .replace(/&agrave;/g,"à").replace(/&#[0-9]+;/g,"").replace(/&[a-z]+;/g," ")
    .replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim();
}
