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

const requiredFields: Record<string, string[]> = {
  categories: ["code", "title"],

  dimensions: ["code", "title", "category"],

  questions: ["key", "sectionCode", "label", "inputType"],

  optionSets: ["key"],

  options: ["optionSetKey", "value", "label"],
};

const previewSheets = [
  "categories",
  "dimensions",
  "questions",
  "optionSets",
  "options",
];

type DuplicateIssue = {
  sheetName: string;
  field: string;
  value: string;
  rows: number[];
  message: string;
};

type RequiredFieldIssue = {
  sheetName: string;
  field: string;
  row: number;
  message: string;
};

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

function getSheetRecords(
  sheet: ExcelJS.Worksheet
): { rowNumber: number; record: Record<string, string> }[] {
  const headers = getHeaderValues(sheet);
  const rows: { rowNumber: number; record: Record<string, string> }[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const record: Record<string, string> = {};

    headers.forEach((header, index) => {
      const cell = row.getCell(index + 1);
      record[header] = getCellValueAsString(cell.value).trim();
    });

    const hasValue = Object.values(record).some((value) => value !== "");

    if (hasValue) {
      rows.push({ rowNumber, record });
    }
  });

  return rows;
}

function getSheetPreview(
  sheet: ExcelJS.Worksheet,
  maxRows = 5
): Record<string, string>[] {
  return getSheetRecords(sheet)
    .slice(0, maxRows)
    .map((row) => row.record);
}

function findDuplicatesInField(
  sheetName: string,
  rows: { rowNumber: number; record: Record<string, string> }[],
  field: string
): DuplicateIssue[] {
  const seen = new Map<string, number[]>();

  rows.forEach(({ rowNumber, record }) => {
    const value = record[field]?.trim();

    if (!value) {
      return;
    }

    const normalizedValue = value.toLowerCase();

    const existingRows = seen.get(normalizedValue) ?? [];
    existingRows.push(rowNumber);
    seen.set(normalizedValue, existingRows);
  });

  return Array.from(seen.entries())
    .filter(([, rowNumbers]) => rowNumbers.length > 1)
    .map(([value, rowNumbers]) => ({
      sheetName,
      field,
      value,
      rows: rowNumbers,
      message: `Dubbele waarde gevonden in ${sheetName}.${field}: "${value}" op rijen ${rowNumbers.join(
        ", "
      )}.`,
    }));
}

function findDuplicatesInCombinedFields(
  sheetName: string,
  rows: { rowNumber: number; record: Record<string, string> }[],
  fields: string[]
): DuplicateIssue[] {
  const seen = new Map<string, number[]>();

  rows.forEach(({ rowNumber, record }) => {
    const values = fields.map((field) => record[field]?.trim() ?? "");

    if (values.every((value) => value === "")) {
      return;
    }

    const combinedValue = values.join(" + ");
    const normalizedValue = combinedValue.toLowerCase();

    const existingRows = seen.get(normalizedValue) ?? [];
    existingRows.push(rowNumber);
    seen.set(normalizedValue, existingRows);
  });

  return Array.from(seen.entries())
    .filter(([, rowNumbers]) => rowNumbers.length > 1)
    .map(([value, rowNumbers]) => ({
      sheetName,
      field: fields.join(" + "),
      value,
      rows: rowNumbers,
      message: `Dubbele combinatie gevonden in ${sheetName}.${fields.join(
        " + "
      )}: "${value}" op rijen ${rowNumbers.join(", ")}.`,
    }));
}

function getDuplicateIssues(workbook: ExcelJS.Workbook): DuplicateIssue[] {
  const issues: DuplicateIssue[] = [];

  const categoriesSheet = workbook.getWorksheet("categories");
  if (categoriesSheet) {
    issues.push(
      ...findDuplicatesInField(
        "categories",
        getSheetRecords(categoriesSheet),
        "code"
      )
    );
  }

  const dimensionsSheet = workbook.getWorksheet("dimensions");
  if (dimensionsSheet) {
    issues.push(
      ...findDuplicatesInField(
        "dimensions",
        getSheetRecords(dimensionsSheet),
        "code"
      )
    );
  }

  const questionsSheet = workbook.getWorksheet("questions");
  if (questionsSheet) {
    issues.push(
      ...findDuplicatesInField(
        "questions",
        getSheetRecords(questionsSheet),
        "key"
      )
    );
  }

  const optionSetsSheet = workbook.getWorksheet("optionSets");
  if (optionSetsSheet) {
    issues.push(
      ...findDuplicatesInField(
        "optionSets",
        getSheetRecords(optionSetsSheet),
        "key"
      )
    );
  }

  const optionsSheet = workbook.getWorksheet("options");
  if (optionsSheet) {
    issues.push(
      ...findDuplicatesInCombinedFields(
        "options",
        getSheetRecords(optionsSheet),
        ["optionSetKey", "value"]
      )
    );
  }

  return issues;
}

function getRequiredFieldIssues(
  workbook: ExcelJS.Workbook
): RequiredFieldIssue[] {
  const issues: RequiredFieldIssue[] = [];

  Object.entries(requiredFields).forEach(([sheetName, fields]) => {
    const sheet = workbook.getWorksheet(sheetName);

    if (!sheet) {
      return;
    }

    const rows = getSheetRecords(sheet);

    rows.forEach(({ rowNumber, record }) => {
      fields.forEach((field) => {
        const value = record[field]?.trim() ?? "";

        if (!value) {
          issues.push({
            sheetName,
            field,
            row: rowNumber,
            message: `Verplicht veld ontbreekt in ${sheetName}.${field} op rij ${rowNumber}.`,
          });
        }
      });
    });
  });

  return issues;
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

    const duplicateIssues = getDuplicateIssues(workbook);
    const requiredFieldIssues = getRequiredFieldIssues(workbook);

    const sheetsOk = checks.every((check) => check.ok);
    const duplicatesOk = duplicateIssues.length === 0;
    const requiredFieldsOk = requiredFieldIssues.length === 0;

    const ok = sheetsOk && duplicatesOk && requiredFieldsOk;

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
      duplicateIssues,
      requiredFieldIssues,
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
