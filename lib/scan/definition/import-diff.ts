import { categories } from "@/lib/scan/definition/categories";
import { dimensions } from "@/lib/scan/definition/dimensions";
import { optionSets } from "@/lib/scan/definition/option-sets";
import { questions } from "@/lib/scan/definition/questions";

export type ImportDiffStatus =
  | "new"
  | "changed"
  | "unchanged"
  | "possiblyRemoved"
  | "invalid";

export type ImportDiffItem = {
  key: string;
  label: string;
  status: ImportDiffStatus;
  current?: Record<string, string>;
  incoming?: Record<string, string>;
  changedFields: string[];
};

export type ImportDiffSheet = {
  sheetName: string;
  title: string;
  keyFields: string[];
  items: ImportDiffItem[];
  counts: {
    new: number;
    changed: number;
    unchanged: number;
    possiblyRemoved: number;
    invalid: number;
    total: number;
  };
};

export type ImportDiffResult = {
  sheets: ImportDiffSheet[];
  totals: {
    new: number;
    changed: number;
    unchanged: number;
    possiblyRemoved: number;
    invalid: number;
    total: number;
  };
};

type ImportRowsBySheet = Record<string, Record<string, string>[]>;

type SheetDefinition = {
  sheetName: string;
  title: string;
  keyFields: string[];
  compareFields: string[];
  currentRows: Record<string, string>[];
};

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (Array.isArray(value)) {
    return stableStringify(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    return String(value).trim();
  }

  if (typeof value === "object") {
    return stableStringify(value);
  }

  const raw = String(value).trim();

  if (!raw) return "";

  const lower = raw.toLowerCase();

  if (["true", "waar", "ja", "yes", "y"].includes(lower)) {
    return "true";
  }

  if (["false", "onwaar", "nee", "no", "n"].includes(lower)) {
    return "false";
  }

  if (lower === "undefined" || lower === "null") {
    return "";
  }

  if (
    (raw.startsWith("{") && raw.endsWith("}")) ||
    (raw.startsWith("[") && raw.endsWith("]"))
  ) {
    try {
      return stableStringify(JSON.parse(raw));
    } catch {
      return raw.replace(/\s+/g, " ");
    }
  }

  return raw.replace(/\s+/g, " ");
}

function normalizeFieldValue(field: string, value: unknown): string {
  const normalized = normalizeValue(value);

  const booleanFields = [
    "required",
    "scoreEnabled",
    "allowsComment",
    "isActive",
  ];

  const numberFields = ["order", "scoreWeight", "maxSelections", "score"];

  if (booleanFields.includes(field)) {
    if (normalized === "") return "false";
    if (normalized === "1") return "true";
    if (normalized === "0") return "false";
    return normalized;
  }

  if (numberFields.includes(field)) {
    if (normalized === "") return "0";

    const numberValue = Number(normalized.replace(",", "."));

    if (Number.isNaN(numberValue)) {
      return normalized;
    }

    return String(numberValue);
  }

  return normalized;
}

function normalizeRow(
  row: Record<string, unknown>,
  fields: string[]
): Record<string, string> {
  return Object.fromEntries(
    fields.map((field) => [field, normalizeFieldValue(field, row[field])])
  );
}

function buildKey(row: Record<string, string>, keyFields: string[]): string {
  return keyFields
    .map((field) => normalizeFieldValue(field, row[field]).toLowerCase())
    .join("::");
}

function buildLabel(row: Record<string, string>, keyFields: string[]): string {
  return keyFields.map((field) => row[field]).filter(Boolean).join(" / ");
}

function getChangedFields(
  current: Record<string, string>,
  incoming: Record<string, string>,
  compareFields: string[]
): string[] {
  return compareFields.filter((field) => {
    return (
      normalizeFieldValue(field, current[field]) !==
      normalizeFieldValue(field, incoming[field])
    );
  });
}

function buildSheetDiff(
  definition: SheetDefinition,
  incomingRowsRaw: Record<string, string>[] = []
): ImportDiffSheet {
  const currentRows = definition.currentRows.map((row) =>
    normalizeRow(row, definition.compareFields)
  );

  const incomingRows = incomingRowsRaw.map((row) =>
    normalizeRow(row, definition.compareFields)
  );

  const currentByKey = new Map<string, Record<string, string>>();
  const incomingByKey = new Map<string, Record<string, string>>();

  currentRows.forEach((row) => {
    const key = buildKey(row, definition.keyFields);

    if (key) {
      currentByKey.set(key, row);
    }
  });

  incomingRows.forEach((row) => {
    const key = buildKey(row, definition.keyFields);

    if (key) {
      incomingByKey.set(key, row);
    }
  });

  const items: ImportDiffItem[] = [];

  incomingRows.forEach((incoming) => {
    const key = buildKey(incoming, definition.keyFields);
    const label = buildLabel(incoming, definition.keyFields);

    if (!key || definition.keyFields.some((field) => !incoming[field])) {
      items.push({
        key: key || `invalid-${items.length + 1}`,
        label: label || "Ongeldige regel",
        status: "invalid",
        incoming,
        changedFields: [],
      });

      return;
    }

    const current = currentByKey.get(key);

    if (!current) {
      items.push({
        key,
        label,
        status: "new",
        incoming,
        changedFields: definition.compareFields.filter(
          (field) => normalizeFieldValue(field, incoming[field]) !== ""
        ),
      });

      return;
    }

    const changedFields = getChangedFields(
      current,
      incoming,
      definition.compareFields
    );

    items.push({
      key,
      label,
      status: changedFields.length > 0 ? "changed" : "unchanged",
      current,
      incoming,
      changedFields,
    });
  });

  currentRows.forEach((current) => {
    const key = buildKey(current, definition.keyFields);

    if (!key || incomingByKey.has(key)) {
      return;
    }

    items.push({
      key,
      label: buildLabel(current, definition.keyFields),
      status: "possiblyRemoved",
      current,
      changedFields: [],
    });
  });

  const counts = {
    new: items.filter((item) => item.status === "new").length,
    changed: items.filter((item) => item.status === "changed").length,
    unchanged: items.filter((item) => item.status === "unchanged").length,
    possiblyRemoved: items.filter((item) => item.status === "possiblyRemoved")
      .length,
    invalid: items.filter((item) => item.status === "invalid").length,
    total: items.length,
  };

  return {
    sheetName: definition.sheetName,
    title: definition.title,
    keyFields: definition.keyFields,
    items,
    counts,
  };
}

