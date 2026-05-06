import type { ScanState } from "@/app/context/ScanContext";

type DomainScore = {
  code: string;
  title: string;
  score: number;
  label: string;
  summary: string;
};

function toScore(value: string): number {
  const scoreMap: Record<string, number> = {
    onvoldoende_duidelijk: 1,
    gedeeltelijk_duidelijk: 2,
    duidelijk_belegd: 3,

    ad_hoc: 1,
    deels_afgestemd: 2,
    vast_proces: 3,

    nauwelijks: 1,
    af_en_toe: 2,
    structureel: 3,

    sterk_verschillend: 1,
    redelijk_eenduidig: 2,
    gestandaardiseerd: 3,

    uitzondering_is_norm: 1,
    deels_beheersbaar: 2,
    beperkt_en_beheerst: 3,

    handmatig_herstellen: 1,
    mix_ad_hoc_structureel: 2,
    meestal_structureel: 3,
  };

  return scoreMap[value] ?? 0;
}

function toLabel(score: number): string {
  if (score >= 2.5) return "Beheerst";
  if (score >= 2.0) return "In opbouw";
  if (score >= 1.5) return "Basis aanwezig";
  return "Kwetsbaar";
}

function average(scores: number[]): number {
  const validScores = scores.filter((score) => score > 0);
  if (validScores.length === 0) return 0;

  const total = validScores.reduce((sum, score) => sum + score, 0);
  return Number((total / validScores.length).toFixed(1));
}

function buildSummary(title: string, label: string): string {
  if (title === "Eigenaarschap & governance") {
    if (label === "Kwetsbaar") {
      return "Eigenaarschap, besluitvorming en verbetersturing zijn nog onvoldoende stevig georganiseerd.";
    }
    if (label === "Basis aanwezig") {
      return "Er is een begin van eigenaarschap en governance, maar de basis is nog niet overal stabiel.";
    }
    if (label === "In opbouw") {
      return "Eigenaarschap en besluitvorming zijn herkenbaar ingericht, maar kunnen nog strakker worden georganiseerd.";
    }
    return "Eigenaarschap, besluitvorming en verbetersturing zijn overwegend goed ingericht.";
  }

  if (title === "Processen & werkwijze") {
    if (label === "Kwetsbaar") {
      return "De uitvoering is nog onvoldoende gestandaardiseerd en uitzonderingen vragen veel aandacht.";
    }
    if (label === "Basis aanwezig") {
      return "De werkwijze kent een basis, maar is nog niet overal eenduidig en beheerst.";
    }
    if (label === "In opbouw") {
      return "Processen zijn redelijk gestandaardiseerd, met nog ruimte om uitzonderingen verder terug te brengen.";
    }
    return "De belangrijkste processen worden overwegend eenduidig en beheerst uitgevoerd.";
  }

  if (title === "Verbetervermogen & sturing") {
    if (label === "Kwetsbaar") {
      return "Terugkerende knelpunten worden nog te weinig structureel opgelost en verbetering wordt beperkt aangestuurd.";
    }
    if (label === "Basis aanwezig") {
      return "Er is aandacht voor verbeteren, maar opvolging en structurele borging zijn nog niet sterk genoeg.";
    }
    if (label === "In opbouw") {
      return "Verbetering wordt steeds meer structureel aangepakt, met nog ruimte voor strakkere opvolging.";
    }
    return "De organisatie laat zien dat knelpunten structureel worden opgepakt en verbetering actief wordt gestuurd.";
  }

  return "";
}

export function buildDomainScores(scan: ScanState): DomainScore[] {
  const governanceScore = average([
    toScore(scan.diagnosis.ownershipClarity),
    toScore(scan.diagnosis.changeDecisionProcess),
    toScore(scan.diagnosis.improvementGovernance),
  ]);

  const processScore = average([
    toScore(scan.diagnosis.processStandardization),
    toScore(scan.diagnosis.exceptionControl),
  ]);

  const improvementScore = average([
    toScore(scan.diagnosis.issueResolution),
    toScore(scan.diagnosis.improvementGovernance),
  ]);

  const domains = [
    {
      code: "governance",
      title: "Eigenaarschap & governance",
      score: governanceScore,
    },
    {
      code: "processes",
      title: "Processen & werkwijze",
      score: processScore,
    },
    {
      code: "improvement",
      title: "Verbetervermogen & sturing",
      score: improvementScore,
    },
  ];

  return domains.map((domain) => {
    const label = toLabel(domain.score);

    return {
      ...domain,
      label,
      summary: buildSummary(domain.title, label),
    };
  });
}
