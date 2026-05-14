const adminLinks = [
  {
    title: "Definitiecontrole",
    description:
      "Controleer of categorieën, dimensies, vragen, option sets en scores technisch kloppen.",
    href: "/definition-check",
    label: "Open controle",
  },
  {
    title: "Importtemplate bekijken",
    description:
      "Bekijk welke kolommen nodig zijn voor beheer via Excel, GetConnector of een toekomstige beheerpagina.",
    href: "/definition-template",
    label: "Bekijk template",
  },
  {
    title: "Excel-template downloaden",
    description:
      "Download een lege Excel-template die Key Users straks kunnen invullen.",
    href: "/api/definition-template",
    label: "Download template",
  },
  {
    title: "Huidige definitie downloaden",
    description:
      "Download de huidige werkende configuratie als Excel-bestand.",
    href: "/api/definition-export",
    label: "Download definitie",
  },
];

export default function DefinitionAdminPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          KWEEKERS Groeimodel
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Definitiebeheer
        </h1>

        <p className="max-w-3xl text-sm text-muted-foreground">
          Centrale plek voor controle, export en voorbereiding van beheer van
          categorieën, dimensies, vragen en antwoordopties.
        </p>
      </div>

      <div className="mt-6 rounded-3xl border border-black/10 bg-black/[0.02] p-6">
  <div className="space-y-2">
    <h2 className="text-lg font-semibold">Status richting beheer door Key Users</h2>
    <p className="text-sm text-muted-foreground">
      De app is technisch voorbereid op beheer buiten code. De echte importfunctie
      en een volledig beheerscherm moeten nog gebouwd worden.
    </p>
  </div>

  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="text-sm font-semibold">Fase 1</div>
      <div className="mt-1 text-sm text-muted-foreground">
        Definitie centraal maken
      </div>
      <div className="mt-3 inline-flex rounded-full border border-black/10 bg-black px-2.5 py-1 text-xs font-medium text-white">
        Gereed
      </div>
    </div>

    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="text-sm font-semibold">Fase 2</div>
      <div className="mt-1 text-sm text-muted-foreground">
        Export, template en controle
      </div>
      <div className="mt-3 inline-flex rounded-full border border-black/10 bg-black px-2.5 py-1 text-xs font-medium text-white">
        Gereed
      </div>
    </div>

    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="text-sm font-semibold">Fase 3</div>
      <div className="mt-1 text-sm text-muted-foreground">
        Import vanuit Excel
      </div>
      <div className="mt-3 inline-flex rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-black">
        Nog te bouwen
      </div>
    </div>

    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="text-sm font-semibold">Fase 4</div>
      <div className="mt-1 text-sm text-muted-foreground">
        Beheerscherm voor Key Users
      </div>
      <div className="mt-3 inline-flex rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-black">
        Later
      </div>
    </div>
  </div>
</div>
      
      <section className="grid gap-4 md:grid-cols-2">
        {adminLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-3xl border border-black/10 bg-white p-6 transition hover:bg-black/[0.02]"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>

            <div className="mt-5 inline-flex rounded-2xl border border-black/10 bg-black px-4 py-2 text-sm font-medium text-white">
              {item.label}
            </div>
          </a>
        ))}
      </section>

<section className="rounded-3xl border border-black/10 bg-black/[0.02] p-6">
  <div className="space-y-2">
    <h2 className="text-lg font-semibold">Conclusie voor MT en Key Users</h2>

    <p className="text-sm text-muted-foreground">
      De app is op dit moment technisch voorbereid op beheer door Key Users,
      maar nog niet volledig self-service. De definitie van categorieën,
      dimensies, vragen, antwoordopties en scores staat nu centraal en kan
      gecontroleerd en geëxporteerd worden.
    </p>
  </div>

  <div className="mt-5 grid gap-4 md:grid-cols-3">
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="text-sm font-semibold">Wat kan nu al?</div>
      <p className="mt-2 text-sm text-muted-foreground">
        De huidige definitie kan worden gecontroleerd, bekeken en als Excel
        worden geëxporteerd. Ook is er een Excel-template beschikbaar als
        basis voor toekomstig beheer.
      </p>
    </div>

    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="text-sm font-semibold">Wat kan nog niet?</div>
      <p className="mt-2 text-sm text-muted-foreground">
        Key Users kunnen nog niet zelf wijzigingen uploaden of rechtstreeks
        via een beheerscherm aanpassen. Daarvoor is nog een importfunctie of
        beheerinterface nodig.
      </p>
    </div>

    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="text-sm font-semibold">Volgende bouwstap</div>
      <p className="mt-2 text-sm text-muted-foreground">
        De volgende stap is een veilige importcontrole: eerst Excel inlezen,
        controleren op fouten en pas daarna wijzigingen kunnen toepassen.
      </p>
    </div>
  </div>
</section>
    </main>
  );
}
