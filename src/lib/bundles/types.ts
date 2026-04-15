export type BundleEditorialStatusValue =
  | "draft"
  | "review"
  | "seo-optimized"
  | "ready";

export type BundleStatusRecord = {
  bundleId: string;
  slug: string;
  status: BundleEditorialStatusValue;
  topicIds: string[];
  updatedAt: string;
  notes?: string;
  generatedAt?: string;
  seoGeneratedAt?: string;
  readyAt?: string;
};

export type BundleStatusMap = Record<string, BundleStatusRecord>;

export type BundleValidationIssue = {
  code:
    | "BUNDLE_NOT_FOUND"
    | "BUNDLE_WITHOUT_TOPIC"
    | "BUNDLE_WITHOUT_ASSETS"
    | "ASSET_NOT_FOUND"
    | "ASSET_NOT_IN_REVIEW"
    | "ASSET_REVIEW_PDF_MISSING"
    | "BUNDLE_COVER_MISSING"
    | "BUNDLE_PREVIEW_MISSING"
    | "BUNDLE_PDF_MISSING"
    | "ASSET_STATUS_NOT_FOUND"
    | "BUNDLE_SEO_MISSING";
  message: string;
  assetId?: string;
  bundleId?: string;
  slug?: string;
};

export type BundleValidationResult = {
  bundleId: string;
  slug: string;
  topicIds: string[];
  isValid: boolean;
  issues: BundleValidationIssue[];
};

export type BundleTopicValidationResult = {
  topicId: string;
  total: number;
  valid: BundleValidationResult[];
  invalid: BundleValidationResult[];
};

export type BundleGenerationItemResult = {
  bundleId: string;
  slug: string;
  topicIds: string[];
  message?: string;
  pdfUrl?: string;
  coverImage?: string;
  previewImage?: string;
};

export type BundleGenerationBatchResult = {
  topicId: string;
  total: number;
  generated: BundleGenerationItemResult[];
  skipped: BundleGenerationItemResult[];
  failed: BundleGenerationItemResult[];
};

export type BundleSeoPayload = {
  id: string;
  pageType: "bundle";
  slug: string;
  title: string;
  description: string;
  canonicalUrl: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  includes: string[];
  benefits: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
  topicId?: string;
  grade?: string;
  subject?: string;
  educationalLevel?: string;
  price?: number;
  currency?: string;
  assetIds: string[];
  coverImage?: string;
  previewImage?: string;
  pdfUrl?: string;
  updatedAt: string;
};

export type BundleSeoGenerationItemResult = {
  bundleId: string;
  slug: string;
  topicIds: string[];
  message?: string;
  seoPath?: string;
};

export type BundleSeoBatchResult = {
  topicId: string;
  total: number;
  generated: BundleSeoGenerationItemResult[];
  skipped: BundleSeoGenerationItemResult[];
  failed: BundleSeoGenerationItemResult[];
};
