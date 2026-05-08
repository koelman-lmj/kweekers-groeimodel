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

    if (!optionSet) return rawValue;

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

function getStatusMeta(headline: string) {
  if (headline === "Stabiliseren") {
    return {
      tone: "border-red-200 bg-red-50 text-red-900",
      badge: "bg-red-100 text-red-700",
      chipTone: "border-red-200 bg-white text-red-700",
      icon: "●",
      compactLabel: "Stabiliseren",
    };
  }

  if (headline === "Governance versterken" || headline === "Aanscherpen") {
    return {
      tone: "border-amber-200 bg-amber-50 text-amber-900",
      badge: "bg-amber-100 text-amber-700",
      chipTone: "border-amber-200 bg-white text-amber-700",
      icon: "●",
      compactLabel: "Aanscherpen",
    };
  }

  return {
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
    badge: "bg-emerald-100 text-emerald-700",
    chipTone: "border-emerald-200 bg-white text-emerald-700",
    icon: "●",
    compactLabel: "Doorontwikkelen",
  };
}

function getScoreLabel(score: number) {
  if (score < 2.5) return "Kwetsbaar";
  if (score < 4.5) return "Basis aanwezig";
  if (score < 6.5) return "Redelijk op orde";
  return "Sterk";
}

function getFilledBlocks(score: number) {
  return Math.max(0, Math.min(10, Math.round(score * 1.25)));
}

function buildAttentionCards(scan: ScanState) {
  const cards: { title: string; text: string }[] = [];
  const d = scan.diagnosis;

  if (
    d.ownershipClarity === "onvoldoende_duidelijk" ||
    d.ownershipClarity === "gedeeltelijk_duidelijk"
  ) {
    cards.push({
      title: "Eigenaarschap",
      text: "Niet overal duidelijk belegd.",
    });
  }

  if (
    d.changeDecisionProcess === "ad_hoc" ||
    d.changeDecisionProcess === "deels_afgestemd"
  ) {
    cards.push({
      title: "Besluitvorming",
      text: "Wijzigingen verlopen nog te weinig via een vaste route.",
    });
  }

  if (
    d.processStandardization === "sterk_verschillend" ||
    d.processStandardization === "redelijk_eenduidig"
  ) {
    cards.push({
      title: "Processtandaard",
      text: "Werkwijze verschilt nog te veel tussen mensen of teams.",
    });
  }

  if (
    d.exceptionControl === "uitzondering_is_norm" ||
    d.exceptionControl === "deels_beheersbaar"
  ) {
    cards.push({
      title: "Uitzonderingen",
      text: "Afwijkingen zijn nog te vaak de norm.",
    });
  }

  if (
    d.issueResolution === "handmatig_herstellen" ||
    d.issueResolution === "mix_ad_hoc_structureel"
  ) {
    cards.push({
      title: "Knelpunten oplossen",
      text: "Terugkerende problemen worden nog niet altijd structureel opgelost.",
    });
  }

  if (
    d.improvementGovernance === "nauwelijks" ||
    d.improvementGovernance === "af_en_toe"
  ) {
    cards.push({
      title: "Verbetersturing",
      text: "Verbetering wordt nog niet structureel aangestuurd.",
    });
  }

  return cards.slice(0, 3);
}

