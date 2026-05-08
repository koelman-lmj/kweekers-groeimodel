"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useScanContext } from "@/app/context/ScanContext";
import {
  getOptionSet,
  getQuestionsForSection,
} from "@/lib/scan/engine/definition-helpers";
import { buildDomainScores } from "@/lib/scan/engine/build-domain-scores";
import {
  buildPriorityAdvice,
  getRootCauseLabel,
} from "@/lib/scan/engine/build-priority-advice";

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

export default function ScanExportPage() {
  const params = useParams<{ id: string | string[] }>();
  const scanId = getParam(params.id);
  const { scan } = useScanContext();

  const priorityAdvice = useMemo(() => buildPriorityAdvice(scan), [scan]);
  const domainScores = useMemo(() => buildDomainScores(scan), [scan]);

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
  const focusLabels = getLabelsFromOptionSet(
    "scope_focus_options",
    scan.scope.focus
  );
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

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              {priorityAdvice.mainBottleneckTitle}
            </h2>
            <p className="text-sm leading-6 text-neutral-700">
              {priorityAdvice.mainBottleneckText}
            </p>

            <div className="pt-1 text-sm">
              <span className="font-semibold">Onderliggende oorzaak:</span>{" "}
              <span className="text-neutral-700">
                {getRootCauseLabel(priorityAdvice.rootCauseCategory)}
              </span>
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
            <h2 className="text-xl font-semibold tracking-tight">
              {priorityAdvice.firstStepTitle}
            </h2>
            <p className="text-sm leading-6 text-neutral-700">
              {priorityAdvice.firstStepText}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Doe dit eerst</h2>
            <ul className="space-y-2 text-sm text-neutral-700">
              {priorityAdvice.actions.map((action) => (
                <li key={action} className="ml-5 list-disc">
                  {action}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              {priorityAdvice.notFirstTitle}
            </h2>
            <p className="text-sm leading-6 text-neutral-700">
              {priorityAdvice.notFirstText}
            </p>
            <ul className="space-y-2 text-sm text-neutral-700">
              {priorityAdvice.notFirst.map((item) => (
                <li key={item} className="ml-5 list-disc">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {priorityAdvice.nextLikelyFocus && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight">
                Daarna waarschijnlijk relevant
              </h2>
              <p className="text-sm leading-6 text-neutral-700">
                {priorityAdvice.nextLikelyFocus}
              </p>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Scancontext</h2>

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
