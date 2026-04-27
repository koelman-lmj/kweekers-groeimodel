"use client";

import React, { useMemo, useState } from "react";

/**
 * Kweekers Groeimodel - rustige wizard-opbouw
 * --------------------------------------------------
 * Plak dit volledige bestand in: app/page.tsx
 *
 * Geen externe dependencies.
 * Geen shadcn/ui, geen lucide-react, geen framer-motion.
 *
 * UX-principe:
 * - Intro één keer tonen.
 * - Daarna compacte stappenbalk bovenin.
 * - Eén taak / vraag tegelijk.
 * - Per hoofdonderdeel eindigen met overzicht.
 * - Diagnose werkt als begeleide wizard, niet als lange vragenlijst.
 */

type StepId = "startcheck" | "profiel" | "scope" | "diagnose" | "duiding" | "roadmap" | "export";
type QuestionType = "choice" | "multi" | "scale" | "open" | "text" | "summary";

type Option = { value: string; label: string };
type StartCheck = { afasLiveOneYear: string; keyProcessesOperational: string; enoughExperience: string; goal: string };
type CustomerProfile = {
  customerName: string;
  sector: string;
  size: string;
  administrations: string;
  modules: string[];
  integrations: string;
  reporting: string;
  reason: string;
};

type Question = {
  id: string;
  type: QuestionType;
  label: string;
  shortLabel?: string;
  help?: string;
  options?: Option[];
  target?: keyof StartCheck | keyof CustomerProfile;
  areaId?: string;
  areaLabel?: string;
  areaIcon?: string;
  capabilityId?: string;
  capabilityLabel?: string;
  kind?: string;
};

type Capability = { id: string; label: string; description: string; questions: Question[] };
type GrowthArea = { id: string; label: string; icon: string; description: string; capabilities: Capability[] };
type Scores = { overall: number; byArea: Record<string, { score: number; count: number }>; byCapability: Record<string, { score: number; count: number }> };
type StartAdvice = { status: "unknown" | "stabiliseren" | "quickscan" | "groeimodel"; label: string; description: string; scopeHint: string; tone: "neutral" | "danger" | "warning" | "success" };
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

const STEPS: { id: StepId; label: string; icon: string }[] = [
  { id: "startcheck", label: "Startcheck", icon: "✓" },
  { id: "profiel", label: "Klantprofiel", icon: "🏢" },
  { id: "scope", label: "Scope", icon: "🎯" },
  { id: "diagnose", label: "Diagnose", icon: "🔎" },
  { id: "duiding", label: "Advies", icon: "🧭" },
  { id: "roadmap", label: "Roadmap", icon: "🛣️" },
  { id: "export", label: "Export", icon: "⬇" },
];

const STEP_ORDER = STEPS.map((step) => step.id);

const YES_PARTLY_NO: Option[] = [
  { value: "ja", label: "Ja" },
  { value: "deels", label: "Deels" },
  { value: "nee", label: "Nee" },
];

const YES_PARTLY_NO_UNKNOWN: Option[] = [...YES_PARTLY_NO, { value: "onbekend", label: "Onbekend" }];

const GOAL_OPTIONS: Option[] = [
  { value: "meten", label: "Volwassenheid meten" },
  { value: "verbeteren", label: "Verbeteren" },
  { value: "herinrichten", label: "Herinrichten" },
  { value: "rapportage", label: "Meer grip op rapportage" },
  { value: "governance", label: "Governance versterken" },
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
  { value: "laag", label: "Laag" },
  { value: "middel", label: "Middel" },
  { value: "hoog", label: "Hoog" },
];

const REPORTING_OPTIONS: Option[] = [
  { value: "basis", label: "Basisrapportages" },
  { value: "dashboard", label: "Dashboards" },
  { value: "kpi", label: "KPI-sturing" },
  { value: "onduidelijk", label: "Onvoldoende duidelijk" },
];

