import type { ScanDefinition } from "../types";
import { sections } from "./sections";
import { optionSets } from "./option-sets";
import { questions } from "./questions";

export const scanDefinition: ScanDefinition = {
  sections,
  optionSets,
  questions,
};
