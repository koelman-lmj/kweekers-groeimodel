"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type ScanState = {
  profile: {
    customerName: string;
    sector: string;
    organizationSize: string;
    administrationCount: string;
    organizationType: string[];
    afasProducts: string[];
    ownershipModel: string;
    afasUsageDuration: string;
    maintenanceQuality: string;
    expectedOrgChanges: string;
    standardizationContext: string;
    primaryProcessChains: string[];
    scanReason: string;
    biggestBottleneck: string[];
    // Nieuwe vragen aanleiding
    scanReasonDetailed: string;
    improvementUrgency: string;
  };
  scope: {
    width: string;
    focus: string[];
    depth: string;
  };
  diagnosis: {
    ownershipClarity: string;
    changeDecisionProcess: string;
    improvementGovernance: string;
    processStandardization: string;
    exceptionControl: string;
    issueResolution: string;
    processDocumentation: string;

    financeStrategicPressure: string;
    financeFoundationReliability: string;
    financeExceptionHandling: string;
    financeReportingMaturity: string;

    orderStrategicPressure: string;
    orderFlowStandardization: string;
    orderExceptionComplexity: string;
    orderSystemFit: string;

    crmStrategicPressure: string;
    crmProcessMaturity: string;
    crmDataQuality: string;
    crmReportingUsefulness: string;

    hrmStrategicPressure: string;
    hrmProcessMaturity: string;
    hrmDataQuality: string;

    reportingStrategicPressure: string;
    reportingDefinitionConsistency: string;
    reportingUsefulness: string;

    integrationStrategicPressure: string;
    integrationStability: string;
    integrationOwnership: string;
    integrationMonitoringMaturity: string;

    careRegistrationExceptions: string;
    careAccountabilityPressure: string;
    careProcessStandardization: string;

    educationIntakePlanningConsistency: string;
    educationProcessAdminAlignment: string;
    educationExceptionHandling: string;

    // Nieuwe diagnosevragen
    timeLossAreas: string[];
    outsideAfasFrequency: string;
    outsideAfasReasons: string[];
    backlogMaturity: string;
    changeDecisionOwner: string;
    masterDataReliability: string;
    masterDataProblems: string[];
    afasAdoptionLevel: string;
    adoptionBarriers: string[];
    mostValuableImprovement: string;
  };
  comments: Record<string, string>;
  ui: {
    visitedSections: string[];
    lastVisitedRouteBySection: Record<string, string>;
  };
  roadmap?: {
    items: import("@/lib/scan/types").RoadmapItem[];
    lastModified: string;
  };
  answers?: Record<string, string | string[]>;
};

const STORAGE_KEY = "kweekers-groeimodel-scan";

const INITIAL_SCAN: ScanState = {
  profile: {
    customerName: "",
    sector: "",
    organizationSize: "",
    administrationCount: "",
    organizationType: [],
    afasProducts: [],
    ownershipModel: "",
    afasUsageDuration: "",
    maintenanceQuality: "",
    expectedOrgChanges: "",
    standardizationContext: "",
    primaryProcessChains: [],
    scanReason: "",
    biggestBottleneck: [],
    scanReasonDetailed: "",
    improvementUrgency: "",
  },
  scope: {
    width: "",
    focus: [],
    depth: "",
  },
  diagnosis: {
    ownershipClarity: "",
    changeDecisionProcess: "",
    improvementGovernance: "",
    processStandardization: "",
    exceptionControl: "",
    issueResolution: "",
    processDocumentation: "",

    financeStrategicPressure: "",
    financeFoundationReliability: "",
    financeExceptionHandling: "",
    financeReportingMaturity: "",

    orderStrategicPressure: "",
    orderFlowStandardization: "",
    orderExceptionComplexity: "",
    orderSystemFit: "",

    crmStrategicPressure: "",
    crmProcessMaturity: "",
    crmDataQuality: "",
    crmReportingUsefulness: "",

    hrmStrategicPressure: "",
    hrmProcessMaturity: "",
    hrmDataQuality: "",

    reportingStrategicPressure: "",
    reportingDefinitionConsistency: "",
    reportingUsefulness: "",

    integrationStrategicPressure: "",
    integrationStability: "",
    integrationOwnership: "",
    integrationMonitoringMaturity: "",

    careRegistrationExceptions: "",
    careAccountabilityPressure: "",
    careProcessStandardization: "",

    educationIntakePlanningConsistency: "",
    educationProcessAdminAlignment: "",
    educationExceptionHandling: "",

    timeLossAreas: [],
    outsideAfasFrequency: "",
    outsideAfasReasons: [],
    backlogMaturity: "",
    changeDecisionOwner: "",
    masterDataReliability: "",
    masterDataProblems: [],
    afasAdoptionLevel: "",
    adoptionBarriers: [],
    mostValuableImprovement: "",
  },
  comments: {},
  ui: {
    visitedSections: [],
    lastVisitedRouteBySection: {},
  },
};

