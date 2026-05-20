export type CategoryDefinition = {
  code: string;
  title: string;
  description: string;
  order: number;
};

export const categories: CategoryDefinition[] = [
  {
    code: "Organisatie & Beheer",
    title: "Organisatie & Beheer",
    description: "Eigenaarschap, sturing, procesafspraken en beheer.",
    order: 10,
  },
  {
    code: "Functionele domeinen",
    title: "Functionele domeinen",
    description: "Financieel, HRM, CRM, Projecten, Inkoop en andere modules.",
    order: 20,
  },
  {
    code: "Data & Rapportage",
    title: "Data & Rapportage",
    description: "Stuurinformatie, integraties en databetrouwbaarheid.",
    order: 30,
  },
  {
    code: "Sectorspecifiek",
    title: "Sectorspecifiek",
    description: "Zorg- of onderwijsspecifieke processen en uitdagingen.",
    order: 40,
  },
  {
    code: "Overig",
    title: "Overig",
    description: "Overige thema's en aandachtspunten.",
    order: 100,
  },
];

export function getCategoryDefinition(code: string): CategoryDefinition {
  return (
    categories.find((category) => category.code === code) ??
    categories.find((category) => category.code === "Overig")!
  );
}
