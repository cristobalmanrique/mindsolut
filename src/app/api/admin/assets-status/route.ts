import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

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

export async function GET() {
  try {
    ensureStatusFile();

    const raw = fs.readFileSync(STATUS_FILE, "utf-8");
    const data = JSON.parse(raw);

    return NextResponse.json({
      ok: true,
      data,
    });
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