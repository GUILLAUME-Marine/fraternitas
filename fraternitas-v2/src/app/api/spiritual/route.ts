import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SpiritualData {
  date: string;
  liturgicalInfo: {
    label: string;        // "Jeudi 9 mai 2026"
    season: string;       // "Temps pascal"
    week: string;         // "6e semaine de Pâques"
    color: LiturgicalColor;
    colorHex: string;
  };
  gospel: {
    reference: string;    // "Jn 15, 9-17"
    intro: string;        // "Évangile de Jésus Christ selon saint Jean"
    text: string;         // Texte complet
    title: string;        // "Titre de l'évangile"
    aelfUrl: string;      // Lien vers AELF
  } | null;
  saint: {
    name: string;
    dates: string;
    description: string;
  };
  quote: {
    text: string;
    author: string;
  };
  error?: string;
}

type LiturgicalColor = "white" | "green" | "red" | "purple" | "pink" | "black";

// ─── Couleur liturgique par saison ───────────────────────────────────────────
function getLiturgicalColor(season: string): { color: LiturgicalColor; hex: string } {
  const s = season.toLowerCase();
  if (s.includes("pascal") || s.includes("noël") || s.includes("noel") || s.includes("ordinaire") && s.includes("fête")) {
    return { color: "white", hex: "#F5F0E8" };
  }
  if (s.includes("ordinaire")) return { color: "green", hex: "#4A7C59" };
  if (s.includes("avent") || s.includes("carême") || s.includes("careme")) {
    return { color: "purple", hex: "#6B4F8E" };
  }
  if (s.includes("laetare") || s.includes("gaudete")) return { color: "pink", hex: "#C2698F" };
  if (s.includes("martyrs") || s.includes("sang") || s.includes("pentecôte") || s.includes("pentecote")) {
    return { color: "red", hex: "#9B2335" };
  }
  // Temps pascal par défaut (mai 2026 = temps pascal)
  return { color: "white", hex: "#F5F0E8" };
}

// ─── Détection automatique du temps liturgique ───────────────────────────────
function detectLiturgicalSeason(dateStr: string): { season: string; week: string } {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Calcul de Pâques (algorithme de Meeus/Jones/Butcher)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const easterMonth = Math.floor((h + l - 7 * m + 114) / 31);
  const easterDay = ((h + l - 7 * m + 114) % 31) + 1;

  const easter = new Date(year, easterMonth - 1, easterDay);
  const current = new Date(year, month - 1, day);
  const diffDays = Math.floor((current.getTime() - easter.getTime()) / (1000 * 60 * 60 * 24));

  // Temps pascal : de Pâques à Pentecôte (49 jours)
  if (diffDays >= 0 && diffDays <= 49) {
    const weekNum = Math.floor(diffDays / 7) + 1;
    const ordinals = ["1re", "2e", "3e", "4e", "5e", "6e", "7e"];
    const week = diffDays === 49 ? "Pentecôte" : `${ordinals[Math.min(weekNum - 1, 6)]} semaine de Pâques`;
    return { season: "Temps pascal", week };
  }

  // Avent (4 semaines avant Noël)
  const christmas = new Date(year, 11, 25);
  const adventStart = new Date(christmas);
  adventStart.setDate(25 - ((christmas.getDay() + 21) % 7) - 21);
  if (current >= adventStart && month === 12 && day < 25) {
    return { season: "Avent", week: "Temps de l'Avent" };
  }

  // Noël : 25 déc au 13 jan
  if ((month === 12 && day >= 25) || (month === 1 && day <= 13)) {
    return { season: "Temps de Noël", week: "Temps de Noël" };
  }

  // Carême : 46 jours avant Pâques
  const ashWednesday = new Date(easter);
  ashWednesday.setDate(easter.getDate() - 46);
  if (current >= ashWednesday && diffDays < 0 && diffDays >= -46) {
    const weekNum = Math.ceil((46 + diffDays) / 7);
    const ordinals = ["1re", "2e", "3e", "4e", "5e", "6e"];
    return { season: "Carême", week: `${ordinals[Math.min(weekNum - 1, 5)]} semaine de Carême` };
  }

  // Temps ordinaire
  return { season: "Temps ordinaire", week: "Temps ordinaire" };
}

