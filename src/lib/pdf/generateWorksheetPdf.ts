import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import type { AssetItem } from "@/types/content";
import type { WorksheetVariant } from "@/lib/pdf/types";
import { detectVariant } from "@/lib/pdf/detectVariant";
import { buildExercises } from "@/lib/pdf/buildExercises";

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

function getWorksheetHtml(
  asset: AssetItem,
  exercises: string[],
  variant: WorksheetVariant
): string {
  const isVertical = variant === "vertical";
  const isVisual = variant === "visual";
  const isCompleteResult = variant === "complete-result";
  const isMissingNumber = variant === "missing-number";

  const gridClass = isVertical ? "grid-vertical" : "grid";
  const exerciseClass = isVisual ? "exercise exercise-visual" : "exercise";
  const assetUrl = `https://mindsolut.com/recurso/${asset.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
    assetUrl
  )}`;

  let instruction =
    "Resuelve las siguientes sumas y escribe el resultado correctamente.";

  if (isCompleteResult) {
    instruction = "Observa cada suma y completa el resultado que falta.";
  }

  if (isMissingNumber) {
    instruction = "Completa el número que falta en cada suma.";
  }

  if (isVisual) {
    instruction =
      "Observa los dibujos y resuelve las siguientes sumas con apoyo visual.";
  }

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

.complete-box {
  display: inline-block;
  min-width: 80px;
  text-align: right;
  font-size: 22px;
  letter-spacing: 1px;
  border-bottom: 2px solid #334155;
  padding-bottom: 2px;
}
.exercise-index {
  font-size: 12px;
  color: #64748b;
  margin-right: 6px;
  font-weight: normal;
}

.vertical-exercise {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.vertical-numbering {
  min-width: 24px;
  font-size: 20px;
  padding-top: 2px;
}

.vertical-stack {
  min-width: 70px;
}

.vertical-line {
  text-align: right;
  font-size: 22px;
  line-height: 1.4;
  white-space: pre;
}

.vertical-separator {
  border-bottom: 2px solid #334155;
  margin: 4px 0 6px 0;
}

.vertical-answer {
  height: 26px;
}

.vertical-answer-line {
  text-align: right;
  font-size: 22px;
  letter-spacing: 1px;
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

        .grid-vertical {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px 20px;
        }

        .exercise {
          font-size: 22px;
          padding: 10px 0;
          border-bottom: 1px dashed #cbd5e1;
          min-height: 42px;
        }

        .exercise-visual {
          font-size: 24px;
          letter-spacing: 0.5px;
        }

        .footer {
          margin-top: 32px;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .footer-text {
          max-width: 70%;
          line-height: 1.5;
        }

        .qr {
          width: 90px;
          height: 90px;
          object-fit: contain;
        }

        .link {
          font-weight: bold;
          color: #0f172a;
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
          ${instruction}
        </div>

        <div class="${gridClass}">
          ${exercises
            .map((item) => `<div class="${exerciseClass}">${item}</div>`)
            .join("")}
        </div>

        <div class="footer">
          <div class="footer-content">
            <div class="footer-text">
              <div>Mindsolut · Recurso educativo imprimible · ${asset.id}</div>
              <div class="link">Más recursos en: ${assetUrl}</div>
            </div>
            <img class="qr" src="${qrUrl}" alt="QR Mindsolut" />
          </div>
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

  const variant = detectVariant(asset);
  const exercises = buildExercises(variant, asset);
  const html = getWorksheetHtml(asset, exercises, variant);

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