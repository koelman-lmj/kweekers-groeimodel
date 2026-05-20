"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useScanContext } from "@/app/context/ScanContext";
import {
  getOptionSet,
  getQuestionsForSection,
} from "@/lib/scan/engine/definition-helpers";
import { buildDomainScores } from "@/lib/scan/engine/build-domain-scores";
import { buildScanOutput } from "@/lib/build-scan-output";
import { normalizeScanForOutput } from "@/lib/scan/normalize-scan-for-output";

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

function getScoreColor(score: number) {
  if (score < 2.5) return "bg-red-500";
  if (score < 4.5) return "bg-amber-500";
  if (score < 6.5) return "bg-emerald-400";
  return "bg-emerald-600";
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

function getPriorityColor(priority: "hoog" | "middel" | "laag") {
  if (priority === "hoog") return "bg-red-100 text-red-800 border-red-200";
  if (priority === "middel") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
}

export default function ScanExportPage() {
  const params = useParams<{ id: string | string[] }>();
  const scanId = getParam(params.id);
  const { scan } = useScanContext();
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleDownload = () => {
    setIsGenerating(true);
    
    // Short delay to show feedback, then trigger print
    setTimeout(() => {
      window.print();
      // Reset after print dialog closes
      setTimeout(() => setIsGenerating(false), 500);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-neutral-50 print:bg-white">
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm 12mm 20mm 12mm;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .print-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .print-page-break {
            break-before: page;
            page-break-before: always;
          }
          
          .priority-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Download feedback overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:hidden">
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-[#E86C34]" />
            <p className="text-lg font-semibold">PDF wordt gegenereerd...</p>
            <p className="mt-1 text-sm text-neutral-600">Het printvenster opent zo</p>
          </div>
        </div>
      )}

      {/* Action bar - hidden in print */}
      <div className="sticky top-0 z-40 border-b border-black/10 bg-white print:hidden">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-6 py-4">
          <Link
            href={`/scan/${scanId}/summary/advies`}
            className="rounded-2xl border border-black/10 px-4 py-2.5 text-sm font-medium hover:bg-neutral-50"
          >
            ← Terug naar samenvatting
          </Link>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="kweekers-primary-button disabled:opacity-50"
          >
            {isGenerating ? "Genereren..." : "Download als PDF"}
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="mx-auto w-full max-w-[1120px] px-6 py-8 print:max-w-none print:px-0 print:py-0">
        <div className="rounded-2xl bg-white p-8 shadow-sm print:rounded-none print:p-0 print:shadow-none">
          
          {/* Header */}
          <header className="print-section border-b border-black/10 pb-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E86C34]">
                  KWEEKERS Groeiscan
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                  Samenvatting groeiscan
                </h1>
              </div>
              <img
                src="/kweekers-logo.png"
                alt="KWEEKERS"
                className="h-9 w-auto"
              />
            </div>

            <div className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-sm">
                <span className="font-semibold text-neutral-900">Klant:</span>{" "}
                <span className="text-neutral-700">{customerName}</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-neutral-900">Datum:</span>{" "}
                <span className="text-neutral-700">{printDate}</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-neutral-900">Aanleiding:</span>{" "}
                <span className="text-neutral-700">{scanReasonLabel}</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-neutral-900">Sector:</span>{" "}
                <span className="text-neutral-700">{sectorLabel}</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-neutral-900">Omvang:</span>{" "}
                <span className="text-neutral-700">{organizationSizeLabel}</span>
              </div>
            </div>
          </header>

          {/* Main Advice */}
          <section className="print-section mt-8 rounded-xl border-2 border-[#E86C34]/20 bg-[#E86C34]/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E86C34]">
              KWEEKERS advies
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-neutral-900">
              {scanOutput.summary.headline}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
              {scanOutput.summary.explanation}
            </p>
            <div className="mt-4 inline-flex rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-neutral-900 shadow-sm">
              {scanOutput.summary.scoreLabel}
            </div>
          </section>

          {/* Quick wins */}
          {scanOutput.quickWins.length > 0 && (
            <section className="print-section mt-8">
              <h2 className="text-lg font-bold tracking-tight text-neutral-900">Quick wins</h2>
              <div className="mt-3 rounded-xl border border-black/10 bg-neutral-50 p-5">
                <ul className="space-y-2">
                  {scanOutput.quickWins.map((item, index) => (
                    <li key={index} className="flex gap-3 text-[15px] leading-relaxed text-neutral-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E86C34]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Priorities */}
          <section className="mt-8">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">Prioriteiten</h2>

            <div className="mt-4 space-y-4">
              {scanOutput.priorities.map((item) => (
                <div 
                  key={item.id} 
                  className="priority-card print-section rounded-xl border border-black/10 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${getPriorityColor(item.priority)}`}>
                      {getPriorityLabel(item.priority)}
                    </span>
                    <span className="rounded-full border border-black/10 bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
                      {getBucketLabel(item.bucket)}
                    </span>
                  </div>

                  <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
                    {item.reason}
                  </p>

                  <div className="mt-4 rounded-lg border-l-4 border-[#E86C34] bg-neutral-50 py-3 pl-4 pr-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Advies
                    </p>
                    <p className="mt-1 text-[15px] leading-relaxed text-neutral-700">
                      {item.advice}
                    </p>
                  </div>

                  {item.signals.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.signals.map((signal) => (
                        <span
                          key={signal}
                          className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"
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

          {/* Roadmap - page break before */}
          <section className="print-section print-page-break mt-8 pt-0 print:pt-0">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">Roadmap</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border-2 border-[#E86C34]/30 bg-[#E86C34]/5 p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E86C34] text-xs font-bold text-white">1</span>
                  <span className="font-bold text-neutral-900">Nu</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {scanOutput.roadmap.now.length > 0 ? (
                    scanOutput.roadmap.now.map((item) => (
                      <li key={item.id} className="flex gap-2 text-sm text-neutral-700">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E86C34]" />
                        {item.title}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-neutral-500">Geen directe acties.</li>
                  )}
                </ul>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700">2</span>
                  <span className="font-bold text-neutral-900">Daarna</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {scanOutput.roadmap.next.length > 0 ? (
                    scanOutput.roadmap.next.map((item) => (
                      <li key={item.id} className="flex gap-2 text-sm text-neutral-700">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                        {item.title}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-neutral-500">Nog geen volgende stap bepaald.</li>
                  )}
                </ul>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500">3</span>
                  <span className="font-bold text-neutral-900">Later</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {scanOutput.roadmap.later.length > 0 ? (
                    scanOutput.roadmap.later.map((item) => (
                      <li key={item.id} className="flex gap-2 text-sm text-neutral-700">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300" />
                        {item.title}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-neutral-500">Nog niets voor later.</li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          {/* Domain Scores */}
          <section className="print-section mt-8">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">Domeinscores</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {domainScores.map((domain) => (
                <div key={domain.code} className="rounded-xl border border-black/10 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-neutral-900">{domain.title}</div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-neutral-900">
                        {domain.score.toFixed(1)}
                      </span>
                      <span className="text-sm text-neutral-500">/8</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className={`h-full rounded-full ${getScoreColor(domain.score)}`}
                          style={{ width: `${(domain.score / 8) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-neutral-600">
                      {getScoreLabel(domain.score)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Context */}
          <section className="print-section mt-8 rounded-xl border border-black/10 bg-neutral-50 p-5">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">Context van de scan</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {bottleneckLabels.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Knelpunten</p>
                  <p className="mt-1 text-sm text-neutral-700">{bottleneckLabels.join(", ")}</p>
                </div>
              )}

              {focusLabels.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Focus</p>
                  <p className="mt-1 text-sm text-neutral-700">{focusLabels.join(", ")}</p>
                </div>
              )}

              {productLabels.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">AFAS-context</p>
                  <p className="mt-1 text-sm text-neutral-700">{productLabels.join(", ")}</p>
                </div>
              )}

              {processChainLabels.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Procesketens</p>
                  <p className="mt-1 text-sm text-neutral-700">{processChainLabels.join(", ")}</p>
                </div>
              )}
            </div>
          </section>

          {/* Comments */}
          {comments.length > 0 && (
            <section className="print-section mt-8">
              <h2 className="text-lg font-bold tracking-tight text-neutral-900">
                Opmerkingen uit de scan
              </h2>

              <div className="mt-4 space-y-3">
                {comments.map((item, index) => (
                  <div key={index} className="rounded-lg border border-black/10 p-4">
                    <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
                    <p className="mt-1 text-sm text-neutral-600">{item.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="mt-10 border-t border-black/10 pt-6">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <p>KWEEKERS Groeiscan - {customerName}</p>
              <p>{printDate}</p>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}
