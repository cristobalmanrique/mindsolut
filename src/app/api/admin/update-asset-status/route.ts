import { NextRequest, NextResponse } from "next/server";
import { assets } from "@/data/assets";
import { statusList } from "@/data/status";
import { transitionAssetEditorialStatus } from "@/lib/editorial/assetWorkflow";
import { getEditorialStatusResponseMap } from "@/lib/editorial/editorialStatus";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const assetId = body?.assetId;
    const newStatus = body?.newStatus;

    if (!assetId || typeof assetId !== "string") {
      return NextResponse.json(
        {
          ok: false,
          message: "assetId es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (!newStatus || typeof newStatus !== "string") {
      return NextResponse.json(
        {
          ok: false,
          message: "newStatus es obligatorio.",
        },
        { status: 400 }
      );
    }

    const asset = assets.find((item) => item.id === assetId);

    if (!asset) {
      return NextResponse.json(
        {
          ok: false,
          message: `No existe un asset con id ${assetId}.`,
        },
        { status: 404 }
      );
    }

    const statusExists = statusList.some((status) => status.key === newStatus);

    if (!statusExists) {
      return NextResponse.json(
        {
          ok: false,
          message: `El estado ${newStatus} no es válido.`,
        },
        { status: 400 }
      );
    }

    const result = await transitionAssetEditorialStatus(asset, newStatus);
    const statusMap = getEditorialStatusResponseMap();

    return NextResponse.json(
      {
        ok: true,
        assetId,
        previousStatus: result.previousStatus,
        newStatus: result.nextStatus,
        message: "Estado actualizado correctamente.",
        files: result.files,
        data: statusMap,
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
            : "Error al actualizar estado editorial.",
      },
      { status: 500 }
    );
  }
}
