import { getQuestionsForSection, getSection } from "@/lib/scan/engine/definition-helpers";
import { getAnswerFromScan } from "@/lib/scan/engine/answer-mapping";
import { buildDomainScores } from "@/lib/scan/engine/build-domain-scores";
import type { ScanState } from "@/app/context/ScanContext";

export function normalizeScanForOutput(scan: ScanState) {
  const sectionCodes = ["profile_basis", "profile_reason", "scope", "diagnose"];

  const sections = sectionCodes.map((code) => {
    const section = getSection(code);
    const questions = getQuestionsForSection(code, scan);

    const answers = Object.fromEntries(
      questions.map((question) => [
        question.key,
        getAnswerFromScan(scan, question.key),
      ])
    );

    return {
      id: code,
      title: section?.title ?? code,
      category: "Scan",
      score: null,
      answers,
    };
  });

  const domainScores = buildDomainScores(scan);
  const averageScore =
    domainScores.length > 0
      ? domainScores.reduce((sum, domain) => sum + domain.score, 0) /
        domainScores.length
      : null;

  return {
    id: "current-scan",
    customerName: scan.profile.customerName || "Onbekende klant",
    sector: scan.profile.sector || "Onbekende sector",
    goal:
      scan.scope.focus && scan.scope.focus.length > 0
        ? scan.scope.focus.join(", ")
        : "Nog niet ingevuld",
    overallScore: averageScore,
    sections,
  };
}
