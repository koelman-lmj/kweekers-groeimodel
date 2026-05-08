import type { ScanState } from "@/app/context/ScanContext";

export type RootCauseCategory =
  | "richting_leiderschap"
  | "eigenaarschap_besturing"
  | "proces_uitvoering"
  | "mensen_gedrag"
  | "systemen_ondersteuning"
  | "sturing_resultaat"
  | "leren_verbeteren";

export type PriorityType =
  | "governance"
  | "process"
  | "system"
  | "finance"
  | "reporting"
  | "adoption";

export type PriorityAdvice = {
  priorityType: PriorityType;
  rootCauseCategory: RootCauseCategory;
  mainBottleneckTitle: string;
  mainBottleneckText: string;
  firstStepTitle: string;
  firstStepText: string;
  actions: string[];
  notFirstTitle: string;
  notFirstText: string;
  notFirst: string[];
  nextLikelyFocus?: string;
};

type ScoreMap = Record<PriorityType, number>;

type PriorityTemplate = {
  priorityType: PriorityType;
  rootCauseCategory: RootCauseCategory;
  mainBottleneckTitle: string;
  mainBottleneckText: string;
  firstStepTitle: string;
  firstStepText: string;
  actions: string[];
  notFirstTitle: string;
  notFirstText: string;
  notFirst: string[];
  nextLikelyFocus?: string;
};

function addScore(scores: ScoreMap, type: PriorityType, value: number) {
  scores[type] += value;
}

function getHighestPriority(scores: ScoreMap): PriorityType {
  const entries = Object.entries(scores) as Array<[PriorityType, number]>;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? "process";
}

function getSecondPriority(
  scores: ScoreMap,
  current: PriorityType
): PriorityType | undefined {
  const entries = (Object.entries(scores) as Array<[PriorityType, number]>)
    .filter(([key]) => key !== current)
    .sort((a, b) => b[1] - a[1]);

  return entries[0]?.[0];
}

function toRootCauseLabel(category: RootCauseCategory): string {
  switch (category) {
    case "richting_leiderschap":
      return "Richting & leiderschap";
    case "eigenaarschap_besturing":
      return "Eigenaarschap & besturing";
    case "proces_uitvoering":
      return "Proces & uitvoering";
    case "mensen_gedrag":
      return "Mensen & gedrag";
    case "systemen_ondersteuning":
      return "Systemen & ondersteuning";
    case "sturing_resultaat":
      return "Sturing & resultaat";
    case "leren_verbeteren":
      return "Leren & verbeteren";
    default:
      return "Eigenaarschap & besturing";
  }
}

function toNextFocusLabel(priorityType: PriorityType): string {
  switch (priorityType) {
    case "governance":
      return "Eigenaarschap en besluitvorming";
    case "process":
      return "Processtandaard en uitvoering";
    case "system":
      return "Inrichting en ondersteuning";
    case "finance":
      return "Financiële basis en beheersing";
    case "reporting":
      return "Sturing en rapportage";
    case "adoption":
      return "Gebruik en adoptie";
    default:
      return "Processtandaard en uitvoering";
  }
}

