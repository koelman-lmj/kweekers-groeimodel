"use client";

import React, { useMemo, useState } from "react";

/**
 * Kweekers Groeimodel - standalone Next.js page
 * --------------------------------------------------
 * Plak dit volledige bestand in: app/page.tsx
 *
 * Deze versie gebruikt GEEN externe component libraries:
 * - geen shadcn/ui
 * - geen lucide-react
 * - geen framer-motion
 *
 * Daardoor is deze veel veiliger voor Vercel deploys.
 * De styling zit onderaan in <style jsx global>.
 */

type StepId =
  | "startcheck"
  | "profiel"
  | "scope"
  | "diagnose"
  | "duiding"
  | "roadmap"
  | "export";

type QuestionType = "choice" | "scale" | "open";

type Option = {
  value: string;
  label: string;
};

type Question = {
  id: string;
  type: QuestionType;
  kind: string;
  label: string;
  help?: string;
  isCore?: boolean;
  options?: Option[];
};

type Capability = {
  id: string;
  label: string;
  description: string;
  questions: Question[];
};

type GrowthArea = {
  id: string;
  label: string;
  icon: string;
  description: string;
  capabilities: Capability[];
};

type StartCheck = {
  afasLiveOneYear: string;
  keyProcessesOperational: string;
  enoughExperience: string;
  goal: string;
};

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

type StartAdvice = {
  status: "unknown" | "stabiliseren" | "quickscan" | "groeimodel";
  label: string;
  description: string;
  scopeHint: string;
  tone: "neutral" | "danger" | "warning" | "success";
};

const STEP_ORDER: StepId[] = [
  "startcheck",
  "profiel",
  "scope",
  "diagnose",
  "duiding",
  "roadmap",
  "export",
];

const STEPS: { id: StepId; label: string; title: string; subtitle: string; icon: string }[] = [
  {
    id: "startcheck",
    label: "Startcheck",
    title: "Is het groeimodel nu passend?",
    subtitle: "Eerst bepalen of er genoeg praktijkervaring is om volwassenheid betrouwbaar te meten.",
    icon: "✓",
  },
  {
    id: "profiel",
    label: "Klantprofiel",
    title: "Begrijp de context van de klant",
    subtitle: "Leg vast welk type organisatie je beoordeelt en welke complexiteit meespeelt.",
    icon: "🏢",
  },
  {
    id: "scope",
    label: "Scope",
    title: "Kies de juiste diepgang",
    subtitle: "Niet elke klant heeft een volledige scan nodig. Kies gericht wat je onderzoekt.",
    icon: "🎯",
  },
  {
    id: "diagnose",
    label: "Diagnose",
    title: "Meet per groeigebied en capability",
    subtitle: "Vragen zijn gegroepeerd zodat bevindingen logisch naar advies worden vertaald.",
    icon: "🔎",
  },
  {
    id: "duiding",
    label: "Duiding",
    title: "Van antwoord naar advies",
    subtitle: "Vertaal scores naar FIT, GAP, SOLL, risico en adviesrichting.",
    icon: "🧭",
  },
  {
    id: "roadmap",
    label: "Roadmap",
    title: "Maak verbetering uitvoerbaar",
    subtitle: "Koppel bevindingen aan een concrete 0-30-60-90 dagen aanpak.",
    icon: "🛣️",
  },
  {
    id: "export",
    label: "Export",
    title: "Gebruik de output in rapportage en GitHub",
    subtitle: "Maak de resultaten geschikt voor rapport, backlog en configuratiebeheer.",
    icon: "⬇",
  },
];

const YES_PARTLY_NO: Option[] = [
  { value: "ja", label: "Ja" },
  { value: "deels", label: "Deels" },
  { value: "nee", label: "Nee" },
];

const YES_PARTLY_NO_UNKNOWN: Option[] = [
  ...YES_PARTLY_NO,
  { value: "onbekend", label: "Onbekend" },
];

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

