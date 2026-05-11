"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useScanContext } from "@/app/context/ScanContext";
import {
  getOptionSet,
  getQuestionsForSection,
  getSection,
} from "@/lib/scan/engine/definition-helpers";
import {
  getAnswerFromScan,
  type AnswerValue,
} from "@/lib/scan/engine/answer-mapping";
import { buildScanOutput } from "@/lib/build-scan-output";
import { normalizeScanForOutput } from "@/lib/scan/normalize-scan-for-output";

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getDisplayValue(
  rawValue: AnswerValue,
  optionSet?: ReturnType<typeof getOptionSet>
): string | string[] {
  if (Array.isArray(rawValue)) {
    if (rawValue.length === 0) return "Nog niet ingevuld";

    if (!optionSet) return rawValue;

    return rawValue.map((value) => {
      return (
        optionSet.options.find((option) => option.value === value)?.label ?? value
      );
    });
  }

  if (!rawValue) return "Nog niet ingevuld";
  if (!optionSet) return rawValue;

  return (
    optionSet.options.find((option) => option.value === rawValue)?.label ?? rawValue
  );
}

function getPriorityLabel(priority: "hoog" | "middel" | "laag") {
  if (priority === "hoog") return "Hoog";
  if (priority === "middel") return "Middel";
  return "Laag";
}

function getBucketLabel(bucket: "now" | "next" | "later") {
  if (bucket === "now") return "Nu";
  if (bucket === "next") return "Daarna";
  return "Later";
}

function getPriorityBadgeClass(priority: "hoog" | "middel" | "laag") {
  switch (priority) {
    case "hoog":
      return "border-orange-300 bg-orange-50 text-orange-900";
    case "middel":
      return "border-amber-300 bg-amber-50 text-amber-900";
    case "laag":
      return "border-emerald-300 bg-emerald-50 text-emerald-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-900";
  }
}

function getScoreLabelClass(scoreLabel: string) {
  const label = scoreLabel.toLowerCase();

  if (label.includes("direct verbeteren")) {
    return "border-orange-300 bg-orange-50 text-orange-900";
  }

  if (label.includes("basis vraagt aandacht")) {
    return "border-amber-300 bg-amber-50 text-amber-900";
  }

  if (label.includes("redelijke basis")) {
    return "border-blue-300 bg-blue-50 text-blue-900";
  }

  if (label.includes("sterke basis")) {
    return "border-emerald-300 bg-emerald-50 text-emerald-900";
  }

  return "border-slate-200 bg-slate-50 text-slate-900";
}

function getRoadmapBucketClass(bucket: "now" | "next" | "later") {
  switch (bucket) {
    case "now":
      return "border-orange-200 bg-orange-50";
    case "next":
      return "border-amber-200 bg-amber-50";
    case "later":
      return "border-slate-200 bg-slate-50";
    default:
      return "border-slate-200 bg-slate-50";
  }
}

function scoreToFiveDots(priorityScore: number) {
  if (priorityScore >= 85) return 1;
  if (priorityScore >= 70) return 2;
  if (priorityScore >= 55) return 3;
  if (priorityScore >= 40) return 4;
  return 5;
}

function getDotClass(priorityScore: number, index: number) {
  const active = scoreToFiveDots(priorityScore);
  const isFilled = index < active;

  if (!isFilled) {
    return "h-2.5 w-2.5 rounded-full border border-black/20 bg-white";
  }

  if (priorityScore >= 85) {
    return "h-2.5 w-2.5 rounded-full bg-orange-500";
  }

  if (priorityScore >= 70) {
    return "h-2.5 w-2.5 rounded-full bg-amber-500";
  }

  if (priorityScore >= 55) {
    return "h-2.5 w-2.5 rounded-full bg-yellow-500";
  }

  if (priorityScore >= 40) {
    return "h-2.5 w-2.5 rounded-full bg-lime-500";
  }

  return "h-2.5 w-2.5 rounded-full bg-emerald-500";
}

function ScoreDots({ priorityScore }: { priorityScore: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={getDotClass(priorityScore, index)} />
      ))}
    </div>
  );
}

type ThemeCardItem = {
  id: string;
  title: string;
  score: number;
  reason: string;
  category?: string;
};

type EvidenceItem = {
  key: string;
  label: string;
  value: string;
};

type GroupedEvidence = {
  priorityId: string;
  priorityTitle: string;
  conclusion: string;
  items: EvidenceItem[];
};

function ThemeCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: ThemeCardItem[];
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium">{item.title}</div>
              <ScoreDots priorityScore={item.score} />
            </div>
            <p className="text-sm text-muted-foreground">{item.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function getRelevantEvidenceKeysForPriority(priorityId: string): string[] {
  switch (priorityId) {
    case "governance":
      return [
        "ownership_clarity",
        "change_decision_process",
        "improvement_governance",
        "ownership_model",
      ];

    case "processes":
      return [
        "process_standardization",
        "exception_control",
        "issue_resolution",
        "standardization_context",
        "primary_process_chains",
      ];

    case "finance":
      return [
        "finance_strategic_pressure",
        "finance_foundation_reliability",
        "finance_exception_handling",
        "finance_reporting_maturity",
        "afas_products",
        "scope_focus",
      ];

    case "ordermanagement":
      return [
        "order_strategic_pressure",
        "order_flow_standardization",
        "order_exception_complexity",
        "order_system_fit",
        "primary_process_chains",
      ];

    case "crm":
      return [
        "crm_strategic_pressure",
        "crm_process_maturity",
        "crm_data_quality",
        "crm_reporting_usefulness",
        "afas_products",
      ];

    case "hrm":
      return [
        "hrm_strategic_pressure",
        "hrm_process_maturity",
        "hrm_data_quality",
        "afas_products",
      ];

    case "reporting":
      return [
        "reporting_strategic_pressure",
        "reporting_definition_consistency",
        "reporting_usefulness",
        "scope_focus",
        "biggest_bottleneck",
      ];

    case "integrations":
      return [
        "integration_strategic_pressure",
        "integration_stability",
        "integration_ownership",
        "integration_monitoring_maturity",
        "afas_products",
        "primary_process_chains",
      ];

    case "care":
      return [
        "care_registration_exceptions",
        "care_accountability_pressure",
        "sector",
      ];

    case "education":
      return [
        "education_intake_planning_consistency",
        "education_process_admin_alignment",
        "education_exception_handling",
        "sector",
      ];

    default:
      return [];
  }
}

function buildPriorityConclusion(
  priorityId: string,
  priorityTitle: string,
  reason: string,
  signals: string[]
): string {
  if (signals.includes("Veel handwerk")) {
    return `Binnen ${priorityTitle.toLowerCase()} is nog veel handmatig werk nodig. Dat maakt de uitvoering trager en foutgevoeliger.`;
  }

  if (signals.includes("Foutgevoelig proces")) {
    return `${priorityTitle} is nog onvoldoende robuust ingericht, waardoor fouten of herstelacties sneller ontstaan.`;
  }

  if (signals.includes("Beperkt inzicht")) {
    return `Binnen ${priorityTitle.toLowerCase()} ontbreekt nog voldoende inzicht om strak en onderbouwd te kunnen sturen.`;
  }

  if (signals.includes("Proces vraagt sturing of controle")) {
    return `Binnen ${priorityTitle.toLowerCase()} zijn eigenaarschap, besluitvorming of controles nog niet scherp genoeg ingericht.`;
  }

  if (signals.includes("Veel uitzonderingen")) {
    return `Binnen ${priorityTitle.toLowerCase()} drukken uitzonderingen nog te zwaar op de standaard werkwijze.`;
  }

  if (signals.includes("Afhankelijk van keten of koppeling")) {
    return `${priorityTitle} hangt sterk samen met andere stappen in de keten, waardoor verstoringen sneller doorwerken.`;
  }

  switch (priorityId) {
    case "governance":
      return "Eigenaarschap en besluitvorming zijn nog niet scherp genoeg georganiseerd om verbeteringen strak aan te sturen.";
    case "processes":
      return "De werkwijze is nog niet eenduidig genoeg en uitzonderingen drukken te zwaar op de uitvoering.";
    case "finance":
      return "De financiële basis of stuurinformatie vraagt nog aanscherping om betrouwbaar te kunnen sturen.";
    case "ordermanagement":
      return "De orderroute kent nog afwijkingen of sluit nog niet strak genoeg aan op de gewenste werkwijze.";
    case "crm":
      return "CRM-data en procesdiscipline zijn nog niet sterk genoeg om CRM echt als stuurmiddel te gebruiken.";
    case "hrm":
      return "HRM-processen of datakwaliteit zijn nog niet stabiel genoeg voor een strakke uitvoering.";
    case "reporting":
      return "Rapportage en definities zijn nog niet scherp genoeg om goed en eenduidig te sturen.";
    case "integrations":
      return "Integraties en ketenafspraken missen nog voldoende stabiliteit, monitoring of eigenaarschap.";
    case "care":
      return "De zorgspecifieke uitvoering vraagt nog meer beheersing in registratie, declaratie en verantwoording.";
    case "education":
      return "De onderwijsspecifieke uitvoering vraagt nog meer eenduidigheid in intake, planning en administratie.";
    default:
      return reason || `${priorityTitle} vraagt nog gerichte aanscherping.`;
  }
}

function buildGroupedEvidence(
  topPriorities: {
    id: string;
    title: string;
    reason: string;
    signals: string[];
  }[],
  allEvidenceItems: EvidenceItem[]
): GroupedEvidence[] {
  return topPriorities
    .map((priority) => {
      const relevantKeys = getRelevantEvidenceKeysForPriority(priority.id);
      const items = allEvidenceItems.filter((item) =>
        relevantKeys.includes(item.key)
      );

      return {
        priorityId: priority.id,
        priorityTitle: priority.title,
        conclusion: buildPriorityConclusion(
          priority.id,
          priority.title,
          priority.reason,
          priority.signals
        ),
        items,
      };
    })
    .filter((group) => group.items.length > 0);
}

export default function SectionSummaryPage() {
  const params = useParams<{
    id: string | string[];
    sectionCode: string | string[];
  }>();

  const scanId = getParam(params.id);
  const sectionCode = getParam(params.sectionCode);

  const { scan, resetScan } = useScanContext();

  const section = getSection(sectionCode);
  const questions = getQuestionsForSection(sectionCode, scan);

  if (!section) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Samenvatting niet gevonden</h1>
        <p className="text-sm text-muted-foreground">
          Deze samenvattingspagina bestaat nog niet.
        </p>
      </div>
    );
  }

  const previousHref =
    questions.length > 0
      ? `/scan/${scanId}/flow/${sectionCode}/${questions[questions.length - 1].key}`
      : `/scan/${scanId}/summary/profile_basis`;

  const nextSectionCode = section.nextSectionCode ?? "";
  const nextSectionQuestions = nextSectionCode
    ? getQuestionsForSection(nextSectionCode, scan)
    : [];
  const nextQuestionKey = nextSectionQuestions[0]?.key ?? "";

  const hasNextStep = Boolean(nextSectionCode && nextQuestionKey);
  const nextHref = hasNextStep
    ? `/scan/${scanId}/flow/${nextSectionCode}/${nextQuestionKey}`
    : "";

  const canContinue = questions.every((question) => {
    if (!question.required) return true;

    const answer = getAnswerFromScan(scan, question.key);
    if (Array.isArray(answer)) return answer.length > 0;
    return answer.trim() !== "";
  });

  const isFinalStep = !hasNextStep;
  const scanOutput = isFinalStep
    ? buildScanOutput(normalizeScanForOutput(scan))
    : null;

  const handlePrint = () => {
    window.print();
  };

  const commentItems = [
    ...getQuestionsForSection("profile_basis", scan),
    ...getQuestionsForSection("profile_reason", scan),
    ...getQuestionsForSection("scope", scan),
    ...getQuestionsForSection("diagnose", scan),
  ]
    .filter((question) => {
      const comment = scan.comments[question.key]?.trim() ?? "";
      return comment !== "";
    })
    .map((question) => ({
      questionKey: question.key,
      label: question.label,
      value: scan.comments[question.key],
    }));

  const allEvidenceItems: EvidenceItem[] = isFinalStep
    ? [
        ...getQuestionsForSection("profile_basis", scan),
        ...getQuestionsForSection("profile_reason", scan),
        ...getQuestionsForSection("scope", scan),
        ...getQuestionsForSection("diagnose", scan),
      ]
        .filter((question) => {
          const rawValue = getAnswerFromScan(scan, question.key);
          if (Array.isArray(rawValue)) return rawValue.length > 0;
          return rawValue.trim() !== "";
        })
        .map((question) => {
          const rawValue = getAnswerFromScan(scan, question.key);
          const optionSet = getOptionSet(question.optionSetKey);
          const displayValue = getDisplayValue(rawValue, optionSet);

          return {
            key: question.key,
            label: question.label,
            value: Array.isArray(displayValue)
              ? displayValue.join(", ")
              : displayValue,
          };
        })
    : [];

  const groupedEvidence =
    isFinalStep && scanOutput
      ? buildGroupedEvidence(
          scanOutput.priorities.slice(0, 3).map((item) => ({
            id: item.id,
            title: item.title,
            reason: item.reason,
            signals: item.signals,
          })),
          allEvidenceItems
        )
      : [];

  const fallbackEvidenceItems =
    groupedEvidence.length === 0 ? allEvidenceItems.slice(0, 8) : [];

  const compactContext = isFinalStep
    ? {
        bottlenecks: scan.profile.biggestBottleneck.map((item) => {
          const optionSet = getOptionSet("biggest_bottleneck_options");
          return (
            optionSet?.options.find((option) => option.value === item)?.label ?? item
          );
        }),
        focus: scan.scope.focus.map((item) => {
          const optionSet = getOptionSet("scope_focus_options");
          return (
            optionSet?.options.find((option) => option.value === item)?.label ?? item
          );
        }),
        products: scan.profile.afasProducts.map((item) => {
          const optionSet = getOptionSet("afas_products_options");
          return (
            optionSet?.options.find((option) => option.value === item)?.label ?? item
          );
        }),
        chains: scan.profile.primaryProcessChains.map((item) => {
          const optionSet = getOptionSet("primary_process_chains_options");
          return (
            optionSet?.options.find((option) => option.value === item)?.label ?? item
          );
        }),
      }
    : null;

  const themeItems: ThemeCardItem[] =
    scanOutput?.priorities.map((item) => ({
      id: item.id,
      title: item.title,
      score: item.score,
      reason: item.reason,
      category: item.category,
    })) ?? [];

  const displayModulesItems = themeItems.filter((item) =>
    ["finance", "ordermanagement", "crm", "hrm"].includes(item.id)
  );

  const displayIntegrationItems = themeItems.filter(
    (item) => item.id === "integrations"
  );

  const displayReportingItems = themeItems.filter(
    (item) => item.id === "reporting"
  );

  const displayOrganizationItems = themeItems.filter((item) =>
    ["governance", "processes"].includes(item.id)
  );

  const displayBranchItems = themeItems.filter((item) =>
    ["care", "education"].includes(item.id)
  );

  const visibleThemeCards = [
    {
      key: "modules",
      title: "AFAS Modules",
      description: "Hoe sterk zijn de gekozen modules nu ingericht en bruikbaar?",
      items: displayModulesItems,
    },
    {
      key: "integrations",
      title: "Integraties & Beheer",
      description: "Hoe stabiel en beheersbaar is de keten rondom AFAS?",
      items: displayIntegrationItems,
    },
    {
      key: "reporting",
      title: "Rapportage & Data",
      description: "Hoe bruikbaar en betrouwbaar is informatie voor sturing?",
      items: displayReportingItems,
    },
    {
      key: "organization",
      title: "Organisatie & Beheer",
      description: "Hoe volwassen zijn eigenaarschap, governance en werkwijze?",
      items: displayOrganizationItems,
    },
  ].filter((card) => card.items.length > 0);

  const totalScore =
    scanOutput && scanOutput.priorities.length > 0
      ? (
          scanOutput.priorities.reduce((sum, item) => {
            return sum + scoreToFiveDots(item.score);
          }, 0) / scanOutput.priorities.length
        ).toFixed(1)
      : "-";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {section.title} — samenvatting
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Samenvatting</h1>
        <p className="text-sm text-muted-foreground">
          Controleer of de ingevulde gegevens goed zijn ingevuld.
        </p>
      </div>

      {!isFinalStep && (
        <section className="space-y-3 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
          <h2 className="text-lg font-medium">Overzicht</h2>

          <div className="space-y-3">
            {questions.map((question) => {
              const rawValue = getAnswerFromScan(scan, question.key);
              const optionSet = getOptionSet(question.optionSetKey);
              const comment = scan.comments[question.key]?.trim() ?? "";
              const displayValue = getDisplayValue(rawValue, optionSet);

              return (
                <div
                  key={question.key}
                  className="rounded-2xl border border-black/10 bg-white/80 p-4"
                >
                  <div className="text-sm font-medium">{question.label}</div>

                  {Array.isArray(displayValue) ? (
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {displayValue.map((value) => (
                        <li key={value} className="ml-5 list-disc">
                          {value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {displayValue}
                    </div>
                  )}

                  {comment && (
                    <div className="mt-3 rounded-xl border border-black/8 bg-black/[0.025] p-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Opmerking
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {comment}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!canContinue && (
        <div className="kweekers-accent-box text-sm">
          Nog niet alle verplichte vragen zijn ingevuld.
        </div>
      )}

      {isFinalStep && canContinue && scanOutput && (
        <>
          <section className="rounded-3xl border border-black/10 bg-white p-6">
            <div className="space-y-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Advies — kernbeeld
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {scanOutput.summary.headline}
                  </h2>
                  <p className="max-w-3xl text-sm text-muted-foreground">
                    {scanOutput.summary.explanation}
                  </p>
                </div>

                <div
                  className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getScoreLabelClass(
                    scanOutput.summary.scoreLabel
                  )}`}
                >
                  {scanOutput.summary.scoreLabel}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-600">
                Totaalbeeld
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">
                {totalScore}
              </div>
              <div className="mt-2 text-sm text-slate-700">op schaal 1–5</div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-orange-700">
                Grootste risico
              </div>
              <div className="mt-2 text-sm font-medium text-orange-950">
                {scanOutput.summary.biggestRisk}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Grootste kans
              </div>
              <div className="mt-2 text-sm font-medium text-emerald-950">
                {scanOutput.summary.biggestOpportunity}
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-blue-700">
                Beste eerstvolgende stap
              </div>
              <div className="mt-2 text-sm font-medium text-blue-950">
                {scanOutput.summary.nextBestStep}
              </div>
            </div>
          </section>

          {visibleThemeCards.length > 0 && (
            <section className="grid gap-4 md:grid-cols-2">
              {visibleThemeCards.map((card) => (
                <ThemeCard
                  key={card.key}
                  title={card.title}
                  description={card.description}
                  items={card.items}
                />
              ))}
            </section>
          )}

          {displayBranchItems.length > 0 && (
            <section className="rounded-3xl border border-black/10 bg-white p-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">
                  Branchespecifieke aandachtspunten
                </h2>
                <p className="text-sm text-muted-foreground">
                  Thema’s die specifiek samenhangen met de sector van deze organisatie.
                </p>
              </div>

              <div className="mt-4 space-y-4">
                {displayBranchItems.map((item) => (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium">{item.title}</div>
                      <ScoreDots priorityScore={item.score} />
                    </div>
                    <p className="text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {scanOutput.quickWins.length > 0 && (
            <section className="rounded-3xl border border-black/10 bg-white p-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Quick wins</h2>
                <p className="text-sm text-muted-foreground">
                  Kleine ingrepen die snel waarde kunnen opleveren.
                </p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {scanOutput.quickWins.slice(0, 6).map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-black/10 bg-white p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Topprioriteiten</h2>
              <p className="text-sm text-muted-foreground">
                Dit zijn de belangrijkste thema’s om als eerste op te sturen.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {scanOutput.priorities.slice(0, 3).map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-semibold">
                      {index + 1}
                    </div>

                    <div className="text-base font-semibold">{item.title}</div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getPriorityBadgeClass(
                        item.priority
                      )}`}
                    >
                      {getPriorityLabel(item.priority)}
                    </span>

                    <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-medium">
                      {getBucketLabel(item.bucket)}
                    </span>

                    {item.category && (
                      <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">{item.reason}</p>

                  <div className="mt-3 rounded-xl border border-black/10 bg-white p-3">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Advies
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.advice}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-black/10 bg-white p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Roadmap</h2>
              <p className="text-sm text-muted-foreground">
                Praktische fasering van eerstvolgende verbeterstappen.
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className={`rounded-2xl border p-4 ${getRoadmapBucketClass("now")}`}>
                <div className="text-sm font-semibold">Nu</div>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {scanOutput.roadmap.now.length > 0 ? (
                    scanOutput.roadmap.now.map((item) => (
                      <li key={item.id} className="ml-5 list-disc">
                        {item.title}
                      </li>
                    ))
                  ) : (
                    <li className="list-none text-muted-foreground">
                      Geen directe acties.
                    </li>
                  )}
                </ul>
              </div>

              <div className={`rounded-2xl border p-4 ${getRoadmapBucketClass("next")}`}>
                <div className="text-sm font-semibold">Daarna</div>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {scanOutput.roadmap.next.length > 0 ? (
                    scanOutput.roadmap.next.map((item) => (
                      <li key={item.id} className="ml-5 list-disc">
                        {item.title}
                      </li>
                    ))
                  ) : (
                    <li className="list-none text-muted-foreground">
                      Nog geen volgende stap bepaald.
                    </li>
                  )}
                </ul>
              </div>

              <div className={`rounded-2xl border p-4 ${getRoadmapBucketClass("later")}`}>
                <div className="text-sm font-semibold">Later</div>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {scanOutput.roadmap.later.length > 0 ? (
                    scanOutput.roadmap.later.map((item) => (
                      <li key={item.id} className="ml-5 list-disc">
                        {item.title}
                      </li>
                    ))
                  ) : (
                    <li className="list-none text-muted-foreground">
                      Nog niets voor later.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          {scanOutput.impact.length > 0 && (
            <section className="rounded-3xl border border-black/10 bg-white p-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Verwachte impact</h2>
                <p className="text-sm text-muted-foreground">
                  Wat deze verbeterstappen naar verwachting opleveren.
                </p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {scanOutput.impact.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>
          )}

          {compactContext && (
            <section className="rounded-3xl border border-black/10 bg-white p-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Context van de scan</h2>
                <p className="text-sm text-muted-foreground">
                  Relevante context die deze duiding beïnvloedt.
                </p>
              </div>

              <div className="mt-4 space-y-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                {compactContext.bottlenecks.length > 0 && (
                  <div className="text-sm">
                    <span className="font-semibold">Knelpunten:</span>{" "}
                    <span className="text-muted-foreground">
                      {compactContext.bottlenecks.join(", ")}
                    </span>
                  </div>
                )}

                {compactContext.focus.length > 0 && (
                  <div className="text-sm">
                    <span className="font-semibold">Focus:</span>{" "}
                    <span className="text-muted-foreground">
                      {compactContext.focus.join(", ")}
                    </span>
                  </div>
                )}

                {compactContext.products.length > 0 && (
                  <div className="text-sm">
                    <span className="font-semibold">AFAS-context:</span>{" "}
                    <span className="text-muted-foreground">
                      {compactContext.products.join(", ")}
                    </span>
                  </div>
                )}

                {compactContext.chains.length > 0 && (
                  <div className="text-sm">
                    <span className="font-semibold">Procesketens:</span>{" "}
                    <span className="text-muted-foreground">
                      {compactContext.chains.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {commentItems.length > 0 && (
            <section className="rounded-3xl border border-black/10 bg-white p-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Belangrijke opmerkingen</h2>
                <p className="text-sm text-muted-foreground">
                  Aanvullende observaties uit de scan.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {commentItems.map((item) => (
                  <div
                    key={item.questionKey}
                    className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
                  >
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-black/10 bg-white p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Onderbouwing</h2>
              <p className="text-sm text-muted-foreground">
                De antwoorden hieronder zijn gegroepeerd per topprioriteit.
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {groupedEvidence.length > 0 ? (
                groupedEvidence.map((group, index) => (
                  <div
                    key={group.priorityId}
                    className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="text-base font-semibold">
                        {group.priorityTitle}
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">
                      {group.conclusion}
                    </p>

                    <div className="mt-4 space-y-3">
                      {group.items.slice(0, 4).map((item) => (
                        <div
                          key={item.key}
                          className="rounded-xl border border-black/10 bg-white p-3"
                        >
                          <div className="text-sm font-medium">{item.label}</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                fallbackEvidenceItems.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
                  >
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {item.value}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-black/10 bg-black/[0.01] p-5">
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Scan afgerond</h2>
              <p className="text-sm text-muted-foreground">
                Je kunt de samenvatting exporteren, een nieuwe scan starten of deze scan resetten.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium"
              >
                Exporteer samenvatting
              </button>

              <Link
                href="/scan/nieuw/flow/profile_basis/customer_name"
                className="kweekers-primary-button"
                onClick={() => resetScan()}
              >
                Nieuwe scan starten
              </Link>

              <button
                type="button"
                onClick={() => resetScan()}
                className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium"
              >
                Reset scan
              </button>
            </div>
          </section>
        </>
      )}

      <div className="flex items-center justify-between border-t pt-6">
        <Link
          href={previousHref}
          className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium"
        >
          Vorige
        </Link>

        {hasNextStep ? (
          canContinue ? (
            <Link href={nextHref} className="kweekers-primary-button">
              Verder →
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-muted-foreground opacity-60"
            >
              Verder →
            </span>
          )
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-muted-foreground opacity-60"
          >
            Einde van de scan
          </span>
        )}
      </div>
    </div>
  );
}
