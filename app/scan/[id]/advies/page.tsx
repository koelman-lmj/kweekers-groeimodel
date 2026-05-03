"use client";

import Link from "next/link";
import { useScanContext } from "@/app/context/ScanContext";

export default function AdvicePage() {
  const { scan } = useScanContext();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Stap 4 van 4</p>
        <h1 className="text-3xl font-semibold tracking-tight">Advies</h1>
        <p className="text-sm text-muted-foreground">
          Dit is de eerste eenvoudige adviespagina van de app.
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Samenvatting</h2>
        <div className="text-sm text-muted-foreground">
          <div>Klantnaam: {scan.profile.customerName || "Nog leeg"}</div>
          <div>Sector: {scan.profile.sector || "Nog leeg"}</div>
          <div>Scope: {scan.scope || "Nog leeg"}</div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Eerste adviesrichting</h2>
        <div className="text-sm text-muted-foreground">
          <p>
            Op basis van deze eerste invoer lijkt dit een goed moment om de
            gekozen scope verder uit te werken naar gerichte diagnosevragen en
            een concreter advies.
          </p>
        </div>
      </section>

      <div className="flex items-center justify-between border-t pt-6">
        <Link
          href="/scan/nieuw/diagnose"
          className="rounded-2xl border px-4 py-2 text-sm shadow-sm"
        >
          Vorige
        </Link>

        <Link
          href="/"
          className="rounded-2xl border px-4 py-2 text-sm shadow-sm"
        >
          Afronden
        </Link>
      </div>
    </div>
  );
}
