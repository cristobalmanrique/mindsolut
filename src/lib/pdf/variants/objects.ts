import type { AssetItem } from "@/types/content";
import type {
  MathOperation,
  VisualObjectKey,
  WorksheetBuildResult,
  ObjectsExercise,
} from "../types";

const OBJECTS: VisualObjectKey[] = [
  "apple",
  "flower",
  "star",
  "umbrella",
  "chick",
  "trophy",
  "pear",
  "heart",
  "scissors",
  "pencil",
  "banana",
  "mouse",
  "icecream",
  "cap",
  "moon",
  "dog",
  "bulb",
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickObject(): VisualObjectKey {
  return OBJECTS[rand(0, OBJECTS.length - 1)];
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

function buildObjectsExercise(
  index: number,
  asset: AssetItem,
  operation: MathOperation
): ObjectsExercise {
  const easy = isEasyAsset(asset);

  let a = easy ? rand(2, 6) : rand(2, 9);
  let b =
    operation === "subtraction"
      ? easy
        ? rand(1, a - 1)
        : rand(1, a - 1)
      : easy
      ? rand(1, 5)
      : rand(1, 8);

  return {
    id: `objects-${index}`,
    kind: "objects",
    a,
    b,
    operator: operation === "subtraction" ? "-" : "+",
    objectKey: pickObject(),
    answerBlank: true,
  };
}

export function buildObjectsWorksheet(
  asset: AssetItem,
  operation: MathOperation
): WorksheetBuildResult {
  const safeOperation = operation === "multiplication" ? "sum" : operation;

  return {
    variant: "objects",
    title: asset.title,
    instruction:
      safeOperation === "subtraction"
        ? "Observa los objetos, resta y escribe el resultado en el recuadro."
        : "Observa los objetos, suma y escribe el resultado en el recuadro.",
    exercises: Array.from({ length: 5 }, (_, i) =>
      buildObjectsExercise(i + 1, asset, safeOperation)
    ),
  };
}