"use client";

import { useMemo, useState } from "react";

type ViewId =
  | "dashboard"
  | "nieuwe-scan"
  | "scan"
  | "diagnose"
  | "resultaten"
  | "roadmap"
  | "rapport";

type TriageAnswer = "Vaak" | "Soms" | "Nee" | "Weet ik niet";

type DiagnosisStatus =
  | "Waarschijnlijk relevant"
  | "Kort toetsen"
  | "Nader verkennen"
  | "Nu niet primair";

type DiagnosisCategory =
  | "Werkdomeinen"
  | "Digitale basis"
  | "Organisatievolwassenheid"
  | "Verandervermogen";

type DiagnosisKey =
  | "crm"
  | "financieel"
  | "ordermanagement"
  | "projecten"
  | "hrm"
  | "payroll"
  | "rapportage"
  | "integraties"
  | "data"
  | "samenwerking"
  | "eigenaarschap"
  | "verandervermogen"
  | "capaciteitBudget";

type ScanForm = {
  organisatienaam: string;
  sector: string;
  medewerkers: string;
  administraties: string;
  klantSituatie: string;
  consultant: string;
  datum: string;
  deelnemersGesprek: string;
  aanleidingScan: string[];
  context: string;
};

type TriageQuestion = {
  id: string;
  section: string;
  question: string;
  helpText?: string;
  diagnosisKeys: DiagnosisKey[];
};

type DiagnosisItem = {
  key: DiagnosisKey;
  category: DiagnosisCategory;
  title: string;
  description: string;
  whatToExplore: string[];
};

type DiagnosisResult = DiagnosisItem & {
  score: number;
  status: DiagnosisStatus;
  reason: string;
};

const navigation: { id: ViewId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "nieuwe-scan", label: "Nieuwe scan" },
  { id: "scan", label: "Praktijktriage" },
  { id: "diagnose", label: "Diagnosekaart" },
  { id: "resultaten", label: "Resultaten" },
  { id: "roadmap", label: "Roadmap" },
  { id: "rapport", label: "Rapport" },
];

const sectorOptions = [
  "Onderwijs",
  "Zorg & welzijn",
  "Zakelijke dienstverlening",
  "Ledenorganisatie",
  "Handel / groothandel",
  "Productie",
  "Overheid / non-profit",
  "Anders",
];

const employeeOptions = [
  "t/m 25",
  "t/m 50",
  "t/m 250",
  "t/m 1.000",
  "t/m 2.500",
  "> 2.500",
];

const administrationOptions = ["1", "2-5", "6-10", "Meer dan 10"];

const customerSituationOptions = [
  "We spreken elkaar voor het eerst",
  "We starten net samen op",
  "We werken al samen",
  "Er loopt iets vast of moet beter",
  "We doen een periodieke check",
];

const scanReasonOptions = [
  "Eerst een goed beeld krijgen",
  "Weten waar we nu staan",
  "Zien wat beter kan",
  "AFAS beter gebruiken",
  "Minder handwerk",
  "Minder werken in Excel",
  "Betere overzichten en rapportages",
  "Sneller en duidelijker werken",
  "Minder fouten en herstelwerk",
  "Minder afhankelijk zijn van losse kennis",
  "Duidelijkere afspraken en eigenaarschap",
  "Betere samenwerking tussen afdelingen",
  "Groei beter kunnen opvangen",
  "Een duidelijke verbeteragenda maken",
  "Anders",
];

