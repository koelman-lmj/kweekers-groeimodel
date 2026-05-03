"use client";

import Link from "next/link";
import { useScanContext } from "@/app/context/ScanContext";

function getAdviceByScope(scope: string) {
  switch (scope) {
    case "quickscan":
      return {
        title: "Compact vervolgadvies",
        summary:
          "De quickscan is geschikt om eerst de grootste knelpunten zichtbaar te maken en daarna pas gericht te verdiepen.",
        focus: [
          "Breng eerst de 3 belangrijkste knelpunten in kaart.",
          "Bepaal welke onderwerpen direct impact hebben op de dagelijkse praktijk.",
          "Kies daarna welke onderdelen een verdiepende scan nodig hebben.",
        ],
      };

    case "afas_optimalisatie":
      return {
        title: "AFAS-optimalisatie als hoofdrichting",
        summary:
          "De gekozen scope wijst erop dat de meeste waarde waarschijnlijk zit in het verbeteren van inrichting, gebruik en procesondersteuning binnen AFAS.",
        focus: [
          "Kijk naar workarounds en handmatige stappen buiten AFAS.",
          "Breng in beeld waar gebruikers afwijken van de gewenste standaardroute.",
          "Bepaal welke onderdelen van inrichting, workflow of rechten als eerste aandacht vragen.",
        ],
      };

    case "data_rapportage":
      return {
        title: "Data en rapportage als hoofdrichting",
        summary:
          "De gekozen scope wijst erop dat de meeste waarde waarschijnlijk zit in KPI-definities, stuurinformatie en betrouwbaarheid van rapportages.",
        focus: [
          "Maak duidelijk welke cijfers echt leidend moeten zijn.",
          "Breng verschillen tussen rapportages en definities in kaart.",
          "Bepaal welke dashboards, exports of KPI’s als eerste verbeterd moeten worden.",
        ],
      };

    case "volledige_scan":
    default:
      return {
        title: "Brede integrale scan",
        summary:
          "De gekozen scope past bij een brede analyse van organisatie, processen, AFAS-gebruik, data en beheer.",
        focus: [
          "Start met het gezamenlijke beeld van de huidige situatie.",
          "Breng per hoofdonderwerp de belangrijkste GAP’s in kaart.",
          "Werk daarna per onderdeel toe naar gerichte verbeteracties en prioriteiten.",
        ],
      };
  }
}

export default function AdvicePage() {
  const { scan } = useScanContext();

  const advice = getAdviceByScope(scan.scope);
  const customerName = scan.profile.customerName || "Onbekende klant";
  const sector = scan.profile.sector || "Nog niet ingevuld";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Stap 4 van 4</p>
        <h1 className="text-3xl font-semibold tracking-tight">Advies</h1>
        <p className="text-sm text-muted-foreground">
          Dit is de eerste eenvoudige adviespagina van de app.
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Samenvatting</h2>
        <div className="text-sm text-muted-foreground">
          <div>Klantnaam: {customerName}</div>
          <div>Sector: {sector}</div>
          <div>Scope: {scan.scope || "Nog leeg"}</div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">{advice.title}</h2>
        <p className="text-sm text-muted-foreground">{advice.summary}</p>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Eerste focuspunten</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {advice.focus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Eerste duiding</h2>
        <p className="text-sm text-muted-foreground">
          Voor {customerName} in de sector {sector.toLowerCase()} lijkt de
          gekozen richting nu vooral geschikt om de volgende fase van het
          groeimodel scherper en gerichter op te bouwen.
        </p>
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
