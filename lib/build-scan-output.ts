export type PriorityLevel = "hoog" | "middel" | "laag";
export type RoadmapBucket = "now" | "next" | "later";

export type ScanAnswerValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined;

export type ScanAnswers = Record<string, ScanAnswerValue>;

export type ScanSectionInput = {
  id: string;
  title: string;
  category?: string;
  score?: number | null;
  answers?: ScanAnswers;
};

export type ScanInput = {
  id?: string;
  customerName?: string;
  sector?: string;
  goal?: string;
  overallScore?: number | null;
  sections?: ScanSectionInput[];
};

export type OutputPriorityItem = {
  id: string;
  title: string;
  category?: string;
  priority: PriorityLevel;
  bucket: RoadmapBucket;
  score: number;
  reason: string;
  advice: string;
  signals: string[];
};

export type ScanOutput = {
  meta: {
    customerName: string;
    sector: string;
    goal: string;
    scanId: string;
  };
  summary: {
    headline: string;
    explanation: string;
    scoreLabel: string;
    biggestRisk: string;
    biggestOpportunity: string;
    nextBestStep: string;
  };
  priorities: OutputPriorityItem[];
  quickWins: string[];
  roadmap: {
    now: OutputPriorityItem[];
    next: OutputPriorityItem[];
    later: OutputPriorityItem[];
  };
  impact: string[];
};

type ThemeDefinition = {
  id: string;
  title: string;
  category: string;
  keys: string[];
  enabledWhen?: (answers: ScanAnswers) => boolean;
};

type ThemeInput = {
  id: string;
  title: string;
  category: string;
  answers: ScanAnswers;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeText(value: ScanAnswerValue): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(" ").toLowerCase();
  return String(value).toLowerCase();
}

function asArray(value: ScanAnswerValue): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string" && value.trim() !== "") {
    return [value];
  }

  return [];
}

function hasValue(value: ScanAnswerValue): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined) return false;
  return String(value).trim() !== "";
}

function hasSignal(value: ScanAnswerValue, words: string[]): boolean {
  const text = normalizeText(value);
  return words.some((word) => text.includes(word));
}

function hasAnySignalInAnswers(
  answers: ScanAnswers | undefined,
  words: string[]
): boolean {
  if (!answers) return false;
  return Object.values(answers).some((value) => hasSignal(value, words));
}

function answerEquals(
  answers: ScanAnswers,
  key: string,
  expected: string
): boolean {
  return normalizeText(answers[key]) === expected.toLowerCase();
}

function answerIncludes(
  answers: ScanAnswers,
  key: string,
  expected: string
): boolean {
  return asArray(answers[key]).includes(expected);
}

function pickAnswers(allAnswers: ScanAnswers, keys: string[]): ScanAnswers {
  return Object.fromEntries(
    keys
      .filter((key) => hasValue(allAnswers[key]))
      .map((key) => [key, allAnswers[key]])
  );
}

function toMaturityScore(value: ScanAnswerValue): number {
  const raw = typeof value === "string" ? value : "";

  const scoreMap: Record<string, number> = {
    onvoldoende_duidelijk: 1,
    gedeeltelijk_duidelijk: 2,
    duidelijk_belegd: 3,

    ad_hoc: 1,
    deels_afgestemd: 2,
    vast_proces: 3,

    nauwelijks: 1,
    af_en_toe: 2,
    structureel: 3,

    sterk_verschillend: 1,
    redelijk_eenduidig: 2,
    gestandaardiseerd: 3,

    uitzondering_is_norm: 1,
    deels_beheersbaar: 2,
    beperkt_en_beheerst: 3,

    handmatig_herstellen: 1,
    mix_ad_hoc_structureel: 2,
    meestal_structureel: 3,

    kwetsbaar: 1,
    redelijk: 2,
    sterk: 3,

    beperkt_bruikbaar: 1,
    deels_bruikbaar: 2,
    goed_bruikbaar: 3,

    sluit_beperkt_aan: 1,
    sluit_deels_aan: 2,
    sluit_goed_aan: 3,

    vooral_handmatig: 1,
    goed_beheerst: 3,

    lage_druk: 1,
    middel_druk: 2,
    hoge_druk: 3,
  };

  return scoreMap[raw] ?? 0;
}

