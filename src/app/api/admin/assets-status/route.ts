import { NextResponse } from "next/server";
import {
  getEditorialStatusResponseMap,
  readEditorialStatusRecords,
} from "@/lib/editorial/editorialStatus";

export async function GET() {
  try {
    const records = readEditorialStatusRecords();
    const statusMap = getEditorialStatusResponseMap();

    return NextResponse.json(
      {
        ok: true,
        data: statusMap,
        records,
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
            : "Error al leer estados editoriales.",
      },
      { status: 500 }
    );
  }
}
