import type { AssetItem } from "@/types/content";
import type {
  WorksheetBuildResult,
  ObjectsExercise,
  VisualObjectKey,
} from "../types";

const OBJECT_SYMBOLS: Record<VisualObjectKey, string> = {
  apple: "🍎",
  flower: "🌼",
  star: "⭐",
  umbrella: "☂️",
  chick: "🐥",
  trophy: "🏆",
  pear: "🍐",
  heart: "💛",
  scissors: "✂️",
  pencil: "✏️",
  banana: "🍌",
  mouse: "🐭",
  icecream: "🍦",
  cap: "🧢",
  moon: "🌙",
  dog: "🐶",
  bulb: "💡",
};

function repeatSymbol(symbol: string, count: number) {
  return Array.from({ length: count }, () => symbol).join(" ");
}

function renderObjectsExercise(exercise: ObjectsExercise, index: number) {
  const symbol = OBJECT_SYMBOLS[exercise.objectKey] ?? "⭐";

  return `
    <div class="objects-row">
      <div class="objects-index">(${index + 1})</div>

      <div class="objects-expression">
        <div class="objects-group">
          ${repeatSymbol(symbol, exercise.a)}
        </div>

        <div class="objects-operator">${exercise.operator}</div>

        <div class="objects-group">
          ${repeatSymbol(symbol, exercise.b)}
        </div>

        <div class="objects-equals">=</div>

        <div class="objects-answer-box"></div>
      </div>
    </div>
  `;
}

export function renderObjectsTemplate(
  asset: AssetItem,
  worksheet: WorksheetBuildResult
): string {
  const exercises = worksheet.exercises as ObjectsExercise[];
  const assetUrl = `https://mindsolut.com/recurso/${asset.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
    assetUrl
  )}`;

  return `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>${worksheet.title}</title>
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }

        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 0;
          background: #ffffff;
        }

        .sheet {
          max-width: 780px;
          margin: 0 auto;
          border: 2px dashed #cbd5e1;
          border-radius: 18px;
          padding: 18px 20px 14px;
          background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 14px;
        }

        .header-left {
          flex: 1;
        }

        .badge {
          display: inline-block;
          background: #fef3c7;
          color: #92400e;
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .title {
          font-size: 25px;
          line-height: 1.12;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
        }

        .instruction {
          font-size: 14px;
          line-height: 1.4;
          color: #475569;
          margin: 0;
        }

        .mini-illustration {
          font-size: 34px;
          line-height: 1;
        }

        .student-row {
          display: flex;
          gap: 16px;
          margin: 12px 0 16px;
        }

        .student-field {
          flex: 1;
          border-bottom: 1px solid #94a3b8;
          padding-bottom: 5px;
          font-size: 12px;
          color: #475569;
        }

        .content {
          display: grid;
          gap: 12px;
        }

        .objects-row {
          border: 1px solid #dbeafe;
          background: #eff6ff;
          border-radius: 16px;
          padding: 12px 14px;
        }

        .objects-index {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .objects-expression {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .objects-group {
          flex: 1;
          min-height: 30px;
          font-size: 24px;
          line-height: 1.35;
          word-spacing: 3px;
        }

        .objects-operator,
        .objects-equals {
          font-size: 28px;
          font-weight: 800;
          color: #1d4ed8;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }

        .objects-answer-box {
          width: 86px;
          height: 42px;
          border: 3px solid #334155;
          border-radius: 12px;
          background: #ffffff;
          flex-shrink: 0;
        }

        .footer {
          margin-top: 16px;
          border-top: 1px solid #e2e8f0;
          padding-top: 10px;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
        }

        .footer-text {
          font-size: 11px;
          line-height: 1.45;
          color: #64748b;
        }

        .footer-link {
          font-weight: 700;
          color: #0f172a;
          word-break: break-word;
        }

        .qr {
          width: 72px;
          height: 72px;
          object-fit: contain;
          flex-shrink: 0;
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="header">
          <div class="header-left">
            <div class="badge">FICHA CON OBJETOS</div>
            <h1 class="title">${worksheet.title}</h1>
            <p class="instruction">${worksheet.instruction}</p>
          </div>
          <div class="mini-illustration">🧮✨</div>
        </div>

        <div class="student-row">
          <div class="student-field">Nombre:</div>
          <div class="student-field">Fecha:</div>
        </div>

        <div class="content">
          ${exercises.map((exercise, index) => renderObjectsExercise(exercise, index)).join("")}
        </div>

        <div class="footer">
          <div class="footer-content">
            <div class="footer-text">
              <div>Mindsolut · Recurso imprimible</div>
              <div class="footer-link">${assetUrl}</div>
            </div>
            <img class="qr" src="${qrUrl}" alt="QR Mindsolut" />
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}