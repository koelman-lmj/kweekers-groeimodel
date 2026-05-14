export type CategoryDefinition = {
  code: string;
  title: string;
  description: string;
  order: number;
};

export const categories: CategoryDefinition[] = [
  {
    code: "AFAS Modules",
    title: "AFAS Modules",
    description: "Hoe sterk zijn de gekozen modules nu ingericht en bruikbaar?",
    order: 10,
  },
  {
    code: "Integraties & Beheer",
    title: "Integraties & Beheer",
    description: "Hoe stabiel en beheersbaar is de keten rondom AFAS?",
    order: 20,
  },
  {
    code: "Rapportage & Data",
    title: "Rapportage & Data",
    description: "Hoe bruikbaar en betrouwbaar is informatie voor sturing?",
    order: 30,
  },
  {
    code: "Organisatie & Beheer",
    title: "Organisatie & Beheer",
    description: "Hoe volwassen zijn eigenaarschap, governance en werkwijze?",
    order: 40,
  },
  {
    code: "Branchespecifiek",
    title: "Branchespecifiek",
    description:
      "Thema’s die specifiek samenhangen met de sector van deze organisatie.",
    order: 50,
  },
  {
    code: "Branche",
    title: "Branchespecifiek",
    description:
      "Thema’s die specifiek samenhangen met de sector van deze organisatie.",
    order: 50,
  },
  {
    code: "Overig",
    title: "Overig",
    description: "Relevante aandachtspunten binnen deze categorie.",
    order: 999,
  },
];

export function getCategoryDefinition(code: string): CategoryDefinition {
  return (
    categories.find((category) => category.code === code) ??
    categories.find((category) => category.code === "Overig")!
  );
}
