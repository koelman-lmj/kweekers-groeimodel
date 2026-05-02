"use client";

import React, { useEffect, useMemo, useState } from "react";

/**
 * Kweekers Groeimodel - geconsolideerde versie
 * --------------------------------------------------
 * Plak dit volledige bestand in: app/page.tsx
 *
 * Hoofdlijnen:
 * - Wizard t/m Advies
 * - Klantprofiel met succesmeter, integraties en rapportageprofiel
 * - Gezamenlijke diagnose: 1 scherm per capability
 * - Indicatieve score op basis van gezamenlijke antwoorden
 * - Adviesscherm als rapportweergave
 * - Historie van meetmomenten via localStorage
 * - Vergelijking met vorige meting + voortgangsduiding
 * - Print / PDF via window.print()
 */

type StepId = "profiel" | "scope" | "diagnose" | "duiding";
type QuestionType =
  | "choice"
  | "multi"
  | "open"
  | "text"
  | "summary"
  | "succesmeter_upload"
  | "succesmeter_review";

type Option = {
  value: string;
  label: string;
  description?: string;
  maturityLevel?: number;
};

type AnswerValue = string | number | null;

type ProductKey =
  | "verlof_verzuim"
  | "payroll"
  | "employee_self_service"
  | "manager_self_service"
  | "werving_selectie"
  | "vervoer"
  | "budget_tot_betaling"
  | "financieel"
  | "workflows"
  | "projecten"
  | "facturatie"
  | "cursusmanagement"
  | "sales_marketing"
  | "ordermanagement"
  | "abonnementen"
  | "bouw_inkoop"
  | "projectbewaking";

type ReportingModeValue =
  | "handmatige_exports"
  | "statische_excel"
  | "standaard_systeemrapportages"
  | "interactieve_dashboards"
  | "push_rapportages"
  | "real_time_data"
  | "advanced_analytics";

type ReportingMaturityLabel =
  | "Basis / handmatig"
  | "Systeemgedreven"
  | "Visueel gestuurd"
  | "Geautomatiseerd / actueel"
  | "Geavanceerd / voorspellend"
  | "Nog niet bepaald";

type IntegrationTypeValue =
  | "crm"
  | "webshop"
  | "planning"
  | "scan"
  | "hr"
  | "finance"
  | "bi"
  | "documenten"
  | "maatwerk"
  | "anders";

type ManagementDirectionKey =
  | "stabiliseren"
  | "standaardiseren"
  | "grip_op_data"
  | "doorontwikkelen";

type ManagementDirection = {
  key: ManagementDirectionKey;
  label: string;
  sentence: string;
};

type SuccesmeterItem = {
  id: string;
  productKey: ProductKey;
  domain: string;
  product: string;
  inUse: boolean;
  benchmarkPct: number | null;
  confirmed: boolean;
  relevantForFuture: boolean | null;
  note?: string;
};

type SuccesmeterMeta = {
  fileName: string;
  uploadedAt: string;
  parseStatus: "idle" | "uploaded" | "parsed" | "reviewed";
};

type ReportingInsight = {
  indicativeLevel: number | null;
  indicativeLabel: ReportingMaturityLabel;
  source: "primary" | "fallback" | "none";
  selectedLabels: string[];
  primaryLabel: string;
  signals: {
    manualDependency: boolean;
    dashboardDriven: boolean;
    automatedDistribution: boolean;
    realtimeOrAdvanced: boolean;
    fragmentedLandscape: boolean;
  };
};

type CustomerProfile = {
  customerName: string;
  sector: string;
  size: string;
  administrations: string;
  integrations: string;
  integrationTypes: IntegrationTypeValue[];
  reportingModes: ReportingModeValue[];
  reportingPrimaryMode: ReportingModeValue | "";
  reason: string;
  succesmeterMeta: SuccesmeterMeta;
  succesmeterItems: SuccesmeterItem[];
  detectedModules: string[];
};

type ProductRouteRule = {
  product: ProductKey;
  when: "in_use" | "not_in_use" | "future_relevant";
  minBenchmark?: number;
};

type ReportingRouteRule = {
  when: "selected" | "primary" | "signal_true" | "min_level";
  mode?: ReportingModeValue;
  signal?: keyof ReportingInsight["signals"];
  minLevel?: number;
};

type IntegrationRouteRule = {
  when: "selected" | "complexity_is";
  type?: IntegrationTypeValue;
  complexity?: "laag" | "middel" | "hoog";
};

type QuestionRouting = {
  always?: boolean;
  productRules?: ProductRouteRule[];
  productMatch?: "any" | "all";
  reportingRules?: ReportingRouteRule[];
  reportingMatch?: "any" | "all";
  integrationRules?: IntegrationRouteRule[];
  integrationMatch?: "any" | "all";
  scopeIs?: string[];
  reasonIs?: string[];
};

type Question = {
  id: string;
  type: QuestionType;
  label: string;
  shortLabel?: string;
  help?: string;
  options?: Option[];
  target?: keyof CustomerProfile;
  areaId?: string;
  areaLabel?: string;
  areaIcon?: string;
  capabilityId?: string;
  capabilityLabel?: string;
  kind?: string;
  routing?: QuestionRouting;
  variant?: "chips" | "cards";
  examples?: string[];
  signalQuestionId?: string;
  signalLabel?: string;
  signalPlaceholder?: string;
};

type CapabilityMode = "score" | "opportunity";

type Capability = {
  id: string;
  label: string;
  description: string;
  mode?: CapabilityMode;
  questions: Question[];
};

type GrowthArea = {
  id: string;
  label: string;
  icon: string;
  description: string;
  capabilities: Capability[];
};

type Scores = {
  overall: number;
  byArea: Record<string, { score: number; count: number }>;
  byCapability: Record<string, { score: number; count: number }>;
};

type AdviceRule = {
  id: string;
  areaId: string;
  capabilityId: string;
  maxScore: number;
  priority: number;
  title: string;
  description: string;
  fit: string;
  gap: string;
  soll: string;
  roadmap: string[];
};

type OpportunityItem = {
  capabilityId: string;
  capabilityLabel: string;
  areaId: string;
  areaLabel: string;
  areaIcon: string;
  title: string;
  productKey?: ProductKey;
  productLabel?: string;
  benchmarkPct: number | null;
  answer: string;
  answerLabel: string;
  note: string;
  status: "kansrijk" | "verkennen" | "niet_passend" | "onbepaald";
  whyShown: string[];
};

type AdviceEvidenceItem = {
  questionId: string;
  capabilityId: string;
  capabilityLabel: string;
  areaLabel: string;
  answer: string;
  answerLabel: string;
  note: string;
};

type AreaProgressItem = {
  areaId: string;
  areaLabel: string;
  areaIcon: string;
  previousScore: number | null;
  currentScore: number;
  delta: number | null;
  movement: "verbeterd" | "gelijk" | "teruggelopen" | "nieuw";
  interpretation: string;
  conversationHint: string;
};

type ProgressHeadline = {
  hasComparison: boolean;
  sentence: string;
  improvedAreas: string[];
  declinedAreas: string[];
  stableAreas: string[];
  improvedCount: number;
  declinedCount: number;
  stableCount: number;
};

type ProgressHighlight = {
  type: "improvement" | "decline";
  areaId: string;
  areaLabel: string;
  areaIcon: string;
  delta: number;
  text: string;
};

type ProgressHighlights = {
  hasComparison: boolean;
  biggestImprovement?: ProgressHighlight;
  biggestDecline?: ProgressHighlight;
};

type ProgressNarrative = {
  sentence: string;
  tone: "success" | "warning" | "neutral" | "danger";
};

type AreaKeySignal = {
  areaId: string;
  areaLabel: string;
  note: string;
  sourceLabel: string;
};

type AssessmentSnapshot = {
  id: string;
  createdAt: string;
  customerName: string;
  scope: string;
  directionKey: ManagementDirectionKey;
  directionLabel: string;
  overallScore: number;
  profile: CustomerProfile;
  reportingInsight: ReportingInsight;
  scores: Scores;
  answers: Record<string, AnswerValue>;
  diagnosisNotes: Record<string, string>;
  advice: AdviceRule[];
  opportunities: OpportunityItem[];
  summary: ReturnType<typeof buildManagementSummary>;
};


const STEPS: { id: StepId; label: string; icon: string }[] = [
  { id: "profiel", label: "Klantprofiel", icon: "🏢" },
  { id: "scope", label: "Scope", icon: "🎯" },
  { id: "diagnose", label: "Diagnose", icon: "🔎" },
  { id: "duiding", label: "Advies", icon: "🧭" },
];

const STEP_ORDER = STEPS.map((step) => step.id);

const YES_PARTLY_NO_UNKNOWN: Option[] = [
  { value: "ja", label: "Ja" },
  { value: "deels", label: "Deels" },
  { value: "nee", label: "Nee" },
  { value: "onbekend", label: "Onbekend" },
];

const SECTOR_OPTIONS: Option[] = [
  { value: "zorg", label: "Zorg" },
  { value: "onderwijs", label: "Onderwijs" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "commercieel", label: "Commercieel" },
  { value: "overig", label: "Overig" },
];

const SIZE_OPTIONS: Option[] = [
  { value: "klein", label: "Klein" },
  { value: "middelgroot", label: "Middelgroot" },
  { value: "groot", label: "Groot" },
  { value: "complex", label: "Groot / complex" },
];

const ADMIN_OPTIONS: Option[] = [
  { value: "1", label: "1" },
  { value: "2-5", label: "2-5" },
  { value: "6-10", label: "6-10" },
  { value: "10+", label: "10+" },
];

const COMPLEXITY_OPTIONS: Option[] = [
  {
    value: "laag",
    label: "AFAS staat grotendeels op zichzelf",
    description:
      "Er zijn weinig of geen koppelingen met andere systemen. Veel gebeurt direct in AFAS of met simpele handmatige imports en exports.",
  },
  {
    value: "middel",
    label: "AFAS is gekoppeld met een paar belangrijke systemen",
    description:
      "Er zijn meerdere koppelingen, bijvoorbeeld met een HR-, scan-, plannings-, webshop- of rapportagetool. Het werkt meestal goed, maar vraagt soms afstemming of controle.",
  },
  {
    value: "hoog",
    label: "AFAS is onderdeel van een bredere keten",
    description:
      "Meerdere processen lopen over verschillende systemen heen. Storingen of fouten in koppelingen hebben snel impact op operatie, rapportage of facturatie.",
  },
];

const INTEGRATION_TYPE_OPTIONS: Option[] = [
  { value: "crm", label: "CRM / sales-systeem" },
  { value: "webshop", label: "Webshop / portaal / e-commerce" },
  { value: "planning", label: "Planning / rooster / operatie" },
  { value: "scan", label: "Scanning / factuurverwerking" },
  { value: "hr", label: "HR / salaris / workforce" },
  { value: "finance", label: "Financiële software / banksystemen" },
  { value: "bi", label: "BI / dashboards / rapportage" },
  { value: "documenten", label: "Documentmanagement / archief" },
  { value: "maatwerk", label: "Maatwerkapplicatie / eigen portaal" },
  { value: "anders", label: "Andere koppelingen" },
];

const REPORTING_OPTIONS: Option[] = [
  {
    value: "handmatige_exports",
    label: "Handmatige exports & ad-hoc lijstjes",
    description:
      "Losse data-exports uit systemen, bijvoorbeeld naar CSV of Excel, wanneer er een specifieke vraag is.",
    maturityLevel: 1,
  },
  {
    value: "statische_excel",
    label: "Statische Excel-bestanden",
    description:
      "Vaste Excel-templates en draaitabellen die periodiek handmatig worden bijgewerkt.",
    maturityLevel: 2,
  },
  {
    value: "standaard_systeemrapportages",
    label: "Standaard systeemrapportages",
    description:
      "Ingebouwde rapportages of lijstweergaven direct in ERP-, CRM- of boekhoudsoftware.",
    maturityLevel: 3,
  },
  {
    value: "interactieve_dashboards",
    label: "Interactieve dashboards (BI)",
    description:
      "Dashboards in tools zoals Power BI, Tableau of Looker, inclusief visuele grafieken en drill-down.",
    maturityLevel: 4,
  },
  {
    value: "push_rapportages",
    label: "Geautomatiseerde push-rapportages",
    description:
      "Rapporten of alerts die automatisch op vaste momenten naar gebruikers worden verstuurd.",
    maturityLevel: 4,
  },
  {
    value: "real_time_data",
    label: "Real-time datastromen",
    description:
      "Rapportages zijn direct gekoppeld aan de bron en tonen de actuele live status.",
    maturityLevel: 5,
  },
  {
    value: "advanced_analytics",
    label: "Geavanceerde analytics",
    description:
      "Gebruik van forecasting, voorspellende analyses of complexere datamodellen.",
    maturityLevel: 6,
  },
];

const REASON_OPTIONS: Option[] = [
  { value: "grip", label: "Meer grip" },
  { value: "groei", label: "Groei / schaalbaarheid" },
  { value: "optimalisatie", label: "Optimalisatie" },
  { value: "vervanging", label: "Vervanging systemen" },
  { value: "governance", label: "Governance" },
  { value: "rapportage", label: "Rapportage / KPI's" },
];

const SCOPE_OPTIONS: Option[] = [
  { value: "volledige_scan", label: "Volledige volwassenheidsscan" },
  { value: "quickscan", label: "Quickscan" },
  { value: "afas_optimalisatie", label: "AFAS-optimalisatie" },
  { value: "finance_scan", label: "Finance-scan" },
  { value: "data_rapportage", label: "Data & rapportage" },
  { value: "integraties", label: "Integraties & keten" },
  { value: "governance", label: "Governance & beheer" },
];

const PROFILE_QUESTIONS: Question[] = [
  {
    id: "profile_1",
    type: "text",
    target: "customerName",
    label: "Wat is de naam van de organisatie?",
    help: "Gebruik de klantnaam zoals je die straks in de rapportage wilt tonen.",
  },
  {
    id: "profile_2",
    type: "choice",
    target: "sector",
    label: "In welke sector valt de klant?",
    options: SECTOR_OPTIONS,
  },
  {
    id: "profile_3",
    type: "choice",
    target: "size",
    label: "Hoe groot of complex is de organisatie?",
    options: SIZE_OPTIONS,
  },
  {
    id: "profile_4",
    type: "choice",
    target: "administrations",
    label: "Hoeveel administraties zijn in scope?",
    options: ADMIN_OPTIONS,
  },
  {
    id: "profile_5",
    type: "succesmeter_upload",
    label: "Upload de AFAS Succesmeter van de klant",
    help: "Gebruik de succesmeter als bron voor onderdelen die al in gebruik zijn en de benchmark van de branche.",
  },
  {
    id: "profile_6",
    type: "succesmeter_review",
    label: "Controleer herkende AFAS-onderdelen en benchmark",
    help: "Bevestig welke onderdelen de klant gebruikt. De benchmark is een signaal, geen automatisch advies.",
  },
  {
    id: "profile_7",
    type: "choice",
    target: "integrations",
    label: "Welke situatie past het best bij het landschap rondom AFAS?",
    help: "Kies de beschrijving die het meest lijkt op de praktijk van deze klant.",
    options: COMPLEXITY_OPTIONS,
    variant: "cards",
  },
  {
    id: "profile_8",
    type: "multi",
    target: "integrationTypes",
    label: "Met welke soorten systemen is AFAS gekoppeld of afgestemd?",
    help: "Selecteer alles wat van toepassing is.",
    options: INTEGRATION_TYPE_OPTIONS,
    variant: "chips",
  },
  {
    id: "profile_9",
    type: "multi",
    target: "reportingModes",
    label: "Welke vormen van rapportage en sturing worden nu gebruikt?",
    help: "Selecteer alles wat nu van toepassing is. Meerdere antwoorden zijn mogelijk.",
    options: REPORTING_OPTIONS,
    variant: "cards",
  },
  {
    id: "profile_10",
    type: "choice",
    target: "reportingPrimaryMode",
    label: "Welke vorm is in de praktijk leidend voor sturing en besluitvorming?",
    help: "Kies de vorm die het meest bepalend is voor hoe de organisatie echt stuurt.",
  },
  {
    id: "profile_11",
    type: "choice",
    target: "reason",
    label: "Wat is de belangrijkste aanleiding voor het groeimodel?",
    options: REASON_OPTIONS,
  },
  { id: "profile_summary", type: "summary", label: "Overzicht klantprofiel" },
];

const SCOPE_QUESTIONS: Question[] = [
  {
    id: "scope_1",
    type: "choice",
    label: "Welke scope past het beste bij deze klantvraag?",
    help: "Kies liever scherp dan te breed. Je kunt later altijd verdiepen.",
    options: SCOPE_OPTIONS,
    variant: "cards",
  },
  { id: "scope_summary", type: "summary", label: "Overzicht scope" },
];

const DIAGNOSIS_EXAMPLES: Record<string, string[]> = {
  q_org_001: [
    "Er is per belangrijk proces duidelijk één eigenaar.",
    "Mensen weten bij wie ze moeten zijn als iets vastloopt.",
    "Besluiten over proceswijzigingen blijven niet lang hangen.",
  ],
  q_org_004: [
    "Er is een vast moment waarop verbeteringen worden besproken.",
    "Niet alles loopt via losse mailtjes of toevallige gesprekken.",
    "Er is duidelijk wie prioriteiten bepaalt.",
  ],
  q_proc_001: [
    "Medewerkers doen hetzelfde werk meestal op dezelfde manier.",
    "Nieuwe collega's kunnen de werkwijze redelijk snel begrijpen.",
    "Er zijn niet te veel uitzonderingen of omwegen nodig.",
  ],
  q_proc_004: [
    "Het is duidelijk wat nu goed werkt.",
    "Het is ook duidelijk wat ontbreekt of beter moet.",
    "De gewenste richting is al enigszins benoemd.",
  ],
  q_int_001: [
    "Fouten in koppelingen worden snel opgemerkt.",
    "Er hoeft niet steeds iemand handmatig te controleren of alles is doorgekomen.",
    "Herstel kost meestal niet veel uitzoekwerk.",
  ],
  q_int_004: [
    "Bij fouten is duidelijk wie het oppakt.",
    "Het blijft niet hangen tussen leverancier, consultant of interne collega.",
    "Procesproblemen worden niet alleen technisch bekeken, maar ook functioneel opgelost.",
  ],
  q_int_web_001: [
    "Bestellingen of mutaties komen goed door in AFAS.",
    "Er zijn weinig handmatige correcties nodig.",
    "Een storing heeft niet meteen grote impact op orderverwerking of klantcontact.",
  ],
  q_int_bi_001: [
    "Dashboards sluiten goed aan op de data uit AFAS.",
    "Er is vertrouwen in de cijfers.",
    "Gebruikers hoeven niet steeds terug naar Excel om cijfers te controleren.",
  ],
  q_int_scan_001: [
    "Facturen worden goed herkend en komen netjes in het proces.",
    "Er is weinig handmatig herstel nodig.",
    "De scanoplossing vertraagt het proces niet onnodig.",
  ],
  q_int_custom_001: [
    "Wijzigingen in AFAS geven niet steeds verrassingen in maatwerk.",
    "Er is genoeg kennis om koppelingen goed te beheren.",
    "Het landschap is niet te afhankelijk van één persoon of externe partij.",
  ],
  q_data_001: [
    "Iedereen bedoelt hetzelfde bij belangrijke cijfers.",
    "Er is weinig discussie over definities van KPI's.",
    "Rapportages geven hetzelfde beeld, ongeacht wie ze gebruikt.",
  ],
  q_data_man_001: [
    "Er wordt vaak nog gewerkt met losse Excel-bestanden.",
    "Rapportages vragen handmatige exports of nabewerking.",
    "Belangrijke inzichten hangen af van iemand die lijstjes maakt.",
  ],
  q_data_bi_001: [
    "Dashboards worden echt gebruikt in overleggen of sturing.",
    "Gebruikers kunnen zelf doorklikken naar details.",
    "Dashboards zijn niet alleen mooi, maar helpen ook bij besluiten.",
  ],
  q_data_auto_001: [
    "Rapportages verversen automatisch.",
    "Gebruikers hoeven niet steeds handmatig data op te halen.",
    "Forecasts of signalen worden actief gebruikt in sturing.",
  ],
  q_data_frag_001: [
    "Het is duidelijk welk rapport leidend is.",
    "Er zijn niet te veel versies van dezelfde cijfers.",
    "Gebruikers hoeven niet te twijfelen welke bron juist is.",
  ],
};

