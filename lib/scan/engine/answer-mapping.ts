import type { ScanState } from "@/app/context/ScanContext";

export type AnswerValue = string | string[];

export function getAnswerFromScan(
  scan: ScanState,
  questionKey: string
): AnswerValue {
  switch (questionKey) {
    case "customer_name":
      return scan.profile.customerName;
    case "sector":
      return scan.profile.sector;
    case "organization_size":
      return scan.profile.organizationSize;
    case "administration_count":
      return scan.profile.administrationCount;
    case "afas_products":
      return scan.profile.afasProducts;

    case "scan_reason":
      return scan.profile.scanReason;
    case "biggest_bottleneck":
      return scan.profile.biggestBottleneck;

    case "scope":
      return scan.scope.width;
    case "scope_focus":
      return scan.scope.focus;
    case "scope_depth":
      return scan.scope.depth;

    case "ownership_clarity":
      return scan.diagnosis.ownershipClarity;
    case "change_decision_process":
      return scan.diagnosis.changeDecisionProcess;
    case "improvement_governance":
      return scan.diagnosis.improvementGovernance;
    case "process_standardization":
      return scan.diagnosis.processStandardization;
    case "exception_control":
      return scan.diagnosis.exceptionControl;
    case "issue_resolution":
      return scan.diagnosis.issueResolution;

    default:
      return "";
  }
}

export type ScanActions = {
  setCustomerName: (value: string) => void;
  setSector: (value: string) => void;
  setOrganizationSize: (value: string) => void;
  setAdministrationCount: (value: string) => void;
  setAfasProducts: (value: string[]) => void;

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
};

function ensureStringArray(value: AnswerValue): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string" && value.trim() !== "") {
    return [value];
  }

  return [];
}

function ensureString(value: AnswerValue): string {
  if (typeof value === "string") {
    return value;
  }

  return value[0] ?? "";
}

export function setAnswerToScan(
  actions: ScanActions,
  questionKey: string,
  value: AnswerValue
) {
  switch (questionKey) {
    case "customer_name":
      actions.setCustomerName(ensureString(value));
      return;
    case "sector":
      actions.setSector(ensureString(value));
      return;
    case "organization_size":
      actions.setOrganizationSize(ensureString(value));
      return;
    case "administration_count":
      actions.setAdministrationCount(ensureString(value));
      return;
    case "afas_products":
      actions.setAfasProducts(ensureStringArray(value));
      return;

    case "scan_reason":
      actions.setScanReason(ensureString(value));
      return;
    case "biggest_bottleneck":
      actions.setBiggestBottleneck(ensureStringArray(value));
      return;

    case "scope":
      actions.setScopeWidth(ensureString(value));
      return;
    case "scope_focus":
      actions.setScopeFocus(ensureStringArray(value));
      return;
    case "scope_depth":
      actions.setScopeDepth(ensureString(value));
      return;

    case "ownership_clarity":
      actions.setOwnershipClarity(ensureString(value));
      return;
    case "change_decision_process":
      actions.setChangeDecisionProcess(ensureString(value));
      return;
    case "improvement_governance":
      actions.setImprovementGovernance(ensureString(value));
      return;
    case "process_standardization":
      actions.setProcessStandardization(ensureString(value));
      return;
    case "exception_control":
      actions.setExceptionControl(ensureString(value));
      return;
    case "issue_resolution":
      actions.setIssueResolution(ensureString(value));
      return;

    default:
      return;
  }
}
