"use client";

import { useMemo, useState } from "react";

type ViewId =
  | "dashboard"
  | "nieuwe-scan"
  | "crm-triage"
  | "diagnose"
  | "verdieping"
  | "resultaten"
  | "roadmap"
  | "rapport";

type TriageAnswer = "Ja, vaak" | "Soms" | "Nee" | "Weet ik niet";

type DiagnosisStatus =
  | "Waarschijnlijk relevant"
  | "Kort toetsen"
  | "Nader verkennen"
  | "Nu niet primair";

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

type CrmState = {
  relevantie: TriageAnswer;
  pijn: Record<string, TriageAnswer>;
  routes: string[];
  prioriteiten: string[];
  praktijkvoorbeeld: string;
};

type CrmDiagnosis = {
  status: DiagnosisStatus;
  score: number;
  reason: string;
  activeRoutes: string[];
  nextQuestions: string[];
  firstFocus: string;
};

const navigation: { id: ViewId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "nieuwe-scan", label: "Nieuwe scan" },
  { id: "crm-triage", label: "CRM-trechter" },
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

const crmPainQuestions = [
  {
    id: "crm-pain-1",
    question:
      "Als iemand vandaag wil weten wat de laatste afspraak met een relatie was, is dat dan snel terug te vinden?",
    helpText:
      "Denk aan afspraken met klanten, partners, leveranciers, gemeenten, stagebedrijven of verwijzers.",
  },
  {
    id: "crm-pain-2",
    question:
      "Moet iemand zoeken in mail, Teams, Excel, losse lijstjes of eigen notities?",
    helpText:
      "Dit wijst vaak op versnipperde informatie en afhankelijkheid van personen.",
  },
  {
    id: "crm-pain-3",
    question:
      "Komt het voor dat een afspraak, kans of opvolgactie blijft liggen?",
    helpText:
      "Bijvoorbeeld omdat niemand eigenaar is of omdat de afspraak niet centraal zichtbaar is.",
  },
  {
    id: "crm-pain-4",
    question:
      "Komt het voor dat twee collega’s dezelfde relatie benaderen zonder dat ze dat van elkaar weten?",
    helpText:
      "Dit laat zien of klantcontact en samenwerking goed op elkaar aansluiten.",
  },
];

const crmRouteOptions = [
  "Relaties en afspraken centraal vastleggen",
  "Nieuwe klanten, kansen of offertes volgen",
  "Klanten of partners digitaal laten communiceren",
  "Cursussen, trainingen of inschrijvingen beheren",
  "Sollicitanten of kandidaten opvolgen",
  "Weet ik nog niet",
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

const initialCrmState: CrmState = {
  relevantie: "Ja, vaak",
  pijn: {
    "crm-pain-1": "Soms",
    "crm-pain-2": "Ja, vaak",
    "crm-pain-3": "Soms",
    "crm-pain-4": "Weet ik niet",
  },
  routes: ["Relaties en afspraken centraal vastleggen"],
  prioriteiten: [
    "Relatiegegevens staan verspreid",
    "Afspraken zijn niet goed terug te vinden",
    "We gebruiken veel Excel of losse lijstjes",
  ],
  praktijkvoorbeeld:
    "Een collega moest laatst in zijn mailbox zoeken naar de laatste afspraak met een partner. Een andere collega wist niet dat die afspraak al gemaakt was.",
};

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [form, setForm] = useState<ScanForm>(initialForm);
  const [crmState, setCrmState] = useState<CrmState>(initialCrmState);

  const crmDiagnosis = useMemo(() => calculateCrmDiagnosis(crmState), [crmState]);

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
            <div className="text-sm font-semibold">MVP-aanpak</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Eerst één trechter goed maken. Daarna hetzelfde patroon kopiëren
              naar andere onderdelen.
            </p>
          </div>
        </aside>

        <section className="flex-1">
          <header className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="mx-auto max-w-7xl">
              <p className="text-sm font-medium text-slate-500">
                MVP versie 1 · CRM-trechter
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
                onNext={() => setActiveView("crm-triage")}
              />
            )}

            {activeView === "crm-triage" && (
              <CrmTriage
                crmState={crmState}
                setCrmState={setCrmState}
                onBack={() => setActiveView("nieuwe-scan")}
                onNext={() => setActiveView("diagnose")}
              />
            )}

            {activeView === "diagnose" && (
              <CrmDiagnosisCard
                form={form}
                crmState={crmState}
                diagnosis={crmDiagnosis}
                onBack={() => setActiveView("crm-triage")}
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
              Stap 1
            </p>
            <h3 className="mt-2 text-2xl font-semibold">
              Nieuwe scan / Organisatieprofiel
            </h3>
            <p className="mt-2 max-w-3xl text-slate-600">
              Leg eerst de basisgegevens en context vast. Daarna starten we met
              één trechter: CRM / relatiebeheer.
            </p>
          </div>

          <button
            onClick={onNext}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Naar CRM-trechter
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
            Naar CRM-trechter
          </button>
        </div>
      </section>
    </div>
  );
}

