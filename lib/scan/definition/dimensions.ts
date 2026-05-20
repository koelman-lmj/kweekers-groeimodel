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
  // Organisatie & Beheer
  {
    code: "governance",
    title: "Governance & Eigenaarschap",
    category: "Organisatie & Beheer",
    description: "Eigenaarschap, besluitvorming en verbetersturing",
    order: 10,
    isActive: true,
  },
  {
    code: "processes",
    title: "Processtandaardisatie",
    category: "Organisatie & Beheer",
    description: "Eenduidigheid in werkwijze en beheersing van uitzonderingen",
    order: 20,
    isActive: true,
  },
  // Functionele domeinen
  {
    code: "finance",
    title: "Financieel",
    category: "Functionele domeinen",
    description: "Financiële verwerking, controles en stuurinformatie",
    order: 30,
    isActive: true,
  },
  {
    code: "ordermanagement",
    title: "Ordermanagement",
    category: "Functionele domeinen",
    description: "Orderverwerking, facturatie en klantenafhandeling",
    order: 40,
    isActive: true,
  },
  {
    code: "crm",
    title: "CRM & Relatiebeheer",
    category: "Functionele domeinen",
    description: "Klantdata, commerciële processen en verkoopsturing",
    order: 50,
    isActive: true,
  },
  {
    code: "hrm",
    title: "HRM & Payroll",
    category: "Functionele domeinen",
    description: "Personeelsadministratie, verloning en HR-processen",
    order: 60,
    isActive: true,
  },
  {
    code: "projects",
    title: "Projecten",
    category: "Functionele domeinen",
    description: "Projectadministratie, urenregistratie en nacalculatie",
    order: 70,
    isActive: true,
  },
  {
    code: "procurement",
    title: "Inkoop",
    category: "Functionele domeinen",
    description: "Inkoopprocessen, leveranciersbeheer en goedkeuringsflow",
    order: 80,
    isActive: true,
  },
  {
    code: "subscriptions",
    title: "Abonnementen",
    category: "Functionele domeinen",
    description: "Contractbeheer, facturatie en verlengingen",
    order: 90,
    isActive: true,
  },
  // Data & Rapportage
  {
    code: "reporting",
    title: "Rapportage & Data",
    category: "Data & Rapportage",
    description: "Stuurinformatie, KPI's en databetrouwbaarheid",
    order: 100,
    isActive: true,
  },
  {
    code: "integrations",
    title: "Integraties & Keten",
    category: "Data & Rapportage",
    description: "Koppelingen, ketenafspraken en datauitwisseling",
    order: 110,
    isActive: true,
  },
  // Sectorspecifiek
  {
    code: "care",
    title: "Zorg",
    category: "Sectorspecifiek",
    description: "Registratie, declaratie en verantwoording in de zorg",
    order: 200,
    isActive: true,
  },
  {
    code: "education",
    title: "Onderwijs",
    category: "Sectorspecifiek",
    description: "Intake, planning en administratie in het onderwijs",
    order: 210,
    isActive: true,
  },
];
