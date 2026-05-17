"use client";

import Link from "next/link";
import { useState } from "react";

type SheetCheck = {
  sheetName: string;
  exists: boolean;
  ok: boolean;
  rowCount: number;
  columnCount: number;
  headers: string[];
  missingColumns: string[];
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

type ImportPreviewResponse = {
  ok: boolean;
  fileName?: string;
  message?: string;
  error?: string;
  checks?: SheetCheck[];
  duplicateIssues?: DuplicateIssue[];
  requiredFieldIssues?: RequiredFieldIssue[];
  relationIssues?: RelationIssue[];
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

function IssueList({
  title,
  items,
}: {
  title: string;
  items: { message: string }[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          Deze punten moeten worden gecontroleerd voordat import veilig is.
        </p>
      </div>

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

export default function DefinitionImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportPreviewResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [conceptSaved, setConceptSaved] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setResult({
        ok: false,
        error: "Kies eerst een Excel-bestand.",
      });
      setConceptSaved(false);
      return;
    }

    setIsUploading(true);
    setResult(null);
    setConceptSaved(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/definition-import-preview", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as ImportPreviewResponse;

      const concept: ImportPreviewResponse = {
        ...data,
        createdAt: new Date().toISOString(),
      };

      setResult(concept);

      window.localStorage.setItem(
        "definitionImportConcept",
        JSON.stringify(concept)
      );

      setConceptSaved(true);
    } catch (error) {
      const failedResult: ImportPreviewResponse = {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Onbekende fout bij uploaden.",
        createdAt: new Date().toISOString(),
      };

      setResult(failedResult);

      window.localStorage.setItem(
        "definitionImportConcept",
        JSON.stringify(failedResult)
      );

      setConceptSaved(true);
    } finally {
      setIsUploading(false);
    }
  };

  const clearConcept = () => {
    window.localStorage.removeItem("definitionImportConcept");
    setConceptSaved(false);
  };

  const checks = result?.checks ?? [];
  const duplicateIssues = result?.duplicateIssues ?? [];
  const requiredFieldIssues = result?.requiredFieldIssues ?? [];
  const relationIssues = result?.relationIssues ?? [];
  const importSummary = result?.importSummary ?? {};
  const preview = result?.preview ?? {};

  const hasIssues =
    duplicateIssues.length > 0 ||
    requiredFieldIssues.length > 0 ||
    relationIssues.length > 0 ||
    checks.some((check) => !check.ok);

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          KWEEKERS Groeimodel
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Import-preview
        </h1>

        <p className="max-w-3xl text-sm text-muted-foreground">
          Upload een Excel-bestand om de structuur te controleren. Deze stap
          leest het bestand alleen uit en slaat nog niets definitief op.
        </p>
      </div>

      <section className="rounded-3xl border border-black/10 bg-white p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Excel-bestand controleren</h2>
          <p className="text-sm text-muted-foreground">
            Gebruik bij voorkeur de download “Huidige definitie” of de
            Excel-template vanaf de definitiebeheerpagina.
          </p>
<div className="mt-5 flex flex-wrap gap-3">
  <a
    href="/api/definition-template"
    className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
  >
    Excel-template downloaden
  </a>
        </div>
</div>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="file"
            accept=".xlsx"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setResult(null);
              setConceptSaved(false);
            }}
            className="block w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
          />

          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Controleren..." : "Controleer bestand"}
          </button>
        </div>

        {file && (
          <div className="mt-4 text-sm text-muted-foreground">
            Gekozen bestand: <span className="font-medium">{file.name}</span>
          </div>
        )}
      </section>

      {result && (
        <section className="rounded-3xl border border-black/10 bg-black/[0.02] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Resultaat</h2>
              <p className="text-sm text-muted-foreground">
                {result.error ??
                  result.message ??
                  "Controle van het bestand is uitgevoerd."}
              </p>

              {result.fileName && (
                <p className="text-sm text-muted-foreground">
                  Bestand: <span className="font-medium">{result.fileName}</span>
                </p>
              )}

              {conceptSaved && (
                <p className="text-sm text-muted-foreground">
                  Het resultaat is opgeslagen als importconcept.
                </p>
              )}
            </div>

            <StatusBadge ok={Boolean(result.ok)} />
          </div>

          {conceptSaved && (
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/definition-import-concept"
                className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
              >
                Bekijk importconcept
              </Link>

              <button
                type="button"
                onClick={clearConcept}
                className="inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
              >
                Concept verwijderen
              </button>
            </div>
          )}
        </section>
      )}

      {result && Object.keys(importSummary).length > 0 && (
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

      {result && hasIssues && (
        <>
          <IssueList title="Dubbele waardes" items={duplicateIssues} />
          <IssueList
            title="Ontbrekende verplichte velden"
            items={requiredFieldIssues}
          />
          <IssueList title="Verwijzingsfouten" items={relationIssues} />
        </>
      )}

      {result && !hasIssues && result.ok && (
        <section className="rounded-3xl border border-black/10 bg-white p-5">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Bestand is importgeschikt</h2>
            <p className="text-sm text-muted-foreground">
              De preview bevat geen blokkerende fouten. Deze pagina slaat nog
              niets definitief op; dit is alleen een veilige controle.
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