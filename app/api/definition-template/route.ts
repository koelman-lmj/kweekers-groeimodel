import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

// Geldige waarden voor dropdown-validatie
const VALID_CATEGORIES = [
  "AFAS Modules",
  "Integraties & Beheer",
  "Rapportage & Data",
  "Organisatie & Beheer",
  "Branchespecifiek",
];

const VALID_OUTPUT_ROLES = [
  "score",
  "context",
  "evidence",
  "advice",
];

const VALID_INPUT_TYPES = [
  "single_select",
  "multi_select",
  "text",
];

const VALID_BOOLEAN = ["true", "false"];

// Kolomdefinitie met leesbare naam, technische naam en uitleg
type ColumnDefinition = {
  key: string;           // technische naam (voor importflow)
  header: string;        // leesbare naam (voor key-user)
  description: string;   // uitleg in instructietab
  width: number;
  dropdown?: string[];   // toegestane waarden
  required: boolean;
};

type SheetDefinition = {
  name: string;
  title: string;
  description: string;
  columns: ColumnDefinition[];
  examples: string[][];
};

const sheets: SheetDefinition[] = [
  {
    name: "categories",
    title: "Categorieën",
    description: "Hoofdindeling van het groeimodel. Elke categorie groepeert meerdere dimensies.",
    columns: [
      {
        key: "code",
        header: "Code *",
        description: "Unieke technische sleutel voor de categorie (geen spaties, kleine letters). Voorbeeld: organisatie",
        width: 20,
        required: true,
      },
      {
        key: "title",
        header: "Naam *",
        description: "Leesbare naam van de categorie zoals die in de scan verschijnt. Voorbeeld: Organisatie & Beheer",
        width: 28,
        required: true,
      },
      {
        key: "description",
        header: "Omschrijving",
        description: "Korte toelichting op wat deze categorie inhoudt.",
        width: 45,
        required: false,
      },
      {
        key: "order",
        header: "Volgorde *",
        description: "Getal dat de volgorde bepaalt (10, 20, 30...). Lagere nummers komen eerst.",
        width: 14,
        required: true,
      },
    ],
    examples: [
      ["organisatie", "Organisatie & Beheer", "Vragen over eigenaarschap, sturing en werkwijze.", "10"],
      ["processen", "Processen & Kwaliteit", "Vragen over procesbeheersing en kwaliteitsbewaking.", "20"],
    ],
  },

  {
    name: "dimensions",
    title: "Dimensies",
    description: "Beoordelingsgebieden binnen het groeimodel. Elke dimensie hoort bij één categorie.",
    columns: [
      {
        key: "code",
        header: "Code *",
        description: "Unieke technische sleutel voor de dimensie (geen spaties, kleine letters). Voorbeeld: eigenaarschap",
        width: 22,
        required: true,
      },
      {
        key: "title",
        header: "Naam *",
        description: "Leesbare naam van de dimensie zoals die in rapportages verschijnt.",
        width: 28,
        required: true,
      },
      {
        key: "category",
        header: "Categorie *",
        description: `Kies de categorie waartoe deze dimensie behoort. Kies uit: ${VALID_CATEGORIES.join(", ")}`,
        width: 26,
        dropdown: VALID_CATEGORIES,
        required: true,
      },
      {
        key: "order",
        header: "Volgorde *",
        description: "Getal dat de volgorde bepaalt (10, 20, 30...). Lagere nummers komen eerst.",
        width: 14,
        required: true,
      },
      {
        key: "isActive",
        header: "Actief",
        description: "Vul 'true' in om de dimensie te activeren, 'false' om hem uit te zetten.",
        width: 12,
        dropdown: VALID_BOOLEAN,
        required: false,
      },
    ],
    examples: [
      ["eigenaarschap", "Eigenaarschap", "Organisatie & Beheer", "10", "true"],
      ["processtandaardisatie", "Processtandaardisatie", "Organisatie & Beheer", "20", "true"],
    ],
  },

  {
    name: "sections",
    title: "Secties",
    description: "De hoofdstukken of stappen waaruit de scan is opgebouwd. Vragen worden gekoppeld aan secties.",
    columns: [
      {
        key: "code",
        header: "Code *",
        description: "Unieke technische sleutel voor de sectie (geen spaties, kleine letters). Voorbeeld: diagnose",
        width: 20,
        required: true,
      },
      {
        key: "title",
        header: "Naam *",
        description: "Volledige naam van de sectie zoals die in de scan verschijnt.",
        width: 28,
        required: true,
      },
      {
        key: "shortTitle",
        header: "Korte naam",
        description: "Verkorte naam voor gebruik in navigatie of overzichten.",
        width: 20,
        required: false,
      },
      {
        key: "phase",
        header: "Fase",
        description: "Optionele fase of stap waar deze sectie bij hoort. Voorbeeld: scan, advies",
        width: 16,
        required: false,
      },
      {
        key: "order",
        header: "Volgorde *",
        description: "Getal dat de volgorde van de secties bepaalt (10, 20, 30...).",
        width: 14,
        required: true,
      },
      {
        key: "summaryEnabled",
        header: "Samenvatting",
        description: "Vul 'true' in als er een samenvattingspagina voor deze sectie is.",
        width: 16,
        dropdown: VALID_BOOLEAN,
        required: false,
      },
      {
        key: "nextSectionCode",
        header: "Volgende sectie",
        description: "Code van de sectie die na deze sectie volgt. Leeg laten als er geen vaste volgorde is.",
        width: 20,
        required: false,
      },
    ],
    examples: [
      ["diagnose", "Diagnose", "Diagnose", "scan", "10", "true", "advies"],
      ["advies", "Advies & Aanbevelingen", "Advies", "advies", "20", "false", ""],
    ],
  },

  {
    name: "option-sets",
    title: "Antwoordopties",
    description: "Herbruikbare sets met antwoordmogelijkheden. Elke rij is één antwoordoptie. Meerdere opties met dezelfde sleutel vormen één set.",
    columns: [
      {
        key: "key",
        header: "Sleutel set *",
        description: "Technische naam van de antwoordset. Meerdere opties met dezelfde sleutel horen bij dezelfde set. Voorbeeld: volwassenheidsniveau_3",
        width: 30,
        required: true,
      },
      {
        key: "title",
        header: "Naam set",
        description: "Leesbare naam van de antwoordset. Vul alleen in bij de eerste rij van de set.",
        width: 28,
        required: false,
      },
      {
        key: "value",
        header: "Waarde *",
        description: "Technische waarde van deze antwoordoptie (geen spaties). Voorbeeld: laag, midden, hoog",
        width: 18,
        required: true,
      },
      {
        key: "label",
        header: "Label *",
        description: "Leesbare tekst van deze antwoordoptie zoals die in de scan verschijnt. Voorbeeld: Laag niveau",
        width: 28,
        required: true,
      },
      {
        key: "description",
        header: "Toelichting",
        description: "Optionele uitleg bij deze antwoordoptie.",
        width: 40,
        required: false,
      },
      {
        key: "order",
        header: "Volgorde *",
        description: "Volgorde van de antwoordoptie binnen de set (10, 20, 30...).",
        width: 14,
        required: true,
      },
      {
        key: "score",
        header: "Score",
        description: "Numerieke score voor deze antwoordoptie (getal). Voorbeeld: 1, 2, 3",
        width: 12,
        required: false,
      },
      {
        key: "adviceSignal",
        header: "Advies signaal",
        description: "Optioneel signaal voor het adviesalgoritme. Voorbeeld: aandacht, goed, risico",
        width: 18,
        required: false,
      },
    ],
    examples: [
      ["volwassenheidsniveau_3", "Volwassenheidsniveau (3 niveaus)", "laag", "Laag — weinig structuur", "Er is nog weinig structuur of bewustzijn.", "10", "1", "aandacht"],
      ["volwassenheidsniveau_3", "", "midden", "Midden — gedeeltelijk ingericht", "Er is een begin gemaakt maar het is niet consistent.", "20", "2", ""],
      ["volwassenheidsniveau_3", "", "hoog", "Hoog — goed ingericht", "Er is een duidelijke, consistente werkwijze.", "30", "3", "goed"],
    ],
  },

  {
    name: "questions",
    title: "Vragen",
    description: "De vragen die in de scan worden gesteld. Elke rij is één vraag.",
    columns: [
      {
        key: "key",
        header: "Sleutel *",
        description: "Unieke technische sleutel voor de vraag (geen spaties, kleine letters, underscores toegestaan). Voorbeeld: eigenaarschap_processen",
        width: 32,
        required: true,
      },
      {
        key: "sectionCode",
        header: "Sectie *",
        description: "Code van de sectie waar deze vraag bij hoort. Moet overeenkomen met een code in het tabblad Secties.",
        width: 20,
        required: true,
      },
      {
        key: "order",
        header: "Volgorde *",
        description: "Volgorde van de vraag binnen de sectie (10, 20, 30...). Lagere nummers komen eerst.",
        width: 14,
        required: true,
      },
      {
        key: "label",
        header: "Vraagtekst *",
        description: "De volledige tekst van de vraag zoals die in de scan verschijnt.",
        width: 45,
        required: true,
      },
      {
        key: "helpText",
        header: "Toelichting",
        description: "Optionele uitleg bij de vraag die de invuller helpt het antwoord te bepalen.",
        width: 45,
        required: false,
      },
      {
        key: "inputType",
        header: "Type antwoord *",
        description: "Hoe de vraag beantwoord wordt. Kies: single_select (één optie), multi_select (meerdere opties), text (vrije tekst)",
        width: 18,
        dropdown: VALID_INPUT_TYPES,
        required: true,
      },
      {
        key: "required",
        header: "Verplicht",
        description: "Vul 'true' in als de vraag verplicht beantwoord moet worden.",
        width: 14,
        dropdown: VALID_BOOLEAN,
        required: false,
      },
      {
        key: "optionSetKey",
        header: "Antwoordset",
        description: "Sleutel van de antwoordset (uit tabblad Antwoordopties). Alleen invullen bij single_select of multi_select.",
        width: 28,
        required: false,
      },
      {
        key: "dimensionCode",
        header: "Dimensie",
        description: "Code van de dimensie waar deze vraag betrekking op heeft (uit tabblad Dimensies).",
        width: 24,
        required: false,
      },
      {
        key: "category",
        header: "Categorie",
        description: `Categorie van deze vraag. Kies uit: ${VALID_CATEGORIES.join(", ")}`,
        width: 26,
        dropdown: VALID_CATEGORIES,
        required: false,
      },
      {
        key: "outputRole",
        header: "Rol in output",
        description: "Bepaalt hoe het antwoord wordt gebruikt in de output. score = telt mee in score, context = achtergrondinfo, evidence = bewijs, advice = adviesinput",
        width: 18,
        dropdown: VALID_OUTPUT_ROLES,
        required: false,
      },
      {
        key: "scoreEnabled",
        header: "Score actief",
        description: "Vul 'true' in als het antwoord op deze vraag meetelt in de score.",
        width: 14,
        dropdown: VALID_BOOLEAN,
        required: false,
      },
      {
        key: "scoreWeight",
        header: "Scoregewicht",
        description: "Gewicht van de vraag in de score (getal). Standaard 1. Hogere waarden tellen zwaarder mee.",
        width: 16,
        required: false,
      },
      {
        key: "maxSelections",
        header: "Max. selecties",
        description: "Maximaal aantal antwoorden bij multi_select. Leeg laten voor onbeperkt.",
        width: 16,
        required: false,
      },
      {
        key: "allowsComment",
        header: "Toelichting toestaan",
        description: "Vul 'true' in als de invuller een vrije toelichting mag toevoegen bij het antwoord.",
        width: 22,
        dropdown: VALID_BOOLEAN,
        required: false,
      },
      {
        key: "placeholder",
        header: "Plaatshouder",
        description: "Voorbeeldtekst in een tekstveld (alleen bij inputType = text).",
        width: 24,
        required: false,
      },
    ],
    examples: [
      [
        "eigenaarschap_processen",
        "diagnose",
        "10",
        "Hoe is het eigenaarschap van processen en inrichting geregeld?",
        "Kies de optie die het beste de huidige situatie beschrijft.",
        "single_select",
        "false",
        "volwassenheidsniveau_3",
        "eigenaarschap",
        "Organisatie & Beheer",
        "score",
        "true",
        "1",
        "",
        "false",
        "",
      ],
    ],
  },
];

