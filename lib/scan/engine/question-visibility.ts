import type { ScanState } from "@/app/context/ScanContext";
import type { AnswerValue } from "@/lib/scan/engine/answer-mapping";
import type { QuestionDefinition, VisibilityRule, DepthLevel } from "@/lib/scan/types";
import { getAnswerFromScan } from "@/lib/scan/engine/answer-mapping";
import { scanDefinition } from "@/lib/scan/definition";

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

/**
 * Returns all visible questions for a given scan state.
 * Optionally filter by sectionCode.
 */
export function getVisibleQuestions(
  scan: ScanState,
  sectionCode?: string
): QuestionDefinition[] {
  let questions = scanDefinition.questions;
  
  if (sectionCode) {
    questions = questions.filter((q) => q.sectionCode === sectionCode);
  }
  
  return questions
    .filter((q) => isQuestionVisible(scan, q))
    .sort((a, b) => a.order - b.order);
}

/**
 * Checks if an answer is "active" - meaning its question is currently visible.
 * Use this to determine if an answer should be included in scoring/analysis.
 */
export function isAnswerActive(scan: ScanState, questionKey: string): boolean {
  const question = scanDefinition.questions.find((q) => q.key === questionKey);
  if (!question) return false;
  return isQuestionVisible(scan, question);
}

/**
 * Returns only answers for questions that are currently visible.
 * This ensures scoring and analysis only consider relevant answers.
 */
export function getActiveAnswers(
  scan: ScanState
): Record<string, AnswerValue> {
  const activeAnswers: Record<string, AnswerValue> = {};
  
  for (const question of scanDefinition.questions) {
    if (isQuestionVisible(scan, question)) {
      const answer = getAnswerFromScan(scan, question.key);
      if (answer !== undefined && answer !== null && answer !== "") {
        activeAnswers[question.key] = answer;
      }
    }
  }
  
  return activeAnswers;
}
