import {
  type OperatorToken,
  type PostfixToken,
  type SymbolName,
  type Token,
  numberToken,
  opToken,
  postfixToken,
  rootToken,
  symbolToken,
} from "@/lib/engine";
import type { CalculatorAction, ControlId } from "@/types";

export type KeyTone =
  "shift" | "alpha" | "number" | "operator" | "function" | "control" | "equals";

export interface KeyDef {
  id: string;
  /** Main legend printed on the key. */
  label: string;
  /** Small text under the main legend (variable name / unit hint). */
  subLabel?: string;
  /** SHIFT legend printed above the key. */
  shiftLabel?: string;
  /** ALPHA legend printed above the key. */
  alphaLabel?: string;
  tone: KeyTone;
  primary: CalculatorAction;
  shift?: CalculatorAction;
  alpha?: CalculatorAction;
  /** Column span inside the 5 column keypad grid. */
  span?: number;
  ariaLabel?: string;
}

type KeyAction = CalculatorAction;

const digit = (d: string): KeyAction => ({
  type: "insertToken",
  token: numberToken(d),
});
const op = (o: OperatorToken): KeyAction => ({
  type: "insertToken",
  token: opToken(o),
});
const sym = (name: SymbolName): KeyAction => ({
  type: "insertToken",
  token: symbolToken(name),
});
const root = (name: "sqrt" | "cbrt"): KeyAction => ({
  type: "insertToken",
  token: rootToken(name),
});
const postfix = (p: PostfixToken): KeyAction => ({
  type: "insertToken",
  token: postfixToken(p),
});
const tokens = (list: Token[]): KeyAction => ({
  type: "insertTokens",
  tokens: list,
});
const call = (name: string, args: number): KeyAction => ({
  type: "insertFunction",
  name,
  args,
});
const ctl = (control: ControlId): KeyAction => ({ type: "control", control });

const sq = (): KeyAction => tokens([opToken("^"), numberToken("2")]);
const cube = (): KeyAction => tokens([opToken("^"), numberToken("3")]);
const tenPower = (): KeyAction =>
  tokens([numberToken("1"), numberToken("0"), opToken("^")]);
const ePower = (): KeyAction => tokens([symbolToken("e"), opToken("^")]);

