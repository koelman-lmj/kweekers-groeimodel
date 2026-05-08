"use client";

import {
  createContext,
  useContext,
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
    organizationType: string;
    afasProducts: string[];
    ownershipModel: string;
    standardizationContext: string;
    primaryProcessChains: string[];
    scanReason: string;
    biggestBottleneck: string[];
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
  };
  comments: Record<string, string>;
};

const STORAGE_KEY = "kweekers-groeimodel-scan";

const INITIAL_SCAN: ScanState = {
  profile: {
    customerName: "",
    sector: "",
    organizationSize: "",
    administrationCount: "",
    organizationType: "",
    afasProducts: [],
    ownershipModel: "",
    standardizationContext: "",
    primaryProcessChains: [],
    scanReason: "",
    biggestBottleneck: [],
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
  },
  comments: {},
};

type ScanContextValue = {
  scan: ScanState;
  setScan: Dispatch<SetStateAction<ScanState>>;
  resetScan: () => void;

  setCustomerName: (value: string) => void;
  setSector: (value: string) => void;
  setOrganizationSize: (value: string) => void;
  setAdministrationCount: (value: string) => void;
  setOrganizationType: (value: string) => void;
  setAfasProducts: (value: string[]) => void;
  setOwnershipModel: (value: string) => void;
  setStandardizationContext: (value: string) => void;
  setPrimaryProcessChains: (value: string[]) => void;

  setScanReason: (value: string) => void;
  setBiggestBottleneck: (value: string[]) => void;

  setScopeWidth: (value: string) => void;
  setScopeFocus: (value: string[]) => void;
  setScopeDepth: (value: string) => void;

  setOwnershipClarity: (value: string) => void;
  setChangeDecisionProcess: (value: string) => void;
  setImprovementGovernance: (value: string) => void;
  setProcessStandardization: (value: string) => void;
  setExceptionControl: (value: string) => void;
  setIssueResolution: (value: string) => void;

  setComment: (questionKey: string, value: string) => void;
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
        organizationType: parsed.profile?.organizationType ?? "",
        afasProducts: toStringArray(parsed.profile?.afasProducts),
        ownershipModel: parsed.profile?.ownershipModel ?? "",
        standardizationContext: parsed.profile?.standardizationContext ?? "",
        primaryProcessChains: toStringArray(parsed.profile?.primaryProcessChains),
        scanReason: parsed.profile?.scanReason ?? "",
        biggestBottleneck: toStringArray(parsed.profile?.biggestBottleneck),
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
      },
      comments:
        typeof parsed.comments === "object" && parsed.comments !== null
          ? parsed.comments
          : {},
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
  const [scanState, setScanState] = useState<ScanState>(() => loadInitialScan());

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
      "afasProducts" | "primaryProcessChains" | "biggestBottleneck"
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

  const setCustomerName = (value: string) => {
    updateProfile("customerName", value);
  };

  const setSector = (value: string) => {
    updateProfile("sector", value);
  };

  const setOrganizationSize = (value: string) => {
    updateProfile("organizationSize", value);
  };

  const setAdministrationCount = (value: string) => {
    updateProfile("administrationCount", value);
  };

  const setOrganizationType = (value: string) => {
    updateProfile("organizationType", value);
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

  const setOwnershipModel = (value: string) => {
    updateProfile("ownershipModel", value);
  };

  const setStandardizationContext = (value: string) => {
    updateProfile("standardizationContext", value);
  };

  const setPrimaryProcessChains = (value: string[]) => {
    setScan((current) => ({
      ...current,
      profile: {
        ...current.profile,
        primaryProcessChains: value,
      },
    }));
  };

  const setScanReason = (value: string) => {
    updateProfile("scanReason", value);
  };

  const setBiggestBottleneck = (value: string[]) => {
    setScan((current) => ({
      ...current,
      profile: {
        ...current.profile,
        biggestBottleneck: value,
      },
    }));
  };

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

  const setOwnershipClarity = (value: string) => {
    updateDiagnosis("ownershipClarity", value);
  };

  const setChangeDecisionProcess = (value: string) => {
    updateDiagnosis("changeDecisionProcess", value);
  };

  const setImprovementGovernance = (value: string) => {
    updateDiagnosis("improvementGovernance", value);
  };

  const setProcessStandardization = (value: string) => {
    updateDiagnosis("processStandardization", value);
  };

  const setExceptionControl = (value: string) => {
    updateDiagnosis("exceptionControl", value);
  };

  const setIssueResolution = (value: string) => {
    updateDiagnosis("issueResolution", value);
  };

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

      setCustomerName,
      setSector,
      setOrganizationSize,
      setAdministrationCount,
      setOrganizationType,
      setAfasProducts,
      setOwnershipModel,
      setStandardizationContext,
      setPrimaryProcessChains,

      setScanReason,
      setBiggestBottleneck,

      setScopeWidth,
      setScopeFocus,
      setScopeDepth,

      setOwnershipClarity,
      setChangeDecisionProcess,
      setImprovementGovernance,
      setProcessStandardization,
      setExceptionControl,
      setIssueResolution,

      setComment,
    }),
    [scanState]
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

export default ScanProvider;
