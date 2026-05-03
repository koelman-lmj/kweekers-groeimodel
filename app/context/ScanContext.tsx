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
  organizationSize: string;
  administrationCount: string;
  scanReason: string;
  scanGoal: string;
  mainBottleneck: string;
  afasModules: string[];
  contextNote: string;
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
  setOrganizationSize: (value: string) => void;
  setAdministrationCount: (value: string) => void;
  setScanReason: (value: string) => void;
  setScanGoal: (value: string) => void;
  setMainBottleneck: (value: string) => void;
  toggleAfasModule: (value: string) => void;
  setContextNote: (value: string) => void;
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
      organizationSize: "",
      administrationCount: "",
      scanReason: "",
      scanGoal: "",
      mainBottleneck: "",
      afasModules: [],
      contextNote: "",
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

      setOrganizationSize: (value: string) => {
        setScan((previous) => ({
          ...previous,
          profile: {
            ...previous.profile,
            organizationSize: value,
          },
        }));
      },

      setAdministrationCount: (value: string) => {
        setScan((previous) => ({
          ...previous,
          profile: {
            ...previous.profile,
            administrationCount: value,
          },
        }));
      },

      setScanReason: (value: string) => {
        setScan((previous) => ({
          ...previous,
          profile: {
            ...previous.profile,
            scanReason: value,
          },
        }));
      },

      setScanGoal: (value: string) => {
        setScan((previous) => ({
          ...previous,
          profile: {
            ...previous.profile,
            scanGoal: value,
          },
        }));
      },

      setMainBottleneck: (value: string) => {
        setScan((previous) => ({
          ...previous,
          profile: {
            ...previous.profile,
            mainBottleneck: value,
          },
        }));
      },

      toggleAfasModule: (value: string) => {
        setScan((previous) => {
          const hasValue = previous.profile.afasModules.includes(value);

          return {
            ...previous,
            profile: {
              ...previous.profile,
              afasModules: hasValue
                ? previous.profile.afasModules.filter((item) => item !== value)
                : [...previous.profile.afasModules, value],
            },
          };
        });
      },

      setContextNote: (value: string) => {
        setScan((previous) => ({
          ...previous,
          profile: {
            ...previous.profile,
            contextNote: value,
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
