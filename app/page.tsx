"use client";

import { useMemo, useState, type ReactNode } from "react";

type ViewId =
  | "dashboard"
  | "startcheck"
  | "nieuwe-scan"
  | "crm-laag-1"
  | "crm-laag-2"
  | "crm-laag-3"
  | "crm-laag-4"
  | "diagnose"
  | "verdieping"
  | "resultaten"
  | "roadmap"
  | "rapport";

type StartCheckAnswer = "Ja" | "Deels" | "Nee" | "Weet ik niet";

type TriageAnswer =
  | "Ja, vaak"
  | "Soms"
  | "Nee"
  | "Weet ik niet"
  | "Niet van toepassing";

type DiagnosisStatus =
  | "Waarschijnlijk relevant"
  | "Kort toetsen"
  | "Nader verkennen"
  | "Nu niet primair";

type StartCheck = {
  afasLiveStatus: StartCheckAnswer;
  toelichting: string;
};

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

type CrmPainQuestion = {
  id: string;
  question: string;
  helpText: string;
  sectorExamples: Partial<Record<string, string>>;
  diagnosisLabels: string[];
};

type CrmState = {
  relevantie: TriageAnswer;
  pijn: Record<string, TriageAnswer>;
  pijnVoorbeelden: Record<string, string>;
  routes: string[];
  prioriteiten: string[];
  prioriteitToelichting: string;
};

type CrmDiagnosis = {
  status: DiagnosisStatus;
  score: number;
  reason: string;
  activeRoutes: string[];
  nextQuestions: string[];
  firstFocus: string;
};

const brand = {
  navy: "#30385F",
  navyDark: "#1F2748",
  orange: "#EF7043",
  light: "#F6F8FB",
  border: "#E3E8F0",
};

const navigation: { id: ViewId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "startcheck", label: "Startcheck" },
  { id: "nieuwe-scan", label: "Nieuwe scan" },
  { id: "crm-laag-1", label: "CRM laag 1" },
  { id: "crm-laag-2", label: "CRM laag 2" },
  { id: "crm-laag-3", label: "CRM laag 3" },
  { id: "crm-laag-4", label: "CRM laag 4" },
  { id: "diagnose", label: "Diagnosekaart" },
  { id: "verdieping", label: "Verdiepende scan" },
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

const crmPainQuestions: CrmPainQuestion[] = [
  {
    id: "CRM-L2-001",
    question:
      "Moet iemand zoeken in mail, Teams, Excel, losse lijstjes of eigen notities om de laatste afspraak met een relatie te vinden?",
    helpText:
      "Hiermee toetsen we of relatie-informatie centraal vindbaar is of verspreid staat.",
    sectorExamples: {
      Onderwijs:
        "Bijvoorbeeld de laatste afspraak met een stagebedrijf, ouder/verzorger, student of samenwerkingspartner.",
      "Zorg & welzijn":
        "Bijvoorbeeld de laatste afspraak met een gemeente, verwijzer, cliënt, zorgpartner of leverancier.",
      "Zakelijke dienstverlening":
        "Bijvoorbeeld de laatste afspraak met een klant, prospect, leverancier of samenwerkingspartner.",
      Ledenorganisatie:
        "Bijvoorbeeld de laatste afspraak met een lid, vrijwilliger, commissie, partner of leverancier.",
      "Handel / groothandel":
        "Bijvoorbeeld de laatste afspraak met een klant, leverancier, dealer of distributeur.",
      "Overheid / non-profit":
        "Bijvoorbeeld de laatste afspraak met een burger, instelling, ketenpartner of leverancier.",
    },
    diagnosisLabels: ["informatie-versnipperd", "afspraken-niet-vindbaar"],
  },
  {
    id: "CRM-L2-002",
    question:
      "Zijn afspraken met relaties soms alleen bekend bij één of enkele collega’s?",
    helpText:
      "Dit laat zien of kennis goed overdraagbaar is of vooral bij personen zit.",
    sectorExamples: {
      Onderwijs:
        "Bijvoorbeeld een docent of coördinator die als enige weet wat met een stagebedrijf is afgesproken.",
      "Zorg & welzijn":
        "Bijvoorbeeld een medewerker die als enige weet wat met een gemeente of verwijzer is besproken.",
      "Zakelijke dienstverlening":
        "Bijvoorbeeld een accountmanager die als enige weet welke afspraak met de klant is gemaakt.",
      Ledenorganisatie:
        "Bijvoorbeeld een collega die als enige weet wat met een lid, vrijwilliger of commissie is afgesproken.",
    },
    diagnosisLabels: ["kennis-bij-personen", "borging-kwetsbaar"],
  },
  {
    id: "CRM-L2-003",
    question:
      "Blijft opvolging soms liggen omdat niet duidelijk is wie iets moet doen?",
    helpText:
      "Bijvoorbeeld terugbellen, een afspraak bevestigen, een offerte opvolgen of informatie toesturen.",
    sectorExamples: {
      Onderwijs:
        "Bijvoorbeeld terugkoppeling naar een stagebedrijf, ouder/verzorger of samenwerkingspartner.",
      "Zorg & welzijn":
        "Bijvoorbeeld opvolging richting gemeente, cliënt, verwijzer of zorgpartner.",
      "Zakelijke dienstverlening":
        "Bijvoorbeeld opvolging van een offerte, klantvraag, verkoopkans of afspraak.",
      "Handel / groothandel":
        "Bijvoorbeeld opvolging van een klantvraag, prijsafspraak of leveringsafspraak.",
    },
    diagnosisLabels: ["opvolging-onduidelijk", "eigenaarschap"],
  },
  {
    id: "CRM-L2-004",
    question:
      "Komt het voor dat collega’s langs elkaar heen communiceren met dezelfde relatie?",
    helpText:
      "Bijvoorbeeld doordat niet zichtbaar is wie al contact heeft gehad of wat is afgesproken.",
    sectorExamples: {
      Onderwijs:
        "Bijvoorbeeld twee collega’s die hetzelfde stagebedrijf of dezelfde ouder benaderen.",
      "Zorg & welzijn":
        "Bijvoorbeeld meerdere collega’s die dezelfde gemeente, verwijzer of partner benaderen.",
      "Zakelijke dienstverlening":
        "Bijvoorbeeld sales en consultancy die allebei contact hebben met dezelfde klant zonder gedeeld beeld.",
      Ledenorganisatie:
        "Bijvoorbeeld meerdere collega’s die hetzelfde lid, dezelfde vrijwilliger of commissie benaderen.",
    },
    diagnosisLabels: ["samenwerking-kwetsbaar", "contactmomenten-onzichtbaar"],
  },
];

