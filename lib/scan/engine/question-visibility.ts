import type { ScanState } from "@/app/context/ScanContext";
import type { AnswerValue } from "@/lib/scan/engine/answer-mapping";
import type { QuestionDefinition, VisibilityRule, DepthLevel } from "@/lib/scan/types";
import { getAnswerFromScan } from "@/lib/scan/engine/answer-mapping";

const DEPTH_ORDER: DepthLevel[] = ["eerste_beeld", "gericht_verdiepen", "verbeterplan"];

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

function meetsDepthRequirement(
  selectedDepth: string,
  requiredDepth: DepthLevel | undefined
): boolean {
  if (!requiredDepth) return true; // No depth requirement = always visible
  
  const selectedIndex = DEPTH_ORDER.indexOf(selectedDepth as DepthLevel);
  const requiredIndex = DEPTH_ORDER.indexOf(requiredDepth);
  
  // If selected depth is not recognized, show all questions
  if (selectedIndex === -1) return true;
  
  // Show question if selected depth is >= required depth
  return selectedIndex >= requiredIndex;
}

export function isQuestionVisible(
  scan: ScanState,
  question: QuestionDefinition
): boolean {
  // Check depth level requirement first
  const selectedDepth = scan.scope?.depth || "verbeterplan";
  if (!meetsDepthRequirement(selectedDepth, question.minDepthLevel)) {
    return false;
  }

  // Then check visibility rules
  if (!question.visibleWhen || question.visibleWhen.length === 0) {
    return true;
  }

  return question.visibleWhen.every((rule) => {
    const answer = getFieldValue(scan, rule.field);
    return matchesRule(answer, rule);
  });
}
