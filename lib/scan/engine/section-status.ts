import type { ScanState } from "@/app/context/ScanContext";
import { sections } from "@/lib/scan/definition/sections";
import { getQuestionsForSection } from "@/lib/scan/engine/definition-helpers";
import { getAnswerFromScan } from "@/lib/scan/engine/answer-mapping";

export type SectionUiStatus =
  | "completed"
  | "current"
  | "available"
  | "locked";

export function isSectionComplete(
  sectionCode: string,
  scan: ScanState
): boolean {
  const questions = getQuestionsForSection(sectionCode);

  if (questions.length === 0) return false;

  return questions.every((question) => {
    if (!question.required) return true;
    return getAnswerFromScan(scan, question.key).trim() !== "";
  });
}

export function getSectionStatuses(
  currentSectionCode: string,
  scan: ScanState
): Record<string, SectionUiStatus> {
  const orderedSections = [...sections].sort((a, b) => a.order - b.order);

  const firstIncompleteIndex = orderedSections.findIndex(
    (section) => !isSectionComplete(section.code, scan)
  );

  const effectiveCurrentIndex =
    firstIncompleteIndex === -1
      ? orderedSections.findIndex((section) => section.code === currentSectionCode)
      : firstIncompleteIndex;

  const result: Record<string, SectionUiStatus> = {};

  orderedSections.forEach((section, index) => {
    const isComplete = isSectionComplete(section.code, scan);
    const isCurrentRoute = section.code === currentSectionCode;

    if (isComplete) {
      result[section.code] = "completed";
      return;
    }

    if (index === effectiveCurrentIndex || isCurrentRoute) {
      result[section.code] = "current";
      return;
    }

    if (index < effectiveCurrentIndex) {
      result[section.code] = "available";
      return;
    }

    if (index === effectiveCurrentIndex + 1) {
      result[section.code] = "available";
      return;
    }

    result[section.code] = "locked";
  });

  return result;
}
