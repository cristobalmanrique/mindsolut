import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import type { AssetItem } from "@/types/content";
import { buildExerciseSet } from "@/lib/pdf/buildExerciseSet";
import { renderWorksheetHtml } from "@/lib/pdf/templates/renderWorksheetHtml";
import { ensureDir, getPublicAbsolutePath } from "./previewUtils";

type MathOperation = "sum" | "subtraction" | "multiplication";

type PreviewResult = {
  ok: boolean;
  previewPath: string;
  skipped?: boolean;
  reason?: string;
};

function detectOperationFromTopicId(topicId: string): MathOperation {
  if (topicId.includes("restas")) return "subtraction";
  if (
    topicId.includes("tablas-multiplicar") ||
    topicId.includes("multiplicar") ||
    topicId.includes("multiplicacion")
  ) {
    return "multiplication";
  }
  return "sum";
}

export async function generatePreviewFromHtml(
  asset: AssetItem
): Promise<PreviewResult> {
  const previewPath = getPublicAbsolutePath(asset.previewImage);

  if (asset.status === "archived") {
    return {
      ok: true,
      previewPath,
      skipped: true,
      reason: "Asset archivado",
    };
  }

  try {
    ensureDir(path.dirname(previewPath));

    const operation = detectOperationFromTopicId(asset.topicId);
    const worksheet = buildExerciseSet(asset, operation);
    const html = renderWorksheetHtml(asset, worksheet);

    const browser = await puppeteer.launch({
      headless: true,
    });

    try {
      const page = await browser.newPage();

      await page.setViewport({
        width: 900,
        height: 1200,
        deviceScaleFactor: 1.2,
      });

      await page.setContent(html, { waitUntil: "networkidle0" });

      await page.screenshot({
        path: previewPath,
        type: "jpeg",
        quality: 88,
        fullPage: false,
      });

      return {
        ok: true,
        previewPath,
      };
    } finally {
      await browser.close();
    }
  } catch (error) {
    return {
      ok: false,
      previewPath,
      reason:
        error instanceof Error
          ? error.message
          : "Error al generar preview desde HTML",
    };
  }
}