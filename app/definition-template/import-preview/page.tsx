"use client";

import { useState } from "react";

type CheckResult = {
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

type PreviewData = Record<string, Record<string, string>[]>;

type ImportPreviewResult = {
  ok: boolean;
  fileName?: string;
  message?: string;
  checks?: CheckResult[];
  duplicateIssues?: DuplicateIssue[];
  preview?: PreviewData;
};

const previewConfig: Record<string, string[]> = {
  categories: ["code", "title", "description", "order"],
  dimensions: ["code", "title", "category", "order", "isActive"],
  questions: ["key", "label", "inputType", "category", "dimensionCode"],
  optionSets: ["key", "description"],
  options: ["optionSetKey", "value", "label", "order", "score"],
};

function PreviewTable({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: Record<string, string>[];
  columns: string[];
}) {
  if (!rows || rows.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <h2 className="text-lg font-semibold">Preview {title}</h2>

      <p className="mt-2 text-sm text-gray-600">
        Dit zijn de eerste 5 regels uit het tabblad <strong>{title}</strong>.
      </p>

      <div className="mt-4 overflow-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-3 py-2">
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="border-t">
                {columns.map((column) => (
                  <td
                    key={`${title}-${index}-${column}`}
                    className="max-w-md px-3 py-2 align-top"
                  >
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ImportPreviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("Nog geen bestand gekozen.");
  const [result, setResult] = useState<ImportPreviewResult | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setResult(null);

    if (!selectedFile) {
      setStatus("Nog geen bestand gekozen.");
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".xlsx")) {
      setStatus("Fout: kies een Excel-bestand met .xlsx");
      return;
    }

    setStatus("Bestand gekozen. Preview-controle kan worden gestart.");
  }

  async function handleCheckFile() {
    if (!file) {
      setResult({
        ok: false,
        message: "Kies eerst een bestand.",
        checks: [],
        duplicateIssues: [],
        preview: {},
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setStatus("Bestand wordt gecontroleerd...");
    setResult(null);

    const response = await fetch("/api/definition-import-preview", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as ImportPreviewResult;

    setStatus("Controle afgerond.");
    setResult(data);
  }

  const duplicateIssues = result?.duplicateIssues ?? [];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Import-preview definitie</h1>

        <p className="mt-3 text-gray-600">
          Upload hier een Excel-template. In deze stap controleren we het
          bestand en tonen we een eerste preview van de inhoud.
        </p>

        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-6">
          <input type="file" accept=".xlsx" onChange={handleFileChange} />

          {file && (
            <p className="mt-4 text-sm">
              Bestand: <strong>{file.name}</strong>
            </p>
          )}

          <div className="mt-4 rounded-lg bg-gray-100 p-4 text-sm">
            {status}
          </div>

          <button
            onClick={handleCheckFile}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Controleer bestand
          </button>

          {result && (
            <div className="mt-6 space-y-6">
              <div
                className={`rounded-xl p-4 text-sm font-medium ${
                  result.ok
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {result.message}
              </div>

              <div className="space-y-4">
                {result.checks?.map((check) => (
                  <div
                    key={check.sheetName}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">
                        {check.sheetName}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          check.ok
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {check.ok ? "OK" : "Fouten"}
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      Rijen: {check.rowCount} | Kolommen: {check.columnCount}
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium">Headers:</div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {check.headers?.map((header) => (
                          <span
                            key={header}
                            className="rounded-lg bg-gray-100 px-2 py-1 text-xs"
                          >
                            {header}
                          </span>
                        ))}
                      </div>
                    </div>

                    {check.missingColumns?.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium text-red-700">
                          Ontbrekende kolommen
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {check.missingColumns.map((column) => (
                            <span
                              key={column}
                              className="rounded-lg bg-red-100 px-2 py-1 text-xs text-red-700"
                            >
                              {column}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Duplicate-controle</h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      duplicateIssues.length === 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {duplicateIssues.length === 0 ? "OK" : "Fouten"}
                  </span>
                </div>

                {duplicateIssues.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-600">
                    Geen dubbele codes, keys of optiecombinaties gevonden.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {duplicateIssues.map((issue, index) => (
                      <div
                        key={`${issue.sheetName}-${issue.field}-${issue.value}-${index}`}
                        className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
                      >
                        <div className="font-medium">{issue.message}</div>

                        <div className="mt-1 text-xs">
                          Sheet: <strong>{issue.sheetName}</strong> | Veld:{" "}
                          <strong>{issue.field}</strong> | Waarde:{" "}
                          <strong>{issue.value}</strong> | Rijen:{" "}
                          <strong>{issue.rows.join(", ")}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {result.ok && result.preview && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-gray-100 p-4">
                    <h2 className="text-lg font-semibold">
                      Inhoudelijke preview
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Hieronder zie je per tabblad de eerste 5 regels die straks
                      geïmporteerd kunnen worden.
                    </p>
                  </div>

                  {Object.entries(previewConfig).map(([sheetName, columns]) => (
                    <PreviewTable
                      key={sheetName}
                      title={sheetName}
                      rows={result.preview?.[sheetName] ?? []}
                      columns={columns}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
