"use client";

import { useScan } from "@/app/context/ScanContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Download, Printer, FileText, ChevronRight } from "lucide-react";

import { buildPillarScores, generateDemoScores } from "@/lib/scan/engine/build-pillar-scores";
import { generateRoadmap, generateDemoRoadmap } from "@/lib/scan/engine/generate-roadmap";
import { pillars } from "@/lib/scan/definition/pillars";

import { ProcessSteps } from "@/components/advies/process-steps";
import { PillarScoreCard } from "@/components/advies/pillar-score-card";
import { TotalScoreCircle } from "@/components/advies/total-score-circle";
import { MaturityLegend } from "@/components/advies/maturity-legend";
import { RoadmapTimeline } from "@/components/advies/roadmap-timeline";
import { ImpactDimensions } from "@/components/advies/impact-dimensions";
import { RadarChart } from "@/components/charts/radar-chart";

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function AdviesDashboardPage() {
  const { scan } = useScan();
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const scanId = getParam(params.id);

  // Build scores from scan data or use demo data
  const hasAnswers = scan && Object.keys(scan.answers || {}).length > 0;
  const scores = hasAnswers ? buildPillarScores(scan) : generateDemoScores();
  const roadmapItems = hasAnswers ? generateRoadmap(scores) : generateDemoRoadmap();

  const customerName = scan?.answers?.customer_name || "Demo Organisatie";
  const currentDate = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white print:static print:border-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              href={`/scan/${scanId}/summary/diagnose`}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground print:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar diagnose
            </Link>
            <div className="hidden print:block">
              <Image
                src="/kweekers-logo.svg"
                alt="KWEEKERS"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" />
              Printen
            </button>
            <Link
              href={`/scan/${scanId}/roadmap`}
              className="flex items-center gap-2 rounded-lg bg-[var(--kweekers-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--kweekers-accent-dark)]"
            >
              <FileText className="h-4 w-4" />
              Naar Roadmap
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 print:px-0 print:py-0">
        {/* Title Section */}
        <div className="mb-6 print:mb-4">
          <h1 className="text-2xl font-bold text-[var(--kweekers-primary-dark)]">
            Score & Inzicht
          </h1>
          <p className="text-muted-foreground">
            {customerName} &bull; {currentDate}
          </p>
          {!hasAnswers && (
            <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Dit is een demo weergave. Vul de diagnose in voor echte scores.
            </div>
          )}
        </div>

        {/* Process Steps */}
        <div className="mb-6 print:hidden">
          <ProcessSteps currentStep={2} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Pillar Cards */}
          <div className="space-y-4 lg:col-span-2">
            <div className="grid gap-4 md:grid-cols-2">
              {pillars.map((pillar) => {
                const pillarScore = scores.pillars.find((p) => p.code === pillar.code);
                if (!pillarScore) return null;
                
                return (
                  <PillarScoreCard
                    key={pillar.code}
                    pillar={pillarScore}
                    pillarIcon={pillar.icon}
                  />
                );
              })}
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="space-y-4">
            {/* Total Score */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Totaalscore Overzicht
              </h4>
              <div className="flex items-center justify-center">
                <TotalScoreCircle score={scores.score} size="lg" />
              </div>
              <div className="mt-4 space-y-2">
                {scores.pillars.map((pillar) => (
                  <div key={pillar.code} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: pillar.color }}
                    />
                    <span className="flex-1 text-sm text-gray-700">{pillar.label}</span>
                    <span className="text-sm font-semibold" style={{ color: pillar.color }}>
                      {pillar.score > 0 ? pillar.score.toFixed(1) : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Chart */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Maturity Radar
              </h4>
              <RadarChart scores={scores} size="sm" />
            </div>

            {/* Impact Dimensions */}
            <ImpactDimensions />
          </div>
        </div>

        {/* Maturity Legend */}
        <div className="mt-6">
          <MaturityLegend />
        </div>

        {/* Roadmap Preview */}
        <div className="mt-6">
          <RoadmapTimeline items={roadmapItems} />
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t pt-6 print:mt-4 print:pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-[var(--kweekers-accent)] px-3 py-2">
                <span className="text-xs font-semibold text-white">
                  Van Inzicht naar Impact
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Samen maken we het verschil.
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span>Mensen</span>
              <span>Technologie</span>
              <span>Strategie</span>
              <span>Impact</span>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Kwekers - Growing digital. Samen laten we organisaties groeien.
          </p>
        </footer>
      </main>
    </div>
  );
}
