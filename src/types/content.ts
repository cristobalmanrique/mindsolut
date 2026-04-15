export type StatusKey =
  | "draft"
  | "review"
  | "seo-optimized"
  | "ready"
  | "published"
  | "optimized"
  | "archived";

export type AssetType =
  | "worksheet"
  | "quiz"
  | "puzzle"
  | "crossword"
  | "word-search"
  | "flashcard"
  | "planner"
  | "printable";

export type PageType =
  | "home"
  | "resource"
  | "bundle"
  | "collection"
  | "legal"
  | "landing";

export interface StatusItem {
  id: string;
  key: StatusKey;
  label: string;
  description: string;
  color: string;
}

export interface TopicItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  language: string;
  status: StatusKey;
}

export type AssetAccessType = "free" | "premium";

export type AssetContentRole = "standard" | "anchor" | "bundle_only";

export interface AssetItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: AssetType;
  topicId: string;
  language: string;
  accessType: AssetAccessType;
  contentRole: AssetContentRole;
  printable: boolean;
  fileUrl: string;
  previewImage: string;
  status: StatusKey;
}

export interface BundleItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  topicIds: string[];
  assetIds: string[];
  language: string;
  price: number;
  currency: string;
  coverImage: string;
  status: StatusKey;

  pedagogicalCriteria?: boolean;
  explainedAnswers?: boolean;
  assessmentScale?: {
    enabled: boolean;
    evaluatedExercises: number;
    ranges: {
      min: number;
      max: number;
      label: string;
    }[];
  };
  reinforcementBlock?: {
    enabled: boolean;
    extraExercises: number;
  };
  premiumValue?: string[];
}

export interface CollectionItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  assetIds: string[];
  bundleIds: string[];
  pageId: string;
  status: StatusKey;
}

export interface PageItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  pageType: PageType;
  entityId: string | null;
  seoTitle: string;
  seoDescription: string;
  indexable: boolean;
  status: StatusKey;
}