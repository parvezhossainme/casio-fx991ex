import { describe, expect, it } from "vitest";
import {
  evaluateExpression,
  lex,
  parseTokens,
  toMathString,
  formatNumber,
  decimalToFraction,
  asPiMultiple,
  asSurd,
  simplifyRadicand,
  type EvalContext,
} from "@/lib/engine";
import { CalculatorError } from "@/lib/engine/errors";

function num(expr: string, ctx?: Partial<EvalContext>): number {
  const value = evaluateExpression(expr, ctx);
  if (typeof value !== "number")
    throw new Error(`expected a number, received ${typeof value}`);
  return value;
}

function errorCode(expr: string, ctx?: Partial<EvalContext>): string {
  try {
    evaluateExpression(expr, ctx);
  } catch (error) {
    if (error instanceof CalculatorError) return error.code;
    throw error;
  }
  throw new Error(`expected ${expr} to fail`);
}

describe("arithmetic and precedence", () => {
  it("respects multiplication before addition", () => {
    expect(num("2+3*4")).toBe(14);
  });

  it("respects explicit parentheses", () => {
    expect(num("(2+3)*4")).toBe(20);
  });

  it("handles nested parentheses", () => {
    expect(num("((1+2)*(3+4))")).toBe(21);
  });

  it("evaluates division and decimals", () => {
    expect(num("1/2")).toBe(0.5);
    expect(num("7.5/2.5")).toBe(3);
  });

  it("treats unary minus as binding looser than power", () => {
    expect(num("-2^2")).toBe(-4);
  });

  it("allows a negative exponent", () => {
    expect(num("2^-3")).toBe(0.125);
  });

  it("makes exponentiation right associative", () => {
    expect(num("2^3^2")).toBe(512);
  });

  it("supports implicit multiplication", () => {
    expect(num("3(4)")).toBe(12);
    expect(num("2(3+4)")).toBe(14);
    expect(num("2π")).toBeCloseTo(2 * Math.PI, 12);
  });

  it("supports the power-of-ten operator", () => {
    expect(num("2ᴇ3")).toBe(2000);
    expect(num("1.5ᴇ-2")).toBeCloseTo(0.015, 12);
  });
});

describe("scientific functions", () => {
  it("computes degrees trigonometry", () => {
    expect(num("sin(30)", { angleUnit: "DEG" })).toBeCloseTo(0.5, 12);
    expect(num("cos(60)", { angleUnit: "DEG" })).toBeCloseTo(0.5, 12);
    expect(num("tan(45)", { angleUnit: "DEG" })).toBeCloseTo(1, 12);
  });

  it("computes radian trigonometry", () => {
    expect(num("sin(pi/2)", { angleUnit: "RAD" })).toBeCloseTo(1, 12);
  });

  it("computes gradian trigonometry", () => {
    expect(num("sin(100)", { angleUnit: "GRA" })).toBeCloseTo(1, 12);
  });

  it("computes inverse trigonometry in the active unit", () => {
    expect(num("asin(0.5)", { angleUnit: "DEG" })).toBeCloseTo(30, 10);
    expect(num("atan(1)", { angleUnit: "DEG" })).toBeCloseTo(45, 10);
  });

  it("computes hyperbolic functions", () => {
    expect(num("sinh(0)")).toBeCloseTo(0, 12);
    expect(num("cosh(0)")).toBeCloseTo(1, 12);
  });

  it("computes logarithms", () => {
    expect(num("log(1000)")).toBeCloseTo(3, 12);
    expect(num("ln(e)")).toBeCloseTo(1, 12);
    expect(num("logb(2,8)")).toBeCloseTo(3, 12);
  });

  it("computes roots", () => {
    expect(num("√9")).toBeCloseTo(3, 12);
    expect(num("√(16)")).toBeCloseTo(4, 12);
    expect(num("cbrt(27)")).toBeCloseTo(3, 12);
  });

  it("computes factorial", () => {
    expect(num("5!")).toBe(120);
    expect(num("0!")).toBe(1);
  });

  it("computes permutations and combinations", () => {
    expect(num("nPr(5,2)")).toBe(20);
    expect(num("nCr(5,2)")).toBe(10);
  });

  it("computes gcd, lcm and mod", () => {
    expect(num("gcd(12,18)")).toBe(6);
    expect(num("lcm(4,6)")).toBe(12);
    expect(num("mod(7,3)")).toBe(1);
  });

  it("computes absolute value", () => {
    expect(num("abs(-3.5)")).toBe(3.5);
  });

  it("applies postfix percent and reciprocal", () => {
    expect(num("50%")).toBeCloseTo(0.5, 12);
    expect(num("2⁻¹")).toBeCloseTo(0.5, 12);
  });
});

