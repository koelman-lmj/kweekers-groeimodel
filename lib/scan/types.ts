export type ScanPhase = "profile" | "scope" | "diagnose" | "advice";

export type InputType =
  | "text"
  | "single_select"
  | "multi_select"
  | "textarea";

export type AnswerValue = string | string[] | null;

export type SectionDefinition = {
  code: string;
  title: string;
  shortTitle: string;
  phase: ScanPhase;
  order: number;
  summaryEnabled: boolean;
};

export type OptionDefinition = {
  value: string;
  label: string;
  description?: string;
  order: number;
};

export type OptionSetDefinition = {
  key: string;
  options: OptionDefinition[];
};

export type Condition = {
  questionKey: string;
  comparator: "equals" | "not_equals" | "includes" | "not_empty";
  value?: string | string[];
};

export type ConditionGroup = {
  operator: "and" | "or";
  conditions: Condition[];
};

export type QuestionDefinition = {
  key: string;
  sectionCode: string;
  order: number;
  label: string;
  helpText?: string;
  inputType: InputType;
  required: boolean;
  optionSetKey?: string;
  placeholder?: string;
  visibleWhen?: ConditionGroup;
};

export type RuleDefinition = {
  id: string;
  when: ConditionGroup;
  effect:
    | { type: "show_question"; questionKey: string }
    | { type: "hide_question"; questionKey: string }
    | { type: "add_signal"; signal: string; value: string };
};

export type ScanDefinition = {
  version: string;
  sections: SectionDefinition[];
  optionSets: OptionSetDefinition[];
  questions: QuestionDefinition[];
  rules: RuleDefinition[];
};
