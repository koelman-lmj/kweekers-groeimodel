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
  };
  priorities: OutputPriorityItem[];
  quickWins: string[];
  roadmap: {
    now: OutputPriorityItem[];
    next: OutputPriorityItem[];
    later: OutputPriorityItem[];
  };
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeText(value: ScanAnswerValue): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(" ").toLowerCase();
  return String(value).toLowerCase();
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

function safeSectionScore(section: ScanSectionInput): number {
  if (typeof section.score !== "number" || Number.isNaN(section.score)) {
    return 50;
  }

  if (section.score >= 0 && section.score <= 5) {
    return clamp(section.score * 20, 0, 100);
  }

  return clamp(section.score, 0, 100);
}

function deriveSignals(section: ScanSectionInput): string[] {
  const answers = section.answers ?? {};
  const signals: string[] = [];

  if (
    hasAnySignalInAnswers(answers, [
      "handmatig",
      "excel",
      "los bestand",
      "mail",
      "kopiëren",
      "overtypen",
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
    ])
  ) {
    signals.push("Foutgevoelig proces");
  }

  if (
    hasAnySignalInAnswers(answers, [
      "geen inzicht",
      "weinig inzicht",
      "onvoldoende inzicht",
      "geen rapportage",
      "stuurinformatie",
      "power bi",
      "dashboard",
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
    ])
  ) {
    signals.push("Veel uitzonderingen");
  }

  return signals;
}

function calculatePriorityScore(section: ScanSectionInput): number {
  const baseScore = safeSectionScore(section);
  const answers = section.answers ?? {};

  let priorityScore = 100 - baseScore;

  if (
    hasAnySignalInAnswers(answers, [
      "handmatig",
      "excel",
      "overtypen",
      "mail",
      "foutgevoelig",
    ])
  ) {
    priorityScore += 15;
  }

  if (
    hasAnySignalInAnswers(answers, [
      "geen inzicht",
      "weinig inzicht",
      "stuurinformatie",
      "dashboard",
      "vertraging",
    ])
  ) {
    priorityScore += 10;
  }

  if (
    hasAnySignalInAnswers(answers, [
      "goedkeuring",
      "autorisatie",
      "controle",
      "compliance",
      "risico",
    ])
  ) {
    priorityScore += 10;
  }

  if (
    hasAnySignalInAnswers(answers, [
      "maatwerk",
      "uitzondering",
      "spoed",
      "afwijkend",
    ])
  ) {
    priorityScore += 8;
  }

  if (section.id === "scope") {
    priorityScore += 4;
  }

  if (section.id === "diagnose") {
    priorityScore += 6;
  }

  return clamp(Math.round(priorityScore), 0, 100);
}

function mapPriorityLevel(score: number): PriorityLevel {
  if (score >= 70) return "hoog";
  if (score >= 45) return "middel";
  return "laag";
}

function mapRoadmapBucket(
  section: ScanSectionInput,
  priority: PriorityLevel,
  signals: string[],
  score: number
): RoadmapBucket {
  const hasDirectPain =
    signals.includes("Veel handwerk") ||
    signals.includes("Foutgevoelig proces") ||
    signals.includes("Proces vraagt sturing of controle");

  if (priority === "hoog" && (hasDirectPain || score >= 80)) return "now";
  if (section.id === "diagnose" && priority !== "laag") return "now";
  if (section.id === "scope" && priority === "hoog") return "now";
  if (priority === "hoog") return "next";
  if (priority === "middel") return "next";
  return "later";
}

