"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ActiveDefinition = {
  status: "active";
  publishedAt: string;
  source: "localStorage-import-concept";
  fileName?: string;
  importSummary?: Record<string, number>;
  data: Record<string, Record<string, string>[]>;
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
    return (
      <div className="rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">Geen records gevonden.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <h2 className="text-lg font-semibold">{title}</h2>

      <p className="mt-2 text-sm text-gray-600">
        {rows.length} records aanwezig. Hieronder zie je de eerste 10 records.
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
            {rows.slice(0, 10).map((row, index) => (
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

      {rows.length > 10 && (
        <p className="mt-2 text-xs text-gray-500">
          Alleen de eerste 10 records worden getoond.
        </p>
      )}
    </div>
  );
}

export default function ActiveDefinitionPage() {
  const [activeDefinition, setActiveDefinition] =
    useState<ActiveDefinition | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("kweekers-active-definition");

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as ActiveDefinition;
      setActiveDefinition(parsed);
    } catch {
      setActiveDefinition(null);
    }
  }, []);

  function handleClearActiveDefinition() {
    localStorage.removeItem("kweekers-active-definition");
    setActiveDefinition(null);
  }

  if (!activeDefinition) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold">Actieve definitie</h1>

          <p className="mt-3 text-gray-600">
            Er is nog geen actieve definitie gevonden in deze browser.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/definition-template/import-preview"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Naar import-preview
            </Link>

            <Link
              href="/definition-template/import-concept"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
            >
              Naar importconcept
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const importSummary = activeDefinition.importSummary ?? {};
  const data = activeDefinition.data ?? {};

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Actieve definitie</h1>

            <p className="mt-3 text-gray-600">
              Dit is de actieve definitie die momenteel in deze browser staat.
              De scan kan hier straks op aangesloten worden.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/definition-template/import-concept"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
            >
              Terug naar concept
            </Link>

            <Link
              href="/definition-template/import-preview"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
            >
              Import-preview
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4">
          <h2 className="text-lg font-semibold text-green-900">
            Actieve definitie aanwezig
          </h2>

          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="font-medium">Bestand:</span>{" "}
              {activeDefinition.fileName ?? "Onbekend"}
            </div>

            <div>
              <span className="font-medium">Status:</span>{" "}
              {activeDefinition.status}
            </div>

            <div>
              <span className="font-medium">Gepubliceerd:</span>{" "}
              {activeDefinition.publishedAt}
            </div>

            <div>
              <span className="font-medium">Bron:</span>{" "}
              {activeDefinition.source}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Samenvatting</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(importSummary).map(([sheetName, count]) => (
              <div key={sheetName} className="rounded-xl bg-gray-50 p-4">
                <div className="text-xs font-medium text-gray-500">
                  {sheetName}
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {count}
                </div>
                <div className="text-xs text-gray-500">records</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="text-lg font-semibold text-blue-900">
            Koppelcontrole
          </h2>

          <p className="mt-2 text-sm text-blue-800">
            Deze pagina bewijst dat de actieve definitie uit localStorage gelezen
            kan worden. De volgende stap is de scan-flow laten starten vanuit
            deze actieve definitie.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {Object.entries(previewConfig).map(([sheetName, columns]) => (
            <PreviewTable
              key={sheetName}
              title={sheetName}
              rows={data[sheetName] ?? []}
              columns={columns}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-600"
          >
            Scan starten met actieve definitie — volgt later
          </button>

          <button
            type="button"
            onClick={handleClearActiveDefinition}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
          >
            Actieve definitie verwijderen
          </button>
        </div>
      </div>
    </main>
  );
}
