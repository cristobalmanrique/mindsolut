export type ResourceType =
  | "worksheet"
  | "quiz"
  | "puzzle"
  | "crossword"
  | "bundle"
  | "generator";

export interface ResourceItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  isPremium: boolean;
}
