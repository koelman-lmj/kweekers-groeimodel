import type { OptionSetDefinition } from "../types";

export const optionSets: OptionSetDefinition[] = [
  {
    key: "sector_options",
    options: [
      { value: "zorg", label: "Zorg", order: 10 },
      { value: "onderwijs", label: "Onderwijs", order: 20 },
      { value: "nonprofit", label: "Non-profit", order: 30 },
      { value: "commercieel", label: "Commercieel", order: 40 },
      { value: "overig", label: "Overig", order: 50 },
    ],
  },
  {
    key: "organization_size_options",
    options: [
      { value: "1-25", label: "1–25 medewerkers", order: 10 },
      { value: "26-100", label: "26–100 medewerkers", order: 20 },
      { value: "101-250", label: "101–250 medewerkers", order: 30 },
      { value: "251-500", label: "251–500 medewerkers", order: 40 },
      { value: "500+", label: "500+ medewerkers", order: 50 },
    ],
  },
  {
    key: "administration_count_options",
    options: [
      { value: "1", label: "1 administratie", order: 10 },
      { value: "2-3", label: "2–3 administraties", order: 20 },
      { value: "4-10", label: "4–10 administraties", order: 30 },
      { value: "10+", label: "10+ administraties", order: 40 },
    ],
  },
  {
    key: "scan_reason_options",
    options: [
      { value: "nulmeting", label: "Nulmeting", order: 10 },
      { value: "optimalisatie", label: "Optimalisatie", order: 20 },
      { value: "herinrichting", label: "Herinrichting", order: 30 },
      { value: "rapportage", label: "Rapportage & sturing", order: 40 },
      { value: "groei", label: "Voorbereiding op groei", order: 50 },
      { value: "overig", label: "Overig", order: 60 },
    ],
  },
  {
    key: "primary_goal_options",
    options: [
      { value: "inzicht", label: "Inzicht in huidige situatie", order: 10 },
      { value: "verbeterkansen", label: "Verbeterkansen bepalen", order: 20 },
      { value: "roadmap", label: "Roadmap en prioriteiten bepalen", order: 30 },
      { value: "standaardiseren", label: "Meer standaardiseren", order: 40 },
      { value: "sturing", label: "Betere sturing en rapportage", order: 50 },
    ],
  },
  {
    key: "biggest_bottleneck_options",
    options: [
      { value: "processen", label: "Processen", order: 10 },
      { value: "afas", label: "AFAS-inrichting", order: 20 },
      { value: "rapportage", label: "Rapportage en stuurinformatie", order: 30 },
      { value: "eigenaarschap", label: "Eigenaarschap", order: 40 },
      { value: "data_integraties", label: "Data / integraties", order: 50 },
      { value: "adoptie", label: "Adoptie en gebruik", order: 60 },
    ],
  },
  {
    key: "scope_options",
    options: [
      {
        value: "smal",
        label: "Smal",
        description: "Gericht op een beperkt aantal onderdelen.",
        order: 10,
      },
      {
        value: "normaal",
        label: "Normaal",
        description: "Een gebalanceerde scan van de belangrijkste onderdelen.",
        order: 20,
      },
      {
        value: "breed",
        label: "Breed",
        description: "Een brede scan over meerdere domeinen en processen.",
        order: 30,
      },
    ],
  },
  {
    key: "maturity_3level_clarity_options",
    options: [
      { value: "onvoldoende_duidelijk", label: "Onvoldoende duidelijk", order: 10 },
      { value: "gedeeltelijk_duidelijk", label: "Gedeeltelijk duidelijk", order: 20 },
      { value: "duidelijk_belegd", label: "Duidelijk belegd", order: 30 },
    ],
  },
  {
    key: "maturity_3level_change_governance_options",
    options: [
      { value: "ad_hoc", label: "Ad hoc", order: 10 },
      { value: "deels_afgestemd", label: "Deels afgestemd", order: 20 },
      {
        value: "vast_proces",
        label: "Vast proces met duidelijke besluitvorming",
        order: 30,
      },
    ],
  },
  {
    key: "maturity_3level_improvement_options",
    options: [
      { value: "nauwelijks", label: "Nauwelijks", order: 10 },
      { value: "af_en_toe", label: "Af en toe", order: 20 },
      { value: "structureel", label: "Structureel", order: 30 },
    ],
  },
  {
    key: "maturity_3level_standardization_options",
    options: [
      {
        value: "sterk_verschillend",
        label: "Sterk verschillend per persoon of team",
        order: 10,
      },
      { value: "redelijk_eenduidig", label: "Redelijk eenduidig", order: 20 },
      { value: "gestandaardiseerd", label: "Overwegend gestandaardiseerd", order: 30 },
    ],
  },
  {
    key: "maturity_3level_exception_control_options",
    options: [
      {
        value: "uitzondering_is_norm",
        label: "Uitzonderingen zijn vaak de norm",
        order: 10,
      },
      {
        value: "deels_beheersbaar",
        label: "Regelmatig uitzonderingen, maar deels beheersbaar",
        order: 20,
      },
      {
        value: "beperkt_en_beheerst",
        label: "Uitzonderingen zijn beperkt en beheerst",
        order: 30,
      },
    ],
  },
  {
    key: "maturity_3level_issue_resolution_options",
    options: [
      {
        value: "handmatig_herstellen",
        label: "Vooral handmatig herstellen",
        order: 10,
      },
      {
        value: "mix_ad_hoc_structureel",
        label: "Soms structureel, soms ad hoc",
        order: 20,
      },
      {
        value: "meestal_structureel",
        label: "Meestal structureel opgelost",
        order: 30,
      },
    ],
  },
{
  key: "advice_direction_options",
  options: [
    { value: "stabiliseren", label: "Stabiliseren", order: 10 },
    { value: "governance_versterken", label: "Governance versterken", order: 20 },
    { value: "processen_standaardiseren", label: "Processen standaardiseren", order: 30 },
    { value: "gericht_doorontwikkelen", label: "Gericht doorontwikkelen", order: 40 },
  ],
},
{
  key: "scope_focus_options",
  options: [
    {
      value: "organisatie_eigenaarschap",
      label: "Organisatie en eigenaarschap",
      order: 10,
    },
    {
      value: "processen_werkwijze",
      label: "Processen en werkwijze",
      order: 20,
    },
    {
      value: "afas_inrichting_gebruik",
      label: "AFAS-inrichting en gebruik",
      order: 30,
    },
    {
      value: "rapportage_sturing",
      label: "Rapportage en sturing",
      order: 40,
    },
    {
      value: "beheer_doorontwikkeling",
      label: "Beheer en doorontwikkeling",
      order: 50,
    },
  ],
},
{
  key: "scope_depth_options",
  options: [
    {
      value: "eerste_beeld",
      label: "Snel eerste beeld",
      order: 10,
    },
    {
      value: "gericht_verdiepen",
      label: "Gericht verdiepen",
      order: 20,
    },
    {
      value: "verbeterplan",
      label: "Basis voor concreet verbeterplan",
      order: 30,
    },
  ],
},
];
