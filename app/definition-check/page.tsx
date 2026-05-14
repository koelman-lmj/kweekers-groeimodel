import { validateDefinition } from "@/lib/scan/definition/validate-definition";

export default function DefinitionCheckPage() {
  const result = validateDefinition();

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          KWEEKERS Groeimodel
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Definitiecontrole
        </h1>

        <p className="text-sm text-muted-foreground">
          Controle op dimensies, vragen, option sets, scores en categorieën.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="mt-2 text-2xl font-semibold">
            {result.isValid ? "Gezond" : "Fouten"}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <div className="text-sm text-muted-foreground">Errors</div>
          <div className="mt-2 text-2xl font-semibold">
            {result.errors.length}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <div className="text-sm text-muted-foreground">Warnings</div>
          <div className="mt-2 text-2xl font-semibold">
            {result.warnings.length}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Meldingen</h2>
          <p className="text-sm text-muted-foreground">
            Errors moeten worden opgelost. Warnings zijn aandachtspunten.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {result.messages.length > 0 ? (
            result.messages.map((message, index) => (
              <div
                key={`${message.source}-${message.reference ?? "general"}-${index}`}
                className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-medium uppercase">
                    {message.type}
                  </span>

                  <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-medium">
                    {message.source}
                  </span>

                  {message.reference && (
                    <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {message.reference}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {message.message}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-muted-foreground">
              Geen fouten of waarschuwingen gevonden.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