const MODULE_OPTIONS: Option[] = [
  { value: "finance", label: "Finance" },
  { value: "hrm", label: "HRM / Payroll" },
  { value: "projecten", label: "Projecten" },
  { value: "crm", label: "CRM" },
  { value: "order", label: "Order / Logistiek" },
  { value: "insite", label: "InSite" },
  { value: "pocket", label: "Pocket" },
  { value: "rapportage", label: "Rapportage" },
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

const DIP_SCALE = [
  { value: 0, label: "Niet aanwezig" },
  { value: 1, label: "Ad hoc" },
  { value: 2, label: "Herhaalbaar" },
  { value: 3, label: "Vastgelegd" },
  { value: 4, label: "Toegepast" },
  { value: 5, label: "Gestuurd" },
  { value: 6, label: "Geoptimaliseerd" },
  { value: 7, label: "Voorspellend" },
];

const STARTCHECK_QUESTIONS: Question[] = [
  {
    id: "start_1",
    type: "choice",
    target: "afasLiveOneYear",
    label: "Werkt de klant minimaal één jaar volledig operationeel met AFAS?",
    help: "Dit is het vaste uitgangspunt voor een betrouwbare volwassenheidsmeting.",
    options: YES_PARTLY_NO,
  },
  {
    id: "start_2",
    type: "choice",
    target: "keyProcessesOperational",
    label: "Zijn de belangrijkste bedrijfsprocessen rondom AFAS daadwerkelijk in gebruik?",
    help: "Denk aan processen die dagelijks of periodiek echt worden uitgevoerd.",
    options: YES_PARTLY_NO,
  },
  {
    id: "start_3",
    type: "choice",
    target: "enoughExperience",
    label: "Is er genoeg praktijkervaring om IST, FIT, GAP en SOLL betrouwbaar te bepalen?",
    help: "Niet alleen AFAS telt mee, maar ook organisatie, integraties, data, rapportage en beheer.",
    options: YES_PARTLY_NO_UNKNOWN,
  },
  {
    id: "start_4",
    type: "choice",
    target: "goal",
    label: "Wat is de primaire aanleiding?",
    help: "Deze keuze helpt om straks de juiste scope en adviesrichting te kiezen.",
    options: GOAL_OPTIONS,
  },
  { id: "start_summary", type: "summary", label: "Overzicht startcheck" },
];

const PROFILE_QUESTIONS: Question[] = [
  { id: "profile_1", type: "text", target: "customerName", label: "Wat is de naam van de organisatie?", help: "Gebruik de klantnaam zoals je die straks in rapportage wilt tonen." },
  { id: "profile_2", type: "choice", target: "sector", label: "In welke sector valt de klant?", options: SECTOR_OPTIONS },
  { id: "profile_3", type: "choice", target: "size", label: "Hoe groot of complex is de organisatie?", options: SIZE_OPTIONS },
  { id: "profile_4", type: "choice", target: "administrations", label: "Hoeveel administraties zijn in scope?", options: ADMIN_OPTIONS },
  { id: "profile_5", type: "multi", target: "modules", label: "Welke AFAS-onderdelen zijn in gebruik of relevant voor de scan?", options: MODULE_OPTIONS },
  { id: "profile_6", type: "choice", target: "integrations", label: "Hoe complex is het applicatielandschap rondom AFAS?", options: COMPLEXITY_OPTIONS },
  { id: "profile_7", type: "choice", target: "reporting", label: "Hoe wordt op dit moment gerapporteerd en gestuurd?", options: REPORTING_OPTIONS },
  { id: "profile_8", type: "choice", target: "reason", label: "Wat is de belangrijkste aanleiding voor het groeimodel?", options: REASON_OPTIONS },
  { id: "profile_summary", type: "summary", label: "Overzicht klantprofiel" },
];

const SCOPE_QUESTIONS: Question[] = [
  {
    id: "scope_1",
    type: "choice",
    label: "Welke scope past het beste bij deze klantvraag?",
    help: "Kies liever scherp dan te breed. Je kunt later altijd verdiepen.",
    options: SCOPE_OPTIONS,
  },
  { id: "scope_summary", type: "summary", label: "Overzicht scope" },
];

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
          { id: "q_org_001", type: "choice", kind: "Klantinput", label: "Weet iedereen wie verantwoordelijk is voor de belangrijkste processen?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_org_002", type: "scale", kind: "Consultantbeoordeling", label: "Hoe volwassen is proceseigenaarschap op dit moment?" },
          { id: "q_org_003", type: "open", kind: "Signaalvraag", label: "Waar blijkt eigenaarschap of het ontbreken daarvan uit?" },
        ],
      },
      {
        id: "organisatie_besluitvorming",
        label: "Besluitvorming en prioritering",
        description: "Verbeteringen worden gekozen, besloten en opgevolgd volgens een herkenbaar ritme.",
        questions: [
          { id: "q_org_004", type: "choice", kind: "Klantinput", label: "Is er een vast overleg of klantteam waarin verbeteringen worden besproken en geprioriteerd?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_org_005", type: "scale", kind: "Consultantbeoordeling", label: "Hoe volwassen is besluitvorming rondom verbetering en beheer?" },
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
          { id: "q_proc_001", type: "choice", kind: "Klantinput", label: "Worden processen meestal op dezelfde manier uitgevoerd?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_proc_002", type: "scale", kind: "Consultantbeoordeling", label: "Hoe volwassen is de standaardisatie van de belangrijkste processen?" },
          { id: "q_proc_003", type: "open", kind: "Signaalvraag", label: "Waar ontstaan de meeste uitzonderingen of handmatige correcties?" },
        ],
      },
      {
        id: "processen_fit_gap_soll",
        label: "IST, FIT, GAP en SOLL",
        description: "Huidige situatie, passende inrichting, ontbrekende zaken en gewenste situatie zijn scherp.",
        questions: [
          { id: "q_proc_004", type: "choice", kind: "Klantinput", label: "Is duidelijk wat goed werkt en wat verbetering vraagt?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_proc_005", type: "scale", kind: "Consultantbeoordeling", label: "Hoe goed kan de organisatie IST, FIT, GAP en SOLL onderscheiden?" },
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
          { id: "q_afas_001", type: "choice", kind: "Klantinput", label: "Is de AFAS-werkwijze voor gebruikers logisch en makkelijk te volgen?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_afas_002", type: "scale", kind: "Consultantbeoordeling", label: "Hoe volwassen is het gebruik van AFAS-standaardfunctionaliteit?" },
          { id: "q_afas_003", type: "open", kind: "Signaalvraag", label: "Welke workarounds of Excel-lijsten worden naast AFAS gebruikt?" },
        ],
      },
      {
        id: "afas_workflows_autorisaties",
        label: "Workflows, autorisaties en InSite",
        description: "Taken, goedkeuringen en rechten zijn logisch ingericht en worden gebruikt.",
        questions: [
          { id: "q_afas_004", type: "choice", kind: "Klantinput", label: "Worden taken en goedkeuringen zoveel mogelijk via AFAS/InSite afgehandeld?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_afas_005", type: "scale", kind: "Consultantbeoordeling", label: "Hoe volwassen zijn workflows, autorisaties en InSite-gebruik?" },
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
        description: "Integraties werken voorspelbaar en fouten zijn tijdig zichtbaar.",
        questions: [
          { id: "q_int_001", type: "choice", kind: "Klantinput", label: "Zijn fouten in koppelingen snel zichtbaar en duidelijk op te lossen?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_int_002", type: "scale", kind: "Consultantbeoordeling", label: "Hoe volwassen is beheer en monitoring van integraties?" },
          { id: "q_int_003", type: "open", kind: "Signaalvraag", label: "Welke koppelingen zijn kritisch voor de dagelijkse operatie?" },
        ],
      },
      {
        id: "integraties_eigenaarschap",
        label: "Ketenverantwoordelijkheid",
        description: "Duidelijk is wie eigenaar is van proces, data en foutafhandeling over systemen heen.",
        questions: [
          { id: "q_int_004", type: "choice", kind: "Klantinput", label: "Is duidelijk wie verantwoordelijk is voor ketenproblemen over systemen heen?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_int_005", type: "scale", kind: "Consultantbeoordeling", label: "Hoe volwassen is ketenverantwoordelijkheid?" },
        ],
      },
    ],
  },
  {
    id: "data",
    label: "Data & rapportage",
    icon: "📊",
    description: "Data is betrouwbaar, definities zijn duidelijk en rapportages sturen besluitvorming.",
    capabilities: [
      {
        id: "data_kpi_definities",
        label: "KPI-definities",
        description: "Cijfers zijn eenduidig gedefinieerd en geaccepteerd.",
        questions: [
          { id: "q_data_001", type: "choice", kind: "Klantinput", label: "Zijn KPI's en rapportagedefinities eenduidig vastgelegd?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_data_002", type: "scale", kind: "Consultantbeoordeling", label: "Hoe volwassen zijn KPI-definities en rapportageafspraken?" },
          { id: "q_data_003", type: "open", kind: "Signaalvraag", label: "Over welke cijfers ontstaat discussie?" },
        ],
      },
      {
        id: "data_datakwaliteit",
        label: "Datakwaliteit en stamgegevens",
        description: "Data is volledig, actueel, betrouwbaar en beheerd.",
        questions: [
          { id: "q_data_004", type: "choice", kind: "Klantinput", label: "Is duidelijk wie verantwoordelijk is voor datakwaliteit en stamgegevens?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_data_005", type: "scale", kind: "Consultantbeoordeling", label: "Hoe volwassen is datakwaliteit en stamgegevensbeheer?" },
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
          { id: "q_beh_001", type: "choice", kind: "Klantinput", label: "Is er één centrale lijst met verbeterpunten, wensen en besluiten?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_beh_002", type: "scale", kind: "Consultantbeoordeling", label: "Hoe volwassen is backlogbeheer en prioritering?" },
        ],
      },
      {
        id: "beheer_test_release",
        label: "Testen en releasebeheer",
        description: "Wijzigingen worden beheerst getest, vrijgegeven en gecommuniceerd.",
        questions: [
          { id: "q_beh_003", type: "choice", kind: "Klantinput", label: "Worden wijzigingen getest voordat ze breed worden toegepast?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_beh_004", type: "scale", kind: "Consultantbeoordeling", label: "Hoe volwassen is test- en releasebeheer?" },
          { id: "q_beh_005", type: "open", kind: "Bewijsvraag", label: "Welke voorbeelden zijn er van recente wijzigingen en hoe zijn die geborgd?" },
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
          { id: "q_ado_001", type: "choice", kind: "Klantinput", label: "Gebruiken medewerkers de afgesproken werkwijze zoals bedoeld?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_ado_002", type: "scale", kind: "Consultantbeoordeling", label: "Hoe volwassen is gebruikersadoptie?" },
        ],
      },
      {
        id: "adoptie_leervermogen",
        label: "Leervermogen en communicatie",
        description: "Verbeteringen worden uitgelegd, begrepen en vastgehouden.",
        questions: [
          { id: "q_ado_003", type: "choice", kind: "Klantinput", label: "Worden proceswijzigingen duidelijk gecommuniceerd en uitgelegd?", options: YES_PARTLY_NO_UNKNOWN },
          { id: "q_ado_004", type: "scale", kind: "Consultantbeoordeling", label: "Hoe volwassen is communicatie en leervermogen rond veranderingen?" },
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
    description: "Eigenaarschap is onvoldoende geborgd. Daardoor blijft verbetering afhankelijk van personen in plaats van structuur.",
    fit: "Er is vaak praktische kennis aanwezig bij medewerkers.",
    gap: "Rollen, besluiten en verantwoordelijkheid voor verbetering zijn onvoldoende expliciet.",
    soll: "Per kernproces is duidelijk wie eigenaar is van proces, inrichting, data en verbeteringen.",
    roadmap: ["Benoem per kernproces een proceseigenaar.", "Richt een eenvoudig besluitritme in.", "Maak eigenaarschap zichtbaar in overlegstructuur en backlog.", "Borg eigenaarschap in het klantteam."],
  },
  {
    id: "adv_proc_001",
    areaId: "processen",
    capabilityId: "processen_standaardisatie",
    maxScore: 3,
    priority: 2,
    title: "Maak de standaard werkwijze de makkelijkste route",
    description: "Processen zijn nog te afhankelijk van losse afspraken, uitzonderingen of handmatige correcties.",
    fit: "De organisatie weet in de praktijk vaak hoe het werk gedaan moet worden.",
    gap: "De werkwijze is onvoldoende uniform en lastig schaalbaar.",
    soll: "Belangrijke processen zijn helder, eenvoudig en sluiten aan op AFAS.",
    roadmap: ["Breng per hoofdproces de grootste uitzonderingen in kaart.", "Kies per proces de gewenste standaardroute.", "Leg processen vast in eenvoudige taal.", "Review periodiek of uitzonderingen afnemen."],
  },
  {
    id: "adv_afas_001",
    areaId: "afas",
    capabilityId: "afas_standaardgebruik",
    maxScore: 3,
    priority: 3,
    title: "Verminder workarounds naast AFAS",
    description: "Structureel werken naast AFAS veroorzaakt dubbel werk, datavervuiling en minder grip.",
    fit: "AFAS vormt al een centrale basis voor meerdere processen.",
    gap: "De inrichting of werkwijze sluit nog onvoldoende aan op gebruikersbehoefte.",
    soll: "AFAS ondersteunt de standaardroute en maakt afwijkend werken minder aantrekkelijk.",
    roadmap: ["Inventariseer Excel-lijsten en handmatige controles.", "Bepaal welke workarounds verdwijnen of blijven.", "Pas inrichting, weergaves of workflows gericht aan.", "Meet periodiek of workarounds afnemen."],
  },
  {
    id: "adv_int_001",
    areaId: "integraties",
    capabilityId: "integraties_betrouwbaarheid",
    maxScore: 3,
    priority: 4,
    title: "Maak integratiebeheer zichtbaar en beheersbaar",
    description: "Koppelingen zijn vaak kritisch, maar foutafhandeling en eigenaarschap zijn onvoldoende ingericht.",
    fit: "Er zijn koppelingen aanwezig die handmatig werk kunnen verminderen.",
    gap: "Monitoring, foutafhandeling en keteneigenaarschap zijn onvoldoende duidelijk.",
    soll: "Kritische koppelingen hebben eigenaar, controles, foutproces en impactanalyse.",
    roadmap: ["Maak een overzicht van kritische koppelingen.", "Leg per koppeling eigenaar en foutproces vast.", "Richt monitoring en controle in.", "Neem integraties op in releasebeheer."],
  },
  {
    id: "adv_data_001",
    areaId: "data",
    capabilityId: "data_kpi_definities",
    maxScore: 3,
    priority: 2,
    title: "Maak KPI-definities eenduidig",
    description: "Zonder gedeelde definities ontstaat discussie over cijfers in plaats van sturing op verbetering.",
    fit: "Er zijn vaak rapportages of dashboards beschikbaar.",
    gap: "Definities, eigenaarschap en interpretatie zijn onvoldoende vastgelegd.",
    soll: "KPI's hebben eigenaar, definitie, bron, berekening en gebruiksdoel.",
    roadmap: ["Inventariseer cijfers waar discussie over ontstaat.", "Leg definities vast in een KPI-handboek.", "Stem dashboards af op besluitvorming.", "Borg KPI-definities via beheerproces."],
  },
  {
    id: "adv_beh_001",
    areaId: "beheer",
    capabilityId: "beheer_backlog",
    maxScore: 3,
    priority: 3,
    title: "Richt een centrale verbeterbacklog in",
    description: "Zonder centrale backlog raken wensen, besluiten en verbeterpunten versnipperd.",
    fit: "Verbeterpunten zijn vaak bekend bij medewerkers of key users.",
    gap: "Er is onvoldoende centrale prioritering, eigenaarschap en opvolging.",
    soll: "Alle verbeteringen worden centraal vastgelegd, geprioriteerd en opgevolgd.",
    roadmap: ["Maak één centrale backlog.", "Bepaal prioriteringscriteria.", "Koppel backlog aan releaseplanning en testen.", "Bespreek backlog periodiek in het klantteam."],
  },
  {
    id: "adv_ado_001",
    areaId: "adoptie",
    capabilityId: "adoptie_gebruik",
    maxScore: 3,
    priority: 4,
    title: "Versterk adoptie met uitleg, training en feedback",
    description: "Als medewerkers de werkwijze niet begrijpen of herkennen, blijft inrichting kwetsbaar.",
    fit: "Gebruikers hebben praktische kennis en weten waar het schuurt.",
    gap: "Uitleg, training, communicatie en feedback zijn onvoldoende structureel ingericht.",
    soll: "Gebruikers begrijpen de werkwijze en kunnen feedback geven.",
    roadmap: ["Inventariseer waar gebruikers afwijken en waarom.", "Maak korte werkinstructies per rol.", "Richt feedbackmomenten in na wijzigingen.", "Borg adoptie in doorontwikkeling."],
  },
];

export default function Page() {
  const [started, setStarted] = useState(false);
  const [activeStep, setActiveStep] = useState<StepId>("startcheck");
  const [subStepByStep, setSubStepByStep] = useState<Record<StepId, number>>({
    startcheck: 0,
    profiel: 0,
    scope: 0,
    diagnose: 0,
    duiding: 0,
    roadmap: 0,
    export: 0,
  });
  const [startCheck, setStartCheck] = useState<StartCheck>({ afasLiveOneYear: "", keyProcessesOperational: "", enoughExperience: "", goal: "" });
  const [profile, setProfile] = useState<CustomerProfile>({ customerName: "", sector: "", size: "", administrations: "", modules: [], integrations: "", reporting: "", reason: "" });
  const [scope, setScope] = useState("volledige_scan");
  const [answers, setAnswers] = useState<Record<string, string | number>>(createInitialAnswers());
  const [copyStatus, setCopyStatus] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const stepIndex = STEP_ORDER.indexOf(activeStep);
  const currentSubStep = subStepByStep[activeStep] ?? 0;
  const startAdvice = useMemo(() => getStartAdvice(startCheck), [startCheck]);
  const visibleAreas = useMemo(() => filterAreasByScope(GROWTH_AREAS, scope), [scope]);
  const diagnosisQuestions = useMemo(() => flattenDiagnosisQuestions(visibleAreas), [visibleAreas]);
  const scores = useMemo(() => calculateScores(answers), [answers]);
  const advice = useMemo(() => getTriggeredAdvice(scores), [scores]);
  const roadmap = useMemo(() => buildRoadmap(advice, startAdvice), [advice, startAdvice]);
  const exportPayload = useMemo(
    () => ({
      meta: { model: "Kweekers Groeimodel", version: "2.0-wizard", generatedAt: new Date().toISOString() },
      startCheck,
      profile,
      scope,
      answers,
      scores,
      advice,
      roadmap,
      hierarchy: ["Groeigebied", "Capability", "Vraag", "Antwoord", "Score", "Adviesregel", "Roadmapactie", "Rapportagetekst"],
    }),
    [startCheck, profile, scope, answers, scores, advice, roadmap]
  );

  const activeQuestions = getQuestionsForStep(activeStep, diagnosisQuestions);
  const activeQuestion = activeQuestions[currentSubStep] ?? activeQuestions[0];
  const isLastSubStep = currentSubStep >= activeQuestions.length - 1;
  const isFirstSubStep = currentSubStep === 0;

  function setSubStep(step: StepId, value: number) {
    setSubStepByStep((previous) => ({ ...previous, [step]: Math.max(0, value) }));
  }

  function goNext() {
    if (!isLastSubStep) {
      setSubStep(activeStep, currentSubStep + 1);
      return;
    }

    const nextStep = STEP_ORDER[Math.min(stepIndex + 1, STEP_ORDER.length - 1)];
    setActiveStep(nextStep);
  }

  function goPrevious() {
    if (!isFirstSubStep) {
      setSubStep(activeStep, currentSubStep - 1);
      return;
    }

    const previousStep = STEP_ORDER[Math.max(stepIndex - 1, 0)];
    setActiveStep(previousStep);
  }

  function jumpToStep(step: StepId) {
    setActiveStep(step);
  }

  function updateStartCheck(question: Question, value: string) {
    const target = question.target as keyof StartCheck;
    setStartCheck((previous) => ({ ...previous, [target]: value }));
  }

  function updateProfile(question: Question, value: string | string[]) {
    const target = question.target as keyof CustomerProfile;
    setProfile((previous) => ({ ...previous, [target]: value } as CustomerProfile));
  }

  function updateAnswer(questionId: string, value: string | number) {
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  }

  function toggleMulti(question: Question, value: string) {
    const target = question.target as keyof CustomerProfile;
    const current = Array.isArray(profile[target]) ? (profile[target] as string[]) : [];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    updateProfile(question, next);
  }

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
      setCopyStatus("JSON gekopieerd");
      window.setTimeout(() => setCopyStatus(""), 2200);
    } catch {
      setCopyStatus("Kopiëren niet gelukt");
    }
  }

  function downloadExport() {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kweekers-groeimodel-diagnose.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!started) {
    return (
      <main className="page intro-page">
        <section className="intro-card">
          <div className="brand-pill">Kweekers Groeimodel</div>
          <h1>Begeleide diagnose voor digitale volwassenheid.</h1>
          <p>
            Bepaal gestructureerd de IST, FIT, GAP en SOLL van een organisatie. Niet alleen gericht op AFAS, maar ook op processen,
            eigenaarschap, integraties, data, rapportage, beheer en veranderkracht.
          </p>
          <div className="intro-points">
            <span>Voor klanten die minimaal één jaar operationeel werken met AFAS</span>
            <span>Output: score, advies en roadmap</span>
            <span>Ingevuld als consultant-assistent, niet als platte enquête</span>
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
          <AdviceScreen scores={scores} advice={advice} goPrevious={goPrevious} goNext={goNext} />
        ) : activeStep === "roadmap" ? (
          <RoadmapScreen roadmap={roadmap} scores={scores} goPrevious={goPrevious} goNext={goNext} />
        ) : activeStep === "export" ? (
          <ExportScreen exportPayload={exportPayload} copyStatus={copyStatus} copyExport={copyExport} downloadExport={downloadExport} goPrevious={goPrevious} />
        ) : (
          <WizardCard
            step={activeStep}
            stepIndex={stepIndex}
            question={activeQuestion}
            subStep={currentSubStep}
            totalSubSteps={activeQuestions.length}
            startCheck={startCheck}
            profile={profile}
            scope={scope}
            startAdvice={startAdvice}
            scores={scores}
            answers={answers}
            updateStartCheck={updateStartCheck}
            updateProfile={updateProfile}
            updateScope={setScope}
            updateAnswer={updateAnswer}
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

function TopBar({ activeStep, stepIndex, setActiveStep, showInfo, setShowInfo }: { activeStep: StepId; stepIndex: number; setActiveStep: (step: StepId) => void; showInfo: boolean; setShowInfo: (value: boolean) => void }) {
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
        De app werkt als begeleide diagnose. De uitleg wordt bewust compact gehouden tijdens het invullen. Detailinformatie staat hier, zodat het invulscherm rustig blijft.
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
  startCheck: StartCheck;
  profile: CustomerProfile;
  scope: string;
  startAdvice: StartAdvice;
  scores: Scores;
  answers: Record<string, string | number>;
  updateStartCheck: (question: Question, value: string) => void;
  updateProfile: (question: Question, value: string | string[]) => void;
  updateScope: (value: string) => void;
  updateAnswer: (questionId: string, value: string | number) => void;
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
          {props.step === "startcheck" && renderStartcheckQuestion(props)}
          {props.step === "profiel" && renderProfileQuestion(props)}
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

function renderStartcheckQuestion(props: React.ComponentProps<typeof WizardCard>) {
  const q = props.question;
  if (q.type === "summary") {
    return <StartcheckSummary startCheck={props.startCheck} advice={props.startAdvice} />;
  }
  const value = String(props.startCheck[q.target as keyof StartCheck] ?? "");
  return <ChoiceAnswer options={q.options ?? []} value={value} onChange={(value) => props.updateStartCheck(q, value)} />;
}

function renderProfileQuestion(props: React.ComponentProps<typeof WizardCard>) {
  const q = props.question;
  if (q.type === "summary") {
    return <ProfileSummary profile={props.profile} />;
  }
  if (q.type === "text") {
    const value = String(props.profile[q.target as keyof CustomerProfile] ?? "");
    return <input className="text-input" value={value} onChange={(event) => props.updateProfile(q, event.target.value)} placeholder="Typ hier..." autoFocus />;
  }
  if (q.type === "multi") {
    const values = Array.isArray(props.profile[q.target as keyof CustomerProfile]) ? (props.profile[q.target as keyof CustomerProfile] as string[]) : [];
    return <MultiAnswer options={q.options ?? []} values={values} onToggle={(value) => props.toggleMulti(q, value)} />;
  }
  const value = String(props.profile[q.target as keyof CustomerProfile] ?? "");
  return <ChoiceAnswer options={q.options ?? []} value={value} onChange={(value) => props.updateProfile(q, value)} />;
}

function renderScopeQuestion(props: React.ComponentProps<typeof WizardCard>) {
  const q = props.question;
  if (q.type === "summary") {
    return <ScopeSummary scope={props.scope} advice={props.startAdvice} />;
  }
  return <ChoiceAnswer options={q.options ?? []} value={props.scope} onChange={props.updateScope} variant="cards" />;
}

function renderDiagnosisQuestion(props: React.ComponentProps<typeof WizardCard>) {
  const q = props.question;
  const value = props.answers[q.id] ?? "";
  if (q.type === "scale") {
    return <ScaleAnswer value={Number(value)} onChange={(next) => props.updateAnswer(q.id, next)} />;
  }
  if (q.type === "open") {
    return <textarea className="text-area" value={String(value)} onChange={(event) => props.updateAnswer(q.id, event.target.value)} placeholder="Korte toelichting, signaal of voorbeeld..." />;
  }
  return <ChoiceAnswer options={q.options ?? YES_PARTLY_NO_UNKNOWN} value={String(value)} onChange={(next) => props.updateAnswer(q.id, next)} />;
}

function ChoiceAnswer({ options, value, onChange, variant = "chips" }: { options: Option[]; value: string; onChange: (value: string) => void; variant?: "chips" | "cards" }) {
  return (
    <div className={variant === "cards" ? "choice-grid" : "choice-row"}>
      {options.map((option) => (
        <button key={option.value} className={`${variant === "cards" ? "choice-card" : "chip"} ${value === option.value ? "active" : ""}`} onClick={() => onChange(option.value)} type="button">
          {option.label}
        </button>
      ))}
    </div>
  );
}

function MultiAnswer({ options, values, onToggle }: { options: Option[]; values: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="choice-row">
      {options.map((option) => (
        <button key={option.value} className={`chip ${values.includes(option.value) ? "active" : ""}`} onClick={() => onToggle(option.value)} type="button">
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ScaleAnswer({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="scale-grid">
      {DIP_SCALE.map((score) => (
        <button key={score.value} className={`scale ${value === score.value ? "active" : ""}`} onClick={() => onChange(score.value)} type="button">
          <strong>{score.value}</strong>
          <span>{score.label}</span>
        </button>
      ))}
    </div>
  );
}

function StartcheckSummary({ startCheck, advice }: { startCheck: StartCheck; advice: StartAdvice }) {
  return (
    <div className="summary-stack">
      <SummaryRow label="Minimaal één jaar operationeel" value={labelOf(YES_PARTLY_NO, startCheck.afasLiveOneYear)} />
      <SummaryRow label="Belangrijkste processen in gebruik" value={labelOf(YES_PARTLY_NO, startCheck.keyProcessesOperational)} />
      <SummaryRow label="Genoeg praktijkervaring" value={labelOf(YES_PARTLY_NO_UNKNOWN, startCheck.enoughExperience)} />
      <SummaryRow label="Aanleiding" value={labelOf(GOAL_OPTIONS, startCheck.goal)} />
      <div className={`message ${advice.tone}`}>
        <strong>{advice.label}</strong>
        <p>{advice.description}</p>
      </div>
    </div>
  );
}

function ProfileSummary({ profile }: { profile: CustomerProfile }) {
  return (
    <div className="summary-stack">
      <SummaryRow label="Klant" value={profile.customerName || "Niet ingevuld"} />
      <SummaryRow label="Sector" value={labelOf(SECTOR_OPTIONS, profile.sector)} />
      <SummaryRow label="Omvang" value={labelOf(SIZE_OPTIONS, profile.size)} />
      <SummaryRow label="Administraties" value={labelOf(ADMIN_OPTIONS, profile.administrations)} />
      <SummaryRow label="Modules" value={profile.modules.map((item) => labelOf(MODULE_OPTIONS, item)).join(", ") || "Niet ingevuld"} />
      <SummaryRow label="Integraties" value={labelOf(COMPLEXITY_OPTIONS, profile.integrations)} />
      <SummaryRow label="Rapportage" value={labelOf(REPORTING_OPTIONS, profile.reporting)} />
      <SummaryRow label="Aanleiding" value={labelOf(REASON_OPTIONS, profile.reason)} />
    </div>
  );
}

function ScopeSummary({ scope, advice }: { scope: string; advice: StartAdvice }) {
  return (
    <div className="summary-stack">
      <SummaryRow label="Gekozen scope" value={labelOf(SCOPE_OPTIONS, scope)} />
      <div className={`message ${advice.tone}`}>
        <strong>{advice.label}</strong>
        <p>{advice.scopeHint}</p>
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

function AdviceScreen({ scores, advice, goPrevious, goNext }: { scores: Scores; advice: AdviceRule[]; goPrevious: () => void; goNext: () => void }) {
  return (
    <section className="content-screen">
      <div className="screen-head">
        <small>Advies</small>
        <h1>Van score naar duiding.</h1>
        <p>Hier zie je waar de belangrijkste aandachtspunten ontstaan. De score is indicatief; de consultant blijft leidend.</p>
      </div>

      <div className="two-column-content">
        <div className="panel">
          <h2>Scorekaart</h2>
          <div className="score-list">
            {GROWTH_AREAS.map((area) => {
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

        <div className="panel">
          <h2>Geactiveerde adviesregels</h2>
          <div className="advice-list">
            {advice.length === 0 ? <div className="empty">Nog geen adviesregels geactiveerd.</div> : advice.map((item) => <AdviceCard key={item.id} item={item} />)}
          </div>
        </div>
      </div>

      <ScreenFooter goPrevious={goPrevious} goNext={goNext} nextLabel="Verder naar roadmap →" />
    </section>
  );
}

function AdviceCard({ item }: { item: AdviceRule }) {
  const area = GROWTH_AREAS.find((growthArea) => growthArea.id === item.areaId);
  return (
    <article className="advice-card">
      <div className="advice-title">
        <span>{area?.icon}</span>
        <div>
          <small>{area?.label} · Prioriteit {item.priority}</small>
          <strong>{item.title}</strong>
        </div>
      </div>
      <p>{item.description}</p>
      <details>
        <summary>FIT / GAP / SOLL</summary>
        <div className="mini-grid">
          <Mini title="FIT" text={item.fit} />
          <Mini title="GAP" text={item.gap} />
          <Mini title="SOLL" text={item.soll} />
        </div>
      </details>
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

function RoadmapScreen({ roadmap, scores, goPrevious, goNext }: { roadmap: ReturnType<typeof buildRoadmap>; scores: Scores; goPrevious: () => void; goNext: () => void }) {
  return (
    <section className="content-screen">
      <div className="screen-head">
        <small>Roadmap</small>
        <h1>Maak verbetering uitvoerbaar.</h1>
        <p>De roadmap vertaalt de diagnose naar een eerste 0-30-60-90 dagen aanpak.</p>
      </div>
      <div className="roadmap-grid">
        {roadmap.map((phase) => (
          <article key={phase.id} className="roadmap-card">
            <span>{phase.period}</span>
            <h2>{phase.title}</h2>
            <p>{phase.description}</p>
            <div className="roadmap-items">
              {phase.items.length === 0 ? <em>Geen acties geactiveerd.</em> : phase.items.map((item) => <div key={item}>{item}</div>)}
            </div>
          </article>
        ))}
      </div>
      <ScreenFooter goPrevious={goPrevious} goNext={goNext} nextLabel="Verder naar export →" />
    </section>
  );
}

function ExportScreen({ exportPayload, copyStatus, copyExport, downloadExport, goPrevious }: { exportPayload: unknown; copyStatus: string; copyExport: () => void; downloadExport: () => void; goPrevious: () => void }) {
  return (
    <section className="content-screen">
      <div className="screen-head">
        <small>Export</small>
        <h1>Output voor GitHub en rapportage.</h1>
        <p>Deze structuur kan later worden gevoed vanuit Excel of JSON-bestanden in GitHub.</p>
      </div>
      <div className="two-column-content export-layout">
        <div className="panel">
          <h2>Aanbevolen repository-structuur</h2>
          <pre className="repo-pre">/data/app-flow.json
/data/groeigebieden.json
/data/capabilities.json
/data/vragenbank.json
/data/antwoordopties.json
/data/scoremodel-dip-0-7.json
/data/routingregels.json
/data/adviesregels.json
/data/roadmapbouwstenen.json
/data/rapportageteksten.json</pre>
        </div>
        <div className="panel action-panel">
          <h2>Acties</h2>
          <button className="primary" onClick={copyExport} type="button">Kopieer JSON</button>
          <button className="secondary" onClick={downloadExport} type="button">Download JSON</button>
          {copyStatus ? <div className="message success"><strong>{copyStatus}</strong></div> : null}
          <p>Beheer straks de inhoud in Excel en exporteer deze naar JSON. De app leest dan data in plaats van vaste code.</p>
        </div>
      </div>
      <details className="json-details">
        <summary>Bekijk JSON</summary>
        <pre>{JSON.stringify(exportPayload, null, 2)}</pre>
      </details>
      <ScreenFooter goPrevious={goPrevious} goNext={() => undefined} nextLabel="Afronding" hideNext />
    </section>
  );
}

function ScreenFooter({ goPrevious, goNext, nextLabel, hideNext = false }: { goPrevious: () => void; goNext: () => void; nextLabel: string; hideNext?: boolean }) {
  return (
    <div className="screen-footer">
      <button className="secondary" onClick={goPrevious} type="button">Vorige</button>
      {!hideNext ? <button className="primary" onClick={goNext} type="button">{nextLabel}</button> : null}
    </div>
  );
}

function getQuestionsForStep(step: StepId, diagnosisQuestions: Question[]) {
  if (step === "startcheck") return STARTCHECK_QUESTIONS;
  if (step === "profiel") return PROFILE_QUESTIONS;
  if (step === "scope") return SCOPE_QUESTIONS;
  if (step === "diagnose") return diagnosisQuestions;
  return [{ id: `${step}_screen`, type: "summary", label: step }];
}

function flattenDiagnosisQuestions(areas: GrowthArea[]) {
  const questions: Question[] = [];
  areas.forEach((area) => {
    area.capabilities.forEach((capability) => {
      capability.questions.forEach((question) => {
        questions.push({
          ...question,
          areaId: area.id,
          areaLabel: area.label,
          areaIcon: area.icon,
          capabilityId: capability.id,
          capabilityLabel: capability.label,
        });
      });
    });
  });
  return questions;
}

function createInitialAnswers() {
  const result: Record<string, string | number> = {};
  GROWTH_AREAS.forEach((area) => {
    area.capabilities.forEach((capability) => {
      capability.questions.forEach((question) => {
        result[question.id] = question.type === "scale" ? 0 : "";
      });
    });
  });
  return result;
}

function calculateScores(answers: Record<string, string | number>): Scores {
  const byCapability: Scores["byCapability"] = {};
  const byArea: Scores["byArea"] = {};
  GROWTH_AREAS.forEach((area) => {
    let areaTotal = 0;
    let areaCount = 0;
    area.capabilities.forEach((capability) => {
      const scaleQuestions = capability.questions.filter((question) => question.type === "scale");
      const total = scaleQuestions.reduce((sum, question) => sum + Number(answers[question.id] || 0), 0);
      const score = scaleQuestions.length ? total / scaleQuestions.length : 0;
      byCapability[capability.id] = { score, count: scaleQuestions.length };
      areaTotal += score;
      areaCount += 1;
    });
    byArea[area.id] = { score: areaCount ? areaTotal / areaCount : 0, count: areaCount };
  });
  const areaScores = Object.values(byArea).map((item) => item.score);
  const overall = areaScores.length ? areaScores.reduce((sum, score) => sum + score, 0) / areaScores.length : 0;
  return { overall, byArea, byCapability };
}

function getStartAdvice(data: StartCheck): StartAdvice {
  const hardNo = data.afasLiveOneYear === "nee" || data.keyProcessesOperational === "nee";
  const partly = Object.values(data).includes("deels") || data.enoughExperience === "onbekend";
  if (hardNo) return { status: "stabiliseren", label: "Eerst stabiliseren, daarna meten", description: "Een volledige volwassenheidsmeting is nu waarschijnlijk te vroeg. Richt de analyse eerst op basisprocessen, inrichting, gebruik en openstaande implementatiepunten.", scopeHint: "Kies bij voorkeur voor een beperkte quickscan of stabilisatieadvies.", tone: "danger" };
  if (partly) return { status: "quickscan", label: "Beperkte scan of quickscan passend", description: "Er is deels voldoende basis aanwezig, maar de betrouwbaarheid van een volledige meting vraagt aandacht. Beperk de scope en leg aannames goed vast.", scopeHint: "Start met een quickscan of gerichte scan op de gebieden waar de klant het meeste knelpunt ervaart.", tone: "warning" };
  if (data.afasLiveOneYear === "ja" && data.keyProcessesOperational === "ja" && data.enoughExperience === "ja") return { status: "groeimodel", label: "Volledig groeimodel passend", description: "De klant heeft voldoende praktijkervaring om IST, FIT, GAP en SOLL betrouwbaar vast te stellen.", scopeHint: "Een volledige scan is passend. Afhankelijk van de aanleiding kan daarnaast extra verdieping worden gekozen.", tone: "success" };
  return { status: "unknown", label: "Nog onvoldoende bepaald", description: "Vul de startcheck aan om te bepalen of een volledige scan, quickscan of stabilisatieadvies passend is.", scopeHint: "Kies voorlopig voor een beperkte scope totdat duidelijk is of de basis voldoende stabiel is.", tone: "neutral" };
}

function getTriggeredAdvice(scores: Scores): AdviceRule[] {
  return ADVICE_RULES.filter((rule) => (scores.byCapability[rule.capabilityId]?.score ?? 0) <= rule.maxScore).sort((a, b) => a.priority - b.priority);
}

function buildRoadmap(advice: AdviceRule[], startAdvice: StartAdvice) {
  const phases = [
    { id: "0-30", period: "0-30 dagen", title: "Stabiliseren en scherpstellen", description: "Maak de diagnose concreet, beleg eigenaarschap en verwijder directe ruis.", items: [] as string[] },
    { id: "30-60", period: "30-60 dagen", title: "Inrichten en verbeteren", description: "Werk de belangrijkste verbeteringen uit in processen, inrichting, data en afspraken.", items: [] as string[] },
    { id: "60-90", period: "60-90 dagen", title: "Borgen en meten", description: "Zorg dat verbetering onderdeel wordt van overleg, rapportage en beheer.", items: [] as string[] },
    { id: "90+", period: "90+ dagen", title: "Doorontwikkelen via klantteam", description: "Zet een vast verbeterritme neer met backlog, prioritering en periodieke besluitvorming.", items: [] as string[] },
  ];
  if (startAdvice.status === "stabiliseren") phases[0].items.push("Voer eerst een stabilisatiescan uit op livegang, basisprocessen en openstaande implementatiepunten.");
  advice.forEach((item) => {
    phases[0].items.push(item.roadmap[0]);
    phases[1].items.push(item.roadmap[1]);
    phases[2].items.push(item.roadmap[2]);
    phases[3].items.push(item.roadmap[3]);
  });
  return phases.map((phase) => ({ ...phase, items: Array.from(new Set(phase.items.filter(Boolean))) }));
}

function getScoreInterpretation(score: number) {
  if (score < 1.5) return { label: "Niet of nauwelijks aanwezig", tone: "danger", description: "De basis ontbreekt grotendeels." };
  if (score < 3) return { label: "Ad hoc en persoonsafhankelijk", tone: "warning", description: "Veel hangt af van ervaring, gewoonte en losse afspraken." };
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
      button, input, textarea { font: inherit; }
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
      .stepper { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }
      .step { min-width: 0; border: 1px solid var(--line); background: white; color: var(--muted); border-radius: 16px; padding: 10px; display: flex; align-items: center; gap: 8px; justify-content: center; }
      .step span { width: 24px; height: 24px; display: grid; place-items: center; border-radius: 999px; background: var(--soft); font-size: 12px; font-weight: 900; }
      .step strong { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 13px; }
      .step.active { background: #0f172a; color: white; border-color: #0f172a; }
      .step.active span { background: rgba(255,255,255,.15); }
      .step.done { color: #115e59; border-color: #99f6e4; background: #f0fdfa; }

      .info-panel { background: #0f172a; color: white; border-radius: 24px; padding: 20px 24px; }
      .info-panel p { margin: 8px 0 0; color: rgba(255,255,255,.7); line-height: 1.6; }

      .wizard-wrap { min-height: calc(100vh - 190px); display: grid; place-items: center; padding: 24px 0; }
      .wizard-card { width: min(820px, 100%); background: white; border: 1px solid var(--line); border-radius: 34px; padding: 34px; box-shadow: 0 22px 60px rgba(15,23,42,.07); }
      .wizard-meta { display: flex; align-items: flex-start; gap: 18px; }
      .icon-bubble { flex: 0 0 auto; width: 52px; height: 52px; display: grid; place-items: center; border-radius: 18px; background: #0f172a; color: white; font-size: 24px; }
      .wizard-meta small, .screen-head small { color: var(--brand); font-weight: 900; text-transform: uppercase; letter-spacing: .08em; font-size: 12px; }
      .wizard-meta h1, .screen-head h1 { margin: 8px 0 0; font-size: clamp(28px, 4vw, 46px); line-height: 1.05; letter-spacing: -.045em; }
      .wizard-meta p, .screen-head p { margin: 12px 0 0; color: var(--text); line-height: 1.65; }
      .progress-line { height: 8px; background: var(--soft); border-radius: 999px; margin: 28px 0; overflow: hidden; }
      .progress-line div { height: 100%; background: var(--brand); border-radius: inherit; transition: width .2s ease; }
      .answer-zone { min-height: 220px; display: grid; align-content: center; }
      .diagnosis-context { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 16px; }
      .diagnosis-context span, .diagnosis-context strong, .diagnosis-context em, .diagnosis-context small { display: inline-flex; align-items: center; min-height: 28px; border-radius: 999px; padding: 6px 10px; background: var(--soft); font-size: 12px; font-style: normal; color: var(--text); }
      .diagnosis-context span { font-size: 15px; }

      .choice-row { display: flex; flex-wrap: wrap; gap: 10px; }
      .choice-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .chip, .choice-card { border: 1px solid var(--line); background: white; color: var(--text); font-weight: 800; border-radius: 999px; padding: 12px 18px; }
      .choice-card { min-height: 86px; border-radius: 22px; text-align: left; padding: 18px; }
      .chip:hover, .choice-card:hover, .secondary:hover, .ghost:hover { background: #f8fafc; }
      .chip.active, .choice-card.active, .primary { background: #0f172a; color: white; border-color: #0f172a; }
      .text-input, .text-area { width: 100%; border: 1px solid var(--line); border-radius: 22px; padding: 17px 18px; outline: none; color: var(--ink); }
      .text-area { min-height: 170px; resize: vertical; line-height: 1.6; }
      .text-input:focus, .text-area:focus { border-color: var(--brand); box-shadow: 0 0 0 4px rgba(15,118,110,.12); }
      .scale-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
      .scale { min-height: 94px; display: grid; place-items: center; gap: 5px; border: 1px solid var(--line); background: white; border-radius: 22px; }
      .scale strong { font-size: 28px; }
      .scale span { color: var(--muted); font-size: 12px; text-align: center; }
      .scale.active { background: #0f172a; color: white; border-color: #0f172a; }
      .scale.active span { color: rgba(255,255,255,.7); }

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

      .content-screen { background: white; border: 1px solid var(--line); border-radius: 34px; padding: 34px; box-shadow: 0 22px 60px rgba(15,23,42,.07); }
      .screen-head { max-width: 760px; margin-bottom: 28px; }
      .two-column-content { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 18px; }
      .panel { border: 1px solid var(--line); border-radius: 26px; padding: 22px; background: #fbfdff; }
      .panel h2, .roadmap-card h2 { margin: 0 0 16px; letter-spacing: -.025em; }
      .score-list, .advice-list { display: grid; gap: 13px; }
      .score-row { display: grid; gap: 8px; }
      .score-row > div:first-child { display: flex; justify-content: space-between; gap: 18px; }
      .score-row small { font-weight: 800; }
      .score-row small.danger { color: var(--danger); }
      .score-row small.warning { color: var(--warning); }
      .score-row small.neutral { color: var(--muted); }
      .score-row small.success { color: var(--success); }
      .bar { height: 8px; border-radius: 999px; background: #e5e7eb; overflow: hidden; }
      .bar span { display: block; height: 100%; background: var(--brand); border-radius: inherit; }
      .advice-card { border: 1px solid var(--line); background: white; border-radius: 22px; padding: 18px; }
      .advice-title { display: flex; align-items: flex-start; gap: 12px; }
      .advice-title > span { width: 42px; height: 42px; display: grid; place-items: center; background: var(--soft); border-radius: 15px; }
      .advice-title small { display: block; color: var(--muted); margin-bottom: 4px; }
      .advice-card p { color: var(--text); line-height: 1.6; }
      details { margin-top: 12px; }
      summary { cursor: pointer; font-weight: 900; color: var(--brand); }
      .mini-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
      .mini { background: var(--soft); border-radius: 16px; padding: 12px; }
      .mini strong { color: var(--muted); font-size: 12px; }
      .mini p { margin: 6px 0 0; font-size: 13px; }
      .empty { border: 1px dashed #cbd5e1; border-radius: 18px; padding: 22px; color: var(--muted); text-align: center; }

      .roadmap-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
      .roadmap-card { border: 1px solid var(--line); border-radius: 24px; padding: 20px; background: #fbfdff; }
      .roadmap-card > span { display: inline-flex; background: #0f172a; color: white; border-radius: 999px; padding: 7px 12px; font-size: 12px; font-weight: 900; margin-bottom: 16px; }
      .roadmap-card p { color: var(--text); line-height: 1.55; }
      .roadmap-items { display: grid; gap: 10px; margin-top: 16px; }
      .roadmap-items div { background: white; border: 1px solid var(--line); border-radius: 16px; padding: 12px; color: var(--text); font-size: 13px; line-height: 1.5; }
      .roadmap-items em { color: var(--muted); }

      .export-layout { grid-template-columns: 1fr 360px; }
      .action-panel { display: grid; align-content: start; gap: 12px; }
      .action-panel p { color: var(--text); line-height: 1.6; }
      pre { overflow: auto; background: #0f172a; color: #e2e8f0; border-radius: 20px; padding: 18px; line-height: 1.6; font-size: 13px; }
      .repo-pre { margin: 0; }
      .json-details { margin-top: 18px; }
      .json-details pre { max-height: 460px; }

      @media (max-width: 980px) {
        .page { padding: 12px; }
        .stepper { display: flex; overflow-x: auto; padding-bottom: 3px; }
        .step { flex: 0 0 auto; min-width: 132px; }
        .two-column-content, .export-layout, .roadmap-grid { grid-template-columns: 1fr; }
        .wizard-card, .content-screen, .intro-card { border-radius: 26px; padding: 24px; }
        .mini-grid { grid-template-columns: 1fr; }
      }

      @media (max-width: 640px) {
        .topbar-head, .wizard-meta, .wizard-footer, .screen-footer, .summary-row { flex-direction: column; align-items: stretch; }
        .choice-grid, .scale-grid { grid-template-columns: 1fr; }
        .wizard-footer span { text-align: center; }
        .primary, .secondary, .ghost { width: 100%; }
      }
    `}</style>
  );
}
