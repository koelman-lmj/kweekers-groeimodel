import type { OptionSetDefinition } from "../types";

export const optionSets: OptionSetDefinition[] = [
  {
    key: "sector_options",
    options: [
      { value: "zorg", label: "Zorg", order: 10 },
      { value: "onderwijs", label: "Onderwijs", order: 20 },
      { value: "nonprofit", label: "Non-profit", order: 30 },
      { value: "commercieel", label: "Commercieel", order: 40 },
      { value: "overig", label: "Overig", order: 50 },
    ],
  },
  {
    key: "organization_size_options",
    options: [
      { value: "1-25", label: "1–25 medewerkers", order: 10 },
      { value: "26-100", label: "26–100 medewerkers", order: 20 },
      { value: "101-250", label: "101–250 medewerkers", order: 30 },
      { value: "251-500", label: "251–500 medewerkers", order: 40 },
      { value: "500+", label: "500+ medewerkers", order: 50 },
    ],
  },
  {
    key: "administration_count_options",
    options: [
      { value: "1", label: "1 administratie", order: 10 },
      { value: "2-3", label: "2–3 administraties", order: 20 },
      { value: "4-10", label: "4–10 administraties", order: 30 },
      { value: "10+", label: "10+ administraties", order: 40 },
    ],
  },
];
