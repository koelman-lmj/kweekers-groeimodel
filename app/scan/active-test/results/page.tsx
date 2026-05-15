"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ActiveDefinition = {
  status: "active";
  publishedAt: string;
  source: "localStorage-import-concept";
  fileName?: string;
  importSummary?: Record<string, number>;
  data: {
    categories?: Record<string, string>[];
    dimensions?: Record<string, string>[];
    questions?: Record<string, string>[];
    optionSets?: Record<string, string>[];
    options?: Record<string, string>[];
  };
};

type AnswerValue = string | string[];

type AnswerRow = {
  key: string;
  label: string;
  sectionCode: string;
  dimensionCode: string;
  category: string;
  inputType: string;
  answer: AnswerValue;
};

const ANSWERS_STORAGE_KEY = "kweekers-active-test-answers";

function formatAnswer(answer: AnswerValue) {
  if (Array.isArray(answer)) {
    return answer.length > 0 ? answer.join(", ") : "-";
  }

  return answer || "-";
}

function downloadJson(fileName: string, data: unknown) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

export default function ActiveTestResultsPage() {
  const [activeDefinition, setActiveDefinition] =
    useState<ActiveDefinition | null>(null);

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [downloadStatus, setDownloadStatus] = useState("");

  useEffect(() => {
    const rawDefinition = localStorage.getItem("kweekers-active-definition");

    if (rawDefinition) {
      try {
        const parsed = JSON.parse(rawDefinition) as ActiveDefinition;
        setActiveDefinition(parsed);
      } catch {
        setActiveDefinition(null);
      }
    }

    const rawAnswers = localStorage.getItem(ANSWERS_STORAGE_KEY);

    if (rawAnswers) {
      try {
        const parsedAnswers = JSON.parse(rawAnswers) as Record<
          string,
          AnswerValue
        >;
        setAnswers(parsedAnswers);
      } catch {
        setAnswers({});
      }
    }
  }, []);

  const questions = useMemo(() => {
    const rawQuestions = activeDefinition?.data?.questions ?? [];

    return [...rawQuestions].sort((a, b) => {
      const sectionCompare = (a.sectionCode ?? "").localeCompare(
        b.sectionCode ?? ""
      );

      if (sectionCompare !== 0) {
        return sectionCompare;
      }

      return Number(a.order || 0) - Number(b.order || 0);
    });
  }, [activeDefinition]);

  const answeredRows: AnswerRow[] = questions
    .filter((question) => {
      const answer = answers[question.key];

      if (Array.isArray(answer)) {
        return answer.length > 0;
      }

      return Boolean(answer);
    })
    .map((question) => ({
      key: question.key,
      label: question.label,
      sectionCode: question.sectionCode,
      dimensionCode: question.dimensionCode,
      category: question.category,
      inputType: question.inputType,
      answer: answers[question.key],
    }));

  const unansweredRows = questions.filter((question) => {
    const answer = answers[question.key];

    if (Array.isArray(answer)) {
      return answer.length === 0;
    }

    return !answer;
  });

  const answeredCount = answeredRows.length;
  const totalCount = questions.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  function handleDownloadResults() {
    const exportPayload = {
      exportType: "kweekers-active-test-results",
      exportedAt: new Date().toISOString(),
      sourceDefinition: {
        fileName: activeDefinition?.fileName,
        publishedAt: activeDefinition?.publishedAt,
        source: activeDefinition?.source,
      },
      progress: {
        answered: answeredCount,
        unanswered: unansweredRows.length,
        totalQuestions: totalCount,
        progressPercentage,
      },
      answeredRows,
      unansweredRows,
      rawAnswers: answers,
    };

    const datePart = new Date().toISOString().slice(0, 10);
    const fileName = `kweekers-active-test-results-${datePart}.json`;

    downloadJson(fileName, exportPayload);
    setDownloadStatus(`Resultaten geëxporteerd: ${fileName}`);
  }

  if (!activeDefinition) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold">Resultaten active-test</h1>

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
              href="/definition-template/active-definition"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
            >
              Naar actieve definitie
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Resultaten active-test</h1>

            <p className="mt-3 text-gray-600">
              Deze pagina leest de actieve definitie en de ingevulde antwoorden
              uit localStorage. Er wordt nog niets berekend of gepubliceerd.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/scan/active-test"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
            >
              Terug naar scan
            </Link>

            <Link
              href="/definition-template/active-definition"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
            >
              Actieve definitie
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4">
          <h2 className="text-lg font-semibold text-green-900">
            Resultaten geladen
          </h2>

          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="font-medium">Bestand:</span>{" "}
              {activeDefinition.fileName ?? "Onbekend"}
            </div>

            <div>
              <span className="font-medium">Definitie gepubliceerd:</span>{" "}
              {activeDefinition.publishedAt}
            </div>

            <div>
              <span className="font-medium">Beantwoord:</span> {answeredCount}{" "}
              van {totalCount}
            </div>

            <div>
              <span className="font-medium">Openstaand:</span>{" "}
              {unansweredRows.length}
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-black"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="mt-2 text-sm text-green-800">
            Voortgang: {progressPercentage}%
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="text-lg font-semibold text-blue-900">
            Export resultaten
          </h2>

          <p className="mt-2 text-sm text-blue-800">
            Download de ingevulde antwoorden als JSON. Dit is handig als
            controlebestand voordat we scoring of advieslogica toevoegen.
          </p>

          <button
            type="button"
            onClick={handleDownloadResults}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Download resultaten als JSON
          </button>

          {downloadStatus && (
            <div className="mt-3 rounded-lg bg-white p-3 text-sm text-blue-900">
              {downloadStatus}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Beantwoorde vragen</h2>

          {answeredRows.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">
              Er zijn nog geen antwoorden ingevuld.
            </p>
          ) : (
            <div className="mt-4 overflow-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2">Vraag</th>
                    <th className="whitespace-nowrap px-3 py-2">Antwoord</th>
                    <th className="whitespace-nowrap px-3 py-2">Sectie</th>
                    <th className="whitespace-nowrap px-3 py-2">Dimensie</th>
                    <th className="whitespace-nowrap px-3 py-2">Categorie</th>
                    <th className="whitespace-nowrap px-3 py-2">Type</th>
                  </tr>
                </thead>

                <tbody>
                  {answeredRows.map((row) => (
                    <tr key={row.key} className="border-t">
                      <td className="max-w-lg px-3 py-2 align-top">
                        <div className="font-medium">{row.label}</div>
                        <div className="mt-1 text-gray-500">{row.key}</div>
                      </td>

                      <td className="max-w-md px-3 py-2 align-top">
                        {formatAnswer(row.answer)}
                      </td>

                      <td className="px-3 py-2 align-top">
                        {row.sectionCode}
                      </td>

                      <td className="px-3 py-2 align-top">
                        {row.dimensionCode}
                      </td>

                      <td className="px-3 py-2 align-top">{row.category}</td>

                      <td className="px-3 py-2 align-top">{row.inputType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Nog niet beantwoord</h2>

          {unansweredRows.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">
              Alle vragen zijn beantwoord.
            </p>
          ) : (
            <div className="mt-4 overflow-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2">Vraag</th>
                    <th className="whitespace-nowrap px-3 py-2">Sectie</th>
                    <th className="whitespace-nowrap px-3 py-2">Dimensie</th>
                    <th className="whitespace-nowrap px-3 py-2">Categorie</th>
                    <th className="whitespace-nowrap px-3 py-2">Type</th>
                  </tr>
                </thead>

                <tbody>
                  {unansweredRows.map((question) => (
                    <tr key={question.key} className="border-t">
                      <td className="max-w-lg px-3 py-2 align-top">
                        <div className="font-medium">{question.label}</div>
                        <div className="mt-1 text-gray-500">
                          {question.key}
                        </div>
                      </td>

                      <td className="px-3 py-2 align-top">
                        {question.sectionCode}
                      </td>

                      <td className="px-3 py-2 align-top">
                        {question.dimensionCode}
                      </td>

                      <td className="px-3 py-2 align-top">
                        {question.category}
                      </td>

                      <td className="px-3 py-2 align-top">
                        {question.inputType}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/scan/active-test"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Verder invullen
          </Link>

          <button
            type="button"
            disabled
            className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-600"
          >
            Score berekenen — volgt later
          </button>
        </div>
      </div>
    </main>
  );
}
