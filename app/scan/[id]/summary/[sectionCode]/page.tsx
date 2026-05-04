"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useScanContext, type ScanState } from "@/app/context/ScanContext";
import {
  getOptionSet,
  getQuestionsForSection,
  getSection,
} from "@/lib/scan/engine/definition-helpers";
import { getAnswerFromScan } from "@/lib/scan/engine/answer-mapping";

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function buildAdviceSummary(scan: ScanState) {
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

let headline = "Gericht doorontwikkelen";
let mainView =
  "De scan laat zien dat er een bruikbare basis aanwezig is, maar dat de organisatie nog niet overal op een vaste en beheersbare manier werkt. Vooral in eigenaarschap, standaardisatie en structurele verbetering is nog winst te halen.";

if (lowSignals >= 4) {
  headline = "Stabiliseren";
  mainView =
    "De scan laat zien dat op meerdere onderdelen nog basisproblemen aanwezig zijn. Werkwijze, besluitvorming en beheersing zijn nog onvoldoende stevig om duurzaam te verbeteren. De eerste stap is daarom niet verbreden, maar stabiliseren.";
} else if (
  ownershipClarity === "onvoldoende_duidelijk" ||
  changeDecisionProcess === "ad_hoc"
) {
  headline = "Governance versterken";
  mainView =
    "De scan laat zien dat de grootste eerste winst zit in het scherper beleggen van eigenaarschap en besluitvorming. Zonder die basis blijft verbetering te veel afhankelijk van personen in plaats van van een vaste werkwijze.";
} else if (
  processStandardization === "sterk_verschillend" ||
  exceptionControl === "uitzondering_is_norm"
) {
  headline = "Processen standaardiseren";
  mainView =
    "De scan laat zien dat de organisatie nog te veel leunt op verschillen in werkwijze en uitzonderingen. Meer standaardisatie is de logische eerste stap om de uitvoering beter beheersbaar te maken.";
} else {
  headline = "Gericht doorontwikkelen";
  mainView =
    "De scan laat zien dat de organisatie op hoofdlijnen een bruikbare basis heeft. Er zijn aandachtspunten, maar geen direct zwaar fundamentprobleem. De volgende stap ligt vooral in gericht verbeteren en verder aanscherpen.";
}

  const attentionPoints: string[] = [];

  if (
    ownershipClarity === "onvoldoende_duidelijk" ||
    ownershipClarity === "gedeeltelijk_duidelijk"
  ) {
    attentionPoints.push(
      "Eigenaarschap van processen en inrichting is nog niet overal duidelijk belegd."
    );
  }

  if (
    changeDecisionProcess === "ad_hoc" ||
    changeDecisionProcess === "deels_afgestemd"
  ) {
    attentionPoints.push(
      "Besluitvorming over wijzigingen verloopt nog niet strak en voorspelbaar."
    );
  }

  if (
    processStandardization === "sterk_verschillend" ||
    processStandardization === "redelijk_eenduidig"
  ) {
    attentionPoints.push(
      "De belangrijkste processen worden nog niet overal op dezelfde manier uitgevoerd."
    );
  }

  if (
    exceptionControl === "uitzondering_is_norm" ||
    exceptionControl === "deels_beheersbaar"
  ) {
    attentionPoints.push(
      "Uitzonderingen zijn nog te vaak de norm in plaats van een beheersbare afwijking."
    );
  }

  if (
    issueResolution === "handmatig_herstellen" ||
    issueResolution === "mix_ad_hoc_structureel"
  ) {
    attentionPoints.push(
      "Terugkerende knelpunten worden nog niet altijd structureel opgelost."
    );
  }

  if (
    improvementGovernance === "nauwelijks" ||
    improvementGovernance === "af_en_toe"
  ) {
    attentionPoints.push(
      "Verbetering wordt nog niet structureel aangestuurd en opgevolgd."
    );
  }

  const topAttentionPoints =
    attentionPoints.length > 0
      ? attentionPoints.slice(0, 3)
      : [
          "De scan laat geen direct zwaar knelpunt zien, maar verdere aanscherping blijft wenselijk.",
        ];

  let firstStep =
    "Begin met het expliciet maken van eigenaarschap, besluitvorming en standaard werkwijzen voor de belangrijkste processen. Vanuit die basis kan daarna gerichter worden gewerkt aan verbetering, beheersing en verdere doorontwikkeling.";

  if (lowSignals >= 4) {
    firstStep =
      "Start met het stabiliseren van de basis. Breng eerst verantwoordelijkheden, werkwijze en uitzonderingen terug naar een beheersbaar niveau voordat je verder verbreedt of verdiept.";
  } else if (
    ownershipClarity === "onvoldoende_duidelijk" ||
    changeDecisionProcess === "ad_hoc"
  ) {
    firstStep =
      "Start met het expliciet beleggen van proceseigenaarschap en het vastleggen van besluitvorming over wijzigingen. Zonder die basis blijft verbetering afhankelijk van personen.";
  } else if (
    processStandardization === "sterk_verschillend" ||
    exceptionControl === "uitzondering_is_norm"
  ) {
    firstStep =
      "Breng eerst de belangrijkste processen en uitzonderingen terug naar één herkenbare standaard werkwijze. Dat maakt de organisatie direct beter beheersbaar.";
  } else if (
    issueResolution === "handmatig_herstellen" ||
    improvementGovernance === "nauwelijks"
  ) {
    firstStep =
      "Richt een vast ritme in voor evaluatie, opvolging en verbetering. Daarmee verschuift de organisatie van reageren op incidenten naar gericht doorontwikkelen.";
  } else if (midSignals <= 2 && lowSignals <= 1) {
    firstStep =
      "De organisatie lijkt voldoende basis te hebben om gericht door te ontwikkelen. De eerste stap is nu om de belangrijkste verbeterkansen te prioriteren en om te zetten in een concreet verbeterplan.";
  }

  return {
    headline,
    mainView,
    topAttentionPoints,
    firstStep,
  };
}

