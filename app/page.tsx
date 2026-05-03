import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <section className="mx-auto max-w-5xl rounded-3xl border bg-white p-10 shadow-sm sm:p-12">
        <div className="inline-flex rounded-full border px-3 py-1 text-xs font-medium">
          KWEEKERS Groeimodel
        </div>

        <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight">
          Start hier de begeleide diagnose voor digitale volwassenheid.
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
          Bepaal gestructureerd de IST, FIT, GAP en SOLL van een organisatie.
          Niet alleen gericht op AFAS, maar ook op processen, eigenaarschap,
          integraties, data, rapportage, beheer en veranderkracht.
        </p>

        <div className="mt-8 grid gap-3 text-sm text-muted-foreground">
          <div>✓ Gezamenlijk invullen met klant en consultant</div>
          <div>✓ Output: advies en ontwikkelrichting</div>
          <div>✓ Geschikt als nulmeting en vervolgmeting</div>
        </div>

        <div className="mt-10 max-w-xl rounded-2xl border bg-neutral-50 p-5">
          <p className="text-sm font-medium">Stap 1</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start met het invullen van het klantprofiel. Daarna doorloop je
            scope, diagnose en advies.
          </p>

          <div className="mt-4">
            <Link
              href="/scan/nieuw/profile"
              className="inline-flex items-center rounded-2xl bg-black px-8 py-4 text-base font-semibold text-white shadow-sm transition hover:scale-[1.01] hover:opacity-90"
            >
              Start groeimodel →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
