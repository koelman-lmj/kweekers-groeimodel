import type { QuestionDefinition } from "../types";

export const questions: QuestionDefinition[] = [
  {
    key: "customer_name",
    sectionCode: "profile_basis",
    order: 10,
    label: "Klantnaam",
    helpText: "Vul de naam van de organisatie in.",
    inputType: "text",
    required: true,
    placeholder: "Bijvoorbeeld: Janssen BV",
  },
  {
    key: "sector",
    sectionCode: "profile_basis",
    order: 20,
    label: "Sector",
    helpText: "Kies de sector die het beste past bij de organisatie.",
    inputType: "single_select",
    required: true,
    optionSetKey: "sector_options",
    examples: [
      "Bijvoorbeeld: zorg, onderwijs of commercieel.",
      "Kies de sector die het meest bepalend is voor processen en inrichting.",
    ],
  },
  {
    key: "organization_size",
    sectionCode: "profile_basis",
    order: 30,
    label: "Organisatiegrootte",
    helpText: "Geef aan hoe groot de organisatie ongeveer is.",
    inputType: "single_select",
    required: true,
    optionSetKey: "organization_size_options",
    examples: [
      "Denk aan het totaal aantal medewerkers dat binnen de organisatie werkt.",
      "Kies de klasse die het best past bij de huidige omvang van de organisatie.",
    ],
  },
  {
    key: "administration_count",
    sectionCode: "profile_basis",
    order: 40,
    label: "Aantal administraties / entiteiten",
    helpText: "Kies hoeveel administraties of entiteiten ongeveer in scope zijn.",
    inputType: "single_select",
    required: true,
    optionSetKey: "administration_count_options",
    examples: [
      "Denk aan aparte administraties, bv’s of andere juridische entiteiten.",
      "Kies wat het best past bij het deel van de organisatie dat je wilt beoordelen.",
    ],
  },
  {
    key: "organization_type",
    sectionCode: "profile_basis",
    order: 45,
    label: "Type organisatie en operatie",
    helpText:
      "Welke omschrijving past het best bij de manier waarop de organisatie werkt?",
    inputType: "single_select",
    required: true,
    optionSetKey: "organization_type_options",
    examples: [
      "Bijvoorbeeld: één centraal team met vaste processen.",
      "Of: meerdere locaties, entiteiten of een projectmatige werkwijze.",
    ],
  },
  {
    key: "afas_products",
    sectionCode: "profile_basis",
    order: 50,
    label: "Gebruikte AFAS-onderdelen",
    helpText:
      "Welke AFAS-onderdelen zijn nu in gebruik of relevant voor deze scan? Kies alles wat van toepassing is.",
    inputType: "multi_select",
    required: false,
    optionSetKey: "afas_products_options",
    examples: [
      "Bijvoorbeeld: Financieel, HRM, Inkoop, Ordermanagement of Workflow.",
      "Kies ook onderdelen die al wel relevant zijn voor de scan, ook als ze nog niet volledig worden benut.",
    ],
  },
  {
    key: "ownership_model",
    sectionCode: "profile_basis",
    order: 60,
    label: "Beheer van AFAS en processen",
    helpText:
      "Hoe is het beheer van AFAS en de belangrijkste processen nu georganiseerd?",
    inputType: "single_select",
    required: true,
    optionSetKey: "ownership_model_options",
    examples: [
      "Bijvoorbeeld: één beheerder, een klein centraal team of verdeeld over afdelingen.",
      "Denk ook aan de rol van externe ondersteuning of formeel belegd beheer.",
    ],
  },
  {
    key: "standardization_context",
    sectionCode: "profile_basis",
    order: 70,
    label: "Mate van standaardisatie",
    helpText:
      "Hoe zou je de huidige inrichting en werkwijze het best omschrijven?",
    inputType: "single_select",
    required: true,
    optionSetKey: "standardization_context_options",
    examples: [
      "Bijvoorbeeld: vooral standaard en eenduidig.",
      "Of: veel afwijkingen, uitzonderingen of afhankelijkheid van specifieke inrichting.",
    ],
  },
  {
    key: "primary_process_chains",
    sectionCode: "profile_basis",
    order: 80,
    label: "Belangrijkste procesketens",
    helpText:
      "Welke procesketens zijn voor deze scan het belangrijkst? Kies maximaal 3.",
    inputType: "multi_select",
    required: true,
    optionSetKey: "primary_process_chains_options",
    maxSelections: 3,
    examples: [
      "Bijvoorbeeld: order tot factuur, inkoop tot betaling of HR-mutatie tot salaris.",
      "Kies alleen de ketens die nu het belangrijkst zijn voor de scan.",
    ],
  },
  {
    key: "scan_reason",
    sectionCode: "profile_reason",
    order: 10,
    label: "Aanleiding en doel van de scan",
    helpText:
      "Wat is de belangrijkste reden om deze scan nu te doen en wat moet deze opleveren?",
    inputType: "single_select",
    required: true,
    optionSetKey: "scan_reason_options",
    examples: [
      "Bijvoorbeeld: nulmeting, optimalisatie, herinrichting of voorbereiding op groei.",
      "Kies de reden die nu het zwaarst weegt voor deze scan.",
    ],
  },
  {
    key: "biggest_bottleneck",
    sectionCode: "profile_reason",
    order: 20,
    label: "Belangrijkste knelpunten op dit moment",
    helpText:
      "Welke onderwerpen veroorzaken nu de meeste frictie of onduidelijkheid? Kies maximaal 3.",
    inputType: "multi_select",
    required: true,
    optionSetKey: "biggest_bottleneck_options",
    maxSelections: 3,
    examples: [
      "Bijvoorbeeld: processen lopen niet eenduidig, eigenaarschap is onduidelijk of rapportages geven te weinig grip.",
      "Kies alleen de onderwerpen die nu echt de meeste druk of onrust veroorzaken.",
    ],
  },
  {
    key: "scope",
    sectionCode: "scope",
    order: 10,
    label: "Breedte van de scan",
    helpText: "Kies hoe breed je de scan wilt uitvoeren.",
    inputType: "single_select",
    required: true,
    optionSetKey: "scope_options",
    examples: [
      "Smal: gericht op een beperkt aantal onderwerpen.",
      "Breed: meerdere domeinen en processen in samenhang bekijken.",
    ],
  },
  {
    key: "scope_focus",
    sectionCode: "scope",
    order: 20,
    label: "Belangrijkste focusgebieden",
    helpText: "Welke onderwerpen vragen nu de meeste aandacht? Kies maximaal 2.",
    inputType: "multi_select",
    required: true,
    optionSetKey: "scope_focus_options",
    maxSelections: 2,
    examples: [
      "Bijvoorbeeld: processen en werkwijze, AFAS-inrichting en gebruik, of rapportage en sturing.",
      "Kies de gebieden waar de scan bewust extra scherpte op moet aanbrengen.",
    ],
  },
  {
    key: "scope_depth",
    sectionCode: "scope",
    order: 30,
    label: "Gewenst detailniveau",
    helpText: "Hoe diep wil je in deze scan kijken?",
    inputType: "single_select",
    required: true,
    optionSetKey: "scope_depth_options",
    examples: [
      "Snel eerste beeld: vooral richting en hoofdlijnen.",
      "Basis voor concreet verbeterplan: meer detail en meer houvast voor opvolging.",
    ],
  },
  {
    key: "ownership_clarity",
    sectionCode: "diagnose",
    order: 10,
    label: "Eigenaarschap van processen en inrichting",
    helpText: "Hoe duidelijk is het eigenaarschap van processen en inrichting?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_clarity_options",
    allowsComment: true,
    examples: [
      "Bijvoorbeeld: is duidelijk wie beslist over wijzigingen in processen of AFAS?",
      "Denk aan: wie is eigenaar van orderverwerking, facturatie, inkoop of HR-processen?",
    ],
  },
  {
    key: "change_decision_process",
    sectionCode: "diagnose",
    order: 20,
    label: "Besluitvorming over wijzigingen",
    helpText:
      "Hoe gestructureerd worden wijzigingen in processen of AFAS besloten?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_change_governance_options",
    allowsComment: true,
    examples: [
      "Bijvoorbeeld: worden wijzigingen besproken in een vast overleg of vooral ad hoc doorgevoerd?",
      "Denk aan: is er een duidelijke route voor wijzigingsverzoeken en besluiten?",
    ],
  },
  {
    key: "improvement_governance",
    sectionCode: "diagnose",
    order: 30,
    label: "Sturing op verbetering",
    helpText:
      "In welke mate wordt actief gestuurd op verbetering van processen en inrichting?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_improvement_options",
    allowsComment: true,
    examples: [
      "Bijvoorbeeld: worden knelpunten structureel opgevolgd of alleen opgelost als het misgaat?",
      "Denk aan: is er een vast ritme om processen en inrichting te evalueren en verbeteren?",
    ],
  },
  {
    key: "process_standardization",
    sectionCode: "diagnose",
    order: 40,
    label: "Eenduidigheid van werkwijze",
    helpText: "Hoe eenduidig worden de belangrijkste processen uitgevoerd?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_standardization_options",
    allowsComment: true,
    examples: [
      "Bijvoorbeeld: werken teams of medewerkers op dezelfde manier, of verschilt dit sterk per persoon?",
      "Denk aan: orderverwerking, inkoop, mutaties of goedkeuringen.",
    ],
  },
  {
    key: "exception_control",
    sectionCode: "diagnose",
    order: 50,
    label: "Omgaan met uitzonderingen",
    helpText: "Hoe beheersbaar zijn uitzonderingen binnen de processen?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_exception_control_options",
    allowsComment: true,
    examples: [
      "Bijvoorbeeld: zijn afwijkingen vastgelegd en beheersbaar, of lossen mensen ze vooral handmatig op?",
      "Denk aan spoedroutes, uitzonderlijke facturen, afwijkende orders of speciale klantafspraken.",
    ],
  },
  {
    key: "issue_resolution",
    sectionCode: "diagnose",
    order: 60,
    label: "Structureel oplossen van knelpunten",
    helpText: "Hoe worden terugkerende fouten of knelpunten meestal aangepakt?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_issue_resolution_options",
    allowsComment: true,
    examples: [
      "Bijvoorbeeld: wordt een probleem eenmalig opgelost, of wordt ook de oorzaak aangepakt?",
      "Denk aan terugkerende fouten, handwerk, uitzonderingen of afhankelijkheid van bepaalde personen.",
    ],
  },

  // Conditioneel - Financieel
  {
    key: "finance_foundation_reliability",
    sectionCode: "diagnose",
    order: 110,
    label: "Betrouwbaarheid van de financiële basis",
    helpText:
      "Hoe betrouwbaar en eenduidig is de financiële basisinrichting waarop processen en rapportages steunen?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_strength_options",
    allowsComment: true,
    examples: [
      "Denk aan administratie, grootboek, dagboeken en basisinrichting.",
      "Zijn financiële gegevens stabiel genoeg voor rapportage en sturing?",
    ],
    visibleWhen: [
      { field: "afas_products", operator: "includes", value: "financieel" },
      {
        field: "scope_depth",
        operator: "one_of",
        value: ["gericht_verdiepen", "verbeterplan"],
      },
    ],
  },
  {
    key: "finance_exception_handling",
    sectionCode: "diagnose",
    order: 120,
    label: "Uitzonderingen in financiële verwerking",
    helpText:
      "Hoe beheersbaar zijn uitzonderingen in boekingen, facturen of financiële correcties?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_exception_practical_options",
    allowsComment: true,
    examples: [
      "Denk aan memoriaalboekingen, afwijkende facturen of correcties.",
      "Worden afwijkingen vast opgevangen of telkens opnieuw opgelost?",
    ],
    visibleWhen: [
      { field: "afas_products", operator: "includes", value: "financieel" },
    ],
  },
  {
    key: "finance_reporting_maturity",
    sectionCode: "diagnose",
    order: 130,
    label: "Financiële stuurinformatie",
    helpText:
      "In welke mate ondersteunt financiële rapportage de dagelijkse en bestuurlijke sturing?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_usefulness_options",
    allowsComment: true,
    examples: [
      "Denk aan tijdigheid, betrouwbaarheid en eenduidige definities.",
      "Kun je op basis van de cijfers echt sturen?",
    ],
    visibleWhen: [
      { field: "afas_products", operator: "includes", value: "financieel" },
      {
        field: "scope_focus",
        operator: "includes",
        value: "rapportage_sturing",
      },
    ],
  },

  // Conditioneel - Ordermanagement
  {
    key: "order_flow_standardization",
    sectionCode: "diagnose",
    order: 210,
    label: "Eenduidigheid van de orderroute",
    helpText:
      "Hoe eenduidig verloopt het proces van orderinvoer naar levering en facturatie?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_standardization_options",
    allowsComment: true,
    examples: [
      "Denk aan orderinvoer, blokkades, levering en facturatie.",
      "Werkt iedereen vanuit dezelfde standaardroute?",
    ],
    visibleWhen: [
      { field: "afas_products", operator: "includes", value: "ordermanagement" },
    ],
  },
  {
    key: "order_exception_complexity",
    sectionCode: "diagnose",
    order: 220,
    label: "Afwijkingen in orderafhandeling",
    helpText:
      "Hoe vaak wijkt het orderproces af van de standaardroute en hoe beheersbaar is dat?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_exception_control_options",
    allowsComment: true,
    examples: [
      "Denk aan speciale prijsafspraken, uitzonderlijke leveringen of handmatige ingrepen.",
      "Zijn afwijkingen onderdeel van het ontwerp of steeds een noodoplossing?",
    ],
    visibleWhen: [
      { field: "afas_products", operator: "includes", value: "ordermanagement" },
      {
        field: "primary_process_chains",
        operator: "includes",
        value: "order_to_cash",
      },
    ],
  },
  {
    key: "order_system_fit",
    sectionCode: "diagnose",
    order: 230,
    label: "Aansluiting tussen orderproces en AFAS-inrichting",
    helpText:
      "In welke mate ondersteunt AFAS de gewenste orderwerkwijze zonder veel omwegen of workarounds?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_fit_options",
    allowsComment: true,
    examples: [
      "Denk aan orderstatussen, blokkades, workflows en facturatiemomenten.",
      "Is de gewenste route in AFAS goed ondersteund?",
    ],
    visibleWhen: [
      { field: "afas_products", operator: "includes", value: "ordermanagement" },
      {
        field: "scope_focus",
        operator: "includes",
        value: "afas_inrichting_gebruik",
      },
    ],
  },

  // Conditioneel - Zorg
  {
    key: "care_registration_exceptions",
    sectionCode: "diagnose",
    order: 310,
    label: "Uitzonderingen in registratie of declaratie",
    helpText:
      "Hoe beheersbaar zijn uitzonderingen in registratie, declaratie of administratieve verwerking?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_exception_control_options",
    allowsComment: true,
    examples: [
      "Denk aan afwijkende registraties, correcties of uitzonderlijke declaraties.",
      "Moeten mensen vaak handmatig herstellen?",
    ],
    visibleWhen: [{ field: "sector", operator: "equals", value: "zorg" }],
  },
  {
    key: "care_accountability_pressure",
    sectionCode: "diagnose",
    order: 320,
    label: "Ondersteuning van verantwoording en controle",
    helpText:
      "In welke mate ondersteunen processen en inrichting tijdige en betrouwbare verantwoording?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_usefulness_options",
    allowsComment: true,
    examples: [
      "Denk aan controle, dossiervorming, rapportage en onderbouwing.",
      "Is de informatie snel en betrouwbaar beschikbaar?",
    ],
    visibleWhen: [
      { field: "sector", operator: "equals", value: "zorg" },
      {
        field: "scope_focus",
        operator: "includes",
        value: "rapportage_sturing",
      },
    ],
  },

  // Conditioneel - Onderwijs
  {
    key: "education_intake_planning_consistency",
    sectionCode: "diagnose",
    order: 410,
    label: "Eenduidigheid van intake en planning",
    helpText:
      "Hoe eenduidig verlopen intake, planning en administratieve verwerking van trajecten of opleidingen?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_standardization_options",
    allowsComment: true,
    examples: [
      "Denk aan intake, inschrijving, planning en administratieve verwerking.",
      "Werkt iedereen vanuit dezelfde route?",
    ],
    visibleWhen: [{ field: "sector", operator: "equals", value: "onderwijs" }],
  },
  {
    key: "education_process_admin_alignment",
    sectionCode: "diagnose",
    order: 420,
    label: "Aansluiting tussen onderwijsproces en administratie",
    helpText:
      "Hoe goed sluiten uitvoering, planning en administratieve afhandeling op elkaar aan?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_fit_options",
    allowsComment: true,
    examples: [
      "Denk aan wijzigingen in planning, deelnemers, trajecten of facturatie.",
      "Ontstaan fouten vooral bij de overdracht tussen uitvoering en administratie?",
    ],
    visibleWhen: [
      { field: "sector", operator: "equals", value: "onderwijs" },
      {
        field: "primary_process_chains",
        operator: "one_of",
        value: ["project_to_invoice", "order_to_cash"],
      },
    ],
  },
  {
    key: "education_exception_handling",
    sectionCode: "diagnose",
    order: 430,
    label: "Uitzonderingen in traject- of cursusadministratie",
    helpText:
      "Hoe beheersbaar zijn uitzonderingen in trajecten, planning of administratieve verwerking?",
    inputType: "single_select",
    required: true,
    optionSetKey: "maturity_3level_exception_control_options",
    allowsComment: true,
    examples: [
      "Denk aan last-minute wijzigingen, afwijkende trajecten of handmatige correcties.",
      "Zijn afwijkingen onderdeel van het ontwerp of vooral ad hoc opgelost?",
    ],
    visibleWhen: [{ field: "sector", operator: "equals", value: "onderwijs" }],
  },
];
