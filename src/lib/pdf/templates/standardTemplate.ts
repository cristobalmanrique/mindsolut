import type { AssetItem } from "@/types/content";
import type {
  WorksheetBuildResult,
  StandardExercise,
} from "../types";

function getExerciseResult(exercise: StandardExercise): number {
  switch (exercise.operator) {
    case "-":
      return exercise.a - exercise.b;
    case "×":
      return exercise.a * exercise.b;
    default:
      return exercise.a + exercise.b;
  }
}

function renderStandardExercise(exercise: StandardExercise, index: number) {
  const showA = exercise.missingField !== "a";
  const showB = exercise.missingField !== "b";
  const showResult = exercise.missingField !== "result";

  const aText = showA ? String(exercise.a) : "____";
  const bText = showB ? String(exercise.b) : "____";
  const resultText = showResult ? String(getExerciseResult(exercise)) : "____";

  if (exercise.layout === "horizontal") {
    return `
      <div class="exercise">
        <span class="exercise-index">(${index + 1})</span>
        <span class="exercise-text">${aText} ${exercise.operator} ${bText} = ${resultText}</span>
      </div>
    `;
  }

  return `
    <div class="exercise-vertical">
      <div class="exercise-index">(${index + 1})</div>
      <div class="vertical-box">
        <div class="vertical-row">${aText}</div>
        <div class="vertical-row">${exercise.operator} ${bText}</div>
        <div class="vertical-line"></div>
        <div class="vertical-row vertical-result">${resultText}</div>
      </div>
    </div>
  `;
}

export function renderStandardTemplate(
  asset: AssetItem,
  worksheet: WorksheetBuildResult
): string {
  const exercises = worksheet.exercises as StandardExercise[];
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
          color: #111827;
          margin: 0;
          padding: 0;
          background: #ffffff;
        }

        .sheet {
          max-width: 760px;
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
          background: #e0f2fe;
          color: #075985;
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

        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 24px;
        }

        .exercise {
          font-size: 20px;
          padding: 6px 0;
          border-bottom: 1px dashed #cbd5e1;
          min-height: 34px;
        }

        .exercise-index {
          font-size: 11px;
          color: #64748b;
          margin-right: 6px;
          font-weight: 700;
          vertical-align: top;
        }

        .exercise-text {
          color: #0f172a;
        }

        .exercise-vertical {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 4px 0 6px;
          border-bottom: 1px dashed #cbd5e1;
          min-height: 72px;
        }

        .vertical-box {
          text-align: right;
          font-size: 20px;
          min-width: 80px;
        }

        .vertical-row {
          height: 22px;
          line-height: 22px;
          color: #0f172a;
        }

        .vertical-line {
          border-top: 2px solid #111827;
          margin: 3px 0 4px;
        }

        .vertical-result {
          min-height: 22px;
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
            <div class="badge">FICHA ESTÁNDAR</div>
            <h1 class="title">${worksheet.title}</h1>
            <p class="instruction">${worksheet.instruction}</p>
          </div>
          <div class="mini-illustration">📘✏️</div>
        </div>

        <div class="student-row">
          <div class="student-field">Nombre:</div>
          <div class="student-field">Fecha:</div>
        </div>

        <div class="grid">
          ${exercises.map((exercise, index) => renderStandardExercise(exercise, index)).join("")}
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