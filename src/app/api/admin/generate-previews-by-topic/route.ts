import { NextRequest, NextResponse } from "next/server";
import { assets } from "@/data/assets";
import { generatePreviewFromHtml } from "@/lib/previews/generatePreviewFromHtml";

export const runtime = "nodejs";

type FailedItem = {
  file: string;
  reason: string;
};

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

    const generated: string[] = [];
    const skipped: FailedItem[] = [];
    const failed: FailedItem[] = [];

    for (const asset of topicAssets) {
      try {
        const result = await generatePreviewFromHtml(asset);

        if (result.ok && !result.skipped) {
          generated.push(asset.previewImage);
        } else if (result.skipped) {
          skipped.push({
            file: asset.previewImage,
            reason: result.reason ?? "Saltado",
          });
        } else {
          failed.push({
            file: asset.previewImage,
            reason: result.reason ?? "Error desconocido",
          });
        }
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
      message: `Generación de previews completada para ${topicId}.`,
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