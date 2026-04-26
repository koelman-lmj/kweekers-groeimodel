"use client";

import { useMemo, useState } from "react";

type ViewId =
  | "dashboard"
  | "nieuwe-scan"
  | "scan"
  | "resultaten"
  | "roadmap"
  | "rapport";

type DomainKey = "crm" | "financieel" | "ordermanagement" | "projecten";

type Domain = {
  key: DomainKey;
  title: string;
  description: string;
};

type Assessment = {
  score: number;
  observaties: string;
  knelpunten: string;
  volgendeStap: string;
};

type ScanForm = {
  organisatienaam: string;
  sector: string;
  medewerkers: string;
  aanleiding: string;
  consultant: string;
  datum: string;
  context: string;
};

const scoreModel = [
  { score: 0, label: "Niet aanwezig", description: "Er is geen vaste werkwijze." },
  { score: 1, label: "Ad hoc", description: "Het werkt vooral op basis van losse acties." },
  { score: 2, label: "Herhaalbaar", description: "Er is een werkwijze, maar nog beperkt vastgelegd." },
  { score: 3, label: "Gestandaardiseerd", description: "De werkwijze is bekend en wordt meestal gevolgd." },
  { score: 4, label: "Beheerst", description: "Er is eigenaarschap, controle en sturing." },
  { score: 5, label: "Geoptimaliseerd", description: "Het proces wordt actief verbeterd." },
  { score: 6, label: "Geïntegreerd", description: "Proces, systeem en data werken goed samen." },
  { score: 7, label: "Data-gedreven", description: "De organisatie stuurt vooruit op basis van data." },
];

const domains: Domain[] = [
  {
    key: "crm",
    title: "CRM / Commercie",
    description:
      "Inzicht in klantrelaties, verkoopkansen, opvolging en commerciële sturing.",
  },
  {
    key: "financieel",
    title: "Financieel",
    description:
      "Grip op financiële administratie, facturatie, rapportage en maandafsluiting.",
  },
  {
    key: "ordermanagement",
    title: "Ordermanagement",
    description:
      "Beheersing van orderproces, levering, uitzonderingen en interne overdracht.",
  },
  {
    key: "projecten",
    title: "Projecten",
    description:
      "Sturing op projectadministratie, uren, budgetten, voortgang en resultaat.",
  },
];

const initialAssessments: Record<DomainKey, Assessment> = {
  crm: {
    score: 3,
    observaties:
      "Klantinformatie is aanwezig, maar opvolging en commerciële sturing zijn nog wisselend ingericht.",
    knelpunten:
      "Geen eenduidig beeld van verkoopkansen en beperkte vastlegging van klantafspraken.",
    volgendeStap:
      "Maak een vaste commerciële werkwijze voor relatiebeheer, kansen en opvolging.",
  },
  financieel: {
    score: 4,
    observaties:
      "De financiële basis is op orde, maar rapportage en eigenaarschap kunnen scherper.",
    knelpunten:
      "Maandafsluiting en managementinformatie zijn nog deels afhankelijk van handmatige controles.",
    volgendeStap:
      "Standaardiseer de afsluitprocedure en bepaal vaste financiële stuurinformatie.",
  },
  ordermanagement: {
    score: 2,
    observaties:
      "Het orderproces werkt, maar leunt sterk op kennis van individuele medewerkers.",
    knelpunten:
      "Uitzonderingen worden niet altijd vastgelegd en overdracht tussen afdelingen is kwetsbaar.",
    volgendeStap:
      "Breng de orderflow in kaart en bepaal waar standaardisatie nodig is.",
  },
  projecten: {
    score: 3,
    observaties:
      "Projectinformatie is beschikbaar, maar voortgang, budget en resultaat worden niet overal gelijk gestuurd.",
    knelpunten:
      "Er is beperkt inzicht in actuele projectstatus en verwachte afwijkingen.",
    volgendeStap:
      "Bepaal vaste projectsturing op uren, budget, voortgang en resultaat.",
  },
};

