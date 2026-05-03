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

export default function ScopePage() {
  const { scan, setScope } = useScanContext();

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
          const active = scan.scope === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setScope(option.value)}
              className={`block w-full rounded-2xl border p-5 text-left shadow-sm ${
                active ? "bg-muted" : "bg-background"
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {option.description}
              </p>
            </button>
          );
        })}
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Controle</h2>
        <div className="text-sm text-muted-foreground">
          Gekozen scope: {scan.scope}
        </div>
      </section>

      <div className="flex items-center justify-between border-t pt-6">
        <Link
          href="/scan/nieuw/profile"
          className="rounded-2xl border px-4 py-2 text-sm shadow-sm"
        >
          Vorige
        </Link>

        <Link
          href="/scan/nieuw/diagnose"
          className="rounded-2xl border px-4 py-2 text-sm shadow-sm"
        >
          Verder naar diagnose
        </Link>
      </div>
    </div>
  );
}
