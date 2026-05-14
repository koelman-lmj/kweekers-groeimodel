import type { ScanState } from "@/app/context/ScanContext";
import { dimensions } from "@/lib/scan/definition/dimensions";
import { questions } from "@/lib/scan/definition/questions";
import { getOptionSet } from "@/lib/scan/engine/definition-helpers";
import { getAnswerFromScan } from "@/lib/scan/engine/answer-mapping";

type DomainScore = {
  code: string;
  title: string;
  score: number;
  label: string;
  summary: string;
};

function fallbackScoreMap(value: string): number {
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

  if (validScores.length === 0) {
    return 0;
  }

  const total = validScores.reduce((sum, score) => sum + score, 0);
  return Number((total / validScores.length).toFixed(1));
}

function buildSummary(title: string, label: string): string {
  if (label === "Kwetsbaar") {
    return `${title} vraagt duidelijke aandacht. De basis is nog onvoldoende stabiel om hier goed op te sturen.`;
  }

  if (label === "Basis aanwezig") {
    return `${title} heeft een basis, maar is nog niet overal eenduidig of betrouwbaar genoeg ingericht.`;
  }

  if (label === "In opbouw") {
    return `${title} is herkenbaar ingericht, maar kan nog verder worden aangescherpt en geborgd.`;
  }

  return `${title} is overwegend beheerst ingericht en ondersteunt de organisatie voldoende stabiel.`;
}

function getScoreFromOptionSet(
  optionSetKey: string | undefined,
  value: string
): number {
  if (!optionSetKey) {
    return fallbackScoreMap(value);
  }

  const optionSet = getOptionSet(optionSetKey);
  const option = optionSet?.options.find((item) => item.value === value);

  const optionWithScore = option as
    | (typeof option & { score?: number })
    | undefined;

  if (typeof optionWithScore?.score === "number") {
    return optionWithScore.score;
  }

  return fallbackScoreMap(value);
}

function getScoreForQuestion(
  scan: ScanState,
  questionKey: string,
  optionSetKey?: string
): number {
  const answer = getAnswerFromScan(scan, questionKey);

  if (Array.isArray(answer)) {
    const scores = answer.map((value) =>
      getScoreFromOptionSet(optionSetKey, value)
    );

    return average(scores);
  }

  return getScoreFromOptionSet(optionSetKey, answer);
}

export function buildDomainScores(scan: ScanState): DomainScore[] {
  return dimensions
    .filter((dimension) => dimension.isActive)
    .sort((a, b) => a.order - b.order)
    .map((dimension) => {
      const dimensionQuestions = questions.filter((question) => {
        return (
          question.dimensionCode === dimension.code &&
          question.scoreEnabled === true
        );
      });

      const weightedScores = dimensionQuestions.flatMap((question) => {
        const score = getScoreForQuestion(
          scan,
          question.key,
          question.optionSetKey
        );

        const weight = question.scoreWeight ?? 1;

        if (score <= 0) {
          return [];
        }

        return Array.from({ length: weight }).map(() => score);
      });

      const score = average(weightedScores);
      const label = toLabel(score);

      return {
        code: dimension.code,
        title: dimension.title,
        score,
        label,
        summary: buildSummary(dimension.title, label),
      };
    })
    .filter((domain) => domain.score > 0);
}
