export type CategoryDefinition = {
  code: string;
  title: string;
  description: string;
  order: number;
};

export const categories: CategoryDefinition[] = [
  {
    "code": "organisatie",
    "title": "Organisatie",
    "description": "Vragen over eigenaarschap, sturing en beheer.",
    "order": 10
  },
  {
    "code": "proces",
    "title": "Proces",
    "description": "Vragen over procesafspraken, werkwijze en standaardisatie.",
    "order": 20
  }
];

export function getCategoryDefinition(code: string): CategoryDefinition {
  return (
    categories.find((category) => category.code === code) ??
    categories.find((category) => category.code === "Overig")!
  );
}
