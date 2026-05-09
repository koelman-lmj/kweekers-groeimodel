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
  score?: number | null; // 0-100 of 1-5, maakt voor deze eerste versie niet veel uit
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

  // Eerste versie:
  // - score 0-100 blijft score 0-100
  // - score 1-5 schalen we om naar 20-100
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

  // Lage volwassenheid = hogere prioriteit
  let priorityScore = 100 - baseScore;

  // Extra gewicht op duidelijke pijn
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

  return clamp(Math.round(priorityScore), 0, 100);
}

function mapPriorityLevel(score: number): PriorityLevel {
  if (score >= 70) return "hoog";
  if (score >= 45) return "middel";
  return "laag";
}

function mapRoadmapBucket(
  priority: PriorityLevel,
  signals: string[]
): RoadmapBucket {
  const hasQuickWinSignal =
    signals.includes("Veel handwerk") || signals.includes("Foutgevoelig proces");

  if (priority === "hoog" && hasQuickWinSignal) return "now";
  if (priority === "hoog") return "now";
  if (priority === "middel") return "next";
  return "later";
}

function buildReason(
  section: ScanSectionInput,
  signals: string[],
  priority: PriorityLevel
): string {
  const parts: string[] = [];

  if (signals.length > 0) {
    parts.push(signals.join(", ").toLowerCase());
  }

  const score = safeSectionScore(section);

  if (score < 40) {
    parts.push("de huidige inrichting is nog niet stabiel genoeg");
  } else if (score < 65) {
    parts.push("de basis staat deels, maar kan duidelijk sterker");
  } else {
    parts.push("dit onderdeel werkt redelijk, maar kan slimmer");
  }

  if (priority === "hoog") {
    parts.push("dit heeft direct effect op rust, grip en kwaliteit");
  } else if (priority === "middel") {
    parts.push("dit is belangrijk voor de volgende verbeterslag");
  } else {
    parts.push("dit kan later worden opgepakt");
  }

  return capitalize(parts.join(". ")) + ".";
}

function buildAdvice(
  section: ScanSectionInput,
  signals: string[],
  priority: PriorityLevel
): string {
  const lowerTitle = section.title.toLowerCase();

  if (signals.includes("Veel handwerk")) {
    return `Breng eerst de standaard werkwijze voor ${lowerTitle} terug naar één duidelijke route. Haal losse Excel-stappen, mailafspraken en handmatige tussenstappen weg waar dat kan.`;
  }

  if (signals.includes("Foutgevoelig proces")) {
    return `Maak voor ${lowerTitle} eerst de basis betrouwbaar. Leg controles, verplichte velden en duidelijke werkafspraken vast voordat je verder automatiseert.`;
  }

  if (signals.includes("Beperkt inzicht")) {
    return `Spreek eerst af welke stuurinformatie echt nodig is binnen ${lowerTitle}. Bouw daarna pas rapportages, zodat het team stuurt op één duidelijke waarheid.`;
  }

  if (signals.includes("Afhankelijk van keten of koppeling")) {
    return `Kijk bij ${lowerTitle} eerst naar het proces in de hele keten. Maak duidelijk wat in AFAS leidend is en wat via koppelingen of portalen moet lopen.`;
  }

  if (signals.includes("Proces vraagt sturing of controle")) {
    return `Richt voor ${lowerTitle} een simpele en duidelijke workflow in. Zorg dat verantwoordelijkheden, controles en uitzonderingen helder zijn.`;
  }

  if (priority === "hoog") {
    return `Pak ${lowerTitle} als eerstvolgende verbeterpunt op. Begin klein, kies de grootste knelpunten en maak daarna pas de stap naar verdere optimalisatie.`;
  }

  if (priority === "middel") {
    return `Plan ${lowerTitle} in als volgende verbeterslag. Eerst de hoofdprocessen stabiel, daarna dit onderdeel verder aanscherpen.`;
  }

  return `Laat ${lowerTitle} nu nog even staan zoals het is. Leg alleen vast wat later nodig is, zodat dit onderdeel in een volgende fase slim kan worden opgepakt.`;
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

function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
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
      return "Er staat al iets goeds, maar een paar duidelijke keuzes maken nu het verschil.";
    }
    if (overallScore >= 35) {
      return "De organisatie heeft een bruikbare basis, maar meerdere onderdelen vragen nu gerichte aandacht.";
    }
    return "De basis is nog te kwetsbaar en vraagt eerst rust, structuur en duidelijke keuzes.";
  }

  if (highCount >= 3) {
    return "Meerdere onderdelen vragen nu directe aandacht om meer grip en rust te krijgen.";
  }

  if (highCount >= 1) {
    return "Er zijn een paar duidelijke verbeterpunten die je het beste als eerste kunt oppakken.";
  }

  return "De scan laat vooral kansen zien om slimmer en consistenter te werken.";
}

function buildExplanation(priorities: OutputPriorityItem[]): string {
  const high = priorities.filter((item) => item.priority === "hoog").length;
  const medium = priorities.filter((item) => item.priority === "middel").length;

  if (high >= 3) {
    return "Advies: begin met de onderdelen die vandaag al zorgen voor handwerk, fouten of onduidelijkheid. Pas daarna heeft verdere optimalisatie echt zin.";
  }

  if (high >= 1) {
    return "Advies: pak eerst de hoogste prioriteiten op. Daarmee maak je de meeste impact op kwaliteit, snelheid en grip.";
  }

  if (medium >= 2) {
    return "Advies: de basis lijkt redelijk op orde. De grootste winst zit nu in gericht verbeteren en beter standaardiseren.";
  }

  return "Advies: houd de basis simpel en stabiel. Werk daarna stap voor stap verder aan optimalisatie.";
}

function buildQuickWins(priorities: OutputPriorityItem[]): string[] {
  const quickWins = priorities
    .filter(
      (item) =>
        item.bucket === "now" &&
        (item.signals.includes("Veel handwerk") ||
          item.signals.includes("Foutgevoelig proces"))
    )
    .slice(0, 3)
    .map(
      (item) =>
        `${item.title}: breng de standaard werkwijze terug naar één duidelijke route.`
    );

  if (quickWins.length > 0) return quickWins;

  return priorities
    .slice(0, 3)
    .map((item) => `${item.title}: eerst versimpelen, daarna pas verder optimaliseren.`);
}

export function buildScanOutput(scan: ScanInput): ScanOutput {
  const sections = scan.sections ?? [];

  const priorities: OutputPriorityItem[] = sections
    .map((section) => {
      const signals = deriveSignals(section);
      const score = calculatePriorityScore(section);
      const priority = mapPriorityLevel(score);
      const bucket = mapRoadmapBucket(priority, signals);

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
