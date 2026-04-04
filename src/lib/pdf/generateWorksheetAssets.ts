import puppeteer from "puppeteer";
import type { AssetItem } from "@/types/content";
import type { MathOperation } from "@/lib/pdf/types";
import { buildExerciseSet } from "@/lib/pdf/buildExerciseSet";
import {
  ensureEditorialStorageDirs,
  getDraftPdfAbsolutePath,
  getStoragePreviewAbsolutePath,
} from "@/lib/editorial/assetStorage";
import { renderWorksheetHtml } from "@/lib/pdf/templates/renderWorksheetHtml";

export async function generateWorksheetAssets(
  asset: AssetItem,
  operation: MathOperation
): Promise<{
  pdfPath: string;
  previewPath: string;
}> {
  ensureEditorialStorageDirs();

  const pdfPath = getDraftPdfAbsolutePath(asset);
  const previewPath = getStoragePreviewAbsolutePath(asset);

  const worksheet = buildExerciseSet(asset, operation);
  const html = renderWorksheetHtml(asset, worksheet);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 900,
      height: 1200,
      deviceScaleFactor: 1.2,
    });

    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.pdf({
      path: pdfPath,
      width: "210mm",
      height: "297mm",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
      preferCSSPageSize: true,
    });

    await page.screenshot({
      path: previewPath,
      type: "jpeg",
      quality: 88,
      fullPage: false,
    });

    return {
      pdfPath,
      previewPath,
    };
  } finally {
    await browser.close();
  }
}
