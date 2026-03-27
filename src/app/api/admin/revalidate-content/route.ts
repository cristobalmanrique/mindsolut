import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    job: "revalidate-content",
    message: "Revalidación de contenido ejecutada (stub listo para conectar).",
  });
}
