import fs from "fs";
import { bundles } from "@/data/bundles";
import { assets } from "@/data/assets";
import { topics } from "@/data/topics";
import {
  getBundleCoverAbsolutePath,
  getBundlePdfAbsolutePath,
  getBundlePreviewAbsolutePath,
  getBundleSeoPayloadAbsolutePath,
  getReviewAssetPdfAbsolutePath,
} from "@/lib/bundles/bundleStorage";
import {
  getAllBundleStatuses,
  getBundleStatusByBundleId,
} from "@/lib/bundles/bundleEditorialStatus";
import type {
  BundleEditorialStatusValue,
  BundleTopicValidationResult,
  BundleValidationIssue,
  BundleValidationResult,
} from "@/lib/bundles/types";

type BundleLike = {
  id: string;
  slug: string;
  title: string;
  topicIds: string[];
  assetIds: string[];
};

type AssetLike = {
  id: string;
  slug: string;
  status?: string;
};

function exists(filePath: string) {
  return fs.existsSync(filePath);
}

function getBundleBySlug(slug: string) {
  return bundles.find((bundle) => bundle.slug === slug) as BundleLike | undefined;
}

function getBundleById(bundleId: string) {
  return bundles.find((bundle) => bundle.id === bundleId) as BundleLike | undefined;
}

function getAssetById(assetId: string) {
  return assets.find((asset) => asset.id === assetId) as AssetLike | undefined;
}

function createIssue(
  bundle: BundleLike,
  issue: Omit<BundleValidationIssue, "bundleId" | "slug">
): BundleValidationIssue {
  return {
    ...issue,
    bundleId: bundle.id,
    slug: bundle.slug,
  };
}

function validateBundleBase(bundle: BundleLike): BundleValidationIssue[] {
  const issues: BundleValidationIssue[] = [];

  if (
    !bundle.topicIds?.length ||
    !bundle.topicIds.every((topicId) =>
      topics.some((topic) => topic.id === topicId)
    )
  ) {
    issues.push(
      createIssue(bundle, {
        code: "BUNDLE_WITHOUT_TOPIC",
        message: "El bundle no tiene topicIds válidos.",
      })
    );
  }

  if (!bundle.assetIds?.length) {
    issues.push(
      createIssue(bundle, {
        code: "BUNDLE_WITHOUT_ASSETS",
        message: "El bundle no tiene assetIds definidos.",
      })
    );
  }

  for (const assetId of bundle.assetIds ?? []) {
    const asset = getAssetById(assetId);

    if (!asset) {
      issues.push(
        createIssue(bundle, {
          code: "ASSET_NOT_FOUND",
          assetId,
          message: `No existe el asset ${assetId}.`,
        })
      );
      continue;
    }

    if (asset.status !== "review") {
      issues.push(
        createIssue(bundle, {
          code: "ASSET_NOT_IN_REVIEW",
          assetId,
          message: `El asset ${assetId} debe estar en review para generar el pack.`,
        })
      );
    }

    if (!exists(getReviewAssetPdfAbsolutePath(asset))) {
      issues.push(
        createIssue(bundle, {
          code: "ASSET_REVIEW_PDF_MISSING",
          assetId,
          message: `Falta el PDF review del asset ${assetId}.`,
        })
      );
    }
  }

  return issues;
}

export async function validateBundleBySlug(
  slug: string
): Promise<BundleValidationResult> {
  const bundle = getBundleBySlug(slug);

  if (!bundle) {
    return {
      bundleId: "",
      slug,
      topicIds: [],
      isValid: false,
      issues: [
        {
          code: "BUNDLE_NOT_FOUND",
          message: `No existe el bundle ${slug}.`,
          slug,
          bundleId: "",
        },
      ],
    };
  }

  const issues = validateBundleBase(bundle);

  return {
    bundleId: bundle.id,
    slug: bundle.slug,
    topicIds: bundle.topicIds ?? [],
    isValid: issues.length === 0,
    issues,
  };
}

export async function validateBundleByBundleId(
  bundleId: string
): Promise<BundleValidationResult> {
  const bundle = getBundleById(bundleId);

  if (!bundle) {
    return {
      bundleId,
      slug: "",
      topicIds: [],
      isValid: false,
      issues: [
        {
          code: "BUNDLE_NOT_FOUND",
          message: `No existe el bundle ${bundleId}.`,
          slug: "",
          bundleId,
        },
      ],
    };
  }

  return validateBundleBySlug(bundle.slug);
}

