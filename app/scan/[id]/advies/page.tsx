"use client";

import Link from "next/link";
import { useScanContext } from "@/app/context/ScanContext";

function getSectorLabel(value: string) {
  const map: Record<string, string> = {
    zorg: "Zorg",
    onderwijs: "Onderwijs",
    nonprofit: "Non-profit",
    commercieel: "Commercieel",
    overig: "Overig",
  };

  return map[value] || "Nog niet gekozen";
}

function getScopeLabel(value: string) {
  const map: Record<string, string> = {
    volledige_scan: "Volledige scan",
    quickscan: "Quickscan",
    afas_optimalisatie: "AFAS-optimalisatie",
    data_rapportage: "Data & rapportage",
  };

  return map[value] || value || "Nog niet gekozen";
}

function buildAdvice(scan: ReturnType<typeof useScanContext>["scan"]) {
  const answers = [
    scan.diagnosis.ownership,
    scan.diagnosis.afasUsage,
    scan.diagnosis.reporting,
  ];

  const noCount = answers.filter((value) => value === "nee").length;
  const partialCount = answers.filter((value) => value === "deels").length;

  if (answers.some((value) => value === "")) {
    return {
      title: "Nog niet compleet",
      compactAdvice:
        "Vul eerst alle diagnosevragen in voor een scherper eerste advies.",
      focusPoints: [
        "Maak eerst de 3 diagnoseantwoorden compleet.",
        "Controleer daarna of het beeld logisch voelt.",
        "Gebruik pas daarna de adviesrichting als eerste duiding.",
      ],
      explanation:
        "De diagnose is nog niet volledig ingevuld. Daardoor blijft het advies nu bewust voorzichtig.",
    };
  }

  if (noCount >= 2) {
    return {
      title: "Eerst stabiliseren",
      compactAdvice:
        "De basis in eigenaarschap, werkwijze of sturing vraagt eerst rust en duidelijkheid.",
      focusPoints: [
        "Maak duidelijk wie eigenaar is van de belangrijkste processen.",
        "Breng de grootste afwijkingen van de standaard werkwijze in beeld.",
        "Beperk eerst handmatig herstel en losse uitzonderingen.",
      ],
      explanation:
        "Er zijn meerdere signalen dat de basis nog niet stevig genoeg staat. Daarom is stabiliseren nu verstandiger dan direct verder uitbouwen.",
    };
  }

  if (scan.diagnosis.reporting === "nee") {
    return {
      title: "Eerst grip op data",
      compactAdvice:
        "Rapportage en stuurinformatie lijken nu de belangrijkste rem op verdere groei.",
      focusPoints: [
        "Maak KPI-definities en rapportageafspraken duidelijk.",
        "Breng handmatige rapportages en Excel-afhankelijkheid terug.",
        "Bepaal welke informatie echt leidend moet zijn voor sturing.",
      ],
      explanation:
        "De grootste winst lijkt nu te zitten in betere stuurinformatie en minder afhankelijkheid van handmatige rapportage.",
    };
  }

  if (scan.diagnosis.afasUsage !== "ja") {
    return {
      title: "Eerst standaardiseren",
      compactAdvice:
        "AFAS lijkt nog niet overal de duidelijke standaardroute te zijn.",
      focusPoints: [
        "Breng workarounds en nevenlijstjes in kaart.",
        "Maak de gewenste standaardroute expliciet.",
        "Kies welke uitzonderingen echt nodig zijn en welke niet.",
      ],
      explanation:
        "De organisatie lijkt baat te hebben bij een duidelijkere en meer eenduidige werkwijze voordat verdere verdieping echt waarde oplevert.",
    };
  }

  if (partialCount >= 2) {
    return {
      title: "Gericht verbeteren",
      compactAdvice:
        "De basis staat, maar meerdere onderdelen vragen nog gerichte aanscherping.",
      focusPoints: [
        "Bepaal welke 2 of 3 verbeterpunten het meeste effect hebben.",
        "Werk die eerst concreet uit per proces of onderwerp.",
        "Voorkom dat te veel verbeteringen tegelijk open blijven staan.",
      ],
      explanation:
        "Er is al een werkbare basis, maar het beeld laat nog genoeg ruimte zien voor gerichte verbetering.",
    };
  }

  return {
    title: "Gericht doorontwikkelen",
    compactAdvice:
      "De basis oogt behoorlijk stevig. De volgende stap is selectief doorontwikkelen.",
    focusPoints: [
      "Kies gerichte vervolgstappen per scope of onderwerp.",
      "Werk verbeteringen uit die echt waarde toevoegen voor de klant.",
      "Gebruik de diagnose als basis voor een concreter implementatie- of verbeterplan.",
    ],
    explanation:
      "De eerste diagnose laat geen groot basisprobleem zien. Daardoor is het logisch om gericht verder te bouwen.",
  };
}

export default function AdviesPage() {
  const { scan } = useScanContext();
  const advice = buildAdvice(scan);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Stap 4 van 4</p>
        <h1 className="text-3xl font-semibold tracking-tight">Advies</h1>
        <p className="text-sm text-muted-foreground">
          Dit is de eerste inhoudelijke adviespagina van de app.
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Samenvatting</h2>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Klantnaam: {scan.profile.customerName || "Nog leeg"}</div>
          <div>Sector: {getSectorLabel(scan.profile.sector)}</div>
          <div>Scope: {getScopeLabel(scan.scope)}</div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">{advice.title}</h2>
        <p className="text-sm text-muted-foreground">{advice.compactAdvice}</p>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Eerste focuspunten</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {advice.focusPoints.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Eerste duiding</h2>
        <p className="text-sm text-muted-foreground">
          Voor {scan.profile.customerName || "deze klant"} in de sector{" "}
          {getSectorLabel(scan.profile.sector).toLowerCase()} lijkt de gekozen
          richting nu vooral geschikt om de volgende fase van het groeimodel
          scherper en gerichter op te bouwen.
        </p>
        <p className="text-sm text-muted-foreground">{advice.explanation}</p>
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
