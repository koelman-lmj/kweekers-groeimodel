"use client";

export default function HandoutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-900">
            KWEEKERS Groeimodel - Scan Handout
          </h1>
          <button
            onClick={() => window.print()}
            className="rounded-2xl bg-[#E86C24] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#d15f1d] transition print:hidden"
          >
            Print / PDF
          </button>
        </div>

        <p className="text-neutral-600 mb-8">
          Dit document bevat alle vragen en antwoordopties van de begeleide
          scan.
        </p>

        {/* Section 1: Klantprofiel */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 pb-2 border-b-2 border-[#E86C24]">
            1. KLANTPROFIEL - Context en uitgangssituatie
          </h2>

          <Question
            number="1.1"
            title="Klantnaam"
            type="Tekstveld"
            description="Vul de naam van de organisatie in."
          />

          <Question
            number="1.2"
            title="Sector"
            type="Enkele keuze"
            options={["Zorg", "Onderwijs", "Non-profit", "Commercieel", "Overig"]}
          />

          <Question
            number="1.3"
            title="Organisatiegrootte"
            type="Enkele keuze"
            options={[
              "1–25 medewerkers",
              "26–100 medewerkers",
              "101–250 medewerkers",
              "251–500 medewerkers",
              "500+ medewerkers",
            ]}
          />

          <Question
            number="1.4"
            title="Aantal administraties / entiteiten"
            type="Enkele keuze"
            options={[
              "1 administratie",
              "2–3 administraties",
              "4–10 administraties",
              "10+ administraties",
            ]}
          />

          <Question
            number="1.5"
            title="Type organisatie en operatie"
            type="Meerdere keuzes mogelijk"
            options={[
              { label: "Centraal aangestuurd", description: "Belangrijke keuzes, inrichting en werkwijze worden vooral centraal bepaald" },
              { label: "Meerdere teams / locaties", description: "De organisatie werkt vanuit meerdere teams, vestigingen of locaties" },
              { label: "Meerdere entiteiten", description: "Er zijn meerdere bv's, administraties of organisatorische eenheden" },
              { label: "Projectmatig", description: "Werk wordt voor een belangrijk deel uitgevoerd en gestuurd per project" },
              { label: "Transactiegedreven", description: "De operatie draait vooral om repeterende transacties, volume en verwerking" },
              { label: "Hybride", description: "De organisatie combineert meerdere werkvormen naast elkaar" },
            ]}
          />

          <Question
            number="1.6"
            title="Gebruikte AFAS-onderdelen"
            type="Meerdere keuzes mogelijk"
            options={[
              "CRM", "Financieel", "Inkoop", "Ordermanagement", "Projecten", "HRM",
              "Payroll", "InSite", "OutSite", "Workflow", "Autorisatie",
              "Rapportage / dashboards", "Integraties", "Abonnementen", "Declaraties",
              "Verlof / verzuim", "Dossier / documentbeheer", "Overig",
            ]}
          />

          <Question
            number="1.7"
            title="Wie is verantwoordelijk voor wijzigingen in AFAS?"
            type="Enkele keuze"
            options={[
              { label: "Beheer uitbesteed aan externe partij", description: "Functioneel beheer en wijzigingen liggen vooral bij een externe partner" },
              { label: "1 beheerder", description: "Er is één persoon die AFAS en procesbeheer grotendeels trekt" },
              { label: "Beheerdersteam (centraal geregeld)", description: "Beheer is centraal georganiseerd in een vast team of centrale beheerfunctie" },
              { label: "Beheer per afdeling (key-users) zonder centraal", description: "Beheer ligt verspreid bij key-users of afdelingen, zonder centrale regie" },
              { label: "Geen duidelijke beheerstructuur", description: "Er is geen duidelijke beheerstructuur of vast aanspreekpunt ingericht" },
            ]}
          />

          <Question
            number="1.8"
            title="Sinds wanneer gebruikt de organisatie AFAS?"
            type="Enkele keuze"
            options={[
              { label: "Minder dan 2 jaar", description: "AFAS is nog relatief recent in gebruik" },
              { label: "2 tot 5 jaar", description: "AFAS is al enige tijd in gebruik" },
              { label: "5 tot 10 jaar", description: "De inrichting heeft al meerdere jaren historie" },
              { label: "10 jaar of langer", description: "AFAS heeft een lange historie binnen de organisatie" },
              { label: "Onbekend", description: "Het is niet goed bekend sinds wanneer AFAS in gebruik is" },
            ]}
          />

          <Question
            number="1.9"
            title="Hoe goed is de inrichting de afgelopen jaren onderhouden?"
            type="Enkele keuze"
            options={[
              { label: "Goed onderhouden", description: "Beheer, opschoning, documentatie en wijzigingen zijn goed bijgehouden" },
              { label: "Redelijk onderhouden", description: "De basis is bijgehouden, maar niet alles even strak" },
              { label: "Achterstallig onderhoud", description: "Er is duidelijk achterstand in beheer en documentatie" },
              { label: "Moeilijk te beoordelen", description: "Het is nog niet goed vast te stellen" },
            ]}
          />

          <Question
            number="1.10"
            title="Worden in de komende jaren fusies, overnames of afsplitsingen verwacht?"
            type="Enkele keuze"
            options={[
              { label: "Ja, waarschijnlijk", description: "Er worden organisatieveranderingen voorzien" },
              { label: "Mogelijk", description: "Er zijn signalen of plannen, maar nog geen zekerheid" },
              { label: "Nee", description: "Er worden geen grote veranderingen verwacht" },
              { label: "Nog onbekend", description: "Het is nog niet duidelijk" },
            ]}
          />

          <Question
            number="1.11"
            title="Hoeveel maatwerk zit er in de AFAS-inrichting?"
            type="Enkele keuze"
            options={[
              { label: "AFAS Standaard", description: "De inrichting volgt grotendeels de standaard" },
              { label: "Standaard met een klein beetje maatwerk", description: "De basis is standaard, met enkele aanpassingen" },
              { label: "Veel maatwerk", description: "De inrichting leunt sterk op maatwerk en uitzonderingen" },
              { label: "Moeilijk te beoordelen", description: "Het is nu nog niet duidelijk" },
            ]}
          />

          <Question
            number="1.12"
            title="Belangrijkste procesketens"
            type="Meerdere keuzes mogelijk"
            options={[
              "Lead tot order", "Order tot factuur", "Inkoop tot betaling",
              "Project tot factuur", "HR tot salaris", "Service / support",
              "Rapportage en sturing", "Stamdata en beheer", "Koppelingen en uitwisseling",
            ]}
          />

          <Question
            number="1.13"
            title="Aanleiding en doel van de scan"
            type="Enkele keuze"
            options={[
              "Nulmeting", "Optimalisatie", "Herinrichting",
              "Rapportage & sturing", "Voorbereiding op groei", "Overig",
            ]}
          />

          <Question
            number="1.14"
            title="Belangrijkste knelpunten op dit moment"
            type="Meerdere keuzes mogelijk"
            options={[
              "Processen", "AFAS-inrichting", "Rapportage en stuurinformatie",
              "Eigenaarschap", "Data / integraties", "Adoptie en gebruik",
            ]}
          />
        </section>

        {/* Section 2: Scope */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 pb-2 border-b-2 border-[#E86C24]">
            2. SCOPE - Richting en diepgang
          </h2>

          <Question
            number="2.1"
            title="Breedte van de scan"
            type="Enkele keuze"
            options={[
              { label: "Smal", description: "Gericht op een beperkt aantal onderdelen" },
              { label: "Normaal", description: "Een gebalanceerde scan van de belangrijkste onderdelen" },
              { label: "Breed", description: "Een brede scan over meerdere domeinen en processen" },
            ]}
          />

          <Question
            number="2.2"
            title="Belangrijkste focusgebieden"
            type="Meerdere keuzes mogelijk"
            options={[
              "Organisatie en eigenaarschap", "Processen en werkwijze",
              "AFAS-inrichting en gebruik", "Rapportage en sturing", "Beheer en doorontwikkeling",
            ]}
          />

          <Question
            number="2.3"
            title="Gewenst detailniveau"
            type="Enkele keuze"
            options={[
              "Snel eerste beeld", "Gericht verdiepen", "Basis voor concreet verbeterplan",
            ]}
          />
        </section>

        {/* Section 3: Diagnose */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 pb-2 border-b-2 border-[#E86C24]">
            3. DIAGNOSE - Kernvragen en verdieping
          </h2>

          <h3 className="text-lg font-semibold text-neutral-800 mb-4 mt-8">
            Organisatie & Beheer
          </h3>

          <ScoredQuestion
            number="3.1"
            title="Eigenaarschap van processen en inrichting"
            description="Hoe duidelijk is het eigenaarschap nu?"
            options={[
              { label: "Onduidelijk", score: 1 },
              { label: "Deels duidelijk", score: 2 },
              { label: "Duidelijk belegd", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.2"
            title="Besluitvorming over wijzigingen"
            description="Hoe worden wijzigingen nu besloten?"
            options={[
              { label: "Ad hoc", score: 1 },
              { label: "Deels afgestemd", score: 2 },
              { label: "Vast proces", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.3"
            title="Sturing op verbetering"
            description="Hoe structureel wordt er op verbetering gestuurd?"
            options={[
              { label: "Nauwelijks", score: 1 },
              { label: "Af en toe", score: 2 },
              { label: "Structureel", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.4"
            title="Eenduidigheid van werkwijze"
            description="Hoe eenduidig verlopen de belangrijkste processen?"
            options={[
              { label: "Sterk verschillend", score: 1 },
              { label: "Redelijk eenduidig", score: 2 },
              { label: "Grotendeels gestandaardiseerd", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.5"
            title="Vastlegging van werkafspraken"
            description="Hoe goed zijn werkwijze en afspraken vastgelegd?"
            options={[
              { label: "Onduidelijk", score: 1 },
              { label: "Deels duidelijk", score: 2 },
              { label: "Duidelijk belegd", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.6"
            title="Omgaan met uitzonderingen"
            description="Hoe beheersbaar zijn uitzonderingen nu?"
            options={[
              { label: "Uitzonderingen zijn de norm", score: 1 },
              { label: "Regelmatig maar beheersbaar", score: 2 },
              { label: "Beperkt en beheerst", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.7"
            title="Structureel oplossen van knelpunten"
            description="Hoe pak je terugkerende problemen aan?"
            options={[
              { label: "Vooral handmatig herstellen", score: 1 },
              { label: "Soms structureel, soms ad hoc", score: 2 },
              { label: "Meestal structureel opgelost", score: 3 },
            ]}
          />

          <h3 className="text-lg font-semibold text-neutral-800 mb-4 mt-8">
            AFAS Modules - Financieel
            <span className="ml-2 text-sm font-normal text-neutral-500">
              (Zichtbaar wanneer Financieel is geselecteerd)
            </span>
          </h3>

          <Question
            number="3.8"
            title="Waar ervaar je nu de meeste problemen binnen financieel?"
            type="Enkele keuze"
            options={[
              { label: "Betrouwbaarheid van de basis", description: "De grootste opgave zit in een stabiele en betrouwbare financiële basis" },
              { label: "Uitzonderingen en handwerk", description: "De grootste opgave zit in afwijkingen, correcties en handmatige verwerking" },
              { label: "Stuurinformatie en inzicht", description: "De grootste opgave zit in tijdig, betrouwbaar en bruikbaar inzicht" },
              { label: "Complexiteit door meerdere administraties", description: "De grootste opgave zit in structuur en afstemming tussen administraties" },
            ]}
          />

          <ScoredQuestion
            number="3.9"
            title="Hoe betrouwbaar zijn de financiële basisgegevens?"
            description="Denk aan grootboek, dagboeken en stamdata."
            options={[
              { label: "Kwetsbaar", score: 1 },
              { label: "Redelijk", score: 2 },
              { label: "Sterk", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.10"
            title="Uitzonderingen in financiële verwerking"
            options={[
              { label: "Vooral handmatig", score: 1 },
              { label: "Deels beheersbaar", score: 2 },
              { label: "Goed beheerst", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.11"
            title="Financiële stuurinformatie"
            options={[
              { label: "Beperkt bruikbaar", score: 1 },
              { label: "Deels bruikbaar", score: 2 },
              { label: "Goed bruikbaar", score: 3 },
            ]}
          />

          <h3 className="text-lg font-semibold text-neutral-800 mb-4 mt-8">
            AFAS Modules - Ordermanagement
            <span className="ml-2 text-sm font-normal text-neutral-500">
              (Zichtbaar wanneer Ordermanagement is geselecteerd)
            </span>
          </h3>

          <Question
            number="3.12"
            title="Waar ervaar je nu de meeste problemen binnen ordermanagement?"
            type="Enkele keuze"
            options={[
              { label: "Orderinvoer en verwerking", description: "De grootste opgave zit in het goed en eenduidig verwerken van orders" },
              { label: "Blokkades en vrijgave", description: "De grootste opgave zit in controle, vrijgave en uitzonderingen" },
              { label: "Levering en facturatie", description: "De grootste opgave zit in de doorstroming naar levering en factuur" },
              { label: "Afwijkingen en handwerk", description: "De grootste opgave zit in afwijkende routes en handmatige ingrepen" },
            ]}
          />

          <ScoredQuestion
            number="3.13"
            title="Eenduidigheid van de orderroute"
            options={[
              { label: "Sterk verschillend", score: 1 },
              { label: "Redelijk eenduidig", score: 2 },
              { label: "Grotendeels gestandaardiseerd", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.14"
            title="Afwijkingen in orderafhandeling"
            options={[
              { label: "Uitzonderingen zijn de norm", score: 1 },
              { label: "Regelmatig maar beheersbaar", score: 2 },
              { label: "Beperkt en beheerst", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.15"
            title="Aansluiting tussen orderproces en AFAS-inrichting"
            options={[
              { label: "Sluit beperkt aan", score: 1 },
              { label: "Sluit deels aan", score: 2 },
              { label: "Sluit goed aan", score: 3 },
            ]}
          />

          <h3 className="text-lg font-semibold text-neutral-800 mb-4 mt-8">
            AFAS Modules - CRM
            <span className="ml-2 text-sm font-normal text-neutral-500">
              (Zichtbaar wanneer CRM is geselecteerd)
            </span>
          </h3>

          <Question
            number="3.16"
            title="Waar ervaar je nu de meeste problemen binnen CRM?"
            type="Enkele keuze"
            options={[
              { label: "Leadopvolging en commerciële discipline", description: "De grootste opgave zit in het consequent vastleggen en opvolgen" },
              { label: "Pipeline en forecast", description: "De grootste opgave zit in grip op kansen en verwachte omzet" },
              { label: "Relatie- en contactgegevens", description: "De grootste opgave zit in kwaliteit en actualiteit van CRM-gegevens" },
              { label: "Gebruik en adoptie", description: "De grootste opgave zit in structureel gebruik van CRM" },
            ]}
          />

          <ScoredQuestion
            number="3.17"
            title="Eenduidigheid van CRM-werkwijze"
            options={[
              { label: "Sterk verschillend", score: 1 },
              { label: "Redelijk eenduidig", score: 2 },
              { label: "Grotendeels gestandaardiseerd", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.18"
            title="Kwaliteit van CRM-gegevens"
            options={[
              { label: "Beperkt bruikbaar", score: 1 },
              { label: "Deels bruikbaar", score: 2 },
              { label: "Goed bruikbaar", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.19"
            title="Bruikbaarheid van commerciële stuurinformatie"
            options={[
              { label: "Beperkt bruikbaar", score: 1 },
              { label: "Deels bruikbaar", score: 2 },
              { label: "Goed bruikbaar", score: 3 },
            ]}
          />

          <h3 className="text-lg font-semibold text-neutral-800 mb-4 mt-8">
            AFAS Modules - HRM
            <span className="ml-2 text-sm font-normal text-neutral-500">
              (Zichtbaar wanneer HRM is geselecteerd)
            </span>
          </h3>

          <Question
            number="3.20"
            title="Waar ervaar je nu de meeste problemen binnen HRM?"
            type="Enkele keuze"
            options={[
              { label: "Mutatieverwerking", description: "De grootste opgave zit in het correct en tijdig verwerken van HR-mutaties" },
              { label: "Dossiers en vastlegging", description: "De grootste opgave zit in volledigheid en kwaliteit van HR-dossiers" },
              { label: "Procesuniformiteit", description: "De grootste opgave zit in eenduidige HR-processen" },
              { label: "Selfservice en gebruik", description: "De grootste opgave zit in gebruik door medewerkers" },
            ]}
          />

          <ScoredQuestion
            number="3.21"
            title="Eenduidigheid van HRM-processen"
            options={[
              { label: "Sterk verschillend", score: 1 },
              { label: "Redelijk eenduidig", score: 2 },
              { label: "Grotendeels gestandaardiseerd", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.22"
            title="Kwaliteit van HRM-vastlegging"
            options={[
              { label: "Beperkt bruikbaar", score: 1 },
              { label: "Deels bruikbaar", score: 2 },
              { label: "Goed bruikbaar", score: 3 },
            ]}
          />

          <h3 className="text-lg font-semibold text-neutral-800 mb-4 mt-8">
            Rapportage & Data
          </h3>

          <Question
            number="3.23"
            title="Waar ervaar je nu de meeste problemen binnen rapportage?"
            type="Enkele keuze"
            options={[
              { label: "Definities en KPI's", description: "De grootste opgave zit in eenduidige definities" },
              { label: "Betrouwbaarheid van cijfers", description: "De grootste opgave zit in vertrouwen in de juistheid" },
              { label: "Snelheid en actualiteit", description: "De grootste opgave zit in tijdige beschikbaarheid" },
              { label: "Bruikbaarheid voor sturing", description: "De grootste opgave zit in daadwerkelijk gebruik" },
            ]}
          />

          <ScoredQuestion
            number="3.24"
            title="Eenduidigheid van definities en KPI's"
            options={[
              { label: "Onduidelijk", score: 1 },
              { label: "Deels duidelijk", score: 2 },
              { label: "Duidelijk belegd", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.25"
            title="Bruikbaarheid van rapportage voor sturing"
            options={[
              { label: "Beperkt bruikbaar", score: 1 },
              { label: "Deels bruikbaar", score: 2 },
              { label: "Goed bruikbaar", score: 3 },
            ]}
          />

          <h3 className="text-lg font-semibold text-neutral-800 mb-4 mt-8">
            Integraties
            <span className="ml-2 text-sm font-normal text-neutral-500">
              (Zichtbaar wanneer Integraties is geselecteerd)
            </span>
          </h3>

          <Question
            number="3.26"
            title="Waar ervaar je nu de meeste problemen met integraties?"
            type="Enkele keuze"
            options={[
              { label: "Stabiliteit van de keten", description: "De grootste opgave zit in uitval en continuïteit" },
              { label: "Eigenaarschap en beheer", description: "De grootste opgave zit in duidelijke verantwoordelijkheid" },
              { label: "Monitoring en opvolging", description: "De grootste opgave zit in signalering van fouten" },
              { label: "Handmatig herstel", description: "De grootste opgave zit in afhankelijkheid van handmatige acties" },
            ]}
          />

          <ScoredQuestion
            number="3.27"
            title="Stabiliteit van koppelingen"
            options={[
              { label: "Kwetsbaar", score: 1 },
              { label: "Redelijk", score: 2 },
              { label: "Sterk", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.28"
            title="Duidelijkheid van eigenaarschap op integraties"
            options={[
              { label: "Onduidelijk", score: 1 },
              { label: "Deels duidelijk", score: 2 },
              { label: "Duidelijk belegd", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.29"
            title="Monitoring en opvolging van koppelingen"
            options={[
              { label: "Nauwelijks", score: 1 },
              { label: "Af en toe", score: 2 },
              { label: "Structureel", score: 3 },
            ]}
          />

          <h3 className="text-lg font-semibold text-neutral-800 mb-4 mt-8">
            Branchespecifiek - Zorg
            <span className="ml-2 text-sm font-normal text-neutral-500">
              (Zichtbaar wanneer Sector = Zorg)
            </span>
          </h3>

          <ScoredQuestion
            number="3.30"
            title="Uitzonderingen in registratie of declaratie"
            options={[
              { label: "Uitzonderingen zijn de norm", score: 1 },
              { label: "Regelmatig maar beheersbaar", score: 2 },
              { label: "Beperkt en beheerst", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.31"
            title="Ondersteuning van verantwoording"
            options={[
              { label: "Beperkt bruikbaar", score: 1 },
              { label: "Deels bruikbaar", score: 2 },
              { label: "Goed bruikbaar", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.32"
            title="Eenduidigheid van zorgprocessen"
            options={[
              { label: "Sterk verschillend", score: 1 },
              { label: "Redelijk eenduidig", score: 2 },
              { label: "Grotendeels gestandaardiseerd", score: 3 },
            ]}
          />

          <h3 className="text-lg font-semibold text-neutral-800 mb-4 mt-8">
            Branchespecifiek - Onderwijs
            <span className="ml-2 text-sm font-normal text-neutral-500">
              (Zichtbaar wanneer Sector = Onderwijs)
            </span>
          </h3>

          <ScoredQuestion
            number="3.33"
            title="Eenduidigheid van intake en planning"
            options={[
              { label: "Sterk verschillend", score: 1 },
              { label: "Redelijk eenduidig", score: 2 },
              { label: "Grotendeels gestandaardiseerd", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.34"
            title="Aansluiting tussen onderwijsproces en administratie"
            options={[
              { label: "Sluit beperkt aan", score: 1 },
              { label: "Sluit deels aan", score: 2 },
              { label: "Sluit goed aan", score: 3 },
            ]}
          />

          <ScoredQuestion
            number="3.35"
            title="Uitzonderingen in traject- of cursusadministratie"
            options={[
              { label: "Uitzonderingen zijn de norm", score: 1 },
              { label: "Regelmatig maar beheersbaar", score: 2 },
              { label: "Beperkt en beheerst", score: 3 },
            ]}
          />
        </section>

        {/* Score explanation */}
        <section className="mb-12 p-6 bg-neutral-50 rounded-2xl">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">
            Scoreberekening
          </h2>
          <p className="text-neutral-600 mb-4">
            Bij de diagnose-vragen wordt een score van 1-3 toegekend:
          </p>
          <ul className="space-y-2 text-neutral-600">
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-semibold text-sm">
                1
              </span>
              <span>Laag / Onvoldoende</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-sm">
                2
              </span>
              <span>Gemiddeld / Deels voldoende</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold text-sm">
                3
              </span>
              <span>Hoog / Voldoende</span>
            </li>
          </ul>
        </section>

        <footer className="text-center text-sm text-neutral-500 border-t pt-6">
          KWEEKERS Groeimodel - Versie 1.0
        </footer>
      </div>
    </div>
  );
}

interface QuestionOption {
  label: string;
  description?: string;
}

interface QuestionProps {
  number: string;
  title: string;
  type: string;
  description?: string;
  options?: (string | QuestionOption)[];
}

function Question({ number, title, type, description, options }: QuestionProps) {
  return (
    <div className="mb-6 p-4 border border-neutral-200 rounded-xl">
      <div className="flex items-start gap-3 mb-2">
        <span className="text-sm font-medium text-[#E86C24] bg-orange-50 px-2 py-0.5 rounded">
          {number}
        </span>
        <div className="flex-1">
          <h4 className="font-semibold text-neutral-900">{title}</h4>
          <span className="text-xs text-neutral-500">{type}</span>
        </div>
      </div>
      {description && (
        <p className="text-sm text-neutral-600 mb-3 ml-10">{description}</p>
      )}
      {options && (
        <div className="ml-10 space-y-1">
          {options.map((opt, i) => {
            const isObject = typeof opt === "object";
            const label = isObject ? opt.label : opt;
            const desc = isObject ? opt.description : undefined;
            return (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-neutral-400 mt-0.5">•</span>
                <div>
                  <span className="text-neutral-700">{label}</span>
                  {desc && (
                    <span className="text-neutral-500 ml-1">— {desc}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ScoredOption {
  label: string;
  score: number;
}

interface ScoredQuestionProps {
  number: string;
  title: string;
  description?: string;
  options: ScoredOption[];
}

function ScoredQuestion({ number, title, description, options }: ScoredQuestionProps) {
  return (
    <div className="mb-6 p-4 border border-neutral-200 rounded-xl">
      <div className="flex items-start gap-3 mb-2">
        <span className="text-sm font-medium text-[#E86C24] bg-orange-50 px-2 py-0.5 rounded">
          {number}
        </span>
        <div className="flex-1">
          <h4 className="font-semibold text-neutral-900">{title}</h4>
          <span className="text-xs text-neutral-500">Enkele keuze (met score)</span>
        </div>
      </div>
      {description && (
        <p className="text-sm text-neutral-600 mb-3 ml-10">{description}</p>
      )}
      <div className="ml-10 space-y-1">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs ${
                opt.score === 1
                  ? "bg-red-100 text-red-700"
                  : opt.score === 2
                  ? "bg-amber-100 text-amber-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {opt.score}
            </span>
            <span className="text-neutral-700">{opt.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
