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
    key: "organization_type_options",
    options: [
      {
        value: "centraal_operationeel",
        label: "Centraal aangestuurde operatie",
        order: 10,
      },
      {
        value: "meerdere_teams_locaties",
        label: "Meerdere teams of locaties",
        order: 20,
      },
      {
        value: "meerdere_entiteiten",
        label: "Meerdere bedrijven of entiteiten",
        order: 30,
      },
      {
        value: "projectmatig",
        label: "Overwegend projectmatig georganiseerd",
        order: 40,
      },
      {
        value: "transactiegedreven",
        label: "Overwegend transactiegedreven",
        order: 50,
      },
      {
        value: "hybride",
        label: "Hybride of gemengde organisatievorm",
        order: 60,
      },
    ],
  },
  {
    key: "afas_products_options",
    options: [
      { value: "crm", label: "CRM", order: 10 },
      { value: "financieel", label: "Financieel", order: 20 },
      { value: "inkoop", label: "Inkoop", order: 30 },
      { value: "ordermanagement", label: "Ordermanagement", order: 40 },
      { value: "projecten", label: "Projecten", order: 50 },
      { value: "hrm", label: "HRM", order: 60 },
      { value: "payroll", label: "Payroll", order: 70 },
      { value: "insite", label: "InSite", order: 80 },
      { value: "outsite", label: "OutSite", order: 90 },
      { value: "workflow", label: "Workflow", order: 100 },
      { value: "autorisatie", label: "Autorisatie", order: 110 },
      {
        value: "rapportage_dashboards",
        label: "Rapportage / dashboards",
        order: 120,
      },
      { value: "integraties", label: "Integraties", order: 130 },
      { value: "abonnementen", label: "Abonnementen", order: 140 },
      { value: "declaraties", label: "Declaraties", order: 150 },
      { value: "verlof_verzuim", label: "Verlof / verzuim", order: 160 },
      {
        value: "dossier_documentbeheer",
        label: "Dossier / documentbeheer",
        order: 170,
      },
      { value: "overig", label: "Overig", order: 180 },
    ],
  },
  {
    key: "ownership_model_options",
    options: [
      {
        value: "een_beheerder",
        label: "Vooral één beheerder of sleutelpersoon",
        order: 10,
      },
      {
        value: "klein_centraal_team",
        label: "Klein centraal beheerteam",
        order: 20,
      },
      {
        value: "verdeeld_over_afdelingen",
        label: "Verdeeld over meerdere afdelingen",
        order: 30,
      },
      {
        value: "management_en_beheer_gemengd",
        label: "Beheer en besluitvorming lopen door elkaar",
        order: 40,
      },
      {
        value: "extern_ondersteund",
        label: "Sterk afhankelijk van externe ondersteuning",
        order: 50,
      },
      {
        value: "formeel_belegd",
        label: "Formeel belegd met duidelijke rollen",
        order: 60,
      },
    ],
  },
  {
    key: "standardization_context_options",
    options: [
      {
        value: "vooral_standaard",
        label: "Vooral standaard en eenduidig",
        order: 10,
      },
      {
        value: "standaard_met_beperkte_afwijkingen",
        label: "Standaard met beperkte afwijkingen",
        order: 20,
      },
      {
        value: "mix_standaard_specifiek",
        label: "Mix van standaard en specifieke inrichting",
        order: 30,
      },
      {
        value: "veel_afwijkingen",
        label: "Veel afwijkingen of uitzonderingen",
        order: 40,
      },
      {
        value: "maatwerk_zwaar",
        label: "Zware afhankelijkheid van specifieke inrichting of maatwerk",
        order: 50,
      },
      {
        value: "onduidelijk",
        label: "Moeilijk goed te beoordelen",
        order: 60,
      },
    ],
  },
  {
    key: "primary_process_chains_options",
    options: [
      {
        value: "lead_to_order",
        label: "Lead tot order",
        order: 10,
      },
      {
        value: "order_to_cash",
        label: "Order tot factuur / order-to-cash",
        order: 20,
      },
      {
        value: "procure_to_pay",
        label: "Inkoop tot betaling",
        order: 30,
      },
      {
        value: "project_to_invoice",
        label: "Project tot factuur / nacalculatie",
        order: 40,
      },
      {
        value: "hr_to_payroll",
        label: "HR-mutatie tot salaris",
        order: 50,
      },
      {
        value: "service_support",
        label: "Service, support of opvolging",
        order: 60,
      },
      {
        value: "reporting_control",
        label: "Rapportage en sturing",
        order: 70,
      },
      {
        value: "masterdata_governance",
        label: "Stamdata en beheer",
        order: 80,
      },
      {
        value: "integration_chain",
        label: "Keten van koppelingen en gegevensuitwisseling",
        order: 90,
      },
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
    key: "biggest_bottleneck_options",
    options: [
      { value: "processen", label: "Processen", order: 10 },
      { value: "afas", label: "AFAS-inrichting", order: 20 },
      {
        value: "rapportage",
        label: "Rapportage en stuurinformatie",
        order: 30,
      },
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
  {
    key: "maturity_3level_clarity_options",
    options: [
      {
        value: "onvoldoende_duidelijk",
        label: "Onvoldoende duidelijk",
        order: 10,
      },
      {
        value: "gedeeltelijk_duidelijk",
        label: "Gedeeltelijk duidelijk",
        order: 20,
      },
      {
        value: "duidelijk_belegd",
        label: "Duidelijk belegd",
        order: 30,
      },
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
      {
        value: "redelijk_eenduidig",
        label: "Redelijk eenduidig",
        order: 20,
      },
      {
        value: "gestandaardiseerd",
        label: "Overwegend gestandaardiseerd",
        order: 30,
      },
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
    key: "maturity_3level_strength_options",
    options: [
      { value: "kwetsbaar", label: "Kwetsbaar", order: 10 },
      { value: "redelijk", label: "Redelijk", order: 20 },
      { value: "sterk", label: "Sterk", order: 30 },
    ],
  },
  {
    key: "maturity_3level_usefulness_options",
    options: [
      { value: "beperkt_bruikbaar", label: "Beperkt bruikbaar", order: 10 },
      { value: "deels_bruikbaar", label: "Deels bruikbaar", order: 20 },
      { value: "goed_bruikbaar", label: "Goed bruikbaar", order: 30 },
    ],
  },
  {
    key: "maturity_3level_fit_options",
    options: [
      { value: "sluit_beperkt_aan", label: "Sluit beperkt aan", order: 10 },
      { value: "sluit_deels_aan", label: "Sluit deels aan", order: 20 },
      { value: "sluit_goed_aan", label: "Sluit goed aan", order: 30 },
    ],
  },
  {
    key: "maturity_3level_exception_practical_options",
    options: [
      { value: "vooral_handmatig", label: "Vooral handmatig", order: 10 },
      { value: "deels_beheersbaar", label: "Deels beheersbaar", order: 20 },
      { value: "goed_beheerst", label: "Goed beheerst", order: 30 },
    ],
  },
];
