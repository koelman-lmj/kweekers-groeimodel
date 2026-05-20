import type { OptionSetDefinition } from "./types";

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
      { value: "1-25", label: "1-25 medewerkers", order: 10 },
      { value: "26-100", label: "26-100 medewerkers", order: 20 },
      { value: "101-250", label: "101-250 medewerkers", order: 30 },
      { value: "251-500", label: "251-500 medewerkers", order: 40 },
      { value: "500+", label: "500+ medewerkers", order: 50 },
    ],
  },
  {
    key: "administration_count_options",
    options: [
      { value: "1", label: "1 administratie", order: 10 },
      { value: "2-3", label: "2-3 administraties", order: 20 },
      { value: "4-10", label: "4-10 administraties", order: 30 },
      { value: "10+", label: "10+ administraties", order: 40 },
    ],
  },
  {
    key: "organization_type_options",
    options: [
      { value: "centraal", label: "Centraal aangestuurd", order: 10 },
      { value: "decentraal", label: "Decentraal / Franchise", order: 20 },
      { value: "stichting", label: "Stichting met entiteiten", order: 30 },
      { value: "groeiorganisatie", label: "Groeiorganisatie", order: 40 },
      { value: "projectmatig", label: "Projectmatig", order: 50 },
      { value: "hybride", label: "Hybride", order: 60 },
    ],
  },
  {
    key: "afas_experience_options",
    options: [
      { value: "less-than-2", label: "Minder dan 2 jaar", order: 10 },
      { value: "2-5", label: "2 tot 5 jaar", order: 20 },
      { value: "5-10", label: "5 tot 10 jaar", order: 30 },
      { value: "10+", label: "10 jaar of langer", order: 40 },
      { value: "onbekend", label: "Onbekend", order: 50 },
    ],
  },
  {
    key: "afas_usage_duration_options",
    options: [
      { value: "less-than-2", label: "Minder dan 2 jaar", order: 10 },
      { value: "2-5", label: "2 tot 5 jaar", order: 20 },
      { value: "5-10", label: "5 tot 10 jaar", order: 30 },
      { value: "10+", label: "10 jaar of langer", order: 40 },
      { value: "onbekend", label: "Onbekend", order: 50 },
    ],
  },
  {
    key: "setup_quality_options",
    options: [
      { value: "slecht", label: "Slecht onderhouden", order: 10 },
      { value: "redelijk", label: "Redelijk onderhouden", order: 20 },
      { value: "aardvaardig", label: "Aardvaardig onderhouden", order: 30 },
      { value: "goed", label: "Goed onderhouden", order: 40 },
      { value: "moeilijk", label: "Moeilijk te beoordelen", order: 50 },
    ],
  },
  {
    key: "maintenance_quality_options",
    options: [
      { value: "slecht", label: "Slecht onderhouden", order: 10 },
      { value: "redelijk", label: "Redelijk onderhouden", order: 20 },
      { value: "aardvaardig", label: "Aardvaardig onderhouden", order: 30 },
      { value: "goed", label: "Goed onderhouden", order: 40 },
      { value: "moeilijk", label: "Moeilijk te beoordelen", order: 50 },
    ],
  },
  {
    key: "expected_changes_options",
    options: [
      { value: "ja", label: "Ja, vrij zeker", order: 10 },
      { value: "nee", label: "Nee", order: 20 },
      { value: "mogelijk", label: "Mogelijk", order: 30 },
      { value: "nog-onbekend", label: "Nog onbekend", order: 40 },
    ],
  },
  {
    key: "expected_org_changes_options",
    options: [
      { value: "ja", label: "Ja, vrij zeker", order: 10 },
      { value: "nee", label: "Nee", order: 20 },
      { value: "mogelijk", label: "Mogelijk", order: 30 },
      { value: "nog-onbekend", label: "Nog onbekend", order: 40 },
    ],
  },
  {
    key: "afas_products_options",
    options: [
      // ALGEMEEN
      { value: "autorisatie", label: "Autorisatie", order: 10 },
      { value: "integraties", label: "Integraties", order: 20 },
      { value: "insite", label: "InSite", order: 30 },
      { value: "outsite", label: "OutSite", order: 40 },
      { value: "rapportage_dashboards", label: "Rapportage & Dashboards", order: 50 },
      { value: "workflow", label: "Workflow", order: 60 },
      { value: "dossier_documentbeheer", label: "Dossier & Documentbeheer", order: 70 },
      { value: "overig", label: "Overig", order: 80 },
      // ERP
      { value: "crm", label: "CRM", order: 100 },
      { value: "financieel", label: "Financieel", order: 110 },
      { value: "inkoop", label: "Inkoop", order: 120 },
      { value: "projecten", label: "Projecten", order: 130 },
      { value: "abonnementen", label: "Abonnementen", order: 140 },
      { value: "ordermanagement", label: "Ordermanagement", order: 150 },
      // HRM/Payroll
      { value: "hrm", label: "HRM", order: 200 },
      { value: "payroll", label: "Payroll", order: 210 },
      { value: "verlof_verzuim", label: "Verlof & Verzuim", order: 220 },
      { value: "declaraties", label: "Declaraties", order: 230 },
    ],
  },
  {
    key: "scan_reason_options",
    options: [
      { value: "optimalisatie", label: "Optimalisatie van huidige inrichting", order: 10 },
      { value: "groei", label: "Voorbereiding op groei", order: 20 },
      { value: "nieuwe-modules", label: "Uitbreiding met nieuwe modules", order: 30 },
      { value: "integraties", label: "Verbetering van integraties", order: 40 },
      { value: "datakwaliteit", label: "Verbetering van datakwaliteit", order: 50 },
      { value: "gebruikersadoptie", label: "Verbetering van gebruikersadoptie", order: 60 },
      { value: "rapportage", label: "Betere rapportage en inzichten", order: 70 },
      { value: "anders", label: "Anders", order: 80 },
    ],
  },
  {
    key: "pain_points_options",
    options: [
      { value: "processen", label: "Inefficiënte processen", order: 10 },
      { value: "datakwaliteit", label: "Slechte datakwaliteit", order: 20 },
      { value: "integraties", label: "Gebrekkige integraties", order: 30 },
      { value: "rapportage", label: "Onvoldoende rapportage mogelijkheden", order: 40 },
      { value: "gebruikerservaring", label: "Slechte gebruikerservaring", order: 50 },
      { value: "onderhoud", label: "Hoge onderhoudslast", order: 60 },
      { value: "kennis", label: "Gebrek aan kennis", order: 70 },
      { value: "anders", label: "Anders", order: 80 },
    ],
  },
  {
    key: "scope_breadth_options",
    options: [
      { value: "volledig", label: "Volledig (alle modules en processen)", order: 10 },
      { value: "specifiek", label: "Specifieke modules of processen", order: 20 },
      { value: "pilot", label: "Pilot / Proof of concept", order: 30 },
    ],
  },
  {
    key: "scope_options",
    options: [
      { value: "volledig", label: "Volledig (alle modules en processen)", order: 10 },
      { value: "specifiek", label: "Specifieke modules of processen", order: 20 },
      { value: "pilot", label: "Pilot / Proof of concept", order: 30 },
    ],
  },
  {
    key: "biggest_bottleneck_options",
    options: [
      { value: "processen", label: "Inefficiënte processen", order: 10 },
      { value: "datakwaliteit", label: "Slechte datakwaliteit", order: 20 },
      { value: "integraties", label: "Gebrekkige integraties", order: 30 },
      { value: "rapportage", label: "Onvoldoende rapportage mogelijkheden", order: 40 },
      { value: "gebruikerservaring", label: "Slechte gebruikerservaring", order: 50 },
      { value: "onderhoud", label: "Hoge onderhoudslast", order: 60 },
      { value: "kennis", label: "Gebrek aan kennis", order: 70 },
      { value: "anders", label: "Anders", order: 80 },
    ],
  },
  {
    key: "scope_focus_options",
    options: [
      { value: "hrm", label: "HRM & Payroll", order: 10 },
      { value: "finance", label: "Finance", order: 20 },
      { value: "crm", label: "CRM", order: 30 },
      { value: "projecten", label: "Projecten", order: 40 },
      { value: "integraties", label: "Integraties", order: 50 },
      { value: "rapportage", label: "Rapportage & Data", order: 60 },
      { value: "organisatie", label: "Organisatie & Adoptie", order: 70 },
    ],
  },
  {
    key: "scope_depth_options",
    options: [
      { value: "quick-scan", label: "Quick scan (high-level overzicht)", order: 10 },
      { value: "standaard", label: "Standaard (gebalanceerde diepgang)", order: 20 },
      { value: "diepgaand", label: "Diepgaand (gedetailleerde analyse)", order: 30 },
    ],
  },
  {
    key: "maturity_3level_options",
    options: [
      { value: "1", label: "Niet of nauwelijks", order: 10, score: 1 },
      { value: "2", label: "Gedeeltelijk", order: 20, score: 2 },
      { value: "3", label: "Grotendeels of volledig", order: 30, score: 3 },
    ],
  },
  {
    key: "yes_no_options",
    options: [
      { value: "ja", label: "Ja", order: 10 },
      { value: "nee", label: "Nee", order: 20 },
    ],
  },
  {
    key: "ownership_model_options",
    options: [
      { value: "intern", label: "Volledig intern beheer", order: 10 },
      { value: "partner", label: "Beheer door AFAS Partner", order: 20 },
      { value: "hybrid", label: "Gedeeld beheer (intern + partner)", order: 30 },
      { value: "afas", label: "Beheer door AFAS", order: 40 },
    ],
  },
  {
    key: "standardization_context_options",
    options: [
      { value: "highly-standardized", label: "Sterk gestandaardiseerd", order: 10 },
      { value: "moderately-standardized", label: "Redelijk gestandaardiseerd", order: 20 },
      { value: "customized", label: "Veel maatwerk", order: 30 },
      { value: "mixed", label: "Mix van standaard en maatwerk", order: 40 },
    ],
  },
  {
    key: "primary_process_chains_options",
    options: [
      { value: "hire-to-retire", label: "Hire to Retire (HR)", description: "Van werving tot uitdiensttreding", order: 10 },
      { value: "quote-to-cash", label: "Quote to Cash (Sales)", description: "Van offerte tot betaling ontvangen", order: 20 },
      { value: "procure-to-pay", label: "Procure to Pay (Inkoop)", description: "Van aanvraag tot betaling leverancier", order: 30 },
      { value: "record-to-report", label: "Record to Report (Finance)", description: "Van boeking tot financiële rapportage", order: 40 },
      { value: "project-lifecycle", label: "Project Lifecycle", description: "Van projectstart tot afronding", order: 50 },
      { value: "contract-to-renewal", label: "Contract to Renewal (Abonnementen)", description: "Van contract tot verlenging", order: 60 },
      { value: "recruit-to-onboard", label: "Recruit to Onboard (Werving)", description: "Van vacature tot ingewerkte medewerker", order: 70 },
      { value: "request-to-resolve", label: "Request to Resolve (Service)", description: "Van klantvraag tot oplossing", order: 80 },
      { value: "plan-to-perform", label: "Plan to Perform (Planning)", description: "Van capaciteitsplanning tot uitvoering", order: 90 },
      { value: "expense-to-payment", label: "Expense to Payment (Declaraties)", description: "Van declaratie tot uitbetaling", order: 100 },
    ],
  },
  // Diagnose maturity option sets - all variants
  {
    key: "maturity_3level_clarity_options",
    options: [
      { value: "1", label: "Niet of nauwelijks", order: 10, score: 1 },
      { value: "2", label: "Gedeeltelijk", order: 20, score: 2 },
      { value: "3", label: "Grotendeels of volledig", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_change_governance_options",
    options: [
      { value: "1", label: "Niet of nauwelijks", order: 10, score: 1 },
      { value: "2", label: "Gedeeltelijk", order: 20, score: 2 },
      { value: "3", label: "Grotendeels of volledig", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_improvement_options",
    options: [
      { value: "1", label: "Niet of nauwelijks", order: 10, score: 1 },
      { value: "2", label: "Gedeeltelijk", order: 20, score: 2 },
      { value: "3", label: "Grotendeels of volledig", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_standardization_options",
    options: [
      { value: "1", label: "Niet of nauwelijks", order: 10, score: 1 },
      { value: "2", label: "Gedeeltelijk", order: 20, score: 2 },
      { value: "3", label: "Grotendeels of volledig", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_exception_control_options",
    options: [
      { value: "1", label: "Niet of nauwelijks", order: 10, score: 1 },
      { value: "2", label: "Gedeeltelijk", order: 20, score: 2 },
      { value: "3", label: "Grotendeels of volledig", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_issue_resolution_options",
    options: [
      { value: "1", label: "Niet of nauwelijks", order: 10, score: 1 },
      { value: "2", label: "Gedeeltelijk", order: 20, score: 2 },
      { value: "3", label: "Grotendeels of volledig", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_strength_options",
    options: [
      { value: "1", label: "Niet of nauwelijks", order: 10, score: 1 },
      { value: "2", label: "Gedeeltelijk", order: 20, score: 2 },
      { value: "3", label: "Grotendeels of volledig", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_exception_practical_options",
    options: [
      { value: "1", label: "Niet of nauwelijks", order: 10, score: 1 },
      { value: "2", label: "Gedeeltelijk", order: 20, score: 2 },
      { value: "3", label: "Grotendeels of volledig", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_usefulness_options",
    options: [
      { value: "1", label: "Niet of nauwelijks", order: 10, score: 1 },
      { value: "2", label: "Gedeeltelijk", order: 20, score: 2 },
      { value: "3", label: "Grotendeels of volledig", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_fit_options",
    options: [
      { value: "1", label: "Niet of nauwelijks", order: 10, score: 1 },
      { value: "2", label: "Gedeeltelijk", order: 20, score: 2 },
      { value: "3", label: "Grotendeels of volledig", order: 30, score: 3 },
    ],
  },
  // Strategic pressure options per domain
  {
    key: "finance_strategic_pressure_options",
    options: [
      { value: "low", label: "Laag", order: 10 },
      { value: "medium", label: "Gemiddeld", order: 20 },
      { value: "high", label: "Hoog", order: 30 },
    ],
  },
  {
    key: "order_strategic_pressure_options",
    options: [
      { value: "low", label: "Laag", order: 10 },
      { value: "medium", label: "Gemiddeld", order: 20 },
      { value: "high", label: "Hoog", order: 30 },
    ],
  },
  {
    key: "crm_strategic_pressure_options",
    options: [
      { value: "low", label: "Laag", order: 10 },
      { value: "medium", label: "Gemiddeld", order: 20 },
      { value: "high", label: "Hoog", order: 30 },
    ],
  },
  {
    key: "hrm_strategic_pressure_options",
    options: [
      { value: "low", label: "Laag", order: 10 },
      { value: "medium", label: "Gemiddeld", order: 20 },
      { value: "high", label: "Hoog", order: 30 },
    ],
  },
  {
    key: "reporting_strategic_pressure_options",
    options: [
      { value: "low", label: "Laag", order: 10 },
      { value: "medium", label: "Gemiddeld", order: 20 },
      { value: "high", label: "Hoog", order: 30 },
    ],
  },
  {
    key: "integration_strategic_pressure_options",
    options: [
      { value: "low", label: "Laag", order: 10 },
      { value: "medium", label: "Gemiddeld", order: 20 },
      { value: "high", label: "Hoog", order: 30 },
    ],
  },
];