function buildBaseTemplates(): Record<PriorityType, PriorityTemplate> {
  return {
    governance: {
      priorityType: "governance",
      rootCauseCategory: "eigenaarschap_besturing",
      mainBottleneckTitle: "Belangrijkste knelpunt",
      mainBottleneckText:
        "Het grootste knelpunt zit nu in eigenaarschap en besluitvorming. Daardoor blijven keuzes te lang liggen of is niet duidelijk wie stuurt.",
      firstStepTitle: "Eerste stap",
      firstStepText:
        "Begin met het helder beleggen van eigenaarschap en het vastleggen van de route voor wijzigingen. Dat geeft eerst rust en duidelijkheid.",
      actions: [
        "Benoem eigenaar per kernproces",
        "Leg vast wie beslist",
        "Maak één route voor wijzigingen",
      ],
      notFirstTitle: "Nog niet als eerste",
      notFirstText:
        "Deze dingen zijn wel relevant, maar nog niet de eerste stap.",
      notFirst: [
        "Nieuwe dashboards bouwen",
        "Extra automatisering toevoegen",
        "Uitzonderingen in detail uitwerken",
      ],
      nextLikelyFocus: "Processtandaard en uitvoering",
    },

    process: {
      priorityType: "process",
      rootCauseCategory: "proces_uitvoering",
      mainBottleneckTitle: "Belangrijkste knelpunt",
      mainBottleneckText:
        "Het grootste knelpunt zit nu in de uitvoering van het proces. De werkwijze verschilt te veel of uitzonderingen zijn te vaak de norm.",
      firstStepTitle: "Eerste stap",
      firstStepText:
        "Begin met het terugbrengen van één duidelijke standaardroute in het belangrijkste proces. Daar zit nu de meeste winst.",
      actions: [
        "Kies één kernproces",
        "Breng top 5 uitzonderingen in kaart",
        "Leg de standaardroute vast",
      ],
      notFirstTitle: "Nog niet als eerste",
      notFirstText:
        "Deze dingen zijn wel relevant, maar lossen de basis nu nog niet op.",
      notFirst: [
        "Meer dashboards bouwen",
        "Nieuwe schermen toevoegen",
        "Procesvarianten verder uitbreiden",
      ],
      nextLikelyFocus: "Inrichting en ondersteuning",
    },

    system: {
      priorityType: "system",
      rootCauseCategory: "systemen_ondersteuning",
      mainBottleneckTitle: "Belangrijkste knelpunt",
      mainBottleneckText:
        "Het grootste knelpunt zit nu in de ondersteuning door het systeem. De inrichting sluit nog niet goed aan op de gewenste werkwijze.",
      firstStepTitle: "Eerste stap",
      firstStepText:
        "Begin met het herstellen van de aansluiting tussen proces, inrichting en workflow. Zo kost het werk minder omwegen en handwerk.",
      actions: [
        "Controleer de standaardroute",
        "Beperk overbodige uitzonderingen",
        "Leg workflow en autorisatie vast",
      ],
      notFirstTitle: "Nog niet als eerste",
      notFirstText:
        "Deze dingen zijn wel relevant, maar eerst moet de basisinrichting kloppen.",
      notFirst: [
        "Nieuw maatwerk bouwen",
        "Extra modules toevoegen",
        "Rapportagelaag uitbreiden",
      ],
      nextLikelyFocus: "Processtandaard en uitvoering",
    },

    finance: {
      priorityType: "finance",
      rootCauseCategory: "sturing_resultaat",
      mainBottleneckTitle: "Belangrijkste knelpunt",
      mainBottleneckText:
        "Het grootste knelpunt zit nu in de financiële basis. Daardoor is sturen lastiger en kost verwerken of controleren meer tijd.",
      firstStepTitle: "Eerste stap",
      firstStepText:
        "Begin met het stabiel maken van administratie, uitzonderingen en financiële beheersing. Dan ontstaat eerst grip op de basis.",
      actions: [
        "Controleer de basisinrichting",
        "Maak uitzonderingen expliciet",
        "Spreek vaste controlemomenten af",
      ],
      notFirstTitle: "Nog niet als eerste",
      notFirstText:
        "Deze dingen zijn wel relevant, maar nog niet de eerste stap.",
      notFirst: [
        "Managementdashboard uitbreiden",
        "Nieuwe KPI's toevoegen",
        "BI-rapportages verder verfijnen",
      ],
      nextLikelyFocus: "Sturing en rapportage",
    },

    reporting: {
      priorityType: "reporting",
      rootCauseCategory: "sturing_resultaat",
      mainBottleneckTitle: "Belangrijkste knelpunt",
      mainBottleneckText:
        "Het grootste knelpunt zit nu in stuurinformatie en rapportage. Daardoor is het lastiger om tijdig en eenduidig bij te sturen.",
      firstStepTitle: "Eerste stap",
      firstStepText:
        "Begin met het terugbrengen van definities, eigenaarschap en kern-KPI's naar één lijn. Zo wordt sturen duidelijker.",
      actions: [
        "Kies 5 tot 7 KPI's",
        "Leg definities en bron vast",
        "Benoem eigenaar van rapportage",
      ],
      notFirstTitle: "Nog niet als eerste",
      notFirstText:
        "Deze dingen lijken logisch, maar geven nu nog te weinig extra waarde.",
      notFirst: [
        "Meer dashboards toevoegen",
        "Extra details per afdeling maken",
        "Nieuwe rapportages stapelen",
      ],
      nextLikelyFocus: "Eigenaarschap en besluitvorming",
    },

    adoption: {
      priorityType: "adoption",
      rootCauseCategory: "mensen_gedrag",
      mainBottleneckTitle: "Belangrijkste knelpunt",
      mainBottleneckText:
        "Het grootste knelpunt zit nu in gebruik en gedrag. De werkwijze wordt nog niet overal op dezelfde manier gevolgd.",
      firstStepTitle: "Eerste stap",
      firstStepText:
        "Begin met duidelijke werkafspraken en borging in het team. Zo wordt verbeteren ook echt zichtbaar in de praktijk.",
      actions: [
        "Spreek één werkwijze af",
        "Maak rollen en verwachtingen duidelijk",
        "Volg gebruik actief op",
      ],
      notFirstTitle: "Nog niet als eerste",
      notFirstText:
        "Deze dingen zijn wel relevant, maar werken pas goed als gebruik mee verandert.",
      notFirst: [
        "Meer automatisering bouwen",
        "Nieuwe schermen toevoegen",
        "Extra rapportages maken",
      ],
      nextLikelyFocus: "Processtandaard en uitvoering",
    },
  };
}

