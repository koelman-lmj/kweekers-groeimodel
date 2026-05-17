"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Counts = {
  new: number;
  changed: number;
  unchanged: number;
  possiblyRemoved: number;
  invalid: number;
};

type ApplyResultSheet = {
  sheetName: string;
  title: string;
  counts: Counts;
};

type ApplyResult = {
  ok: boolean;
  mode?: string;
  message?: string;
  error?: string;
  createdAt?: string;
  totals?: Counts;
  sheets?: ApplyResultSheet[];
};

type ImportRows = Record<string, Record<string, string>[]>;

type ImportConcept = {
  importRows?: ImportRows;
};

type DefinitionFileKey =
  | "categories.ts"
  | "dimensions.ts"
  | "option-sets.ts"
  | "questions.ts"
  | "sections.ts"
  | "unknown";

type DefinitionFileOutput = {
  fileName: DefinitionFileKey;
  title: string;
  description: string;
  sheets: ApplyResultSheet[];
  rows: Record<string, string>[];
  counts: Counts;
};

type MappingFieldConfig = {
  outputField: string;
  candidates: string[];
  required: boolean;
  type: "string" | "number" | "boolean" | "array" | "json";
};

type MappingFieldCheck = {
  outputField: string;
  candidates: string[];
  required: boolean;
  type: MappingFieldConfig["type"];
  matchedColumn: string | null;
  filledRows: number;
  emptyRows: number;
};

type MappingCheck = {
  fileName: DefinitionFileKey;
  rowCount: number;
  rawColumns: string[];
  fields: MappingFieldCheck[];
  missingRequiredFields: MappingFieldCheck[];
};

type MappingStatusSummary = {
  totalFiles: number;
  filesWithRows: number;
  filesOk: number;
  filesWithAttention: number;
  missingRequiredFields: number;
  emptyOptionalFields: number;
};

type ImportPackageFile = {
  fileName: Exclude<DefinitionFileKey, "unknown">;
  rowCount: number;
  content: string;
};

type ImportPackage = {
  packageType: "kweekers-definition-import-package";
  packageVersion: 1;
  generatedAt: string;
  source: {
    app: "kweekers-groeimodel";
    mode: string;
  };
  mappingStatus: MappingStatusSummary;
  files: ImportPackageFile[];
};

type ImportPackageValidationIssue = {
  fileName: DefinitionFileKey;
  severity: "error" | "warning";
  message: string;
  rowIndex?: number;
  field?: string;
  details?: string[];
};

type ImportPackageValidationResult = {
  isSafe: boolean;
  errors: number;
  warnings: number;
  issues: ImportPackageValidationIssue[];
};
const EMPTY_COUNTS: Counts = {
  new: 0,
  changed: 0,
  unchanged: 0,
  possiblyRemoved: 0,
  invalid: 0,
};

const MAPPING_CONFIG: Record<DefinitionFileKey, MappingFieldConfig[]> = {
  "categories.ts": [
    {
      outputField: "code",
      candidates: [
        "code",
        "categoryCode",
        "category_code",
        "categorieCode",
        "categorie_code",
      ],
      required: true,
      type: "string",
    },
    {
      outputField: "title",
      candidates: ["title", "title_nl", "titel", "name", "naam", "label"],
      required: true,
      type: "string",
    },
    {
      outputField: "description",
      candidates: [
        "description",
        "description_nl",
        "omschrijving",
        "beschrijving",
        "helpText",
        "help_text",
      ],
      required: false,
      type: "string",
    },
    {
      outputField: "order",
      candidates: ["order", "sortOrder", "sort_order", "volgorde"],
      required: true,
      type: "number",
    },
  ],

  "dimensions.ts": [
    {
      outputField: "code",
      candidates: [
        "code",
        "dimensionCode",
        "dimension_code",
        "dimensieCode",
        "dimensie_code",
      ],
      required: true,
      type: "string",
    },
    {
      outputField: "title",
      candidates: ["title", "title_nl", "titel", "name", "naam", "label"],
      required: true,
      type: "string",
    },
    {
      outputField: "category",
      candidates: [
        "category",
        "categoryCode",
        "category_code",
        "categorie",
        "categorieCode",
        "categorie_code",
      ],
      required: true,
      type: "string",
    },
    {
      outputField: "description",
      candidates: [
        "description",
        "description_nl",
        "omschrijving",
        "beschrijving",
        "helpText",
        "help_text",
      ],
      required: false,
      type: "string",
    },
    {
      outputField: "order",
      candidates: ["order", "sortOrder", "sort_order", "volgorde"],
      required: true,
      type: "number",
    },
    {
      outputField: "isActive",
      candidates: ["isActive", "is_active", "active", "actief"],
      required: false,
      type: "boolean",
    },
  ],

  "sections.ts": [
    {
      outputField: "code",
      candidates: [
        "code",
        "sectionCode",
        "section_code",
        "section",
        "sectionKey",
        "section_key",
        "sectieCode",
        "sectie_code",
        "sectie",
      ],
      required: true,
      type: "string",
    },
    {
      outputField: "title",
      candidates: ["title", "title_nl", "titel", "name", "naam", "label"],
      required: true,
      type: "string",
    },
    {
      outputField: "shortTitle",
      candidates: ["shortTitle", "short_title", "korteTitel", "korte_titel"],
      required: false,
      type: "string",
    },
    {
      outputField: "phase",
      candidates: ["phase", "fase", "step", "stap"],
      required: false,
      type: "string",
    },
    {
      outputField: "order",
      candidates: ["order", "sortOrder", "sort_order", "volgorde"],
      required: true,
      type: "number",
    },
    {
      outputField: "summaryEnabled",
      candidates: [
        "summaryEnabled",
        "summary_enabled",
        "samenvatting",
        "samenvattingActief",
        "samenvatting_actief",
      ],
      required: false,
      type: "boolean",
    },
    {
      outputField: "nextSectionCode",
      candidates: [
        "nextSectionCode",
        "next_section_code",
        "volgendeSectie",
        "volgende_sectie",
        "next",
      ],
      required: false,
      type: "string",
    },
  ],

  "option-sets.ts": [
    {
      outputField: "key",
      candidates: [
        "key",
        "optionSet",
        "option_set",
        "optionSetKey",
        "option_set_key",
        "set",
        "setKey",
        "set_key",
        "optionGroup",
        "option_group",
      ],
      required: true,
      type: "string",
    },
    {
      outputField: "title",
      candidates: ["title", "title_nl", "titel", "name", "naam"],
      required: false,
      type: "string",
    },
    {
      outputField: "value",
      candidates: [
        "value",
        "waarde",
        "optionValue",
        "option_value",
        "optionKey",
        "option_key",
        "answerValue",
        "answer_value",
      ],
      required: true,
      type: "string",
    },
    {
      outputField: "label",
      candidates: [
        "label",
        "label_nl",
        "tekst",
        "text",
        "title",
        "title_nl",
        "answerLabel",
        "answer_label",
        "optionLabel",
        "option_label",
      ],
      required: true,
      type: "string",
    },
    {
      outputField: "description",
      candidates: [
        "description",
        "description_nl",
        "omschrijving",
        "beschrijving",
        "helpText",
        "help_text",
      ],
      required: false,
      type: "string",
    },
    {
      outputField: "order",
      candidates: ["order", "sortOrder", "sort_order", "volgorde"],
      required: true,
      type: "number",
    },
    {
      outputField: "score",
      candidates: ["score", "points", "punten"],
      required: false,
      type: "number",
    },
    {
      outputField: "adviceSignal",
      candidates: [
        "adviceSignal",
        "advice_signal",
        "adviesSignaal",
        "advies_signaal",
        "signal",
      ],
      required: false,
      type: "string",
    },
  ],

  "questions.ts": [
    {
      outputField: "key",
      candidates: [
        "key",
        "questionKey",
        "question_key",
        "vraagKey",
        "vraag_key",
      ],
      required: true,
      type: "string",
    },
    {
      outputField: "sectionCode",
      candidates: [
        "sectionCode",
        "section_code",
        "section",
        "sectionKey",
        "section_key",
        "sectieCode",
        "sectie_code",
        "sectie",
      ],
      required: true,
      type: "string",
    },
    {
      outputField: "order",
      candidates: ["order", "sortOrder", "sort_order", "volgorde"],
      required: true,
      type: "number",
    },
    {
      outputField: "label",
      candidates: [
        "label",
        "label_nl",
        "vraag",
        "question",
        "title",
        "title_nl",
        "titel",
      ],
      required: true,
      type: "string",
    },
    {
      outputField: "helpText",
      candidates: [
        "helpText",
        "help_text",
        "help",
        "toelichting",
        "description",
        "description_nl",
      ],
      required: false,
      type: "string",
    },
    {
      outputField: "inputType",
      candidates: [
        "inputType",
        "input_type",
        "type",
        "questionType",
        "question_type",
      ],
      required: true,
      type: "string",
    },
    {
      outputField: "required",
      candidates: ["required", "isRequired", "is_required", "verplicht"],
      required: true,
      type: "boolean",
    },
    {
      outputField: "optionSetKey",
      candidates: [
        "optionSetKey",
        "option_set_key",
        "optionsKey",
        "options_key",
      ],
      required: false,
      type: "string",
    },
    {
      outputField: "placeholder",
      candidates: ["placeholder", "placeholder_nl"],
      required: false,
      type: "string",
    },
    {
      outputField: "examples",
      candidates: ["examples", "examples_nl", "voorbeelden"],
      required: false,
      type: "array",
    },
    {
      outputField: "allowsComment",
      candidates: [
        "allowsComment",
        "allows_comment",
        "commentAllowed",
        "comment_allowed",
        "toelichtingToestaan",
        "toelichting_toestaan",
      ],
      required: false,
      type: "boolean",
    },
    {
      outputField: "maxSelections",
      candidates: [
        "maxSelections",
        "max_selections",
        "maxSelecties",
        "max_selecties",
      ],
      required: false,
      type: "number",
    },
    {
      outputField: "visibleWhen",
      candidates: [
        "visibleWhen",
        "visible_when",
        "zichtbaarAls",
        "zichtbaar_als",
      ],
      required: false,
      type: "json",
    },
    {
      outputField: "dimensionCode",
      candidates: [
        "dimensionCode",
        "dimension_code",
        "dimensieCode",
        "dimensie_code",
      ],
      required: false,
      type: "string",
    },
    {
      outputField: "category",
      candidates: [
        "category",
        "categoryCode",
        "category_code",
        "categorie",
        "categorieCode",
        "categorie_code",
      ],
      required: false,
      type: "string",
    },
    {
      outputField: "outputRole",
      candidates: ["outputRole", "output_role", "rol", "role"],
      required: false,
      type: "string",
    },
    {
      outputField: "scoreEnabled",
      candidates: [
        "scoreEnabled",
        "score_enabled",
        "scoreActief",
        "score_actief",
      ],
      required: false,
      type: "boolean",
    },
    {
      outputField: "scoreWeight",
      candidates: [
        "scoreWeight",
        "score_weight",
        "scoreGewicht",
        "score_gewicht",
        "weight",
        "gewicht",
      ],
      required: false,
      type: "number",
    },
  ],

  unknown: [],
};

