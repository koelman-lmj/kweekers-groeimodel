"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useScanContext } from "@/app/context/ScanContext";
import {
  getOptionSet,
  getQuestionsForSection,
  getSection,
} from "@/lib/scan/engine/definition-helpers";
import { getAnswerFromScan } from "@/lib/scan/engine/answer-mapping";
import { buildDomainScores } from "@/lib/scan/engine/build-domain-scores";
import { buildScanOutput } from "@/lib/build-scan-output";

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getLabelFromOptionSet(
  optionSetKey: string,
  value: string | undefined
): string {
  if (!value) return "Nog niet ingevuld";

  const optionSet = getOptionSet(optionSetKey);
  return (
    optionSet?.options.find((option) => option.value === value)?.label ?? value
  );
}

function getLabelsFromOptionSet(
  optionSetKey: string,
  values: string[] | undefined
): string[] {
  if (!values || values.length === 0) return [];

  const optionSet = getOptionSet(optionSetKey);

  return values.map((value) => {
    return optionSet?.options.find((option) => option.value === value)?.label ?? value;
  });
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

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getBucketLabel(bucket: "now" | "next" | "later") {
  if (bucket === "now") return "Nu";
  if (bucket === "next") return "Daarna";
  return "Later";
}

function getPriorityLabel(priority: "hoog" | "middel" | "laag") {
  if (priority === "hoog") return "Hoog";
  if (priority === "middel") return "Middel";
  return "Laag";
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
    goal: scan.scope.focus?.join(", ") || "Nog niet ingevuld",
    overallScore: averageScore,
    sections,
  };
}

