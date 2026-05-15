import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

const requiredSheets: Record<string, string[]> = {
  categories: ["code", "title", "description", "order"],

  dimensions: ["code", "title", "category", "order", "isActive"],

  questions: [
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
    "startplan",
  ],

  optionSets: ["key", "description"],

  options: ["optionSetKey", "value", "label", "description", "order", "score"],
};

const previewSheets = [
  "categories",
  "dimensions",
  "questions",
  "optionSets",
  "options",
];

function getHeaderValues(sheet: ExcelJS.Worksheet): string[] {
  const headerRow = sheet.getRow(1);
  const headers: string[] = [];

  headerRow.eachCell((cell) => {
    const value = cell.value;

    if (value === null || value === undefined) {
      return;
    }

    headers.push(String(value).trim());
  });

  return headers.filter(Boolean);
}

function getCellValueAsString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") {
      return value.text;
    }

    if ("result" in value) {
      return String(value.result ?? "");
    }

    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join("");
    }

    return JSON.stringify(value);
  }

  return String(value);
}

function getSheetPreview(
  sheet: ExcelJS.Worksheet,
  maxRows = 5
): Record<string, string>[] {
  const headers = getHeaderValues(sheet);
  const rows: Record<string, string>[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    if (rows.length >= maxRows) {
      return;
    }

    const record: Record<string, string> = {};

    headers.forEach((header, index) => {
      const cell = row.getCell(index + 1);
      record[header] = getCellValueAsString(cell.value);
    });

    const hasValue = Object.values(record).some((value) => value.trim() !== "");

    if (hasValue) {
      rows.push(record);
    }
  });

  return rows;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Geen bestand ontvangen." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return NextResponse.json(
        { ok: false, error: "Upload een geldig .xlsx-bestand." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const checks = Object.entries(requiredSheets).map(
      ([sheetName, requiredColumns]) => {
        const sheet = workbook.getWorksheet(sheetName);

        if (!sheet) {
          return {
            sheetName,
            exists: false,
            ok: false,
            rowCount: 0,
            columnCount: 0,
            headers: [],
            missingColumns: requiredColumns,
          };
        }

        const headers = getHeaderValues(sheet);

        const missingColumns = requiredColumns.filter(
          (column) => !headers.includes(column)
        );

        return {
          sheetName,
          exists: true,
          ok: missingColumns.length === 0,
          rowCount: sheet.rowCount,
          columnCount: sheet.columnCount,
          headers,
          missingColumns,
        };
      }
    );

    const ok = checks.every((check) => check.ok);

    const preview = previewSheets.reduce<Record<string, Record<string, string>[]>>(
      (acc, sheetName) => {
        const sheet = workbook.getWorksheet(sheetName);
        acc[sheetName] = sheet ? getSheetPreview(sheet, 5) : [];
        return acc;
      },
      {}
    );

    return NextResponse.json({
      ok,
      fileName: file.name,
      message: ok
        ? "Excelbestand is geschikt voor import."
        : "Excelbestand bevat nog fouten.",
      checks,
      preview,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Onbekende fout",
      },
      { status: 500 }
    );
  }
}
