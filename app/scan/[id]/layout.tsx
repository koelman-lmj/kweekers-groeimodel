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
    description: "Context en uitgangssituatie",
  },
  {
    number: "2",
    sectionCodes: ["scope"],
    primarySectionCode: "scope",
    title: "Scope",
    description: "Richting en diepgang",
  },
  {
    number: "3",
    sectionCodes: ["diagnose"],
    primarySectionCode: "diagnose",
    title: "Diagnose",
    description: "Kernvragen en verdieping",
  },
  {
    number: "4",
    sectionCodes: ["advies"],
    primarySectionCode: "advies",
    title: "Advies",
    description: "Eerste duiding",
  },
] as const;

type StepStatus = "completed" | "current" | "available" | "locked";

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
  sectionStatuses: Record<string, boolean>,
  currentSectionCode: string
): StepStatus {
  const stepSections: Record<string, string[]> = {
    profile: ["profile_basis", "profile_reason"],
    scope: ["scope"],
    diagnose: ["diagnose"],
    advies: ["advies"],
  };

  const stepKeyMap: Record<string, string> = {
    profile_basis: "profile",
    profile_reason: "profile",
    scope: "scope",
    diagnose: "diagnose",
    advies: "advies",
  };

  const currentStepKey = stepKeyMap[currentSectionCode] ?? "profile";
  const orderedSteps = ["profile", "scope", "diagnose", "advies"];
  const currentStepIndex = orderedSteps.indexOf(currentStepKey);

  const stepKey =
    step.primarySectionCode === "profile_basis"
      ? "profile"
      : step.primarySectionCode;

  const stepIndex = orderedSteps.indexOf(stepKey);
  const sectionsForStep = stepSections[stepKey] ?? [];

  if (sectionsForStep.includes(currentSectionCode)) {
    return "current";
  }

  const isCompleted =
    sectionsForStep.length > 0 &&
    sectionsForStep.every((sectionCode) => sectionStatuses[sectionCode]);

  if (isCompleted && stepIndex < currentStepIndex) {
    return "completed";
  }

  if (stepIndex === currentStepIndex + 1) {
    return "available";
  }

  if (stepIndex < currentStepIndex) {
    return "completed";
  }

  return "locked";
}

function getStepHref(
  scanId: string,
  step: (typeof STEPS)[number],
  status: StepStatus
): string {
  if (status === "locked") return "";

  if (step.primarySectionCode === "advies") {
    return `/scan/${scanId}/summary/advies`;
  }

  if (step.primarySectionCode === "profile_basis") {
    return `/scan/${scanId}/flow/profile_basis/customer_name`;
  }

  if (step.primarySectionCode === "scope") {
    return `/scan/${scanId}/flow/scope/scope`;
  }

  if (step.primarySectionCode === "diagnose") {
    return `/scan/${scanId}/flow/diagnose/ownership_clarity`;
  }

  return "";
}

function ScanShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const { scan } = useScanContext();

  const scanId = Array.isArray(params.id) ? params.id[0] : params.id;
  const currentSectionCode = getCurrentSectionCode(pathname);
  const sectionStatuses = getSectionStatuses(scan);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="space-y-5">
              <div className="kweekers-badge">
                <Image
                  src="/kweekers-logo.png"
                  alt="Kweekers logo"
                  width={32}
                  height={32}
                />
                <span>KWEEKERS Groeimodel</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">
                  Begeleide scan
                </h2>
                <p className="text-sm text-muted-foreground">
                  Van profiel naar eerste advies.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {STEPS.map((step) => {
                  const status = getStepStatus(
                    step,
                    sectionStatuses,
                    currentSectionCode
                  );

                  const href = scanId ? getStepHref(scanId, step, status) : "";

                  const cardClass =
                    status === "current"
                      ? "border-[#c7d2e8] bg-[#eef3fb]"
                      : status === "completed"
                        ? "border-[#b7dfc2] bg-[#eef8f1]"
                        : status === "available"
                          ? "border-[#e6dfd4] bg-[#fcfaf7] hover:bg-[#f8f3ec]"
                          : "border-neutral-200 bg-white opacity-70";

                  const numberClass =
                    status === "current"
                      ? "border-[#8fa4cc] bg-[#8fa4cc] text-white"
                      : status === "completed"
                        ? "border-[#56a26a] bg-[#56a26a] text-white"
                        : status === "available"
                          ? "border-[#b8ab97] text-[#6a5b49]"
                          : "border-neutral-300 text-neutral-400";

                  const titleClass =
                    status === "current"
                      ? "text-[#2f426a]"
                      : status === "completed"
                        ? "text-[#1f5130]"
                        : status === "available"
                          ? "text-[#2d241a]"
                          : "text-neutral-400";

                  const descriptionClass =
                    status === "current"
                      ? "text-[#5b6f94]"
                      : status === "completed"
                        ? "text-[#4a7356]"
                        : status === "available"
                          ? "text-[#7a6a57]"
                          : "text-neutral-400";

                  const displayNumber = status === "completed" ? "✓" : step.number;

                  const content = (
                    <div
                      className={`flex items-start gap-3 rounded-2xl border px-3 py-3 transition ${cardClass}`}
                    >
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium ${numberClass}`}
                      >
                        {displayNumber}
                      </div>

                      <div className="min-w-0">
                        <div className={`text-sm font-semibold ${titleClass}`}>
                          {step.title}
                        </div>
                        <div className={`text-xs ${descriptionClass}`}>
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
