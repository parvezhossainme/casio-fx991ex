/** Catalogue of the functions the calculator understands. */

export type FunctionKind =
  "trig" | "invtrig" | "hyper" | "invhyper" | "plain" | "special";

export interface FunctionSpec {
  /** Canonical internal name (also the token name). */
  name: string;
  /** Text shown on the key / in the LCD. */
  label: string;
  /** mathjs function name, when the call is delegated to mathjs. */
  mathjs?: string;
  /** Number of arguments; the calculator only exposes fixed arity functions. */
  arity: number;
  kind: FunctionKind;
}

export const TRIG = new Set(["sin", "cos", "tan"]);
export const INVERSE_TRIG = new Set(["asin", "acos", "atan"]);

export const FUNCTIONS: Record<string, FunctionSpec> = {
  sin: { name: "sin", label: "sin", mathjs: "sin", arity: 1, kind: "trig" },
  cos: { name: "cos", label: "cos", mathjs: "cos", arity: 1, kind: "trig" },
  tan: { name: "tan", label: "tan", mathjs: "tan", arity: 1, kind: "trig" },
  asin: {
    name: "asin",
    label: "sin⁻¹",
    mathjs: "asin",
    arity: 1,
    kind: "invtrig",
  },
  acos: {
    name: "acos",
    label: "cos⁻¹",
    mathjs: "acos",
    arity: 1,
    kind: "invtrig",
  },
  atan: {
    name: "atan",
    label: "tan⁻¹",
    mathjs: "atan",
    arity: 1,
    kind: "invtrig",
  },
  sinh: {
    name: "sinh",
    label: "sinh",
    mathjs: "sinh",
    arity: 1,
    kind: "hyper",
  },
  cosh: {
    name: "cosh",
    label: "cosh",
    mathjs: "cosh",
    arity: 1,
    kind: "hyper",
  },
  tanh: {
    name: "tanh",
    label: "tanh",
    mathjs: "tanh",
    arity: 1,
    kind: "hyper",
  },
  asinh: {
    name: "asinh",
    label: "sinh⁻¹",
    mathjs: "asinh",
    arity: 1,
    kind: "invhyper",
  },
  acosh: {
    name: "acosh",
    label: "cosh⁻¹",
    mathjs: "acosh",
    arity: 1,
    kind: "invhyper",
  },
  atanh: {
    name: "atanh",
    label: "tanh⁻¹",
    mathjs: "atanh",
    arity: 1,
    kind: "invhyper",
  },
  log: { name: "log", label: "log", mathjs: "log10", arity: 1, kind: "plain" },
  ln: { name: "ln", label: "ln", mathjs: "log", arity: 1, kind: "plain" },
  logb: { name: "logb", label: "log", arity: 2, kind: "plain" },
  sqrt: { name: "sqrt", label: "√", mathjs: "sqrt", arity: 1, kind: "plain" },
  cbrt: { name: "cbrt", label: "∛", mathjs: "cbrt", arity: 1, kind: "plain" },
  abs: { name: "abs", label: "Abs", mathjs: "abs", arity: 1, kind: "plain" },
  conj: {
    name: "conj",
    label: "Conjg",
    mathjs: "conj",
    arity: 1,
    kind: "plain",
  },
  arg: { name: "arg", label: "Arg", mathjs: "arg", arity: 1, kind: "plain" },
  re: { name: "re", label: "Re", mathjs: "re", arity: 1, kind: "plain" },
  im: { name: "im", label: "Im", mathjs: "im", arity: 1, kind: "plain" },
  root: {
    name: "root",
    label: "ˣ√",
    mathjs: "nthRoot",
    arity: 2,
    kind: "plain",
  },
  round: {
    name: "round",
    label: "Rnd",
    mathjs: "round",
    arity: 1,
    kind: "plain",
  },
  nPr: {
    name: "nPr",
    label: "P",
    mathjs: "permutations",
    arity: 2,
    kind: "plain",
  },
  nCr: {
    name: "nCr",
    label: "C",
    mathjs: "combinations",
    arity: 2,
    kind: "plain",
  },
  gcd: { name: "gcd", label: "GCD", mathjs: "gcd", arity: 2, kind: "plain" },
  lcm: { name: "lcm", label: "LCM", mathjs: "lcm", arity: 2, kind: "plain" },
  mod: { name: "mod", label: "Mod", mathjs: "mod", arity: 2, kind: "plain" },
  Pol: { name: "Pol", label: "Pol", arity: 2, kind: "plain" },
  Rec: { name: "Rec", label: "Rec", arity: 2, kind: "plain" },
  RanInt: { name: "RanInt", label: "RanInt", arity: 2, kind: "plain" },
  Ran: { name: "Ran", label: "Ran#", arity: 0, kind: "plain" },
  integ: { name: "integ", label: "∫", arity: 3, kind: "special" },
  deriv: { name: "deriv", label: "d/dx", arity: 2, kind: "special" },
  sum: { name: "sum", label: "Σ", arity: 3, kind: "special" },
};

export const SPECIAL_FUNCTIONS = new Set(
  Object.values(FUNCTIONS)
    .filter((f) => f.kind === "special")
    .map((f) => f.name),
);

export function functionLabel(name: string): string {
  return FUNCTIONS[name]?.label ?? name;
}
