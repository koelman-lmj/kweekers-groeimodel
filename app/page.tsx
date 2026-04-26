"use client";

import { useMemo, useState, type ReactNode } from "react";

type ViewId =
  | "dashboard"
  | "nieuwe-scan"
  | "scan"
  | "resultaten"
  | "roadmap"
  | "rapport";

type DomainKey = "crm" | "financieel" | "ordermanagement" | "projecten";
type IntakeAnswer = "" | "ja" | "deels" | "nee" | "onbekend";
type RelevanceStatus =
  | "Relevant"
  | "Waarschijnlijk relevant"
  | "Nader verkennen"
  | "Niet primair voor deze scan"
  | "Nog niet bepaald";

type ScanForm = {
  organisatienaam: string;
  branche: string;
  medewerkers: string;
  administraties: string;
  typeOrganisatie: string[];
  systemen: string[];
  aanleidingScan: string[];
  consultant: string;
  datum: string;
  context: string;
};

type DomainDefinition = {
  key: DomainKey;
  title: string;
  description: string;
  alwaysRelevant?: boolean;
  excelCode: string;
  afasConnectorField: string;
};

type IntakeQuestionDefinition = {
  id: string;
  sourceId: string;
  text: string;
  helpText: string;
  linkedDomains: DomainKey[];
  relevanceWeight: number;
  active: boolean;
};

type ScanQuestionDefinition = {
  id: string;
  sourceId: string;
  domainKey: DomainKey;
  subdomain: string;
  text: string;
  helpText: string;
  evidenceHint: string;
  weight: number;
  active: boolean;
  applicableBranches: string[];
  applicableOrgTypes: string[];
  lowScoreAdvice: string;
  highScoreAdvice: string;
  benchmarkText: string;
};

type QuestionResponse = {
  score: number;
  toelichting: string;
  bewijs: string;
};

type RelevanceResult = {
  domainKey: DomainKey;
  status: RelevanceStatus;
  reason: string;
  includeInScan: boolean;
};

const scoreModel = [
  { score: 0, label: "Niet aanwezig", description: "Er is geen vaste werkwijze." },
  { score: 1, label: "Ad hoc", description: "Het hangt vooral af van losse acties en personen." },
  { score: 2, label: "Herhaalbaar", description: "Het gebeurt vaker op dezelfde manier, maar is beperkt vastgelegd." },
  { score: 3, label: "Gestandaardiseerd", description: "De werkwijze is bekend en wordt meestal gevolgd." },
  { score: 4, label: "Beheerst", description: "Er is eigenaarschap, controle en sturing." },
  { score: 5, label: "Geoptimaliseerd", description: "Het proces wordt actief verbeterd." },
  { score: 6, label: "Geïntegreerd", description: "Proces, systeem en data sluiten goed op elkaar aan." },
  { score: 7, label: "Data-gedreven", description: "De organisatie stuurt vooruit op basis van data." },
];

const answerOptions: { value: IntakeAnswer; label: string }[] = [
  { value: "ja", label: "Ja" },
  { value: "deels", label: "Deels" },
  { value: "nee", label: "Nee" },
  { value: "onbekend", label: "Onbekend" },
];

const branchOptions = [
  "Zorg & welzijn",
  "Onderwijs",
  "Zakelijke dienstverlening",
  "Handel / groothandel",
  "Productie",
  "Overheid / non-profit",
  "Anders",
];

const employeeOptions = ["1-50", "51-250", "251-1.000", "1.000+"];
const administrationOptions = ["1", "2-5", "6-10", "Meer dan 10"];

const organizationTypeOptions = [
  "Projectgestuurd",
  "Ordergestuurd",
  "Dienstverlening",
  "Abonnementen / contracten",
  "Subsidie- of budgetgestuurd",
  "Combinatie",
];

const systemOptions = [
  "AFAS",
  "Excel",
  "Power BI",
  "CRM-systeem",
  "Planningssysteem",
  "Branche-applicatie",
  "Anders",
];

const scanReasonOptions = [
  "Groei",
  "Grip op processen",
  "Rapportage verbeteren",
  "AFAS beter benutten",
  "Standaardisatie",
  "Nieuwe inrichting of herinrichting",
  "Klantteam-roadmap",
];

const domainCatalog: DomainDefinition[] = [
  {
    key: "crm",
    title: "CRM / Commercie",
    description:
      "Relatiebeheer, commerciële opvolging, klantafspraken, pipeline en klantteamsturing.",
    excelCode: "DOM-CRM",
    afasConnectorField: "Groeimodel_Domein_CRM",
  },
  {
    key: "financieel",
    title: "Financieel",
    description:
      "Financiële administratie, facturatie, betalingen, afsluiting, controle en managementinformatie.",
    alwaysRelevant: true,
    excelCode: "DOM-FIN",
    afasConnectorField: "Groeimodel_Domein_Financieel",
  },
  {
    key: "ordermanagement",
    title: "Ordermanagement",
    description:
      "Van aanvraag of order naar levering, uitvoering, uitzonderingen en interne overdracht.",
    excelCode: "DOM-ORD",
    afasConnectorField: "Groeimodel_Domein_Ordermanagement",
  },
  {
    key: "projecten",
    title: "Projecten",
    description:
      "Werk met uren, budgetten, voortgang, bezetting, resultaat en projectverantwoording.",
    excelCode: "DOM-PROJ",
    afasConnectorField: "Groeimodel_Domein_Projecten",
  },
];

