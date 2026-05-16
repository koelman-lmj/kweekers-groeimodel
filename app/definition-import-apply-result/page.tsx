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

const EMPTY_COUNTS: Counts = {
  new: 0,
  changed: 0,
  unchanged: 0,
  possiblyRemoved: 0,
  invalid: 0,
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
    code: getString(row, ["code", "categoryCode", "categorieCode"]),
    title: getString(row, ["title", "titel", "name", "naam"]),
    description: getString(row, ["description", "omschrijving", "beschrijving"]),
    order: getNumber(row, ["order", "volgorde"], (index + 1) * 10),
  }));
}

function buildDimensions(rows: Record<string, string>[]) {
  return rows.map((row, index) => ({
    code: getString(row, ["code", "dimensionCode", "dimensieCode"]),
    title: getString(row, ["title", "titel", "name", "naam"]),
    category: getString(row, ["category", "categorie"], "Overig"),
    description: getString(row, ["description", "omschrijving", "beschrijving"]),
    order: getNumber(row, ["order", "volgorde"], (index + 1) * 10),
    isActive: getBoolean(row, ["isActive", "actief"], true),
  }));
}

function buildSections(rows: Record<string, string>[]) {
  return rows.map((row, index) =>
    compactObject({
      code: getString(row, ["code", "sectionCode", "sectieCode"]),
      title: getString(row, ["title", "titel", "name", "naam"]),
      shortTitle: getOptionalString(row, ["shortTitle", "korteTitel"]),
      phase: getOptionalString(row, ["phase", "fase"]),
      order: getNumber(row, ["order", "volgorde"], (index + 1) * 10),
      summaryEnabled: getBoolean(
        row,
        ["summaryEnabled", "samenvatting", "samenvattingActief"],
        false
      ),
      nextSectionCode: getOptionalString(row, [
        "nextSectionCode",
        "volgendeSectie",
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
    const key = getString(row, ["key", "optionSetKey", "option_set_key"]);
    if (!key) continue;

    const title = getOptionalString(row, ["title", "titel"]);
    const current = grouped.get(key) ?? {
      key,
      title,
      options: [],
    };

    const option = compactObject({
      value: getString(row, ["value", "waarde"]),
      label: getString(row, ["label", "tekst"]),
      description: getOptionalString(row, [
        "description",
        "omschrijving",
        "beschrijving",
      ]),
      order: getNumber(row, ["order", "volgorde"], current.options.length * 10 + 10),
      score: getOptionalString(row, ["score"])
        ? getNumber(row, ["score"], 0)
        : undefined,
      adviceSignal: getOptionalString(row, [
        "adviceSignal",
        "adviesSignaal",
        "signal",
      ]),
    });

    current.options.push(option);
    grouped.set(key, current);
  }

  return Array.from(grouped.values()).map((set) => compactObject(set));
}

function buildQuestions(rows: Record<string, string>[]) {
  return rows.map((row, index) =>
    compactObject({
      key: getString(row, ["key", "questionKey", "vraagKey"]),
      sectionCode: getString(row, ["sectionCode", "sectieCode"]),
      order: getNumber(row, ["order", "volgorde"], (index + 1) * 10),
      label: getString(row, ["label", "vraag", "title", "titel"]),
      helpText: getOptionalString(row, ["helpText", "help", "toelichting"]),
      inputType: getString(row, ["inputType", "type"], "text"),
      required: getBoolean(row, ["required", "verplicht"], false),
      optionSetKey: getOptionalString(row, ["optionSetKey", "option_set_key"]),
      placeholder: getOptionalString(row, ["placeholder"]),
      examples: getStringArray(row, ["examples", "voorbeelden"]),
      allowsComment: getOptionalString(row, ["allowsComment", "toelichtingToestaan"])
        ? getBoolean(row, ["allowsComment", "toelichtingToestaan"], false)
        : undefined,
      maxSelections: getOptionalString(row, ["maxSelections", "maxSelecties"])
        ? getNumber(row, ["maxSelections", "maxSelecties"], 0)
        : undefined,
      visibleWhen: parseVisibleWhen(row),
      dimensionCode: getOptionalString(row, ["dimensionCode", "dimensieCode"]),
      category: getOptionalString(row, ["category", "categorie"]),
      outputRole: getOptionalString(row, ["outputRole", "rol"]),
      scoreEnabled: getOptionalString(row, ["scoreEnabled", "scoreActief"])
        ? getBoolean(row, ["scoreEnabled", "scoreActief"], false)
        : undefined,
      scoreWeight: getOptionalString(row, ["scoreWeight", "scoreGewicht"])
        ? getNumber(row, ["scoreWeight", "scoreGewicht"], 0)
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

  const technicalProposal = useMemo(() => {
    if (!result) return null;
    return buildTechnicalProposal(result);
  }, [result]);

  const technicalProposalJson = useMemo(() => {
    if (!technicalProposal) return "";
    return JSON.stringify(technicalProposal, null, 2);
  }, [technicalProposal]);

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
            De volgende stap is controleren of de kolomnamen uit de Excel-export
            exact goed worden gemapt naar de juiste velden. Daarna kunnen we per
            bestand de output verder aanscherpen.
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