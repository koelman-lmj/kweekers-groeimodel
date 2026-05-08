"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useScanContext, type ScanState } from "@/app/context/ScanContext";
import {
  getOptionSet,
  getQuestionsForSection,
  getSection,
} from "@/lib/scan/engine/definition-helpers";
import {
  getAnswerFromScan,
  type AnswerValue,
} from "@/lib/scan/engine/answer-mapping";
import { buildDomainScores } from "@/lib/scan/engine/build-domain-scores";
import { buildScanContextSummary } from "@/lib/scan/engine/build-scan-context-summary";

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getDisplayValue(
  rawValue: AnswerValue,
  optionSet?: ReturnType<typeof getOptionSet>
): string | string[] {
  if (Array.isArray(rawValue)) {
    if (rawValue.length === 0) return "Nog niet ingevuld";

    if (!optionSet) {
      return rawValue;
    }

    return rawValue.map((value) => {
      return (
        optionSet.options.find((option) => option.value === value)?.label ?? value
      );
    });
  }

  if (!rawValue) return "Nog niet ingevuld";

  if (!optionSet) return rawValue;

  return optionSet.options.find((option) => option.value === rawValue)?.label ?? rawValue;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function buildAdviceContextAdditions(scan: ScanState) {
  const mainViewAdditions: string[] = [];
  const firstStepAdditions: string[] = [];

  const bottlenecks = scan.profile.biggestBottleneck;
  const focusAreas = scan.scope.focus;
  const afasProducts = scan.profile.afasProducts;

  if (bottlenecks.includes("eigenaarschap")) {
    mainViewAdditions.push(
      "Daarnaast laat de scan zien dat verantwoordelijkheden en besluitvorming extra aandacht vragen."
    );
    firstStepAdditions.push(
      "Leg daarbij expliciet vast wie proceseigenaar is en wie beslist over wijzigingen."
    );
  }

  if (bottlenecks.includes("processen")) {
    mainViewAdditions.push(
      "De uitkomst wijst ook op duidelijke frictie in de procesuitvoering en de manier waarop werk in de praktijk verloopt."
    );
    firstStepAdditions.push(
      "Breng de belangrijkste procesvarianten terug naar één herkenbare standaard werkwijze."
    );
  }

  if (bottlenecks.includes("rapportage")) {
    mainViewAdditions.push(
      "Ook stuurinformatie en rapportage lijken nu onvoldoende te ondersteunen in dagelijkse of bestuurlijke sturing."
    );
    firstStepAdditions.push(
      "Werk tegelijk toe naar duidelijke KPI-definities, eigenaarschap op rapportage en een beperkte set managementinzichten."
    );
  }

  if (bottlenecks.includes("afas")) {
    mainViewAdditions.push(
      "De inrichting en het gebruik van AFAS lijken niet overal goed aan te sluiten op de gewenste werkwijze."
    );
    firstStepAdditions.push(
      "Kijk daarom ook gericht naar standaardinrichting, workflow en de aansluiting tussen proces en systeemondersteuning."
    );
  }

  if (bottlenecks.includes("data_integraties")) {
    mainViewAdditions.push(
      "Een deel van de frictie lijkt ook te zitten in gegevenskwaliteit of in de samenwerking tussen systemen."
    );
    firstStepAdditions.push(
      "Maak datastromen, definities en integratie-afspraken expliciet onderdeel van de eerste verbeterstap."
    );
  }

  if (bottlenecks.includes("adoptie")) {
    mainViewAdditions.push(
      "De uitdaging zit niet alleen in proces of systeem, maar ook in gebruik, discipline en borging."
    );
    firstStepAdditions.push(
      "Combineer procesverbetering daarom met duidelijke werkafspraken, adoptie en borging in het team."
    );
  }

  if (focusAreas.includes("organisatie_eigenaarschap")) {
    mainViewAdditions.push(
      "Omdat de scan nadrukkelijk ook kijkt naar governance en eigenaarschap, wegen rolverdeling en besluitvorming extra zwaar mee in de duiding."
    );
  }

  if (focusAreas.includes("processen_werkwijze")) {
    mainViewAdditions.push(
      "De scan is bovendien expliciet gericht op processen en werkwijze, waardoor standaardisatie en uitvoerbaarheid extra zwaar meewegen."
    );
  }

  if (focusAreas.includes("afas_inrichting_gebruik")) {
    mainViewAdditions.push(
      "Omdat ook AFAS-inrichting en gebruik centraal staan, telt de aansluiting tussen proces en systeemondersteuning zwaarder mee."
    );
  }

  if (focusAreas.includes("rapportage_sturing")) {
    mainViewAdditions.push(
      "De scan richt zich mede op stuurinformatie, inzicht en bestuurlijke grip."
    );
  }

  if (focusAreas.includes("beheer_doorontwikkeling")) {
    mainViewAdditions.push(
      "Daarnaast kijkt de scan ook naar het vermogen om inrichting en processen structureel te beheren en door te ontwikkelen."
    );
  }

  if (afasProducts.includes("financieel")) {
    mainViewAdditions.push(
      "Binnen AFAS zijn financiële processen en sturing relevant voor de verbeteropgave."
    );
    firstStepAdditions.push(
      "Neem daarbij administratie, uitzonderingen, autorisatie en rapportage expliciet mee."
    );
  }

  if (afasProducts.includes("ordermanagement")) {
    mainViewAdditions.push(
      "Ook orderprocessen en de aansluiting op uitvoering of facturatie spelen een rol."
    );
    firstStepAdditions.push(
      "Richt je eerste verbeterstap dan ook op standaardroutes, uitzonderingen en beheersing in het orderproces."
    );
  }

  if (afasProducts.includes("inkoop")) {
    mainViewAdditions.push(
      "Inkoopstromen zijn eveneens relevant binnen deze scan."
    );
    firstStepAdditions.push(
      "Neem bestelproces, goedkeuring en factuurverwerking mee in de eerste verbeterslag."
    );
  }

  if (afasProducts.includes("crm")) {
    mainViewAdditions.push(
      "Commerciële processen en klantgericht werken kunnen onderdeel zijn van de verbeteropgave."
    );
  }

  if (afasProducts.includes("hrm") || afasProducts.includes("payroll")) {
    mainViewAdditions.push(
      "HR-processen en mutatiestromen zijn relevant in deze scan."
    );
    firstStepAdditions.push(
      "Richt je eerste verbeterstap dan ook op workflow, verantwoordelijkheden en borging binnen HR-processen."
    );
  }

  if (afasProducts.includes("workflow")) {
    mainViewAdditions.push(
      "De inzet van workflow is relevant voor de mate van standaardisatie en beheersing."
    );
  }

  if (afasProducts.includes("rapportage_dashboards")) {
    mainViewAdditions.push(
      "De behoefte aan stuurinformatie en dashboards is expliciet relevant binnen deze scan."
    );
  }

  if (afasProducts.includes("integraties")) {
    mainViewAdditions.push(
      "De scan raakt ook de samenwerking tussen AFAS en andere systemen, waardoor ketenafhankelijkheden extra belangrijk worden."
    );
  }

  return {
    mainViewAdditions: unique(mainViewAdditions),
    firstStepAdditions: unique(firstStepAdditions),
  };
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

  let headline = "Gericht doorontwikkelen";
  let baseMainView =
    "De scan laat zien dat er een bruikbare basis aanwezig is, maar dat de organisatie nog niet overal op een vaste en beheersbare manier werkt. Vooral in eigenaarschap, standaardisatie en structurele verbetering is nog winst te halen.";

  if (lowSignals >= 4) {
    headline = "Stabiliseren";
    baseMainView =
      "De scan laat zien dat op meerdere onderdelen nog basisproblemen aanwezig zijn. Werkwijze, besluitvorming en beheersing zijn nog onvoldoende stevig om duurzaam te verbeteren. De eerste stap is daarom niet verbreden, maar stabiliseren.";
  } else if (
    ownershipClarity === "onvoldoende_duidelijk" ||
    changeDecisionProcess === "ad_hoc"
  ) {
    headline = "Governance versterken";
    baseMainView =
      "De scan laat zien dat de grootste eerste winst zit in het scherper beleggen van eigenaarschap en besluitvorming. Zonder die basis blijft verbetering te veel afhankelijk van personen in plaats van van een vaste werkwijze.";
  } else if (
    processStandardization === "sterk_verschillend" ||
    exceptionControl === "uitzondering_is_norm"
  ) {
    headline = "Processen standaardiseren";
    baseMainView =
      "De scan laat zien dat de organisatie nog te veel leunt op verschillen in werkwijze en uitzonderingen. Meer standaardisatie is de logische eerste stap om de uitvoering beter beheersbaar te maken.";
  } else {
    headline = "Gericht doorontwikkelen";
    baseMainView =
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

  let baseFirstStep =
    "Breng de belangrijkste verbeterkansen terug naar een beperkt en concreet verbeterplan, zodat de organisatie gericht kan doorontwikkelen.";

  if (lowSignals >= 4) {
    baseFirstStep =
      "Start met het stabiliseren van de basis. Breng eerst verantwoordelijkheden, werkwijze en uitzonderingen terug naar een beheersbaar niveau voordat je verder verbreedt of verdiept.";
  } else if (
    ownershipClarity === "onvoldoende_duidelijk" ||
    changeDecisionProcess === "ad_hoc"
  ) {
    baseFirstStep =
      "Start met het expliciet beleggen van proceseigenaarschap en het vastleggen van besluitvorming over wijzigingen. Zonder die basis blijft verbetering afhankelijk van personen.";
  } else if (
    processStandardization === "sterk_verschillend" ||
    exceptionControl === "uitzondering_is_norm"
  ) {
    baseFirstStep =
      "Breng eerst de belangrijkste processen en uitzonderingen terug naar één herkenbare standaard werkwijze. Dat maakt de organisatie direct beter beheersbaar.";
  } else {
    baseFirstStep =
      "De organisatie lijkt voldoende basis te hebben om gericht door te ontwikkelen. De eerste stap is nu om de belangrijkste verbeterkansen te prioriteren en om te zetten in een concreet verbeterplan.";
  }

  const contextAdditions = buildAdviceContextAdditions(scan);

  const mainView = [
    baseMainView,
    ...contextAdditions.mainViewAdditions.slice(0, 2),
  ].join(" ");

  const firstStep = [
    baseFirstStep,
    ...contextAdditions.firstStepAdditions.slice(0, 1),
  ].join(" ");

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

    const answer = getAnswerFromScan(scan, question.key);

    if (Array.isArray(answer)) {
      return answer.length > 0;
    }

    return answer.trim() !== "";
  });

  const isFinalStep = !hasNextStep;
  const adviceSummary = isFinalStep ? buildAdviceSummary(scan) : null;
  const domainScores = isFinalStep ? buildDomainScores(scan) : [];
  const contextSummary = isFinalStep ? buildScanContextSummary(scan) : null;

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

      {!isFinalStep && (
        <section className="space-y-3 rounded-2xl border p-5">
          <h2 className="text-lg font-medium">Overzicht</h2>

          <div className="space-y-3">
            {questions.map((question) => {
              const rawValue = getAnswerFromScan(scan, question.key);
              const optionSet = getOptionSet(question.optionSetKey);
              const comment = scan.comments[question.key]?.trim() ?? "";
              const displayValue = getDisplayValue(rawValue, optionSet);

              return (
                <div
                  key={question.key}
                  className="rounded-2xl border border-black/10 p-4"
                >
                  <div className="text-sm font-medium">{question.label}</div>

                  {Array.isArray(displayValue) ? (
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {displayValue.map((value) => (
                        <li key={value} className="ml-5 list-disc">
                          {value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {displayValue}
                    </div>
                  )}

                  {comment && (
                    <div className="mt-3 rounded-xl border bg-black/5 p-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Opmerking
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {comment}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!canContinue && (
        <div className="kweekers-accent-box text-sm">
          Nog niet alle verplichte vragen zijn ingevuld.
        </div>
      )}

      {isFinalStep && canContinue && adviceSummary && contextSummary && (
        <>
          <section className="space-y-3 rounded-2xl border p-5">
            <h2 className="text-lg font-medium">Hoofdbeeld</h2>
            <div className="text-sm font-medium">{adviceSummary.headline}</div>
            <p className="text-sm text-muted-foreground">
              {adviceSummary.mainView}
            </p>
          </section>

          <section className="space-y-3 rounded-2xl border p-5">
            <h2 className="text-lg font-medium">Domeinscorekaart</h2>

            <div className="grid gap-3">
              {domainScores.map((domain) => (
                <div key={domain.code} className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">
                        {domain.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {domain.summary}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-sm font-semibold">
                        {domain.score.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {domain.label}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {(contextSummary.bottleneckLines.length > 0 ||
            contextSummary.focusLines.length > 0 ||
            contextSummary.productLines.length > 0) && (
            <section className="space-y-4 rounded-2xl border p-5">
              <h2 className="text-lg font-medium">Context uit de scan</h2>

              {contextSummary.bottleneckLines.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">
                    Knelpunten die nu vooral spelen
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {contextSummary.bottleneckLines.map((line) => (
                      <li key={line} className="ml-5 list-disc">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {contextSummary.focusLines.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">
                    Onderwerpen die bewust centraal staan
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {contextSummary.focusLines.map((line) => (
                      <li key={line} className="ml-5 list-disc">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {contextSummary.productLines.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">
                    Relevante AFAS-context
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {contextSummary.productLines.map((line) => (
                      <li key={line} className="ml-5 list-disc">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <section className="space-y-3 rounded-2xl border p-5">
            <h2 className="text-lg font-medium">
              Belangrijkste aandachtspunten
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {adviceSummary.topAttentionPoints.map((point) => (
                <li key={point} className="ml-5 list-disc">
                  {point}
                </li>
              ))}
            </ul>
          </section>

          {Object.entries(scan.comments)
            .filter(([, value]) => value.trim() !== "")
            .length > 0 && (
            <section className="space-y-3 rounded-2xl border p-5">
              <h2 className="text-lg font-medium">Opmerkingen uit de scan</h2>

              <div className="space-y-3">
                {[
                  ...getQuestionsForSection("profile_basis"),
                  ...getQuestionsForSection("profile_reason"),
                  ...getQuestionsForSection("scope"),
                  ...getQuestionsForSection("diagnose"),
                ]
                  .filter((question) => {
                    const comment = scan.comments[question.key]?.trim() ?? "";
                    return comment !== "";
                  })
                  .map((question) => (
                    <div
                      key={question.key}
                      className="rounded-2xl border border-black/10 p-4"
                    >
                      <div className="text-sm font-semibold">
                        {question.label}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {scan.comments[question.key]}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

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
                De begeleide scan is compleet ingevuld. Je kunt nu een nieuwe
                scan starten.
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