function average(scores: number[]): number {
  const validScores = scores.filter((score) => score > 0);
  if (validScores.length === 0) return 0;

  return Number(
    (
      validScores.reduce((sum, score) => sum + score, 0) / validScores.length
    ).toFixed(1)
  );
}

function themeScoreTo100(answers: ScanAnswers): number {
  const values = Object.values(answers).map(toMaturityScore).filter((v) => v > 0);
  if (values.length === 0) return 50;

  const avg = average(values);
  return clamp(Math.round(((avg - 1) / 2) * 100), 0, 100);
}

function deriveSignals(theme: ThemeInput): string[] {
  const answers = theme.answers;
  const signals: string[] = [];

  if (
    hasAnySignalInAnswers(answers, [
      "handmatig",
      "excel",
      "los bestand",
      "mail",
      "kopiëren",
      "overtypen",
      "handwerk",
      "vooral_handmatig",
    ])
  ) {
    signals.push("Veel handwerk");
  }

  if (
    hasAnySignalInAnswers(answers, [
      "fout",
      "fouten",
      "foutgevoelig",
      "incorrect",
      "mis",
      "onduidelijk",
      "kwetsbaar",
      "sluit_beperkt_aan",
    ])
  ) {
    signals.push("Foutgevoelig proces");
  }

  if (
    hasAnySignalInAnswers(answers, [
      "geen inzicht",
      "weinig inzicht",
      "onvoldoende inzicht",
      "dashboard",
      "rapportage",
      "kpi",
      "beperkt_bruikbaar",
    ])
  ) {
    signals.push("Beperkt inzicht");
  }

  if (
    hasAnySignalInAnswers(answers, [
      "koppeling",
      "integratie",
      "portaal",
      "api",
      "getconnector",
      "import",
      "export",
      "keten",
    ])
  ) {
    signals.push("Afhankelijk van keten of koppeling");
  }

  if (
    hasAnySignalInAnswers(answers, [
      "goedkeuring",
      "workflow",
      "controle",
      "autorisatie",
      "vier ogen",
      "governance",
      "eigenaarschap",
      "onvoldoende_duidelijk",
      "ad_hoc",
    ])
  ) {
    signals.push("Proces vraagt sturing of controle");
  }

  if (
    hasAnySignalInAnswers(answers, [
      "spoed",
      "uitzondering",
      "maatwerk",
      "afwijkend",
      "specifiek",
      "afwijking",
      "uitzondering_is_norm",
    ])
  ) {
    signals.push("Veel uitzonderingen");
  }

  if (
    hasAnySignalInAnswers(answers, ["hoge_druk", "hoog", "kritiek", "urgent"])
  ) {
    signals.push("Hoge strategische druk");
  }

  return signals;
}

function calculatePriorityScore(theme: ThemeInput, signals: string[]): number {
  const baseScore = themeScoreTo100(theme.answers);
  let priorityScore = 100 - baseScore;

  if (signals.includes("Veel handwerk")) priorityScore += 15;
  if (signals.includes("Foutgevoelig proces")) priorityScore += 12;
  if (signals.includes("Beperkt inzicht")) priorityScore += 10;
  if (signals.includes("Proces vraagt sturing of controle")) priorityScore += 10;
  if (signals.includes("Veel uitzonderingen")) priorityScore += 8;
  if (signals.includes("Afhankelijk van keten of koppeling")) priorityScore += 6;
  if (signals.includes("Hoge strategische druk")) priorityScore += 12;

  return clamp(Math.round(priorityScore), 0, 100);
}

function mapPriorityLevel(score: number): PriorityLevel {
  if (score >= 70) return "hoog";
  if (score >= 45) return "middel";
  return "laag";
}

function mapRoadmapBucket(
  _theme: ThemeInput,
  priority: PriorityLevel,
  signals: string[],
  score: number
): RoadmapBucket {
  const hasDirectPain =
    signals.includes("Veel handwerk") ||
    signals.includes("Foutgevoelig proces") ||
    signals.includes("Proces vraagt sturing of controle") ||
    signals.includes("Hoge strategische druk");

  if (priority === "hoog" && (hasDirectPain || score >= 80)) return "now";
  if (priority === "hoog") return "next";
  if (priority === "middel") return "next";
  return "later";
}

