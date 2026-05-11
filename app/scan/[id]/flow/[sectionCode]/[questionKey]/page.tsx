"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
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

function RequiredAsterisk() {
  return <span className="kweekers-required ml-1">*</span>;
}

function OptionLabelWithTooltip({
  label,
}: {
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-center">
      <span className="text-[13px] font-semibold leading-5">{label}</span>
    </div>
  );
}

function OptionTooltip({
  description,
}: {
  description?: string;
}) {
  if (!description) return null;

  return (
    <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 hidden w-[220px] -translate-x-1/2 rounded-lg border border-black/10 bg-white/95 px-3 py-2 text-left text-[11px] font-normal leading-4 text-neutral-700 shadow-[0_8px_24px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.03] group-hover:block group-focus-within:block">
      {description}
    </span>
  );
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

const PROFILE_BASIS_OVERVIEW_KEYS = [
  "customer_name",
  "sector",
  "organization_size",
  "administration_count",
  "organization_type",
  "afas_usage_duration",
  "maintenance_quality",
  "expected_org_changes",
] as const;

const PROFILE_BASIS_SKIPPED_KEYS = [
  "sector",
  "organization_size",
  "administration_count",
  "organization_type",
  "afas_usage_duration",
  "maintenance_quality",
  "expected_org_changes",
] as const;

function isProfileBasisOverviewRoute(sectionCode: string, questionKey: string) {
  return sectionCode === "profile_basis" && questionKey === "customer_name";
}

function isSkippedProfileBasisRoute(sectionCode: string, questionKey: string) {
  return (
    sectionCode === "profile_basis" &&
    PROFILE_BASIS_SKIPPED_KEYS.includes(
      questionKey as (typeof PROFILE_BASIS_SKIPPED_KEYS)[number]
    )
  );
}

function getProfileBasisCompactStepIndex(questionKey: string): number {
  switch (questionKey) {
    case "customer_name":
      return 1;
    case "afas_products":
      return 2;
    case "ownership_model":
      return 3;
    case "standardization_context":
      return 4;
    case "primary_process_chains":
      return 5;
    default:
      return 1;
  }
}

function getBaseOptionButtonClass(disabled: boolean) {
  if (disabled) {
    return "justify-self-center w-[320px] min-h-[52px] rounded-xl border border-black/15 bg-white px-3 py-2 text-center opacity-40";
  }

  return "justify-self-center w-[320px] min-h-[52px] rounded-xl border border-black/15 bg-white px-3 py-2 text-center transition hover:bg-black/[0.02]";
}

function getActiveOptionButtonClass() {
  return "justify-self-center w-[320px] min-h-[52px] rounded-xl border border-[#db5f34] bg-[#3f4e87] px-3 py-2 text-center text-white shadow-sm transition ring-1 ring-[#f2c2ae]";
}

export default function FlowQuestionPage() {
  const params = useParams<{
    id: string | string[];
    sectionCode: string | string[];
    questionKey: string | string[];
  }>();
  const router = useRouter();
  const pathname = usePathname();

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
    setAfasUsageDuration,
    setMaintenanceQuality,
    setExpectedOrgChanges,
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
    setFinanceStrategicPressure,
    setFinanceFoundationReliability,
    setFinanceExceptionHandling,
    setFinanceReportingMaturity,
    setOrderStrategicPressure,
    setOrderFlowStandardization,
    setOrderExceptionComplexity,
    setOrderSystemFit,
    setCrmStrategicPressure,
    setCrmProcessMaturity,
    setCrmDataQuality,
    setCrmReportingUsefulness,
    setHrmStrategicPressure,
    setHrmProcessMaturity,
    setHrmDataQuality,
    setReportingStrategicPressure,
    setReportingDefinitionConsistency,
    setReportingUsefulness,
    setIntegrationStrategicPressure,
    setIntegrationStability,
    setIntegrationOwnership,
    setIntegrationMonitoringMaturity,
    setCareRegistrationExceptions,
    setCareAccountabilityPressure,
    setEducationIntakePlanningConsistency,
    setEducationProcessAdminAlignment,
    setEducationExceptionHandling,
    setComment,
    markSectionVisited,
  } = useScanContext();

  const section = getSection(sectionCode);
  const question = getQuestion(questionKey);
  const sectionQuestions = getQuestionsForSection(sectionCode, scan);
  const optionSet = question?.optionSetKey
    ? getOptionSet(question.optionSetKey)
    : undefined;

  const isProfileBasisOverview = isProfileBasisOverviewRoute(
    sectionCode,
    questionKey
  );
  const shouldRedirectSkippedProfileBasis = isSkippedProfileBasisRoute(
    sectionCode,
    questionKey
  );

  useEffect(() => {
    if (shouldRedirectSkippedProfileBasis) {
      router.replace(`/scan/${scanId}/flow/profile_basis/customer_name`);
    }
  }, [shouldRedirectSkippedProfileBasis, router, scanId]);

  useEffect(() => {
    if (!pathname) return;
    if (!sectionCode) return;
    if (shouldRedirectSkippedProfileBasis) return;

    markSectionVisited(sectionCode, pathname);
  }, [
    pathname,
    sectionCode,
    shouldRedirectSkippedProfileBasis,
    markSectionVisited,
  ]);

  if (shouldRedirectSkippedProfileBasis) {
    return null;
  }

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

  const currentSectionIndex = sections.findIndex(
    (item) => item.code === sectionCode
  );

  const previousSection =
    currentSectionIndex > 0 ? sections[currentSectionIndex - 1] : null;

  const previousSectionQuestions = previousSection
    ? getQuestionsForSection(previousSection.code, scan)
    : [];

  let questionIndex = currentQuestionIndex + 1;
  let questionTotal = sectionQuestions.length;

  if (sectionCode === "profile_basis") {
    questionIndex = getProfileBasisCompactStepIndex(questionKey);
    questionTotal = 5;
  }

  const previousQuestion =
    [...sectionQuestions]
      .slice(0, currentQuestionIndex)
      .reverse()
      .find(
        (item) =>
          !(
            sectionCode === "profile_basis" &&
            PROFILE_BASIS_SKIPPED_KEYS.includes(
              item.key as (typeof PROFILE_BASIS_SKIPPED_KEYS)[number]
            )
          )
      ) ?? null;

  let previousHref =
    previousQuestion
      ? `/scan/${scanId}/flow/${sectionCode}/${previousQuestion.key}`
      : previousSection && previousSectionQuestions.length > 0
        ? `/scan/${scanId}/flow/${previousSection.code}/${previousSectionQuestions[previousSectionQuestions.length - 1].key}`
        : `/scan/${scanId}/flow/profile_basis/customer_name`;

  if (isProfileBasisOverview) {
    previousHref = `/scan/${scanId}/flow/profile_basis/customer_name`;
  }

  if (sectionCode === "profile_basis" && questionKey === "afas_products") {
    previousHref = `/scan/${scanId}/flow/profile_basis/customer_name`;
  }

  const nextQuestion =
    sectionQuestions
      .slice(currentQuestionIndex + 1)
      .find(
        (item) =>
          !(
            sectionCode === "profile_basis" &&
            PROFILE_BASIS_SKIPPED_KEYS.includes(
              item.key as (typeof PROFILE_BASIS_SKIPPED_KEYS)[number]
            )
          )
      ) ?? null;

  const nextSection = section.nextSectionCode
    ? getSection(section.nextSectionCode)
    : undefined;

  const nextSectionQuestions = nextSection
    ? getQuestionsForSection(nextSection.code, scan)
    : [];

  let nextHref = `/scan/${scanId}/summary/advies`;

  if (isProfileBasisOverview) {
    nextHref = `/scan/${scanId}/flow/profile_basis/afas_products`;
  } else if (nextQuestion) {
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

  const setterBag = {
    setCustomerName,
    setSector,
    setOrganizationSize,
    setAdministrationCount,
    setOrganizationType,
    setAfasProducts,
    setOwnershipModel,
    setAfasUsageDuration,
    setMaintenanceQuality,
    setExpectedOrgChanges,
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
    setFinanceStrategicPressure,
    setFinanceFoundationReliability,
    setFinanceExceptionHandling,
    setFinanceReportingMaturity,
    setOrderStrategicPressure,
    setOrderFlowStandardization,
    setOrderExceptionComplexity,
    setOrderSystemFit,
    setCrmStrategicPressure,
    setCrmProcessMaturity,
    setCrmDataQuality,
    setCrmReportingUsefulness,
    setHrmStrategicPressure,
    setHrmProcessMaturity,
    setHrmDataQuality,
    setReportingStrategicPressure,
    setReportingDefinitionConsistency,
    setReportingUsefulness,
    setIntegrationStrategicPressure,
    setIntegrationStability,
    setIntegrationOwnership,
    setIntegrationMonitoringMaturity,
    setCareRegistrationExceptions,
    setCareAccountabilityPressure,
    setEducationIntakePlanningConsistency,
    setEducationProcessAdminAlignment,
    setEducationExceptionHandling,
  };

  const setFieldValue = (fieldKey: string, value: AnswerValue) => {
    setAnswerToScan(setterBag, fieldKey, value);
    setShowValidation(false);
  };

  const setAnswerValue = (value: AnswerValue) => {
    setFieldValue(questionKey, value);
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

  const shortHelpText = isProfileBasisOverview
    ? "We leggen eerst de belangrijkste basisgegevens van de organisatie vast."
    : getShortHelpText(question.label, question.helpText);

  const groupedOptions =
    question.key === "afas_products" && optionSet
      ? AFAS_PRODUCT_GROUPS.map((group) => ({
          title: group.title,
          options: group.values
            .map((value) =>
              optionSet.options.find((option) => option.value === value)
            )
            .filter(
              (option): option is NonNullable<typeof option> => Boolean(option)
            ),
        })).filter((group) => group.options.length > 0)
      : [];

  const selectedLabels =
    question.key === "afas_products" && optionSet
      ? answerArray
          .map(
            (value) =>
              optionSet.options.find((option) => option.value === value)?.label ??
              value
          )
          .filter(Boolean)
      : [];

  const profileOverviewValues = {
    customer_name: getAnswerFromScan(scan, "customer_name"),
    sector: getAnswerFromScan(scan, "sector"),
    organization_size: getAnswerFromScan(scan, "organization_size"),
    administration_count: getAnswerFromScan(scan, "administration_count"),
    organization_type: getAnswerFromScan(scan, "organization_type"),
    afas_usage_duration: getAnswerFromScan(scan, "afas_usage_duration"),
    maintenance_quality: getAnswerFromScan(scan, "maintenance_quality"),
    expected_org_changes: getAnswerFromScan(scan, "expected_org_changes"),
  };

  const profileOverviewComplete = PROFILE_BASIS_OVERVIEW_KEYS.every((key) =>
    isFilled(profileOverviewValues[key])
  );

  const canContinue = isProfileBasisOverview
    ? profileOverviewComplete
    : question.required
      ? isFilled(answerValue)
      : true;

  const renderSingleSelectGrid = (
    optionSetKey: string,
    currentValue: string,
    onSelect: (value: string) => void
  ) => {
    const currentOptionSet = getOptionSet(optionSetKey);
    if (!currentOptionSet) return null;

    return (
      <div className="grid gap-2 sm:grid-cols-2 justify-items-center">
        {[...currentOptionSet.options]
          .sort((a, b) => a.order - b.order)
          .map((option) => {
            const isActive = currentValue === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                aria-pressed={isActive}
                className={`group relative ${
                  isActive
                    ? getActiveOptionButtonClass()
                    : getBaseOptionButtonClass(false)
                }`}
              >
                <OptionLabelWithTooltip
                  label={option.label}
                  description={option.description}
                />
                <OptionTooltip description={option.description} />
              </button>
            );
          })}
      </div>
    );
  };

  const handleNext = () => {
    if (!canContinue) {
      setShowValidation(true);
      return;
    }

    router.push(nextHref);
  };

  const title = isProfileBasisOverview ? "Basis van de organisatie" : question.label;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Stap {questionIndex} van {questionTotal}
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
        </div>

        <p className="max-w-2xl text-sm text-muted-foreground">
          {shortHelpText}
        </p>
      </div>

      {showValidation && !canContinue && (
        <div className="kweekers-accent-box text-sm">
          {isProfileBasisOverview
            ? "Vul eerst alle basisvelden in om verder te gaan."
            : "Kies eerst een antwoord om verder te gaan."}
        </div>
      )}

      <section className="space-y-4 rounded-3xl border border-black/10 bg-[#fafafa] p-4 sm:p-5">
        {isProfileBasisOverview ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="customer_name" className="text-sm font-medium">
                Klantnaam
                <RequiredAsterisk />
              </label>
              <input
                id="customer_name"
                type="text"
                value={asString(profileOverviewValues.customer_name)}
                onChange={(event) =>
                  setFieldValue("customer_name", event.target.value)
                }
                placeholder="Bijvoorbeeld: Janssen BV"
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">
                Sector
                <RequiredAsterisk />
              </div>
              {renderSingleSelectGrid(
                "sector_options",
                asString(profileOverviewValues.sector),
                (value) => setFieldValue("sector", value)
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">
                Organisatiegrootte
                <RequiredAsterisk />
              </div>
              {renderSingleSelectGrid(
                "organization_size_options",
                asString(profileOverviewValues.organization_size),
                (value) => setFieldValue("organization_size", value)
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">
                Aantal administraties / entiteiten
                <RequiredAsterisk />
              </div>
              {renderSingleSelectGrid(
                "administration_count_options",
                asString(profileOverviewValues.administration_count),
                (value) => setFieldValue("administration_count", value)
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">
                Type organisatie en operatie
                <RequiredAsterisk />
              </div>

              <div className="grid gap-2 sm:grid-cols-2 justify-items-center">
                {[...(getOptionSet("organization_type_options")?.options ?? [])]
                  .sort((a, b) => a.order - b.order)
                  .map((option) => {
                    const currentValues = Array.isArray(
                      profileOverviewValues.organization_type
                    )
                      ? profileOverviewValues.organization_type
                      : [];

                    const isActive = currentValues.includes(option.value);
                    const maxSelections = 3;
                    const disableNewSelection =
                      !isActive && currentValues.length >= maxSelections;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          if (!isActive && currentValues.length >= maxSelections) {
                            return;
                          }

                          const nextValues = isActive
                            ? currentValues.filter((value) => value !== option.value)
                            : [...currentValues, option.value];

                          setFieldValue("organization_type", nextValues);
                        }}
                        aria-pressed={isActive}
                        disabled={disableNewSelection}
                        className={`group relative ${
                          isActive
                            ? getActiveOptionButtonClass()
                            : getBaseOptionButtonClass(disableNewSelection)
                        }`}
                      >
                        <OptionLabelWithTooltip
                          label={option.label}
                          description={option.description}
                        />
                        <OptionTooltip description={option.description} />
                      </button>
                    );
                  })}
              </div>

              <p className="text-sm text-muted-foreground">
                Gekozen:{" "}
                {Array.isArray(profileOverviewValues.organization_type)
                  ? profileOverviewValues.organization_type.length
                  : 0}{" "}
                van maximaal 3
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">
                Sinds wanneer gebruikt de organisatie AFAS?
                <RequiredAsterisk />
              </div>
              {renderSingleSelectGrid(
                "afas_usage_duration_options",
                asString(profileOverviewValues.afas_usage_duration),
                (value) => setFieldValue("afas_usage_duration", value)
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">
                Hoe goed is de inrichting de afgelopen jaren onderhouden?
                <RequiredAsterisk />
              </div>
              {renderSingleSelectGrid(
                "maintenance_quality_options",
                asString(profileOverviewValues.maintenance_quality),
                (value) => setFieldValue("maintenance_quality", value)
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">
                Worden in de komende jaren fusies, overnames of afsplitsingen verwacht?
                <RequiredAsterisk />
              </div>
              {renderSingleSelectGrid(
                "expected_org_changes_options",
                asString(profileOverviewValues.expected_org_changes),
                (value) => setFieldValue("expected_org_changes", value)
              )}
            </div>
          </div>
        ) : (
          <>
            {question.inputType === "text" && (
              <div className="space-y-2">
                <label htmlFor={question.key} className="text-sm font-medium">
                  Antwoord
                  {question.required && <RequiredAsterisk />}
                </label>
                <input
                  id={question.key}
                  type="text"
                  value={answerString}
                  onChange={(event) => setAnswerValue(event.target.value)}
                  placeholder={question.placeholder}
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 outline-none"
                />
              </div>
            )}

            {question.inputType === "single_select" && optionSet && (
              <div className="grid gap-2 sm:grid-cols-2 justify-items-center">
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
                        className={`group relative ${
                          isActive
                            ? getActiveOptionButtonClass()
                            : getBaseOptionButtonClass(false)
                        }`}
                      >
                        <OptionLabelWithTooltip
                          label={option.label}
                          description={option.description}
                        />
                        <OptionTooltip description={option.description} />
                      </button>
                    );
                  })}
              </div>
            )}

            {question.inputType === "multi_select" &&
              optionSet &&
              question.key !== "afas_products" && (
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2 justify-items-center">
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
                            className={`group relative ${
                              isActive
                                ? getActiveOptionButtonClass()
                                : getBaseOptionButtonClass(disableNewSelection)
                            }`}
                          >
                            <OptionLabelWithTooltip
                              label={option.label}
                              description={option.description}
                            />
                            <OptionTooltip description={option.description} />
                          </button>
                        );
                      })}
                  </div>

                  {typeof question.maxSelections === "number" && (
                    <p className="text-sm text-muted-foreground">
                      Gekozen: {answerArray.length} van maximaal{" "}
                      {question.maxSelections}
                    </p>
                  )}
                </div>
              )}

            {question.inputType === "multi_select" &&
              optionSet &&
              question.key === "afas_products" && (
                <div className="space-y-5">
                  {selectedLabels.length > 0 && (
                    <div className="kweekers-help-box rounded-xl p-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Gekozen
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedLabels.map((label) => (
                          <span key={label} className="kweekers-chip-selected">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {groupedOptions.map((group) => (
                    <div key={group.title} className="space-y-2">
                      <div className="border-b border-black/10 pb-1 text-sm font-semibold text-black">
                        {group.title}
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 justify-items-center">
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
                              className={`group relative ${
                                isActive
                                  ? getActiveOptionButtonClass()
                                  : getBaseOptionButtonClass(disableNewSelection)
                              }`}
                            >
                              <OptionLabelWithTooltip
                                label={option.label}
                                description={option.description}
                              />
                              <OptionTooltip description={option.description} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {typeof question.maxSelections === "number" && (
                    <p className="text-sm text-muted-foreground">
                      Gekozen: {answerArray.length} van maximaal{" "}
                      {question.maxSelections}
                    </p>
                  )}
                </div>
              )}

            {question.examples &&
              question.examples.length > 0 &&
              !optionSet?.options?.some((option) => option.description) && (
                <div className="kweekers-help-box rounded-xl p-3">
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
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 outline-none"
                />
                <p className="text-xs text-muted-foreground">
                  Deze opmerking kan later worden meegenomen in samenvatting of
                  rapportage.
                </p>
              </div>
            )}
          </>
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