const GROWTH_AREAS: GrowthArea[] = [
  {
    id: "organisatie",
    label: "Organisatie & eigenaarschap",
    icon: "👥",
    description: "Rollen, verantwoordelijkheden en besluitvorming zijn duidelijk belegd.",
    capabilities: [
      {
        id: "organisatie_proceseigenaarschap",
        label: "Proceseigenaarschap",
        description: "Duidelijk is wie eigenaar is van processen, inrichting, data en verbetering.",
        questions: [
          {
            id: "q_org_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Weet iedereen wie verantwoordelijk is voor de belangrijkste processen?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { always: true },
          },
          {
            id: "q_org_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar blijkt eigenaarschap of het ontbreken daarvan uit?",
            help: "Noem een paar voorbeelden uit de praktijk.",
            routing: { always: true },
          },
        ],
      },
      {
        id: "organisatie_besluitvorming",
        label: "Besluitvorming en prioritering",
        description: "Verbeteringen worden gekozen, besloten en opgevolgd volgens een herkenbaar ritme.",
        questions: [
          {
            id: "q_org_004",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Is er een vast overleg of klantteam waarin verbeteringen worden besproken en geprioriteerd?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { always: true },
          },
          {
            id: "q_org_005",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar merk je dat besluitvorming en prioritering wel of niet in ritme zitten?",
            help: "Denk aan losse acties, vertraging of gebrek aan opvolging.",
            routing: { always: true },
          },
        ],
      },
    ],
  },
  {
    id: "processen",
    label: "Processen & werkwijze",
    icon: "🔁",
    description: "De organisatie werkt vanuit duidelijke processen in plaats van losse afspraken.",
    capabilities: [
      {
        id: "processen_standaardisatie",
        label: "Standaardisatie van werkwijze",
        description: "Processen zijn eenduidig, herhaalbaar en uitlegbaar.",
        questions: [
          {
            id: "q_proc_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Worden processen meestal op dezelfde manier uitgevoerd?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { always: true },
          },
          {
            id: "q_proc_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar ontstaan de meeste uitzonderingen of handmatige correcties?",
            help: "Noem een paar herkenbare voorbeelden.",
            routing: { always: true },
          },
        ],
      },
      {
        id: "processen_fit_gap_soll",
        label: "IST, FIT, GAP en SOLL",
        description: "Huidige situatie, passende inrichting, ontbrekende zaken en gewenste situatie zijn scherp.",
        questions: [
          {
            id: "q_proc_004",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Is duidelijk wat goed werkt en wat verbetering vraagt?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { always: true },
          },
          {
            id: "q_proc_005",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar merk je dat het verschil tussen huidige situatie en gewenste richting nog niet scherp genoeg is?",
            help: "Denk aan onduidelijke keuzes, aannames of terugkerende discussies.",
            routing: { always: true },
          },
        ],
      },
    ],
  },
  {
    id: "afas",
    label: "AFAS-inrichting & gebruik",
    icon: "⚙️",
    description: "AFAS is logisch ingericht, goed gebruikt en ondersteunt de standaardroute.",
    capabilities: [
      {
        id: "afas_standaardgebruik",
        label: "Gebruik van AFAS-standaard",
        description: "De standaardfunctionaliteit is de makkelijkste route voor de gebruiker.",
        questions: [
          {
            id: "q_afas_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Is de AFAS-werkwijze voor gebruikers logisch en makkelijk te volgen?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { always: true },
          },
          {
            id: "q_afas_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Welke workarounds of Excel-lijsten worden naast AFAS gebruikt?",
            help: "Noem alleen de belangrijkste voorbeelden.",
            routing: { always: true },
          },
        ],
      },
      {
        id: "afas_workflows_autorisaties",
        label: "Workflows, autorisaties en InSite",
        description: "Taken, goedkeuringen en rechten zijn logisch ingericht en worden gebruikt.",
        questions: [
          {
            id: "q_afas_004",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Worden taken en goedkeuringen zoveel mogelijk via AFAS of InSite afgehandeld?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { always: true },
          },
          {
            id: "q_afas_005",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar merk je dat taken, rechten of goedkeuringen nog niet logisch aansluiten?",
            help: "Denk aan omwegen, losse mailtjes of onduidelijke rechten.",
            routing: { always: true },
          },
        ],
      },
      {
        id: "afas_financieel_gebruik",
        label: "Gebruik van Financieel",
        description: "AFAS Financieel ondersteunt de afgesproken standaardroute en wordt beheerst gebruikt.",
        questions: [
          {
            id: "q_afas_fin_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Ondersteunt AFAS Financieel de dagelijkse financiële werkwijze zonder veel handmatig herstel buiten AFAS?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { productRules: [{ product: "financieel", when: "in_use" }] },
          },
          {
            id: "q_afas_fin_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Welke uitzonderingen, correcties of nevenlijsten zie je rondom Financieel?",
            help: "Noem alleen de belangrijkste signalen.",
            routing: { productRules: [{ product: "financieel", when: "in_use" }] },
          },
        ],
      },
      {
        id: "afas_projecten_gebruik",
        label: "Gebruik van Projecten",
        description: "Projecten wordt consistent gebruikt voor registratie, bewaking en sturing.",
        questions: [
          {
            id: "q_afas_proj_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Wordt AFAS Projecten gebruikt als leidende werkwijze voor projectregistratie en bewaking?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { productRules: [{ product: "projecten", when: "in_use" }] },
          },
          {
            id: "q_afas_proj_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar merk je dat projectinformatie of bewaking toch nog buiten AFAS plaatsvindt?",
            help: "Denk aan lijstjes, losse controles of alternatieve registraties.",
            routing: { productRules: [{ product: "projecten", when: "in_use" }] },
          },
        ],
      },
      {
        id: "afas_abonnementen_gebruik",
        label: "Gebruik van Abonnementen",
        description: "Abonnementen ondersteunt terugkerende omzet en beheer op een voorspelbare manier.",
        questions: [
          {
            id: "q_afas_abo_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Ondersteunt AFAS Abonnementen de terugkerende omzet en facturatie zoals bedoeld?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { productRules: [{ product: "abonnementen", when: "in_use" }] },
          },
          {
            id: "q_afas_abo_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar ontstaan afwijkingen, herstelwerk of onduidelijkheid rondom Abonnementen?",
            help: "Denk aan mutaties, facturatie of overzicht.",
            routing: { productRules: [{ product: "abonnementen", when: "in_use" }] },
          },
        ],
      },
      {
        id: "afas_ordermanagement_gebruik",
        label: "Gebruik van Ordermanagement",
        description: "Ordermanagement ondersteunt de keten van order tot uitlevering of facturatie.",
        questions: [
          {
            id: "q_afas_ord_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Ondersteunt AFAS Ordermanagement de afgesproken order- en leveringsroute?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { productRules: [{ product: "ordermanagement", when: "in_use" }] },
          },
          {
            id: "q_afas_ord_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar zie je in de orderketen nog omwegen, uitzonderingen of handmatig herstel?",
            help: "Denk aan invoer, levering of facturatie.",
            routing: { productRules: [{ product: "ordermanagement", when: "in_use" }] },
          },
        ],
      },
      {
        id: "afas_payroll_gebruik",
        label: "Gebruik van Payroll",
        description: "Payroll is stabiel ingericht en ondersteunt een beheerst payrollproces.",
        questions: [
          {
            id: "q_afas_pay_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Ondersteunt AFAS Payroll het payrollproces zonder veel omwegen of handmatige controle buiten het systeem?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { productRules: [{ product: "payroll", when: "in_use" }] },
          },
          {
            id: "q_afas_pay_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Welke extra controles of uitzonderingen zie je rondom Payroll?",
            help: "Noem alleen de meest bepalende voorbeelden.",
            routing: { productRules: [{ product: "payroll", when: "in_use" }] },
          },
        ],
      },
      {
        id: "afas_workflows_gebruik",
        label: "Gebruik van Workflows",
        description: "Workflows ondersteunen goedkeuring, opvolging en procesdiscipline.",
        questions: [
          {
            id: "q_afas_wf_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Worden AFAS Workflows actief gebruikt om processtappen te sturen en te borgen?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { productRules: [{ product: "workflows", when: "in_use" }] },
          },
          {
            id: "q_afas_wf_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar merk je dat opvolging of goedkeuring toch nog buiten workflows om loopt?",
            help: "Denk aan mail, losse lijsten of mondelinge afstemming.",
            routing: { productRules: [{ product: "workflows", when: "in_use" }] },
          },
        ],
      },
      {
        id: "afas_sales_marketing_gebruik",
        label: "Gebruik van Sales & Marketing",
        description: "Sales & Marketing ondersteunt commercieel proces, relatiebeheer en opvolging.",
        questions: [
          {
            id: "q_afas_sm_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Wordt AFAS Sales & Marketing gebruikt als leidende werkwijze voor CRM en opvolging?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { productRules: [{ product: "sales_marketing", when: "in_use" }] },
          },
          {
            id: "q_afas_sm_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar merk je dat CRM of opvolging nog buiten AFAS plaatsvindt?",
            help: "Denk aan losse tools, Excel of persoonlijke lijstjes.",
            routing: { productRules: [{ product: "sales_marketing", when: "in_use" }] },
          },
        ],
      },
      {
        id: "afas_kansen_abonnementen",
        label: "Kansverkenning Abonnementen",
        mode: "opportunity",
        description: "Verken of Abonnementen relevant kan zijn voor de gewenste SOLL-situatie.",
        questions: [
          {
            id: "q_opp_abo_001",
            type: "choice",
            kind: "Verkenvraag",
            label: "Abonnementen wordt in de branche relatief vaak gebruikt. Is dit bewust geen keuze of een mogelijke groeirichting?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: {
              productMatch: "any",
              productRules: [
                { product: "abonnementen", when: "not_in_use", minBenchmark: 50 },
                { product: "abonnementen", when: "future_relevant" },
              ],
            },
          },
          {
            id: "q_opp_abo_002",
            type: "open",
            kind: "Signaalvraag",
            label: "Waarom zou Abonnementen wel of niet passend zijn voor de gewenste richting?",
            help: "Denk aan terugkerende omzet, beheer of schaalbaarheid.",
            routing: {
              productMatch: "any",
              productRules: [
                { product: "abonnementen", when: "not_in_use", minBenchmark: 50 },
                { product: "abonnementen", when: "future_relevant" },
              ],
            },
          },
        ],
      },
      {
        id: "afas_kansen_ordermanagement",
        label: "Kansverkenning Ordermanagement",
        mode: "opportunity",
        description: "Verken of Ordermanagement in de toekomst relevant kan zijn.",
        questions: [
          {
            id: "q_opp_ord_001",
            type: "choice",
            kind: "Verkenvraag",
            label: "Is Ordermanagement een logische groeirichting voor de gewenste procesondersteuning?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: {
              productMatch: "any",
              productRules: [
                { product: "ordermanagement", when: "not_in_use", minBenchmark: 35 },
                { product: "ordermanagement", when: "future_relevant" },
              ],
            },
          },
          {
            id: "q_opp_ord_002",
            type: "open",
            kind: "Signaalvraag",
            label: "Waarom zou Ordermanagement wel of niet relevant zijn voor de toekomstige werkwijze?",
            help: "Denk aan orderketen, logistiek of facturatie.",
            routing: {
              productMatch: "any",
              productRules: [
                { product: "ordermanagement", when: "not_in_use", minBenchmark: 35 },
                { product: "ordermanagement", when: "future_relevant" },
              ],
            },
          },
        ],
      },
      {
        id: "afas_kansen_ess",
        label: "Kansverkenning Employee Self Service",
        mode: "opportunity",
        description: "Verken of ESS relevant is voor de gewenste mate van self service.",
        questions: [
          {
            id: "q_opp_ess_001",
            type: "choice",
            kind: "Verkenvraag",
            label: "Kan Employee Self Service bijdragen aan minder handmatig werk en meer eigen regie voor medewerkers?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: {
              productMatch: "any",
              productRules: [
                { product: "employee_self_service", when: "not_in_use", minBenchmark: 30 },
                { product: "employee_self_service", when: "future_relevant" },
              ],
            },
          },
          {
            id: "q_opp_ess_002",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar zou Employee Self Service wel of niet waarde toevoegen?",
            help: "Denk aan aanvragen, inzicht of eigen regie.",
            routing: {
              productMatch: "any",
              productRules: [
                { product: "employee_self_service", when: "not_in_use", minBenchmark: 30 },
                { product: "employee_self_service", when: "future_relevant" },
              ],
            },
          },
        ],
      },
      {
        id: "afas_kansen_mss",
        label: "Kansverkenning Manager Self Service",
        mode: "opportunity",
        description: "Verken of MSS relevant is voor leidinggevenden en processturing.",
        questions: [
          {
            id: "q_opp_mss_001",
            type: "choice",
            kind: "Verkenvraag",
            label: "Kan Manager Self Service bijdragen aan betere opvolging, goedkeuring en eigenaarschap bij leidinggevenden?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: {
              productMatch: "any",
              productRules: [
                { product: "manager_self_service", when: "not_in_use", minBenchmark: 20 },
                { product: "manager_self_service", when: "future_relevant" },
              ],
            },
          },
          {
            id: "q_opp_mss_002",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar zou Manager Self Service wel of niet waarde toevoegen?",
            help: "Denk aan goedkeuring, sturing of overzicht.",
            routing: {
              productMatch: "any",
              productRules: [
                { product: "manager_self_service", when: "not_in_use", minBenchmark: 20 },
                { product: "manager_self_service", when: "future_relevant" },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "integraties",
    label: "Integraties & keten",
    icon: "🔗",
    description: "Koppelingen zijn betrouwbaar, beheersbaar en onderdeel van het proces.",
    capabilities: [
      {
        id: "integraties_betrouwbaarheid",
        label: "Betrouwbaarheid van koppelingen",
        description: "Koppelingen werken voorspelbaar en fouten zijn tijdig zichtbaar.",
        questions: [
          {
            id: "q_int_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Zijn fouten in koppelingen meestal snel zichtbaar en goed op te lossen?",
            options: YES_PARTLY_NO_UNKNOWN,
            help: "Denk aan storingen, foutmeldingen, wachtrijen of gegevens die niet goed overkomen.",
            routing: { always: true },
          },
          {
            id: "q_int_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar ontstaan in de praktijk de meeste problemen of controles in koppelingen?",
            help: "Noem een paar herkenbare voorbeelden uit de praktijk.",
            routing: { always: true },
          },
        ],
      },
      {
        id: "integraties_eigenaarschap",
        label: "Ketenverantwoordelijkheid",
        description: "Duidelijk is wie verantwoordelijk is voor proces, data en foutafhandeling over systemen heen.",
        questions: [
          {
            id: "q_int_004",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Is duidelijk wie verantwoordelijk is als iets misgaat over meerdere systemen heen?",
            options: YES_PARTLY_NO_UNKNOWN,
            help: "Bijvoorbeeld bij fouten tussen AFAS en een ander systeem, of als een proces blijft hangen tussen twee systemen.",
            routing: { always: true },
          },
          {
            id: "q_int_005",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar merk je dat eigenaarschap in de keten wel of niet duidelijk is?",
            help: "Denk aan escalaties, vertraging of discussie over wie iets moet oppakken.",
            routing: { always: true },
          },
        ],
      },
      {
        id: "integraties_webshop_portaal",
        label: "Webshop- of portaalintegratie",
        description: "Orders, klantgegevens of mutaties lopen via webshop of portaal naar AFAS.",
        questions: [
          {
            id: "q_int_web_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Werkt de koppeling met webshop of portaal stabiel genoeg voor de dagelijkse operatie?",
            options: YES_PARTLY_NO_UNKNOWN,
            help: "Denk aan bestellingen, klantgegevens, orderstatus, voorraden of selfservice-mutaties.",
            routing: {
              integrationRules: [
                { when: "selected", type: "webshop" },
                { when: "complexity_is", complexity: "hoog" },
              ],
              integrationMatch: "any",
            },
          },
          {
            id: "q_int_web_002",
            type: "open",
            kind: "Signaalvraag",
            label: "Welke problemen of uitzonderingen zie je in de webshop- of portaalketen?",
            help: "Bijvoorbeeld dubbele orders, ontbrekende gegevens of handmatige correcties.",
            routing: {
              integrationRules: [
                { when: "selected", type: "webshop" },
                { when: "complexity_is", complexity: "hoog" },
              ],
              integrationMatch: "any",
            },
          },
        ],
      },
      {
        id: "integraties_bi_keten",
        label: "BI- en rapportageketen",
        description: "Data uit AFAS loopt door naar dashboards, rapportage of andere informatievoorziening.",
        questions: [
          {
            id: "q_int_bi_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Is de koppeling tussen AFAS en rapportage of BI betrouwbaar genoeg voor goede sturing?",
            options: YES_PARTLY_NO_UNKNOWN,
            help: "Denk aan verversing, volledigheid van data en vertrouwen in dashboards of rapportages.",
            routing: { integrationRules: [{ when: "selected", type: "bi" }] },
          },
          {
            id: "q_int_bi_002",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar ontstaan problemen tussen AFAS en dashboards of rapportages?",
            help: "Bijvoorbeeld vertraging, verschil in cijfers of onduidelijke herkomst van data.",
            routing: { integrationRules: [{ when: "selected", type: "bi" }] },
          },
        ],
      },
      {
        id: "integraties_scan_factuur",
        label: "Scanning en factuurverwerking",
        description: "Inkomende facturen of documenten lopen via scan- of verwerkingssoftware naar AFAS.",
        questions: [
          {
            id: "q_int_scan_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Ondersteunt scanning of factuurverwerking het proces zonder veel herstelwerk?",
            options: YES_PARTLY_NO_UNKNOWN,
            help: "Denk aan herkenning, routering, boekingsvoorstellen en fouten die handmatig opgelost moeten worden.",
            routing: { integrationRules: [{ when: "selected", type: "scan" }] },
          },
          {
            id: "q_int_scan_002",
            type: "open",
            kind: "Signaalvraag",
            label: "Welke handmatige controles of uitzonderingen zie je bij scanning of factuurverwerking?",
            help: "Bijvoorbeeld verkeerd herkende facturen, extra controles of uitval in workflows.",
            routing: { integrationRules: [{ when: "selected", type: "scan" }] },
          },
        ],
      },
      {
        id: "integraties_maatwerk",
        label: "Maatwerk en eigen portalen",
        description: "AFAS maakt deel uit van een landschap met eigen applicaties, maatwerk of portals.",
        questions: [
          {
            id: "q_int_custom_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Zijn maatwerkapplicaties of eigen portalen goed beheersbaar in samenhang met AFAS?",
            options: YES_PARTLY_NO_UNKNOWN,
            help: "Denk aan afhankelijkheid van specifieke kennis, wijzigingsimpact en beheer van koppelingen.",
            routing: {
              integrationRules: [
                { when: "selected", type: "maatwerk" },
                { when: "complexity_is", complexity: "hoog" },
              ],
              integrationMatch: "any",
            },
          },
          {
            id: "q_int_custom_002",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar merk je dat maatwerk of eigen portalen extra beheer of risico geven?",
            help: "Bijvoorbeeld bij releases, fouten, afhankelijkheid van personen of beperkte documentatie.",
            routing: {
              integrationRules: [
                { when: "selected", type: "maatwerk" },
                { when: "complexity_is", complexity: "hoog" },
              ],
              integrationMatch: "any",
            },
          },
        ],
      },
    ],
  },
  {
    id: "data",
    label: "Data & rapportage",
    icon: "📊",
    description: "Data is betrouwbaar, definities zijn duidelijk en rapportages ondersteunen besluitvorming.",
    capabilities: [
      {
        id: "data_kpi_definities",
        label: "KPI-definities",
        description: "Cijfers zijn eenduidig gedefinieerd en geaccepteerd.",
        questions: [
          {
            id: "q_data_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Zijn KPI's en rapportagedefinities eenduidig vastgelegd?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { always: true },
          },
          {
            id: "q_data_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Over welke cijfers ontstaat discussie?",
            help: "Noem alleen de belangrijkste voorbeelden.",
            routing: { always: true },
          },
        ],
      },
      {
        id: "data_datakwaliteit",
        label: "Datakwaliteit en stamgegevens",
        description: "Data is volledig, actueel, betrouwbaar en beheerd.",
        questions: [
          {
            id: "q_data_004",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Is duidelijk wie verantwoordelijk is voor datakwaliteit en stamgegevens?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { always: true },
          },
          {
            id: "q_data_005",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar merk je dat datakwaliteit of stamgegevensbeheer nog kwetsbaar is?",
            help: "Denk aan fouten, achterstanden of onduidelijk eigenaarschap.",
            routing: { always: true },
          },
        ],
      },
      {
        id: "data_handmatige_rapportage",
        label: "Handmatige rapportage en Excel-afhankelijkheid",
        description: "Rapportage leunt op exports, Excel of handmatige bewerking.",
        questions: [
          {
            id: "q_data_man_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Is rapportage nog sterk afhankelijk van handmatige exports, Excel of losse bewerkingen?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: {
              reportingMatch: "any",
              reportingRules: [
                { when: "selected", mode: "handmatige_exports" },
                { when: "selected", mode: "statische_excel" },
                { when: "signal_true", signal: "manualDependency" },
              ],
            },
          },
          {
            id: "q_data_man_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Welke handmatige stappen, exports of Excel-sheets zijn kritisch voor rapportage?",
            help: "Noem alleen wat echt bepalend is voor sturing.",
            routing: {
              reportingMatch: "any",
              reportingRules: [
                { when: "selected", mode: "handmatige_exports" },
                { when: "selected", mode: "statische_excel" },
                { when: "signal_true", signal: "manualDependency" },
              ],
            },
          },
        ],
      },
      {
        id: "data_dashboard_sturing",
        label: "Dashboard- en BI-sturing",
        description: "Dashboards ondersteunen inzicht, analyse en besluitvorming.",
        questions: [
          {
            id: "q_data_bi_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Worden dashboards actief gebruikt voor sturing en besluitvorming?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: {
              reportingMatch: "any",
              reportingRules: [
                { when: "selected", mode: "interactieve_dashboards" },
                { when: "primary", mode: "interactieve_dashboards" },
                { when: "signal_true", signal: "dashboardDriven" },
              ],
            },
          },
          {
            id: "q_data_bi_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Hoe goed sluiten dashboards aan op KPI's, drill-down en besluitvorming?",
            help: "Denk aan bruikbaarheid, relevantie en vertrouwen in de cijfers.",
            routing: {
              reportingMatch: "any",
              reportingRules: [
                { when: "selected", mode: "interactieve_dashboards" },
                { when: "primary", mode: "interactieve_dashboards" },
                { when: "signal_true", signal: "dashboardDriven" },
              ],
            },
          },
        ],
      },
      {
        id: "data_automatisering_live",
        label: "Geautomatiseerde, live of geavanceerde rapportage",
        description: "Rapportages zijn geautomatiseerd, actueel of ondersteunen forecasting en meer geavanceerde analyses.",
        questions: [
          {
            id: "q_data_auto_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Zijn geautomatiseerde, live of voorspellende rapportages voldoende betrouwbaar en bruikbaar voor sturing?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: {
              reportingMatch: "any",
              reportingRules: [
                { when: "selected", mode: "push_rapportages" },
                { when: "selected", mode: "real_time_data" },
                { when: "selected", mode: "advanced_analytics" },
                { when: "signal_true", signal: "automatedDistribution" },
                { when: "signal_true", signal: "realtimeOrAdvanced" },
                { when: "min_level", minLevel: 5 },
              ],
            },
          },
          {
            id: "q_data_auto_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar merk je dat automatische of live rapportage nog niet betrouwbaar genoeg is?",
            help: "Denk aan verversing, definities, interpretatie of vertrouwen.",
            routing: {
              reportingMatch: "any",
              reportingRules: [
                { when: "selected", mode: "push_rapportages" },
                { when: "selected", mode: "real_time_data" },
                { when: "selected", mode: "advanced_analytics" },
                { when: "signal_true", signal: "automatedDistribution" },
                { when: "signal_true", signal: "realtimeOrAdvanced" },
                { when: "min_level", minLevel: 5 },
              ],
            },
          },
        ],
      },
      {
        id: "data_rapportage_versnippering",
        label: "Versnippering van rapportagelandschap",
        description: "Meerdere rapportagevormen bestaan naast elkaar, wat verwarring of dubbel werk kan geven.",
        questions: [
          {
            id: "q_data_frag_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Is duidelijk welke rapportagevorm leidend is en welke alleen ondersteunend is?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { reportingRules: [{ when: "signal_true", signal: "fragmentedLandscape" }] },
          },
          {
            id: "q_data_frag_002",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar zie je overlap, dubbel werk of verschillende versies van dezelfde cijfers?",
            help: "Noem alleen de meest herkenbare voorbeelden.",
            routing: { reportingRules: [{ when: "signal_true", signal: "fragmentedLandscape" }] },
          },
        ],
      },
    ],
  },
  {
    id: "beheer",
    label: "Beheer & doorontwikkeling",
    icon: "🧩",
    description: "Verbeteren, testen, releases en beheer zijn structureel georganiseerd.",
    capabilities: [
      {
        id: "beheer_backlog",
        label: "Verbeterbacklog",
        description: "Wensen, incidenten en verbeteringen worden centraal beheerd en geprioriteerd.",
        questions: [
          {
            id: "q_beh_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Is er één centrale lijst met verbeterpunten, wensen en besluiten?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { always: true },
          },
          {
            id: "q_beh_002",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar merk je dat wensen of verbeteringen nog versnipperd zijn?",
            help: "Denk aan losse lijsten, mailtjes of onduidelijke opvolging.",
            routing: { always: true },
          },
        ],
      },
      {
        id: "beheer_test_release",
        label: "Testen en releasebeheer",
        description: "Wijzigingen worden beheerst getest, vrijgegeven en gecommuniceerd.",
        questions: [
          {
            id: "q_beh_003",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Worden wijzigingen getest voordat ze breed worden toegepast?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { always: true },
          },
          {
            id: "q_beh_005",
            type: "open",
            kind: "Signaalvraag",
            label: "Welke voorbeelden zijn er van recente wijzigingen en hoe zijn die geborgd?",
            help: "Noem alleen wat het meest tekenend is voor de praktijk.",
            routing: { always: true },
          },
        ],
      },
    ],
  },
  {
    id: "adoptie",
    label: "Adoptie & veranderkracht",
    icon: "🌱",
    description: "Mensen gebruiken de afgesproken werkwijze en de organisatie kan blijven verbeteren.",
    capabilities: [
      {
        id: "adoptie_gebruik",
        label: "Gebruikersadoptie",
        description: "Gebruikers begrijpen waarom en hoe zij de ingerichte processen gebruiken.",
        questions: [
          {
            id: "q_ado_001",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Gebruiken medewerkers de afgesproken werkwijze zoals bedoeld?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { always: true },
          },
          {
            id: "q_ado_002",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar merk je dat gebruikers afwijken van de afgesproken werkwijze?",
            help: "Denk aan uitzonderingen, onzekerheid of alternatieve routes.",
            routing: { always: true },
          },
        ],
      },
      {
        id: "adoptie_leervermogen",
        label: "Leervermogen en communicatie",
        description: "Verbeteringen worden uitgelegd, begrepen en vastgehouden.",
        questions: [
          {
            id: "q_ado_003",
            type: "choice",
            kind: "Gezamenlijk beeld",
            label: "Worden proceswijzigingen duidelijk gecommuniceerd en uitgelegd?",
            options: YES_PARTLY_NO_UNKNOWN,
            routing: { always: true },
          },
          {
            id: "q_ado_004",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar merk je dat uitleg of borging van wijzigingen nog te beperkt is?",
            help: "Denk aan training, feedback of vasthouden van afspraken.",
            routing: { always: true },
          },
        ],
      },
    ],
  },
];

