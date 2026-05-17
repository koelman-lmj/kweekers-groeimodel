import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

type SheetDefinition = {
  name: string;
  columns: string[];
  example: string[];
};

const sheets: SheetDefinition[] = [
  {
    name: "categories",
    columns: ["code", "title", "description", "order"],
    example: [
      "organisatie",
      "Organisatie",
      "Vragen over eigenaarschap, sturing en werkwijze.",
      "10",
    ],
  },
  {
    name: "dimensions",
    columns: ["code", "title", "category", "order", "isActive"],
    example: [
      "processen",
      "Processen",
      "organisatie",
      "10",
      "true",
    ],
  },
  {
    name: "sections",
    columns: [
      "code",
      "title",
      "shortTitle",
      "phase",
      "order",
      "summaryEnabled",
      "nextSectionCode",
    ],
    example: [
      "diagnose",
      "Diagnose",
      "Diagnose",
      "scan",
      "10",
      "true",
      "",
    ],
  },
  {
    name: "option-sets",
    columns: [
      "key",
      "title",
      "value",
      "label",
      "description",
      "order",
      "score",
      "adviceSignal",
    ],
    example: [
      "maturity_3level_options",
      "Volwassenheidsniveau",
      "laag",
      "Laag",
      "Er is nog weinig structuur.",
      "10",
      "1",
      "aandacht",
    ],
  },
  {
    name: "questions",
    columns: [
      "key",
      "sectionCode",
      "order",
      "label",
      "helpText",
      "inputType",
      "required",
      "optionSetKey",
      "dimensionCode",
      "category",
      "outputRisk",
      "scoreEnabled",
      "scoreWeight",
      "maxSelections",
      "allowComment",
      "placeholder",
      "visibleWhen",
      "startPlan",
    ],
    example: [
      "test_extra_question_001",
      "diagnose",
      "999",
      "Testvraag import werkt",
      "Dit is een tijdelijke testvraag om te controleren of de import werkt.",
      "text",
      "false",
      "",
      "processen",
      "organisatie",
      "",
      "false",
      "",
      "",
      "false",
      "",
      "",
      "",
    ],
  },
];

function addSheet(workbook: ExcelJS.Workbook, definition: SheetDefinition) {
  const worksheet = workbook.addWorksheet(definition.name);

  worksheet.addRow(definition.columns);
  worksheet.addRow(definition.example);

  worksheet.getRow(1).font = { bold: true };

  worksheet.columns = definition.columns.map((column) => ({
    key: column,
    width: Math.max(column.length + 4, 18),
  }));
}

export async function GET() {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "KWEEKERS Groeimodel";
  workbook.created = new Date();
  workbook.modified = new Date();

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