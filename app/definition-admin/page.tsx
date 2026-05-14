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
          <h2 className="text-lg font-semibold">Aanpak richting Key Users</h2>
          <p className="text-sm text-muted-foreground">
            Deze pagina is bedoeld als tussenstap richting beheer buiten code.
            Eerst zorgen we dat export, template en controle stabiel zijn.
            Daarna kan import of beheer via een scherm veilig worden toegevoegd.
          </p>
        </div>
      </section>
    </main>
  );
}
