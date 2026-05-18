import type { QuestionDefinition } from "./types";

export const questions: QuestionDefinition[] = [
  {
    "key": "ownership_process_owner",
    "sectionCode": "diagnose",
    "order": 10,
    "label": "Is er een duidelijke eigenaar voor AFAS-processen?",
    "helpText": "Kies hoe duidelijk eigenaarschap nu is belegd.",
    "inputType": "single_select",
    "required": true,
    "optionSetKey": "maturity_3level_options",
    "allowsComment": true,
    "dimensionCode": "eigenaarschap",
    "category": "Organisatie & Beheer",
    "outputRole": "diagnose",
    "scoreEnabled": true,
    "scoreWeight": 1
  },
  {
    "key": "process_standardization",
    "sectionCode": "diagnose",
    "order": 20,
    "label": "Worden processen op één standaardmanier uitgevoerd?",
    "helpText": "Denk aan verschillen tussen teams, locaties of administraties.",
    "inputType": "single_select",
    "required": true,
    "optionSetKey": "maturity_3level_options",
    "allowsComment": true,
    "dimensionCode": "procesafspraken",
    "category": "Organisatie & Beheer",
    "outputRole": "diagnose",
    "scoreEnabled": true,
    "scoreWeight": 1
  },
  {
    "key": "data_quality_control",
    "sectionCode": "diagnose",
    "order": 30,
    "label": "Wordt stamdata actief gecontroleerd en opgeschoond?",
    "helpText": "Denk aan relaties, artikelen, projecten, grootboek en dimensies.",
    "inputType": "single_select",
    "required": true,
    "optionSetKey": "maturity_3level_options",
    "allowsComment": true,
    "dimensionCode": "datakwaliteit",
    "category": "Organisatie & Beheer",
    "outputRole": "diagnose",
    "scoreEnabled": true,
    "scoreWeight": 1
  },
  {
    "key": "improvement_backlog_exists",
    "sectionCode": "diagnose",
    "order": 40,
    "label": "Is er een duidelijke verbeterlijst voor AFAS?",
    "helpText": "Kies of verbeterpunten centraal worden bijgehouden.",
    "inputType": "single_select",
    "required": true,
    "optionSetKey": "yes_no_options",
    "allowsComment": true,
    "dimensionCode": "eigenaarschap",
    "category": "Organisatie & Beheer",
    "outputRole": "diagnose",
    "scoreEnabled": true,
    "scoreWeight": 1
  }
];
