import type { AssetItem } from "@/types/content";
import type {
  WorksheetBuildResult,
  StandardExercise,
} from "../types";
import {
  getWorksheetChromeStyles,
  renderWorksheetFooter,
  renderWorksheetHeader,
} from "./chrome";

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
          gap: 16px;
          margin: 0 0 14px;
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
          gap: 4px 16px;
        }

        .exercise {
          font-size: 17px;
          padding: 4px 0;
          border-bottom: 1px dashed #cbd5e1;
          min-height: 28px;
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
          padding: 3px 0 4px;
          border-bottom: 1px dashed #cbd5e1;
          min-height: 58px;
        }

        .vertical-box {
          text-align: right;
          font-size: 17px;
          min-width: 64px;
        }

        .vertical-row {
          height: 18px;
          line-height: 18px;
          color: #0f172a;
        }

        .vertical-line {
          border-top: 2px solid #111827;
          margin: 3px 0 4px;
        }

        .vertical-result {
          min-height: 18px;
        }
      </style>
    </head>
    <body>
      ${renderWorksheetHeader({
        badge: "FICHA ESTÁNDAR",
        title: worksheet.title,
        instruction: worksheet.instruction,
        emoji: "📘✏️",
      })}

      <main class="worksheet-main">
        <div class="worksheet-panel">
          <div class="student-row">
            <div class="student-field">Nombre:</div>
            <div class="student-field">Fecha:</div>
          </div>

          <div class="grid">
            ${exercises
              .map((exercise, index) => renderStandardExercise(exercise, index))
              .join("")}
          </div>
        </div>
      </main>

      ${renderWorksheetFooter(asset)}
    </body>
  </html>
  `;
}
