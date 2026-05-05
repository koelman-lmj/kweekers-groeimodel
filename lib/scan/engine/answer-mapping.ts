import type { ScanState } from "@/app/context/ScanContext";

export function getAnswerFromScan(
  scan: ScanState,
  questionKey: string
): string {
  switch (questionKey) {
    case "customer_name":
      return scan.profile.customerName;
    case "sector":
      return scan.profile.sector;
    case "organization_size":
      return scan.profile.organizationSize;
    case "administration_count":
      return scan.profile.administrationCount;

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

  setScanReason: (value: string) => void;
  setBiggestBottleneck: (value: string) => void;

  setScopeWidth: (value: string) => void;
  setScopeFocus: (value: string) => void;
  setScopeDepth: (value: string) => void;

  setOwnershipClarity: (value: string) => void;
  setChangeDecisionProcess: (value: string) => void;
  setImprovementGovernance: (value: string) => void;
  setProcessStandardization: (value: string) => void;
  setExceptionControl: (value: string) => void;
  setIssueResolution: (value: string) => void;
};

export function setAnswerToScan(
  actions: ScanActions,
  questionKey: string,
  value: string
) {
  switch (questionKey) {
    case "customer_name":
      actions.setCustomerName(value);
      return;
    case "sector":
      actions.setSector(value);
      return;
    case "organization_size":
      actions.setOrganizationSize(value);
      return;
    case "administration_count":
      actions.setAdministrationCount(value);
      return;

    case "scan_reason":
      actions.setScanReason(value);
      return;
    case "biggest_bottleneck":
      actions.setBiggestBottleneck(value);
      return;

    case "scope":
      actions.setScopeWidth(value);
      return;
    case "scope_focus":
      actions.setScopeFocus(value);
      return;
    case "scope_depth":
      actions.setScopeDepth(value);
      return;

    case "ownership_clarity":
      actions.setOwnershipClarity(value);
      return;
    case "change_decision_process":
      actions.setChangeDecisionProcess(value);
      return;
    case "improvement_governance":
      actions.setImprovementGovernance(value);
      return;
    case "process_standardization":
      actions.setProcessStandardization(value);
      return;
    case "exception_control":
      actions.setExceptionControl(value);
      return;
    case "issue_resolution":
      actions.setIssueResolution(value);
      return;

    default:
      return;
  }
}
