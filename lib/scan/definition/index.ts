import type { ScanDefinition } from "../types";
import { optionSets } from "./option-sets";
import { questions } from "./questions";
import { sections } from "./sections";

export const scanDefinition: ScanDefinition = {
  version: "0.1.0",
  sections,
  optionSets,
  questions,
  rules: [],
};
