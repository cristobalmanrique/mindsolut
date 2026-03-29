import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { assets } from "@/data/assets";
import { statusList } from "@/data/status";

const STATUS_FILE = path.join(
  process.cwd(),
  "storage",
  "editorial",
  "assets-status.json"
);

function ensureStatusFile() {
  const dir = path.dirname(STATUS_FILE);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(STATUS_FILE)) {
    fs.writeFileSync(STATUS_FILE, "{}", "utf-8");
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureStatusFile();

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

    const assetExists = assets.some((asset) => asset.id === assetId);
    if (!assetExists) {
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

    const raw = fs.readFileSync(STATUS_FILE, "utf-8");
    const data = JSON.parse(raw);

    data[assetId] = newStatus;

    fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({
      ok: true,
      assetId,
      newStatus,
      message: "Estado actualizado correctamente.",
    });
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