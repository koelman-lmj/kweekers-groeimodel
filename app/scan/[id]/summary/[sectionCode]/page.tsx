"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useScanContext } from "@/app/context/ScanContext";
import {
  getOptionSet,
  getQuestionsForSection,
  getSection,
} from "@/lib/scan/engine/definition-helpers";

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getAnswerValue(
  questionKey: string,
  scan: ReturnType<typeof useScanContext>["scan"]
): string {
  if (questionKey === "customer_name") return scan.profile.customerName;
  if (questionKey === "sector") return scan.profile.sector;
  if (questionKey === "organization_size") return scan.profile.organizationSize;
  if (questionKey === "administration_count") return scan.profile.administrationCount;

  if (questionKey === "scan_reason") return scan.profile.scanReason;
  if (questionKey === "primary_goal") return scan.profile.primaryGoal;
  if (questionKey === "biggest_bottleneck") return scan.profile.biggestBottleneck;

  if (questionKey === "scope") return scan.scope;

  if (questionKey === "ownership") return scan.diagnosis.ownership;
  if (questionKey === "afas_usage") return scan.diagnosis.afasUsage;
  if (questionKey === "reporting") return scan.diagnosis.reporting;

  return "";
}

export default function SectionSummaryPage() {
  const params = useParams<{
    id: string | string[];
    sectionCode: string | string[];
  }>();

  const scanId = getParam(params.id);
  const sectionCode = getParam(params.sectionCode);

  const { scan } = useScanContext();

  const section = getSection(sectionCode);
  const questions = getQuestionsForSection(sectionCode);

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
      : `/scan/${scanId}`;

  const nextSectionCode = section?.nextSectionCode ?? "";
  const nextSectionQuestions = nextSectionCode
    ? getQuestionsForSection(nextSectionCode)
    : [];
  const nextQuestionKey = nextSectionQuestions[0]?.key ?? "";

  const nextHref =
    nextSectionCode && nextQuestionKey
      ? `/scan/${scanId}/flow/${nextSectionCode}/${nextQuestionKey}`
      : `/scan/${scanId}`;

  const canContinue = questions.every((question) => {
    if (!question.required) return true;
    return getAnswerValue(question.key, scan).trim() !== "";
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {section.title} — samenvatting
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Samenvatting</h1>
        <p className="text-sm text-muted-foreground">
          Controleer of de ingevulde gegevens goed zijn ingevuld.
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Overzicht</h2>

        <div className="space-y-2 text-sm text-muted-foreground">
          {questions.map((question) => {
            const rawValue = getAnswerValue(question.key, scan);
            const optionSet = getOptionSet(question.optionSetKey);

            let displayValue = rawValue || "Nog niet ingevuld";

            if (optionSet && rawValue) {
              displayValue =
                optionSet.options.find((option) => option.value === rawValue)?.label ??
                rawValue;
            }

            return (
              <div key={question.key}>
                {question.label}: {displayValue}
              </div>
            );
          })}
        </div>
      </section>

      {!canContinue && (
        <div className="kweekers-accent-box text-sm">
          Nog niet alle verplichte vragen zijn ingevuld.
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-6">
        <Link
          href={previousHref}
          className="rounded-2xl border px-5 py-3 text-sm font-medium"
        >
          Vorige
        </Link>

        {canContinue ? (
          <Link href={nextHref} className="kweekers-primary-button">
            Verder →
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center rounded-2xl border px-5 py-3 text-sm font-medium text-muted-foreground opacity-60"
          >
            Verder →
          </span>
        )}
      </div>
    </div>
  );
}