const triageQuestions: TriageQuestion[] = [
  {
    id: "CRM-TRIAGE-001",
    section: "Klanten / relaties / afspraken",
    question: "Hebben jullie klanten, relaties of contactpersonen die centraal bekend moeten zijn?",
    helpText:
      "Denk aan klantgegevens, contactpersonen, afspraken, contactmomenten of klantteams.",
    diagnosisKeys: ["crm"],
  },
  {
    id: "CRM-TRIAGE-002",
    section: "Klanten / relaties / afspraken",
    question: "Moeten afspraken met klanten voor meerdere collega’s zichtbaar zijn?",
    helpText:
      "Bijvoorbeeld afspraken die sales, administratie, uitvoering of consultancy moet kennen.",
    diagnosisKeys: ["crm", "samenwerking"],
  },
  {
    id: "FIN-TRIAGE-001",
    section: "Geld / facturen / betalingen",
    question: "Versturen jullie facturen naar klanten?",
    helpText:
      "Het gaat om verkoopfacturen, declaraties of andere bedragen die naar klanten gaan.",
    diagnosisKeys: ["financieel"],
  },
  {
    id: "FIN-TRIAGE-002",
    section: "Geld / facturen / betalingen",
    question: "Krijgen jullie facturen van leveranciers?",
    helpText:
      "Denk aan inkoopfacturen, kostenfacturen of facturen die eerst beoordeeld moeten worden.",
    diagnosisKeys: ["financieel"],
  },
  {
    id: "FIN-TRIAGE-003",
    section: "Geld / facturen / betalingen",
    question: "Moeten facturen eerst worden goedgekeurd?",
    helpText:
      "Bijvoorbeeld door een budgethouder, manager, projectleider of administratie.",
    diagnosisKeys: ["financieel", "eigenaarschap"],
  },
  {
    id: "ORD-TRIAGE-001",
    section: "Orders / aanvragen / leveringen",
    question: "Hebben jullie aanvragen, orders, leveringen, inkopen of voorraadstromen?",
    helpText:
      "Denk aan werk dat van aanvraag naar levering, uitvoering of betaling loopt.",
    diagnosisKeys: ["ordermanagement"],
  },
  {
    id: "ORD-TRIAGE-002",
    section: "Orders / aanvragen / leveringen",
    question: "Zijn er vaak uitzonderingen in het order- of leverproces?",
    helpText:
      "Bijvoorbeeld blokkades, afwijkende afspraken, wachtstatussen of handmatige controles.",
    diagnosisKeys: ["ordermanagement", "eigenaarschap"],
  },
  {
    id: "PROJ-TRIAGE-001",
    section: "Klussen / opdrachten / projecten",
    question: "Doen jullie werk dat over meerdere dagen of weken loopt?",
    helpText:
      "We bedoelen werk dat je als opdracht, klus, traject, project of dossier zou kunnen volgen.",
    diagnosisKeys: ["projecten"],
  },
  {
    id: "PROJ-TRIAGE-002",
    section: "Klussen / opdrachten / projecten",
    question: "Willen jullie weten of een klus of opdracht goed loopt qua uren, kosten of opbrengst?",
    helpText:
      "Dit hoeft nog geen projectadministratie te zijn. Het gaat om grip op werk en resultaat.",
    diagnosisKeys: ["projecten", "rapportage"],
  },
  {
    id: "HRM-TRIAGE-001",
    section: "Medewerkers / HR-processen",
    question: "Hebben jullie processen rondom medewerkers, verlof, verzuim, onboarding of wijzigingen?",
    helpText:
      "Denk aan alles rondom instroom, doorstroom, uitstroom en wijzigingen van medewerkers.",
    diagnosisKeys: ["hrm"],
  },
  {
    id: "PAY-TRIAGE-001",
    section: "Salaris / personeelsmutaties",
    question: "Worden salarissen, contracten of personeelsmutaties verwerkt?",
    helpText:
      "Ook als dit deels extern gebeurt, kan het relevant zijn voor proces, data en controle.",
    diagnosisKeys: ["payroll", "hrm"],
  },
  {
    id: "REP-TRIAGE-001",
    section: "Rapportage / overzichten / grip",
    question: "Maken jullie veel overzichten in Excel?",
    helpText:
      "Excel is niet fout, maar veel losse bestanden kunnen wijzen op ontbrekende stuurinformatie.",
    diagnosisKeys: ["rapportage", "data"],
  },
  {
    id: "REP-TRIAGE-002",
    section: "Rapportage / overzichten / grip",
    question: "Zijn cijfers soms onderwerp van discussie?",
    helpText:
      "Bijvoorbeeld omdat definities verschillen of omdat niet duidelijk is welk overzicht klopt.",
    diagnosisKeys: ["rapportage", "data", "eigenaarschap"],
  },
  {
    id: "REP-TRIAGE-003",
    section: "Rapportage / overzichten / grip",
    question: "Hebben management, directie of teams vaste rapportages nodig?",
    helpText:
      "Denk aan rapportages voor sturing, overleg, bestuur, MT of klantteams.",
    diagnosisKeys: ["rapportage"],
  },
  {
    id: "INT-TRIAGE-001",
    section: "Systemen / koppelingen / dubbele invoer",
    question: "Gebruiken jullie naast AFAS ook andere systemen?",
    helpText:
      "Bijvoorbeeld brancheapplicaties, planningssystemen, CRM-systemen, portalen of BI-tools.",
    diagnosisKeys: ["integraties"],
  },
  {
    id: "INT-TRIAGE-002",
    section: "Systemen / koppelingen / dubbele invoer",
    question: "Wordt informatie dubbel ingevoerd?",
    helpText:
      "Bijvoorbeeld eerst in een ander systeem en daarna nog eens in AFAS of Excel.",
    diagnosisKeys: ["integraties", "data"],
  },
  {
    id: "INT-TRIAGE-003",
    section: "Systemen / koppelingen / dubbele invoer",
    question: "Is onduidelijk welk systeem leidend is voor bepaalde gegevens?",
    helpText:
      "Bijvoorbeeld klantgegevens, medewerkersgegevens, orders, projecten of financiële data.",
    diagnosisKeys: ["integraties", "data", "eigenaarschap"],
  },
  {
    id: "ORG-TRIAGE-001",
    section: "Samenwerking / communicatie / eigenaarschap",
    question: "Gaan afspraken vooral via mail, Teams of losse lijstjes?",
    helpText:
      "Dat kan prima werken, maar het maakt afspraken vaak minder zichtbaar en minder overdraagbaar.",
    diagnosisKeys: ["samenwerking"],
  },
  {
    id: "ORG-TRIAGE-002",
    section: "Samenwerking / communicatie / eigenaarschap",
    question: "Is voor iedereen duidelijk wie waarvoor verantwoordelijk is?",
    helpText:
      "Denk aan eigenaarschap van proces, data, besluitvorming en opvolging.",
    diagnosisKeys: ["eigenaarschap"],
  },
  {
    id: "ORG-TRIAGE-003",
    section: "Samenwerking / communicatie / eigenaarschap",
    question: "Loopt overdracht tussen afdelingen soms stroef?",
    helpText:
      "Bijvoorbeeld tussen sales, administratie, uitvoering, HR, finance of management.",
    diagnosisKeys: ["samenwerking", "eigenaarschap"],
  },
  {
    id: "CHANGE-TRIAGE-001",
    section: "Veranderen / capaciteit / hulpvraag",
    question: "Is er weerstand als processen of werkwijzen veranderen?",
    helpText:
      "Weerstand is normaal, maar bepaalt wel hoe je de aanpak moet faseren en begeleiden.",
    diagnosisKeys: ["verandervermogen"],
  },
  {
    id: "CHANGE-TRIAGE-002",
    section: "Veranderen / capaciteit / hulpvraag",
    question: "Loopt er nu een reorganisatie, herstructurering of grote verandering?",
    helpText:
      "Dan moet de aanpak vaak rustiger, kleiner en duidelijker worden opgebouwd.",
    diagnosisKeys: ["verandervermogen", "capaciteitBudget"],
  },
  {
    id: "CHANGE-TRIAGE-003",
    section: "Veranderen / capaciteit / hulpvraag",
    question: "Is er tijd en budget beschikbaar om verbeteringen echt op te pakken?",
    helpText:
      "Zonder tijd, budget of key-users blijft verbetering vaak hangen in goede intenties.",
    diagnosisKeys: ["capaciteitBudget"],
  },
  {
    id: "CHANGE-TRIAGE-004",
    section: "Veranderen / capaciteit / hulpvraag",
    question: "Kan de organisatie dit grotendeels zelf, of is begeleiding nodig?",
    helpText:
      "Dit bepaalt of Kweekers vooral adviseert, begeleidt, uitvoert of tijdelijk extra structuur biedt.",
    diagnosisKeys: ["capaciteitBudget", "verandervermogen"],
  },
];

