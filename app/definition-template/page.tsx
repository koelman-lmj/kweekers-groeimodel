import { importTemplateSheets } from "@/lib/scan/definition/import-template";

export default function DefinitionTemplatePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          KWEEKERS Groeimodel
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Importtemplate
        </h1>

        <p className="max-w-3xl text-sm text-muted-foreground">
          Overzicht van de datastructuur die later gebruikt kan worden voor
          beheer via Excel, GetConnector of een beheerpagina.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {importTemplateSheets.map((sheet) => (
          <div
            key={sheet.key}
            className="rounded-2xl border border-black/10 bg-white p-5"
          >
            <div className="text-sm text-muted-foreground">{sheet.key}</div>
            <div className="mt-2 text-lg font-semibold">{sheet.title}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              {sheet.columns.length} kolommen
            </div>
          </div>
        ))}
      </section>

      <div className="space-y-6">
        {importTemplateSheets.map((sheet) => (
          <section
            key={sheet.key}
            className="rounded-3xl border border-black/10 bg-white p-6"
          >
            <div className="space-y-1">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {sheet.key}
              </div>

              <h2 className="text-xl font-semibold">{sheet.title}</h2>

              <p className="text-sm text-muted-foreground">
                {sheet.description}
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-black/10">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-black/[0.03]">
                  <tr>
                    <th className="border-b border-black/10 px-4 py-3 font-semibold">
                      Kolom
                    </th>
                    <th className="border-b border-black/10 px-4 py-3 font-semibold">
                      Verplicht
                    </th>
                    <th className="border-b border-black/10 px-4 py-3 font-semibold">
                      Omschrijving
                    </th>
                    <th className="border-b border-black/10 px-4 py-3 font-semibold">
                      Voorbeeld
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sheet.columns.map((column) => (
                    <tr key={column.key} className="border-b border-black/5">
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium">{column.label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {column.key}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs">
                          {column.required ? "Ja" : "Nee"}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {column.description}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <code className="rounded-lg bg-black/[0.04] px-2 py-1 text-xs">
                          {column.example}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
