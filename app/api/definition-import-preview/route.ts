import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export const runtime = "nodejs";

type SheetConfig = {
  canonicalName: string;
  aliases: string[];
  requiredColumns: string[];
  requiredFields: string[];
  duplicateFields?: string[];
  duplicateCombinedFields?: string[];
};

const sheetConfigs: SheetConfig[] = [
  {
    canonicalName: "categories",
    aliases: ["categories", "categorieen", "categorieën"],
    requiredColumns: ["code", "title", "description", "order"],
    requiredFields: ["code", "title"],
    duplicateFields: ["code"],
  },
  {
    canonicalName: "dimensions",
    aliases: ["dimensions", "dimensies"],
    requiredColumns: ["code", "title", "category", "order", "isActive"],
    requiredFields: ["code", "title", "category"],
    duplicateFields: ["code"],
  },
  {
    canonicalName: "sections",
    aliases: ["sections", "secties"],
    requiredColumns: [
      "code",
      "title",
      "shortTitle",
      "phase",
      "order",
      "summaryEnabled",
      "nextSectionCode",
    ],
    requiredFields: ["code", "title"],
    duplicateFields: ["code"],
  },
  {
    canonicalName: "questions",
    aliases: ["questions", "vragen"],
    requiredColumns: [
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
      "outputRole",
      "scoreEnabled",
      "scoreWeight",
      "maxSelections",
      "allowsComment",
      "placeholder",
      "visibleWhen",
      "examples",
    ],
    requiredFields: ["key", "sectionCode", "label", "inputType"],
    duplicateFields: ["key"],
  },
  {
    canonicalName: "optionSets",
    aliases: ["optionSets", "option-sets", "option_sets", "antwoordsets"],
    requiredColumns: ["key", "description"],
    requiredFields: ["key"],
    duplicateFields: ["key"],
  },
  {
    canonicalName: "options",
    aliases: ["options", "opties"],
    requiredColumns: [
      "optionSetKey",
      "value",
      "label",
      "description",
      "order",
      "score",
    ],
    requiredFields: ["optionSetKey", "value", "label"],
    duplicateCombinedFields: ["optionSetKey", "value"],
  },
];

type RowRecord = {
  rowNumber: number;
  record: Record<string, string>;
};

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

type RelationIssue = {
  sheetName: string;
  field: string;
  value: string;
  row: number;
  targetSheet: string;
  targetField: string;
  message: string;
};

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[\s_\-.]/g, "");
}

function normalizeHeader(value: string) {
  const header = value.trim();

  const aliases: Record<string, string> = {
    allowComment: "allowsComment",
    commentAllowed: "allowsComment",
    outputRisk: "outputRole",
    option_set_key: "optionSetKey",
    section_code: "sectionCode",
    dimension_code: "dimensionCode",
    score_weight: "scoreWeight",
    score_enabled: "scoreEnabled",
    max_selections: "maxSelections",
    visible_when: "visibleWhen",
  };

  return aliases[header] ?? header;
}

function getWorksheet(
  workbook: ExcelJS.Workbook,
  config: SheetConfig
): ExcelJS.Worksheet | undefined {
  const worksheets = workbook.worksheets;

  return worksheets.find((worksheet) => {
    const normalizedWorksheetName = normalizeName(worksheet.name);

    return config.aliases.some(
      (alias) => normalizeName(alias) === normalizedWorksheetName
    );
  });
}

