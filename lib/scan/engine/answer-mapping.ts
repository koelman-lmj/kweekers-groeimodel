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
    case "primary_goal":
      return scan.profile.primaryGoal;
    case "biggest_bottleneck":
      return scan.profile.biggestBottleneck;

    case "scope":
      return scan.scope;

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

    case "advice_direction":
      return scan.advice.direction;

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
  setPrimaryGoal: (value: string) => void;
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
    case "primary_goal":
      actions.setPrimaryGoal(value);
      return;
    case "biggest_bottleneck":
      actions.setBiggestBottleneck(value);
      return;

    case "scope":
      actions.setScope(value);
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

    case "advice_direction":
      actions.setAdviceDirection(value);
      return;

    default:
      return;
  }
}