function formatDate(value?: string) {
  if (!value) return "Niet bekend";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("nl-NL");
}

function addCounts(base: Counts, extra: Counts): Counts {
  return {
    new: base.new + extra.new,
    changed: base.changed + extra.changed,
    unchanged: base.unchanged + extra.unchanged,
    possiblyRemoved: base.possiblyRemoved + extra.possiblyRemoved,
    invalid: base.invalid + extra.invalid,
  };
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[\s_\-.]/g, "");
}

function getRawColumns(rows: Record<string, string>[]) {
  const columns = new Set<string>();

  for (const row of rows) {
    for (const column of Object.keys(row)) {
      columns.add(column);
    }
  }

  return Array.from(columns).sort((a, b) => a.localeCompare(b));
}

function findMatchedColumn(
  rawColumns: string[],
  candidates: string[]
): string | null {
  const normalizedCandidates = candidates.map(normalizeKey);

  return (
    rawColumns.find((column) =>
      normalizedCandidates.includes(normalizeKey(column))
    ) ?? null
  );
}

function buildMappingCheck(output: DefinitionFileOutput): MappingCheck {
  const rawColumns = getRawColumns(output.rows);
  const config = MAPPING_CONFIG[output.fileName] ?? [];

  const fields = config.map((field): MappingFieldCheck => {
    const matchedColumn = findMatchedColumn(rawColumns, field.candidates);

    const filledRows = matchedColumn
      ? output.rows.filter((row) => {
          const value = row[matchedColumn];
          return typeof value === "string" && value.trim().length > 0;
        }).length
      : 0;

    return {
      outputField: field.outputField,
      candidates: field.candidates,
      required: field.required,
      type: field.type,
      matchedColumn,
      filledRows,
      emptyRows: output.rows.length - filledRows,
    };
  });

  return {
    fileName: output.fileName,
    rowCount: output.rows.length,
    rawColumns,
    fields,
    missingRequiredFields: fields.filter(
      (field) =>
        field.required && (!field.matchedColumn || field.filledRows === 0)
    ),
  };
}

function buildMappingStatusSummary(
  outputs: DefinitionFileOutput[]
): MappingStatusSummary {
  const checks = outputs.map((output) => buildMappingCheck(output));
  const checksWithRows = checks.filter((check) => check.rowCount > 0);

  const filesOk = checksWithRows.filter(
    (check) => check.missingRequiredFields.length === 0
  ).length;

  const filesWithAttention = checksWithRows.filter(
    (check) => check.missingRequiredFields.length > 0
  ).length;

  const missingRequiredFields = checksWithRows.reduce(
    (total, check) => total + check.missingRequiredFields.length,
    0
  );

  const emptyOptionalFields = checksWithRows.reduce((total, check) => {
    const emptyOptionalInFile = check.fields.filter(
      (field) => !field.required && field.emptyRows > 0
    ).length;

    return total + emptyOptionalInFile;
  }, 0);

  return {
    totalFiles: checks.length,
    filesWithRows: checksWithRows.length,
    filesOk,
    filesWithAttention,
    missingRequiredFields,
    emptyOptionalFields,
  };
}

function getField(row: Record<string, string>, candidates: string[]) {
  const normalizedCandidates = candidates.map(normalizeKey);

  for (const [key, value] of Object.entries(row)) {
    if (normalizedCandidates.includes(normalizeKey(key))) {
      return value;
    }
  }

  return "";
}

function getOptionalString(row: Record<string, string>, candidates: string[]) {
  const value = getField(row, candidates).trim();
  return value.length > 0 ? value : undefined;
}

function getString(
  row: Record<string, string>,
  candidates: string[],
  fallback = ""
) {
  return getOptionalString(row, candidates) ?? fallback;
}

function getNumber(
  row: Record<string, string>,
  candidates: string[],
  fallback = 0
) {
  const value = getField(row, candidates).trim();

  if (!value) return fallback;

  const parsed = Number(value.replace(",", "."));

  return Number.isFinite(parsed) ? parsed : fallback;
}

function getBoolean(
  row: Record<string, string>,
  candidates: string[],
  fallback = false
) {
  const value = getField(row, candidates).trim().toLowerCase();

  if (!value) return fallback;

  if (["true", "ja", "yes", "1", "waar"].includes(value)) return true;
  if (["false", "nee", "no", "0", "onwaar"].includes(value)) return false;

  return fallback;
}

function getStringArray(row: Record<string, string>, candidates: string[]) {
  const value = getField(row, candidates).trim();

  if (!value) return undefined;

  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        const values = parsed
          .map((item) => String(item).trim())
          .filter(Boolean);

        return values.length > 0 ? values : undefined;
      }
    } catch {
      // fallback naar split hieronder
    }
  }

  const values = value
    .split(/\r?\n|;|\|/)
    .map((item) => item.trim())
    .filter(Boolean);

  return values.length > 0 ? values : undefined;
}

