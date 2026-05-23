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
      { value: "501-1000", label: "500–1000 medewerkers", order: 50 },
      { value: "1001-1500", label: "1000–1500 medewerkers", order: 60 },
      { value: "1500+", label: "Meer dan 1500 medewerkers", order: 70 },
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
      { value: "overig", label: "Overig", description: "Vul in de opmerking in wat de grootste opgave is.", order: 99 },
    ],
  },

  // ==========================================
  // NIEUWE VRAGEN - Diagnoseverdieping
  // ==========================================

  // Vraag 1: Belangrijkste reden voor scan
  {
    key: "scan_reason_detailed_options",
    options: [
      { value: "terugkerende_problemen", label: "Terugkerende problemen", description: "Er zijn terugkerende problemen in processen of AFAS.", order: 10 },
      { value: "beter_benutten", label: "AFAS beter benutten", description: "We willen weten of we AFAS beter kunnen benutten.", order: 20 },
      { value: "groei_fusie_verandering", label: "Groei, fusie of verandering", description: "We bereiden groei, fusie of verandering voor.", order: 30 },
      { value: "optimaliseren_of_herinrichten", label: "Optimaliseren of herinrichten", description: "We twijfelen tussen optimaliseren of herinrichten.", order: 40 },
      { value: "stuurinformatie_grip", label: "Stuurinformatie en grip", description: "We willen betere stuurinformatie en grip.", order: 50 },
      { value: "bevestiging_basis", label: "Bevestiging basis", description: "We willen vooral bevestiging dat de basis goed staat.", order: 60 },
    ],
  },

  // Vraag 2: Urgentie verbetering (score 1-3)
  {
    key: "improvement_urgency_options",
    options: [
      { value: "niet_urgent", label: "Niet urgent", description: "Verbeteren is wenselijk, maar er is geen directe druk.", order: 10, score: 1 },
      { value: "redelijk_urgent", label: "Redelijk urgent", description: "Er zijn knelpunten die merkbaar tijd of kwaliteit kosten.", order: 20, score: 2 },
      { value: "zeer_urgent", label: "Zeer urgent", description: "Problemen blokkeren groei, betrouwbaarheid of dagelijkse operatie.", order: 30, score: 3 },
    ],
  },

  // Vraag 3: Waar verliest de organisatie tijd (multi-select)
  {
    key: "time_loss_areas_options",
    options: [
      { value: "handmatige_controles", label: "Handmatige controles", order: 10 },
      { value: "dubbele_invoer", label: "Dubbele invoer", order: 20 },
      { value: "correcties_achteraf", label: "Correcties achteraf", order: 30 },
      { value: "zoeken_informatie", label: "Zoeken naar informatie", order: 40 },
      { value: "afstemming_afdelingen", label: "Afstemming tussen afdelingen", order: 50 },
      { value: "rapportages_handmatig", label: "Rapportages handmatig samenstellen", order: 60 },
      { value: "stamdata_fouten", label: "Fouten in stamdata herstellen", order: 70 },
      { value: "uitzonderingen_verwerken", label: "Uitzonderingen verwerken", order: 80 },
      { value: "onduidelijk_eigenaarschap", label: "Onduidelijkheid over wie eigenaar is", order: 90 },
    ],
  },

  // Vraag 4: Hoe vaak buiten AFAS gewerkt (score 1-3)
  {
    key: "outside_afas_frequency_options",
    options: [
      { value: "vaak", label: "Vaak", description: "Excel, mail of losse lijsten zijn nodig om het werk rond te krijgen.", order: 10, score: 1 },
      { value: "soms", label: "Soms", description: "Vooral bij uitzonderingen of controles.", order: 20, score: 2 },
      { value: "beperkt", label: "Beperkt", description: "AFAS ondersteunt het proces grotendeels.", order: 30, score: 3 },
    ],
  },

  // Vraag 5: Reden buiten AFAS werken (multi-select)
  {
    key: "outside_afas_reasons_options",
    options: [
      { value: "afas_sluit_niet_aan", label: "AFAS sluit niet goed aan op de praktijk", order: 10 },
      { value: "onvoldoende_kennis", label: "Medewerkers weten niet goed hoe AFAS gebruikt moet worden", order: 20 },
      { value: "ontbrekende_functionaliteit", label: "Er ontbreken velden, workflows of rapportages", order: 30 },
      { value: "te_ingewikkeld", label: "De inrichting is te ingewikkeld", order: 40 },
      { value: "geen_werkafspraken", label: "De werkwijze is niet goed afgesproken", order: 50 },
      { value: "data_niet_vertrouwd", label: "De data in AFAS wordt niet vertrouwd", order: 60 },
      { value: "sneller_handmatig", label: "Het is sneller om het handmatig te doen", order: 70 },
      { value: "nvt", label: "Niet van toepassing", order: 80 },
    ],
  },

  // Vraag 6: Centrale verbeterlijst/backlog (score 1-3)
  {
    key: "backlog_maturity_options",
    options: [
      { value: "geen_centrale_lijst", label: "Geen centrale lijst", description: "Verbeterpunten zitten vooral in hoofden, mails of losse lijstjes.", order: 10, score: 1 },
      { value: "deels_georganiseerd", label: "Deels georganiseerd", description: "Er is een lijst maar eigenaarschap en prioritering zijn wisselend.", order: 20, score: 2 },
      { value: "goed_georganiseerd", label: "Goed georganiseerd", description: "Verbeterpunten worden centraal vastgelegd, geprioriteerd en opgevolgd.", order: 30, score: 3 },
    ],
  },

  // Vraag 7: Wie bepaalt aanpassingen (single)
  {
    key: "change_decision_owner_options",
    options: [
      { value: "afas_beheerder", label: "De AFAS-beheerder", order: 10 },
      { value: "proceseigenaar", label: "De proceseigenaar", order: 20 },
      { value: "directie_mt", label: "De directie of het MT", order: 30 },
      { value: "afdeling_probleem", label: "De afdeling die het probleem ervaart", order: 40 },
      { value: "externe_partner", label: "Externe implementatiepartner", order: 50 },
      { value: "niet_duidelijk", label: "Dat is niet duidelijk", order: 60 },
    ],
  },

  // Vraag 8: Betrouwbaarheid stamdata (score 1-3)
  {
    key: "master_data_reliability_options",
    options: [
      { value: "kwetsbaar", label: "Kwetsbaar", description: "Gegevens zijn regelmatig onvolledig, dubbel of verouderd.", order: 10, score: 1 },
      { value: "redelijk", label: "Redelijk", description: "De basis is bruikbaar, maar vraagt regelmatig controle of correctie.", order: 20, score: 2 },
      { value: "sterk", label: "Sterk", description: "Gegevens zijn actueel, volledig en worden goed beheerd.", order: 30, score: 3 },
    ],
  },

  // Vraag 9: Welke stamdata geeft problemen (multi-select)
  {
    key: "master_data_problems_options",
    options: [
      { value: "organisaties_debiteuren_crediteuren", label: "Organisaties / debiteuren / crediteuren", order: 10 },
      { value: "contactpersonen", label: "Contactpersonen", order: 20 },
      { value: "artikelen_producten_diensten", label: "Artikelen / producten / diensten", order: 30 },
      { value: "projecten", label: "Projecten", order: 40 },
      { value: "medewerkers", label: "Medewerkers", order: 50 },
      { value: "contracten_abonnementen", label: "Contracten / abonnementen", order: 60 },
      { value: "grootboek_kostenplaatsen", label: "Grootboek / kostenplaatsen / dimensies", order: 70 },
      { value: "autorisaties_rollen", label: "Autorisaties / rollen", order: 80 },
      { value: "geen_probleemgroep", label: "Geen duidelijke probleemgroep", order: 90 },
    ],
  },

  // Vraag 10: Hoe goed gebruiken medewerkers AFAS (score 1-3)
  {
    key: "afas_adoption_level_options",
    options: [
      { value: "beperkt", label: "Beperkt", description: "Veel medewerkers werken eromheen of gebruiken AFAS verschillend.", order: 10, score: 1 },
      { value: "redelijk", label: "Redelijk", description: "De basis wordt gebruikt, maar niet overal hetzelfde.", order: 20, score: 2 },
      { value: "goed", label: "Goed", description: "AFAS wordt consequent gebruikt volgens afgesproken werkwijze.", order: 30, score: 3 },
    ],
  },

  // Vraag 11: Wat belemmert goed gebruik (multi-select)
  {
    key: "adoption_barriers_options",
    options: [
      { value: "onvoldoende_kennis_training", label: "Onvoldoende kennis of training", order: 10 },
      { value: "te_ingewikkelde_inrichting", label: "Te ingewikkelde inrichting", order: 20 },
      { value: "onduidelijke_werkafspraken", label: "Onduidelijke werkafspraken", order: 30 },
      { value: "te_weinig_tijd", label: "Te weinig tijd voor verbetering", order: 40 },
      { value: "gebrek_eigenaarschap", label: "Gebrek aan eigenaarschap", order: 50 },
      { value: "slechte_data_rapportage", label: "Slechte data of rapportage", order: 60 },
      { value: "weerstand_verandering", label: "Weerstand tegen verandering", order: 70 },
      { value: "afas_sluit_niet_aan", label: "AFAS sluit onvoldoende aan op het proces", order: 80 },
    ],
  },

  // Vraag 12: Meest waardevolle verbetering (single)
  {
    key: "most_valuable_improvement_options",
    options: [
      { value: "minder_handwerk", label: "Minder handwerk", order: 10 },
      { value: "minder_fouten", label: "Minder fouten", order: 20 },
      { value: "snellere_verwerking", label: "Snellere verwerking", order: 30 },
      { value: "betere_rapportage", label: "Betere rapportage", order: 40 },
      { value: "meer_grip_processen", label: "Meer grip op processen", order: 50 },
      { value: "betere_samenwerking", label: "Betere samenwerking tussen afdelingen", order: 60 },
      { value: "minder_afhankelijkheid_personen", label: "Minder afhankelijkheid van personen", order: 70 },
      { value: "betere_gebruikerservaring", label: "Betere gebruikerservaring", order: 80 },
      { value: "voorbereiding_groei", label: "Betere voorbereiding op groei", order: 90 },
    ],
  },
];

export function getOptionSet(key: string): OptionSetDefinition | undefined {
  return optionSets.find((os) => os.key === key);
}
