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
    primaryGoal: string;
    biggestBottleneck: string;
  };
  scope: string;
  diagnosis: {
    ownership: string;
    afasUsage: string;
    reporting: string;
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
    primaryGoal: "",
    biggestBottleneck: "",
  },
  scope: "",
  diagnosis: {
    ownership: "",
    afasUsage: "",
    reporting: "",
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
  setPrimaryGoal: (value: string) => void;
  setBiggestBottleneck: (value: string) => void;

  setScope: (value: string) => void;

  setOwnership: (value: string) => void;
  setAfasUsage: (value: string) => void;
  setReporting: (value: string) => void;
};

const ScanContext = createContext<ScanContextValue | undefined>(undefined);

function loadInitialScan(): ScanState {
  if (typeof window === "undefined") return INITIAL_SCAN;

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return INITIAL_SCAN;

    return JSON.parse(storedValue) as ScanState;
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

  const setPrimaryGoal = (value: string) => {
    updateProfile("primaryGoal", value);
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

  const setOwnership = (value: string) => {
    updateDiagnosis("ownership", value);
  };

  const setAfasUsage = (value: string) => {
    updateDiagnosis("afasUsage", value);
  };

  const setReporting = (value: string) => {
    updateDiagnosis("reporting", value);
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
      setPrimaryGoal,
      setBiggestBottleneck,

      setScope,

      setOwnership,
      setAfasUsage,
      setReporting,
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
