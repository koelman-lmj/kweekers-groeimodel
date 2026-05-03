"use client";

import Link from "next/link";
import { useScanContext } from "@/app/context/ScanContext";

export default function ProfileAanleidingPage() {
  const { scan } = useScanContext();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Profiel — stap 2 van 4</p>
        <h1 className="text-3xl font-semibold tracking-tight">Aanleiding</h1>
        <p className="text-sm text-muted-foreground">
          Dit scherm bouwen we hierna uit met keuzes voor aanleiding, doel en grootste knelpunt.
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Wat is al ingevuld?</h2>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>Klantnaam: {scan.profile.customerName || "Nog leeg"}</div>
          <div>Sector: {scan.profile.sector || "Nog niet gekozen"}</div>
          <div>
            Organisatiegrootte: {scan.profile.organizationSize || "Nog niet gekozen"}
          </div>
          <div>
            Administraties / entiteiten:{" "}
            {scan.profile.administrationCount || "Nog niet gekozen"}
          </div>
        </div>
      </section>

      <div className="kweekers-accent-box text-sm">
        Volgende stap: hier voegen we de vragen toe voor aanleiding, hoofddoel en grootste knelpunt.
      </div>

      <div className="flex items-center justify-between border-t pt-6">
        <Link href="/scan/nieuw/profile" className="rounded-2xl border px-5 py-3 text-sm font-medium">
          Vorige
        </Link>

        <span
          aria-disabled="true"
          className="inline-flex cursor-not-allowed items-center rounded-2xl border px-5 py-3 text-sm font-medium text-muted-foreground opacity-60"
        >
          Verder naar context →
        </span>
      </div>
    </div>
  );
}