const intakeQuestionCatalog: IntakeQuestionDefinition[] = [
  {
    id: "INT-CRM-001",
    sourceId: "EXCEL:INTAKE:001 / AFAS:GetGroeimodelIntake",
    text: "Worden klantafspraken, verkoopkansen of opvolgacties actief beheerd?",
    helpText:
      "Vraag niet of er een CRM-module is, maar of opvolging en afspraken belangrijk zijn in het werk.",
    linkedDomains: ["crm"],
    relevanceWeight: 2,
    active: true,
  },
  {
    id: "INT-CRM-002",
    sourceId: "EXCEL:INTAKE:002 / AFAS:GetGroeimodelIntake",
    text: "Is er behoefte aan centraal inzicht in relaties, contactmomenten of commerciële afspraken?",
    helpText:
      "Ook zonder actieve sales kan relatiebeheer relevant zijn voor klantteams of dienstverlening.",
    linkedDomains: ["crm"],
    relevanceWeight: 2,
    active: true,
  },
  {
    id: "INT-FIN-001",
    sourceId: "EXCEL:INTAKE:003 / AFAS:GetGroeimodelIntake",
    text: "Worden facturen, betalingen en maandafsluiting centraal bewaakt?",
    helpText:
      "Financieel is altijd relevant, maar deze vraag bepaalt de mate van verdieping.",
    linkedDomains: ["financieel"],
    relevanceWeight: 2,
    active: true,
  },
  {
    id: "INT-FIN-002",
    sourceId: "EXCEL:INTAKE:004 / AFAS:GetGroeimodelIntake",
    text: "Is financiële rapportage belangrijk voor management, directie of bestuur?",
    helpText:
      "Hiermee wordt zichtbaar of financiële data ook echt als stuurinformatie wordt gebruikt.",
    linkedDomains: ["financieel"],
    relevanceWeight: 2,
    active: true,
  },
  {
    id: "INT-ORD-001",
    sourceId: "EXCEL:INTAKE:005 / AFAS:GetGroeimodelIntake",
    text: "Is er een proces van aanvraag of order tot levering of uitvoering?",
    helpText:
      "Klanten noemen dit niet altijd ordermanagement, maar vrijwel elke overdracht of levering kan hieronder vallen.",
    linkedDomains: ["ordermanagement"],
    relevanceWeight: 2,
    active: true,
  },
  {
    id: "INT-ORD-002",
    sourceId: "EXCEL:INTAKE:006 / AFAS:GetGroeimodelIntake",
    text: "Zijn uitzonderingen in het orderproces belangrijk om te bewaken?",
    helpText:
      "Denk aan blokkades, goedkeuringen, afwijkingen, leveringsmomenten of overdracht tussen teams.",
    linkedDomains: ["ordermanagement"],
    relevanceWeight: 2,
    active: true,
  },
  {
    id: "INT-PROJ-001",
    sourceId: "EXCEL:INTAKE:007 / AFAS:GetGroeimodelIntake",
    text: "Wordt werk uitgevoerd over meerdere dagen of weken, waarbij uren, budget of voortgang belangrijk zijn?",
    helpText:
      "Dit maakt projecten relevant, ook als de organisatie het zelf geen projectadministratie noemt.",
    linkedDomains: ["projecten"],
    relevanceWeight: 2,
    active: true,
  },
  {
    id: "INT-PROJ-002",
    sourceId: "EXCEL:INTAKE:008 / AFAS:GetGroeimodelIntake",
    text: "Is er behoefte aan inzicht in projectresultaat, voortgang of bezetting?",
    helpText:
      "Deze vraag helpt verborgen projectsturing zichtbaar te maken.",
    linkedDomains: ["projecten"],
    relevanceWeight: 2,
    active: true,
  },
  {
    id: "INT-CROSS-001",
    sourceId: "EXCEL:INTAKE:009 / AFAS:GetGroeimodelIntake",
    text: "Wordt informatie uit meerdere systemen gecombineerd?",
    helpText:
      "Dit raakt later integraties en rapportage, maar kan ook knelpunten in de vier MVP-domeinen verklaren.",
    linkedDomains: ["crm", "financieel", "ordermanagement", "projecten"],
    relevanceWeight: 1,
    active: true,
  },
  {
    id: "INT-CROSS-002",
    sourceId: "EXCEL:INTAKE:010 / AFAS:GetGroeimodelIntake",
    text: "Zijn rapportages of dashboards belangrijk voor sturing?",
    helpText:
      "Deze vraag laat zien of de klant vooral administratie voert of ook wil sturen op data.",
    linkedDomains: ["crm", "financieel", "ordermanagement", "projecten"],
    relevanceWeight: 1,
    active: true,
  },
];

