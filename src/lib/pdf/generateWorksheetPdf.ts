import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import type { AssetItem } from "@/types/content";

type MathOperation = "sum";

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getPublicAbsolutePath(relativePublicPath: string): string {
  const cleanPath = relativePublicPath.replace(/^\/+/, "");
  return path.join(process.cwd(), "public", cleanPath);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildExercises(operation: MathOperation, total: number): string[] {
  const exercises: string[] = [];

  for (let i = 0; i < total; i++) {
    if (operation === "sum") {
      const a = randomInt(0, 20);
      const b = randomInt(0, 20);
      exercises.push(`${a} + ${b} = ______`);
    }
  }

  return exercises;
}

function getWorksheetHtml(asset: AssetItem, exercises: string[]): string {
  return `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>${asset.title}</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #111827;
          margin: 0;
          padding: 32px;
        }

        .sheet {
          max-width: 800px;
          margin: 0 auto;
        }

        .header {
          border-bottom: 2px solid #cbd5e1;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }

        .title {
          font-size: 26px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .meta {
          font-size: 14px;
          color: #475569;
          margin-bottom: 12px;
        }

        .student-row {
          display: flex;
          gap: 24px;
          font-size: 14px;
          margin-top: 12px;
        }

        .student-field {
          flex: 1;
          border-bottom: 1px solid #94a3b8;
          padding-bottom: 4px;
        }

        .instruction {
          font-size: 16px;
          margin-bottom: 24px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px 28px;
        }

        .exercise {
          font-size: 22px;
          padding: 10px 0;
          border-bottom: 1px dashed #cbd5e1;
        }

        .footer {
          margin-top: 32px;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="header">
          <h1 class="title">${asset.title}</h1>
          <div class="meta">Matemáticas · 1º primaria · Recurso imprimible</div>
          <div class="student-row">
            <div class="student-field">Nombre:</div>
            <div class="student-field">Fecha:</div>
          </div>
        </div>

        <div class="instruction">
          Resuelve las siguientes sumas y escribe el resultado correctamente.
        </div>

        <div class="grid">
          ${exercises.map((item) => `<div class="exercise">${item}</div>`).join("")}
        </div>

        <div class="footer">
          Mindsolut · Recurso educativo imprimible · ${asset.id}
        </div>
      </div>
    </body>
  </html>
  `;
}

export async function generateWorksheetPdf(
  asset: AssetItem,
  operation: MathOperation = "sum"
): Promise<{ filePath: string }> {
  const absoluteFilePath = getPublicAbsolutePath(asset.fileUrl);
  ensureDir(path.dirname(absoluteFilePath));

  const exercises = buildExercises(operation, 20);
  const html = getWorksheetHtml(asset, exercises);

  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.pdf({
      path: absoluteFilePath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    return { filePath: absoluteFilePath };
  } finally {
    await browser.close();
  }
}