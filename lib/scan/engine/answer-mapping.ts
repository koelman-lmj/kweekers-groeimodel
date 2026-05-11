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
    case "organization_type":
      return scan.profile.organizationType;
    case "afas_products":
      return scan.profile.afasProducts;
    case "ownership_model":
      return scan.profile.ownershipModel;
    case "standardization_context":
      return scan.profile.standardizationContext;
    case "primary_process_chains":
      return scan.profile.primaryProcessChains;

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

    case "finance_foundation_reliability":
      return scan.diagnosis.financeFoundationReliability;
    case "finance_exception_handling":
      return scan.diagnosis.financeExceptionHandling;
    case "finance_reporting_maturity":
      return scan.diagnosis.financeReportingMaturity;

    case "order_flow_standardization":
      return scan.diagnosis.orderFlowStandardization;
    case "order_exception_complexity":
      return scan.diagnosis.orderExceptionComplexity;
    case "order_system_fit":
      return scan.diagnosis.orderSystemFit;

    case "care_registration_exceptions":
      return scan.diagnosis.careRegistrationExceptions;
    case "care_accountability_pressure":
      return scan.diagnosis.careAccountabilityPressure;

    case "education_intake_planning_consistency":
      return scan.diagnosis.educationIntakePlanningConsistency;
    case "education_process_admin_alignment":
      return scan.diagnosis.educationProcessAdminAlignment;
    case "education_exception_handling":
      return scan.diagnosis.educationExceptionHandling;

    default:
      return "";
  }
}

export type ScanActions = {
  setCustomerName: (value: string) => void;
  setSector: (value: string) => void;
  setOrganizationSize: (value: string) => void;
  setAdministrationCount: (value: string) => void;
  setOrganizationType: (value: string[]) => void;
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

  setFinanceFoundationReliability: (value: string) => void;
  setFinanceExceptionHandling: (value: string) => void;
  setFinanceReportingMaturity: (value: string) => void;

  setOrderFlowStandardization: (value: string) => void;
  setOrderExceptionComplexity: (value: string) => void;
  setOrderSystemFit: (value: string) => void;

  setCareRegistrationExceptions: (value: string) => void;
  setCareAccountabilityPressure: (value: string) => void;

  setEducationIntakePlanningConsistency: (value: string) => void;
  setEducationProcessAdminAlignment: (value: string) => void;
  setEducationExceptionHandling: (value: string) => void;
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
    case "organization_type":
      actions.setOrganizationType(ensureStringArray(value));
      return;
    case "afas_products":
      actions.setAfasProducts(ensureStringArray(value));
      return;
    case "ownership_model":
      actions.setOwnershipModel(ensureString(value));
      return;
    case "standardization_context":
      actions.setStandardizationContext(ensureString(value));
      return;
    case "primary_process_chains":
      actions.setPrimaryProcessChains(ensureStringArray(value));
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

    case "finance_foundation_reliability":
      actions.setFinanceFoundationReliability(ensureString(value));
      return;
    case "finance_exception_handling":
      actions.setFinanceExceptionHandling(ensureString(value));
      return;
    case "finance_reporting_maturity":
      actions.setFinanceReportingMaturity(ensureString(value));
      return;

    case "order_flow_standardization":
      actions.setOrderFlowStandardization(ensureString(value));
      return;
    case "order_exception_complexity":
      actions.setOrderExceptionComplexity(ensureString(value));
      return;
    case "order_system_fit":
      actions.setOrderSystemFit(ensureString(value));
      return;

    case "care_registration_exceptions":
      actions.setCareRegistrationExceptions(ensureString(value));
      return;
    case "care_accountability_pressure":
      actions.setCareAccountabilityPressure(ensureString(value));
      return;

    case "education_intake_planning_consistency":
      actions.setEducationIntakePlanningConsistency(ensureString(value));
      return;
    case "education_process_admin_alignment":
      actions.setEducationProcessAdminAlignment(ensureString(value));
      return;
    case "education_exception_handling":
      actions.setEducationExceptionHandling(ensureString(value));
      return;

    default:
      return;
  }
}
