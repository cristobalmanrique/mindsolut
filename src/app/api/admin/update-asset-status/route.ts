import { NextRequest, NextResponse } from "next/server";
import { assets } from "@/data/assets";
import { statusList } from "@/data/status";
import { transitionAssetEditorialStatus } from "@/lib/editorial/assetWorkflow";
import { getEditorialStatusResponseMap } from "@/lib/editorial/editorialStatus";
import type { EditorialAssetStatus } from "@/lib/editorial/editorialStatus";

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

    if (!newStatus || typeof newStatus !== "string" || !statusList.some((status) => status.key === newStatus)) {
      return NextResponse.json(
        {
          ok: false,
          message: `El estado ${newStatus} no es válido.`,
        },
        { status: 400 }
      );
    }

    // Convertir newStatus a EditorialAssetStatus
    const validStatuses: EditorialAssetStatus[] = ["draft", "review", "ready"];
    if (!validStatuses.includes(newStatus as EditorialAssetStatus)) {
      return NextResponse.json(
        {
          ok: false,
          message: `El estado ${newStatus} no es válido.`,
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

    // Forzar la conversión de newStatus a EditorialAssetStatus
    const status: EditorialAssetStatus = newStatus as EditorialAssetStatus;
    const result = await transitionAssetEditorialStatus(asset, status);
    const statusMap = getEditorialStatusResponseMap();

    // Ajuste: eliminamos 'files' del retorno
    return NextResponse.json(
      {
        ok: true,
        assetId,
        previousStatus: result.previousStatus,
        newStatus: result.nextStatus,
        message: "Estado actualizado correctamente.",
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