describe("numeric calculus", () => {
  it("integrates a polynomial", () => {
    expect(num("integ(X^2,0,1)")).toBeCloseTo(1 / 3, 8);
  });

  it("integrates a trigonometric function", () => {
    expect(num("integ(sin(X),0,pi)", { angleUnit: "RAD" })).toBeCloseTo(2, 8);
  });

  it("differentiates at a point", () => {
    expect(num("deriv(X^2,3)")).toBeCloseTo(6, 6);
  });

  it("sums a series", () => {
    expect(num("sum(X,1,10)")).toBe(55);
  });
});

describe("variables and memory", () => {
  it("reads variables from the context", () => {
    expect(num("A+B", { variables: { A: 2, B: 3 } })).toBe(5);
  });

  it("defaults unset variables to zero", () => {
    expect(num("A")).toBe(0);
  });

  it("exposes Ans and PreAns", () => {
    expect(num("Ans+1", { ans: 41 })).toBe(42);
    expect(num("PreAns*2", { preAns: 5 })).toBe(10);
  });
});

describe("error handling", () => {
  it("reports a math error on division by zero", () => {
    expect(errorCode("1/0")).toBe("Math Error");
  });

  it("reports a syntax error for incomplete input", () => {
    expect(errorCode("2+")).toBe("Syntax Error");
  });

  it("reports an error for empty input", () => {
    expect(errorCode("")).toBe("Syntax Error");
  });

  it("reports a math error for an undefined result", () => {
    expect(errorCode("ln(0)")).toBe("Math Error");
  });
});

describe("formatting", () => {
  it("formats ordinary numbers with the 10-digit display", () => {
    expect(formatNumber(1 / 3).mantissa).toBe("0.3333333333");
    expect(formatNumber(42).mantissa).toBe("42");
  });

  it("uses exponential notation for large values", () => {
    const formatted = formatNumber(1.234e12);
    expect(formatted.exponent).toBe(12);
    expect(formatted.mantissa).toBe("1.234");
  });

  it("switches to exponential earlier under Norm 2", () => {
    expect(formatNumber(0.001234).exponent).toBeNull();
    expect(
      formatNumber(0.001234, { mode: "norm", which: 2 }).exponent,
    ).toBeNull();
    expect(formatNumber(0.0001234, { mode: "norm", which: 2 }).exponent).toBe(
      -4,
    );
  });

  it("honours Fix and Sci modes", () => {
    expect(formatNumber(1.23456, { mode: "fix", digits: 2 }).text).toBe("1.23");
    expect(formatNumber(1234.5, { mode: "sci", digits: 3 }).mantissa).toBe(
      "1.23",
    );
  });

  it("uses engineering exponents that are multiples of three", () => {
    const formatted = formatNumber(12345, { mode: "eng" });
    expect(formatted.exponent).toBe(3);
    expect(formatted.mantissa).toBe("12.345");
  });
});

describe("exact forms", () => {
  it("reconstructs simple fractions", () => {
    expect(decimalToFraction(0.5)).toEqual({ n: 1, d: 2 });
    expect(decimalToFraction(0.75)).toEqual({ n: 3, d: 4 });
    expect(decimalToFraction(1 / 3)?.d).toBe(3);
  });

  it("recognises π multiples", () => {
    expect(asPiMultiple(Math.PI / 2)).toBe("π/2");
    expect(asPiMultiple(Math.PI)).toBe("π");
  });

  it("recognises simple surds", () => {
    expect(asSurd(Math.SQRT2)).toBe("√2");
    expect(asSurd(2 * Math.SQRT2)).toBe("2√2");
  });

  it("keeps the denominator when the radicand reduces to a whole number", () => {
    expect(asSurd(3.5)).toBe("7/2");
    expect(asSurd(0.25)).toBe("1/4");
  });

  it("pulls perfect squares out of a radicand", () => {
    expect(simplifyRadicand(12)).toEqual({ outside: 2, inside: 3 });
  });
});

describe("parser and serializer", () => {
  it("round-trips a token buffer through the AST and back to a mathjs string", () => {
    const tokens = lex("2+3*4");
    const ast = parseTokens(tokens);
    expect(toMathString(ast, { angleUnit: "DEG" })).toBe("(2)+((3)*(4))");
  });

  it("wraps degrees trig arguments for the evaluator", () => {
    const ast = parseTokens(lex("sin(30)"));
    expect(toMathString(ast, { angleUnit: "DEG" })).toBe("sin((30)*pi/180)");
  });

  it("does not wrap radian trig arguments", () => {
    const ast = parseTokens(lex("sin(30)"));
    expect(toMathString(ast, { angleUnit: "RAD" })).toBe("sin(30)");
  });
});
