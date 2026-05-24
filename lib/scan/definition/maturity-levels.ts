export interface MaturityLevel {
  level: number;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  bgColor: string;
}

// Diagnose scores werken op schaal 1-3:
// 1.0-1.5 = Kwetsbaar
// 1.6-2.3 = In ontwikkeling
// 2.4-3.0 = Beheerst
export const maturityLevels: MaturityLevel[] = [
  {
    level: 1,
    label: "Kwetsbaar",
    shortLabel: "Kwetsbaar",
    description: "De basis is nog onvoldoende stabiel om hier goed op te sturen.",
    color: "#dc2626",
    bgColor: "#fef2f2",
  },
  {
    level: 2,
    label: "In ontwikkeling",
    shortLabel: "In ontwikkeling",
    description: "Er is een basis, maar nog niet overal eenduidig of betrouwbaar.",
    color: "#ea580c",
    bgColor: "#fff7ed",
  },
  {
    level: 3,
    label: "Beheerst",
    shortLabel: "Beheerst",
    description: "Overwegend beheerst ingericht en ondersteunt de organisatie stabiel.",
    color: "#16a34a",
    bgColor: "#f0fdf4",
  },
];

export function getMaturityLevel(level: number): MaturityLevel | undefined {
  return maturityLevels.find((m) => m.level === level);
}

export function getMaturityLevelForScore(score: number): MaturityLevel {
  // Score schaal 1-3
  if (score <= 1.5) return maturityLevels[0]; // Kwetsbaar
  if (score <= 2.3) return maturityLevels[1]; // In ontwikkeling
  return maturityLevels[2]; // Beheerst
}

export function getMaturityColor(score: number): string {
  if (score <= 1.5) return maturityLevels[0].color; // Kwetsbaar - rood
  if (score <= 2.3) return maturityLevels[1].color; // In ontwikkeling - oranje
  return maturityLevels[2].color; // Beheerst - groen
}

export function getMaturityLabel(score: number): string {
  if (score <= 1.5) return "Kwetsbaar";
  if (score <= 2.3) return "In ontwikkeling";
  return "Beheerst";
}
