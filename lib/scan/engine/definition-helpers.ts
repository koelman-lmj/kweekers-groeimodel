import { scanDefinition } from "../definition";
import type {
  OptionSetDefinition,
  QuestionDefinition,
  SectionDefinition,
} from "../types";

export function getSection(sectionCode: string): SectionDefinition | undefined {
  return scanDefinition.sections.find((section) => section.code === sectionCode);
}

export function getQuestion(questionKey: string): QuestionDefinition | undefined {
  return scanDefinition.questions.find((question) => question.key === questionKey);
}

export function getQuestionsForSection(sectionCode: string): QuestionDefinition[] {
  return scanDefinition.questions
    .filter((question) => question.sectionCode === sectionCode)
    .sort((a, b) => a.order - b.order);
}

export function getOptionSet(optionSetKey?: string): OptionSetDefinition | undefined {
  if (!optionSetKey) return undefined;
  return scanDefinition.optionSets.find((set) => set.key === optionSetKey);
}

export function getNextQuestionKey(
  sectionCode: string,
  currentQuestionKey: string
): string | null {
  const sectionQuestions = getQuestionsForSection(sectionCode);
  const currentIndex = sectionQuestions.findIndex(
    (question) => question.key === currentQuestionKey
  );

  if (currentIndex === -1) return null;

  const nextQuestion = sectionQuestions[currentIndex + 1];
  return nextQuestion?.key ?? null;
}

export function getPreviousQuestionKey(
  sectionCode: string,
  currentQuestionKey: string
): string | null {
  const sectionQuestions = getQuestionsForSection(sectionCode);
  const currentIndex = sectionQuestions.findIndex(
    (question) => question.key === currentQuestionKey
  );

  if (currentIndex === -1) return null;

  const previousQuestion = sectionQuestions[currentIndex - 1];
  return previousQuestion?.key ?? null;
}
