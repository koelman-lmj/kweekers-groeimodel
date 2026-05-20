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
import { questions } from "@/lib/scan/definition/questions";
import { getCategoryDefinition } from "@/lib/scan/definition/categories";

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
    optionSet.options.find((option) => option.value === rawValue)?.label ??
    rawValue
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

function scoreToFiveDots(priorityScore: number) {
  if (priorityScore >= 85) return 1;
  if (priorityScore >= 70) return 2;
  if (priorityScore >= 55) return 3;
  if (priorityScore >= 40) return 4;
  return 5;
}

function getScoreColor(score: number): string {
  if (score >= 4) return "#22c55e"; // green
  if (score >= 3) return "#ed6e41"; // orange (brand)
  if (score >= 2) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function getScoreLabel(score: number): string {
  if (score >= 4) return "Goed";
  if (score >= 3) return "Redelijk";
  if (score >= 2) return "Matig";
  return "Aandacht nodig";
}

// Circular gauge for total score
function ScoreGauge({ score, maxScore = 5 }: { score: number; maxScore?: number }) {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="120" height="120" className="-rotate-90">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-xs text-muted-foreground">van {maxScore}</span>
      </div>
    </div>
  );
}

// Progress bar for dimension scores
function ScoreProgressBar({ score, maxScore = 5 }: { score: number; maxScore?: number }) {
  const percentage = (score / maxScore) * 100;
  const color = getScoreColor(score);

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full bg-black/10">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-medium tabular-nums" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function ScoreDots({ priorityScore }: { priorityScore: number }) {
  const active = scoreToFiveDots(priorityScore);

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={
            index < active
              ? "h-2.5 w-2.5 rounded-full bg-black"
              : "h-2.5 w-2.5 rounded-full border border-black/20 bg-white"
          }
        />
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

type ThemeCardGroup = {
  title: string;
  description: string;
  items: ThemeCardItem[];
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
        {items.map((item) => {
          const displayScore = scoreToFiveDots(item.score);
          return (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">{item.title}</div>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${getScoreColor(displayScore)}15`,
                    color: getScoreColor(displayScore),
                  }}
                >
                  {getScoreLabel(displayScore)}
                </span>
              </div>
              <ScoreProgressBar score={displayScore} />
              <p className="text-sm text-muted-foreground">{item.reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildThemeCardGroups(items: ThemeCardItem[]): ThemeCardGroup[] {
  const grouped = items.reduce<Record<string, ThemeCardItem[]>>((acc, item) => {
    const category = item.category ?? "Overig";

    return {
      ...acc,
      [category]: [...(acc[category] ?? []), item],
    };
  }, {});

  return Object.entries(grouped)
    .map(([category, categoryItems]) => {
      const categoryDefinition = getCategoryDefinition(category);

      return {
        title: categoryDefinition.title,
        description: categoryDefinition.description,
        order: categoryDefinition.order,
        items: categoryItems,
      };
    })
    .sort((a, b) => {
      const orderDifference = a.order - b.order;

      if (orderDifference !== 0) {
        return orderDifference;
      }

      return a.title.localeCompare(b.title);
    })
    .map(({ title, description, items }) => ({
      title,
      description,
      items,
    }));
}

function getRelevantEvidenceKeysForPriority(priorityId: string): string[] {
  return questions
    .filter((question) => {
      return (
        question.dimensionCode === priorityId &&
        question.outputRole !== "context"
      );
    })
    .sort((a, b) => a.order - b.order)
    .map((question) => question.key);
}

function buildPriorityConclusion(
  priorityId: string,
  priorityTitle: string,
  signals: string[]
): string {
  if (signals.includes("Veel handwerk")) {
    return `${priorityTitle} vraagt aandacht omdat er nog te veel handmatige stappen of losse acties in zitten.`;
  }

  if (signals.includes("Foutgevoelig proces")) {
    return `${priorityTitle} is nog kwetsbaar doordat de uitvoering foutgevoelig of onvoldoende betrouwbaar is.`;
  }

  if (signals.includes("Beperkt inzicht")) {
    return `${priorityTitle} vraagt aanscherping omdat inzicht, rapportage of stuurinformatie nog onvoldoende bruikbaar is.`;
  }

  if (signals.includes("Proces vraagt sturing of controle")) {
    return `${priorityTitle} vraagt meer duidelijkheid in eigenaarschap, controle en besluitvorming.`;
  }

  if (signals.includes("Veel uitzonderingen")) {
    return `${priorityTitle} wordt nu te veel belast door uitzonderingen en afwijkende werkwijzen.`;
  }

  if (signals.includes("Afhankelijk van keten of koppeling")) {
    return `${priorityTitle} hangt sterk samen met ketenafspraken, koppelingen of gegevensuitwisseling.`;
  }

  if (signals.includes("Hoge strategische druk")) {
    return `${priorityTitle} heeft hoge prioriteit omdat hier duidelijke druk of urgentie zichtbaar is.`;
  }

  return `${priorityTitle} vraagt gerichte aanscherping op basis van de ingevulde antwoorden.`;
}

function buildGroupedEvidence(
  topPriorities: { id: string; title: string; signals: string[] }[],
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
  const sectionQuestions = getQuestionsForSection(sectionCode, scan);

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
    sectionQuestions.length > 0
      ? `/scan/${scanId}/flow/${sectionCode}/${
          sectionQuestions[sectionQuestions.length - 1].key
        }`
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

  const canContinue = sectionQuestions.every((question) => {
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

  const allSectionQuestions = [
    ...getQuestionsForSection("profile_basis", scan),
    ...getQuestionsForSection("profile_reason", scan),
    ...getQuestionsForSection("scope", scan),
    ...getQuestionsForSection("diagnose", scan),
  ];

  const commentItems = allSectionQuestions
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
    ? allSectionQuestions
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
            optionSet?.options.find((option) => option.value === item)?.label ??
            item
          );
        }),
        focus: scan.scope.focus.map((item) => {
          const optionSet = getOptionSet("scope_focus_options");
          return (
            optionSet?.options.find((option) => option.value === item)?.label ??
            item
          );
        }),
        products: scan.profile.afasProducts.map((item) => {
          const optionSet = getOptionSet("afas_products_options");
          return (
            optionSet?.options.find((option) => option.value === item)?.label ??
            item
          );
        }),
        chains: scan.profile.primaryProcessChains.map((item) => {
          const optionSet = getOptionSet("primary_process_chains_options");
          return (
            optionSet?.options.find((option) => option.value === item)?.label ??
            item
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

  const themeCardGroups = buildThemeCardGroups(themeItems);

  const themeGridClassName =
    themeCardGroups.length === 1
      ? "grid gap-4"
      : "grid gap-4 xl:grid-cols-2";

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
            {sectionQuestions.map((question) => {
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

                <div className="inline-flex rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-sm font-semibold">
                  {scanOutput.summary.scoreLabel}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Totaalbeeld
              </div>
              <div className="mt-2">
                <ScoreGauge score={parseFloat(totalScore) || 0} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {getScoreLabel(parseFloat(totalScore) || 0)}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Grootste risico
                </div>
              </div>
              <div className="mt-3 text-sm font-medium">
                {scanOutput.summary.biggestRisk}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Grootste kans
                </div>
              </div>
              <div className="mt-3 text-sm font-medium">
                {scanOutput.summary.biggestOpportunity}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ed6e41]/10">
                  <svg className="h-4 w-4 text-[#ed6e41]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Beste eerstvolgende stap
                </div>
              </div>
              <div className="mt-3 text-sm font-medium">
                {scanOutput.summary.nextBestStep}
              </div>
            </div>
          </section>

          {themeCardGroups.length > 0 && (
            <section className={themeGridClassName}>
              {themeCardGroups.map((group) => (
                <ThemeCard
                  key={group.title}
                  title={group.title}
                  description={group.description}
                  items={group.items}
                />
              ))}
            </section>
          )}

          {scanOutput.quickWins.length > 0 && (
            <section className="rounded-3xl border border-black/10 bg-white p-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold">Quick wins</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Kleine ingrepen die snel waarde kunnen opleveren.
                </p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {scanOutput.quickWins.slice(0, 6).map((item, index) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm text-green-900">{item}</span>
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

                    <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-medium">
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

                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.reason}
                  </p>

                  <div className="mt-3 rounded-xl border border-black/10 bg-white p-3">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Advies
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.advice}
                    </p>
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

            <div className="mt-6">
              {/* Timeline header */}
              <div className="relative mb-4 flex items-center justify-between px-4">
                <div className="absolute left-[calc(16.67%+12px)] right-[calc(16.67%+12px)] top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-[#ed6e41] via-[#f59e0b] to-[#22c55e]" />
                
                {/* Nu */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ed6e41] text-white shadow-lg">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="mt-2 text-sm font-semibold">Nu</span>
                </div>

                {/* Daarna */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f59e0b] text-white shadow-lg">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="mt-2 text-sm font-semibold">Daarna</span>
                </div>

                {/* Later */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e] text-white shadow-lg">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="mt-2 text-sm font-semibold">Later</span>
                </div>
              </div>

              {/* Timeline content */}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border-2 border-[#ed6e41]/20 bg-[#ed6e41]/5 p-4">
                  <ul className="space-y-2 text-sm">
                    {scanOutput.roadmap.now.length > 0 ? (
                      scanOutput.roadmap.now.map((item) => (
                        <li key={item.id} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#ed6e41]" />
                          <span className="text-muted-foreground">{item.title}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">Geen directe acties.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-2xl border-2 border-[#f59e0b]/20 bg-[#f59e0b]/5 p-4">
                  <ul className="space-y-2 text-sm">
                    {scanOutput.roadmap.next.length > 0 ? (
                      scanOutput.roadmap.next.map((item) => (
                        <li key={item.id} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#f59e0b]" />
                          <span className="text-muted-foreground">{item.title}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">Nog geen volgende stap bepaald.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-2xl border-2 border-[#22c55e]/20 bg-[#22c55e]/5 p-4">
                  <ul className="space-y-2 text-sm">
                    {scanOutput.roadmap.later.length > 0 ? (
                      scanOutput.roadmap.later.map((item) => (
                        <li key={item.id} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22c55e]" />
                          <span className="text-muted-foreground">{item.title}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">Nog niets voor later.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {scanOutput.impact.length > 0 && (
            <section className="rounded-3xl border border-black/10 bg-white p-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold">Verwachte impact</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Wat deze verbeterstappen naar verwachting opleveren.
                </p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {scanOutput.impact.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4"
                  >
                    <svg className="h-5 w-5 flex-shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-blue-900">{item}</span>
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
              <Link
                href={`/scan/${scanId}/export`}
                className="kweekers-primary-button"
              >
                Download PDF rapport
              </Link>

              <Link
                href="/scan/nieuw/flow/profile_basis/customer_name"
                className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium"
                onClick={() => resetScan()}
              >
                Nieuwe scan starten
              </Link>
            </div>
          </section>
        </>
      )}

      <div className="flex items-center justify-between border-t pt-6">
        <div className="flex items-center gap-3">
          <Link
            href={previousHref}
            className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium"
          >
            Vorige
          </Link>
          <button
            type="button"
            onClick={() => resetScan()}
            className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Reset scan
          </button>
        </div>

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
