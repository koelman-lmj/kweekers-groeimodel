"use client";

import { useMemo, useState, type ReactNode } from "react";

type ViewId =
  | "dashboard"
  | "start"
  | "organisatie"
  | "onderwerpen"
  | "crm"
  | "diagnose"
  | "roadmap";

type AfasStatus = "Ja" | "Deels" | "Nee" | "Weet ik niet";

type RadarAnswer =
  | "Ja"
  | "Soms"
  | "Nee"
  | "Weet ik niet"
  | "Niet van toepassing";

type Status =
  | "Waarschijnlijk relevant"
  | "Kort toetsen"
  | "Nader verkennen"
  | "Nu niet primair";

type TopicId =
  | "crm"
  | "financieel"
  | "ordermanagement"
  | "projecten"
  | "hrm"
  | "rapportage"
  | "integraties"
  | "samenwerking";

type OrgKey =
  | "situatie"
  | "richting"
  | "beheer"
  | "eigenaarschap"
  | "verandering"
  | "randvoorwaarden";

type Profile = {
  organisatie: string;
  sector: string;
  gesprekstype: string;
  afasStatus: AfasStatus;
  aanleiding: string;
  consultant: string;
  datum: string;
};

type Topic = {
  id: TopicId;
  title: string;
  question: string;
  shortLabel: string;
  examples: Partial<Record<string, string>>;
};

type CrmQuestion = {
  id: string;
  question: string;
  help: string;
  examples: Partial<Record<string, string>>;
};

const brand = {
  navy: "#30385F",
  navyDark: "#1F2748",
  orange: "#EF7043",
  light: "#F6F8FB",
  border: "#E3E8F0",
};

const sectorOptions = [
  "Onderwijs",
  "Zorg & welzijn",
  "Zakelijke dienstverlening",
  "Ledenorganisatie",
  "Handel / groothandel",
  "Productie",
  "Overheid / non-profit",
  "Anders",
];

const profileInitial: Profile = {
  organisatie: "LMJ BV",
  sector: "Onderwijs",
  gesprekstype: "Periodieke check",
  afasStatus: "Ja",
  aanleiding:
    "We willen bepalen wat goed werkt, waar het knelt en welke stappen logisch zijn voor de roadmap.",
  consultant: "Sjoerd Koelman",
  datum: "2026-04-26",
};

const orgQuestions: {
  key: OrgKey;
  title: string;
  question: string;
  options: string[];
}[] = [
  {
    key: "situatie",
    title: "Huidige situatie",
    question: "Hoe voelt de huidige situatie?",
    options: [
      "Rustig en stabiel",
      "In ontwikkeling",
      "Er loopt veel tegelijk",
      "Er is onrust of herstructurering",
      "Sterke groei",
      "Kosten- of capaciteitsdruk",
    ],
  },
  {
    key: "richting",
    title: "Richting",
    question: "Wat is de belangrijkste beweging voor de komende periode?",
    options: [
      "Meer grip",
      "Minder handwerk",
      "Betere samenwerking",
      "Betere rapportage",
      "Meer standaard werken",
      "Meer uit AFAS halen",
      "Voorbereiden op groei",
    ],
  },
  {
    key: "beheer",
    title: "Beheerorganisatie",
    question: "Wie zorgt dat AFAS, processen en afspraken goed blijven werken?",
    options: [
      "Duidelijk belegd",
      "Bij een klein team",
      "Bij één persoon",
      "Verspreid over afdelingen",
      "Niet duidelijk",
    ],
  },
  {
    key: "eigenaarschap",
    title: "Eigenaarschap",
    question: "Is duidelijk wie eigenaar is van processen en verbeteringen?",
    options: [
      "Meestal duidelijk",
      "Soms duidelijk",
      "Vaak onduidelijk",
      "Besluiten blijven liggen",
      "Iedere afdeling kijkt naar eigen stuk",
    ],
  },
  {
    key: "verandering",
    title: "Veranderkracht",
    question: "Hoe gaat de organisatie meestal om met verandering?",
    options: [
      "Mensen doen goed mee",
      "Het lukt met begeleiding",
      "Er is vaak weerstand",
      "Verandering blijft soms hangen",
      "Het hangt af van een paar mensen",
    ],
  },
  {
    key: "randvoorwaarden",
    title: "Tijd, budget en capaciteit",
    question: "Is er ruimte om verbeteringen ook echt op te pakken?",
    options: ["Ja, duidelijk", "Deels", "Nog niet duidelijk", "Beperkt", "Nee"],
  },
];