const painPointOptions = [
  "Veel handwerk",
  "Veel Excel-lijstjes",
  "Dubbele invoer",
  "Achter mensen aan voor akkoord",
  "Veel uitzonderingen",
  "Cijfers worden niet altijd vertrouwd",
  "Afhankelijk van kennis van één of enkele mensen",
  "Onduidelijk wie eigenaar is",
  "Samenwerking tussen afdelingen loopt stroef",
  "Veel weerstand bij verandering",
  "Te weinig tijd of capaciteit",
  "Budget is nog onduidelijk",
  "Organisatie zit in herstructurering",
];

const wishOptions = [
  "Minder handwerk",
  "Minder Excel",
  "Sneller goedkeuren",
  "Betere overzichten",
  "Eerder zien waar het misloopt",
  "Minder fouten en herstelwerk",
  "Duidelijkere afspraken",
  "Minder afhankelijk van losse kennis",
  "Beter kunnen sturen",
  "Beter samenwerken tussen afdelingen",
  "Meer eigenaarschap",
  "Rustiger en beter kunnen veranderen",
  "Duidelijk weten welke hulp nodig is",
];

const diagnosisCatalog: DiagnosisItem[] = [
  {
    key: "crm",
    category: "Werkdomeinen",
    title: "CRM / Relatiebeheer",
    description:
      "Relaties, klantafspraken, contactmomenten, commerciële opvolging en zichtbaarheid voor klantteams.",
    whatToExplore: [
      "Welke klantinformatie moet centraal bekend zijn?",
      "Welke afspraken moeten zichtbaar zijn voor meerdere collega’s?",
      "Hoe loopt opvolging nu?",
      "Waar zit informatie nu verspreid?",
    ],
  },
  {
    key: "financieel",
    category: "Werkdomeinen",
    title: "Financieel",
    description:
      "Facturen, betalingen, goedkeuringen, openstaande posten, afsluiting en financiële grip.",
    whatToExplore: [
      "Hoe lopen facturen en betalingen nu?",
      "Waar zitten handmatige controles?",
      "Wie keurt wat goed?",
      "Welke cijfers zijn nodig voor sturing?",
    ],
  },
  {
    key: "ordermanagement",
    category: "Werkdomeinen",
    title: "Ordermanagement",
    description:
      "Aanvragen, orders, inkopen, leveringen, voorraad, uitzonderingen en overdracht tussen stappen.",
    whatToExplore: [
      "Welke order- of leverstromen zijn er?",
      "Waar ontstaan uitzonderingen?",
      "Welke overdrachten zijn kwetsbaar?",
      "Welke informatie moet eerder zichtbaar zijn?",
    ],
  },
  {
    key: "projecten",
    category: "Werkdomeinen",
    title: "Projecten / opdrachten",
    description:
      "Werk dat over meerdere dagen of weken loopt, met uren, kosten, budget, voortgang of resultaat.",
    whatToExplore: [
      "Wanneer is iets een project, opdracht of dossier?",
      "Welke uren en kosten moeten worden gevolgd?",
      "Hoe wordt voortgang bewaakt?",
      "Waar mist inzicht in resultaat?",
    ],
  },
  {
    key: "hrm",
    category: "Werkdomeinen",
    title: "HRM",
    description:
      "Medewerkersprocessen zoals instroom, doorstroom, uitstroom, verlof, verzuim en wijzigingen.",
    whatToExplore: [
      "Welke HR-processen kosten nu veel tijd?",
      "Waar zijn overdrachten of goedkeuringen nodig?",
      "Welke medewerkersdata moet betrouwbaar zijn?",
      "Wat loopt nu buiten het systeem om?",
    ],
  },
  {
    key: "payroll",
    category: "Werkdomeinen",
    title: "Payroll / salaris",
    description:
      "Salarisverwerking, contracten, mutaties, controles en aansluiting met HR- en financiële processen.",
    whatToExplore: [
      "Wie verwerkt mutaties?",
      "Waar zitten controles?",
      "Wat gebeurt intern en wat extern?",
      "Welke informatie moet beter aansluiten?",
    ],
  },
  {
    key: "rapportage",
    category: "Digitale basis",
    title: "Rapportage & sturing",
    description:
      "Overzichten, dashboards, KPI’s, managementinformatie en eerder zien waar iets misloopt.",
    whatToExplore: [
      "Welke overzichten zijn nodig?",
      "Wie gebruikt welke cijfers?",
      "Welke rapportages staan nu in Excel?",
      "Welke informatie moet sneller zichtbaar zijn?",
    ],
  },
  {
    key: "integraties",
    category: "Digitale basis",
    title: "Integraties & datastromen",
    description:
      "Andere systemen naast AFAS, koppelingen, imports, exports, dubbele invoer en datastromen.",
    whatToExplore: [
      "Welke systemen zijn betrokken?",
      "Waar wordt informatie dubbel ingevoerd?",
      "Welke koppelingen of imports zijn er?",
      "Welk systeem is leidend?",
    ],
  },
  {
    key: "data",
    category: "Digitale basis",
    title: "Data & definities",
    description:
      "Betrouwbaarheid van gegevens, definities, eigenaarschap van data en discussie over cijfers.",
    whatToExplore: [
      "Welke cijfers worden niet vertrouwd?",
      "Welke definities zijn onduidelijk?",
      "Wie is eigenaar van data?",
      "Waar ontstaan verschillen tussen overzichten?",
    ],
  },
  {
    key: "samenwerking",
    category: "Organisatievolwassenheid",
    title: "Samenwerking & communicatie",
    description:
      "Hoe teams samenwerken, informatie delen, afspraken vastleggen en overdrachten organiseren.",
    whatToExplore: [
      "Waar loopt overdracht stroef?",
      "Welke afspraken staan in mail of Teams?",
      "Wie mist welke informatie?",
      "Welke samenwerking moet beter?",
    ],
  },
  {
    key: "eigenaarschap",
    category: "Organisatievolwassenheid",
    title: "Eigenaarschap & besluitvorming",
    description:
      "Wie eigenaar is van processen, data, keuzes, opvolging en verbetering.",
    whatToExplore: [
      "Wie beslist over werkwijze?",
      "Wie is eigenaar van proces en data?",
      "Waar blijven acties liggen?",
      "Welke besluiten zijn nodig?",
    ],
  },
  {
    key: "verandervermogen",
    category: "Verandervermogen",
    title: "Adoptie & verandervermogen",
    description:
      "Hoe makkelijk de organisatie nieuwe werkwijzen accepteert en volhoudt.",
    whatToExplore: [
      "Waar zit weerstand?",
      "Welke veranderingen lopen al?",
      "Hoe worden gebruikers meegenomen?",
      "Wat is nodig om verandering te laten landen?",
    ],
  },
  {
    key: "capaciteitBudget",
    category: "Verandervermogen",
    title: "Capaciteit, budget & hulpvraag",
    description:
      "Of de organisatie tijd, budget, key-users en kennis heeft om verbetering zelf op te pakken.",
    whatToExplore: [
      "Is er tijd vrijgemaakt?",
      "Is budget duidelijk?",
      "Zijn key-users beschikbaar?",
      "Is externe hulp nodig?",
    ],
  },
];

