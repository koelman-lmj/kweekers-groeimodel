import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  Download,
  FileText,
  GitBranch,
  Layers3,
  Network,
  Route,
  SearchCheck,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

/**
 * Kweekers Groeimodel App - herbouwde opzet
 * ---------------------------------------------------------
 * Doel van deze versie:
 * - Niet starten vanuit een vragenlijst, maar vanuit een begeleide diagnose.
 * - Gelaagdheid: Startcheck → Klantprofiel → Scope → Groeigebieden → Capabilities → Vragen → Duiding → Roadmap → Export.
 * - Klantinput en consultantbeoordeling scheiden.
 * - Vragenbank zo opbouwen dat deze later uit Excel/GitHub JSON kan komen.
 *
 * Gebruik in v0:
 * - Plak dit bestand als single React component.
 * - De datasets onderaan kunnen later worden vervangen door import vanuit /data/*.json.
 */

const STEP_ORDER = [
  "startcheck",
  "profiel",
  "scope",
  "diagnose",
  "duiding",
  "roadmap",
  "export",
];

const STEPS = [
  {
    id: "startcheck",
    label: "Startcheck",
    title: "Is het groeimodel nu passend?",
    subtitle: "Eerst bepalen of er voldoende praktijkervaring is om volwassenheid betrouwbaar te meten.",
    icon: ShieldCheck,
  },
  {
    id: "profiel",
    label: "Klantprofiel",
    title: "Begrijp de context van de klant",
    subtitle: "Leg vast welk type organisatie je beoordeelt en welke complexiteit meespeelt.",
    icon: Building2,
  },
  {
    id: "scope",
    label: "Scope",
    title: "Kies de juiste diepgang",
    subtitle: "Niet elke klant heeft een volledige scan nodig. Kies gericht wat je onderzoekt.",
    icon: Route,
  },
  {
    id: "diagnose",
    label: "Diagnose",
    title: "Meet per groeigebied en capability",
    subtitle: "Vragen zijn gegroepeerd zodat bevindingen later logisch naar advies worden vertaald.",
    icon: SearchCheck,
  },
  {
    id: "duiding",
    label: "Duiding",
    title: "Van antwoord naar advies",
    subtitle: "Vertaal scores naar FIT, GAP, SOLL, risico en adviesrichting.",
    icon: ClipboardCheck,
  },
  {
    id: "roadmap",
    label: "Roadmap",
    title: "Maak verbetering uitvoerbaar",
    subtitle: "Koppel bevindingen aan een concrete 0-30-60-90 dagen aanpak.",
    icon: Workflow,
  },
  {
    id: "export",
    label: "Export",
    title: "Gebruik de output in rapportage en GitHub",
    subtitle: "Maak de resultaten geschikt voor rapport, backlog en configuratiebeheer.",
    icon: GitBranch,
  },
];

const COLORS = {
  ink: "#1f2937",
  muted: "#6b7280",
  soft: "#f8fafc",
  line: "#e5e7eb",
  brand: "#0f766e",
  brandSoft: "#ccfbf1",
  amber: "#f59e0b",
  red: "#dc2626",
  green: "#16a34a",
};