function CrmTriage({
  crmState,
  setCrmState,
  onBack,
  onNext,
}: {
  crmState: CrmState;
  setCrmState: (state: CrmState) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const showDeeperLayers = crmState.relevantie !== "Nee";

  function updatePain(questionId: string, value: TriageAnswer) {
    setCrmState({
      ...crmState,
      pijn: {
        ...crmState.pijn,
        [questionId]: value,
      },
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Stap 2
            </p>
            <h3 className="mt-2 text-2xl font-semibold">
              CRM-trechter / Relaties & afspraken
            </h3>
            <p className="mt-2 max-w-3xl text-slate-600">
              We bepalen eerst of CRM relevant is. Daarna kijken we pas waar het
              pijn doet, welke route past en waar we moeten beginnen.
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

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Laag 1 · Relevantie
            </p>
            <h4 className="mt-2 text-xl font-semibold">
              Moeten we CRM überhaupt bespreken?
            </h4>
            <p className="mt-2 max-w-3xl text-slate-600">
              Hebben jullie te maken met mensen of organisaties buiten jullie
              eigen organisatie waar jullie vaker dan één keer contact mee
              hebben?
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Denk aan klanten, leden, partners, leveranciers, gemeenten,
              stagebedrijven, verwijzers, prospects of andere relaties.
            </p>
          </div>

          <AnswerButtons
            value={crmState.relevantie}
            onChange={(value) =>
              setCrmState({ ...crmState, relevantie: value })
            }
          />
        </div>
      </section>

      {showDeeperLayers ? (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Laag 2 · De pijn
            </p>
            <h4 className="mt-2 text-xl font-semibold">
              Waar gaat het nu mis of kost het tijd?
            </h4>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Hier zoeken we niet naar een module, maar naar herkenbare
              situaties uit de praktijk.
            </p>

            <div className="mt-6 space-y-4">
              {crmPainQuestions.map((question) => (
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
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        {question.helpText}
                      </p>
                    </div>

                    <AnswerButtons
                      value={crmState.pijn[question.id]}
                      onChange={(value) => updatePain(question.id, value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Laag 3 · De route
            </p>
            <h4 className="mt-2 text-xl font-semibold">
              Welk soort CRM lijkt hier te spelen?
            </h4>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Niet elke klant heeft sales nodig. Soms gaat het vooral om
              relaties, partners, afspraken, communicatie, cursussen of werving.
            </p>

            <div className="mt-6">
              <MultiSelectField
                label="Wat past het beste?"
                options={crmRouteOptions}
                values={crmState.routes}
                onChange={(values) =>
                  setCrmState({ ...crmState, routes: values })
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Laag 4 · De start
            </p>
            <h4 className="mt-2 text-xl font-semibold">
              Waar moeten we als eerste naar kijken?
            </h4>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Kies de grootste ergernis of het grootste risico. Niet alles hoeft
              tegelijk.
            </p>

            <div className="mt-6">
              <MultiSelectField
                label="Wat geeft nu de meeste ergernis?"
                options={crmPriorityOptions}
                values={crmState.prioriteiten}
                onChange={(values) =>
                  setCrmState({ ...crmState, prioriteiten: values })
                }
              />
            </div>

            <div className="mt-6">
              <TextArea
                label="Praktijkvoorbeeld"
                value={crmState.praktijkvoorbeeld}
                onChange={(value) =>
                  setCrmState({ ...crmState, praktijkvoorbeeld: value })
                }
              />
              <p className="mt-2 text-sm text-slate-600">
                Bijvoorbeeld: “Laatst moesten we zoeken naar de laatste afspraak
                met een partner…”
              </p>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-xl font-semibold">CRM voorlopig parkeren</h4>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            Omdat de relevantievraag met “Nee” is beantwoord, verdiepen we CRM
            nu niet. Het onderdeel blijft zichtbaar, zodat het later alsnog kort
            getoetst kan worden.
          </p>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
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

function CrmDiagnosisCard({
  form,
  crmState,
  diagnosis,
  onBack,
  onNext,
}: {
  form: ScanForm;
  crmState: CrmState;
  diagnosis: CrmDiagnosis;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Stap 3
            </p>
            <h3 className="mt-2 text-2xl font-semibold">
              Diagnosekaart · CRM
            </h3>
            <p className="mt-2 max-w-3xl text-slate-600">
              Dit is geen eindconclusie. Het is een voorstel voor het klantteam:
              moeten we CRM verder bekijken, en zo ja, welke route eerst?
            </p>
          </div>

          <button
            onClick={onNext}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Naar verdiepende scan
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

        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            CRM-status
          </p>
          <h4 className="mt-4 text-2xl font-semibold">{diagnosis.status}</h4>
          <p className="mt-4 leading-7 text-slate-300">{diagnosis.reason}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold">Eerste focus</h4>
          <p className="mt-4 leading-7 text-slate-700">
            {diagnosis.firstFocus}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">Gekozen CRM-route</h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          De route helpt om niet “heel CRM” te openen, maar gericht te bepalen
          wat voor deze klant relevant is.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {diagnosis.activeRoutes.map((route) => (
            <span
              key={route}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              {route}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">Wat verder bekijken?</h4>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {diagnosis.nextQuestions.map((question) => (
            <div
              key={question}
              className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
            >
              <p className="text-sm leading-6 text-slate-700">{question}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">Praktijkvoorbeeld</h4>
        <p className="mt-3 max-w-4xl leading-7 text-slate-700">
          {crmState.praktijkvoorbeeld}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            onClick={onBack}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
          >
            Terug naar CRM-trechter
          </button>

          <button
            onClick={onNext}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Naar verdiepende scan
          </button>
        </div>
      </section>
    </div>
  );
}

function calculateCrmDiagnosis(crmState: CrmState): CrmDiagnosis {
  let score = 0;

  if (crmState.relevantie === "Ja, vaak") score += 4;
  if (crmState.relevantie === "Soms") score += 2;
  if (crmState.relevantie === "Weet ik niet") score += 1;

  Object.values(crmState.pijn).forEach((answer) => {
    if (answer === "Ja, vaak") score += 2;
    if (answer === "Soms") score += 1;
    if (answer === "Weet ik niet") score += 0.5;
  });

  score += crmState.routes.filter((route) => route !== "Weet ik nog niet").length;
  score += crmState.prioriteiten.length * 0.75;

  let status: DiagnosisStatus = "Nu niet primair";

  if (crmState.relevantie === "Nee") {
    status = "Nu niet primair";
  } else if (score >= 8) {
    status = "Waarschijnlijk relevant";
  } else if (score >= 4) {
    status = "Kort toetsen";
  } else {
    status = "Nader verkennen";
  }

  const activeRoutes =
    crmState.routes.length > 0 ? crmState.routes : ["Nog geen route gekozen"];

  const reason =
    status === "Waarschijnlijk relevant"
      ? "De antwoorden wijzen duidelijk op relatiebeheer, afspraken, opvolging of klantcontact. CRM hoort mee te gaan naar de verdiepende scan."
      : status === "Kort toetsen"
        ? "Er zijn signalen dat CRM relevant kan zijn. Toets kort of relatiebeheer, opvolging of afspraken echt knellen voordat je verdiept."
        : status === "Nader verkennen"
          ? "Er is nog onvoldoende duidelijkheid. Laat CRM zichtbaar en stel een paar extra vragen voordat je het parkeert."
          : "Op basis van de relevantievraag lijkt CRM nu niet de eerste focus. Niet verwijderen, wel parkeren.";

  const firstFocus =
    crmState.prioriteiten[0] ??
    (status === "Nu niet primair"
      ? "CRM voorlopig parkeren en later kort toetsen."
      : "Begin met het scherp maken van relatiegegevens, afspraken en opvolging.");

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
  questions.add("Welke contactpersonen en afspraken moeten meerdere collega’s kunnen zien?");
  questions.add("Waar worden contactmomenten nu vastgelegd?");

  if (crmState.routes.includes("Relaties en afspraken centraal vastleggen")) {
    questions.add("Welke relatiegegevens zijn minimaal nodig om goed te kunnen werken?");
    questions.add("Welke afspraken horen in een centraal dossier?");
  }

  if (crmState.routes.includes("Nieuwe klanten, kansen of offertes volgen")) {
    questions.add("Willen jullie verkoopkansen, offertes of forecast kunnen volgen?");
    questions.add("Wie is eigenaar van commerciële opvolging?");
  }

  if (
    crmState.routes.includes(
      "Klanten of partners digitaal laten communiceren"
    )
  ) {
    questions.add("Welke informatie moeten klanten of partners digitaal kunnen aanleveren of terugvinden?");
    questions.add("Is er behoefte aan een klantportal of digitale formulieren?");
  }

  if (
    crmState.routes.includes(
      "Cursussen, trainingen of inschrijvingen beheren"
    )
  ) {
    questions.add("Welke cursussen, trainingen of bijeenkomsten worden georganiseerd?");
    questions.add("Moeten inschrijving, deelname, evaluatie of facturatie worden gevolgd?");
  }

  if (crmState.routes.includes("Sollicitanten of kandidaten opvolgen")) {
    questions.add("Gaat het om sollicitanten, kandidaten, vacatures of gesprekken?");
    questions.add("Moet dit gekoppeld worden aan HRM of recruitment?");
  }

  if (crmState.prioriteiten.includes("We gebruiken veel Excel of losse lijstjes")) {
    questions.add("Welke Excel-lijstjes gebruiken jullie nu voor relaties, afspraken of opvolging?");
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

function AnswerButtons({
  value,
  onChange,
}: {
  value: TriageAnswer;
  onChange: (value: TriageAnswer) => void;
}) {
  const options: TriageAnswer[] = ["Ja, vaak", "Soms", "Nee", "Weet ik niet"];

  return (
    <div className="flex flex-wrap gap-2 lg:min-w-[360px] lg:justify-end">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            value === option
              ? "bg-slate-950 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
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