function buildThemeReason(
  theme: ThemeInput,
  signals: string[],
  priority: PriorityLevel
): string {
  switch (theme.id) {
    case "governance":
      return priority === "laag"
        ? "Eigenaarschap en besluitvorming zijn bruikbaar ingericht, maar kunnen later nog strakker."
        : "Eigenaarschap, besluitvorming en verbetersturing zijn nog niet scherp genoeg georganiseerd.";

    case "processes":
      return priority === "laag"
        ? "De procesbasis is werkbaar en kan later verder worden geoptimaliseerd."
        : "De werkwijze is nog niet eenduidig genoeg en uitzonderingen drukken te zwaar op de uitvoering.";

    case "finance":
      return priority === "laag"
        ? "De financiële basis is bruikbaar, met nog ruimte voor verdere verfijning."
        : "De financiële basis, verwerking of stuurinformatie vragen nog duidelijke aanscherping.";

    case "ordermanagement":
      return priority === "laag"
        ? "Het orderproces is in de basis werkbaar."
        : "Het orderproces kent nog te veel afwijkingen of sluit nog niet goed aan op de gewenste route.";

    case "crm":
      return priority === "laag"
        ? "CRM is bruikbaar ingericht, maar kan later nog sterker worden."
        : "CRM-data, procesvolwassenheid of bruikbaarheid voor sturing zijn nog niet sterk genoeg.";

    case "hrm":
      return priority === "laag"
        ? "HRM is in de basis bruikbaar ingericht."
        : "HRM-processen of datakwaliteit zijn nog niet stabiel genoeg voor een strakke uitvoering.";

    case "reporting":
      return priority === "laag"
        ? "Rapportage en data zijn bruikbaar, met ruimte voor verdere standaardisatie."
        : "Rapportage, definities en bruikbaarheid van data zijn nog onvoldoende scherp voor goede sturing.";

    case "integrations":
      return priority === "laag"
        ? "Integraties en ketenafspraken zijn in de basis bruikbaar."
        : "Integraties missen nog voldoende stabiliteit, monitoring of helder eigenaarschap.";

    case "care":
      return priority === "laag"
        ? "De zorgspecifieke uitvoering is werkbaar ingericht."
        : "Registratie, declaratie of verantwoording vragen nog meer beheersing.";

    case "education":
      return priority === "laag"
        ? "De onderwijsspecifieke uitvoering is werkbaar ingericht."
        : "Intake, planning en administratieve aansluiting vragen nog meer eenduidigheid en borging.";

    default:
      break;
  }

  if (signals.includes("Veel handwerk")) {
    return `Binnen ${theme.title.toLowerCase()} zorgt handmatig werk nog voor vertraging en extra foutkans.`;
  }

  if (signals.includes("Foutgevoelig proces")) {
    return `${theme.title} is nog niet betrouwbaar genoeg om hier strak op te sturen.`;
  }

  if (signals.includes("Beperkt inzicht")) {
    return `Binnen ${theme.title.toLowerCase()} ontbreekt nog voldoende inzicht om goed te kunnen sturen.`;
  }

  return `${theme.title} vraagt nog gerichte verbetering.`;
}