export default function KweekersGroeimodelApp() {
  const [activeStep, setActiveStep] = useState("startcheck");
  const [selectedAreaId, setSelectedAreaId] = useState("organisatie");
  const [startCheck, setStartCheck] = useState({
    afasLiveOneYear: "",
    keyProcessesOperational: "",
    enoughExperience: "",
    goal: "",
  });
  const [profile, setProfile] = useState({
    customerName: "",
    sector: "",
    size: "",
    administrations: "",
    modules: [],
    integrations: "",
    reporting: "",
    reason: "",
  });
  const [scope, setScope] = useState("volledige_scan");
  const [answers, setAnswers] = useState(seedAnswers());
  const [consultantNotes, setConsultantNotes] = useState({});

  const currentIndex = STEP_ORDER.indexOf(activeStep);
  const selectedArea = GROWTH_AREAS.find((area) => area.id === selectedAreaId) ?? GROWTH_AREAS[0];

  const startAdvice = useMemo(() => getStartAdvice(startCheck), [startCheck]);
  const scores = useMemo(() => calculateScores(answers), [answers]);
  const triggeredAdvice = useMemo(() => getTriggeredAdvice(scores, answers), [scores, answers]);
  const roadmap = useMemo(() => buildRoadmap(triggeredAdvice, startAdvice), [triggeredAdvice, startAdvice]);
  const exportPayload = useMemo(
    () => buildExportPayload({ startCheck, profile, scope, answers, consultantNotes, scores, triggeredAdvice, roadmap }),
    [startCheck, profile, scope, answers, consultantNotes, scores, triggeredAdvice, roadmap]
  );

  function nextStep() {
    const next = STEP_ORDER[Math.min(currentIndex + 1, STEP_ORDER.length - 1)];
    setActiveStep(next);
  }

  function previousStep() {
    const prev = STEP_ORDER[Math.max(currentIndex - 1, 0)];
    setActiveStep(prev);
  }

  function updateAnswer(questionId, value) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  function updateNote(areaId, value) {
    setConsultantNotes((prev) => ({
      ...prev,
      [areaId]: value,
    }));
  }

  function toggleModule(moduleId) {
    setProfile((prev) => {
      const exists = prev.modules.includes(moduleId);
      return {
        ...prev,
        modules: exists ? prev.modules.filter((id) => id !== moduleId) : [...prev.modules, moduleId],
      };
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <Header />

        <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
          <Sidebar
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            scores={scores}
            startAdvice={startAdvice}
          />

          <main className="space-y-6">
            <StepHero activeStep={activeStep} currentIndex={currentIndex} />

            {activeStep === "startcheck" && (
              <StartCheckStep
                data={startCheck}
                setData={setStartCheck}
                advice={startAdvice}
                onNext={nextStep}
              />
            )}

            {activeStep === "profiel" && (
              <ProfileStep
                profile={profile}
                setProfile={setProfile}
                toggleModule={toggleModule}
                onNext={nextStep}
              />
            )}

            {activeStep === "scope" && (
              <ScopeStep
                scope={scope}
                setScope={setScope}
                startAdvice={startAdvice}
                onNext={nextStep}
              />
            )}

            {activeStep === "diagnose" && (
              <DiagnosisStep
                areas={GROWTH_AREAS}
                selectedArea={selectedArea}
                setSelectedAreaId={setSelectedAreaId}
                answers={answers}
                updateAnswer={updateAnswer}
                scores={scores}
                notes={consultantNotes}
                updateNote={updateNote}
                scope={scope}
              />
            )}

            {activeStep === "duiding" && (
              <InterpretationStep
                scores={scores}
                answers={answers}
                advice={triggeredAdvice}
                notes={consultantNotes}
              />
            )}

            {activeStep === "roadmap" && <RoadmapStep roadmap={roadmap} scores={scores} />}

            {activeStep === "export" && <ExportStep exportPayload={exportPayload} />}

            <NavigationFooter
              currentIndex={currentIndex}
              previousStep={previousStep}
              nextStep={nextStep}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge className="rounded-full bg-teal-50 px-3 py-1 text-teal-800 hover:bg-teal-50">
              Kweekers Groeimodel
            </Badge>
            <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600">
              Diagnosemodel
            </Badge>
            <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600">
              Consultant-assistent
            </Badge>
          </div>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
            Van losse vragenlijst naar begeleide volwassenheidsdiagnose.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg">
            Deze app helpt om de huidige situatie, wat al passend werkt, wat ontbreekt en wat de gewenste
            volgende stap is gestructureerd te bepalen. Niet alleen voor AFAS, maar ook voor organisatie,
            processen, integraties, data, rapportage en veranderkracht.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-950 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Layers3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-white/60">Kernstructuur</p>
              <p className="font-medium">Check → Begrijp → Meet → Duid → Adviseer</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm text-white/75">
            {[
              "Startcheck als poortwachter",
              "Klantprofiel bepaalt context",
              "Capabilities vormen de ontbrekende tussenlaag",
              "Adviesregels vertalen score naar actie",
              "Roadmap maakt verbetering uitvoerbaar",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ activeStep, setActiveStep, scores, startAdvice }) {
  const average = Math.round(scores.overall * 10) / 10;

  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <p className="px-2 text-xs font-medium uppercase tracking-wide text-slate-500">App-flow</p>
          <div className="mt-3 space-y-1">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const active = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full rounded-2xl px-3 py-3 text-left transition ${
                    active ? "bg-slate-950 text-white" : "hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2 ${active ? "bg-white/10" : "bg-slate-100"}`}>
                      <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-600"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{index + 1}. {step.label}</p>
                      <p className={`truncate text-xs ${active ? "text-white/55" : "text-slate-500"}`}>{step.title}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${active ? "text-white/60" : "text-slate-400"}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Gemiddelde volwassenheid</p>
              <p className="mt-1 text-3xl font-semibold">{Number.isFinite(average) ? average : "0.0"}</p>
            </div>
            <div className="rounded-2xl bg-teal-50 p-3 text-teal-700">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
          <Progress value={(average / 7) * 100} className="mt-4 h-2" />
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Score is indicatief. De consultant blijft leidend in de duiding en het advies.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm font-medium text-slate-950">Startadvies</p>
          <div className={`mt-3 rounded-2xl p-3 text-sm ${startAdvice.style}`}>{startAdvice.label}</div>
        </CardContent>
      </Card>
    </aside>
  );
}

function StepHero({ activeStep, currentIndex }) {
  const step = STEPS.find((item) => item.id === activeStep) ?? STEPS[0];
  const Icon = step.icon;

  return (
    <motion.div
      key={activeStep}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-slate-950 p-3 text-white">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-teal-700">Stap {currentIndex + 1} van {STEPS.length}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{step.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{step.subtitle}</p>
          </div>
        </div>
        <div className="min-w-[180px]">
          <Progress value={((currentIndex + 1) / STEPS.length) * 100} className="h-2" />
          <p className="mt-2 text-right text-xs text-slate-500">{Math.round(((currentIndex + 1) / STEPS.length) * 100)}% compleet</p>
        </div>
      </div>
    </motion.div>
  );
}

function StartCheckStep({ data, setData, advice, onNext }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionTitle
            icon={ShieldCheck}
            title="Vast uitgangspunt"
            description="Deze check hoort boven de tool te staan. Het is geen gewone vraag, maar de toegangspoort tot het groeimodel."
          />

          <div className="mt-6 space-y-5">
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
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionTitle
            icon={Sparkles}
            title="Uitkomst"
            description="De app bepaalt hiermee of een volledige volwassenheidsmeting passend is."
          />
          <div className={`mt-5 rounded-3xl p-5 ${advice.style}`}>
            <p className="text-sm font-semibold">{advice.label}</p>
            <p className="mt-2 text-sm leading-6">{advice.description}</p>
          </div>
          <Button onClick={onNext} className="mt-5 w-full rounded-2xl bg-slate-950 py-6 text-white hover:bg-slate-800">
            Verder naar klantprofiel
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileStep({ profile, setProfile, toggleModule, onNext }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionTitle
            icon={Building2}
            title="Klantprofiel"
            description="Deze laag voorkomt dat iedere klant dezelfde vragen krijgt. Context bepaalt welke verdieping nodig is."
          />

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Klantnaam">
              <Input
                value={profile.customerName}
                onChange={(e) => setProfile({ ...profile, customerName: e.target.value })}
                placeholder="Bijv. Participe, Environ, Codarts"
                className="rounded-2xl"
              />
            </Field>
            <SelectLike
              label="Sector"
              value={profile.sector}
              onChange={(value) => setProfile({ ...profile, sector: value })}
              options={SECTOR_OPTIONS}
            />
            <SelectLike
              label="Organisatieomvang"
              value={profile.size}
              onChange={(value) => setProfile({ ...profile, size: value })}
              options={SIZE_OPTIONS}
            />
            <SelectLike
              label="Aantal administraties"
              value={profile.administrations}
              onChange={(value) => setProfile({ ...profile, administrations: value })}
              options={ADMIN_OPTIONS}
            />
            <SelectLike
              label="Integratiecomplexiteit"
              value={profile.integrations}
              onChange={(value) => setProfile({ ...profile, integrations: value })}
              options={COMPLEXITY_OPTIONS}
            />
            <SelectLike
              label="Rapportagevolwassenheid"
              value={profile.reporting}
              onChange={(value) => setProfile({ ...profile, reporting: value })}
              options={REPORTING_OPTIONS}
            />
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-950">AFAS-modules in scope</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {MODULE_OPTIONS.map((module) => {
                const active = profile.modules.includes(module.id);
                return (
                  <button
                    key={module.id}
                    onClick={() => toggleModule(module.id)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {module.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <SelectLike
              label="Primaire aanleiding"
              value={profile.reason}
              onChange={(value) => setProfile({ ...profile, reason: value })}
              options={REASON_OPTIONS}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionTitle
            icon={Settings2}
            title="Routinglogica"
            description="Later kan dit profiel automatisch bepalen welke vragen zichtbaar worden."
          />
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <RoutingPreview label="Sector" value={profile.sector} fallback="Nog niet gekozen" />
            <RoutingPreview label="Modules" value={profile.modules.length ? `${profile.modules.length} geselecteerd` : "Nog niet gekozen"} />
            <RoutingPreview label="Integraties" value={profile.integrations || "Nog niet gekozen"} />
            <RoutingPreview label="Rapportage" value={profile.reporting || "Nog niet gekozen"} />
          </div>
          <Button onClick={onNext} className="mt-5 w-full rounded-2xl bg-slate-950 py-6 text-white hover:bg-slate-800">
            Verder naar scope
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ScopeStep({ scope, setScope, startAdvice, onNext }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionTitle
            icon={Route}
            title="Scope kiezen"
            description="De tool moet licht kunnen starten en alleen verdiepen waar dat nodig is. Zo voelt het minder zwaar en meer adviserend."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {SCOPE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = scope === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setScope(option.id)}
                  className={`rounded-3xl border p-5 text-left transition ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className={`inline-flex rounded-2xl p-3 ${active ? "bg-white/10" : "bg-slate-100"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 font-semibold">{option.label}</p>
                  <p className={`mt-2 text-sm leading-6 ${active ? "text-white/65" : "text-slate-600"}`}>{option.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionTitle
            icon={Activity}
            title="Advies bij scope"
            description="Scope hangt samen met de startcheck. Niet elke situatie vraagt om dezelfde diepgang."
          />
          <div className={`mt-5 rounded-3xl p-5 ${startAdvice.style}`}>
            <p className="text-sm font-semibold">{startAdvice.label}</p>
            <p className="mt-2 text-sm leading-6">{startAdvice.scopeHint}</p>
          </div>
          <Button onClick={onNext} className="mt-5 w-full rounded-2xl bg-slate-950 py-6 text-white hover:bg-slate-800">
            Start diagnose
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DiagnosisStep({ areas, selectedArea, setSelectedAreaId, answers, updateAnswer, scores, notes, updateNote, scope }) {
  const visibleAreas = useMemo(() => filterAreasByScope(areas, scope), [areas, scope]);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm lg:sticky lg:top-6 lg:self-start">
        <CardContent className="p-4">
          <p className="px-2 text-xs font-medium uppercase tracking-wide text-slate-500">Groeigebieden</p>
          <div className="mt-3 space-y-2">
            {visibleAreas.map((area) => {
              const Icon = area.icon;
              const active = selectedArea.id === area.id;
              const score = scores.byArea[area.id]?.score ?? 0;
              return (
                <button
                  key={area.id}
                  onClick={() => setSelectedAreaId(area.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl p-2 ${active ? "bg-white/10" : "bg-slate-100"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{area.label}</p>
                        <span className={`text-xs ${active ? "text-white/65" : "text-slate-500"}`}>{score.toFixed(1)}</span>
                      </div>
                      <p className={`mt-1 line-clamp-2 text-xs leading-5 ${active ? "text-white/55" : "text-slate-500"}`}>{area.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <SectionTitle
                icon={selectedArea.icon}
                title={selectedArea.label}
                description={selectedArea.description}
              />
              <div className="rounded-3xl bg-slate-50 p-4 text-right">
                <p className="text-xs text-slate-500">Gebiedsscore</p>
                <p className="mt-1 text-3xl font-semibold">{(scores.byArea[selectedArea.id]?.score ?? 0).toFixed(1)}</p>
                <p className="text-xs text-slate-500">van 7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedArea.capabilities.map((capability) => (
          <CapabilityCard
            key={capability.id}
            area={selectedArea}
            capability={capability}
            answers={answers}
            updateAnswer={updateAnswer}
            scores={scores}
          />
        ))}

        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <SectionTitle
              icon={FileText}
              title="Consultantbeoordeling"
              description="Scheid klantinput van professionele duiding. Hier leg je bewijs, nuance en interpretatie vast."
            />
            <Textarea
              value={notes[selectedArea.id] ?? ""}
              onChange={(e) => updateNote(selectedArea.id, e.target.value)}
              placeholder="Bijv. eigenaarschap is informeel belegd, waardoor verbetering afhankelijk is van personen in plaats van structuur."
              className="mt-5 min-h-[140px] rounded-2xl"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CapabilityCard({ area, capability, answers, updateAnswer, scores }) {
  const capabilityScore = scores.byCapability[capability.id]?.score ?? 0;

  return (
    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-teal-700">Capability</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-950">{capability.label}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{capability.description}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
            <p className="text-xs text-slate-500">Score</p>
            <p className="text-2xl font-semibold">{capabilityScore.toFixed(1)}</p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {capability.questions.map((question) => (
            <QuestionRenderer
              key={question.id}
              question={question}
              value={answers[question.id] ?? ""}
              onChange={(value) => updateAnswer(question.id, value)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionRenderer({ question, value, onChange }) {
  if (question.type === "scale") {
    return (
      <div className="rounded-3xl border border-slate-200 p-5">
        <QuestionHeader question={question} />
        <div className="mt-4 grid grid-cols-4 gap-2 md:grid-cols-8">
          {DIP_SCALE.map((score) => {
            const active = Number(value) === score.value;
            return (
              <button
                key={score.value}
                onClick={() => onChange(score.value)}
                className={`rounded-2xl border p-3 text-center transition ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <p className="text-lg font-semibold">{score.value}</p>
                <p className={`mt-1 text-[11px] leading-4 ${active ? "text-white/65" : "text-slate-500"}`}>{score.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === "open") {
    return (
      <div className="rounded-3xl border border-slate-200 p-5">
        <QuestionHeader question={question} />
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Korte toelichting, signaal of voorbeeld..."
          className="mt-4 min-h-[100px] rounded-2xl"
        />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 p-5">
      <QuestionHeader question={question} />
      <div className="mt-4 flex flex-wrap gap-2">
        {(question.options ?? YES_PARTLY_NO_UNKNOWN).map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                active
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuestionHeader({ question }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-slate-600">
          {question.kind}
        </Badge>
        {question.isCore && (
          <Badge className="rounded-full bg-teal-50 text-teal-800 hover:bg-teal-50">kernvraag</Badge>
        )}
      </div>
      <p className="mt-3 font-medium text-slate-950">{question.label}</p>
      {question.help && <p className="mt-2 text-sm leading-6 text-slate-500">{question.help}</p>}
    </div>
  );
}

function InterpretationStep({ scores, advice, notes }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionTitle
            icon={ClipboardCheck}
            title="Duiding per groeigebied"
            description="De app toont niet alleen een score, maar vertaalt deze naar FIT, GAP, SOLL, risico en adviesrichting."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {GROWTH_AREAS.map((area) => {
              const score = scores.byArea[area.id]?.score ?? 0;
              const interpretation = getScoreInterpretation(score);
              const Icon = area.icon;
              return (
                <div key={area.id} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-2xl bg-slate-100 p-3">
                      <Icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold">{score.toFixed(1)}</p>
                      <p className="text-xs text-slate-500">van 7</p>
                    </div>
                  </div>
                  <p className="mt-4 font-semibold text-slate-950">{area.label}</p>
                  <Badge className={`mt-3 rounded-full ${interpretation.badgeClass}`}>{interpretation.label}</Badge>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{interpretation.description}</p>
                  {notes[area.id] && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                      {notes[area.id]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionTitle
            icon={Sparkles}
            title="Geactiveerde adviesregels"
            description="Hier zit de waarde van het model: antwoorden en scores leiden tot concrete adviesrichtingen."
          />
          <div className="mt-6 space-y-4">
            {advice.length === 0 ? (
              <EmptyState text="Nog geen adviesregels geactiveerd. Vul meer diagnosevragen in voor betere duiding." />
            ) : (
              advice.map((item) => <AdviceCard key={item.id} item={item} />)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdviceCard({ item }) {
  const area = GROWTH_AREAS.find((growthArea) => growthArea.id === item.areaId);
  const Icon = area?.icon ?? Sparkles;

  return (
    <div className="rounded-3xl border border-slate-200 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-teal-50 p-3 text-teal-700">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">{area?.label}</Badge>
              <Badge className="rounded-full bg-amber-50 text-amber-800 hover:bg-amber-50">prioriteit {item.priority}</Badge>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <MiniBlock title="FIT" text={item.fit} />
        <MiniBlock title="GAP" text={item.gap} />
        <MiniBlock title="SOLL" text={item.soll} />
      </div>
    </div>
  );
}

function RoadmapStep({ roadmap, scores }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionTitle
            icon={Workflow}
            title="0-30-60-90 dagen roadmap"
            description="De roadmap koppelt de diagnose aan uitvoerbare stappen. Dit kan later direct naar rapportage, klantteam of backlog."
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {roadmap.map((phase) => (
              <div key={phase.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <Badge className="rounded-full bg-slate-950 text-white hover:bg-slate-950">{phase.period}</Badge>
                  <span className="text-xs text-slate-500">{phase.items.length} acties</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{phase.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{phase.description}</p>
                <div className="mt-5 space-y-3">
                  {phase.items.length === 0 ? (
                    <p className="text-sm text-slate-400">Geen acties geactiveerd.</p>
                  ) : (
                    phase.items.map((item) => (
                      <div key={item} className="rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                        {item}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionTitle
            icon={BarChart3}
            title="Scorekaart"
            description="Compact overzicht voor managementsamenvatting of klantpresentatie."
          />
          <div className="mt-6 space-y-4">
            {GROWTH_AREAS.map((area) => {
              const score = scores.byArea[area.id]?.score ?? 0;
              return (
                <div key={area.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{area.label}</span>
                    <span className="text-slate-500">{score.toFixed(1)} / 7</span>
                  </div>
                  <Progress value={(score / 7) * 100} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExportStep({ exportPayload }) {
  const json = JSON.stringify(exportPayload, null, 2);

  async function copyJson() {
    await navigator.clipboard.writeText(json);
  }

  function downloadJson() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kweekers-groeimodel-diagnose.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionTitle
            icon={GitBranch}
            title="Exportstructuur voor GitHub"
            description="De app is data-driven opgezet. Vragen, capabilities en adviesregels kunnen later vanuit Excel naar JSON worden geëxporteerd."
          />

          <Tabs defaultValue="json" className="mt-6">
            <TabsList className="rounded-2xl bg-slate-100 p-1">
              <TabsTrigger value="json" className="rounded-xl">JSON</TabsTrigger>
              <TabsTrigger value="repo" className="rounded-xl">Repo-structuur</TabsTrigger>
              <TabsTrigger value="rapport" className="rounded-xl">Rapport-output</TabsTrigger>
            </TabsList>
            <TabsContent value="json" className="mt-4">
              <pre className="max-h-[520px] overflow-auto rounded-3xl bg-slate-950 p-5 text-xs leading-5 text-slate-100">
                {json}
              </pre>
            </TabsContent>
            <TabsContent value="repo" className="mt-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 font-mono text-sm leading-7 text-slate-700">
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
              </div>
            </TabsContent>
            <TabsContent value="rapport" className="mt-4">
              <ReportPreview payload={exportPayload} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm lg:sticky lg:top-6 lg:self-start">
        <CardContent className="p-6">
          <SectionTitle
            icon={Download}
            title="Acties"
            description="Gebruik deze export als basis voor GitHub, rapportage of verdere app-configuratie."
          />
          <div className="mt-5 space-y-3">
            <Button onClick={copyJson} className="w-full rounded-2xl bg-slate-950 py-6 text-white hover:bg-slate-800">
              Kopieer JSON
            </Button>
            <Button onClick={downloadJson} variant="outline" className="w-full rounded-2xl border-slate-200 bg-white py-6">
              Download JSON
            </Button>
          </div>

          <div className="mt-6 rounded-3xl bg-teal-50 p-5 text-sm leading-6 text-teal-900">
            <p className="font-semibold">Aanbevolen werkwijze</p>
            <p className="mt-2">
              Beheer de vragenbank in Excel, exporteer naar JSON en laat de app alleen de data lezen. Zo blijft inhoud beheerbaar zonder dat de app-code telkens aangepast hoeft te worden.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportPreview({ payload }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <h3 className="text-xl font-semibold text-slate-950">Concept managementsamenvatting</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Voor {payload.profile.customerName || "de klant"} is een groeimodeldiagnose uitgevoerd. De gemiddelde volwassenheid is
        indicatief vastgesteld op <strong>{payload.scores.overall.toFixed(1)} van 7</strong>. De belangrijkste aandachtspunten
        liggen bij de gebieden waar eigenaarschap, procesvastheid, datakwaliteit, integratiebeheer of rapportagesturing nog onvoldoende zijn geborgd.
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Het advies is om de bevindingen te vertalen naar een gefaseerde roadmap. Daarbij ligt de nadruk eerst op stabiliseren en
        duidelijkheid creëren, daarna op inrichting en verbetering, en vervolgens op borgen via beheer, rapportage en klantteamstructuur.
      </p>
      <div className="mt-5 space-y-3">
        {payload.triggeredAdvice.slice(0, 4).map((item) => (
          <div key={item.id} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <strong>{item.title}</strong><br />{item.description}
          </div>
        ))}
      </div>
    </div>
  );
}

function NavigationFooter({ currentIndex, previousStep, nextStep }) {
  return (
    <div className="flex flex-col-reverse gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <Button
        onClick={previousStep}
        variant="outline"
        disabled={currentIndex === 0}
        className="rounded-2xl border-slate-200 bg-white px-6 py-5"
      >
        Vorige
      </Button>
      <div className="text-center text-sm text-slate-500">
        Stap {currentIndex + 1} van {STEPS.length}
      </div>
      <Button
        onClick={nextStep}
        disabled={currentIndex === STEPS.length - 1}
        className="rounded-2xl bg-slate-950 px-6 py-5 text-white hover:bg-slate-800"
      >
        Volgende
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function ChoiceQuestion({ label, value, onChange, options }) {
  return (
    <div className="rounded-3xl border border-slate-200 p-5">
      <p className="font-medium text-slate-950">{label}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                active
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-950">{label}</p>
      {children}
    </div>
  );
}

function SelectLike({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                active
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

function RoutingPreview({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <span>{label}</span>
      <span className="max-w-[170px] truncate font-medium text-slate-950">{value}</span>
    </div>
  );
}

function MiniBlock({ title, text }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function seedAnswers() {
  const seeded = {};
  GROWTH_AREAS.forEach((area) => {
    area.capabilities.forEach((capability) => {
      capability.questions.forEach((question) => {
        if (question.type === "scale") seeded[question.id] = 0;
        else seeded[question.id] = "";
      });
    });
  });
  return seeded;
}

function calculateScores(answers) {
  const byCapability = {};
  const byArea = {};

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

    byArea[area.id] = {
      score: areaCount ? areaTotal / areaCount : 0,
      count: areaCount,
    };
  });

  const areaScores = Object.values(byArea).map((item) => item.score);
  const overall = areaScores.length ? areaScores.reduce((sum, score) => sum + score, 0) / areaScores.length : 0;

  return { byCapability, byArea, overall };
}

function getStartAdvice(data) {
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
      style: "bg-red-50 text-red-900",
    };
  }

  if (partly) {
    return {
      status: "quickscan",
      label: "Beperkte scan of quickscan passend",
      description:
        "Er is deels voldoende basis aanwezig, maar de betrouwbaarheid van een volledige meting vraagt aandacht. Beperk de scope en leg aannames goed vast.",
      scopeHint:
        "Start met een quickscan of gerichte scan op de gebieden waar de klant het meeste knelpunt ervaart.",
      style: "bg-amber-50 text-amber-900",
    };
  }

  if (data.afasLiveOneYear === "ja" && data.keyProcessesOperational === "ja" && data.enoughExperience === "ja") {
    return {
      status: "groeimodel",
      label: "Volledig groeimodel passend",
      description:
        "De klant heeft voldoende praktijkervaring om IST, FIT, GAP en SOLL betrouwbaar vast te stellen. De volledige diagnose kan worden ingezet.",
      scopeHint:
        "Een volledige scan is passend. Afhankelijk van de aanleiding kan daarnaast extra verdieping worden gekozen.",
      style: "bg-teal-50 text-teal-900",
    };
  }

  return {
    status: "onbekend",
    label: "Nog onvoldoende bepaald",
    description:
      "Vul de startcheck aan om te bepalen of een volledige scan, quickscan of stabilisatieadvies passend is.",
    scopeHint:
      "Kies voorlopig voor een beperkte scope totdat duidelijk is of de basis voldoende stabiel is.",
    style: "bg-slate-100 text-slate-700",
  };
}

function getScoreInterpretation(score) {
  if (score < 1.5) {
    return {
      label: "Niet of nauwelijks aanwezig",
      description: "De basis ontbreekt grotendeels. Begin met duidelijkheid, eigenaarschap en minimale procesafspraken.",
      badgeClass: "bg-red-50 text-red-800 hover:bg-red-50",
    };
  }
  if (score < 3) {
    return {
      label: "Ad hoc en persoonsafhankelijk",
      description: "Er wordt gewerkt, maar vooral op ervaring, gewoonte en losse afspraken. Dit maakt groei kwetsbaar.",
      badgeClass: "bg-amber-50 text-amber-800 hover:bg-amber-50",
    };
  }
  if (score < 4.5) {
    return {
      label: "Basis aanwezig",
      description: "De basis is herkenbaar, maar borging, sturing en uniforme toepassing vragen verbetering.",
      badgeClass: "bg-blue-50 text-blue-800 hover:bg-blue-50",
    };
  }
  if (score < 6) {
    return {
      label: "Beheerst en gestuurd",
      description: "De organisatie werkt gestructureerd en kan verbeteren op basis van data, eigenaarschap en ritme.",
      badgeClass: "bg-teal-50 text-teal-800 hover:bg-teal-50",
    };
  }
  return {
    label: "Optimaliserend",
    description: "De organisatie heeft een sterke basis en kan gericht doorontwikkelen naar voorspelbaar verbeteren.",
    badgeClass: "bg-green-50 text-green-800 hover:bg-green-50",
  };
}

function getTriggeredAdvice(scores, answers) {
  const triggered = [];

  ADVICE_RULES.forEach((rule) => {
    const areaScore = scores.byArea[rule.areaId]?.score ?? 0;
    const capabilityScore = scores.byCapability[rule.capabilityId]?.score ?? 0;
    const scoreToUse = rule.level === "area" ? areaScore : capabilityScore;
    const scoreCondition = scoreToUse <= rule.maxScore;
    const answerCondition = !rule.answerCondition || answers[rule.answerCondition.questionId] === rule.answerCondition.value;

    if (scoreCondition && answerCondition) {
      triggered.push(rule);
    }
  });

  return triggered.sort((a, b) => a.priority - b.priority);
}

function buildRoadmap(triggeredAdvice, startAdvice) {
  const phases = [
    {
      id: "0-30",
      period: "0-30 dagen",
      title: "Stabiliseren en scherpstellen",
      description: "Maak de diagnose concreet, beleg eigenaarschap en verwijder directe ruis.",
      items: [],
    },
    {
      id: "30-60",
      period: "30-60 dagen",
      title: "Inrichten en verbeteren",
      description: "Werk de belangrijkste verbeteringen uit in processen, inrichting, data en afspraken.",
      items: [],
    },
    {
      id: "60-90",
      period: "60-90 dagen",
      title: "Borgen en meten",
      description: "Zorg dat verbetering onderdeel wordt van overleg, rapportage en beheer.",
      items: [],
    },
    {
      id: "90+",
      period: "90+ dagen",
      title: "Doorontwikkelen via klantteam",
      description: "Zet een vast verbeterritme neer met backlog, prioritering en periodieke besluitvorming.",
      items: [],
    },
  ];

  if (startAdvice.status === "stabiliseren") {
    phases[0].items.push("Voer eerst een stabilisatiescan uit op livegang, basisprocessen en openstaande implementatiepunten.");
  }

  triggeredAdvice.forEach((item) => {
    phases[0].items.push(item.roadmap[0]);
    phases[1].items.push(item.roadmap[1]);
    phases[2].items.push(item.roadmap[2]);
    phases[3].items.push(item.roadmap[3]);
  });

  return phases.map((phase) => ({
    ...phase,
    items: [...new Set(phase.items.filter(Boolean))],
  }));
}

function buildExportPayload({ startCheck, profile, scope, answers, consultantNotes, scores, triggeredAdvice, roadmap }) {
  return {
    meta: {
      model: "Kweekers Groeimodel",
      version: "0.2-concept",
      generatedAt: new Date().toISOString(),
      structure: "startcheck-profiel-scope-diagnose-duiding-roadmap-export",
    },
    startCheck,
    profile,
    scope,
    answers,
    consultantNotes,
    scores,
    triggeredAdvice,
    roadmap,
    dataModel: {
      hierarchy: [
        "groeigebied",
        "capability",
        "vraag",
        "antwoordtype",
        "score-impact",
        "signaal",
        "adviesregel",
        "roadmapactie",
        "rapportagetekst",
      ],
    },
  };
}

function filterAreasByScope(areas, scope) {
  const map = {
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

const YES_PARTLY_NO = [
  { value: "ja", label: "Ja" },
  { value: "deels", label: "Deels" },
  { value: "nee", label: "Nee" },
];

const YES_PARTLY_NO_UNKNOWN = [
  ...YES_PARTLY_NO,
  { value: "onbekend", label: "Onbekend" },
];

const GOAL_OPTIONS = [
  { value: "meten", label: "Volwassenheid meten" },
  { value: "verbeteren", label: "Verbeteren" },
  { value: "herinrichten", label: "Herinrichten" },
  { value: "rapportage", label: "Meer grip op rapportage" },
  { value: "governance", label: "Governance versterken" },
];

const SECTOR_OPTIONS = [
  { value: "zorg", label: "Zorg" },
  { value: "onderwijs", label: "Onderwijs" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "commercieel", label: "Commercieel" },
  { value: "overig", label: "Overig" },
];

const SIZE_OPTIONS = [
  { value: "klein", label: "Klein" },
  { value: "middelgroot", label: "Middelgroot" },
  { value: "groot", label: "Groot" },
  { value: "complex", label: "Groot/complex" },
];

const ADMIN_OPTIONS = [
  { value: "1", label: "1" },
  { value: "2-5", label: "2-5" },
  { value: "6-10", label: "6-10" },
  { value: "10+", label: "10+" },
];

const COMPLEXITY_OPTIONS = [
  { value: "laag", label: "Laag" },
  { value: "middel", label: "Middel" },
  { value: "hoog", label: "Hoog" },
];

const REPORTING_OPTIONS = [
  { value: "basis", label: "Basis" },
  { value: "powerbi", label: "Power BI / dashboards" },
  { value: "kpi", label: "KPI-sturing" },
  { value: "onduidelijk", label: "Onvoldoende duidelijk" },
];

const MODULE_OPTIONS = [
  { id: "finance", label: "Finance" },
  { id: "hrm", label: "HRM / Payroll" },
  { id: "projecten", label: "Projecten" },
  { id: "crm", label: "CRM" },
  { id: "order", label: "Order / Logistiek" },
  { id: "insite", label: "InSite" },
  { id: "pocket", label: "Pocket" },
  { id: "rapportage", label: "Rapportage" },
];

const REASON_OPTIONS = [
  { value: "grip", label: "Meer grip" },
  { value: "groei", label: "Groei / schaalbaarheid" },
  { value: "optimalisatie", label: "Optimalisatie" },
  { value: "vervanging", label: "Vervanging systemen" },
  { value: "governance", label: "Governance" },
  { value: "rapportage", label: "Rapportage / KPI's" },
];

const SCOPE_OPTIONS = [
  {
    id: "volledige_scan",
    label: "Volledige volwassenheidsscan",
    description: "Brede diagnose over organisatie, processen, AFAS, integraties, data, beheer en adoptie.",
    icon: Layers3,
  },
  {
    id: "quickscan",
    label: "Quickscan",
    description: "Lichte eerste diagnose om snel richting te bepalen en vervolgstappen te kiezen.",
    icon: SearchCheck,
  },
  {
    id: "afas_optimalisatie",
    label: "AFAS-optimalisatie",
    description: "Gericht op inrichting, gebruik, workflows, autorisaties en standaardisatie.",
    icon: Settings2,
  },
  {
    id: "finance_scan",
    label: "Finance-scan",
    description: "Focus op financiële processen, datakwaliteit, facturatie, rapportage en afsluiting.",
    icon: BarChart3,
  },
  {
    id: "data_rapportage",
    label: "Data & rapportage",
    description: "Focus op KPI-definities, datakwaliteit, dashboards en besluitvorming.",
    icon: Database,
  },
  {
    id: "integraties",
    label: "Integraties & keten",
    description: "Focus op koppelingen, ketenprocessen, foutafhandeling en eigenaarschap.",
    icon: Network,
  },
  {
    id: "governance",
    label: "Governance & beheer",
    description: "Focus op rollen, eigenaarschap, verbeterbacklog, releaseproces en klantteam.",
    icon: Users,
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

const GROWTH_AREAS = [
  {
    id: "organisatie",
    label: "Organisatie & eigenaarschap",
    description: "Bepaalt of rollen, verantwoordelijkheden en besluitvorming duidelijk zijn belegd.",
    icon: Users,
    capabilities: [
      {
        id: "organisatie_proceseigenaarschap",
        label: "Proceseigenaarschap",
        description: "De mate waarin duidelijk is wie eigenaar is van processen, inrichting en verbetering.",
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
        description: "De manier waarop verbeteringen worden gekozen, besloten en opgevolgd.",
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
    description: "Laat zien of de organisatie werkt vanuit duidelijke processen of vanuit losse afspraken en uitzonderingen.",
    icon: Workflow,
    capabilities: [
      {
        id: "processen_standaardisatie",
        label: "Standaardisatie van werkwijze",
        description: "De mate waarin processen eenduidig, herhaalbaar en uitlegbaar zijn.",
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
        description: "De mate waarin huidige situatie, passende inrichting, ontbrekende zaken en gewenste situatie scherp zijn.",
        questions: [
          {
            id: "q_proc_004",
            type: "choice",
            kind: "Klantinput",
            isCore: true,
            label: "Is duidelijk welke onderdelen goed werken en welke onderdelen verbetering vragen?",
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
    description: "Beoordeelt of AFAS logisch is ingericht, goed wordt gebruikt en de standaard waar mogelijk ondersteunt.",
    icon: Settings2,
    capabilities: [
      {
        id: "afas_standaardgebruik",
        label: "Gebruik van AFAS-standaard",
        description: "De mate waarin standaardfunctionaliteit de makkelijkste route is voor de gebruiker.",
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
        description: "De mate waarin taken, goedkeuringen en rechten logisch zijn ingericht en worden gebruikt.",
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
    description: "Beoordeelt of koppelingen betrouwbaar, beheersbaar en onderdeel van het proces zijn.",
    icon: Network,
    capabilities: [
      {
        id: "integraties_betrouwbaarheid",
        label: "Betrouwbaarheid van koppelingen",
        description: "De mate waarin integraties voorspelbaar werken en fouten tijdig zichtbaar zijn.",
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
        description: "De mate waarin duidelijk is wie eigenaar is van proces, data en foutafhandeling over systemen heen.",
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
    description: "Laat zien of data betrouwbaar is, definities duidelijk zijn en rapportages worden gebruikt voor sturing.",
    icon: Database,
    capabilities: [
      {
        id: "data_kpi_definities",
        label: "KPI-definities",
        description: "De mate waarin cijfers eenduidig zijn gedefinieerd en geaccepteerd.",
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
        description: "De mate waarin data volledig, actueel, betrouwbaar en beheerd is.",
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
    description: "Beoordeelt of verbeteren, testen, releases en beheer structureel zijn georganiseerd.",
    icon: GitBranch,
    capabilities: [
      {
        id: "beheer_backlog",
        label: "Verbeterbacklog",
        description: "De mate waarin wensen, incidenten en verbeteringen centraal worden beheerd en geprioriteerd.",
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
        description: "De mate waarin wijzigingen beheerst worden getest, vrijgegeven en gecommuniceerd.",
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
    description: "Laat zien of mensen de afgesproken werkwijze echt gebruiken en of de organisatie kan blijven verbeteren.",
    icon: Activity,
    capabilities: [
      {
        id: "adoptie_gebruik",
        label: "Gebruikersadoptie",
        description: "De mate waarin gebruikers begrijpen waarom en hoe zij de ingerichte processen gebruiken.",
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
        description: "De mate waarin verbeteringen worden uitgelegd, begrepen en vastgehouden.",
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

const ADVICE_RULES = [
  {
    id: "adv_org_001",
    areaId: "organisatie",
    capabilityId: "organisatie_proceseigenaarschap",
    level: "capability",
    maxScore: 3,
    priority: 1,
    title: "Beleg proceseigenaarschap expliciet",
    description:
      "Eigenaarschap is onvoldoende geborgd. Hierdoor blijft verbetering afhankelijk van personen in plaats van structuur.",
    fit: "Er is vaak wel praktische kennis aanwezig bij medewerkers.",
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
    level: "capability",
    maxScore: 3,
    priority: 2,
    title: "Maak de standaard werkwijze de makkelijkste route",
    description:
      "Processen zijn nog te afhankelijk van losse afspraken, uitzonderingen of handmatige correcties.",
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
    level: "capability",
    maxScore: 3,
    priority: 3,
    title: "Verminder workarounds naast AFAS",
    description:
      "Als gebruikers structureel naast AFAS werken, ontstaat datavervuiling, dubbel werk en minder grip.",
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
    level: "capability",
    maxScore: 3,
    priority: 4,
    title: "Maak integratiebeheer zichtbaar en beheersbaar",
    description:
      "Koppelingen zijn vaak kritisch, maar foutafhandeling en eigenaarschap zijn onvoldoende ingericht.",
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
    level: "capability",
    maxScore: 3,
    priority: 2,
    title: "Maak KPI-definities eenduidig",
    description:
      "Zonder gedeelde definities ontstaat discussie over cijfers in plaats van sturing op verbetering.",
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
    level: "capability",
    maxScore: 3,
    priority: 3,
    title: "Richt een centrale verbeterbacklog in",
    description:
      "Zonder centrale backlog raken wensen, besluiten en verbeterpunten versnipperd over mail, Teams en losse lijstjes.",
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
    level: "capability",
    maxScore: 3,
    priority: 4,
    title: "Versterk adoptie met uitleg, training en feedback",
    description:
      "Als medewerkers de werkwijze niet begrijpen of niet herkennen, blijft de inrichting kwetsbaar.",
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
