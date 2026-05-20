import type { ScanState } from "@/app/context/ScanContext";
import type { PillarScore, SubDimensionScore, TotalScore } from "@/lib/scan/types";
import { pillars } from "@/lib/scan/definition/pillars";
import { questions } from "@/lib/scan/definition/questions";
import { getOptionSet } from "@/lib/scan/engine/definition-helpers";
import { getAnswerFromScan } from "@/lib/scan/engine/answer-mapping";

// Mapping van bestaande dimensies naar nieuwe pijlers en sub-dimensies
const dimensionToPillarMapping: Record<string, { pillarCode: string; subDimensionCode: string }> = {
  // Organisatiematuriteit
  eigenaarschap: { pillarCode: "organisatie_maturiteit", subDimensionCode: "organisatie_rollen" },
  procesafspraken: { pillarCode: "organisatie_maturiteit", subDimensionCode: "processen" },
  verantwoordelijkheden: { pillarCode: "organisatie_maturiteit", subDimensionCode: "governance" },
  
  // Rapportage & Data
  datakwaliteit: { pillarCode: "rapportage_data", subDimensionCode: "data_kwaliteit" },
  rapportages: { pillarCode: "rapportage_data", subDimensionCode: "standaard_rapportages" },
  inzicht: { pillarCode: "rapportage_data", subDimensionCode: "management_info" },
  
  // Integraties
  integratie: { pillarCode: "integraties", subDimensionCode: "koppelingen" },
  dataflow: { pillarCode: "integraties", subDimensionCode: "data_uitwisseling" },
  
  // AFAS Modules - mapping op basis van category/domain
  hrm: { pillarCode: "afas_modules", subDimensionCode: "hrm_payroll" },
  finance: { pillarCode: "afas_modules", subDimensionCode: "finance" },
  crm: { pillarCode: "afas_modules", subDimensionCode: "crm" },
};

// Score mapping voor 3-level naar 5-level conversie
function convert3to5Scale(score3: number): number {
  // 3-level: 1 = slecht, 2 = matig, 3 = goed
  // 5-level: 1 = initieel, 2 = basis, 3 = gedefinieerd, 4 = geintegreerd, 5 = geoptimaliseerd
  if (score3 <= 0) return 0;
  if (score3 <= 1) return 1;
  if (score3 <= 1.5) return 2;
  if (score3 <= 2) return 3;
  if (score3 <= 2.5) return 4;
  return 5;
}

