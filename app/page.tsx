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
  width={40}
  height={40}
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
  className="kweekers-primary-button"
>
  Start met klantprofiel →
</Link>
  </div>

<div className="kweekers-accent-box">
  <div className="text-sm font-semibold">Wat gebeurt hierna?</div>
  <p className="mt-2 text-sm">
    Je start met het klantprofiel. Daarna doorloop je scope, diagnose en advies.
  </p>
</div>
</div>
      </section>
    </main>
  );
}
