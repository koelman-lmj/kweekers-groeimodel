"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SheetCheck = {
  sheetName: string;
  exists: boolean;
  ok: boolean;
  rowCount: number;
  columnCount: number;
  headers: string[];
  missingColumns: string[];
};

type Issue = {
  message: string;
};

type ImportConcept = {
  ok: boolean;
  fileName?: string;
  message?: string;
  error?: string;
  checks?: SheetCheck[];
  duplicateIssues?: Issue[];
  requiredFieldIssues?: Issue[];
  relationIssues?: Issue[];
  importSummary?: Record<string, number>;
  preview?: Record<string, Record<string, string>[]>;
  createdAt?: string;
};

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={
        ok
          ? "rounded-full border border-black/10 bg-black px-2.5 py-1 text-xs font-medium text-white"
          : "rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-black"
      }
    >
      {ok ? "OK" : "Aandacht"}
    </span>
  );
}

function IssueBlock({
  title,
  items,
}: {
  title: string;
  items: Issue[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-5">
      <h2 className="text-lg font-semibold">{title}</h2>

      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item.message}-${index}`}
            className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-muted-foreground"
          >
            {item.message}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DefinitionImportConceptPage() {
  const [concept, setConcept] = useState<ImportConcept | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("definitionImportConcept");

    if (!raw) {
      setConcept(null);
      return;
    }

    try {
      setConcept(JSON.parse(raw) as ImportConcept);
    } catch {
      setConcept(null);
    }
  }, []);

  const clearConcept = () => {
    window.localStorage.removeItem("definitionImportConcept");
    setConcept(null);
  };

  const checks = concept?.checks ?? [];
  const duplicateIssues = concept?.duplicateIssues ?? [];
  const requiredFieldIssues = concept?.requiredFieldIssues ?? [];
  const relationIssues = concept?.relationIssues ?? [];
  const importSummary = concept?.importSummary ?? {};
  const preview = concept?.preview ?? {};

  const hasIssues =
    duplicateIssues.length > 0 ||
    requiredFieldIssues.length > 0 ||
    relationIssues.length > 0 ||
    checks.some((check) => !check.ok);

  if (!concept) {
    return (
      <main className="mx-auto max-w-5xl space-y-8 p-8">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            KWEEKERS Groeimodel
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Importconcept
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground">
            Er is nog geen importconcept opgeslagen. Voer eerst een
            import-preview uit.
          </p>
        </div>

        <Link
          href="/definition-import"
          className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
        >
          Naar import-preview
        </Link>
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
          Importconcept
        </h1>

        <p className="max-w-3xl text-sm text-muted-foreground">
          Dit is het opgeslagen resultaat van de import-preview. Deze pagina
          past nog niets definitief toe.
        </p>
      </div>

      <section className="rounded-3xl border border-black/10 bg-black/[0.02] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Conceptstatus</h2>

            <p className="text-sm text-muted-foreground">
              {concept.error ??
                concept.message ??
                "Importconcept is geladen."}
            </p>

            {concept.fileName && (
              <p className="text-sm text-muted-foreground">
                Bestand: <span className="font-medium">{concept.fileName}</span>
              </p>
            )}

            {concept.createdAt && (
              <p className="text-sm text-muted-foreground">
                Aangemaakt op:{" "}
                <span className="font-medium">
                  {new Date(concept.createdAt).toLocaleString("nl-NL")}
                </span>
              </p>
            )}
          </div>

          <StatusBadge ok={Boolean(concept.ok)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/definition-import"
            className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Nieuwe preview uitvoeren
          </Link>

          <button
            type="button"
            onClick={clearConcept}
            className="inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
          >
            Concept verwijderen
          </button>
        </div>
      </section>

      {Object.keys(importSummary).length > 0 && (
        <section className="grid gap-4 md:grid-cols-5">
          {Object.entries(importSummary).map(([key, count]) => (
            <div
              key={key}
              className="rounded-2xl border border-black/10 bg-white p-5"
            >
              <div className="text-sm text-muted-foreground">{key}</div>
              <div className="mt-2 text-2xl font-semibold">{count}</div>
              <div className="mt-1 text-sm text-muted-foreground">records</div>
            </div>
          ))}
        </section>
      )}

      {checks.length > 0 && (
        <section className="rounded-3xl border border-black/10 bg-white p-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Sheetcontrole</h2>
            <p className="text-sm text-muted-foreground">
              Controle of de verplichte tabs en kolommen aanwezig zijn.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {checks.map((check) => (
              <div
                key={check.sheetName}
                className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">
                      {check.sheetName}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {check.exists
                        ? `${check.rowCount} rijen, ${check.columnCount} kolommen`
                        : "Sheet ontbreekt"}
                    </div>
                  </div>

                  <StatusBadge ok={check.ok} />
                </div>

                {check.missingColumns.length > 0 && (
                  <div className="mt-3 rounded-xl border border-black/10 bg-white p-3">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Ontbrekende kolommen
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {check.missingColumns.join(", ")}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {hasIssues && (
        <>
          <IssueBlock title="Dubbele waardes" items={duplicateIssues} />
          <IssueBlock
            title="Ontbrekende verplichte velden"
            items={requiredFieldIssues}
          />
          <IssueBlock title="Verwijzingsfouten" items={relationIssues} />
        </>
      )}

      {!hasIssues && concept.ok && (
        <section className="rounded-3xl border border-black/10 bg-white p-5">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              Concept is importgeschikt
            </h2>
            <p className="text-sm text-muted-foreground">
              Het concept bevat geen blokkerende fouten. Er wordt nog niets
              definitief toegepast.
            </p>
          </div>
        </section>
      )}

      {Object.keys(preview).length > 0 && (
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Preview</h2>
            <p className="text-sm text-muted-foreground">
              Eerste regels per sheet. Dit is bedoeld als snelle controle.
            </p>
          </div>

          {Object.entries(preview).map(([sheetName, rows]) => (
            <div
              key={sheetName}
              className="rounded-3xl border border-black/10 bg-white p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold">{sheetName}</h3>
                <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs">
                  {rows.length} previewregels
                </span>
              </div>

              {rows.length === 0 ? (
                <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-muted-foreground">
                  Geen previewregels beschikbaar.
                </div>
              ) : (
                <div className="overflow-auto rounded-2xl border border-black/10">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-black/[0.03]">
                      <tr>
                        {Object.keys(rows[0]).map((column) => (
                          <th
                            key={column}
                            className="border-b border-black/10 px-4 py-3 font-semibold"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-black/5">
                          {Object.keys(rows[0]).map((column) => (
                            <td
                              key={column}
                              className="max-w-[280px] truncate px-4 py-3 align-top text-muted-foreground"
                              title={row[column]}
                            >
                              {row[column]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}