"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  buildImportDiff,
  type ImportDiffResult,
  type ImportDiffStatus,
} from "@/lib/scan/definition/import-diff";

type SheetCheck = {
  sheetName: string;
  exists: boolean;
  ok: boolean;
  rowCount: number;
  columnCount: number;
  headers: string[];
  missingColumns: string[];
};

type Issue = {
  message: string;
};

type ImportConcept = {
  ok: boolean;
  fileName?: string;
  message?: string;
  error?: string;
  checks?: SheetCheck[];
  duplicateIssues?: Issue[];
  requiredFieldIssues?: Issue[];
  relationIssues?: Issue[];
  importSummary?: Record<string, number>;
  preview?: Record<string, Record<string, string>[]>;
  importRows?: Record<string, Record<string, string>[]>;
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

function DiffStatusBadge({ status }: { status: ImportDiffStatus }) {
  const label =
    status === "new"
      ? "Nieuw"
      : status === "changed"
        ? "Gewijzigd"
        : status === "unchanged"
          ? "Ongewijzigd"
          : status === "possiblyRemoved"
            ? "Mogelijk verwijderd"
            : "Ongeldig";

  return (
    <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium">
      {label}
    </span>
  );
}

function IssueBlock({ title, items }: { title: string; items: Issue[] }) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-5">
      <h2 className="text-lg font-semibold">{title}</h2>

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

function DiffOverview({ diff }: { diff: ImportDiffResult }) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Wijzigingsanalyse</h2>
        <p className="text-sm text-muted-foreground">
          Vergelijking tussen de huidige definitie in de app en het opgeslagen
          importconcept.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="text-sm text-muted-foreground">Nieuw</div>
          <div className="mt-2 text-2xl font-semibold">{diff.totals.new}</div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="text-sm text-muted-foreground">Gewijzigd</div>
          <div className="mt-2 text-2xl font-semibold">
            {diff.totals.changed}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="text-sm text-muted-foreground">Ongewijzigd</div>
          <div className="mt-2 text-2xl font-semibold">
            {diff.totals.unchanged}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="text-sm text-muted-foreground">
            Mogelijk verwijderd
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {diff.totals.possiblyRemoved}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="text-sm text-muted-foreground">Ongeldig</div>
          <div className="mt-2 text-2xl font-semibold">
            {diff.totals.invalid}
          </div>
        </div>
      </div>
    </section>
  );
}

