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

type DiagnosisState = {
  ownership: string;
  afasUsage: string;
  reporting: string;
};

type ScanState = {
  profile: CustomerProfile;
  scope: string;
  diagnosis: DiagnosisState;
};

type ScanContextValue = {
  scan: ScanState;
  setCustomerName: (value: string) => void;
  setSector: (value: string) => void;
  setScope: (value: string) => void;
  setOwnership: (value: string) => void;
  setAfasUsage: (value: string) => void;
  setReporting: (value: string) => void;
  resetScan: () => void;
};

const ScanContext = createContext<ScanContextValue | null>(null);

function createInitialScanState(): ScanState {
  return {
    profile: {
      customerName: "",
      sector: "",
    },
scope: "",
    diagnosis: {
      ownership: "",
      afasUsage: "",
      reporting: "",
    },
  };
}

export function ScanProvider({ children }: { children: ReactNode }) {
  const [scan, setScan] = useState<ScanState>(() => createInitialScanState());

  const contextValue = useMemo<ScanContextValue>(
    () => ({
      scan,

      setCustomerName: (value: string) => {
        setScan((previous) => ({
          ...previous,
          profile: {
            ...previous.profile,
            customerName: value,
          },
        }));
      },

      setSector: (value: string) => {
        setScan((previous) => ({
          ...previous,
          profile: {
            ...previous.profile,
            sector: value,
          },
        }));
      },

      setScope: (value: string) => {
        setScan((previous) => ({
          ...previous,
          scope: value,
        }));
      },

      setOwnership: (value: string) => {
        setScan((previous) => ({
          ...previous,
          diagnosis: {
            ...previous.diagnosis,
            ownership: value,
          },
        }));
      },

      setAfasUsage: (value: string) => {
        setScan((previous) => ({
          ...previous,
          diagnosis: {
            ...previous.diagnosis,
            afasUsage: value,
          },
        }));
      },

      setReporting: (value: string) => {
        setScan((previous) => ({
          ...previous,
          diagnosis: {
            ...previous.diagnosis,
            reporting: value,
          },
        }));
      },

      resetScan: () => {
        setScan(createInitialScanState());
      },
    }),
    [scan]
  );

  return (
    <ScanContext.Provider value={contextValue}>{children}</ScanContext.Provider>
  );
}

export function useScanContext() {
  const context = useContext(ScanContext);

  if (!context) {
    throw new Error("useScanContext must be used within ScanProvider");
  }

  return context;
}