function parseVisibleWhen(row: Record<string, string>) {
  const raw = getField(row, ["visibleWhen", "visible_when", "zichtbaarAls"]);

  if (raw.trim()) {
    try {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // fallback hieronder
    }
  }

  const field = getOptionalString(row, [
    "visibleWhenField",
    "visible_when_field",
    "conditionField",
    "field",
  ]);

  const operator = getOptionalString(row, [
    "visibleWhenOperator",
    "visible_when_operator",
    "conditionOperator",
    "operator",
  ]);

  const valueRaw = getOptionalString(row, [
    "visibleWhenValue",
    "visible_when_value",
    "conditionValue",
    "condition_value",
  ]);

  if (!field || !operator || !valueRaw) return undefined;

  const value =
    valueRaw.includes("|") || valueRaw.includes(";")
      ? valueRaw
          .split(/\||;/)
          .map((item) => item.trim())
          .filter(Boolean)
      : valueRaw;

  return [
    {
      field,
      operator,
      value,
    },
  ];
}

function compactObject<T extends Record<string, unknown>>(object: T) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === "string" && value.trim() === "") return false;

      return true;
    })
  );
}

function stringifyTs(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function getDefinitionFileForSheet(sheetName: string): DefinitionFileKey {
  const normalized = sheetName.toLowerCase().trim();

  if (
    normalized.includes("categorie") ||
    normalized.includes("category") ||
    normalized === "categories"
  ) {
    return "categories.ts";
  }

  if (
    normalized.includes("dimensie") ||
    normalized.includes("dimension") ||
    normalized === "dimensions"
  ) {
    return "dimensions.ts";
  }

  if (
    normalized.includes("option") ||
    normalized.includes("optie") ||
    normalized.includes("set")
  ) {
    return "option-sets.ts";
  }

  if (
    normalized.includes("vraag") ||
    normalized.includes("question") ||
    normalized === "questions"
  ) {
    return "questions.ts";
  }

  if (
    normalized.includes("sectie") ||
    normalized.includes("section") ||
    normalized === "sections"
  ) {
    return "sections.ts";
  }

  return "unknown";
}

function getFileMeta(fileName: DefinitionFileKey) {
  if (fileName === "categories.ts") {
    return {
      title: "Categorieën",
      description:
        "Bevat de hoofdindeling of classificatie die gebruikt wordt in de scan-definitie.",
    };
  }

  if (fileName === "dimensions.ts") {
    return {
      title: "Dimensies",
      description:
        "Bevat de inhoudelijke domeinen of beoordelingsgebieden van het groeimodel.",
    };
  }

  if (fileName === "option-sets.ts") {
    return {
      title: "Antwoordsets",
      description:
        "Bevat herbruikbare antwoordopties, scores en keuzelijsten voor vragen.",
    };
  }

  if (fileName === "questions.ts") {
    return {
      title: "Vragen",
      description:
        "Bevat de concrete vragen, teksten, koppelingen en scoring binnen de scan.",
    };
  }

  if (fileName === "sections.ts") {
    return {
      title: "Secties",
      description:
        "Bevat de hoofdstukken of stappen waarin vragen in de scan worden gegroepeerd.",
    };
  }

  return {
    title: "Niet gekoppeld",
    description:
      "Deze sheet kon nog niet automatisch aan een doelbestand worden gekoppeld.",
  };
}

function getRowsForSheets(
  sheets: ApplyResultSheet[],
  importRows: ImportRows | null
) {
  if (!importRows) return [];

  return sheets.flatMap((sheet) => importRows[sheet.sheetName] ?? []);
}

function buildDefinitionFileOutputs(
  sheets: ApplyResultSheet[],
  importRows: ImportRows | null
): DefinitionFileOutput[] {
  const fileOrder: DefinitionFileKey[] = [
    "categories.ts",
    "dimensions.ts",
    "option-sets.ts",
    "questions.ts",
    "sections.ts",
    "unknown",
  ];

  const grouped = new Map<DefinitionFileKey, ApplyResultSheet[]>();

  for (const sheet of sheets) {
    const fileName = getDefinitionFileForSheet(sheet.sheetName);
    const current = grouped.get(fileName) ?? [];
    grouped.set(fileName, [...current, sheet]);
  }

  return fileOrder.map((fileName) => {
    const fileSheets = grouped.get(fileName) ?? [];
    const meta = getFileMeta(fileName);
    const rows = getRowsForSheets(fileSheets, importRows);

    const counts = fileSheets.reduce(
      (total, sheet) => addCounts(total, sheet.counts),
      { ...EMPTY_COUNTS }
    );

    return {
      fileName,
      title: meta.title,
      description: meta.description,
      sheets: fileSheets,
      rows,
      counts,
    };
  });
}

function buildCategories(rows: Record<string, string>[]) {
  return rows.map((row, index) => ({
    code: getString(row, [
      "code",
      "categoryCode",
      "category_code",
      "categorieCode",
      "categorie_code",
    ]),
    title: getString(row, [
      "title",
      "title_nl",
      "titel",
      "name",
      "naam",
      "label",
    ]),
    description: getString(row, [
      "description",
      "description_nl",
      "omschrijving",
      "beschrijving",
      "helpText",
      "help_text",
    ]),
    order: getNumber(
      row,
      ["order", "sortOrder", "sort_order", "volgorde"],
      (index + 1) * 10
    ),
  }));
}

function buildDimensions(rows: Record<string, string>[]) {
  return rows.map((row, index) => ({
    code: getString(row, [
      "code",
      "dimensionCode",
      "dimension_code",
      "dimensieCode",
      "dimensie_code",
    ]),
    title: getString(row, [
      "title",
      "title_nl",
      "titel",
      "name",
      "naam",
      "label",
    ]),
    category: getString(
      row,
      [
        "category",
        "categoryCode",
        "category_code",
        "categorie",
        "categorieCode",
        "categorie_code",
      ],
      "Overig"
    ),
    description: getString(row, [
      "description",
      "description_nl",
      "omschrijving",
      "beschrijving",
      "helpText",
      "help_text",
    ]),
    order: getNumber(
      row,
      ["order", "sortOrder", "sort_order", "volgorde"],
      (index + 1) * 10
    ),
    isActive: getBoolean(
      row,
      ["isActive", "is_active", "active", "actief"],
      true
    ),
  }));
}

function buildSections(rows: Record<string, string>[]) {
  return rows.map((row, index) =>
    compactObject({
      code: getString(row, [
        "code",
        "sectionCode",
        "section_code",
        "section",
        "sectionKey",
        "section_key",
        "sectieCode",
        "sectie_code",
        "sectie",
      ]),
      title: getString(row, [
        "title",
        "title_nl",
        "titel",
        "name",
        "naam",
        "label",
      ]),
      shortTitle: getOptionalString(row, [
        "shortTitle",
        "short_title",
        "korteTitel",
        "korte_titel",
      ]),
      phase: getOptionalString(row, ["phase", "fase", "step", "stap"]),
      order: getNumber(
        row,
        ["order", "sortOrder", "sort_order", "volgorde"],
        (index + 1) * 10
      ),
      summaryEnabled: getBoolean(
        row,
        [
          "summaryEnabled",
          "summary_enabled",
          "samenvatting",
          "samenvattingActief",
          "samenvatting_actief",
        ],
        false
      ),
      nextSectionCode: getOptionalString(row, [
        "nextSectionCode",
        "next_section_code",
        "volgendeSectie",
        "volgende_sectie",
        "next",
      ]),
    })
  );
}

function buildOptionSets(rows: Record<string, string>[]) {
  const grouped = new Map<
    string,
    {
      key: string;
      title?: string;
      options: Record<string, unknown>[];
    }
  >();

  for (const row of rows) {
    const key = getString(row, [
      "key",
      "optionSet",
      "option_set",
      "optionSetKey",
      "option_set_key",
      "set",
      "setKey",
      "set_key",
      "optionGroup",
      "option_group",
    ]).trim();

    if (!key) {
      continue;
    }

    const value = getString(row, [
      "value",
      "waarde",
      "optionValue",
      "option_value",
      "optionKey",
      "option_key",
      "answerValue",
      "answer_value",
    ]).trim();

    const label = getString(row, [
      "label",
      "label_nl",
      "tekst",
      "text",
      "answerLabel",
      "answer_label",
      "optionLabel",
      "option_label",
    ]).trim();

    if (!value || !label) {
      continue;
    }

    const title = getOptionalString(row, [
      "setTitle",
      "set_title",
      "optionSetTitle",
      "option_set_title",
      "titelSet",
      "titel_set",
    ]);

    const current = grouped.get(key) ?? {
      key,
      title,
      options: [],
    };

    const scoreRaw = getOptionalString(row, ["score", "points", "punten"]);

    const option = compactObject({
      value,
      label,
      description: getOptionalString(row, [
        "description",
        "description_nl",
        "omschrijving",
        "beschrijving",
        "helpText",
        "help_text",
      ]),
      order: getNumber(
        row,
        ["order", "sortOrder", "sort_order", "volgorde"],
        current.options.length * 10 + 10
      ),
      score: scoreRaw
        ? getNumber(row, ["score", "points", "punten"], 0)
        : undefined,
      adviceSignal: getOptionalString(row, [
        "adviceSignal",
        "advice_signal",
        "adviesSignaal",
        "advies_signaal",
        "signal",
      ]),
    });

    current.options.push(option);
    grouped.set(key, current);
  }

  return Array.from(grouped.values())
    .filter((set) => set.options.length > 0)
    .map((set) => compactObject(set));
}

function buildQuestions(rows: Record<string, string>[]) {
  return rows.map((row, index) =>
    compactObject({
      key: getString(row, [
        "key",
        "questionKey",
        "question_key",
        "vraagKey",
        "vraag_key",
      ]),
      sectionCode: getString(row, [
        "sectionCode",
        "section_code",
        "section",
        "sectionKey",
        "section_key",
        "sectieCode",
        "sectie_code",
        "sectie",
      ]),
      order: getNumber(
        row,
        ["order", "sortOrder", "sort_order", "volgorde"],
        (index + 1) * 10
      ),
      label: getString(row, [
        "label",
        "label_nl",
        "vraag",
        "question",
        "title",
        "title_nl",
        "titel",
      ]),
      helpText: getOptionalString(row, [
        "helpText",
        "help_text",
        "help",
        "toelichting",
        "description",
        "description_nl",
      ]),
      inputType: getString(
        row,
        ["inputType", "input_type", "type", "questionType", "question_type"],
        "text"
      ),
      required: getBoolean(
        row,
        ["required", "isRequired", "is_required", "verplicht"],
        false
      ),
      optionSetKey: getOptionalString(row, [
        "optionSetKey",
        "option_set_key",
        "optionsKey",
        "options_key",
      ]),
      placeholder: getOptionalString(row, ["placeholder", "placeholder_nl"]),
      examples: getStringArray(row, [
        "examples",
        "examples_nl",
        "voorbeelden",
      ]),
      allowsComment: getOptionalString(row, [
        "allowsComment",
        "allows_comment",
        "commentAllowed",
        "comment_allowed",
        "toelichtingToestaan",
        "toelichting_toestaan",
      ])
        ? getBoolean(
            row,
            [
              "allowsComment",
              "allows_comment",
              "commentAllowed",
              "comment_allowed",
              "toelichtingToestaan",
              "toelichting_toestaan",
            ],
            false
          )
        : undefined,
      maxSelections: getOptionalString(row, [
        "maxSelections",
        "max_selections",
        "maxSelecties",
        "max_selecties",
      ])
        ? getNumber(
            row,
            ["maxSelections", "max_selections", "maxSelecties", "max_selecties"],
            0
          )
        : undefined,
      visibleWhen: parseVisibleWhen(row),
      dimensionCode: getOptionalString(row, [
        "dimensionCode",
        "dimension_code",
        "dimensieCode",
        "dimensie_code",
      ]),
      category: getOptionalString(row, [
        "category",
        "categoryCode",
        "category_code",
        "categorie",
        "categorieCode",
        "categorie_code",
      ]),
      outputRole: getOptionalString(row, [
        "outputRole",
        "output_role",
        "rol",
        "role",
      ]),
      scoreEnabled: getOptionalString(row, [
        "scoreEnabled",
        "score_enabled",
        "scoreActief",
        "score_actief",
      ])
        ? getBoolean(
            row,
            ["scoreEnabled", "score_enabled", "scoreActief", "score_actief"],
            false
          )
        : undefined,
      scoreWeight: getOptionalString(row, [
        "scoreWeight",
        "score_weight",
        "scoreGewicht",
        "score_gewicht",
        "weight",
        "gewicht",
      ])
        ? getNumber(
            row,
            [
              "scoreWeight",
              "score_weight",
              "scoreGewicht",
              "score_gewicht",
              "weight",
              "gewicht",
            ],
            0
          )
        : undefined,
    })
  );
}

function buildTechnicalProposal(result: ApplyResult) {
  return {
    proposalType: "definition-import-proposal",
    proposalVersion: 1,
    generatedAt: new Date().toISOString(),
    source: {
      app: "kweekers-groeimodel",
      mode: result.mode ?? "safe-test",
    },
    status: {
      ok: result.ok,
      message: result.message ?? null,
      error: result.error ?? null,
    },
    totals: result.totals ?? EMPTY_COUNTS,
    sheets: result.sheets ?? [],
    note:
      "Dit is een technisch importvoorstel. De actieve definitie is hiermee nog niet aangepast.",
  };
}

function buildDefinitionFileProposal(output: DefinitionFileOutput) {
  return {
    proposalType: "definition-file-proposal",
    proposalVersion: 1,
    generatedAt: new Date().toISOString(),
    targetFile: output.fileName,
    title: output.title,
    description: output.description,
    counts: output.counts,
    sourceSheets: output.sheets.map((sheet) => ({
      sheetName: sheet.sheetName,
      title: sheet.title,
      counts: sheet.counts,
    })),
    rows: output.rows,
    note:
      "Dit is de veilige tussenlaag om te bepalen welke importonderdelen naar welk definitiebestand gaan.",
  };
}

function buildTypeScriptPreview(output: DefinitionFileOutput) {
  if (output.fileName === "categories.ts") {
    const data = buildCategories(output.rows);

    return `export type CategoryDefinition = {
  code: string;
  title: string;
  description: string;
  order: number;
};

export const categories: CategoryDefinition[] = ${stringifyTs(data)};

export function getCategoryDefinition(code: string): CategoryDefinition {
  return (
    categories.find((category) => category.code === code) ??
    categories.find((category) => category.code === "Overig")!
  );
}
`;
  }

  if (output.fileName === "dimensions.ts") {
    const data = buildDimensions(output.rows);

    return `import type { DimensionCategory } from "./types";

export type DimensionDefinition = {
  code: string;
  title: string;
  category: DimensionCategory;
  description: string;
  order: number;
  isActive: boolean;
};

export const dimensions: DimensionDefinition[] = ${stringifyTs(data)};
`;
  }

  if (output.fileName === "option-sets.ts") {
    const data = buildOptionSets(output.rows);

    return `import type { OptionSetDefinition } from "./types";

export const optionSets: OptionSetDefinition[] = ${stringifyTs(data)};
`;
  }

  if (output.fileName === "questions.ts") {
    const data = buildQuestions(output.rows);

    return `import type { QuestionDefinition } from "./types";

export const questions: QuestionDefinition[] = ${stringifyTs(data)};
`;
  }

  if (output.fileName === "sections.ts") {
    const data = buildSections(output.rows);

    return `import type { SectionDefinition } from "../types";

export const sections: SectionDefinition[] = ${stringifyTs(data)};
`;
  }

  return `// Geen doelbestand gekoppeld.
// Ruwe importregels:
export const unknownDefinitionRows = ${stringifyTs(output.rows)} as const;
`;
}

function buildImportPackage(
  outputs: DefinitionFileOutput[],
  summary: MappingStatusSummary,
  mode: string
): ImportPackage {
  const allowedFiles: Exclude<DefinitionFileKey, "unknown">[] = [
    "categories.ts",
    "dimensions.ts",
    "option-sets.ts",
    "questions.ts",
    "sections.ts",
  ];

  const files = outputs
    .filter((output) => {
      return (
        allowedFiles.includes(
          output.fileName as Exclude<DefinitionFileKey, "unknown">
        ) && output.rows.length > 0
      );
    })
    .map((output) => ({
      fileName: output.fileName as Exclude<DefinitionFileKey, "unknown">,
      rowCount: output.rows.length,
      content: buildTypeScriptPreview(output),
    }));

  return {
    packageType: "kweekers-definition-import-package",
    packageVersion: 1,
    generatedAt: new Date().toISOString(),
    source: {
      app: "kweekers-groeimodel",
      mode,
    },
    mappingStatus: summary,
    files,
  };
}
function isFilledString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidNumberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

function validateImportPackageOutputs(
  outputs: DefinitionFileOutput[],
  mappingStatus: MappingStatusSummary
): ImportPackageValidationResult {
  const issues: ImportPackageValidationIssue[] = [];

  if (mappingStatus.missingRequiredFields > 0) {
    issues.push({
      fileName: "unknown",
      severity: "error",
      message: `Er missen nog ${mappingStatus.missingRequiredFields} verplichte mappingvelden.`,
    });
  }

  if (mappingStatus.filesWithAttention > 0) {
    issues.push({
      fileName: "unknown",
      severity: "error",
      message: `Er zijn nog ${mappingStatus.filesWithAttention} doelbestanden met mapping-aandacht.`,
    });
  }

  for (const output of outputs) {
    if (output.fileName === "unknown" && output.rows.length > 0) {
      issues.push({
        fileName: output.fileName,
        severity: "error",
        message:
          "Er zijn importregels die niet aan een bekend doelbestand gekoppeld zijn.",
      });

      continue;
    }

    if (output.rows.length === 0) {
      continue;
    }

    if (output.fileName === "categories.ts") {
      const categories = buildCategories(output.rows);

      categories.forEach((category, index) => {
        if (!isFilledString(category.code)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "code",
            message: "Categorie mist een code.",
          });
        }

        if (!isFilledString(category.title)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "title",
            message: "Categorie mist een titel.",
          });
        }

        if (!isValidNumberValue(category.order)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "order",
            message: "Categorie heeft geen geldige volgorde.",
          });
        }
      });
    }

    if (output.fileName === "dimensions.ts") {
      const dimensions = buildDimensions(output.rows);

      dimensions.forEach((dimension, index) => {
        if (!isFilledString(dimension.code)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "code",
            message: "Dimensie mist een code.",
          });
        }

        if (!isFilledString(dimension.title)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "title",
            message: "Dimensie mist een titel.",
          });
        }

        if (!isFilledString(dimension.category)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "category",
            message: "Dimensie mist een categorie.",
          });
        }

        if (!isValidNumberValue(dimension.order)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "order",
            message: "Dimensie heeft geen geldige volgorde.",
          });
        }
      });
    }

    if (output.fileName === "option-sets.ts") {
      const optionSets = buildOptionSets(output.rows) as Array<{
        key?: unknown;
        title?: unknown;
        options?: Array<Record<string, unknown>>;
      }>;

      const rowsWithOptionSetKey = output.rows.filter((row) =>
        isFilledString(
          getString(row, [
            "key",
            "optionSet",
            "option_set",
            "optionSetKey",
            "option_set_key",
            "set",
            "setKey",
            "set_key",
            "optionGroup",
            "option_group",
          ])
        )
      ).length;

      const generatedOptionCount = optionSets.reduce((total, optionSet) => {
        return (
          total +
          (Array.isArray(optionSet.options) ? optionSet.options.length : 0)
        );
      }, 0);

      if (optionSets.length === 0) {
        issues.push({
          fileName: output.fileName,
          severity: "error",
          message:
            "Er zijn option-set regels aanwezig, maar er kon geen geldige option-set worden gegenereerd.",
        });
      }

if (rowsWithOptionSetKey > generatedOptionCount) {
  const skippedRows = output.rows
    .map((row, index) => {
      const key = getString(row, [
        "key",
        "optionSet",
        "option_set",
        "optionSetKey",
        "option_set_key",
        "set",
        "setKey",
        "set_key",
        "optionGroup",
        "option_group",
      ]).trim();

      if (!key) return null;

      const value = getString(row, [
        "value",
        "waarde",
        "optionValue",
        "option_value",
        "optionKey",
        "option_key",
        "answerValue",
        "answer_value",
      ]).trim();

      const label = getString(row, [
        "label",
        "label_nl",
        "tekst",
        "text",
        "answerLabel",
        "answer_label",
        "optionLabel",
        "option_label",
      ]).trim();

      if (value && label) return null;

      return {
        index: index + 1,
        key,
        value,
        label,
      };
    })
    .filter(Boolean)
    .slice(0, 5) as Array<{
    index: number;
    key: string;
    value: string;
    label: string;
  }>;

  issues.push({
    fileName: output.fileName,
    severity: "warning",
    message: `${
      rowsWithOptionSetKey - generatedOptionCount
    } option-set regel(s) zijn overgeslagen. Dit zijn waarschijnlijk headerregels, groepsregels of incomplete regels zonder value en/of label.`,
    details: skippedRows.map((row) => {
      const missing = [
        row.value ? null : "value ontbreekt",
        row.label ? null : "label ontbreekt",
      ]
        .filter(Boolean)
        .join(", ");

      return `Regel ${row.index}: key="${row.key}" (${missing})`;
    }),
  });
}

      optionSets.forEach((optionSet, setIndex) => {
        if (!isFilledString(optionSet.key)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: setIndex + 1,
            field: "key",
            message: "Option-set mist een key.",
          });
        }

        if (!Array.isArray(optionSet.options) || optionSet.options.length === 0) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: setIndex + 1,
            field: "options",
            message: "Option-set heeft geen geldige options.",
          });

          return;
        }

        optionSet.options.forEach((option, optionIndex) => {
          if (!isFilledString(option.value)) {
            issues.push({
              fileName: output.fileName,
              severity: "error",
              rowIndex: optionIndex + 1,
              field: "value",
              message: `Option in ${String(optionSet.key)} mist een value.`,
            });
          }

          if (!isFilledString(option.label)) {
            issues.push({
              fileName: output.fileName,
              severity: "error",
              rowIndex: optionIndex + 1,
              field: "label",
              message: `Option in ${String(optionSet.key)} mist een label.`,
            });
          }

          if (!isValidNumberValue(option.order)) {
            issues.push({
              fileName: output.fileName,
              severity: "error",
              rowIndex: optionIndex + 1,
              field: "order",
              message: `Option in ${String(
                optionSet.key
              )} heeft geen geldige volgorde.`,
            });
          }
        });
      });
    }

    if (output.fileName === "questions.ts") {
      const questions = buildQuestions(output.rows) as Array<
        Record<string, unknown>
      >;

      questions.forEach((question, index) => {
        if (!isFilledString(question.key)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "key",
            message: "Vraag mist een key.",
          });
        }

        if (!isFilledString(question.sectionCode)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "sectionCode",
            message: "Vraag mist een sectionCode.",
          });
        }

        if (!isFilledString(question.label)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "label",
            message: "Vraag mist een label.",
          });
        }

        if (!isFilledString(question.inputType)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "inputType",
            message: "Vraag mist een inputType.",
          });
        }

        if (!isValidNumberValue(question.order)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "order",
            message: "Vraag heeft geen geldige volgorde.",
          });
        }
      });
    }

    if (output.fileName === "sections.ts") {
      const sections = buildSections(output.rows) as Array<
        Record<string, unknown>
      >;

      sections.forEach((section, index) => {
        if (!isFilledString(section.code)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "code",
            message: "Sectie mist een code.",
          });
        }

        if (!isFilledString(section.title)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "title",
            message: "Sectie mist een titel.",
          });
        }

        if (!isValidNumberValue(section.order)) {
          issues.push({
            fileName: output.fileName,
            severity: "error",
            rowIndex: index + 1,
            field: "order",
            message: "Sectie heeft geen geldige volgorde.",
          });
        }
      });
    }
  }

  const errors = issues.filter((issue) => issue.severity === "error").length;
  const warnings = issues.filter(
    (issue) => issue.severity === "warning"
  ).length;

  return {
    isSafe: errors === 0,
    errors,
    warnings,
    issues,
  };
}
function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function SheetCountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
function ImportPackageValidationPanel({
  validation,
}: {
  validation: ImportPackageValidationResult;
}) {
  if (validation.issues.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-950">
        Importpakket-validatie geslaagd. Er zijn geen fouten of waarschuwingen
        gevonden in de gegenereerde output.
      </div>
    );
  }

  return (
    <div
      className={
        validation.isSafe
          ? "mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4"
          : "mt-5 rounded-2xl border border-red-200 bg-red-50 p-4"
      }
    >
      <div
        className={
          validation.isSafe
            ? "text-sm font-semibold text-amber-950"
            : "text-sm font-semibold text-red-950"
        }
      >
        Importpakket-validatie: {validation.errors} fout(en),{" "}
        {validation.warnings} waarschuwing(en)
      </div>

      <div className="mt-3 space-y-2">
        {validation.issues.slice(0, 12).map((issue, index) => (
          <div
            key={`${issue.fileName}-${issue.message}-${index}`}
            className="rounded-xl border border-black/10 bg-white p-3 text-xs leading-5"
          >
            <div className="font-medium">
              {issue.severity === "error" ? "Fout" : "Waarschuwing"} —{" "}
              {issue.fileName}
            </div>

            <div className="mt-1 text-muted-foreground">{issue.message}</div>

{(issue.field || issue.rowIndex) && (
  <div className="mt-1 text-muted-foreground">
    {issue.field ? `Veld: ${issue.field}` : ""}
    {issue.field && issue.rowIndex ? " · " : ""}
    {issue.rowIndex ? `Regel: ${issue.rowIndex}` : ""}
  </div>
)}

{issue.details && issue.details.length > 0 && (
  <div className="mt-2 rounded-lg border border-black/10 bg-black/[0.02] p-2 text-muted-foreground">
    <div className="font-medium text-black">
      Voorbeelden van overgeslagen regels:
    </div>

    <ul className="mt-1 list-disc space-y-1 pl-4">
      {issue.details.map((detail) => (
        <li key={detail}>{detail}</li>
      ))}
    </ul>
  </div>
)}
          </div>
        ))}

        {validation.issues.length > 12 && (
          <div className="rounded-xl border border-black/10 bg-white p-3 text-xs text-muted-foreground">
            Er zijn meer meldingen. Alleen de eerste 12 worden hier getoond.
          </div>
        )}
      </div>
    </div>
  );
}

