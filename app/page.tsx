import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 p-8">
      <section className="rounded-3xl border bg-background p-10 shadow-sm">
        <div className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium">
          KWEEKERS Groeimodel
        </div>

        <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight">
          Begeleide diagnose voor digitale volwassenheid.
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
          Bepaal gestructureerd de IST, FIT, GAP en SOLL van een organisatie.
          Niet alleen gericht op AFAS, maar ook op processen, eigenaarschap,
          integraties, data, rapportage, beheer en veranderkracht.
        </p>

        <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
          <div>✓ Gezamenlijk invullen met klant en consultant</div>
          <div>✓ Output: advies en ontwikkelrichting</div>
          <div>✓ Geschikt als nulmeting en vervolgmeting</div>
        </div>

        <div className="mt-8">
<Link
  href="/scan/nieuw/profile"
  className="inline-flex rounded-2xl border px-5 py-3 shadow-sm"
>
  Start groeimodel →
</Link>
        </div>
      </section>
    </main>
  );
}
