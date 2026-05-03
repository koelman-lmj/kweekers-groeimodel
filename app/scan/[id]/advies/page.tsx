"use client";

import Link from "next/link";
import { useScanContext } from "@/app/context/ScanContext";

const SECTOR_LABELS: Record<string, string> = {
  zorg: "Zorg",
  onderwijs: "Onderwijs",
  nonprofit: "Non-profit",
  commercieel: "Commercieel",
  overig: "Overig",
};

const SCOPE_LABELS: Record<string, string> = {
  volledige_scan: "Volledige scan",
  quickscan: "Quickscan",
  afas_optimalisatie: "AFAS-optimalisatie",
  data_rapportage: "Data & rapportage",
};

const ANSWER_LABELS: Record<string, string> = {
  ja: "Ja",
  deels: "Deels",
  nee: "Nee",
};

function getSectorLabel(value: string) {
  return SECTOR_LABELS[value] || "Nog niet gekozen";
}

function getScopeLabel(value: string) {
  return SCOPE_LABELS[value] || "Nog niet gekozen";
}

function getAnswerLabel(value: string) {
  return ANSWER_LABELS[value] || "Nog niet gekozen";
}

function buildAdvice(scan: {
  profile: { customerName: string; sector: string };
  scope: string;
  diagnosis: {
    ownership: string;
    afasUsage: string;
    reporting: string;
  };
}) {
  const customerName = scan.profile.customerName || "de klant";
  const sectorLabel = getSectorLabel(scan.profile.sector).toLowerCase();
  const scopeLabel = getScopeLabel(scan.scope);

  const { ownership, afasUsage, reporting } = scan.diagnosis;

  const noCount = [ownership, afasUsage, reporting].filter(
    (value) => value === "nee"
  ).length;

  const partialCount = [ownership, afasUsage, reporting].filter(
    (value) => value === "deels"
  ).length;

  let title = "Gericht doorontwikkelen";
  let body =
    "De basis oogt redelijk stevig. De volgende stap is selectief doorontwikkelen.";

  if (reporting === "nee") {
    title = "Eerst grip op data";
    body =
      "Rapportage en stuurinformatie lijken nu de belangrijkste bron van frictie.";
  } else if (afasUsage === "nee") {
    title = "Eerst standaardiseren";
    body =
      "AFAS lijkt nog niet overal de duidelijke standaardroute te zijn.";
  } else if (ownership === "nee") {
    title = "Eerst eigenaarschap aanscherpen";
    body =
      "Procesverantwoordelijkheden en besluitvorming lijken nog te weinig helder belegd.";
  } else if (noCount >= 2) {
    title = "Eerst stabiliseren";
    body =
      "Er zijn op meerdere onderdelen duidelijke basisproblemen zichtbaar die eerst gestabiliseerd moeten worden.";
  } else if (partialCount >= 2) {
    title = "Gericht verbeteren";
    body =
      "Er is een basis, maar op meerdere onderdelen is nog aanscherping nodig om stabiel te kunnen sturen.";
  } else if (ownership === "ja" && afasUsage === "ja" && reporting === "ja") {
    title = "Hoofdbevinding";
    body =
      "De eerste diagnose laat geen direct groot basisprobleem zien. De organisatie lijkt voldoende basis te hebben om gericht door te ontwikkelen.";
  }

  const focusPoints: string[] = [];

  if (scan.scope === "quickscan") {
    focusPoints.push("Breng eerst de 3 belangrijkste knelpunten per onderwerp in beeld.");
  }

  if (scan.scope === "volledige_scan") {
    focusPoints.push("Werk per domein toe naar een concreet verbeterplan met prioriteiten.");
  }

  if (scan.scope === "afas_optimalisatie") {
    focusPoints.push("Bepaal waar AFAS nog niet de standaardroute is en waarom dat gebeurt.");
  }

  if (scan.scope === "data_rapportage") {
    focusPoints.push("Maak KPI-definities, databronnen en rapportageverantwoordelijkheid expliciet.");
  }

  if (ownership === "nee" || ownership === "deels") {
    focusPoints.push("Leg proceseigenaarschap en besluitvorming duidelijker vast.");
  }

  if (afasUsage === "nee" || afasUsage === "deels") {
    focusPoints.push("Breng workarounds en nevenlijstjes in kaart en vervang die stap voor stap.");
  }

  if (reporting === "nee" || reporting === "deels") {
    focusPoints.push("Verminder afhankelijkheid van handmatig werk in rapportages en stuurinformatie.");
  }

  while (focusPoints.length > 3) {
    focusPoints.pop();
  }

  let guidance = `Voor ${customerName} in de sector ${sectorLabel} past nu het best een vervolgstap die aansluit op de gekozen scope: ${scopeLabel}.`;

  if (noCount >= 2) {
    guidance +=
      " De uitkomst wijst erop dat eerst de basis stabieler moet worden gemaakt voordat verbreding echt waarde toevoegt.";
  } else if (partialCount >= 2) {
    guidance +=
      " De uitkomst laat zien dat er al een basis aanwezig is, maar dat meer scherpte nodig is op proces, gebruik of sturing.";
  } else {
    guidance +=
      " De eerste diagnose geeft ruimte om gericht te verdiepen in plaats van breed opnieuw te beginnen.";
  }

  return {
    title,
    body,
    focusPoints,
    guidance,
    scopeLabel,
  };
}

export default function AdviesPage() {
  const { scan } = useScanContext();

  const advice = buildAdvice(scan);

  return (
    <div className="space-y-8">
<div className="space-y-3">
  <div className="inline-flex rounded-full border px-3 py-1 text-xs font-medium">
    Eerste adviesrapport
  </div>
  <p className="text-sm text-muted-foreground">Stap 4 van 4</p>
  <h1 className="text-3xl font-semibold tracking-tight">Adviesrapport</h1>
  <p className="text-sm text-muted-foreground">
    Dit rapport geeft een eerste inhoudelijke duiding op basis van
    klantprofiel, gekozen scope en diagnose-antwoorden.
  </p>
</div>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Managementsamenvatting</h2>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>Klantnaam: {scan.profile.customerName || "Nog leeg"}</div>
          <div>Sector: {getSectorLabel(scan.profile.sector)}</div>
          <div>Scope: {advice.scopeLabel}</div>
          <div>
            Proceseigenaarschap: {getAnswerLabel(scan.diagnosis.ownership)}
          </div>
          <div>
            AFAS als standaard: {getAnswerLabel(scan.diagnosis.afasUsage)}
          </div>
          <div>Rapportage: {getAnswerLabel(scan.diagnosis.reporting)}</div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">{advice.title}</h2>
        <p className="text-sm text-muted-foreground">{advice.body}</p>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Aanbevolen focuspunten</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {advice.focusPoints.map((point) => (
            <li key={point} className="list-disc ml-5">
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Conclusie</h2>
        <p className="text-sm text-muted-foreground">{advice.guidance}</p>
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
          className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          Scan afronden →
        </Link>
      </div>
    </div>
  );
}