function getCurrentCategoryRows(): Record<string, string>[] {
  return categories.map((category) => ({
    code: normalizeFieldValue("code", category.code),
    title: normalizeFieldValue("title", category.title),
    description: normalizeFieldValue("description", category.description),
    order: normalizeFieldValue("order", category.order),
  }));
}

function getCurrentDimensionRows(): Record<string, string>[] {
  return dimensions.map((dimension) => ({
    code: normalizeFieldValue("code", dimension.code),
    title: normalizeFieldValue("title", dimension.title),
    category: normalizeFieldValue("category", dimension.category),
    order: normalizeFieldValue("order", dimension.order),
    isActive: normalizeFieldValue("isActive", dimension.isActive),
  }));
}

function getCurrentQuestionRows(): Record<string, string>[] {
  return questions.map((question) => ({
    key: normalizeFieldValue("key", question.key),
    sectionCode: normalizeFieldValue("sectionCode", question.sectionCode),
    order: normalizeFieldValue("order", question.order),
    label: normalizeFieldValue("label", question.label),
    helpText: normalizeFieldValue("helpText", question.helpText),
    inputType: normalizeFieldValue("inputType", question.inputType),
    required: normalizeFieldValue("required", question.required),
    optionSetKey: normalizeFieldValue("optionSetKey", question.optionSetKey),
    dimensionCode: normalizeFieldValue("dimensionCode", question.dimensionCode),
    category: normalizeFieldValue("category", question.category),
    outputRole: normalizeFieldValue("outputRole", question.outputRole),
    scoreEnabled: normalizeFieldValue("scoreEnabled", question.scoreEnabled),
    scoreWeight: normalizeFieldValue("scoreWeight", question.scoreWeight),
    maxSelections: normalizeFieldValue("maxSelections", question.maxSelections),
    allowsComment: normalizeFieldValue("allowsComment", question.allowsComment),
    placeholder: normalizeFieldValue("placeholder", question.placeholder),
    visibleWhen: normalizeFieldValue("visibleWhen", question.visibleWhen),
    examples: normalizeFieldValue("examples", question.examples),
  }));
}

function getCurrentOptionSetRows(): Record<string, string>[] {
  return optionSets.map((optionSet) => ({
    key: normalizeFieldValue("key", optionSet.key),
    description: "",
  }));
}

function getCurrentOptionRows(): Record<string, string>[] {
  return optionSets.flatMap((optionSet) =>
    optionSet.options.map((option) => ({
      optionSetKey: normalizeFieldValue("optionSetKey", optionSet.key),
      value: normalizeFieldValue("value", option.value),
      label: normalizeFieldValue("label", option.label),
      description: normalizeFieldValue("description", option.description),
      order: normalizeFieldValue("order", option.order),
      score: normalizeFieldValue("score", "score" in option ? option.score : ""),
    }))
  );
}

function getSheetDefinitions(): SheetDefinition[] {
  return [
    {
      sheetName: "categories",
      title: "Categorieën",
      keyFields: ["code"],
      compareFields: ["code", "title", "description", "order"],
      currentRows: getCurrentCategoryRows(),
    },
    {
      sheetName: "dimensions",
      title: "Dimensies",
      keyFields: ["code"],
      compareFields: ["code", "title", "category", "order", "isActive"],
      currentRows: getCurrentDimensionRows(),
    },
    {
      sheetName: "questions",
      title: "Vragen",
      keyFields: ["key"],
      compareFields: [
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
      ],
      currentRows: getCurrentQuestionRows(),
    },
    {
      sheetName: "optionSets",
      title: "Option sets",
      keyFields: ["key"],
      compareFields: ["key", "description"],
      currentRows: getCurrentOptionSetRows(),
    },
    {
      sheetName: "options",
      title: "Antwoordopties",
      keyFields: ["optionSetKey", "value"],
      compareFields: [
        "optionSetKey",
        "value",
        "label",
        "description",
        "order",
        "score",
      ],
      currentRows: getCurrentOptionRows(),
    },
  ];
}

export function buildImportDiff(
  incomingRowsBySheet: ImportRowsBySheet
): ImportDiffResult {
  const sheets = getSheetDefinitions().map((definition) =>
    buildSheetDiff(definition, incomingRowsBySheet[definition.sheetName] ?? [])
  );

  const totals = sheets.reduce(
    (acc, sheet) => ({
      new: acc.new + sheet.counts.new,
      changed: acc.changed + sheet.counts.changed,
      unchanged: acc.unchanged + sheet.counts.unchanged,
      possiblyRemoved: acc.possiblyRemoved + sheet.counts.possiblyRemoved,
      invalid: acc.invalid + sheet.counts.invalid,
      total: acc.total + sheet.counts.total,
    }),
    {
      new: 0,
      changed: 0,
      unchanged: 0,
      possiblyRemoved: 0,
      invalid: 0,
      total: 0,
    }
  );

  return {
    sheets,
    totals,
  };
}