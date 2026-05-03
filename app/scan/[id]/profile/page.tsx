"use client";

import Link from "next/link";
import { useScanContext } from "@/app/context/ScanContext";

const SECTOR_OPTIONS = [
  { value: "", label: "Kies een sector" },
  { value: "zorg", label: "Zorg" },
  { value: "onderwijs", label: "Onderwijs" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "commercieel", label: "Commercieel" },
  { value: "overig", label: "Overig" },
];

function getSectorLabel(value: string) {
  return (
    SECTOR_OPTIONS.find((option) => option.value === value)?.label ||
    "Nog niet gekozen"
  );
}

export default function ProfilePage() {
  const { scan, setCustomerName, setSector } = useScanContext();

  const hasCustomerName = scan.profile.customerName.trim() !== "";
  const hasSector = scan.profile.sector !== "";
  const isProfileComplete = hasCustomerName && hasSector;

  const customerNameFieldClass = hasCustomerName
    ? "w-full rounded-2xl border px-4 py-3 outline-none"
    : "w-full rounded-2xl border border-red-500 bg-red-50 px-4 py-3 outline-none";

  const sectorFieldClass = hasSector
    ? "w-full rounded-2xl border bg-white px-4 py-3 outline-none"
    : "w-full rounded-2xl border border-red-500 bg-red-50 px-4 py-3 outline-none";

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
            Klantnaam <span className="text-red-600">*</span>
          </label>
          <input
            id="customerName"
            type="text"
            value={scan.profile.customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Bijvoorbeeld: Pieter BV"
            className={customerNameFieldClass}
          />
          {!hasCustomerName && (
            <p className="text-sm text-red-600">
              Klantnaam is verplicht.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="sector" className="text-sm font-medium">
            Sector <span className="text-red-600">*</span>
          </label>
          <select
            id="sector"
            value={scan.profile.sector}
            onChange={(event) => setSector(event.target.value)}
            className={sectorFieldClass}
          >
            {SECTOR_OPTIONS.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {!hasSector && (
            <p className="text-sm text-red-600">
              Sector is verplicht.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Controle</h2>
        <div className="text-sm text-muted-foreground">
          <div>
            Klantnaam: {hasCustomerName ? scan.profile.customerName : "Nog leeg"}
          </div>
          <div>Sector: {getSectorLabel(scan.profile.sector)}</div>
        </div>
      </section>

      {!isProfileComplete && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Vul eerst alle verplichte velden in om verder te gaan naar scope.
        </div>
      )}

      <div className="flex items-center justify-end border-t pt-6">
        {isProfileComplete ? (
          <Link
            href="/scan/nieuw/scope"
            className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            Verder naar scope →
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="cursor-not-allowed rounded-2xl border px-5 py-3 text-sm font-medium opacity-50 shadow-sm"
          >
            Verder naar scope →
          </span>
        )}
      </div>
    </div>
  );
}
