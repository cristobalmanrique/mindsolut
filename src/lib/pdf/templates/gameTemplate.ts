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
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 24px;
          background: #ffffff;
        }

        .sheet {
          max-width: 820px;
          margin: 0 auto;
          border: 2px dashed #cbd5e1;
          border-radius: 18px;
          padding: 20px 22px 18px;
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
          background: #dcfce7;
          color: #166534;
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

        .game-index {
          font-size: 12px;
          color: #64748b;
          font-weight: 700;
        }

        .sequence-block {
          border: 1px solid #ddd6fe;
          background: #f5f3ff;
          border-radius: 16px;
          padding: 14px 16px;
          margin-bottom: 16px;
        }

        .sequence-label {
          font-size: 14px;
          font-weight: 700;
          color: #5b21b6;
          margin: 8px 0 12px;
        }

        .sequence-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .sequence-node-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sequence-node {
          width: 44px;
          height: 44px;
          border: 2px solid #7c3aed;
          border-radius: 12px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
        }

        .sequence-node-filled {
          background: #ede9fe;
        }

        .sequence-arrow {
          font-size: 14px;
          color: #5b21b6;
          font-weight: 700;
          min-width: 26px;
          text-align: center;
        }

        .match-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .match-column {
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          border-radius: 16px;
          padding: 14px 16px;
        }

        .match-column-title {
          font-size: 14px;
          font-weight: 800;
          color: #1d4ed8;
          margin-bottom: 10px;
        }

        .match-item {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px dashed #cbd5e1;
          padding: 8px 0;
          min-height: 30px;
        }

        .result-item {
          justify-content: flex-start;
        }

        .match-expression {
          font-size: 18px;
          color: #0f172a;
        }

        .puzzle-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .puzzle-card {
          border: 1px solid #fde68a;
          background: #fffbeb;
          border-radius: 16px;
          padding: 14px;
          min-height: 120px;
        }

        .puzzle-expression {
          font-size: 24px;
          font-weight: 700;
          margin: 14px 0 20px;
          color: #92400e;
        }

        .puzzle-answer-box {
          width: 100%;
          height: 42px;
          border: 3px solid #92400e;
          border-radius: 12px;
          background: #ffffff;
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