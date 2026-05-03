"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CustomerProfile = {
  customerName: string;
  sector: string;
};

type ScanState = {
  profile: CustomerProfile;
  scope: string;
};

type ScanContextValue = {
  scan: ScanState;
  setCustomerName: (value: string) => void;
  setSector: (value: string) => void;
  setScope: (value: string) => void;
  resetScan: () => void;
};

const ScanContext = createContext<ScanContextValue | null>(null);

function createInitialScanState(): ScanState {
  return {
    profile: {
      customerName: "",
      sector: "",
    },
    scope: "volledige_scan",
  };
}

export function ScanProvider({ children }: { children: ReactNode }) {
  const [scan, setScan] = useState<ScanState>(() => createInitialScanState());

  const value = useMemo<ScanContextValue>(() => {
    return {
      scan,
      setCustomerName: (value) => {
        setScan((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            customerName: value,
          },
        }));
      },
      setSector: (value) => {
        setScan((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            sector: value,
          },
        }));
      },
      setScope: (value) => {
        setScan((prev) => ({
          ...prev,
          scope: value,
        }));
      },
      resetScan: () => {
        setScan(createInitialScanState());
      },
    };
  }, [scan]);

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScanContext() {
  const context = useContext(ScanContext);

  if (!context) {
    throw new Error("useScanContext must be used within ScanProvider");
  }

  return context;
}
