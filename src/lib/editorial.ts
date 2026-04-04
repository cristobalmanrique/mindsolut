import { statusList } from "@/data/status";

export function getStatusIndex(statusKey: string): number {
  return statusList.findIndex((s) => s.key === statusKey);
}

export function getNextStatus(statusKey: string): string | null {
  const index = getStatusIndex(statusKey);

  if (index === -1 || index === statusList.length - 1) {
    return null;
  }

  return statusList[index + 1].key;
}

export function getPreviousStatus(statusKey: string): string | null {
  const index = getStatusIndex(statusKey);

  if (index <= 0) {
    return null;
  }

  return statusList[index - 1].key;
}

export function isValidStatus(statusKey: string): boolean {
  return statusList.some((s) => s.key === statusKey);
}