import fs from "fs";
import path from "path";
import type { AssetItem } from "@/types/content";

export const STORAGE_ROOT = path.join(process.cwd(), "storage");
export const STORAGE_DRAFTS_DIR = path.join(STORAGE_ROOT, "drafts");
export const STORAGE_REVIEW_DIR = path.join(STORAGE_ROOT, "review");
export const STORAGE_PREVIEWS_DIR = path.join(STORAGE_ROOT, "previews");
export const PUBLIC_DOWNLOADS_DIR = path.join(process.cwd(), "public", "downloads");
export const PUBLIC_PREVIEWS_DIR = path.join(process.cwd(), "public", "previews");

export type EditorialAssetStatus =
  | "draft"
  | "review"
  | "seo-optimized"
  | "ready"
  | "archived";

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getFileNameFromPublicUrl(publicUrl: string) {
  return path.basename(publicUrl.replace(/^\/+/, ""));
}

export function getAssetPdfFileName(asset: Pick<AssetItem, "fileUrl">) {
  return getFileNameFromPublicUrl(asset.fileUrl);
}

export function getAssetPreviewFileName(asset: Pick<AssetItem, "previewImage">) {
  return getFileNameFromPublicUrl(asset.previewImage);
}

export function getDraftPdfAbsolutePath(asset: Pick<AssetItem, "fileUrl">) {
  return path.join(STORAGE_DRAFTS_DIR, getAssetPdfFileName(asset));
}

export function getReviewPdfAbsolutePath(asset: Pick<AssetItem, "fileUrl">) {
  return path.join(STORAGE_REVIEW_DIR, getAssetPdfFileName(asset));
}

export function getPublicPdfAbsolutePath(asset: Pick<AssetItem, "fileUrl">) {
  return path.join(PUBLIC_DOWNLOADS_DIR, getAssetPdfFileName(asset));
}

export function getStoragePreviewAbsolutePath(asset: Pick<AssetItem, "previewImage">) {
  return path.join(STORAGE_PREVIEWS_DIR, getAssetPreviewFileName(asset));
}

export function getPublicPreviewAbsolutePath(asset: Pick<AssetItem, "previewImage">) {
  return path.join(PUBLIC_PREVIEWS_DIR, getAssetPreviewFileName(asset));
}

export function ensureEditorialStorageDirs() {
  ensureDir(STORAGE_DRAFTS_DIR);
  ensureDir(STORAGE_REVIEW_DIR);
  ensureDir(STORAGE_PREVIEWS_DIR);
  ensureDir(PUBLIC_DOWNLOADS_DIR);
  ensureDir(PUBLIC_PREVIEWS_DIR);
}

export function ensureParentDir(filePath: string) {
  ensureDir(path.dirname(filePath));
}

/**
 * Movimiento seguro de archivos:
 * - no rompe si el destino existe
 * - evita errores de rename entre dispositivos
 * - mantiene atomicidad básica
 */
export function moveFileSafe(sourcePath: string, targetPath: string) {
  if (!fs.existsSync(sourcePath)) {
    return false;
  }

  ensureParentDir(targetPath);

  // Si ya existe destino → eliminar para evitar conflictos
  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
  }

  try {
    fs.renameSync(sourcePath, targetPath);
    return true;
  } catch {
    // fallback cross-device (muy importante en Vercel/Docker)
    fs.copyFileSync(sourcePath, targetPath);
    fs.unlinkSync(sourcePath);
    return true;
  }
}

export function removeFileIfExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  fs.unlinkSync(filePath);
  return true;
}

export function fileExists(filePath: string) {
  return fs.existsSync(filePath);
}