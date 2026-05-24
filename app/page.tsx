import Image from "next/image";
import Link from "next/link";
import { BUILD_VERSION } from "@/lib/build-info";
import { CheckCircle2, ArrowRight, Sparkles, Clock, MessageCircle } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8 sm:px-6 sm:py-12">
      <p className="mx-auto max-w-4xl text-xs text-slate-400 font-mono mb-4">
        Build: {BUILD_VERSION}
      </p>

      <section className="mx-auto max-w-4xl">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
          {/* Decorative gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-white to-indigo-50/60 pointer-events-none" />
          
          <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 backdrop-blur-sm px-4 py-2.5 shadow-sm">
              <Image
                src="/kweekers-logo.png"
                alt="Kweekers logo"
                width={32}
                height={32}
                className="rounded"
              />
              <span className="text-sm font-semibold text-slate-700 tracking-tight">
                KWEEKERS Groeimodel
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mt-8 max-w-2xl text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight text-balance">
              Start met het{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--kweekers-primary)] to-[var(--kweekers-accent)]">
                KWEEKERS Groeimodel
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-lg sm:text-xl font-medium text-slate-700">
              Van klantgesprek naar roadmap-input
            </p>

            {/* Intro text */}
            <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-slate-600">
              <p>
                Breng samen met de klant in beeld waar de organisatie nu staat, 
                waar de belangrijkste knelpunten zitten en welke ontwikkelrichting logisch is.
              </p>
              <p>
                Het KWEEKERS Groeimodel helpt sales, consultants en business consultants 
                om het gesprek te structureren: van huidige situatie en problemen naar 
                ambitie, benodigde verbeteringen en input voor een eerste roadmap.
              </p>
              <p className="text-slate-500 italic">
                De uitkomst is geen eindadvies, maar een gerichte basis om samen met 
                de klant prioriteiten te bepalen en de werkvoorraad verder uit te werken.
              </p>
            </div>

            {/* Feature List */}
            <div className="mt-8 flex flex-col gap-3">
              {[
                "Samen invullen met klant en consultant",
                "Inzicht in huidige situatie, knelpunten en gewenste richting",
                "Input voor advies, roadmap en vervolggesprek",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-slate-700"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>

            {/* Reassurance Box */}
            <div className="mt-8 max-w-lg rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  Deze scan is bedoeld als begeleid gesprek, geen toets. 
                  Antwoorden hoeven niet perfect te zijn en kunnen later worden aangepast.
                </p>
              </div>
            </div>

            {/* Time indication */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="font-medium">Tijdsindicatie:</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>Snel beeld: <strong>~10 min</strong></span>
                <span className="text-slate-300">|</span>
                <span>Gericht verdiepen: <strong>~30 min</strong></span>
                <span className="text-slate-300">|</span>
                <span>Verbeterplan: <strong>~45-60 min</strong></span>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-10">
              <Link
                href="/scan/nieuw/profile"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--kweekers-accent)] px-7 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:bg-[var(--kweekers-accent-dark)] hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                Start het groeimodel
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Info Box */}
            <div className="mt-8 max-w-xl rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-900">
                    Wat gebeurt hierna?
                  </h3>
                  <p className="mt-1.5 text-sm text-amber-800/80 leading-relaxed">
                    We starten met de organisatiecontext en bepalen daarna welke 
                    onderwerpen relevant zijn. Het groeimodel helpt om scherp te 
                    krijgen waar de klant nu staat, waar verbetering nodig is en 
                    welke stappen logisch zijn richting advies, roadmap en werkvoorraad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-10 text-center text-sm text-slate-500">
          <div>
            <span className="block text-2xl font-bold text-slate-700">6</span>
            <span>Stappen</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-slate-700">8</span>
            <span>Dimensies</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-slate-700">3</span>
            <span>Diepteniveaus</span>
          </div>
        </div>
      </section>
    </main>
  );
}