const ADVICE_RULES: AdviceRule[] = [
  {
    id: "adv_org_001",
    areaId: "organisatie",
    capabilityId: "organisatie_proceseigenaarschap",
    maxScore: 3,
    priority: 1,
    title: "Beleg proceseigenaarschap expliciet",
    description: "Eigenaarschap is onvoldoende belegd. Daardoor blijft verbetering te afhankelijk van personen in plaats van structuur.",
    fit: "Praktische kennis over processen is meestal wel aanwezig in de organisatie.",
    gap: "Eigenaarschap voor proces, inrichting, data en verbetering is onvoldoende expliciet gemaakt.",
    soll: "Per kernproces is duidelijk wie eigenaar is van proces, inrichting, data en verbetering.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_org_002",
    areaId: "organisatie",
    capabilityId: "organisatie_besluitvorming",
    maxScore: 3,
    priority: 2,
    title: "Breng besluitvorming en prioritering in ritme",
    description: "Verbeteringen worden nu te weinig gestructureerd besproken, besloten en opgevolgd.",
    fit: "Er zijn meestal genoeg signalen en verbeterideeën beschikbaar.",
    gap: "Een vast ritme voor prioritering en besluitvorming ontbreekt of werkt onvoldoende.",
    soll: "Verbeteringen worden periodiek besproken, geprioriteerd, besloten en opgevolgd.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_proc_001",
    areaId: "processen",
    capabilityId: "processen_standaardisatie",
    maxScore: 3,
    priority: 2,
    title: "Maak de standaard werkwijze de makkelijkste route",
    description: "Processen zijn nog te afhankelijk van uitzonderingen, losse afspraken of handmatig herstel.",
    fit: "De organisatie weet vaak goed hoe het werk in de praktijk gebeurt.",
    gap: "De afgesproken werkwijze is onvoldoende uniform en daardoor lastig schaalbaar.",
    soll: "Belangrijke processen zijn eenvoudig, herhaalbaar en ondersteund door de gekozen standaardroute.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_proc_002",
    areaId: "processen",
    capabilityId: "processen_fit_gap_soll",
    maxScore: 3,
    priority: 3,
    title: "Maak IST, FIT, GAP en SOLL expliciet",
    description: "De organisatie ziet wel knelpunten, maar onderscheidt nog onvoldoende wat past, ontbreekt of gewenst is.",
    fit: "Er is meestal al veel praktijkervaring en gevoel voor wat schuurt.",
    gap: "De analyse van huidige situatie, passende inrichting en gewenste richting is onvoldoende scherp.",
    soll: "IST, FIT, GAP en SOLL zijn per hoofdproces expliciet gemaakt en bruikbaar voor keuzes.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_int_001",
    areaId: "integraties",
    capabilityId: "integraties_betrouwbaarheid",
    maxScore: 3,
    priority: 3,
    title: "Maak integraties zichtbaar en beheersbaar",
    description: "Koppelingen zijn kritisch voor de operatie, maar beheer en foutafhandeling zijn onvoldoende ingericht.",
    fit: "Er zijn al koppelingen aanwezig die de keten ondersteunen.",
    gap: "Monitoring, foutsignalering en herstel zijn onvoldoende expliciet belegd.",
    soll: "Kritische koppelingen hebben eigenaar, controles en een helder foutproces.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_int_002",
    areaId: "integraties",
    capabilityId: "integraties_eigenaarschap",
    maxScore: 3,
    priority: 4,
    title: "Beleg ketenverantwoordelijkheid over systemen heen",
    description: "Bij ketenproblemen is onvoldoende duidelijk wie verantwoordelijk is voor analyse, besluit en herstel.",
    fit: "De organisatie kent vaak wel de belangrijkste afhankelijkheden.",
    gap: "Verantwoordelijkheid stopt te vaak bij systeemgrenzen.",
    soll: "Voor ketenprocessen is duidelijk wie eigenaar is van proces, data en foutafhandeling.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_int_web_001",
    areaId: "integraties",
    capabilityId: "integraties_webshop_portaal",
    maxScore: 3,
    priority: 3,
    title: "Maak de webshop- of portaalketen beter beheersbaar",
    description: "De koppeling tussen AFAS en webshop of portaal veroorzaakt nog te veel uitval, handmatige correcties of operationele onzekerheid.",
    fit: "Er is al een digitale keten aanwezig voor orders, mutaties of selfservice.",
    gap: "De keten is nog onvoldoende stabiel, inzichtelijk of fouttolerant ingericht.",
    soll: "Bestellingen, mutaties en statusinformatie lopen voorspelbaar en beheerst tussen AFAS en webshop of portaal.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_int_bi_001",
    areaId: "integraties",
    capabilityId: "integraties_bi_keten",
    maxScore: 3,
    priority: 3,
    title: "Verhoog de betrouwbaarheid van de BI- en rapportageketen",
    description: "De koppeling tussen AFAS en rapportage of BI geeft nog te weinig vertrouwen in cijfers, herkomst of actualiteit.",
    fit: "Er is al een basis aanwezig voor dashboards of rapportage op AFAS-data.",
    gap: "Datastromen, definities of verversing zijn nog onvoldoende beheerst en uitlegbaar.",
    soll: "Gebruikers vertrouwen de cijfers en begrijpen hoe AFAS-data doorloopt naar dashboards en rapportages.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_int_scan_001",
    areaId: "integraties",
    capabilityId: "integraties_scan_factuur",
    maxScore: 3,
    priority: 3,
    title: "Verminder herstelwerk in scanning en factuurverwerking",
    description: "Scanning of factuurverwerking vraagt nog te veel handmatige controles, correcties of uitzonderingsafhandeling.",
    fit: "De scan- of verwerkingsoplossing ondersteunt al een belangrijk deel van het proces.",
    gap: "Herkenning, routering of aansluiting op AFAS is nog onvoldoende stabiel of efficiënt.",
    soll: "Facturen lopen voorspelbaar door het proces met beperkte uitval en weinig herstelwerk.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_int_custom_001",
    areaId: "integraties",
    capabilityId: "integraties_maatwerk",
    maxScore: 3,
    priority: 4,
    title: "Maak maatwerk en eigen portalen beter beheersbaar",
    description: "Maatwerkapplicaties of eigen portalen maken het landschap kwetsbaar door afhankelijkheid, beperkte documentatie of wijzigingsimpact.",
    fit: "Er is al maatwerk of een eigen portaal dat functioneel waarde toevoegt.",
    gap: "Beheer, documentatie, afhankelijkheden en release-impact zijn nog onvoldoende geborgd.",
    soll: "Maatwerk en eigen portalen zijn uitlegbaar, beheersbaar en goed afgestemd op wijzigingen in AFAS.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_data_001",
    areaId: "data",
    capabilityId: "data_kpi_definities",
    maxScore: 3,
    priority: 2,
    title: "Maak KPI-definities eenduidig",
    description: "Er is te veel ruimte voor discussie over cijfers, definities en interpretatie.",
    fit: "Er zijn meestal al rapportages of dashboards beschikbaar.",
    gap: "Eigenaarschap, definities en gebruiksafspraken zijn onvoldoende vastgelegd.",
    soll: "KPI's hebben een eigenaar, definitie, bron, berekening en gebruiksdoel.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_data_002",
    areaId: "data",
    capabilityId: "data_datakwaliteit",
    maxScore: 3,
    priority: 3,
    title: "Versterk beheer van datakwaliteit en stamgegevens",
    description: "Datakwaliteit is te afhankelijk van losse controles of individuele discipline.",
    fit: "De belangrijkste databronnen en stamgegevens zijn meestal bekend.",
    gap: "Beheer, eigenaarschap en kwaliteitsbewaking zijn onvoldoende structureel ingericht.",
    soll: "Datakwaliteit en stamgegevens worden actief beheerd met duidelijke verantwoordelijkheid.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_data_man_001",
    areaId: "data",
    capabilityId: "data_handmatige_rapportage",
    maxScore: 3,
    priority: 2,
    title: "Verminder afhankelijkheid van handmatige rapportage",
    description: "Rapportages leunen nog sterk op losse exports, Excel en handmatige bewerkingen.",
    fit: "Er is al een rapportagepraktijk aanwezig en belangrijke informatie is bekend.",
    gap: "Rapportage is nog te arbeidsintensief, foutgevoelig en persoonafhankelijk.",
    soll: "Rapportages vragen minder handmatige bewerking en zijn beter beheersbaar.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_data_bi_001",
    areaId: "data",
    capabilityId: "data_dashboard_sturing",
    maxScore: 3,
    priority: 3,
    title: "Maak dashboards beter bruikbaar voor sturing",
    description: "Dashboards zijn aanwezig of gewenst, maar sluiten nog onvoldoende aan op echte sturing en besluitvorming.",
    fit: "Er is al aandacht voor visueel inzicht en KPI-ondersteuning.",
    gap: "Dashboards helpen nog onvoldoende bij prioriteren, analyseren en bijsturen.",
    soll: "Dashboards ondersteunen de juiste KPI's, drill-down en besluitvorming.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_data_auto_001",
    areaId: "data",
    capabilityId: "data_automatisering_live",
    maxScore: 3,
    priority: 3,
    title: "Verhoog betrouwbaarheid van geautomatiseerde en live rapportage",
    description: "Automatische, live of geavanceerde rapportages zijn nog onvoldoende betrouwbaar of bruikbaar ingericht.",
    fit: "De organisatie heeft al een stap gezet richting geautomatiseerde of meer volwassen rapportage.",
    gap: "Dataketen, definities of vertrouwen in uitkomsten zijn nog onvoldoende geborgd.",
    soll: "Geautomatiseerde, live en geavanceerde rapportages zijn betrouwbaar en bruikbaar voor sturing.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_data_frag_001",
    areaId: "data",
    capabilityId: "data_rapportage_versnippering",
    maxScore: 3,
    priority: 2,
    title: "Maak één rapportagelandschap herkenbaar leidend",
    description: "Er bestaan meerdere rapportagevormen naast elkaar, waardoor onduidelijkheid en dubbel werk ontstaan.",
    fit: "Er is veel informatie beschikbaar in verschillende vormen.",
    gap: "Niet duidelijk is welke bron, rapportage of vorm leidend is.",
    soll: "Voor gebruikers is helder welke rapportagevorm leidend is en welke ondersteunend.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_beh_001",
    areaId: "beheer",
    capabilityId: "beheer_backlog",
    maxScore: 3,
    priority: 2,
    title: "Richt één centrale verbeterbacklog in",
    description: "Wensen, besluiten, incidenten en verbeterpunten zijn te versnipperd georganiseerd.",
    fit: "Verbeterpunten zijn meestal wel bekend in de organisatie.",
    gap: "Er ontbreekt één centrale plek voor prioritering, besluit en opvolging.",
    soll: "Alle verbeteringen worden centraal vastgelegd, beoordeeld en opgevolgd.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_beh_002",
    areaId: "beheer",
    capabilityId: "beheer_test_release",
    maxScore: 3,
    priority: 3,
    title: "Maak testen en releasebeheer voorspelbaar",
    description: "Wijzigingen worden nog te weinig beheerst getest, vrijgegeven en gecommuniceerd.",
    fit: "Er is meestal al ervaring met wijzigingen en productie-impact.",
    gap: "Testaanpak, vrijgave en communicatie zijn onvoldoende structureel ingericht.",
    soll: "Wijzigingen worden gecontroleerd getest, vrijgegeven en vastgelegd.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_ado_001",
    areaId: "adoptie",
    capabilityId: "adoptie_gebruik",
    maxScore: 3,
    priority: 4,
    title: "Versterk gebruikersadoptie",
    description: "Gebruikers wijken nog te vaak af van de afgesproken werkwijze of herkennen de bedoeling onvoldoende.",
    fit: "Gebruikers weten meestal goed waar het in de praktijk schuurt.",
    gap: "Adoptie, uitleg en gebruiksdiscipline zijn onvoldoende geborgd.",
    soll: "Gebruikers begrijpen de afgesproken werkwijze en passen die herkenbaar toe.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_ado_002",
    areaId: "adoptie",
    capabilityId: "adoptie_leervermogen",
    maxScore: 3,
    priority: 4,
    title: "Maak verandering beter uitlegbaar en houdbaar",
    description: "Proceswijzigingen landen onvoldoende in de organisatie en worden niet goed vastgehouden.",
    fit: "Er is vaak bereidheid om te verbeteren.",
    gap: "Communicatie, uitleg en feedback op verandering zijn onvoldoende ingericht.",
    soll: "Wijzigingen worden duidelijk uitgelegd, opgevolgd en vastgehouden.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_afas_generic_001",
    areaId: "afas",
    capabilityId: "afas_standaardgebruik",
    maxScore: 3,
    priority: 2,
    title: "Breng AFAS terug naar de standaardroute",
    description: "De AFAS-werkwijze leunt nog te veel op workarounds, omwegen of nevenlijsten.",
    fit: "AFAS vormt al een basis voor meerdere processen.",
    gap: "De inrichting en werkwijze sluiten nog onvoldoende aan op een eenduidige standaardroute.",
    soll: "AFAS ondersteunt de afgesproken standaardroute en maakt afwijkend werken minder aantrekkelijk.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_afas_generic_002",
    areaId: "afas",
    capabilityId: "afas_workflows_autorisaties",
    maxScore: 3,
    priority: 3,
    title: "Versterk workflows, autorisaties en taaksturing",
    description: "Taken, goedkeuringen en rechten zijn nog onvoldoende ondersteunend aan de gewenste procesdiscipline.",
    fit: "AFAS biedt al standaard mogelijkheden voor taaksturing en rechtenbeheer.",
    gap: "Workflows, autorisaties en opvolging zijn nog onvoldoende logisch of consequent ingericht.",
    soll: "Taken, goedkeuringen en rechten ondersteunen de gewenste route en eigenaarschap.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_afas_fin_001",
    areaId: "afas",
    capabilityId: "afas_financieel_gebruik",
    maxScore: 3,
    priority: 2,
    title: "Breng Financieel terug naar een beheersbare standaardroute",
    description: "Het financiële proces leunt nog te veel op uitzonderingen, herstelwerk of nevenadministratie buiten AFAS.",
    fit: "AFAS Financieel is al in gebruik en vormt een stevige basis.",
    gap: "Gebruik, werkwijze en inrichting zijn nog onvoldoende eenduidig en beheerst.",
    soll: "AFAS Financieel ondersteunt de standaardroute met minimale workarounds en duidelijke beheersing.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_afas_proj_001",
    areaId: "afas",
    capabilityId: "afas_projecten_gebruik",
    maxScore: 3,
    priority: 3,
    title: "Maak Projecten leidend in registratie en bewaking",
    description: "Projectinformatie wordt nog niet eenduidig of volledig via AFAS Projecten gestuurd.",
    fit: "AFAS Projecten is al beschikbaar binnen de klantomgeving.",
    gap: "Registratie, bewaking en gebruiksdiscipline zijn nog onvoldoende geborgd.",
    soll: "AFAS Projecten is de herkenbare standaard voor projectregistratie en bewaking.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_afas_abo_001",
    areaId: "afas",
    capabilityId: "afas_abonnementen_gebruik",
    maxScore: 3,
    priority: 3,
    title: "Versterk voorspelbaar beheer van Abonnementen",
    description: "Terugkerende omzet en facturatie worden nog onvoldoende beheerst ondersteund door AFAS Abonnementen.",
    fit: "Abonnementen is al beschikbaar en biedt een basis voor terugkerende processen.",
    gap: "Gebruik, beheer of aansluiting op facturatie en sturing zijn nog onvoldoende eenduidig.",
    soll: "AFAS Abonnementen ondersteunt een voorspelbaar en beheersbaar terugkerend proces.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_afas_ord_001",
    areaId: "afas",
    capabilityId: "afas_ordermanagement_gebruik",
    maxScore: 3,
    priority: 3,
    title: "Maak Ordermanagement leidend in de orderketen",
    description: "De keten van order tot levering of facturatie is nog onvoldoende eenduidig ondersteund door AFAS Ordermanagement.",
    fit: "Ordermanagement is al in gebruik en kan de keten centraal ondersteunen.",
    gap: "Gebruik, uitzonderingen en ketenlogica zijn nog onvoldoende beheerst.",
    soll: "AFAS Ordermanagement ondersteunt de afgesproken orderketen met beperkte uitzonderingen.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_afas_pay_001",
    areaId: "afas",
    capabilityId: "afas_payroll_gebruik",
    maxScore: 3,
    priority: 3,
    title: "Versterk de beheersing van Payroll",
    description: "Het payrollproces leunt nog te veel op handmatige controle of aanvullende stappen buiten AFAS.",
    fit: "Payroll is al beschikbaar en ondersteunt een belangrijk kernproces.",
    gap: "Gebruik, controle en standaardisatie zijn nog onvoldoende robuust ingericht.",
    soll: "AFAS Payroll ondersteunt een beheerst payrollproces met minimale nevenstappen.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_afas_wf_001",
    areaId: "afas",
    capabilityId: "afas_workflows_gebruik",
    maxScore: 3,
    priority: 3,
    title: "Gebruik Workflows actiever voor procesdiscipline",
    description: "AFAS Workflows worden nog onvoldoende gebruikt om opvolging, goedkeuring en procesdiscipline te borgen.",
    fit: "De workflowfunctionaliteit is al beschikbaar en kan meer waarde leveren.",
    gap: "De inzet van workflows is nog onvoldoende breed of consequent.",
    soll: "Workflows ondersteunen opvolging, goedkeuring en discipline op herkenbare momenten in het proces.",
    roadmap: ["", "", "", ""],
  },
  {
    id: "adv_afas_sm_001",
    areaId: "afas",
    capabilityId: "afas_sales_marketing_gebruik",
    maxScore: 3,
    priority: 4,
    title: "Maak Sales & Marketing leidend in CRM en opvolging",
    description: "CRM en commerciële opvolging worden nog onvoldoende centraal en eenduidig in AFAS ondersteund.",
    fit: "Sales & Marketing is aanwezig en kan de commerciële werkwijze beter ondersteunen.",
    gap: "Registratie, opvolging en discipline in gebruik zijn nog onvoldoende geborgd.",
    soll: "AFAS Sales & Marketing ondersteunt relatiebeheer, opvolging en inzicht als standaardroute.",
    roadmap: ["", "", "", ""],
  },
];

