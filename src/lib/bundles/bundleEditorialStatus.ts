import fs from "fs";
import { bundles } from "@/data/bundles";
import {
  BUNDLE_STATUS_FILE,
  ensureBundleStorageDirs,
} from "@/lib/bundles/bundleStorage";
import type {
  BundleEditorialStatusValue,
  BundleStatusMap,
  BundleStatusRecord,
} from "@/lib/bundles/types";

type SetBundleStatusInput = {
  bundleId?: string;
  slug?: string;
  status: BundleEditorialStatusValue;
  notes?: string;
};

function readStatusMap(): BundleStatusMap {
  ensureBundleStorageDirs();

  if (!fs.existsSync(BUNDLE_STATUS_FILE)) {
    return {};
  }

  const raw = fs.readFileSync(BUNDLE_STATUS_FILE, "utf8").trim();

  if (!raw) {
    return {};
  }

  return JSON.parse(raw) as BundleStatusMap;
}

function writeStatusMap(map: BundleStatusMap) {
  ensureBundleStorageDirs();
  fs.writeFileSync(BUNDLE_STATUS_FILE, JSON.stringify(map, null, 2), "utf8");
}

function findBundle(bundleId?: string, slug?: string) {
  return (
    bundles.find((bundle) => {
      if (bundleId && bundle.id === bundleId) return true;
      if (slug && bundle.slug === slug) return true;
      return false;
    }) ?? null
  );
}

export function getAllBundleStatuses(): BundleStatusRecord[] {
  const map = readStatusMap();
  return Object.values(map);
}

export function getBundleStatusByBundleId(
  bundleId: string
): BundleStatusRecord | null {
  const map = readStatusMap();
  return map[bundleId] ?? null;
}

export function getBundleStatusBySlug(slug: string): BundleStatusRecord | null {
  const record = getAllBundleStatuses().find((item) => item.slug === slug);
  return record ?? null;
}

export function getBundleEditorialStatus(
  bundleIdOrSlug: string
): BundleStatusRecord | null {
  return (
    getBundleStatusByBundleId(bundleIdOrSlug) ??
    getBundleStatusBySlug(bundleIdOrSlug)
  );
}

export function setBundleStatus(
  input: SetBundleStatusInput
): BundleStatusRecord {
  const bundle = findBundle(input.bundleId, input.slug);

  if (!bundle) {
    throw new Error(
      `Bundle no encontrado para actualizar estado: ${
        input.bundleId ?? input.slug
      }`
    );
  }

  const current = getBundleStatusByBundleId(bundle.id);
  const now = new Date().toISOString();

  const next: BundleStatusRecord = {
    bundleId: bundle.id,
    slug: bundle.slug,
    status: input.status,
    topicIds: bundle.topicIds ?? [],
    updatedAt: now,
    notes: input.notes ?? current?.notes,
    generatedAt: current?.generatedAt,
    seoGeneratedAt: current?.seoGeneratedAt,
    readyAt: current?.readyAt,
  };

  if (input.status === "review" && !next.generatedAt) {
    next.generatedAt = now;
  }

  if (input.status === "seo-optimized") {
    next.seoGeneratedAt = now;
  }

  if (input.status === "ready") {
    next.readyAt = now;
  }

  const map = readStatusMap();
  map[bundle.id] = next;
  writeStatusMap(map);

  return next;
}

export function updateBundleEditorialStatus(
  input: SetBundleStatusInput
): BundleStatusRecord {
  return setBundleStatus(input);
}

export function removeBundleStatus(bundleIdOrSlug: string) {
  const map = readStatusMap();
  const direct = map[bundleIdOrSlug];

  if (direct) {
    delete map[bundleIdOrSlug];
    writeStatusMap(map);
    return;
  }

  const found = Object.entries(map).find(
    ([, value]) => value.slug === bundleIdOrSlug
  );

  if (found) {
    delete map[found[0]];
    writeStatusMap(map);
  }
}

export function removeBundleEditorialStatus(bundleIdOrSlug: string) {
  removeBundleStatus(bundleIdOrSlug);
}