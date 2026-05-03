import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <section className="mx-auto max-w-5xl rounded-3xl border bg-white p-10 shadow-sm sm:p-12">
<div className="kweekers-badge">
  <Image
    src="/kweekers-logo.png"
    alt="Kweekers logo"
    width={28}
    height={28}
  />
  <span>KWEEKERS Groeimodel</span>
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

<div className="mt-10 max-w-xl space-y-4">
  <div>
    <Link
      href="/scan/nieuw/profile"
Start met klantprofiel →
    >
      Start met klantprofiel →
    </Link>
  </div>

<div className="rounded-2xl bg-neutral-100/80 p-4">
  <p className="text-sm font-semibold text-neutral-900">
    Wat gebeurt hierna?
  </p>
  <p className="mt-1 text-sm leading-6 text-neutral-600">
Je start met het klantprofiel. Daarna doorloop je scope, diagnose en advies.
  </p>
</div>
</div>
      </section>
    </main>
  );
}
