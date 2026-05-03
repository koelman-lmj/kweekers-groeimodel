"use client";

import Link from "next/link";
import { useScanContext } from "@/app/context/ScanContext";

export default function ProfilePage() {
  const { scan, setCustomerName, setSector } = useScanContext();

  const hasCustomerName = scan.profile.customerName.trim().length > 0;
  const hasSector = scan.profile.sector.trim().length > 0;
  const isProfileComplete = hasCustomerName && hasSector;

  const customerNameFieldClass = hasCustomerName
    ? "w-full rounded-2xl border px-4 py-3 outline-none"
    : "w-full rounded-2xl border border-amber-400 bg-amber-50 px-4 py-3 outline-none";

  const sectorFieldClass = hasSector
    ? "w-full rounded-2xl border bg-white px-4 py-3 outline-none"
    : "w-full rounded-2xl border border-amber-400 bg-amber-50 px-4 py-3 outline-none";

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
          <label htmlFor="customerName" className="text-sm font-medium">
            Klantnaam <span className="text-amber-500">*</span>
          </label>
          <input
            id="customerName"
            type="text"
            value={scan.profile.customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Bijvoorbeeld: Jansen BV"
            className={customerNameFieldClass}
          />
          {!hasCustomerName && (
            <p className="text-sm text-amber-700">Klantnaam is verplicht.</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="sector" className="text-sm font-medium">
            Sector <span className="text-amber-500">*</span>
          </label>
          <select
            id="sector"
            value={scan.profile.sector}
            onChange={(event) => setSector(event.target.value)}
            className={sectorFieldClass}
          >
            <option value="">Kies een sector</option>
            <option value="zorg">Zorg</option>
            <option value="onderwijs">Onderwijs</option>
            <option value="nonprofit">Non-profit</option>
            <option value="commercieel">Commercieel</option>
            <option value="overig">Overig</option>
          </select>
          {!hasSector && (
            <p className="text-sm text-amber-700">Sector is verplicht.</p>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Controle</h2>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>
            Klantnaam: {hasCustomerName ? scan.profile.customerName : "Nog leeg"}
          </div>
          <div>Sector: {hasSector ? scan.profile.sector : "Kies een sector"}</div>
        </div>
      </section>

      {!isProfileComplete && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Vul eerst alle verplichte velden in om verder te gaan naar scope.
        </div>
      )}

      <div className="flex items-center justify-end border-t pt-6">
        {isProfileComplete ? (
          <Link
            href="/scan/nieuw/scope"
            className="inline-flex items-center rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            Verder naar scope →
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center rounded-2xl border px-5 py-3 text-sm font-medium text-muted-foreground opacity-60"
          >
            Verder naar scope →
          </span>
        )}
      </div>
    </div>
  );
}
