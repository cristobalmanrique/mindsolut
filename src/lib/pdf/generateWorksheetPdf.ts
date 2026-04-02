import type { AssetItem } from "@/types/content";
import type { MathOperation } from "@/lib/pdf/types";
import { generateWorksheetAssets } from "./generateWorksheetAssets";

export async function generateWorksheetPdf(
  asset: AssetItem,
  operation: MathOperation
): Promise<{ filePath: string }> {
  const result = await generateWorksheetAssets(asset, operation);

  return {
    filePath: result.pdfPath,
  };
}