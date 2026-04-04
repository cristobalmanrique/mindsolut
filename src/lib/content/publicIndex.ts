import fs from "fs";
import path from "path";
import { assets } from "@/data/assets";
import { topics } from "@/data/topics";
import {
  getPublicPdfAbsolutePath,
  getPublicPreviewAbsolutePath,
} from "@/lib/editorial/assetStorage";
import { getAssetEditorialStatus } from "@/lib/editorial/editorialStatus";

const SEO_PAGES_DIR = path.join(process.cwd(), "storage", "seo", "pages");

export type PublicAsset = (typeof assets)[number];

function getSeoSlugsSet(): Set<string> {
  if (!fs.existsSync(SEO_PAGES_DIR)) {
    return new Set();
  }

  const files = fs.readdirSync(SEO_PAGES_DIR);

  return new Set(
    files
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(/\.json$/, ""))
  );
}

function isValidSeoPayload(slug: string): boolean {
  try {
    const filePath = path.join(SEO_PAGES_DIR, `${slug}.json`);

    if (!fs.existsSync(filePath)) return false;

    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);

    return Boolean(
      parsed?.slug &&
        parsed?.title &&
        parsed?.seoTitle &&
        parsed?.seoDescription
    );
  } catch {
    return false;
  }
}

function isPubliclyAvailableAsset(asset: PublicAsset) {
  const editorialStatus = getAssetEditorialStatus(asset);

  if (editorialStatus !== "ready") {
    return false;
  }

  // Validación defensiva de rutas
  if (
    !asset.fileUrl?.startsWith("/downloads/") ||
    !asset.previewImage?.startsWith("/previews/")
  ) {
    return false;
  }

  const pdfExists = fs.existsSync(getPublicPdfAbsolutePath(asset));
  const previewExists = fs.existsSync(getPublicPreviewAbsolutePath(asset));

  return pdfExists && previewExists;
}

export function getPublicAssets(): PublicAsset[] {
  const seoSlugs = getSeoSlugsSet();

  return assets.filter((asset) => {
    if (!seoSlugs.has(asset.slug)) return false;
    if (!isValidSeoPayload(asset.slug)) return false;
    if (!isPubliclyAvailableAsset(asset)) return false;

    return true;
  });
}

export function getPublicAssetBySlug(slug: string): PublicAsset | null {
  return getPublicAssets().find((asset) => asset.slug === slug) ?? null;
}

export function getPublicAssetsByTopic(topicId: string): PublicAsset[] {
  return getPublicAssets().filter((asset) => asset.topicId === topicId);
}

export function getPublicTopics() {
  const publicAssets = getPublicAssets();
  const topicIds = new Set(publicAssets.map((asset) => asset.topicId));

  return topics.filter((topic) => topicIds.has(topic.id));
}