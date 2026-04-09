import fs from "fs";
import path from "path";
import { assets } from "@/data/assets";
import type { AssetItem } from "@/types/content";
import type { EditorialAssetStatus } from "./assetStorage";

export type EditorialStatusRecord = {
  assetId: string;
  slug?: string;
  status: EditorialAssetStatus;
  updatedAt?: string;
};

const EDITORIAL_STATUS_FILE = path.join(
  process.cwd(),
  "storage",
  "editorial",
  "assets-status.json"
);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getAssetSlug(assetId: string): string | undefined {
  return assets.find((asset) => asset.id === assetId)?.slug;
}

function normalizeRecord(
  assetId: string,
  value: unknown
): EditorialStatusRecord | null {
  if (typeof value === "string") {
    return {
      assetId,
      slug: getAssetSlug(assetId),
      status: value as EditorialAssetStatus,
    };
  }

  if (!isObject(value) || typeof value.status !== "string") {
    return null;
  }

  return {
    assetId,
    slug: typeof value.slug === "string" ? value.slug : getAssetSlug(assetId),
    status: value.status as EditorialAssetStatus,
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : undefined,
  };
}

function normalizeRawStatusFile(raw: unknown): EditorialStatusRecord[] {
  if (Array.isArray(raw)) {
    const records: EditorialStatusRecord[] = [];

    for (const item of raw) {
      if (
        !isObject(item) ||
        typeof item.assetId !== "string" ||
        typeof item.status !== "string"
      ) {
        continue;
      }

      records.push({
        assetId: item.assetId,
        slug:
          typeof item.slug === "string"
            ? item.slug
            : getAssetSlug(item.assetId),
        status: item.status as EditorialAssetStatus,
        updatedAt:
          typeof item.updatedAt === "string" ? item.updatedAt : undefined,
      });
    }

    return records;
  }

  if (isObject(raw) && Array.isArray(raw.assets)) {
    return normalizeRawStatusFile(raw.assets);
  }

  if (isObject(raw)) {
    const records: EditorialStatusRecord[] = [];

    for (const [assetId, value] of Object.entries(raw)) {
      const record = normalizeRecord(assetId, value);

      if (record) {
        records.push(record);
      }
    }

    return records;
  }

  return [];
}

export function readEditorialStatusRecords(): EditorialStatusRecord[] {
  if (!fs.existsSync(EDITORIAL_STATUS_FILE)) {
    return [];
  }

  const raw = fs.readFileSync(EDITORIAL_STATUS_FILE, "utf-8");
  return normalizeRawStatusFile(JSON.parse(raw));
}

export function getEditorialStatusMap(): Map<string, EditorialStatusRecord> {
  return new Map(
    readEditorialStatusRecords().map((record) => [record.assetId, record])
  );
}

export function getEditorialStatusResponseMap(): Record<
  string,
  EditorialAssetStatus
> {
  return Object.fromEntries(
    readEditorialStatusRecords().map((record) => [record.assetId, record.status])
  );
}

export function getAssetEditorialStatus(
  asset: Pick<AssetItem, "id" | "status">
): EditorialAssetStatus {
  return (
    getEditorialStatusMap().get(asset.id)?.status ??
    (asset.status as EditorialAssetStatus)
  );
}

export function writeEditorialStatusRecords(records: EditorialStatusRecord[]) {
  fs.mkdirSync(path.dirname(EDITORIAL_STATUS_FILE), { recursive: true });

  const sorted = [...records].sort((a, b) => a.assetId.localeCompare(b.assetId));

  fs.writeFileSync(
    EDITORIAL_STATUS_FILE,
    JSON.stringify({ assets: sorted }, null, 2),
    "utf-8"
  );
}

export function updateAssetEditorialStatus(
  asset: Pick<AssetItem, "id" | "slug" | "status">,
  status: EditorialAssetStatus
) {
  const records = readEditorialStatusRecords();
  const now = new Date().toISOString();

  const nextRecord: EditorialStatusRecord = {
    assetId: asset.id,
    slug: asset.slug,
    status,
    updatedAt: now,
  };

  const nextRecords = records.filter((record) => record.assetId !== asset.id);
  nextRecords.push(nextRecord);

  writeEditorialStatusRecords(nextRecords);

  return nextRecord;
}

export function removeAssetEditorialStatus(assetId: string) {
  const records = readEditorialStatusRecords();
  const nextRecords = records.filter((record) => record.assetId !== assetId);

  if (nextRecords.length === records.length) {
    return false;
  }

  writeEditorialStatusRecords(nextRecords);
  return true;
}