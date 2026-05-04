"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useScanContext } from "@/app/context/ScanContext";
import { sections } from "@/lib/scan/definition/sections";
import {
  getNextQuestionKey,
  getOptionSet,
  getQuestion,
  getQuestionsForSection,
  getSection,
} from "@/lib/scan/engine/definition-helpers";

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isFilled(value: string): boolean {
  return value.trim() !== "";
}

export default function FlowQuestionPage() {
  const params = useParams<{
    id: string | string[];
    sectionCode: string | string[];
    questionKey: string | string[];
  }>();

  const scanId = getParam(params.id);
  const sectionCode = getParam(params.sectionCode);
  const questionKey = getParam(params.questionKey);

  const {
    scan,
    setCustomerName,
    setSector,
    setOrganizationSize,
    setAdministrationCount,
    setScanReason,
    setPrimaryGoal,
    setBiggestBottleneck,
    setScope,
  } = useScanContext();

  const section = getSection(sectionCode);
  const question = getQuestion(questionKey);
  const sectionQuestions = getQuestionsForSection(sectionCode);
  const optionSet = question?.optionSetKey
    ? getOptionSet(question.optionSetKey)
    : undefined;

  if (!section || !question || question.sectionCode !== sectionCode) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Vraag niet gevonden</h1>
        <p className="text-sm text-muted-foreground">
          Deze flowroute bestaat nog niet of hoort niet bij deze sectie.
        </p>
      </div>
    );
  }

  const questionIndex =
    sectionQuestions.findIndex((item) => item.key === question.key) + 1;

  const currentQuestionIndex = sectionQuestions.findIndex(
    (item) => item.key === question.key
  );

  const currentSectionIndex = sections.findIndex(
    (item) => item.code === sectionCode
  );

  const previousSection =
    currentSectionIndex > 0 ? sections[currentSectionIndex - 1] : null;

  const previousHref =
    currentQuestionIndex > 0
      ? `/scan/${scanId}/flow/${sectionCode}/${sectionQuestions[currentQuestionIndex - 1].key}`
      : previousSection?.summaryEnabled
        ? `/scan/${scanId}/summary/${previousSection.code}`
        : `/scan/${scanId}/summary/profile_basis`;

  const nextQuestionKey = getNextQuestionKey(sectionCode, questionKey);

  const nextHref = nextQuestionKey
    ? `/scan/${scanId}/flow/${sectionCode}/${nextQuestionKey}`
    : `/scan/${scanId}/summary/${sectionCode}`;

  const answerValue =
    questionKey === "customer_name"
      ? scan.profile.customerName
      : questionKey === "sector"
        ? scan.profile.sector
        : questionKey === "organization_size"
          ? scan.profile.organizationSize
          : questionKey === "administration_count"
            ? scan.profile.administrationCount
            : questionKey === "scan_reason"
              ? scan.profile.scanReason
              : questionKey === "primary_goal"
                ? scan.profile.primaryGoal
                : questionKey === "biggest_bottleneck"
                  ? scan.profile.biggestBottleneck
                  : questionKey === "scope"
                    ? scan.scope
                    : "";

  const setAnswerValue = (value: string) => {
    if (questionKey === "customer_name") {
      setCustomerName(value);
      return;
    }

    if (questionKey === "sector") {
      setSector(value);
      return;
    }

    if (questionKey === "organization_size") {
      setOrganizationSize(value);
      return;
    }

    if (questionKey === "administration_count") {
      setAdministrationCount(value);
      return;
    }

    if (questionKey === "scan_reason") {
      setScanReason(value);
      return;
    }

    if (questionKey === "primary_goal") {
      setPrimaryGoal(value);
      return;
    }

    if (questionKey === "biggest_bottleneck") {
      setBiggestBottleneck(value);
      return;
    }

    if (questionKey === "scope") {
      setScope(value);
    }
  };

  const canContinue = question.required ? isFilled(answerValue) : true;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {section.title} — stap {questionIndex} van {sectionQuestions.length}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {question.label}
        </h1>
        {question.helpText && (
          <p className="text-sm text-muted-foreground">{question.helpText}</p>
        )}
      </div>

      <section className="space-y-4 rounded-2xl border p-5">
        {question.inputType === "text" && (
          <div className="space-y-2">
            <label htmlFor={question.key} className="text-sm font-medium">
              {question.label}
            </label>
            <input
              id={question.key}
              type="text"
              value={answerValue}
              onChange={(event) => setAnswerValue(event.target.value)}
              placeholder={question.placeholder}
              className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
            />
          </div>
        )}

        {question.inputType === "single_select" && optionSet && (
          <div className="grid gap-3 sm:grid-cols-2">
            {[...optionSet.options]
              .sort((a, b) => a.order - b.order)
              .map((option) => {
                const isActive = answerValue === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAnswerValue(option.value)}
                    aria-pressed={isActive}
                    className={
                      isActive
                        ? "kweekers-active-panel rounded-2xl border px-4 py-4 text-left transition"
                        : "kweekers-selectable-hover rounded-2xl border bg-white px-4 py-4 text-left transition"
                    }
                  >
                    <div className="text-sm font-medium">{option.label}</div>
                    {option.description && (
                      <div className="mt-2 text-xs text-current/80">
                        {option.description}
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        )}

        {!canContinue && (
          <div className="kweekers-accent-box text-sm">
            Vul eerst deze vraag in om verder te gaan.
          </div>
        )}
      </section>

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
