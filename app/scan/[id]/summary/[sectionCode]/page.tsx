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
import { buildDomainScores } from "@/lib/scan/engine/build-domain-scores";
import {
  buildPriorityAdvice,
  getRootCauseLabel,
} from "@/lib/scan/engine/build-priority-advice";
import { buildScanOutput } from "@/lib/build-scan-output";

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

  return optionSet.options.find((option) => option.value === rawValue)?.label ?? rawValue;
}

function getStatusMeta(priorityType: string) {
  if (priorityType === "finance") {
    return {
      tone: "border-red-200 bg-red-50 text-red-900",
      badge: "bg-red-100 text-red-700",
      chipTone: "border-red-200 bg-white text-red-700",
      compactLabel: "Eerst stabiliseren",
    };
  }

  if (
    priorityType === "governance" ||
    priorityType === "process" ||
    priorityType === "system"
  ) {
    return {
      tone: "border-amber-200 bg-amber-50 text-amber-900",
      badge: "bg-amber-100 text-amber-700",
      chipTone: "border-amber-200 bg-white text-amber-700",
      compactLabel: "Eerst aanscherpen",
    };
  }

  return {
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
    badge: "bg-emerald-100 text-emerald-700",
    chipTone: "border-emerald-200 bg-white text-emerald-700",
    compactLabel: "Gericht doorpakken",
  };
}

function getScoreLabel(score: number) {
  if (score < 2.5) return "Kwetsbaar";
  if (score < 4.5) return "Basis aanwezig";
  if (score < 6.5) return "Redelijk op orde";
  return "Sterk";
}

function getFilledBlocks(score: number) {
  return Math.max(0, Math.min(10, Math.round(score * 1.25)));
}