function getHeaderValues(sheet: ExcelJS.Worksheet): string[] {
  const headerRow = sheet.getRow(1);
  const headers: string[] = [];

  headerRow.eachCell((cell) => {
    const value = cell.value;

    if (value === null || value === undefined) {
      return;
    }

    headers.push(normalizeHeader(String(value).trim()));
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

function getSheetRecords(sheet: ExcelJS.Worksheet): RowRecord[] {
  const headers = getHeaderValues(sheet);
  const rows: RowRecord[] = [];

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
  rows: RowRecord[],
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
  rows: RowRecord[],
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

function getRecordsBySheet(workbook: ExcelJS.Workbook) {
  const recordsBySheet: Record<string, RowRecord[]> = {};

  for (const config of sheetConfigs) {
    const sheet = getWorksheet(workbook, config);
    recordsBySheet[config.canonicalName] = sheet ? getSheetRecords(sheet) : [];
  }

  return recordsBySheet;
}

function getImportRows(recordsBySheet: Record<string, RowRecord[]>) {
  return sheetConfigs.reduce<Record<string, Record<string, string>[]>>(
    (acc, config) => {
      acc[config.canonicalName] = (recordsBySheet[config.canonicalName] ?? []).map(
        (row) => row.record
      );

      return acc;
    },
    {}
  );
}

function getValueSet(rows: RowRecord[], field: string): Set<string> {
  return new Set(
    rows
      .map(({ record }) => record[field]?.trim())
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLowerCase())
  );
}

function getDuplicateIssues(
  recordsBySheet: Record<string, RowRecord[]>
): DuplicateIssue[] {
  const issues: DuplicateIssue[] = [];

  for (const config of sheetConfigs) {
    const rows = recordsBySheet[config.canonicalName] ?? [];

    for (const field of config.duplicateFields ?? []) {
      issues.push(...findDuplicatesInField(config.canonicalName, rows, field));
    }

    if (config.duplicateCombinedFields) {
      issues.push(
        ...findDuplicatesInCombinedFields(
          config.canonicalName,
          rows,
          config.duplicateCombinedFields
        )
      );
    }
  }

  return issues;
}

function getRequiredFieldIssues(
  recordsBySheet: Record<string, RowRecord[]>
): RequiredFieldIssue[] {
  const issues: RequiredFieldIssue[] = [];

  for (const config of sheetConfigs) {
    const rows = recordsBySheet[config.canonicalName] ?? [];

    rows.forEach(({ rowNumber, record }) => {
      config.requiredFields.forEach((field) => {
        const value = record[field]?.trim() ?? "";

        if (!value) {
          issues.push({
            sheetName: config.canonicalName,
            field,
            row: rowNumber,
            message: `Verplicht veld ontbreekt in ${config.canonicalName}.${field} op rij ${rowNumber}.`,
          });
        }
      });
    });
  }

  return issues;
}

function getRelationIssues(
  recordsBySheet: Record<string, RowRecord[]>
): RelationIssue[] {
  const issues: RelationIssue[] = [];

  const categoryCodes = getValueSet(recordsBySheet.categories ?? [], "code");
  const dimensionCodes = getValueSet(recordsBySheet.dimensions ?? [], "code");
  const sectionCodes = getValueSet(recordsBySheet.sections ?? [], "code");
  const optionSetKeys = getValueSet(recordsBySheet.optionSets ?? [], "key");

  (recordsBySheet.dimensions ?? []).forEach(({ rowNumber, record }) => {
    const value = record.category?.trim();

    if (value && !categoryCodes.has(value.toLowerCase())) {
      issues.push({
        sheetName: "dimensions",
        field: "category",
        value,
        row: rowNumber,
        targetSheet: "categories",
        targetField: "code",
        message: `Verwijzing klopt niet: dimensions.category "${value}" op rij ${rowNumber} bestaat niet in categories.code.`,
      });
    }
  });

  (recordsBySheet.questions ?? []).forEach(({ rowNumber, record }) => {
    const sectionCode = record.sectionCode?.trim();

    if (sectionCode && sectionCodes.size > 0 && !sectionCodes.has(sectionCode.toLowerCase())) {
      issues.push({
        sheetName: "questions",
        field: "sectionCode",
        value: sectionCode,
        row: rowNumber,
        targetSheet: "sections",
        targetField: "code",
        message: `Verwijzing klopt niet: questions.sectionCode "${sectionCode}" op rij ${rowNumber} bestaat niet in sections.code.`,
      });
    }

    const dimensionCode = record.dimensionCode?.trim();

    if (dimensionCode && !dimensionCodes.has(dimensionCode.toLowerCase())) {
      issues.push({
        sheetName: "questions",
        field: "dimensionCode",
        value: dimensionCode,
        row: rowNumber,
        targetSheet: "dimensions",
        targetField: "code",
        message: `Verwijzing klopt niet: questions.dimensionCode "${dimensionCode}" op rij ${rowNumber} bestaat niet in dimensions.code.`,
      });
    }

    const optionSetKey = record.optionSetKey?.trim();

    if (optionSetKey && !optionSetKeys.has(optionSetKey.toLowerCase())) {
      issues.push({
        sheetName: "questions",
        field: "optionSetKey",
        value: optionSetKey,
        row: rowNumber,
        targetSheet: "optionSets",
        targetField: "key",
        message: `Verwijzing klopt niet: questions.optionSetKey "${optionSetKey}" op rij ${rowNumber} bestaat niet in optionSets.key.`,
      });
    }
  });

  (recordsBySheet.options ?? []).forEach(({ rowNumber, record }) => {
    const optionSetKey = record.optionSetKey?.trim();

    if (optionSetKey && !optionSetKeys.has(optionSetKey.toLowerCase())) {
      issues.push({
        sheetName: "options",
        field: "optionSetKey",
        value: optionSetKey,
        row: rowNumber,
        targetSheet: "optionSets",
        targetField: "key",
        message: `Verwijzing klopt niet: options.optionSetKey "${optionSetKey}" op rij ${rowNumber} bestaat niet in optionSets.key.`,
      });
    }
  });

  return issues;
}

function getImportSummary(
  recordsBySheet: Record<string, RowRecord[]>
): Record<string, number> {
  return sheetConfigs.reduce<Record<string, number>>((acc, config) => {
    acc[config.canonicalName] =
      recordsBySheet[config.canonicalName]?.length ?? 0;

    return acc;
  }, {});
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

    const checks = sheetConfigs.map((config) => {
      const sheet = getWorksheet(workbook, config);

      if (!sheet) {
        return {
          sheetName: config.canonicalName,
          exists: false,
          ok: false,
          rowCount: 0,
          columnCount: 0,
          headers: [],
          missingColumns: config.requiredColumns,
        };
      }

      const headers = getHeaderValues(sheet);

      const missingColumns = config.requiredColumns.filter(
        (column) => !headers.includes(column)
      );

      return {
        sheetName: config.canonicalName,
        exists: true,
        ok: missingColumns.length === 0,
        rowCount: sheet.rowCount,
        columnCount: sheet.columnCount,
        headers,
        missingColumns,
      };
    });

    const recordsBySheet = getRecordsBySheet(workbook);

    const duplicateIssues = getDuplicateIssues(recordsBySheet);
    const requiredFieldIssues = getRequiredFieldIssues(recordsBySheet);
    const relationIssues = getRelationIssues(recordsBySheet);
    const importSummary = getImportSummary(recordsBySheet);
    const importRows = getImportRows(recordsBySheet);

    const sheetsOk = checks.every((check) => check.ok);
    const duplicatesOk = duplicateIssues.length === 0;
    const requiredFieldsOk = requiredFieldIssues.length === 0;
    const relationsOk = relationIssues.length === 0;

    const ok = sheetsOk && duplicatesOk && requiredFieldsOk && relationsOk;

    const preview = sheetConfigs.reduce<Record<string, Record<string, string>[]>>(
      (acc, config) => {
        const sheet = getWorksheet(workbook, config);
        acc[config.canonicalName] = sheet ? getSheetPreview(sheet, 5) : [];
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
      relationIssues,
      importSummary,
      preview,
      importRows,
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