function buildThemeAdvice(
  theme: ThemeInput,
  signals: string[],
  priority: PriorityLevel
): string {
  switch (theme.id) {
    case "governance":
      return "Maak eigenaarschap, besluitvorming en wijzigingsregie expliciet. Leg vast wie beslist, wie uitvoert en wie bewaakt.";

    case "processes":
      return "Breng processen terug naar één herkenbare standaard. Verminder uitzonderingen en leg vaste werkafspraken vast.";

    case "finance":
      return "Versterk eerst de financiële basis. Maak verwerking, uitzonderingen en rapportage eenduidiger voordat je verder optimaliseert.";

    case "ordermanagement":
      return "Maak de orderroute leidend. Breng blokkades, uitzonderingen en factuurmomenten terug naar een vaste werkwijze.";

    case "crm":
      return "Maak CRM bruikbaar als stuurmiddel. Verbeter datakwaliteit, procesdiscipline en de aansluiting op rapportage.";

    case "hrm":
      return "Versterk de HRM-basis met eenduidige processen, betere gegevenskwaliteit en duidelijke werkafspraken.";

    case "reporting":
      return "Maak definities, KPI’s en rapportages eenduidig. Bouw pas verder als duidelijk is welke stuurinformatie echt nodig is.";

    case "integrations":
      return "Maak de keten rond AFAS beheersbaar. Richt eigenaarschap, monitoring en duidelijke afspraken over brondata in.";

    case "care":
      return "Breng registratie, declaratie en verantwoording terug naar een beheersbare standaard met minder herstelwerk.";

    case "education":
      return "Maak intake, planning en administratie beter op elkaar afgestemd. Verminder overdrachtsfouten en uitzonderingen.";
  }

  if (signals.includes("Veel handwerk")) {
    return `Maak voor ${theme.title.toLowerCase()} één vaste werkwijze en haal losse handmatige stappen uit het proces.`;
  }

  if (signals.includes("Beperkt inzicht")) {
    return `Bepaal eerst welke stuurinformatie binnen ${theme.title.toLowerCase()} echt nodig is.`;
  }

  if (priority === "hoog") {
    return `Pak ${theme.title.toLowerCase()} nu als eerste aan met een kleine en concrete verbeterslag.`;
  }

  if (priority === "middel") {
    return `Plan ${theme.title.toLowerCase()} in als volgende verbeterslag.`;
  }

  return `Laat ${theme.title.toLowerCase()} voorlopig staan en verbeter dit later gericht.`;
}

function buildScoreLabel(score: number | null | undefined): string {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "Nog geen totaalscore";
  }

  if (score >= 2.5) return "Sterke basis";
  if (score >= 2.0) return "Redelijke basis";
  if (score >= 1.5) return "Basis vraagt aandacht";
  return "Direct verbeteren nodig";
}

function buildHeadline(
  overallScore: number | null | undefined,
  priorities: OutputPriorityItem[]
): string {
  const top = priorities[0];

  if (!top) {
    return "De scan laat vooral kansen zien om slimmer en consistenter te werken.";
  }

  if (top.id === "governance") {
    if (top.priority === "hoog") {
      return "De basis vraagt eerst scherper eigenaarschap en duidelijke besluitvorming.";
    }
    return "De basis staat, maar governance kan nog duidelijk strakker.";
  }

  if (top.id === "processes") {
    if (top.priority === "hoog") {
      return "De grootste winst zit nu in meer standaardisatie en minder uitzonderingen.";
    }
    return "De basis staat, maar processen kunnen nog eenduidiger en rustiger worden ingericht.";
  }

  if (top.id === "finance") {
    if (top.priority === "hoog") {
      return "De financiële basis vraagt eerst aanscherping voor betrouwbare sturing.";
    }
    return "Financieel staat in de basis, maar kan nog sterker worden ingericht.";
  }

  if (top.id === "ordermanagement") {
    if (top.priority === "hoog") {
      return "De orderroute vraagt eerst meer grip, eenvoud en vaste werkwijze.";
    }
    return "Ordermanagement werkt in de basis, maar kan nog strakker worden ingericht.";
  }

  if (top.id === "crm") {
    if (top.priority === "hoog") {
      return "CRM vraagt nu vooral betere datakwaliteit en scherpere procesdiscipline.";
    }
    return "CRM staat in de basis, maar kan nog veel bruikbaarder worden voor sturing.";
  }

  if (top.id === "hrm") {
    if (top.priority === "hoog") {
      return "HRM vraagt eerst meer stabiliteit in proces en gegevenskwaliteit.";
    }
    return "HRM is bruikbaar ingericht, met ruimte voor verdere versterking.";
  }

  if (top.id === "reporting") {
    if (top.priority === "hoog") {
      return "De grootste winst zit nu in scherpere rapportage, definities en stuurinformatie.";
    }
    return "Rapportage en data bieden een basis, maar kunnen nog veel bruikbaarder worden.";
  }

  if (top.id === "integrations") {
    if (top.priority === "hoog") {
      return "De keten rond AFAS vraagt eerst meer stabiliteit, monitoring en eigenaarschap.";
    }
    return "Integraties werken in de basis, maar kunnen nog beheersbaarder worden gemaakt.";
  }

  if (top.id === "care") {
    if (top.priority === "hoog") {
      return "De zorgspecifieke uitvoering vraagt eerst meer eenvoud en beheersing.";
    }
    return "De basis staat, maar de zorgspecifieke uitvoering kan nog strakker.";
  }

  if (top.id === "education") {
    if (top.priority === "hoog") {
      return "De onderwijsspecifieke uitvoering vraagt eerst meer eenduidigheid en afstemming.";
    }
    return "De basis staat, maar de onderwijsuitvoering kan nog beter worden gestroomlijnd.";
  }

  if (typeof overallScore === "number" && overallScore >= 4.2) {
    return "De basis staat, maar gerichte aanscherping geeft nu de meeste waarde.";
  }

  if (typeof overallScore === "number" && overallScore >= 3.2) {
    return "Er staat al iets goeds, maar een paar scherpe keuzes maken nu het verschil.";
  }

  if (typeof overallScore === "number" && overallScore >= 2.2) {
    return "De basis is bruikbaar, maar meerdere thema’s vragen nu aandacht.";
  }

  return "De basis is nog te kwetsbaar en vraagt eerst rust, structuur en duidelijke keuzes.";
}

