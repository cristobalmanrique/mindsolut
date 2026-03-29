import type { AssetItem } from "@/types/content";
import type { WorksheetVariant } from "@/lib/pdf/types";

type MathOperation = "sum" | "subtraction" | "multiplication";

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

function getOperatorSymbol(operation: MathOperation) {
  switch (operation) {
    case "subtraction":
      return "-";
    case "multiplication":
      return "×";
    default:
      return "+";
  }
}

function getOperands(asset: AssetItem, operation: MathOperation) {
  const noCarry = isNoCarryAsset(asset);
  const easy = isEasyAsset(asset);

  if (operation === "sum") {
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

    return {
      a: rand(0, 20),
      b: rand(0, 20),
    };
  }

  if (operation === "subtraction") {
    if (easy) {
      const a = rand(1, 9);
      const b = rand(0, a);
      return { a, b };
    }

    const a = rand(5, 20);
    const b = rand(0, a);
    return { a, b };
  }

  // multiplication
  if (easy) {
    return {
      a: rand(1, 5),
      b: rand(1, 5),
    };
  }

  return {
    a: rand(1, 10),
    b: rand(1, 10),
  };
}

function getResult(a: number, b: number, operation: MathOperation) {
  switch (operation) {
    case "subtraction":
      return a - b;
    case "multiplication":
      return a * b;
    default:
      return a + b;
  }
}

function buildHorizontalExercise(
  index: number,
  asset: AssetItem,
  operation: MathOperation
) {
  const { a, b } = getOperands(asset, operation);
  const operator = getOperatorSymbol(operation);

  return `${formatIndex(index)} ${a} ${operator} ${b} = ______`;
}

function buildVerticalExercise(
  index: number,
  asset: AssetItem,
  operation: MathOperation
) {
  const { a, b } = getOperands(asset, operation);
  const operator = getOperatorSymbol(operation);

  return `
    <div class="vertical-exercise">
      <div class="vertical-numbering">${formatIndex(index)}</div>
      <div class="vertical-stack">
        <div class="vertical-line">${padLeft(a)}</div>
        <div class="vertical-line">${operator} ${padLeft(b)}</div>
        <div class="vertical-separator"></div>
        <div class="vertical-answer"></div>
      </div>
    </div>
  `;
}

function buildCompleteResultExercise(
  index: number,
  asset: AssetItem,
  operation: MathOperation
) {
  const { a, b } = getOperands(asset, operation);
  const operator = getOperatorSymbol(operation);

  return `
    <div class="vertical-exercise complete-result-exercise">
      <div class="vertical-numbering">${formatIndex(index)}</div>
      <div class="vertical-stack">
        <div class="vertical-line">${padLeft(a)}</div>
        <div class="vertical-line">${operator} ${padLeft(b)}</div>
        <div class="vertical-separator"></div>
        <div class="vertical-answer-line complete-box">______</div>
      </div>
    </div>
  `;
}

function buildMissingNumberExercise(
  index: number,
  asset: AssetItem,
  operation: MathOperation
) {
  const { a, b } = getOperands(asset, operation);
  const operator = getOperatorSymbol(operation);
  const total = getResult(a, b, operation);

  if (operation === "multiplication") {
    const hideFirst = Math.random() > 0.5;

    if (hideFirst) {
      return `${formatIndex(index)} ____ ${operator} ${b} = ${total}`;
    }

    return `${formatIndex(index)} ${a} ${operator} ____ = ${total}`;
  }

  if (operation === "subtraction") {
    return `${formatIndex(index)} ${a} ${operator} ____ = ${total}`;
  }

  const hideFirst = Math.random() > 0.5;

  if (hideFirst) {
    return `${formatIndex(index)} ____ ${operator} ${b} = ${total}`;
  }

  return `${formatIndex(index)} ${a} ${operator} ____ = ${total}`;
}

function buildVisualExercise(
  index: number,
  asset: AssetItem,
  operation: MathOperation
) {
  const easy = isEasyAsset(asset);
  const symbol = pickVisualSymbol();
  const operator = getOperatorSymbol(operation);

  let a = easy ? rand(1, 8) : rand(1, 10);
  let b = easy ? rand(1, 8) : rand(1, 10);

  if (operation === "subtraction") {
    a = easy ? rand(2, 9) : rand(3, 10);
    b = rand(1, a);
  }

  if (operation === "multiplication") {
    a = easy ? rand(1, 5) : rand(1, 9);
    b = easy ? rand(1, 5) : rand(1, 9);
  }

  return `${formatIndex(index)} ${a} ${symbol} ${operator} ${b} ${symbol} = ______`;
}

export function buildExercises(
  variant: WorksheetVariant,
  asset: AssetItem,
  operation: MathOperation
) {
  const list: string[] = [];

  for (let i = 0; i < 18; i++) {
    const index = i + 1;

    switch (variant) {
      case "horizontal":
        list.push(buildHorizontalExercise(index, asset, operation));
        break;

      case "vertical":
        list.push(buildVerticalExercise(index, asset, operation));
        break;

      case "complete-result":
        list.push(buildCompleteResultExercise(index, asset, operation));
        break;

      case "missing-number":
        list.push(buildMissingNumberExercise(index, asset, operation));
        break;

      case "visual":
        list.push(buildVisualExercise(index, asset, operation));
        break;

      default:
        list.push(buildVerticalExercise(index, asset, operation));
        break;
    }
  }

  return list;
}