import type { AssetItem } from "@/types/content";
import type { WorksheetVariant } from "./types";

export function detectVariant(asset: AssetItem): WorksheetVariant {
  const slug = asset.slug;

  if (slug.includes("con-objetos") || slug.includes("con-dibujos")) {
    return "objects";
  }

  if (slug.includes("juego")) {
    if (slug.includes("secuencia") || slug.includes("serie")) {
      return "game-sequence";
    }

    if (slug.includes("rompecabezas")) {
      return "game-puzzle";
    }

    return "game-match";
  }

  return "standard";
}