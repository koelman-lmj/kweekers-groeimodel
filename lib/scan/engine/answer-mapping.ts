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
    case "afas_usage_duration":
      return scan.profile.afasUsageDuration;
    case "maintenance_quality":
      return scan.profile.maintenanceQuality;
    case "expected_org_changes":
      return scan.profile.expectedOrgChanges;
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

    case "finance_strategic_pressure":
      return scan.diagnosis.financeStrategicPressure;
    case "finance_foundation_reliability":
      return scan.diagnosis.financeFoundationReliability;
    case "finance_exception_handling":
      return scan.diagnosis.financeExceptionHandling;
    case "finance_reporting_maturity":
      return scan.diagnosis.financeReportingMaturity;

    case "order_strategic_pressure":
      return scan.diagnosis.orderStrategicPressure;
    case "order_flow_standardization":
      return scan.diagnosis.orderFlowStandardization;
    case "order_exception_complexity":
      return scan.diagnosis.orderExceptionComplexity;
    case "order_system_fit":
      return scan.diagnosis.orderSystemFit;

    case "crm_strategic_pressure":
      return scan.diagnosis.crmStrategicPressure;
    case "crm_process_maturity":
      return scan.diagnosis.crmProcessMaturity;
    case "crm_data_quality":
      return scan.diagnosis.crmDataQuality;
    case "crm_reporting_usefulness":
      return scan.diagnosis.crmReportingUsefulness;

    case "hrm_strategic_pressure":
      return scan.diagnosis.hrmStrategicPressure;
    case "hrm_process_maturity":
      return scan.diagnosis.hrmProcessMaturity;
    case "hrm_data_quality":
      return scan.diagnosis.hrmDataQuality;

    case "reporting_strategic_pressure":
      return scan.diagnosis.reportingStrategicPressure;
    case "reporting_definition_consistency":
      return scan.diagnosis.reportingDefinitionConsistency;
    case "reporting_usefulness":
      return scan.diagnosis.reportingUsefulness;

    case "integration_strategic_pressure":
      return scan.diagnosis.integrationStrategicPressure;
    case "integration_stability":
      return scan.diagnosis.integrationStability;
    case "integration_ownership":
      return scan.diagnosis.integrationOwnership;
    case "integration_monitoring_maturity":
      return scan.diagnosis.integrationMonitoringMaturity;

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
  setAfasUsageDuration: (value: string) => void;
  setMaintenanceQuality: (value: string) => void;
  setExpectedOrgChanges: (value: string) => void;
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

  setFinanceStrategicPressure: (value: string) => void;
  setFinanceFoundationReliability: (value: string) => void;
  setFinanceExceptionHandling: (value: string) => void;
  setFinanceReportingMaturity: (value: string) => void;

  setOrderStrategicPressure: (value: string) => void;
  setOrderFlowStandardization: (value: string) => void;
  setOrderExceptionComplexity: (value: string) => void;
  setOrderSystemFit: (value: string) => void;

  setCrmStrategicPressure: (value: string) => void;
  setCrmProcessMaturity: (value: string) => void;
  setCrmDataQuality: (value: string) => void;
  setCrmReportingUsefulness: (value: string) => void;

  setHrmStrategicPressure: (value: string) => void;
  setHrmProcessMaturity: (value: string) => void;
  setHrmDataQuality: (value: string) => void;

  setReportingStrategicPressure: (value: string) => void;
  setReportingDefinitionConsistency: (value: string) => void;
  setReportingUsefulness: (value: string) => void;

  setIntegrationStrategicPressure: (value: string) => void;
  setIntegrationStability: (value: string) => void;
  setIntegrationOwnership: (value: string) => void;
  setIntegrationMonitoringMaturity: (value: string) => void;

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
    case "afas_usage_duration":
      actions.setAfasUsageDuration(ensureString(value));
      return;
    case "maintenance_quality":
      actions.setMaintenanceQuality(ensureString(value));
      return;
    case "expected_org_changes":
      actions.setExpectedOrgChanges(ensureString(value));
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

    case "finance_strategic_pressure":
      actions.setFinanceStrategicPressure(ensureString(value));
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

    case "order_strategic_pressure":
      actions.setOrderStrategicPressure(ensureString(value));
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

    case "crm_strategic_pressure":
      actions.setCrmStrategicPressure(ensureString(value));
      return;
    case "crm_process_maturity":
      actions.setCrmProcessMaturity(ensureString(value));
      return;
    case "crm_data_quality":
      actions.setCrmDataQuality(ensureString(value));
      return;
    case "crm_reporting_usefulness":
      actions.setCrmReportingUsefulness(ensureString(value));
      return;

    case "hrm_strategic_pressure":
      actions.setHrmStrategicPressure(ensureString(value));
      return;
    case "hrm_process_maturity":
      actions.setHrmProcessMaturity(ensureString(value));
      return;
    case "hrm_data_quality":
      actions.setHrmDataQuality(ensureString(value));
      return;

    case "reporting_strategic_pressure":
      actions.setReportingStrategicPressure(ensureString(value));
      return;
    case "reporting_definition_consistency":
      actions.setReportingDefinitionConsistency(ensureString(value));
      return;
    case "reporting_usefulness":
      actions.setReportingUsefulness(ensureString(value));
      return;

    case "integration_strategic_pressure":
      actions.setIntegrationStrategicPressure(ensureString(value));
      return;
    case "integration_stability":
      actions.setIntegrationStability(ensureString(value));
      return;
    case "integration_ownership":
      actions.setIntegrationOwnership(ensureString(value));
      return;
    case "integration_monitoring_maturity":
      actions.setIntegrationMonitoringMaturity(ensureString(value));
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
