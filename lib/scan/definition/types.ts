export type DimensionCategory =
  | "Organisatie & Beheer"
  | "Functionele domeinen"
  | "Data & Rapportage"
  | "Sectorspecifiek"
  | "Overig";

export type OutputRole = "context" | "score" | "evidence" | "advice";

export type QuestionInputType = "text" | "single_select" | "multi_select";

export type VisibleWhenCondition = {
  field: string;
  operator: "equals" | "includes" | "one_of";
  value: string | string[];
};

export type QuestionDefinition = {
  key: string;
  sectionCode: string;
  order: number;
  label: string;
  helpText?: string;
  inputType: QuestionInputType;
  required: boolean;
  optionSetKey?: string;
  placeholder?: string;
  examples?: string[];
  allowsComment?: boolean;
  maxSelections?: number;
  visibleWhen?: VisibleWhenCondition[];

  dimensionCode?: string;
  category?: DimensionCategory;
  outputRole?: OutputRole;
  scoreEnabled?: boolean;
  scoreWeight?: number;
};

export type OptionDefinition = {
  value: string;
  label: string;
  description?: string;
  order: number;
  score?: number;
  adviceSignal?: string;
};

export type OptionSetDefinition = {
  key: string;
  title?: string;
  options: OptionDefinition[];
};

export type SectionPhase = "profile" | "scope" | "diagnose" | "advies";

export type SectionDefinition = {
  code: string;
  title: string;
  shortTitle?: string;
  description?: string;
  phase?: SectionPhase;
  order: number;
  summaryEnabled?: boolean;
  nextSectionCode?: string;
};