type ScanContextValue = {
  scan: ScanState;
  setScan: Dispatch<SetStateAction<ScanState>>;
  resetScan: () => void;
  /** True after localStorage has been loaded - use to avoid hydration mismatch */
  isHydrated: boolean;

  setCustomerName: (value: string) => void;
  setSector: (value: string) => void;
  setOrganizationSize: (value: string) => void;
  setAdministrationCount: (value: string) => void;
  setOrganizationType: (value: string[]) => void;
  setAfasProducts: (value: string[]) => void;
  setOwnershipModel: (value: string) => void;
  setAfasUsageDuration: (value: string) => void;
  setMaintenanceQuality: (value: string) => void;
  setExpectedOrgChanges: (value: string) => void;
  setStandardizationContext: (value: string) => void;
  setPrimaryProcessChains: (value: string[]) => void;

  setScanReason: (value: string) => void;
  setBiggestBottleneck: (value: string[]) => void;
  setScanReasonDetailed: (value: string) => void;
  setImprovementUrgency: (value: string) => void;

  setScopeWidth: (value: string) => void;
  setScopeFocus: (value: string[]) => void;
  setScopeDepth: (value: string) => void;

  setOwnershipClarity: (value: string) => void;
  setChangeDecisionProcess: (value: string) => void;
  setImprovementGovernance: (value: string) => void;
  setProcessStandardization: (value: string) => void;
  setExceptionControl: (value: string) => void;
  setIssueResolution: (value: string) => void;
  setProcessDocumentation: (value: string) => void;

  setFinanceStrategicPressure: (value: string) => void;
  setFinanceFoundationReliability: (value: string) => void;
  setFinanceExceptionHandling: (value: string) => void;
  setFinanceReportingMaturity: (value: string) => void;

  setOrderStrategicPressure: (value: string) => void;
  setOrderFlowStandardization: (value: string) => void;
  setOrderExceptionComplexity: (value: string) => void;
  setOrderSystemFit: (value: string) => void;

  setCrmStrategicPressure: (value: string) => void;
  setCrmProcessMaturity: (value: string) => void;
  setCrmDataQuality: (value: string) => void;
  setCrmReportingUsefulness: (value: string) => void;

  setHrmStrategicPressure: (value: string) => void;
  setHrmProcessMaturity: (value: string) => void;
  setHrmDataQuality: (value: string) => void;

  setReportingStrategicPressure: (value: string) => void;
  setReportingDefinitionConsistency: (value: string) => void;
  setReportingUsefulness: (value: string) => void;

  setIntegrationStrategicPressure: (value: string) => void;
  setIntegrationStability: (value: string) => void;
  setIntegrationOwnership: (value: string) => void;
  setIntegrationMonitoringMaturity: (value: string) => void;

  setCareRegistrationExceptions: (value: string) => void;
  setCareAccountabilityPressure: (value: string) => void;
  setCareProcessStandardization: (value: string) => void;

  setEducationIntakePlanningConsistency: (value: string) => void;
  setEducationProcessAdminAlignment: (value: string) => void;
  setEducationExceptionHandling: (value: string) => void;

  // Nieuwe diagnosevragen setters
  setTimeLossAreas: (value: string[]) => void;
  setOutsideAfasFrequency: (value: string) => void;
  setOutsideAfasReasons: (value: string[]) => void;
  setBacklogMaturity: (value: string) => void;
  setChangeDecisionOwner: (value: string) => void;
  setMasterDataReliability: (value: string) => void;
  setMasterDataProblems: (value: string[]) => void;
  setAfasAdoptionLevel: (value: string) => void;
  setAdoptionBarriers: (value: string[]) => void;
  setMostValuableImprovement: (value: string) => void;

  setComment: (questionKey: string, value: string) => void;
  markSectionVisited: (sectionCode: string, route: string) => void;
  updateScan: (updates: Partial<ScanState>) => void;
};