function buildExplanation(priorities: OutputPriorityItem[]): string {
  const top = priorities[0];
  if (!top) {
    return "Werk stap voor stap verder aan verbetering vanuit een stabiele basis.";
  }

  if (top.signals.includes("Veel handwerk")) {
    return "Begin bij het verminderen van handmatig werk. Dat geeft vaak direct meer rust, snelheid en minder fouten.";
  }

  if (top.signals.includes("Foutgevoelig proces")) {
    return "Begin bij het betrouwbaarder maken van het proces. Pas daarna heeft verdere optimalisatie echt waarde.";
  }

  if (top.signals.includes("Beperkt inzicht")) {
    return "Begin bij betere stuurinformatie en heldere definities, zodat vervolgkeuzes beter onderbouwd kunnen worden.";
  }

  if (top.signals.includes("Proces vraagt sturing of controle")) {
    return "Begin bij scherper eigenaarschap, vaste besluitvorming en duidelijke verantwoordelijkheden.";
  }

  if (top.signals.includes("Veel uitzonderingen")) {
    return "Begin bij het terugbrengen van uitzonderingen en maak de standaard weer leidend.";
  }

  if (top.signals.includes("Afhankelijk van keten of koppeling")) {
    return "Begin bij de ketenafspraken en de stabiliteit van de integraties rondom AFAS.";
  }

  if (top.priority === "hoog") {
    return "Pak eerst het hoogste prioriteitsthema aan. Daarmee maak je nu het meeste verschil.";
  }

  if (top.priority === "middel") {
    return "De basis is werkbaar, maar gerichte verbetering op een paar thema’s geeft nu de meeste waarde.";
  }

  return "Houd de basis simpel en stabiel en verbeter daarna gericht verder.";
}

function buildQuickWinText(item: OutputPriorityItem): string {
  if (item.signals.includes("Veel handwerk")) {
    return `${item.title}: haal handmatig werk uit de kern van het proces.`;
  }

  if (item.signals.includes("Foutgevoelig proces")) {
    return `${item.title}: leg controles en vaste werkafspraken vast.`;
  }

  if (item.signals.includes("Beperkt inzicht")) {
    return `${item.title}: maak stuurinformatie eerst eenduidig en bruikbaar.`;
  }

  if (item.signals.includes("Proces vraagt sturing of controle")) {
    return `${item.title}: maak eigenaarschap en besluitvorming expliciet.`;
  }

  if (item.signals.includes("Veel uitzonderingen")) {
    return `${item.title}: breng uitzonderingen terug en maak de standaard leidend.`;
  }

  return `${item.title}: maak de basis eerst eenvoudiger en strakker.`;
}

function buildQuickWins(priorities: OutputPriorityItem[]): string[] {
  const quickWins = priorities
    .filter((item) => item.bucket === "now" || item.priority === "hoog")
    .slice(0, 3)
    .map(buildQuickWinText);

  if (quickWins.length > 0) return quickWins;
  return priorities.slice(0, 3).map(buildQuickWinText);
}

