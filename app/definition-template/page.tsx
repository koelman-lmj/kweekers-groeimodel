"use client";

import { useState } from "react";

export default function ImportPreviewPage() {
  const [fileName, setFileName] = useState<string>("");
  const [status, setStatus] = useState<string>("Nog geen bestand gekozen.");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setFileName("");
      setStatus("Nog geen bestand gekozen.");
      return;
    }

    setFileName(file.name);

    if (!file.name.endsWith(".xlsx")) {
      setStatus("Fout: kies een Excel-bestand met .xlsx.");
      return;
    }

    setStatus("Bestand gekozen. Preview-controle kan worden gestart.");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Import-preview definitie
        </h1>

        <p className="mt-3 text-gray-600">
          Upload hier een Excel-template. In deze stap controleren we het bestand
          alleen. Er wordt nog niets opgeslagen.
        </p>

        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-6">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700"
          />

          {fileName && (
            <p className="mt-4 text-sm text-gray-700">
              Gekozen bestand: <strong>{fileName}</strong>
            </p>
          )}

          <p className="mt-4 rounded-lg bg-gray-100 p-4 text-sm text-gray-800">
            {status}
          </p>
        </div>

        <div className="mt-8">
          <a
            href="/definition-template"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Terug naar definitie-template
          </a>
        </div>
      </div>
    </main>
  );
}
