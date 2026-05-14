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

type ImportPreviewResult = {
  ok: boolean;
  fileName?: string;
  message?: string;
  checks?: CheckResult[];
  preview?: {
    questions?: Record<string, string>[];
  };
};

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

  const questionPreview = result?.preview?.questions ?? [];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Import-preview definitie</h1>

        <p className="mt-3 text-gray-600">
          Upload hier een Excel-template. In deze stap controleren we het bestand
          alleen.
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

              {questionPreview.length > 0 && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold">
                    Preview eerste vragen
                  </h2>

                  <p className="mt-2 text-sm text-gray-600">
                    Dit zijn de eerste 5 regels uit het tabblad{" "}
                    <strong>questions</strong>.
                  </p>

                  <div className="mt-4 overflow-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="whitespace-nowrap px-3 py-2">
                            key
                          </th>
                          <th className="whitespace-nowrap px-3 py-2">
                            label
                          </th>
                          <th className="whitespace-nowrap px-3 py-2">
                            inputType
                          </th>
                          <th className="whitespace-nowrap px-3 py-2">
                            category
                          </th>
                          <th className="whitespace-nowrap px-3 py-2">
                            dimensionCode
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {questionPreview.map((question, index) => (
                          <tr key={`${question.key}-${index}`} className="border-t">
                            <td className="max-w-xs px-3 py-2 align-top">
                              {question.key}
                            </td>
                            <td className="max-w-md px-3 py-2 align-top">
                              {question.label}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {question.inputType}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {question.category}
                            </td>
                            <td className="px-3 py-2 align-top">
                              {question.dimensionCode}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