function addInstructionSheet(workbook: ExcelJS.Workbook) {
  const ws = workbook.addWorksheet("📋 Instructies", {
    properties: { tabColor: { argb: "FF2E75B6" } },
  });

  ws.getColumn(1).width = 28;
  ws.getColumn(2).width = 60;

  // Titel
  ws.mergeCells("A1:B1");
  const titleCell = ws.getCell("A1");
  titleCell.value = "KWEEKERS Groeimodel — Import Template";
  titleCell.font = { bold: true, size: 14, color: { argb: "FF1F3864" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD6E4F0" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  ws.getRow(1).height = 28;

  // Lege rij
  ws.addRow([]);

  // Uitleg
  const uitleg = [
    ["Wat is dit bestand?", "Dit is een importtemplate voor het KWEEKERS Groeimodel. Vul de tabbladen in om een nieuwe scan-definitie te importeren."],
    ["Hoe gebruik je dit?", "1. Vul de tabbladen in (zie kolomomschrijvingen per tabblad)\n2. Sla het bestand op\n3. Upload het via de importflow op de beheerderportal"],
    ["Verplichte velden", "Kolommen met een * zijn verplicht. Laat deze nooit leeg."],
    ["Dropdownlijsten", "Sommige kolommen hebben een keuzelijst. Klik op de cel om de opties te zien. Vul alleen waarden in uit de lijst."],
    ["Volgorde (order)", "Gebruik getallen zoals 10, 20, 30... Dit geeft ruimte om later iets tussenin te voegen."],
    ["Technische sleutels", "Codes en sleutels mogen geen spaties bevatten. Gebruik kleine letters en underscores. Voorbeeld: eigenaarschap_processen"],
  ];

  for (const [label, value] of uitleg) {
    const row = ws.addRow([label, value]);
    row.getCell(1).font = { bold: true, color: { argb: "FF1F3864" } };
    row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F7FB" } };
    row.getCell(2).alignment = { wrapText: true, vertical: "top" };
    row.height = 40;
  }

  ws.addRow([]);

  // Tabblad overzicht
  ws.addRow(["Tabblad", "Wat vul je hier in?"]);
  ws.lastRow!.font = { bold: true };
  ws.lastRow!.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F3864" } };
  ws.lastRow!.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.lastRow!.getCell(2).font = { bold: true, color: { argb: "FFFFFFFF" } };

  const tabInfo = [
    ["categories", "Hoofdcategorieën van het groeimodel"],
    ["dimensions", "Beoordelingsdimensies per categorie"],
    ["sections", "Secties/stappen van de scan"],
    ["option-sets", "Antwoordopties voor keuzevragen"],
    ["questions", "De vragen in de scan"],
  ];

  for (const [tab, desc] of tabInfo) {
    const row = ws.addRow([tab, desc]);
    row.getCell(1).font = { color: { argb: "FF2E75B6" } };
    row.height = 20;
  }
}

function addSheet(workbook: ExcelJS.Workbook, definition: SheetDefinition) {
  const ws = workbook.addWorksheet(definition.name, {
    properties: { tabColor: { argb: "FF2E75B6" } },
  });

  // Kolombreedte instellen
  definition.columns.forEach((col, i) => {
    ws.getColumn(i + 1).width = col.width;
    ws.getColumn(i + 1).key = col.key;
  });

  // Headerrij
  const headerRow = ws.addRow(definition.columns.map((col) => col.header));
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F3864" } };
    cell.alignment = { vertical: "middle", wrapText: false };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FF2E75B6" } },
    };
  });

  // Voorbeeldrijen
  definition.examples.forEach((example, exIndex) => {
    const row = ws.addRow(example);
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: exIndex % 2 === 0 ? "FFF0F4FA" : "FFFFFFFF" },
      };
      cell.font = { italic: true, color: { argb: "FF555555" } };
    });
  });

  // Lege invulrijen (10 rijen)
  for (let i = 0; i < 10; i++) {
    const row = ws.addRow(definition.columns.map(() => ""));
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: i % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF" },
      };
    });
  }

  // Dropdowns toevoegen (rijen 2 t/m 50)
  definition.columns.forEach((col, colIndex) => {
    if (!col.dropdown || col.dropdown.length === 0) return;

    const colLetter = String.fromCharCode(65 + colIndex);

    for (let row = 2; row <= 50; row++) {
      ws.getCell(`${colLetter}${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${col.dropdown.join(",")}"`],
        showErrorMessage: true,
        errorTitle: "Ongeldige waarde",
        error: `Kies een waarde uit de lijst: ${col.dropdown.join(", ")}`,
      };
    }
  });

  // Bevroren eerste rij
  ws.views = [{ state: "frozen", ySplit: 1 }];
}

function addFieldDescriptionSheet(workbook: ExcelJS.Workbook, definition: SheetDefinition) {
  // Voeg veldomschrijvingen toe aan instructietab (niet apart tabblad per sheet)
  // Dit wordt verwerkt in de instructiesheet
}

export async function GET() {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "KWEEKERS Groeimodel";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Instructietab als eerste
  addInstructionSheet(workbook);

  // Datatabs
  for (const sheet of sheets) {
    addSheet(workbook, sheet);
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="kweekers-groeimodel-definitie-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
