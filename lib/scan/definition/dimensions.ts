import type { DimensionCategory } from "./types";

export type DimensionDefinition = {
  code: string;
  title: string;
  category: DimensionCategory;
  description: string;
  order: number;
  isActive: boolean;
};

export const dimensions: DimensionDefinition[] = [
  {
    code: "governance",
    title: "Eigenaarschap & governance",
    category: "Organisatie & Beheer",
    description:
      "Meet hoe duidelijk eigenaarschap, besluitvorming en beheer zijn ingericht.",
    order: 10,
    isActive: true,
  },
  {
    code: "processes",
    title: "Processen & standaardisatie",
    category: "Organisatie & Beheer",
    description:
      "Meet hoe eenduidig processen verlopen en hoe beheersbaar uitzonderingen zijn.",
    order: 20,
    isActive: true,
  },
  {
    code: "improvement",
    title: "Verbetervermogen & sturing",
    category: "Organisatie & Beheer",
    description:
      "Meet hoe structureel knelpunten worden opgepakt en verbetering wordt aangestuurd.",
    order: 30,
    isActive: true,
  },
  {
    code: "finance",
    title: "Financieel",
    category: "AFAS Modules",
    description:
      "Meet hoe sterk de financiële basis, verwerking en stuurinformatie zijn ingericht.",
    order: 40,
    isActive: true,
  },
  {
    code: "ordermanagement",
    title: "Ordermanagement",
    category: "AFAS Modules",
    description:
      "Meet hoe eenduidig en beheersbaar de orderroute richting levering en factuur verloopt.",
    order: 50,
    isActive: true,
  },
  {
    code: "crm",
    title: "CRM",
    category: "AFAS Modules",
    description:
      "Meet hoe volwassen CRM-processen, data en commerciële stuurinformatie zijn.",
    order: 60,
    isActive: true,
  },
  {
    code: "hrm",
    title: "HRM",
    category: "AFAS Modules",
    description:
      "Meet hoe stabiel HRM-processen en HRM-data zijn ingericht.",
    order: 70,
    isActive: true,
  },
  {
    code: "reporting",
    title: "Rapportage & data",
    category: "Rapportage & Data",
    description:
      "Meet hoe bruikbaar, betrouwbaar en eenduidig stuurinformatie is.",
    order: 80,
    isActive: true,
  },
  {
    code: "integrations",
    title: "Integraties & keten",
    category: "Integraties & Beheer",
    description:
      "Meet hoe stabiel, beheersbaar en duidelijk belegd koppelingen en ketenafspraken zijn.",
    order: 90,
    isActive: true,
  },
  {
    code: "care",
    title: "Zorgspecifieke uitvoering",
    category: "Branchespecifiek",
    description:
      "Meet hoe beheersbaar registratie, declaratie en verantwoording binnen zorgprocessen zijn.",
    order: 100,
    isActive: true,
  },
  {
    code: "education",
    title: "Onderwijsspecifieke uitvoering",
    category: "Branchespecifiek",
    description:
      "Meet hoe eenduidig intake, planning en administratieve aansluiting binnen onderwijsprocessen zijn.",
    order: 110,
    isActive: true,
  },
];
