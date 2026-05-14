import { sections } from "./sections";
import { optionSets } from "./option-sets";
import { questions } from "./questions";
import { dimensions } from "./dimensions";

export const scanDefinition = {
  sections,
  optionSets,
  questions,
  dimensions,
};

export { sections } from "./sections";
export { optionSets } from "./option-sets";
export { questions } from "./questions";
export { dimensions } from "./dimensions";

export type {
  DimensionCategory,
  OutputRole,
  QuestionInputType,
  VisibleWhenCondition,
  QuestionDefinition,
  OptionDefinition,
  OptionSetDefinition,
  SectionDefinition,
} from "./types";
