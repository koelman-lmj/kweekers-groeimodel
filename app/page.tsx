import Image from "next/image";
import Link from "next/link";
import { BUILD_VERSION } from "@/lib/build-info";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Clock,
  MessageCircle,
  Layers,
  Target,
  BarChart3,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50 px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <p className="mx-auto max-w-4xl text-xs text-slate-400 font-mono mb-6">
        Build: {BUILD_VERSION}
      </p>

      <section className="mx-auto max-w-4xl">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-300/40">
          {/* Decorative gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/70 via-white to-indigo-50/50 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-2.5 shadow-sm">
              <Image
                src="/kweekers-logo.png"
                alt="Kweekers logo"
                width={28}
                height={28}
                className="rounded"
              />
              <span className="text-sm font-semibold text-slate-700 tracking-tight">
                KWEEKERS Groeimodel
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mt-8 max-w-2xl text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-900 leading-[1.15] text-balance">
              Van klantgesprek naar{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--kweekers-primary)] via-[var(--kweekers-accent)] to-orange-500">
                roadmap-input
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-xl leading-relaxed">
              Breng samen met de klant in beeld waar de organisatie staat, 
              waar knelpunten zitten en welke ontwikkelrichting logisch is.
            </p>

            {/* Feature List */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-3">
              {[
                "Samen invullen met klant en consultant",
                "Inzicht in huidige situatie en knelpunten",
                "Input voor advies en roadmap",
                "Geschikt als nulmeting en vervolgmeting",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-slate-700"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-sm sm:text-[0.938rem]">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Section - More prominent */}
            <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <Link
                href="/scan/nieuw/profile"
                className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[var(--kweekers-accent)] to-orange-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Start het groeimodel
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>10-45 min afhankelijk van diepte</span>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-10 border-t border-slate-200/80" />

            {/* Info Section */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Left: What to expect */}
              <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-orange-50/40 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-900">
                      Wat kun je verwachten?
                    </h3>
                    <p className="mt-2 text-sm text-amber-800/80 leading-relaxed">
                      We starten met de organisatiecontext en bepalen welke 
                      onderwerpen relevant zijn. Het groeimodel helpt scherp te 
                      krijgen waar verbetering nodig is en welke stappen logisch zijn.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Reassurance */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100">
                    <MessageCircle className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">
                      Geen toets, wel een goed gesprek
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      Deze scan is bedoeld als begeleid gesprek. Antwoorden hoeven 
                      niet perfect te zijn en kunnen later worden aangepast.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6 max-w-lg mx-auto">
          {[
            { icon: Layers, value: "6", label: "Stappen" },
            { icon: BarChart3, value: "8", label: "Dimensies" },
            { icon: Target, value: "3", label: "Diepteniveaus" },
          ].map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
            >
              <stat.icon className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-2xl font-bold text-slate-800">
                {stat.value}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
