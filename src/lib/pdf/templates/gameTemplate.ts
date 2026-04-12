import type { AssetItem } from "@/types/content";
import type {
  WorksheetBuildResult,
  SequenceExercise,
  MatchExercise,
  PuzzleExercise,
} from "../types";
import {
  getWorksheetChromeStyles,
  renderWorksheetFooter,
  renderWorksheetHeader,
} from "./chrome";

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
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
  return `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>${worksheet.title}</title>
      <style>
        ${getWorksheetChromeStyles()}

        .student-row {
          display: flex;
          gap: 14px;
          margin: 0 0 12px;
        }

        .student-field {
          flex: 1;
          border-bottom: 1px solid #94a3b8;
          padding-bottom: 5px;
          font-size: 12px;
          color: #475569;
        }

        .content {
          display: block;
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
          padding: 10px 12px;
          margin-bottom: 10px;
          break-inside: avoid;
        }

        .sequence-label {
          font-size: 12px;
          font-weight: 700;
          color: #5b21b6;
          margin: 5px 0 8px;
        }

        .sequence-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px;
        }

        .sequence-node-wrap {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .sequence-node {
          width: 38px;
          height: 38px;
          border: 2px solid #7c3aed;
          border-radius: 12px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 800;
          color: #1e293b;
        }

        .sequence-node-filled {
          background: #ede9fe;
        }

        .sequence-arrow {
          font-size: 12px;
          color: #5b21b6;
          font-weight: 700;
          min-width: 22px;
          text-align: center;
        }

        .match-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        .match-column {
          border: 1px solid #bfdbfe;
          background: #eff6ff;
          border-radius: 16px;
          padding: 14px;
          min-width: 0;
          break-inside: avoid;
        }

        .match-column-title {
          font-size: 13px;
          font-weight: 800;
          color: #1d4ed8;
          margin-bottom: 8px;
        }

        .match-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 0;
          min-height: 30px;
          border-bottom: 1px dashed #cbd5e1;
        }

        .match-item:last-child {
          border-bottom: none;
        }

        .result-item {
          justify-content: flex-start;
        }

        .match-expression {
          font-size: 17px;
          color: #0f172a;
          line-height: 1.2;
          word-break: break-word;
        }

        .puzzle-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .puzzle-card {
          border: 1px solid #fde68a;
          background: #fffbeb;
          border-radius: 16px;
          padding: 10px;
          min-height: 96px;
          break-inside: avoid;
        }

        .puzzle-expression {
          font-size: 20px;
          font-weight: 700;
          margin: 10px 0 12px;
          color: #92400e;
        }

        .puzzle-answer-box {
          width: 100%;
          height: 34px;
          border: 3px solid #92400e;
          border-radius: 12px;
          background: #ffffff;
        }
      </style>
    </head>
    <body>
      ${renderWorksheetHeader({
        badge: getBadge(worksheet.variant),
        title: worksheet.title,
        instruction: worksheet.instruction,
        emoji: "🎲🧠",
      })}

      <main class="worksheet-main">
        <div class="worksheet-panel">
          <div class="student-row">
            <div class="student-field">Nombre:</div>
            <div class="student-field">Fecha:</div>
          </div>

          <div class="content">
            ${renderGameContent(worksheet)}
          </div>
        </div>
      </main>

      ${renderWorksheetFooter(asset)}
    </body>
  </html>
  `;
}