function normalizeScanForOutput(scan: ReturnType<typeof useScanContext>["scan"]) {
  const sectionCodes = ["profile_basis", "profile_reason", "scope", "diagnose"];

  const sections = sectionCodes.map((code) => {
    const section = getSection(code);
    const questions = getQuestionsForSection(code, scan);

    const answers = Object.fromEntries(
      questions.map((question) => [
        question.key,
        getAnswerFromScan(scan, question.key),
      ])
    );

    return {
      id: code,
      title: section?.title ?? code,
      category: "Scan",
      score: null,
      answers,
    };
  });

  const domainScores = buildDomainScores(scan);
  const averageScore =
    domainScores.length > 0
      ? domainScores.reduce((sum, domain) => sum + domain.score, 0) / domainScores.length
      : null;

return {
  id: "current-scan",
  customerName: scan.profile.customerName || "Onbekende klant",
  sector: scan.profile.sector || "Onbekende sector",
  goal:
    scan.profile.reasonForModel?.join(", ") ||
    scan.scope.focus?.join(", ") ||
    "Nog niet ingevuld",
  overallScore: averageScore,
  sections,
};
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

  const domainScores = isFinalStep ? buildDomainScores(scan) : [];
  const priorityAdvice = isFinalStep ? buildPriorityAdvice(scan) : null;
  const scanOutput = isFinalStep ? buildScanOutput(normalizeScanForOutput(scan)) : null;

  const statusMeta = priorityAdvice
    ? getStatusMeta(priorityAdvice.priorityType)
    : null;

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
          return optionSet?.options.find((option) => option.value === item)?.label ?? item;
        }),
        products: scan.profile.afasProducts.map((item) => {
          const optionSet = getOptionSet("afas_products_options");
          return optionSet?.options.find((option) => option.value === item)?.label ?? item;
        }),
        chains: scan.profile.primaryProcessChains.map((item) => {
          const optionSet = getOptionSet("primary_process_chains_options");
          return optionSet?.options.find((option) => option.value === item)?.label ?? item;
        }),
      }
    : null;

  const handlePrint = () => {
    window.print();
  };

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

      {isFinalStep && canContinue && priorityAdvice && statusMeta && (
        <>
          {scanOutput && (
            <>
              <section className="rounded-3xl border border-black/10 bg-white p-5">
                <div className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    KWEEKERS advies
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {scanOutput.summary.headline}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {scanOutput.summary.explanation}
                  </p>
                  <div className="inline-flex rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium">
                    {scanOutput.summary.scoreLabel}
                  </div>
                </div>
              </section>

              {scanOutput.quickWins.length > 0 && (
                <section className="space-y-3 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
                  <h2 className="text-lg font-medium">Quick wins</h2>

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {scanOutput.quickWins.map((item) => (
                        <li key={item} className="ml-5 list-disc">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              <section className="space-y-3 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
                <h2 className="text-lg font-medium">Prioriteiten</h2>

                <div className="space-y-3">
                  {scanOutput.priorities.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-black/10 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-semibold">{item.title}</div>
                        <span className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide">
                          {item.priority}
                        </span>
                        <span className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide">
                          {item.bucket}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground">{item.reason}</p>

                      <div className="mt-3 rounded-xl border border-black/10 bg-black/[0.02] p-3">
                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Advies
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{item.advice}</p>
                      </div>

                      {item.signals.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.signals.map((signal) => (
                            <span
                              key={signal}
                              className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-muted-foreground"
                            >
                              {signal}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
                <h2 className="text-lg font-medium">Roadmap</h2>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
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

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
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

                  <div className="rounded-2xl border border-black/10 bg-white p-4">
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
            </>
          )}

          <section className={`rounded-3xl border p-4 ${statusMeta.tone}`}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${statusMeta.badge}`}
                >
                  ●
                </div>

                <div className="text-xl font-semibold tracking-tight">
                  {priorityAdvice.mainBottleneckTitle}
                </div>
              </div>

              <p className="text-sm leading-6">{priorityAdvice.mainBottleneckText}</p>

              <div className="space-y-1">
                <div className="text-[11px] font-medium uppercase tracking-wide opacity-70">
                  Onderliggende oorzaak
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${statusMeta.chipTone}`}
                  >
                    {getRootCauseLabel(priorityAdvice.rootCauseCategory)}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${statusMeta.chipTone}`}
                  >
                    {statusMeta.compactLabel}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
            <h2 className="text-lg font-medium">Domeinscores</h2>

            <div className="space-y-5">
              {domainScores.map((domain) => (
                <div key={domain.code} className="space-y-1.5">
                  <div className="text-base font-semibold">{domain.title}</div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="shrink-0 text-muted-foreground">
                      {getScoreLabel(domain.score)}
                    </span>

                    <div className="flex items-center gap-[2px]">
                      {Array.from({ length: 10 }).map((_, index) => {
                        const filledBlocks = getFilledBlocks(domain.score);
                        const isFilled = index < filledBlocks;

                        return (
                          <span
                            key={index}
                            className={
                              isFilled
                                ? "h-2.5 w-2.5 rounded-[2px] bg-black"
                                : "h-2.5 w-2.5 rounded-[2px] border border-black/20 bg-white"
                            }
                          />
                        );
                      })}
                    </div>

                    <span className="shrink-0 text-sm font-medium">
                      {domain.score.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-medium">{priorityAdvice.firstStepTitle}</h2>
              <p className="text-sm text-muted-foreground">
                {priorityAdvice.firstStepText}
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-sm font-semibold">Doe dit eerst</div>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {priorityAdvice.actions.map((action) => (
                  <li key={action} className="ml-5 list-disc">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-medium">{priorityAdvice.notFirstTitle}</h2>
              <p className="text-sm text-muted-foreground">
                {priorityAdvice.notFirstText}
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {priorityAdvice.notFirst.map((item) => (
                  <li key={item} className="ml-5 list-disc">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {priorityAdvice.nextLikelyFocus && (
            <section className="space-y-2 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
              <h2 className="text-lg font-medium">Daarna waarschijnlijk relevant</h2>
              <p className="text-sm text-muted-foreground">
                {priorityAdvice.nextLikelyFocus}
              </p>
            </section>
          )}

          {compactContext && (
            <section className="space-y-3 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
              <h2 className="text-lg font-medium">Context van de scan</h2>

              <div className="space-y-3 rounded-2xl border border-black/10 bg-white/80 p-4">
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

          {Object.entries(scan.comments).filter(([, value]) => value.trim() !== "")
            .length > 0 && (
            <section className="space-y-3 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
              <h2 className="text-lg font-medium">Opmerkingen uit de scan</h2>

              <div className="space-y-3">
                {[
                  ...getQuestionsForSection("profile_basis", scan),
                  ...getQuestionsForSection("profile_reason", scan),
                  ...getQuestionsForSection("scope", scan),
                  ...getQuestionsForSection("diagnose", scan),
                ]
                  .filter((question) => {
                    const comment = scan.comments[question.key]?.trim() ?? "";
                    return comment !== "";
                  })
                  .map((question) => (
                    <div
                      key={question.key}
                      className="rounded-2xl border border-black/10 bg-white/80 p-4"
                    >
                      <div className="text-sm font-semibold">{question.label}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {scan.comments[question.key]}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

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
