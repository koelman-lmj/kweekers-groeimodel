"use client";

import Link from "next/link";
import { useScanContext } from "@/app/context/ScanContext";

const SCOPE_OPTIONS = [
  {
    value: "volledige_scan",
    label: "Volledige scan",
    description: "Breed beeld over organisatie, processen, AFAS, data en beheer.",
  },
  {
    value: "quickscan",
    label: "Quickscan",
    description: "Snelle eerste scan op hoofdlijnen.",
  },
  {
    value: "afas_optimalisatie",
    label: "AFAS-optimalisatie",
    description: "Focus op inrichting, gebruik en verbetering van AFAS.",
  },
  {
    value: "data_rapportage",
    label: "Data & rapportage",
    description: "Focus op KPI’s, definities en stuurinformatie.",
  },
];

function getScopeLabel(value: string) {
  return (
    SCOPE_OPTIONS.find((option) => option.value === value)?.label ||
    "Nog niet gekozen"
  );
}

export default function ScopePage() {
  const { scan, setScope } = useScanContext();

  const hasSelectedScope = scan.scope !== "";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Stap 2 van 4</p>
        <h1 className="text-3xl font-semibold tracking-tight">Scope</h1>
        <p className="text-sm text-muted-foreground">
          Kies hoe breed je de scan wilt uitvoeren.
        </p>
      </div>

      <section className="space-y-4">
        {SCOPE_OPTIONS.map((option) => {
          const isActive = scan.scope === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setScope(option.value)}
              aria-pressed={isActive}
className={`w-full rounded-2xl border p-5 text-left transition ${
  isActive
    ? "kweekers-active-panel"
    : "kweekers-selectable-hover bg-white hover:border-black"
}`}
            >
              <div className="text-lg font-medium">{option.label}</div>
              <div
className={`mt-2 text-sm ${
  isActive ? "kweekers-active-panel-muted" : "text-muted-foreground"
}`}
              >
                {option.description}
              </div>
            </button>
          );
        })}
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Controle</h2>
        <div className="text-sm text-muted-foreground">
          <div>Gekozen scope: {getScopeLabel(scan.scope)}</div>
        </div>
      </section>

      {!hasSelectedScope && (
        <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
          Kies eerst een scope om verder te gaan naar diagnose.
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-6">
        <Link
          href="/scan/nieuw/profile"
          className="rounded-2xl border px-4 py-2 text-sm shadow-sm"
        >
          Vorige
        </Link>

        {hasSelectedScope ? (
<Link
  href="/scan/nieuw/diagnose"
  className="inline-flex items-center rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
>
  Verder naar diagnose →
</Link>
        ) : (
          <span
            aria-disabled="true"
            className="cursor-not-allowed rounded-2xl border px-4 py-2 text-sm opacity-50 shadow-sm"
          >
            Verder naar diagnose
          </span>
        )}
      </div>
    </div>
  );
}
