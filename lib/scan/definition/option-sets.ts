import type { OptionSetDefinition } from "./types";

export const optionSets: OptionSetDefinition[] = [
  {
    "key": "maturity_3level_options",
    "title": "Volwassenheidsniveau",
    "options": [
      {
        "value": "laag",
        "label": "Laag",
        "description": "Er is weinig structuur of het gebeurt ad hoc.",
        "order": 10,
        "score": 1,
        "adviceSignal": "aandacht"
      },
      {
        "value": "midden",
        "label": "Midden",
        "description": "Er zijn afspraken, maar deze worden nog niet overal gevolgd.",
        "order": 20,
        "score": 2,
        "adviceSignal": "verbeteren"
      },
      {
        "value": "hoog",
        "label": "Hoog",
        "description": "De werkwijze is duidelijk, geborgd en wordt actief gebruikt.",
        "order": 30,
        "score": 3,
        "adviceSignal": "goed"
      }
    ]
  },
  {
    "key": "yes_no_options",
    "title": "Ja/Nee",
    "options": [
      {
        "value": "ja",
        "label": "Ja",
        "description": "Dit is aanwezig of geregeld.",
        "order": 10,
        "score": 1,
        "adviceSignal": "goed"
      },
      {
        "value": "nee",
        "label": "Nee",
        "description": "Dit is niet of onvoldoende geregeld.",
        "order": 20,
        "score": 0,
        "adviceSignal": "aandacht"
      }
    ]
  }
];
