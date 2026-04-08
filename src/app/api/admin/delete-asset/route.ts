import { NextRequest, NextResponse } from "next/server";
import { deleteAssetAndFiles } from "@/lib/editorial/deleteAsset";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const assetId = body?.assetId;

    if (!assetId || typeof assetId !== "string") {
      return NextResponse.json(
        {
          ok: false,
          message: "assetId es obligatorio.",
        },
        { status: 400 }
      );
    }

    const result = deleteAssetAndFiles(assetId);

    return NextResponse.json(
      {
        ok: true,
        message: "Asset eliminado correctamente.",
        data: result,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Error al eliminar el asset.",
      },
      { status: 500 }
    );
  }
}
