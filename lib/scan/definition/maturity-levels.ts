export interface MaturityLevel {
  level: number;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  bgColor: string;
}

export const maturityLevels: MaturityLevel[] = [
  {
    level: 1,
    label: "Initieel",
    shortLabel: "Initieel",
    description: "Ad-hoc, beperkt gestructureerd, weinig inzicht.",
    color: "#dc2626",
    bgColor: "#fef2f2",
  },
  {
    level: 2,
    label: "Basis",
    shortLabel: "Basis",
    description: "Basisprocessen aanwezig, beperkte integratie en data.",
    color: "#ea580c",
    bgColor: "#fff7ed",
  },
  {
    level: 3,
    label: "Gedefinieerd",
    shortLabel: "Gedefinieerd",
    description: "Gestandaardiseerd, beheerst, data en rapportage beschikbaar.",
    color: "#ca8a04",
    bgColor: "#fefce8",
  },
  {
    level: 4,
    label: "Geïntegreerd",
    shortLabel: "Geïntegreerd",
    description: "Geïntegreerd, proactief sturen, data-gedreven organisatie.",
    color: "#16a34a",
    bgColor: "#f0fdf4",
  },
  {
    level: 5,
    label: "Geoptimaliseerd",
    shortLabel: "Geoptimaliseerd",
    description: "Continu verbeteren, voorspellend, maximale waarde en wendbaar.",
    color: "#059669",
    bgColor: "#ecfdf5",
  },
];

export function getMaturityLevel(level: number): MaturityLevel | undefined {
  return maturityLevels.find((m) => m.level === level);
}

export function getMaturityLevelForScore(score: number): MaturityLevel {
  // Round to nearest level (1-5)
  const roundedLevel = Math.max(1, Math.min(5, Math.round(score)));
  return maturityLevels.find((m) => m.level === roundedLevel) || maturityLevels[0];
}

export function getMaturityColor(score: number): string {
  if (score < 1.5) return maturityLevels[0].color;
  if (score < 2.5) return maturityLevels[1].color;
  if (score < 3.5) return maturityLevels[2].color;
  if (score < 4.5) return maturityLevels[3].color;
  return maturityLevels[4].color;
}