function buildBiggestRisk(priorities: OutputPriorityItem[]): string {
  const criticalTheme = priorities.find(
    (item) =>
      item.priority === "hoog" &&
      (item.signals.includes("Veel handwerk") ||
        item.signals.includes("Foutgevoelig proces") ||
        item.signals.includes("Proces vraagt sturing of controle") ||
        item.signals.includes("Afhankelijk van keten of koppeling"))
  );

  const top = criticalTheme ?? priorities[0];

  if (!top) {
    return "Er is geen direct kritiek risico zichtbaar, maar verdere aanscherping blijft zinvol.";
  }

  if (top.id === "governance") {
    return "Onduidelijk eigenaarschap en besluitvorming kunnen verbetering vertragen en onnodige ruis veroorzaken.";
  }

  if (top.id === "processes") {
    return "Te veel uitzonderingen en onvoldoende standaardisatie maken de uitvoering kwetsbaar en onrustig.";
  }

  if (top.id === "finance") {
    return "Onvoldoende grip op de financiële basis kan leiden tot minder betrouwbare verwerking en stuurinformatie.";
  }

  if (top.id === "ordermanagement") {
    return "Afwijkingen in de orderroute vergroten de kans op fouten, vertraging en extra handwerk.";
  }

  if (top.id === "crm") {
    return "Beperkte CRM-datakwaliteit en procesdiscipline verlagen de bruikbaarheid voor commerciële sturing.";
  }

  if (top.id === "hrm") {
    return "Kwetsbare HRM-processen en gegevenskwaliteit kunnen de stabiliteit van de uitvoering onder druk zetten.";
  }

  if (top.id === "reporting") {
    return "Beperkte rapportagekwaliteit en onduidelijke definities maken sturing minder betrouwbaar.";
  }

  if (top.id === "integrations") {
    return "Kwetsbare integraties en beperkt keteneigenaarschap kunnen verstoringen in meerdere processen veroorzaken.";
  }

  if (top.id === "care") {
    return "Complexiteit in registratie, declaratie en verantwoording kan leiden tot extra herstelwerk en minder grip.";
  }

  if (top.id === "education") {
    return "Onvoldoende afstemming tussen intake, planning en administratie kan onrust en fouten in de uitvoering geven.";
  }

  if (top.signals.includes("Veel handwerk")) {
    return `Veel handwerk binnen ${top.title.toLowerCase()} zorgt voor vertraging en extra foutkans.`;
  }

  if (top.signals.includes("Foutgevoelig proces")) {
    return `${top.title} is nog te foutgevoelig om hier stabiel op te sturen.`;
  }

  if (top.signals.includes("Proces vraagt sturing of controle")) {
    return `Binnen ${top.title.toLowerCase()} zijn rollen en besluitmomenten nog onvoldoende scherp.`;
  }

  if (top.signals.includes("Beperkt inzicht")) {
    return `Beperkt inzicht binnen ${top.title.toLowerCase()} belemmert gerichte sturing.`;
  }

  return top.reason;
}

function buildBiggestOpportunity(
  priorities: OutputPriorityItem[],
  quickWins: string[]
): string {
  const opportunityTheme =
    priorities.find(
      (item) =>
        item.bucket !== "later" &&
        (item.signals.includes("Beperkt inzicht") ||
          item.signals.includes("Veel uitzonderingen") ||
          item.signals.includes("Proces vraagt sturing of controle") ||
          item.signals.includes("Hoge strategische druk"))
    ) ?? priorities[0];

  if (!opportunityTheme) {
    return "De grootste kans zit in het verder standaardiseren van de basis.";
  }

  if (opportunityTheme.id === "governance") {
    return "Meer duidelijkheid in eigenaarschap en besluitvorming geeft snel meer rust en scherpte in het vervolg.";
  }

  if (opportunityTheme.id === "processes") {
    return "Meer standaardisatie in processen kan snel rust, eenvoud en minder herstelwerk opleveren.";
  }

  if (opportunityTheme.id === "finance") {
    return "Versterking van de financiële basis geeft snel meer betrouwbaarheid en bruikbare stuurinformatie.";
  }

  if (opportunityTheme.id === "ordermanagement") {
    return "Een strakkere orderroute kan snel meer grip, minder uitzonderingen en betere doorstroming geven.";
  }

  if (opportunityTheme.id === "crm") {
    return "Betere CRM-discipline en datakwaliteit maken commerciële sturing snel veel waardevoller.";
  }

  if (opportunityTheme.id === "hrm") {
    return "Een sterkere HRM-basis kan snel meer stabiliteit en betere uitvoerbaarheid opleveren.";
  }

  if (opportunityTheme.id === "reporting") {
    return "Betere definities en stuurinformatie maken beslissingen sneller en beter onderbouwd.";
  }

  if (opportunityTheme.id === "integrations") {
    return "Meer grip op integraties en ketenafspraken kan snel verstoringen verminderen en rust brengen.";
  }

  if (opportunityTheme.id === "care") {
    return "Versimpeling van de zorgspecifieke uitvoering kan snel meer beheersing en minder herstelwerk geven.";
  }

  if (opportunityTheme.id === "education") {
    return "Betere afstemming in de onderwijsuitvoering kan snel meer eenduidigheid en minder overdrachtsfouten geven.";
  }

  if (quickWins.length > 0) {
    return quickWins[0];
  }

  return opportunityTheme.advice;
}

