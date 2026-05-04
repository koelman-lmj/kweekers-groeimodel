"use client";

import Link from "next/link";
import { useScanContext, type ScanState } from "@/app/context/ScanContext";

const SECTOR_LABELS: Record<string, string> = {
  zorg: "Zorg",
  onderwijs: "Onderwijs",
  nonprofit: "Non-profit",
  commercieel: "Commercieel",
  overig: "Overig",
};

const SCOPE_LABELS: Record<string, string> = {
  smal: "Smal",
  normaal: "Normaal",
  breed: "Breed",
};

const DIAGNOSIS_LABELS: Record<string, string> = {
  onvoldoende_duidelijk: "Onvoldoende duidelijk",
  gedeeltelijk_duidelijk: "Gedeeltelijk duidelijk",
  duidelijk_belegd: "Duidelijk belegd",

  ad_hoc: "Ad hoc",
  deels_afgestemd: "Deels afgestemd",
  vast_proces: "Vast proces met duidelijke besluitvorming",

  nauwelijks: "Nauwelijks",
  af_en_toe: "Af en toe",
  structureel: "Structureel",

  sterk_verschillend: "Sterk verschillend per persoon of team",
  redelijk_eenduidig: "Redelijk eenduidig",
  gestandaardiseerd: "Overwegend gestandaardiseerd",

  uitzondering_is_norm: "Uitzonderingen zijn vaak de norm",
  deels_beheersbaar: "Regelmatig uitzonderingen, maar deels beheersbaar",
  beperkt_en_beheerst: "Uitzonderingen zijn beperkt en beheerst",

  handmatig_herstellen: "Vooral handmatig herstellen",
  mix_ad_hoc_structureel: "Soms structureel, soms ad hoc",
  meestal_structureel: "Meestal structureel opgelost",
};

function getSectorLabel(value: string) {
  return SECTOR_LABELS[value] || "Nog niet gekozen";
}

function getScopeLabel(value: string) {
  return SCOPE_LABELS[value] || "Nog niet gekozen";
}

function getDiagnosisLabel(value: string) {
  return DIAGNOSIS_LABELS[value] || "Nog niet gekozen";
}

