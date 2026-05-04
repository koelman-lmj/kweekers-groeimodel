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
    scanReason: string;
    biggestBottleneck: string;
  };
scope: {
  width: string;
  focus: string;
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
  advice: {
    direction: string;
  };
};

const STORAGE_KEY = "kweekers-groeimodel-scan";

const INITIAL_SCAN: ScanState = {
  profile: {
    customerName: "",
    sector: "",
    organizationSize: "",
    administrationCount: "",
    scanReason: "",
    biggestBottleneck: "",
  },
  scope: "",
  diagnosis: {
    ownershipClarity: "",
    changeDecisionProcess: "",
    improvementGovernance: "",
    processStandardization: "",
    exceptionControl: "",
    issueResolution: "",
  },
  advice: {
    direction: "",
  },
};

type ScanContextValue = {
  scan: ScanState;
  setScan: Dispatch<SetStateAction<ScanState>>;
  resetScan: () => void;

  setCustomerName: (value: string) => void;
  setSector: (value: string) => void;
  setOrganizationSize: (value: string) => void;
  setAdministrationCount: (value: string) => void;

  setScanReason: (value: string) => void;
  setBiggestBottleneck: (value: string) => void;

  setScope: (value: string) => void;

  setOwnershipClarity: (value: string) => void;
  setChangeDecisionProcess: (value: string) => void;
  setImprovementGovernance: (value: string) => void;
  setProcessStandardization: (value: string) => void;
  setExceptionControl: (value: string) => void;
  setIssueResolution: (value: string) => void;

  setAdviceDirection: (value: string) => void;
};

const ScanContext = createContext<ScanContextValue | undefined>(undefined);

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
        scanReason: parsed.profile?.scanReason ?? "",
        biggestBottleneck: parsed.profile?.biggestBottleneck ?? "",
      },
      scope: parsed.scope ?? "",
      diagnosis: {
        ownershipClarity: parsed.diagnosis?.ownershipClarity ?? "",
        changeDecisionProcess: parsed.diagnosis?.changeDecisionProcess ?? "",
        improvementGovernance: parsed.diagnosis?.improvementGovernance ?? "",
        processStandardization: parsed.diagnosis?.processStandardization ?? "",
        exceptionControl: parsed.diagnosis?.exceptionControl ?? "",
        issueResolution: parsed.diagnosis?.issueResolution ?? "",
      },
      advice: {
        direction: parsed.advice?.direction ?? "",
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
  const [scanState, setScanState] = useState<ScanState>(() => loadInitialScan());

  const setScan: Dispatch<SetStateAction<ScanState>> = (value) => {
    setScanState((current) => {
      const next = typeof value === "function" ? value(current) : value;
      persistScan(next);
      return next;
    });
  };

  const updateProfile = (field: keyof ScanState["profile"], value: string) => {
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

  const setScanReason = (value: string) => {
    updateProfile("scanReason", value);
  };

  const setBiggestBottleneck = (value: string) => {
    updateProfile("biggestBottleneck", value);
  };

  const setScope = (value: string) => {
    setScan((current) => ({
      ...current,
      scope: value,
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

  const setAdviceDirection = (value: string) => {
    setScan((current) => ({
      ...current,
      advice: {
        ...current.advice,
        direction: value,
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

      setScanReason,
      setBiggestBottleneck,

      setScope,

      setOwnershipClarity,
      setChangeDecisionProcess,
      setImprovementGovernance,
      setProcessStandardization,
      setExceptionControl,
      setIssueResolution,

      setAdviceDirection,
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
