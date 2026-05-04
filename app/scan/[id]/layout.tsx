"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import Image from "next/image";
import type { ReactNode } from "react";
import { ScanProvider, useScanContext } from "@/app/context/ScanContext";
import { getSectionStatuses } from "@/lib/scan/engine/section-status";

const STEPS = [
  {
    number: "1",
    sectionCodes: ["profile_basis", "profile_reason"],
    primarySectionCode: "profile_basis",
    title: "Klantprofiel",
    description: "Basisgegevens van de klant en sector.",
  },
  {
    number: "2",
    sectionCodes: ["scope"],
    primarySectionCode: "scope",
    title: "Scope",
    description: "Kies hoe breed je de scan uitvoert.",
  },
  {
    number: "3",
    sectionCodes: ["diagnose"],
    primarySectionCode: "diagnose",
    title: "Diagnose",
    description: "Beantwoord de belangrijkste diagnosevragen.",
  },
  {
    number: "4",
    sectionCodes: ["advies"],
    primarySectionCode: "advies",
    title: "Advies",
    description: "Bekijk de eerste richting en focuspunten.",
  },
];

function getCurrentSectionCode(pathname: string | null): string {
  if (!pathname) return "profile_basis";

  const parts = pathname.split("/").filter(Boolean);

  const flowIndex = parts.indexOf("flow");
  if (flowIndex !== -1) {
    return parts[flowIndex + 1] ?? "profile_basis";
  }

  const summaryIndex = parts.indexOf("summary");
  if (summaryIndex !== -1) {
    return parts[summaryIndex + 1] ?? "profile_basis";
  }

  if (pathname.includes("/profile_reason")) return "profile_reason";
  if (pathname.includes("/profile_basis")) return "profile_basis";
  if (pathname.includes("/scope")) return "scope";
  if (pathname.includes("/diagnose")) return "diagnose";
  if (pathname.includes("/advies")) return "advies";

  return "profile_basis";
}

function getStepStatus(
  step: (typeof STEPS)[number],
  sectionStatuses: Record<string, "completed" | "current" | "available" | "locked">
): "completed" | "current" | "available" | "locked" {
  const statuses = step.sectionCodes.map(
    (sectionCode) => sectionStatuses[sectionCode] ?? "locked"
  );

  if (statuses.some((status) => status === "current")) return "current";
  if (statuses.every((status) => status === "completed")) return "completed";
  if (statuses.some((status) => status === "available")) return "available";
  return "locked";
}

function ScanShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const { scan } = useScanContext();

  const scanId = Array.isArray(params.id) ? params.id[0] : params.id;
  const currentSectionCode = getCurrentSectionCode(pathname);
  const sectionStatuses = getSectionStatuses(currentSectionCode, scan);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="kweekers-badge">
                <Image
                  src="/kweekers-logo.png"
                  alt="Kweekers logo"
                  width={36}
                  height={36}
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
                {STEPS.map((step) => {
                  const status = getStepStatus(step, sectionStatuses);

                  const href =
                    status === "completed" ||
                    status === "current" ||
                    status === "available"
                      ? `/scan/${scanId}/summary/${step.primarySectionCode}`
                      : "";

                  const cardClass =
                    status === "current"
                      ? "border-[#c7d2e8] bg-[#eef3fb] text-[#2f426a]"
                      : status === "completed"
                        ? "border-[#b7dfc2] bg-[#eef8f1] text-[#1f5130]"
                        : status === "available"
                          ? "border-black bg-white hover:bg-neutral-50"
                          : "border-neutral-300 bg-white text-neutral-400 opacity-70";

                  const numberClass =
                    status === "current"
                      ? "border-[#8fa4cc] bg-[#8fa4cc] text-white"
                      : status === "completed"
                        ? "border-[#56a26a] bg-[#56a26a] text-white"
                        : status === "available"
                          ? "border-black text-black"
                          : "border-neutral-400 text-neutral-400";

                  const titleClass =
                    status === "current"
                      ? "text-[#2f426a]"
                      : status === "completed"
                        ? "text-[#1f5130]"
                        : status === "locked"
                          ? "text-neutral-400"
                          : "text-black";

                  const descriptionClass =
                    status === "current"
                      ? "text-[#4b5f86]"
                      : status === "completed"
                        ? "text-[#356946]"
                        : status === "locked"
                          ? "text-neutral-400"
                          : "text-muted-foreground";

                  const displayNumber = status === "completed" ? "✓" : step.number;

                  const content = (
                    <div
                      className={`flex items-start gap-3 rounded-2xl border p-3 transition ${cardClass}`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium ${numberClass}`}
                      >
                        {displayNumber}
                      </div>

                      <div className="min-w-0">
                        <div className={`text-sm font-medium ${titleClass}`}>
                          {step.title}
                        </div>
                        <div className={`text-sm ${descriptionClass}`}>
                          {step.description}
                        </div>
                      </div>
                    </div>
                  );

                  if (href) {
                    return (
                      <Link key={step.primarySectionCode} href={href} className="block">
                        {content}
                      </Link>
                    );
                  }

                  return <div key={step.primarySectionCode}>{content}</div>;
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
  );
}

export default function ScanIdLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ScanProvider>
      <ScanShell>{children}</ScanShell>
    </ScanProvider>
  );
}