export const KEYS: KeyDef[] = [
  // Row 1 — state and mode cluster
  {
    id: "shift",
    label: "SHIFT",
    tone: "shift",
    primary: { type: "toggleShift" },
    ariaLabel: "Shift",
  },
  {
    id: "alpha",
    label: "ALPHA",
    tone: "alpha",
    primary: { type: "toggleAlpha" },
    ariaLabel: "Alpha",
  },
  {
    id: "up",
    label: "▲",
    tone: "control",
    primary: ctl("up"),
    ariaLabel: "Up",
  },
  {
    id: "mode",
    label: "MODE",
    shiftLabel: "SETUP",
    tone: "control",
    primary: ctl("mode"),
    shift: ctl("setup"),
    ariaLabel: "Mode menu",
  },
  {
    id: "on",
    label: "ON",
    tone: "control",
    primary: ctl("on"),
    shift: ctl("off"),
    ariaLabel: "On",
  },

  // Row 2 — replay and actions
  {
    id: "left",
    label: "◀",
    tone: "control",
    primary: ctl("left"),
    ariaLabel: "Left",
  },
  {
    id: "right",
    label: "▶",
    tone: "control",
    primary: ctl("right"),
    ariaLabel: "Right",
  },
  {
    id: "down",
    label: "▼",
    tone: "control",
    primary: ctl("down"),
    ariaLabel: "Down",
  },
  {
    id: "calc",
    label: "CALC",
    shiftLabel: "SOLVE",
    tone: "function",
    primary: ctl("calc"),
    shift: ctl("solve"),
    ariaLabel: "Calc",
  },
  {
    id: "sd",
    label: "S⇔D",
    tone: "function",
    primary: ctl("sd"),
    ariaLabel: "Standard to decimal",
  },

  // Row 3 — powers, roots, fractions
  {
    id: "sqrt",
    label: "√",
    shiftLabel: "∛",
    tone: "function",
    primary: root("sqrt"),
    shift: root("cbrt"),
    ariaLabel: "Square root",
  },
  {
    id: "square",
    label: "x²",
    shiftLabel: "x³",
    tone: "function",
    primary: sq(),
    shift: cube(),
    ariaLabel: "Square",
  },
  {
    id: "power",
    label: "x^",
    shiftLabel: "ˣ√",
    tone: "function",
    primary: op("^"),
    shift: call("root", 2),
    ariaLabel: "Power",
  },
  {
    id: "recip",
    label: "x⁻¹",
    shiftLabel: "x!",
    tone: "function",
    primary: postfix("^-1"),
    shift: postfix("!"),
    alphaLabel: "X",
    alpha: sym("X"),
    ariaLabel: "Reciprocal",
  },
  {
    id: "frac",
    label: "a/b",
    tone: "function",
    primary: op("/"),
    ariaLabel: "Fraction",
  },

  // Row 4 — calculus, separators, logs
  {
    id: "integral",
    label: "∫dx",
    shiftLabel: "d/dx",
    tone: "function",
    primary: call("integ", 3),
    shift: call("deriv", 2),
    ariaLabel: "Integral",
  },
  {
    id: "comma",
    label: ",",
    tone: "function",
    primary: { type: "insertToken", token: { kind: "comma" } },
    ariaLabel: "Comma",
  },
  {
    id: "hyp",
    label: "hyp",
    tone: "function",
    primary: { type: "toggleHyp" },
    alphaLabel: "C",
    alpha: sym("C"),
    ariaLabel: "Hyperbolic",
  },
  {
    id: "log",
    label: "log",
    shiftLabel: "10ˣ",
    tone: "function",
    primary: call("log", 1),
    shift: tenPower(),
    alphaLabel: "Y",
    alpha: sym("Y"),
    ariaLabel: "Logarithm",
  },
  {
    id: "ln",
    label: "ln",
    shiftLabel: "eˣ",
    tone: "function",
    primary: call("ln", 1),
    shift: ePower(),
    alphaLabel: "M",
    alpha: sym("M"),
    ariaLabel: "Natural logarithm",
  },

  // Row 5 — signs and trigonometry
  {
    id: "neg",
    label: "(−)",
    shiftLabel: "Ans",
    tone: "function",
    primary: op("-"),
    shift: sym("Ans"),
    alphaLabel: "A",
    alpha: sym("A"),
    ariaLabel: "Negative sign",
  },
  {
    id: "drg",
    label: "DRG",
    subLabel: "°′″",
    tone: "function",
    primary: ctl("drg"),
    alphaLabel: "B",
    alpha: sym("B"),
    ariaLabel: "Angle unit",
  },
  {
    id: "sin",
    label: "sin",
    shiftLabel: "sin⁻¹",
    tone: "function",
    primary: call("sin", 1),
    shift: call("asin", 1),
    alphaLabel: "D",
    alpha: sym("D"),
    ariaLabel: "Sine",
  },
  {
    id: "cos",
    label: "cos",
    shiftLabel: "cos⁻¹",
    tone: "function",
    primary: call("cos", 1),
    shift: call("acos", 1),
    alphaLabel: "E",
    alpha: sym("E"),
    ariaLabel: "Cosine",
  },
  {
    id: "tan",
    label: "tan",
    shiftLabel: "tan⁻¹",
    tone: "function",
    primary: call("tan", 1),
    shift: call("atan", 1),
    alphaLabel: "F",
    alpha: sym("F"),
    ariaLabel: "Tangent",
  },

  // Row 6 — parentheses and memory
  {
    id: "lparen",
    label: "(",
    tone: "function",
    primary: { type: "insertToken", token: { kind: "lparen" } },
    ariaLabel: "Open parenthesis",
  },
  {
    id: "rparen",
    label: ")",
    tone: "function",
    primary: { type: "insertToken", token: { kind: "rparen" } },
    ariaLabel: "Close parenthesis",
  },
  {
    id: "sto",
    label: "STO",
    tone: "function",
    primary: ctl("sto"),
    ariaLabel: "Store",
  },
  {
    id: "rcl",
    label: "RCL",
    tone: "function",
    primary: ctl("rcl"),
    ariaLabel: "Recall",
  },
  {
    id: "percent",
    label: "%",
    tone: "function",
    primary: postfix("%"),
    ariaLabel: "Percent",
  },

  // Row 7
  { id: "7", label: "7", tone: "number", primary: digit("7") },
  { id: "8", label: "8", tone: "number", primary: digit("8") },
  { id: "9", label: "9", tone: "number", primary: digit("9") },
  {
    id: "del",
    label: "DEL",
    shiftLabel: "INS",
    tone: "control",
    primary: ctl("delete"),
    shift: ctl("ins"),
    ariaLabel: "Delete",
  },
  {
    id: "ac",
    label: "AC",
    shiftLabel: "OFF",
    tone: "control",
    primary: ctl("clear"),
    shift: ctl("off"),
    ariaLabel: "All clear",
  },

  // Row 8
  { id: "4", label: "4", tone: "number", primary: digit("4") },
  { id: "5", label: "5", tone: "number", primary: digit("5") },
  { id: "6", label: "6", tone: "number", primary: digit("6") },
  {
    id: "mul",
    label: "×",
    tone: "operator",
    primary: op("*"),
    ariaLabel: "Multiply",
  },
  {
    id: "div",
    label: "÷",
    tone: "operator",
    primary: op("/"),
    ariaLabel: "Divide",
  },

  // Row 9
  { id: "1", label: "1", tone: "number", primary: digit("1") },
  { id: "2", label: "2", tone: "number", primary: digit("2") },
  { id: "3", label: "3", tone: "number", primary: digit("3") },
  {
    id: "add",
    label: "+",
    tone: "operator",
    primary: op("+"),
    ariaLabel: "Add",
  },
  {
    id: "sub",
    label: "−",
    tone: "operator",
    primary: op("-"),
    ariaLabel: "Subtract",
  },

  // Row 10
  { id: "0", label: "0", tone: "number", primary: digit("0") },
  {
    id: "dot",
    label: ".",
    tone: "number",
    primary: digit("."),
    ariaLabel: "Decimal point",
  },
  {
    id: "exp",
    label: "×10ˣ",
    shiftLabel: "π",
    tone: "number",
    primary: op("E"),
    shift: sym("pi"),
    ariaLabel: "Times ten to the power",
  },
  {
    id: "ans",
    label: "Ans",
    shiftLabel: "PreAns",
    tone: "function",
    primary: sym("Ans"),
    shift: sym("PreAns"),
    ariaLabel: "Answer",
  },
  {
    id: "equals",
    label: "=",
    tone: "equals",
    primary: ctl("equals"),
    ariaLabel: "Equals",
  },
];

/** Look up a key by id (used by tests and the physical keyboard mapping). */
export function keyById(id: string): KeyDef | undefined {
  return KEYS.find((key) => key.id === id);
}
