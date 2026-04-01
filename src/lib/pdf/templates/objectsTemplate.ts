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
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 26px;
          background: #ffffff;
        }

        .sheet {
          max-width: 820px;
          margin: 0 auto;
          border: 2px dashed #cbd5e1;
          border-radius: 18px;
          padding: 20px 24px 18px;
          background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
        }

        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
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
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .title {
          font-size: 27px;
          line-height: 1.15;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
        }

        .instruction {
          font-size: 15px;
          line-height: 1.45;
          color: #475569;
          margin: 0;
        }

        .mini-illustration {
          font-size: 42px;
          line-height: 1;
        }

        .student-row {
          display: flex;
          gap: 18px;
          margin: 16px 0 20px;
        }

        .student-field {
          flex: 1;
          border-bottom: 1px solid #94a3b8;
          padding-bottom: 6px;
          font-size: 13px;
          color: #475569;
        }

        .content {
          display: grid;
          gap: 16px;
        }

        .objects-row {
          border: 1px solid #dbeafe;
          background: #eff6ff;
          border-radius: 16px;
          padding: 14px 16px;
        }

        .objects-expression {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .objects-index {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .objects-group {
          flex: 1;
          min-height: 34px;
          font-size: 28px;
          line-height: 1.4;
          word-spacing: 4px;
        }

        .objects-operator,
        .objects-equals {
          font-size: 34px;
          font-weight: 800;
          color: #1d4ed8;
          width: 28px;
          text-align: center;
          flex-shrink: 0;
        }

        .objects-answer-box {
          width: 96px;
          height: 48px;
          border: 3px solid #334155;
          border-radius: 12px;
          background: #ffffff;
          flex-shrink: 0;
        }

        .footer {
          margin-top: 20px;
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
          font-size: 12px;
          line-height: 1.5;
          color: #64748b;
        }

        .footer-link {
          font-weight: 700;
          color: #0f172a;
        }

        .qr {
          width: 82px;
          height: 82px;
          object-fit: contain;
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