"use client";

import Link from "next/link";
import { useScanContext } from "@/app/context/ScanContext";

const ANSWER_OPTIONS = [
  {
    value: "ja",
    label: "Ja",
    description: "Dit staat redelijk goed.",
  },
  {
    value: "deels",
    label: "Deels",
    description: "Er is een basis, maar nog niet stabiel.",
  },
  {
    value: "nee",
    label: "Nee",
    description: "Dit vraagt nu duidelijk aandacht.",
  },
];

function getAnswerLabel(value: string) {
  return (
    ANSWER_OPTIONS.find((option) => option.value === value)?.label ||
    "Nog niet gekozen"
  );
}

function AnswerButtons({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3">
      {ANSWER_OPTIONS.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border p-4 text-left ${
              isActive ? "border-black" : ""
            }`}
          >
            <div className="font-medium">{option.label}</div>
            <div className="text-sm text-muted-foreground">
              {option.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function DiagnosePage() {
  const { scan, setOwnership, setAfasUsage, setReporting } = useScanContext();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Stap 3 van 4</p>
        <h1 className="text-3xl font-semibold tracking-tight">Diagnose</h1>
        <p className="text-sm text-muted-foreground">
          Beantwoord eerst de belangrijkste diagnosevragen.
        </p>
      </div>

      <section className="space-y-6 rounded-2xl border p-5">
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-medium">
              1. Zijn proceseigenaarschap en verantwoordelijkheden duidelijk?
            </h2>
            <p className="text-sm text-muted-foreground">
              Denk aan eigenaarschap voor processen, keuzes en opvolging.
            </p>
          </div>

          <AnswerButtons
            value={scan.diagnosis.ownership}
            onChange={setOwnership}
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-medium">
              2. Wordt AFAS gebruikt als de standaard werkwijze?
            </h2>
            <p className="text-sm text-muted-foreground">
              Of wordt er nog veel gewerkt met omwegen, losse lijstjes of
              alternatieve routes?
            </p>
          </div>

          <AnswerButtons
            value={scan.diagnosis.afasUsage}
            onChange={setAfasUsage}
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-medium">
              3. Is rapportage al voldoende gestuurd en niet meer vooral
              handmatig?
            </h2>
            <p className="text-sm text-muted-foreground">
              Denk aan KPI’s, definities, dashboards en afhankelijkheid van
              Excel.
            </p>
          </div>

          <AnswerButtons
            value={scan.diagnosis.reporting}
            onChange={setReporting}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Controle</h2>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Klantnaam: {scan.profile.customerName || "Nog leeg"}</div>
          <div>Sector: {scan.profile.sector || "Nog leeg"}</div>
          <div>Scope: {scan.scope || "Nog leeg"}</div>
          <div>
            Proceseigenaarschap: {getAnswerLabel(scan.diagnosis.ownership)}
          </div>
          <div>AFAS als standaard: {getAnswerLabel(scan.diagnosis.afasUsage)}</div>
          <div>Rapportage: {getAnswerLabel(scan.diagnosis.reporting)}</div>
        </div>
      </section>

      <div className="flex items-center justify-between border-t pt-6">
        <Link
          href="/scan/nieuw/scope"
          className="rounded-2xl border px-4 py-2 text-sm shadow-sm"
        >
          Vorige
        </Link>

        <Link
          href="/scan/nieuw/advies"
          className="rounded-2xl border px-4 py-2 text-sm shadow-sm"
        >
          Verder naar advies
        </Link>
      </div>
    </div>
  );
}
