import fs from "fs";
import path from "path";

const SEO_PAGES_DIR = path.join(process.cwd(), "storage", "seo", "pages");
const STATUS_FILE = path.join(
  process.cwd(),
  "storage",
  "editorial",
  "assets-status.json"
);

export function ensureSeoPagesDir() {
  if (!fs.existsSync(SEO_PAGES_DIR)) {
    fs.mkdirSync(SEO_PAGES_DIR, { recursive: true });
  }
}

export function ensureStatusFile() {
  const dir = path.dirname(STATUS_FILE);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(STATUS_FILE)) {
    fs.writeFileSync(STATUS_FILE, "{}", "utf-8");
  }
}

export function getSeoPageFilePath(slug: string) {
  return path.join(SEO_PAGES_DIR, `${slug}.json`);
}

export function writeSeoPage(slug: string, data: unknown) {
  ensureSeoPagesDir();
  fs.writeFileSync(
    getSeoPageFilePath(slug),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

export function readSeoPage(slug: string) {
  const filePath = getSeoPageFilePath(slug);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function seoPageExists(slug: string) {
  return fs.existsSync(getSeoPageFilePath(slug));
}

export function readPersistedStatuses(): Record<string, string> {
  ensureStatusFile();
  const raw = fs.readFileSync(STATUS_FILE, "utf-8");
  return JSON.parse(raw);
}

export function updateAssetStatus(assetId: string, newStatus: string) {
  const data = readPersistedStatuses();
  data[assetId] = newStatus;
  fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2), "utf-8");
}