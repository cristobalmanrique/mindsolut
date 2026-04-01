import type { AssetItem } from "@/types/content";
import type {
  MathOperation,
  StandardExercise,
  WorksheetBuildResult,
} from "../types";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

function isNoCarryAsset(asset: AssetItem) {
  return asset.slug.includes("sin-llevadas");
}

function getOperator(operation: MathOperation): "+" | "-" | "×" {
  if (operation === "subtraction") return "-";
  if (operation === "multiplication") return "×";
  return "+";
}

function getOperands(asset: AssetItem, operation: MathOperation) {
  const easy = isEasyAsset(asset);
  const noCarry = isNoCarryAsset(asset);

  if (operation === "sum") {
    if (noCarry) {
      const aUnits = rand(0, 4);
      const bUnits = rand(0, 4);
      const aTens = rand(0, 2);
      const bTens = rand(0, 2);

      return {
        a: aTens * 10 + aUnits,
        b: bTens * 10 + bUnits,
      };
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
      const a = rand(2, 12);
      const b = rand(1, a);
      return { a, b };
    }

    const a = rand(5, 25);
    const b = rand(1, a);
    return { a, b };
  }

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

function getMissingField(asset: AssetItem): "result" | "a" | "b" {
  if (asset.slug.includes("completar-numeros")) {
    return Math.random() > 0.5 ? "a" : "b";
  }

  return "result";
}

function buildStandardExercise(
  index: number,
  asset: AssetItem,
  operation: MathOperation
): StandardExercise {
  const { a, b } = getOperands(asset, operation);

  return {
    id: `standard-${index}`,
    kind: "standard",
    a,
    b,
    operator: getOperator(operation),
    answerBlank: true,
    missingField: getMissingField(asset),
  };
}

function getInstruction(asset: AssetItem, operation: MathOperation) {
  if (asset.slug.includes("completar-numeros")) {
    return "Completa el número que falta en cada operación.";
  }

  if (asset.slug.includes("completar-resultados")) {
    return "Resuelve cada operación y completa el resultado.";
  }

  if (operation === "subtraction") {
    return "Resuelve las restas y escribe el resultado correctamente.";
  }

  if (operation === "multiplication") {
    return "Resuelve las multiplicaciones y escribe el resultado correctamente.";
  }

  return "Resuelve las operaciones y escribe el resultado correctamente.";
}

export function buildStandardWorksheet(
  asset: AssetItem,
  operation: MathOperation
): WorksheetBuildResult {
  return {
    variant: "standard",
    title: asset.title,
    instruction: getInstruction(asset, operation),
    exercises: Array.from({ length: 18 }, (_, i) =>
      buildStandardExercise(i + 1, asset, operation)
    ),
  };
}