const ASSESSMENT_STORAGE_KEY = "kweekers-groeimodel-assessments";

export default function Page() {
  const [started, setStarted] = useState(false);
  const [activeStep, setActiveStep] = useState<StepId>("profiel");
  const [subStepByStep, setSubStepByStep] = useState<Record<StepId, number>>({
    profiel: 0,
    scope: 0,
    diagnose: 0,
    duiding: 0,
  });
  const [profile, setProfile] = useState<CustomerProfile>({
    customerName: "",
    sector: "",
    size: "",
    administrations: "",
    integrations: "",
    integrationTypes: [],
    reportingModes: [],
    reportingPrimaryMode: "",
    reason: "",
    succesmeterMeta: {
      fileName: "",
      uploadedAt: "",
      parseStatus: "idle",
    },
    succesmeterItems: [],
    detectedModules: [],
  });
  const [scope, setScope] = useState("volledige_scan");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(createInitialAnswers());
  const [diagnosisNotes, setDiagnosisNotes] = useState<Record<string, string>>({});
  const [showInfo, setShowInfo] = useState(false);
  const [savedAssessments, setSavedAssessments] = useState<AssessmentSnapshot[]>([]);

  useEffect(() => {
    setSavedAssessments(loadAssessments());
  }, []);

  const stepIndex = STEP_ORDER.indexOf(activeStep);
  const currentSubStep = subStepByStep[activeStep] ?? 0;
  const visibleAreas = useMemo(() => filterAreasByScope(GROWTH_AREAS, scope), [scope]);
  const reportingInsight = useMemo(() => deriveReportingInsight(profile), [profile]);
  const diagnosisQuestions = useMemo(
    () => buildDiagnosisQuestions(visibleAreas, profile, scope, reportingInsight),
    [visibleAreas, profile, scope, reportingInsight]
  );
  const scores = useMemo(() => calculateScores(answers, visibleAreas), [answers, visibleAreas]);
  const advice = useMemo(() => getTriggeredAdvice(scores, visibleAreas), [scores, visibleAreas]);
  const opportunities = useMemo(
    () =>
      buildOpportunityOverview(
        profile,
        answers,
        diagnosisNotes,
        visibleAreas,
        scope,
        reportingInsight
      ),
    [profile, answers, diagnosisNotes, visibleAreas, scope, reportingInsight]
  );

  const activeQuestions = getQuestionsForStep(activeStep, diagnosisQuestions);
  const maxSubStep = Math.max(activeQuestions.length - 1, 0);
  const safeCurrentSubStep = Math.min(currentSubStep, maxSubStep);
  const activeQuestion: Question =
    activeQuestions[safeCurrentSubStep] ?? {
      id: "fallback_question",
      type: "summary",
      label: "Geen vraag beschikbaar",
    };
  const isLastSubStep = safeCurrentSubStep >= maxSubStep;
  const isFirstSubStep = safeCurrentSubStep === 0;

  useEffect(() => {
    if (currentSubStep > maxSubStep) {
      setSubStep(activeStep, maxSubStep);
    }
  }, [activeStep, currentSubStep, maxSubStep]);

  const customerHistory = useMemo(
    () => getCustomerAssessments(savedAssessments, profile.customerName || ""),
    [savedAssessments, profile.customerName]
  );
  const previousAssessment = useMemo(() => customerHistory[0], [customerHistory]);

  const currentAssessmentBase = useMemo<AssessmentSnapshot>(
    () => ({
      id: "current_preview",
      createdAt: new Date().toISOString(),
      customerName: profile.customerName || "Onbekende klant",
      scope,
      directionKey: "doorontwikkelen",
      directionLabel: "Gericht doorontwikkelen",
      overallScore: scores.overall,
      profile,
      reportingInsight,
      scores,
      answers,
      diagnosisNotes,
      advice,
      opportunities,
      summary: {} as ReturnType<typeof buildManagementSummary>,
    }),
    [profile, scope, reportingInsight, scores, answers, diagnosisNotes, advice, opportunities]
  );

  const areaProgressReal = useMemo(
    () => buildAreaProgressOverview(visibleAreas, previousAssessment, currentAssessmentBase),
    [visibleAreas, previousAssessment, currentAssessmentBase]
  );
  const progressHeadline = useMemo(() => buildProgressHeadline(areaProgressReal), [areaProgressReal]);
  const progressHighlights = useMemo(
    () => buildProgressHighlights(areaProgressReal),
    [areaProgressReal]
  );
  const progressNarrative = useMemo(
    () => buildProgressNarrative(areaProgressReal, progressHighlights),
    [areaProgressReal, progressHighlights]
  );
  const summary = useMemo(
    () =>
      buildManagementSummary(
        profile,
        reportingInsight,
        scores,
        advice,
        opportunities,
        progressHeadline,
        progressNarrative
      ),
    [profile, reportingInsight, scores, advice, opportunities, progressHeadline, progressNarrative]
  );
  const currentAssessment = useMemo(
    () => ({
      ...currentAssessmentBase,
      directionKey: summary.direction.key,
      directionLabel: summary.direction.label,
      summary,
    }),
    [currentAssessmentBase, summary]
  );
  const reportFileName = useMemo(
    () => buildReportFileName(profile, summary.direction),
    [profile, summary.direction]
  );
  const reportSubtitle = useMemo(() => buildReportSubtitle(profile, scope), [profile, scope]);
  const progressSummary = useMemo(
    () => buildProgressSummary(previousAssessment, currentAssessment),
    [previousAssessment, currentAssessment]
  );
  const areaKeySignals = useMemo(
    () => buildAreaKeySignals(diagnosisQuestions, diagnosisNotes),
    [diagnosisQuestions, diagnosisNotes]
  );
  const adviceEvidenceMap = useMemo(
    () => buildAdviceEvidenceMap(diagnosisQuestions, answers, diagnosisNotes),
    [diagnosisQuestions, answers, diagnosisNotes]
  );
  const _reportPayload = useMemo(
    () => ({
      meta: {
        model: "Kweekers Groeimodel",
        version: "3.1-advice-report",
        generatedAt: new Date().toISOString(),
        reportFileName,
      },
      summary,
      direction: summary.direction,
      profile,
      reportingInsight,
      scope,
      scores,
      answers,
      diagnosisNotes,
      advice,
      adviceEvidenceMap,
      opportunities,
      areaProgress: areaProgressReal,
      areaKeySignals,
      progressHeadline,
      progressHighlights,
      progressNarrative,
    }),
    [
      reportFileName,
      summary,
      profile,
      reportingInsight,
      scope,
      scores,
      answers,
      diagnosisNotes,
      advice,
      adviceEvidenceMap,
      opportunities,
      areaProgressReal,
      areaKeySignals,
      progressHeadline,
      progressHighlights,
      progressNarrative,
    ]
  );

  function setSubStep(step: StepId, value: number) {
    setSubStepByStep((previous) => ({ ...previous, [step]: Math.max(0, value) }));
  }

  function goNext() {
    if (!isLastSubStep) {
      setSubStep(activeStep, safeCurrentSubStep + 1);
      return;
    }

    const nextStep = STEP_ORDER[Math.min(stepIndex + 1, STEP_ORDER.length - 1)];
    setActiveStep(nextStep);
  }

  function goPrevious() {
    if (!isFirstSubStep) {
      setSubStep(activeStep, safeCurrentSubStep - 1);
      return;
    }

    const previousStep = STEP_ORDER[Math.max(stepIndex - 1, 0)];
    setActiveStep(previousStep);
  }

  function jumpToStep(step: StepId) {
    setActiveStep(step);
  }

  function updateProfile(question: Question, value: string | string[]) {
    const target = question.target as keyof CustomerProfile;
    setProfile((previous) => ({ ...previous, [target]: value } as CustomerProfile));
  }

  function updateAnswer(questionId: string, value: string | number) {
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  }

  function updateDiagnosisNote(questionId: string, value: string) {
    setDiagnosisNotes((previous) => ({ ...previous, [questionId]: value }));
  }

  function toggleMulti(question: Question, value: string) {
    const target = question.target as keyof CustomerProfile;

    if (target === "reportingModes") {
      setProfile((previous) => {
        const current = previous.reportingModes;
        const next = current.includes(value as ReportingModeValue)
          ? current.filter((item) => item !== value)
          : [...current, value as ReportingModeValue];

        const nextPrimary = next.includes(previous.reportingPrimaryMode as ReportingModeValue)
          ? previous.reportingPrimaryMode
          : "";

        return {
          ...previous,
          reportingModes: next,
          reportingPrimaryMode: nextPrimary as ReportingModeValue | "",
        };
      });
      return;
    }

    const current = Array.isArray(profile[target]) ? (profile[target] as string[]) : [];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    updateProfile(question, next);
  }

  function updateSuccesmeterMeta(fileName: string) {
    setProfile((previous) => ({
      ...previous,
      succesmeterMeta: {
        fileName,
        uploadedAt: new Date().toISOString(),
        parseStatus: "uploaded",
      },
    }));
  }

  function updateSuccesmeterItems(
    items: SuccesmeterItem[],
    parseStatus: SuccesmeterMeta["parseStatus"] = "reviewed"
  ) {
    setProfile((previous) => ({
      ...previous,
      succesmeterItems: items,
      detectedModules: deriveDetectedModules(items),
      succesmeterMeta: {
        ...previous.succesmeterMeta,
        parseStatus,
      },
    }));
  }

  function saveCurrentAssessment() {
    const currentCustomer = (profile.customerName || "").trim();
    if (!currentCustomer) return;

    const snapshot: AssessmentSnapshot = {
      ...currentAssessment,
      summary,
      directionKey: summary.direction.key,
      directionLabel: summary.direction.label,
      id: createAssessmentId(),
      createdAt: new Date().toISOString(),
    };

    const existing = loadAssessments();
    const next = [snapshot, ...existing];
    saveAssessmentsToStorage(next);
    setSavedAssessments(next);
  }

  if (!started) {
    return (
      <main className="page intro-page">
        <section className="intro-card">
          <div className="brand-pill">Kweekers Groeimodel</div>
          <h1>Begeleide diagnose voor digitale volwassenheid.</h1>
          <p>
            Bepaal gestructureerd de IST, FIT, GAP en SOLL van een organisatie.
            Niet alleen gericht op AFAS, maar ook op processen, eigenaarschap,
            integraties, data, rapportage, beheer en veranderkracht.
          </p>
          <div className="intro-points">
            <span>Gezamenlijk invullen met klant en consultant</span>
            <span>Output: advies, kansen, voortgang en rapportweergave</span>
            <span>Geschikt als nulmeting en als volgend meetmoment</span>
          </div>
          <button className="primary big" onClick={() => setStarted(true)} type="button">
            Start groeimodel →
          </button>
        </section>
        <GlobalStyles />
      </main>
    );
  }

  return (
    <main className="page">
      <div className="app-shell">
        <TopBar
          activeStep={activeStep}
          stepIndex={stepIndex}
          setActiveStep={jumpToStep}
          showInfo={showInfo}
          setShowInfo={setShowInfo}
        />

        {showInfo ? <InfoPanel /> : null}

        {activeStep === "duiding" ? (
          <AdviceScreen
            areas={visibleAreas}
            profile={profile}
            reportingInsight={reportingInsight}
            scores={scores}
            answers={answers}
            advice={advice}
            opportunities={opportunities}
            diagnosisQuestions={diagnosisQuestions}
            diagnosisNotes={diagnosisNotes}
            summary={summary}
            reportFileName={reportFileName}
            reportSubtitle={reportSubtitle}
            currentAssessment={currentAssessment}
            previousAssessment={previousAssessment}
            progressSummary={progressSummary}
            customerHistory={customerHistory}
            saveCurrentAssessment={saveCurrentAssessment}
            areaProgress={areaProgressReal}
            areaKeySignals={areaKeySignals}
            progressHeadline={progressHeadline}
            progressHighlights={progressHighlights}
            progressNarrative={progressNarrative}
            adviceEvidenceMap={adviceEvidenceMap}
            goPrevious={goPrevious}
          />
        ) : (
          <WizardCard
            step={activeStep}
            stepIndex={stepIndex}
            question={activeQuestion}
            subStep={safeCurrentSubStep}
            totalSubSteps={activeQuestions.length}
            profile={profile}
            scope={scope}
            scores={scores}
            answers={answers}
            diagnosisNotes={diagnosisNotes}
            reportingInsight={reportingInsight}
            updateProfile={updateProfile}
            updateScope={setScope}
            updateAnswer={updateAnswer}
            updateDiagnosisNote={updateDiagnosisNote}
            updateSuccesmeterMeta={updateSuccesmeterMeta}
            updateSuccesmeterItems={updateSuccesmeterItems}
            toggleMulti={toggleMulti}
            goPrevious={goPrevious}
            goNext={goNext}
            isFirstOverall={stepIndex === 0 && isFirstSubStep}
            isLastOverall={stepIndex === STEP_ORDER.length - 1 && isLastSubStep}
          />
        )}
      </div>
      <GlobalStyles />
    </main>
  );
}

function TopBar({
  activeStep,
  stepIndex,
  setActiveStep,
  showInfo,
  setShowInfo,
}: {
  activeStep: StepId;
  stepIndex: number;
  setActiveStep: (step: StepId) => void;
  showInfo: boolean;
  setShowInfo: (value: boolean) => void;
}) {
  return (
    <header className="topbar">
      <div className="topbar-head">
        <div>
          <div className="brand">Kweekers Groeimodel</div>
          <div className="topbar-sub">Stap {stepIndex + 1} van {STEPS.length}</div>
        </div>
        <button className="ghost" onClick={() => setShowInfo(!showInfo)} type="button">
          {showInfo ? "Uitleg verbergen" : "Uitleg"}
        </button>
      </div>
      <nav className="stepper" aria-label="Stappen">
        {STEPS.map((step, index) => (
          <button
            key={step.id}
            type="button"
            className={`step ${activeStep === step.id ? "active" : ""} ${index < stepIndex ? "done" : ""}`}
            onClick={() => setActiveStep(step.id)}
          >
            <span>{index < stepIndex ? "✓" : index + 1}</span>
            <strong>{step.label}</strong>
          </button>
        ))}
      </nav>
    </header>
  );
}

function InfoPanel() {
  return (
    <section className="info-panel">
      <strong>Check → Begrijp → Meet → Duid → Adviseer</strong>
      <p>
        De app werkt als begeleide diagnose. De uitleg tijdens het invullen blijft bewust compact.
        Voorbeelden en toelichtingen verschijnen op de relevante plek, zodat het scherm rustig blijft.
      </p>
    </section>
  );
}

function WizardCard(props: {
  step: StepId;
  stepIndex: number;
  question: Question;
  subStep: number;
  totalSubSteps: number;
  profile: CustomerProfile;
  scope: string;
  scores: Scores;
  answers: Record<string, AnswerValue>;
  diagnosisNotes: Record<string, string>;
  reportingInsight: ReportingInsight;
  updateProfile: (question: Question, value: string | string[]) => void;
  updateScope: (value: string) => void;
  updateAnswer: (questionId: string, value: string | number) => void;
  updateDiagnosisNote: (questionId: string, value: string) => void;
  updateSuccesmeterMeta: (fileName: string) => void;
  updateSuccesmeterItems: (items: SuccesmeterItem[], parseStatus?: SuccesmeterMeta["parseStatus"]) => void;
  toggleMulti: (question: Question, value: string) => void;
  goPrevious: () => void;
  goNext: () => void;
  isFirstOverall: boolean;
  isLastOverall: boolean;
}) {
  const { question } = props;
  const progress = ((props.subStep + 1) / props.totalSubSteps) * 100;
  const stepMeta = STEPS.find((step) => step.id === props.step) ?? STEPS[0];

  return (
    <section className="wizard-wrap">
      <div className="wizard-card">
        <div className="wizard-meta">
          <span className="icon-bubble">{stepMeta.icon}</span>
          <div>
            <small>{stepMeta.label}</small>
            <h1>{question.label}</h1>
            {question.help ? <p>{question.help}</p> : null}
            {props.step === "diagnose" && question.areaLabel ? (
              <div className="diagnosis-context">
                <span>{question.areaIcon}</span>
                <strong>{question.areaLabel}</strong>
                <em>{question.capabilityLabel}</em>
                {question.kind ? <small>{question.kind}</small> : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="progress-line">
          <div style={{ width: `${progress}%` }} />
        </div>

        <div className="answer-zone">
          {props.step === "profiel" &&
            renderProfileQuestion({
              ...props,
              reportingInsight: props.reportingInsight,
              updateSuccesmeterMeta: props.updateSuccesmeterMeta,
              updateSuccesmeterItems: props.updateSuccesmeterItems,
            })}
          {props.step === "scope" && renderScopeQuestion(props)}
          {props.step === "diagnose" && renderDiagnosisQuestion(props)}
        </div>

        <div className="wizard-footer">
          <button className="secondary" onClick={props.goPrevious} disabled={props.isFirstOverall} type="button">
            Vorige
          </button>
          <span>
            Vraag {props.subStep + 1} van {props.totalSubSteps}
          </span>
          <button className="primary" onClick={props.goNext} type="button">
            {props.subStep + 1 === props.totalSubSteps ? "Verder →" : "Volgende →"}
          </button>
        </div>
      </div>
    </section>
  );
}

function renderProfileQuestion(
  props: React.ComponentProps<typeof WizardCard> & {
    updateSuccesmeterMeta: (fileName: string) => void;
    updateSuccesmeterItems: (
      items: SuccesmeterItem[],
      parseStatus?: SuccesmeterMeta["parseStatus"]
    ) => void;
    reportingInsight: ReportingInsight;
  }
) {
  const q = props.question;

  if (q.type === "summary") {
    return <ProfileSummary profile={props.profile} reportingInsight={props.reportingInsight} />;
  }

  if (q.type === "text") {
    const value = String(props.profile[q.target as keyof CustomerProfile] ?? "");
    return (
      <input
        className="text-input"
        value={value}
        onChange={(event) => props.updateProfile(q, event.target.value)}
        placeholder="Typ hier..."
        autoFocus
      />
    );
  }

  if (q.type === "succesmeter_upload") {
    return (
      <SuccesmeterUploadAnswer
        meta={props.profile.succesmeterMeta}
        onUpload={(fileName) => {
          props.updateSuccesmeterMeta(fileName);
          props.updateSuccesmeterItems(getMockSuccesmeterItems(), "parsed");
        }}
      />
    );
  }

  if (q.type === "succesmeter_review") {
    return (
      <SuccesmeterReviewAnswer
        items={props.profile.succesmeterItems}
        onChange={(items) => props.updateSuccesmeterItems(items, "reviewed")}
      />
    );
  }

  if (q.type === "multi") {
    const values = Array.isArray(props.profile[q.target as keyof CustomerProfile])
      ? (props.profile[q.target as keyof CustomerProfile] as string[])
      : [];

    return (
      <MultiAnswer
        options={q.options ?? []}
        values={values}
        onToggle={(value) => props.toggleMulti(q, value)}
        variant={q.variant ?? "chips"}
      />
    );
  }

  if (q.target === "reportingPrimaryMode") {
    const dynamicOptions = getReportingOptionsForSelectedModes(props.profile.reportingModes);

    if (!dynamicOptions.length) {
      return (
        <div className="message warning">
          <strong>Kies eerst de gebruikte rapportagevormen</strong>
          <p>De leidende vorm kan pas gekozen worden nadat minimaal één rapportagevorm is geselecteerd.</p>
        </div>
      );
    }

    return (
      <div className="summary-stack">
        <ChoiceAnswer
          options={dynamicOptions}
          value={props.profile.reportingPrimaryMode}
          onChange={(value) => props.updateProfile(q, value)}
          variant="cards"
        />
        <ReportingInsightCard insight={props.reportingInsight} compact />
      </div>
    );
  }

  const value = String(props.profile[q.target as keyof CustomerProfile] ?? "");
  return (
    <ChoiceAnswer
      options={q.options ?? []}
      value={value}
      onChange={(value) => props.updateProfile(q, value)}
      variant={q.variant ?? "chips"}
    />
  );
}

function renderScopeQuestion(props: React.ComponentProps<typeof WizardCard>) {
  const q = props.question;
  if (q.type === "summary") {
    return <ScopeSummary scope={props.scope} />;
  }
  return (
    <ChoiceAnswer
      options={q.options ?? []}
      value={props.scope}
      onChange={props.updateScope}
      variant="cards"
    />
  );
}

function renderDiagnosisQuestion(props: React.ComponentProps<typeof WizardCard>) {
  const q = props.question;
  const value = props.answers[q.id] ?? "";
  const noteKey = q.signalQuestionId ?? `${q.id}_note`;
  const noteValue = props.diagnosisNotes[noteKey] ?? "";

  return (
    <div className="diagnosis-stack">
      {q.examples?.length ? <DiagnosisExamples examples={q.examples} /> : null}

      <ChoiceAnswer
        options={q.options ?? YES_PARTLY_NO_UNKNOWN}
        value={String(value)}
        onChange={(next) => props.updateAnswer(q.id, next)}
      />

      <div className="inline-note-block">
        <label className="inline-note-label">{q.signalLabel ?? "Wat zie je hiervan in de praktijk?"}</label>
        <textarea
          className="text-area"
          value={noteValue}
          onChange={(event) => props.updateDiagnosisNote(noteKey, event.target.value)}
          placeholder={q.signalPlaceholder ?? "Korte toelichting, signaal of voorbeeld..."}
        />
      </div>
    </div>
  );
}

function ChoiceAnswer({
  options,
  value,
  onChange,
  variant = "chips",
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  variant?: "chips" | "cards";
}) {
  return (
    <div className={variant === "cards" ? "choice-grid" : "choice-row"}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`${variant === "cards" ? "choice-card" : "chip"} ${value === option.value ? "active" : ""}`}
          onClick={() => onChange(option.value)}
          type="button"
        >
          <strong>{option.label}</strong>
          {variant === "cards" && option.description ? <span>{option.description}</span> : null}
        </button>
      ))}
    </div>
  );
}

