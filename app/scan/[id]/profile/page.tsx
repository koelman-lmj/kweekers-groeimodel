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

const SIZE_OPTIONS = [
  { value: "", label: "Kies een grootte" },
  { value: "1-25", label: "1–25 medewerkers" },
  { value: "26-100", label: "26–100 medewerkers" },
  { value: "101-250", label: "101–250 medewerkers" },
  { value: "251-500", label: "251–500 medewerkers" },
  { value: "500+", label: "500+ medewerkers" },
];

const ADMINISTRATION_OPTIONS = [
  { value: "", label: "Kies aantal administraties" },
  { value: "1", label: "1" },
  { value: "2-3", label: "2–3" },
  { value: "4-10", label: "4–10" },
  { value: "10+", label: "10+" },
];

const REASON_OPTIONS = [
  { value: "", label: "Kies een aanleiding" },
  { value: "nulmeting", label: "Nulmeting" },
  { value: "optimalisatie", label: "Optimalisatie" },
  { value: "herinrichting", label: "Herinrichting" },
  { value: "rapportage", label: "Rapportage & sturing" },
  { value: "procesverbetering", label: "Procesverbetering" },
  { value: "verandering", label: "Voorbereiding op verandering" },
  { value: "overig", label: "Overig" },
];

const GOAL_OPTIONS = [
  { value: "", label: "Kies een hoofddoel" },
  { value: "inzicht", label: "Inzicht in huidige situatie" },
  { value: "verbeterkansen", label: "Verbeterkansen bepalen" },
  { value: "roadmap", label: "Prioriteiten voor roadmap bepalen" },
  { value: "herinrichting", label: "Herinrichting voorbereiden" },
  { value: "standaardiseren", label: "Meer standaardiseren" },
  { value: "rapportage", label: "Betere sturing en rapportage" },
];

const BOTTLENECK_OPTIONS = [
  { value: "", label: "Kies grootste knelpunt" },
  { value: "processen", label: "Processen" },
  { value: "afas", label: "Inrichting AFAS" },
  { value: "rapportage", label: "Rapportage en stuurinformatie" },
  { value: "eigenaarschap", label: "Eigenaarschap en verantwoordelijkheden" },
  { value: "data", label: "Datakwaliteit" },
  { value: "integraties", label: "Integraties en keten" },
  { value: "beheer", label: "Beheer en doorontwikkeling" },
  { value: "adoptie", label: "Adoptie en gebruik" },
];

const AFAS_MODULE_OPTIONS = [
  { value: "financieel", label: "Financieel" },
  { value: "hrm-payroll", label: "HRM / Payroll" },
  { value: "crm", label: "CRM" },
  { value: "projecten", label: "Projecten" },
  { value: "ordermanagement", label: "Ordermanagement" },
  { value: "inkoop", label: "Inkoop" },
  { value: "insite-outsite", label: "InSite / OutSite" },
  { value: "abonnementen", label: "Abonnementen" },
  { value: "overig", label: "Overig" },
];

function getLabel(
  options: { value: string; label: string }[],
  value: string
): string {
  return options.find((option) => option.value === value)?.label || "Nog niet gekozen";
}