const crmRouteOptions = [
  "Relaties en afspraken centraal vastleggen",
  "Nieuwe klanten, kansen of offertes volgen",
  "Klanten of partners digitaal laten communiceren",
  "Cursussen, trainingen of inschrijvingen beheren",
  "Sollicitanten of kandidaten opvolgen",
  "Weet ik nog niet",
  "Niet van toepassing",
];

const crmPriorityOptions = [
  "Relatiegegevens staan verspreid",
  "Afspraken zijn niet goed terug te vinden",
  "Opvolging blijft soms liggen",
  "Offertes of kansen zijn niet goed zichtbaar",
  "Klanten of partners krijgen niet altijd dezelfde informatie",
  "We missen overzicht over contactmomenten",
  "We gebruiken veel Excel of losse lijstjes",
  "We zijn afhankelijk van kennis van één of enkele mensen",
  "Niet van toepassing",
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

const initialStartCheck: StartCheck = {
  afasLiveStatus: "Ja",
  toelichting:
    "De organisatie werkt langer dan één jaar operationeel met AFAS en de belangrijkste processen zijn in gebruik.",
};

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

const initialCrmState: CrmState = {
  relevantie: "Ja, vaak",
  pijn: {
    "CRM-L2-001": "Ja, vaak",
    "CRM-L2-002": "Soms",
    "CRM-L2-003": "Soms",
    "CRM-L2-004": "Weet ik niet",
  },
  pijnVoorbeelden: {
    "CRM-L2-001":
      "Een collega moest in zijn mailbox zoeken naar de laatste afspraak met een stagebedrijf.",
    "CRM-L2-002":
      "Afspraken met relaties staan soms alleen in persoonlijke notities.",
    "CRM-L2-003":
      "Opvolging blijft soms liggen omdat niet duidelijk is wie eigenaar is.",
    "CRM-L2-004": "",
  },
  routes: ["Relaties en afspraken centraal vastleggen"],
  prioriteiten: [
    "Relatiegegevens staan verspreid",
    "Afspraken zijn niet goed terug te vinden",
    "We gebruiken veel Excel of losse lijstjes",
  ],
  prioriteitToelichting:
    "Eerst zorgen dat relatiegegevens, contactpersonen en afspraken centraal vindbaar zijn. Sales of portalfunctionaliteit kan later.",
};

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [startCheck, setStartCheck] = useState<StartCheck>(initialStartCheck);
  const [form, setForm] = useState<ScanForm>(initialForm);
  const [crmState, setCrmState] = useState<CrmState>(initialCrmState);
  const [crmPainStep, setCrmPainStep] = useState(0);

  const crmDiagnosis = useMemo(
    () => calculateCrmDiagnosis(crmState),
    [crmState]
  );

  function goFromCrmLayer1() {
    if (
      crmState.relevantie === "Nee" ||
      crmState.relevantie === "Niet van toepassing"
    ) {
      setActiveView("diagnose");
      return;
    }

    setCrmPainStep(0);
    setActiveView("crm-laag-2");
  }

  return (
    <main
      className="min-h-screen text-slate-950"
      style={{ backgroundColor: brand.light }}
    >
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-white p-6 lg:block">
          <div className="mb-10">
            <img
              src="/kweekers-logo.png"
              alt="KWEEKERS"
              className="h-10 w-auto"
            />

            <h1
              className="mt-5 text-2xl font-semibold tracking-tight"
              style={{ color: brand.navy }}
            >
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
                    ? "text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                style={
                  activeView === item.id
                    ? { backgroundColor: brand.navy }
                    : undefined
                }
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div
            className="mt-10 rounded-2xl p-4"
            style={{
              backgroundColor: "#F9FAFC",
              border: `1px solid ${brand.border}`,
            }}
          >
            <div className="text-sm font-semibold" style={{ color: brand.navy }}>
              Uitgangspunt
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Het groeimodel is bedoeld voor klanten die minimaal één jaar
              operationeel werken met AFAS en de ingerichte processen.
            </p>
          </div>
        </aside>

        <section className="flex-1">
          <header className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  MVP versie 1 · Startcheck + CRM-trechter
                </p>
                <h2
                  className="text-2xl font-semibold tracking-tight"
                  style={{ color: brand.navy }}
                >
                  KWEEKERS Groeimodel
                </h2>
              </div>

              <div className="hidden items-center gap-3 md:flex">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: brand.orange }}
                />
                <span className="text-sm font-medium text-slate-500">
                  Gesprekstool voor klantteams
                </span>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8">
            {activeView === "dashboard" && (
              <Dashboard onNewScan={() => setActiveView("startcheck")} />
            )}

            {activeView === "startcheck" && (
              <StartCheckScreen
                startCheck={startCheck}
                setStartCheck={setStartCheck}
                onBack={() => setActiveView("dashboard")}
                onNext={() => setActiveView("nieuwe-scan")}
              />
            )}

            {activeView === "nieuwe-scan" && (
              <NewScan
                form={form}
                setForm={setForm}
                startCheck={startCheck}
                onBack={() => setActiveView("startcheck")}
                onNext={() => setActiveView("crm-laag-1")}
              />
            )}

            {activeView === "crm-laag-1" && (
              <CrmLayer1Screen
                sector={form.sector}
                value={crmState.relevantie}
                onChange={(value) =>
                  setCrmState({ ...crmState, relevantie: value })
                }
                onBack={() => setActiveView("nieuwe-scan")}
                onNext={goFromCrmLayer1}
              />
            )}

            {activeView === "crm-laag-2" && (
              <CrmLayer2Screen
                sector={form.sector}
                crmState={crmState}
                setCrmState={setCrmState}
                step={crmPainStep}
                setStep={setCrmPainStep}
                onBackToLayer1={() => setActiveView("crm-laag-1")}
                onNextLayer={() => setActiveView("crm-laag-3")}
              />
            )}

            {activeView === "crm-laag-3" && (
              <CrmLayer3Screen
                sector={form.sector}
                routes={crmState.routes}
                onChange={(routes) =>
                  setCrmState({
                    ...crmState,
                    routes: normalizeNotApplicable(routes),
                  })
                }
                onBack={() => setActiveView("crm-laag-2")}
                onNext={() => setActiveView("crm-laag-4")}
              />
            )}

            {activeView === "crm-laag-4" && (
              <CrmLayer4Screen
                prioriteiten={crmState.prioriteiten}
                toelichting={crmState.prioriteitToelichting}
                onPrioriteitenChange={(prioriteiten) =>
                  setCrmState({
                    ...crmState,
                    prioriteiten: normalizeNotApplicable(prioriteiten),
                  })
                }
                onToelichtingChange={(prioriteitToelichting) =>
                  setCrmState({ ...crmState, prioriteitToelichting })
                }
                onBack={() => setActiveView("crm-laag-3")}
                onNext={() => setActiveView("diagnose")}
              />
            )}

            {activeView === "diagnose" && (
              <CrmDiagnosisCard
                form={form}
                startCheck={startCheck}
                crmState={crmState}
                diagnosis={crmDiagnosis}
                onBack={() => {
                  if (
                    crmState.relevantie === "Nee" ||
                    crmState.relevantie === "Niet van toepassing"
                  ) {
                    setActiveView("crm-laag-1");
                  } else {
                    setActiveView("crm-laag-4");
                  }
                }}
                onNext={() => setActiveView("verdieping")}
              />
            )}

            {activeView === "verdieping" && (
              <PlaceholderScreen
                title="Verdiepende scan – CRM"
                description="Hier komen straks de verdiepende CRM-vragen op basis van de gekozen route: relatiebeheer, sales, portal, cursussen of recruitment."
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
      <div
        className="flex flex-col justify-between gap-6 rounded-3xl p-8 text-white lg:flex-row lg:items-end"
        style={{
          background: `linear-gradient(135deg, ${brand.navy}, ${brand.navyDark})`,
        }}
      >
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
          className="rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: brand.orange }}
        >
          Nieuwe scan starten
        </button>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold" style={{ color: brand.navy }}>
          Uitgangspunt voor inzet
        </h3>
        <p className="mt-3 max-w-5xl leading-7 text-slate-600">
          Het KWEEKERS Groeimodel is bedoeld voor organisaties die minimaal één
          jaar volledig operationeel werken met AFAS en de ingerichte
          bedrijfsprocessen. Dan is er voldoende praktijkervaring om de huidige
          situatie betrouwbaar vast te stellen. Het groeimodel kijkt breder dan
          AFAS alleen: ook processen, eigenaarschap, samenwerking, integraties,
          datakwaliteit en rapportage worden meegenomen.
        </p>
        <p className="mt-3 max-w-5xl leading-7 text-slate-600">
          Daarmee bepalen we wat passend werkt, wat ontbreekt of verbetering
          vraagt en welke gewenste situatie haalbaar en waardevol is.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Aantal scans" value="3" />
        <StatCard label="Gemiddelde volwassenheid" value="4.3" />
        <StatCard label="Afgeronde scans" value="1" />
        <StatCard label="Conceptscans" value="1" />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-semibold" style={{ color: brand.navy }}>
            Recente scans
          </h3>
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

function StartCheckScreen({
  startCheck,
  setStartCheck,
  onBack,
  onNext,
}: {
  startCheck: StartCheck;
  setStartCheck: (value: StartCheck) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const advice = getStartCheckAdvice(startCheck.afasLiveStatus);

  return (
    <div className="space-y-6">
      <LayerHeader
        step="Startcheck"
        title="Is het KWEEKERS Groeimodel het juiste instrument?"
        description="Voordat we starten, bepalen we eerst of de klant voldoende praktijkervaring heeft om digitale volwassenheid betrouwbaar te beoordelen."
        actionLabel={advice.buttonLabel}
        onAction={onNext}
        accent
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-semibold" style={{ color: brand.navy }}>
          Uitgangspunt voor inzet van het KWEEKERS Groeimodel
        </h3>

        <div className="mt-5 max-w-5xl space-y-4 leading-7 text-slate-600">
          <p>
            Het KWEEKERS Groeimodel is bedoeld voor organisaties die minimaal
            één jaar volledig operationeel werken met AFAS en de ingerichte
            bedrijfsprocessen.
          </p>
          <p>
            Na één jaar is er voldoende praktijkervaring om betrouwbaar vast te
            stellen hoe de organisatie nu werkt. Dat noemen we de IST-situatie.
          </p>
          <p>
            Het groeimodel kijkt breder dan AFAS alleen. We kijken ook naar
            processen, eigenaarschap, samenwerking, koppelingen met andere
            systemen, datakwaliteit en rapportage.
          </p>
          <p>
            Zo ontstaat een compleet beeld van de digitale volwassenheid van de
            organisatie. Daarmee bepalen we wat goed werkt, wat ontbreekt of
            verbetering vraagt en welke gewenste situatie haalbaar en waardevol
            is.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p
          className="text-sm font-semibold uppercase tracking-[0.2em]"
          style={{ color: brand.orange }}
        >
          Eerste check
        </p>

        <h3 className="mt-3 text-2xl font-semibold" style={{ color: brand.navy }}>
          Werkt de organisatie minimaal één jaar volledig operationeel met AFAS
          en de ingerichte bedrijfsprocessen?
        </h3>

        <div className="mt-8">
          <StartCheckButtons
            value={startCheck.afasLiveStatus}
            onChange={(afasLiveStatus) =>
              setStartCheck({ ...startCheck, afasLiveStatus })
            }
          />
        </div>

        <div
          className="mt-8 rounded-2xl p-5"
          style={{
            backgroundColor: brand.light,
            border: `1px solid ${brand.border}`,
          }}
        >
          <div className="text-sm font-semibold" style={{ color: brand.navy }}>
            Advies voor inzet
          </div>
          <h4 className="mt-2 text-xl font-semibold" style={{ color: brand.navy }}>
            {advice.title}
          </h4>
          <p className="mt-2 leading-7 text-slate-600">{advice.description}</p>
        </div>

        <div className="mt-8">
          <TextArea
            label="Toelichting"
            value={startCheck.toelichting}
            onChange={(toelichting) =>
              setStartCheck({ ...startCheck, toelichting })
            }
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <SecondaryButton onClick={onBack}>Terug naar dashboard</SecondaryButton>
          <PrimaryButton onClick={onNext} accent>
            {advice.buttonLabel}
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function NewScan({
  form,
  setForm,
  startCheck,
  onBack,
  onNext,
}: {
  form: ScanForm;
  setForm: (form: ScanForm) => void;
  startCheck: StartCheck;
  onBack: () => void;
  onNext: () => void;
}) {
  const advice = getStartCheckAdvice(startCheck.afasLiveStatus);

  return (
    <div className="space-y-6">
      <LayerHeader
        step="Stap 1"
        title="Nieuwe scan / Organisatieprofiel"
        description="Leg eerst de basisgegevens en context vast. Daarna starten we met één trechter: CRM / relatiebeheer."
        actionLabel="Naar CRM laag 1"
        onAction={onNext}
        accent
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold" style={{ color: brand.navy }}>
          Gebruik van de scan
        </h4>
        <div
          className="mt-4 rounded-2xl p-5"
          style={{
            backgroundColor: brand.light,
            border: `1px solid ${brand.border}`,
          }}
        >
          <div className="text-sm font-semibold" style={{ color: brand.navy }}>
            {advice.title}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {advice.description}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold" style={{ color: brand.navy }}>
          1. Organisatie
        </h4>

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
        <h4 className="text-xl font-semibold" style={{ color: brand.navy }}>
          2. Gesprek
        </h4>

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
        <h4 className="text-xl font-semibold" style={{ color: brand.navy }}>
          3. Context
        </h4>

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

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <SecondaryButton onClick={onBack}>Terug naar startcheck</SecondaryButton>
          <PrimaryButton onClick={onNext} accent>
            Naar CRM laag 1
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function CrmLayer1Screen({
  sector,
  value,
  onChange,
  onBack,
  onNext,
}: {
  sector: string;
  value: TriageAnswer;
  onChange: (value: TriageAnswer) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const examples = getSectorRelationExamples(sector);

  return (
    <div className="space-y-6">
      <LayerHeader
        step="CRM laag 1"
        title="Relevantie"
        description="We bepalen eerst of CRM / relatiebeheer überhaupt besproken moet worden."
        actionLabel="Volgende"
        onAction={onNext}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p
          className="text-sm font-semibold uppercase tracking-[0.2em]"
          style={{ color: brand.orange }}
        >
          De poortwachtervraag
        </p>
        <h3 className="mt-3 text-2xl font-semibold" style={{ color: brand.navy }}>
          Hebben jullie te maken met mensen of organisaties buiten jullie eigen
          organisatie waar jullie vaker dan één keer contact mee hebben?
        </h3>

        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          We vragen nog niet naar een module of systeem. Het gaat alleen om de
          vraag of relaties, contactpersonen of afspraken in jullie werk een rol
          spelen.
        </p>

        <div
          className="mt-6 rounded-2xl p-5"
          style={{
            backgroundColor: brand.light,
            border: `1px solid ${brand.border}`,
          }}
        >
          <div className="text-sm font-semibold" style={{ color: brand.navy }}>
            Voorbeelden voor sector: {sector}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {examples.map((example) => (
              <span
                key={example}
                className="rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
              >
                {example}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <AnswerButtons value={value} onChange={onChange} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <SecondaryButton onClick={onBack}>Terug naar organisatieprofiel</SecondaryButton>
          <PrimaryButton onClick={onNext}>Volgende</PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function CrmLayer2Screen({
  sector,
  crmState,
  setCrmState,
  step,
  setStep,
  onBackToLayer1,
  onNextLayer,
}: {
  sector: string;
  crmState: CrmState;
  setCrmState: (state: CrmState) => void;
  step: number;
  setStep: (step: number) => void;
  onBackToLayer1: () => void;
  onNextLayer: () => void;
}) {
  const question = crmPainQuestions[step];
  const currentAnswer = crmState.pijn[question.id] ?? "Weet ik niet";
  const currentExample = crmState.pijnVoorbeelden[question.id] ?? "";
  const sectorExample =
    question.sectorExamples[sector] ??
    "Bijvoorbeeld een afspraak, contactmoment of opvolgactie met een relatie die voor meerdere collega’s belangrijk is.";

  function updateAnswer(value: TriageAnswer) {
    setCrmState({
      ...crmState,
      pijn: {
        ...crmState.pijn,
        [question.id]: value,
      },
    });
  }

  function updateExample(value: string) {
    setCrmState({
      ...crmState,
      pijnVoorbeelden: {
        ...crmState.pijnVoorbeelden,
        [question.id]: value,
      },
    });
  }

  function goBack() {
    if (step === 0) {
      onBackToLayer1();
      return;
    }

    setStep(step - 1);
  }

  function goNext() {
    if (step === crmPainQuestions.length - 1) {
      onNextLayer();
      return;
    }

    setStep(step + 1);
  }

  return (
    <div className="space-y-6">
      <LayerHeader
        step={`CRM laag 2 · Vraag ${step + 1} van ${crmPainQuestions.length}`}
        title="De pijn"
        description="We stellen de pijnvragen één voor één. Zo blijft het gesprek rustig en concreet."
        actionLabel={
          step === crmPainQuestions.length - 1
            ? "Naar laag 3"
            : "Volgende vraag"
        }
        onAction={goNext}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p
          className="text-sm font-semibold uppercase tracking-[0.2em]"
          style={{ color: brand.orange }}
        >
          {question.id}
        </p>
        <h3 className="mt-3 text-2xl font-semibold" style={{ color: brand.navy }}>
          {question.question}
        </h3>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          {question.helpText}
        </p>

        <div
          className="mt-6 rounded-2xl p-5"
          style={{
            backgroundColor: brand.light,
            border: `1px solid ${brand.border}`,
          }}
        >
          <div className="text-sm font-semibold" style={{ color: brand.navy }}>
            Praktijkvoorbeeld voor {sector}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {sectorExample}
          </p>
        </div>

        <div className="mt-8">
          <AnswerButtons value={currentAnswer} onChange={updateAnswer} />
        </div>

        <div className="mt-8">
          <TextArea
            label="Eigen praktijkvoorbeeld"
            value={currentExample}
            onChange={updateExample}
          />
          <p className="mt-2 text-sm text-slate-600">
            Bijvoorbeeld: “Laatst moesten we zoeken naar…”
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <SecondaryButton onClick={goBack}>Terug</SecondaryButton>

          <PrimaryButton onClick={goNext}>
            {step === crmPainQuestions.length - 1
              ? "Naar laag 3"
              : "Volgende vraag"}
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function CrmLayer3Screen({
  sector,
  routes,
  onChange,
  onBack,
  onNext,
}: {
  sector: string;
  routes: string[];
  onChange: (routes: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const routeHint = getSectorRouteHint(sector);

  return (
    <div className="space-y-6">
      <LayerHeader
        step="CRM laag 3"
        title="De route"
        description="Nu bepalen we welk soort CRM hier speelt. Niet elke klant heeft sales nodig."
        actionLabel="Naar laag 4"
        onAction={onNext}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-semibold" style={{ color: brand.navy }}>
          Welke situatie past het beste?
        </h3>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          Kies alleen wat herkenbaar is. Als je het nog niet weet, kies dan
          “Weet ik nog niet”.
        </p>

        <div
          className="mt-6 rounded-2xl p-5"
          style={{
            backgroundColor: brand.light,
            border: `1px solid ${brand.border}`,
          }}
        >
          <div className="text-sm font-semibold" style={{ color: brand.navy }}>
            Denk bij {sector} bijvoorbeeld aan:
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{routeHint}</p>
        </div>

        <div className="mt-8">
          <MultiSelectField
            label="CRM-route"
            options={crmRouteOptions}
            values={routes}
            onChange={onChange}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <SecondaryButton onClick={onBack}>Terug naar laag 2</SecondaryButton>
          <PrimaryButton onClick={onNext}>Naar laag 4</PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function CrmLayer4Screen({
  prioriteiten,
  toelichting,
  onPrioriteitenChange,
  onToelichtingChange,
  onBack,
  onNext,
}: {
  prioriteiten: string[];
  toelichting: string;
  onPrioriteitenChange: (prioriteiten: string[]) => void;
  onToelichtingChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <LayerHeader
        step="CRM laag 4"
        title="De start"
        description="We kiezen bewust één of enkele startpunten. Niet alles tegelijk."
        actionLabel="Naar diagnosekaart"
        onAction={onNext}
        accent
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-semibold" style={{ color: brand.navy }}>
          Waar moeten we als eerste naar kijken?
        </h3>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          Kies de grootste ergernis of het grootste risico. Dit bepaalt de eerste
          verdieping.
        </p>

        <div className="mt-8">
          <MultiSelectField
            label="Eerste prioriteit"
            options={crmPriorityOptions}
            values={prioriteiten}
            onChange={onPrioriteitenChange}
          />
        </div>

        <div className="mt-8">
          <TextArea
            label="Toelichting op de prioriteit"
            value={toelichting}
            onChange={onToelichtingChange}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <SecondaryButton onClick={onBack}>Terug naar laag 3</SecondaryButton>
          <PrimaryButton onClick={onNext} accent>
            Naar diagnosekaart
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function CrmDiagnosisCard({
  form,
  startCheck,
  crmState,
  diagnosis,
  onBack,
  onNext,
}: {
  form: ScanForm;
  startCheck: StartCheck;
  crmState: CrmState;
  diagnosis: CrmDiagnosis;
  onBack: () => void;
  onNext: () => void;
}) {
  const startAdvice = getStartCheckAdvice(startCheck.afasLiveStatus);

  return (
    <div className="space-y-6">
      <LayerHeader
        step="Diagnosekaart"
        title="CRM / Relatiebeheer"
        description="Dit is geen eindconclusie. Het is een voorstel: moeten we CRM verder bekijken, en zo ja, waar beginnen we?"
        actionLabel="Naar verdiepende scan"
        onAction={onNext}
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold" style={{ color: brand.navy }}>
            Klantcontext
          </h4>
          <div className="mt-5 space-y-3">
            <MiniInfo label="Organisatie" value={form.organisatienaam} />
            <MiniInfo label="Sector" value={form.sector} />
            <MiniInfo label="Omvang" value={form.medewerkers} />
            <MiniInfo label="Gesprek" value={form.klantSituatie} />
          </div>
        </div>

        <div
          className="rounded-3xl p-6 text-white shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${brand.navy}, ${brand.navyDark})`,
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            CRM-status
          </p>
          <h4 className="mt-4 text-2xl font-semibold">{diagnosis.status}</h4>
          <p className="mt-4 leading-7 text-slate-300">{diagnosis.reason}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold" style={{ color: brand.navy }}>
            Gebruik scan
          </h4>
          <p className="mt-4 font-semibold" style={{ color: brand.navy }}>
            {startAdvice.title}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {startAdvice.reportNote}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold" style={{ color: brand.navy }}>
          Eerste focus
        </h4>
        <p className="mt-4 leading-7 text-slate-700">
          {diagnosis.firstFocus}
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold" style={{ color: brand.navy }}>
          Gekozen route
        </h4>
        <div className="mt-5 flex flex-wrap gap-2">
          {diagnosis.activeRoutes.map((route) => (
            <span
              key={route}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: brand.navy }}
            >
              {route}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold" style={{ color: brand.navy }}>
          Wat verder bekijken?
        </h4>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {diagnosis.nextQuestions.map((question) => (
            <div
              key={question}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: brand.light,
                border: `1px solid ${brand.border}`,
              }}
            >
              <p className="text-sm leading-6 text-slate-700">{question}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold" style={{ color: brand.navy }}>
          Meegenomen praktijkvoorbeelden
        </h4>
        <div className="mt-5 space-y-4">
          {crmPainQuestions.map((question) => {
            const example = crmState.pijnVoorbeelden[question.id];
            if (!example) return null;

            return (
              <div
                key={question.id}
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: brand.light,
                  border: `1px solid ${brand.border}`,
                }}
              >
                <div className="text-sm font-semibold">{question.question}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {example}
                </p>
              </div>
            );
          })}
        </div>

        {crmState.prioriteitToelichting && (
          <div
            className="mt-5 rounded-2xl p-4"
            style={{
              backgroundColor: brand.light,
              border: `1px solid ${brand.border}`,
            }}
          >
            <div className="text-sm font-semibold">
              Toelichting op prioriteit
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {crmState.prioriteitToelichting}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <SecondaryButton onClick={onBack}>Terug</SecondaryButton>
          <PrimaryButton onClick={onNext}>Naar verdiepende scan</PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function getStartCheckAdvice(answer: StartCheckAnswer) {
  if (answer === "Ja") {
    return {
      title: "Volledig groeimodel",
      buttonLabel: "Start groeimodel",
      description:
        "De klant lijkt geschikt voor het volledige KWEEKERS Groeimodel. Er is voldoende praktijkervaring om de huidige situatie te beoordelen en gericht te kijken naar FIT, GAP en SOLL.",
      reportNote:
        "De scan kan worden gelezen als volwassenheidsmeting, omdat de organisatie minimaal één jaar operationeel werkt met AFAS en de ingerichte processen.",
    };
  }

  if (answer === "Deels") {
    return {
      title: "Beperkte groeiscan",
      buttonLabel: "Start beperkte groeiscan",
      description:
        "Het groeimodel kan worden gebruikt, maar conclusies moeten voorzichtig worden gelezen. Niet alle processen zijn mogelijk al lang genoeg in gebruik.",
      reportNote:
        "De uitkomsten zijn indicatief. Gebruik de scan vooral om knelpunten, risico’s en eerste verbeterstappen scherp te krijgen.",
    };
  }

  if (answer === "Nee") {
    return {
      title: "Implementatiecheck of stabilisatiecheck",
      buttonLabel: "Start implementatiecheck",
      description:
        "De klant werkt nog niet lang genoeg met AFAS en de ingerichte processen om digitale volwassenheid betrouwbaar te meten. Gebruik het gesprek als implementatiecheck, stabilisatiecheck of adoptiecheck.",
      reportNote:
        "De scan is niet bedoeld als volwassenheidsmeting. De focus ligt op inrichting, gebruik, begeleiding en rust brengen in de eerste fase.",
    };
  }

  return {
    title: "Context eerst verduidelijken",
    buttonLabel: "Eerst context vastleggen",
    description:
      "De uitgangssituatie is nog niet duidelijk. Bespreek eerst hoe lang AFAS live is, welke processen volledig in gebruik zijn en waar nog sprake is van opstart, herstel of herinrichting.",
    reportNote:
      "De uitgangssituatie is nog onzeker. Conclusies moeten voorzichtig worden gelezen totdat duidelijk is welke processen al volledig operationeel zijn.",
  };
}

function calculateCrmDiagnosis(crmState: CrmState): CrmDiagnosis {
  let score = 0;

  if (crmState.relevantie === "Niet van toepassing") {
    return {
      status: "Nu niet primair",
      score: 0,
      reason:
        "CRM lijkt voor deze organisatie nu niet van toepassing. Het onderdeel wordt niet verwijderd, maar geparkeerd.",
      activeRoutes: ["Niet van toepassing"],
      firstFocus:
        "CRM parkeren en later alleen kort toetsen als de context verandert.",
      nextQuestions: [
        "Is er een reden om CRM later alsnog kort te toetsen?",
        "Zijn er uitzonderingen waarbij relatie-informatie toch belangrijk is?",
      ],
    };
  }

  if (crmState.relevantie === "Nee") {
    return {
      status: "Nu niet primair",
      score: 0,
      reason:
        "Op basis van de relevantievraag lijkt CRM nu niet de eerste focus. Niet verwijderen, wel parkeren.",
      activeRoutes: ["Nu niet primair"],
      firstFocus: "CRM voorlopig parkeren.",
      nextQuestions: [
        "Zijn er specifieke relaties of partners die toch centraal gevolgd moeten worden?",
        "Moet dit onderwerp later opnieuw worden getoetst?",
      ],
    };
  }

  if (crmState.relevantie === "Ja, vaak") score += 4;
  if (crmState.relevantie === "Soms") score += 2;
  if (crmState.relevantie === "Weet ik niet") score += 1;

  Object.values(crmState.pijn).forEach((answer) => {
    if (answer === "Ja, vaak") score += 2;
    if (answer === "Soms") score += 1;
    if (answer === "Weet ik niet") score += 0.5;
  });

  const meaningfulRoutes = crmState.routes.filter(
    (route) => route !== "Weet ik nog niet" && route !== "Niet van toepassing"
  );

  const meaningfulPriorities = crmState.prioriteiten.filter(
    (priority) => priority !== "Niet van toepassing"
  );

  score += meaningfulRoutes.length;
  score += meaningfulPriorities.length * 0.75;

  let status: DiagnosisStatus = "Nader verkennen";

  if (score >= 8) status = "Waarschijnlijk relevant";
  else if (score >= 4) status = "Kort toetsen";

  const reason =
    status === "Waarschijnlijk relevant"
      ? "De antwoorden wijzen duidelijk op relatiebeheer, afspraken, opvolging of klantcontact. CRM hoort mee te gaan naar de verdiepende scan."
      : status === "Kort toetsen"
      ? "Er zijn signalen dat CRM relevant kan zijn. Toets kort of relatiebeheer, opvolging of afspraken echt knellen voordat je verdiept."
      : "Er is nog onvoldoende duidelijkheid. Laat CRM zichtbaar en stel een paar extra vragen voordat je het parkeert.";

  const activeRoutes =
    meaningfulRoutes.length > 0 ? meaningfulRoutes : ["Nog geen route gekozen"];

  const firstFocus =
    meaningfulPriorities[0] ??
    "Begin met het scherp maken van relatiegegevens, afspraken en opvolging.";

  const nextQuestions = buildCrmNextQuestions(crmState);

  return {
    status,
    score,
    reason,
    activeRoutes,
    firstFocus,
    nextQuestions,
  };
}

function buildCrmNextQuestions(crmState: CrmState) {
  const questions = new Set<string>();

  questions.add("Welke relaties moeten centraal bekend zijn?");
  questions.add(
    "Welke contactpersonen en afspraken moeten meerdere collega’s kunnen zien?"
  );
  questions.add("Waar worden contactmomenten nu vastgelegd?");

  if (crmState.routes.includes("Relaties en afspraken centraal vastleggen")) {
    questions.add(
      "Welke relatiegegevens zijn minimaal nodig om goed te kunnen werken?"
    );
    questions.add("Welke afspraken horen in een centraal dossier?");
  }

  if (crmState.routes.includes("Nieuwe klanten, kansen of offertes volgen")) {
    questions.add(
      "Willen jullie verkoopkansen, offertes of forecast kunnen volgen?"
    );
    questions.add("Wie is eigenaar van commerciële opvolging?");
  }

  if (
    crmState.routes.includes("Klanten of partners digitaal laten communiceren")
  ) {
    questions.add(
      "Welke informatie moeten klanten of partners digitaal kunnen aanleveren of terugvinden?"
    );
    questions.add("Is er behoefte aan een klantportal of digitale formulieren?");
  }

  if (
    crmState.routes.includes("Cursussen, trainingen of inschrijvingen beheren")
  ) {
    questions.add(
      "Welke cursussen, trainingen of bijeenkomsten worden georganiseerd?"
    );
    questions.add(
      "Moeten inschrijving, deelname, evaluatie of facturatie worden gevolgd?"
    );
  }

  if (crmState.routes.includes("Sollicitanten of kandidaten opvolgen")) {
    questions.add("Gaat het om sollicitanten, kandidaten, vacatures of gesprekken?");
    questions.add("Moet dit gekoppeld worden aan HRM of recruitment?");
  }

  if (crmState.prioriteiten.includes("We gebruiken veel Excel of losse lijstjes")) {
    questions.add(
      "Welke Excel-lijstjes gebruiken jullie nu voor relaties, afspraken of opvolging?"
    );
  }

  if (
    crmState.prioriteiten.includes(
      "We zijn afhankelijk van kennis van één of enkele mensen"
    )
  ) {
    questions.add("Welke kennis zit nu vooral bij één of enkele collega’s?");
  }

  return Array.from(questions);
}

function getSectorRelationExamples(sector: string) {
  const map: Record<string, string[]> = {
    Onderwijs: [
      "stagebedrijven",
      "studenten",
      "ouders/verzorgers",
      "gemeenten",
      "samenwerkingspartners",
    ],
    "Zorg & welzijn": [
      "cliënten",
      "verwijzers",
      "gemeenten",
      "zorgpartners",
      "leveranciers",
    ],
    "Zakelijke dienstverlening": [
      "klanten",
      "prospects",
      "leveranciers",
      "partners",
      "contactpersonen",
    ],
    Ledenorganisatie: [
      "leden",
      "commissies",
      "vrijwilligers",
      "partners",
      "leveranciers",
    ],
    "Handel / groothandel": [
      "klanten",
      "leveranciers",
      "dealers",
      "distributeurs",
      "contactpersonen",
    ],
    Productie: [
      "klanten",
      "leveranciers",
      "distributeurs",
      "partners",
      "contactpersonen",
    ],
    "Overheid / non-profit": [
      "burgers",
      "instellingen",
      "ketenpartners",
      "gemeenten",
      "leveranciers",
    ],
    Anders: [
      "klanten",
      "partners",
      "leveranciers",
      "contactpersonen",
      "andere relaties",
    ],
  };

  return map[sector] ?? map.Anders;
}

function getSectorRouteHint(sector: string) {
  const map: Record<string, string> = {
    Onderwijs:
      "stagebedrijven, studenten, ouders/verzorgers, samenwerkingspartners, trainingen, bijeenkomsten of inschrijvingen.",
    "Zorg & welzijn":
      "gemeenten, verwijzers, cliënten, zorgpartners, beschikkingen, afspraken of contactmomenten.",
    "Zakelijke dienstverlening":
      "prospects, klanten, offertes, verkoopkansen, klantafspraken, contactmomenten of klantteams.",
    Ledenorganisatie:
      "leden, vrijwilligers, commissies, partners, bijeenkomsten, inschrijvingen of contactmomenten.",
    "Handel / groothandel":
      "klanten, leveranciers, dealers, prijsafspraken, contactpersonen, offertes of opvolging.",
    Productie:
      "klanten, leveranciers, distributeurs, kwaliteitsafspraken, contactmomenten of opvolging.",
    "Overheid / non-profit":
      "burgers, instellingen, ketenpartners, gemeenten, dossiers, afspraken of contactmomenten.",
    Anders:
      "klanten, partners, leveranciers, afspraken, contactmomenten, opvolging of digitale communicatie.",
  };

  return map[sector] ?? map.Anders;
}

function normalizeNotApplicable(values: string[]) {
  const last = values[values.length - 1];

  if (last === "Niet van toepassing") {
    return ["Niet van toepassing"];
  }

  return values.filter((value) => value !== "Niet van toepassing");
}

function LayerHeader({
  step,
  title,
  description,
  actionLabel,
  onAction,
  accent = false,
}: {
  step: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  accent?: boolean;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p
            className="text-sm font-semibold uppercase tracking-[0.25em]"
            style={{ color: accent ? brand.orange : "#64748B" }}
          >
            {step}
          </p>
          <h3
            className="mt-2 text-2xl font-semibold"
            style={{ color: brand.navy }}
          >
            {title}
          </h3>
          <p className="mt-2 max-w-3xl text-slate-600">{description}</p>
        </div>

        <PrimaryButton onClick={onAction} accent={accent}>
          {actionLabel}
        </PrimaryButton>
      </div>
    </section>
  );
}

function StartCheckButtons({
  value,
  onChange,
}: {
  value: StartCheckAnswer;
  onChange: (value: StartCheckAnswer) => void;
}) {
  const options: StartCheckAnswer[] = ["Ja", "Deels", "Nee", "Weet ik niet"];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition hover:opacity-90 ${
            value === option
              ? "text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
          }`}
          style={
            value === option
              ? {
                  backgroundColor:
                    option === "Ja" ? brand.navy : brand.orange,
                }
              : undefined
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function AnswerButtons({
  value,
  onChange,
}: {
  value: TriageAnswer;
  onChange: (value: TriageAnswer) => void;
}) {
  const options: TriageAnswer[] = [
    "Ja, vaak",
    "Soms",
    "Nee",
    "Weet ik niet",
    "Niet van toepassing",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition hover:opacity-90 ${
            value === option
              ? "text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
          }`}
          style={
            value === option
              ? {
                  backgroundColor:
                    option === "Niet van toepassing"
                      ? brand.orange
                      : brand.navy,
                }
              : undefined
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  accent = false,
}: {
  children: ReactNode;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      style={{ backgroundColor: accent ? brand.orange : brand.navy }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
    >
      {children}
    </button>
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
      <p
        className="text-sm font-semibold uppercase tracking-[0.25em]"
        style={{ color: brand.orange }}
      >
        Wordt in volgende stap opgebouwd
      </p>
      <h3 className="mt-3 text-2xl font-semibold" style={{ color: brand.navy }}>
        {title}
      </h3>
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
      <div className="mt-3 text-3xl font-semibold" style={{ color: brand.navy }}>
        {value}
      </div>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 font-semibold" style={{ color: brand.navy }}>
        {value}
      </div>
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
        {options.map((option) => {
          const selected = values.includes(option);

          return (
            <button
              type="button"
              key={option}
              onClick={() => toggle(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition hover:opacity-90 ${
                selected
                  ? "text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
              style={
                selected
                  ? {
                      backgroundColor:
                        option === "Niet van toepassing"
                          ? brand.orange
                          : brand.navy,
                    }
                  : undefined
              }
            >
              {option}
            </button>
          );
        })}
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
