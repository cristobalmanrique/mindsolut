import type { AssetItem } from "@/types/content";
import type {
  WorksheetBuildResult,
  StandardExercise,
} from "../types";

function renderStandardExercise(
  exercise: StandardExercise,
  index: number
) {
  const showA = exercise.missingField !== "a";
  const showB = exercise.missingField !== "b";
  const showResult = exercise.missingField !== "result";

  const aText = showA ? String(exercise.a) : "____";
  const bText = showB ? String(exercise.b) : "____";
  const resultText = showResult ? "____" : "____";

  return `
    <div class="exercise">
      <span class="exercise-index">(${index + 1})</span>
      <span class="exercise-text">${aText} ${exercise.operator} ${bText} = ${resultText}</span>
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
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #111827;
          margin: 0;
          padding: 32px;
          background: #ffffff;
        }

        .sheet {
          max-width: 800px;
          margin: 0 auto;
          border: 2px dashed #cbd5e1;
          border-radius: 18px;
          padding: 24px;
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
          background: #e0f2fe;
          color: #075985;
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
          font-size: 40px;
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

        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px 28px;
        }

        .exercise {
          font-size: 22px;
          padding: 10px 0;
          border-bottom: 1px dashed #cbd5e1;
          min-height: 42px;
        }

        .exercise-index {
          font-size: 12px;
          color: #64748b;
          margin-right: 6px;
          font-weight: 700;
        }

        .exercise-text {
          color: #0f172a;
        }

        .footer {
          margin-top: 24px;
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