export default function SectionSummaryPage() {
  const params = useParams<{
    id: string | string[];
    sectionCode: string | string[];
  }>();

  const scanId = getParam(params.id);
  const sectionCode = getParam(params.sectionCode);

  const { scan, resetScan } = useScanContext();

  const section = getSection(sectionCode);
  const questions = getQuestionsForSection(sectionCode);

  if (!section) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Samenvatting niet gevonden</h1>
        <p className="text-sm text-muted-foreground">
          Deze samenvattingspagina bestaat nog niet.
        </p>
      </div>
    );
  }

  const previousHref =
    questions.length > 0
      ? `/scan/${scanId}/flow/${sectionCode}/${questions[questions.length - 1].key}`
      : `/scan/${scanId}/summary/profile_basis`;

  const nextSectionCode = section.nextSectionCode ?? "";
  const nextSectionQuestions = nextSectionCode
    ? getQuestionsForSection(nextSectionCode)
    : [];
  const nextQuestionKey = nextSectionQuestions[0]?.key ?? "";

  const hasNextStep = Boolean(nextSectionCode && nextQuestionKey);

  const nextHref = hasNextStep
    ? `/scan/${scanId}/flow/${nextSectionCode}/${nextQuestionKey}`
    : "";

  const canContinue = questions.every((question) => {
    if (!question.required) return true;
    return getAnswerFromScan(scan, question.key).trim() !== "";
  });

  const isFinalStep = !hasNextStep;
  const adviceSummary = isFinalStep ? buildAdviceSummary(scan) : null;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {section.title} — samenvatting
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Samenvatting</h1>
        <p className="text-sm text-muted-foreground">
          Controleer of de ingevulde gegevens goed zijn ingevuld.
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Overzicht</h2>

        <div className="space-y-2 text-sm text-muted-foreground">
          {questions.map((question) => {
            const rawValue = getAnswerFromScan(scan, question.key);
            const optionSet = getOptionSet(question.optionSetKey);

            let displayValue = rawValue || "Nog niet ingevuld";

            if (optionSet && rawValue) {
              displayValue =
                optionSet.options.find((option) => option.value === rawValue)?.label ??
                rawValue;
            }

            return (
              <div key={question.key}>
                {question.label}: {displayValue}
              </div>
            );
          })}
        </div>
      </section>

      {!canContinue && (
        <div className="kweekers-accent-box text-sm">
          Nog niet alle verplichte vragen zijn ingevuld.
        </div>
      )}

      {isFinalStep && canContinue && adviceSummary && (
        <>
          <section className="space-y-3 rounded-2xl border p-5">
            <h2 className="text-lg font-medium">Hoofdbeeld</h2>
            <div className="text-sm font-medium">{adviceSummary.headline}</div>
            <p className="text-sm text-muted-foreground">
              {adviceSummary.mainView}
            </p>
          </section>

          <section className="space-y-3 rounded-2xl border p-5">
            <h2 className="text-lg font-medium">Belangrijkste aandachtspunten</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {adviceSummary.topAttentionPoints.map((point) => (
                <li key={point} className="ml-5 list-disc">
                  {point}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3 rounded-2xl border p-5">
            <h2 className="text-lg font-medium">Aanbevolen eerste stap</h2>
            <p className="text-sm text-muted-foreground">
              {adviceSummary.firstStep}
            </p>
          </section>

          <section className="rounded-2xl border p-5">
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Scan afgerond</h2>
              <p className="text-sm text-muted-foreground">
                De begeleide scan is compleet ingevuld. Je kunt nu een nieuwe scan
                starten.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => resetScan()}
                className="rounded-2xl border px-5 py-3 text-sm font-medium"
              >
                Reset scan
              </button>

              <Link
                href="/scan/nieuw/flow/profile_basis/customer_name"
                className="kweekers-primary-button"
                onClick={() => resetScan()}
              >
                Nieuwe scan starten
              </Link>
            </div>
          </section>
        </>
      )}

      <div className="flex items-center justify-between border-t pt-6">
        <Link
          href={previousHref}
          className="rounded-2xl border px-5 py-3 text-sm font-medium"
        >
          Vorige
        </Link>

        {hasNextStep ? (
          canContinue ? (
            <Link href={nextHref} className="kweekers-primary-button">
              Verder →
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center rounded-2xl border px-5 py-3 text-sm font-medium text-muted-foreground opacity-60"
            >
              Verder →
            </span>
          )
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center rounded-2xl border px-5 py-3 text-sm font-medium text-muted-foreground opacity-60"
          >
            Einde van de scan
          </span>
        )}
      </div>
    </div>
  );
}