function buildAdviceContextAdditions(scan: ScanState) {
  const mainViewAdditions: string[] = [];
  const firstStepAdditions: string[] = [];

  const bottlenecks = scan.profile.biggestBottleneck;
  const focusAreas = scan.scope.focus;
  const afasProducts = scan.profile.afasProducts;
  const processChains = scan.profile.primaryProcessChains;

  if (bottlenecks.includes("eigenaarschap")) {
    mainViewAdditions.push(
      "Verantwoordelijkheden en besluitvorming vragen extra aandacht."
    );
    firstStepAdditions.push(
      "Leg vast wie proceseigenaar is en wie beslist over wijzigingen."
    );
  }

  if (bottlenecks.includes("processen")) {
    mainViewAdditions.push(
      "Er is duidelijke frictie in de procesuitvoering en de dagelijkse werkwijze."
    );
    firstStepAdditions.push(
      "Breng procesvarianten terug naar één herkenbare standaard."
    );
  }

  if (bottlenecks.includes("rapportage")) {
    mainViewAdditions.push(
      "Stuurinformatie ondersteunt nog niet genoeg in dagelijkse en bestuurlijke sturing."
    );
    firstStepAdditions.push(
      "Werk toe naar duidelijke KPI-definities en een beperkte set managementinzichten."
    );
  }

  if (bottlenecks.includes("afas")) {
    mainViewAdditions.push(
      "AFAS sluit nog niet overal goed aan op de gewenste werkwijze."
    );
    firstStepAdditions.push(
      "Kijk gericht naar standaardinrichting, workflow en de aansluiting tussen proces en systeem."
    );
  }

  if (focusAreas.includes("processen_werkwijze")) {
    mainViewAdditions.push(
      "Standaardisatie en uitvoerbaarheid wegen extra zwaar mee in deze scan."
    );
  }

  if (focusAreas.includes("rapportage_sturing")) {
    mainViewAdditions.push(
      "De scan richt zich mede op inzicht en bestuurlijke grip."
    );
  }

  if (afasProducts.includes("financieel")) {
    mainViewAdditions.push(
      "Financiële processen en sturing zijn relevant voor de verbeteropgave."
    );
  }

  if (afasProducts.includes("ordermanagement")) {
    mainViewAdditions.push(
      "Orderprocessen en de aansluiting op uitvoering of facturatie spelen een rol."
    );
  }

  if (afasProducts.includes("workflow")) {
    mainViewAdditions.push(
      "Workflow is relevant voor standaardisatie en beheersing."
    );
  }

  if (processChains.includes("order_to_cash")) {
    mainViewAdditions.push(
      "De verbeteropgave ligt vooral in de keten van orderverwerking, uitvoering en facturatie."
    );
    firstStepAdditions.push(
      "Richt de eerste stap op standaardroutes, eigenaarschap en uitzonderingen in order-to-cash."
    );
  }

  if (processChains.includes("procure_to_pay")) {
    mainViewAdditions.push(
      "De scan raakt nadrukkelijk de keten van bestellen, goedkeuren en betalen."
    );
    firstStepAdditions.push(
      "Richt de eerste stap op beheersing van inkoopproces, workflow en factuurafhandeling."
    );
  }

  if (processChains.includes("reporting_control")) {
    mainViewAdditions.push(
      "Rapportage en bestuurlijke sturing vormen een belangrijk deel van de context."
    );
    firstStepAdditions.push(
      "Werk toe naar eenduidige definities, eigenaarschap en een beperkte set stuurinformatie."
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
    "De organisatie heeft op hoofdlijnen een bruikbare basis. De volgende stap ligt vooral in gericht verbeteren en verder aanscherpen.";

  if (lowSignals >= 4) {
    headline = "Stabiliseren";
    baseMainView =
      "De basis is nog niet stevig genoeg voor bredere doorontwikkeling. Werkwijze, besluitvorming en beheersing vragen eerst rust en duidelijkheid.";
  } else if (
    ownershipClarity === "onvoldoende_duidelijk" ||
    changeDecisionProcess === "ad_hoc"
  ) {
    headline = "Aanscherpen";
    baseMainView =
      "Er is een bruikbare basis, maar eerst moeten een paar kernpunten strakker. De grootste winst zit in eigenaarschap en besluitvorming.";
  } else if (
    processStandardization === "sterk_verschillend" ||
    exceptionControl === "uitzondering_is_norm"
  ) {
    headline = "Aanscherpen";
    baseMainView =
      "De basis is aanwezig, maar processen leunen nog te veel op verschillen en uitzonderingen. Meer standaardisatie is de logische eerste stap.";
  }

  const contextAdditions = buildAdviceContextAdditions(scan);

  const mainView = [
    baseMainView,
    ...contextAdditions.mainViewAdditions.slice(0, 1),
  ].join(" ");

  let firstStep =
    "Prioriteer de belangrijkste verbeterkansen en zet die om in een concreet verbeterplan.";

  if (headline === "Stabiliseren") {
    firstStep =
      "Breng eerst verantwoordelijkheden, werkwijze en uitzonderingen terug naar een beheersbaar niveau.";
  } else if (headline === "Aanscherpen") {
    firstStep =
      "Scherp de basis aan zodat gerichte verbetering mogelijk wordt.";
  }

  const firstStepFull = [
    firstStep,
    ...contextAdditions.firstStepAdditions.slice(0, 1),
  ].join(" ");

  return {
    headline,
    mainView,
    firstStep: firstStepFull,
  };
}

function buildNextActions(scan: ScanState, headline: string) {
  const actions: string[] = [];

  if (headline === "Stabiliseren") {
    actions.push("Benoem eigenaar per kernproces");
    actions.push("Werk met één standaardroute per kernproces");
    actions.push("Beperk de grootste uitzonderingen");
    return actions;
  }

  if (scan.profile.biggestBottleneck.includes("eigenaarschap")) {
    actions.push("Benoem proceseigenaren");
  }

  if (scan.profile.biggestBottleneck.includes("processen")) {
    actions.push("Kies 3 grootste procesafwijkingen");
  }

  if (scan.profile.biggestBottleneck.includes("rapportage")) {
    actions.push("Maak KPI-definities eenduidig");
  }

  if (scan.profile.afasProducts.includes("workflow")) {
    actions.push("Leg de route voor wijzigingen vast");
  }

  if (scan.profile.primaryProcessChains.includes("order_to_cash")) {
    actions.push("Breng order-to-cash terug naar één standaardroute");
  }

  if (actions.length < 3) {
    actions.push("Benoem eigenaar per kernproces");
  }
  if (actions.length < 3) {
    actions.push("Leg besluitvorming over wijzigingen vast");
  }
  if (actions.length < 3) {
    actions.push("Prioriteer de grootste uitzonderingen");
  }

  return unique(actions).slice(0, 3);
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
  const questions = getQuestionsForSection(sectionCode, scan);

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
    ? getQuestionsForSection(nextSectionCode, scan)
    : [];
  const nextQuestionKey = nextSectionQuestions[0]?.key ?? "";

  const hasNextStep = Boolean(nextSectionCode && nextQuestionKey);
  const nextHref = hasNextStep
    ? `/scan/${scanId}/flow/${nextSectionCode}/${nextQuestionKey}`
    : "";

  const canContinue = questions.every((question) => {
    if (!question.required) return true;

    const answer = getAnswerFromScan(scan, question.key);
    if (Array.isArray(answer)) return answer.length > 0;
    return answer.trim() !== "";
  });

  const isFinalStep = !hasNextStep;
  const adviceSummary = isFinalStep ? buildAdviceSummary(scan) : null;
  const domainScores = isFinalStep ? buildDomainScores(scan) : [];
  const contextSummary = isFinalStep ? buildScanContextSummary(scan) : null;
  const attentionCards = isFinalStep ? buildAttentionCards(scan) : [];
  const nextActions =
    isFinalStep && adviceSummary
      ? buildNextActions(scan, adviceSummary.headline)
      : [];

  const statusMeta = adviceSummary
    ? getStatusMeta(adviceSummary.headline)
    : null;

  const compactContext = contextSummary
    ? {
        bottlenecks: scan.profile.biggestBottleneck.map((item) => {
          const optionSet = getOptionSet("biggest_bottleneck_options");
          return (
            optionSet?.options.find((option) => option.value === item)?.label ?? item
          );
        }),
        focus: scan.scope.focus.map((item) => {
          const optionSet = getOptionSet("scope_focus_options");
          return optionSet?.options.find((option) => option.value === item)?.label ?? item;
        }),
        products: scan.profile.afasProducts.map((item) => {
          const optionSet = getOptionSet("afas_products_options");
          return optionSet?.options.find((option) => option.value === item)?.label ?? item;
        }),
        chains: scan.profile.primaryProcessChains.map((item) => {
          const optionSet = getOptionSet("primary_process_chains_options");
          return optionSet?.options.find((option) => option.value === item)?.label ?? item;
        }),
      }
    : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {section.title} — samenvatting
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Samenvatting</h1>
        <p className="text-sm text-muted-foreground">
          Controleer of de ingevulde gegevens goed zijn ingevuld.
        </p>
      </div>

      {!isFinalStep && (
        <section className="space-y-3 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
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
                  className="rounded-2xl border border-black/10 bg-white/80 p-4"
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
                    <div className="mt-3 rounded-xl border border-black/8 bg-black/[0.025] p-3">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
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

      {isFinalStep && canContinue && adviceSummary && statusMeta && (
        <>
          <section className={`rounded-3xl border p-4 ${statusMeta.tone}`}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${statusMeta.badge}`}
                >
                  {statusMeta.icon}
                </div>

                <div className="text-xl font-semibold tracking-tight">
                  {adviceSummary.headline}
                </div>
              </div>

              <p className="text-sm leading-6">{adviceSummary.mainView}</p>

              <div className="space-y-1">
                <div className="text-[11px] font-medium uppercase tracking-wide opacity-70">
                  Focus nu op
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${statusMeta.chipTone}`}
                  >
                    Eigenaarschap
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${statusMeta.chipTone}`}
                  >
                    Standaardisatie
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${statusMeta.chipTone}`}
                  >
                    Uitzonderingen
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
            <h2 className="text-lg font-medium">Domeinscores</h2>

            <div className="space-y-5">
              {domainScores.map((domain) => (
                <div key={domain.code} className="space-y-1.5">
                  <div className="text-base font-semibold">{domain.title}</div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="shrink-0 text-muted-foreground">
                      {getScoreLabel(domain.score)}
                    </span>

                    <div className="flex items-center gap-[2px]">
                      {Array.from({ length: 10 }).map((_, index) => {
                        const filledBlocks = getFilledBlocks(domain.score);
                        const isFilled = index < filledBlocks;

                        return (
                          <span
                            key={index}
                            className={
                              isFilled
                                ? "h-2.5 w-2.5 rounded-[2px] bg-black"
                                : "h-2.5 w-2.5 rounded-[2px] border border-black/20 bg-white"
                            }
                          />
                        );
                      })}
                    </div>

                    <span className="shrink-0 text-sm font-medium">
                      {domain.score.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {attentionCards.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-medium">Belangrijkste aandachtspunten</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {attentionCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-black/10 bg-white p-4"
                  >
                    <div className="text-sm font-semibold">{card.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {card.text}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {compactContext && (
            <section className="space-y-3 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
              <h2 className="text-lg font-medium">Context van de scan</h2>

              <div className="space-y-3 rounded-2xl border border-black/10 bg-white/80 p-4">
                {compactContext.bottlenecks.length > 0 && (
                  <div className="text-sm">
                    <span className="font-semibold">Knelpunten:</span>{" "}
                    <span className="text-muted-foreground">
                      {compactContext.bottlenecks.join(", ")}
                    </span>
                  </div>
                )}

                {compactContext.focus.length > 0 && (
                  <div className="text-sm">
                    <span className="font-semibold">Focus:</span>{" "}
                    <span className="text-muted-foreground">
                      {compactContext.focus.join(", ")}
                    </span>
                  </div>
                )}

                {compactContext.products.length > 0 && (
                  <div className="text-sm">
                    <span className="font-semibold">AFAS-context:</span>{" "}
                    <span className="text-muted-foreground">
                      {compactContext.products.join(", ")}
                    </span>
                  </div>
                )}

                {compactContext.chains.length > 0 && (
                  <div className="text-sm">
                    <span className="font-semibold">Procesketens:</span>{" "}
                    <span className="text-muted-foreground">
                      {compactContext.chains.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="space-y-3 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-medium">Volgende stap</h2>
              <p className="text-sm text-muted-foreground">
                {adviceSummary.firstStep}
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-sm font-semibold">Doe dit eerst</div>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {nextActions.map((action) => (
                  <li key={action} className="ml-5 list-disc">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {Object.entries(scan.comments).filter(([, value]) => value.trim() !== "")
            .length > 0 && (
            <section className="space-y-3 rounded-3xl border border-black/10 bg-black/[0.01] p-5">
              <h2 className="text-lg font-medium">Opmerkingen uit de scan</h2>

              <div className="space-y-3">
                {[
                  ...getQuestionsForSection("profile_basis", scan),
                  ...getQuestionsForSection("profile_reason", scan),
                  ...getQuestionsForSection("scope", scan),
                  ...getQuestionsForSection("diagnose", scan),
                ]
                  .filter((question) => {
                    const comment = scan.comments[question.key]?.trim() ?? "";
                    return comment !== "";
                  })
                  .map((question) => (
                    <div
                      key={question.key}
                      className="rounded-2xl border border-black/10 bg-white/80 p-4"
                    >
                      <div className="text-sm font-semibold">{question.label}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {scan.comments[question.key]}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-black/10 bg-black/[0.01] p-5">
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Scan afgerond</h2>
              <p className="text-sm text-muted-foreground">
                Je kunt de samenvatting exporteren, een nieuwe scan starten of deze scan resetten.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium"
              >
                Exporteer samenvatting
              </button>

              <Link
                href="/scan/nieuw/flow/profile_basis/customer_name"
                className="kweekers-primary-button"
                onClick={() => resetScan()}
              >
                Nieuwe scan starten
              </Link>

              <button
                type="button"
                onClick={() => resetScan()}
                className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium"
              >
                Reset scan
              </button>
            </div>
          </section>
        </>
      )}

      <div className="flex items-center justify-between border-t pt-6">
        <Link
          href={previousHref}
          className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium"
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
              className="inline-flex cursor-not-allowed items-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-muted-foreground opacity-60"
            >
              Verder →
            </span>
          )
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-muted-foreground opacity-60"
          >
            Einde van de scan
          </span>
        )}
      </div>
    </div>
  );
}
