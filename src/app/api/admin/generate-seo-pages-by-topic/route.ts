import { NextRequest, NextResponse } from "next/server";
import { assets } from "@/data/assets";
import { generateSeoPayload } from "@/lib/seo/generateSeoPayload";
import {
  getAssetEditorialStatus,
  updateAssetEditorialStatus,
} from "@/lib/editorial/editorialStatus";
import { writeSeoPage } from "@/lib/seo/seoStorage";

export const runtime = "nodejs";

type ItemResult = {
  file: string;
  reason?: string;
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
      (asset) => asset.topicId === topicId && asset.type === "worksheet"
    );

    if (topicAssets.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: `No se encontraron assets para ${topicId}.`,
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

    const generated: ItemResult[] = [];
    const skipped: ItemResult[] = [];
    const failed: ItemResult[] = [];

    for (const asset of topicAssets) {
      try {
        const effectiveStatus = getAssetEditorialStatus(asset);

        if (effectiveStatus !== "review") {
          skipped.push({
            file: asset.slug,
            reason: `Estado actual: ${effectiveStatus}`,
          });
          continue;
        }

        if (asset.accessType === "premium") {
          skipped.push({
            file: asset.slug,
            reason: "Asset premium: no genera payload SEO.",
          });
          continue;
        }

        if (!asset.fileUrl || !asset.previewImage) {
          skipped.push({
            file: asset.slug,
            reason: "El asset no tiene fileUrl o previewImage.",
          });
          continue;
        }

        const payload = generateSeoPayload(asset);
        writeSeoPage(asset.slug, payload);
        updateAssetEditorialStatus(asset, "seo-optimized");

        generated.push({
          file: `storage/seo/pages/${asset.slug}.json`,
        });
      } catch (error) {
        failed.push({
          file: asset.slug,
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
      message:
        "Generación SEO completada. Solo se procesaron assets en review y con accessType free.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Error interno generando páginas SEO por topic.",
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
