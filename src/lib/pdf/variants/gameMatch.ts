import type { AssetItem } from "@/types/content";
import type {
  MathOperation,
  MatchExercise,
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

function buildMatchExercise(
  index: number,
  asset: AssetItem,
  operation: MathOperation
): MatchExercise {
  const easy = isEasyAsset(asset);
  const safeOperation = operation === "multiplication" ? "sum" : operation;

  let a = easy ? rand(1, 10) : rand(5, 30);
  let b = easy ? rand(1, 10) : rand(5, 30);

  if (safeOperation === "subtraction" && b > a) {
    [a, b] = [b, a];
  }

  const result =
    safeOperation === "subtraction" ? a - b : a + b;

  return {
    id: `match-${index}`,
    kind: "match",
    a,
    b,
    operator: safeOperation === "subtraction" ? "-" : "+",
    result,
  };
}

export function buildGameMatchWorksheet(
  asset: AssetItem,
  operation: MathOperation
): WorksheetBuildResult {
  const safeOperation = operation === "multiplication" ? "sum" : operation;

  return {
    variant: "game-match",
    title: asset.title,
    instruction:
      safeOperation === "subtraction"
        ? "Une cada resta con su resultado correcto."
        : "Une cada operación con su resultado correcto.",
    exercises: Array.from({ length: 8 }, (_, i) =>
      buildMatchExercise(i + 1, asset, safeOperation)
    ),
  };
}