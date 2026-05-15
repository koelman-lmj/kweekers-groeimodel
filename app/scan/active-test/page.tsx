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

function getBooleanLabel(value?: string) {
  if (!value) {
    return "Nee";
  }

  const normalized = value.toLowerCase();

  if (normalized === "true" || normalized === "1" || normalized === "ja") {
    return "Ja";
  }

  return "Nee";
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

export default function ActiveTestScanPage() {
  const [activeDefinition, setActiveDefinition] =
    useState<ActiveDefinition | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

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
  const currentQuestion = questions[currentIndex];

  const currentAnswer = currentQuestion
    ? answers[currentQuestion.key] ?? ""
    : "";

  const questionOptions = currentQuestion
    ? getOptionsForQuestion(currentQuestion, options)
    : [];

  function handleSingleAnswer(value: string) {
    if (!currentQuestion?.key) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.key]: value,
    }));
  }

  function handleMultiAnswer(value: string) {
    if (!currentQuestion?.key) {
      return;
    }

    const existing = Array.isArray(currentAnswer) ? currentAnswer : [];

    const nextValue = existing.includes(value)
      ? existing.filter((item) => item !== value)
      : [...existing, value];

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.key]: nextValue,
    }));
  }

  function goToPrevious() {
    setCurrentIndex((previous) => Math.max(previous - 1, 0));
  }

  function goToNext() {
    setCurrentIndex((previous) =>
      Math.min(previous + 1, Math.max(questions.length - 1, 0))
    );
  }

  if (!activeDefinition) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold">Scan active-test</h1>

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

  if (!currentQuestion) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold">Scan active-test</h1>

          <p className="mt-3 text-gray-600">
            De actieve definitie bevat geen vragen.
          </p>

          <Link
            href="/definition-template/active-definition"
            className="mt-6 inline-block rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
          >
            Terug naar actieve definitie
          </Link>
        </div>
      </main>
    );
  }

  const inputType = currentQuestion.inputType ?? "text";
  const progressPercentage = Math.round(
    ((currentIndex + 1) / questions.length) * 100
  );

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Scan active-test</h1>

            <p className="mt-3 text-gray-600">
              Deze testflow leest vragen uit de actieve definitie in
              localStorage. De bestaande scanflow blijft ongemoeid.
            </p>
          </div>

          <Link
            href="/definition-template/active-definition"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
          >
            Actieve definitie
          </Link>
        </div>

        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4">
          <h2 className="text-lg font-semibold text-green-900">
            Actieve definitie geladen
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

            <div>
              <span className="font-medium">Aantal vragen:</span>{" "}
              {questions.length}
            </div>

            <div>
              <span className="font-medium">Huidige vraag:</span>{" "}
              {currentIndex + 1} van {questions.length}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-4">
          <div className="mb-4 h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-black"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="text-sm text-gray-500">
            {currentQuestion.sectionCode} · vraag {currentIndex + 1} van{" "}
            {questions.length}
          </div>

          <h2 className="mt-3 text-2xl font-bold">{currentQuestion.label}</h2>

          {currentQuestion.helpText && (
            <p className="mt-3 text-gray-600">{currentQuestion.helpText}</p>
          )}

          <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">key:</span> {currentQuestion.key}
            </div>
            <div>
              <span className="font-medium">inputType:</span> {inputType}
            </div>
            <div>
              <span className="font-medium">required:</span>{" "}
              {getBooleanLabel(currentQuestion.required)}
            </div>
            {currentQuestion.optionSetKey && (
              <div>
                <span className="font-medium">optionSetKey:</span>{" "}
                {currentQuestion.optionSetKey}
              </div>
            )}
          </div>

          <div className="mt-6">
            {inputType === "text" && (
              <input
                type="text"
                value={typeof currentAnswer === "string" ? currentAnswer : ""}
                onChange={(event) => handleSingleAnswer(event.target.value)}
                placeholder={currentQuestion.placeholder || "Vul je antwoord in"}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
              />
            )}

            {inputType === "number" && (
              <input
                type="number"
                value={typeof currentAnswer === "string" ? currentAnswer : ""}
                onChange={(event) => handleSingleAnswer(event.target.value)}
                placeholder={currentQuestion.placeholder || "Vul een getal in"}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
              />
            )}

            {inputType === "single_select" && (
              <div className="space-y-3">
                {questionOptions.map((option) => (
                  <label
                    key={`${option.optionSetKey}-${option.value}`}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name={currentQuestion.key}
                      value={option.value}
                      checked={currentAnswer === option.value}
                      onChange={() => handleSingleAnswer(option.value)}
                      className="mt-1"
                    />

                    <div>
                      <div className="font-medium">{option.label}</div>

                      {option.description && (
                        <div className="mt-1 text-sm text-gray-600">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {inputType === "multi_select" && (
              <div className="space-y-3">
                {questionOptions.map((option) => {
                  const selectedValues = Array.isArray(currentAnswer)
                    ? currentAnswer
                    : [];

                  return (
                    <label
                      key={`${option.optionSetKey}-${option.value}`}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={selectedValues.includes(option.value)}
                        onChange={() => handleMultiAnswer(option.value)}
                        className="mt-1"
                      />

                      <div>
                        <div className="font-medium">{option.label}</div>

                        {option.description && (
                          <div className="mt-1 text-sm text-gray-600">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {!["text", "number", "single_select", "multi_select"].includes(
              inputType
            ) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Inputtype <strong>{inputType}</strong> wordt nog niet apart
                ondersteund. Tijdelijk tekstveld gebruikt.

                <input
                  type="text"
                  value={typeof currentAnswer === "string" ? currentAnswer : ""}
                  onChange={(event) => handleSingleAnswer(event.target.value)}
                  placeholder={currentQuestion.placeholder || "Vul je antwoord in"}
                  className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
                />
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
            >
              Vorige
            </button>

            <div className="text-sm text-gray-500">
              Beantwoord: {Object.keys(answers).length} van {questions.length}
            </div>

            <button
              type="button"
              onClick={goToNext}
              disabled={currentIndex === questions.length - 1}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300 disabled:text-gray-600"
            >
              Volgende
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="text-lg font-semibold text-blue-900">
            Teststatus
          </h2>

          <p className="mt-2 text-sm text-blue-800">
            Antwoorden worden nu alleen in het geheugen van deze pagina bewaard.
            In de volgende stap slaan we antwoorden op in localStorage, zodat je
            kunt refreshen zonder antwoorden kwijt te raken.
          </p>
        </div>
      </div>
    </main>
  );
}
