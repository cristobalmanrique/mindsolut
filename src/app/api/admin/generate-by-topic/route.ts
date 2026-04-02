import { NextRequest, NextResponse } from "next/server";
import { assets } from "@/data/assets";
import { generateWorksheetAssets } from "@/lib/pdf/generateWorksheetAssets";

export const runtime = "nodejs";

type MathOperation = "sum" | "subtraction" | "multiplication";

function detectOperationFromTopicId(topicId: string): MathOperation {
  if (topicId.includes("restas")) {
    return "subtraction";
  }

  if (
    topicId.includes("tablas-multiplicar") ||
    topicId.includes("multiplicar") ||
    topicId.includes("multiplicacion")
  ) {
    return "multiplication";
  }

  return "sum";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const topicId = body?.topicId;

    if (!topicId || typeof topicId !== "string") {
      return NextResponse.json(
        {
          ok: false,
          message: "Debes enviar un topicId válido.",
          generatedCount: 0,
          skippedCount: 0,
          failedCount: 0,
          files: [],
          previews: [],
          skipped: [],
          failed: [],
        },
        { status: 400 }
      );
    }

    const topicAssets = assets.filter(
      (asset) => asset.topicId === topicId && asset.type === "worksheet"
    );

    if (topicAssets.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: `No se encontraron assets tipo worksheet para ${topicId}.`,
          generatedCount: 0,
          skippedCount: 0,
          failedCount: 0,
          files: [],
          previews: [],
          skipped: [],
          failed: [],
        },
        { status: 404 }
      );
    }

    const operation = detectOperationFromTopicId(topicId);

    const files: string[] = [];
    const previews: string[] = [];
    const skipped: { file: string; reason: string }[] = [];
    const failed: { file: string; reason: string }[] = [];

    for (const asset of topicAssets) {
      try {
        if (asset.status === "archived") {
          skipped.push({
            file: asset.fileUrl,
            reason: "Asset archivado",
          });
          continue;
        }

        await generateWorksheetAssets(asset, operation);

        files.push(asset.fileUrl);
        previews.push(asset.previewImage);
      } catch (error) {
        failed.push({
          file: asset.fileUrl,
          reason: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      topicId,
      operation,
      generatedCount: files.length,
      skippedCount: skipped.length,
      failedCount: failed.length,
      files,
      previews,
      skipped,
      failed,
      message: `Generación de PDFs y previews completada para ${topicId}.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Error interno al generar assets por topic.",
        generatedCount: 0,
        skippedCount: 0,
        failedCount: 0,
        files: [],
        previews: [],
        skipped: [],
        failed: [],
      },
      { status: 500 }
    );
  }
}