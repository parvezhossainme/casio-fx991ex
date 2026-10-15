import { type AstNode, isSpecialCall } from "./ast";
import { FUNCTIONS, INVERSE_TRIG, TRIG } from "./functions";
import { type AngleUnit } from "./types";
import { syntaxError } from "./errors";

export interface SerializeContext {
  angleUnit: AngleUnit;
  /** Resolves a special call (∫, d/dx, Σ, Pol, Rec, RanInt) to a numeric literal. */
  resolveSpecial?: (node: Extract<AstNode, { type: "call" }>) => number;
}

function forwardFactor(unit: AngleUnit): string | null {
  if (unit === "DEG") return "pi/180";
  if (unit === "GRA") return "pi/200";
  return null;
}

function inverseFactor(unit: AngleUnit): string | null {
  if (unit === "DEG") return "180/pi";
  if (unit === "GRA") return "200/pi";
  return null;
}

function normalizeNumber(text: string): string {
  let t = text;
  if (t.startsWith(".")) t = `0${t}`;
  if (t.endsWith(".")) t = `${t}0`;
  if (t === "" || t === ".") t = "0";
  return t;
}

/**
 * Convert the AST into a mathjs expression string. Children are wrapped in parentheses so the
 * regenerated expression cannot be mis-associated, and no `eval`/`new Function` is ever involved.
 */
export function toMathString(node: AstNode, ctx: SerializeContext): string {
  switch (node.type) {
    case "number":
      return normalizeNumber(node.text);

    case "symbol":
      return node.name;

    case "unary": {
      const inner = toMathString(node.operand, ctx);
      return node.op === "-" ? `-(${inner})` : `+(${inner})`;
    }

    case "postfix": {
      const inner = toMathString(node.operand, ctx);
      if (node.op === "!") return `(${inner})!`;
      if (node.op === "%") return `(${inner})/100`;
      return `(${inner})^(-1)`;
    }

    case "binary": {
      if (node.op === "E") {
        return `(${toMathString(node.left, ctx)})*10^(${toMathString(node.right, ctx)})`;
      }
      const left = toMathString(node.left, ctx);
      const right = toMathString(node.right, ctx);
      return `(${left})${node.op}(${right})`;
    }

    case "group":
      return `(${toMathString(node.expr, ctx)})`;

    case "root": {
      const fn = node.name === "sqrt" ? "sqrt" : "cbrt";
      return `${fn}(${toMathString(node.radicand, ctx)})`;
    }

    case "call": {
      if (isSpecialCall(node)) {
        if (!ctx.resolveSpecial)
          throw syntaxError(`Cannot serialise ${node.name} without a resolver`);
        const value = ctx.resolveSpecial(node);
        if (Number.isNaN(value)) throw syntaxError("Invalid argument");
        return `(${value})`;
      }

      const spec = FUNCTIONS[node.name];
      const args = node.args.map((arg) => toMathString(arg, ctx));

      if (node.name === "logb") {
        const [base = "10", value = "0"] = args;
        return `log((${value}),(${base}))`;
      }

      if (node.name === "root") {
        const [index = "2", radicand = "0"] = args;
        return `nthRoot((${radicand}),(${index}))`;
      }

      if (TRIG.has(node.name)) {
        const fn = spec?.mathjs ?? node.name;
        const factor = forwardFactor(ctx.angleUnit);
        if (factor && args[0] !== undefined)
          return `${fn}((${args[0]})*${factor})`;
        return `${fn}(${args.join(",")})`;
      }

      if (INVERSE_TRIG.has(node.name)) {
        const factor = inverseFactor(ctx.angleUnit);
        const call = `${spec?.mathjs ?? node.name}(${args.join(",")})`;
        return factor ? `((${call})*${factor})` : call;
      }

      return `${spec?.mathjs ?? node.name}(${args.join(",")})`;
    }

    case "row":
      return node.children.map((child) => toMathString(child, ctx)).join("*");

    case "empty":
      throw syntaxError("Incomplete expression");

    case "raw":
      throw syntaxError("Unexpected token");
  }
}

/** True when the tree is structurally complete enough to be evaluated. */
export function isComplete(node: AstNode): boolean {
  switch (node.type) {
    case "empty":
    case "raw":
      return false;
    case "unary":
    case "postfix":
      return isComplete(node.operand);
    case "root":
      return isComplete(node.radicand);
    case "group":
      return isComplete(node.expr);
    case "binary":
      return isComplete(node.left) && isComplete(node.right);
    case "call":
      return node.args.every(isComplete);
    case "row":
      return node.children.every(isComplete);
    default:
      return true;
  }
}
