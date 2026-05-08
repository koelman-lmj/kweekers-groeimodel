import type { ScanState } from "@/app/context/ScanContext";

export type ScanContextSummary = {
  bottleneckLines: string[];
  focusLines: string[];
  productLines: string[];
};

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function buildScanContextSummary(
  scan: ScanState
): ScanContextSummary {
  const bottleneckLines: string[] = [];
  const focusLines: string[] = [];
  const productLines: string[] = [];

  const bottlenecks = scan.profile.biggestBottleneck;
  const focusAreas = scan.scope.focus;
  const afasProducts = scan.profile.afasProducts;

  // Knelpunten
  if (bottlenecks.includes("processen")) {
    bottleneckLines.push(
      "De scan laat zien dat er duidelijke frictie zit in de procesuitvoering en de manier waarop werk in de praktijk verloopt."
    );
    bottleneckLines.push(
      "Dat wijst op behoefte aan meer standaardisatie, minder verschillen in werkwijze en meer beheersing van uitzonderingen."
    );
  }

  if (bottlenecks.includes("eigenaarschap")) {
    bottleneckLines.push(
      "Verantwoordelijkheden en besluitvorming vragen extra aandacht binnen de huidige situatie."
    );
    bottleneckLines.push(
      "De uitkomst wijst op behoefte aan scherper proceseigenaarschap en duidelijkere rolverdeling."
    );
  }

  if (bottlenecks.includes("afas")) {
    bottleneckLines.push(
      "De inrichting en het gebruik van AFAS lijken niet overal goed aan te sluiten op de gewenste werkwijze."
    );
    bottleneckLines.push(
      "Daarmee ligt er waarschijnlijk winst in standaardinrichting, workflow en procesondersteuning."
    );
  }

  if (bottlenecks.includes("rapportage")) {
    bottleneckLines.push(
      "Stuurinformatie en rapportage lijken nu onvoldoende te ondersteunen in dagelijkse of bestuurlijke sturing."
    );
    bottleneckLines.push(
      "Dat wijst op behoefte aan scherpere KPI’s, betere databronnen en duidelijkere rapportageafspraken."
    );
  }

  if (bottlenecks.includes("data_integraties")) {
    bottleneckLines.push(
      "Knelpunten lijken ook te zitten in gegevenskwaliteit of in de samenwerking tussen systemen."
    );
    bottleneckLines.push(
      "Dat vraagt aandacht voor datastromen, definities en integratie-afspraken."
    );
  }

  if (bottlenecks.includes("adoptie")) {
    bottleneckLines.push(
      "De uitdaging zit niet alleen in proces of systeem, maar ook in gebruik, discipline en borging."
    );
    bottleneckLines.push(
      "Dat wijst op aandacht voor adoptie, werkafspraken en veranderkracht."
    );
  }

  // Focusgebieden
  if (focusAreas.includes("organisatie_eigenaarschap")) {
    focusLines.push(
      "De scan is nadrukkelijk gericht op governance, eigenaarschap en verantwoordelijkheden."
    );
    focusLines.push(
      "Daardoor wegen besluitvorming en rolverdeling zwaarder mee in de duiding."
    );
  }

  if (focusAreas.includes("processen_werkwijze")) {
    focusLines.push(
      "De scan is vooral gericht op de manier waarop processen in de praktijk lopen."
    );
    focusLines.push(
      "Dat legt extra nadruk op standaardisatie, uitzonderingen en uitvoerbaarheid."
    );
  }

  if (focusAreas.includes("afas_inrichting_gebruik")) {
    focusLines.push(
      "De scan kijkt expliciet naar de aansluiting tussen proces en AFAS-inrichting."
    );
    focusLines.push(
      "Daarmee zijn systeemondersteuning, workflow en inrichting een belangrijk deel van de uitkomst."
    );
  }

  if (focusAreas.includes("rapportage_sturing")) {
    focusLines.push(
      "De scan is mede gericht op stuurinformatie, inzicht en bestuurlijke grip."
    );
    focusLines.push(
      "Daardoor tellen datakwaliteit, rapportage en KPI-ondersteuning zwaarder mee in de duiding."
    );
  }

  if (focusAreas.includes("beheer_doorontwikkeling")) {
    focusLines.push(
      "De scan kijkt ook naar het vermogen om inrichting en processen structureel te beheren en door te ontwikkelen."
    );
    focusLines.push(
      "Dat legt extra nadruk op borging, opvolging en continu verbeteren."
    );
  }

  // AFAS-producten
  if (afasProducts.includes("financieel")) {
    productLines.push(
      "Financiële processen en sturing zijn relevant in deze scan."
    );
    productLines.push(
      "Denk daarbij aan administratie, uitzonderingen, autorisatie en rapportage."
    );
  }

  if (afasProducts.includes("ordermanagement")) {
    productLines.push(
      "Orderprocessen en de aansluiting op facturatie of uitvoering spelen een rol in de verbeteropgave."
    );
    productLines.push(
      "Dat maakt standaardroutes, uitzonderingen en procesbeheersing extra belangrijk."
    );
  }

  if (afasProducts.includes("inkoop")) {
    productLines.push(
      "Inkoopstromen zijn relevant in deze scan."
    );
    productLines.push(
      "Denk daarbij aan bestelproces, goedkeuring, factuurverwerking en afwijkingen."
    );
  }

  if (afasProducts.includes("projecten")) {
    productLines.push(
      "Projectmatige sturing en registratie spelen waarschijnlijk mee in de verbeteropgave."
    );
    productLines.push(
      "Dan zijn eigenaarschap, voortgang, uren en stuurinformatie vaak belangrijke thema’s."
    );
  }

  if (afasProducts.includes("crm")) {
    productLines.push(
      "Commerciële processen en klantgericht werken kunnen onderdeel zijn van de verbeteropgave."
    );
    productLines.push(
      "Denk aan relatiebeheer, leadopvolging en overdracht naar uitvoering."
    );
  }

  if (afasProducts.includes("hrm") || afasProducts.includes("payroll")) {
    productLines.push(
      "HR-processen en mutatiestromen zijn relevant in deze scan."
    );
    productLines.push(
      "Dan zijn workflow, eigenaarschap, self service en procesdiscipline belangrijke aandachtspunten."
    );
  }

  if (afasProducts.includes("workflow")) {
    productLines.push(
      "De inzet van workflow is relevant voor de mate van standaardisatie en beheersing."
    );
    productLines.push(
      "Dat maakt besluitvorming, opvolging en inrichting extra belangrijk."
    );
  }

  if (afasProducts.includes("rapportage_dashboards")) {
    productLines.push(
      "De behoefte aan stuurinformatie en inzicht is expliciet relevant binnen deze scan."
    );
    productLines.push(
      "Dat vraagt aandacht voor definities, datakwaliteit en gebruik van rapportages."
    );
  }

  if (afasProducts.includes("integraties")) {
    productLines.push(
      "De scan raakt ook de samenwerking tussen AFAS en andere systemen."
    );
    productLines.push(
      "Daarmee worden afhankelijkheden in de keten extra belangrijk."
    );
  }

  return {
    bottleneckLines: unique(bottleneckLines),
    focusLines: unique(focusLines),
    productLines: unique(productLines),
  };
}