function MultiAnswer({
  options,
  values,
  onToggle,
  variant = "chips",
}: {
  options: Option[];
  values: string[];
  onToggle: (value: string) => void;
  variant?: "chips" | "cards";
}) {
  if (variant === "cards") {
    return (
      <div className="multi-card-grid">
        {options.map((option) => (
          <button
            key={option.value}
            className={`multi-card ${values.includes(option.value) ? "active" : ""}`}
            onClick={() => onToggle(option.value)}
            type="button"
          >
            <strong>{option.label}</strong>
            {option.description ? <span>{option.description}</span> : null}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="choice-row">
      {options.map((option) => (
        <button
          key={option.value}
          className={`chip ${values.includes(option.value) ? "active" : ""}`}
          onClick={() => onToggle(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SuccesmeterUploadAnswer({
  meta,
  onUpload,
}: {
  meta: SuccesmeterMeta;
  onUpload: (fileName: string) => void;
}) {
  return (
    <div className="summary-stack">
      <label className="upload-box">
        <strong>Kies screenshot of export van de succesmeter</strong>
        <span>PNG, JPG of WEBP. Later kan hier ook echte parsing op aangesloten worden.</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            onUpload(file.name);
          }}
        />
      </label>

      <div className="message neutral">
        <strong>Status</strong>
        <p>
          {meta.fileName ? `Bestand geselecteerd: ${meta.fileName}` : "Nog geen succesmeter geselecteerd."}
        </p>
      </div>
    </div>
  );
}

function SuccesmeterReviewAnswer({
  items,
  onChange,
}: {
  items: SuccesmeterItem[];
  onChange: (items: SuccesmeterItem[]) => void;
}) {
  if (!items.length) {
    return (
      <div className="message warning">
        <strong>Nog geen gegevens beschikbaar</strong>
        <p>Upload eerst een succesmeter zodat de herkende onderdelen gecontroleerd kunnen worden.</p>
      </div>
    );
  }

  function updateItem(id: string, patch: Partial<SuccesmeterItem>) {
    const next = items.map((item) =>
      item.id === id ? { ...item, ...patch, confirmed: true } : item
    );
    onChange(next);
  }

  return (
    <div className="review-list">
      {items.map((item) => (
        <div key={item.id} className="review-row">
          <div className="review-main">
            <small>{item.domain}</small>
            <strong>{item.product}</strong>
          </div>

          <div className="review-actions">
            <div className="toggle-row">
              <button
                type="button"
                className={`chip ${item.inUse ? "active" : ""}`}
                onClick={() => updateItem(item.id, { inUse: true })}
              >
                In gebruik
              </button>
              <button
                type="button"
                className={`chip ${!item.inUse ? "active" : ""}`}
                onClick={() => updateItem(item.id, { inUse: false })}
              >
                Niet in gebruik
              </button>
            </div>

            <label className="inline-field">
              <span>Benchmark %</span>
              <input
                className="text-input small-input"
                type="number"
                value={item.benchmarkPct ?? ""}
                onChange={(event) =>
                  updateItem(item.id, {
                    benchmarkPct: event.target.value ? Number(event.target.value) : null,
                  })
                }
              />
            </label>

            <label className="inline-field">
              <span>Toekomstig interessant?</span>
              <select
                className="text-input small-input"
                value={
                  item.relevantForFuture === null ? "" : item.relevantForFuture ? "ja" : "nee"
                }
                onChange={(event) =>
                  updateItem(item.id, {
                    relevantForFuture:
                      event.target.value === ""
                        ? null
                        : event.target.value === "ja",
                  })
                }
              >
                <option value="">Nog niet bepaald</option>
                <option value="ja">Ja</option>
                <option value="nee">Nee</option>
              </select>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

function DiagnosisExamples({ examples }: { examples: string[] }) {
  return (
    <div className="examples-box">
      <strong>Voorbeelden</strong>
      <ul>
        {examples.map((example) => (
          <li key={example}>{example}</li>
        ))}
      </ul>
    </div>
  );
}

function ReportingInsightCard({
  insight,
  compact = false,
}: {
  insight: ReportingInsight;
  compact?: boolean;
}) {
  return (
    <div className={`message neutral ${compact ? "compact-message" : ""}`}>
      <strong>Indicatie rapportagevolwassenheid: {insight.indicativeLabel}</strong>
      <p>
        Leidende vorm: {insight.primaryLabel}.
        {insight.source === "fallback"
          ? " Nog geen leidende vorm gekozen; de indicatie is tijdelijk afgeleid uit de meest geavanceerde geselecteerde vorm."
          : ""}
      </p>
      <div className="signal-pills">
        {insight.signals.manualDependency ? <span className="signal-pill">Veel handmatig</span> : null}
        {insight.signals.dashboardDriven ? <span className="signal-pill">Dashboards aanwezig</span> : null}
        {insight.signals.automatedDistribution ? <span className="signal-pill">Push-rapportages</span> : null}
        {insight.signals.realtimeOrAdvanced ? <span className="signal-pill">Realtime / advanced</span> : null}
        {insight.signals.fragmentedLandscape ? <span className="signal-pill">Meerdere vormen naast elkaar</span> : null}
      </div>
    </div>
  );
}

function ProfileSummary({
  profile,
  reportingInsight,
}: {
  profile: CustomerProfile;
  reportingInsight: ReportingInsight;
}) {
  return (
    <div className="summary-stack">
      <SummaryRow label="Klant" value={profile.customerName || "Niet ingevuld"} />
      <SummaryRow label="Sector" value={labelOf(SECTOR_OPTIONS, profile.sector)} />
      <SummaryRow label="Omvang" value={labelOf(SIZE_OPTIONS, profile.size)} />
      <SummaryRow label="Administraties" value={labelOf(ADMIN_OPTIONS, profile.administrations)} />
      <SummaryRow label="Succesmeter" value={profile.succesmeterMeta.fileName || "Niet geüpload"} />
      <SummaryRow label="Herkende onderdelen" value={profile.detectedModules.join(", ") || "Nog niet bevestigd"} />
      <SummaryRow label="Landschap rondom AFAS" value={labelOf(COMPLEXITY_OPTIONS, profile.integrations)} />
      <SummaryRow
        label="Soorten koppelingen"
        value={
          profile.integrationTypes.length
            ? profile.integrationTypes.map((item) => labelOf(INTEGRATION_TYPE_OPTIONS, item)).join(", ")
            : "Niet ingevuld"
        }
      />
      <SummaryRow
        label="Rapportagevormen"
        value={
          profile.reportingModes.length
            ? profile.reportingModes.map((item) => labelOf(REPORTING_OPTIONS, item)).join(", ")
            : "Niet ingevuld"
        }
      />
      <SummaryRow
        label="Leidende rapportagevorm"
        value={
          profile.reportingPrimaryMode
            ? labelOf(REPORTING_OPTIONS, profile.reportingPrimaryMode)
            : "Niet ingevuld"
        }
      />
      <SummaryRow label="Indicatie rapportagevolwassenheid" value={reportingInsight.indicativeLabel} />
      <SummaryRow label="Aanleiding" value={labelOf(REASON_OPTIONS, profile.reason)} />
      <ReportingInsightCard insight={reportingInsight} />
    </div>
  );
}

function ScopeSummary({ scope }: { scope: string }) {
  return (
    <div className="summary-stack">
      <SummaryRow label="Gekozen scope" value={labelOf(SCOPE_OPTIONS, scope)} />
      <div className="message neutral">
        <strong>Scope bevestigd</strong>
        <p>De gekozen scope bepaalt welke groeigebieden en verdiepingen in de diagnose worden meegenomen.</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <strong>{value || "Niet ingevuld"}</strong>
    </div>
  );
}

function AdviceScreen({
  areas,
  profile,
  reportingInsight,
  scores,
  answers,
  advice,
  opportunities,
  diagnosisQuestions,
  diagnosisNotes,
  summary,
  reportFileName,
  reportSubtitle,
  currentAssessment,
  previousAssessment,
  progressSummary,
  customerHistory,
  saveCurrentAssessment,
  areaProgress,
  areaKeySignals,
  progressHeadline,
  progressHighlights,
  progressNarrative,
  adviceEvidenceMap,
  goPrevious,
}: {
  areas: GrowthArea[];
  profile: CustomerProfile;
  reportingInsight: ReportingInsight;
  scores: Scores;
  answers: Record<string, AnswerValue>;
  advice: AdviceRule[];
  opportunities: OpportunityItem[];
  diagnosisQuestions: Question[];
  diagnosisNotes: Record<string, string>;
  summary: ReturnType<typeof buildManagementSummary>;
  reportFileName: string;
  reportSubtitle: string;
  currentAssessment: AssessmentSnapshot;
  previousAssessment?: AssessmentSnapshot;
  progressSummary: ReturnType<typeof buildProgressSummary>;
  customerHistory: AssessmentSnapshot[];
  saveCurrentAssessment: () => void;
  areaProgress: AreaProgressItem[];
  areaKeySignals: Record<string, AreaKeySignal>;
  progressHeadline: ProgressHeadline;
  progressHighlights: ProgressHighlights;
  progressNarrative: ProgressNarrative;
  adviceEvidenceMap: Record<string, AdviceEvidenceItem[]>;
  goPrevious: () => void;
}) {
  const scoreAreas = areas.filter((area) =>
    area.capabilities.some((capability) => (capability.mode ?? "score") === "score")
  );

  const signalItems = buildSignalOverview(diagnosisQuestions, diagnosisNotes);

  return (
    <section className="content-screen report-screen">
      <div className={`report-hero ${summary.direction.key}`}>
        <div className="report-hero-content">
          <small>Hoofdrichting</small>
          <h1>{summary.direction.label}</h1>
          <div className="report-subtitle">{reportSubtitle}</div>

          <div className={`progress-headline ${progressHeadline.hasComparison ? "active" : "inactive"}`}>
            <strong>Voortgangsbeeld</strong>
            <p>{progressHeadline.sentence}</p>

            {progressHeadline.hasComparison ? (
              <div className="progress-badges">
                <span className="progress-badge success">
                  {progressHeadline.improvedCount} gebied{progressHeadline.improvedCount === 1 ? "" : "en"} verbeterd
                </span>
                <span className="progress-badge danger">
                  {progressHeadline.declinedCount} gebied{progressHeadline.declinedCount === 1 ? "" : "en"} teruggelopen
                </span>
                <span className="progress-badge neutral">
                  {progressHeadline.stableCount} gebied{progressHeadline.stableCount === 1 ? "" : "en"} stabiel
                </span>
              </div>
            ) : null}
          </div>

          <div className={`progress-narrative ${progressNarrative.tone}`}>
            <strong>Korte duiding</strong>
            <p>{progressNarrative.sentence}</p>
          </div>

          {progressHighlights.hasComparison ? (
            <div className="progress-highlight-grid">
              {progressHighlights.biggestImprovement ? (
                <div className="progress-highlight-card improvement">
                  <small>Grootste verbetering</small>
                  <strong>
                    {progressHighlights.biggestImprovement.areaIcon} {progressHighlights.biggestImprovement.areaLabel}
                  </strong>
                  <p>{progressHighlights.biggestImprovement.text}</p>
                </div>
              ) : (
                <div className="progress-highlight-card neutral">
                  <small>Grootste verbetering</small>
                  <strong>Geen duidelijke uitschieter</strong>
                  <p>Er is nog geen uitgesproken verbetering zichtbaar tussen de meetmomenten.</p>
                </div>
              )}

              {progressHighlights.biggestDecline ? (
                <div className="progress-highlight-card decline">
                  <small>Grootste terugval</small>
                  <strong>
                    {progressHighlights.biggestDecline.areaIcon} {progressHighlights.biggestDecline.areaLabel}
                  </strong>
                  <p>{progressHighlights.biggestDecline.text}</p>
                </div>
              ) : (
                <div className="progress-highlight-card neutral">
                  <small>Grootste terugval</small>
                  <strong>Geen duidelijke terugval</strong>
                  <p>Er is geen duidelijke terugval zichtbaar tussen de meetmomenten.</p>
                </div>
              )}
            </div>
          ) : null}

          <p>{summary.direction.sentence}</p>
          <small className="report-file-label">Rapportnaam: {reportFileName}</small>
        </div>

        <div className="report-hero-actions">
          <button className="secondary" onClick={saveCurrentAssessment} type="button">
            Sla meetmoment op
          </button>
          <button className="secondary" onClick={() => handlePrintReport(reportFileName)} type="button">
            Print / PDF
          </button>
        </div>
      </div>

      <div className="report-header">
        <div>
          <small>Eindbeeld</small>
          <h2>Samenvatting en advies</h2>
          <p>
            Dit scherm is opgebouwd als rapportweergave. Het gezamenlijke beeld,
            de belangrijkste adviezen en mogelijke groeirichtingen staan hieronder
            in een vaste, documenteerbare structuur.
          </p>
        </div>
      </div>

      <section className="report-section">
        <h2>Managementsamenvatting</h2>
        <div className="panel">
          <div className="management-summary-text">
            <p>{summary.customerSentence}</p>
            <p>{summary.maturitySentence}</p>
            <p>{summary.progressSentence}</p>
            <p className="progress-narrative-inline">{summary.progressNarrativeSentence}</p>
            <p>{summary.adviceSentence}</p>
            <p>{summary.opportunitySentence}</p>
            <p className="direction-inline-text">{summary.directionSummarySentence}</p>

            <div className={`direction-box ${summary.direction.key}`}>
              <strong>Adviesrichting: {summary.direction.label}</strong>
              <p>{summary.direction.sentence}</p>
            </div>
          </div>

          <div className="summary-mini-grid">
            <div className="mini">
              <strong>Indicatie rapportagevolwassenheid</strong>
              <p>{summary.reportingLabel}</p>
            </div>
            <div className="mini">
              <strong>Aantal hoofdadviezen</strong>
              <p>{advice.length}</p>
            </div>
            <div className="mini">
              <strong>Aantal kansen</strong>
              <p>{opportunities.length}</p>
            </div>
            <div className="mini">
              <strong>Adviesrichting</strong>
              <p>{summary.direction.label}</p>
            </div>
          </div>

          <div className="report-list-block">
            <strong>Belangrijkste aandachtspunten</strong>
            <ul>
              {summary.topAdvice.length === 0 ? (
                <li>Nog geen hoofdadviezen geactiveerd.</li>
              ) : (
                summary.topAdvice.map((item) => <li key={item.id}>{item.title}</li>)
              )}
            </ul>
          </div>

          <div className="report-list-block">
            <strong>Kansrijke groeirichtingen</strong>
            <ul>
              {summary.topOpportunities.length === 0 ? (
                <li>Er zijn op dit moment nog geen uitgesproken groeirichtingen gemarkeerd.</li>
              ) : (
                summary.topOpportunities.map((item) => (
                  <li key={item.capabilityId}>
                    {item.productLabel ? `${item.productLabel}: ` : ""}
                    {item.capabilityLabel}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="report-section">
        <h2>Klantbeeld</h2>
        <div className="two-column-content">
          <div className="panel">
            <h3>Context</h3>
            <div className="summary-stack">
              <SummaryRow label="Klant" value={profile.customerName || "Niet ingevuld"} />
              <SummaryRow label="Sector" value={labelOf(SECTOR_OPTIONS, profile.sector)} />
              <SummaryRow label="Omvang" value={labelOf(SIZE_OPTIONS, profile.size)} />
              <SummaryRow label="Administraties" value={labelOf(ADMIN_OPTIONS, profile.administrations)} />
              <SummaryRow label="Landschap rondom AFAS" value={labelOf(COMPLEXITY_OPTIONS, profile.integrations)} />
              <SummaryRow
                label="Soorten koppelingen"
                value={
                  profile.integrationTypes.length
                    ? profile.integrationTypes.map((item) => labelOf(INTEGRATION_TYPE_OPTIONS, item)).join(", ")
                    : "Niet ingevuld"
                }
              />
            </div>
          </div>

          <div className="panel">
            <h3>Rapportage & gebruikte onderdelen</h3>
            <div className="summary-stack">
              <SummaryRow label="Succesmeter" value={profile.succesmeterMeta.fileName || "Niet geüpload"} />
              <SummaryRow label="Herkende onderdelen" value={profile.detectedModules.join(", ") || "Nog niet bevestigd"} />
              <SummaryRow
                label="Rapportagevormen"
                value={
                  profile.reportingModes.length
                    ? profile.reportingModes.map((item) => labelOf(REPORTING_OPTIONS, item)).join(", ")
                    : "Niet ingevuld"
                }
              />
              <SummaryRow
                label="Leidende rapportagevorm"
                value={
                  profile.reportingPrimaryMode
                    ? labelOf(REPORTING_OPTIONS, profile.reportingPrimaryMode)
                    : "Niet ingevuld"
                }
              />
              <SummaryRow label="Indicatie rapportagevolwassenheid" value={reportingInsight.indicativeLabel} />
              <SummaryRow label="Aanleiding" value={labelOf(REASON_OPTIONS, profile.reason)} />
            </div>
          </div>
        </div>
      </section>

      <section className="report-section">
        <h2>Voortgang en eerdere meetmomenten</h2>
        <div className="two-column-content">
          <div className="panel">
            <h3>Vergelijking</h3>
            <p>{progressSummary.text}</p>
            {previousAssessment ? (
              <div className="summary-stack">
                <SummaryRow label="Vorige meting" value={formatDutchDate(previousAssessment.createdAt)} />
                <SummaryRow label="Vorige adviesrichting" value={previousAssessment.directionLabel} />
                <SummaryRow label="Vorige totaalscore" value={previousAssessment.overallScore.toFixed(1)} />
                <SummaryRow label="Huidige totaalscore" value={currentAssessment.overallScore.toFixed(1)} />
              </div>
            ) : (
              <div className="empty">Nog geen eerdere meting beschikbaar voor deze klant.</div>
            )}
          </div>
          <div className="panel">
            <h3>Eerdere meetmomenten</h3>
            {customerHistory.length === 0 ? (
              <div className="empty">Er zijn nog geen opgeslagen meetmomenten voor deze klant.</div>
            ) : (
              <div className="history-list">
                {customerHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="history-item">
                    <strong>{formatDutchDate(item.createdAt)}</strong>
                    <small>{item.directionLabel}</small>
                    <span>Score: {item.overallScore.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="report-section">
        <h2>Indicatieve scorekaart</h2>
        <div className="panel">
          <p>
            De score hieronder is een indicatief beeld op basis van de gezamenlijke antwoorden.
            Het is bedoeld als richtinggevend gesprekspunt, niet als harde audituitkomst.
          </p>
          <div className="score-list">
            {scoreAreas.map((area) => {
              const score = scores.byArea[area.id]?.score ?? 0;
              const interpretation = getScoreInterpretation(score);
              return (
                <div key={area.id} className="score-row">
                  <div>
                    <span>{area.icon} {area.label}</span>
                    <strong>{score.toFixed(1)} / 7</strong>
                  </div>
                  <div className="bar"><span style={{ width: `${(score / 7) * 100}%` }} /></div>
                  <small className={interpretation.tone}>{interpretation.label}</small>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="report-section">
        <h2>Vergelijking per groeigebied</h2>
        <div className="panel">
          <p className="muted-paragraph">
            Deze vergelijking laat een indicatief verschil per groeigebied zien op basis van de ingevulde meetmomenten.
          </p>
          {!previousAssessment ? (
            <div className="empty">
              Er is nog geen eerder meetmoment beschikbaar om de groeigebieden te vergelijken.
            </div>
          ) : (
            <div className="area-progress-list">
              {areaProgress.map((item) => {
                const movementVisual = getAreaMovementVisual(item.movement);
                return (
                  <div key={item.areaId} className="area-progress-item">
                    <div className="area-progress-head">
                      <div className="area-progress-title">
                        <span>{item.areaIcon}</span>
                        <div>
                          <strong>{item.areaLabel}</strong>
                          <small className="area-progress-subtitle">{getAreaMovementSubtitle(item.movement)}</small>
                        </div>
                      </div>
                      <div className="area-progress-status-group">
                        <span className={`area-movement-arrow ${movementVisual.tone}`}>{movementVisual.icon}</span>
                        <span className={`status-pill ${mapAreaMovementStatus(item.movement)}`}>{movementVisual.label}</span>
                      </div>
                    </div>

                    <div className="area-progress-metrics">
                      <div className="mini">
                        <strong>Vorige score</strong>
                        <p>{item.previousScore != null ? item.previousScore.toFixed(1) : "n.v.t."}</p>
                      </div>
                      <div className="mini">
                        <strong>Huidige score</strong>
                        <p>{item.currentScore.toFixed(1)}</p>
                      </div>
                      <div className="mini">
                        <strong>Verschil</strong>
                        <p className={`delta-text ${movementVisual.tone}`}>
                          {item.delta != null ? `${item.delta >= 0 ? "+" : ""}${item.delta.toFixed(1)}` : "n.v.t."}
                        </p>
                      </div>
                    </div>

                    <div className="bar compare-bar"><span style={{ width: `${(item.currentScore / 7) * 100}%` }} /></div>

                    <div className="area-progress-interpretation">
                      <strong>Duiding</strong>
                      <p>{item.interpretation}</p>
                      <small>{item.conversationHint}</small>
                      {areaKeySignals[item.areaId]?.note ? (
                        <div className="area-key-signal">
                          <strong>Belangrijk signaal uit de sessie</strong>
                          <p>{areaKeySignals[item.areaId].note}</p>
                          <small>Bron: {areaKeySignals[item.areaId].sourceLabel}</small>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="report-section">
        <h2>Belangrijkste adviezen</h2>
        <div className="advice-list">
          {advice.length === 0 ? (
            <div className="empty">Nog geen adviesregels geactiveerd.</div>
          ) : (
            advice.map((item) => (
              <AdviceCardWithEvidence
                key={item.id}
                item={item}
                evidence={adviceEvidenceMap[item.capabilityId] ?? []}
              />
            ))
          )}
        </div>
      </section>

      <section className="report-section">
        <h2>Kansen / potentie</h2>
        <div className="opportunity-list">
          {opportunities.length === 0 ? (
            <div className="empty">Er zijn nog geen kansen of potentiële groeirichtingen gesignaleerd.</div>
          ) : (
            opportunities.map((item) => <OpportunityCard key={item.capabilityId} item={item} />)
          )}
        </div>
      </section>

      <section className="report-section">
        <h2>Signalen uit de sessie</h2>
        <div className="panel">
          {signalItems.length === 0 ? (
            <div className="empty">Er zijn nog geen aanvullende signalen of toelichtingen vastgelegd.</div>
          ) : (
            <div className="signal-report-list">
              {signalItems.map((item) => (
                <div key={item.id} className="signal-report-item">
                  <strong>{item.areaLabel} · {item.capabilityLabel}</strong>
                  <small>{item.label}</small>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="screen-footer">
        <button className="secondary" onClick={goPrevious} type="button">Vorige</button>
      </div>
    </section>
  );
}

function AdviceCardWithEvidence({
  item,
  evidence,
}: {
  item: AdviceRule;
  evidence: AdviceEvidenceItem[];
}) {
  const area = GROWTH_AREAS.find((growthArea) => growthArea.id === item.areaId);

  return (
    <article className="advice-card report-advice-card">
      <div className="advice-title">
        <span>{area?.icon}</span>
        <div>
          <small>{area?.label} · Prioriteit {item.priority} ({getPriorityLabel(item.priority)})</small>
          <strong>{item.title}</strong>
        </div>
      </div>

      <p>{item.description}</p>

      <div className="mini-grid">
        <Mini title="FIT" text={item.fit} />
        <Mini title="GAP" text={item.gap} />
        <Mini title="SOLL" text={item.soll} />
      </div>

      <div className="evidence-block">
        <strong>Waarom dit advies naar voren komt</strong>
        {evidence.length === 0 ? (
          <div className="empty small-empty">Nog geen specifieke sessiesignalen gekoppeld.</div>
        ) : (
          <div className="evidence-list">
            {evidence.map((entry) => (
              <div key={`${item.id}-${entry.questionId}`} className="evidence-item">
                <div className="evidence-meta">
                  <span className={`status-pill ${mapEvidenceStatus(entry.answer)}`}>Antwoord: {entry.answerLabel}</span>
                  <span className="evidence-capability">{entry.capabilityLabel}</span>
                </div>
                {entry.note ? (
                  <p>{entry.note}</p>
                ) : (
                  <p className="muted-text">Er is geen extra toelichting vastgelegd, maar het antwoord op deze vraag activeert wel dit advies.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function OpportunityCard({ item }: { item: OpportunityItem }) {
  return (
    <article className="opportunity-card">
      <div className="advice-title">
        <span>{item.areaIcon}</span>
        <div>
          <small>{item.areaLabel}{item.productLabel ? ` · ${item.productLabel}` : ""}</small>
          <strong>{item.capabilityLabel}</strong>
        </div>
      </div>

      <p>{item.title}</p>

      <div className="opportunity-meta">
        <span className={`status-pill ${item.status}`}>
          {item.status === "kansrijk" && "Kansrijk"}
          {item.status === "verkennen" && "Verder verkennen"}
          {item.status === "niet_passend" && "Nu niet passend"}
          {item.status === "onbepaald" && "Nog niet bepaald"}
        </span>
        <span className="benchmark-pill">Benchmark: {item.benchmarkPct != null ? `${item.benchmarkPct}%` : "onbekend"}</span>
        <span className={`status-pill ${mapEvidenceStatus(item.answer)}`}>Antwoord: {item.answerLabel}</span>
      </div>

      <div className="evidence-block">
        <strong>Waarom deze kans naar voren komt</strong>
        <div className="opportunity-reason-list">
          {item.whyShown.length === 0 ? (
            <div className="empty small-empty">Er is geen extra contextregel gevonden.</div>
          ) : (
            item.whyShown.map((reason) => (
              <div key={reason} className="opportunity-reason-item">{reason}</div>
            ))
          )}
        </div>

        <div className="opportunity-session-block">
          <strong>Wat in de sessie is aangegeven</strong>
          {item.note ? (
            <p>{item.note}</p>
          ) : (
            <p className="muted-text">Er is nog geen extra toelichting vastgelegd bij deze kansvraag.</p>
          )}
        </div>
      </div>
    </article>
  );
}

function Mini({ title, text }: { title: string; text: string }) {
  return (
    <div className="mini">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function getQuestionsForStep(step: StepId, diagnosisQuestions: Question[]): Question[] {
  if (step === "profiel") return PROFILE_QUESTIONS;
  if (step === "scope") return SCOPE_QUESTIONS;
  if (step === "diagnose") return diagnosisQuestions;

  return [{ id: `${step}_screen`, type: "summary", label: step }];
}

function buildDiagnosisQuestions(
  areas: GrowthArea[],
  profile: CustomerProfile,
  scope: string,
  reportingInsight: ReportingInsight
): Question[] {
  const result: Question[] = [];

  areas.forEach((area) => {
    area.capabilities.forEach((capability) => {
      const mainQuestion = capability.questions.find((question) => question.type === "choice");
      if (!mainQuestion) return;
      if (!shouldShowQuestion(mainQuestion, profile, scope, reportingInsight)) return;

      const signalQuestion = capability.questions.find((question) => question.type === "open");

      result.push({
        ...mainQuestion,
        areaId: area.id,
        areaLabel: area.label,
        areaIcon: area.icon,
        capabilityId: capability.id,
        capabilityLabel: capability.label,
        kind: "Gezamenlijk beeld",
        examples: mainQuestion.examples ?? DIAGNOSIS_EXAMPLES[mainQuestion.id] ?? [],
        signalQuestionId: signalQuestion?.id ?? `${mainQuestion.id}_note`,
        signalLabel: signalQuestion?.label ?? "Wat zie je hiervan in de praktijk?",
        signalPlaceholder: signalQuestion?.help ?? "Korte toelichting, signaal of voorbeeld...",
      });
    });
  });

  return result;
}

function createInitialAnswers() {
  const result: Record<string, AnswerValue> = {};
  GROWTH_AREAS.forEach((area) => {
    area.capabilities.forEach((capability) => {
      capability.questions.forEach((question) => {
        if (question.type === "choice") result[question.id] = "";
      });
    });
  });
  return result;
}

function mapChoiceToIndicativeScore(value: string): number | null {
  if (value === "ja") return 4;
  if (value === "deels") return 2.5;
  if (value === "nee") return 1;
  return null;
}

function calculateScores(answers: Record<string, AnswerValue>, areas: GrowthArea[]): Scores {
  const byCapability: Scores["byCapability"] = {};
  const byArea: Scores["byArea"] = {};

  areas.forEach((area) => {
    let areaTotal = 0;
    let areaCount = 0;

    area.capabilities
      .filter((capability) => (capability.mode ?? "score") === "score")
      .forEach((capability) => {
        const mainQuestion = capability.questions.find((question) => question.type === "choice");
        const score = mainQuestion ? mapChoiceToIndicativeScore(String(answers[mainQuestion.id] ?? "")) : null;

        byCapability[capability.id] = {
          score: score ?? 0,
          count: score != null ? 1 : 0,
        };

        if (score != null) {
          areaTotal += score;
          areaCount += 1;
        }
      });

    byArea[area.id] = {
      score: areaCount ? areaTotal / areaCount : 0,
      count: areaCount,
    };
  });

  const areaScores = Object.values(byArea)
    .filter((item) => item.count > 0)
    .map((item) => item.score);

  const overall = areaScores.length
    ? areaScores.reduce((sum, score) => sum + score, 0) / areaScores.length
    : 0;

  return { overall, byArea, byCapability };
}

function deriveDetectedModules(items: SuccesmeterItem[]) {
  return Array.from(new Set(items.filter((item) => item.inUse).map((item) => item.product)));
}

function getSuccesmeterItem(profile: CustomerProfile, productKey: ProductKey) {
  return profile.succesmeterItems.find((item) => item.productKey === productKey);
}

function isProductInUse(profile: CustomerProfile, productKey: ProductKey) {
  return getSuccesmeterItem(profile, productKey)?.inUse === true;
}

function matchesProductRule(profile: CustomerProfile, rule: ProductRouteRule) {
  const item = getSuccesmeterItem(profile, rule.product);
  if (!item) return false;

  const benchmarkOk = rule.minBenchmark == null ? true : typeof item.benchmarkPct === "number" && item.benchmarkPct >= rule.minBenchmark;
  if (!benchmarkOk) return false;

  if (rule.when === "in_use") return item.inUse === true;
  if (rule.when === "not_in_use") return item.inUse === false;
  if (rule.when === "future_relevant") return item.relevantForFuture === true;
  return false;
}

function matchesReportingRule(profile: CustomerProfile, reportingInsight: ReportingInsight, rule: ReportingRouteRule) {
  if (rule.when === "selected") return !!rule.mode && profile.reportingModes.includes(rule.mode);
  if (rule.when === "primary") return !!rule.mode && profile.reportingPrimaryMode === rule.mode;
  if (rule.when === "signal_true") return !!rule.signal && reportingInsight.signals[rule.signal] === true;
  if (rule.when === "min_level") {
    return rule.minLevel != null && reportingInsight.indicativeLevel != null && reportingInsight.indicativeLevel >= rule.minLevel;
  }
  return false;
}

function matchesIntegrationRule(profile: CustomerProfile, rule: IntegrationRouteRule) {
  if (rule.when === "selected") return !!rule.type && profile.integrationTypes.includes(rule.type);
  if (rule.when === "complexity_is") return !!rule.complexity && profile.integrations === rule.complexity;
  return false;
}

function shouldShowQuestion(
  question: Question,
  profile: CustomerProfile,
  scope: string,
  reportingInsight: ReportingInsight
) {
  const routing = question.routing;
  if (!routing) return true;
  if (routing.always) return true;

  if (routing.scopeIs && !routing.scopeIs.includes(scope)) return false;
  if (routing.reasonIs && !routing.reasonIs.includes(profile.reason)) return false;

  if (routing.productRules?.length) {
    const mode = routing.productMatch ?? "any";
    const matched = mode === "all"
      ? routing.productRules.every((rule) => matchesProductRule(profile, rule))
      : routing.productRules.some((rule) => matchesProductRule(profile, rule));
    if (!matched) return false;
  }

  if (routing.reportingRules?.length) {
    const mode = routing.reportingMatch ?? "any";
    const matched = mode === "all"
      ? routing.reportingRules.every((rule) => matchesReportingRule(profile, reportingInsight, rule))
      : routing.reportingRules.some((rule) => matchesReportingRule(profile, reportingInsight, rule));
    if (!matched) return false;
  }

  if (routing.integrationRules?.length) {
    const mode = routing.integrationMatch ?? "any";
    const matched = mode === "all"
      ? routing.integrationRules.every((rule) => matchesIntegrationRule(profile, rule))
      : routing.integrationRules.some((rule) => matchesIntegrationRule(profile, rule));
    if (!matched) return false;
  }

  return true;
}

function getTriggeredAdvice(scores: Scores, areas: GrowthArea[]): AdviceRule[] {
  const visibleScoreCapabilityIds = new Set(
    areas.flatMap((area) =>
      area.capabilities
        .filter((capability) => (capability.mode ?? "score") === "score")
        .map((capability) => capability.id)
    )
  );

  return ADVICE_RULES.filter((rule) => {
    if (!visibleScoreCapabilityIds.has(rule.capabilityId)) return false;
    const capability = scores.byCapability[rule.capabilityId];
    if (!capability || capability.count === 0) return false;
    return capability.score <= rule.maxScore;
  }).sort((a, b) => a.priority - b.priority);
}

function getAnswerLabel(value: string) {
  if (value === "ja") return "Ja";
  if (value === "deels") return "Deels";
  if (value === "nee") return "Nee";
  if (value === "onbekend") return "Onbekend";
  return "Niet ingevuld";
}

function getOpportunityStatus(answer: string): OpportunityItem["status"] {
  if (answer === "ja") return "kansrijk";
  if (answer === "deels") return "verkennen";
  if (answer === "nee") return "niet_passend";
  return "onbepaald";
}

function buildOpportunityWhyShown(profile: CustomerProfile, question: Question) {
  const reasons: string[] = [];
  const productRules = question.routing?.productRules ?? [];

  productRules.forEach((rule) => {
    const item = getSuccesmeterItem(profile, rule.product);
    if (!item) return;

    if (rule.when === "not_in_use" && item.inUse === false) {
      reasons.push(`${item.product} is nu nog niet in gebruik.`);
    }
    if (rule.when === "future_relevant" && item.relevantForFuture === true) {
      reasons.push(`${item.product} is als mogelijk toekomstig relevant gemarkeerd.`);
    }
    if (rule.minBenchmark != null && typeof item.benchmarkPct === "number" && item.benchmarkPct >= rule.minBenchmark) {
      reasons.push(`${item.product} heeft een relatief hoge branchebenchmark (${item.benchmarkPct}%).`);
    }
  });

  return Array.from(new Set(reasons));
}

function buildOpportunityOverview(
  profile: CustomerProfile,
  answers: Record<string, AnswerValue>,
  diagnosisNotes: Record<string, string>,
  areas: GrowthArea[],
  scope: string,
  reportingInsight: ReportingInsight
): OpportunityItem[] {
  const items: OpportunityItem[] = [];

  areas.forEach((area) => {
    area.capabilities
      .filter((capability) => (capability.mode ?? "score") === "opportunity")
      .forEach((capability) => {
        const visibleQuestions = capability.questions.filter((question) => shouldShowQuestion(question, profile, scope, reportingInsight));
        if (!visibleQuestions.length) return;

        const firstQuestion = visibleQuestions[0];
        const answer = String(answers[firstQuestion.id] ?? "");
        const noteKey = firstQuestion.signalQuestionId ?? `${firstQuestion.id}_note`;
        const note = (diagnosisNotes[noteKey] ?? "").trim();
        const routedProduct = firstQuestion.routing?.productRules?.[0]?.product;
        const succesmeterItem = routedProduct ? getSuccesmeterItem(profile, routedProduct) : undefined;

        items.push({
          capabilityId: capability.id,
          capabilityLabel: capability.label,
          areaId: area.id,
          areaLabel: area.label,
          areaIcon: area.icon,
          title: firstQuestion.label,
          productKey: routedProduct,
          productLabel: routedProduct ? succesmeterItem?.product ?? getProductLabel(routedProduct) : undefined,
          benchmarkPct: succesmeterItem?.benchmarkPct ?? null,
          answer,
          answerLabel: getAnswerLabel(answer),
          note,
          status: getOpportunityStatus(answer),
          whyShown: buildOpportunityWhyShown(profile, firstQuestion),
        });
      });
  });

  return items;
}

function getScoreInterpretation(score: number) {
  if (score < 1.5) return { label: "Niet of nauwelijks aanwezig", tone: "danger", description: "De basis ontbreekt grotendeels." };
  if (score < 3) return { label: "Ad hoc en persoonsafhankelijk", tone: "warning", description: "Veel hangt af van ervaring en losse afspraken." };
  if (score < 4.5) return { label: "Basis aanwezig", tone: "neutral", description: "De basis is herkenbaar, maar borging vraagt aandacht." };
  if (score < 6) return { label: "Beheerst en gestuurd", tone: "success", description: "De organisatie werkt gestructureerd." };
  return { label: "Optimaliserend", tone: "success", description: "De organisatie kan voorspelbaar verbeteren." };
}

function filterAreasByScope(areas: GrowthArea[], scope: string): GrowthArea[] {
  const map: Record<string, string[]> = {
    volledige_scan: areas.map((area) => area.id),
    quickscan: ["organisatie", "processen", "afas", "data"],
    afas_optimalisatie: ["afas", "processen", "beheer", "adoptie"],
    finance_scan: ["processen", "afas", "data", "beheer"],
    data_rapportage: ["data", "organisatie", "processen"],
    integraties: ["integraties", "processen", "beheer", "data"],
    governance: ["organisatie", "beheer", "adoptie", "data"],
  };
  const ids = map[scope] ?? map.volledige_scan;
  return areas.filter((area) => ids.includes(area.id));
}

function labelOf(options: Option[], value: string) {
  return options.find((option) => option.value === value)?.label ?? "Niet ingevuld";
}

function getReportingOption(value: string) {
  return REPORTING_OPTIONS.find((option) => option.value === value);
}

function getReportingLabel(level: number | null): ReportingMaturityLabel {
  if (level == null) return "Nog niet bepaald";
  if (level <= 2) return "Basis / handmatig";
  if (level === 3) return "Systeemgedreven";
  if (level === 4) return "Visueel gestuurd";
  if (level === 5) return "Geautomatiseerd / actueel";
  return "Geavanceerd / voorspellend";
}

function getReportingOptionsForSelectedModes(modes: ReportingModeValue[]): Option[] {
  return REPORTING_OPTIONS.filter((option) => modes.includes(option.value as ReportingModeValue));
}

function deriveReportingInsight(profile: CustomerProfile): ReportingInsight {
  const selectedOptions = profile.reportingModes.map((mode) => getReportingOption(mode)).filter((option): option is Option => Boolean(option));
  const primaryOption = profile.reportingPrimaryMode ? getReportingOption(profile.reportingPrimaryMode) : undefined;
  const fallbackOption = [...selectedOptions].sort((a, b) => (b.maturityLevel ?? 0) - (a.maturityLevel ?? 0))[0] ?? undefined;
  const referenceOption = primaryOption ?? fallbackOption;
  const indicativeLevel = referenceOption?.maturityLevel ?? null;

  return {
    indicativeLevel,
    indicativeLabel: getReportingLabel(indicativeLevel),
    source: primaryOption ? "primary" : fallbackOption ? "fallback" : "none",
    selectedLabels: selectedOptions.map((option) => option.label),
    primaryLabel: primaryOption?.label ?? "Nog niet bepaald",
    signals: {
      manualDependency: profile.reportingModes.includes("handmatige_exports") || profile.reportingModes.includes("statische_excel"),
      dashboardDriven: profile.reportingModes.includes("interactieve_dashboards"),
      automatedDistribution: profile.reportingModes.includes("push_rapportages"),
      realtimeOrAdvanced: profile.reportingModes.includes("real_time_data") || profile.reportingModes.includes("advanced_analytics"),
      fragmentedLandscape: profile.reportingModes.length >= 3,
    },
  };
}

function getPriorityLabel(priority: number) {
  if (priority === 1) return "Zeer hoog";
  if (priority === 2) return "Hoog";
  if (priority === 3) return "Middel";
  return "Lager";
}

function toNaturalList(items: string[]) {
  const cleaned = items.map((item) => item.trim()).filter(Boolean);
  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} en ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(", ")} en ${cleaned[cleaned.length - 1]}`;
}

function normalizeSummaryLabel(text: string) {
  return text.replace(/\.$/, "").trim();
}

function buildManagementDirection(
  profile: CustomerProfile,
  reportingInsight: ReportingInsight,
  scores: Scores,
  advice: AdviceRule[]
): ManagementDirection {
  const topAdvice = advice.slice(0, 4);
  const dataAdviceCount = topAdvice.filter((item) => item.areaId === "data").length;
  const afasProcessAdviceCount = topAdvice.filter((item) => item.areaId === "afas" || item.areaId === "processen").length;
  const criticalStabilityCapabilities = new Set([
    "integraties_betrouwbaarheid",
    "integraties_webshop_portaal",
    "integraties_scan_factuur",
    "integraties_maatwerk",
    "beheer_test_release",
    "afas_financieel_gebruik",
    "afas_ordermanagement_gebruik",
    "afas_payroll_gebruik",
  ]);
  const hasCriticalStabilityAdvice = topAdvice.some((item) => criticalStabilityCapabilities.has(item.capabilityId));

  const dataScore = scores.byArea["data"]?.score ?? 0;
  const processScore = scores.byArea["processen"]?.score ?? 0;
  const afasScore = scores.byArea["afas"]?.score ?? 0;

  if (scores.overall < 2.2 || hasCriticalStabilityAdvice) {
    return {
      key: "stabiliseren",
      label: "Eerst stabiliseren",
      sentence:
        `${profile.customerName || "De organisatie"} heeft op dit moment vooral baat bij eerst stabiliseren: de basis in processen, keten of beheersing vraagt eerst rust, voorspelbaarheid en duidelijk eigenaarschap voordat verdere optimalisatie zinvol is.`,
    };
  }

  if (dataAdviceCount >= 2 || dataScore < 3 || reportingInsight.signals.manualDependency) {
    return {
      key: "grip_op_data",
      label: "Eerst grip op data",
      sentence:
        `${profile.customerName || "De organisatie"} heeft nu vooral baat bij eerst grip op data: rapportage, definities en betrouwbaarheid van informatie moeten eerst steviger worden voordat sturing echt effectief wordt.`,
    };
  }

  if (afasProcessAdviceCount >= 2 || processScore < 3.2 || afasScore < 3.2) {
    return {
      key: "standaardiseren",
      label: "Eerst standaardiseren",
      sentence:
        `${profile.customerName || "De organisatie"} heeft nu vooral baat bij eerst standaardiseren: de werkwijze, inrichting en procesroute moeten eerst eenduidiger worden gemaakt voordat verdere verdieping of uitbreiding echt waarde oplevert.`,
    };
  }

  return {
    key: "doorontwikkelen",
    label: "Gericht doorontwikkelen",
    sentence:
      `${profile.customerName || "De organisatie"} kan vooral gericht doorontwikkelen: de basis staat voldoende om selectief te verbeteren op de belangrijkste groeikansen en vervolgstappen.`,
  };
}

function buildManagementSummary(
  profile: CustomerProfile,
  reportingInsight: ReportingInsight,
  scores: Scores,
  advice: AdviceRule[],
  opportunities: OpportunityItem[],
  progressHeadline: ProgressHeadline,
  progressNarrative: ProgressNarrative
) {
  const customerName = profile.customerName || "De organisatie";
  const overallLabel = normalizeSummaryLabel(getScoreInterpretation(scores.overall).label).toLowerCase();
  const direction = buildManagementDirection(profile, reportingInsight, scores, advice);

  const topAdvice = advice.slice(0, 2);
  const topOpportunities = opportunities.filter((item) => item.status === "kansrijk" || item.status === "verkennen").slice(0, 2);
  const topAdviceTitles = topAdvice.map((item) => item.title);
  const topOpportunityTitles = topOpportunities.map((item) => (item.productLabel ? `${item.productLabel}` : item.capabilityLabel));

  const customerSentence = `${customerName} heeft op basis van de gezamenlijke sessie een eerste integraal beeld gekregen van de huidige inrichting, werkwijze en ontwikkelrichting.`;
  const maturitySentence = `Het algemene volwassenheidsbeeld is indicatief ${overallLabel}, met een rapportagebeeld dat past bij ${reportingInsight.indicativeLabel.toLowerCase()}.`;
  const progressSentence = progressHeadline.sentence;
  const progressNarrativeSentence = progressNarrative.sentence;
  const adviceSentence = topAdviceTitles.length > 0
    ? `De belangrijkste aandachtspunten liggen nu bij ${toNaturalList(topAdviceTitles)}.`
    : "Op dit moment zijn nog geen duidelijke hoofdadviezen geactiveerd.";
  const opportunitySentence = topOpportunityTitles.length > 0
    ? `Opvallende kansen voor verdere verkenning liggen bij ${toNaturalList(topOpportunityTitles)}.`
    : "Er zijn op dit moment nog geen uitgesproken groeikansen gemarkeerd.";
  const directionSummarySentence = `De meest logische hoofdroute voor de komende periode is: ${direction.label.toLowerCase()}.`;

  return {
    customerSentence,
    maturitySentence,
    progressSentence,
    progressNarrativeSentence,
    adviceSentence,
    opportunitySentence,
    directionSummarySentence,
    direction,
    topAdvice,
    topOpportunities,
    reportingLabel: reportingInsight.indicativeLabel,
  };
}

function buildSignalOverview(diagnosisQuestions: Question[], diagnosisNotes: Record<string, string>) {
  return diagnosisQuestions
    .map((question) => {
      const noteKey = question.signalQuestionId ?? `${question.id}_note`;
      const text = (diagnosisNotes[noteKey] ?? "").trim();
      if (!text) return null;
      return {
        id: noteKey,
        areaLabel: question.areaLabel ?? "",
        capabilityLabel: question.capabilityLabel ?? "",
        label: question.signalLabel ?? "Toelichting",
        text,
      };
    })
    .filter((item): item is { id: string; areaLabel: string; capabilityLabel: string; label: string; text: string } => Boolean(item));
}

function buildAdviceEvidenceMap(
  diagnosisQuestions: Question[],
  answers: Record<string, AnswerValue>,
  diagnosisNotes: Record<string, string>
) {
  const map: Record<string, AdviceEvidenceItem[]> = {};

  diagnosisQuestions.forEach((question) => {
    const capabilityId = question.capabilityId;
    if (!capabilityId) return;

    const answer = String(answers[question.id] ?? "");
    const noteKey = question.signalQuestionId ?? `${question.id}_note`;
    const note = (diagnosisNotes[noteKey] ?? "").trim();
    const hasUsefulAnswer = ["ja", "deels", "nee", "onbekend"].includes(answer);
    if (!hasUsefulAnswer && !note) return;

    const evidence: AdviceEvidenceItem = {
      questionId: question.id,
      capabilityId,
      capabilityLabel: question.capabilityLabel ?? "",
      areaLabel: question.areaLabel ?? "",
      answer,
      answerLabel: getAnswerLabel(answer),
      note,
    };

    if (!map[capabilityId]) map[capabilityId] = [];
    map[capabilityId].push(evidence);
  });

  return map;
}

function buildAreaProgressInterpretation(item: { areaLabel: string; movement: AreaProgressItem["movement"]; delta: number | null }) {
  if (item.movement === "verbeterd") {
    return {
      interpretation: `${item.areaLabel} laat een positieve beweging zien ten opzichte van het vorige meetmoment.`,
      conversationHint: "Bespreek met de klant wat hier bewust beter is ingericht of geborgd, zodat deze vooruitgang vastgehouden kan worden.",
    };
  }
  if (item.movement === "teruggelopen") {
    return {
      interpretation: `${item.areaLabel} laat een zwakker beeld zien dan bij het vorige meetmoment.`,
      conversationHint: "Verken samen of dit komt door groei, nieuwe complexiteit, veranderde verwachtingen of onvoldoende borging in de praktijk.",
    };
  }
  if (item.movement === "gelijk") {
    return {
      interpretation: `${item.areaLabel} is ten opzichte van het vorige meetmoment vrijwel gelijk gebleven.`,
      conversationHint: "Bespreek of deze stabiliteit passend is, of dat er nog steeds een verbeterbehoefte ligt zonder zichtbare beweging.",
    };
  }
  return {
    interpretation: `Voor ${item.areaLabel} is nog geen eerdere meting beschikbaar voor een echte vergelijking.`,
    conversationHint: "Gebruik dit groeigebied als nulbeeld voor een volgend meetmoment.",
  };
}

function buildAreaProgressOverview(
  areas: GrowthArea[],
  previous: AssessmentSnapshot | undefined,
  current: AssessmentSnapshot
): AreaProgressItem[] {
  return areas
    .filter((area) => area.capabilities.some((capability) => (capability.mode ?? "score") === "score"))
    .map((area) => {
      const currentScore = current.scores.byArea[area.id]?.score ?? 0;
      const previousScore = previous?.scores.byArea?.[area.id]?.count ? previous.scores.byArea[area.id].score : null;
      const delta = previousScore == null ? null : Math.round((currentScore - previousScore) * 10) / 10;

      let movement: AreaProgressItem["movement"] = "nieuw";
      if (delta == null) movement = "nieuw";
      else if (delta > 0.3) movement = "verbeterd";
      else if (delta < -0.3) movement = "teruggelopen";
      else movement = "gelijk";

      const narrative = buildAreaProgressInterpretation({ areaLabel: area.label, movement, delta });

      return {
        areaId: area.id,
        areaLabel: area.label,
        areaIcon: area.icon,
        previousScore,
        currentScore,
        delta,
        movement,
        interpretation: narrative.interpretation,
        conversationHint: narrative.conversationHint,
      };
    })
    .sort((a, b) => {
      const weight = { teruggelopen: 0, gelijk: 1, verbeterd: 2, nieuw: 3 };
      return weight[a.movement] - weight[b.movement];
    });
}

function buildProgressSummary(previous: AssessmentSnapshot | undefined, current: AssessmentSnapshot) {
  if (!previous) {
    return {
      hasComparison: false,
      text: "Er is nog geen eerder meetmoment beschikbaar voor vergelijking.",
      scoreDelta: null as number | null,
    };
  }

  const delta = current.overallScore - previous.overallScore;
  const roundedDelta = Math.round(delta * 10) / 10;
  let movement = "vrijwel gelijk gebleven";
  if (roundedDelta > 0.3) movement = "verbeterd";
  if (roundedDelta < -0.3) movement = "teruggelopen";

  return {
    hasComparison: true,
    text: `Ten opzichte van het vorige meetmoment (${formatDutchDate(previous.createdAt)}) is het algemene beeld ${movement} (${roundedDelta >= 0 ? "+" : ""}${roundedDelta}).`,
    scoreDelta: roundedDelta,
  };
}

function areaLabels(items: AreaProgressItem[]) {
  return items.map((item) => item.areaLabel);
}

function buildProgressHeadline(areaProgress: AreaProgressItem[]): ProgressHeadline {
  const improved = areaProgress.filter((item) => item.movement === "verbeterd");
  const declined = areaProgress.filter((item) => item.movement === "teruggelopen");
  const stable = areaProgress.filter((item) => item.movement === "gelijk");
  const improvedLabels = areaLabels(improved);
  const declinedLabels = areaLabels(declined);
  const stableLabels = areaLabels(stable);
  const base = {
    improvedAreas: improvedLabels,
    declinedAreas: declinedLabels,
    stableAreas: stableLabels,
    improvedCount: improvedLabels.length,
    declinedCount: declinedLabels.length,
    stableCount: stableLabels.length,
  };

  if (!areaProgress.some((item) => item.movement !== "nieuw")) {
    return {
      hasComparison: false,
      sentence: "Er is nog geen eerdere meting beschikbaar om voortgang tussen groeigebieden te duiden.",
      ...base,
    };
  }

  if (improvedLabels.length > 0 && declinedLabels.length > 0) {
    return {
      hasComparison: true,
      sentence: `Terugval op ${toNaturalList(declinedLabels)}, maar ook vooruitgang op ${toNaturalList(improvedLabels)}.`,
      ...base,
    };
  }
  if (improvedLabels.length > 0 && stableLabels.length > 0) {
    return {
      hasComparison: true,
      sentence: `Vooral vooruitgang op ${toNaturalList(improvedLabels)}, met stabiliteit op ${toNaturalList(stableLabels)}.`,
      ...base,
    };
  }
  if (declinedLabels.length > 0 && stableLabels.length > 0) {
    return {
      hasComparison: true,
      sentence: `Stabiliteit op ${toNaturalList(stableLabels)}, maar terugval op ${toNaturalList(declinedLabels)}.`,
      ...base,
    };
  }
  if (improvedLabels.length > 0) {
    return { hasComparison: true, sentence: `Vooral vooruitgang op ${toNaturalList(improvedLabels)}.`, ...base };
  }
  if (declinedLabels.length > 0) {
    return { hasComparison: true, sentence: `De grootste terugval zit op ${toNaturalList(declinedLabels)}.`, ...base };
  }
  return {
    hasComparison: true,
    sentence: `Het beeld is vooral stabiel gebleven, met name op ${toNaturalList(stableLabels)}.`,
    ...base,
  };
}

function buildProgressHighlights(areaProgress: AreaProgressItem[]): ProgressHighlights {
  const comparable = areaProgress.filter((item) => item.delta != null);
  if (!comparable.length) return { hasComparison: false };

  const improvements = comparable.filter((item) => item.delta != null && item.delta > 0.3).sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0));
  const declines = comparable.filter((item) => item.delta != null && item.delta < -0.3).sort((a, b) => (a.delta ?? 0) - (b.delta ?? 0));

  const biggestImprovement = improvements[0]
    ? {
        type: "improvement" as const,
        areaId: improvements[0].areaId,
        areaLabel: improvements[0].areaLabel,
        areaIcon: improvements[0].areaIcon,
        delta: improvements[0].delta ?? 0,
        text: `Grootste verbetering op ${improvements[0].areaLabel} (${(improvements[0].delta ?? 0) >= 0 ? "+" : ""}${(improvements[0].delta ?? 0).toFixed(1)}).`,
      }
    : undefined;
  const biggestDecline = declines[0]
    ? {
        type: "decline" as const,
        areaId: declines[0].areaId,
        areaLabel: declines[0].areaLabel,
        areaIcon: declines[0].areaIcon,
        delta: declines[0].delta ?? 0,
        text: `Grootste terugval op ${declines[0].areaLabel} (${(declines[0].delta ?? 0).toFixed(1)}).`,
      }
    : undefined;

  return { hasComparison: true, biggestImprovement, biggestDecline };
}

function toShortAreaLabel(label: string) {
  const map: Record<string, string> = {
    "Data & rapportage": "rapportage",
    "Integraties & keten": "integraties",
    "Organisatie & eigenaarschap": "organisatie",
    "Processen & werkwijze": "processen",
    "AFAS-inrichting & gebruik": "AFAS-gebruik",
    "Beheer & doorontwikkeling": "beheer",
    "Adoptie & veranderkracht": "adoptie",
  };
  return map[label] ?? label.toLowerCase();
}

function buildProgressNarrative(areaProgress: AreaProgressItem[], progressHighlights: ProgressHighlights): ProgressNarrative {
  const comparable = areaProgress.filter((item) => item.movement !== "nieuw");
  const improved = areaProgress.filter((item) => item.movement === "verbeterd");
  const declined = areaProgress.filter((item) => item.movement === "teruggelopen");
  const stable = areaProgress.filter((item) => item.movement === "gelijk");

  if (!comparable.length) {
    return { sentence: "Er is nog geen eerdere meting beschikbaar voor een voortgangsbeeld.", tone: "neutral" };
  }

  const bestImprovement = progressHighlights.biggestImprovement ? toShortAreaLabel(progressHighlights.biggestImprovement.areaLabel) : "";
  const bestDecline = progressHighlights.biggestDecline ? toShortAreaLabel(progressHighlights.biggestDecline.areaLabel) : "";

  if (bestImprovement && bestDecline) {
    return { sentence: `Vooral winst op ${bestImprovement}, maar aandacht nodig op ${bestDecline}.`, tone: "warning" };
  }
  if (bestDecline && stable.length >= 2) {
    return { sentence: `Breed stabiel beeld, maar aandacht nodig op ${bestDecline}.`, tone: "warning" };
  }
  if (bestImprovement && stable.length >= 2) {
    return { sentence: `Breed stabiel beeld, met vooral winst op ${bestImprovement}.`, tone: "success" };
  }
  if (improved.length >= 2 && declined.length === 0) {
    return { sentence: `Positieve beweging zichtbaar, vooral op ${toNaturalList(improved.map((item) => toShortAreaLabel(item.areaLabel)))}.`, tone: "success" };
  }
  if (declined.length >= 2 && improved.length === 0) {
    return { sentence: `Meerdere gebieden vragen extra aandacht, vooral ${toNaturalList(declined.map((item) => toShortAreaLabel(item.areaLabel)))}.`, tone: "danger" };
  }
  if (stable.length >= 3 && improved.length === 0 && declined.length === 0) {
    return { sentence: "Breed stabiel beeld, zonder grote uitschieters.", tone: "neutral" };
  }
  if (bestImprovement) return { sentence: `Vooral winst zichtbaar op ${bestImprovement}.`, tone: "success" };
  if (bestDecline) return { sentence: `Vooral aandacht nodig op ${bestDecline}.`, tone: "danger" };
  return { sentence: "Het voortgangsbeeld is overwegend stabiel.", tone: "neutral" };
}

function mapAreaMovementStatus(movement: AreaProgressItem["movement"]) {
  if (movement === "verbeterd") return "success";
  if (movement === "teruggelopen") return "danger";
  if (movement === "gelijk") return "warning";
  return "onbepaald";
}

function getAreaMovementVisual(movement: AreaProgressItem["movement"]) {
  if (movement === "verbeterd") return { icon: "↑", label: "Verbeterd", tone: "success" as const };
  if (movement === "teruggelopen") return { icon: "↓", label: "Teruggelopen", tone: "danger" as const };
  if (movement === "gelijk") return { icon: "→", label: "Stabiel", tone: "warning" as const };
  return { icon: "•", label: "Nieuw", tone: "neutral" as const };
}

function getAreaMovementSubtitle(movement: AreaProgressItem["movement"]) {
  if (movement === "verbeterd") return "Duidelijke verbetering";
  if (movement === "teruggelopen") return "Aandacht nodig";
  if (movement === "gelijk") return "Stabiel beeld";
  return "Eerste meetmoment";
}

function buildAreaKeySignals(diagnosisQuestions: Question[], diagnosisNotes: Record<string, string>): Record<string, AreaKeySignal> {
  const result: Record<string, AreaKeySignal> = {};
  diagnosisQuestions.forEach((question) => {
    const areaId = question.areaId;
    const areaLabel = question.areaLabel;
    if (!areaId || !areaLabel) return;
    const noteKey = question.signalQuestionId ?? `${question.id}_note`;
    const note = (diagnosisNotes[noteKey] ?? "").trim();
    if (!note) return;
    if (!result[areaId]) {
      result[areaId] = {
        areaId,
        areaLabel,
        note,
        sourceLabel: question.capabilityLabel ?? question.label,
      };
    }
  });
  return result;
}

function mapEvidenceStatus(answer: string) {
  if (answer === "nee") return "danger";
  if (answer === "deels") return "warning";
  if (answer === "ja") return "success";
  return "onbepaald";
}

function formatDutchDate(dateIso: string) {
  const date = new Date(dateIso);
  return new Intl.DateTimeFormat("nl-NL", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function buildReportSubtitle(profile: CustomerProfile, scope: string) {
  const customer = profile.customerName || "Onbekende klant";
  const scopeLabel = labelOf(SCOPE_OPTIONS, scope);
  const dateLabel = formatDutchDate(new Date().toISOString());
  return `${customer} · ${dateLabel} · Scope: ${scopeLabel}`;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildReportFileName(profile: CustomerProfile, direction: ManagementDirection) {
  const customer = profile.customerName ? slugify(profile.customerName) : "klant";
  const directionSlug = slugify(direction.label);
  const date = new Date().toISOString().slice(0, 10);
  return `kweekers-groeimodel-${customer}-${directionSlug}-${date}`;
}

function handlePrintReport(reportFileName: string) {
  const previousTitle = document.title;
  document.title = reportFileName;
  window.print();
  window.setTimeout(() => {
    document.title = previousTitle;
  }, 500);
}

function createAssessmentId() {
  return `assessment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadAssessments(): AssessmentSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ASSESSMENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAssessmentsToStorage(items: AssessmentSnapshot[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(items));
}

function buildAssessmentSnapshot(params: {
  profile: CustomerProfile;
  scope: string;
  reportingInsight: ReportingInsight;
  scores: Scores;
  answers: Record<string, AnswerValue>;
  diagnosisNotes: Record<string, string>;
  advice: AdviceRule[];
  opportunities: OpportunityItem[];
  summary: ReturnType<typeof buildManagementSummary>;
}): AssessmentSnapshot {
  return {
    id: createAssessmentId(),
    createdAt: new Date().toISOString(),
    customerName: params.profile.customerName || "Onbekende klant",
    scope: params.scope,
    directionKey: params.summary.direction.key,
    directionLabel: params.summary.direction.label,
    overallScore: params.scores.overall,
    profile: params.profile,
    reportingInsight: params.reportingInsight,
    scores: params.scores,
    answers: params.answers,
    diagnosisNotes: params.diagnosisNotes,
    advice: params.advice,
    opportunities: params.opportunities,
    summary: params.summary,
  };
}

function getCustomerAssessments(assessments: AssessmentSnapshot[], customerName: string) {
  const normalized = customerName.trim().toLowerCase();
  return assessments
    .filter((item) => item.customerName.trim().toLowerCase() === normalized)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function getProductLabel(productKey: ProductKey) {
  return getMockSuccesmeterItems().find((entry) => entry.productKey === productKey)?.product ?? productKey;
}

function getMockSuccesmeterItems(): SuccesmeterItem[] {
  return [
    { id: "ss_001", productKey: "verlof_verzuim", domain: "HRM/Payroll", product: "Verlof en verzuim", inUse: true, benchmarkPct: 64, confirmed: false, relevantForFuture: null },
    { id: "ss_002", productKey: "payroll", domain: "HRM/Payroll", product: "Payroll", inUse: true, benchmarkPct: 39, confirmed: false, relevantForFuture: null },
    { id: "ss_003", productKey: "financieel", domain: "ERP", product: "Financieel", inUse: true, benchmarkPct: 70, confirmed: false, relevantForFuture: null },
    { id: "ss_004", productKey: "projecten", domain: "ERP", product: "Projecten", inUse: true, benchmarkPct: 56, confirmed: false, relevantForFuture: null },
    { id: "ss_005", productKey: "ordermanagement", domain: "ERP", product: "Ordermanagement", inUse: false, benchmarkPct: 16, confirmed: false, relevantForFuture: null },
    { id: "ss_006", productKey: "abonnementen", domain: "ERP", product: "Abonnementen", inUse: true, benchmarkPct: 72, confirmed: false, relevantForFuture: null },
    { id: "ss_007", productKey: "sales_marketing", domain: "ERP", product: "Sales & Marketing", inUse: true, benchmarkPct: 22, confirmed: false, relevantForFuture: null },
    { id: "ss_008", productKey: "employee_self_service", domain: "HRM/Payroll", product: "Employee Self Service", inUse: false, benchmarkPct: 31, confirmed: false, relevantForFuture: null },
  ];
}

function GlobalStyles() {
  return (
    <style>{`
      :root {
        --bg: #f6f8fb;
        --card: #ffffff;
        --ink: #0f172a;
        --text: #334155;
        --muted: #64748b;
        --line: #e2e8f0;
        --soft: #f1f5f9;
        --brand: #0f766e;
        --brand-soft: #ccfbf1;
        --danger: #991b1b;
        --danger-bg: #fee2e2;
        --warning: #92400e;
        --warning-bg: #fef3c7;
        --success: #065f46;
        --success-bg: #d1fae5;
      }

      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { margin: 0; background: var(--bg); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      button, input, textarea, select { font: inherit; }
      button { cursor: pointer; }
      button:disabled { opacity: .45; cursor: not-allowed; }

      .page { min-height: 100vh; padding: 22px; background: radial-gradient(circle at top left, rgba(15,118,110,.12), transparent 38%), var(--bg); }
      .intro-page { display: grid; place-items: center; }
      .intro-card { width: min(860px, 100%); background: white; border: 1px solid var(--line); border-radius: 34px; padding: 48px; box-shadow: 0 25px 70px rgba(15,23,42,.08); }
      .brand-pill { display: inline-flex; background: var(--brand-soft); color: #115e59; padding: 8px 13px; border-radius: 999px; font-size: 13px; font-weight: 800; }
      .intro-card h1 { margin: 22px 0 0; max-width: 720px; font-size: clamp(42px, 6vw, 74px); line-height: .92; letter-spacing: -.06em; }
      .intro-card p { max-width: 720px; margin: 24px 0 0; color: var(--text); font-size: 18px; line-height: 1.7; }
      .intro-points { display: grid; gap: 10px; margin: 28px 0; color: var(--text); }
      .intro-points span:before { content: "✓"; color: var(--brand); font-weight: 900; margin-right: 10px; }

      .app-shell { width: min(1180px, 100%); margin: 0 auto; display: grid; gap: 18px; }
      .topbar { position: sticky; top: 12px; z-index: 10; background: rgba(255,255,255,.88); backdrop-filter: blur(14px); border: 1px solid var(--line); border-radius: 26px; padding: 16px; box-shadow: 0 14px 40px rgba(15,23,42,.06); }
      .topbar-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
      .brand { font-weight: 900; letter-spacing: -.02em; }
      .topbar-sub { color: var(--muted); font-size: 13px; margin-top: 3px; }
      .stepper { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; }
      .step { min-width: 0; border: 1px solid var(--line); background: white; color: var(--muted); border-radius: 16px; padding: 10px; display: flex; align-items: center; gap: 8px; justify-content: center; }
      .step span { width: 24px; height: 24px; display: grid; place-items: center; border-radius: 999px; background: var(--soft); font-size: 12px; font-weight: 900; }
      .step strong { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 13px; }
      .step.active { background: #0f172a; color: white; border-color: #0f172a; }
      .step.active span { background: rgba(255,255,255,.15); }
      .step.done { color: #115e59; border-color: #99f6e4; background: #f0fdfa; }

      .info-panel { background: #0f172a; color: white; border-radius: 24px; padding: 20px 24px; }
      .info-panel p { margin: 8px 0 0; color: rgba(255,255,255,.7); line-height: 1.6; }

      .wizard-wrap { min-height: calc(100vh - 190px); display: grid; place-items: center; padding: 24px 0; }
      .wizard-card { width: min(860px, 100%); background: white; border: 1px solid var(--line); border-radius: 34px; padding: 34px; box-shadow: 0 22px 60px rgba(15,23,42,.07); }
      .wizard-meta { display: flex; align-items: flex-start; gap: 18px; }
      .icon-bubble { flex: 0 0 auto; width: 52px; height: 52px; display: grid; place-items: center; border-radius: 18px; background: #0f172a; color: white; font-size: 24px; }
      .wizard-meta small, .screen-head small { color: var(--brand); font-weight: 900; text-transform: uppercase; letter-spacing: .08em; font-size: 12px; }
      .wizard-meta h1, .screen-head h1 { margin: 8px 0 0; font-size: clamp(28px, 4vw, 46px); line-height: 1.05; letter-spacing: -.045em; }
      .wizard-meta p, .screen-head p { margin: 12px 0 0; color: var(--text); line-height: 1.65; }
      .progress-line { height: 8px; background: var(--soft); border-radius: 999px; margin: 28px 0; overflow: hidden; }
      .progress-line div { height: 100%; background: var(--brand); border-radius: inherit; transition: width .2s ease; }
      .answer-zone { min-height: 240px; display: grid; align-content: center; }
      .diagnosis-context { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 16px; }
      .diagnosis-context span, .diagnosis-context strong, .diagnosis-context em, .diagnosis-context small { display: inline-flex; align-items: center; min-height: 28px; border-radius: 999px; padding: 6px 10px; background: var(--soft); font-size: 12px; font-style: normal; color: var(--text); }
      .diagnosis-context span { font-size: 15px; }

      .choice-row { display: flex; flex-wrap: wrap; gap: 10px; }
      .choice-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .chip, .choice-card { border: 1px solid var(--line); background: white; color: var(--text); font-weight: 800; border-radius: 999px; padding: 12px 18px; }
      .choice-card { min-height: 110px; border-radius: 22px; text-align: left; padding: 18px; display: grid; gap: 8px; }
      .choice-card strong { font-size: 15px; }
      .choice-card span { font-size: 13px; line-height: 1.5; color: var(--muted); }
      .chip:hover, .choice-card:hover, .secondary:hover, .ghost:hover, .multi-card:hover { background: #f8fafc; }
      .chip.active, .choice-card.active, .primary, .multi-card.active { background: #0f172a; color: white; border-color: #0f172a; }
      .choice-card.active span, .multi-card.active span { color: rgba(255,255,255,.72); }
      .text-input, .text-area { width: 100%; border: 1px solid var(--line); border-radius: 22px; padding: 17px 18px; outline: none; color: var(--ink); background: white; }
      .text-area { min-height: 160px; resize: vertical; line-height: 1.6; }
      .text-input:focus, .text-area:focus { border-color: var(--brand); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }

      .summary-stack { display: grid; gap: 12px; }
      .summary-row { display: flex; justify-content: space-between; gap: 20px; padding: 15px 16px; border: 1px solid var(--line); border-radius: 18px; background: #fbfdff; }
      .summary-row span { color: var(--muted); }
      .summary-row strong { text-align: right; }
      .message { border-radius: 20px; padding: 18px; }
      .message p { margin: 8px 0 0; line-height: 1.55; }
      .message.neutral { background: var(--soft); color: var(--text); }
      .message.danger { background: var(--danger-bg); color: var(--danger); }
      .message.warning { background: var(--warning-bg); color: var(--warning); }
      .message.success { background: var(--success-bg); color: var(--success); }

      .wizard-footer, .screen-footer { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--line); }
      .wizard-footer span { color: var(--muted); font-size: 14px; }
      .primary, .secondary, .ghost { min-height: 46px; padding: 0 18px; border-radius: 16px; border: 1px solid #0f172a; font-weight: 900; }
      .secondary, .ghost { background: white; color: var(--ink); border-color: var(--line); }
      .big { min-height: 56px; padding: 0 24px; font-size: 16px; }

      .upload-box { display: grid; gap: 6px; padding: 18px; border: 1px dashed var(--line); border-radius: 22px; background: #fbfdff; }
      .upload-box input { margin-top: 8px; }
      .review-list { display: grid; gap: 12px; }
      .review-row { border: 1px solid var(--line); border-radius: 20px; padding: 16px; background: #fbfdff; }
      .review-main { display: grid; gap: 4px; margin-bottom: 12px; }
      .review-main small { color: var(--muted); font-weight: 700; }
      .review-actions { display: grid; gap: 12px; }
      .toggle-row { display: flex; flex-wrap: wrap; gap: 8px; }
      .inline-field { display: grid; gap: 6px; }
      .small-input { min-height: 42px; padding: 10px 12px; border-radius: 14px; }

      .multi-card-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
      .multi-card { width: 100%; text-align: left; border: 1px solid var(--line); background: white; border-radius: 22px; padding: 16px 18px; display: grid; gap: 6px; }
      .multi-card strong { font-size: 15px; color: var(--ink); }
      .multi-card span { font-size: 13px; line-height: 1.5; color: var(--muted); }

      .signal-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
      .signal-pill { display: inline-flex; align-items: center; min-height: 30px; padding: 6px 10px; border-radius: 999px; background: #e2e8f0; color: var(--text); font-size: 12px; font-weight: 800; }
      .compact-message { padding: 14px 16px; }

      .diagnosis-stack { display: grid; gap: 18px; }
      .examples-box { border: 1px solid var(--line); background: #fbfdff; border-radius: 20px; padding: 16px 18px; }
      .examples-box strong { display: block; margin-bottom: 8px; color: var(--ink); }
      .examples-box ul { margin: 0; padding-left: 18px; display: grid; gap: 6px; color: var(--text); }
      .inline-note-block { display: grid; gap: 8px; }
      .inline-note-label { font-weight: 800; color: var(--ink); }

      .content-screen { background: white; border: 1px solid var(--line); border-radius: 34px; padding: 34px; box-shadow: 0 22px 60px rgba(15,23,42,.07); }
      .report-screen { display: grid; gap: 22px; }
      .screen-head { max-width: 760px; margin-bottom: 28px; }
      .two-column-content { display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr); gap: 18px; }
      .panel { border: 1px solid var(--line); border-radius: 26px; padding: 22px; background: #fbfdff; }
      .panel h2, .panel h3 { margin: 0 0 16px; letter-spacing: -.025em; }

      .report-hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; border-radius: 26px; padding: 24px 26px; margin-bottom: 4px; }
      .report-hero-content { max-width: 860px; }
      .report-hero-content small { display: inline-block; margin-bottom: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; font-size: 12px; }
      .report-hero-content h1 { margin: 0; font-size: clamp(32px, 5vw, 54px); line-height: 1.02; letter-spacing: -.045em; }
      .report-hero-content p { margin: 12px 0 0; line-height: 1.65; max-width: 820px; }
      .report-subtitle { margin-top: 10px; font-size: 14px; font-weight: 700; opacity: .88; }
      .report-file-label { display: inline-block; margin-top: 12px; opacity: .8; text-transform: none !important; letter-spacing: 0 !important; }
      .report-hero-actions { display: flex; flex-direction: column; gap: 10px; flex: 0 0 auto; }
      .report-hero.stabiliseren { background: var(--danger-bg); color: var(--danger); }
      .report-hero.standaardiseren { background: var(--warning-bg); color: var(--warning); }
      .report-hero.grip_op_data { background: #eff6ff; color: #1d4ed8; }
      .report-hero.doorontwikkelen { background: var(--success-bg); color: var(--success); }

      .report-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
      .report-header h2 { margin: 8px 0 0; font-size: clamp(24px, 3.2vw, 36px); line-height: 1.08; letter-spacing: -.035em; }
      .report-section { display: grid; gap: 12px; }
      .report-section h2 { margin: 0; letter-spacing: -.02em; }
      .management-summary-text { display: grid; gap: 10px; margin-bottom: 18px; }
      .management-summary-text p { margin: 0; color: var(--text); line-height: 1.65; }
      .direction-inline-text, .progress-narrative-inline { font-weight: 800; }
      .summary-mini-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 16px 0; }
      .mini-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
      .mini { background: var(--soft); border-radius: 16px; padding: 12px; }
      .mini strong { color: var(--muted); font-size: 12px; }
      .mini p { margin: 6px 0 0; font-size: 13px; }
      .direction-box { border-radius: 18px; padding: 16px 18px; margin-top: 6px; }
      .direction-box strong { display: block; margin-bottom: 8px; }
      .direction-box p { margin: 0; line-height: 1.6; }
      .direction-box.stabiliseren { background: var(--danger-bg); color: var(--danger); }
      .direction-box.standaardiseren { background: var(--warning-bg); color: var(--warning); }
      .direction-box.grip_op_data { background: #eff6ff; color: #1d4ed8; }
      .direction-box.doorontwikkelen { background: var(--success-bg); color: var(--success); }

      .report-list-block { margin-top: 16px; }
      .report-list-block strong { display: block; margin-bottom: 8px; }
      .report-list-block ul { margin: 0; padding-left: 18px; display: grid; gap: 6px; color: var(--text); }

      .progress-headline { margin-top: 14px; border-radius: 18px; padding: 14px 16px; }
      .progress-headline strong { display: block; margin-bottom: 6px; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
      .progress-headline p { margin: 0; line-height: 1.6; }
      .progress-headline.active { background: rgba(255,255,255,.45); }
      .progress-headline.inactive { background: rgba(255,255,255,.22); }
      .progress-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
      .progress-badge { display: inline-flex; align-items: center; min-height: 30px; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 800; }
      .progress-badge.success, .progress-highlight-card.improvement { background: rgba(255,255,255,.72); color: var(--success); }
      .progress-badge.danger, .progress-highlight-card.decline { background: rgba(255,255,255,.72); color: var(--danger); }
      .progress-badge.neutral, .progress-highlight-card.neutral { background: rgba(255,255,255,.72); color: var(--text); }
      .progress-narrative { margin-top: 12px; border-radius: 18px; padding: 14px 16px; background: rgba(255,255,255,.62); }
      .progress-narrative strong { display: block; margin-bottom: 6px; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
      .progress-narrative p { margin: 0; line-height: 1.6; }
      .progress-narrative.success { color: var(--success); }
      .progress-narrative.warning { color: var(--warning); }
      .progress-narrative.danger { color: var(--danger); }
      .progress-narrative.neutral { color: var(--text); }
      .progress-highlight-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
      .progress-highlight-card { border-radius: 18px; padding: 14px 16px; background: rgba(255,255,255,.62); }
      .progress-highlight-card small { display: block; margin-bottom: 6px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .06em; }
      .progress-highlight-card strong { display: block; margin-bottom: 6px; font-size: 15px; }
      .progress-highlight-card p { margin: 0; line-height: 1.55; }

      .score-list, .advice-list, .opportunity-list { display: grid; gap: 13px; }
      .score-row { display: grid; gap: 8px; }
      .score-row > div:first-child { display: flex; justify-content: space-between; gap: 18px; }
      .score-row small { font-weight: 800; }
      .score-row small.danger { color: var(--danger); }
      .score-row small.warning { color: var(--warning); }
      .score-row small.neutral { color: var(--muted); }
      .score-row small.success { color: var(--success); }
      .bar { height: 8px; border-radius: 999px; background: #e5e7eb; overflow: hidden; }
      .bar span { display: block; height: 100%; background: var(--brand); border-radius: inherit; }

      .advice-card, .opportunity-card { border: 1px solid var(--line); background: white; border-radius: 22px; padding: 18px; }
      .advice-title { display: flex; align-items: flex-start; gap: 12px; }
      .advice-title > span { width: 42px; height: 42px; display: grid; place-items: center; background: var(--soft); border-radius: 15px; }
      .advice-title small { display: block; color: var(--muted); margin-bottom: 4px; }
      .advice-card p, .opportunity-card p { color: var(--text); line-height: 1.6; }

      .evidence-block { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--line); }
      .evidence-block > strong { display: block; margin-bottom: 12px; }
      .evidence-list { display: grid; gap: 10px; }
      .evidence-item { border: 1px solid var(--line); border-radius: 16px; padding: 12px 14px; background: #fbfdff; }
      .evidence-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
      .evidence-capability { display: inline-flex; align-items: center; min-height: 30px; padding: 6px 10px; border-radius: 999px; background: var(--soft); color: var(--text); font-size: 12px; font-weight: 800; }
      .small-empty { padding: 12px 14px; font-size: 13px; }
      .muted-text, .muted-paragraph { color: var(--muted); }

      .opportunity-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
      .status-pill, .benchmark-pill { display: inline-flex; align-items: center; min-height: 30px; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 800; }
      .status-pill.kansrijk, .status-pill.success { background: var(--success-bg); color: var(--success); }
      .status-pill.verkennen, .status-pill.warning { background: var(--warning-bg); color: var(--warning); }
      .status-pill.niet_passend { background: #e2e8f0; color: var(--text); }
      .status-pill.onbepaald, .status-pill.neutral { background: var(--soft); color: var(--muted); }
      .status-pill.danger { background: var(--danger-bg); color: var(--danger); }
      .benchmark-pill { background: #eff6ff; color: #1d4ed8; }
      .opportunity-reason-list { display: grid; gap: 8px; margin-top: 10px; }
      .opportunity-reason-item { border: 1px solid var(--line); border-radius: 14px; padding: 10px 12px; background: #fbfdff; color: var(--text); font-size: 13px; line-height: 1.5; }
      .opportunity-session-block { margin-top: 14px; }
      .opportunity-session-block > strong { display: block; margin-bottom: 8px; }

      .signal-report-list { display: grid; gap: 12px; }
      .signal-report-item { border: 1px solid var(--line); border-radius: 18px; padding: 14px 16px; background: #fbfdff; }
      .signal-report-item small { display: block; margin-top: 4px; color: var(--muted); font-weight: 700; }
      .signal-report-item p { margin: 8px 0 0; color: var(--text); line-height: 1.6; }

      .history-list { display: grid; gap: 10px; }
      .history-item { border: 1px solid var(--line); border-radius: 16px; padding: 12px 14px; background: #fbfdff; display: grid; gap: 4px; }
      .history-item small { color: var(--muted); font-weight: 700; }
      .history-item span { color: var(--text); font-size: 13px; }

      .area-progress-list { display: grid; gap: 12px; }
      .area-progress-item { border: 1px solid var(--line); border-radius: 18px; padding: 14px 16px; background: #fbfdff; }
      .area-progress-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
      .area-progress-title { display: flex; align-items: center; gap: 10px; }
      .area-progress-title > span { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 12px; background: var(--soft); }
      .area-progress-title > div { display: grid; gap: 2px; }
      .area-progress-subtitle { color: var(--muted); font-size: 12px; font-weight: 700; }
      .area-progress-status-group { display: flex; align-items: center; gap: 8px; }
      .area-movement-arrow { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 999px; font-size: 16px; font-weight: 900; background: var(--soft); }
      .area-movement-arrow.success { background: var(--success-bg); color: var(--success); }
      .area-movement-arrow.danger { background: var(--danger-bg); color: var(--danger); }
      .area-movement-arrow.warning { background: var(--warning-bg); color: var(--warning); }
      .area-movement-arrow.neutral { background: var(--soft); color: var(--muted); }
      .area-progress-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }
      .compare-bar { margin-top: 4px; }
      .delta-text.success { color: var(--success); }
      .delta-text.danger { color: var(--danger); }
      .delta-text.warning { color: var(--warning); }
      .delta-text.neutral { color: var(--muted); }
      .area-progress-interpretation { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line); }
      .area-progress-interpretation strong { display: block; margin-bottom: 6px; }
      .area-progress-interpretation p { margin: 0; color: var(--text); line-height: 1.6; }
      .area-progress-interpretation small { display: block; margin-top: 8px; color: var(--muted); line-height: 1.5; }
      .area-key-signal { margin-top: 12px; padding: 12px 14px; border: 1px solid var(--line); border-radius: 14px; background: #ffffff; }
      .area-key-signal strong { display: block; margin-bottom: 6px; }
      .area-key-signal p { margin: 0; color: var(--text); line-height: 1.6; }
      .area-key-signal small { display: block; margin-top: 8px; color: var(--muted); }

      .empty { border: 1px dashed #cbd5e1; border-radius: 18px; padding: 22px; color: var(--muted); text-align: center; }

      @media (max-width: 980px) {
        .page { padding: 12px; }
        .stepper { display: flex; overflow-x: auto; padding-bottom: 3px; }
        .step { flex: 0 0 auto; min-width: 132px; }
        .two-column-content, .progress-highlight-grid, .summary-mini-grid, .mini-grid, .choice-grid { grid-template-columns: 1fr; }
        .wizard-card, .content-screen, .intro-card { border-radius: 26px; padding: 24px; }
      }

      @media (max-width: 640px) {
        .topbar-head, .wizard-meta, .wizard-footer, .screen-footer, .summary-row, .report-hero, .report-header, .area-progress-head { flex-direction: column; align-items: stretch; }
        .primary, .secondary, .ghost { width: 100%; }
        .wizard-footer span { text-align: center; }
        .report-hero-actions { width: 100%; }
        .report-hero-actions .secondary { width: 100%; }
        .area-progress-metrics { grid-template-columns: 1fr; }
      }

      @media print {
        .topbar, .info-panel, .screen-footer, .report-hero-actions, .wizard-footer, .ghost { display: none !important; }
        .page { background: white; padding: 0; }
        .app-shell { width: 100%; margin: 0; }
        .content-screen, .panel, .advice-card, .opportunity-card, .signal-report-item { box-shadow: none !important; }
        .content-screen { border: none; border-radius: 0; padding: 0; }
        .report-hero { border: 1px solid #cbd5e1; padding: 18px 20px; }
        .report-section, .panel, .advice-card, .opportunity-card, .signal-report-item, .mini { break-inside: avoid; }
        .summary-mini-grid, .two-column-content { grid-template-columns: 1fr 1fr; }
      }
    `}</style>
  );
}
