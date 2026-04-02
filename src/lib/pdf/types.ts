export type MathOperation = "sum" | "subtraction" | "multiplication";

export type WorksheetVariant =
  | "standard"
  | "objects"
  | "game-sequence"
  | "game-puzzle"
  | "game-match";

export type VisualObjectKey =
  | "apple"
  | "flower"
  | "star"
  | "umbrella"
  | "chick"
  | "trophy"
  | "pear"
  | "heart"
  | "scissors"
  | "pencil"
  | "banana"
  | "mouse"
  | "icecream"
  | "cap"
  | "moon"
  | "dog"
  | "bulb";

export interface ExerciseBase {
  id: string;
  prompt?: string;
}

export interface StandardExercise extends ExerciseBase {
  kind: "standard";
  a: number;
  b: number;
  operator: "+" | "-" | "×";
  answerBlank: boolean;
  missingField: "a" | "b" | "result";
  layout: "horizontal" | "vertical";
}

export interface ObjectsExercise extends ExerciseBase {
  kind: "objects";
  a: number;
  b: number;
  operator: "+" | "-";
  objectKey: VisualObjectKey;
  answerBlank: boolean;
}

export interface SequenceExercise extends ExerciseBase {
  kind: "sequence";
  start: number;
  step: number;
  totalNodes: number;
  filledIndexes: number[];
  values: number[];
}

export interface PuzzleExercise extends ExerciseBase {
  kind: "puzzle";
  a: number;
  b: number;
  operator: "+" | "-";
}

export interface MatchExercise extends ExerciseBase {
  kind: "match";
  a: number;
  b: number;
  operator: "+" | "-";
  result: number;
}

export type WorksheetExercise =
  | StandardExercise
  | ObjectsExercise
  | SequenceExercise
  | PuzzleExercise
  | MatchExercise;

export interface WorksheetBuildResult {
  variant: WorksheetVariant;
  title: string;
  instruction: string;
  exercises: WorksheetExercise[];
}