function MappingStatusSummaryCard({
  summary,
}: {
  summary: MappingStatusSummary;
}) {
  const hasAttention =
    summary.filesWithAttention > 0 || summary.missingRequiredFields > 0;

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Mappingstatus</h2>

          <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
            Samenvatting van de kolom-mapping over alle doelbestanden. Hiermee
            zie je direct of verplichte velden goed gekoppeld zijn.
          </p>
        </div>

        <span
          className={
            hasAttention
              ? "rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-950"
              : "rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-950"
          }
        >
          {hasAttention ? "Aandacht nodig" : "Mapping veilig"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-6">
        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="text-sm text-muted-foreground">Doelbestanden</div>
          <div className="mt-2 text-2xl font-semibold">
            {summary.totalFiles}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="text-sm text-muted-foreground">Met regels</div>
          <div className="mt-2 text-2xl font-semibold">
            {summary.filesWithRows}
          </div>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="text-sm text-green-950">Bestanden OK</div>
          <div className="mt-2 text-2xl font-semibold text-green-950">
            {summary.filesOk}
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="text-sm text-red-950">Met aandacht</div>
          <div className="mt-2 text-2xl font-semibold text-red-950">
            {summary.filesWithAttention}
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="text-sm text-red-950">Verplicht mist</div>
          <div className="mt-2 text-2xl font-semibold text-red-950">
            {summary.missingRequiredFields}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="text-sm text-muted-foreground">Optioneel leeg</div>
          <div className="mt-2 text-2xl font-semibold">
            {summary.emptyOptionalFields}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm leading-6 text-muted-foreground">
        {hasAttention
          ? "Er ontbreken nog verplichte velden in één of meer doelbestanden. Controleer de detailkaarten hieronder voordat je output overneemt."
          : "Alle doelbestanden met importregels hebben hun verplichte velden gekoppeld. Eventuele lege optionele velden zijn niet blokkerend."}
      </div>
    </section>
  );
}