function buildNextBestStep(priorities: OutputPriorityItem[]): string {
  const nowItem = priorities.find((item) => item.bucket === "now");
  if (nowItem) return nowItem.title;

  const nextItem = priorities.find((item) => item.bucket === "next");
  if (nextItem) return nextItem.title;

  return priorities[0]?.title ?? "Nog geen eerstvolgende stap bepaald";
}

function buildImpactItems(priorities: OutputPriorityItem[]): string[] {
  const impact = new Set<string>();

  for (const item of priorities.slice(0, 5)) {
    if (item.signals.includes("Veel handwerk")) {
      impact.add("Minder handmatig werk en minder afhankelijkheid van losse acties");
    }

    if (item.signals.includes("Foutgevoelig proces")) {
      impact.add("Betrouwbaardere uitvoering en minder fouten in het proces");
    }

    if (item.signals.includes("Beperkt inzicht")) {
      impact.add("Betere stuurinformatie en meer grip op prestaties");
    }

    if (item.signals.includes("Proces vraagt sturing of controle")) {
      impact.add("Duidelijker eigenaarschap en strakkere besluitvorming");
    }

    if (item.signals.includes("Afhankelijk van keten of koppeling")) {
      impact.add("Meer stabiliteit in de keten en minder verstoringen");
    }

    if (item.signals.includes("Veel uitzonderingen")) {
      impact.add("Meer standaardisatie en rust in de uitvoering");
    }
  }

  if (impact.size === 0) {
    impact.add("Meer rust en scherpte in de basis");
    impact.add("Betere prioritering van vervolgverbeteringen");
  }

  return Array.from(impact).slice(0, 5);
}

function mergeAllAnswers(sections: ScanSectionInput[]): ScanAnswers {
  return sections.reduce<ScanAnswers>((acc, section) => {
    return {
      ...acc,
      ...(section.answers ?? {}),
    };
  }, {});
}

