import type { QuestionDefinition } from "../types";

export const questions: QuestionDefinition[] = [
  {
    key: "customer_name",
    sectionCode: "profile_basis",
    order: 10,
    label: "Klantnaam",
    helpText: "Vul de naam van de organisatie in.",
    inputType: "text",
    required: true,
    placeholder: "Bijvoorbeeld: Janssen BV",
  },
  {
    key: "sector",
    sectionCode: "profile_basis",
    order: 20,
    label: "Sector",
    helpText: "Kies de sector die het beste past bij de organisatie.",
    inputType: "single_select",
    required: true,
    optionSetKey: "sector_options",
  },
];
