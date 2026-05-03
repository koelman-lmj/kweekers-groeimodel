"use client";

import Link from "next/link";
import { useScanContext } from "@/app/context/ScanContext";

export default function ProfilePage() {
  const { scan, setCustomerName, setSector } = useScanContext();

  const canGoNext = scan.profile.customerName.trim() !== "";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Stap 1 van 4</p>
        <h1 className="text-3xl font-semibold tracking-tight">Klantprofiel</h1>
        <p className="text-sm text-muted-foreground">
          Vul eerst de basisgegevens van de klant in.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border p-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Klantnaam</label>
          <input
            className="w-full rounded-xl border px-4 py-3"
            value={scan.profile.customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Bijvoorbeeld: Railcenter"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Sector</label>
          <input
            className="w-full rounded-xl border px-4 py-3"
            value={scan.profile.sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Bijvoorbeeld: Onderwijs"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Controle</h2>
        <div className="text-sm text-muted-foreground">
          <div>Klantnaam: {scan.profile.customerName || "Nog leeg"}</div>
          <div>Sector: {scan.profile.sector || "Nog leeg"}</div>
        </div>
      </section>

      <div className="flex items-center justify-between border-t pt-6">
        <div />
        <Link
          href={canGoNext ? "/scan/nieuw/scope" : "#"}
          aria-disabled={!canGoNext}
          className={`rounded-2xl border px-4 py-2 text-sm shadow-sm ${
            !canGoNext ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Verder naar scope
        </Link>
      </div>
    </div>
  );
}