function buildThemeDefinitions(): ThemeDefinition[] {
  return [
    {
      id: "governance",
      title: "Eigenaarschap & governance",
      category: "Organisatie & Beheer",
      keys: [
        "ownership_clarity",
        "change_decision_process",
        "improvement_governance",
      ],
    },
    {
      id: "processes",
      title: "Processen & standaardisatie",
      category: "Organisatie & Beheer",
      keys: [
        "process_standardization",
        "exception_control",
        "issue_resolution",
        "standardization_context",
      ],
    },
    {
      id: "finance",
      title: "Financieel",
      category: "AFAS Modules",
      keys: [
        "finance_strategic_pressure",
        "finance_foundation_reliability",
        "finance_exception_handling",
        "finance_reporting_maturity",
      ],
      enabledWhen: (answers) => answerIncludes(answers, "afas_products", "financieel"),
    },
    {
      id: "ordermanagement",
      title: "Ordermanagement",
      category: "AFAS Modules",
      keys: [
        "order_strategic_pressure",
        "order_flow_standardization",
        "order_exception_complexity",
        "order_system_fit",
      ],
      enabledWhen: (answers) =>
        answerIncludes(answers, "afas_products", "ordermanagement"),
    },
    {
      id: "crm",
      title: "CRM",
      category: "AFAS Modules",
      keys: [
        "crm_strategic_pressure",
        "crm_process_maturity",
        "crm_data_quality",
        "crm_reporting_usefulness",
      ],
      enabledWhen: (answers) => answerIncludes(answers, "afas_products", "crm"),
    },
    {
      id: "hrm",
      title: "HRM",
      category: "AFAS Modules",
      keys: [
        "hrm_strategic_pressure",
        "hrm_process_maturity",
        "hrm_data_quality",
      ],
      enabledWhen: (answers) =>
        answerIncludes(answers, "afas_products", "hrm") ||
        answerIncludes(answers, "afas_products", "payroll"),
    },
    {
      id: "reporting",
      title: "Rapportage & data",
      category: "Rapportage & Data",
      keys: [
        "reporting_strategic_pressure",
        "reporting_definition_consistency",
        "reporting_usefulness",
      ],
      enabledWhen: (answers) =>
        answerIncludes(answers, "scope_focus", "rapportage_sturing") ||
        answerIncludes(answers, "afas_products", "rapportage_dashboards"),
    },
    {
      id: "integrations",
      title: "Integraties & keten",
      category: "Integraties & Beheer",
      keys: [
        "integration_strategic_pressure",
        "integration_stability",
        "integration_ownership",
        "integration_monitoring_maturity",
      ],
      enabledWhen: (answers) =>
        answerIncludes(answers, "afas_products", "integraties"),
    },
    {
      id: "care",
      title: "Zorgspecifieke uitvoering",
      category: "Branche",
      keys: [
        "care_registration_exceptions",
        "care_accountability_pressure",
      ],
      enabledWhen: (answers) => answerEquals(answers, "sector", "zorg"),
    },
    {
      id: "education",
      title: "Onderwijsspecifieke uitvoering",
      category: "Branche",
      keys: [
        "education_intake_planning_consistency",
        "education_process_admin_alignment",
        "education_exception_handling",
      ],
      enabledWhen: (answers) => answerEquals(answers, "sector", "onderwijs"),
    },
  ];
}

function buildThemeInputs(sections: ScanSectionInput[]): ThemeInput[] {
  const allAnswers = mergeAllAnswers(sections);
  const definitions = buildThemeDefinitions();

  return definitions
    .filter((theme) => (theme.enabledWhen ? theme.enabledWhen(allAnswers) : true))
    .map((theme) => ({
      id: theme.id,
      title: theme.title,
      category: theme.category,
      answers: pickAnswers(allAnswers, theme.keys),
    }))
    .filter((theme) => Object.keys(theme.answers).length > 0);
}

export function buildScanOutput(scan: ScanInput): ScanOutput {
  const sections = scan.sections ?? [];
  const themes = buildThemeInputs(sections);

  const priorities: OutputPriorityItem[] = themes
    .map((theme) => {
      const signals = deriveSignals(theme);
      const score = calculatePriorityScore(theme, signals);
      const priority = mapPriorityLevel(score);
      const bucket = mapRoadmapBucket(theme, priority, signals, score);

      return {
        id: theme.id,
        title: theme.title,
        category: theme.category,
        priority,
        bucket,
        score,
        reason: buildThemeReason(theme, signals, priority),
        advice: buildThemeAdvice(theme, signals, priority),
        signals,
      };
    })
    .sort((a, b) => b.score - a.score);

  const overallScore =
    typeof scan.overallScore === "number" ? scan.overallScore : null;

  const quickWins = buildQuickWins(priorities);
  const biggestRisk = buildBiggestRisk(priorities);
  const biggestOpportunity = buildBiggestOpportunity(priorities, quickWins);
  const nextBestStep = buildNextBestStep(priorities);
  const impact = buildImpactItems(priorities);

  return {
    meta: {
      customerName: scan.customerName ?? "Onbekende klant",
      sector: scan.sector ?? "Onbekende sector",
      goal: scan.goal ?? "Nog niet ingevuld",
      scanId: scan.id ?? "onbekend",
    },
    summary: {
      headline: buildHeadline(overallScore, priorities),
      explanation: buildExplanation(priorities),
      scoreLabel: buildScoreLabel(overallScore),
      biggestRisk,
      biggestOpportunity,
      nextBestStep,
    },
    priorities,
    quickWins,
    roadmap: {
      now: priorities.filter((item) => item.bucket === "now"),
      next: priorities.filter((item) => item.bucket === "next"),
      later: priorities.filter((item) => item.bucket === "later"),
    },
    impact,
  };
}
