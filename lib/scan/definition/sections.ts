import type { SectionDefinition } from "../types";

export const sections: SectionDefinition[] = [
  {
    code: "profile_basis",
    title: "Profiel - Basis",
    shortTitle: "Profiel",
    phase: "profile",
    order: 10,
    summaryEnabled: true,
    nextSectionCode: "profile_reason",
  },
  {
    code: "profile_reason",
    title: "Profiel - Aanleiding",
    shortTitle: "Profiel",
    phase: "profile",
    order: 20,
    summaryEnabled: true,
    nextSectionCode: "scope",
  },
  {
    code: "scope",
    title: "Scope",
    shortTitle: "Scope",
    phase: "scope",
    order: 30,
    summaryEnabled: true,
    nextSectionCode: "diagnose",
  },
{
  code: "diagnose",
  title: "Diagnose",
  shortTitle: "Diagnose",
  phase: "diagnose",
  order: 40,
  summaryEnabled: true,
  nextSectionCode: "advies",
},
{
  code: "advies",
  title: "Advies",
  shortTitle: "Advies",
  phase: "advies",
  order: 50,
  summaryEnabled: true,
},
];
