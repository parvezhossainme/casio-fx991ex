export * from "./tokens";
export * from "./ast";
export * from "./serialize";
export * from "./lex";
export * from "./evaluate";
export * from "./format";
export * from "./result";
export * from "./errors";
export * from "./types";
export * from "./numeric";
export * from "./fraction";
export * from "./functions";

import { lex } from "./lex";
import { type AngleUnit } from "./types";
import { evaluateTokens, type EvalContext, type EvalResult } from "./evaluate";

/** Convenience: lex + evaluate a human-readable expression. Handy in tests and simple modes. */
export function evaluateExpression(
  source: string,
  ctx: Partial<EvalContext> & { angleUnit?: AngleUnit } = {},
): EvalResult {
  return evaluateTokens(lex(source), {
    angleUnit: ctx.angleUnit ?? "DEG",
    variables: ctx.variables,
    ans: ctx.ans,
    preAns: ctx.preAns,
  });
}
