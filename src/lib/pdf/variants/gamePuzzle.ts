import type { AssetItem } from "@/types/content";
import type {
  MathOperation,
  PuzzleExercise,
  WorksheetBuildResult,
} from "../types";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildPuzzleExercise(
  index: number,
  operation: MathOperation
): PuzzleExercise {
  const safeOperation = operation === "multiplication" ? "sum" : operation;

  let a = rand(10, 99);
  let b = rand(10, 99);

  if (safeOperation === "subtraction" && b > a) {
    [a, b] = [b, a];
  }

  return {
    id: `puzzle-${index}`,
    kind: "puzzle",
    a,
    b,
    operator: safeOperation === "subtraction" ? "-" : "+",
  };
}

export function buildGamePuzzleWorksheet(
  asset: AssetItem,
  operation: MathOperation
): WorksheetBuildResult {
  const safeOperation = operation === "multiplication" ? "sum" : operation;

  return {
    variant: "game-puzzle",
    title: asset.title,
    instruction:
      "Resuelve las operaciones y completa cada casilla del juego.",
    exercises: Array.from({ length: 12 }, (_, i) =>
      buildPuzzleExercise(i + 1, safeOperation)
    ),
  };
}