function DiffDetails({ diff }: { diff: ImportDiffResult }) {
  return (
    <section className="space-y-6">
      {diff.sheets.map((sheet) => {
        const visibleItems = sheet.items.filter(
          (item) => item.status !== "unchanged"
        );

        return (
          <div
            key={sheet.sheetName}
            className="rounded-3xl border border-black/10 bg-white p-5"
          >
            <div className="space-y-1">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {sheet.sheetName}
              </div>
              <h2 className="text-lg font-semibold">{sheet.title}</h2>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-5">
              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-3">
                <div className="text-xs text-muted-foreground">Nieuw</div>
                <div className="mt-1 text-xl font-semibold">
                  {sheet.counts.new}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-3">
                <div className="text-xs text-muted-foreground">Gewijzigd</div>
                <div className="mt-1 text-xl font-semibold">
                  {sheet.counts.changed}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-3">
                <div className="text-xs text-muted-foreground">Ongewijzigd</div>
                <div className="mt-1 text-xl font-semibold">
                  {sheet.counts.unchanged}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-3">
                <div className="text-xs text-muted-foreground">
                  Mogelijk verwijderd
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {sheet.counts.possiblyRemoved}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-3">
                <div className="text-xs text-muted-foreground">Ongeldig</div>
                <div className="mt-1 text-xl font-semibold">
                  {sheet.counts.invalid}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {visibleItems.slice(0, 20).map((item) => (
                <div
                  key={`${sheet.sheetName}-${item.key}`}
                  className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Key: {item.key}
                      </div>
                    </div>

                    <DiffStatusBadge status={item.status} />
                  </div>

                  {item.changedFields.length > 0 && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      Gewijzigde velden:{" "}
                      <span className="font-medium">
                        {item.changedFields.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {visibleItems.length === 0 && (
                <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-muted-foreground">
                  Geen wijzigingen gevonden voor deze sheet.
                </div>
              )}

              {visibleItems.length > 20 && (
                <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-muted-foreground">
                  Er zijn meer wijzigingen. Alleen de eerste 20 worden hier
                  getoond.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ImportApplyConfirmation({
  concept,
  diff,
  hasIssues,
}: {
  concept: ImportConcept;
  diff: ImportDiffResult | null;
  hasIssues: boolean;
}) {
  const [checked, setChecked] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const hasBlockingState =
    !concept.ok || hasIssues || !diff || !concept.importRows;

  const confirmTextIsValid = confirmText.trim().toUpperCase() === "TOEPASSEN";

  const canConfirm =
    !hasBlockingState && checked && confirmTextIsValid && !isTesting;

  const runServerSideSafeTest = async () => {
    if (!canConfirm || !diff || !concept.importRows) return;

    setIsTesting(true);
    setTestMessage(null);
    setTestError(null);

    try {
      const response = await fetch("/api/definition-import-apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmed: checked,
          confirmText,
          importRows: concept.importRows,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
        totals?: {
          new: number;
          changed: number;
          unchanged: number;
          possiblyRemoved: number;
          invalid: number;
        };
      };

      if (!response.ok || !result.ok) {
        setTestError(
          result.error ??
            "Server-side veilige test is niet gelukt. Controleer de importgegevens."
        );
        return;
      }

      const totals = result.totals ?? diff.totals;

      setTestMessage(
        `${
          result.message ?? "Server-side veilige test geslaagd."
        } Samenvatting: ${totals.new} nieuw, ${totals.changed} gewijzigd, ${
          totals.unchanged
        } ongewijzigd, ${totals.possiblyRemoved} mogelijk verwijderd en ${
          totals.invalid
        } ongeldig.`
      );
    } catch {
      setTestError(
        "Server-side veilige test kon niet worden uitgevoerd. Controleer of de lokale server draait."
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Bevestiging vóór toepassen</h2>

        <p className="max-w-3xl text-sm text-muted-foreground">
          Dit is de extra beveiligingslaag vóór echte import. De knop hieronder
          voert nu een server-side veilige test uit via de API-route. Er wordt
          nog niets aangepast in de definitie.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="text-sm font-semibold text-amber-950">Let op</div>

        <p className="mt-2 text-sm leading-6 text-amber-950">
          Deze stap controleert aan de serverkant of het importconcept technisch
          toepasbaar is. De definitieve import bouwen we pas daarna.
        </p>
      </div>

      {diff && (
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
            <div className="text-xs text-muted-foreground">Nieuw</div>
            <div className="mt-1 text-xl font-semibold">{diff.totals.new}</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
            <div className="text-xs text-muted-foreground">Gewijzigd</div>
            <div className="mt-1 text-xl font-semibold">
              {diff.totals.changed}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
            <div className="text-xs text-muted-foreground">Ongewijzigd</div>
            <div className="mt-1 text-xl font-semibold">
              {diff.totals.unchanged}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
            <div className="text-xs text-muted-foreground">
              Mogelijk verwijderd
            </div>
            <div className="mt-1 text-xl font-semibold">
              {diff.totals.possiblyRemoved}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
            <div className="text-xs text-muted-foreground">Ongeldig</div>
            <div className="mt-1 text-xl font-semibold">
              {diff.totals.invalid}
            </div>
          </div>
        </div>
      )}

      {hasBlockingState && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="text-sm font-semibold text-red-950">
            Toepassen is geblokkeerd
          </div>

          <p className="mt-2 text-sm leading-6 text-red-950">
            Het concept is niet geschikt om toe te passen. Controleer eerst de
            foutmeldingen, ontbrekende velden, verwijzingen, sheetcontroles of
            ontbrekende importregels.
          </p>
        </div>
      )}

      <div className="mt-5 space-y-4">
        <label className="flex items-start gap-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            disabled={hasBlockingState || isTesting}
            className="mt-1"
          />

          <span className="text-sm text-muted-foreground">
            Ik heb de wijzigingsanalyse, sheetcontrole en eventuele meldingen
            gecontroleerd.
          </span>
        </label>

        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <label className="text-sm font-medium">
            Typ <span className="font-semibold">TOEPASSEN</span> om de knop
            vrij te geven
          </label>

          <input
            type="text"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            disabled={hasBlockingState || isTesting}
            placeholder="TOEPASSEN"
            className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runServerSideSafeTest}
          disabled={!canConfirm}
          className={
            canConfirm
              ? "inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
              : "inline-flex cursor-not-allowed rounded-2xl border border-black/10 bg-black/10 px-5 py-3 text-sm font-medium text-muted-foreground"
          }
        >
          {isTesting
            ? "Server-side test uitvoeren..."
            : "Bevestig toepassen — server-side veilige test"}
        </button>

        <span className="text-sm text-muted-foreground">
          Deze knop importeert nu nog niet echt.
        </span>
      </div>

      {testMessage && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-950">
          {testMessage}
        </div>
      )}

      {testError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-950">
          {testError}
        </div>
      )}
    </section>
  );
}

export default function DefinitionImportConceptPage() {
  const [concept, setConcept] = useState<ImportConcept | null>(null);
  const [diff, setDiff] = useState<ImportDiffResult | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("definitionImportConcept");

    if (!raw) {
      setConcept(null);
      setDiff(null);
      return;
    }

    try {
      const parsedConcept = JSON.parse(raw) as ImportConcept;
      setConcept(parsedConcept);

      if (parsedConcept.importRows) {
        setDiff(buildImportDiff(parsedConcept.importRows));
      } else {
        setDiff(null);
      }
    } catch {
      setConcept(null);
      setDiff(null);
    }
  }, []);

  const clearConcept = () => {
    window.localStorage.removeItem("definitionImportConcept");
    setConcept(null);
    setDiff(null);
  };

  const checks = concept?.checks ?? [];
  const duplicateIssues = concept?.duplicateIssues ?? [];
  const requiredFieldIssues = concept?.requiredFieldIssues ?? [];
  const relationIssues = concept?.relationIssues ?? [];
  const importSummary = concept?.importSummary ?? {};
  const preview = concept?.preview ?? {};

  const hasIssues =
    duplicateIssues.length > 0 ||
    requiredFieldIssues.length > 0 ||
    relationIssues.length > 0 ||
    checks.some((check) => !check.ok);

  if (!concept) {
    return (
      <main className="mx-auto max-w-5xl space-y-8 p-8">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            KWEEKERS Groeimodel
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Importconcept
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground">
            Er is nog geen importconcept opgeslagen. Voer eerst een
            import-preview uit.
          </p>
        </div>

        <Link
          href="/definition-import"
          className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
        >
          Naar import-preview
        </Link>
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
          Importconcept
        </h1>

        <p className="max-w-3xl text-sm text-muted-foreground">
          Dit is het opgeslagen resultaat van de import-preview. Deze pagina
          past nog niets definitief toe.
        </p>
      </div>

      <section className="rounded-3xl border border-black/10 bg-black/[0.02] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Conceptstatus</h2>

            <p className="text-sm text-muted-foreground">
              {concept.error ??
                concept.message ??
                "Importconcept is geladen."}
            </p>

            {concept.fileName && (
              <p className="text-sm text-muted-foreground">
                Bestand: <span className="font-medium">{concept.fileName}</span>
              </p>
            )}

            {concept.createdAt && (
              <p className="text-sm text-muted-foreground">
                Aangemaakt op:{" "}
                <span className="font-medium">
                  {new Date(concept.createdAt).toLocaleString("nl-NL")}
                </span>
              </p>
            )}
          </div>

          <StatusBadge ok={Boolean(concept.ok)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/definition-import"
            className="inline-flex rounded-2xl border border-black/10 bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Nieuwe preview uitvoeren
          </Link>

          <button
            type="button"
            onClick={clearConcept}
            className="inline-flex rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black"
          >
            Concept verwijderen
          </button>
        </div>
      </section>

      {diff && <DiffOverview diff={diff} />}

      {Object.keys(importSummary).length > 0 && (
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

      {hasIssues && (
        <>
          <IssueBlock title="Dubbele waardes" items={duplicateIssues} />
          <IssueBlock
            title="Ontbrekende verplichte velden"
            items={requiredFieldIssues}
          />
          <IssueBlock title="Verwijzingsfouten" items={relationIssues} />
        </>
      )}

      {!hasIssues && concept.ok && (
        <section className="rounded-3xl border border-black/10 bg-white p-5">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              Concept is importgeschikt
            </h2>
            <p className="text-sm text-muted-foreground">
              Het concept bevat geen blokkerende fouten. Er wordt nog niets
              definitief toegepast.
            </p>
          </div>
        </section>
      )}

      {diff && <DiffDetails diff={diff} />}

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

      <ImportApplyConfirmation
        concept={concept}
        diff={diff}
        hasIssues={hasIssues}
      />
    </main>
  );
}