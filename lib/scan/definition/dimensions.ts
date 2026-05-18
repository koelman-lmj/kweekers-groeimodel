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
    "code": "eigenaarschap",
    "title": "Eigenaarschap",
    "category": "Organisatie & Beheer",
    "description": "",
    "order": 10,
    "isActive": true
  },
  {
    "code": "procesafspraken",
    "title": "Procesafspraken",
    "category": "Organisatie & Beheer",
    "description": "",
    "order": 20,
    "isActive": true
  },
  {
    "code": "datakwaliteit",
    "title": "Datakwaliteit",
    "category": "Organisatie & Beheer",
    "description": "",
    "order": 30,
    "isActive": true
  }
];
