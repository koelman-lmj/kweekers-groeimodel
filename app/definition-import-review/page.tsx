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

type PreviewSheet = {
  sheetName: string;
  title?: string;
  counts?: Partial<Counts>;
  rowCount?: number;
  rows?: Record<string, string>[];
};

type ImportPreview = {
  ok?: boolean;
  mode?: string;
  message?: string;
  error?: string;
  createdAt?: string;
  totals?: Partial<Counts>;
  sheets?: PreviewSheet[];
};

type ImportConcept = {
  fileName?: string;
  createdAt?: string;
  importRows?: Record<string, Record<string, string>[]>;
  preview?: ImportPreview;
  [key: string]: unknown;
};

type ApplyResult = {
  ok: boolean;
  mode?: string;
  message?: string;
  error?: string;
  createdAt?: string;
  totals?: Counts;
  sheets?: Array<{
    sheetName: string;
    title: string;
    counts: Counts;
  }>;
};

const CONCEPT_STORAGE_KEY = "definitionImportConcept";
const APPLY_RESULT_STORAGE_KEY = "definitionImportApplyResult";

const EMPTY_COUNTS: Counts = {
  new: 0,
  changed: 0,
  unchanged: 0,
  possiblyRemoved: 0,
  invalid: 0,
};

function toNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeCounts(value?: Partial<Counts> | null): Counts {
  return {
    new: toNumber(value?.new),
    changed: toNumber(value?.changed),
    unchanged: toNumber(value?.unchanged),
    possiblyRemoved: toNumber(value?.possiblyRemoved),
    invalid: toNumber(value?.invalid),
  };
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

function formatDate(value?: string) {
  if (!value) return "Niet bekend";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("nl-NL");
}

function getSheetRowCount(sheet: PreviewSheet) {
  if (typeof sheet.rowCount === "number" && Number.isFinite(sheet.rowCount)) {
    return sheet.rowCount;
  }

  if (Array.isArray(sheet.rows)) {
    return sheet.rows.length;
  }

  const counts = normalizeCounts(sheet.counts);

  return (
    counts.new +
    counts.changed +
    counts.unchanged +
    counts.possiblyRemoved +
    counts.invalid
  );
}

function getTargetFileForSheet(sheetName: string) {
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

  return "Onbekend";
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function SheetReviewCard({ sheet }: { sheet: PreviewSheet }) {
  const counts = normalizeCounts(sheet.counts);
  const rowCount = getSheetRowCount(sheet);
  const targetFile = getTargetFileForSheet(sheet.sheetName);
  const hasUnknownTarget = targetFile === "Onbekend";

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {sheet.sheetName}
          </div>

          <h3 className="mt-1 text-lg font-semibold">
            {sheet.title || sheet.sheetName}
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Importregels: <span className="font-medium text-black">{rowCount}</span>
          </p>
        </div>

        <span
          className={
            hasUnknownTarget
              ? "rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-950"
              : "rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-950"
          }
        >
          {targetFile}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        <SummaryCard label="Nieuw" value={counts.new} />
        <SummaryCard label="Gewijzigd" value={counts.changed} />
        <SummaryCard label="Ongewijzigd" value={counts.unchanged} />
        <SummaryCard label="Mogelijk verwijderd" value={counts.possiblyRemoved} />
        <SummaryCard label="Ongeldig" value={counts.invalid} />
      </div>

      {hasUnknownTarget && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-950">
          Deze sheet kan nog niet automatisch aan een doelbestand worden gekoppeld.
          Controleer de sheetnaam voordat je de veilige importcontrole uitvoert.
        </div>
      )}
    </div>
  );
}

