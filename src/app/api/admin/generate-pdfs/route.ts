import { NextResponse } from "next/server";

export async function POST() {
  // TODO: aquí conectarás tu script real de generación.
  // En local puedes reemplazar esto por una llamada a la lógica interna.
  return NextResponse.json({
    ok: true,
    job: "generate-pdfs",
    message: "Generación de PDFs disparada (stub listo para conectar).",
  });
}
