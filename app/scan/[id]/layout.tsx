"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import Image from "next/image";
import type { ReactNode } from "react";
import { ScanProvider } from "@/app/context/ScanContext";

const STEPS = [
  {
    number: "1",
    segment: "profile",
    title: "Klantprofiel",
    description: "Basisgegevens van de klant en sector.",
  },
  {
    number: "2",
    segment: "scope",
    title: "Scope",
    description: "Kies hoe breed je de scan uitvoert.",
  },
  {
    number: "3",
    segment: "diagnose",
    title: "Diagnose",
    description: "Beantwoord de belangrijkste diagnosevragen.",
  },
  {
    number: "4",
    segment: "advies",
    title: "Advies",
    description: "Bekijk de eerste richting en focuspunten.",
  },
];

export default function ScanIdLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();

  const scanId = Array.isArray(params.id) ? params.id[0] : params.id;

  const currentIndex = STEPS.findIndex((step) =>
    pathname?.endsWith(`/${step.segment}`)
  );

  return (
    <ScanProvider>
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="space-y-4">
<div className="kweekers-badge">
  <Image
    src="/kweekers-logo.png"
    alt="Kweekers logo"
    width={24}
    height={24}
  />
  <span>KWEEKERS Groeimodel</span>
</div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Begeleide scan
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Doorloop stap voor stap de basis van het groeimodel en bouw
                    van profiel naar advies.
                  </p>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="text-sm font-medium">Wat je hier doet</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Je vult eerst de context in, kiest daarna de juiste scope,
                    beantwoordt diagnosevragen en eindigt met een eerste
                    adviesrichting.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {STEPS.map((step, index) => {
                    const isActive = index === currentIndex;
                    const isCompleted =
                      currentIndex !== -1 && index < currentIndex;

                    const href = `/scan/${scanId}/${step.segment}`;

                    const cardClass = isActive
                      ? "border-black bg-black text-white"
                      : isCompleted
                      ? "border-black bg-white hover:bg-neutral-50"
                      : "bg-white opacity-70";

                    const numberClass = isActive
                      ? "border-white text-white"
                      : isCompleted
                      ? "border-black text-black"
                      : "border-black text-black";

                    const textClass = isActive
                      ? "text-white/80"
                      : "text-muted-foreground";

                    const content = (
                      <div
                        className={`flex items-start gap-3 rounded-2xl border p-3 transition ${cardClass}`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium ${numberClass}`}
                        >
                          {isCompleted ? "✓" : step.number}
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-medium">{step.title}</div>
                          <div className={`text-sm ${textClass}`}>
                            {step.description}
                          </div>
                        </div>
                      </div>
                    );

                    if (isActive || isCompleted) {
                      return (
                        <Link key={step.segment} href={href} className="block">
                          {content}
                        </Link>
                      );
                    }

                    return <div key={step.segment}>{content}</div>;
                  })}
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ScanProvider>
  );
}