export default function ScanExportPage() {
  const params = useParams<{ id: string | string[] }>();
  const scanId = getParam(params.id);
  const { scan } = useScanContext();

  const domainScores = useMemo(() => buildDomainScores(scan), [scan]);
  const scanOutput = useMemo(
    () => buildScanOutput(normalizeScanForOutput(scan)),
    [scan]
  );

  const customerName = scan.profile.customerName || "Onbekende klant";
  const scanReasonLabel = getLabelFromOptionSet(
    "scan_reason_options",
    scan.profile.scanReason
  );
  const sectorLabel = getLabelFromOptionSet("sector_options", scan.profile.sector);
  const organizationSizeLabel = getLabelFromOptionSet(
    "organization_size_options",
    scan.profile.organizationSize
  );

  const bottleneckLabels = getLabelsFromOptionSet(
    "biggest_bottleneck_options",
    scan.profile.biggestBottleneck
  );
  const focusLabels = getLabelsFromOptionSet("scope_focus_options", scan.scope.focus);
  const productLabels = getLabelsFromOptionSet(
    "afas_products_options",
    scan.profile.afasProducts
  );
  const processChainLabels = getLabelsFromOptionSet(
    "primary_process_chains_options",
    scan.profile.primaryProcessChains
  );

  const comments = [
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
      label: question.label,
      comment: scan.comments[question.key].trim(),
    }));

  const printDate = formatDate(new Date());

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-4xl px-8 py-10 print:max-w-none print:px-6 print:py-6">
        <div className="mb-8 flex items-center justify-between gap-4 print:hidden">
          <Link
            href={`/scan/${scanId}/summary/advies`}
            className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-medium"
          >
            Terug naar samenvatting
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-medium"
          >
            Print / opslaan als PDF
          </button>
        </div>

        <div className="space-y-8">
          <header className="border-b border-black/10 pb-6">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                KWEEKERS Groeiscan
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                Samenvatting groeiscan
              </h1>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="text-sm">
                <span className="font-semibold">Klant:</span> {customerName}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Datum:</span> {printDate}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Aanleiding:</span> {scanReasonLabel}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Sector:</span> {sectorLabel}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Omvang:</span> {organizationSizeLabel}
              </div>
            </div>
          </header>

          <section className="space-y-3 rounded-2xl border border-black/10 p-5">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
                KWEEKERS advies
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                {scanOutput.summary.headline}
              </h2>
              <p className="text-sm leading-6 text-neutral-700">
                {scanOutput.summary.explanation}
              </p>
              <div className="inline-flex rounded-full border border-black/10 px-3 py-1 text-xs font-medium">
                {scanOutput.summary.scoreLabel}
              </div>
            </div>
          </section>

          {scanOutput.quickWins.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight">Quick wins</h2>

              <div className="rounded-2xl border border-black/10 p-5">
                <ul className="space-y-2 text-sm text-neutral-700">
                  {scanOutput.quickWins.map((item) => (
                    <li key={item} className="ml-5 list-disc">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Prioriteiten</h2>

            <div className="space-y-4">
              {scanOutput.priorities.map((item) => (
                <div key={item.id} className="rounded-2xl border border-black/10 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold">{item.title}</div>

                    <span className="rounded-full border border-black/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide">
                      {getPriorityLabel(item.priority)}
                    </span>

                    <span className="rounded-full border border-black/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide">
                      {getBucketLabel(item.bucket)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-neutral-700">
                    {item.reason}
                  </p>

                  <div className="mt-3 border-l-2 border-black/10 pl-4">
                    <div className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                      Advies
                    </div>
                    <p className="mt-1 text-sm leading-6 text-neutral-700">
                      {item.advice}
                    </p>
                  </div>

                  {item.signals.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.signals.map((signal) => (
                        <span
                          key={signal}
                          className="rounded-full border border-black/10 px-3 py-1 text-xs text-neutral-600"
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

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Roadmap</h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/10 p-5">
                <div className="text-base font-semibold">Nu</div>
                <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                  {scanOutput.roadmap.now.length > 0 ? (
                    scanOutput.roadmap.now.map((item) => (
                      <li key={item.id} className="ml-5 list-disc">
                        {item.title}
                      </li>
                    ))
                  ) : (
                    <li className="list-none text-neutral-500">Geen directe acties.</li>
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border border-black/10 p-5">
                <div className="text-base font-semibold">Daarna</div>
                <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                  {scanOutput.roadmap.next.length > 0 ? (
                    scanOutput.roadmap.next.map((item) => (
                      <li key={item.id} className="ml-5 list-disc">
                        {item.title}
                      </li>
                    ))
                  ) : (
                    <li className="list-none text-neutral-500">
                      Nog geen volgende stap bepaald.
                    </li>
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border border-black/10 p-5">
                <div className="text-base font-semibold">Later</div>
                <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                  {scanOutput.roadmap.later.length > 0 ? (
                    scanOutput.roadmap.later.map((item) => (
                      <li key={item.id} className="ml-5 list-disc">
                        {item.title}
                      </li>
                    ))
                  ) : (
                    <li className="list-none text-neutral-500">Nog niets voor later.</li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Domeinscores</h2>

            <div className="space-y-4">
              {domainScores.map((domain) => (
                <div key={domain.code} className="space-y-1.5">
                  <div className="text-base font-semibold">{domain.title}</div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="shrink-0 text-neutral-600">
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

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Context van de scan</h2>

            <div className="space-y-2 text-sm">
              {bottleneckLabels.length > 0 && (
                <div>
                  <span className="font-semibold">Knelpunten:</span>{" "}
                  <span className="text-neutral-700">
                    {bottleneckLabels.join(", ")}
                  </span>
                </div>
              )}

              {focusLabels.length > 0 && (
                <div>
                  <span className="font-semibold">Focus:</span>{" "}
                  <span className="text-neutral-700">{focusLabels.join(", ")}</span>
                </div>
              )}

              {productLabels.length > 0 && (
                <div>
                  <span className="font-semibold">AFAS-context:</span>{" "}
                  <span className="text-neutral-700">
                    {productLabels.join(", ")}
                  </span>
                </div>
              )}

              {processChainLabels.length > 0 && (
                <div>
                  <span className="font-semibold">Procesketens:</span>{" "}
                  <span className="text-neutral-700">
                    {processChainLabels.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </section>

          {comments.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight">
                Opmerkingen uit de scan
              </h2>

              <div className="space-y-3">
                {comments.map((item) => (
                  <div key={`${item.label}-${item.comment}`} className="space-y-1">
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-sm text-neutral-700">{item.comment}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
