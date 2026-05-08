"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useScanContext } from "@/app/context/ScanContext";
import { sections } from "@/lib/scan/definition/sections";
import {
  getOptionSet,
  getQuestion,
  getQuestionsForSection,
  getSection,
} from "@/lib/scan/engine/definition-helpers";
import {
  getAnswerFromScan,
  setAnswerToScan,
  type AnswerValue,
} from "@/lib/scan/engine/answer-mapping";

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isFilled(value: AnswerValue): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value.trim() !== "";
}

function asArray(value: AnswerValue): string[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: AnswerValue): string {
  return typeof value === "string" ? value : "";
}

function getShortHelpText(questionLabel: string, helpText?: string): string {
  if (!helpText) {
    return `Kies wat het best past bij ${questionLabel.toLowerCase()}.`;
  }

  return helpText;
}

type OptionGroup = {
  title: string;
  values: string[];
};

const AFAS_PRODUCT_GROUPS: OptionGroup[] = [
  {
    title: "ALGEMEEN",
    values: [
      "autorisatie",
      "integraties",
      "insite",
      "outsite",
      "rapportage_dashboards",
      "workflow",
      "dossier_documentbeheer",
      "overig",
    ],
  },
  {
    title: "ERP",
    values: [
      "crm",
      "financieel",
      "inkoop",
      "projecten",
      "abonnementen",
      "ordermanagement",
    ],
  },
  {
    title: "HRM/Payroll",
    values: ["hrm", "payroll", "verlof_verzuim", "declaraties"],
  },
];

function getBaseOptionButtonClass(disabled: boolean) {
  if (disabled) {
    return "min-h-[72px] rounded-2xl border border-black/15 bg-white px-4 py-3 text-center opacity-40";
  }

  return "min-h-[72px] rounded-2xl border border-black/15 bg-white px-4 py-3 text-center transition hover:bg-black/[0.02]";
}

function getActiveOptionButtonClass() {
  return "min-h-[72px] rounded-2xl border border-[#2f426a] bg-[#3d4a78] px-4 py-3 text-center text-white shadow-sm transition";
}

