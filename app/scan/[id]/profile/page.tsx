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
  return SECTOR_OPTIONS.find((option) => option.value === value)?.label || "Nog niet gekozen";
}

export default function ProfilePage() {
  const { scan, setCustomerName, setSector } = useScanContext();

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
            Klantnaam
          </label>
          <input
            id="customerName"
            type="text"
            value={scan.profile.customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Bijvoorbeeld: Pieter BV"
            className="w-full rounded-2xl border px-4 py-3 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sector" className="text-sm font-medium">
            Sector
          </label>
          <select
            id="sector"
            value={scan.profile.sector}
            onChange={(event) => setSector(event.target.value)}
            className="w-full rounded-2xl border px-4 py-3 outline-none bg-white"
          >
            {SECTOR_OPTIONS.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Controle</h2>
        <div className="text-sm text-muted-foreground">
          <div>Klantnaam: {scan.profile.customerName || "Nog leeg"}</div>
          <div>Sector: {getSectorLabel(scan.profile.sector)}</div>
        </div>
      </section>

      <div className="flex items-center justify-end border-t pt-6">
        <Link
          href="/scan/nieuw/scope"
          className="rounded-2xl border px-4 py-2 text-sm shadow-sm"
        >
          Verder naar scope
        </Link>
      </div>
    </div>
  );
}"use client";

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
  return SECTOR_OPTIONS.find((option) => option.value === value)?.label || "Nog niet gekozen";
}

export default function ProfilePage() {
  const { scan, setCustomerName, setSector } = useScanContext();

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
            Klantnaam
          </label>
          <input
            id="customerName"
            type="text"
            value={scan.profile.customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Bijvoorbeeld: Pieter BV"
            className="w-full rounded-2xl border px-4 py-3 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sector" className="text-sm font-medium">
            Sector
          </label>
          <select
            id="sector"
            value={scan.profile.sector}
            onChange={(event) => setSector(event.target.value)}
            className="w-full rounded-2xl border px-4 py-3 outline-none bg-white"
          >
            {SECTOR_OPTIONS.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Controle</h2>
        <div className="text-sm text-muted-foreground">
          <div>Klantnaam: {scan.profile.customerName || "Nog leeg"}</div>
          <div>Sector: {getSectorLabel(scan.profile.sector)}</div>
        </div>
      </section>

      <div className="flex items-center justify-end border-t pt-6">
        <Link
          href="/scan/nieuw/scope"
          className="rounded-2xl border px-4 py-2 text-sm shadow-sm"
        >
          Verder naar scope
        </Link>
      </div>
    </div>
  );
}
