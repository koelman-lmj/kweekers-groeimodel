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

const ANSWERS_STORAGE_KEY = "kweekers-active-test-answers";

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

function isAnswered(answer: AnswerValue | undefined) {
  if (Array.isArray(answer)) {
    return answer.length > 0;
  }

  return typeof answer === "string" && answer.trim().length > 0;
}

function getOptionsForQuestion(
  question: Record<string, string>,
  options: Record<string, string>[]
) {
  const optionSetKey = question.optionSetKey?.trim();

  if (!optionSetKey) {
    return [];
  }

  return options
    .filter((option) => option.optionSetKey === optionSetKey)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

function getAnswerLabel(
  question: Record<string, string>,
  answer: AnswerValue | undefined,
  options: Record<string, string>[]
) {
  if (!isAnswered(answer)) {
    return "Niet beantwoord";
  }

  const questionOptions = getOptionsForQuestion(question, options);

  if (Array.isArray(answer)) {
    const labels = answer.map((value) => {
      const option = questionOptions.find((item) => item.value === value);
      return option?.label ?? value;
    });

    return labels.join(", ");
  }

  const option = questionOptions.find((item) => item.value === answer);
  return option?.label ?? answer;
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function ActiveTestResultsPage() {
  const [activeDefinition, setActiveDefinition] =
    useState<ActiveDefinition | null>(null);

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("");

  useEffect(() => {
    const rawDefinition = localStorage.getItem("kweekers-active-definition");
    const rawAnswers = localStorage.getItem(ANSWERS_STORAGE_KEY);

    if (rawDefinition) {
      try {
        setActiveDefinition(JSON.parse(rawDefinition) as ActiveDefinition);
      } catch {
        setActiveDefinition(null);
      }
    }

    if (rawAnswers) {
      try {
        setAnswers(JSON.parse(rawAnswers) as Record<string, AnswerValue>);
      } catch {
        setAnswers({});
      }
    }

    setIsLoaded(true);
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

  const options = activeDefinition?.data?.options ?? [];

  const answeredQuestions = useMemo(() => {
    return questions.filter((question) => isAnswered(answers[question.key]));
  }, [questions, answers]);

  const unansweredQuestions = useMemo(() => {
    return questions.filter((question) => !isAnswered(answers[question.key]));
  }, [questions, answers]);

  const progressPercentage =
    questions.length > 0
      ? Math.round((answeredQuestions.length / questions.length) * 100)
      : 0;

  function handleDownloadResults() {
    const exportPayload = {
      exportType: "kweekers-active-test-readable-results",
      exportedAt: new Date().toISOString(),
      sourceDefinition: {
        fileName: activeDefinition?.fileName,
        publishedAt: activeDefinition?.publishedAt,
        source: activeDefinition?.source,
      },
      summary: {
        totalQuestions: questions.length,
        answered: answeredQuestions.length,
        unanswered: unansweredQuestions.length,
        progressPercentage,
      },
      answers: questions.map((question) => ({
        key: question.key,
        sectionCode: question.sectionCode,
        label: question.label,
        inputType: question.inputType,
        optionSetKey: question.optionSetKey,
        rawAnswer: answers[question.key] ?? null,
        answerLabel: getAnswerLabel(question, answers[question.key], options),
        answered: isAnswered(answers[question.key]),
      })),
    };

    const datePart = new Date().toISOString().slice(0, 10);
    const fileName = `kweekers-active-test-results-${datePart}.json`;

    downloadJson(fileName, exportPayload);
    setDownloadStatus(`Resultaten geëxporteerd: ${fileName}`);
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
          Resultaten laden...
        </div>
      </main>
    );
  }

  if (!activeDefinition) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold">Geen actieve definitie gevonden</h1>

          <p className="mt-3 text-gray-600">
            Er staat geen actieve definitie in deze browser. Ga terug naar de
            actieve test of publiceer eerst een definitie.
          </p>

          <div className="mt-6">
            <Link
              href="/scan/active-test"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Terug naar active-test
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Resultaten active-test</h1>

              <p className="mt-3 max-w-3xl text-gray-600">
                Leesbare samenvatting van de ingevulde antwoorden. Deze pagina
                gebruikt dezelfde localStorage-data als de active-test.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/scan/active-test"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
              >
                Terug naar active-test
              </Link>

              <button
                type="button"
                onClick={handleDownloadResults}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
              >
                Download resultaten als JSON
              </button>
            </div>
          </div>

          {downloadStatus && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              {downloadStatus}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <h2 className="text-lg font-semibold text-green-900">
            Actieve definitie
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
        </section>

        <section>
          <h2 className="text-xl font-semibold">Samenvatting</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <SummaryCard label="Totaal vragen" value={questions.length} />
            <SummaryCard label="Beantwoord" value={answeredQuestions.length} />
            <SummaryCard
              label="Onbeantwoord"
              value={unansweredQuestions.length}
            />
            <SummaryCard label="Voortgang" value={`${progressPercentage}%`} />
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-black"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Beantwoorde vragen</h2>
              <p className="mt-2 text-sm text-gray-600">
                Per vraag zie je het gekozen antwoord in leesbare vorm.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {answeredQuestions.length} van {questions.length}
            </div>
          </div>

          {answeredQuestions.length === 0 ? (
            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Er zijn nog geen vragen beantwoord.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {answeredQuestions.map((question, index) => (
                <div
                  key={question.key}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="text-xs text-gray-500">
                    {question.sectionCode} · vraag {index + 1}
                  </div>

                  <div className="mt-1 font-semibold">{question.label}</div>

                  <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm">
                    {getAnswerLabel(question, answers[question.key], options)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Onbeantwoorde vragen</h2>
              <p className="mt-2 text-sm text-gray-600">
                Deze vragen hebben nog geen antwoord.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {unansweredQuestions.length} open
            </div>
          </div>

          {unansweredQuestions.length === 0 ? (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
              Alle vragen zijn beantwoord.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {unansweredQuestions.map((question) => (
                <div
                  key={question.key}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="text-xs text-gray-500">
                    {question.sectionCode}
                  </div>

                  <div className="mt-1 font-semibold">{question.label}</div>

                  <div className="mt-2 text-sm text-gray-500">
                    key: {question.key}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}