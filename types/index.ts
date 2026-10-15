import type {
  AngleUnit,
  DisplayFormat,
  Token,
  SymbolName,
  VariableMap,
} from "@/lib/engine";

export type ModeId =
  | "calculate"
  | "complex"
  | "base-n"
  | "matrix"
  | "vector"
  | "statistics"
  | "distribution"
  | "spreadsheet"
  | "table"
  | "equation"
  | "inequality"
  | "ratio";

export interface ModeInfo {
  id: ModeId;
  /** The number shown to the left of the entry in the MODE menu. */
  index: number;
  name: string;
  shortName: string;
  description: string;
  /** Expression-based modes drive the shared expression buffer with the keypad. */
  expressionBased: boolean;
}

export const MODES: ModeInfo[] = [
  {
    id: "calculate",
    index: 1,
    name: "Calculate",
    shortName: "Calculate",
    description: "General calculations",
    expressionBased: true,
  },
  {
    id: "complex",
    index: 2,
    name: "Complex",
    shortName: "Complex",
    description: "Complex number calculations",
    expressionBased: true,
  },
  {
    id: "base-n",
    index: 3,
    name: "Base-N",
    shortName: "Base-N",
    description: "Binary, octal, decimal, hexadecimal",
    expressionBased: true,
  },
  {
    id: "matrix",
    index: 4,
    name: "Matrix",
    shortName: "Matrix",
    description: "Matrix calculations",
    expressionBased: false,
  },
  {
    id: "vector",
    index: 5,
    name: "Vector",
    shortName: "Vector",
    description: "Vector calculations",
    expressionBased: false,
  },
  {
    id: "statistics",
    index: 6,
    name: "Statistics",
    shortName: "Statistics",
    description: "Statistical and regression calculations",
    expressionBased: false,
  },
  {
    id: "distribution",
    index: 7,
    name: "Distribution",
    shortName: "Distrib",
    description: "Probability distributions",
    expressionBased: false,
  },
  {
    id: "spreadsheet",
    index: 8,
    name: "Spreadsheet",
    shortName: "Sheet",
    description: "Spreadsheet calculations",
    expressionBased: false,
  },
  {
    id: "table",
    index: 9,
    name: "Table",
    shortName: "Table",
    description: "Generate a number table from a function",
    expressionBased: true,
  },
  {
    id: "equation",
    index: 10,
    name: "Equation/Func",
    shortName: "Equation",
    description: "Simultaneous and polynomial equations",
    expressionBased: false,
  },
  {
    id: "inequality",
    index: 11,
    name: "Inequality",
    shortName: "Inequal",
    description: "Polynomial inequalities",
    expressionBased: false,
  },
  {
    id: "ratio",
    index: 12,
    name: "Ratio",
    shortName: "Ratio",
    description: "Ratio calculations",
    expressionBased: false,
  },
];

export function modeInfo(id: ModeId): ModeInfo {
  return MODES.find((mode) => mode.id === id) ?? MODES[0]!;
}

/** Controls that are not plain token insertion. */
export type ControlId =
  | "equals"
  | "clear"
  | "delete"
  | "left"
  | "right"
  | "up"
  | "down"
  | "mode"
  | "setup"
  | "on"
  | "calc"
  | "solve"
  | "sd"
  | "sto"
  | "rcl"
  | "drg"
  | "ins"
  | "off";

export interface HistoryEntry {
  id: string;
  mode: ModeId;
  expression: string;
  result: string;
  /** Token snapshot so REPLAY can restore the expression exactly. */
  tokens: Token[];
  at: number;
}

export interface CalculatorState {
  mode: ModeId;
  tokens: Token[];
  cursor: number;
  shift: boolean;
  alpha: boolean;
  hyp: boolean;
  angleUnit: AngleUnit;
  format: DisplayFormat;
  variables: VariableMap;
  ans: number;
  preAns: number;
  history: HistoryEntry[];
  /** Last rendered result (already formatted). */
  result: string | null;
  /** Alternate representation used by S⇔D. */
  resultAlternate: string | null;
  showingAlternate: boolean;
  error: string | null;
  /** Set while STO/RCL waits for a variable key. */
  pendingStore: boolean;
  pendingRecall: boolean;
  insertMode: boolean;
  /** Index into the history list while replaying, or null. */
  replayIndex: number | null;
  /** Becomes true once stored preferences have been loaded from localStorage. */
  hydrated: boolean;
}

export type CalculatorAction =
  | { type: "insertToken"; token: Token }
  | { type: "insertTokens"; tokens: Token[] }
  | { type: "insertFunction"; name: string; args: number }
  | { type: "control"; control: ControlId }
  | { type: "toggleShift" }
  | { type: "toggleAlpha" }
  | { type: "toggleHyp" }
  | { type: "setMode"; mode: ModeId }
  | { type: "setAngleUnit"; unit: AngleUnit }
  | { type: "setFormat"; format: DisplayFormat }
  | { type: "storeVariable"; name: SymbolName }
  | { type: "recallVariable"; name: SymbolName }
  | { type: "clearHistory" }
  | { type: "toggleSd" }
  | { type: "setError"; message: string | null }
  | { type: "insertText"; text: string }
  | { type: "hydrate"; partial: Partial<CalculatorState> };