const questionCatalog: ScanQuestionDefinition[] = [
  {
    id: "CRM-001",
    sourceId: "EXCEL:QUESTIONS:CRM-001 / AFAS:GetGroeimodelVragen",
    domainKey: "crm",
    subdomain: "Relatiebeheer",
    text: "Is er centraal inzicht in relaties, contactpersonen, afspraken en contactmomenten?",
    helpText:
      "Meet of klantinformatie niet alleen bestaat, maar ook vindbaar, actueel en bruikbaar is voor het klantteam.",
    evidenceHint: "Voorbeelden: relatiekaart, contacthistorie, afspraken, vaste velden of klantteamnotities.",
    weight: 1,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Alle"],
    lowScoreAdvice:
      "Richt een centrale basis voor relatiebeheer in en bepaal welke klantinformatie minimaal vastgelegd moet worden.",
    highScoreAdvice:
      "Gebruik de relatiegegevens actiever voor segmentatie, klantwaarde en klantteamsturing.",
    benchmarkText:
      "In vergelijkbare organisaties is centraal relatie-inzicht vaak een voorwaarde voor stabiele klantteamwerking.",
  },
  {
    id: "CRM-002",
    sourceId: "EXCEL:QUESTIONS:CRM-002 / AFAS:GetGroeimodelVragen",
    domainKey: "crm",
    subdomain: "Opvolging",
    text: "Worden verkoopkansen, signalen of vervolgacties eenduidig opgevolgd?",
    helpText:
      "Kijk of opvolging afhankelijk is van losse mails of hoofden, of dat er een gedeelde werkwijze is.",
    evidenceHint: "Voorbeelden: taken, signalen, forecast, pipeline of vervolgacties.",
    weight: 1.2,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Alle"],
    lowScoreAdvice:
      "Maak opvolging zichtbaar met vaste acties, eigenaren en momenten waarop klantafspraken worden beoordeeld.",
    highScoreAdvice:
      "Verbind opvolging met forecast, klantwaarde en commerciële prioriteiten.",
    benchmarkText:
      "Organisaties met actieve commerciële sturing gebruiken meestal een vaste opvolgstructuur in plaats van losse acties.",
  },
  {
    id: "CRM-003",
    sourceId: "EXCEL:QUESTIONS:CRM-003 / AFAS:GetGroeimodelVragen",
    domainKey: "crm",
    subdomain: "Klantteam",
    text: "Zijn commerciële afspraken en klantafspraken zichtbaar voor iedereen die met de klant werkt?",
    helpText:
      "Dit voorkomt dat afspraken in losse mailboxen of bij individuele medewerkers blijven hangen.",
    evidenceHint: "Voorbeelden: klantdossier, notities, contractafspraken, overdracht sales naar consultancy.",
    weight: 1,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Dienstverlening", "Projectgestuurd", "Combinatie", "Alle"],
    lowScoreAdvice:
      "Bepaal welke klantafspraken verplicht zichtbaar moeten zijn voor het klantteam.",
    highScoreAdvice:
      "Gebruik klantafspraken als input voor service, planning, roadmap en periodieke klantreview.",
    benchmarkText:
      "Bij volwassen klantteams is transparantie over afspraken belangrijker dan de vraag in welke module die afspraken staan.",
  },
  {
    id: "CRM-004",
    sourceId: "EXCEL:QUESTIONS:CRM-004 / AFAS:GetGroeimodelVragen",
    domainKey: "crm",
    subdomain: "Sturing",
    text: "Wordt gestuurd op pipeline, klantwaarde, retentie of commerciële prioriteiten?",
    helpText:
      "Meet of CRM alleen registratie is of ook wordt gebruikt om keuzes te maken.",
    evidenceHint: "Voorbeelden: dashboard, forecastoverleg, klantsegmentatie, commerciële KPI's.",
    weight: 1.1,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Alle"],
    lowScoreAdvice:
      "Bepaal eerst welke commerciële stuurinformatie echt nodig is voor besluitvorming.",
    highScoreAdvice:
      "Verbind commerciële sturing met klantteam-roadmap en managementrapportage.",
    benchmarkText:
      "Bij organisaties die groeien verschuift CRM meestal van registratie naar voorspelbare commerciële sturing.",
  },
  {
    id: "FIN-001",
    sourceId: "EXCEL:QUESTIONS:FIN-001 / AFAS:GetGroeimodelVragen",
    domainKey: "financieel",
    subdomain: "Basisadministratie",
    text: "Is de financiële administratie actueel, volledig en controleerbaar?",
    helpText:
      "De basis moet betrouwbaar zijn voordat rapportage of automatisering echt waarde toevoegt.",
    evidenceHint: "Voorbeelden: tussenrekeningen, openstaande posten, bank, memoriaal, aansluitingen.",
    weight: 1.3,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Alle"],
    lowScoreAdvice:
      "Breng eerst de financiële basis op orde en maak controlepunten expliciet.",
    highScoreAdvice:
      "Gebruik de betrouwbare basis om afsluiting, rapportage en prognoses te versnellen.",
    benchmarkText:
      "In vrijwel elke branche blijft financiële basisbetrouwbaarheid de ondergrens voor verdere digitalisering.",
  },
  {
    id: "FIN-002",
    sourceId: "EXCEL:QUESTIONS:FIN-002 / AFAS:GetGroeimodelVragen",
    domainKey: "financieel",
    subdomain: "Afsluiting",
    text: "Is de maandafsluiting voorspelbaar, tijdig en volgens een vaste werkwijze ingericht?",
    helpText:
      "Kijk of afsluiting een gecontroleerd proces is of vooral afhankelijk van ad-hoc controles.",
    evidenceHint: "Voorbeelden: afsluitkalender, checklist, eigenaarschap, deadlines, controles.",
    weight: 1.1,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Alle"],
    lowScoreAdvice:
      "Maak een vaste maandafsluitprocedure met eigenaar, deadlines en controlepunten.",
    highScoreAdvice:
      "Verkort de afsluiting en gebruik de tijdwinst voor analyse en sturing.",
    benchmarkText:
      "Vergelijkbare organisaties sturen steeds vaker op een korte, voorspelbare maandafsluiting.",
  },
  {
    id: "FIN-003",
    sourceId: "EXCEL:QUESTIONS:FIN-003 / AFAS:GetGroeimodelVragen",
    domainKey: "financieel",
    subdomain: "Facturatie en betalingen",
    text: "Zijn facturatie, betalingen en openstaande posten actief bewaakt?",
    helpText:
      "Meet of financiële stromen alleen worden verwerkt of ook actief worden beheerst.",
    evidenceHint: "Voorbeelden: debiteurenbewaking, betaalruns, aanmaningen, procuratie, betalingsblokkades.",
    weight: 1,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Alle"],
    lowScoreAdvice:
      "Maak openstaande posten, betalingen en uitzonderingen structureel zichtbaar in het proces.",
    highScoreAdvice:
      "Automatiseer opvolging waar mogelijk en stuur op uitzonderingen in plaats van handmatige controle.",
    benchmarkText:
      "Veel organisaties professionaliseren financieel beheer door uitzonderingen actief zichtbaar te maken.",
  },
  {
    id: "FIN-004",
    sourceId: "EXCEL:QUESTIONS:FIN-004 / AFAS:GetGroeimodelVragen",
    domainKey: "financieel",
    subdomain: "Stuurinformatie",
    text: "Sluit financiële rapportage aan op de informatiebehoefte van management, directie of bestuur?",
    helpText:
      "Niet de beschikbaarheid van cijfers is leidend, maar de bruikbaarheid voor besluitvorming.",
    evidenceHint: "Voorbeelden: KPI-set, dashboard, budgetvergelijking, prognose, bestuursoverzicht.",
    weight: 1.2,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Alle"],
    lowScoreAdvice:
      "Bepaal welke financiële stuurinformatie nodig is en leg definities vast.",
    highScoreAdvice:
      "Koppel financiële rapportage aan operationele en commerciële stuurinformatie.",
    benchmarkText:
      "Volwassen organisaties gebruiken financiële rapportage niet alleen achteraf, maar ook voor bijsturing.",
  },
  {
    id: "ORD-001",
    sourceId: "EXCEL:QUESTIONS:ORD-001 / AFAS:GetGroeimodelVragen",
    domainKey: "ordermanagement",
    subdomain: "Procesflow",
    text: "Is het proces van aanvraag of order tot levering of uitvoering duidelijk vastgelegd?",
    helpText:
      "Kijk of het proces bekend is bij iedereen of vooral in hoofden van mensen zit.",
    evidenceHint: "Voorbeelden: procesplaat, statussen, overdrachtsmomenten, ordertypes.",
    weight: 1.2,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Ordergestuurd", "Combinatie", "Alle"],
    lowScoreAdvice:
      "Breng de orderflow in kaart en bepaal de belangrijkste statusmomenten en overdrachten.",
    highScoreAdvice:
      "Gebruik processtatussen om doorlooptijd, uitzonderingen en capaciteit te sturen.",
    benchmarkText:
      "Bij ordergestuurde organisaties is proceszicht vaak de basis voor verdere automatisering.",
  },
  {
    id: "ORD-002",
    sourceId: "EXCEL:QUESTIONS:ORD-002 / AFAS:GetGroeimodelVragen",
    domainKey: "ordermanagement",
    subdomain: "Uitzonderingen",
    text: "Zijn blokkades, uitzonderingen en afwijkingen in het orderproces zichtbaar en opvolgbaar?",
    helpText:
      "Meet of de organisatie stuurt op uitzonderingen of pas reageert als iets misgaat.",
    evidenceHint: "Voorbeelden: blokkades, wachtstatussen, signalen, foutlijsten, escalatieafspraken.",
    weight: 1.2,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Alle"],
    lowScoreAdvice:
      "Maak uitzonderingen expliciet met statussen, signalen en eigenaarschap.",
    highScoreAdvice:
      "Gebruik uitzonderingenanalyse om procesverbetering gericht te prioriteren.",
    benchmarkText:
      "Volwassen orderprocessen worden vaak gekenmerkt door sturing op uitzonderingen in plaats van controle achteraf.",
  },
  {
    id: "ORD-003",
    sourceId: "EXCEL:QUESTIONS:ORD-003 / AFAS:GetGroeimodelVragen",
    domainKey: "ordermanagement",
    subdomain: "Overdracht",
    text: "Is de overdracht tussen commercie, administratie, uitvoering en levering goed geborgd?",
    helpText:
      "Dit voorkomt dubbel werk, foutieve verwachtingen en onduidelijke verantwoordelijkheid.",
    evidenceHint: "Voorbeelden: orderproof controle, goedkeuring, overdrachtsvelden, interne taken.",
    weight: 1,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Alle"],
    lowScoreAdvice:
      "Leg vast welke informatie minimaal nodig is voordat een order of opdracht verder mag.",
    highScoreAdvice:
      "Automatiseer overdrachtsmomenten en maak kwaliteit meetbaar.",
    benchmarkText:
      "In organisaties met veel overdrachten ontstaan de meeste fouten niet in het systeem, maar tussen processtappen.",
  },
  {
    id: "ORD-004",
    sourceId: "EXCEL:QUESTIONS:ORD-004 / AFAS:GetGroeimodelVragen",
    domainKey: "ordermanagement",
    subdomain: "Sturing",
    text: "Is er inzicht in doorlooptijd, werkvoorraad, leverbetrouwbaarheid of proceskwaliteit?",
    helpText:
      "Meet of ordermanagement ook wordt gebruikt om operationeel te sturen.",
    evidenceHint: "Voorbeelden: statusrapportage, doorlooptijden, werkvoorraad, orderkwaliteit.",
    weight: 1.1,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Ordergestuurd", "Combinatie", "Alle"],
    lowScoreAdvice:
      "Bepaal de belangrijkste operationele KPI's voor het orderproces.",
    highScoreAdvice:
      "Gebruik operationele KPI's als input voor procesverbetering en capaciteitsplanning.",
    benchmarkText:
      "Bij vergelijkbare organisaties groeit de behoefte aan operationele sturing zodra het ordervolume toeneemt.",
  },
  {
    id: "PROJ-001",
    sourceId: "EXCEL:QUESTIONS:PROJ-001 / AFAS:GetGroeimodelVragen",
    domainKey: "projecten",
    subdomain: "Projectbasis",
    text: "Is duidelijk wanneer werk als project, opdracht of dossier wordt ingericht en gevolgd?",
    helpText:
      "Projectsturing begint met een heldere definitie van wat wel en niet apart gevolgd moet worden.",
    evidenceHint: "Voorbeelden: projecttypes, projectkaart, opdrachtstructuur, dossiers.",
    weight: 1,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Projectgestuurd", "Dienstverlening", "Combinatie", "Alle"],
    lowScoreAdvice:
      "Bepaal wanneer werk als project wordt gevolgd en welke projectgegevens minimaal nodig zijn.",
    highScoreAdvice:
      "Gebruik projecttypes voor betere rapportage, planning en resultaatanalyse.",
    benchmarkText:
      "Projectgestuurde organisaties hebben meestal veel winst te halen uit heldere projectdefinities.",
  },
  {
    id: "PROJ-002",
    sourceId: "EXCEL:QUESTIONS:PROJ-002 / AFAS:GetGroeimodelVragen",
    domainKey: "projecten",
    subdomain: "Uren en kosten",
    text: "Worden uren, kosten en budgetten actueel vastgelegd en bewaakt?",
    helpText:
      "Niet alleen registratie telt, maar vooral of afwijkingen tijdig zichtbaar zijn.",
    evidenceHint: "Voorbeelden: urenregistratie, budgetbewaking, verplichtingen, projectkosten.",
    weight: 1.3,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Projectgestuurd", "Dienstverlening", "Combinatie", "Alle"],
    lowScoreAdvice:
      "Maak uren, kosten en budgetten zichtbaar op een manier die projectleiders kunnen gebruiken.",
    highScoreAdvice:
      "Gebruik actuele projectdata om prognoses en capaciteitskeuzes te verbeteren.",
    benchmarkText:
      "In projectgestuurde dienstverlening is actuele uren- en budgetbewaking vaak het grootste stuurpunt.",
  },
  {
    id: "PROJ-003",
    sourceId: "EXCEL:QUESTIONS:PROJ-003 / AFAS:GetGroeimodelVragen",
    domainKey: "projecten",
    subdomain: "Voortgang",
    text: "Is er actueel inzicht in projectvoortgang, risico's en verwachte afwijkingen?",
    helpText:
      "Meet of projectsturing vooruitkijkt of vooral achteraf verklaart.",
    evidenceHint: "Voorbeelden: voortgangsrapportage, risico's, forecast, afwijkingen, projectoverleg.",
    weight: 1.2,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Projectgestuurd", "Combinatie", "Alle"],
    lowScoreAdvice:
      "Introduceer een vaste projectreview met voortgang, risico's en verwachte afwijkingen.",
    highScoreAdvice:
      "Verbind projectvoortgang aan portfolio-, capaciteits- en financiële sturing.",
    benchmarkText:
      "Volwassen projectorganisaties sturen steeds vaker op verwachting in plaats van alleen realisatie.",
  },
  {
    id: "PROJ-004",
    sourceId: "EXCEL:QUESTIONS:PROJ-004 / AFAS:GetGroeimodelVragen",
    domainKey: "projecten",
    subdomain: "Resultaat",
    text: "Wordt projectresultaat gebruikt voor verbetering van planning, tarieven, scope of werkwijze?",
    helpText:
      "Projectdata krijgt pas waarde als lessen worden gebruikt voor toekomstige keuzes.",
    evidenceHint: "Voorbeelden: nacalculatie, margeanalyse, lessons learned, tariefaanpassing, scopebewaking.",
    weight: 1,
    active: true,
    applicableBranches: ["Alle"],
    applicableOrgTypes: ["Projectgestuurd", "Dienstverlening", "Combinatie", "Alle"],
    lowScoreAdvice:
      "Gebruik projectresultaten structureel om tarieven, planning en aanpak te verbeteren.",
    highScoreAdvice:
      "Maak projectresultaat onderdeel van portfolio- en commerciële besluitvorming.",
    benchmarkText:
      "In volwassen organisaties wordt projectresultaat niet alleen gemeten, maar gebruikt om toekomstige keuzes te verbeteren.",
  },
];

