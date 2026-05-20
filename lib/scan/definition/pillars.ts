import type { LucideIcon } from "lucide-react";

export interface SubDimension {
  code: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface Pillar {
  code: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  subDimensions: SubDimension[];
}

export const pillars: Pillar[] = [
  {
    code: "afas_modules",
    label: "AFAS Modules",
    description: "Hoe optimaal benutten we de mogelijkheden van AFAS?",
    icon: "grid-3x3",
    color: "#3f4e87",
    subDimensions: [
      { code: "hrm_payroll", label: "HRM & Payroll", icon: "users" },
      { code: "finance", label: "Finance", icon: "euro" },
      { code: "crm", label: "CRM", icon: "contact" },
      { code: "projects", label: "Projecten", icon: "folder" },
      { code: "inkoop", label: "Inkoop", icon: "shopping-cart" },
      { code: "abonnementen", label: "Abonnementen", icon: "repeat" },
      { code: "fleet", label: "Fleet", icon: "truck" },
      { code: "selfservice", label: "Self Service & Portalen", icon: "monitor" },
    ],
  },
  {
    code: "integraties",
    label: "Integraties",
    description: "Hoe goed is AFAS verbonden met andere systemen?",
    icon: "link",
    color: "#ed6e41",
    subDimensions: [
      { code: "koppelingen", label: "Koppelingen met andere systemen", icon: "plug" },
      { code: "data_uitwisseling", label: "Data-uitwisseling (API / iPaaS)", icon: "arrow-left-right" },
      { code: "master_data", label: "Master Data Management", icon: "database" },
      { code: "proces_integratie", label: "Procesintegratie (end-to-end)", icon: "git-branch" },
      { code: "security", label: "Security & Toegangsbeheer", icon: "shield" },
      { code: "monitoring", label: "Monitoring & Foutafhandeling", icon: "activity" },
    ],
  },
  {
    code: "rapportage_data",
    label: "Rapportage & Data",
    description: "Hoe sturen we op data en inzichten?",
    icon: "bar-chart-3",
    color: "#f59e0b",
    subDimensions: [
      { code: "standaard_rapportages", label: "Standaard rapportages (AFAS)", icon: "file-text" },
      { code: "management_info", label: "Managementinformatie (KPI's & dashboards)", icon: "gauge" },
      { code: "data_kwaliteit", label: "Data kwaliteit & Governance", icon: "check-circle" },
      { code: "selfservice_bi", label: "Self Service BI (Gebruikersregie)", icon: "user-cog" },
      { code: "geavanceerde_analyse", label: "Geavanceerde analyse & voorspellingen", icon: "trending-up" },
      { code: "data_driven", label: "Data-driven cultuur", icon: "lightbulb" },
    ],
  },
  {
    code: "organisatie_maturiteit",
    label: "Organisatiematuriteit",
    description: "Hoe volwassen is de organisatie in mens, proces & sturing?",
    icon: "building-2",
    color: "#10b981",
    subDimensions: [
      { code: "strategie_visie", label: "Strategie & Visie", icon: "target" },
      { code: "processen", label: "Processen & Werkwijzen", icon: "workflow" },
      { code: "organisatie_rollen", label: "Organisatie & Rollen", icon: "users-2" },
      { code: "change_adoptie", label: "Change & Adoptie", icon: "refresh-cw" },
      { code: "competenties", label: "Competenties & Vaardigheden", icon: "award" },
      { code: "communicatie", label: "Communicatie & Betrokkenheid", icon: "message-circle" },
      { code: "governance", label: "Governance & Sturing", icon: "compass" },
    ],
  },
];

export function getPillar(code: string): Pillar | undefined {
  return pillars.find((p) => p.code === code);
}

export function getSubDimension(pillarCode: string, subCode: string): SubDimension | undefined {
  const pillar = getPillar(pillarCode);
  return pillar?.subDimensions.find((s) => s.code === subCode);
}
