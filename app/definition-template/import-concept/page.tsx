"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StoredConcept = {
  fileName?: string;
  message?: string;
  importSummary?: Record<string, number>;
  savedAt?: string;
  concept?: {
    status: string;
    createdAt: string;
    data: Record<string, Record<string, string>[]>;
  };
};

type ActiveDefinition = {
  status: "active";
  publishedAt: string;
  source: "localStorage-import-concept";
  fileName?: string;
  importSummary?: Record<string, number>;
  data: Record<string, Record<string, string>[]>;
};

export default function ImportConceptPage() {
  const [storedConcept, setStoredConcept] = useState<StoredConcept | null>(null);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [publishStatus, setPublishStatus] = useState("");
  const [activeDefinition, setActiveDefinition] =
    useState<ActiveDefinition | null>(null);

  useEffect(() => {
    const rawConcept = localStorage.getItem("kweekers-definition-import-concept");

    if (rawConcept) {
      try {
        const parsed = JSON.parse(rawConcept) as StoredConcept;
        setStoredConcept(parsed);
      } catch {
        setStoredConcept(null);
      }
    }

    const rawActive = localStorage.getItem("kweekers-active-definition");

    if (rawActive) {
      try {
        const parsedActive = JSON.parse(rawActive) as ActiveDefinition;
        setActiveDefinition(parsedActive);
      } catch {
        setActiveDefinition(null);
      }
    }
  }, []);

  function handleClearConcept() {
    localStorage.removeItem("kweekers-definition-import-concept");
    setStoredConcept(null);
    setDownloadStatus("");
    setPublishStatus("");
  }

  function handleDownloadJson() {
    if (!storedConcept) {
      setDownloadStatus("Geen concept beschikbaar om te downloaden.");
      return;
    }

    const exportPayload = {
      exportType: "kweekers-definition-import-concept",
      exportedAt: new Date().toISOString(),
      fileName: storedConcept.fileName,
      importSummary: storedConcept.importSummary,
      concept: storedConcept.concept,
    };

    const json = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const datePart = new Date().toISOString().slice(0, 10);
    const fileName = `kweekers-definition-import-concept-${datePart}.json`;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);

    setDownloadStatus(`JSON-export aangemaakt: ${fileName}`);
  }

  function handlePublishConcept() {
    if (!storedConcept?.concept?.data) {
      setPublishStatus("Geen geldig concept beschikbaar om te publiceren.");
      return;
    }

    const definitionToPublish: ActiveDefinition = {
      status: "active",
      publishedAt: new Date().toISOString(),
      source: "localStorage-import-concept",
      fileName: storedConcept.fileName,
      importSummary: storedConcept.importSummary,
      data: storedConcept.concept.data,
    };

    localStorage.setItem(
      "kweekers-active-definition",
      JSON.stringify(definitionToPublish)
    );

    setActiveDefinition(definitionToPublish);
    setPublishStatus(
      "Concept is gepubliceerd als actieve definitie in deze browser."
    );
  }

  if (!storedConcept) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold">Importconcept</h1>

          <p className="mt-3 text-gray-600">
            Er is nog geen importconcept opgeslagen in deze browser.
          </p>

          {activeDefinition && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
              <h2 className="text-lg font-semibold text-green-900">
                Actieve definitie aanwezig
              </h2>

              <p className="mt-2 text-sm text-green-800">
                Er staat al een actieve definitie in deze browser.
              </p>

              <div className="mt-3 text-sm">
                <span className="font-medium">Gepubliceerd:</span>{" "}
                {activeDefinition.publishedAt}
              </div>
            </div>
          )}

          <Link
            href="/definition-template/import-preview"
            className="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Terug naar import-preview
          </Link>
        </div>
      </main>
    );
  }

  const importSummary = storedConcept.importSummary ?? {};
  const conceptData = storedConcept.concept?.data ?? {};

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Importconcept</h1>

            <p className="mt-3 text-gray-600">
              Dit concept staat tijdelijk opgeslagen in je browser. Er is nog
              niets definitief gepubliceerd totdat je op publiceren klikt.
            </p>
          </div>

          <Link
            href="/definition-template/import-preview"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
          >
            Terug
          </Link>
        </div>

        {activeDefinition && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <h2 className="text-lg font-semibold text-green-900">
              Huidige actieve definitie
            </h2>

            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="font-medium">Bestand:</span>{" "}
                {activeDefinition.fileName ?? "Onbekend"}
              </div>

              <div>
                <span className="font-medium">Gepubliceerd:</span>{" "}
                {activeDefinition.publishedAt}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4">
          <h2 className="text-lg font-semibold text-green-900">
            Concept opgeslagen
          </h2>

          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="font-medium">Bestand:</span>{" "}
              {storedConcept.fileName ?? "Onbekend"}
            </div>

            <div>
              <span className="font-medium">Status:</span>{" "}
              {storedConcept.concept?.status ?? "concept"}
            </div>

            <div>
              <span className="font-medium">Aangemaakt:</span>{" "}
              {storedConcept.concept?.createdAt ?? "-"}
            </div>

            <div>
              <span className="font-medium">Opgeslagen in browser:</span>{" "}
              {storedConcept.savedAt ?? "-"}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="text-lg font-semibold text-blue-900">JSON-export</h2>

          <p className="mt-2 text-sm text-blue-800">
            Download het concept als JSON-bestand. Dit publiceert nog niets, maar
            geeft je wel een controleerbare technische export van de conceptdata.
          </p>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Download concept als JSON
          </button>

          {downloadStatus && (
            <div className="mt-3 rounded-lg bg-white p-3 text-sm text-blue-900">
              {downloadStatus}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-lg font-semibold text-amber-900">
            Concept publiceren
          </h2>

          <p className="mt-2 text-sm text-amber-800">
            Hiermee maak je dit concept de actieve definitie in deze browser.
            Dit overschrijft geen database en wijzigt niets in GitHub. Het wordt
            opgeslagen onder <strong>kweekers-active-definition</strong> in
            localStorage.
          </p>

          <button
            type="button"
            onClick={handlePublishConcept}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Concept publiceren als actieve definitie
          </button>

          {publishStatus && (
            <div className="mt-3 rounded-lg bg-white p-3 text-sm text-amber-900">
              {publishStatus}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Concept-samenvatting</h2>

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

        <div className="mt-6 space-y-4">
          {Object.entries(conceptData).map(([sheetName, rows]) => (
            <div key={sheetName} className="rounded-xl border border-gray-200 p-4">
              <h2 className="text-lg font-semibold">{sheetName}</h2>

              <p className="mt-2 text-sm text-gray-600">
                {rows.length} records in concept.
              </p>

              <div className="mt-4 overflow-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      {Object.keys(rows[0] ?? {}).map((column) => (
                        <th key={column} className="whitespace-nowrap px-3 py-2">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.slice(0, 10).map((row, index) => (
                      <tr key={`${sheetName}-${index}`} className="border-t">
                        {Object.keys(rows[0] ?? {}).map((column) => (
                          <td
                            key={`${sheetName}-${index}-${column}`}
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
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePublishConcept}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Concept publiceren
          </button>

          <button
            type="button"
            onClick={handleClearConcept}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
          >
            Concept verwijderen
          </button>
        </div>
      </div>
    </main>
  );
}
