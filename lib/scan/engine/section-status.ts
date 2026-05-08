import type { ScanState } from "@/app/context/ScanContext";
import { sections } from "@/lib/scan/definition/sections";
import { getQuestionsForSection } from "./definition-helpers";
import { getAnswerFromScan } from "./answer-mapping";

export function isSectionComplete(
  scan: ScanState,
  sectionCode: string
): boolean {
  const questions = getQuestionsForSection(sectionCode);

  return questions.every((question) => {
    if (!question.required) return true;

    const answer = getAnswerFromScan(scan, question.key);

    if (Array.isArray(answer)) {
      return answer.length > 0;
    }

    return answer.trim() !== "";
  });
}

export function getSectionStatuses(scan: ScanState): Record<string, boolean> {
  return sections.reduce<Record<string, boolean>>((result, section) => {
    result[section.code] = isSectionComplete(scan, section.code);
    return result;
  }, {});
}
