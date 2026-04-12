import type { AssetItem } from "@/types/content";
import type {
  WorksheetBuildResult,
  ObjectsExercise,
  VisualObjectKey,
} from "../types";
import {
  getWorksheetChromeStyles,
  renderWorksheetFooter,
  renderWorksheetHeader,
} from "./chrome";

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

        .content {
          display: grid;
          gap: 10px;
        }

        .objects-row {
          border: 1px solid #dbeafe;
          background: #eff6ff;
          border-radius: 16px;
          padding: 10px 12px;
          break-inside: avoid;
        }

        .objects-index {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 6px;
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
          min-height: 28px;
          font-size: 22px;
          line-height: 1.3;
          word-spacing: 3px;
        }

        .objects-operator,
        .objects-equals {
          font-size: 26px;
          font-weight: 800;
          color: #1d4ed8;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }

        .objects-answer-box {
          width: 82px;
          height: 40px;
          border: 3px solid #334155;
          border-radius: 12px;
          background: #ffffff;
          flex-shrink: 0;
        }
      </style>
    </head>
    <body>
      ${renderWorksheetHeader({
        badge: "FICHA CON OBJETOS",
        title: worksheet.title,
        instruction: worksheet.instruction,
        emoji: "🧩✨",
      })}

      <main class="worksheet-main">
        <div class="worksheet-panel">
          <div class="student-row">
            <div class="student-field">Nombre:</div>
            <div class="student-field">Fecha:</div>
          </div>

          <div class="content">
            ${exercises
              .map((exercise, index) => renderObjectsExercise(exercise, index))
              .join("")}
          </div>
        </div>
      </main>

      ${renderWorksheetFooter(asset)}
    </body>
  </html>
  `;
}
