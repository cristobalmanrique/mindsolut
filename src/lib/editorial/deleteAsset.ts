import fs from "fs";
import path from "path";
import { assets } from "@/data/assets";
import type { AssetItem } from "@/types/content";
import {
  getDraftPdfAbsolutePath,
  getPublicPdfAbsolutePath,
  getPublicPreviewAbsolutePath,
  getReviewPdfAbsolutePath,
  getStoragePreviewAbsolutePath,
  removeFileIfExists,
} from "./assetStorage";
import { removeAssetEditorialStatus } from "./editorialStatus";

const ASSETS_SOURCE_FILE = path.join(process.cwd(), "src", "data", "assets.ts");
const SEO_PAGES_DIR = path.join(process.cwd(), "storage", "seo", "pages");

function assertAssetExists(assetId: string): AssetItem {
  const asset = assets.find((item) => item.id === assetId);

  if (!asset) {
    throw new Error(`No existe un asset con id ${assetId}.`);
  }

  return asset;
}

function writeAssetsSource(nextAssets: AssetItem[]) {
  const content = `import { AssetItem } from "@/types/content";\n\nexport const assets: AssetItem[] = ${JSON.stringify(
    nextAssets,
    null,
    2
  )};\n`;

  fs.writeFileSync(ASSETS_SOURCE_FILE, content, "utf-8");
}

function removeSeoPayload(slug: string) {
  const filePath = path.join(SEO_PAGES_DIR, `${slug}.json`);
  return removeFileIfExists(filePath);
}

function deleteAssetFiles(asset: AssetItem) {
  return {
    draftPdf: removeFileIfExists(getDraftPdfAbsolutePath(asset)),
    reviewPdf: removeFileIfExists(getReviewPdfAbsolutePath(asset)),
    publicPdf: removeFileIfExists(getPublicPdfAbsolutePath(asset)),
    storagePreview: removeFileIfExists(getStoragePreviewAbsolutePath(asset)),
    publicPreview: removeFileIfExists(getPublicPreviewAbsolutePath(asset)),
    seoPayload: removeSeoPayload(asset.slug),
  };
}

export function deleteAssetAndFiles(assetId: string) {
  const asset = assertAssetExists(assetId);
  const nextAssets = assets.filter((item) => item.id !== assetId);

  const deletedFiles = deleteAssetFiles(asset);
  const removedStatus = removeAssetEditorialStatus(assetId);

  writeAssetsSource(nextAssets);

  return {
    assetId,
    slug: asset.slug,
    title: asset.title,
    removedStatus,
    deletedFiles,
  };
}
