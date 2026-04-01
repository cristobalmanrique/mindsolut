import type { AssetItem } from "@/types/content";
import type {
  MathOperation,
  SequenceExercise,
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

function buildSequence(
  index: number,
  asset: AssetItem,
  operation: MathOperation
): SequenceExercise {
  const safeOperation = operation === "subtraction" ? "subtraction" : "sum";
  const easy = isEasyAsset(asset);

  const step = easy ? rand(1, 3) : rand(2, 6);
  const totalNodes = 8;

  const start =
    safeOperation === "subtraction"
      ? easy
        ? rand(12, 25)
        : rand(30, 70)
      : easy
      ? rand(0, 5)
      : rand(0, 12);

  const values = Array.from({ length: totalNodes }, (_, i) =>
    safeOperation === "subtraction" ? start - step * i : start + step * i
  );

  const filledIndexes = [0, 1, 4, 6];

  return {
    id: `sequence-${index}`,
    kind: "sequence",
    start,
    step: safeOperation === "subtraction" ? -step : step,
    totalNodes,
    filledIndexes,
    values,
  };
}

export function buildGameSequenceWorksheet(
  asset: AssetItem,
  operation: MathOperation
): WorksheetBuildResult {
  const safeOperation = operation === "multiplication" ? "sum" : operation;

  return {
    variant: "game-sequence",
    title: asset.title,
    instruction:
      safeOperation === "subtraction"
        ? "Sigue la secuencia y completa los números que faltan restando siempre la misma cantidad."
        : "Sigue la secuencia y completa los números que faltan sumando siempre la misma cantidad.",
    exercises: [
      buildSequence(1, asset, safeOperation),
      buildSequence(2, asset, safeOperation),
      buildSequence(3, asset, safeOperation),
    ],
  };
}