const mockScans = [
  {
    klant: "Participe",
    sector: "Zorg & welzijn",
    status: "In gesprek",
    score: 3.1,
    datum: "24-04-2026",
  },
  {
    klant: "Environ",
    sector: "Zakelijke dienstverlening",
    status: "Afgerond",
    score: 3.8,
    datum: "18-04-2026",
  },
  {
    klant: "Codarts",
    sector: "Onderwijs",
    status: "Concept",
    score: 2.9,
    datum: "12-04-2026",
  },
];

const navigation: { id: ViewId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "nieuwe-scan", label: "Nieuwe scan" },
  { id: "scan", label: "Scan invullen" },
  { id: "resultaten", label: "Resultaten" },
  { id: "roadmap", label: "Roadmap" },
  { id: "rapport", label: "Rapport" },
];

const initialForm: ScanForm = {
  organisatienaam: "LMJ BV",
  branche: "Onderwijs",
  medewerkers: "51-250",
  administraties: "2-5",
  typeOrganisatie: ["Dienstverlening", "Projectgestuurd"],
  systemen: ["AFAS", "Excel", "Power BI"],
  aanleidingScan: ["AFAS beter benutten", "Rapportage verbeteren", "Klantteam-roadmap"],
  consultant: "Sjoerd Koelman",
  datum: "2026-04-26",
  context:
    "De scan wordt gebruikt als gesprekstool tijdens een nulmeting. De uitkomst vormt input voor prioriteiten, klantteam-roadmap en vervolgwerk.",
};

const initialIntakeAnswers: Record<string, IntakeAnswer> = Object.fromEntries(
  intakeQuestionCatalog.map((question) => [question.id, ""])
);

