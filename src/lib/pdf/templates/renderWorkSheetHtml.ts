import type { AssetItem } from "@/types/content";
import type { WorksheetBuildResult } from "@/lib/pdf/types";
import { renderStandardTemplate } from "./standardTemplate";
import { renderObjectsTemplate } from "./objectsTemplate";
import { renderGameTemplate } from "./gameTemplate";


export function renderWorksheetHtml(
  asset: AssetItem,
  worksheet: WorksheetBuildResult
): string {
  switch (worksheet.variant) {
    case "objects":
      return renderObjectsTemplate(asset, worksheet);
    case "game-sequence":
    case "game-match":
    case "game-puzzle":
      return renderGameTemplate(asset, worksheet);

    default:
      return renderStandardTemplate(asset, worksheet);
  }
}