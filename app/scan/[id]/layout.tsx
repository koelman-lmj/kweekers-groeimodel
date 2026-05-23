"use client";

// Build v5 - Force recompile after option-sets-v2 change
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import type { ReactNode } from "react";
import { ScanProvider, useScanContext } from "@/app/context/ScanContext";
import { getSectionStatuses } from "@/lib/scan/engine/section-status";

const STEPS = [
  {
    number: "1",
    sectionCodes: ["profile_basis", "profile_afas", "profile_reason"],
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

  if (pathname.includes("/profile_afas")) return "profile_afas";
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
    profile: ["profile_basis", "profile_afas", "profile_reason"],
    scope: ["scope"],
    diagnose: ["diagnose"],
    advies: ["advies"],
  };

  const stepKeyMap: Record<string, string> = {
    profile_basis: "profile",
    profile_afas: "profile",
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
  status: StepStatus,
  visitedSections: string[],
  lastVisitedRouteBySection: Record<string, string>
): string | null {
  const stepVisited = step.sectionCodes.some((sectionCode) =>
    visitedSections.includes(sectionCode)
  );

  if (status !== "current" && status !== "completed" && !stepVisited) {
    return null;
  }

  for (const sectionCode of step.sectionCodes) {
    const visitedRoute = lastVisitedRouteBySection[sectionCode];
    if (visitedRoute) return visitedRoute;
  }

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

  return null;
}

function ScanShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { scan, resetScan } = useScanContext();

  const handleReset = () => {
    resetScan();
    router.push("/scan/nieuw/flow/profile_basis/customer_name");
  };

  const visitedSections = scan.ui.visitedSections;
  const lastVisitedRouteBySection = scan.ui.lastVisitedRouteBySection;

  const isExportPage = pathname?.includes("/export");

  if (isExportPage) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  const scanId = Array.isArray(params.id) ? params.id[0] : params.id;
  const currentSectionCode = getCurrentSectionCode(pathname);
  const sectionStatuses = getSectionStatuses(scan);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-3xl border border-[var(--kweekers-card-border)] bg-white p-5 shadow-sm">
            <div className="space-y-5">
              <div className="kweekers-badge">
                <Image
                  src="/kweekers_oranje_blauw_pay-off@2x.png"
                  alt="Kweekers logo"
                  width={180}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
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

                  const href = scanId
                    ? getStepHref(
                        scanId,
                        step,
                        status,
                        visitedSections,
                        lastVisitedRouteBySection
                      )
                    : null;

                  const cardClass =
                    status === "current"
                      ? "kweekers-step-current"
                      : status === "completed"
                        ? "kweekers-step-completed"
                        : status === "available"
                          ? "kweekers-step-available hover:bg-[#f7f3ed]"
                          : "kweekers-step-locked";

                  const numberClass =
                    status === "current"
                      ? "kweekers-step-current-number"
                      : status === "completed"
                        ? "kweekers-step-completed-number"
                        : status === "available"
                          ? "kweekers-step-available-number"
                          : "kweekers-step-locked-number";

                  const titleClass =
                    status === "current"
                      ? "kweekers-step-current-title"
                      : status === "completed"
                        ? "kweekers-step-completed-title"
                        : status === "available"
                          ? "kweekers-step-available-title"
                          : "kweekers-step-locked-title";

                  const descriptionClass =
                    status === "current"
                      ? "kweekers-step-current-description"
                      : status === "completed"
                        ? "kweekers-step-completed-description"
                        : status === "available"
                          ? "kweekers-step-available-description"
                          : "kweekers-step-locked-description";

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

                  if (href !== null) {
                    return (
                      <Link
                        key={step.primarySectionCode}
                        href={href}
                        className="block"
                        prefetch={false}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={step.primarySectionCode}
                      className="block cursor-default pointer-events-none"
                      aria-disabled="true"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full rounded-2xl border border-black/10 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-neutral-50 transition"
                >
                  Reset scan
                </button>
                <a
                  href="/scan/handout"
                  className="w-full rounded-2xl border border-black/10 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-neutral-50 transition flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Handout
                </a>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="rounded-3xl border border-[var(--kweekers-card-border)] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
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