const mockScans = [
  {
    klant: "Participe",
    sector: "Zorg & welzijn",
    status: "In gesprek",
    score: 3.1,
    datum: "24-04-2026",
  },
  {
    klant: "Environ",
    sector: "Zakelijke dienstverlening",
    status: "Afgerond",
    score: 3.8,
    datum: "18-04-2026",
  },
  {
    klant: "Codarts",
    sector: "Onderwijs",
    status: "Concept",
    score: 2.9,
    datum: "12-04-2026",
  },
];

const navigation: { id: ViewId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "nieuwe-scan", label: "Nieuwe scan" },
  { id: "scan", label: "Scan invullen" },
  { id: "resultaten", label: "Resultaten" },
  { id: "roadmap", label: "Roadmap" },
  { id: "rapport", label: "Rapport" },
];

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");

  const [form, setForm] = useState<ScanForm>({
    organisatienaam: "Voorbeeldorganisatie",
    sector: "Zakelijke dienstverlening",
    medewerkers: "250",
    aanleiding:
      "De organisatie wil scherper bepalen waar AFAS, processen en sturing verbeterd kunnen worden.",
    consultant: "KWEEKERS klantteam",
    datum: "2026-04-26",
    context:
      "De scan wordt gebruikt als gesprekstool tijdens een nulmeting en vormt de basis voor prioriteiten en een eerste roadmap.",
  });

  const [assessments, setAssessments] =
    useState<Record<DomainKey, Assessment>>(initialAssessments);

  const averageScore = useMemo(() => {
    const total = domains.reduce(
      (sum, domain) => sum + assessments[domain.key].score,
      0
    );
    return total / domains.length;
  }, [assessments]);

  const priorityDomains = useMemo(() => {
    return domains
      .map((domain) => ({
        ...domain,
        assessment: assessments[domain.key],
      }))
      .sort((a, b) => a.assessment.score - b.assessment.score)
      .slice(0, 3);
  }, [assessments]);

  function updateAssessment(key: DomainKey, patch: Partial<Assessment>) {
    setAssessments((previous) => ({
      ...previous,
      [key]: {
        ...previous[key],
        ...patch,
      },
    }));
  }

  function getLevel(score: number) {
    return scoreModel.find((item) => item.score === score) ?? scoreModel[0];
  }

  function getMaturityPhase(score: number) {
    if (score < 2) return "Basis ontbreekt";
    if (score < 3.5) return "Basis aanwezig, maar kwetsbaar";
    if (score < 5) return "Beheersing en standaardisatie";
    if (score < 6.5) return "Optimalisatie en integratie";
    return "Data-gedreven sturing";
  }

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
            <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  MVP versie 1
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  KWEEKERS Groeimodel
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium lg:hidden ${
                      activeView === item.id
                        ? "bg-slate-950 text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8">
            {activeView === "dashboard" && (
              <Dashboard
                averageScore={averageScore}
                onNewScan={() => setActiveView("nieuwe-scan")}
              />
            )}

            {activeView === "nieuwe-scan" && (
              <NewScan
                form={form}
                setForm={setForm}
                onStart={() => setActiveView("scan")}
              />
            )}

            {activeView === "scan" && (
              <ScanInput
                assessments={assessments}
                updateAssessment={updateAssessment}
                getLevel={getLevel}
                onResults={() => setActiveView("resultaten")}
              />
            )}

            {activeView === "resultaten" && (
              <Results
                assessments={assessments}
                averageScore={averageScore}
                priorityDomains={priorityDomains}
                getLevel={getLevel}
                getMaturityPhase={getMaturityPhase}
                onRoadmap={() => setActiveView("roadmap")}
              />
            )}

            {activeView === "roadmap" && (
              <Roadmap
                priorityDomains={priorityDomains}
                onReport={() => setActiveView("rapport")}
              />
            )}

            {activeView === "rapport" && (
              <Report
                form={form}
                assessments={assessments}
                averageScore={averageScore}
                priorityDomains={priorityDomains}
                getMaturityPhase={getMaturityPhase}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Dashboard({
  averageScore,
  onNewScan,
}: {
  averageScore: number;
  onNewScan: () => void;
}) {
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
        <StatCard label="Gemiddelde volwassenheid" value={averageScore.toFixed(1)} />
        <StatCard label="Afgeronde scans" value="1" />
        <StatCard label="Conceptscans" value="1" />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Recente scans</h3>
            <p className="mt-1 text-sm text-slate-600">
              Mockdata voor de eerste MVP-versie.
            </p>
          </div>
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
  onStart,
}: {
  form: ScanForm;
  setForm: (form: ScanForm) => void;
  onStart: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-semibold">Nieuwe scan</h3>
      <p className="mt-2 max-w-3xl text-slate-600">
        Leg kort de context vast. Dit helpt om het gesprek scherp te voeren en
        het rapport begrijpelijk te maken.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <TextField
          label="Organisatienaam"
          value={form.organisatienaam}
          onChange={(value) => setForm({ ...form, organisatienaam: value })}
        />
        <TextField
          label="Sector"
          value={form.sector}
          onChange={(value) => setForm({ ...form, sector: value })}
        />
        <TextField
          label="Aantal medewerkers"
          value={form.medewerkers}
          onChange={(value) => setForm({ ...form, medewerkers: value })}
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
          label="Aanleiding voor de scan"
          value={form.aanleiding}
          onChange={(value) => setForm({ ...form, aanleiding: value })}
        />
      </div>

      <div className="mt-5">
        <TextArea
          label="Korte context"
          value={form.context}
          onChange={(value) => setForm({ ...form, context: value })}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onStart}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Start scan
        </button>
      </div>
    </div>
  );
}

function ScanInput({
  assessments,
  updateAssessment,
  getLevel,
  onResults,
}: {
  assessments: Record<DomainKey, Assessment>;
  updateAssessment: (key: DomainKey, patch: Partial<Assessment>) => void;
  getLevel: (score: number) => { score: number; label: string; description: string };
  onResults: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold">Scan invullen</h3>
        <p className="mt-2 max-w-3xl text-slate-600">
          Vul per domein een score in. De toelichting is minstens zo belangrijk
          als het cijfer, omdat die de basis vormt voor prioriteiten en roadmap.
        </p>
      </div>

      <div className="grid gap-6">
        {domains.map((domain) => {
          const assessment = assessments[domain.key];
          const level = getLevel(assessment.score);

          return (
            <section
              key={domain.key}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <h4 className="text-xl font-semibold">{domain.title}</h4>
                  <p className="mt-2 max-w-3xl text-slate-600">
                    {domain.description}
                  </p>
                </div>
                <ScoreBadge score={assessment.score} label={level.label} />
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[260px_1fr]">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <label className="text-sm font-semibold">
                    Score 0 t/m 7
                  </label>
                  <select
                    value={assessment.score}
                    onChange={(event) =>
                      updateAssessment(domain.key, {
                        score: Number(event.target.value),
                      })
                    }
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
                  >
                    {scoreModel.map((item) => (
                      <option key={item.score} value={item.score}>
                        {item.score} - {item.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {level.description}
                  </p>
                </div>

                <div className="grid gap-4">
                  <TextArea
                    label="Observaties"
                    value={assessment.observaties}
                    onChange={(value) =>
                      updateAssessment(domain.key, { observaties: value })
                    }
                  />
                  <TextArea
                    label="Belangrijkste knelpunten"
                    value={assessment.knelpunten}
                    onChange={(value) =>
                      updateAssessment(domain.key, { knelpunten: value })
                    }
                  />
                  <TextArea
                    label="Gewenste volgende stap"
                    value={assessment.volgendeStap}
                    onChange={(value) =>
                      updateAssessment(domain.key, { volgendeStap: value })
                    }
                  />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onResults}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Bekijk resultaten
        </button>
      </div>
    </div>
  );
}

function Results({
  assessments,
  averageScore,
  priorityDomains,
  getLevel,
  getMaturityPhase,
  onRoadmap,
}: {
  assessments: Record<DomainKey, Assessment>;
  averageScore: number;
  priorityDomains: Array<Domain & { assessment: Assessment }>;
  getLevel: (score: number) => { score: number; label: string; description: string };
  getMaturityPhase: (score: number) => string;
  onRoadmap: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-slate-950 p-6 text-white lg:col-span-1">
          <p className="text-sm font-medium text-slate-300">Totaalscore</p>
          <div className="mt-4 text-6xl font-semibold">
            {averageScore.toFixed(1)}
          </div>
          <p className="mt-4 text-slate-300">
            {getMaturityPhase(averageScore)}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-xl font-semibold">Scores per domein</h3>
          <div className="mt-6 space-y-5">
            {domains.map((domain) => {
              const score = assessments[domain.key].score;
              const width = `${(score / 7) * 100}%`;

              return (
                <div key={domain.key}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{domain.title}</span>
                    <span className="font-semibold">
                      {score} - {getLevel(score).label}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-950"
                      style={{ width }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Belangrijkste knelpunten</h3>
          <div className="mt-5 space-y-4">
            {priorityDomains.map((item) => (
              <div key={item.key} className="rounded-2xl bg-slate-50 p-4">
                <div className="font-semibold">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.assessment.knelpunten}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Top-3 prioriteiten</h3>
          <div className="mt-5 space-y-4">
            {priorityDomains.map((item, index) => (
              <div key={item.key} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="font-semibold">{item.title}</div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.assessment.volgendeStap}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={onRoadmap}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Maak eerste roadmap
        </button>
      </div>
    </div>
  );
}

function Roadmap({
  priorityDomains,
  onReport,
}: {
  priorityDomains: Array<Domain & { assessment: Assessment }>;
  onReport: () => void;
}) {
  const roadmap = [
    {
      phase: "0-30 dagen",
      title: "Beeld aanscherpen en eigenaarschap bepalen",
      description:
        "Werk de belangrijkste knelpunten uit en bepaal per domein wie eigenaar is van verbetering.",
      domain: priorityDomains[0]?.title ?? "Algemeen",
      impact: "Hoog",
      effort: "Laag",
      owner: "Klantteam + proceseigenaar",
    },
    {
      phase: "30-60 dagen",
      title: "Standaard werkwijze ontwerpen",
      description:
        "Maak de gewenste werkwijze concreet en vertaal deze naar inrichting, procesafspraken en rapportagebehoefte.",
      domain: priorityDomains[1]?.title ?? "Algemeen",
      impact: "Hoog",
      effort: "Middel",
      owner: "Business consultant",
    },
    {
      phase: "60-90 dagen",
      title: "Verbeteringen doorvoeren en testen",
      description:
        "Voer de eerste verbeteringen door, test deze met gebruikers en leg afspraken vast.",
      domain: priorityDomains[2]?.title ?? "Algemeen",
      impact: "Middel",
      effort: "Middel",
      owner: "Projectleider + key-users",
    },
    {
      phase: "Daarna",
      title: "Borgen in klantteam en roadmap",
      description:
        "Neem vervolgacties op in de klantteam-aanpak en herhaal de groeiscan periodiek.",
      domain: "Alle domeinen",
      impact: "Hoog",
      effort: "Middel",
      owner: "Klantverantwoordelijke",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold">Eerste roadmap</h3>
        <p className="mt-2 max-w-3xl text-slate-600">
          De roadmap is bewust eenvoudig. Het doel is richting geven aan het
          vervolg, niet alles al volledig dichttimmeren.
        </p>
      </div>

      <div className="grid gap-5">
        {roadmap.map((item) => (
          <section
            key={item.phase}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {item.phase}
                </div>
                <h4 className="mt-2 text-xl font-semibold">{item.title}</h4>
                <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                  {item.description}
                </p>
              </div>

              <div className="grid gap-2 text-sm sm:grid-cols-2 lg:w-80">
                <MiniInfo label="Domein" value={item.domain} />
                <MiniInfo label="Impact" value={item.impact} />
                <MiniInfo label="Inspanning" value={item.effort} />
                <MiniInfo label="Eigenaar" value={item.owner} />
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onReport}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Naar rapport
        </button>
      </div>
    </div>
  );
}

function Report({
  form,
  assessments,
  averageScore,
  priorityDomains,
  getMaturityPhase,
}: {
  form: ScanForm;
  assessments: Record<DomainKey, Assessment>;
  averageScore: number;
  priorityDomains: Array<Domain & { assessment: Assessment }>;
  getMaturityPhase: (score: number) => string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Concept terugkoppeling
          </p>
          <h3 className="mt-3 text-3xl font-semibold">
            Nulmeting KWEEKERS Groeimodel
          </h3>
          <p className="mt-2 text-slate-600">{form.organisatienaam}</p>
        </div>
        <button
          onClick={() => alert("PDF-export volgt in een volgende versie.")}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Exporteer als PDF
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <article className="space-y-8">
          <ReportSection title="Managementsamenvatting">
            <p>
              De nulmeting laat zien dat {form.organisatienaam} gemiddeld een
              volwassenheidsscore van <strong>{averageScore.toFixed(1)}</strong>{" "}
              behaalt. Dit valt binnen de fase:{" "}
              <strong>{getMaturityPhase(averageScore)}</strong>.
            </p>
            <p>
              De scan is gebruikt als gesprekstool om de huidige situatie,
              duidelijke knelpunten en logische vervolgstappen bespreekbaar te
              maken.
            </p>
          </ReportSection>

          <ReportSection title="Aanleiding">
            <p>{form.aanleiding}</p>
            <p>{form.context}</p>
          </ReportSection>

          <ReportSection title="Scores per domein">
            <div className="space-y-4">
              {domains.map((domain) => (
                <div key={domain.key} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-semibold">{domain.title}</div>
                    <div className="font-semibold">
                      {assessments[domain.key].score} / 7
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {assessments[domain.key].observaties}
                  </p>
                </div>
              ))}
            </div>
          </ReportSection>

          <ReportSection title="Belangrijkste knelpunten">
            <ul className="space-y-3">
              {priorityDomains.map((item) => (
                <li key={item.key} className="rounded-2xl bg-slate-50 p-4">
                  <strong>{item.title}</strong>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.assessment.knelpunten}
                  </p>
                </li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection title="Top-3 prioriteiten">
            <ol className="space-y-3">
              {priorityDomains.map((item, index) => (
                <li key={item.key} className="rounded-2xl bg-slate-50 p-4">
                  <strong>
                    {index + 1}. {item.title}
                  </strong>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.assessment.volgendeStap}
                  </p>
                </li>
              ))}
            </ol>
          </ReportSection>

          <ReportSection title="Advies voor vervolg">
            <p>
              Advies is om de uitkomsten te gebruiken als basis voor een eerste
              roadmap. Start met de laagst scorende domeinen en vertaal deze
              naar concrete acties, eigenaarschap en planning.
            </p>
            <p>
              Na de eerste verbetercyclus kan de scan opnieuw worden uitgevoerd
              om voortgang zichtbaar te maken.
            </p>
          </ReportSection>
        </article>

        <aside className="rounded-3xl bg-slate-50 p-6">
          <h4 className="font-semibold">Scaninformatie</h4>
          <div className="mt-5 space-y-4 text-sm">
            <MiniInfo label="Organisatie" value={form.organisatienaam} />
            <MiniInfo label="Sector" value={form.sector} />
            <MiniInfo label="Medewerkers" value={form.medewerkers} />
            <MiniInfo label="Consultant" value={form.consultant} />
            <MiniInfo label="Datum" value={form.datum} />
            <MiniInfo label="Totaalscore" value={averageScore.toFixed(1)} />
          </div>
        </aside>
      </div>
    </div>
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

function ScoreBadge({ score, label }: { score: number; label: string }) {
  return (
    <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
      <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
        Score
      </div>
      <div className="mt-1 text-2xl font-semibold">
        {score} <span className="text-sm font-medium text-slate-300">/ 7</span>
      </div>
      <div className="text-sm text-slate-300">{label}</div>
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
        rows={3}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-950"
      />
    </label>
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

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h4 className="text-xl font-semibold">{title}</h4>
      <div className="mt-3 space-y-3 leading-7 text-slate-700">{children}</div>
    </section>
  );
}
