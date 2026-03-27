import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    job: "generate-previews",
    message: "Generación de previews disparada (stub listo para conectar).",
  });
}