function buildAdvice(scan: ScanState) {
  const customerName = scan.profile.customerName || "de klant";
  const sectorLabel = getSectorLabel(scan.profile.sector).toLowerCase();
  const scopeLabel = getScopeLabel(scan.scope);

  const {
    ownershipClarity,
    changeDecisionProcess,
    improvementGovernance,
    processStandardization,
    exceptionControl,
    issueResolution,
  } = scan.diagnosis;

  const lowSignals = [
    ownershipClarity === "onvoldoende_duidelijk",
    changeDecisionProcess === "ad_hoc",
    improvementGovernance === "nauwelijks",
    processStandardization === "sterk_verschillend",
    exceptionControl === "uitzondering_is_norm",
    issueResolution === "handmatig_herstellen",
  ].filter(Boolean).length;

  const midSignals = [
    ownershipClarity === "gedeeltelijk_duidelijk",
    changeDecisionProcess === "deels_afgestemd",
    improvementGovernance === "af_en_toe",
    processStandardization === "redelijk_eenduidig",
    exceptionControl === "deels_beheersbaar",
    issueResolution === "mix_ad_hoc_structureel",
  ].filter(Boolean).length;

  let title = "Gericht doorontwikkelen";
  let body =
    "De eerste diagnose laat zien dat er een basis aanwezig is. De volgende stap is gericht verbeteren en verder structureren.";

  if (lowSignals >= 4) {
    title = "Eerst stabiliseren";
    body =
      "Er zijn op meerdere onderdelen duidelijke basisproblemen zichtbaar. De eerste prioriteit ligt bij het stabieler maken van eigenaarschap, werkwijze en beheersing.";
  } else if (
    ownershipClarity === "onvoldoende_duidelijk" ||
    changeDecisionProcess === "ad_hoc"
  ) {
    title = "Governance versterken";
    body =
      "De grootste eerste winst zit in het scherper beleggen van eigenaarschap en besluitvorming rond processen en inrichting.";
  } else if (
    processStandardization === "sterk_verschillend" ||
    exceptionControl === "uitzondering_is_norm"
  ) {
    title = "Processen standaardiseren";
    body =
      "De organisatie lijkt nu te veel te leunen op verschillen in werkwijze en uitzonderingen. Meer standaardisatie is de logische eerste stap.";
  } else if (
    issueResolution === "handmatig_herstellen" ||
    improvementGovernance === "nauwelijks"
  ) {
    title = "Verbetercyclus opbouwen";
    body =
      "De organisatie lijkt nog te weinig structureel te verbeteren. De eerste stap is een ritme opbouwen voor opvolging, analyse en doorontwikkeling.";
  } else if (midSignals >= 3) {
    title = "Gericht verbeteren";
    body =
      "De basis is aanwezig, maar op meerdere onderdelen is aanscherping nodig om stabieler en consistenter te kunnen werken.";
  }

  const focusPoints: string[] = [];

  if (
    ownershipClarity === "onvoldoende_duidelijk" ||
    ownershipClarity === "gedeeltelijk_duidelijk"
  ) {
    focusPoints.push("Leg proceseigenaarschap en verantwoordelijkheden expliciet vast.");
  }

  if (
    changeDecisionProcess === "ad_hoc" ||
    changeDecisionProcess === "deels_afgestemd"
  ) {
    focusPoints.push("Maak wijzigingsverzoeken en besluitvorming voorspelbaar en eenduidig.");
  }

  if (
    processStandardization === "sterk_verschillend" ||
    processStandardization === "redelijk_eenduidig"
  ) {
    focusPoints.push("Breng de belangrijkste processen terug naar één herkenbare standaard werkwijze.");
  }

  if (
    exceptionControl === "uitzondering_is_norm" ||
    exceptionControl === "deels_beheersbaar"
  ) {
    focusPoints.push("Beperk uitzonderingen en maak afwijkingen expliciet beheersbaar.");
  }

  if (
    issueResolution === "handmatig_herstellen" ||
    issueResolution === "mix_ad_hoc_structureel"
  ) {
    focusPoints.push("Los terugkerende knelpunten structureel op in plaats van handmatig te blijven herstellen.");
  }

  if (
    improvementGovernance === "nauwelijks" ||
    improvementGovernance === "af_en_toe"
  ) {
    focusPoints.push("Richt een vast verbeter- en evaluatieritme in voor processen en inrichting.");
  }

  while (focusPoints.length > 3) {
    focusPoints.pop();
  }

  let guidance = `Voor ${customerName} in de sector ${sectorLabel} past nu het best een vervolgstap die aansluit op de gekozen scope: ${scopeLabel}.`;

  if (lowSignals >= 4) {
    guidance +=
      " De uitkomst wijst erop dat eerst de basis steviger moet worden gemaakt voordat verbreding of verdieping echt rendement geeft.";
  } else if (midSignals >= 3) {
    guidance +=
      " De uitkomst laat zien dat er al een basis is, maar dat meer structuur en beheersing nodig zijn om door te groeien in volwassenheid.";
  } else {
    guidance +=
      " De eerste diagnose geeft ruimte om gericht verder te verdiepen en door te ontwikkelen zonder eerst breed terug naar de basis te hoeven.";
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
            Eigenaarschap: {getDiagnosisLabel(scan.diagnosis.ownershipClarity)}
          </div>
          <div>
            Besluitvorming wijzigingen:{" "}
            {getDiagnosisLabel(scan.diagnosis.changeDecisionProcess)}
          </div>
          <div>
            Sturing op verbetering:{" "}
            {getDiagnosisLabel(scan.diagnosis.improvementGovernance)}
          </div>
          <div>
            Eenduidigheid werkwijze:{" "}
            {getDiagnosisLabel(scan.diagnosis.processStandardization)}
          </div>
          <div>
            Uitzonderingen: {getDiagnosisLabel(scan.diagnosis.exceptionControl)}
          </div>
          <div>
            Oplossen van knelpunten:{" "}
            {getDiagnosisLabel(scan.diagnosis.issueResolution)}
          </div>
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
            <li key={point} className="ml-5 list-disc">
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
          href="/scan/nieuw/summary/diagnose"
          className="rounded-2xl border px-4 py-2 text-sm shadow-sm"
        >
          Vorige
        </Link>

        <Link href="/scan/nieuw/summary/advies" className="kweekers-primary-button">
          Rapport afronden →
        </Link>
      </div>
    </div>
  );
}
