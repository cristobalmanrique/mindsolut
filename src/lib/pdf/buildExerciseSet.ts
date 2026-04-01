import type { AssetItem } from "@/types/content";
import { detectVariant } from "./detectVariant";
import type { MathOperation, WorksheetBuildResult } from "./types";

import { buildStandardWorksheet } from "./variants/standard";
import { buildObjectsWorksheet } from "./variants/objects";
import { buildGameSequenceWorksheet } from "./variants/gameSequence";
import { buildGameMatchWorksheet } from "./variants/gameMatch";
import { buildGamePuzzleWorksheet } from "./variants/gamePuzzle";

export function buildExerciseSet(
  asset: AssetItem,
  operation: MathOperation
): WorksheetBuildResult {
  const variant = detectVariant(asset);

  switch (variant) {
    case "objects":
      return buildObjectsWorksheet(asset, operation);

    case "game-sequence":
      return buildGameSequenceWorksheet(asset, operation);

    case "game-match":
      return buildGameMatchWorksheet(asset, operation);

    case "game-puzzle":
      return buildGamePuzzleWorksheet(asset, operation);

    default:
      return buildStandardWorksheet(asset, operation);
  }
}