const initialQuestionResponses: Record<string, QuestionResponse> = Object.fromEntries(
  questionCatalog.map((question, index) => [
    question.id,
    {
      score: [4, 3, 4, 2, 5, 3, 4, 3, 3, 2, 3, 2, 4, 3, 2, 3][index] ?? 3,
      toelichting: "Voorlopige beoordeling op basis van het gesprek. Later kan deze vraag uit Excel of AFAS worden beheerd.",
      bewijs: question.evidenceHint,
    },
  ])
);

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [form, setForm] = useState<ScanForm>(initialForm);
  const [intakeAnswers, setIntakeAnswers] =
    useState<Record<string, IntakeAnswer>>(initialIntakeAnswers);
  const [questionResponses, setQuestionResponses] =
    useState<Record<string, QuestionResponse>>(initialQuestionResponses);

  const activeQuestions = useMemo(
    () => questionCatalog.filter((question) => question.active),
    []
  );

  const relevanceMap = useMemo(
    () => calculateRelevance(intakeAnswers),
    [intakeAnswers]
  );

  const domainScores = useMemo(
    () => calculateDomainScores(questionResponses),
    [questionResponses]
  );

  const averageScore = useMemo(() => {
    const scores = domainCatalog.map((domain) => domainScores[domain.key] ?? 0);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }, [domainScores]);

  const priorityQuestions = useMemo(() => {
    return activeQuestions
      .map((question) => ({
        question,
        response: questionResponses[question.id],
        domain: getDomain(question.domainKey),
      }))
      .sort((a, b) => a.response.score - b.response.score)
      .slice(0, 3);
  }, [activeQuestions, questionResponses]);

  function updateQuestionResponse(questionId: string, patch: Partial<QuestionResponse>) {
    setQuestionResponses((previous) => ({
      ...previous,
      [questionId]: {
        ...previous[questionId],
        ...patch,
      },
    }));
  }

  function getLevel(score: number) {
    const rounded = Math.round(score);
    return scoreModel.find((item) => item.score === rounded) ?? scoreModel[0];
  }

  function getMaturityPhase(score: number) {
    if (score < 2) return "Basis ontbreekt";
    if (score < 3.5) return "Basis aanwezig, maar kwetsbaar";
    if (score < 5) return "Beheersing en standaardisatie";
    if (score < 6.5) return "Optimalisatie en integratie";
    return "Data-gedreven sturing";
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-white p-6 lg:block">
          <div className="mb-10">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              KWEEKERS
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Groeimodel
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Data-gedreven scan op basis van een vraagcatalogus.
            </p>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeView === item.id
                    ? "bg-slate-950 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold">Vragenmotor</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Vragen, domeinen, weging en adviesteksten staan nu in mockdata.
              Later kan dezelfde structuur worden gevuld vanuit Excel of AFAS.
            </p>
          </div>
        </aside>

        <section className="flex-1">
          <header className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  MVP versie 2 · data-gedreven scan
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  KWEEKERS Groeimodel
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium lg:hidden ${
                      activeView === item.id
                        ? "bg-slate-950 text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8">
            {activeView === "dashboard" && (
              <Dashboard
                averageScore={averageScore}
                onNewScan={() => setActiveView("nieuwe-scan")}
              />
            )}

            {activeView === "nieuwe-scan" && (
              <NewScan
                form={form}
                setForm={setForm}
                intakeAnswers={intakeAnswers}
                setIntakeAnswers={setIntakeAnswers}
                relevanceMap={relevanceMap}
                onStart={() => setActiveView("scan")}
              />
            )}

            {activeView === "scan" && (
              <ScanInput
                form={form}
                relevanceMap={relevanceMap}
                questionResponses={questionResponses}
                updateQuestionResponse={updateQuestionResponse}
                getLevel={getLevel}
                onResults={() => setActiveView("resultaten")}
              />
            )}

            {activeView === "resultaten" && (
              <Results
                domainScores={domainScores}
                questionResponses={questionResponses}
                averageScore={averageScore}
                priorityQuestions={priorityQuestions}
                getLevel={getLevel}
                getMaturityPhase={getMaturityPhase}
                onRoadmap={() => setActiveView("roadmap")}
              />
            )}

            {activeView === "roadmap" && (
              <Roadmap
                priorityQuestions={priorityQuestions}
                onReport={() => setActiveView("rapport")}
              />
            )}

            {activeView === "rapport" && (
              <Report
                form={form}
                domainScores={domainScores}
                questionResponses={questionResponses}
                averageScore={averageScore}
                priorityQuestions={priorityQuestions}
                relevanceMap={relevanceMap}
                getMaturityPhase={getMaturityPhase}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Dashboard({
  averageScore,
  onNewScan,
}: {
  averageScore: number;
  onNewScan: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-slate-950 p-8 text-white lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-300">
            Gesprekstool voor klantteams
          </p>
          <h3 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">
            Bouw de scan alsof vragen later uit Excel of AFAS komen.
          </h3>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Domeinen, intakevragen, scanvragen, weging, benchmarktekst en advies
            komen nu uit één centrale vraagcatalogus in mockdata.
          </p>
        </div>
        <button
          onClick={onNewScan}
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          Nieuwe scan starten
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Aantal scans" value="3" />
        <StatCard label="Gemiddelde volwassenheid" value={averageScore.toFixed(1)} />
        <StatCard label="Actieve scanvragen" value={String(questionCatalog.filter((q) => q.active).length)} />
        <StatCard label="Intakevragen" value={String(intakeQuestionCatalog.filter((q) => q.active).length)} />
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Recente scans</h3>
              <p className="mt-1 text-sm text-slate-600">
                Mockdata voor de eerste MVP-versie.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Klant</th>
                  <th className="px-4 py-3 font-semibold">Sector</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Laatste wijziging</th>
                </tr>
              </thead>
              <tbody>
                {mockScans.map((scan) => (
                  <tr key={scan.klant} className="border-t border-slate-200">
                    <td className="px-4 py-4 font-medium">{scan.klant}</td>
                    <td className="px-4 py-4 text-slate-600">{scan.sector}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold">{scan.score}</td>
                    <td className="px-4 py-4 text-slate-600">{scan.datum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Databron voorbereid</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Elke vraag heeft een vraag-ID, bronduiding, domein, weging,
            benchmarktekst en adviestekst. Daarmee kan dezelfde scan later
            worden gevuld vanuit een Excelbestand of AFAS GetConnector.
          </p>
          <div className="mt-5 space-y-3 text-sm">
            <MiniInfo label="Voor nu" value="Mockdata in code" />
            <MiniInfo label="Volgende stap" value="Excel-template" />
            <MiniInfo label="Later" value="AFAS GetConnector" />
          </div>
        </div>
      </section>
    </div>
  );
}

function NewScan({
  form,
  setForm,
  intakeAnswers,
  setIntakeAnswers,
  relevanceMap,
  onStart,
}: {
  form: ScanForm;
  setForm: (form: ScanForm) => void;
  intakeAnswers: Record<string, IntakeAnswer>;
  setIntakeAnswers: (answers: Record<string, IntakeAnswer>) => void;
  relevanceMap: Record<DomainKey, RelevanceResult>;
  onStart: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-2xl font-semibold">Nieuwe scan</h3>
            <p className="mt-2 max-w-3xl text-slate-600">
              Start met bedrijfslogica. Vraag niet of een module van toepassing
              is, maar welke situaties, processen en stuurvragen spelen.
            </p>
          </div>
          <button
            onClick={onStart}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Start scan
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">1. Organisatieprofiel</h4>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Deze gegevens kunnen later ook uit een klantkaart, Excel-upload of AFAS
          worden gevuld. Voor de MVP blijven ze handmatig aanpasbaar.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextField
            label="Organisatienaam"
            value={form.organisatienaam}
            onChange={(value) => setForm({ ...form, organisatienaam: value })}
          />
          <SelectField
            label="Branche"
            value={form.branche}
            options={branchOptions}
            onChange={(value) => setForm({ ...form, branche: value })}
          />
          <SelectField
            label="Aantal medewerkers"
            value={form.medewerkers}
            options={employeeOptions}
            onChange={(value) => setForm({ ...form, medewerkers: value })}
          />
          <SelectField
            label="Aantal administraties"
            value={form.administraties}
            options={administrationOptions}
            onChange={(value) => setForm({ ...form, administraties: value })}
          />
          <TextField
            label="Consultant"
            value={form.consultant}
            onChange={(value) => setForm({ ...form, consultant: value })}
          />
          <TextField
            label="Datum gesprek"
            type="date"
            value={form.datum}
            onChange={(value) => setForm({ ...form, datum: value })}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <MultiSelectField
            label="Type organisatie"
            options={organizationTypeOptions}
            values={form.typeOrganisatie}
            onChange={(values) => setForm({ ...form, typeOrganisatie: values })}
          />
          <MultiSelectField
            label="Huidige systemen"
            options={systemOptions}
            values={form.systemen}
            onChange={(values) => setForm({ ...form, systemen: values })}
          />
          <MultiSelectField
            label="Aanleiding scan"
            options={scanReasonOptions}
            values={form.aanleidingScan}
            onChange={(values) => setForm({ ...form, aanleidingScan: values })}
          />
        </div>

        <div className="mt-6">
          <TextArea
            label="Korte context"
            value={form.context}
            onChange={(value) => setForm({ ...form, context: value })}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">2. Slimme intakevragen</h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Deze vragen bepalen welke domeinen waarschijnlijk relevant zijn. De
          klant hoeft dus niet zelf te weten welke AFAS-module of inrichting
          hierbij hoort.
        </p>

        <div className="mt-6 space-y-4">
          {intakeQuestionCatalog
            .filter((question) => question.active)
            .map((question) => (
              <div
                key={question.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {question.id}
                    </div>
                    <div className="mt-2 font-semibold">{question.text}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {question.helpText}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:min-w-72 lg:justify-end">
                    {answerOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setIntakeAnswers({
                            ...intakeAnswers,
                            [question.id]: option.value,
                          })
                        }
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          intakeAnswers[question.id] === option.value
                            ? "bg-slate-950 text-white"
                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">3. Relevantiekaart</h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Domeinen worden niet verborgen. De scan laat altijd zien waarom een
          domein wel, mogelijk of niet primair wordt meegenomen.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {domainCatalog.map((domain) => {
            const relevance = relevanceMap[domain.key];
            return (
              <div
                key={domain.key}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h5 className="font-semibold">{domain.title}</h5>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {domain.description}
                    </p>
                  </div>
                  <StatusBadge status={relevance.status} />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">
                  {relevance.reason}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                  <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                    Excel: {domain.excelCode}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                    AFAS veld: {domain.afasConnectorField}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onStart}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Start scan
          </button>
        </div>
      </section>
    </div>
  );
}

function ScanInput({
  form,
  relevanceMap,
  questionResponses,
  updateQuestionResponse,
  getLevel,
  onResults,
}: {
  form: ScanForm;
  relevanceMap: Record<DomainKey, RelevanceResult>;
  questionResponses: Record<string, QuestionResponse>;
  updateQuestionResponse: (questionId: string, patch: Partial<QuestionResponse>) => void;
  getLevel: (score: number) => { score: number; label: string; description: string };
  onResults: () => void;
}) {
  const domainScores = calculateDomainScores(questionResponses);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold">Scan invullen</h3>
        <p className="mt-2 max-w-3xl text-slate-600">
          De vragen hieronder worden dynamisch opgebouwd uit de vraagcatalogus.
          Later kan dezelfde catalogus uit Excel of AFAS komen.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-xl font-semibold">Bron en filtering</h4>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <MiniInfo label="Branche" value={form.branche} />
          <MiniInfo label="Type" value={form.typeOrganisatie.join(", ") || "Niet ingevuld"} />
          <MiniInfo label="Actieve vragen" value={String(questionCatalog.filter((q) => q.active).length)} />
          <MiniInfo label="Databron" value="Mockcatalogus" />
        </div>
      </div>

      <div className="grid gap-6">
        {domainCatalog.map((domain) => {
          const questions = questionCatalog.filter(
            (question) => question.active && question.domainKey === domain.key
          );
          const score = domainScores[domain.key] ?? 0;
          const level = getLevel(score);
          const relevance = relevanceMap[domain.key];

          return (
            <section
              key={domain.key}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xl font-semibold">{domain.title}</h4>
                    <StatusBadge status={relevance.status} />
                  </div>
                  <p className="mt-2 max-w-3xl text-slate-600">
                    {domain.description}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {relevance.reason}
                  </p>
                </div>
                <ScoreBadge score={score} label={level.label} />
              </div>

              <div className="mt-6 space-y-5">
                {questions.map((question) => {
                  const response = questionResponses[question.id];
                  const questionLevel = getLevel(response.score);

                  return (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                              {question.id}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                              {question.subdomain}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                              Weging {question.weight}
                            </span>
                          </div>
                          <h5 className="mt-3 max-w-4xl font-semibold">
                            {question.text}
                          </h5>
                          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                            {question.helpText}
                          </p>
                        </div>

                        <div className="lg:min-w-72">
                          <label className="text-sm font-semibold">
                            Score 0 t/m 7
                          </label>
                          <select
                            value={response.score}
                            onChange={(event) =>
                              updateQuestionResponse(question.id, {
                                score: Number(event.target.value),
                              })
                            }
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
                          >
                            {scoreModel.map((item) => (
                              <option key={item.score} value={item.score}>
                                {item.score} - {item.label}
                              </option>
                            ))}
                          </select>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {questionLevel.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <TextArea
                          label="Toelichting / observatie"
                          value={response.toelichting}
                          onChange={(value) =>
                            updateQuestionResponse(question.id, { toelichting: value })
                          }
                        />
                        <TextArea
                          label="Bewijs / voorbeeld uit gesprek"
                          value={response.bewijs}
                          onChange={(value) =>
                            updateQuestionResponse(question.id, { bewijs: value })
                          }
                        />
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-3">
                        <InfoPanel title="Benchmark" text={question.benchmarkText} />
                        <InfoPanel
                          title="Advies bij lage score"
                          text={question.lowScoreAdvice}
                        />
                        <InfoPanel
                          title="Advies bij hoge score"
                          text={question.highScoreAdvice}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onResults}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Bekijk resultaten
        </button>
      </div>
    </div>
  );
}

function Results({
  domainScores,
  questionResponses,
  averageScore,
  priorityQuestions,
  getLevel,
  getMaturityPhase,
  onRoadmap,
}: {
  domainScores: Record<DomainKey, number>;
  questionResponses: Record<string, QuestionResponse>;
  averageScore: number;
  priorityQuestions: Array<{
    question: ScanQuestionDefinition;
    response: QuestionResponse;
    domain: DomainDefinition;
  }>;
  getLevel: (score: number) => { score: number; label: string; description: string };
  getMaturityPhase: (score: number) => string;
  onRoadmap: () => void;
}) {
  const lowQuestions = questionCatalog
    .filter((question) => question.active && questionResponses[question.id]?.score <= 3)
    .map((question) => ({ question, response: questionResponses[question.id], domain: getDomain(question.domainKey) }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-slate-950 p-6 text-white lg:col-span-1">
          <p className="text-sm font-medium text-slate-300">Totaalscore</p>
          <div className="mt-4 text-6xl font-semibold">
            {averageScore.toFixed(1)}
          </div>
          <p className="mt-4 text-slate-300">
            {getMaturityPhase(averageScore)}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-xl font-semibold">Scores per domein</h3>
          <div className="mt-6 space-y-5">
            {domainCatalog.map((domain) => {
              const score = domainScores[domain.key] ?? 0;
              const width = `${(score / 7) * 100}%`;

              return (
                <div key={domain.key}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{domain.title}</span>
                    <span className="font-semibold">
                      {score.toFixed(1)} - {getLevel(score).label}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-950"
                      style={{ width }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Laagst scorende vragen</h3>
          <div className="mt-5 space-y-4">
            {priorityQuestions.map((item) => (
              <div key={item.question.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{item.domain.title}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.question.text}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 text-sm font-semibold ring-1 ring-slate-200">
                    {item.response.score}/7
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.question.lowScoreAdvice}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Benchmarksignalen</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Voor nu is dit mockbenchmarking. Later kan dit worden vervangen door
            geanonimiseerde klantdata per branche.
          </p>
          <div className="mt-5 space-y-4">
            {lowQuestions.slice(0, 4).map((item) => (
              <div key={item.question.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="font-semibold">{item.question.subdomain}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.question.benchmarkText}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={onRoadmap}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Maak eerste roadmap
        </button>
      </div>
    </div>
  );
}

function Roadmap({
  priorityQuestions,
  onReport,
}: {
  priorityQuestions: Array<{
    question: ScanQuestionDefinition;
    response: QuestionResponse;
    domain: DomainDefinition;
  }>;
  onReport: () => void;
}) {
  const roadmap = [
    {
      phase: "0-30 dagen",
      title: "Verdiepen op laagst scorende onderdelen",
      description:
        priorityQuestions[0]?.question.lowScoreAdvice ??
        "Werk de belangrijkste knelpunten uit en bepaal eigenaarschap.",
      domain: priorityQuestions[0]?.domain.title ?? "Algemeen",
      impact: "Hoog",
      effort: "Laag",
      owner: "Klantteam + proceseigenaar",
    },
    {
      phase: "30-60 dagen",
      title: "Werkwijze en inrichting concretiseren",
      description:
        priorityQuestions[1]?.question.lowScoreAdvice ??
        "Maak de gewenste werkwijze concreet en vertaal deze naar procesafspraken.",
      domain: priorityQuestions[1]?.domain.title ?? "Algemeen",
      impact: "Hoog",
      effort: "Middel",
      owner: "Business consultant",
    },
    {
      phase: "60-90 dagen",
      title: "Eerste verbeteringen doorvoeren en toetsen",
      description:
        priorityQuestions[2]?.question.lowScoreAdvice ??
        "Voer verbeteringen door, test met gebruikers en leg afspraken vast.",
      domain: priorityQuestions[2]?.domain.title ?? "Algemeen",
      impact: "Middel",
      effort: "Middel",
      owner: "Projectleider + key-users",
    },
    {
      phase: "Daarna",
      title: "Borgen in klantteam en periodiek herhalen",
      description:
        "Neem vervolgacties op in de klantteam-aanpak en herhaal de groeiscan periodiek om voortgang zichtbaar te maken.",
      domain: "Alle domeinen",
      impact: "Hoog",
      effort: "Middel",
      owner: "Klantverantwoordelijke",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold">Eerste roadmap</h3>
        <p className="mt-2 max-w-3xl text-slate-600">
          De roadmap wordt gevoed door de laagst scorende vragen uit de
          data-gedreven vraagcatalogus.
        </p>
      </div>

      <div className="grid gap-5">
        {roadmap.map((item) => (
          <section
            key={item.phase}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {item.phase}
                </div>
                <h4 className="mt-2 text-xl font-semibold">{item.title}</h4>
                <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                  {item.description}
                </p>
              </div>

              <div className="grid gap-2 text-sm sm:grid-cols-2 lg:w-80">
                <MiniInfo label="Domein" value={item.domain} />
                <MiniInfo label="Impact" value={item.impact} />
                <MiniInfo label="Inspanning" value={item.effort} />
                <MiniInfo label="Eigenaar" value={item.owner} />
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onReport}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Naar rapport
        </button>
      </div>
    </div>
  );
}

function Report({
  form,
  domainScores,
  questionResponses,
  averageScore,
  priorityQuestions,
  relevanceMap,
  getMaturityPhase,
}: {
  form: ScanForm;
  domainScores: Record<DomainKey, number>;
  questionResponses: Record<string, QuestionResponse>;
  averageScore: number;
  priorityQuestions: Array<{
    question: ScanQuestionDefinition;
    response: QuestionResponse;
    domain: DomainDefinition;
  }>;
  relevanceMap: Record<DomainKey, RelevanceResult>;
  getMaturityPhase: (score: number) => string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Concept terugkoppeling
          </p>
          <h3 className="mt-3 text-3xl font-semibold">
            Nulmeting KWEEKERS Groeimodel
          </h3>
          <p className="mt-2 text-slate-600">{form.organisatienaam}</p>
        </div>
        <button
          onClick={() => alert("PDF-export volgt in een volgende versie.")}
          className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Exporteer als PDF
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <article className="space-y-8">
          <ReportSection title="Managementsamenvatting">
            <p>
              De nulmeting laat zien dat {form.organisatienaam} gemiddeld een
              volwassenheidsscore van <strong>{averageScore.toFixed(1)}</strong>{" "}
              behaalt. Dit valt binnen de fase:{" "}
              <strong>{getMaturityPhase(averageScore)}</strong>.
            </p>
            <p>
              De scan is opgebouwd vanuit een data-gedreven vraagcatalogus. Dit
              maakt het mogelijk om vragen later te beheren via Excel of een
              AFAS GetConnector, zonder de schermen opnieuw te bouwen.
            </p>
          </ReportSection>

          <ReportSection title="Aanleiding en context">
            <p>{form.context}</p>
            <p>
              Aanleiding: {form.aanleidingScan.join(", ") || "Nog niet ingevuld"}.
            </p>
          </ReportSection>

          <ReportSection title="Relevantie per domein">
            <div className="space-y-4">
              {domainCatalog.map((domain) => (
                <div key={domain.key} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-semibold">{domain.title}</div>
                    <StatusBadge status={relevanceMap[domain.key].status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {relevanceMap[domain.key].reason}
                  </p>
                </div>
              ))}
            </div>
          </ReportSection>

          <ReportSection title="Scores per domein">
            <div className="space-y-4">
              {domainCatalog.map((domain) => (
                <div key={domain.key} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-semibold">{domain.title}</div>
                    <div className="font-semibold">
                      {(domainScores[domain.key] ?? 0).toFixed(1)} / 7
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {domain.description}
                  </p>
                </div>
              ))}
            </div>
          </ReportSection>

          <ReportSection title="Top-3 prioriteiten">
            <ol className="space-y-3">
              {priorityQuestions.map((item, index) => (
                <li key={item.question.id} className="rounded-2xl bg-slate-50 p-4">
                  <strong>
                    {index + 1}. {item.domain.title} · {item.question.subdomain}
                  </strong>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.question.lowScoreAdvice}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Onderliggende vraag: {item.question.text}
                  </p>
                </li>
              ))}
            </ol>
          </ReportSection>

          <ReportSection title="Benchmarksignalen">
            <div className="space-y-3">
              {priorityQuestions.map((item) => (
                <div key={item.question.id} className="rounded-2xl bg-slate-50 p-4">
                  <strong>{item.question.subdomain}</strong>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.question.benchmarkText}
                  </p>
                </div>
              ))}
            </div>
          </ReportSection>

          <ReportSection title="Advies voor vervolg">
            <p>
              Advies is om de laagst scorende vragen te gebruiken als basis
              voor een eerste roadmap. Start met het concreet maken van
              eigenaarschap, gewenste werkwijze en minimale stuurinformatie.
            </p>
            <p>
              De volgende technische stap is niet een AFAS-koppeling, maar een
              Excel-template waarmee de vraagcatalogus buiten de code kan worden
              beheerd en gevalideerd.
            </p>
          </ReportSection>
        </article>

        <aside className="rounded-3xl bg-slate-50 p-6">
          <h4 className="font-semibold">Scaninformatie</h4>
          <div className="mt-5 space-y-4 text-sm">
            <MiniInfo label="Organisatie" value={form.organisatienaam} />
            <MiniInfo label="Branche" value={form.branche} />
            <MiniInfo label="Medewerkers" value={form.medewerkers} />
            <MiniInfo label="Administraties" value={form.administraties} />
            <MiniInfo label="Consultant" value={form.consultant} />
            <MiniInfo label="Datum" value={form.datum} />
            <MiniInfo label="Totaalscore" value={averageScore.toFixed(1)} />
            <MiniInfo label="Vragenbron" value="Mockdata v2" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function calculateRelevance(
  intakeAnswers: Record<string, IntakeAnswer>
): Record<DomainKey, RelevanceResult> {
  const entries = domainCatalog.map((domain) => {
    if (domain.alwaysRelevant) {
      return [
        domain.key,
        {
          domainKey: domain.key,
          status: "Relevant" as RelevanceStatus,
          includeInScan: true,
          reason:
            "Financieel blijft altijd relevant, omdat elke organisatie financiële processen, controle en verantwoording heeft.",
        },
      ];
    }

    const linkedQuestions = intakeQuestionCatalog.filter(
      (question) => question.active && question.linkedDomains.includes(domain.key)
    );

    const answers = linkedQuestions
      .map((question) => intakeAnswers[question.id])
      .filter((answer): answer is Exclude<IntakeAnswer, ""> => answer !== "");

    const positiveCount = answers.filter((answer) => answer === "ja" || answer === "deels").length;
    const unknownCount = answers.filter((answer) => answer === "onbekend").length;
    const negativeCount = answers.filter((answer) => answer === "nee").length;

    if (answers.length === 0) {
      return [
        domain.key,
        {
          domainKey: domain.key,
          status: "Nog niet bepaald" as RelevanceStatus,
          includeInScan: true,
          reason:
            "Er zijn nog geen intakevragen beantwoord. Het domein blijft zichtbaar zodat het niet onbedoeld buiten beeld raakt.",
        },
      ];
    }

    if (positiveCount > 0) {
      return [
        domain.key,
        {
          domainKey: domain.key,
          status: "Waarschijnlijk relevant" as RelevanceStatus,
          includeInScan: true,
          reason:
            "Eén of meer herkenbare situaties wijzen erop dat dit domein relevant is voor de scan.",
        },
      ];
    }

    if (unknownCount > 0) {
      return [
        domain.key,
        {
          domainKey: domain.key,
          status: "Nader verkennen" as RelevanceStatus,
          includeInScan: true,
          reason:
            "Eén of meer antwoorden zijn onbekend. Dit domein wordt niet weggehaald, maar moet in het gesprek worden verkend.",
        },
      ];
    }

    if (negativeCount === answers.length) {
      return [
        domain.key,
        {
          domainKey: domain.key,
          status: "Niet primair voor deze scan" as RelevanceStatus,
          includeInScan: false,
          reason:
            "De intake geeft nu weinig aanleiding voor verdieping. Het domein blijft zichtbaar om blinde vlekken te voorkomen.",
        },
      ];
    }

    return [
      domain.key,
      {
        domainKey: domain.key,
        status: "Nog niet bepaald" as RelevanceStatus,
        includeInScan: true,
        reason: "De relevantie is nog niet scherp genoeg bepaald.",
      },
    ];
  });

  return Object.fromEntries(entries) as Record<DomainKey, RelevanceResult>;
}

function calculateDomainScores(
  responses: Record<string, QuestionResponse>
): Record<DomainKey, number> {
  const entries = domainCatalog.map((domain) => {
    const questions = questionCatalog.filter(
      (question) => question.active && question.domainKey === domain.key
    );

    const totalWeight = questions.reduce((sum, question) => sum + question.weight, 0);
    const weightedScore = questions.reduce((sum, question) => {
      const score = responses[question.id]?.score ?? 0;
      return sum + score * question.weight;
    }, 0);

    return [domain.key, totalWeight > 0 ? weightedScore / totalWeight : 0];
  });

  return Object.fromEntries(entries) as Record<DomainKey, number>;
}

function getDomain(domainKey: DomainKey) {
  return domainCatalog.find((domain) => domain.key === domainKey) ?? domainCatalog[0];
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  return (
    <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
      <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
        Score
      </div>
      <div className="mt-1 text-2xl font-semibold">
        {score.toFixed(1)} <span className="text-sm font-medium text-slate-300">/ 7</span>
      </div>
      <div className="text-sm text-slate-300">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: RelevanceStatus }) {
  const className =
    status === "Relevant" || status === "Waarschijnlijk relevant"
      ? "bg-slate-950 text-white"
      : status === "Nader verkennen" || status === "Nog niet bepaald"
        ? "bg-white text-slate-700 ring-1 ring-slate-200"
        : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {status}
    </span>
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

function MultiSelectField({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  function toggle(option: string) {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
      return;
    }
    onChange([...values, option]);
  }

  return (
    <div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => toggle(option)}
            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
              values.includes(option)
                ? "bg-slate-950 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
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
        rows={3}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-950"
      />
    </label>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function InfoPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h4 className="text-xl font-semibold">{title}</h4>
      <div className="mt-3 space-y-3 leading-7 text-slate-700">{children}</div>
    </section>
  );
}
