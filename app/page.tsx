"use client";

import { useState } from "react";

type ViewId =
  | "dashboard"
  | "nieuwe-scan"
  | "scan"
  | "diagnose"
  | "resultaten"
  | "roadmap"
  | "rapport";

type TriageAnswer = "Vaak" | "Soms" | "Nee" | "Weet ik niet";

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
    id: "FIN-TRIAGE-001",
    section: "Geld / facturen / betalingen",
    question: "Versturen jullie facturen naar klanten?",
    helpText: "Het gaat hier om verkoopfacturen, declaraties of andere bedragen die naar klanten gaan.",
  },
  {
    id: "FIN-TRIAGE-002",
    section: "Geld / facturen / betalingen",
    question: "Krijgen jullie facturen van leveranciers?",
    helpText: "Denk aan inkoopfacturen, kostenfacturen of facturen die eerst beoordeeld moeten worden.",
  },
  {
    id: "FIN-TRIAGE-003",
    section: "Geld / facturen / betalingen",
    question: "Moeten facturen eerst worden goedgekeurd?",
    helpText: "Bijvoorbeeld door een budgethouder, manager, projectleider of administratie.",
  },
  {
    id: "FIN-TRIAGE-004",
    section: "Geld / facturen / betalingen",
    question: "Is snel inzicht in kosten, betalingen of openstaande posten belangrijk?",
    helpText: "Denk aan grip op geld, kosten, betalingen, openstaande facturen of verplichtingen.",
  },
  {
    id: "PROJ-TRIAGE-001",
    section: "Klussen / opdrachten / projecten",
    question: "Doen jullie werk dat over meerdere dagen of weken loopt?",
    helpText: "We bedoelen werk dat je als opdracht, klus, traject, project of dossier zou kunnen volgen.",
  },
  {
    id: "PROJ-TRIAGE-002",
    section: "Klussen / opdrachten / projecten",
    question: "Willen jullie weten of een klus of opdracht goed loopt qua uren, kosten of opbrengst?",
    helpText: "Dit hoeft nog geen projectadministratie te zijn. Het gaat om grip op werk en resultaat.",
  },
  {
    id: "PROJ-TRIAGE-003",
    section: "Klussen / opdrachten / projecten",
    question: "Moeten uren of kosten aan een opdracht worden gekoppeld?",
    helpText: "Bijvoorbeeld voor facturatie, budgetbewaking, subsidie, nacalculatie of interne sturing.",
  },
  {
    id: "PROJ-TRIAGE-004",
    section: "Klussen / opdrachten / projecten",
    question: "Is het belangrijk om eerder te zien of werk uit de pas loopt?",
    helpText: "Bijvoorbeeld als er te veel uren, kosten, vertraging of onduidelijkheid ontstaat.",
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

const initialTriageAnswers: Record<string, TriageAnswer> = Object.fromEntries(
  triageQuestions.map((question) => [question.id, "Weet ik niet"])
);

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [form, setForm] = useState<ScanForm>(initialForm);
  const [triageAnswers, setTriageAnswers] =
    useState<Record<string, TriageAnswer>>(initialTriageAnswers);
  const [painPoints, setPainPoints] = useState<string[]>([
    "Veel handwerk",
    "Veel Excel-lijstjes",
  ]);
  const [wishes, setWishes] = useState<string[]>([
    "Minder handwerk",
    "Betere overzichten",
  ]);
  const [practiceExample, setPracticeExample] = useState(
    "Vorige maand kostte het veel tijd om de juiste cijfers en goedkeuringen boven water te krijgen."
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
              Geen database, geen login en geen koppelingen. Eerst toetsen of
              het model waarde toevoegt in klantgesprekken.
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
              <PlaceholderScreen
                title="Scherm 3 – Diagnosekaart"
                description="Hier vertalen we straks de antwoorden naar herkenbare signalen, relevante domeinen en onderwerpen die nader verkend moeten worden."
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
  const financeQuestions = triageQuestions.filter(
    (question) => question.section === "Geld / facturen / betalingen"
  );
  const projectQuestions = triageQuestions.filter(
    (question) => question.section === "Klussen / opdrachten / projecten"
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

      <TriageSection
        title="1. Geld / facturen / betalingen"
        intro="We kijken eerst of geldstromen, facturen, goedkeuringen en inzicht in kosten belangrijk zijn. Dit zegt nog niets over de oplossing; het helpt alleen om te bepalen of we hier dieper op moeten ingaan."
        questions={financeQuestions}
        answers={answers}
        setAnswers={setAnswers}
      />

      <TriageSection
        title="2. Klussen / opdrachten / projecten"
        intro="Veel organisaties noemen iets geen project, terwijl ze wel werk doen dat over meerdere dagen of weken loopt. Daarom vragen we naar het werk zelf, niet naar een module of systeem."
        questions={projectQuestions}
        answers={answers}
        setAnswers={setAnswers}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">3. Waar wringt het?</h4>
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
          4. Wat willen jullie straks beter?
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
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">5. Interne vertaling</h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Dit deel is bedoeld voor het klantteam. De klant hoeft nog geen
          AFAS-termen te kennen. Wij vertalen herkenbare signalen later naar
          domeinen, verdieping en een eerste roadmap.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SignalCard label="Veel handwerk" value="Proces nog niet strak genoeg" />
          <SignalCard label="Veel Excel" value="Informatie buiten het hoofdproces" />
          <SignalCard label="Achter mensen aan" value="Eigenaarschap of workflow ontbreekt" />
          <SignalCard label="Cijfers niet vertrouwd" value="Data of definities niet eenduidig" />
          <SignalCard label="Afhankelijk van personen" value="Kennis is onvoldoende geborgd" />
          <SignalCard label="Eerder zien waar het misloopt" value="Behoefte aan stuurinformatie" />
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

function TriageSection({
  title,
  intro,
  questions,
  answers,
  setAnswers,
}: {
  title: string;
  intro: string;
  questions: TriageQuestion[];
  answers: Record<string, TriageAnswer>;
  setAnswers: (answers: Record<string, TriageAnswer>) => void;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h4 className="text-xl font-semibold">{title}</h4>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        {intro}
      </p>

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

function SignalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="text-sm font-semibold">{label}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{value}</p>
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
