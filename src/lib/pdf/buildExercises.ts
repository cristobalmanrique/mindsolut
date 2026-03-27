import type { AssetItem } from "@/types/content";
import type { WorksheetVariant } from "@/lib/pdf/types";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function padLeft(value: number, totalWidth = 2) {
  return String(value).padStart(totalWidth, " ");
}

function pickVisualSymbol() {
  const symbols = ["🍎", "⭐", "⚽", "🐟", "🌼", "🍇", "🚗", "🧩"];
  return symbols[rand(0, symbols.length - 1)];
}

function formatIndex(index: number) {
  return `<span class="exercise-index">(${index})</span>`;
}

function isNoCarryAsset(asset: AssetItem) {
  return asset.slug.includes("sin-llevadas");
}

function isEasyAsset(asset: AssetItem) {
  return (
    asset.slug.includes("faciles") ||
    asset.slug.includes("sencillas") ||
    asset.slug.includes("nivel-inicial") ||
    asset.slug.includes("basicas") ||
    asset.slug.includes("numeros-pequenos")
  );
}

function getSumOperands(asset: AssetItem) {
  const noCarry = isNoCarryAsset(asset);
  const easy = isEasyAsset(asset);

  if (noCarry) {
    const aUnits = rand(0, 4);
    const bUnits = rand(0, 4);
    const aTens = rand(0, 2);
    const bTens = rand(0, 2);

    const a = aTens * 10 + aUnits;
    const b = bTens * 10 + bUnits;

    return { a, b };
  }

  if (easy) {
    const a = rand(0, 9);
    const b = rand(0, 9 - a);
    return { a, b };
  }

  const a = rand(0, 20);
  const b = rand(0, 20);
  return { a, b };
}

function buildHorizontalExercise(index: number, asset: AssetItem) {
  const { a, b } = getSumOperands(asset);
  return `${formatIndex(index)} ${a} + ${b} = ______`;
}

function buildVerticalExercise(index: number, asset: AssetItem) {
  const { a, b } = getSumOperands(asset);

  return `
    <div class="vertical-exercise">
      <div class="vertical-numbering">${formatIndex(index)}</div>
      <div class="vertical-stack">
        <div class="vertical-line">${padLeft(a)}</div>
        <div class="vertical-line">+ ${padLeft(b)}</div>
        <div class="vertical-separator"></div>
        <div class="vertical-answer"></div>
      </div>
    </div>
  `;
}

function buildCompleteResultExercise(index: number, asset: AssetItem) {
  const { a, b } = getSumOperands(asset);

  return `
    <div class="vertical-exercise complete-result-exercise">
      <div class="vertical-numbering">${formatIndex(index)}</div>
      <div class="vertical-stack">
        <div class="vertical-line">${padLeft(a)}</div>
        <div class="vertical-line">+ ${padLeft(b)}</div>
        <div class="vertical-separator"></div>
        <div class="vertical-answer-line complete-box">______</div>
      </div>
    </div>
  `;
}

function buildMissingNumberExercise(index: number, asset: AssetItem) {
  const { a, b } = getSumOperands(asset);
  const total = a + b;

  const hideFirst = Math.random() > 0.5;

  if (hideFirst) {
    return `${formatIndex(index)} ____ + ${b} = ${total}`;
  }

  return `${formatIndex(index)} ${a} + ____ = ${total}`;
}

function buildVisualExercise(index: number, asset: AssetItem) {
  const easy = isEasyAsset(asset);

  const a = easy ? rand(1, 8) : rand(1, 10);
  const b = easy ? rand(1, 8) : rand(1, 10);
  const symbol = pickVisualSymbol();

  return `${formatIndex(index)} ${a} ${symbol} + ${b} ${symbol} = ______`;
}

export function buildExercises(variant: WorksheetVariant, asset: AssetItem) {
  const list: string[] = [];

  for (let i = 0; i < 18; i++) {
    const index = i + 1;

    switch (variant) {
      case "horizontal":
        list.push(buildHorizontalExercise(index, asset));
        break;

      case "vertical":
        list.push(buildVerticalExercise(index, asset));
        break;

      case "complete-result":
        list.push(buildCompleteResultExercise(index, asset));
        break;

      case "missing-number":
        list.push(buildMissingNumberExercise(index, asset));
        break;

      case "visual":
        list.push(buildVisualExercise(index, asset));
        break;

      default:
        list.push(buildVerticalExercise(index, asset));
        break;
    }
  }

  return list;
}