const orgInitial: Record<OrgKey, string> = {
  situatie: "In ontwikkeling",
  richting: "Meer grip",
  beheer: "Bij een klein team",
  eigenaarschap: "Soms duidelijk",
  verandering: "Het lukt met begeleiding",
  randvoorwaarden: "Deels",
};

const topics: Topic[] = [
  {
    id: "crm",
    title: "Klanten & relaties",
    shortLabel: "CRM / Relatiebeheer",
    question:
      "Hebben jullie relaties, partners, klanten of andere partijen waar jullie vaker contact mee hebben?",
    examples: {
      Onderwijs:
        "Denk aan stagebedrijven, studenten, ouders/verzorgers, gemeenten of samenwerkingspartners.",
      "Zorg & welzijn":
        "Denk aan cliënten, verwijzers, gemeenten, zorgpartners of leveranciers.",
      "Zakelijke dienstverlening":
        "Denk aan klanten, prospects, leveranciers, partners of contactpersonen.",
    },
  },
  {
    id: "financieel",
    title: "Geld & facturen",
    shortLabel: "Financieel",
    question:
      "Gaat er geld in of uit via facturen, betalingen, declaraties of kosten die gecontroleerd moeten worden?",
    examples: {},
  },
  {
    id: "ordermanagement",
    title: "Orders & leveringen",
    shortLabel: "Ordermanagement",
    question:
      "Hebben jullie aanvragen, orders, leveringen, inkopen of voorraadstromen?",
    examples: {},
  },
  {
    id: "projecten",
    title: "Klussen & projecten",
    shortLabel: "Projecten",
    question:
      "Doen jullie werk dat over meerdere dagen of weken loopt, waarbij uren, kosten of voortgang belangrijk zijn?",
    examples: {},
  },
  {
    id: "hrm",
    title: "Medewerkers",
    shortLabel: "HRM",
    question:
      "Spelen processen rondom medewerkers, verlof, verzuim, onboarding of wijzigingen een belangrijke rol?",
    examples: {},
  },
  {
    id: "rapportage",
    title: "Rapportage & grip",
    shortLabel: "Rapportage & sturing",
    question:
      "Hebben jullie vaste overzichten nodig om te sturen of besluiten te nemen?",
    examples: {},
  },
  {
    id: "integraties",
    title: "Systemen & koppelingen",
    shortLabel: "Integraties",
    question:
      "Gebruiken jullie naast AFAS ook andere systemen die informatie uitwisselen?",
    examples: {},
  },
  {
    id: "samenwerking",
    title: "Samenwerking & verandering",
    shortLabel: "Organisatievolwassenheid",
    question:
      "Zijn samenwerking, eigenaarschap, communicatie of verandervermogen belangrijke aandachtspunten?",
    examples: {},
  },
];

const topicInitial: Record<TopicId, RadarAnswer> = {
  crm: "Ja",
  financieel: "Soms",
  ordermanagement: "Weet ik niet",
  projecten: "Soms",
  hrm: "Nee",
  rapportage: "Ja",
  integraties: "Soms",
  samenwerking: "Ja",
};

const crmQuestions: CrmQuestion[] = [
  {
    id: "crm-1",
    question:
      "Zijn de laatste afspraken met een relatie snel terug te vinden?",
    help:
      "Hiermee toetsen we of relatie-informatie centraal vindbaar is of verspreid staat.",
    examples: {
      Onderwijs:
        "Bijvoorbeeld de laatste afspraak met een stagebedrijf, ouder/verzorger of samenwerkingspartner.",
      "Zorg & welzijn":
        "Bijvoorbeeld de laatste afspraak met een gemeente, verwijzer of zorgpartner.",
      "Zakelijke dienstverlening":
        "Bijvoorbeeld de laatste afspraak met een klant, prospect of partner.",
    },
  },
  {
    id: "crm-2",
    question:
      "Staan relatiegegevens of afspraken verspreid in mail, Teams, Excel of losse lijstjes?",
    help:
      "Dit wijst vaak op versnipperde informatie en afhankelijkheid van personen.",
    examples: {},
  },
  {
    id: "crm-3",
    question:
      "Blijft opvolging soms liggen omdat niet duidelijk is wie iets moet doen?",
    help:
      "Denk aan terugbellen, bevestigen, informatie toesturen of een afspraak opvolgen.",
    examples: {},
  },
  {
    id: "crm-4",
    question: "Welke CRM-route past het beste?",
    help:
      "Niet elke klant heeft sales nodig. Soms gaat het vooral om relaties, afspraken of partners.",
    examples: {},
  },
];

