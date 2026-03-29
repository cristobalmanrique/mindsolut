import { NextRequest, NextResponse } from "next/server";
import { assets } from "@/data/assets";
import { generateWorksheetPdf } from "@/lib/pdf/generateWorksheetPdf";

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
        },
        { status: 404 }
      );
    }

    const operation = detectOperationFromTopicId(topicId);

    const files: string[] = [];
    let generated = 0;
    let skipped = 0;

    for (const asset of topicAssets) {
      try {
        await generateWorksheetPdf(asset, operation);
        files.push(asset.fileUrl);
        generated++;
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({
      ok: true,
      topicId,
      operation,
      generated,
      skipped,
      files,
      message: `Generación completada para ${topicId}.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Error interno al generar PDFs por topic.",
      },
      { status: 500 }
    );
  }
}