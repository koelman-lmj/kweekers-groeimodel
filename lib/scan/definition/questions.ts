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
  {
    key: "organization_size",
    sectionCode: "profile_basis",
    order: 30,
    label: "Organisatiegrootte",
    helpText: "Geef aan hoe groot de organisatie ongeveer is.",
    inputType: "single_select",
    required: true,
    optionSetKey: "organization_size_options",
  },
  {
    key: "administration_count",
    sectionCode: "profile_basis",
    order: 40,
    label: "Aantal administraties / entiteiten",
    helpText: "Kies hoeveel administraties of entiteiten ongeveer in scope zijn.",
    inputType: "single_select",
    required: true,
    optionSetKey: "administration_count_options",
  },
];