function MappingCheckCard({ output }: { output: DefinitionFileOutput }) {
  const check = buildMappingCheck(output);

  const hasRows = check.rowCount > 0;
  const hasMissingRequiredFields = check.missingRequiredFields.length > 0;

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {check.fileName}
          </div>

          <h3 className="text-lg font-semibold">Kolom-mapping controle</h3>

          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Controle of de kolommen uit Excel goed worden herkend en gekoppeld
            aan de velden van dit doelbestand.
          </p>
        </div>

        <span
          className={
            !hasRows
              ? "rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black"
              : hasMissingRequiredFields
                ? "rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-950"
                : "rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-950"
          }
        >
          {!hasRows
            ? "Geen regels"
            : hasMissingRequiredFields
              ? "Mapping aandacht"
              : "Mapping OK"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="text-sm text-muted-foreground">Importregels</div>
          <div className="mt-2 text-2xl font-semibold">{check.rowCount}</div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="text-sm text-muted-foreground">Gevonden kolommen</div>
          <div className="mt-2 text-2xl font-semibold">
            {check.rawColumns.length}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="text-sm text-muted-foreground">
            Ontbrekend verplicht
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {check.missingRequiredFields.length}
          </div>
        </div>
      </div>

      {hasRows && (
        <>
          <details className="mt-5 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
            <summary className="cursor-pointer text-sm font-medium">
              Gevonden Excel-kolommen tonen
            </summary>

            <div className="mt-4 flex flex-wrap gap-2">
              {check.rawColumns.map((column) => (
                <span
                  key={`${check.fileName}-${column}`}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs"
                >
                  {column}
                </span>
              ))}
            </div>
          </details>

          <div className="mt-5 overflow-auto rounded-2xl border border-black/10">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-black/[0.03]">
                <tr>
                  <th className="border-b border-black/10 px-4 py-3">
                    Doelveld
                  </th>
                  <th className="border-b border-black/10 px-4 py-3">Type</th>
                  <th className="border-b border-black/10 px-4 py-3">
                    Verplicht
                  </th>
                  <th className="border-b border-black/10 px-4 py-3">
                    Gekoppelde kolom
                  </th>
                  <th className="border-b border-black/10 px-4 py-3">
                    Gevuld
                  </th>
                  <th className="border-b border-black/10 px-4 py-3">Leeg</th>
                  <th className="border-b border-black/10 px-4 py-3">
                    Gezochte namen
                  </th>
                </tr>
              </thead>

              <tbody>
                {check.fields.map((field) => {
                  const hasProblem =
                    field.required &&
                    (!field.matchedColumn || field.filledRows === 0);

                  return (
                    <tr
                      key={`${check.fileName}-${field.outputField}`}
                      className={
                        hasProblem
                          ? "border-b border-red-100 bg-red-50"
                          : "border-b border-black/5"
                      }
                    >
                      <td className="px-4 py-3 font-medium">
                        {field.outputField}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {field.type}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {field.required ? "Ja" : "Nee"}
                      </td>
                      <td className="px-4 py-3">
                        {field.matchedColumn ? (
                          <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-950">
                            {field.matchedColumn}
                          </span>
                        ) : (
                          <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-950">
                            Niet gevonden
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {field.filledRows}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {field.emptyRows}
                      </td>
                      <td className="max-w-[320px] px-4 py-3 text-xs text-muted-foreground">
                        {field.candidates.join(", ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function DefinitionFileCard({
  output,
  onCopyJson,
  onDownloadJson,
  onCopyTypeScript,
  onDownloadTypeScript,
}: {
  output: DefinitionFileOutput;
  onCopyJson: (output: DefinitionFileOutput) => void;
  onDownloadJson: (output: DefinitionFileOutput) => void;
  onCopyTypeScript: (output: DefinitionFileOutput) => void;
  onDownloadTypeScript: (output: DefinitionFileOutput) => void;
}) {
  const hasContent = output.rows.length > 0 || output.sheets.length > 0;

  const proposalJson = JSON.stringify(
    buildDefinitionFileProposal(output),
    null,
    2
  );

  const typeScriptPreview = buildTypeScriptPreview(output);

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {output.fileName}
          </div>

          <h3 className="text-lg font-semibold">{output.title}</h3>

          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {output.description}
          </p>

          <p className="text-sm text-muted-foreground">
            Importregels gekoppeld:{" "}
            <span className="font-medium text-black">{output.rows.length}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onCopyJson(output)}
            disabled={!hasContent}
            className={
              hasContent
                ? "inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
                : "inline-flex cursor-not-allowed rounded-2xl border border-black/10 bg-black/10 px-5 py-3 text-sm font-medium text-muted-foreground"
            }
          >
            JSON kopiëren
          </button>

          <button
            type="button"
            onClick={() => onDownloadJson(output)}
            disabled={!hasContent}
            className={
              hasContent
                ? "inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
                : "inline-flex cursor-not-allowed rounded-2xl border border-black/10 bg-black/10 px-5 py-3 text-sm font-medium text-muted-foreground"
            }
          >
            JSON downloaden
          </button>

          <button
            type="button"
            onClick={() => onCopyTypeScript(output)}
            disabled={!hasContent}
            className={
              hasContent
                ? "inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
                : "inline-flex cursor-not-allowed rounded-2xl border border-black/10 bg-black/10 px-5 py-3 text-sm font-medium text-muted-foreground"
            }
          >
            TS kopiëren
          </button>

          <button
            type="button"
            onClick={() => onDownloadTypeScript(output)}
            disabled={!hasContent}
            className={
              hasContent
                ? "inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
                : "inline-flex cursor-not-allowed rounded-2xl border border-black/10 bg-black/10 px-5 py-3 text-sm font-medium text-muted-foreground"
            }
          >
            TS downloaden
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        <SheetCountCard label="Nieuw" value={output.counts.new} />
        <SheetCountCard label="Gewijzigd" value={output.counts.changed} />
        <SheetCountCard label="Ongewijzigd" value={output.counts.unchanged} />
        <SheetCountCard
          label="Mogelijk verwijderd"
          value={output.counts.possiblyRemoved}
        />
        <SheetCountCard label="Ongeldig" value={output.counts.invalid} />
      </div>

      <div className="mt-5 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
        <div className="text-sm font-medium">Gekoppelde sheets</div>

        {output.sheets.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Geen sheets gekoppeld aan dit doelbestand.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {output.sheets.map((sheet) => (
              <div
                key={`${output.fileName}-${sheet.sheetName}`}
                className="rounded-xl border border-black/10 bg-white p-3"
              >
                <div className="text-sm font-medium">{sheet.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Sheet: {sheet.sheetName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {hasContent && (
        <div className="mt-5 space-y-3">
          <details className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
            <summary className="cursor-pointer text-sm font-medium">
              JSON-preview voor {output.fileName}
            </summary>

            <pre className="mt-4 max-h-[360px] overflow-auto rounded-2xl border border-black/10 bg-white p-4 text-xs">
              {proposalJson}
            </pre>
          </details>

          <details className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
            <summary className="cursor-pointer text-sm font-medium">
              TypeScript-output voor {output.fileName}
            </summary>

            <pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl border border-black/10 bg-white p-4 text-xs">
              {typeScriptPreview}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

export default function DefinitionImportApplyResultPage() {
  const [result, setResult] = useState<ApplyResult | null>(null);
  const [importRows, setImportRows] = useState<ImportRows | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  useEffect(() => {
    const resultRaw = window.localStorage.getItem("definitionImportApplyResult");
    const conceptRaw = window.localStorage.getItem("definitionImportConcept");

    if (!resultRaw) {
      setResult(null);
      setImportRows(null);
      setIsLoaded(true);
      return;
    }

    try {
      const parsedResult = JSON.parse(resultRaw) as ApplyResult;
      setResult(parsedResult);
    } catch {
      setResult(null);
    }

    try {
      if (conceptRaw) {
        const parsedConcept = JSON.parse(conceptRaw) as ImportConcept;
        setImportRows(parsedConcept.importRows ?? null);
      }
    } catch {
      setImportRows(null);
    }

    setIsLoaded(true);
  }, []);

  const totals = useMemo(() => {
    return result?.totals ?? EMPTY_COUNTS;
  }, [result]);

  const sheets = result?.sheets ?? [];

  const definitionFileOutputs = useMemo(() => {
    return buildDefinitionFileOutputs(sheets, importRows);
  }, [sheets, importRows]);

  const mappingStatusSummary = useMemo(() => {
    return buildMappingStatusSummary(definitionFileOutputs);
  }, [definitionFileOutputs]);

  const technicalProposal = useMemo(() => {
    if (!result) return null;
    return buildTechnicalProposal(result);
  }, [result]);

  const technicalProposalJson = useMemo(() => {
    if (!technicalProposal) return "";
    return JSON.stringify(technicalProposal, null, 2);
  }, [technicalProposal]);

  const importPackage = useMemo(() => {
  if (!result) return null;

  return buildImportPackage(
    definitionFileOutputs,
    mappingStatusSummary,
    result.mode ?? "safe-test"
  );
  }, [definitionFileOutputs, mappingStatusSummary, result]);

  const importPackageJson = useMemo(() => {
  if (!importPackage) return "";
  return JSON.stringify(importPackage, null, 2);
}, [importPackage]);

const importPackageValidation = useMemo(() => {
  return validateImportPackageOutputs(
    definitionFileOutputs,
    mappingStatusSummary
  );
}, [definitionFileOutputs, mappingStatusSummary]);

  const clearResult = () => {
    window.localStorage.removeItem("definitionImportApplyResult");
    setResult(null);
    setImportRows(null);
  };

  const copyText = async (text: string, successMessage: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage(successMessage);
    } catch {
      setCopyMessage(
        "Kopiëren is niet gelukt. Selecteer de tekst handmatig en kopieer deze."
      );
    }

    window.setTimeout(() => {
      setCopyMessage(null);
    }, 3000);
  };

  const downloadText = (text: string, fileName: string, mimeType: string) => {
    if (!text) return;

    const blob = new Blob([text], {
      type: mimeType,
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  const getTimestamp = () => {
    return new Date()
      .toISOString()
      .replaceAll(":", "-")
      .replaceAll(".", "-");
  };

  const copyJson = async () => {
    await copyText(
      technicalProposalJson,
      "Volledig importvoorstel is gekopieerd naar het klembord."
    );
  };

  const downloadJson = () => {
    downloadText(
      technicalProposalJson,
      `definition-import-proposal-${getTimestamp()}.json`,
      "application/json;charset=utf-8"
    );
  };

const downloadImportPackage = () => {
  if (!importPackageJson) return;

  if (!importPackageValidation.isSafe) {
    setCopyMessage(
      "Importpakket downloaden is geblokkeerd: los eerst de validatiefouten op."
    );

    window.setTimeout(() => {
      setCopyMessage(null);
    }, 3000);

    return;
  }

  downloadText(
    importPackageJson,
    `definition-import-package-${getTimestamp()}.json`,
    "application/json;charset=utf-8"
  );
};

  const copyDefinitionFileJson = async (output: DefinitionFileOutput) => {
    const json = JSON.stringify(buildDefinitionFileProposal(output), null, 2);

    await copyText(
      json,
      `JSON voor ${output.fileName} is gekopieerd naar het klembord.`
    );
  };

  const downloadDefinitionFileJson = (output: DefinitionFileOutput) => {
    const json = JSON.stringify(buildDefinitionFileProposal(output), null, 2);
    const safeName = output.fileName.replace(".ts", "").replaceAll(".", "-");

    downloadText(
      json,
      `definition-file-proposal-${safeName}-${getTimestamp()}.json`,
      "application/json;charset=utf-8"
    );
  };

  const copyDefinitionFileTypeScript = async (output: DefinitionFileOutput) => {
    const typeScriptPreview = buildTypeScriptPreview(output);

    await copyText(
      typeScriptPreview,
      `TypeScript-output voor ${output.fileName} is gekopieerd naar het klembord.`
    );
  };

  const downloadDefinitionFileTypeScript = (output: DefinitionFileOutput) => {
    const typeScriptPreview = buildTypeScriptPreview(output);
    const safeName = output.fileName.replace(".ts", "").replaceAll(".", "-");

    downloadText(
      typeScriptPreview,
      `definition-file-output-${safeName}-${getTimestamp()}.ts`,
      "text/typescript;charset=utf-8"
    );
  };

  if (!isLoaded) {
    return (
      <main className="mx-auto max-w-6xl space-y-8 p-8">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            KWEEKERS Groeimodel
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Importvoorstel laden
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground">
            Het resultaat van de importcontrole wordt geladen.
          </p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="mx-auto max-w-6xl space-y-8 p-8">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            KWEEKERS Groeimodel
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Geen importvoorstel gevonden
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground">
            Er is nog geen resultaat van de server-side importcontrole
            opgeslagen. Ga terug naar het importconcept en voer de veilige test
            opnieuw uit.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/definition-import-concept"
            className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Terug naar importconcept
          </Link>

          <Link
            href="/definition-import"
            className="inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
          >
            Nieuwe import-preview uitvoeren
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          KWEEKERS Groeimodel
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Importvoorstel
        </h1>

        <p className="max-w-3xl text-sm text-muted-foreground">
          Dit is het resultaat van de server-side controle. Er is nog niets
          definitief toegepast in de actieve definitie.
        </p>
      </div>

      <section className="rounded-3xl border border-black/10 bg-black/[0.02] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Status</h2>

            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {result.message ??
                result.error ??
                "Importvoorstel is geladen."}
            </p>

            <div className="text-sm text-muted-foreground">
              Modus:{" "}
              <span className="font-medium text-black">
                {result.mode ?? "niet bekend"}
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              Aangemaakt op:{" "}
              <span className="font-medium text-black">
                {formatDate(result.createdAt)}
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              Importregels beschikbaar:{" "}
              <span className="font-medium text-black">
                {importRows ? "ja" : "nee"}
              </span>
            </div>
          </div>

          <span
            className={
              result.ok
                ? "rounded-full border border-black/10 bg-black px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black"
            }
          >
            {result.ok ? "Controle geslaagd" : "Controle met aandacht"}
          </span>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-lg font-semibold text-amber-950">Belangrijk</h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-amber-950">
          Dit is nog geen echte live-import. Deze stap maakt TypeScript-output
          die aansluit op de huidige definitiebestanden. Controleer de output
          altijd voordat je iets overneemt in Git.
        </p>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Samenvatting</h2>
          <p className="text-sm text-muted-foreground">
            Totaalbeeld van de gecontroleerde import.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <SummaryCard label="Nieuw" value={totals.new} />
          <SummaryCard label="Gewijzigd" value={totals.changed} />
          <SummaryCard label="Ongewijzigd" value={totals.unchanged} />
          <SummaryCard
            label="Mogelijk verwijderd"
            value={totals.possiblyRemoved}
          />
          <SummaryCard label="Ongeldig" value={totals.invalid} />
        </div>
      </section>

<section className="rounded-3xl border border-black/10 bg-white p-5">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Gecontroleerd importpakket</h2>

      <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
        Download een gecontroleerd importpakket met de gegenereerde
        TypeScript-output per doelbestand. Dit pakket schrijft nog niets weg,
        maar vormt de basis voor handmatig overnemen of een later lokaal
        apply-script.
      </p>
    </div>

<button
  type="button"
  onClick={downloadImportPackage}
  disabled={
    !importPackage ||
    importPackage.files.length === 0 ||
    !importPackageValidation.isSafe
  }
  className={
    importPackage &&
    importPackage.files.length > 0 &&
    importPackageValidation.isSafe
      ? "inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
      : "inline-flex cursor-not-allowed rounded-2xl border border-black/10 bg-black/10 px-5 py-3 text-sm font-medium text-muted-foreground"
  }
>
  Importpakket downloaden
</button>
  </div>

  <div className="mt-5 grid gap-4 md:grid-cols-4">
    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
      <div className="text-sm text-muted-foreground">Bestanden in pakket</div>
      <div className="mt-2 text-2xl font-semibold">
        {importPackage?.files.length ?? 0}
      </div>
    </div>

    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
      <div className="text-sm text-muted-foreground">Verplicht mist</div>
      <div className="mt-2 text-2xl font-semibold">
        {mappingStatusSummary.missingRequiredFields}
      </div>
    </div>

    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
      <div className="text-sm text-muted-foreground">Mapping aandacht</div>
      <div className="mt-2 text-2xl font-semibold">
        {mappingStatusSummary.filesWithAttention}
      </div>
    </div>

    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
      <div className="text-sm text-muted-foreground">Modus</div>
      <div className="mt-2 text-xl font-semibold">
        {result.mode ?? "safe-test"}
      </div>
    </div>
  </div>

<ImportPackageValidationPanel validation={importPackageValidation} />

  <details className="mt-5 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
    <summary className="cursor-pointer text-sm font-medium">
      Importpakket-preview tonen
    </summary>

    <pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl border border-black/10 bg-white p-4 text-xs">
      {importPackageJson}
    </pre>
  </details>
</section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Sheets in dit voorstel</h2>
          <p className="text-sm text-muted-foreground">
            Per sheet zie je hoeveel records nieuw, gewijzigd, ongewijzigd,
            mogelijk verwijderd of ongeldig zijn.
          </p>
        </div>

        {sheets.length === 0 && (
          <div className="rounded-3xl border border-black/10 bg-white p-5 text-sm text-muted-foreground">
            Er zijn geen sheetdetails beschikbaar in dit importvoorstel.
          </div>
        )}

        {sheets.map((sheet) => (
          <div
            key={sheet.sheetName}
            className="rounded-3xl border border-black/10 bg-white p-5"
          >
            <div className="space-y-1">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {sheet.sheetName}
              </div>

              <h3 className="text-lg font-semibold">{sheet.title}</h3>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-5">
              <SheetCountCard label="Nieuw" value={sheet.counts.new} />
              <SheetCountCard
                label="Gewijzigd"
                value={sheet.counts.changed}
              />
              <SheetCountCard
                label="Ongewijzigd"
                value={sheet.counts.unchanged}
              />
              <SheetCountCard
                label="Mogelijk verwijderd"
                value={sheet.counts.possiblyRemoved}
              />
              <SheetCountCard
                label="Ongeldig"
                value={sheet.counts.invalid}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <MappingStatusSummaryCard summary={mappingStatusSummary} />

        <details className="rounded-3xl border border-black/10 bg-white p-5">
          <summary className="cursor-pointer text-lg font-semibold">
            Kolom-mapping details tonen
          </summary>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
            Hier zie je per doelbestand of de kolommen uit de Excel-import goed
            worden gekoppeld aan de velden van de TypeScript-output. Dit
            detailblok is vooral bedoeld voor controle en foutopsporing.
          </p>

          <div className="mt-5 space-y-5">
            {definitionFileOutputs.map((output) => (
              <MappingCheckCard
                key={`mapping-${output.fileName}`}
                output={output}
              />
            ))}
          </div>
        </details>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            Echte TypeScript-output per doelbestand
          </h2>

          <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
            Deze output gebruikt nu dezelfde exportstructuur als je huidige
            definitiebestanden. Dit blijft een preview: er wordt niets
            weggeschreven.
          </p>
        </div>

        {copyMessage && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-950">
            {copyMessage}
          </div>
        )}

        <div className="space-y-5">
          {definitionFileOutputs.map((output) => (
            <DefinitionFileCard
              key={output.fileName}
              output={output}
              onCopyJson={copyDefinitionFileJson}
              onDownloadJson={downloadDefinitionFileJson}
              onCopyTypeScript={copyDefinitionFileTypeScript}
              onDownloadTypeScript={downloadDefinitionFileTypeScript}
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              Technisch definitievoorstel
            </h2>

            <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
              Dit JSON-bestand is het volledige technische voorstel op basis van
              de gecontroleerde import. Dit blijft de overkoepelende export.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyJson}
              className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
            >
              JSON kopiëren
            </button>

            <button
              type="button"
              onClick={downloadJson}
              className="inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
            >
              JSON downloaden
            </button>
          </div>
        </div>

        <pre className="mt-5 max-h-[520px] overflow-auto rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-xs">
          {technicalProposalJson}
        </pre>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-5">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Volgende stap</h2>

          <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
            Controleer of de mappingstatus veilig is. Daarna kunnen we de pagina
            compacter maken of de TypeScript-output inhoudelijk verder
            aanscherpen.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/definition-import-concept"
            className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Terug naar importconcept
          </Link>

          <Link
            href="/definition-import"
            className="inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
          >
            Nieuwe import-preview uitvoeren
          </Link>

          <button
            type="button"
            onClick={clearResult}
            className="inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
          >
            Resultaat verwijderen
          </button>
        </div>
      </section>

      <details className="rounded-3xl border border-black/10 bg-black/[0.02] p-5">
        <summary className="cursor-pointer text-sm font-medium">
          Ruwe server-response tonen
        </summary>

        <pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl border border-black/10 bg-white p-4 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>
    </main>
  );
}