import fs from "fs";
import path from "path";

type SlugLike = {
  slug: string;
};

const ROOT_DIR = process.cwd();

const STORAGE_DIR = path.join(ROOT_DIR, "storage");
const EDITORIAL_DIR = path.join(STORAGE_DIR, "editorial");
const SEO_DIR = path.join(STORAGE_DIR, "seo");
const BUNDLES_SEO_DIR = path.join(SEO_DIR, "bundles");
const REVIEW_DIR = path.join(STORAGE_DIR, "review");

const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const COVERS_DIR = path.join(PUBLIC_DIR, "covers");
const PREVIEWS_DIR = path.join(PUBLIC_DIR, "previews");
const PACKS_DIR = path.join(PUBLIC_DIR, "downloads", "packs");

/**
 * Nombre canónico usado por los nuevos archivos
 */
export const BUNDLE_STATUS_FILE = path.join(
  EDITORIAL_DIR,
  "bundles-status.json"
);

/**
 * Alias por compatibilidad con nombres anteriores
 */
export const BUNDLE_EDITORIAL_STATUS_FILE = BUNDLE_STATUS_FILE;

export function ensureBundleStorageDirs() {
  [
    EDITORIAL_DIR,
    BUNDLES_SEO_DIR,
    COVERS_DIR,
    PREVIEWS_DIR,
    PACKS_DIR,
  ].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

  if (!fs.existsSync(BUNDLE_STATUS_FILE)) {
    fs.writeFileSync(BUNDLE_STATUS_FILE, "{}", "utf8");
  }
}

export function getBundleCoverAbsolutePath(slug: string) {
  return path.join(COVERS_DIR, `${slug}.jpg`);
}

export function getBundlePreviewAbsolutePath(slug: string) {
  return path.join(PREVIEWS_DIR, `${slug}.jpg`);
}

export function getBundlePublicPdfAbsolutePath(slug: string) {
  return path.join(PACKS_DIR, `${slug}.pdf`);
}

export function getBundleDownloadAbsolutePath(slug: string) {
  return getBundlePublicPdfAbsolutePath(slug);
}

export function getBundlePdfAbsolutePath(slug: string) {
  return getBundlePublicPdfAbsolutePath(slug);
}

export function getBundlePublicPdfRelativeUrl(slug: string) {
  return `/downloads/packs/${slug}.pdf`;
}

export function getBundlePdfPublicUrl(slug: string) {
  return getBundlePublicPdfRelativeUrl(slug);
}

export function getBundleCoverPublicUrl(slug: string) {
  return `/covers/${slug}.jpg`;
}

export function getBundlePreviewPublicUrl(slug: string) {
  return `/previews/${slug}.jpg`;
}

export function getBundleSeoAbsolutePath(slug: string) {
  return path.join(BUNDLES_SEO_DIR, `${slug}.json`);
}

export function getBundleSeoPayloadAbsolutePath(slug: string) {
  return getBundleSeoAbsolutePath(slug);
}

export function getReviewAssetPdfAbsolutePath(asset: SlugLike) {
  return path.join(REVIEW_DIR, `${asset.slug}.pdf`);
}

export function getReviewPdfAbsolutePathForAsset(asset: SlugLike) {
  return getReviewAssetPdfAbsolutePath(asset);
}