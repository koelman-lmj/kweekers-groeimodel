"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ApplyResultSheet = {
  sheetName: string;
  title: string;
  counts: {
    new: number;
    changed: number;
    unchanged: number;
    possiblyRemoved: number;
    invalid: number;
  };
};

type ApplyResult = {
  ok: boolean;
  mode?: string;
  message?: string;
  error?: string;
  createdAt?: string;
  totals?: {
    new: number;
    changed: number;
    unchanged: number;
    possiblyRemoved: number;
    invalid: number;
  };
  sheets?: ApplyResultSheet[];
};

function formatDate(value?: string) {
  if (!value) return "Niet bekend";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("nl-NL");
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function SheetCountCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function buildTechnicalProposal(result: ApplyResult) {
  return {
    proposalType: "definition-import-proposal",
    proposalVersion: 1,
    generatedAt: new Date().toISOString(),
    source: {
      app: "kweekers-groeimodel",
      mode: result.mode ?? "safe-test",
    },
    status: {
      ok: result.ok,
      message: result.message ?? null,
      error: result.error ?? null,
    },
    totals: result.totals ?? {
      new: 0,
      changed: 0,
      unchanged: 0,
      possiblyRemoved: 0,
      invalid: 0,
    },
    sheets: result.sheets ?? [],
    note:
      "Dit is een technisch importvoorstel. De actieve definitie is hiermee nog niet aangepast.",
  };
}

export default function DefinitionImportApplyResultPage() {
  const [result, setResult] = useState<ApplyResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("definitionImportApplyResult");

    if (!raw) {
      setResult(null);
      setIsLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as ApplyResult;
      setResult(parsed);
    } catch {
      setResult(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const totals = useMemo(() => {
    return (
      result?.totals ?? {
        new: 0,
        changed: 0,
        unchanged: 0,
        possiblyRemoved: 0,
        invalid: 0,
      }
    );
  }, [result]);

  const sheets = result?.sheets ?? [];

  const technicalProposal = useMemo(() => {
    if (!result) return null;
    return buildTechnicalProposal(result);
  }, [result]);

  const technicalProposalJson = useMemo(() => {
    if (!technicalProposal) return "";
    return JSON.stringify(technicalProposal, null, 2);
  }, [technicalProposal]);

  const clearResult = () => {
    window.localStorage.removeItem("definitionImportApplyResult");
    setResult(null);
  };

  const copyJson = async () => {
    if (!technicalProposalJson) return;

    try {
      await navigator.clipboard.writeText(technicalProposalJson);
      setCopyMessage("JSON is gekopieerd naar het klembord.");
    } catch {
      setCopyMessage(
        "Kopiëren is niet gelukt. Selecteer de JSON handmatig en kopieer deze."
      );
    }

    window.setTimeout(() => {
      setCopyMessage(null);
    }, 3000);
  };

  const downloadJson = () => {
    if (!technicalProposalJson) return;

    const blob = new Blob([technicalProposalJson], {
      type: "application/json;charset=utf-8",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    const timestamp = new Date()
      .toISOString()
      .replaceAll(":", "-")
      .replaceAll(".", "-");

    link.href = url;
    link.download = `definition-import-proposal-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  if (!isLoaded) {
    return (
      <main className="mx-auto max-w-6xl space-y-8 p-8">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            KWEEKERS Groeimodel
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Importvoorstel laden
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground">
            Het resultaat van de importcontrole wordt geladen.
          </p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="mx-auto max-w-6xl space-y-8 p-8">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            KWEEKERS Groeimodel
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Geen importvoorstel gevonden
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground">
            Er is nog geen resultaat van de server-side importcontrole
            opgeslagen. Ga terug naar het importconcept en voer de veilige test
            opnieuw uit.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/definition-import-concept"
            className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Terug naar importconcept
          </Link>

          <Link
            href="/definition-import"
            className="inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
          >
            Nieuwe import-preview uitvoeren
          </Link>
        </div>
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
          Importvoorstel
        </h1>

        <p className="max-w-3xl text-sm text-muted-foreground">
          Dit is het resultaat van de server-side controle. Er is nog niets
          definitief toegepast in de actieve definitie.
        </p>
      </div>

      <section className="rounded-3xl border border-black/10 bg-black/[0.02] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Status</h2>

            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {result.message ??
                result.error ??
                "Importvoorstel is geladen."}
            </p>

            <div className="text-sm text-muted-foreground">
              Modus:{" "}
              <span className="font-medium text-black">
                {result.mode ?? "niet bekend"}
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              Aangemaakt op:{" "}
              <span className="font-medium text-black">
                {formatDate(result.createdAt)}
              </span>
            </div>
          </div>

          <span
            className={
              result.ok
                ? "rounded-full border border-black/10 bg-black px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black"
            }
          >
            {result.ok ? "Controle geslaagd" : "Controle met aandacht"}
          </span>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-lg font-semibold text-amber-950">Belangrijk</h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-amber-950">
          Dit is nog geen echte live-import. Deze stap is bedoeld als veilig
          importvoorstel. De actieve definitie in de app is nog niet aangepast.
          De JSON hieronder is een technisch voorstel dat je kunt bewaren,
          controleren of later gebruiken als basis voor een echte importstap.
        </p>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Samenvatting</h2>
          <p className="text-sm text-muted-foreground">
            Totaalbeeld van de gecontroleerde import.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <SummaryCard label="Nieuw" value={totals.new} />
          <SummaryCard label="Gewijzigd" value={totals.changed} />
          <SummaryCard label="Ongewijzigd" value={totals.unchanged} />
          <SummaryCard
            label="Mogelijk verwijderd"
            value={totals.possiblyRemoved}
          />
          <SummaryCard label="Ongeldig" value={totals.invalid} />
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Sheets in dit voorstel</h2>
          <p className="text-sm text-muted-foreground">
            Per sheet zie je hoeveel records nieuw, gewijzigd, ongewijzigd,
            mogelijk verwijderd of ongeldig zijn.
          </p>
        </div>

        {sheets.length === 0 && (
          <div className="rounded-3xl border border-black/10 bg-white p-5 text-sm text-muted-foreground">
            Er zijn geen sheetdetails beschikbaar in dit importvoorstel.
          </div>
        )}

        {sheets.map((sheet) => (
          <div
            key={sheet.sheetName}
            className="rounded-3xl border border-black/10 bg-white p-5"
          >
            <div className="space-y-1">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {sheet.sheetName}
              </div>

              <h3 className="text-lg font-semibold">{sheet.title}</h3>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-5">
              <SheetCountCard label="Nieuw" value={sheet.counts.new} />
              <SheetCountCard
                label="Gewijzigd"
                value={sheet.counts.changed}
              />
              <SheetCountCard
                label="Ongewijzigd"
                value={sheet.counts.unchanged}
              />
              <SheetCountCard
                label="Mogelijk verwijderd"
                value={sheet.counts.possiblyRemoved}
              />
              <SheetCountCard
                label="Ongeldig"
                value={sheet.counts.invalid}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              Technisch definitievoorstel
            </h2>

            <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
              Dit JSON-bestand is het technische voorstel op basis van de
              gecontroleerde import. Het is bedoeld om veilig te bewaren,
              controleren of later als basis te gebruiken voor een echte
              verwerkingsstap.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyJson}
              className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
            >
              JSON kopiëren
            </button>

            <button
              type="button"
              onClick={downloadJson}
              className="inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
            >
              JSON downloaden
            </button>
          </div>
        </div>

        {copyMessage && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-950">
            {copyMessage}
          </div>
        )}

        <pre className="mt-5 max-h-[520px] overflow-auto rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-xs">
          {technicalProposalJson}
        </pre>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-5">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Volgende stap</h2>

          <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
            De volgende uitbreiding is het genereren van echte
            definitie-output per onderdeel. Denk aan een JSON-structuur of
            TypeScript-output die één-op-één aansluit op de bestanden in
            lib/scan/definition.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/definition-import-concept"
            className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Terug naar importconcept
          </Link>

          <Link
            href="/definition-import"
            className="inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
          >
            Nieuwe import-preview uitvoeren
          </Link>

          <button
            type="button"
            onClick={clearResult}
            className="inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
          >
            Resultaat verwijderen
          </button>
        </div>
      </section>

      <details className="rounded-3xl border border-black/10 bg-black/[0.02] p-5">
        <summary className="cursor-pointer text-sm font-medium">
          Ruwe server-response tonen
        </summary>

        <pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl border border-black/10 bg-white p-4 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>
    </main>
  );
}