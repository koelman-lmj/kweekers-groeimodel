import ExcelJS from "exceljs";
import { importTemplateSheets } from "@/lib/scan/definition/import-template";

export const runtime = "nodejs";

type PreviewRow = Record<string, string>;

type PreviewSheet = {
  key: string;
  title: string;
  rowCount: number;
  columns: string[];
  rows: PreviewRow[];
  errors: string[];
  warnings: string[];
};

type ImportPreviewResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sheets: PreviewSheet[];
};

function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") {
      return value.text;
    }

    if ("result" in value) {
      return String(value.result ?? "");
    }

    return JSON.stringify(value);
  }

  return String(value).trim();
}

function getHeaderValues(worksheet: ExcelJS.Worksheet): string[] {
  const headerRow = worksheet.getRow(1);

  const headers: string[] = [];

  headerRow.eachCell((cell) => {
    headers.push(normalizeCellValue(cell.value));
  });

  return headers;
}

function readRows(
  worksheet: ExcelJS.Worksheet,
  expectedColumns: string[]
): PreviewRow[] {
  const rows: PreviewRow[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const item: PreviewRow = {};
    let hasContent = false;

    expectedColumns.forEach((columnKey, index) => {
      const value = normalizeCellValue(row.getCell(index + 1).value);
      item[columnKey] = value;

      if (value !== "") {
        hasContent = true;
      }
    });

    if (hasContent) {
      rows.push(item);
    }
  });

  return rows;
}

function validateSheet(
  sheetKey: string,
  worksheet: ExcelJS.Worksheet | undefined
): PreviewSheet {
  const templateSheet = importTemplateSheets.find((sheet) => sheet.key === sheetKey);

  if (!templateSheet) {
    return {
      key: sheetKey,
      title: sheetKey,
      rowCount: 0,
      columns: [],
      rows: [],
      errors: [`Onbekende template-sheet '${sheetKey}'.`],
      warnings: [],
    };
  }

  if (!worksheet) {
    return {
      key: templateSheet.key,
      title: templateSheet.title,
      rowCount: 0,
      columns: [],
      rows: [],
      errors: [`Sheet '${templateSheet.key}' ontbreekt in het Excel-bestand.`],
      warnings: [],
    };
  }

  const expectedColumns = templateSheet.columns.map((column) => column.key);
  const requiredColumns = templateSheet.columns
    .filter((column) => column.required)
    .map((column) => column.key);

  const actualColumns = getHeaderValues(worksheet);
  const errors: string[] = [];
  const warnings: string[] = [];

  expectedColumns.forEach((columnKey) => {
    if (!actualColumns.includes(columnKey)) {
      errors.push(`Kolom '${columnKey}' ontbreekt.`);
    }
  });

  actualColumns.forEach((columnKey) => {
    if (columnKey && !expectedColumns.includes(columnKey)) {
      warnings.push(`Onbekende kolom '${columnKey}' wordt genegeerd.`);
    }
  });

  const rows = readRows(worksheet, expectedColumns);

  rows.forEach((row, index) => {
    requiredColumns.forEach((columnKey) => {
      if (!row[columnKey]?.trim()) {
        errors.push(`Rij ${index + 2}: verplichte kolom '${columnKey}' is leeg.`);
      }
    });
  });

  return {
    key: templateSheet.key,
    title: templateSheet.title,
    rowCount: rows.length,
    columns: actualColumns,
    rows: rows.slice(0, 10),
    errors,
    warnings,
  };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json(
      {
        isValid: false,
        errors: ["Geen Excel-bestand ontvangen."],
        warnings: [],
        sheets: [],
      },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const sheets = importTemplateSheets.map((templateSheet) => {
    const worksheet =
      workbook.getWorksheet(templateSheet.key) ??
      workbook.getWorksheet(templateSheet.title);

    return validateSheet(templateSheet.key, worksheet);
  });

  const errors = sheets.flatMap((sheet) =>
    sheet.errors.map((error) => `${sheet.key}: ${error}`)
  );

  const warnings = sheets.flatMap((sheet) =>
    sheet.warnings.map((warning) => `${sheet.key}: ${warning}`)
  );

  const result: ImportPreviewResult = {
    isValid: errors.length === 0,
    errors,
    warnings,
    sheets,
  };

  return Response.json(result);
}s
