import type { AssetItem } from "@/types/content";
import {
  EditorialAssetStatus,
  ensureEditorialStorageDirs,
  fileExists,
  getDraftPdfAbsolutePath,
  getPublicPdfAbsolutePath,
  getPublicPreviewAbsolutePath,
  getReviewPdfAbsolutePath,
  getStoragePreviewAbsolutePath,
  moveFileSafe,
} from "./assetStorage";
import { getAssetEditorialStatus, updateAssetEditorialStatus } from "./editorialStatus";

function assertForwardTransition(
  currentStatus: EditorialAssetStatus,
  nextStatus: EditorialAssetStatus
) {
  const allowedTransitions: Record<EditorialAssetStatus, EditorialAssetStatus[]> = {
    draft: ["review"],
    review: ["seo-optimized", "ready"],
    "seo-optimized": ["ready"],
    ready: [],
    archived: [],
  };

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    throw new Error(`Transition not allowed: ${currentStatus} -> ${nextStatus}`);
  }
}

function movePdfToReview(asset: AssetItem) {
  const draftPath = getDraftPdfAbsolutePath(asset);
  const reviewPath = getReviewPdfAbsolutePath(asset);

  if (fileExists(reviewPath)) {
    return reviewPath;
  }

  const moved = moveFileSafe(draftPath, reviewPath);

  if (!moved) {
    throw new Error(`Draft PDF not found for asset ${asset.id}: ${draftPath}`);
  }

  return reviewPath;
}

function publishAssetFiles(asset: AssetItem) {
  const reviewPdfPath = getReviewPdfAbsolutePath(asset);
  const publicPdfPath = getPublicPdfAbsolutePath(asset);
  const storagePreviewPath = getStoragePreviewAbsolutePath(asset);
  const publicPreviewPath = getPublicPreviewAbsolutePath(asset);

  const pdfMoved = moveFileSafe(reviewPdfPath, publicPdfPath);
  const previewMoved = moveFileSafe(storagePreviewPath, publicPreviewPath);

  if (!pdfMoved) {
    throw new Error(`Review PDF not found for asset ${asset.id}: ${reviewPdfPath}`);
  }

  if (!previewMoved) {
    throw new Error(`Stored preview not found for asset ${asset.id}: ${storagePreviewPath}`);
  }

  return {
    pdfPath: publicPdfPath,
    previewPath: publicPreviewPath,
  };
}

export function transitionAssetEditorialStatus(
  asset: AssetItem,
  nextStatus: EditorialAssetStatus
) {
  ensureEditorialStorageDirs();

  const currentStatus = getAssetEditorialStatus(asset);

  if (currentStatus === nextStatus) {
    return {
      assetId: asset.id,
      previousStatus: currentStatus,
      nextStatus,
      moved: false,
    };
  }

  assertForwardTransition(currentStatus, nextStatus);

  if (currentStatus === "draft" && nextStatus === "review") {
    movePdfToReview(asset);
  }

  if (
    (currentStatus === "review" || currentStatus === "seo-optimized") &&
    nextStatus === "ready"
  ) {
    publishAssetFiles(asset);
  }

  const statusRecord = updateAssetEditorialStatus(asset, nextStatus);

  return {
    assetId: asset.id,
    previousStatus: currentStatus,
    nextStatus,
    moved: true,
    statusRecord,
  };
}
