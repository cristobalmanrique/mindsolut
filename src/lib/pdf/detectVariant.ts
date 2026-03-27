import type { AssetItem } from "@/types/content";
import type { WorksheetVariant } from "@/lib/pdf/types";

export function detectVariant(asset: AssetItem): WorksheetVariant {
  const slug = asset.slug;

  if (slug.includes("horizontal")) return "horizontal";
  if (slug.includes("dibujos")) return "visual";
  if (slug.includes("completar-resultados")) return "complete-result";
  if (slug.includes("completar-numeros")) return "missing-number";

  return "vertical";
}