const crmInitialAnswers: Record<string, RadarAnswer> = {
  "crm-1": "Soms",
  "crm-2": "Ja",
  "crm-3": "Soms",
};

const crmRouteOptions = [
  "Relaties en afspraken centraal vastleggen",
  "Nieuwe klanten, kansen of offertes volgen",
  "Klanten of partners digitaal laten communiceren",
  "Cursussen, trainingen of inschrijvingen beheren",
  "Sollicitanten of kandidaten opvolgen",
  "Weet ik nog niet",
];

const crmPriorityOptions = [
  "Relatiegegevens staan verspreid",
  "Afspraken zijn niet goed terug te vinden",
  "Opvolging blijft soms liggen",
  "We gebruiken veel Excel of losse lijstjes",
  "We zijn afhankelijk van kennis van één of enkele mensen",
];

export default function Home() {
  const [view, setView] = useState<ViewId>("dashboard");
  const [profile, setProfile] = useState<Profile>(profileInitial);
  const [orgAnswers, setOrgAnswers] =
    useState<Record<OrgKey, string>>(orgInitial);
  const [topicAnswers, setTopicAnswers] =
    useState<Record<TopicId, RadarAnswer>>(topicInitial);
  const [crmStep, setCrmStep] = useState(0);
  const [crmAnswers, setCrmAnswers] =
    useState<Record<string, RadarAnswer>>(crmInitialAnswers);
  const [crmRoute, setCrmRoute] = useState("Relaties en afspraken centraal vastleggen");
  const [crmPriorities, setCrmPriorities] = useState<string[]>([
    "Relatiegegevens staan verspreid",
    "Afspraken zijn niet goed terug te vinden",
  ]);
  const [crmExample, setCrmExample] = useState(
    "Afspraken met relaties staan nu verspreid in mail, Excel en persoonlijke notities."
  );

  const orgStrength = useMemo(
    () => calculateOrgStrength(orgAnswers),
    [orgAnswers]
  );

  const topicStatuses = useMemo(() => {
    return Object.fromEntries(
      topics.map((topic) => [topic.id, getStatus(topicAnswers[topic.id])])
    ) as Record<TopicId, Status>;
  }, [topicAnswers]);

  const crmStatus = useMemo(
    () => calculateCrmStatus(topicAnswers.crm, crmAnswers, crmPriorities),
    [topicAnswers.crm, crmAnswers, crmPriorities]
  );

  const roadmap = useMemo(
    () => buildRoadmap(orgStrength, crmStatus, topicStatuses, crmPriorities),
    [orgStrength, crmStatus, topicStatuses, crmPriorities]
  );

  return (
    <main className="min-h-screen" style={{ backgroundColor: brand.light }}>
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-white p-6 lg:block">
          <img src="/kweekers-logo.png" alt="KWEEKERS" className="h-10 w-auto" />

          <h1 className="mt-5 text-2xl font-semibold" style={{ color: brand.navy }}>
            Groeimodel
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Rustige gesprekstool voor klantteams.
          </p>

          <nav className="mt-10 space-y-2">
            <NavButton active={view === "dashboard"} onClick={() => setView("dashboard")}>
              Dashboard
            </NavButton>
            <NavButton active={view === "start"} onClick={() => setView("start")}>
              Nieuwe scan
            </NavButton>
            <NavButton active={view === "diagnose"} onClick={() => setView("diagnose")}>
              Diagnose
            </NavButton>
            <NavButton active={view === "roadmap"} onClick={() => setView("roadmap")}>
              Roadmap
            </NavButton>
          </nav>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold" style={{ color: brand.navy }}>
              Ontwerpprincipe
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Eén vraag tegelijk. Eerst organisatiekracht, daarna pas onderwerpen.
            </p>
          </div>
        </aside>

        <section className="flex-1">
          <header className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="mx-auto max-w-7xl">
              <p className="text-sm font-medium text-slate-500">
                MVP · rustige herbouw
              </p>
              <h2 className="text-2xl font-semibold" style={{ color: brand.navy }}>
                KWEEKERS Groeimodel
              </h2>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8">
            {view === "dashboard" && (
              <Dashboard onStart={() => setView("start")} />
            )}

            {view === "start" && (
              <StartScreen
                profile={profile}
                setProfile={setProfile}
                onNext={() => setView("organisatie")}
              />
            )}

            {view === "organisatie" && (
              <OrganizationScreen
                answers={orgAnswers}
                setAnswers={setOrgAnswers}
                strength={orgStrength}
                onBack={() => setView("start")}
                onNext={() => setView("onderwerpen")}
              />
            )}

            {view === "onderwerpen" && (
              <TopicsScreen
                sector={profile.sector}
                answers={topicAnswers}
                setAnswers={setTopicAnswers}
                statuses={topicStatuses}
                onBack={() => setView("organisatie")}
                onNext={() => setView("crm")}
              />
            )}

            {view === "crm" && (
              <CrmScreen
                sector={profile.sector}
                step={crmStep}
                setStep={setCrmStep}
                answers={crmAnswers}
                setAnswers={setCrmAnswers}
                route={crmRoute}
                setRoute={setCrmRoute}
                priorities={crmPriorities}
                setPriorities={setCrmPriorities}
                example={crmExample}
                setExample={setCrmExample}
                onBack={() => setView("onderwerpen")}
                onNext={() => setView("diagnose")}
              />
            )}

            {view === "diagnose" && (
              <DiagnosisScreen
                profile={profile}
                orgStrength={orgStrength}
                topicStatuses={topicStatuses}
                crmStatus={crmStatus}
                crmRoute={crmRoute}
                crmPriorities={crmPriorities}
                crmExample={crmExample}
                onBack={() => setView("crm")}
                onNext={() => setView("roadmap")}
              />
            )}

            {view === "roadmap" && (
              <RoadmapScreen
                roadmap={roadmap}
                onBack={() => setView("diagnose")}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Dashboard({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-6">
      <section
        className="rounded-3xl p-8 text-white shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${brand.navy}, ${brand.navyDark})`,
        }}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
          KWEEKERS Groeimodel
        </p>
        <h3 className="mt-4 max-w-3xl text-4xl font-semibold">
          Van gesprek naar diagnose en roadmap.
        </h3>
        <p className="mt-4 max-w-2xl leading-7 text-slate-300">
          Niet starten met AFAS-modules, maar met organisatiebeeld, relevante
          onderwerpen en concrete vervolgstappen.
        </p>

        <button
          onClick={onStart}
          className="mt-8 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: brand.orange }}
        >
          Nieuwe scan starten
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold" style={{ color: brand.navy }}>
          Uitgangspunt
        </h3>
        <p className="mt-3 max-w-4xl leading-7 text-slate-600">
          Het groeimodel is bedoeld voor organisaties die minimaal één jaar
          operationeel werken met AFAS en de ingerichte processen. De tool kijkt
          breder dan AFAS alleen: ook processen, eigenaarschap, samenwerking,
          integraties, data en rapportage tellen mee.
        </p>
      </section>
    </div>
  );
}

function StartScreen({
  profile,
  setProfile,
  onNext,
}: {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  onNext: () => void;
}) {
  const advice = getAfasAdvice(profile.afasStatus);

  return (
    <div className="space-y-6">
      <HeaderCard
        step="Start gesprek"
        title="Eerst de context scherp"
        description="We leggen alleen vast waarom we dit gesprek voeren en hoe we de uitkomst moeten lezen."
        action="Naar organisatiebeeld"
        onAction={onNext}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Organisatie"
            value={profile.organisatie}
            onChange={(value) => setProfile({ ...profile, organisatie: value })}
          />

          <SelectField
            label="Sector"
            value={profile.sector}
            options={sectorOptions}
            onChange={(value) => setProfile({ ...profile, sector: value })}
          />

          <SelectField
            label="Type gesprek"
            value={profile.gesprekstype}
            options={[
              "Eerste verkenning",
              "Nulmeting",
              "Periodieke check",
              "Herijking bestaande klant",
              "Verdieping op bekend knelpunt",
            ]}
            onChange={(value) => setProfile({ ...profile, gesprekstype: value })}
          />

          <SelectField
            label="Werkt minimaal 1 jaar met AFAS?"
            value={profile.afasStatus}
            options={["Ja", "Deels", "Nee", "Weet ik niet"]}
            onChange={(value) =>
              setProfile({ ...profile, afasStatus: value as AfasStatus })
            }
          />

          <TextField
            label="Consultant"
            value={profile.consultant}
            onChange={(value) => setProfile({ ...profile, consultant: value })}
          />

          <TextField
            label="Datum"
            type="date"
            value={profile.datum}
            onChange={(value) => setProfile({ ...profile, datum: value })}
          />
        </div>

        <div className="mt-6">
          <TextArea
            label="Korte aanleiding"
            value={profile.aanleiding}
            onChange={(value) => setProfile({ ...profile, aanleiding: value })}
          />
        </div>

        <div
          className="mt-6 rounded-2xl p-5"
          style={{ backgroundColor: brand.light, border: `1px solid ${brand.border}` }}
        >
          <p className="font-semibold" style={{ color: brand.navy }}>
            Gebruik van de scan: {advice.title}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {advice.description}
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <PrimaryButton onClick={onNext} accent>
            Naar organisatiebeeld
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function OrganizationScreen({
  answers,
  setAnswers,
  strength,
  onBack,
  onNext,
}: {
  answers: Record<OrgKey, string>;
  setAnswers: (answers: Record<OrgKey, string>) => void;
  strength: string;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <HeaderCard
        step="Organisatiebeeld"
        title="Kan de organisatie verbetering dragen?"
        description="Eerst bepalen we hoe de organisatie werkt, verandert en eigenaarschap organiseert."
        action="Naar onderwerpenradar"
        onAction={onNext}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {orgQuestions.map((item) => (
          <QuestionCard key={item.key} title={item.title} question={item.question}>
            <ChoiceGroup
              options={item.options}
              value={answers[item.key]}
              onChange={(value) => setAnswers({ ...answers, [item.key]: value })}
            />
          </QuestionCard>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Tussenbeeld
        </p>
        <h3 className="mt-2 text-2xl font-semibold" style={{ color: brand.navy }}>
          Organisatiekracht: {strength}
        </h3>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          Dit bepaalt straks hoe zwaar de roadmap moet worden begeleid. Een
          inhoudelijk goed idee werkt alleen als eigenaarschap, capaciteit en
          veranderkracht voldoende aanwezig zijn.
        </p>

        <div className="mt-8 flex justify-between">
          <SecondaryButton onClick={onBack}>Terug</SecondaryButton>
          <PrimaryButton onClick={onNext}>Naar onderwerpenradar</PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function TopicsScreen({
  sector,
  answers,
  setAnswers,
  statuses,
  onBack,
  onNext,
}: {
  sector: string;
  answers: Record<TopicId, RadarAnswer>;
  setAnswers: (answers: Record<TopicId, RadarAnswer>) => void;
  statuses: Record<TopicId, Status>;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <HeaderCard
        step="Onderwerpenradar"
        title="Wat moeten we verder bekijken?"
        description="We openen onderwerpen alleen als ze herkenbaar zijn. Wat nu niet primair is, blijft zichtbaar maar wordt geparkeerd."
        action="Naar CRM-verdieping"
        onAction={onNext}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {topics.map((topic) => {
          const example =
            topic.examples[sector] ??
            "Gebruik deze vraag als snelle poortwachter. Bij twijfel: kort toetsen, niet meteen verdiepen.";

          return (
            <QuestionCard
              key={topic.id}
              title={topic.title}
              question={topic.question}
              footer={
                <StatusPill status={statuses[topic.id]} />
              }
            >
              <p className="mb-4 text-sm leading-6 text-slate-600">
                {example}
              </p>

              <AnswerGroup
                value={answers[topic.id]}
                onChange={(value) => setAnswers({ ...answers, [topic.id]: value })}
              />
            </QuestionCard>
          );
        })}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between">
          <SecondaryButton onClick={onBack}>Terug</SecondaryButton>
          <PrimaryButton onClick={onNext} accent>
            CRM verdiepen
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function CrmScreen({
  sector,
  step,
  setStep,
  answers,
  setAnswers,
  route,
  setRoute,
  priorities,
  setPriorities,
  example,
  setExample,
  onBack,
  onNext,
}: {
  sector: string;
  step: number;
  setStep: (step: number) => void;
  answers: Record<string, RadarAnswer>;
  setAnswers: (answers: Record<string, RadarAnswer>) => void;
  route: string;
  setRoute: (route: string) => void;
  priorities: string[];
  setPriorities: (values: string[]) => void;
  example: string;
  setExample: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const total = crmQuestions.length + 2;
  const isPainQuestion = step < crmQuestions.length;
  const question = crmQuestions[step];

  function goNext() {
    if (step >= total - 1) {
      onNext();
      return;
    }
    setStep(step + 1);
  }

  function goBack() {
    if (step === 0) {
      onBack();
      return;
    }
    setStep(step - 1);
  }

  return (
    <div className="space-y-6">
      <HeaderCard
        step={`CRM-verdieping · ${step + 1} van ${total}`}
        title="Klanten & relaties"
        description="Nu verdiepen we alleen CRM, omdat dit onderwerp in de radar relevant lijkt."
        action={step >= total - 1 ? "Naar diagnose" : "Volgende"}
        onAction={goNext}
      />

      {isPainQuestion && (
        <QuestionCard title="Vraag" question={question.question}>
          <p className="mb-4 text-sm leading-6 text-slate-600">{question.help}</p>

          <div
            className="mb-5 rounded-2xl p-4"
            style={{ backgroundColor: brand.light, border: `1px solid ${brand.border}` }}
          >
            <p className="text-sm font-semibold" style={{ color: brand.navy }}>
              Praktijkvoorbeeld
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {question.examples[sector] ??
                "Bijvoorbeeld een afspraak, contactmoment of opvolgactie die meerdere collega’s moeten kunnen terugvinden."}
            </p>
          </div>

          <AnswerGroup
            value={answers[question.id] ?? "Weet ik niet"}
            onChange={(value) => setAnswers({ ...answers, [question.id]: value })}
          />

          <div className="mt-6">
            <TextArea
              label="Voorbeeld uit gesprek"
              value={example}
              onChange={setExample}
            />
          </div>
        </QuestionCard>
      )}

      {step === crmQuestions.length && (
        <QuestionCard
          title="Route"
          question="Welk soort CRM lijkt hier het beste te passen?"
        >
          <ChoiceGroup
            options={crmRouteOptions}
            value={route}
            onChange={setRoute}
          />
        </QuestionCard>
      )}

      {step === crmQuestions.length + 1 && (
        <QuestionCard
          title="Prioriteit"
          question="Waar moeten we als eerste naar kijken?"
        >
          <MultiChoiceGroup
            options={crmPriorityOptions}
            values={priorities}
            onChange={setPriorities}
          />
        </QuestionCard>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between">
          <SecondaryButton onClick={goBack}>Terug</SecondaryButton>
          <PrimaryButton onClick={goNext} accent={step >= total - 1}>
            {step >= total - 1 ? "Naar diagnose" : "Volgende"}
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function DiagnosisScreen({
  profile,
  orgStrength,
  topicStatuses,
  crmStatus,
  crmRoute,
  crmPriorities,
  crmExample,
  onBack,
  onNext,
}: {
  profile: Profile;
  orgStrength: string;
  topicStatuses: Record<TopicId, Status>;
  crmStatus: Status;
  crmRoute: string;
  crmPriorities: string[];
  crmExample: string;
  onBack: () => void;
  onNext: () => void;
}) {
  const topTopics = topics.filter((topic) =>
    ["Waarschijnlijk relevant", "Kort toetsen"].includes(topicStatuses[topic.id])
  );

  return (
    <div className="space-y-6">
      <HeaderCard
        step="Diagnose"
        title="Wat zien we?"
        description="De diagnose combineert organisatiekracht, relevante onderwerpen en concrete gespreksstof."
        action="Naar roadmap"
        onAction={onNext}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <SummaryCard title="Organisatie" value={profile.organisatie} text={profile.sector} />
        <SummaryCard title="Organisatiekracht" value={orgStrength} text="Bepaalt hoe zwaar de begeleiding moet zijn." />
        <SummaryCard title="CRM-status" value={crmStatus} text={crmRoute} />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold" style={{ color: brand.navy }}>
          Relevante onderwerpen
        </h3>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {topTopics.map((topic) => (
            <div
              key={topic.id}
              className="rounded-2xl p-4"
              style={{ backgroundColor: brand.light, border: `1px solid ${brand.border}` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold" style={{ color: brand.navy }}>
                    {topic.shortLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {topic.question}
                  </p>
                </div>
                <StatusPill status={topicStatuses[topic.id]} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold" style={{ color: brand.navy }}>
          CRM: eerste aandachtspunten
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          {crmPriorities.map((item) => (
            <span
              key={item}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: brand.navy }}
            >
              {item}
            </span>
          ))}
        </div>

        <p className="mt-5 max-w-4xl leading-7 text-slate-600">
          {crmExample}
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between">
          <SecondaryButton onClick={onBack}>Terug</SecondaryButton>
          <PrimaryButton onClick={onNext} accent>
            Naar roadmap
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}

function RoadmapScreen({
  roadmap,
  onBack,
}: {
  roadmap: { title: string; items: string[] }[];
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <HeaderCard
        step="Roadmap"
        title="Eerste roadmap-schets"
        description="Geen definitief projectplan, maar gespreksstof voor keuzes, prioriteiten en vervolg."
        action="Terug naar diagnose"
        onAction={onBack}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        {roadmap.map((block) => (
          <div
            key={block.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold" style={{ color: brand.navy }}>
              {block.title}
            </h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              {block.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

function calculateOrgStrength(answers: Record<OrgKey, string>) {
  let risk = 0;

  if (answers.situatie.includes("onrust")) risk += 2;
  if (answers.situatie.includes("veel tegelijk")) risk += 1;
  if (answers.beheer.includes("één persoon")) risk += 2;
  if (answers.beheer.includes("Niet duidelijk")) risk += 2;
  if (answers.eigenaarschap.includes("onduidelijk")) risk += 2;
  if (answers.eigenaarschap.includes("Besluiten")) risk += 2;
  if (answers.verandering.includes("weerstand")) risk += 2;
  if (answers.verandering.includes("blijft")) risk += 2;
  if (answers.randvoorwaarden.includes("Beperkt")) risk += 2;
  if (answers.randvoorwaarden === "Nee") risk += 3;

  if (risk >= 7) return "Kwetsbaar";
  if (risk >= 4) return "Begeleiding nodig";
  return "Stevig genoeg";
}

function getStatus(answer: RadarAnswer): Status {
  if (answer === "Ja") return "Waarschijnlijk relevant";
  if (answer === "Soms") return "Kort toetsen";
  if (answer === "Weet ik niet") return "Nader verkennen";
  return "Nu niet primair";
}

function calculateCrmStatus(
  radarAnswer: RadarAnswer,
  answers: Record<string, RadarAnswer>,
  priorities: string[]
): Status {
  if (radarAnswer === "Nee" || radarAnswer === "Niet van toepassing") {
    return "Nu niet primair";
  }

  let score = radarAnswer === "Ja" ? 3 : radarAnswer === "Soms" ? 2 : 1;

  Object.values(answers).forEach((answer) => {
    if (answer === "Ja") score += 2;
    if (answer === "Soms") score += 1;
    if (answer === "Weet ik niet") score += 0.5;
  });

  score += priorities.length * 0.5;

  if (score >= 7) return "Waarschijnlijk relevant";
  if (score >= 4) return "Kort toetsen";
  return "Nader verkennen";
}

function buildRoadmap(
  orgStrength: string,
  crmStatus: Status,
  topicStatuses: Record<TopicId, Status>,
  crmPriorities: string[]
) {
  const first: string[] = [
    "Bevestig met het klantteam welke onderwerpen echt prioriteit hebben.",
    "Maak expliciet wie eigenaar is van de gekozen verbeterpunten.",
  ];

  if (orgStrength !== "Stevig genoeg") {
    first.push("Start met eigenaarschap, besluitvorming en beschikbare capaciteit.");
  }

  if (crmStatus === "Waarschijnlijk relevant") {
    first.push("Bepaal welke relaties, contactpersonen en afspraken centraal beheerd moeten worden.");
  }

  const second: string[] = [
    "Werk de gewenste werkwijze uit voor de gekozen onderwerpen.",
    "Bepaal welke informatie nodig is voor rapportage en sturing.",
  ];

  if (topicStatuses.integraties !== "Nu niet primair") {
    second.push("Breng betrokken systemen, dubbele invoer en leidende gegevensbronnen in kaart.");
  }

  const third: string[] = [
    "Vertaal de gekozen verbeteringen naar een compacte klantteam-roadmap.",
    "Bepaal welke punten de klant zelf kan oppakken en waar Kweekers moet begeleiden.",
  ];

  crmPriorities.forEach((priority) => {
    third.push(`CRM-aandachtspunt meenemen: ${priority}.`);
  });

  return [
    { title: "0-30 dagen", items: first },
    { title: "30-60 dagen", items: second },
    { title: "60-90 dagen", items: third },
  ];
}

function getAfasAdvice(status: AfasStatus) {
  if (status === "Ja") {
    return {
      title: "Volledig groeimodel",
      description:
        "De uitkomsten kunnen worden gelezen als volwassenheidsmeting, omdat er voldoende praktijkervaring is.",
    };
  }

  if (status === "Deels") {
    return {
      title: "Beperkte groeiscan",
      description:
        "De uitkomsten zijn bruikbaar, maar voorzichtig lezen. Niet alle processen zijn mogelijk al lang genoeg in gebruik.",
    };
  }

  if (status === "Nee") {
    return {
      title: "Implementatiecheck",
      description:
        "Gebruik dit gesprek niet als volwassenheidsmeting, maar als check op inrichting, adoptie en stabilisatie.",
    };
  }

  return {
    title: "Context eerst verduidelijken",
    description:
      "Bespreek eerst hoe lang AFAS live is en welke processen echt operationeel zijn.",
  };
}

function HeaderCard({
  step,
  title,
  description,
  action,
  onAction,
}: {
  step: string;
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p
            className="text-sm font-semibold uppercase tracking-[0.25em]"
            style={{ color: brand.orange }}
          >
            {step}
          </p>
          <h3 className="mt-2 text-2xl font-semibold" style={{ color: brand.navy }}>
            {title}
          </h3>
          <p className="mt-2 max-w-3xl text-slate-600">{description}</p>
        </div>

        <PrimaryButton onClick={onAction}>{action}</PrimaryButton>
      </div>
    </section>
  );
}

function QuestionCard({
  title,
  question,
  children,
  footer,
}: {
  title: string;
  question: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="mt-2 text-xl font-semibold" style={{ color: brand.navy }}>
            {question}
          </h3>
        </div>
        {footer}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function ChoiceGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <ChoiceButton
          key={option}
          selected={value === option}
          onClick={() => onChange(option)}
        >
          {option}
        </ChoiceButton>
      ))}
    </div>
  );
}

function MultiChoiceGroup({
  options,
  values,
  onChange,
}: {
  options: string[];
  values: string[];
  onChange: (value: string[]) => void;
}) {
  function toggle(option: string) {
    if (values.includes(option)) {
      onChange(values.filter((item) => item !== option));
    } else {
      onChange([...values, option]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <ChoiceButton
          key={option}
          selected={values.includes(option)}
          onClick={() => toggle(option)}
        >
          {option}
        </ChoiceButton>
      ))}
    </div>
  );
}

function AnswerGroup({
  value,
  onChange,
}: {
  value: RadarAnswer;
  onChange: (value: RadarAnswer) => void;
}) {
  const options: RadarAnswer[] = [
    "Ja",
    "Soms",
    "Nee",
    "Weet ik niet",
    "Niet van toepassing",
  ];

  return <ChoiceGroup options={options} value={value} onChange={(v) => onChange(v as RadarAnswer)} />;
}

function ChoiceButton({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition hover:opacity-90 ${
        selected ? "text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
      }`}
      style={selected ? { backgroundColor: brand.navy } : undefined}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: Status }) {
  const color =
    status === "Waarschijnlijk relevant"
      ? brand.navy
      : status === "Kort toetsen"
      ? brand.orange
      : status === "Nader verkennen"
      ? "#64748B"
      : "#CBD5E1";

  return (
    <span
      className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {status}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  text,
}: {
  title: string;
  value: string;
  text: string;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <h3 className="mt-2 text-2xl font-semibold" style={{ color: brand.navy }}>
        {value}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </section>
  );
}

function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
        active ? "text-white" : "text-slate-700 hover:bg-slate-100"
      }`}
      style={active ? { backgroundColor: brand.navy } : undefined}
    >
      {children}
    </button>
  );
}

function PrimaryButton({
  children,
  onClick,
  accent = false,
}: {
  children: ReactNode;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      style={{ backgroundColor: accent ? brand.orange : brand.navy }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
    >
      {children}
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-950"
      />
    </label>
  );
}