export async function validateBundlesByTopicId(
  topicId: string
): Promise<BundleTopicValidationResult> {
  const topicBundles = bundles.filter((bundle) =>
    bundle.topicIds?.includes(topicId)
  ) as BundleLike[];

  const results = await Promise.all(
    topicBundles.map((bundle) => validateBundleBySlug(bundle.slug))
  );

  return {
    topicId,
    total: topicBundles.length,
    valid: results.filter((item) => item.isValid),
    invalid: results.filter((item) => !item.isValid),
  };
}

export async function getEligibleBundlesByTopicId(topicId: string) {
  const validation = await validateBundlesByTopicId(topicId);
  return validation.valid;
}

export async function getEligibleBundlesByTopic(topicId: string) {
  return getEligibleBundlesByTopicId(topicId);
}

export async function getBundleGenerationContextBySlug(slug: string) {
  const bundle = getBundleBySlug(slug);

  if (!bundle) {
    throw new Error(`Bundle no encontrado: ${slug}`);
  }

  const bundleAssets = bundle.assetIds.map((assetId) => {
    const asset = getAssetById(assetId);

    if (!asset) {
      throw new Error(`Asset no encontrado en bundle ${slug}: ${assetId}`);
    }

    return asset;
  });

  return {
    bundle,
    assets: bundleAssets,
    reviewPdfPaths: bundleAssets.map((asset) =>
      getReviewAssetPdfAbsolutePath(asset)
    ),
  };
}

export async function assertBundleCanBeGenerated(slug: string) {
  const validation = await validateBundleBySlug(slug);

  if (!validation.isValid) {
    const messages = validation.issues.map((issue) => issue.message).join(" | ");
    throw new Error(`El bundle ${slug} no se puede generar. ${messages}`);
  }

  return validation;
}

export async function validateBundleReadyBySlug(
  slug: string
): Promise<BundleValidationResult> {
  const base = await validateBundleBySlug(slug);

  if (!base.isValid) {
    return base;
  }

  const bundle = getBundleBySlug(slug)!;
  const issues = [...base.issues];

  if (!exists(getBundleCoverAbsolutePath(bundle.slug))) {
    issues.push(
      createIssue(bundle, {
        code: "BUNDLE_COVER_MISSING",
        message: "Falta la portada del bundle.",
      })
    );
  }

  if (!exists(getBundlePreviewAbsolutePath(bundle.slug))) {
    issues.push(
      createIssue(bundle, {
        code: "BUNDLE_PREVIEW_MISSING",
        message: "Falta el preview del bundle.",
      })
    );
  }

  if (!exists(getBundlePdfAbsolutePath(bundle.slug))) {
    issues.push(
      createIssue(bundle, {
        code: "BUNDLE_PDF_MISSING",
        message: "Falta el PDF final del bundle.",
      })
    );
  }

  if (!exists(getBundleSeoPayloadAbsolutePath(bundle.slug))) {
    issues.push(
      createIssue(bundle, {
        code: "BUNDLE_SEO_MISSING",
        message: "Falta el payload SEO del bundle.",
      })
    );
  }

  return {
    bundleId: bundle.id,
    slug: bundle.slug,
    topicIds: bundle.topicIds ?? [],
    isValid: issues.length === 0,
    issues,
  };
}

export async function canBundleMoveToReady(slug: string) {
  const validation = await validateBundleReadyBySlug(slug);
  return { ok: validation.isValid, validation };
}

export async function assertBundleCanMoveToReady(slug: string) {
  const result = await canBundleMoveToReady(slug);

  if (!result.ok) {
    throw new Error(`El bundle ${slug} no puede pasar a ready.`);
  }

  return result.validation;
}

export function getBundleEditorialStatusOrDefault(
  bundleIdOrSlug: string
): BundleEditorialStatusValue {
  const bundle = getBundleById(bundleIdOrSlug) ?? getBundleBySlug(bundleIdOrSlug);

  if (!bundle) {
    return "draft";
  }

  return getBundleStatusByBundleId(bundle.id)?.status ?? "draft";
}

export function getAllBundleEditorialStatusesOrDraft() {
  const stored = new Map(
    getAllBundleStatuses().map((item) => [item.bundleId, item.status])
  );

  return bundles.map((bundle) => ({
    bundleId: bundle.id,
    slug: bundle.slug,
    status: (stored.get(bundle.id) ?? "draft") as BundleEditorialStatusValue,
  }));
}