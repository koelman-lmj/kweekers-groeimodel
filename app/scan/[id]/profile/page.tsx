"use client";

import Link from "next/link";
import { useScanContext } from "@/app/context/ScanContext";

const SECTOR_OPTIONS = [
  { value: "zorg", label: "Zorg" },
  { value: "onderwijs", label: "Onderwijs" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "commercieel", label: "Commercieel" },
  { value: "overig", label: "Overig" },
];

const SIZE_OPTIONS = [
  { value: "1-25", label: "1–25 medewerkers" },
  { value: "26-100", label: "26–100 medewerkers" },
  { value: "101-250", label: "101–250 medewerkers" },
  { value: "251-500", label: "251–500 medewerkers" },
  { value: "500+", label: "500+ medewerkers" },
];

const ADMINISTRATION_OPTIONS = [
  { value: "1", label: "1 administratie" },
  { value: "2-3", label: "2–3 administraties" },
  { value: "4-10", label: "4–10 administraties" },
  { value: "10+", label: "10+ administraties" },
];

function getLabel(
  options: { value: string; label: string }[],
  value: string
): string {
  return options.find((option) => option.value === value)?.label || "Nog niet gekozen";
}

function ChoiceCards({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={
              isActive
                ? "kweekers-active-panel rounded-2xl border px-4 py-4 text-left transition"
                : "kweekers-selectable-hover rounded-2xl border bg-white px-4 py-4 text-left transition"
            }
          >
            <div className="text-sm font-medium">{option.label}</div>
          </button>
        );
      })}
    </div>
  );
}

export default function ProfileBasisPage() {
  const {
    scan,
    setCustomerName,
    setSector,
    setOrganizationSize,
    setAdministrationCount,
  } = useScanContext();

  const hasCustomerName = scan.profile.customerName.trim() !== "";
  const hasSector = scan.profile.sector !== "";
  const hasOrganizationSize = scan.profile.organizationSize !== "";
  const hasAdministrationCount = scan.profile.administrationCount !== "";

  const isBasisComplete =
    hasCustomerName &&
    hasSector &&
    hasOrganizationSize &&
    hasAdministrationCount;

  const invalidInputClass =
    "w-full rounded-2xl border border-amber-400 bg-amber-50 px-4 py-3 outline-none";

  const validInputClass =
    "w-full rounded-2xl border bg-white px-4 py-3 outline-none";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Profiel — stap 1 van 4</p>
        <h1 className="text-3xl font-semibold tracking-tight">Basis</h1>
        <p className="text-sm text-muted-foreground">
          Vul eerst de belangrijkste kenmerken van de organisatie in.
        </p>
      </div>

      <section className="space-y-5 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Organisatie</h2>

        <div className="space-y-2">
          <label htmlFor="customerName" className="text-sm font-medium">
            Klantnaam <span className="kweekers-required">*</span>
          </label>
          <input
            id="customerName"
            type="text"
            value={scan.profile.customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Bijvoorbeeld: Janssen BV"
            className={hasCustomerName ? validInputClass : invalidInputClass}
          />
          {!hasCustomerName && (
            <p className="text-sm text-amber-700">Klantnaam is verplicht.</p>
          )}
        </div>

        <div className="space-y-3">
  <label className="text-sm font-medium">
    Sector <span className="kweekers-required">*</span>
  </label>
  <ChoiceCards
    options={SECTOR_OPTIONS}
    value={scan.profile.sector}
    onChange={setSector}
  />
  {!hasSector && (
    <p className="text-sm text-amber-700">Kies een sector.</p>
  )}
</div>

<div className="space-y-3">
  <label className="text-sm font-medium">
    Organisatiegrootte <span className="kweekers-required">*</span>
  </label>
  <ChoiceCards
    options={SIZE_OPTIONS}
    value={scan.profile.organizationSize}
    onChange={setOrganizationSize}
  />
  {!hasOrganizationSize && (
    <p className="text-sm text-amber-700">Kies een organisatiegrootte.</p>
  )}
</div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">
            Aantal administraties / entiteiten{" "}
            <span className="kweekers-required">*</span>
          </label>
          <ChoiceCards
            options={ADMINISTRATION_OPTIONS}
            value={scan.profile.administrationCount}
            onChange={setAdministrationCount}
          />
          {!hasAdministrationCount && (
            <p className="text-sm text-amber-700">
              Kies het aantal administraties of entiteiten.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Samenvatting basis</h2>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>Klantnaam: {hasCustomerName ? scan.profile.customerName : "Nog leeg"}</div>
          <div>Sector: {getLabel(SECTOR_OPTIONS, scan.profile.sector)}</div>
          <div>
            Organisatiegrootte:{" "}
            {getLabel(SIZE_OPTIONS, scan.profile.organizationSize)}
          </div>
          <div>
            Administraties / entiteiten:{" "}
            {getLabel(
              ADMINISTRATION_OPTIONS,
              scan.profile.administrationCount
            )}
          </div>
        </div>
      </section>

      {!isBasisComplete && (
        <div className="kweekers-accent-box text-sm">
          Vul eerst alle verplichte velden in om verder te gaan naar aanleiding.
        </div>
      )}

      <div className="flex items-center justify-end border-t pt-6">
        {isBasisComplete ? (
          <Link
            href="/scan/nieuw/profile/aanleiding"
            className="kweekers-primary-button"
          >
            Verder naar aanleiding →
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center rounded-2xl border px-5 py-3 text-sm font-medium text-muted-foreground opacity-60"
          >
            Verder naar aanleiding →
          </span>
        )}
      </div>
    </div>
  );
}
