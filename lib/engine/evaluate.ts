import { all, create, type Complex } from "mathjs";
import { type AstNode, isSpecialCall, parseTokens } from "./ast";
import { type AngleUnit, radiansPerUnit } from "./types";
import { toMathString, type SerializeContext } from "./serialize";
import { integrate, derivative, summation } from "./numeric";
import { toCalculatorError, syntaxError, mathError } from "./errors";
import { type Token } from "./tokens";

/**
 * A restricted mathjs instance. The calculator never evaluates raw user JavaScript: the only
 * strings handed to mathjs are produced by our own serialiser from a closed token vocabulary.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const math = create(all as any, { number: "number" });

export type EvalResult = number | Complex | number[];

export interface VariableMap {
  A?: number;
  B?: number;
  C?: number;
  D?: number;
  E?: number;
  F?: number;
  X?: number;
  Y?: number;
  M?: number;
}

export interface EvalContext {
  angleUnit: AngleUnit;
  variables?: VariableMap;
  ans?: number;
  preAns?: number;
}

const VARIABLE_NAMES: (keyof VariableMap)[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "X",
  "Y",
  "M",
];

function buildScope(ctx: EvalContext): Record<string, unknown> {
  const unit = radiansPerUnit(ctx.angleUnit);
  const scope: Record<string, unknown> = {
    pi: Math.PI,
    e: Math.E,
    Ans: ctx.ans ?? 0,
    PreAns: ctx.preAns ?? 0,
    Pol: (x: number, y: number): number[] => [
      Math.hypot(x, y),
      Math.atan2(y, x) / unit,
    ],
    Rec: (r: number, theta: number): number[] => [
      r * Math.cos(theta * unit),
      r * Math.sin(theta * unit),
    ],
    RanInt: (a: number, b: number): number => {
      const lo = Math.ceil(a);
      const hi = Math.floor(b);
      return Math.floor(lo + Math.random() * (hi - lo + 1));
    },
    Ran: (): number => Math.random(),
  };

  for (const name of VARIABLE_NAMES) {
    scope[name] = ctx.variables?.[name] ?? 0;
  }
  return scope;
}

function coerce(raw: unknown): EvalResult {
  if (typeof raw === "number") return raw;
  if (typeof raw === "boolean") return raw ? 1 : 0;
  if (Array.isArray(raw))
    return raw.map((item) => Number(coerce(item as unknown)));
  if (typeof raw === "bigint") return Number(raw);

  if (raw && typeof raw === "object") {
    const value = raw as {
      isComplex?: boolean;
      re?: number;
      im?: number;
      isFraction?: boolean;
      isBigNumber?: boolean;
      isMatrix?: boolean;
      isUnit?: boolean;
      toArray?: () => unknown;
      valueOf?: () => number | string;
    };
    if (
      value.isComplex &&
      typeof value.re === "number" &&
      typeof value.im === "number"
    ) {
      return value.im === 0 ? value.re : math.complex(value.re, value.im);
    }
    if (value.isMatrix && typeof value.toArray === "function") {
      const arr = value.toArray();
      if (Array.isArray(arr)) {
        const flat = arr.flat(Infinity as 1) as unknown[];
        return flat.map((item) => Number(coerce(item as unknown)));
      }
    }
    if (value.isUnit)
      throw mathError("Unit results are not supported in Calculate mode");
    if (typeof value.valueOf === "function") {
      const numeric = Number(value.valueOf());
      if (!Number.isNaN(numeric)) return numeric;
    }
  }

  throw mathError("Result could not be interpreted");
}

function evalSubNumber(node: AstNode, ctx: EvalContext): number {
  const value = evaluateAst(node, ctx);
  if (typeof value === "number") return value;
  throw mathError("Expected a real number argument");
}

/** Compile an AST that may reference X into a fast numeric function of x. */
export function compileInX(
  node: AstNode,
  ctx: EvalContext,
): (x: number) => number {
  const scope = buildScope(ctx);
  const ctxWithResolver: SerializeContext = {
    angleUnit: ctx.angleUnit,
    resolveSpecial: (call) => resolveSpecial(call, ctx),
  };
  const compiled = math.compile(toMathString(node, ctxWithResolver));
  return (x: number): number => {
    const raw = compiled.evaluate({ ...scope, X: x });
    const coerced = coerce(raw);
    if (typeof coerced !== "number") throw mathError("Non-real result");
    return coerced;
  };
}

function resolveSpecial(
  node: Extract<AstNode, { type: "call" }>,
  ctx: EvalContext,
): number {
  const [first, second, third] = node.args;
  if (!first) throw syntaxError(`${node.name} expects an expression`);

  if (node.name === "integ") {
    const f = compileInX(first, ctx);
    const a = second ? evalSubNumber(second, ctx) : 0;
    const b = third ? evalSubNumber(third, ctx) : 1;
    return integrate(f, a, b);
  }

  if (node.name === "deriv") {
    const f = compileInX(first, ctx);
    const at = second ? evalSubNumber(second, ctx) : 0;
    return derivative(f, at);
  }

  if (node.name === "sum") {
    const f = compileInX(first, ctx);
    const from = second ? evalSubNumber(second, ctx) : 1;
    const to = third ? evalSubNumber(third, ctx) : 1;
    return summation(f, from, to);
  }

  throw syntaxError(`Unknown operation ${node.name}`);
}

/** Evaluate a parsed AST. Throws a `CalculatorError` for any user-facing failure. */
export function evaluateAst(node: AstNode, ctx: EvalContext): EvalResult {
  try {
    const scope = buildScope(ctx);
    const serializeContext: SerializeContext = {
      angleUnit: ctx.angleUnit,
      resolveSpecial: (call) => resolveSpecial(call, ctx),
    };
    const expression = toMathString(node, serializeContext);
    const raw = math.evaluate(expression, scope);
    const result = coerce(raw);
    if (typeof result === "number" && !Number.isFinite(result)) {
      throw mathError("Result is infinite or undefined");
    }
    return result;
  } catch (error) {
    throw toCalculatorError(error);
  }
}

/** Evaluate a raw token buffer. */
export function evaluateTokens(tokens: Token[], ctx: EvalContext): EvalResult {
  return evaluateAst(parseTokens(tokens), ctx);
}

/** True when the AST is a bare special call (∫/d-dx/Σ) — used by tests and docs. */
export function isSpecialExpression(node: AstNode): boolean {
  return isSpecialCall(node);
}

export { math };