export default function FlowQuestionPage() {
  const params = useParams<{
    id: string | string[];
    sectionCode: string | string[];
    questionKey: string | string[];
  }>();
  const router = useRouter();

  const scanId = getParam(params.id);
  const sectionCode = getParam(params.sectionCode);
  const questionKey = getParam(params.questionKey);

  const {
    scan,
    setCustomerName,
    setSector,
    setOrganizationSize,
    setAdministrationCount,
    setOrganizationType,
    setAfasProducts,
    setOwnershipModel,
    setStandardizationContext,
    setPrimaryProcessChains,
    setScanReason,
    setBiggestBottleneck,
    setScopeWidth,
    setScopeFocus,
    setScopeDepth,
    setOwnershipClarity,
    setChangeDecisionProcess,
    setImprovementGovernance,
    setProcessStandardization,
    setExceptionControl,
    setIssueResolution,
    setFinanceFoundationReliability,
    setFinanceExceptionHandling,
    setFinanceReportingMaturity,
    setOrderFlowStandardization,
    setOrderExceptionComplexity,
    setOrderSystemFit,
    setCareRegistrationExceptions,
    setCareAccountabilityPressure,
    setEducationIntakePlanningConsistency,
    setEducationProcessAdminAlignment,
    setEducationExceptionHandling,
    setComment,
  } = useScanContext();

  const section = getSection(sectionCode);
  const question = getQuestion(questionKey);
  const sectionQuestions = getQuestionsForSection(sectionCode, scan);
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

  const currentQuestionIndex = sectionQuestions.findIndex(
    (item) => item.key === question.key
  );

  if (currentQuestionIndex === -1) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Vraag niet beschikbaar</h1>
        <p className="text-sm text-muted-foreground">
          Deze vraag is op basis van de huidige keuzes niet zichtbaar in de flow.
        </p>
      </div>
    );
  }

  const questionIndex = currentQuestionIndex + 1;

  const currentSectionIndex = sections.findIndex(
    (item) => item.code === sectionCode
  );

  const previousSection =
    currentSectionIndex > 0 ? sections[currentSectionIndex - 1] : null;

  const previousSectionQuestions = previousSection
    ? getQuestionsForSection(previousSection.code, scan)
    : [];

  const previousHref =
    currentQuestionIndex > 0
      ? `/scan/${scanId}/flow/${sectionCode}/${sectionQuestions[currentQuestionIndex - 1].key}`
      : previousSection && previousSectionQuestions.length > 0
        ? `/scan/${scanId}/flow/${previousSection.code}/${previousSectionQuestions[previousSectionQuestions.length - 1].key}`
        : `/scan/${scanId}/flow/profile_basis/customer_name`;

  const nextQuestion = sectionQuestions[currentQuestionIndex + 1];
  const nextSection = section.nextSectionCode
    ? getSection(section.nextSectionCode)
    : undefined;
  const nextSectionQuestions = nextSection
    ? getQuestionsForSection(nextSection.code, scan)
    : [];

  let nextHref = `/scan/${scanId}/summary/advies`;

  if (nextQuestion) {
    nextHref = `/scan/${scanId}/flow/${sectionCode}/${nextQuestion.key}`;
  } else if (nextSection && nextSectionQuestions.length > 0) {
    nextHref = `/scan/${scanId}/flow/${nextSection.code}/${nextSectionQuestions[0].key}`;
  } else {
    nextHref = `/scan/${scanId}/summary/advies`;
  }

  const answerValue = getAnswerFromScan(scan, questionKey);
  const answerArray = asArray(answerValue);
  const answerString = asString(answerValue);
  const commentValue = scan.comments[questionKey] ?? "";
  const [showValidation, setShowValidation] = useState(false);

  const setAnswerValue = (value: AnswerValue) => {
    setAnswerToScan(
      {
        setCustomerName,
        setSector,
        setOrganizationSize,
        setAdministrationCount,
        setOrganizationType,
        setAfasProducts,
        setOwnershipModel,
        setStandardizationContext,
        setPrimaryProcessChains,
        setScanReason,
        setBiggestBottleneck,
        setScopeWidth,
        setScopeFocus,
        setScopeDepth,
        setOwnershipClarity,
        setChangeDecisionProcess,
        setImprovementGovernance,
        setProcessStandardization,
        setExceptionControl,
        setIssueResolution,
        setFinanceFoundationReliability,
        setFinanceExceptionHandling,
        setFinanceReportingMaturity,
        setOrderFlowStandardization,
        setOrderExceptionComplexity,
        setOrderSystemFit,
        setCareRegistrationExceptions,
        setCareAccountabilityPressure,
        setEducationIntakePlanningConsistency,
        setEducationProcessAdminAlignment,
        setEducationExceptionHandling,
      },
      questionKey,
      value
    );

    setShowValidation(false);
  };

  const toggleMultiSelectValue = (optionValue: string) => {
    const currentValues = answerArray;
    const isSelected = currentValues.includes(optionValue);
    const maxSelections = question.maxSelections ?? Number.POSITIVE_INFINITY;

    let nextValues: string[];

    if (isSelected) {
      nextValues = currentValues.filter((value) => value !== optionValue);
    } else {
      if (currentValues.length >= maxSelections) {
        return;
      }

      nextValues = [...currentValues, optionValue];
    }

    setAnswerValue(nextValues);
  };

  const setCommentValue = (value: string) => {
    setComment(questionKey, value);
  };

  const canContinue = question.required ? isFilled(answerValue) : true;
  const shortHelpText = getShortHelpText(question.label, question.helpText);

  const groupedOptions =
    question.key === "afas_products" && optionSet
      ? AFAS_PRODUCT_GROUPS.map((group) => ({
          title: group.title,
          options: group.values
            .map((value) =>
              optionSet.options.find((option) => option.value === value)
            )
            .filter((option): option is NonNullable<typeof option> => Boolean(option)),
        })).filter((group) => group.options.length > 0)
      : [];

  const handleNext = () => {
    if (!canContinue) {
      setShowValidation(true);
      return;
    }

    router.push(nextHref);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Stap {questionIndex} van {sectionQuestions.length}
          </p>

          <h1 className="text-5xl font-semibold tracking-tight">
            {question.label}
          </h1>
        </div>

        <p className="max-w-2xl text-sm text-muted-foreground">
          {shortHelpText}
        </p>
      </div>

      {showValidation && !canContinue && (
        <div className="kweekers-accent-box text-sm">
          Kies eerst een antwoord om verder te gaan.
        </div>
      )}

      <section className="space-y-5 rounded-3xl border border-black/10 bg-[#fafafa] p-5">
        {question.inputType === "text" && (
          <div className="space-y-2">
            <label htmlFor={question.key} className="text-sm font-medium">
              Antwoord
            </label>
            <input
              id={question.key}
              type="text"
              value={answerString}
              onChange={(event) => setAnswerValue(event.target.value)}
              placeholder={question.placeholder}
              className="w-full rounded-2xl border border-black/15 bg-white px-4 py-3 outline-none"
            />
          </div>
        )}

        {question.inputType === "single_select" && optionSet && (
          <div className="grid gap-3 sm:grid-cols-2">
            {[...optionSet.options]
              .sort((a, b) => a.order - b.order)
              .map((option) => {
                const isActive = answerString === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAnswerValue(option.value)}
                    aria-pressed={isActive}
                    className={
                      isActive
                        ? getActiveOptionButtonClass()
                        : getBaseOptionButtonClass(false)
                    }
                  >
                    <div className="text-sm font-semibold">{option.label}</div>
                    {option.description && (
                      <div className="mt-1 text-xs text-current/80">
                        {option.description}
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        )}

        {question.inputType === "multi_select" &&
          optionSet &&
          question.key !== "afas_products" && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[...optionSet.options]
                  .sort((a, b) => a.order - b.order)
                  .map((option) => {
                    const isActive = answerArray.includes(option.value);
                    const maxSelections =
                      question.maxSelections ?? Number.POSITIVE_INFINITY;
                    const disableNewSelection =
                      !isActive && answerArray.length >= maxSelections;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleMultiSelectValue(option.value)}
                        aria-pressed={isActive}
                        disabled={disableNewSelection}
                        className={
                          isActive
                            ? getActiveOptionButtonClass()
                            : getBaseOptionButtonClass(disableNewSelection)
                        }
                      >
                        <div className="text-sm font-semibold">{option.label}</div>
                        {option.description && (
                          <div className="mt-1 text-xs text-current/80">
                            {option.description}
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>

              {typeof question.maxSelections === "number" && (
                <p className="text-sm text-muted-foreground">
                  Gekozen: {answerArray.length} van maximaal {question.maxSelections}
                </p>
              )}
            </div>
          )}

        {question.inputType === "multi_select" &&
          optionSet &&
          question.key === "afas_products" && (
            <div className="space-y-6">
              {groupedOptions.map((group) => (
                <div key={group.title} className="space-y-3">
                  <div className="border-b border-black/10 pb-1 text-sm font-semibold text-black">
                    {group.title}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.options.map((option) => {
                      const isActive = answerArray.includes(option.value);
                      const maxSelections =
                        question.maxSelections ?? Number.POSITIVE_INFINITY;
                      const disableNewSelection =
                        !isActive && answerArray.length >= maxSelections;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleMultiSelectValue(option.value)}
                          aria-pressed={isActive}
                          disabled={disableNewSelection}
                          className={
                            isActive
                              ? getActiveOptionButtonClass()
                              : getBaseOptionButtonClass(disableNewSelection)
                          }
                        >
                          <div className="text-sm font-semibold">{option.label}</div>
                          {option.description && (
                            <div className="mt-1 text-xs text-current/80">
                              {option.description}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {typeof question.maxSelections === "number" && (
                <p className="text-sm text-muted-foreground">
                  Gekozen: {answerArray.length} van maximaal {question.maxSelections}
                </p>
              )}
            </div>
          )}

        {question.examples && question.examples.length > 0 && (
          <div className="rounded-2xl border border-black/10 bg-white/80 p-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Hulp bij deze vraag
            </div>
            <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
              {question.examples.map((example) => (
                <li key={example} className="ml-5 list-disc">
                  {example}
                </li>
              ))}
            </ul>
          </div>
        )}

        {question.allowsComment && (
          <div className="space-y-2 border-t border-black/10 pt-4">
            <label
              htmlFor={`${question.key}-comment`}
              className="text-sm font-medium"
            >
              Opmerking
            </label>
            <textarea
              id={`${question.key}-comment`}
              value={commentValue}
              onChange={(event) => setCommentValue(event.target.value)}
              placeholder="Bijvoorbeeld: dit verschilt per team of is nog niet formeel belegd."
              rows={4}
              className="w-full rounded-2xl border border-black/15 bg-white px-4 py-3 outline-none"
            />
            <p className="text-xs text-muted-foreground">
              Deze opmerking kan later worden meegenomen in samenvatting of
              rapportage.
            </p>
          </div>
        )}
      </section>

      <div className="flex items-center justify-between border-t pt-6">
        <Link
          href={previousHref}
          className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-semibold"
        >
          Vorige
        </Link>

        <button
          type="button"
          onClick={handleNext}
          className={
            canContinue
              ? "kweekers-primary-button font-semibold"
              : "inline-flex items-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-semibold text-muted-foreground opacity-60"
          }
        >
          Verder →
        </button>
      </div>
    </div>
  );
}
