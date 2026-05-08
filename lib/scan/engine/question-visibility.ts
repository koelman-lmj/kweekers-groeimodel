import type { ScanState } from "@/app/context/ScanContext";
import type { AnswerValue } from "@/lib/scan/engine/answer-mapping";
import type { QuestionDefinition, VisibilityRule } from "@/lib/scan/types";
import { getAnswerFromScan } from "@/lib/scan/engine/answer-mapping";

function toArray(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

function matchesRule(answer: AnswerValue, rule: VisibilityRule): boolean {
  const ruleValues = toArray(rule.value);

  if (rule.operator === "equals") {
    if (Array.isArray(answer)) {
      return answer.length === 1 && ruleValues.includes(answer[0]);
    }

    return ruleValues.includes(answer);
  }

  if (rule.operator === "includes") {
    if (Array.isArray(answer)) {
      return ruleValues.some((value) => answer.includes(value));
    }

    return ruleValues.includes(answer);
  }

  if (rule.operator === "one_of") {
    if (Array.isArray(answer)) {
      return ruleValues.some((value) => answer.includes(value));
    }

    return ruleValues.includes(answer);
  }

  return false;
}

function getFieldValue(scan: ScanState, field: string): AnswerValue {
  return getAnswerFromScan(scan, field);
}

export function isQuestionVisible(
  scan: ScanState,
  question: QuestionDefinition
): boolean {
  if (!question.visibleWhen || question.visibleWhen.length === 0) {
    return true;
  }

  return question.visibleWhen.every((rule) => {
    const answer = getFieldValue(scan, rule.field);
    return matchesRule(answer, rule);
  });
}