function buildSectionSpecificReason(
  section: ScanSectionInput,
  signals: string[],
  priority: PriorityLevel
): string | null {
  switch (section.id) {
    case "profile_basis":
      if (signals.includes("Veel uitzonderingen")) {
        return "De uitgangssituatie is nog te breed en bevat te veel uitzonderingen.";
      }
      if (signals.includes("Veel handwerk")) {
        return "De basisinformatie wordt nog te versnipperd opgehaald of vastgelegd.";
      }
      return priority === "laag"
        ? "De uitgangssituatie is bruikbaar en kan later verder worden aangescherpt."
        : "De uitgangssituatie is nog niet scherp genoeg als stevige basis voor de scan.";

    case "profile_reason":
      if (signals.includes("Beperkt inzicht")) {
        return "De aanleiding is nog niet scherp genoeg om goed te kunnen sturen op prioriteit.";
      }
      return priority === "laag"
        ? "De aanleiding is werkbaar en kan later nog verder worden aangescherpt."
        : "De aanleiding en het verbeterdoel kunnen nog concreter worden gemaakt.";

    case "scope":
      if (signals.includes("Veel uitzonderingen")) {
        return "De scope is nog te breed of te diffuus om strak te kunnen prioriteren.";
      }
      if (signals.includes("Beperkt inzicht")) {
        return "De focus is nog niet scherp genoeg om te bepalen waar de meeste winst zit.";
      }
      return priority === "laag"
        ? "De scope is bruikbaar en kan later verder worden verfijnd."
        : "De scope vraagt nog duidelijke keuzes in focus en afbakening.";

    case "diagnose":
      if (signals.includes("Veel handwerk")) {
        return "De belangrijkste knelpunten zijn nog niet strak genoeg teruggebracht tot de kern.";
      }
      if (signals.includes("Foutgevoelig proces")) {
        return "De diagnose is nog niet scherp genoeg om gericht te verbeteren.";
      }
      return priority === "laag"
        ? "De diagnose is bruikbaar en kan later verder worden verdiept."
        : "De diagnose vraagt nog verdere aanscherping van oorzaken en knelpunten.";

    default:
      return null;
  }
}

function buildReason(
  section: ScanSectionInput,
  signals: string[],
  priority: PriorityLevel
): string {
  const specificReason = buildSectionSpecificReason(section, signals, priority);
  if (specificReason) return specificReason;

  const score = safeSectionScore(section);

  if (signals.includes("Veel handwerk")) {
    return "Veel handwerk maakt dit onderdeel traag en onnodig foutgevoelig.";
  }

  if (signals.includes("Foutgevoelig proces")) {
    return "De basis is nog niet betrouwbaar genoeg om hier strak op te sturen.";
  }

  if (signals.includes("Proces vraagt sturing of controle")) {
    return "Rollen, controles en besluitmomenten zijn nog niet scherp genoeg ingericht.";
  }

  if (signals.includes("Beperkt inzicht")) {
    return "Er is te weinig inzicht om hier goed op te sturen.";
  }

  if (signals.includes("Afhankelijk van keten of koppeling")) {
    return "Dit onderdeel hangt sterk samen met andere stappen in de keten.";
  }

  if (signals.includes("Veel uitzonderingen")) {
    return "Uitzonderingen drukken hier te zwaar op het standaardproces.";
  }

  if (score < 40) {
    return "De basis van dit onderdeel is nog te kwetsbaar.";
  }

  if (score < 65) {
    return priority === "hoog"
      ? "De basis staat deels, maar vraagt nu duidelijke aanscherping."
      : "De basis staat deels, maar kan duidelijk sterker.";
  }

  return priority === "laag"
    ? "Dit onderdeel is werkbaar en kan later verder worden verbeterd."
    : "Dit onderdeel werkt redelijk, maar kan slimmer en strakker.";
}