function applyScanSpecificOverrides(
  template: PriorityTemplate,
  scan: ScanState
): PriorityTemplate {
  const result: PriorityTemplate = {
    ...template,
    actions: [...template.actions],
    notFirst: [...template.notFirst],
  };

  const { profile, scope, diagnosis } = scan;

  if (
    template.priorityType === "governance" &&
    diagnosis.improvementGovernance === "nauwelijks"
  ) {
    result.rootCauseCategory = "leren_verbeteren";
    result.mainBottleneckText =
      "Het grootste knelpunt zit nu in eigenaarschap en in het ritme van verbeteren. Daardoor blijft opvolging te afhankelijk van losse acties.";
  }

  if (
    template.priorityType === "process" &&
    profile.primaryProcessChains.includes("order_to_cash")
  ) {
    result.firstStepText =
      "Begin met het terugbrengen van één duidelijke standaardroute in order tot factuur. Daar zit nu de meeste winst.";
    result.actions = [
      "Kies de standaard orderroute",
      "Breng uitzonderingen in kaart",
      "Leg beslismomenten vast",
    ];
  }

  if (template.priorityType === "process" && profile.sector === "onderwijs") {
    result.mainBottleneckText =
      "Het grootste knelpunt zit nu in de uitvoering van intake, planning of administratieve afhandeling. Daardoor kost het proces meer tijd en ontstaan sneller fouten.";
  }

  if (template.priorityType === "process" && profile.sector === "zorg") {
    result.mainBottleneckText =
      "Het grootste knelpunt zit nu in de uitvoering van registratie of declaratie. Daardoor ontstaat sneller handwerk of herstelwerk.";
  }

  if (
    template.priorityType === "system" &&
    profile.afasProducts.includes("workflow")
  ) {
    result.actions = [
      "Controleer de workflowroute",
      "Scherp autorisatie aan",
      "Beperk handmatige omwegen",
    ];
  }

  if (
    template.priorityType === "system" &&
    profile.afasProducts.includes("integraties")
  ) {
    result.rootCauseCategory = "systemen_ondersteuning";
    result.notFirst = [
      "Nieuw maatwerk bouwen",
      "Extra koppelingen toevoegen",
      "Rapportages verder uitbreiden",
    ];
  }

  if (
    template.priorityType === "finance" &&
    diagnosis.financeReportingMaturity === "beperkt_bruikbaar"
  ) {
    result.firstStepText =
      "Begin met het stabiel maken van administratie en financiële uitzonderingen. Zo ontstaat eerst een basis waarop je kunt sturen.";
  }

  if (template.priorityType === "finance" && profile.sector === "zorg") {
    result.actions = [
      "Controleer basis en uitzonderingen",
      "Maak controlepunten expliciet",
      "Leg verantwoordingslogica vast",
    ];
  }

  if (
    template.priorityType === "reporting" &&
    scope.focus.includes("rapportage_sturing")
  ) {
    result.firstStepText =
      "Begin met het kiezen van een kleine set stuur-KPI's en maak definities eenduidig. Zo wordt sturen sneller en duidelijker.";
  }

  if (
    template.priorityType === "adoption" &&
    diagnosis.processStandardization === "sterk_verschillend"
  ) {
    result.actions = [
      "Spreek één werkwijze af",
      "Maak uitzonderingen zichtbaar",
      "Volg gebruik per team op",
    ];
  }

  return result;
}

