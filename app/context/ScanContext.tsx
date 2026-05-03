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

const initialScanState: ScanState = {
  profile: {
    customerName: "",
    sector: "",
  },
  scope: "volledige_scan",
};

const ScanContext = createContext<ScanContextValue | null>(null);

export function ScanProvider({ children }: { children: ReactNode }) {
  const [scan, setScan] = useState<ScanState>(initialScanState);

  const value = useMemo<ScanContextValue>(() => {
    return {
      scan,
      setCustomerName: (value: string) =>
        setScan((previous) => ({
          ...previous,
          profile: {
            ...previous.profile,
            customerName: value,
          },
        })),
      setSector: (value: string) =>
        setScan((previous) => ({
          ...previous,
          profile: {
            ...previous.profile,
            sector: value,
          },
        })),
      setScope: (value: string) =>
        setScan((previous) => ({
          ...previous,
          scope: value,
        })),
      resetScan: () => setScan(initialScanState),
    };
  }, [scan]);

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScanContext() {
  const context = useContext(ScanContext);

  if (!context) {
    throw new Error("useScanContext must be used within a ScanProvider");
  }

  return context;
}
