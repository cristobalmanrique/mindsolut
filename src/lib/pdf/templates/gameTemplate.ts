import type { AssetItem } from "@/types/content";
import type {
  WorksheetBuildResult,
  SequenceExercise,
  MatchExercise,
  PuzzleExercise,
} from "../types";

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderSequenceExercise(exercise: SequenceExercise, index: number) {
  return `
    <div class="sequence-block">
      <div class="game-index">(${index + 1})</div>
      <div class="sequence-label">
        Completa la secuencia ${exercise.step > 0 ? `+${exercise.step}` : exercise.step}
      </div>
      <div class="sequence-row">
        ${exercise.values
          .map((value, valueIndex) => {
            const filled = exercise.filledIndexes.includes(valueIndex);
            return `
              <div class="sequence-node-wrap">
                <div class="sequence-node ${filled ? "sequence-node-filled" : ""}">
                  ${filled ? value : ""}
                </div>
                ${
                  valueIndex < exercise.values.length - 1
                    ? `<div class="sequence-arrow">${exercise.step > 0 ? `+${Math.abs(
                        exercise.step
                      )}` : `-${Math.abs(exercise.step)}`}</div>`
                    : ""
                }
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderMatchWorksheet(exercises: MatchExercise[]) {
  const results = shuffleArray(exercises.map((item) => item.result));

  return `
    <div class="match-layout">
      <div class="match-column">
        <div class="match-column-title">Operaciones</div>
        ${exercises
          .map(
            (exercise, index) => `
            <div class="match-item">
              <span class="game-index">(${index + 1})</span>
              <span class="match-expression">${exercise.a} ${exercise.operator} ${exercise.b}</span>
            </div>
          `
          )
          .join("")}
      </div>

      <div class="match-column">
        <div class="match-column-title">Resultados</div>
        ${results
          .map(
            (result, index) => `
            <div class="match-item result-item">
              <span class="game-index">(${index + 1})</span>
              <span class="match-expression">${result}</span>
            </div>
          `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderPuzzleWorksheet(exercises: PuzzleExercise[]) {
  return `
    <div class="puzzle-grid">
      ${exercises
        .map(
          (exercise, index) => `
          <div class="puzzle-card">
            <div class="game-index">(${index + 1})</div>
            <div class="puzzle-expression">${exercise.a} ${exercise.operator} ${exercise.b}</div>
            <div class="puzzle-answer-box"></div>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}

function renderGameContent(worksheet: WorksheetBuildResult) {
  if (worksheet.variant === "game-sequence") {
    return (worksheet.exercises as SequenceExercise[])
      .map((exercise, index) => renderSequenceExercise(exercise, index))
      .join("");
  }

  if (worksheet.variant === "game-puzzle") {
    return renderPuzzleWorksheet(worksheet.exercises as PuzzleExercise[]);
  }

  return renderMatchWorksheet(worksheet.exercises as MatchExercise[]);
}

function getBadge(variant: WorksheetBuildResult["variant"]) {
  switch (variant) {
    case "game-sequence":
      return "JUEGO DE SECUENCIAS";
    case "game-puzzle":
      return "JUEGO TIPO ROMPECABEZAS";
    default:
      return "JUEGO DE EMPAREJAR";
  }
}

export function renderGameTemplate(
  asset: AssetItem,
  worksheet: WorksheetBuildResult
): string {
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
          background: #dcfce7;
          color: #166534;
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

        .game-index {
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
          flex-shrink: 0;
        }

        .sequence-block {
          border: 1px solid #ddd6fe;
          background: #f5f3ff;
          border-radius: 16px;
          padding: 12px 14px;
          margin-bottom: 12px;
        }

        .sequence-label {
          font-size: 13px;
          font-weight: 700;
          color: #5b21b6;
          margin: 6px 0 10px;
        }

        .sequence-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }

        .sequence-node-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sequence-node {
          width: 40px;
          height: 40px;
          border: 2px solid #7c3aed;
          border-radius: 12px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          font-weight: 800;
          color: #1e293b;
        }

        .sequence-node-filled {
          background: #ede9fe;
        }

        .sequence-arrow {
          font-size: 13px;
          color: #5b21b6;
          font-weight: 700;
          min-width: 24px;
          text-align: center;
        }

        .match-layout {
          display: grid;
          grid-template-columns: minmax(180px, 240px) minmax(120px, 160px);
          justify-content: center;
          gap: 90px;
        }

        .match-column {
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          border-radius: 16px;
          padding: 16px 18px;
        }

        .match-column-title {
          font-size: 13px;
          font-weight: 800;
          color: #1d4ed8;
          margin-bottom: 10px;
        }

        .match-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          min-height: 32px;
          border-bottom: 1px dashed #cbd5e1;
        }

        .match-item:last-child {
          border-bottom: none;
        }

        .result-item {
          justify-content: flex-start;
        }

        .match-expression {
          font-size: 18px;
          color: #0f172a;
          line-height: 1.2;
        }

        .puzzle-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .puzzle-card {
          border: 1px solid #fde68a;
          background: #fffbeb;
          border-radius: 16px;
          padding: 12px;
          min-height: 110px;
        }

        .puzzle-expression {
          font-size: 22px;
          font-weight: 700;
          margin: 12px 0 16px;
          color: #92400e;
        }

        .puzzle-answer-box {
          width: 100%;
          height: 38px;
          border: 3px solid #92400e;
          border-radius: 12px;
          background: #ffffff;
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
            <div class="badge">${getBadge(worksheet.variant)}</div>
            <h1 class="title">${worksheet.title}</h1>
            <p class="instruction">${worksheet.instruction}</p>
          </div>
          <div class="mini-illustration">🎲🧠</div>
        </div>

        <div class="student-row">
          <div class="student-field">Nombre:</div>
          <div class="student-field">Fecha:</div>
        </div>

        <div class="content">
          ${renderGameContent(worksheet)}
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