const mockScans = [
  {
    klant: "Participe",
    sector: "Zorg & welzijn",
    status: "In gesprek",
    score: "3.1",
    datum: "24-04-2026",
  },
  {
    klant: "Environ",
    sector: "Zakelijke dienstverlening",
    status: "Afgerond",
    score: "3.8",
    datum: "18-04-2026",
  },
  {
    klant: "Codarts",
    sector: "Onderwijs",
    status: "Concept",
    score: "2.9",
    datum: "12-04-2026",
  },
];

const initialForm: ScanForm = {
  organisatienaam: "LMJ BV",
  sector: "Onderwijs",
  medewerkers: "t/m 250",
  administraties: "2-5",
  klantSituatie: "We werken al samen",
  consultant: "Sjoerd Koelman",
  datum: "2026-04-26",
  deelnemersGesprek: "Directie, proceseigenaar, key-user en consultant",
  aanleidingScan: [
    "AFAS beter gebruiken",
    "Betere overzichten en rapportages",
    "Een duidelijke verbeteragenda maken",
  ],
  context:
    "De scan wordt gebruikt als gesprekstool tijdens een nulmeting en vormt de basis voor prioriteiten en een eerste roadmap.",
};

const initialTriageAnswers = Object.fromEntries(
  triageQuestions.map((question) => [question.id, "Weet ik niet"])
) as Record<string, TriageAnswer>;

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [form, setForm] = useState<ScanForm>(initialForm);
  const [triageAnswers, setTriageAnswers] =
    useState<Record<string, TriageAnswer>>(initialTriageAnswers);
  const [painPoints, setPainPoints] = useState<string[]>([
    "Veel handwerk",
    "Veel Excel-lijstjes",
    "Cijfers worden niet altijd vertrouwd",
  ]);
  const [wishes, setWishes] = useState<string[]>([
    "Minder handwerk",
    "Betere overzichten",
    "Beter kunnen sturen",
  ]);
  const [practiceExample, setPracticeExample] = useState(
    "Vorige maand kostte het veel tijd om de juiste cijfers, goedkeuringen en eigenaars boven water te krijgen."
  );

  const diagnosisResults = useMemo(
    () => calculateDiagnosis(triageAnswers, painPoints, wishes),
    [triageAnswers, painPoints, wishes]
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-white p-6 lg:block">
          <div className="mb-10">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              KWEEKERS
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Groeimodel
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Praktische nulmeting voor klantteams.
            </p>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeView === item.id
                    ? "bg-slate-950 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold">MVP-scope</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Eerst bepalen wat relevant is. Daarna pas verdiepen per onderdeel.
            </p>
          </div>
        </aside>

        <section className="flex-1">
          <header className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="mx-auto max-w-7xl">
              <p className="text-sm font-medium text-slate-500">
                MVP versie 1
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                KWEEKERS Groeimodel
              </h2>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8">
            {activeView === "dashboard" && (
              <Dashboard onNewScan={() => setActiveView("nieuwe-scan")} />
            )}

            {activeView === "nieuwe-scan" && (
              <NewScan
                form={form}
                setForm={setForm}
                onNext={() => setActiveView("scan")}
              />
            )}

            {activeView === "scan" && (
              <PracticeTriage
                answers={triageAnswers}
                setAnswers={setTriageAnswers}
                painPoints={painPoints}
                setPainPoints={setPainPoints}
                wishes={wishes}
                setWishes={setWishes}
                practiceExample={practiceExample}
                setPracticeExample={setPracticeExample}
                onBack={() => setActiveView("nieuwe-scan")}
                onNext={() => setActiveView("diagnose")}
              />
            )}

            {activeView === "diagnose" && (
              <DiagnosisCard
                form={form}
                results={diagnosisResults}
                painPoints={painPoints}
                wishes={wishes}
                practiceExample={practiceExample}
                onBack={() => setActiveView("scan")}
                onNext={() => setActiveView("resultaten")}
              />
            )}

            {activeView === "resultaten" && (
              <PlaceholderScreen
                title="Resultaten"
                description="Hier komen straks scores, signalen, prioriteiten en benchmarkinformatie."
              />
            )}

            {activeView === "roadmap" && (
              <PlaceholderScreen
                title="Roadmap"
                description="Hier komt straks de eerste 0-30-60-90 dagen roadmap."
              />
            )}

            {activeView === "rapport" && (
              <PlaceholderScreen
                title="Rapport"
                description="Hier komt straks de klantgerichte terugkoppeling."
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Dashboard({ onNewScan }: { onNewScan: () => void }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-slate-950 p-8 text-white lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-300">
            Gesprekstool voor klantteams
          </p>
          <h3 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">
            Breng volwassenheid, knelpunten en prioriteiten snel in beeld.
          </h3>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Gebruik deze MVP tijdens intake, nulmeting, herijking of strategisch
            klantgesprek.
          </p>
        </div>

        <button
          onClick={onNewScan}
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          Nieuwe scan starten
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Aantal scans" value="3" />
        <StatCard label="Gemiddelde volwassenheid" value="4.3" />
        <StatCard label="Afgeronde scans" value="1" />
        <StatCard label="Conceptscans" value="1" />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-semibold">Recente scans</h3>
          <p className="mt-1 text-sm text-slate-600">
            Mockdata voor de eerste MVP-versie.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Klant</th>
                <th className="px-4 py-3 font-semibold">Sector</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Score</th>
                <th className="px-4 py-3 font-semibold">Laatste wijziging</th>
              </tr>
            </thead>
            <tbody>
              {mockScans.map((scan) => (
                <tr key={scan.klant} className="border-t border-slate-200">
                  <td className="px-4 py-4 font-medium">{scan.klant}</td>
                  <td className="px-4 py-4 text-slate-600">{scan.sector}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {scan.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold">{scan.score}</td>
                  <td className="px-4 py-4 text-slate-600">{scan.datum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function NewScan({
  form,
  setForm,
  onNext,
}: {
  form: ScanForm;
  setForm: (form: ScanForm) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Stap 1 van 7
            </p>
            <h3 className="mt-2 text-2xl font-semibold">
              Nieuwe scan / Organisatieprofiel
            </h3>
            <p className="mt-2 max-w-3xl text-slate-600">
              Leg eerst de basisgegevens en context vast. De inhoudelijke scan
              start daarna met praktijkvragen in gewone taal.
            </p>
          </div>

          <button
            onClick={onNext}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Naar praktijktriage
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">1. Organisatie</h4>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextField
            label="Organisatienaam"
            value={form.organisatienaam}
            onChange={(value) => setForm({ ...form, organisatienaam: value })}
          />

          <SelectField
            label="Sector"
            value={form.sector}
            options={sectorOptions}
            onChange={(value) => setForm({ ...form, sector: value })}
          />

          <SelectField
            label="Aantal medewerkers"
            value={form.medewerkers}
            options={employeeOptions}
            onChange={(value) => setForm({ ...form, medewerkers: value })}
          />

          <SelectField
            label="Aantal administraties"
            value={form.administraties}
            options={administrationOptions}
            onChange={(value) => setForm({ ...form, administraties: value })}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">2. Gesprek</h4>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <SelectField
            label="Wat voor klantgesprek is dit?"
            value={form.klantSituatie}
            options={customerSituationOptions}
            onChange={(value) => setForm({ ...form, klantSituatie: value })}
          />

          <TextField
            label="Consultant"
            value={form.consultant}
            onChange={(value) => setForm({ ...form, consultant: value })}
          />

          <TextField
            label="Datum gesprek"
            type="date"
            value={form.datum}
            onChange={(value) => setForm({ ...form, datum: value })}
          />

          <TextField
            label="Wie zitten aan tafel?"
            value={form.deelnemersGesprek}
            onChange={(value) =>
              setForm({ ...form, deelnemersGesprek: value })
            }
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">3. Context</h4>

        <div className="mt-6">
          <MultiSelectField
            label="Waarom doen we deze scan?"
            options={scanReasonOptions}
            values={form.aanleidingScan}
            onChange={(values) => setForm({ ...form, aanleidingScan: values })}
          />
          <p className="mt-2 text-sm text-slate-600">
            Kies wat het beste past. Meerdere antwoorden zijn mogelijk.
          </p>
        </div>

        <div className="mt-6">
          <TextArea
            label="Korte context"
            value={form.context}
            onChange={(value) => setForm({ ...form, context: value })}
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Naar praktijktriage
          </button>
        </div>
      </section>
    </div>
  );
}

function PracticeTriage({
  answers,
  setAnswers,
  painPoints,
  setPainPoints,
  wishes,
  setWishes,
  practiceExample,
  setPracticeExample,
  onBack,
  onNext,
}: {
  answers: Record<string, TriageAnswer>;
  setAnswers: (answers: Record<string, TriageAnswer>) => void;
  painPoints: string[];
  setPainPoints: (values: string[]) => void;
  wishes: string[];
  setWishes: (values: string[]) => void;
  practiceExample: string;
  setPracticeExample: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const sections = Array.from(
    new Set(triageQuestions.map((question) => question.section))
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Stap 2 van 7
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Praktijktriage</h3>
            <p className="mt-2 max-w-3xl text-slate-600">
              We stellen eerst gewone vragen over hoe het werk nu loopt. Geen
              systeemtaal. Het gaat om herkenbare situaties uit de praktijk.
            </p>
          </div>

          <button
            onClick={onNext}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Naar diagnosekaart
          </button>
        </div>
      </section>

      {sections.map((section, index) => (
        <TriageSection
          key={section}
          number={index + 1}
          title={section}
          questions={triageQuestions.filter(
            (question) => question.section === section
          )}
          answers={answers}
          setAnswers={setAnswers}
        />
      ))}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">Waar wringt het?</h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Kruis aan wat herkenbaar is. Juist deze punten laten vaak zien waar de
          echte verbetering zit.
        </p>

        <div className="mt-6">
          <MultiSelectField
            label="Wat kost nu vaak tijd of geeft gedoe?"
            options={painPointOptions}
            values={painPoints}
            onChange={setPainPoints}
          />
        </div>

        <div className="mt-6">
          <TextArea
            label="Praktijkvoorbeeld"
            value={practiceExample}
            onChange={setPracticeExample}
          />
          <p className="mt-2 text-sm text-slate-600">
            Bijvoorbeeld: “Vorige maand ging het mis toen…”
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">
          Wat willen jullie straks beter?
        </h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Kies de wensen die het beste passen. Dit helpt om straks prioriteiten
          te maken die de klant ook echt herkent.
        </p>

        <div className="mt-6">
          <MultiSelectField
            label="Wat zou merkbaar beter moeten worden?"
            options={wishOptions}
            values={wishes}
            onChange={setWishes}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            onClick={onBack}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
          >
            Terug naar organisatieprofiel
          </button>

          <button
            onClick={onNext}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Naar diagnosekaart
          </button>
        </div>
      </section>
    </div>
  );
}

function DiagnosisCard({
  form,
  results,
  painPoints,
  wishes,
  practiceExample,
  onBack,
  onNext,
}: {
  form: ScanForm;
  results: DiagnosisResult[];
  painPoints: string[];
  wishes: string[];
  practiceExample: string;
  onBack: () => void;
  onNext: () => void;
}) {
  const categories: DiagnosisCategory[] = [
    "Werkdomeinen",
    "Digitale basis",
    "Organisatievolwassenheid",
    "Verandervermogen",
  ];

  const topResults = [...results]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Stap 3 van 7
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Diagnosekaart</h3>
            <p className="mt-2 max-w-3xl text-slate-600">
              Op basis van de praktijkvragen stellen we voor welke onderdelen
              verder bekeken moeten worden. Dit is geen eindconclusie, maar een
              startpunt voor het gesprek.
            </p>
          </div>

          <button
            onClick={onNext}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Naar resultaten
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold">Klantcontext</h4>
          <div className="mt-5 space-y-3">
            <MiniInfo label="Organisatie" value={form.organisatienaam} />
            <MiniInfo label="Sector" value={form.sector} />
            <MiniInfo label="Omvang" value={form.medewerkers} />
            <MiniInfo label="Gesprek" value={form.klantSituatie} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold">Herkenbare signalen</h4>
          <div className="mt-4 flex flex-wrap gap-2">
            {painPoints.map((item) => (
              <span
                key={item}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold">Gewenste beweging</h4>
          <div className="mt-4 flex flex-wrap gap-2">
            {wishes.map((item) => (
              <span
                key={item}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">Belangrijkste aandachtspunten</h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Deze onderdelen komen het sterkst naar voren uit de triage.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {topResults.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl bg-slate-950 p-4 text-white"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                {item.category}
              </div>
              <div className="mt-3 font-semibold">{item.title}</div>
              <div className="mt-3 text-sm text-slate-300">{item.status}</div>
            </div>
          ))}
        </div>
      </section>

      {categories.map((category) => (
        <section
          key={category}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h4 className="text-xl font-semibold">{category}</h4>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {results
              .filter((item) => item.category === category)
              .map((item) => (
                <DiagnosisItemCard key={item.key} item={item} />
              ))}
          </div>
        </section>
      ))}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">Praktijkvoorbeeld</h4>
        <p className="mt-3 max-w-4xl leading-7 text-slate-700">
          {practiceExample}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            onClick={onBack}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
          >
            Terug naar praktijktriage
          </button>

          <button
            onClick={onNext}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Naar resultaten
          </button>
        </div>
      </section>
    </div>
  );
}

function DiagnosisItemCard({ item }: { item: DiagnosisResult }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h5 className="font-semibold">{item.title}</h5>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {item.description}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-700">
        <strong>Waarom?</strong> {item.reason}
      </p>

      <div className="mt-4">
        <div className="text-sm font-semibold text-slate-700">
          Wat verder bekijken?
        </div>
        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
          {item.whatToExplore.map((point) => (
            <li key={point}>• {point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TriageSection({
  number,
  title,
  questions,
  answers,
  setAnswers,
}: {
  number: number;
  title: string;
  questions: TriageQuestion[];
  answers: Record<string, TriageAnswer>;
  setAnswers: (answers: Record<string, TriageAnswer>) => void;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h4 className="text-xl font-semibold">
        {number}. {title}
      </h4>

      <div className="mt-6 space-y-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {question.id}
                </div>
                <div className="mt-2 font-semibold">{question.question}</div>
                {question.helpText && (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    {question.helpText}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 lg:min-w-[360px] lg:justify-end">
                {(["Vaak", "Soms", "Nee", "Weet ik niet"] as TriageAnswer[]).map(
                  (option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() =>
                        setAnswers({
                          ...answers,
                          [question.id]: option,
                        })
                      }
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        answers[question.id] === option
                          ? "bg-slate-950 text-white"
                          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function calculateDiagnosis(
  answers: Record<string, TriageAnswer>,
  painPoints: string[],
  wishes: string[]
): DiagnosisResult[] {
  const scores: Record<DiagnosisKey, number> = {
    crm: 0,
    financieel: 0,
    ordermanagement: 0,
    projecten: 0,
    hrm: 0,
    payroll: 0,
    rapportage: 0,
    integraties: 0,
    data: 0,
    samenwerking: 0,
    eigenaarschap: 0,
    verandervermogen: 0,
    capaciteitBudget: 0,
  };

  triageQuestions.forEach((question) => {
    const answer = answers[question.id];

    const value =
      answer === "Vaak"
        ? 2
        : answer === "Soms"
          ? 1
          : answer === "Weet ik niet"
            ? 0.5
            : 0;

    question.diagnosisKeys.forEach((key) => {
      scores[key] += value;
    });
  });

  const signalMap: Record<string, DiagnosisKey[]> = {
    "Veel handwerk": ["eigenaarschap", "samenwerking"],
    "Veel Excel-lijstjes": ["rapportage", "data"],
    "Dubbele invoer": ["integraties", "data"],
    "Achter mensen aan voor akkoord": ["eigenaarschap"],
    "Veel uitzonderingen": ["ordermanagement", "eigenaarschap"],
    "Cijfers worden niet altijd vertrouwd": ["rapportage", "data"],
    "Afhankelijk van kennis van één of enkele mensen": [
      "eigenaarschap",
      "verandervermogen",
    ],
    "Onduidelijk wie eigenaar is": ["eigenaarschap"],
    "Samenwerking tussen afdelingen loopt stroef": ["samenwerking"],
    "Veel weerstand bij verandering": ["verandervermogen"],
    "Te weinig tijd of capaciteit": ["capaciteitBudget"],
    "Budget is nog onduidelijk": ["capaciteitBudget"],
    "Organisatie zit in herstructurering": [
      "verandervermogen",
      "capaciteitBudget",
    ],
    "Minder handwerk": ["eigenaarschap"],
    "Minder Excel": ["rapportage", "data"],
    "Sneller goedkeuren": ["eigenaarschap", "financieel"],
    "Betere overzichten": ["rapportage"],
    "Eerder zien waar het misloopt": ["rapportage"],
    "Minder fouten en herstelwerk": ["data", "eigenaarschap"],
    "Duidelijkere afspraken": ["eigenaarschap", "samenwerking"],
    "Minder afhankelijk van losse kennis": ["eigenaarschap"],
    "Beter kunnen sturen": ["rapportage"],
    "Beter samenwerken tussen afdelingen": ["samenwerking"],
    "Meer eigenaarschap": ["eigenaarschap"],
    "Rustiger en beter kunnen veranderen": ["verandervermogen"],
    "Duidelijk weten welke hulp nodig is": ["capaciteitBudget"],
  };

  [...painPoints, ...wishes].forEach((signal) => {
    signalMap[signal]?.forEach((key) => {
      scores[key] += 1.5;
    });
  });

  return diagnosisCatalog.map((item) => {
    const score = scores[item.key];
    const status = getDiagnosisStatus(score);
    const reason = getDiagnosisReason(item, score, status);

    return {
      ...item,
      score,
      status,
      reason,
    };
  });
}

function getDiagnosisStatus(score: number): DiagnosisStatus {
  if (score >= 4) return "Waarschijnlijk relevant";
  if (score >= 2) return "Kort toetsen";
  if (score > 0) return "Nader verkennen";
  return "Nu niet primair";
}

function getDiagnosisReason(
  item: DiagnosisItem,
  score: number,
  status: DiagnosisStatus
) {
  if (status === "Waarschijnlijk relevant") {
    return `De antwoorden wijzen duidelijk op dit onderdeel. Het is verstandig om ${item.title.toLowerCase()} mee te nemen in de verdiepende scan.`;
  }

  if (status === "Kort toetsen") {
    return `Er zijn signalen dat dit onderdeel kan meespelen. Toets kort of ${item.title.toLowerCase()} echt relevant is voordat je de diepte ingaat.`;
  }

  if (status === "Nader verkennen") {
    return `Er is nog te weinig zekerheid. Laat dit onderdeel zichtbaar, zodat het niet te vroeg buiten beeld raakt.`;
  }

  return `Op basis van de huidige antwoorden lijkt dit onderdeel nu niet de eerste focus. Niet verwijderen, wel parkeren.`;
}

function StatusBadge({ status }: { status: DiagnosisStatus }) {
  const className =
    status === "Waarschijnlijk relevant"
      ? "bg-slate-950 text-white"
      : status === "Kort toetsen"
        ? "bg-white text-slate-800 ring-1 ring-slate-300"
        : status === "Nader verkennen"
          ? "bg-slate-100 text-slate-700"
          : "bg-slate-50 text-slate-500 ring-1 ring-slate-200";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {status}
    </span>
  );
}

function PlaceholderScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
        Wordt in volgende stap opgebouwd
      </p>
      <h3 className="mt-3 text-2xl font-semibold">{title}</h3>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        {description}
      </p>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function MultiSelectField({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  function toggle(option: string) {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
      return;
    }

    onChange([...values, option]);
  }

  return (
    <div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => toggle(option)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              values.includes(option)
                ? "bg-slate-950 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-950"
      />
    </label>
  );
}