function buildSectionSpecificAdvice(
  section: ScanSectionInput,
  signals: string[],
  priority: PriorityLevel
): string | null {
  switch (section.id) {
    case "profile_basis":
      if (signals.includes("Veel uitzonderingen")) {
        return "Versimpel eerst de basis van het klantprofiel. Breng uitzonderingen terug en maak de standaard leidend.";
      }
      return priority === "laag"
        ? "Laat het klantprofiel voorlopig staan en scherpt dit later verder aan."
        : "Maak het klantprofiel eerst scherper. Zorg voor één heldere uitgangssituatie als basis voor het vervolg.";

    case "profile_reason":
      if (signals.includes("Beperkt inzicht")) {
        return "Maak de aanleiding concreter. Benoem wat nu echt beter moet en waarom dat belangrijk is.";
      }
      return priority === "laag"
        ? "Laat de aanleiding nu staan en werk deze later verder uit."
        : "Scherp de aanleiding verder aan. Maak het doel concreter en beter bespreekbaar.";

    case "scope":
      if (signals.includes("Veel uitzonderingen")) {
        return "Maak de scope smaller en concreter. Kies eerst waar de grootste winst zit.";
      }
      if (signals.includes("Beperkt inzicht")) {
        return "Breng de scope terug naar een paar duidelijke keuzes. Maak eerst scherp waar je wel en niet op focust.";
      }
      return priority === "laag"
        ? "Laat de scope voorlopig staan en verfijn deze later verder."
        : "Scherp de scope eerst aan. Maak focus en afbakening duidelijk voordat je verder verdiept.";

    case "diagnose":
      if (signals.includes("Veel handwerk")) {
        return "Breng de diagnose terug naar de kern. Maak per knelpunt duidelijk wat er echt misgaat en waar het ontstaat.";
      }
      if (signals.includes("Foutgevoelig proces")) {
        return "Maak de diagnose concreter. Benoem per knelpunt oorzaak, effect en impact.";
      }
      return priority === "laag"
        ? "Laat de diagnose voorlopig staan en verdiep deze later verder."
        : "Werk de diagnose eerst scherper uit. Maak oorzaken en knelpunten concreet genoeg om gericht te verbeteren.";

    default:
      return null;
  }
}

function buildAdvice(
  section: ScanSectionInput,
  signals: string[],
  priority: PriorityLevel
): string {
  const specificAdvice = buildSectionSpecificAdvice(section, signals, priority);
  if (specificAdvice) return specificAdvice;

  const title = section.title.toLowerCase();

  if (signals.includes("Veel handwerk")) {
    return `Maak voor ${title} één vaste werkwijze. Haal losse Excel-stappen en mailafspraken uit het proces.`;
  }

  if (signals.includes("Foutgevoelig proces")) {
    return `Maak ${title} eerst betrouwbaar. Leg controles, verplichte velden en werkafspraken vast.`;
  }

  if (signals.includes("Beperkt inzicht")) {
    return `Bepaal eerst welke stuurinformatie echt nodig is voor ${title}. Bouw rapportages pas daarna.`;
  }

  if (signals.includes("Afhankelijk van keten of koppeling")) {
    return `Maak bij ${title} eerst duidelijk wat leidend is in de keten. Bepaal daarna pas de koppelingen.`;
  }

  if (signals.includes("Proces vraagt sturing of controle")) {
    return `Richt voor ${title} een duidelijke workflow in. Maak verantwoordelijkheden en controles expliciet.`;
  }

  if (signals.includes("Veel uitzonderingen")) {
    return `Versimpel ${title} eerst. Breng uitzonderingen terug en maak de standaard leidend.`;
  }

  if (priority === "hoog") {
    return `Pak ${title} nu als eerst aan. Houd de aanpak klein en praktisch.`;
  }

  if (priority === "middel") {
    return `Plan ${title} in als volgende verbeterslag, na de grootste knelpunten.`;
  }

  return `Laat ${title} voorlopig staan en pak dit later gericht op.`;
}

function buildScoreLabel(score: number | null | undefined): string {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "Nog geen totaalscore";
  }

  if (score >= 75) return "Sterke basis";
  if (score >= 55) return "Redelijke basis";
  if (score >= 35) return "Basis vraagt aandacht";
  return "Direct verbeteren nodig";
}

function buildHeadline(
  overallScore: number | null | undefined,
  highCount: number
): string {
  if (typeof overallScore === "number") {
    if (overallScore >= 75) {
      return "De basis staat, maar gerichte aanscherping geeft nu de meeste waarde.";
    }
    if (overallScore >= 55) {
      return "Er staat al iets goeds, maar een paar scherpe keuzes maken nu het verschil.";
    }
    if (overallScore >= 35) {
      return "De basis is bruikbaar, maar meerdere onderdelen vragen nu aandacht.";
    }
    return "De basis is nog te kwetsbaar en vraagt eerst rust, structuur en duidelijke keuzes.";
  }

  if (highCount >= 3) {
    return "Meerdere onderdelen vragen nu directe aandacht.";
  }

  if (highCount >= 1) {
    return "Er zijn een paar duidelijke verbeterpunten die je het beste eerst oppakt.";
  }

  return "De scan laat vooral kansen zien om slimmer en consistenter te werken.";
}

