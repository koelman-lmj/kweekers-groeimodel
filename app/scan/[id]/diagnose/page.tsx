"use client";

import Link from "next/link";
import { useScanContext } from "@/app/context/ScanContext";

export default function DiagnosePage() {
  const { scan } = useScanContext();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Stap 3 van 4</p>
        <h1 className="text-3xl font-semibold tracking-tight">Diagnose</h1>
        <p className="text-sm text-muted-foreground">
          Dit is voorlopig een eenvoudige tussenpagina om de flow werkend te
          maken.
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Controle</h2>
        <div className="text-sm text-muted-foreground">
          <div>Klantnaam: {scan.profile.customerName || "Nog leeg"}</div>
          <div>Sector: {scan.profile.sector || "Nog leeg"}</div>
          <div>Scope: {scan.scope || "Nog leeg"}</div>
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
          href="#"
          className="pointer-events-none rounded-2xl border px-4 py-2 text-sm opacity-50 shadow-sm"
          aria-disabled="true"
        >
          Advies volgt hierna
        </Link>
      </div>
    </div>
  );
}
