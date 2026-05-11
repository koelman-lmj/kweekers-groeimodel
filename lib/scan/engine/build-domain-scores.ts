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

    kwetsbaar: 1,
    redelijk: 2,
    sterk: 3,

    beperkt_bruikbaar: 1,
    deels_bruikbaar: 2,
    goed_bruikbaar: 3,

    sluit_beperkt_aan: 1,
    sluit_deels_aan: 2,
    sluit_goed_aan: 3,

    vooral_handmatig: 1,
    goed_beheerst: 3,
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

  if (title === "Financieel") {
    if (label === "Kwetsbaar") {
      return "De financiële basis en verwerking vragen nog veel aandacht en zijn nog te kwetsbaar voor betrouwbare sturing.";
    }
    if (label === "Basis aanwezig") {
      return "De financiële basis is aanwezig, maar uitzonderingen en rapportage beperken nog de bruikbaarheid.";
    }
    if (label === "In opbouw") {
      return "De financiële inrichting is redelijk op orde, met nog ruimte om verwerking en stuurinformatie verder te verbeteren.";
    }
    return "De financiële basis is overwegend stabiel en bruikbaar voor sturing.";
  }

  if (title === "Ordermanagement") {
    if (label === "Kwetsbaar") {
      return "De orderroute kent nog te veel afwijkingen en sluit nog onvoldoende strak aan op de gewenste werkwijze.";
    }
    if (label === "Basis aanwezig") {
      return "De basis van ordermanagement is aanwezig, maar afwijkingen en aansluiting op inrichting vragen nog aandacht.";
    }
    if (label === "In opbouw") {
      return "De orderroute is redelijk ingericht, met nog ruimte om uitzonderingen verder terug te brengen.";
    }
    return "Ordermanagement is overwegend beheerst ingericht en sluit goed aan op de gewenste route.";
  }

  if (title === "CRM") {
    if (label === "Kwetsbaar") {
      return "CRM vraagt nog veel aandacht op proces, datakwaliteit en bruikbaarheid voor sturing.";
    }
    if (label === "Basis aanwezig") {
      return "CRM heeft een bruikbare basis, maar procesvolwassenheid en informatiekwaliteit kunnen duidelijk sterker.";
    }
    if (label === "In opbouw") {
      return "CRM is herkenbaar ingericht en bruikbaar, met nog ruimte voor verdere aanscherping.";
    }
    return "CRM is overwegend goed ingericht en ondersteunt proces en sturing behoorlijk sterk.";
  }

  if (title === "HRM") {
    if (label === "Kwetsbaar") {
      return "HRM-processen en datakwaliteit zijn nog te kwetsbaar voor een stabiele uitvoering.";
    }
    if (label === "Basis aanwezig") {
      return "De HRM-basis is aanwezig, maar procesinrichting en datakwaliteit vragen nog verdere ontwikkeling.";
    }
    if (label === "In opbouw") {
      return "HRM is redelijk ingericht en bruikbaar, met nog ruimte om processen verder te versterken.";
    }
    return "HRM is overwegend goed ingericht en ondersteunt de uitvoering stabiel.";
  }

  if (title === "Rapportage & data") {
    if (label === "Kwetsbaar") {
      return "Rapportage en data zijn nog onvoldoende betrouwbaar en eenduidig voor goede sturing.";
    }
    if (label === "Basis aanwezig") {
      return "Er is een basis voor rapportage, maar definities en bruikbaarheid vragen nog duidelijke aanscherping.";
    }
    if (label === "In opbouw") {
      return "Rapportage en data worden steeds bruikbaarder, met nog ruimte voor verdere standaardisatie.";
    }
    return "Rapportage en data zijn overwegend goed bruikbaar voor sturing.";
  }

  if (title === "Integraties & keten") {
    if (label === "Kwetsbaar") {
      return "Integraties en ketenafspraken zijn nog te kwetsbaar en vragen meer stabiliteit en eigenaarschap.";
    }
    if (label === "Basis aanwezig") {
      return "De keten werkt in de basis, maar stabiliteit, monitoring en eigenaarschap kunnen duidelijk sterker.";
    }
    if (label === "In opbouw") {
      return "Integraties en ketenafspraken zijn redelijk ingericht, met nog ruimte voor verdere borging.";
    }
    return "Integraties en ketenafspraken zijn overwegend stabiel en beheerst ingericht.";
  }

  if (title === "Zorgspecifieke uitvoering") {
    if (label === "Kwetsbaar") {
      return "Registratie, declaratie en verantwoording vragen nog veel aandacht om beheerst en betrouwbaar te verlopen.";
    }
    if (label === "Basis aanwezig") {
      return "De zorgspecifieke uitvoering heeft een basis, maar uitzonderingen en verantwoording vragen nog verbetering.";
    }
    if (label === "In opbouw") {
      return "De zorgspecifieke uitvoering is redelijk op orde, met nog ruimte voor verdere borging.";
    }
    return "De zorgspecifieke uitvoering is overwegend goed beheerst ingericht.";
  }

  if (title === "Onderwijsspecifieke uitvoering") {
    if (label === "Kwetsbaar") {
      return "Intake, planning en administratieve aansluiting zijn nog te kwetsbaar en vragen meer eenduidigheid.";
    }
    if (label === "Basis aanwezig") {
      return "De onderwijsspecifieke uitvoering heeft een basis, maar afstemming en uitzonderingen vragen nog verdere verbetering.";
    }
    if (label === "In opbouw") {
      return "Intake, planning en administratieve aansluiting zijn redelijk ingericht, met nog ruimte voor verfijning.";
    }
    return "De onderwijsspecifieke uitvoering is overwegend goed en eenduidig ingericht.";
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

  const financeScore = average([
    toScore(scan.diagnosis.financeFoundationReliability),
    toScore(scan.diagnosis.financeExceptionHandling),
    toScore(scan.diagnosis.financeReportingMaturity),
  ]);

  const orderScore = average([
    toScore(scan.diagnosis.orderFlowStandardization),
    toScore(scan.diagnosis.orderExceptionComplexity),
    toScore(scan.diagnosis.orderSystemFit),
  ]);

  const crmScore = average([
    toScore((scan.diagnosis as Record<string, string>).crmStrategicPressure ?? ""),
    toScore((scan.diagnosis as Record<string, string>).crmProcessMaturity ?? ""),
    toScore((scan.diagnosis as Record<string, string>).crmDataQuality ?? ""),
    toScore((scan.diagnosis as Record<string, string>).crmReportingUsefulness ?? ""),
  ]);

  const hrmScore = average([
    toScore((scan.diagnosis as Record<string, string>).hrmStrategicPressure ?? ""),
    toScore((scan.diagnosis as Record<string, string>).hrmProcessMaturity ?? ""),
    toScore((scan.diagnosis as Record<string, string>).hrmDataQuality ?? ""),
  ]);

  const reportingScore = average([
    toScore((scan.diagnosis as Record<string, string>).reportingStrategicPressure ?? ""),
    toScore((scan.diagnosis as Record<string, string>).reportingDefinitionConsistency ?? ""),
    toScore((scan.diagnosis as Record<string, string>).reportingUsefulness ?? ""),
  ]);

  const integrationScore = average([
    toScore((scan.diagnosis as Record<string, string>).integrationStrategicPressure ?? ""),
    toScore((scan.diagnosis as Record<string, string>).integrationStability ?? ""),
    toScore((scan.diagnosis as Record<string, string>).integrationOwnership ?? ""),
    toScore((scan.diagnosis as Record<string, string>).integrationMonitoringMaturity ?? ""),
  ]);

  const careScore = average([
    toScore(scan.diagnosis.careRegistrationExceptions),
    toScore(scan.diagnosis.careAccountabilityPressure),
  ]);

  const educationScore = average([
    toScore(scan.diagnosis.educationIntakePlanningConsistency),
    toScore(scan.diagnosis.educationProcessAdminAlignment),
    toScore(scan.diagnosis.educationExceptionHandling),
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
    {
      code: "finance",
      title: "Financieel",
      score: financeScore,
    },
    {
      code: "ordermanagement",
      title: "Ordermanagement",
      score: orderScore,
    },
    {
      code: "crm",
      title: "CRM",
      score: crmScore,
    },
    {
      code: "hrm",
      title: "HRM",
      score: hrmScore,
    },
    {
      code: "reporting",
      title: "Rapportage & data",
      score: reportingScore,
    },
    {
      code: "integrations",
      title: "Integraties & keten",
      score: integrationScore,
    },
    {
      code: "care",
      title: "Zorgspecifieke uitvoering",
      score: careScore,
    },
    {
      code: "education",
      title: "Onderwijsspecifieke uitvoering",
      score: educationScore,
    },
  ]
    .filter((domain) => domain.score > 0);

  return domains.map((domain) => {
    const label = toLabel(domain.score);

    return {
      ...domain,
      label,
      summary: buildSummary(domain.title, label),
    };
  });
}
