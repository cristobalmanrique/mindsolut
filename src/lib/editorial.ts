import type { AssetItem, StatusKey } from "@/types/content";

const allowedTransitions: Record<StatusKey, StatusKey[]> = {
  draft: ["review"],
  review: ["seo-optimized"],
  "seo-optimized": ["ready"],
  ready: ["published"],
  published: ["optimized", "archived"],
  optimized: ["archived"],
  archived: [],
};

export function canTransition(from: StatusKey, to: StatusKey): boolean {
  return allowedTransitions[from].includes(to);
}

export function getNextStatuses(from: StatusKey): StatusKey[] {
  return allowedTransitions[from];
}

export function changeStatus(asset: AssetItem, newStatus: StatusKey): AssetItem {
  if (!canTransition(asset.status, newStatus)) {
    throw new Error(
      `Transición no permitida: ${asset.status} -> ${newStatus}`
    );
  }

  return {
    ...asset,
    status: newStatus,
  };
}