export default function DefinitionImportReviewPage() {
  const [concept, setConcept] = useState<ImportConcept | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const rawConcept = window.localStorage.getItem(CONCEPT_STORAGE_KEY);

    if (!rawConcept) {
      setConcept(null);
      setIsLoaded(true);
      return;
    }

    try {
      setConcept(JSON.parse(rawConcept) as ImportConcept);
    } catch {
      setConcept(null);
    }

    setIsLoaded(true);
  }, []);

  const preview = concept?.preview ?? null;

  const sheets = useMemo(() => {
    return Array.isArray(preview?.sheets) ? preview.sheets : [];
  }, [preview]);

  const totals = useMemo(() => {
    if (preview?.totals) {
      return normalizeCounts(preview.totals);
    }

    return sheets.reduce<Counts>((total, sheet) => {
      return addCounts(total, normalizeCounts(sheet.counts));
    }, EMPTY_COUNTS);
  }, [preview, sheets]);

  const totalRows = useMemo(() => {
    return sheets.reduce<number>((total, sheet) => {
      return total + getSheetRowCount(sheet);
    }, 0);
  }, [sheets]);

  const targetSummary = useMemo(() => {
    const targets = new Map<string, number>();

    for (const sheet of sheets) {
      const target = getTargetFileForSheet(sheet.sheetName);
      targets.set(target, (targets.get(target) ?? 0) + getSheetRowCount(sheet));
    }

    return Array.from(targets.entries()).map(([targetFile, rowCount]) => ({
      targetFile,
      rowCount,
    }));
  }, [sheets]);

  const unknownTargets = targetSummary.filter(
    (item) => item.targetFile === "Onbekend"
  );

  async function runSafeImportCheck() {
    if (!concept) {
      setErrorMessage("Geen importconcept gevonden.");
      return;
    }

    setIsRunning(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/definition-import-apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "safe-test",
          concept,
        }),
      });

      const result = (await response.json()) as ApplyResult;

      window.localStorage.setItem(
        APPLY_RESULT_STORAGE_KEY,
        JSON.stringify(result)
      );

      window.location.href = "/definition-import-apply-result";
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Veilige importcontrole kon niet worden uitgevoerd."
      );
    } finally {
      setIsRunning(false);
    }
  }

  if (!isLoaded) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-sm text-muted-foreground">
          Import-review laden...
        </div>
      </main>
    );
  }

  if (!concept) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="text-xs font-medium uppercase tracking-wide">
            KWEEKERS GROEIMODEL
          </div>

          <h1 className="mt-3 text-3xl font-semibold">
            Geen importconcept gevonden
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
            Er staat geen importconcept in de browseropslag. Ga terug naar de
            import en upload het Excel-bestand opnieuw.
          </p>

          <div className="mt-8">
            <Link
              href="/definition-import"
              className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
            >
              Terug naar import
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="rounded-3xl border border-black/10 bg-white p-6">
        <div className="text-xs font-medium uppercase tracking-wide">
          KWEEKERS GROEIMODEL
        </div>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Import-review</h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Controleer het importconcept voordat je de veilige importcontrole
              uitvoert. Deze pagina schrijft nog niets weg naar de definitie.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/definition-import"
              className="inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
            >
              Terug naar import
            </Link>

            <button
              type="button"
              onClick={runSafeImportCheck}
              disabled={isRunning || unknownTargets.length > 0}
              className={
                isRunning || unknownTargets.length > 0
                  ? "inline-flex cursor-not-allowed rounded-2xl border border-black/10 bg-black/10 px-5 py-3 text-sm font-medium text-muted-foreground"
                  : "inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
              }
            >
              {isRunning
                ? "Veilige controle uitvoeren..."
                : "Veilige importcontrole uitvoeren"}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Deze review is nog geen echte import. De controle maakt alleen een
          veilig resultaat en een importpakket-preview. Pas het lokale
          apply-script schrijft definitiebestanden bij.
        </div>

        {unknownTargets.length > 0 && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-950">
            Er zijn nog sheets zonder bekend doelbestand. Pas de sheetnaam of
            importmapping aan voordat je doorgaat.
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-950">
            {errorMessage}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Samenvatting</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Totaalbeeld van het importconcept.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-6">
          <SummaryCard label="Sheets" value={sheets.length} />
          <SummaryCard label="Regels" value={totalRows} />
          <SummaryCard label="Nieuw" value={totals.new} />
          <SummaryCard label="Gewijzigd" value={totals.changed} />
          <SummaryCard label="Ongewijzigd" value={totals.unchanged} />
          <SummaryCard label="Ongeldig" value={totals.invalid} />
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Doelbestanden</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Overzicht van welke definitiebestanden geraakt worden door dit
          importconcept.
        </p>

        {targetSummary.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-muted-foreground">
            Er zijn geen doelbestanden gevonden.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {targetSummary.map((item) => (
              <div
                key={item.targetFile}
                className={
                  item.targetFile === "Onbekend"
                    ? "rounded-2xl border border-red-200 bg-red-50 p-4"
                    : "rounded-2xl border border-black/10 bg-black/[0.02] p-4"
                }
              >
                <div className="text-sm text-muted-foreground">
                  Doelbestand
                </div>

                <div className="mt-1 text-lg font-semibold">
                  {item.targetFile}
                </div>

                <div className="mt-2 text-sm text-muted-foreground">
                  {item.rowCount} regel(s)
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Sheets in dit importconcept</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Per sheet zie je hoeveel regels worden meegenomen en naar welk
          doelbestand ze gaan.
        </p>

        {sheets.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-black/10 bg-white p-5 text-sm text-muted-foreground">
            Er zijn geen sheets gevonden in dit importconcept.
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {sheets.map((sheet, index) => (
              <SheetReviewCard
                key={`${sheet.sheetName || "sheet"}-${index}`}
                sheet={sheet}
              />
            ))}
          </div>
        )}
      </section>

      <details className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <summary className="cursor-pointer text-sm font-medium text-gray-900">
          Technische controle: importconcept-data tonen
        </summary>

        <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-white p-4 text-xs text-gray-800">
          {JSON.stringify(concept, null, 2)}
        </pre>
      </details>
    </main>
  );
}