// ─── Formatage de la date liturgique française ───────────────────────────────
function formatLiturgicalDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Base de saints (1 par jour de l'année — janvier→décembre) ───────────────
// Source : Martyrologe romain, calendrier catholique officiel
const SAINTS_BY_DATE: Record<string, { name: string; dates: string; description: string }> = {
  "01-01": { name: "Marie, Mère de Dieu", dates: "", description: "Solennité de Marie, Mère de Dieu. L'Église célèbre en ce premier jour de l'année la maternité divine de la Vierge Marie, proclamée au Concile d'Éphèse en 431." },
  "01-06": { name: "Épiphanie du Seigneur", dates: "", description: "Manifestation du Christ aux nations, symbolisée par les Mages venus d'Orient. Cette fête célèbre la révélation de Dieu fait homme à tous les peuples." },
  "01-13": { name: "Saint Hilaire de Poitiers", dates: "315–367", description: "Évêque et Docteur de l'Église, défenseur infatigable de la foi trinitaire contre l'arianisme. Surnommé « l'Athanase d'Occident », il a profondément marqué la théologie latine." },
  "01-17": { name: "Saint Antoine, abbé", dates: "251–356", description: "Père du monachisme chrétien. Il se retira dans le désert d'Égypte pour une vie de prière et de pénitence, attirant autour de lui de nombreux disciples." },
  "01-24": { name: "Saint François de Sales", dates: "1567–1622", description: "Évêque de Genève et Docteur de l'Église. Fondateur de l'Ordre de la Visitation avec sainte Jeanne de Chantal, auteur de l'Introduction à la vie dévote." },
  "01-25": { name: "Conversion de saint Paul", dates: "", description: "Fête de la conversion de Saul de Tarse sur le chemin de Damas. Persécuteur des chrétiens devenu l'Apôtre des nations, saint Paul a transformé l'histoire du christianisme." },
  "01-28": { name: "Saint Thomas d'Aquin", dates: "1225–1274", description: "Dominicain, philosophe et théologien, Docteur de l'Église. Sa Somme théologique est l'une des œuvres majeures de la pensée chrétienne." },
  "02-02": { name: "Présentation du Seigneur", dates: "", description: "Quarante jours après Noël, l'Église célèbre la présentation de Jésus au Temple de Jérusalem et la purification de Marie, appelée aussi « Chandeleur »." },
  "02-03": { name: "Saint Blaise", dates: "†316", description: "Évêque de Sébaste en Arménie, martyr sous Licinius. Patron des malades de la gorge, invoqué pour la protection contre les maux de gorge." },
  "02-11": { name: "Notre-Dame de Lourdes", dates: "1858", description: "Commémoration des apparitions de la Vierge Marie à Bernadette Soubirous à Lourdes. Journée mondiale des malades instituée par saint Jean-Paul II." },
  "02-14": { name: "Saints Cyrille et Méthode", dates: "826–869 / 815–885", description: "Frères thessaloniciens, apôtres des Slaves. Ils inventèrent l'alphabet glagolitique pour écrire les langues slaves et traduisirent la Bible en langue slave." },
  "02-22": { name: "Chaire de saint Pierre", dates: "", description: "Fête de la chaire apostolique de Pierre à Rome, symbole du pouvoir d'enseignement confié par le Christ à l'Église." },
  "03-04": { name: "Saint Casimir", dates: "1458–1484", description: "Prince de Pologne, fils du roi Casimir IV. Mort jeune, il est vénéré comme patron de la Pologne et de la Lituanie pour sa piété et sa charité envers les pauvres." },
  "03-07": { name: "Saintes Perpétue et Félicité", dates: "†203", description: "Jeunes femmes martyrisées à Carthage sous Septime Sévère. Leurs actes de martyre figurent parmi les plus anciens témoignages du christianisme." },
  "03-17": { name: "Saint Patrick", dates: "385–461", description: "Évangélisateur de l'Irlande, patron de ce pays. Ancien esclave devenu évêque missionnaire, il convertit les Irlandais et fonda de nombreuses communautés chrétiennes." },
  "03-19": { name: "Saint Joseph, époux de la Vierge Marie", dates: "", description: "Solennité de saint Joseph, époux de Marie et père nourricier de Jésus. Patron de l'Église universelle, des travailleurs, des pères de famille et des mourants." },
  "03-25": { name: "Annonciation du Seigneur", dates: "", description: "Solennité de l'annonce faite par l'ange Gabriel à Marie qu'elle concevrait le Fils de Dieu. Neuf mois avant Noël, cette fête célèbre le mystère de l'Incarnation." },
  "04-02": { name: "Saint François de Paule", dates: "1416–1507", description: "Fondateur de l'Ordre des Minimes. Ermite calabrais réputé pour ses miracles, il vécut dans une austérité extrême et inspira les rois de France Louis XI et Charles VIII." },
  "04-07": { name: "Saint Jean-Baptiste de La Salle", dates: "1651–1719", description: "Prêtre français, fondateur des Frères des Écoles chrétiennes. Pionnier de l'éducation populaire gratuite, patron des éducateurs et des enseignants." },
  "04-11": { name: "Saint Stanislas de Cracovie", dates: "1030–1079", description: "Évêque de Cracovie, martyr. Il fut tué par le roi Boleslas II qu'il avait excommunié pour ses crimes. Patron principal de la Pologne." },
  "04-23": { name: "Saint Georges", dates: "†303", description: "Martyr sous Dioclétien, patron de l'Angleterre, du Portugal, de l'Aragon et de nombreux pays. Sa figure de chevalier terrassant le dragon symbolise la victoire du bien sur le mal." },
  "04-24": { name: "Saint Fidèle de Sigmaringen", dates: "1577–1622", description: "Capucin allemand, premier martyr de la Propagande de la Foi. Avocat des pauvres devenu prêtre, il fut tué lors d'une mission en Rhétie." },
  "04-25": { name: "Saint Marc, évangéliste", dates: "†68", description: "Disciple de saint Pierre, auteur du deuxième Évangile — le plus court et le plus vivant. Fondateur de l'Église d'Alexandrie, patron de Venise." },
  "04-28": { name: "Saint Louis-Marie Grignion de Montfort", dates: "1673–1716", description: "Missionnaire français, fondateur de la Compagnie de Marie et des Filles de la Sagesse. Auteur du Traité de la vraie dévotion à la Sainte Vierge." },
  "04-29": { name: "Sainte Catherine de Sienne", dates: "1347–1380", description: "Dominicaine, mystique et Docteur de l'Église. Elle obtint le retour du pape à Rome et laissa une correspondance spirituelle d'une rare profondeur. Patronne de l'Europe." },
  "04-30": { name: "Saint Pie V", dates: "1504–1572", description: "Pape dominicain qui organisa la résistance chrétienne contre les Turcs (bataille de Lépante) et promulgua le catéchisme du Concile de Trente." },
  "05-01": { name: "Saint Joseph travailleur", dates: "", description: "Fête de saint Joseph, patron des travailleurs. Instituée par Pie XII en 1955, elle rappelle la dignité du travail humain à travers la figure de Joseph, charpentier de Nazareth." },
  "05-02": { name: "Saint Athanase d'Alexandrie", dates: "295–373", description: "Évêque d'Alexandrie et Docteur de l'Église, champion de l'orthodoxie trinitaire contre l'arianisme. Exilé cinq fois pour sa foi, il incarna le courage dans l'adversité." },
  "05-03": { name: "Saints Philippe et Jacques, apôtres", dates: "", description: "Fête des apôtres Philippe, qui demanda à Jésus de leur montrer le Père, et Jacques le Mineur, premier évêque de Jérusalem et auteur d'une épître canonique." },
  "05-04": { name: "Bienheureuse Florentine", dates: "†1547", description: "Religieuse franciscaine espagnole, sœur de saint Jean d'Avila. Elle vécut une vie de grande austérité et de dévotion au Sacré-Cœur." },
  "05-05": { name: "Saint Gotthard de Hildesheim", dates: "960–1038", description: "Évêque de Hildesheim, réformateur du monachisme en Allemagne. Le col des Alpes porte son nom en hommage à son rôle de guide spirituel." },
  "05-06": { name: "Saint François de Girolamo", dates: "1642–1716", description: "Jésuite napolitain, prédicateur populaire extraordinaire. Il se consacra aux missions populaires dans le royaume de Naples et à l'accompagnement des prisonniers et des mourants." },
  "05-07": { name: "Bienheureuse Rosa Venerini", dates: "1656–1728", description: "Fondatrice des Maîtresses Pieuses, premières enseignantes catholiques en Italie. Elle ouvrit des écoles gratuites pour les jeunes filles pauvres à travers toute la péninsule." },
  "05-08": { name: "Bienheureuse Marie-Thérèse de Soubiran", dates: "1835–1889", description: "Fondatrice de la Société de Notre-Dame du Cénacle à Toulouse, vouée à la prière et à l'accueil. Dépossédée de son œuvre par une sœur intrigante, elle vécut ses dernières années dans l'humilité." },
  "05-09": { name: "Saint Pacôme le Grand", dates: "292–348", description: "Père du monachisme cénobitique. Ancien soldat converti, il fonda le premier monastère organisé en communauté en Haute-Égypte, établissant une règle qui influença tout le monachisme occidental." },
  "05-10": { name: "Saint Jean d'Avila", dates: "1499–1569", description: "Prêtre espagnol, apôtre de l'Andalousie, Docteur de l'Église. Maître spirituel de sainte Thérèse d'Avila et de saint François Borgia, il fut l'un des grands réformateurs du clergé espagnol." },
  "05-11": { name: "Saint Mamert de Vienne", dates: "†475", description: "Évêque de Vienne en Gaule, il institua les Rogations — trois jours de prières et de processions avant l'Ascension pour demander la protection divine sur les récoltes." },
  "05-12": { name: "Saints Nérée et Achillée", dates: "†304", description: "Soldats romains convertis au christianisme, martyrisés sous Dioclétien. Leur tombeau dans les catacombes de Domitille est l'un des plus anciens lieux de culte romains." },
  "05-13": { name: "Notre-Dame de Fatima", dates: "1917", description: "Commémoration des apparitions de la Vierge Marie à Fatima, au Portugal, à trois enfants : Lucie, François et Jacinthe. Message de conversion, de prière et de pénitence." },
  "05-14": { name: "Saint Matthias, apôtre", dates: "", description: "Élu pour remplacer Judas parmi les Douze, Matthias est le seul apôtre choisi par tirage au sort, après la prière de la communauté réunie autour de Marie." },
  "05-15": { name: "Saint Isidore le Laboureur", dates: "1070–1130", description: "Paysan madrilène, patron des agriculteurs et de la ville de Madrid. Sa vie simple et pieuse, marquée par la charité envers les pauvres, en fait un modèle de sainteté ordinaire." },
  "05-16": { name: "Sainte Marguerite-Marie Alacoque", dates: "1647–1690", description: "Religieuse visitandine, confidente du Sacré-Cœur de Jésus. Ses visions ont conduit à l'institution de la fête du Sacré-Cœur, célébrée dans l'Église universelle." },
  "05-17": { name: "Saint Pascal Baylon", dates: "1540–1592", description: "Frère franciscain espagnol, mystique eucharistique. Berger devenu religieux, il passa de longues heures en adoration devant le Tabernacle. Patron des congrès eucharistiques." },
  "05-18": { name: "Saint Jean Ier", dates: "†526", description: "Pape martyr, mort en prison sur ordre du roi ostrogoth Théodoric après une ambassade à Constantinople. Premier pape à se rendre en personne dans la capitale byzantine." },
  "05-19": { name: "Saint Yves de Bretagne", dates: "1253–1303", description: "Prêtre breton, avocat et juge réputé pour son intégrité et sa défense des pauvres. Patron des avocats, des juristes et de la Bretagne." },
  "05-20": { name: "Saint Bernardin de Sienne", dates: "1380–1444", description: "Franciscain, grand prédicateur populaire de l'Italie du XVe siècle. Il propagea la dévotion au Saint-Nom de Jésus et renouvela profondément la vie religieuse de son époque." },
  "05-21": { name: "Saint Christophe Magallanes", dates: "1869–1927", description: "Prêtre mexicain martyr, exécuté durant la persécution des Cristeros. Il refusa de fuir et affronta la mort en disant : « Je meurs innocent. Je pardonne de tout cœur. »" },
  "05-22": { name: "Sainte Rita de Cascia", dates: "1381–1457", description: "Augustinienne italienne, veuve et moniale. Patronne des causes impossibles, elle portait sur son front une épine de la couronne du Christ. Intercesseur universel des situations désespérées." },
  "05-23": { name: "Saint Didier de Vienne", dates: "†607", description: "Évêque de Vienne en Gaule, martyr. Il fut tué sur ordre de la reine Brunehaut qu'il avait courageusement réprimandée pour ses vices." },
  "05-24": { name: "Saint Louis-Marie Grignion de Montfort", dates: "1673–1716", description: "Missionnaire français, fondateur de la Compagnie de Marie. Auteur du Traité de la vraie dévotion à la Sainte Vierge, spiritualité mariale qui influença des générations de catholiques." },
  "05-25": { name: "Saint Bède le Vénérable", dates: "672–735", description: "Moine bénédictin anglais, Docteur de l'Église. Père de l'historiographie anglaise, auteur de l'Histoire ecclésiastique du peuple anglais, il passa toute sa vie dans son monastère de Jarrow." },
  "05-26": { name: "Saint Philippe Néri", dates: "1515–1595", description: "Fondateur de la Congrégation de l'Oratoire à Rome. Surnommé « l'Apôtre de Rome », il rayonnait d'une joie communicative et attira des milliers de personnes à la vie spirituelle." },
  "05-27": { name: "Saint Augustin de Cantorbéry", dates: "†604", description: "Moine bénédictin envoyé par saint Grégoire le Grand évangéliser l'Angleterre. Premier archevêque de Cantorbéry, il est le père de l'Église anglaise." },
  "05-28": { name: "Saint Germain de Paris", dates: "496–576", description: "Évêque de Paris, thaumaturge et pacificateur. Il joua un rôle déterminant dans la conversion des rois mérovingiens et fonda l'abbaye de Saint-Germain-des-Prés." },
  "05-29": { name: "Sainte Jeanne d'Arc", dates: "1412–1431", description: "Vierge et martyre, patronne principale de la France. Bergère lorraine animée de voix célestes, elle mena les armées du roi Charles VII à la victoire avant d'être brûlée à Rouen." },
  "05-30": { name: "Saint Ferdinand III de Castille", dates: "1198–1252", description: "Roi de Castille et de León, il reconquit Séville, Cordoue et Murcie sur les Maures. Homme de grande piété, il fut canonisé pour sa charité envers les pauvres et son zèle missionnaire." },
  "05-31": { name: "Visitation de la Vierge Marie", dates: "", description: "Fête de la visite de Marie à sa cousine Élisabeth, enceinte de Jean-Baptiste. À l'entrée de Marie, Jean tressaillit dans le sein d'Élisabeth, et celle-ci prophétisa le Magnificat." },
  "06-01": { name: "Saint Justin, martyr", dates: "100–165", description: "Premier grand philosophe chrétien, apologist du IIe siècle. Converti après une longue quête philosophique, il mourut décapité à Rome pour avoir refusé d'apostasier." },
  "06-02": { name: "Saints Marcellin et Pierre", dates: "†304", description: "Exorciste et prêtre romains martyrisés sous Dioclétien. Leurs noms figurent dans le Canon romain de la messe, signe de leur vénération très ancienne." },
  "06-03": { name: "Saints Charles Lwanga et compagnons", dates: "†1886", description: "Martyrs ougandais, tués sur ordre du roi Mwanga pour avoir refusé ses avances et protégé leurs jeunes pages. Premiers martyrs d'Afrique noire, patrons de la jeunesse africaine." },
  "06-04": { name: "Sainte Clotilde", dates: "474–545", description: "Reine des Francs, épouse de Clovis Ier. Par sa foi et ses prières, elle obtint la conversion de son époux et ouvrit la voie à la christianisation de la France." },
  "06-05": { name: "Saint Boniface", dates: "675–754", description: "Évêque et martyr anglais, apôtre de la Germanie. Il évangélisa les peuples germaniques, fonda des monastères et fut tué par des Frisons lors d'une mission de baptême." },
  "06-06": { name: "Saint Norbert de Xanten", dates: "1080–1134", description: "Fondateur de l'Ordre des Prémontrés (chanoines réguliers). Converti après avoir échappé de justesse à la mort, il devint archevêque de Magdebourg et réforma le clergé de son diocèse." },
  "06-09": { name: "Saint Éphrem le Syrien", dates: "306–373", description: "Diacre et Docteur de l'Église, grand poète et théologien syriaque. Surnommé « la harpe de l'Esprit Saint », il exprima la foi chrétienne dans une langue d'une beauté incomparable." },
  "06-11": { name: "Saint Barnabé, apôtre", dates: "", description: "Compagnon de saint Paul dans ses voyages missionnaires, il apporta l'Évangile à Chypre, son île natale. Son nom signifie « fils de consolation » dans la tradition biblique." },
  "06-13": { name: "Saint Antoine de Padoue", dates: "1195–1231", description: "Franciscain portugais, Docteur de l'Église. Grand prédicateur qui convertit des foules, thaumaturge populaire, il est l'un des saints les plus invoqués de l'histoire catholique." },
  "06-21": { name: "Saint Louis de Gonzague", dates: "1568–1591", description: "Jésuite, mort à 23 ans en soignant les pestiférés. Prince renonçant à tous ses titres pour vivre l'Évangile, patron de la jeunesse catholique." },
  "06-22": { name: "Saint Thomas More", dates: "1478–1535", description: "Lord Chancelier d'Angleterre, martyr. Refusant de reconnaître le roi Henri VIII comme chef de l'Église, il fut décapité. Patron des hommes politiques et des avocats." },
  "06-24": { name: "Nativité de saint Jean-Baptiste", dates: "", description: "Solennité de la naissance du Précurseur, seul saint dont l'Église célèbre la nativité comme celle de la Vierge et du Christ. Voix qui crie dans le désert." },
  "06-28": { name: "Saint Irénée de Lyon", dates: "130–202", description: "Évêque de Lyon et Docteur de l'Église. Disciple de saint Polycarpe, lui-même disciple de saint Jean, il combattit la gnose et formula avec clarté la foi apostolique." },
  "06-29": { name: "Saints Pierre et Paul, apôtres", dates: "", description: "Solennité des deux piliers de l'Église romaine. Pierre, le pêcheur devenu roc de la foi, et Paul, le persécuteur devenu apôtre des nations, scellèrent leur témoignage dans le martyre à Rome." },
  "06-30": { name: "Les premiers martyrs de Rome", dates: "†64", description: "Chrétiens mis à mort par Néron après l'incendie de Rome. Premiers martyrs de l'Occident, leur sang est la semence de l'Église romaine." },
  "07-03": { name: "Saint Thomas, apôtre", dates: "", description: "Apôtre surnommé « le Jumeau ». Sa demande de voir les blessures du Christ ressuscité lui valut d'entendre : « Bienheureux ceux qui croient sans avoir vu. » Évangélisateur de l'Inde." },
  "07-04": { name: "Sainte Élisabeth du Portugal", dates: "1271–1336", description: "Reine du Portugal, tiercière franciscaine. Elle consacra sa vie à la paix entre les nations et à la charité envers les pauvres. Médiatrice entre son mari et son fils révoltés." },
  "07-11": { name: "Saint Benoît de Nursie", dates: "480–547", description: "Père du monachisme occidental, fondateur de l'Ordre bénédictin. Sa Règle — ora et labora — structura l'Europe médiévale. Patron de l'Europe avec Cyrille, Méthode et d'autres saints." },
  "07-14": { name: "Saint Camille de Lellis", dates: "1550–1614", description: "Fondateur des Camilliens (Ministres des infirmes). Ancien soldat et joueur converti, il se consacra aux malades et fonda le premier service d'ambulances de l'histoire." },
  "07-15": { name: "Saint Bonaventure", dates: "1221–1274", description: "Franciscain, cardinal, Docteur de l'Église. Philosophe mystique et administrateur de génie, il dirigea l'Ordre franciscain à un moment crucial de son histoire." },
  "07-22": { name: "Sainte Marie-Madeleine", dates: "", description: "Disciple bien-aimée de Jésus, premier témoin de la Résurrection. Elle annonça aux apôtres : « J'ai vu le Seigneur ! » L'Église la nomme « apôtre des apôtres »." },
  "07-25": { name: "Saint Jacques, apôtre", dates: "†44", description: "Fils de Zébédée, frère de Jean, premier apôtre martyr. Son tombeau à Saint-Jacques-de-Compostelle est l'un des plus grands lieux de pèlerinage de la chrétienté." },
  "07-26": { name: "Saints Joachim et Anne", dates: "", description: "Parents de la Vierge Marie, grands-parents de Jésus. Leur foi et leur espérance dans l'attente d'un enfant en font les patrons des parents et des grands-parents." },
  "07-29": { name: "Sainte Marthe", dates: "", description: "Sœur de Marie et de Lazare, hôte de Jésus à Béthanie. À elle fut dit : « Je suis la résurrection et la vie. » Patronne des servantes, des restaurateurs et des hôteliers." },
  "07-31": { name: "Saint Ignace de Loyola", dates: "1491–1556", description: "Fondateur de la Compagnie de Jésus. Ancien militaire converti après une blessure, il écrivit les Exercices Spirituels et forma une armée d'apôtres au service de l'Église." },
  "08-04": { name: "Saint Jean-Marie Vianney", dates: "1786–1859", description: "Curé d'Ars, patron des prêtres. Simple curé de campagne, il attira des milliers de pèlerins par sa sainteté rayonnante et son extraordinaire charisme dans la confession." },
  "08-06": { name: "Transfiguration du Seigneur", dates: "", description: "Fête de la Transfiguration de Jésus sur le mont Thabor, en présence de Pierre, Jacques et Jean. Moïse et Élie apparaissent ; une voix du ciel proclame : « Celui-ci est mon Fils bien-aimé. »" },
  "08-08": { name: "Saint Dominique de Guzman", dates: "1170–1221", description: "Fondateur de l'Ordre des Prêcheurs (Dominicains). Prêcheur infatigable contre l'hérésie albigeoise, il fonda un ordre voué à l'étude et à la prédication évangélique." },
  "08-10": { name: "Saint Laurent, diacre et martyr", dates: "†258", description: "Diacre de Rome martyrisé sur un gril sous Valérien. À qui lui demandait où étaient les trésors de l'Église, il désigna les pauvres : « Voici les vrais trésors de l'Église. »" },
  "08-11": { name: "Sainte Claire d'Assise", dates: "1194–1253", description: "Fondatrice des Clarisses (Pauvres Dames). Première disciple féminine de saint François d'Assise, elle vécut quarante ans dans une pauvreté absolue et une contemplation profonde." },
  "08-14": { name: "Saint Maximilien Kolbe", dates: "1894–1941", description: "Franciscain polonais mort en martyr à Auschwitz. Il s'offrit pour remplacer un père de famille condamné à mort. Canonisé par Jean-Paul II comme « martyr de la charité »." },
  "08-15": { name: "Assomption de la Vierge Marie", dates: "", description: "Solennité de l'Assomption, définie comme dogme par Pie XII en 1950 : Marie fut élevée au ciel en corps et en âme à la fin de sa vie terrestre." },
  "08-20": { name: "Saint Bernard de Clairvaux", dates: "1090–1153", description: "Abbé cistercien et Docteur de l'Église. Réformateur monastique, prédicateur de la deuxième croisade, conseiller des papes, il fut l'homme le plus influent de son siècle." },
  "08-21": { name: "Saint Pie X", dates: "1835–1914", description: "Pape de la réforme liturgique et de la communion fréquente. Fils de paysan devenu pape, il combattit le modernisme et encouragea la dévotion eucharistique des fidèles, notamment des enfants." },
  "08-24": { name: "Saint Barthélemy, apôtre", dates: "", description: "Apôtre identifié à Nathanaël, à qui Jésus dit : « Voilà vraiment un Israélite, en qui il n'y a pas de ruse. » Il aurait évangélisé l'Arménie et l'Inde." },
  "08-25": { name: "Saint Louis IX de France", dates: "1214–1270", description: "Roi de France, juste et charitable. Il rendit la justice sous un chêne et mourut lors de la huitième croisade. Patron de la France et des tertiaires franciscains." },
  "08-27": { name: "Sainte Monique", dates: "332–387", description: "Mère de saint Augustin. Ses larmes et ses prières pendant trente ans pour la conversion de son fils en font la patronne des mères chrétiennes et des épouses de non-chrétiens." },
  "08-28": { name: "Saint Augustin d'Hippone", dates: "354–430", description: "Évêque d'Hippone et Docteur de l'Église. Ses Confessions et La Cité de Dieu comptent parmi les plus grands textes de la littérature spirituelle universelle." },
  "09-08": { name: "Nativité de la Vierge Marie", dates: "", description: "Fête de la naissance de Marie, fruit des prières de ses parents Joachim et Anne. L'Église célèbre l'aurore du salut, le « premier rayon du Soleil de justice »." },
  "09-09": { name: "Saint Pierre Claver", dates: "1580–1654", description: "Jésuite espagnol, missionnaire à Carthagène des Indes. Il consacra quarante ans de sa vie aux esclaves africains débarqués en Amérique, les baptisant et les accompagnant. Patron des missions africaines." },
  "09-13": { name: "Saint Jean Chrysostome", dates: "347–407", description: "Archevêque de Constantinople et Docteur de l'Église. Surnommé « Bouche d'or » pour son éloquence, il est l'un des plus grands prédicateurs de l'Antiquité chrétienne." },
  "09-14": { name: "Exaltation de la Sainte Croix", dates: "", description: "Fête de la Croix glorieuse, instrument de notre salut. « Il faut que le Fils de l'Homme soit élevé, afin que tout homme qui croit ait par lui la vie éternelle. » (Jn 3,14-15)" },
  "09-15": { name: "Notre-Dame des Douleurs", dates: "", description: "Fête de Marie au pied de la Croix. Le glaive prophétisé par Siméon transperce le cœur de la Mère. Elle est associée à la Passion de son Fils comme Corédemptrice." },
  "09-21": { name: "Saint Matthieu, apôtre et évangéliste", dates: "", description: "Collecteur d'impôts appelé par Jésus : « Suis-moi. » Auteur du premier Évangile canonique, il témoigne de l'accomplissement des Écritures dans la vie de Jésus." },
  "09-27": { name: "Saint Vincent de Paul", dates: "1581–1660", description: "Fondateur des Lazaristes et des Filles de la Charité. Surnommé « l'Apôtre de la charité », il révolutionna l'assistance aux pauvres et la formation des prêtres." },
  "09-29": { name: "Saints Michel, Gabriel et Raphaël, archanges", dates: "", description: "Fête des trois archanges : Michel, chef de l'armée céleste ; Gabriel, messager de l'Annonciation ; Raphaël, compagnon de Tobie et guérisseur. Gardiens et messagers de Dieu." },
  "09-30": { name: "Saint Jérôme", dates: "347–420", description: "Prêtre et Docteur de l'Église, auteur de la Vulgate. Sa traduction de la Bible en latin resta la version officielle de l'Église pendant quinze siècles. Ermite passionné et érudit redoutable." },
  "10-01": { name: "Sainte Thérèse de l'Enfant-Jésus", dates: "1873–1897", description: "Carmélite de Lisieux, Docteur de l'Église. Sa « petite voie » d'abandon à l'amour divin dans les petites choses en fit une des saintes les plus populaires du XXe siècle. Patronne des missions." },
  "10-02": { name: "Saints Anges Gardiens", dates: "", description: "Fête des anges gardiens que Dieu confie à chaque personne. « Il a chargé ses anges de vous garder en toutes vos voies. » (Ps 91)" },
  "10-04": { name: "Saint François d'Assise", dates: "1182–1226", description: "Fondateur des Franciscains. Le Poverello d'Assise, stigmatisé et chantre de la création (Cantique des créatures), incarne la joie évangélique et l'amour de la pauvreté." },
  "10-07": { name: "Notre-Dame du Rosaire", dates: "1571", description: "Fête instituée après la victoire de Lépante, attribuée à la prière du Rosaire. Marie offre son chapelet comme arme spirituelle et chemin de contemplation du Christ." },
  "10-15": { name: "Sainte Thérèse d'Avila", dates: "1515–1582", description: "Carmélite espagnole, fondatrice des Carmélites Déchaussées et Docteur de l'Église. Ses écrits mystiques — Le Château intérieur, Le Livre de la Vie — sont des chefs-d'œuvre de la spiritualité." },
  "10-16": { name: "Sainte Hedwige de Silésie", dates: "1174–1243", description: "Duchesse de Silésie et de Pologne. Après la mort de son mari, elle entra au monastère cistercien de Trebnitz qu'elle avait fondé et vécut dans l'austérité et la charité." },
  "10-17": { name: "Saint Ignace d'Antioche", dates: "35–107", description: "Évêque d'Antioche, disciple des apôtres, martyr. Ses lettres écrites en route vers son martyre à Rome sont des joyaux de la théologie eucharistique et ecclésiale." },
  "10-18": { name: "Saint Luc, évangéliste", dates: "", description: "Médecin, compagnon de saint Paul, auteur du troisième Évangile et des Actes des Apôtres. Il présente Jésus comme la miséricorde de Dieu faite homme, attentif aux pauvres et aux femmes." },
  "10-22": { name: "Saint Jean-Paul II", dates: "1920–2005", description: "Pape polonais de 1978 à 2005, canonisé en 2014. Sa devise Totus tuus (tout à toi, Marie) résuma son pontificat historique. Il évangélisa le monde entier et contribua à la chute du communisme." },
  "10-28": { name: "Saints Simon et Jude, apôtres", dates: "", description: "Simon le Zélote et Jude Thaddée, apôtres du Christ. Jude est particulièrement invoqué comme patron des causes désespérées. Ils auraient évangélisé ensemble la Perse." },
  "11-01": { name: "Toussaint", dates: "", description: "Solennité de tous les saints, connus et inconnus. L'Église célèbre la multitude des élus qui contemplent Dieu face à face et intercèdent pour nous." },
  "11-02": { name: "Commémoration des fidèles défunts", dates: "", description: "Journée de prière pour tous les défunts. L'Église rappelle le mystère de la communion des saints et l'espérance de la résurrection." },
  "11-04": { name: "Saint Charles Borromée", dates: "1538–1584", description: "Archevêque de Milan, cardinal réformateur. L'un des grands artisans de la Contre-Réforme, il mit en œuvre les décrets du Concile de Trente avec une énergie et une rigueur exceptionnelles." },
  "11-09": { name: "Dédicace de la basilique du Latran", dates: "", description: "Fête de la « mère et chef de toutes les Églises » du monde. La basilique Saint-Jean-de-Latran à Rome, cathédrale du pape, est le symbole de l'unité de l'Église universelle." },
  "11-11": { name: "Saint Martin de Tours", dates: "315–397", description: "Évêque de Tours, apôtre de la Gaule. L'épisode du manteau partagé avec un pauvre, dans lequel il reconnut le Christ, est l'un des récits les plus populaires de la sainteté chrétienne." },
  "11-12": { name: "Saint Josaphat Kuntsevych", dates: "1580–1623", description: "Archevêque de Polotsk, martyr de l'union des Églises. Il mourut pour sa foi dans l'union avec Rome, tué par une foule hostile. Patron de l'Église gréco-catholique ukrainienne." },
  "11-15": { name: "Saint Albert le Grand", dates: "1193–1280", description: "Dominicain, évêque de Ratisbonne et Docteur de l'Église. Maître de Thomas d'Aquin, il fut le premier à synthétiser la philosophie aristotélicienne avec la théologie chrétienne." },
  "11-16": { name: "Sainte Marguerite d'Écosse", dates: "1045–1093", description: "Reine d'Écosse, épouse du roi Malcolm III. Elle renouvela profondément la vie religieuse de l'Écosse, fonda des monastères et des hôpitaux, et vécut une vie de grande piété." },
  "11-17": { name: "Sainte Élisabeth de Hongrie", dates: "1207–1231", description: "Princesse hongroise, tiercière franciscaine. À 24 ans, après la mort de son mari, elle distribua tous ses biens aux pauvres et se consacra aux malades dans un hôpital qu'elle avait fondé." },
  "11-21": { name: "Présentation de la Vierge Marie", dates: "", description: "Fête de la présentation de Marie enfant au Temple de Jérusalem. Elle symbolise l'offrande totale de soi à Dieu que Marie réalisa dès sa plus tendre enfance." },
  "11-22": { name: "Sainte Cécile", dates: "†230", description: "Martyre romaine, patronne des musiciens et des poètes. Sa mort sereine en chantant les louanges de Dieu en a fait le symbole de la musique sacrée au service de la foi." },
  "11-24": { name: "Saint André Dung-Lac et compagnons", dates: "†1820–1862", description: "117 martyrs du Viêtnam, victimes des persécutions contre les chrétiens. Parmi eux, prêtres, religieux et laïcs, ils témoignèrent de leur foi jusqu'à la mort." },
  "11-25": { name: "Sainte Catherine d'Alexandrie", dates: "†305", description: "Vierge et martyre, savante et éloquente. Elle confondit les philosophes envoyés pour l'ébranler et mourut par décapitation après avoir survécu à la roue de son martyre. Patronne des philosophes." },
  "11-30": { name: "Saint André, apôtre", dates: "", description: "Premier appelé parmi les Douze, frère de Simon-Pierre. Il amena son frère à Jésus. Évangélisateur de la Grèce, il mourut crucifié sur une croix en forme de X, patron de l'Écosse." },
  "12-03": { name: "Saint François Xavier", dates: "1506–1552", description: "Jésuite espagnol, cofondateur de la Compagnie de Jésus avec Ignace de Loyola. Missionnaire extraordinaire en Inde, au Japon et en Extrême-Orient, patron des missions." },
  "12-06": { name: "Saint Nicolas de Myre", dates: "270–343", description: "Évêque de Myre en Lycie, thaumaturge. Sa grande générosité envers les pauvres, notamment les enfants, est à l'origine de la figure du Père Noël." },
  "12-07": { name: "Saint Ambroise de Milan", dates: "340–397", description: "Évêque de Milan et Docteur de l'Église, père de la liturgie occidentale. Gouverneur devenu évêque par acclamation populaire, il baptisa saint Augustin et s'opposa à l'arianisme impérial." },
  "12-08": { name: "Immaculée Conception de la Vierge Marie", dates: "", description: "Solennité du dogme défini par Pie IX en 1854 : Marie fut préservée du péché originel dès sa conception, en vue d'être la Mère du Sauveur." },
  "12-12": { name: "Notre-Dame de Guadalupe", dates: "1531", description: "Apparition de Marie à Juan Diego sur le Tepeyac, au Mexique. Son image miraculeuse sur la tilma déclencha la christianisation de l'Amérique centrale. Patronne du continent américain." },
  "12-13": { name: "Sainte Lucie de Syracuse", dates: "283–304", description: "Vierge et martyre sicilienne. Refusant un mariage arrangé, elle consacra sa virginité à Dieu et fut martyrisée. Son nom, lié à la lumière (lux), en fait la patronne des aveugles." },
  "12-14": { name: "Saint Jean de la Croix", dates: "1542–1591", description: "Carme espagnol et Docteur de l'Église. Co-réformateur du Carmel avec Thérèse d'Avila, auteur de La Montée du Carmel et de La Nuit obscure, sommets de la mystique chrétienne." },
  "12-25": { name: "Nativité de Notre Seigneur Jésus Christ", dates: "", description: "Solennité de la naissance de Jésus à Bethléem. « Le Verbe s'est fait chair et il a habité parmi nous. » (Jn 1,14) — Mystère de l'Incarnation, cœur du christianisme." },
  "12-26": { name: "Saint Étienne, premier martyr", dates: "†36", description: "Diacre, premier martyr chrétien. Lapidé à Jérusalem, il vit les cieux s'ouvrir et dit : « Je vois le Fils de l'Homme debout à la droite de Dieu. » Saul de Tarse assista à son martyre." },
  "12-27": { name: "Saint Jean, apôtre et évangéliste", dates: "", description: "Le disciple bien-aimé, seul apôtre à ne pas mourir martyr. Auteur du quatrième Évangile, de trois épîtres et de l'Apocalypse, il posa sa tête sur la poitrine du Seigneur à la Cène." },
  "12-28": { name: "Saints Innocents, martyrs", dates: "", description: "Enfants de Bethléem massacrés par Hérode cherchant à tuer l'Enfant-Jésus. L'Église les vénère comme martyrs sans l'avoir voulu, les « boutons de fleur de l'Église »." },
  "12-29": { name: "Saint Thomas Becket", dates: "1118–1170", description: "Archevêque de Cantorbéry, martyr. Ami du roi Henri II devenu son adversaire, il fut assassiné dans sa cathédrale pour avoir défendu les libertés de l'Église." },
  "12-31": { name: "Saint Sylvestre Ier", dates: "†335", description: "Pape du règne de Constantin, lors duquel le christianisme devint religion officielle de l'Empire romain. Sous son pontificat furent construites les premières grandes basiliques chrétiennes." },
};

function getSaint(dateStr: string): { name: string; dates: string; description: string } {
  const [, month, day] = dateStr.split("-");
  const key = `${month}-${day}`;
  return SAINTS_BY_DATE[key] || {
    name: "Saint(e) du jour",
    dates: "",
    description: "Les données du saint du jour ne sont pas disponibles pour cette date.",
  };
}

// ─── Citations spirituelles par jour de l'année ───────────────────────────────
const QUOTES: Array<{ text: string; author: string }> = [
  { text: "Notre cœur est sans repos jusqu'à ce qu'il trouve son repos en toi.", author: "Saint Augustin" },
  { text: "La prière est l'élévation de l'âme vers Dieu.", author: "Saint Jean Damascène" },
  { text: "Fais ce que tu fais.", author: "Saint François de Sales" },
  { text: "Il n'y a qu'un seul moyen d'être heureux : aimer.", author: "Sainte Thérèse de Lisieux" },
  { text: "La sainteté est simplement de faire la volonté de Dieu avec joie.", author: "Sainte Teresa de Calcutta" },
  { text: "Ne cherche pas à comprendre pour croire, mais crois pour comprendre.", author: "Saint Augustin" },
  { text: "Si tu savais le don de Dieu.", author: "Jésus à la Samaritaine (Jn 4,10)" },
  { text: "La prière est le souffle de l'âme et la nourriture de l'esprit.", author: "Saint Grégoire le Grand" },
  { text: "Seigneur, que je te connaisse, que je me connaisse.", author: "Saint Augustin" },
  { text: "Aime et fais ce que tu veux.", author: "Saint Augustin" },
  { text: "La croix est l'échelle des âmes.", author: "Saint Jean de la Croix" },
  { text: "Ce qui me manque, c'est l'amour. Sans lui, tout le reste ne sert à rien.", author: "Sainte Thérèse de Lisieux" },
  { text: "Ne vous troublez de rien, ne vous étonnez de rien.", author: "Sainte Thérèse d'Avila" },
  { text: "Dieu ne demande pas l'impossible. Il commande. Il invite à faire ce qu'on peut, et à demander ce qu'on ne peut pas.", author: "Concile de Trente" },
  { text: "L'humilité est la vérité.", author: "Sainte Thérèse d'Avila" },
  { text: "Je suis la voie, la vérité et la vie.", author: "Jésus (Jn 14,6)" },
  { text: "Si Dieu est pour nous, qui sera contre nous ?", author: "Saint Paul (Rm 8,31)" },
  { text: "La charité couvre une multitude de péchés.", author: "Saint Pierre (1 P 4,8)" },
  { text: "Le chemin vers Dieu est un chemin d'amour.", author: "Saint François d'Assise" },
  { text: "Tout est grâce.", author: "Sainte Thérèse de Lisieux" },
  { text: "La foi, c'est voir la lumière avec son cœur quand les yeux ne voient que le noir.", author: "Attribué à saint Thomas d'Aquin" },
  { text: "Seigneur, tu sais que je t'aime.", author: "Saint Pierre (Jn 21,17)" },
  { text: "Ma grâce te suffit, car ma puissance se manifeste dans la faiblesse.", author: "Le Seigneur à saint Paul (2 Co 12,9)" },
  { text: "Apprenez de moi que je suis doux et humble de cœur.", author: "Jésus (Mt 11,29)" },
  { text: "La prière est une montée de l'homme vers Dieu et une descente de Dieu vers l'homme.", author: "Saint Jean Chrysostome" },
  { text: "Celui qui prie se sauve. Celui qui ne prie pas se damne.", author: "Saint Alphonse de Liguori" },
  { text: "La véritable amitié commence là où l'intérêt s'arrête.", author: "Saint François de Sales" },
  { text: "Dieu ne peut donner aux hommes que lui-même.", author: "Saint Augustin" },
  { text: "Confie ta vie à l'amour de Dieu, et laisse-le agir.", author: "Sainte Thérèse de Lisieux" },
  { text: "Je peux tout en celui qui me fortifie.", author: "Saint Paul (Ph 4,13)" },
  { text: "Ce n'est pas moi qui vis, c'est le Christ qui vit en moi.", author: "Saint Paul (Ga 2,20)" },
];

function getQuote(dateStr: string): { text: string; author: string } {
  const date = new Date(dateStr);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

// ─── Parser AELF HTML ─────────────────────────────────────────────────────────
function extractGospelFromHtml(html: string, dateStr: string): SpiritualData["gospel"] {
  try {
    // Chercher la section évangile dans le HTML d'AELF
    // L'évangile est dans une section avec "evangile" dans les classes/id
    
    // Référence (ex: "Jn 16, 16-20")
    const refMatch = html.match(/Évangile[^<]*selon[^<]*\((Jn|Mt|Mc|Lc)\s*[\d\s,.-]+\)/i) ||
                     html.match(/<span[^>]*ref[^>]*>([^<]+)<\/span>/i) ||
                     html.match(/\(((?:Jn|Mt|Mc|Lc)\s*[\d]+,\s*[\d]+-?[\d]*)\)/);

    // Titre de l'évangile
    const titleMatch = html.match(/«\s*([^»]{10,80})\s*»/) ||
                       html.match(/Évangile\s*:?\s*«([^»]+)»/i);

    // Intro
    const introMatch = html.match(/Évangile de Jésus[- ]Christ selon saint ([A-Za-zÀ-ÿ]+)/i);

    // Texte de l'évangile — chercher après "En ce temps-là" ou "Jésus"
    const textMatch = html.match(/En ce temps-là[\s\S]{200,3000}(?=<\/p>|Acclamation|Prière|---)/i) ||
                      html.match(/Jésus disait[\s\S]{200,2000}(?=<\/p>|Acclamation|---)/i);

    if (!refMatch && !textMatch) return null;

    const reference = refMatch ? refMatch[1] || refMatch[0].replace(/[()]/g, "").trim() : "";
    const title = titleMatch ? titleMatch[1].trim() : "";
    const intro = introMatch ? `Évangile de Jésus Christ selon saint ${introMatch[1]}` : "Évangile du jour";
    
    // Nettoyer le texte HTML
    let text = textMatch ? textMatch[0] : "";
    text = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    text = text.slice(0, 2000); // Limiter la longueur

    const [year, month, day] = dateStr.split("-");
    const aelfUrl = `https://www.aelf.org/${year}-${month}-${day}/romain/messe`;

    return { reference, intro, text, title, aelfUrl };
  } catch {
    return null;
  }
}

// ─── Handler principal ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  
  // Date du jour en France
  const today = dateParam || new Date().toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
  
  const { season, week } = detectLiturgicalSeason(today);
  const { color, hex } = getLiturgicalColor(season);
  const dateLabel = formatLiturgicalDate(today);
  const saint = getSaint(today);
  const quote = getQuote(today);

  // Appel AELF pour l'évangile
  let gospel: SpiritualData["gospel"] = null;
  let apiError: string | undefined;

  try {
    const [year, month, day] = today.split("-");
    const aelfUrl = `https://api.aelf.org/v1/messes/${year}-${month}-${day}/france`;
    
    const aelfRes = await fetch(aelfUrl, {
      next: { revalidate: 3600 }, // Cache 1 heure
      headers: {
        "Accept": "application/json",
        "User-Agent": "Fraternitas/1.0 (contact@fraternitas.app)",
      },
    });

    if (aelfRes.ok) {
      const data = await aelfRes.json();
      // Parcourir les lectures pour trouver l'évangile
      const messes = data?.messes?.[0] || data?.messe?.[0] || data;
      const lectures = messes?.lectures || messes?.lecture || [];
      
      for (const lecture of lectures) {
        const type = (lecture.type || lecture.titre || "").toLowerCase();
        if (type.includes("évangile") || type.includes("evangile")) {
          gospel = {
            reference: lecture.ref || lecture.reference || "",
            intro: lecture.intro_lue || lecture.intro || "Évangile du jour",
            text: lecture.contenu || lecture.texte || "",
            title: lecture.titre_court || lecture.titre || "",
            aelfUrl: `https://www.aelf.org/${year}-${month}-${day}/romain/messe`,
          };
          break;
        }
      }

      // Fallback : essayer l'URL HTML AELF si l'API JSON ne donne pas l'évangile
      if (!gospel) {
        const htmlUrl = `https://www.aelf.org/${year}-${month}-${day}/romain/messe`;
        const htmlRes = await fetch(htmlUrl, {
          next: { revalidate: 3600 },
          headers: { "User-Agent": "Fraternitas/1.0" },
        });
        if (htmlRes.ok) {
          const html = await htmlRes.text();
          gospel = extractGospelFromHtml(html, today);
        }
      }
    } else {
      // Essai direct sur le site HTML
      const [y, m, d] = today.split("-");
      const htmlUrl = `https://www.aelf.org/${y}-${m}-${d}/romain/messe`;
      const htmlRes = await fetch(htmlUrl, {
        next: { revalidate: 3600 },
        headers: { "User-Agent": "Fraternitas/1.0 (contact@fraternitas.app)" },
      });
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        gospel = extractGospelFromHtml(html, today);
      }
    }
  } catch (err) {
    console.error("[SPIRITUAL_API] AELF fetch error:", err);
    apiError = "L'évangile du jour n'est pas disponible en ce moment.";
  }

  const response: SpiritualData = {
    date: today,
    liturgicalInfo: {
      label: dateLabel,
      season,
      week,
      color,
      colorHex: hex,
    },
    gospel,
    saint,
    quote,
    ...(apiError ? { error: apiError } : {}),
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
