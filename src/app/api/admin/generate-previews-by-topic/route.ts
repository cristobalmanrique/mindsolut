import { NextRequest, NextResponse } from "next/server";
import { assets } from "@/data/assets";
import { generateWorksheetAssets } from "@/lib/pdf/generateWorksheetAssets";

export const runtime = "nodejs";

type FailedItem = {
  file: string;
  reason: string;
};

type MathOperation = "sum" | "subtraction" | "multiplication";

function detectOperationFromTopicId(topicId: string): MathOperation {
  if (topicId.includes("restas")) return "subtraction";

  if (
    topicId.includes("multiplicar") ||
    topicId.includes("multiplicacion") ||
    topicId.includes("tablas")
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
          generated: [],
          skipped: [],
          failed: [],
        },
        { status: 400 }
      );
    }

    const topicAssets = assets.filter(
      (asset) =>
        asset.topicId === topicId &&
        asset.type === "worksheet" &&
        asset.status !== "archived"
    );

    if (topicAssets.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: `No se encontraron assets válidos para ${topicId}.`,
          generatedCount: 0,
          skippedCount: 0,
          failedCount: 0,
          generated: [],
          skipped: [],
          failed: [],
        },
        { status: 404 }
      );
    }

    const operation = detectOperationFromTopicId(topicId);

    const generated: string[] = [];
    const skipped: FailedItem[] = [];
    const failed: FailedItem[] = [];

    for (const asset of topicAssets) {
      try {
        if (!asset.previewImage || !asset.fileUrl) {
          skipped.push({
            file: asset.slug,
            reason: "Falta previewImage o fileUrl",
          });
          continue;
        }

        await generateWorksheetAssets(asset, operation);

        generated.push(asset.previewImage);
      } catch (error) {
        failed.push({
          file: asset.previewImage,
          reason: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      topicId,
      generatedCount: generated.length,
      skippedCount: skipped.length,
      failedCount: failed.length,
      generated,
      skipped,
      failed,
      message: `Generación de previews (y PDFs) completada para ${topicId}.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Error interno generando previews.",
        generatedCount: 0,
        skippedCount: 0,
        failedCount: 0,
        generated: [],
        skipped: [],
        failed: [],
      },
      { status: 500 }
    );
  }
}