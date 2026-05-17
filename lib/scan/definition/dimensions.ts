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
    "code": "governance",
    "title": "Eigenaarschap & governance",
    "category": "Organisatie & Beheer",
    "description": "",
    "order": 10,
    "isActive": true
  },
  {
    "code": "processes",
    "title": "Processen & standaardisatie",
    "category": "Organisatie & Beheer",
    "description": "",
    "order": 20,
    "isActive": true
  },
  {
    "code": "improvement",
    "title": "Verbetervermogen & sturing",
    "category": "Organisatie & Beheer",
    "description": "",
    "order": 30,
    "isActive": true
  },
  {
    "code": "finance",
    "title": "Financieel",
    "category": "AFAS Modules",
    "description": "",
    "order": 40,
    "isActive": true
  },
  {
    "code": "ordermanagement",
    "title": "Ordermanagement",
    "category": "AFAS Modules",
    "description": "",
    "order": 50,
    "isActive": true
  },
  {
    "code": "crm",
    "title": "CRM",
    "category": "AFAS Modules",
    "description": "",
    "order": 60,
    "isActive": true
  },
  {
    "code": "hrm",
    "title": "HRM",
    "category": "AFAS Modules",
    "description": "",
    "order": 70,
    "isActive": true
  },
  {
    "code": "reporting",
    "title": "Rapportage & data",
    "category": "Rapportage & Data",
    "description": "",
    "order": 80,
    "isActive": true
  },
  {
    "code": "integrations",
    "title": "Integraties & keten",
    "category": "Integraties & Beheer",
    "description": "",
    "order": 90,
    "isActive": true
  },
  {
    "code": "care",
    "title": "Zorgspecifieke uitvoering",
    "category": "Branchespecifiek",
    "description": "",
    "order": 100,
    "isActive": true
  },
  {
    "code": "education",
    "title": "Onderwijsspecifieke uitvoering",
    "category": "Branchespecifiek",
    "description": "",
    "order": 110,
    "isActive": true
  }
];