const SCOPE_OPTIONS: { id: string; label: string; description: string; icon: string }[] = [
  {
    id: "volledige_scan",
    label: "Volledige volwassenheidsscan",
    description: "Brede diagnose over organisatie, processen, AFAS, integraties, data, beheer en adoptie.",
    icon: "🌐",
  },
  {
    id: "quickscan",
    label: "Quickscan",
    description: "Lichte eerste diagnose om snel richting te bepalen en vervolgstappen te kiezen.",
    icon: "⚡",
  },
  {
    id: "afas_optimalisatie",
    label: "AFAS-optimalisatie",
    description: "Gericht op inrichting, gebruik, workflows, autorisaties en standaardisatie.",
    icon: "⚙️",
  },
  {
    id: "finance_scan",
    label: "Finance-scan",
    description: "Focus op financiële processen, datakwaliteit, facturatie, rapportage en afsluiting.",
    icon: "💶",
  },
  {
    id: "data_rapportage",
    label: "Data & rapportage",
    description: "Focus op KPI-definities, datakwaliteit, dashboards en besluitvorming.",
    icon: "📊",
  },
  {
    id: "integraties",
    label: "Integraties & keten",
    description: "Focus op koppelingen, ketenprocessen, foutafhandeling en eigenaarschap.",
    icon: "🔗",
  },
  {
    id: "governance",
    label: "Governance & beheer",
    description: "Focus op rollen, eigenaarschap, verbeterbacklog, releaseproces en klantteam.",
    icon: "🧩",
  },
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

const GROWTH_AREAS: GrowthArea[] = [
  {
    id: "organisatie",
    label: "Organisatie & eigenaarschap",
    icon: "👥",
    description: "Bepaalt of rollen, verantwoordelijkheden en besluitvorming duidelijk zijn belegd.",
    capabilities: [
      {
        id: "organisatie_proceseigenaarschap",
        label: "Proceseigenaarschap",
        description: "Duidelijk is wie eigenaar is van processen, inrichting, data en verbetering.",
        questions: [
          {
            id: "q_org_001",
            type: "choice",
            kind: "Klantinput",
            isCore: true,
            label: "Weet iedereen wie verantwoordelijk is voor de belangrijkste processen?",
            help: "Denk aan Finance, HRM, projecten, CRM, facturatie, rapportage en beheer.",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_org_002",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe volwassen is proceseigenaarschap op dit moment?",
            help: "Score laag als eigenaarschap informeel, persoonsafhankelijk of onduidelijk is.",
          },
          {
            id: "q_org_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar blijkt eigenaarschap of het ontbreken daarvan uit?",
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
            kind: "Klantinput",
            isCore: true,
            label: "Is er een vast overleg of klantteam waarin verbeteringen worden besproken en geprioriteerd?",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_org_005",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe volwassen is besluitvorming rondom verbetering en beheer?",
          },
        ],
      },
    ],
  },
  {
    id: "processen",
    label: "Processen & werkwijze",
    icon: "🔁",
    description: "Laat zien of de organisatie werkt vanuit duidelijke processen of vanuit losse afspraken en uitzonderingen.",
    capabilities: [
      {
        id: "processen_standaardisatie",
        label: "Standaardisatie van werkwijze",
        description: "Processen zijn eenduidig, herhaalbaar en uitlegbaar.",
        questions: [
          {
            id: "q_proc_001",
            type: "choice",
            kind: "Klantinput",
            isCore: true,
            label: "Worden processen meestal op dezelfde manier uitgevoerd?",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_proc_002",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe volwassen is de standaardisatie van de belangrijkste processen?",
          },
          {
            id: "q_proc_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Waar ontstaan de meeste uitzonderingen of handmatige correcties?",
          },
        ],
      },
      {
        id: "processen_fit_gap_soll",
        label: "IST, FIT, GAP en SOLL",
        description: "De huidige situatie, passende inrichting, ontbrekende zaken en gewenste situatie zijn scherp.",
        questions: [
          {
            id: "q_proc_004",
            type: "choice",
            kind: "Klantinput",
            isCore: true,
            label: "Is duidelijk wat goed werkt en wat verbetering vraagt?",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_proc_005",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe goed kan de organisatie IST, FIT, GAP en SOLL onderscheiden?",
          },
        ],
      },
    ],
  },
  {
    id: "afas",
    label: "AFAS-inrichting & gebruik",
    icon: "⚙️",
    description: "Beoordeelt of AFAS logisch is ingericht, goed wordt gebruikt en de standaard ondersteunt.",
    capabilities: [
      {
        id: "afas_standaardgebruik",
        label: "Gebruik van AFAS-standaard",
        description: "De standaardfunctionaliteit is waar mogelijk de makkelijkste route voor de gebruiker.",
        questions: [
          {
            id: "q_afas_001",
            type: "choice",
            kind: "Klantinput",
            isCore: true,
            label: "Is de AFAS-werkwijze voor gebruikers logisch en makkelijk te volgen?",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_afas_002",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe volwassen is het gebruik van AFAS-standaardfunctionaliteit?",
          },
          {
            id: "q_afas_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Welke workarounds of Excel-lijsten worden naast AFAS gebruikt?",
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
            kind: "Klantinput",
            isCore: true,
            label: "Worden taken en goedkeuringen zoveel mogelijk via AFAS/InSite afgehandeld?",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_afas_005",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe volwassen zijn workflows, autorisaties en InSite-gebruik?",
          },
        ],
      },
    ],
  },
  {
    id: "integraties",
    label: "Integraties & keten",
    icon: "🔗",
    description: "Beoordeelt of koppelingen betrouwbaar, beheersbaar en onderdeel van het proces zijn.",
    capabilities: [
      {
        id: "integraties_betrouwbaarheid",
        label: "Betrouwbaarheid van koppelingen",
        description: "Integraties werken voorspelbaar en fouten zijn tijdig zichtbaar.",
        questions: [
          {
            id: "q_int_001",
            type: "choice",
            kind: "Klantinput",
            isCore: true,
            label: "Zijn fouten in koppelingen snel zichtbaar en duidelijk op te lossen?",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_int_002",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe volwassen is beheer en monitoring van integraties?",
          },
          {
            id: "q_int_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Welke koppelingen zijn kritisch voor de dagelijkse operatie?",
          },
        ],
      },
      {
        id: "integraties_eigenaarschap",
        label: "Ketenverantwoordelijkheid",
        description: "Duidelijk is wie eigenaar is van proces, data en foutafhandeling over systemen heen.",
        questions: [
          {
            id: "q_int_004",
            type: "choice",
            kind: "Klantinput",
            isCore: true,
            label: "Is duidelijk wie verantwoordelijk is voor ketenproblemen over systemen heen?",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_int_005",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe volwassen is ketenverantwoordelijkheid?",
          },
        ],
      },
    ],
  },
  {
    id: "data",
    label: "Data & rapportage",
    icon: "📊",
    description: "Laat zien of data betrouwbaar is, definities duidelijk zijn en rapportages worden gebruikt voor sturing.",
    capabilities: [
      {
        id: "data_kpi_definities",
        label: "KPI-definities",
        description: "Cijfers zijn eenduidig gedefinieerd en geaccepteerd.",
        questions: [
          {
            id: "q_data_001",
            type: "choice",
            kind: "Klantinput",
            isCore: true,
            label: "Zijn KPI's en rapportagedefinities eenduidig vastgelegd?",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_data_002",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe volwassen zijn KPI-definities en rapportageafspraken?",
          },
          {
            id: "q_data_003",
            type: "open",
            kind: "Signaalvraag",
            label: "Over welke cijfers ontstaat discussie?",
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
            kind: "Klantinput",
            isCore: true,
            label: "Is duidelijk wie verantwoordelijk is voor datakwaliteit en stamgegevens?",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_data_005",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe volwassen is datakwaliteit en stamgegevensbeheer?",
          },
        ],
      },
    ],
  },
  {
    id: "beheer",
    label: "Beheer & doorontwikkeling",
    icon: "🧩",
    description: "Beoordeelt of verbeteren, testen, releases en beheer structureel zijn georganiseerd.",
    capabilities: [
      {
        id: "beheer_backlog",
        label: "Verbeterbacklog",
        description: "Wensen, incidenten en verbeteringen worden centraal beheerd en geprioriteerd.",
        questions: [
          {
            id: "q_beh_001",
            type: "choice",
            kind: "Klantinput",
            isCore: true,
            label: "Is er één centrale lijst met verbeterpunten, wensen en besluiten?",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_beh_002",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe volwassen is backlogbeheer en prioritering?",
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
            kind: "Klantinput",
            isCore: true,
            label: "Worden wijzigingen getest voordat ze breed worden toegepast?",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_beh_004",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe volwassen is test- en releasebeheer?",
          },
          {
            id: "q_beh_005",
            type: "open",
            kind: "Bewijsvraag",
            label: "Welke voorbeelden zijn er van recente wijzigingen en hoe zijn die geborgd?",
          },
        ],
      },
    ],
  },
  {
    id: "adoptie",
    label: "Adoptie & veranderkracht",
    icon: "🌱",
    description: "Laat zien of mensen de afgesproken werkwijze echt gebruiken en of de organisatie kan blijven verbeteren.",
    capabilities: [
      {
        id: "adoptie_gebruik",
        label: "Gebruikersadoptie",
        description: "Gebruikers begrijpen waarom en hoe zij de ingerichte processen gebruiken.",
        questions: [
          {
            id: "q_ado_001",
            type: "choice",
            kind: "Klantinput",
            isCore: true,
            label: "Gebruiken medewerkers de afgesproken werkwijze zoals bedoeld?",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_ado_002",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe volwassen is gebruikersadoptie?",
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
            kind: "Klantinput",
            isCore: true,
            label: "Worden proceswijzigingen duidelijk gecommuniceerd en uitgelegd?",
            options: YES_PARTLY_NO_UNKNOWN,
          },
          {
            id: "q_ado_004",
            type: "scale",
            kind: "Consultantbeoordeling",
            isCore: true,
            label: "Hoe volwassen is communicatie en leervermogen rond veranderingen?",
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
    description: "Eigenaarschap is onvoldoende geborgd. Daardoor blijft verbetering afhankelijk van personen in plaats van structuur.",
    fit: "Er is vaak praktische kennis aanwezig bij medewerkers.",
    gap: "Rollen, besluiten en verantwoordelijkheid voor verbetering zijn onvoldoende expliciet.",
    soll: "Per kernproces is duidelijk wie eigenaar is van proces, inrichting, data en verbeteringen.",
    roadmap: [
      "Benoem per kernproces een proceseigenaar en leg verantwoordelijkheden vast.",
      "Richt een eenvoudig besluitritme in voor proces- en inrichtingskeuzes.",
      "Maak eigenaarschap zichtbaar in overlegstructuur, rapportage en backlog.",
      "Borg proceseigenaarschap in het klantteam en periodieke roadmapsturing.",
    ],
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
    gap: "De werkwijze is onvoldoende uniform en daardoor lastig schaalbaar of overdraagbaar.",
    soll: "Belangrijke processen zijn helder, eenvoudig en sluiten aan op AFAS en de dagelijkse praktijk.",
    roadmap: [
      "Breng per hoofdproces de huidige werkwijze en grootste uitzonderingen in kaart.",
      "Kies per proces de gewenste standaardroute en bepaal welke uitzonderingen blijven bestaan.",
      "Leg processen vast in eenvoudige taal en koppel ze aan AFAS-inrichting en rollen.",
      "Gebruik periodieke reviews om uitzonderingen structureel terug te dringen.",
    ],
  },
  {
    id: "adv_afas_001",
    areaId: "afas",
    capabilityId: "afas_standaardgebruik",
    maxScore: 3,
    priority: 3,
    title: "Verminder workarounds naast AFAS",
    description: "Als gebruikers structureel naast AFAS werken, ontstaat datavervuiling, dubbel werk en minder grip.",
    fit: "AFAS vormt al een centrale basis voor meerdere processen.",
    gap: "De inrichting of werkwijze sluit nog niet voldoende aan op wat gebruikers nodig hebben.",
    soll: "AFAS ondersteunt de standaardroute en maakt afwijkend werken minder aantrekkelijk.",
    roadmap: [
      "Inventariseer Excel-lijsten, handmatige controles en alternatieve werkwijzen naast AFAS.",
      "Bepaal welke workarounds verdwijnen, blijven of tijdelijk worden geaccepteerd.",
      "Pas inrichting, weergaves, workflows of autorisaties gericht aan.",
      "Meet periodiek of gebruik van workarounds daadwerkelijk afneemt.",
    ],
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
    soll: "Kritische koppelingen hebben duidelijke eigenaar, controles, foutproces en impactanalyse.",
    roadmap: [
      "Maak een overzicht van kritische koppelingen, datastromen en afhankelijkheden.",
      "Leg per koppeling eigenaar, controlepunt en foutproces vast.",
      "Richt monitoring en periodieke controle in voor kritische ketenprocessen.",
      "Neem integraties structureel op in releasebeheer en klantteamoverleg.",
    ],
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
    gap: "Definities, eigenaarschap en interpretatie van cijfers zijn onvoldoende vastgelegd.",
    soll: "KPI's hebben een eigenaar, definitie, bron, berekening en gebruiksdoel.",
    roadmap: [
      "Inventariseer belangrijkste stuurinformatie en cijfers waar discussie over ontstaat.",
      "Leg definities, databronnen en eigenaren vast in een KPI-handboek.",
      "Stem dashboards af op besluitvorming en overlegstructuur.",
      "Borg KPI-definities via beheerproces en wijzigingsafspraken.",
    ],
  },
  {
    id: "adv_beh_001",
    areaId: "beheer",
    capabilityId: "beheer_backlog",
    maxScore: 3,
    priority: 3,
    title: "Richt een centrale verbeterbacklog in",
    description: "Zonder centrale backlog raken wensen, besluiten en verbeterpunten versnipperd over mail, Teams en losse lijstjes.",
    fit: "Verbeterpunten zijn vaak bekend bij medewerkers of key users.",
    gap: "Er is onvoldoende centrale prioritering, eigenaarschap en opvolging.",
    soll: "Alle verbeteringen worden centraal vastgelegd, geprioriteerd en periodiek opgevolgd.",
    roadmap: [
      "Maak één centrale backlog met wensen, incidenten, besluiten en verbeterpunten.",
      "Bepaal prioriteringscriteria zoals impact, urgentie, risico en capaciteit.",
      "Koppel backlog aan releaseplanning, testafspraken en communicatie.",
      "Bespreek de backlog periodiek in het klantteam.",
    ],
  },
  {
    id: "adv_ado_001",
    areaId: "adoptie",
    capabilityId: "adoptie_gebruik",
    maxScore: 3,
    priority: 4,
    title: "Versterk adoptie met uitleg, training en feedback",
    description: "Als medewerkers de werkwijze niet begrijpen of niet herkennen, blijft de inrichting kwetsbaar.",
    fit: "Gebruikers hebben vaak praktische kennis en weten waar het schuurt.",
    gap: "Uitleg, training, communicatie en feedback zijn onvoldoende structureel ingericht.",
    soll: "Gebruikers begrijpen de werkwijze, weten waarom deze nodig is en kunnen feedback geven.",
    roadmap: [
      "Inventariseer waar gebruikers afwijken van de afgesproken werkwijze en waarom.",
      "Maak korte werkinstructies en organiseer gerichte uitleg per rol.",
      "Richt feedbackmomenten in na proceswijzigingen of releases.",
      "Borg adoptie als vast onderdeel van doorontwikkeling en klantteamaanpak.",
    ],
  },
];

export default function Page() {
  const [activeStep, setActiveStep] = useState<StepId>("startcheck");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("organisatie");
  const [startCheck, setStartCheck] = useState<StartCheck>({
    afasLiveOneYear: "",
    keyProcessesOperational: "",
    enoughExperience: "",
    goal: "",
  });
  const [profile, setProfile] = useState<CustomerProfile>({
    customerName: "",
    sector: "",
    size: "",
    administrations: "",
    modules: [],
    integrations: "",
    reporting: "",
    reason: "",
  });
  const [scope, setScope] = useState<string>("volledige_scan");
  const [answers, setAnswers] = useState<Record<string, string | number>>(createInitialAnswers());
  const [consultantNotes, setConsultantNotes] = useState<Record<string, string>>({});
  const [copyStatus, setCopyStatus] = useState<string>("");

  const currentIndex = STEP_ORDER.indexOf(activeStep);
  const visibleAreas = useMemo(() => filterAreasByScope(GROWTH_AREAS, scope), [scope]);
  const selectedArea = visibleAreas.find((area) => area.id === selectedAreaId) ?? visibleAreas[0] ?? GROWTH_AREAS[0];
  const startAdvice = useMemo(() => getStartAdvice(startCheck), [startCheck]);
  const scores = useMemo(() => calculateScores(answers), [answers]);
  const advice = useMemo(() => getTriggeredAdvice(scores), [scores]);
  const roadmap = useMemo(() => buildRoadmap(advice, startAdvice), [advice, startAdvice]);
  const exportPayload = useMemo(
    () => ({
      meta: {
        model: "Kweekers Groeimodel",
        version: "1.0-standalone",
        generatedAt: new Date().toISOString(),
      },
      startCheck,
      profile,
      scope,
      answers,
      consultantNotes,
      scores,
      advice,
      roadmap,
      hierarchy: [
        "Groeigebied",
        "Capability",
        "Vraag",
        "Antwoord",
        "Score",
        "Adviesregel",
        "Roadmapactie",
        "Rapportagetekst",
      ],
    }),
    [startCheck, profile, scope, answers, consultantNotes, scores, advice, roadmap]
  );

  function goNext() {
    const next = STEP_ORDER[Math.min(currentIndex + 1, STEP_ORDER.length - 1)];
    setActiveStep(next);
  }

  function goPrevious() {
    const previous = STEP_ORDER[Math.max(currentIndex - 1, 0)];
    setActiveStep(previous);
  }

  function updateAnswer(questionId: string, value: string | number) {
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  }

  function updateNote(areaId: string, value: string) {
    setConsultantNotes((previous) => ({ ...previous, [areaId]: value }));
  }

  function toggleModule(moduleValue: string) {
    setProfile((previous) => ({
      ...previous,
      modules: previous.modules.includes(moduleValue)
        ? previous.modules.filter((value) => value !== moduleValue)
        : [...previous.modules, moduleValue],
    }));
  }

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
      setCopyStatus("JSON gekopieerd");
      window.setTimeout(() => setCopyStatus(""), 2500);
    } catch {
      setCopyStatus("Kopiëren niet gelukt");
    }
  }

  function downloadExport() {
    const json = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kweekers-groeimodel-diagnose.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="kg-page">
      <div className="kg-container">
        <Hero />

        <div className="kg-layout">
          <aside className="kg-sidebar">
            <StepMenu activeStep={activeStep} setActiveStep={setActiveStep} />
            <ScoreCard scores={scores} />
            <StartAdviceCard advice={startAdvice} />
          </aside>

          <section className="kg-main">
            <StepHeader activeStep={activeStep} currentIndex={currentIndex} />

            {activeStep === "startcheck" && (
              <StartCheckStep data={startCheck} setData={setStartCheck} advice={startAdvice} onNext={goNext} />
            )}

            {activeStep === "profiel" && (
              <ProfileStep
                profile={profile}
                setProfile={setProfile}
                toggleModule={toggleModule}
                onNext={goNext}
              />
            )}

            {activeStep === "scope" && (
              <ScopeStep scope={scope} setScope={setScope} advice={startAdvice} onNext={goNext} />
            )}

            {activeStep === "diagnose" && (
              <DiagnosisStep
                areas={visibleAreas}
                selectedArea={selectedArea}
                setSelectedAreaId={setSelectedAreaId}
                answers={answers}
                updateAnswer={updateAnswer}
                scores={scores}
                consultantNotes={consultantNotes}
                updateNote={updateNote}
              />
            )}

            {activeStep === "duiding" && <InterpretationStep scores={scores} advice={advice} notes={consultantNotes} />}

            {activeStep === "roadmap" && <RoadmapStep roadmap={roadmap} scores={scores} />}

            {activeStep === "export" && (
              <ExportStep
                exportPayload={exportPayload}
                copyStatus={copyStatus}
                copyExport={copyExport}
                downloadExport={downloadExport}
              />
            )}

            <FooterNavigation currentIndex={currentIndex} goPrevious={goPrevious} goNext={goNext} />
          </section>
        </div>
      </div>

      <GlobalStyles />
    </main>
  );
}

function Hero() {
  return (
    <section className="hero-card">
      <div>
        <div className="badge-row">
          <span className="badge badge-green">Kweekers Groeimodel</span>
          <span className="badge">Diagnosemodel</span>
          <span className="badge">Consultant-assistent</span>
        </div>
        <h1>Van vragenlijst naar begeleide volwassenheidsdiagnose.</h1>
        <p>
          Deze app helpt om de huidige situatie, wat al passend werkt, wat ontbreekt en wat de gewenste volgende stap is
          gestructureerd te bepalen. Niet alleen voor AFAS, maar ook voor organisatie, processen, integraties, data,
          rapportage en veranderkracht.
        </p>
      </div>
      <div className="hero-panel">
        <div className="hero-panel-title">Kernstructuur</div>
        <div className="hero-panel-main">Check → Begrijp → Meet → Duid → Adviseer</div>
        <ul>
          <li>Startcheck als poortwachter</li>
          <li>Klantprofiel bepaalt context</li>
          <li>Capabilities als ontbrekende tussenlaag</li>
          <li>Adviesregels vertalen score naar actie</li>
          <li>Roadmap maakt verbetering uitvoerbaar</li>
        </ul>
      </div>
    </section>
  );
}

function StepMenu({ activeStep, setActiveStep }: { activeStep: StepId; setActiveStep: (step: StepId) => void }) {
  return (
    <div className="card sidebar-card">
      <div className="eyebrow">App-flow</div>
      <div className="step-list">
        {STEPS.map((step, index) => (
          <button
            key={step.id}
            className={`step-button ${activeStep === step.id ? "active" : ""}`}
            onClick={() => setActiveStep(step.id)}
            type="button"
          >
            <span className="step-icon">{step.icon}</span>
            <span className="step-text">
              <strong>
                {index + 1}. {step.label}
              </strong>
              <small>{step.title}</small>
            </span>
            <span className="step-arrow">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScoreCard({ scores }: { scores: Scores }) {
  const average = Number.isFinite(scores.overall) ? scores.overall : 0;
  return (
    <div className="card score-card">
      <div>
        <div className="muted">Gemiddelde volwassenheid</div>
        <div className="big-score">{average.toFixed(1)}</div>
      </div>
      <ProgressBar value={(average / 7) * 100} />
      <p className="small-text">Score is indicatief. De consultant blijft leidend in de duiding en het advies.</p>
    </div>
  );
}

function StartAdviceCard({ advice }: { advice: StartAdvice }) {
  return (
    <div className="card">
      <h3>Startadvies</h3>
      <div className={`message ${advice.tone}`}>{advice.label}</div>
    </div>
  );
}

function StepHeader({ activeStep, currentIndex }: { activeStep: StepId; currentIndex: number }) {
  const step = STEPS.find((item) => item.id === activeStep) ?? STEPS[0];
  return (
    <section className="card step-header">
      <div className="step-header-left">
        <div className="large-icon">{step.icon}</div>
        <div>
          <div className="eyebrow">Stap {currentIndex + 1} van {STEPS.length}</div>
          <h2>{step.title}</h2>
          <p>{step.subtitle}</p>
        </div>
      </div>
      <div className="step-progress">
        <ProgressBar value={((currentIndex + 1) / STEPS.length) * 100} />
        <small>{Math.round(((currentIndex + 1) / STEPS.length) * 100)}% compleet</small>
      </div>
    </section>
  );
}

function StartCheckStep({
  data,
  setData,
  advice,
  onNext,
}: {
  data: StartCheck;
  setData: (data: StartCheck) => void;
  advice: StartAdvice;
  onNext: () => void;
}) {
  return (
    <div className="two-col">
      <div className="card">
        <SectionTitle
          icon="✓"
          title="Vast uitgangspunt"
          description="Deze check hoort boven de tool te staan. Het is geen gewone vraag, maar de toegangspoort tot het groeimodel."
        />
        <div className="question-stack">
          <ChoiceQuestion
            label="Werkt de klant minimaal één jaar volledig operationeel met AFAS?"
            value={data.afasLiveOneYear}
            onChange={(value) => setData({ ...data, afasLiveOneYear: value })}
            options={YES_PARTLY_NO}
          />
          <ChoiceQuestion
            label="Zijn de belangrijkste bedrijfsprocessen rondom AFAS daadwerkelijk in gebruik?"
            value={data.keyProcessesOperational}
            onChange={(value) => setData({ ...data, keyProcessesOperational: value })}
            options={YES_PARTLY_NO}
          />
          <ChoiceQuestion
            label="Is er voldoende praktijkervaring om IST, FIT, GAP en SOLL betrouwbaar te bepalen?"
            value={data.enoughExperience}
            onChange={(value) => setData({ ...data, enoughExperience: value })}
            options={YES_PARTLY_NO_UNKNOWN}
          />
          <ChoiceQuestion
            label="Wat is de primaire aanleiding?"
            value={data.goal}
            onChange={(value) => setData({ ...data, goal: value })}
            options={GOAL_OPTIONS}
          />
        </div>
      </div>

      <div className="card side-panel">
        <SectionTitle icon="✨" title="Uitkomst" description="De app bepaalt hiermee of een volledige volwassenheidsmeting passend is." />
        <div className={`message large ${advice.tone}`}>
          <strong>{advice.label}</strong>
          <span>{advice.description}</span>
        </div>
        <button className="primary-button full" onClick={onNext} type="button">
          Verder naar klantprofiel →
        </button>
      </div>
    </div>
  );
}

function ProfileStep({
  profile,
  setProfile,
  toggleModule,
  onNext,
}: {
  profile: CustomerProfile;
  setProfile: (profile: CustomerProfile) => void;
  toggleModule: (moduleValue: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="two-col">
      <div className="card">
        <SectionTitle
          icon="🏢"
          title="Klantprofiel"
          description="Deze laag voorkomt dat iedere klant dezelfde vragen krijgt. Context bepaalt welke verdieping nodig is."
        />

        <div className="form-grid">
          <Field label="Klantnaam">
            <input
              value={profile.customerName}
              onChange={(event) => setProfile({ ...profile, customerName: event.target.value })}
              placeholder="Bijv. Participe, Environ, Codarts"
            />
          </Field>
          <SelectButtons label="Sector" value={profile.sector} onChange={(value) => setProfile({ ...profile, sector: value })} options={SECTOR_OPTIONS} />
          <SelectButtons label="Organisatieomvang" value={profile.size} onChange={(value) => setProfile({ ...profile, size: value })} options={SIZE_OPTIONS} />
          <SelectButtons label="Aantal administraties" value={profile.administrations} onChange={(value) => setProfile({ ...profile, administrations: value })} options={ADMIN_OPTIONS} />
          <SelectButtons label="Integratiecomplexiteit" value={profile.integrations} onChange={(value) => setProfile({ ...profile, integrations: value })} options={COMPLEXITY_OPTIONS} />
          <SelectButtons label="Rapportagevolwassenheid" value={profile.reporting} onChange={(value) => setProfile({ ...profile, reporting: value })} options={REPORTING_OPTIONS} />
        </div>

        <div className="field-block">
          <label>AFAS-modules in scope</label>
          <div className="button-wrap">
            {MODULE_OPTIONS.map((module) => (
              <button
                key={module.value}
                type="button"
                className={`chip ${profile.modules.includes(module.value) ? "active" : ""}`}
                onClick={() => toggleModule(module.value)}
              >
                {module.label}
              </button>
            ))}
          </div>
        </div>

        <SelectButtons label="Primaire aanleiding" value={profile.reason} onChange={(value) => setProfile({ ...profile, reason: value })} options={REASON_OPTIONS} />
      </div>

      <div className="card side-panel">
        <SectionTitle icon="🧭" title="Routinglogica" description="Later kan dit profiel automatisch bepalen welke vragen zichtbaar worden." />
        <div className="routing-list">
          <RoutingPreview label="Sector" value={profile.sector || "Nog niet gekozen"} />
          <RoutingPreview label="Modules" value={profile.modules.length ? `${profile.modules.length} geselecteerd` : "Nog niet gekozen"} />
          <RoutingPreview label="Integraties" value={profile.integrations || "Nog niet gekozen"} />
          <RoutingPreview label="Rapportage" value={profile.reporting || "Nog niet gekozen"} />
        </div>
        <button className="primary-button full" onClick={onNext} type="button">
          Verder naar scope →
        </button>
      </div>
    </div>
  );
}

function ScopeStep({
  scope,
  setScope,
  advice,
  onNext,
}: {
  scope: string;
  setScope: (scope: string) => void;
  advice: StartAdvice;
  onNext: () => void;
}) {
  return (
    <div className="two-col">
      <div className="card">
        <SectionTitle
          icon="🎯"
          title="Scope kiezen"
          description="De tool moet licht kunnen starten en alleen verdiepen waar dat nodig is. Zo voelt het minder zwaar en meer adviserend."
        />
        <div className="scope-grid">
          {SCOPE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`scope-card ${scope === option.id ? "active" : ""}`}
              onClick={() => setScope(option.id)}
            >
              <span className="scope-icon">{option.icon}</span>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="card side-panel">
        <SectionTitle icon="💡" title="Advies bij scope" description="Scope hangt samen met de startcheck." />
        <div className={`message large ${advice.tone}`}>
          <strong>{advice.label}</strong>
          <span>{advice.scopeHint}</span>
        </div>
        <button className="primary-button full" onClick={onNext} type="button">
          Start diagnose →
        </button>
      </div>
    </div>
  );
}

function DiagnosisStep({
  areas,
  selectedArea,
  setSelectedAreaId,
  answers,
  updateAnswer,
  scores,
  consultantNotes,
  updateNote,
}: {
  areas: GrowthArea[];
  selectedArea: GrowthArea;
  setSelectedAreaId: (id: string) => void;
  answers: Record<string, string | number>;
  updateAnswer: (questionId: string, value: string | number) => void;
  scores: Scores;
  consultantNotes: Record<string, string>;
  updateNote: (areaId: string, value: string) => void;
}) {
  return (
    <div className="diagnosis-layout">
      <div className="card area-menu">
        <div className="eyebrow">Groeigebieden</div>
        {areas.map((area) => {
          const score = scores.byArea[area.id]?.score ?? 0;
          return (
            <button
              key={area.id}
              type="button"
              className={`area-button ${selectedArea.id === area.id ? "active" : ""}`}
              onClick={() => setSelectedAreaId(area.id)}
            >
              <span>{area.icon}</span>
              <strong>{area.label}</strong>
              <small>{score.toFixed(1)} / 7</small>
            </button>
          );
        })}
      </div>

      <div className="diagnosis-content">
        <div className="card area-header">
          <SectionTitle icon={selectedArea.icon} title={selectedArea.label} description={selectedArea.description} />
          <div className="area-score">
            <span>{(scores.byArea[selectedArea.id]?.score ?? 0).toFixed(1)}</span>
            <small>van 7</small>
          </div>
        </div>

        {selectedArea.capabilities.map((capability) => (
          <CapabilityCard
            key={capability.id}
            capability={capability}
            answers={answers}
            updateAnswer={updateAnswer}
            score={scores.byCapability[capability.id]?.score ?? 0}
          />
        ))}

        <div className="card">
          <SectionTitle
            icon="📝"
            title="Consultantbeoordeling"
            description="Scheid klantinput van professionele duiding. Hier leg je bewijs, nuance en interpretatie vast."
          />
          <textarea
            value={consultantNotes[selectedArea.id] ?? ""}
            onChange={(event) => updateNote(selectedArea.id, event.target.value)}
            placeholder="Bijv. eigenaarschap is informeel belegd, waardoor verbetering afhankelijk is van personen in plaats van structuur."
          />
        </div>
      </div>
    </div>
  );
}

function CapabilityCard({
  capability,
  answers,
  updateAnswer,
  score,
}: {
  capability: Capability;
  answers: Record<string, string | number>;
  updateAnswer: (questionId: string, value: string | number) => void;
  score: number;
}) {
  return (
    <div className="card capability-card">
      <div className="capability-head">
        <div>
          <div className="eyebrow green">Capability</div>
          <h3>{capability.label}</h3>
          <p>{capability.description}</p>
        </div>
        <div className="capability-score">
          <small>Score</small>
          <strong>{score.toFixed(1)}</strong>
        </div>
      </div>

      <div className="question-stack">
        {capability.questions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            value={answers[question.id] ?? ""}
            onChange={(value) => updateAnswer(question.id, value)}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionRenderer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string | number;
  onChange: (value: string | number) => void;
}) {
  if (question.type === "scale") {
    return (
      <div className="question-box">
        <QuestionHeader question={question} />
        <div className="scale-grid">
          {DIP_SCALE.map((score) => (
            <button
              key={score.value}
              type="button"
              className={`scale-button ${Number(value) === score.value ? "active" : ""}`}
              onClick={() => onChange(score.value)}
            >
              <strong>{score.value}</strong>
              <small>{score.label}</small>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === "open") {
    return (
      <div className="question-box">
        <QuestionHeader question={question} />
        <textarea
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Korte toelichting, signaal of voorbeeld..."
        />
      </div>
    );
  }

  return (
    <div className="question-box">
      <QuestionHeader question={question} />
      <div className="button-wrap">
        {(question.options ?? YES_PARTLY_NO_UNKNOWN).map((option) => (
          <button
            key={option.value}
            type="button"
            className={`chip ${value === option.value ? "active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuestionHeader({ question }: { question: Question }) {
  return (
    <div className="question-head">
      <div className="badge-row compact">
        <span className="badge">{question.kind}</span>
        {question.isCore ? <span className="badge badge-green">Kernvraag</span> : null}
      </div>
      <strong>{question.label}</strong>
      {question.help ? <p>{question.help}</p> : null}
    </div>
  );
}

function InterpretationStep({ scores, advice, notes }: { scores: Scores; advice: AdviceRule[]; notes: Record<string, string> }) {
  return (
    <div className="stack">
      <div className="card">
        <SectionTitle
          icon="🧭"
          title="Duiding per groeigebied"
          description="De app toont niet alleen een score, maar vertaalt deze naar FIT, GAP, SOLL, risico en adviesrichting."
        />
        <div className="interpret-grid">
          {GROWTH_AREAS.map((area) => {
            const score = scores.byArea[area.id]?.score ?? 0;
            const interpretation = getScoreInterpretation(score);
            return (
              <div className="interpret-card" key={area.id}>
                <div className="interpret-top">
                  <span className="round-icon">{area.icon}</span>
                  <span className="interpret-score">{score.toFixed(1)}</span>
                </div>
                <h3>{area.label}</h3>
                <span className={`status-pill ${interpretation.tone}`}>{interpretation.label}</span>
                <p>{interpretation.description}</p>
                {notes[area.id] ? <div className="note-box">{notes[area.id]}</div> : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <SectionTitle
          icon="✨"
          title="Geactiveerde adviesregels"
          description="Hier zit de waarde van het model: antwoorden en scores leiden tot concrete adviesrichtingen."
        />
        <div className="advice-list">
          {advice.length === 0 ? (
            <div className="empty-state">Nog geen adviesregels geactiveerd. Vul meer diagnosevragen in voor betere duiding.</div>
          ) : (
            advice.map((item) => <AdviceCard key={item.id} item={item} />)
          )}
        </div>
      </div>
    </div>
  );
}

function AdviceCard({ item }: { item: AdviceRule }) {
  const area = GROWTH_AREAS.find((areaItem) => areaItem.id === item.areaId);
  return (
    <div className="advice-card">
      <div className="advice-head">
        <span className="round-icon">{area?.icon ?? "✨"}</span>
        <div>
          <div className="badge-row compact">
            <span className="badge">{area?.label ?? "Advies"}</span>
            <span className="badge badge-warning">Prioriteit {item.priority}</span>
          </div>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      </div>
      <div className="mini-grid">
        <MiniBlock title="FIT" text={item.fit} />
        <MiniBlock title="GAP" text={item.gap} />
        <MiniBlock title="SOLL" text={item.soll} />
      </div>
    </div>
  );
}

function RoadmapStep({ roadmap, scores }: { roadmap: ReturnType<typeof buildRoadmap>; scores: Scores }) {
  return (
    <div className="stack">
      <div className="card">
        <SectionTitle
          icon="🛣️"
          title="0-30-60-90 dagen roadmap"
          description="De roadmap koppelt de diagnose aan uitvoerbare stappen. Dit kan later direct naar rapportage, klantteam of backlog."
        />
        <div className="roadmap-grid">
          {roadmap.map((phase) => (
            <div className="roadmap-card" key={phase.id}>
              <span className="phase-pill">{phase.period}</span>
              <h3>{phase.title}</h3>
              <p>{phase.description}</p>
              <div className="roadmap-items">
                {phase.items.length === 0 ? (
                  <span className="muted">Geen acties geactiveerd.</span>
                ) : (
                  phase.items.map((item) => <div key={item}>{item}</div>)
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <SectionTitle icon="📊" title="Scorekaart" description="Compact overzicht voor managementsamenvatting of klantpresentatie." />
        <div className="score-list">
          {GROWTH_AREAS.map((area) => {
            const score = scores.byArea[area.id]?.score ?? 0;
            return (
              <div key={area.id} className="score-row">
                <div>
                  <strong>{area.label}</strong>
                  <span>{score.toFixed(1)} / 7</span>
                </div>
                <ProgressBar value={(score / 7) * 100} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ExportStep({
  exportPayload,
  copyStatus,
  copyExport,
  downloadExport,
}: {
  exportPayload: unknown;
  copyStatus: string;
  copyExport: () => void;
  downloadExport: () => void;
}) {
  const json = JSON.stringify(exportPayload, null, 2);

  return (
    <div className="two-col">
      <div className="card">
        <SectionTitle
          icon="⬇"
          title="Exportstructuur voor GitHub"
          description="De app is data-driven opgezet. Vragen, capabilities en adviesregels kunnen later vanuit Excel naar JSON worden geëxporteerd."
        />

        <div className="export-tabs">
          <div className="repo-box">
            <strong>Aanbevolen GitHub-structuur</strong>
            <code>
              /data/app-flow.json<br />
              /data/groeigebieden.json<br />
              /data/capabilities.json<br />
              /data/vragenbank.json<br />
              /data/antwoordopties.json<br />
              /data/scoremodel-dip-0-7.json<br />
              /data/routingregels.json<br />
              /data/adviesregels.json<br />
              /data/roadmapbouwstenen.json<br />
              /data/rapportageteksten.json
            </code>
          </div>

          <div className="report-box">
            <h3>Concept managementsamenvatting</h3>
            <p>
              Voor de klant is een groeimodeldiagnose uitgevoerd. De gemiddelde volwassenheid is indicatief vastgesteld.
              De belangrijkste aandachtspunten liggen bij gebieden waar eigenaarschap, procesvastheid, datakwaliteit,
              integratiebeheer of rapportagesturing nog onvoldoende zijn geborgd.
            </p>
          </div>

          <pre>{json}</pre>
        </div>
      </div>

      <div className="card side-panel">
        <SectionTitle icon="⚡" title="Acties" description="Gebruik deze export als basis voor GitHub, rapportage of verdere app-configuratie." />
        <button className="primary-button full" onClick={copyExport} type="button">
          Kopieer JSON
        </button>
        <button className="secondary-button full" onClick={downloadExport} type="button">
          Download JSON
        </button>
        {copyStatus ? <div className="message success">{copyStatus}</div> : null}
        <div className="message large success">
          <strong>Aanbevolen werkwijze</strong>
          <span>
            Beheer de vragenbank in Excel, exporteer naar JSON en laat de app alleen de data lezen. Zo blijft inhoud beheerbaar
            zonder dat de app-code telkens aangepast hoeft te worden.
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="section-title">
      <span className="round-icon">{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function ChoiceQuestion({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Option[] }) {
  return (
    <div className="question-box">
      <strong>{label}</strong>
      <div className="button-wrap">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`chip ${value === option.value ? "active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field-block">
      <label>{label}</label>
      {children}
    </div>
  );
}

function SelectButtons({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}) {
  return (
    <div className="field-block">
      <label>{label}</label>
      <div className="button-wrap">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`chip ${value === option.value ? "active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function RoutingPreview({ label, value }: { label: string; value: string }) {
  return (
    <div className="routing-preview">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="mini-block">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${safeValue}%` }} />
    </div>
  );
}

function FooterNavigation({ currentIndex, goPrevious, goNext }: { currentIndex: number; goPrevious: () => void; goNext: () => void }) {
  return (
    <div className="footer-nav">
      <button className="secondary-button" onClick={goPrevious} disabled={currentIndex === 0} type="button">
        Vorige
      </button>
      <span>
        Stap {currentIndex + 1} van {STEPS.length}
      </span>
      <button className="primary-button" onClick={goNext} disabled={currentIndex === STEPS.length - 1} type="button">
        Volgende →
      </button>
    </div>
  );
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

  if (hardNo) {
    return {
      status: "stabiliseren",
      label: "Eerst stabiliseren, daarna meten",
      description:
        "Een volledige volwassenheidsmeting is nu waarschijnlijk te vroeg. Richt de analyse eerst op basisprocessen, inrichting, gebruik en openstaande implementatiepunten.",
      scopeHint:
        "Kies bij voorkeur voor een beperkte quickscan of stabilisatieadvies. Gebruik het groeimodel nog niet als volledige volwassenheidsmeting.",
      tone: "danger",
    };
  }

  if (partly) {
    return {
      status: "quickscan",
      label: "Beperkte scan of quickscan passend",
      description:
        "Er is deels voldoende basis aanwezig, maar de betrouwbaarheid van een volledige meting vraagt aandacht. Beperk de scope en leg aannames goed vast.",
      scopeHint: "Start met een quickscan of gerichte scan op de gebieden waar de klant het meeste knelpunt ervaart.",
      tone: "warning",
    };
  }

  if (data.afasLiveOneYear === "ja" && data.keyProcessesOperational === "ja" && data.enoughExperience === "ja") {
    return {
      status: "groeimodel",
      label: "Volledig groeimodel passend",
      description:
        "De klant heeft voldoende praktijkervaring om IST, FIT, GAP en SOLL betrouwbaar vast te stellen. De volledige diagnose kan worden ingezet.",
      scopeHint: "Een volledige scan is passend. Afhankelijk van de aanleiding kan daarnaast extra verdieping worden gekozen.",
      tone: "success",
    };
  }

  return {
    status: "unknown",
    label: "Nog onvoldoende bepaald",
    description: "Vul de startcheck aan om te bepalen of een volledige scan, quickscan of stabilisatieadvies passend is.",
    scopeHint: "Kies voorlopig voor een beperkte scope totdat duidelijk is of de basis voldoende stabiel is.",
    tone: "neutral",
  };
}

function getScoreInterpretation(score: number) {
  if (score < 1.5) {
    return {
      label: "Niet of nauwelijks aanwezig",
      description: "De basis ontbreekt grotendeels. Begin met duidelijkheid, eigenaarschap en minimale procesafspraken.",
      tone: "danger",
    };
  }
  if (score < 3) {
    return {
      label: "Ad hoc en persoonsafhankelijk",
      description: "Er wordt gewerkt, maar vooral op ervaring, gewoonte en losse afspraken. Dit maakt groei kwetsbaar.",
      tone: "warning",
    };
  }
  if (score < 4.5) {
    return {
      label: "Basis aanwezig",
      description: "De basis is herkenbaar, maar borging, sturing en uniforme toepassing vragen verbetering.",
      tone: "neutral",
    };
  }
  if (score < 6) {
    return {
      label: "Beheerst en gestuurd",
      description: "De organisatie werkt gestructureerd en kan verbeteren op basis van data, eigenaarschap en ritme.",
      tone: "success",
    };
  }
  return {
    label: "Optimaliserend",
    description: "De organisatie heeft een sterke basis en kan gericht doorontwikkelen naar voorspelbaar verbeteren.",
    tone: "success",
  };
}

function getTriggeredAdvice(scores: Scores): AdviceRule[] {
  return ADVICE_RULES.filter((rule) => {
    const capabilityScore = scores.byCapability[rule.capabilityId]?.score ?? 0;
    return capabilityScore <= rule.maxScore;
  }).sort((a, b) => a.priority - b.priority);
}

function buildRoadmap(advice: AdviceRule[], startAdvice: StartAdvice) {
  const phases = [
    {
      id: "0-30",
      period: "0-30 dagen",
      title: "Stabiliseren en scherpstellen",
      description: "Maak de diagnose concreet, beleg eigenaarschap en verwijder directe ruis.",
      items: [] as string[],
    },
    {
      id: "30-60",
      period: "30-60 dagen",
      title: "Inrichten en verbeteren",
      description: "Werk de belangrijkste verbeteringen uit in processen, inrichting, data en afspraken.",
      items: [] as string[],
    },
    {
      id: "60-90",
      period: "60-90 dagen",
      title: "Borgen en meten",
      description: "Zorg dat verbetering onderdeel wordt van overleg, rapportage en beheer.",
      items: [] as string[],
    },
    {
      id: "90+",
      period: "90+ dagen",
      title: "Doorontwikkelen via klantteam",
      description: "Zet een vast verbeterritme neer met backlog, prioritering en periodieke besluitvorming.",
      items: [] as string[],
    },
  ];

  if (startAdvice.status === "stabiliseren") {
    phases[0].items.push("Voer eerst een stabilisatiescan uit op livegang, basisprocessen en openstaande implementatiepunten.");
  }

  advice.forEach((item) => {
    phases[0].items.push(item.roadmap[0]);
    phases[1].items.push(item.roadmap[1]);
    phases[2].items.push(item.roadmap[2]);
    phases[3].items.push(item.roadmap[3]);
  });

  return phases.map((phase) => ({ ...phase, items: Array.from(new Set(phase.items.filter(Boolean))) }));
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

function GlobalStyles() {
  return (
    <style jsx global>{`
      :root {
        --bg: #f8fafc;
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
        --shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      button,
      input,
      textarea {
        font: inherit;
      }

      button {
        cursor: pointer;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }

      .kg-page {
        min-height: 100vh;
        background:
          radial-gradient(circle at top left, rgba(15, 118, 110, 0.10), transparent 35%),
          var(--bg);
      }

      .kg-container {
        width: min(1440px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 28px 0;
      }

      .hero-card {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
        gap: 24px;
        padding: 32px;
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 32px;
        box-shadow: var(--shadow);
      }

      .hero-card h1 {
        margin: 18px 0 0;
        max-width: 850px;
        font-size: clamp(34px, 5vw, 64px);
        line-height: 0.96;
        letter-spacing: -0.055em;
      }

      .hero-card p {
        max-width: 850px;
        margin: 22px 0 0;
        color: var(--text);
        font-size: 17px;
        line-height: 1.7;
      }

      .hero-panel {
        padding: 24px;
        border-radius: 28px;
        background: #0f172a;
        color: white;
      }

      .hero-panel-title {
        color: rgba(255, 255, 255, 0.55);
        font-size: 13px;
      }

      .hero-panel-main {
        margin-top: 8px;
        font-weight: 800;
        font-size: 20px;
      }

      .hero-panel ul {
        margin: 22px 0 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 12px;
      }

      .hero-panel li {
        color: rgba(255, 255, 255, 0.78);
        font-size: 14px;
        line-height: 1.4;
      }

      .hero-panel li::before {
        content: "✓";
        color: #5eead4;
        margin-right: 10px;
      }

      .kg-layout {
        display: grid;
        grid-template-columns: 310px minmax(0, 1fr);
        gap: 24px;
        margin-top: 24px;
      }

      .kg-sidebar {
        position: sticky;
        top: 20px;
        align-self: start;
        display: grid;
        gap: 16px;
      }

      .kg-main {
        display: grid;
        gap: 18px;
      }

      .card {
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 28px;
        padding: 22px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.035);
      }

      .sidebar-card {
        padding: 14px;
      }

      .eyebrow {
        color: var(--muted);
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .eyebrow.green {
        color: var(--brand);
      }

      .badge-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .badge-row.compact {
        margin-bottom: 12px;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        min-height: 28px;
        padding: 6px 11px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: white;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
      }

      .badge-green {
        background: var(--brand-soft);
        color: #115e59;
        border-color: transparent;
      }

      .badge-warning {
        background: var(--warning-bg);
        color: var(--warning);
        border-color: transparent;
      }

      .step-list {
        display: grid;
        gap: 7px;
        margin-top: 12px;
      }

      .step-button {
        width: 100%;
        display: grid;
        grid-template-columns: 36px minmax(0, 1fr) 16px;
        gap: 10px;
        align-items: center;
        border: 0;
        border-radius: 18px;
        background: transparent;
        padding: 12px;
        text-align: left;
        color: var(--ink);
      }

      .step-button:hover {
        background: var(--soft);
      }

      .step-button.active {
        background: #0f172a;
        color: white;
      }

      .step-icon {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        border-radius: 12px;
        background: var(--soft);
      }

      .step-button.active .step-icon {
        background: rgba(255, 255, 255, 0.10);
      }

      .step-text {
        min-width: 0;
        display: grid;
        gap: 3px;
      }

      .step-text strong {
        font-size: 14px;
      }

      .step-text small {
        overflow: hidden;
        color: var(--muted);
        font-size: 12px;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .step-button.active .step-text small,
      .step-button.active .step-arrow {
        color: rgba(255, 255, 255, 0.55);
      }

      .muted,
      .small-text {
        color: var(--muted);
      }

      .small-text {
        margin: 12px 0 0;
        font-size: 13px;
        line-height: 1.5;
      }

      .big-score {
        margin-top: 4px;
        font-size: 42px;
        font-weight: 850;
        letter-spacing: -0.04em;
      }

      .score-card {
        display: grid;
        gap: 14px;
      }

      .progress-track {
        width: 100%;
        height: 8px;
        overflow: hidden;
        border-radius: 999px;
        background: #e5e7eb;
      }

      .progress-fill {
        height: 100%;
        border-radius: inherit;
        background: var(--brand);
      }

      .message {
        padding: 14px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.55;
      }

      .message.large {
        display: grid;
        gap: 8px;
        padding: 18px;
        border-radius: 22px;
      }

      .message.neutral {
        background: var(--soft);
        color: var(--text);
      }

      .message.danger {
        background: var(--danger-bg);
        color: var(--danger);
      }

      .message.warning {
        background: var(--warning-bg);
        color: var(--warning);
      }

      .message.success {
        background: var(--success-bg);
        color: var(--success);
      }

      .step-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
      }

      .step-header-left {
        display: flex;
        align-items: flex-start;
        gap: 16px;
      }

      .large-icon,
      .round-icon {
        flex: 0 0 auto;
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        border-radius: 16px;
        background: var(--soft);
        font-size: 22px;
      }

      .large-icon {
        background: #0f172a;
        color: white;
      }

      .step-header h2,
      .section-title h2,
      .card h3,
      .capability-head h3,
      .interpret-card h3,
      .advice-card h3,
      .roadmap-card h3 {
        margin: 0;
        letter-spacing: -0.025em;
      }

      .step-header h2 {
        margin-top: 4px;
        font-size: 26px;
      }

      .step-header p,
      .section-title p,
      .capability-head p,
      .interpret-card p,
      .advice-card p,
      .roadmap-card p {
        margin: 7px 0 0;
        color: var(--text);
        font-size: 14px;
        line-height: 1.6;
      }

      .step-progress {
        width: 190px;
        display: grid;
        gap: 8px;
        color: var(--muted);
        text-align: right;
      }

      .two-col {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 360px;
        gap: 18px;
      }

      .side-panel {
        display: flex;
        flex-direction: column;
        gap: 18px;
        align-self: start;
      }

      .section-title {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        margin-bottom: 20px;
      }

      .question-stack {
        display: grid;
        gap: 16px;
      }

      .question-box {
        display: grid;
        gap: 14px;
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 22px;
      }

      .question-box > strong,
      .question-head > strong {
        font-size: 15px;
        line-height: 1.45;
      }

      .question-head p {
        margin: 8px 0 0;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.5;
      }

      .button-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .chip {
        border: 1px solid var(--line);
        border-radius: 999px;
        background: white;
        color: var(--text);
        padding: 9px 14px;
        font-size: 14px;
        font-weight: 700;
      }

      .chip:hover {
        border-color: #cbd5e1;
        background: #f8fafc;
      }

      .chip.active,
      .primary-button {
        border-color: #0f172a;
        background: #0f172a;
        color: white;
      }

      .primary-button,
      .secondary-button {
        min-height: 46px;
        padding: 0 18px;
        border-radius: 16px;
        border: 1px solid #0f172a;
        font-weight: 800;
      }

      .secondary-button {
        background: white;
        color: #0f172a;
        border-color: var(--line);
      }

      .full {
        width: 100%;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }

      .field-block {
        display: grid;
        gap: 10px;
        margin-bottom: 18px;
      }

      .field-block label {
        font-size: 14px;
        font-weight: 800;
      }

      input,
      textarea {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: white;
        color: var(--ink);
        padding: 13px 14px;
        outline: none;
      }

      textarea {
        min-height: 120px;
        resize: vertical;
        line-height: 1.5;
      }

      input:focus,
      textarea:focus {
        border-color: var(--brand);
        box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.11);
      }

      .routing-list {
        display: grid;
        gap: 10px;
      }

      .routing-preview {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        padding: 13px 14px;
        border-radius: 16px;
        background: var(--soft);
        color: var(--muted);
        font-size: 14px;
      }

      .routing-preview strong {
        color: var(--ink);
        text-align: right;
      }

      .scope-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .scope-card {
        display: grid;
        gap: 12px;
        min-height: 168px;
        align-content: start;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: white;
        padding: 18px;
        text-align: left;
      }

      .scope-card:hover {
        background: #f8fafc;
      }

      .scope-card.active {
        border-color: #0f172a;
        background: #0f172a;
        color: white;
      }

      .scope-card small {
        color: var(--text);
        line-height: 1.5;
      }

      .scope-card.active small {
        color: rgba(255, 255, 255, 0.65);
      }

      .scope-icon {
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border-radius: 15px;
        background: var(--soft);
        font-size: 22px;
      }

      .scope-card.active .scope-icon {
        background: rgba(255, 255, 255, 0.10);
      }

      .diagnosis-layout {
        display: grid;
        grid-template-columns: 300px minmax(0, 1fr);
        gap: 18px;
      }

      .area-menu {
        align-self: start;
        position: sticky;
        top: 20px;
        display: grid;
        gap: 10px;
      }

      .area-button {
        display: grid;
        grid-template-columns: 28px minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: white;
        color: var(--ink);
        padding: 13px;
        text-align: left;
      }

      .area-button.active {
        background: #0f172a;
        color: white;
        border-color: #0f172a;
      }

      .area-button small {
        color: var(--muted);
      }

      .area-button.active small {
        color: rgba(255, 255, 255, 0.65);
      }

      .diagnosis-content {
        display: grid;
        gap: 18px;
      }

      .area-header,
      .capability-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
      }

      .area-score,
      .capability-score {
        min-width: 92px;
        padding: 14px;
        border-radius: 18px;
        background: var(--soft);
        text-align: center;
      }

      .area-score span,
      .capability-score strong {
        display: block;
        font-size: 30px;
        font-weight: 850;
        letter-spacing: -0.04em;
      }

      .area-score small,
      .capability-score small {
        color: var(--muted);
      }

      .scale-grid {
        display: grid;
        grid-template-columns: repeat(8, minmax(0, 1fr));
        gap: 8px;
      }

      .scale-button {
        min-height: 78px;
        display: grid;
        gap: 4px;
        place-items: center;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: white;
      }

      .scale-button strong {
        font-size: 21px;
      }

      .scale-button small {
        color: var(--muted);
        font-size: 10px;
        line-height: 1.2;
      }

      .scale-button.active {
        background: #0f172a;
        color: white;
        border-color: #0f172a;
      }

      .scale-button.active small {
        color: rgba(255, 255, 255, 0.65);
      }

      .stack {
        display: grid;
        gap: 18px;
      }

      .interpret-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .interpret-card,
      .advice-card,
      .roadmap-card {
        border: 1px solid var(--line);
        border-radius: 24px;
        padding: 18px;
        background: white;
      }

      .interpret-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }

      .interpret-score {
        font-size: 30px;
        font-weight: 850;
        letter-spacing: -0.04em;
      }

      .status-pill,
      .phase-pill {
        display: inline-flex;
        margin-top: 12px;
        border-radius: 999px;
        padding: 7px 11px;
        font-size: 12px;
        font-weight: 800;
      }

      .status-pill.danger {
        background: var(--danger-bg);
        color: var(--danger);
      }

      .status-pill.warning {
        background: var(--warning-bg);
        color: var(--warning);
      }

      .status-pill.neutral {
        background: var(--soft);
        color: var(--text);
      }

      .status-pill.success {
        background: var(--success-bg);
        color: var(--success);
      }

      .note-box {
        margin-top: 12px;
        padding: 12px;
        border-radius: 16px;
        background: var(--soft);
        color: var(--text);
        font-size: 13px;
        line-height: 1.5;
      }

      .advice-list {
        display: grid;
        gap: 14px;
      }

      .advice-head {
        display: flex;
        gap: 14px;
        align-items: flex-start;
      }

      .mini-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-top: 16px;
      }

      .mini-block {
        padding: 14px;
        border-radius: 18px;
        background: var(--soft);
      }

      .mini-block strong {
        color: var(--muted);
        font-size: 12px;
        letter-spacing: 0.08em;
      }

      .mini-block p {
        margin: 8px 0 0;
        color: var(--text);
        font-size: 13px;
        line-height: 1.55;
      }

      .empty-state {
        padding: 32px;
        border: 1px dashed #cbd5e1;
        border-radius: 24px;
        background: #f8fafc;
        color: var(--muted);
        text-align: center;
      }

      .roadmap-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }

      .phase-pill {
        margin: 0 0 14px;
        background: #0f172a;
        color: white;
      }

      .roadmap-items {
        display: grid;
        gap: 10px;
        margin-top: 16px;
      }

      .roadmap-items div {
        padding: 12px;
        border-radius: 16px;
        background: var(--soft);
        color: var(--text);
        font-size: 13px;
        line-height: 1.5;
      }

      .score-list {
        display: grid;
        gap: 16px;
      }

      .score-row {
        display: grid;
        gap: 8px;
      }

      .score-row > div {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        color: var(--text);
        font-size: 14px;
      }

      .score-row span {
        color: var(--muted);
      }

      .export-tabs {
        display: grid;
        gap: 16px;
      }

      .repo-box,
      .report-box {
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 22px;
        background: var(--soft);
      }

      .repo-box code {
        display: block;
        margin-top: 12px;
        color: var(--text);
        font-size: 13px;
        line-height: 1.75;
      }

      .report-box p {
        color: var(--text);
        line-height: 1.7;
      }

      pre {
        max-height: 560px;
        overflow: auto;
        margin: 0;
        padding: 18px;
        border-radius: 22px;
        background: #0f172a;
        color: #e2e8f0;
        font-size: 12px;
        line-height: 1.55;
      }

      .footer-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 16px;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: white;
      }

      .footer-nav span {
        color: var(--muted);
        font-size: 14px;
      }

      @media (max-width: 1180px) {
        .hero-card,
        .kg-layout,
        .two-col,
        .diagnosis-layout {
          grid-template-columns: 1fr;
        }

        .kg-sidebar,
        .area-menu {
          position: static;
        }

        .interpret-grid,
        .roadmap-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 760px) {
        .kg-container {
          width: min(100vw - 18px, 1440px);
          padding: 10px 0;
        }

        .hero-card,
        .card {
          border-radius: 22px;
          padding: 18px;
        }

        .step-header,
        .area-header,
        .capability-head {
          flex-direction: column;
        }

        .step-progress {
          width: 100%;
          text-align: left;
        }

        .form-grid,
        .scope-grid,
        .interpret-grid,
        .mini-grid,
        .roadmap-grid {
          grid-template-columns: 1fr;
        }

        .scale-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .footer-nav {
          flex-direction: column;
        }

        .footer-nav button {
          width: 100%;
        }
      }
    `}</style>
  );
}
