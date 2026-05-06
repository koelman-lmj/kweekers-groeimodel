export type InputType = "text" | "single_select" | "multi_select";

export type OptionDefinition = {
  value: string;
  label: string;
  order: number;
  description?: string;
};

export type OptionSetDefinition = {
  key: string;
  options: OptionDefinition[];
};

export type SectionDefinition = {
  code: string;
  title: string;
  shortTitle: string;
  phase: string;
  order: number;
  summaryEnabled: boolean;
  nextSectionCode?: string;
};

export type QuestionDefinition = {
  key: string;
  sectionCode: string;
  order: number;
  label: string;
  helpText?: string;
  inputType: InputType;
  required: boolean;
  placeholder?: string;
  optionSetKey?: string;

  // Nieuwe velden voor volgende fase
  examples?: string[];
  allowsComment?: boolean;
  domain?: string;
  category?: string;
};

export type ScanDefinition = {
  sections: SectionDefinition[];
  questions: QuestionDefinition[];
  optionSets: OptionSetDefinition[];
};