function buildExplanation(priorities: OutputPriorityItem[]): string {
  const high = priorities.filter((item) => item.priority === "hoog").length;
  const now = priorities.filter((item) => item.bucket === "now").length;

  if (high >= 3) {
    return "Begin bij de onderdelen die nu zorgen voor onduidelijkheid of vertraging. Pas daarna heeft verdere optimalisatie echt zin.";
  }

  if (now >= 1) {
    return "Pak eerst de onderdelen op die direct effect hebben op rust, grip en scherpte.";
  }

  if (high >= 1) {
    return "Start met de hoogste prioriteiten. Daarmee maak je nu het meeste verschil.";
  }

  return "Houd de basis simpel en stabiel. Werk daarna stap voor stap verder aan verbetering.";
}

function buildQuickWinText(item: OutputPriorityItem): string {
  switch (item.id) {
    case "profile_basis":
      return "Profiel - Basis: maak de uitgangssituatie scherper.";
    case "profile_reason":
      return "Profiel - Aanleiding: maak het verbeterdoel concreter.";
    case "scope":
      return "Scope: kies eerst een scherpere focus.";
    case "diagnose":
      return "Diagnose: breng knelpunten terug tot de kern.";
    default:
      break;
  }

  if (item.signals.includes("Veel handwerk")) {
    return `${item.title}: maak één vaste werkwijze.`;
  }

  if (item.signals.includes("Foutgevoelig proces")) {
    return `${item.title}: leg controles en verplichte stappen vast.`;
  }

  if (item.signals.includes("Proces vraagt sturing of controle")) {
    return `${item.title}: maak rollen en goedkeuring duidelijk.`;
  }

  if (item.signals.includes("Beperkt inzicht")) {
    return `${item.title}: bepaal eerst de juiste stuurinformatie.`;
  }

  if (item.signals.includes("Afhankelijk van keten of koppeling")) {
    return `${item.title}: maak eerst de keten leidend.`;
  }

  return `${item.title}: eerst versimpelen, daarna verbeteren.`;
}

function buildQuickWins(priorities: OutputPriorityItem[]): string[] {
  const quickWins = priorities
    .filter((item) => item.bucket === "now" || item.priority === "hoog")
    .slice(0, 3)
    .map(buildQuickWinText);

  if (quickWins.length > 0) return quickWins;

  return priorities.slice(0, 3).map(buildQuickWinText);
}

export function buildScanOutput(scan: ScanInput): ScanOutput {
  const sections = scan.sections ?? [];

  const priorities: OutputPriorityItem[] = sections
    .map((section) => {
      const signals = deriveSignals(section);
      const score = calculatePriorityScore(section);
      const priority = mapPriorityLevel(score);
      const bucket = mapRoadmapBucket(section, priority, signals, score);

      return {
        id: section.id,
        title: section.title,
        category: section.category,
        priority,
        bucket,
        score,
        reason: buildReason(section, signals, priority),
        advice: buildAdvice(section, signals, priority),
        signals,
      };
    })
    .sort((a, b) => b.score - a.score);

  const highCount = priorities.filter((item) => item.priority === "hoog").length;
  const overallScore =
    typeof scan.overallScore === "number" ? scan.overallScore : null;

  return {
    meta: {
      customerName: scan.customerName ?? "Onbekende klant",
      sector: scan.sector ?? "Onbekende sector",
      goal: scan.goal ?? "Nog niet ingevuld",
      scanId: scan.id ?? "onbekend",
    },
    summary: {
      headline: buildHeadline(overallScore, highCount),
      explanation: buildExplanation(priorities),
      scoreLabel: buildScoreLabel(overallScore),
    },
    priorities,
    quickWins: buildQuickWins(priorities),
    roadmap: {
      now: priorities.filter((item) => item.bucket === "now"),
      next: priorities.filter((item) => item.bucket === "next"),
      later: priorities.filter((item) => item.bucket === "later"),
    },
  };
}
