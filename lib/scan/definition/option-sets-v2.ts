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
      { value: "centraal_operationeel", label: "Centraal aangestuurd", description: "Belangrijke keuzes, inrichting en werkwijze worden vooral centraal bepaald.", order: 10 },
      { value: "meerdere_teams_locaties", label: "Meerdere teams / locaties", description: "De organisatie werkt vanuit meerdere teams, vestigingen of locaties.", order: 20 },
      { value: "meerdere_entiteiten", label: "Meerdere entiteiten", description: "Er zijn meerdere bv's, administraties of organisatorische eenheden.", order: 30 },
      { value: "projectmatig", label: "Projectmatig", description: "Werk wordt voor een belangrijk deel uitgevoerd en gestuurd per project.", order: 40 },
      { value: "transactiegedreven", label: "Transactiegedreven", description: "De operatie draait vooral om repeterende transacties, volume en verwerking.", order: 50 },
      { value: "hybride", label: "Hybride", description: "De organisatie combineert meerdere werkvormen naast elkaar.", order: 60 },
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
      { value: "rapportage_dashboards", label: "Rapportage / dashboards", order: 120 },
      { value: "integraties", label: "Integraties", order: 130 },
      { value: "abonnementen", label: "Abonnementen", order: 140 },
      { value: "declaraties", label: "Declaraties", order: 150 },
      { value: "verlof_verzuim", label: "Verlof / verzuim", order: 160 },
      { value: "dossier_documentbeheer", label: "Dossier / documentbeheer", order: 170 },
      { value: "overig", label: "Overig", order: 180 },
    ],
  },
  {
    key: "ownership_model_options",
    options: [
      { value: "extern_uitbesteed", label: "Beheer uitbesteed aan externe partij", description: "Functioneel beheer en wijzigingen liggen vooral bij een externe partner.", order: 10 },
      { value: "een_beheerder", label: "1 beheerder", description: "Er is één persoon die AFAS en procesbeheer grotendeels trekt.", order: 20 },
      { value: "centraal_beheerteam", label: "Beheerdersteam (centraal geregeld)", description: "Beheer is centraal georganiseerd in een vast team of centrale beheerfunctie.", order: 30 },
      { value: "decentraal_key_users", label: "Beheer per afdeling (key-users) zonder centraal", description: "Beheer ligt verspreid bij key-users of afdelingen, zonder centrale regie.", order: 40 },
      { value: "geen_beheer", label: "Geen duidelijke beheerstructuur", description: "Er is geen duidelijke beheerstructuur of vast aanspreekpunt ingericht.", order: 50 },
    ],
  },
  {
    key: "afas_usage_duration_options",
    options: [
      { value: "korter_dan_2_jaar", label: "Minder dan 2 jaar", description: "AFAS is nog relatief recent in gebruik. De inrichting is waarschijnlijk nog jong.", order: 10 },
      { value: "tussen_2_en_5_jaar", label: "2 tot 5 jaar", description: "AFAS is al enige tijd in gebruik, maar de inrichting is nog niet heel oud.", order: 20 },
      { value: "tussen_5_en_10_jaar", label: "5 tot 10 jaar", description: "De inrichting heeft al meerdere jaren historie en waarschijnlijk meerdere wijzigingsrondes gehad.", order: 30 },
      { value: "10_jaar_of_langer", label: "10 jaar of langer", description: "AFAS heeft een lange historie binnen de organisatie. De kans op opgebouwde complexiteit is groter.", order: 40 },
      { value: "onbekend", label: "Onbekend", description: "Het is niet goed bekend sinds wanneer AFAS in gebruik is.", order: 50 },
    ],
  },
  {
    key: "maintenance_quality_options",
    options: [
      { value: "goed_onderhouden", label: "Goed onderhouden", description: "Beheer, opschoning, documentatie en wijzigingen zijn de afgelopen jaren goed bijgehouden.", order: 10 },
      { value: "redelijk_onderhouden", label: "Redelijk onderhouden", description: "De basis is bijgehouden, maar niet alles is even strak of structureel onderhouden.", order: 20 },
      { value: "achterstallig_onderhoud", label: "Achterstallig onderhoud", description: "Er is duidelijk achterstand in beheer, opschoning, documentatie of gecontroleerde wijzigingen.", order: 30 },
      { value: "moeilijk_te_beoordelen", label: "Moeilijk te beoordelen", description: "Het is op dit moment nog niet goed vast te stellen hoe goed de inrichting is onderhouden.", order: 40 },
    ],
  },
  {
    key: "expected_org_changes_options",
    options: [
      { value: "ja_waarschijnlijk", label: "Ja, waarschijnlijk", description: "Er worden naar verwachting organisatieveranderingen voorzien die impact hebben op inrichting of beheer.", order: 10 },
      { value: "mogelijk", label: "Mogelijk", description: "Er zijn signalen of plannen, maar nog geen harde zekerheid over de impact of timing.", order: 20 },
      { value: "nee", label: "Nee", description: "Er worden op dit moment geen grote organisatieveranderingen verwacht.", order: 30 },
      { value: "nog_onbekend", label: "Nog onbekend", description: "Het is nog niet duidelijk of zulke veranderingen gaan spelen.", order: 40 },
    ],
  },
  {
    key: "standardization_context_options",
    options: [
      { value: "afas_standaard", label: "AFAS Standaard", description: "De inrichting volgt grotendeels de standaard van AFAS, met weinig uitzonderingen.", order: 10 },
      { value: "standaard_met_beetje_maatwerk", label: "Standaard met een klein beetje maatwerk", description: "De basis is standaard, met enkele aanvullende uitzonderingen of beperkte aanpassingen.", order: 20 },
      { value: "veel_maatwerk", label: "Veel maatwerk", description: "De inrichting en werkwijze leunen sterk op maatwerk, uitzonderingen of afwijkende oplossingen.", order: 30 },
      { value: "moeilijk_te_beoordelen", label: "Moeilijk te beoordelen", description: "Het is nu nog niet duidelijk in hoeverre de inrichting standaard of maatwerkgedreven is.", order: 40 },
    ],
  },
  {
    key: "primary_process_chains_options",
    options: [
      { value: "lead_to_order", label: "Lead tot order", order: 10 },
      { value: "order_to_cash", label: "Order tot factuur", order: 20 },
      { value: "procure_to_pay", label: "Inkoop tot betaling", order: 30 },
      { value: "project_to_invoice", label: "Project tot factuur", order: 40 },
      { value: "hr_to_payroll", label: "HR tot salaris", order: 50 },
      { value: "service_support", label: "Service / support", order: 60 },
      { value: "reporting_control", label: "Rapportage en sturing", order: 70 },
      { value: "masterdata_governance", label: "Stamdata en beheer", order: 80 },
      { value: "integration_chain", label: "Koppelingen en uitwisseling", order: 90 },
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
      { value: "rapportage", label: "Rapportage en stuurinformatie", order: 30 },
      { value: "eigenaarschap", label: "Eigenaarschap", order: 40 },
      { value: "data_integraties", label: "Data / integraties", order: 50 },
      { value: "adoptie", label: "Adoptie en gebruik", order: 60 },
    ],
  },
  {
    key: "scope_options",
    options: [
      { value: "smal", label: "Smal", description: "Gericht op een beperkt aantal onderdelen.", order: 10 },
      { value: "normaal", label: "Normaal", description: "Een gebalanceerde scan van de belangrijkste onderdelen.", order: 20 },
      { value: "breed", label: "Breed", description: "Een brede scan over meerdere domeinen en processen.", order: 30 },
    ],
  },
  {
    key: "scope_focus_options",
    options: [
      { value: "organisatie_eigenaarschap", label: "Organisatie en eigenaarschap", order: 10 },
      { value: "processen_werkwijze", label: "Processen en werkwijze", order: 20 },
      { value: "afas_inrichting_gebruik", label: "AFAS-inrichting en gebruik", order: 30 },
      { value: "rapportage_sturing", label: "Rapportage en sturing", order: 40 },
      { value: "beheer_doorontwikkeling", label: "Beheer en doorontwikkeling", order: 50 },
    ],
  },
  {
    key: "scope_depth_options",
    options: [
      { value: "eerste_beeld", label: "Snel eerste beeld", order: 10 },
      { value: "gericht_verdiepen", label: "Gericht verdiepen", order: 20 },
      { value: "verbeterplan", label: "Basis voor concreet verbeterplan", order: 30 },
    ],
  },
  // Maturity 3-level option sets
  {
    key: "maturity_3level_clarity_options",
    options: [
      { value: "onvoldoende_duidelijk", label: "Onduidelijk", order: 10, score: 1 },
      { value: "gedeeltelijk_duidelijk", label: "Deels duidelijk", order: 20, score: 2 },
      { value: "duidelijk_belegd", label: "Duidelijk belegd", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_change_governance_options",
    options: [
      { value: "ad_hoc", label: "Ad hoc", order: 10, score: 1 },
      { value: "deels_afgestemd", label: "Deels afgestemd", order: 20, score: 2 },
      { value: "vast_proces", label: "Vast proces", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_improvement_options",
    options: [
      { value: "nauwelijks", label: "Nauwelijks", order: 10, score: 1 },
      { value: "af_en_toe", label: "Af en toe", order: 20, score: 2 },
      { value: "structureel", label: "Structureel", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_standardization_options",
    options: [
      { value: "sterk_verschillend", label: "Sterk verschillend", order: 10, score: 1 },
      { value: "redelijk_eenduidig", label: "Redelijk eenduidig", order: 20, score: 2 },
      { value: "gestandaardiseerd", label: "Grotendeels gestandaardiseerd", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_exception_control_options",
    options: [
      { value: "uitzondering_is_norm", label: "Uitzonderingen zijn de norm", order: 10, score: 1 },
      { value: "deels_beheersbaar", label: "Regelmatig maar beheersbaar", order: 20, score: 2 },
      { value: "beperkt_en_beheerst", label: "Beperkt en beheerst", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_issue_resolution_options",
    options: [
      { value: "handmatig_herstellen", label: "Vooral handmatig herstellen", order: 10, score: 1 },
      { value: "mix_ad_hoc_structureel", label: "Soms structureel, soms ad hoc", order: 20, score: 2 },
      { value: "meestal_structureel", label: "Meestal structureel opgelost", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_strength_options",
    options: [
      { value: "kwetsbaar", label: "Kwetsbaar", order: 10, score: 1 },
      { value: "redelijk", label: "Redelijk", order: 20, score: 2 },
      { value: "sterk", label: "Sterk", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_usefulness_options",
    options: [
      { value: "beperkt_bruikbaar", label: "Beperkt bruikbaar", order: 10, score: 1 },
      { value: "deels_bruikbaar", label: "Deels bruikbaar", order: 20, score: 2 },
      { value: "goed_bruikbaar", label: "Goed bruikbaar", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_fit_options",
    options: [
      { value: "sluit_beperkt_aan", label: "Sluit beperkt aan", order: 10, score: 1 },
      { value: "sluit_deels_aan", label: "Sluit deels aan", order: 20, score: 2 },
      { value: "sluit_goed_aan", label: "Sluit goed aan", order: 30, score: 3 },
    ],
  },
  {
    key: "maturity_3level_exception_practical_options",
    options: [
      { value: "vooral_handmatig", label: "Vooral handmatig", order: 10, score: 1 },
      { value: "deels_beheersbaar", label: "Deels beheersbaar", order: 20, score: 2 },
      { value: "goed_beheerst", label: "Goed beheerst", order: 30, score: 3 },
    ],
  },
  // Strategic pressure options per domain
  {
    key: "finance_strategic_pressure_options",
    options: [
      { value: "betrouwbaarheid_basis", label: "Betrouwbaarheid van de basis", description: "De grootste opgave zit in een stabiele en betrouwbare financiële basis.", order: 10 },
      { value: "uitzonderingen_handwerk", label: "Uitzonderingen en handwerk", description: "De grootste opgave zit in afwijkingen, correcties en handmatige verwerking.", order: 20 },
      { value: "stuurinformatie", label: "Stuurinformatie en inzicht", description: "De grootste opgave zit in tijdig, betrouwbaar en bruikbaar inzicht.", order: 30 },
      { value: "meerdere_administraties", label: "Complexiteit door meerdere administraties", description: "De grootste opgave zit in structuur, samenhang of afstemming tussen administraties.", order: 40 },
    ],
  },
  {
    key: "crm_strategic_pressure_options",
    options: [
      { value: "lead_opvolging", label: "Leadopvolging en commerciële discipline", description: "De grootste opgave zit in het consequent vastleggen en opvolgen van commerciële acties.", order: 10 },
      { value: "pipeline_forecast", label: "Pipeline en forecast", description: "De grootste opgave zit in grip op kansen, voortgang en verwachte omzet.", order: 20 },
      { value: "relatie_data", label: "Relatie- en contactgegevens", description: "De grootste opgave zit in kwaliteit, volledigheid en actualiteit van CRM-gegevens.", order: 30 },
      { value: "gebruik_adoptie", label: "Gebruik en adoptie", description: "De grootste opgave zit in structureel gebruik van CRM door de organisatie.", order: 40 },
    ],
  },
  {
    key: "order_strategic_pressure_options",
    options: [
      { value: "orderinvoer", label: "Orderinvoer en verwerking", description: "De grootste opgave zit in het goed en eenduidig verwerken van orders.", order: 10 },
      { value: "blokkades_vrijgave", label: "Blokkades en vrijgave", description: "De grootste opgave zit in controle, vrijgave en uitzonderingen in de orderflow.", order: 20 },
      { value: "levering_facturatie", label: "Levering en facturatie", description: "De grootste opgave zit in de doorstroming naar levering en factuur.", order: 30 },
      { value: "afwijkingen_handwerk", label: "Afwijkingen en handwerk", description: "De grootste opgave zit in afwijkende routes, uitzonderingen en handmatige ingrepen.", order: 40 },
    ],
  },
  {
    key: "hrm_strategic_pressure_options",
    options: [
      { value: "mutatieverwerking", label: "Mutatieverwerking", description: "De grootste opgave zit in het correct en tijdig verwerken van HR-mutaties.", order: 10 },
      { value: "dossiers_vastlegging", label: "Dossiers en vastlegging", description: "De grootste opgave zit in volledigheid en kwaliteit van HR-dossiers en gegevens.", order: 20 },
      { value: "proces_uniformiteit", label: "Procesuniformiteit", description: "De grootste opgave zit in eenduidige HR-processen en werkwijzen.", order: 30 },
      { value: "selfservice_gebruik", label: "Selfservice en gebruik", description: "De grootste opgave zit in gebruik door medewerkers en leidinggevenden.", order: 40 },
    ],
  },
  {
    key: "reporting_strategic_pressure_options",
    options: [
      { value: "definities_kpis", label: "Definities en KPI's", description: "De grootste opgave zit in eenduidige definities en stuurgetallen.", order: 10 },
      { value: "betrouwbaarheid_cijfers", label: "Betrouwbaarheid van cijfers", description: "De grootste opgave zit in vertrouwen in de juistheid van rapportages.", order: 20 },
      { value: "snelheid_actualiteit", label: "Snelheid en actualiteit", description: "De grootste opgave zit in tijdige beschikbaarheid van informatie.", order: 30 },
      { value: "bruikbaarheid_sturing", label: "Bruikbaarheid voor sturing", description: "De grootste opgave zit in het daadwerkelijk gebruiken van rapportage voor besluitvorming.", order: 40 },
    ],
  },
  {
    key: "integration_strategic_pressure_options",
    options: [
      { value: "stabiliteit_keten", label: "Stabiliteit van de keten", description: "De grootste opgave zit in uitval, verstoringen en continuïteit van koppelingen.", order: 10 },
      { value: "eigenaarschap_beheer", label: "Eigenaarschap en beheer", description: "De grootste opgave zit in duidelijke verantwoordelijkheid voor koppelingen en wijzigingen.", order: 20 },
      { value: "monitoring_opvolging", label: "Monitoring en opvolging", description: "De grootste opgave zit in signalering en opvolging van fouten en verstoringen.", order: 30 },
      { value: "handmatig_herstel", label: "Handmatig herstel", description: "De grootste opgave zit in afhankelijkheid van handmatige controles of herstelacties.", order: 40 },
    ],
  },
];

export function getOptionSet(key: string): OptionSetDefinition | undefined {
  return optionSets.find((os) => os.key === key);
}