function fallbackScoreMap(value: string): number {
  const scoreMap: Record<string, number> = {
    // 3-level options (converted to 1-3 first, then scaled)
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

type OptionWithScore = {
  value: string;
  label: string;
  description?: string;
  order: number;
  score?: number;
};

function getScoreFromOptionSet(optionSetKey: string | undefined, value: string): number {
  if (!optionSetKey) {
    return fallbackScoreMap(value);
  }

  const optionSet = getOptionSet(optionSetKey);
  const option = optionSet?.options.find((item) => item.value === value) as OptionWithScore | undefined;

  if (typeof option?.score === "number") {
    return option.score;
  }

  return fallbackScoreMap(value);
}

function average(scores: number[]): number {
  const validScores = scores.filter((score) => score > 0);
  if (validScores.length === 0) return 0;
  const total = validScores.reduce((sum, score) => sum + score, 0);
  return Number((total / validScores.length).toFixed(2));
}

function getScoreForQuestion(scan: ScanState, questionKey: string, optionSetKey?: string): number {
  const answer = getAnswerFromScan(scan, questionKey);

  if (Array.isArray(answer)) {
    const scores = answer.map((value) => getScoreFromOptionSet(optionSetKey, value));
    return average(scores);
  }

  if (typeof answer === "string" && answer.trim() !== "") {
    return getScoreFromOptionSet(optionSetKey, answer);
  }

  return 0;
}

export function buildPillarScores(scan: ScanState): TotalScore {
  const pillarScores: PillarScore[] = pillars.map((pillar) => {
    const subDimensionScores: SubDimensionScore[] = pillar.subDimensions.map((subDim) => {
      // Find questions mapped to this sub-dimension
      const mappedQuestions = questions.filter((q) => {
        // Check if question has explicit pillar mapping
        if ((q as any).pillarCode === pillar.code && (q as any).subDimensionCode === subDim.code) {
          return true;
        }
        
        // Check dimension mapping
        const mapping = dimensionToPillarMapping[(q as any).dimensionCode];
        if (mapping && mapping.pillarCode === pillar.code && mapping.subDimensionCode === subDim.code) {
          return true;
        }

        return false;
      });

      const scores = mappedQuestions.map((q) => {
        const raw = getScoreForQuestion(scan, q.key, q.optionSetKey);
        return convert3to5Scale(raw);
      });

      const answeredCount = scores.filter((s) => s > 0).length;

      return {
        code: subDim.code,
        label: subDim.label,
        score: average(scores),
        questionCount: mappedQuestions.length,
        answeredCount,
      };
    });

    // Filter out sub-dimensions with no questions or scores
    const scoredSubDimensions = subDimensionScores.filter((s) => s.questionCount > 0);
    
    // Calculate pillar average from sub-dimensions that have scores
    const subScores = scoredSubDimensions.map((s) => s.score).filter((s) => s > 0);
    const pillarAverage = average(subScores);

    return {
      code: pillar.code,
      label: pillar.label,
      description: pillar.description,
      color: pillar.color,
      score: pillarAverage,
      subDimensions: subDimensionScores,
    };
  });

  // Calculate total score (weighted average of pillars)
  const pillarScoresWithData = pillarScores.filter((p) => p.score > 0);
  const totalScore = average(pillarScoresWithData.map((p) => p.score));

  return {
    score: totalScore,
    pillars: pillarScores,
  };
}

// Generate mock/demo scores for visualization when no real data
export function generateDemoScores(): TotalScore {
  const demoScores: PillarScore[] = [
    {
      code: "afas_modules",
      label: "AFAS Modules",
      description: "Hoe optimaal benutten we de mogelijkheden van AFAS?",
      color: "#3f4e87",
      score: 2.7,
      subDimensions: [
        { code: "hrm_payroll", label: "HRM & Payroll", score: 3, questionCount: 4, answeredCount: 4 },
        { code: "finance", label: "Finance", score: 3, questionCount: 4, answeredCount: 4 },
        { code: "crm", label: "CRM", score: 2, questionCount: 3, answeredCount: 3 },
        { code: "projects", label: "Projecten", score: 2, questionCount: 3, answeredCount: 3 },
        { code: "inkoop", label: "Inkoop", score: 3, questionCount: 2, answeredCount: 2 },
        { code: "abonnementen", label: "Abonnementen", score: 2, questionCount: 2, answeredCount: 2 },
        { code: "fleet", label: "Fleet", score: 0, questionCount: 0, answeredCount: 0 },
        { code: "selfservice", label: "Self Service & Portalen", score: 3, questionCount: 3, answeredCount: 3 },
      ],
    },
    {
      code: "integraties",
      label: "Integraties",
      description: "Hoe goed is AFAS verbonden met andere systemen?",
      color: "#ed6e41",
      score: 2.3,
      subDimensions: [
        { code: "koppelingen", label: "Koppelingen met andere systemen", score: 3, questionCount: 3, answeredCount: 3 },
        { code: "data_uitwisseling", label: "Data-uitwisseling (API / iPaaS)", score: 2, questionCount: 3, answeredCount: 3 },
        { code: "master_data", label: "Master Data Management", score: 2, questionCount: 2, answeredCount: 2 },
        { code: "proces_integratie", label: "Procesintegratie (end-to-end)", score: 2, questionCount: 2, answeredCount: 2 },
        { code: "security", label: "Security & Toegangsbeheer", score: 3, questionCount: 2, answeredCount: 2 },
        { code: "monitoring", label: "Monitoring & Foutafhandeling", score: 2, questionCount: 2, answeredCount: 2 },
      ],
    },
    {
      code: "rapportage_data",
      label: "Rapportage & Data",
      description: "Hoe sturen we op data en inzichten?",
      color: "#f59e0b",
      score: 2.4,
      subDimensions: [
        { code: "standaard_rapportages", label: "Standaard rapportages (AFAS)", score: 3, questionCount: 3, answeredCount: 3 },
        { code: "management_info", label: "Managementinformatie (KPI's & dashboards)", score: 2, questionCount: 3, answeredCount: 3 },
        { code: "data_kwaliteit", label: "Data kwaliteit & Governance", score: 2, questionCount: 3, answeredCount: 3 },
        { code: "selfservice_bi", label: "Self Service BI (Gebruikersregie)", score: 2, questionCount: 2, answeredCount: 2 },
        { code: "geavanceerde_analyse", label: "Geavanceerde analyse & voorspellingen", score: 2, questionCount: 2, answeredCount: 2 },
        { code: "data_driven", label: "Data-driven cultuur", score: 3, questionCount: 2, answeredCount: 2 },
      ],
    },
    {
      code: "organisatie_maturiteit",
      label: "Organisatiematuriteit",
      description: "Hoe volwassen is de organisatie in mens, proces & sturing?",
      color: "#10b981",
      score: 2.5,
      subDimensions: [
        { code: "strategie_visie", label: "Strategie & Visie", score: 3, questionCount: 2, answeredCount: 2 },
        { code: "processen", label: "Processen & Werkwijzen", score: 2, questionCount: 3, answeredCount: 3 },
        { code: "organisatie_rollen", label: "Organisatie & Rollen", score: 2, questionCount: 3, answeredCount: 3 },
        { code: "change_adoptie", label: "Change & Adoptie", score: 3, questionCount: 2, answeredCount: 2 },
        { code: "competenties", label: "Competenties & Vaardigheden", score: 2, questionCount: 2, answeredCount: 2 },
        { code: "communicatie", label: "Communicatie & Betrokkenheid", score: 3, questionCount: 2, answeredCount: 2 },
        { code: "governance", label: "Governance & Sturing", score: 2, questionCount: 2, answeredCount: 2 },
      ],
    },
  ];

  return {
    score: 2.5,
    pillars: demoScores,
  };
}
