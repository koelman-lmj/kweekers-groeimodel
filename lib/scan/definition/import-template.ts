export type ImportColumnDefinition = {
  key: string;
  label: string;
  required: boolean;
  description: string;
  example: string;
};

export type ImportSheetDefinition = {
  key: string;
  title: string;
  description: string;
  columns: ImportColumnDefinition[];
};

export const importTemplateSheets: ImportSheetDefinition[] = [
  {
    key: "categories",
    title: "Categorieën",
    description:
      "Hoofdgroepen waaronder dimensies in de samenvatting worden getoond.",
    columns: [
      {
        key: "code",
        label: "Code",
        required: true,
        description: "Unieke technische code van de categorie.",
        example: "AFAS Modules",
      },
      {
        key: "title",
        label: "Titel",
        required: true,
        description: "Naam die zichtbaar wordt in de samenvatting.",
        example: "AFAS Modules",
      },
      {
        key: "description",
        label: "Omschrijving",
        required: true,
        description: "Korte uitleg die onder de categorienaam wordt getoond.",
        example: "Hoe sterk zijn de gekozen modules nu ingericht en bruikbaar?",
      },
      {
        key: "order",
        label: "Volgorde",
        required: true,
        description: "Numerieke volgorde waarin categorieën worden getoond.",
        example: "10",
      },
    ],
  },
  {
    key: "dimensions",
    title: "Dimensies",
    description:
      "Thema’s waarop de scan scoort en waaruit prioriteiten worden opgebouwd.",
    columns: [
      {
        key: "code",
        label: "Code",
        required: true,
        description: "Unieke technische code van de dimensie.",
        example: "crm",
      },
      {
        key: "title",
        label: "Titel",
        required: true,
        description: "Naam van de dimensie zoals zichtbaar in output.",
        example: "CRM",
      },
      {
        key: "category",
        label: "Categorie",
        required: true,
        description:
          "Categorie waaronder deze dimensie valt. Moet bestaan in categories.",
        example: "AFAS Modules",
      },
      {
        key: "order",
        label: "Volgorde",
        required: true,
        description: "Numerieke volgorde binnen de definitie.",
        example: "100",
      },
      {
        key: "isActive",
        label: "Actief",
        required: false,
        description: "Geeft aan of deze dimensie actief is.",
        example: "true",
      },
    ],
  },
  {
    key: "questions",
    title: "Vragen",
    description:
      "Alle vragen van de scan, inclusief koppeling aan sectie, dimensie, score en antwoordopties.",
    columns: [
      {
        key: "key",
        label: "Key",
        required: true,
        description: "Unieke technische sleutel van de vraag.",
        example: "crm_data_quality",
      },
      {
        key: "sectionCode",
        label: "Sectie",
        required: true,
        description: "Stap/sectie waarin de vraag wordt gesteld.",
        example: "diagnose",
      },
      {
        key: "order",
        label: "Volgorde",
        required: true,
        description: "Numerieke volgorde binnen de sectie.",
        example: "530",
      },
      {
        key: "label",
        label: "Vraagtekst",
        required: true,
        description: "Vraag zoals de gebruiker deze ziet.",
        example: "Kwaliteit van CRM-gegevens",
      },
      {
        key: "helpText",
        label: "Helptekst",
        required: false,
        description: "Korte uitleg onder de vraag.",
        example: "Kies hoe betrouwbaar en bruikbaar de CRM-gegevens nu zijn.",
      },
      {
        key: "inputType",
        label: "Input type",
        required: true,
        description:
          "Type invoer. Bijvoorbeeld text, textarea, single_select of multi_select.",
        example: "single_select",
      },
      {
        key: "required",
        label: "Verplicht",
        required: true,
        description: "Geeft aan of de vraag verplicht is.",
        example: "true",
      },
      {
        key: "optionSetKey",
        label: "Option set",
        required: false,
        description:
          "Verwijzing naar de antwoordopties. Nodig bij single_select en multi_select.",
        example: "maturity_3level_usefulness_options",
      },
      {
        key: "dimensionCode",
        label: "Dimensie",
        required: false,
        description:
          "Dimensie waarop deze vraag invloed heeft. Nodig voor scorevragen.",
        example: "crm",
      },
      {
        key: "category",
        label: "Categorie",
        required: false,
        description:
          "Categorie voor output. Bij voorkeur gelijk aan categorie van de dimensie.",
        example: "AFAS Modules",
      },
      {
        key: "outputRole",
        label: "Outputrol",
        required: false,
        description:
          "Rol in de output. Bijvoorbeeld score, context of evidence.",
        example: "score",
      },
      {
        key: "scoreEnabled",
        label: "Telt mee in score",
        required: false,
        description:
          "Geeft aan of deze vraag meetelt in de scoreberekening.",
        example: "true",
      },
      {
        key: "scoreWeight",
        label: "Scoregewicht",
        required: false,
        description:
          "Relatief gewicht van deze vraag binnen de dimensie. Voor nu meestal 1.",
        example: "1",
      },
      {
        key: "maxSelections",
        label: "Max. keuzes",
        required: false,
        description: "Maximum aantal keuzes bij multi_select.",
        example: "3",
      },
      {
        key: "allowsComment",
        label: "Opmerking toestaan",
        required: false,
        description: "Geeft aan of bij deze vraag een opmerking mag worden ingevuld.",
        example: "true",
      },
      {
        key: "placeholder",
        label: "Placeholder",
        required: false,
        description: "Voorbeeldtekst in tekstvelden.",
        example: "Bijvoorbeeld: Janssen BV",
      },
      {
        key: "visibleWhen",
        label: "Zichtbaar wanneer",
        required: false,
        description:
          "Voorwaardelijke zichtbaarheid als JSON. Later bruikbaar voor import.",
        example:
          '[{"field":"afas_products","operator":"includes","value":"crm"}]',
      },
      {
        key: "examples",
        label: "Voorbeelden",
        required: false,
        description:
          "Voorbeelden of hints, gescheiden door een pipe-teken.",
        example:
          "Denk aan volledigheid van gegevens|Kun je op de gegevens vertrouwen?",
      },
    ],
  },
  {
    key: "optionSets",
    title: "Option sets",
    description:
      "Groepen van antwoordopties die door vragen worden gebruikt.",
    columns: [
      {
        key: "key",
        label: "Key",
        required: true,
        description: "Unieke technische sleutel van de option set.",
        example: "maturity_3level_usefulness_options",
      },
      {
        key: "description",
        label: "Omschrijving",
        required: false,
        description: "Korte uitleg waarvoor deze option set wordt gebruikt.",
        example: "Algemene 3-punts volwassenheidsschaal voor bruikbaarheid.",
      },
    ],
  },
  {
    key: "options",
    title: "Antwoordopties",
    description:
      "Losse antwoordopties binnen een option set, inclusief volgorde en score.",
    columns: [
      {
        key: "optionSetKey",
        label: "Option set",
        required: true,
        description: "Verwijzing naar de option set waartoe deze optie behoort.",
        example: "maturity_3level_usefulness_options",
      },
      {
        key: "value",
        label: "Waarde",
        required: true,
        description: "Technische waarde die wordt opgeslagen.",
        example: "beperkt_bruikbaar",
      },
      {
        key: "label",
        label: "Label",
        required: true,
        description: "Tekst die de gebruiker ziet.",
        example: "Beperkt bruikbaar",
      },
      {
        key: "description",
        label: "Omschrijving",
        required: false,
        description: "Extra uitleg bij deze keuze.",
        example: "De informatie is beperkt bruikbaar voor sturing.",
      },
      {
        key: "order",
        label: "Volgorde",
        required: true,
        description: "Numerieke volgorde binnen de option set.",
        example: "10",
      },
      {
        key: "score",
        label: "Score",
        required: false,
        description:
          "Numerieke score voor berekening. Bijvoorbeeld 1, 2 of 3.",
        example: "1",
      },
    ],
  },
];

export function getImportTemplateSheet(
  key: string
): ImportSheetDefinition | undefined {
  return importTemplateSheets.find((sheet) => sheet.key === key);
}