const ScanContext = createContext<ScanContextValue | undefined>(undefined);

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string" && value.trim() !== "") {
    return [value];
  }

  return [];
}

function loadInitialScan(): ScanState {
  if (typeof window === "undefined") return INITIAL_SCAN;

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return INITIAL_SCAN;

    const parsed = JSON.parse(storedValue) as Partial<ScanState>;

    return {
      profile: {
        customerName: parsed.profile?.customerName ?? "",
        sector: parsed.profile?.sector ?? "",
        organizationSize: parsed.profile?.organizationSize ?? "",
        administrationCount: parsed.profile?.administrationCount ?? "",
        organizationType: toStringArray(parsed.profile?.organizationType),
        afasProducts: toStringArray(parsed.profile?.afasProducts),
        ownershipModel: parsed.profile?.ownershipModel ?? "",
        afasUsageDuration: parsed.profile?.afasUsageDuration ?? "",
        maintenanceQuality: parsed.profile?.maintenanceQuality ?? "",
        expectedOrgChanges: parsed.profile?.expectedOrgChanges ?? "",
        standardizationContext: parsed.profile?.standardizationContext ?? "",
        primaryProcessChains: toStringArray(parsed.profile?.primaryProcessChains),
        scanReason: parsed.profile?.scanReason ?? "",
        biggestBottleneck: toStringArray(parsed.profile?.biggestBottleneck),
        scanReasonDetailed: parsed.profile?.scanReasonDetailed ?? "",
        improvementUrgency: parsed.profile?.improvementUrgency ?? "",
      },
      scope: {
        width:
          typeof parsed.scope === "object" && parsed.scope !== null
            ? parsed.scope.width ?? ""
            : "",
        focus:
          typeof parsed.scope === "object" && parsed.scope !== null
            ? toStringArray(parsed.scope.focus)
            : [],
        depth:
          typeof parsed.scope === "object" && parsed.scope !== null
            ? parsed.scope.depth ?? ""
            : "",
      },
      diagnosis: {
        ownershipClarity: parsed.diagnosis?.ownershipClarity ?? "",
        changeDecisionProcess: parsed.diagnosis?.changeDecisionProcess ?? "",
        improvementGovernance: parsed.diagnosis?.improvementGovernance ?? "",
        processStandardization: parsed.diagnosis?.processStandardization ?? "",
        exceptionControl: parsed.diagnosis?.exceptionControl ?? "",
        issueResolution: parsed.diagnosis?.issueResolution ?? "",
        processDocumentation: parsed.diagnosis?.processDocumentation ?? "",

        financeStrategicPressure:
          parsed.diagnosis?.financeStrategicPressure ?? "",
        financeFoundationReliability:
          parsed.diagnosis?.financeFoundationReliability ?? "",
        financeExceptionHandling:
          parsed.diagnosis?.financeExceptionHandling ?? "",
        financeReportingMaturity:
          parsed.diagnosis?.financeReportingMaturity ?? "",

        orderStrategicPressure:
          parsed.diagnosis?.orderStrategicPressure ?? "",
        orderFlowStandardization:
          parsed.diagnosis?.orderFlowStandardization ?? "",
        orderExceptionComplexity:
          parsed.diagnosis?.orderExceptionComplexity ?? "",
        orderSystemFit: parsed.diagnosis?.orderSystemFit ?? "",

        crmStrategicPressure: parsed.diagnosis?.crmStrategicPressure ?? "",
        crmProcessMaturity: parsed.diagnosis?.crmProcessMaturity ?? "",
        crmDataQuality: parsed.diagnosis?.crmDataQuality ?? "",
        crmReportingUsefulness:
          parsed.diagnosis?.crmReportingUsefulness ?? "",

        hrmStrategicPressure: parsed.diagnosis?.hrmStrategicPressure ?? "",
        hrmProcessMaturity: parsed.diagnosis?.hrmProcessMaturity ?? "",
        hrmDataQuality: parsed.diagnosis?.hrmDataQuality ?? "",

        reportingStrategicPressure:
          parsed.diagnosis?.reportingStrategicPressure ?? "",
        reportingDefinitionConsistency:
          parsed.diagnosis?.reportingDefinitionConsistency ?? "",
        reportingUsefulness: parsed.diagnosis?.reportingUsefulness ?? "",

        integrationStrategicPressure:
          parsed.diagnosis?.integrationStrategicPressure ?? "",
        integrationStability:
          parsed.diagnosis?.integrationStability ?? "",
        integrationOwnership:
          parsed.diagnosis?.integrationOwnership ?? "",
        integrationMonitoringMaturity:
          parsed.diagnosis?.integrationMonitoringMaturity ?? "",

        careRegistrationExceptions:
          parsed.diagnosis?.careRegistrationExceptions ?? "",
        careAccountabilityPressure:
          parsed.diagnosis?.careAccountabilityPressure ?? "",
        careProcessStandardization:
          parsed.diagnosis?.careProcessStandardization ?? "",

        educationIntakePlanningConsistency:
          parsed.diagnosis?.educationIntakePlanningConsistency ?? "",
        educationProcessAdminAlignment:
          parsed.diagnosis?.educationProcessAdminAlignment ?? "",
        educationExceptionHandling:
          parsed.diagnosis?.educationExceptionHandling ?? "",

        // Nieuwe diagnosevelden
        timeLossAreas: toStringArray(parsed.diagnosis?.timeLossAreas),
        outsideAfasFrequency: parsed.diagnosis?.outsideAfasFrequency ?? "",
        outsideAfasReasons: toStringArray(parsed.diagnosis?.outsideAfasReasons),
        backlogMaturity: parsed.diagnosis?.backlogMaturity ?? "",
        changeDecisionOwner: parsed.diagnosis?.changeDecisionOwner ?? "",
        masterDataReliability: parsed.diagnosis?.masterDataReliability ?? "",
        masterDataProblems: toStringArray(parsed.diagnosis?.masterDataProblems),
        afasAdoptionLevel: parsed.diagnosis?.afasAdoptionLevel ?? "",
        adoptionBarriers: toStringArray(parsed.diagnosis?.adoptionBarriers),
        mostValuableImprovement: parsed.diagnosis?.mostValuableImprovement ?? "",
      },
      comments:
        typeof parsed.comments === "object" && parsed.comments !== null
          ? parsed.comments
          : {},
      ui: {
        visitedSections:
          typeof parsed.ui === "object" && parsed.ui !== null
            ? toStringArray(parsed.ui.visitedSections)
            : [],
        lastVisitedRouteBySection:
          typeof parsed.ui === "object" &&
          parsed.ui !== null &&
          typeof parsed.ui.lastVisitedRouteBySection === "object" &&
          parsed.ui.lastVisitedRouteBySection !== null
            ? parsed.ui.lastVisitedRouteBySection
            : {},
      },
    };
  } catch (error) {
    console.error("Kon scan-state niet laden uit localStorage", error);
    return INITIAL_SCAN;
  }
}

