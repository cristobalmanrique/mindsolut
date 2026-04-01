import fs from "fs";
import path from "path";
import { createCanvas } from "canvas";
import type { AssetItem } from "@/types/content";
import {
  ensureDir,
  fileExists,
  getPublicAbsolutePath,
} from "./previewUtils";

type PreviewResult = {
  ok: boolean;
  previewPath: string;
  skipped?: boolean;
  reason?: string;
};

export async function generatePreview(asset: AssetItem): Promise<PreviewResult> {
  const pdfPath = getPublicAbsolutePath(asset.fileUrl);
  const previewPath = getPublicAbsolutePath(asset.previewImage);

  if (asset.status === "archived") {
    return {
      ok: true,
      previewPath,
      skipped: true,
      reason: "Asset archivado",
    };
  }

  if (!fileExists(pdfPath)) {
    return {
      ok: false,
      previewPath,
      reason: "El PDF no existe",
    };
  }

  ensureDir(path.dirname(previewPath));

  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const page = await pdf.getPage(1);

    const scale = 1.4;
    const viewport = page.getViewport({ scale });

    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height)
    );
    const context = canvas.getContext("2d");

    await page.render({
      canvasContext: context as any,
      viewport,
    }).promise;

    const buffer = canvas.toBuffer("image/jpeg", { quality: 0.9 });
    fs.writeFileSync(previewPath, buffer);

    return {
      ok: true,
      previewPath,
    };
  } catch (error) {
    return {
      ok: false,
      previewPath,
      reason:
        error instanceof Error
          ? error.message
          : "Error al renderizar preview",
    };
  }
}