function buildPriorityScores(scan: ScanState): ScoreMap {
  const scores: ScoreMap = {
    governance: 0,
    process: 0,
    system: 0,
    finance: 0,
    reporting: 0,
    adoption: 0,
  };

  const { profile, scope, diagnosis } = scan;

  if (profile.biggestBottleneck.includes("eigenaarschap")) {
    addScore(scores, "governance", 4);
  }
  if (profile.biggestBottleneck.includes("processen")) {
    addScore(scores, "process", 4);
  }
  if (profile.biggestBottleneck.includes("afas")) {
    addScore(scores, "system", 4);
  }
  if (profile.biggestBottleneck.includes("rapportage")) {
    addScore(scores, "reporting", 4);
  }
  if (profile.biggestBottleneck.includes("adoptie")) {
    addScore(scores, "adoption", 4);
  }
  if (profile.biggestBottleneck.includes("data_integraties")) {
    addScore(scores, "system", 2);
    addScore(scores, "reporting", 1);
  }

  if (scope.focus.includes("organisatie_eigenaarschap")) {
    addScore(scores, "governance", 2);
  }
  if (scope.focus.includes("processen_werkwijze")) {
    addScore(scores, "process", 2);
  }
  if (scope.focus.includes("afas_inrichting_gebruik")) {
    addScore(scores, "system", 2);
  }
  if (scope.focus.includes("rapportage_sturing")) {
    addScore(scores, "reporting", 2);
  }
  if (scope.focus.includes("beheer_doorontwikkeling")) {
    addScore(scores, "governance", 1);
    addScore(scores, "adoption", 1);
  }

  if (diagnosis.ownershipClarity === "onvoldoende_duidelijk") {
    addScore(scores, "governance", 4);
  } else if (diagnosis.ownershipClarity === "gedeeltelijk_duidelijk") {
    addScore(scores, "governance", 2);
  }

  if (diagnosis.changeDecisionProcess === "ad_hoc") {
    addScore(scores, "governance", 4);
  } else if (diagnosis.changeDecisionProcess === "deels_afgestemd") {
    addScore(scores, "governance", 2);
  }

  if (diagnosis.improvementGovernance === "nauwelijks") {
    addScore(scores, "governance", 2);
    addScore(scores, "adoption", 1);
  } else if (diagnosis.improvementGovernance === "af_en_toe") {
    addScore(scores, "governance", 1);
  }

  if (diagnosis.processStandardization === "sterk_verschillend") {
    addScore(scores, "process", 4);
    addScore(scores, "adoption", 1);
  } else if (diagnosis.processStandardization === "redelijk_eenduidig") {
    addScore(scores, "process", 2);
  }

  if (diagnosis.exceptionControl === "uitzondering_is_norm") {
    addScore(scores, "process", 4);
    addScore(scores, "system", 1);
  } else if (diagnosis.exceptionControl === "deels_beheersbaar") {
    addScore(scores, "process", 2);
  }

  if (diagnosis.issueResolution === "handmatig_herstellen") {
    addScore(scores, "process", 2);
    addScore(scores, "system", 1);
  } else if (diagnosis.issueResolution === "mix_ad_hoc_structureel") {
    addScore(scores, "process", 1);
  }

  if (profile.afasProducts.includes("workflow")) {
    addScore(scores, "system", 1);
  }
  if (profile.afasProducts.includes("integraties")) {
    addScore(scores, "system", 2);
  }
  if (profile.afasProducts.includes("rapportage_dashboards")) {
    addScore(scores, "reporting", 1);
  }
  if (profile.afasProducts.includes("financieel")) {
    addScore(scores, "finance", 1);
  }

  if (
    diagnosis.financeFoundationReliability === "kwetsbaar" ||
    diagnosis.financeExceptionHandling === "vooral_handmatig"
  ) {
    addScore(scores, "finance", 5);
  } else if (
    diagnosis.financeFoundationReliability === "redelijk" ||
    diagnosis.financeExceptionHandling === "deels_beheersbaar"
  ) {
    addScore(scores, "finance", 2);
  }

  if (diagnosis.financeReportingMaturity === "beperkt_bruikbaar") {
    addScore(scores, "reporting", 3);
    addScore(scores, "finance", 1);
  } else if (diagnosis.financeReportingMaturity === "deels_bruikbaar") {
    addScore(scores, "reporting", 1);
  }

  if (
    diagnosis.orderFlowStandardization === "sterk_verschillend" ||
    diagnosis.orderExceptionComplexity === "uitzondering_is_norm"
  ) {
    addScore(scores, "process", 4);
  }

  if (diagnosis.orderSystemFit === "sluit_beperkt_aan") {
    addScore(scores, "system", 4);
  } else if (diagnosis.orderSystemFit === "sluit_deels_aan") {
    addScore(scores, "system", 2);
  }

  if (
    diagnosis.careRegistrationExceptions === "uitzondering_is_norm" ||
    diagnosis.educationExceptionHandling === "uitzondering_is_norm"
  ) {
    addScore(scores, "process", 3);
  }

  if (
    diagnosis.careAccountabilityPressure === "beperkt_bruikbaar" ||
    diagnosis.educationProcessAdminAlignment === "sluit_beperkt_aan"
  ) {
    addScore(scores, "reporting", 1);
    addScore(scores, "process", 2);
  }

  if (
    profile.primaryProcessChains.includes("order_to_cash") ||
    profile.primaryProcessChains.includes("procure_to_pay") ||
    profile.primaryProcessChains.includes("project_to_invoice")
  ) {
    addScore(scores, "process", 1);
  }

  if (scope.depth === "verbeterplan") {
    addScore(scores, "governance", 1);
    addScore(scores, "process", 1);
  }

  return scores;
}

export function buildPriorityAdvice(scan: ScanState): PriorityAdvice {
  const scores = buildPriorityScores(scan);
  const priorityType = getHighestPriority(scores);
  const secondPriority = getSecondPriority(scores, priorityType);

  const templates = buildBaseTemplates();
  const baseTemplate = templates[priorityType];
  const template = applyScanSpecificOverrides(baseTemplate, scan);

  return {
    priorityType: template.priorityType,
    rootCauseCategory: template.rootCauseCategory,
    mainBottleneckTitle: template.mainBottleneckTitle,
    mainBottleneckText: template.mainBottleneckText,
    firstStepTitle: template.firstStepTitle,
    firstStepText: template.firstStepText,
    actions: template.actions.slice(0, 3),
    notFirstTitle: template.notFirstTitle,
    notFirstText: template.notFirstText,
    notFirst: template.notFirst.slice(0, 3),
    nextLikelyFocus: secondPriority
      ? toNextFocusLabel(secondPriority)
      : template.nextLikelyFocus,
  };
}

export function getRootCauseLabel(category: RootCauseCategory): string {
  return toRootCauseLabel(category);
}