function persistScan(nextScan: ScanState) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextScan));
  } catch (error) {
    console.error("Kon scan-state niet opslaan in localStorage", error);
  }
}

export function ScanProvider({ children }: { children: ReactNode }) {
  // Start with INITIAL_SCAN to match server render, then hydrate from localStorage
  const [scanState, setScanState] = useState<ScanState>(INITIAL_SCAN);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const stored = loadInitialScan();
    setScanState(stored);
    setIsHydrated(true);
  }, []);

  const setScan: Dispatch<SetStateAction<ScanState>> = (value) => {
    setScanState((current) => {
      const next = typeof value === "function" ? value(current) : value;
      persistScan(next);
      return next;
    });
  };

  const updateProfile = (
    field: keyof Omit<
      ScanState["profile"],
      | "afasProducts"
      | "primaryProcessChains"
      | "biggestBottleneck"
      | "organizationType"
    >,
    value: string
  ) => {
    setScan((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [field]: value,
      },
    }));
  };

  const updateDiagnosis = (
    field: keyof ScanState["diagnosis"],
    value: string
  ) => {
    setScan((current) => ({
      ...current,
      diagnosis: {
        ...current.diagnosis,
        [field]: value,
      },
    }));
  };

  const resetScan = () => {
    setScan(INITIAL_SCAN);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Kon scan-state niet verwijderen uit localStorage", error);
      }
    }
  };

  const markSectionVisited = useCallback((sectionCode: string, route: string) => {
    setScan((current) => {
      const alreadyVisited = current.ui.visitedSections.includes(sectionCode);
      const currentRoute = current.ui.lastVisitedRouteBySection[sectionCode];

      if (alreadyVisited && currentRoute === route) {
        return current;
      }

      return {
        ...current,
        ui: {
          visitedSections: alreadyVisited
            ? current.ui.visitedSections
            : [...current.ui.visitedSections, sectionCode],
          lastVisitedRouteBySection: {
            ...current.ui.lastVisitedRouteBySection,
            [sectionCode]: route,
          },
        },
      };
    });
  }, [setScan]);

  const updateScan = useCallback((updates: Partial<ScanState>) => {
    setScan((current) => ({
      ...current,
      ...updates,
    }));
  }, [setScan]);

  const setCustomerName = (value: string) => updateProfile("customerName", value);
  const setSector = (value: string) => updateProfile("sector", value);
  const setOrganizationSize = (value: string) =>
    updateProfile("organizationSize", value);
  const setAdministrationCount = (value: string) =>
    updateProfile("administrationCount", value);

  const setOrganizationType = (value: string[]) => {
    setScan((current) => ({
      ...current,
      profile: {
        ...current.profile,
        organizationType: value,
      },
    }));
  };

  const setAfasProducts = (value: string[]) => {
    setScan((current) => ({
      ...current,
      profile: {
        ...current.profile,
        afasProducts: value,
      },
    }));
  };

  const setOwnershipModel = (value: string) =>
    updateProfile("ownershipModel", value);
  const setAfasUsageDuration = (value: string) =>
    updateProfile("afasUsageDuration", value);
  const setMaintenanceQuality = (value: string) =>
    updateProfile("maintenanceQuality", value);
  const setExpectedOrgChanges = (value: string) =>
    updateProfile("expectedOrgChanges", value);
  const setStandardizationContext = (value: string) =>
    updateProfile("standardizationContext", value);

  const setPrimaryProcessChains = (value: string[]) => {
    setScan((current) => ({
      ...current,
      profile: {
        ...current.profile,
        primaryProcessChains: value,
      },
    }));
  };

  const setScanReason = (value: string) => updateProfile("scanReason", value);

  const setBiggestBottleneck = (value: string[]) => {
    setScan((current) => ({
      ...current,
      profile: {
        ...current.profile,
        biggestBottleneck: value,
      },
    }));
  };

  const setScanReasonDetailed = (value: string) => updateProfile("scanReasonDetailed", value);
  const setImprovementUrgency = (value: string) => updateProfile("improvementUrgency", value);

  const setScopeWidth = (value: string) => {
    setScan((current) => ({
      ...current,
      scope: {
        ...current.scope,
        width: value,
      },
    }));
  };

  const setScopeFocus = (value: string[]) => {
    setScan((current) => ({
      ...current,
      scope: {
        ...current.scope,
        focus: value,
      },
    }));
  };

  const setScopeDepth = (value: string) => {
    setScan((current) => ({
      ...current,
      scope: {
        ...current.scope,
        depth: value,
      },
    }));
  };

  const setOwnershipClarity = (value: string) =>
    updateDiagnosis("ownershipClarity", value);
  const setChangeDecisionProcess = (value: string) =>
    updateDiagnosis("changeDecisionProcess", value);
  const setImprovementGovernance = (value: string) =>
    updateDiagnosis("improvementGovernance", value);
  const setProcessStandardization = (value: string) =>
    updateDiagnosis("processStandardization", value);
  const setExceptionControl = (value: string) =>
    updateDiagnosis("exceptionControl", value);
  const setIssueResolution = (value: string) =>
    updateDiagnosis("issueResolution", value);
  const setProcessDocumentation = (value: string) =>
    updateDiagnosis("processDocumentation", value);

  const setFinanceStrategicPressure = (value: string) =>
    updateDiagnosis("financeStrategicPressure", value);
  const setFinanceFoundationReliability = (value: string) =>
    updateDiagnosis("financeFoundationReliability", value);
  const setFinanceExceptionHandling = (value: string) =>
    updateDiagnosis("financeExceptionHandling", value);
  const setFinanceReportingMaturity = (value: string) =>
    updateDiagnosis("financeReportingMaturity", value);

  const setOrderStrategicPressure = (value: string) =>
    updateDiagnosis("orderStrategicPressure", value);
  const setOrderFlowStandardization = (value: string) =>
    updateDiagnosis("orderFlowStandardization", value);
  const setOrderExceptionComplexity = (value: string) =>
    updateDiagnosis("orderExceptionComplexity", value);
  const setOrderSystemFit = (value: string) =>
    updateDiagnosis("orderSystemFit", value);

  const setCrmStrategicPressure = (value: string) =>
    updateDiagnosis("crmStrategicPressure", value);
  const setCrmProcessMaturity = (value: string) =>
    updateDiagnosis("crmProcessMaturity", value);
  const setCrmDataQuality = (value: string) =>
    updateDiagnosis("crmDataQuality", value);
  const setCrmReportingUsefulness = (value: string) =>
    updateDiagnosis("crmReportingUsefulness", value);

  const setHrmStrategicPressure = (value: string) =>
    updateDiagnosis("hrmStrategicPressure", value);
  const setHrmProcessMaturity = (value: string) =>
    updateDiagnosis("hrmProcessMaturity", value);
  const setHrmDataQuality = (value: string) =>
    updateDiagnosis("hrmDataQuality", value);

  const setReportingStrategicPressure = (value: string) =>
    updateDiagnosis("reportingStrategicPressure", value);
  const setReportingDefinitionConsistency = (value: string) =>
    updateDiagnosis("reportingDefinitionConsistency", value);
  const setReportingUsefulness = (value: string) =>
    updateDiagnosis("reportingUsefulness", value);

  const setIntegrationStrategicPressure = (value: string) =>
    updateDiagnosis("integrationStrategicPressure", value);
  const setIntegrationStability = (value: string) =>
    updateDiagnosis("integrationStability", value);
  const setIntegrationOwnership = (value: string) =>
    updateDiagnosis("integrationOwnership", value);
  const setIntegrationMonitoringMaturity = (value: string) =>
    updateDiagnosis("integrationMonitoringMaturity", value);

  const setCareRegistrationExceptions = (value: string) =>
    updateDiagnosis("careRegistrationExceptions", value);
  const setCareAccountabilityPressure = (value: string) =>
    updateDiagnosis("careAccountabilityPressure", value);
  const setCareProcessStandardization = (value: string) =>
    updateDiagnosis("careProcessStandardization", value);

  const setEducationIntakePlanningConsistency = (value: string) =>
    updateDiagnosis("educationIntakePlanningConsistency", value);
  const setEducationProcessAdminAlignment = (value: string) =>
    updateDiagnosis("educationProcessAdminAlignment", value);
  const setEducationExceptionHandling = (value: string) =>
    updateDiagnosis("educationExceptionHandling", value);

  // Nieuwe diagnosevragen setters
  const setTimeLossAreas = (value: string[]) => {
    setScan((current) => ({
      ...current,
      diagnosis: {
        ...current.diagnosis,
        timeLossAreas: value,
      },
    }));
  };
  const setOutsideAfasFrequency = (value: string) =>
    updateDiagnosis("outsideAfasFrequency", value);
  const setOutsideAfasReasons = (value: string[]) => {
    setScan((current) => ({
      ...current,
      diagnosis: {
        ...current.diagnosis,
        outsideAfasReasons: value,
      },
    }));
  };
  const setBacklogMaturity = (value: string) =>
    updateDiagnosis("backlogMaturity", value);
  const setChangeDecisionOwner = (value: string) =>
    updateDiagnosis("changeDecisionOwner", value);
  const setMasterDataReliability = (value: string) =>
    updateDiagnosis("masterDataReliability", value);
  const setMasterDataProblems = (value: string[]) => {
    setScan((current) => ({
      ...current,
      diagnosis: {
        ...current.diagnosis,
        masterDataProblems: value,
      },
    }));
  };
  const setAfasAdoptionLevel = (value: string) =>
    updateDiagnosis("afasAdoptionLevel", value);
  const setAdoptionBarriers = (value: string[]) => {
    setScan((current) => ({
      ...current,
      diagnosis: {
        ...current.diagnosis,
        adoptionBarriers: value,
      },
    }));
  };
  const setMostValuableImprovement = (value: string) =>
    updateDiagnosis("mostValuableImprovement", value);

  const setComment = (questionKey: string, value: string) => {
    setScan((current) => ({
      ...current,
      comments: {
        ...current.comments,
        [questionKey]: value,
      },
    }));
  };

  const value = useMemo<ScanContextValue>(
    () => ({
      scan: scanState,
      setScan,
      resetScan,
      isHydrated,

      setCustomerName,
      setSector,
      setOrganizationSize,
      setAdministrationCount,
      setOrganizationType,
      setAfasProducts,
      setOwnershipModel,
      setAfasUsageDuration,
      setMaintenanceQuality,
      setExpectedOrgChanges,
      setStandardizationContext,
      setPrimaryProcessChains,

      setScanReason,
      setBiggestBottleneck,
      setScanReasonDetailed,
      setImprovementUrgency,

      setScopeWidth,
      setScopeFocus,
      setScopeDepth,

      setOwnershipClarity,
      setChangeDecisionProcess,
      setImprovementGovernance,
      setProcessStandardization,
      setExceptionControl,
      setIssueResolution,
      setProcessDocumentation,

      setFinanceStrategicPressure,
      setFinanceFoundationReliability,
      setFinanceExceptionHandling,
      setFinanceReportingMaturity,

      setOrderStrategicPressure,
      setOrderFlowStandardization,
      setOrderExceptionComplexity,
      setOrderSystemFit,

      setCrmStrategicPressure,
      setCrmProcessMaturity,
      setCrmDataQuality,
      setCrmReportingUsefulness,

      setHrmStrategicPressure,
      setHrmProcessMaturity,
      setHrmDataQuality,

      setReportingStrategicPressure,
      setReportingDefinitionConsistency,
      setReportingUsefulness,

      setIntegrationStrategicPressure,
      setIntegrationStability,
      setIntegrationOwnership,
      setIntegrationMonitoringMaturity,

      setCareRegistrationExceptions,
      setCareAccountabilityPressure,
      setCareProcessStandardization,

      setEducationIntakePlanningConsistency,
      setEducationProcessAdminAlignment,
      setEducationExceptionHandling,

      // Nieuwe diagnosevragen
      setTimeLossAreas,
      setOutsideAfasFrequency,
      setOutsideAfasReasons,
      setBacklogMaturity,
      setChangeDecisionOwner,
      setMasterDataReliability,
      setMasterDataProblems,
      setAfasAdoptionLevel,
      setAdoptionBarriers,
      setMostValuableImprovement,

      setComment,
      markSectionVisited,
      updateScan,
    }),
    [scanState, markSectionVisited, updateScan, isHydrated]
  );

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScanContext() {
  const context = useContext(ScanContext);

  if (!context) {
    throw new Error("useScanContext must be used within a ScanProvider");
  }

  return context;
}

// Alias for useScanContext
export const useScan = useScanContext;

export default ScanProvider;