export default function ProfilePage() {
  const {
    scan,
    setCustomerName,
    setSector,
    setOrganizationSize,
    setAdministrationCount,
    setScanReason,
    setScanGoal,
    setMainBottleneck,
    toggleAfasModule,
    setContextNote,
  } = useScanContext();

  const hasCustomerName = scan.profile.customerName.trim() !== "";
  const hasSector = scan.profile.sector !== "";
  const hasOrganizationSize = scan.profile.organizationSize !== "";
  const hasAdministrationCount = scan.profile.administrationCount !== "";
  const hasScanReason = scan.profile.scanReason !== "";
  const hasScanGoal = scan.profile.scanGoal !== "";
  const hasMainBottleneck = scan.profile.mainBottleneck !== "";
  const hasAfasModules = scan.profile.afasModules.length > 0;

  const isProfileComplete =
    hasCustomerName &&
    hasSector &&
    hasOrganizationSize &&
    hasAdministrationCount &&
    hasScanReason &&
    hasScanGoal &&
    hasMainBottleneck &&
    hasAfasModules;

  const invalidInputClass =
    "w-full rounded-2xl border border-amber-400 bg-amber-50 px-4 py-3 outline-none";

  const validInputClass =
    "w-full rounded-2xl border bg-white px-4 py-3 outline-none";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Stap 1 van 4</p>
        <h1 className="text-3xl font-semibold tracking-tight">Klantprofiel</h1>
        <p className="text-sm text-muted-foreground">
          Vul eerst de basis en context van de organisatie in.
        </p>
      </div>

      <section className="space-y-5 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Basis</h2>

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

        <div className="space-y-2">
          <label htmlFor="sector" className="text-sm font-medium">
            Sector <span className="kweekers-required">*</span>
          </label>
          <select
            id="sector"
            value={scan.profile.sector}
            onChange={(event) => setSector(event.target.value)}
            className={hasSector ? validInputClass : invalidInputClass}
          >
            {SECTOR_OPTIONS.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {!hasSector && (
            <p className="text-sm text-amber-700">Sector is verplicht.</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="organizationSize" className="text-sm font-medium">
            Organisatiegrootte <span className="kweekers-required">*</span>
          </label>
          <select
            id="organizationSize"
            value={scan.profile.organizationSize}
            onChange={(event) => setOrganizationSize(event.target.value)}
            className={hasOrganizationSize ? validInputClass : invalidInputClass}
          >
            {SIZE_OPTIONS.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {!hasOrganizationSize && (
            <p className="text-sm text-amber-700">
              Organisatiegrootte is verplicht.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="administrationCount" className="text-sm font-medium">
            Aantal administraties / entiteiten{" "}
            <span className="kweekers-required">*</span>
          </label>
          <select
            id="administrationCount"
            value={scan.profile.administrationCount}
            onChange={(event) => setAdministrationCount(event.target.value)}
            className={hasAdministrationCount ? validInputClass : invalidInputClass}
          >
            {ADMINISTRATION_OPTIONS.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {!hasAdministrationCount && (
            <p className="text-sm text-amber-700">
              Aantal administraties is verplicht.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Aanleiding en focus</h2>

        <div className="space-y-2">
          <label htmlFor="scanReason" className="text-sm font-medium">
            Aanleiding van de scan <span className="kweekers-required">*</span>
          </label>
          <select
            id="scanReason"
            value={scan.profile.scanReason}
            onChange={(event) => setScanReason(event.target.value)}
            className={hasScanReason ? validInputClass : invalidInputClass}
          >
            {REASON_OPTIONS.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {!hasScanReason && (
            <p className="text-sm text-amber-700">
              Aanleiding van de scan is verplicht.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="scanGoal" className="text-sm font-medium">
            Hoofddoel van deze scan <span className="kweekers-required">*</span>
          </label>
          <select
            id="scanGoal"
            value={scan.profile.scanGoal}
            onChange={(event) => setScanGoal(event.target.value)}
            className={hasScanGoal ? validInputClass : invalidInputClass}
          >
            {GOAL_OPTIONS.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {!hasScanGoal && (
            <p className="text-sm text-amber-700">
              Hoofddoel van de scan is verplicht.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="mainBottleneck" className="text-sm font-medium">
            Grootste knelpunt op dit moment{" "}
            <span className="kweekers-required">*</span>
          </label>
          <select
            id="mainBottleneck"
            value={scan.profile.mainBottleneck}
            onChange={(event) => setMainBottleneck(event.target.value)}
            className={hasMainBottleneck ? validInputClass : invalidInputClass}
          >
            {BOTTLENECK_OPTIONS.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {!hasMainBottleneck && (
            <p className="text-sm text-amber-700">
              Grootste knelpunt is verplicht.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Context</h2>

        <div className="space-y-3">
          <label className="text-sm font-medium">
            AFAS-onderdelen in gebruik <span className="kweekers-required">*</span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {AFAS_MODULE_OPTIONS.map((option) => {
              const isActive = scan.profile.afasModules.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleAfasModule(option.value)}
                  className={
                    isActive
                      ? "kweekers-active-panel rounded-2xl border px-4 py-3 text-left transition"
                      : "kweekers-selectable-hover rounded-2xl border bg-white px-4 py-3 text-left transition"
                  }
                >
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              );
            })}
          </div>

          {!hasAfasModules && (
            <p className="text-sm text-amber-700">
              Kies minimaal één AFAS-onderdeel.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="contextNote" className="text-sm font-medium">
            Korte toelichting / context
          </label>
          <textarea
            id="contextNote"
            value={scan.profile.contextNote}
            onChange={(event) => setContextNote(event.target.value)}
            placeholder="Beschrijf kort de aanleiding, situatie of belangrijkste aandachtspunten."
            rows={4}
            className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Controle</h2>
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
          <div>
            Aanleiding: {getLabel(REASON_OPTIONS, scan.profile.scanReason)}
          </div>
          <div>
            Hoofddoel: {getLabel(GOAL_OPTIONS, scan.profile.scanGoal)}
          </div>
          <div>
            Grootste knelpunt:{" "}
            {getLabel(BOTTLENECK_OPTIONS, scan.profile.mainBottleneck)}
          </div>
          <div>
            AFAS-onderdelen:{" "}
            {hasAfasModules
              ? scan.profile.afasModules
                  .map(
                    (value) =>
                      AFAS_MODULE_OPTIONS.find((option) => option.value === value)
                        ?.label || value
                  )
                  .join(", ")
              : "Nog niet gekozen"}
          </div>
          <div>
            Toelichting:{" "}
            {scan.profile.contextNote.trim() !== ""
              ? scan.profile.contextNote
              : "Geen toelichting toegevoegd"}
          </div>
        </div>
      </section>

      {!isProfileComplete && (
        <div className="kweekers-accent-box text-sm">
          Vul eerst alle verplichte velden in om verder te gaan naar scope.
        </div>
      )}

      <div className="flex items-center justify-end border-t pt-6">
        {isProfileComplete ? (
          <Link href="/scan/nieuw/scope" className="kweekers-primary-button">
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
