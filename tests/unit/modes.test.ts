import { describe, expect, it } from "vitest";
import {
  applyOperation,
  formatInBase,
  parseInBase,
  representations,
} from "@/lib/modes/basen";
import { polynomialRoots, solveLinearSystem } from "@/lib/modes/equation";
import {
  determinant,
  identity,
  inverse,
  matAdd,
  matMul,
  matTranspose,
} from "@/lib/modes/matrix";
import { linearRegression, oneVariableStats } from "@/lib/modes/stats";
import {
  angleBetween,
  cross,
  dot,
  magnitude,
  unitVector,
  vAdd,
} from "@/lib/modes/vector";
import {
  formatIntervals,
  solvePolynomialInequality,
} from "@/lib/modes/inequality";
import { ratioText, simplifyRatio, solveProportion } from "@/lib/modes/ratio";
import {
  binomialCdf,
  binomialPdf,
  inverseNormal,
  normalCdf,
  normalPdf,
  poissonPdf,
} from "@/lib/modes/distribution";
import {
  evaluateSheet,
  expandRange,
  parseRef,
  refName,
} from "@/lib/modes/spreadsheet";

describe("matrix", () => {
  it("computes a 2x2 determinant", () => {
    expect(
      determinant([
        [1, 2],
        [3, 4],
      ]),
    ).toBeCloseTo(-2, 12);
  });

  it("computes a 3x3 determinant", () => {
    expect(
      determinant([
        [6, 1, 1],
        [4, -2, 5],
        [2, 8, 7],
      ]),
    ).toBeCloseTo(-306, 9);
  });

  it("inverts a matrix and round-trips through multiplication", () => {
    const a = [
      [4, 7],
      [2, 6],
    ];
    const inv = inverse(a);
    expect(inv[0]![0]).toBeCloseTo(0.6, 12);
    expect(inv[0]![1]).toBeCloseTo(-0.7, 12);
    const product = matMul(a, inv);
    expect(product[0]![0]).toBeCloseTo(1, 12);
    expect(product[0]![1]).toBeCloseTo(0, 12);
    expect(product[1]![1]).toBeCloseTo(1, 12);
  });

  it("throws on a singular matrix", () => {
    expect(() =>
      inverse([
        [1, 2],
        [2, 4],
      ]),
    ).toThrow();
  });

  it("adds, multiplies and transposes", () => {
    expect(matAdd([[1, 2]], [[3, 4]])).toEqual([[4, 6]]);
    expect(matTranspose([[1, 2, 3]])).toEqual([[1], [2], [3]]);
    expect(
      matMul(
        [
          [1, 2],
          [3, 4],
        ],
        identity(2),
      ),
    ).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("reports a dimension error for mismatched shapes", () => {
    expect(() => matAdd([[1, 2]], [[1]])).toThrow(/dimension/i);
  });
});

describe("vector", () => {
  it("adds vectors", () => {
    expect(vAdd([1, 2], [3, 4])).toEqual([4, 6]);
  });

  it("computes dot and cross products", () => {
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32);
    expect(cross([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
  });

  it("computes magnitude, unit vector and angle", () => {
    expect(magnitude([3, 4])).toBe(5);
    expect(unitVector([3, 4])).toEqual([0.6, 0.8]);
    expect(angleBetween([1, 0], [0, 1])).toBeCloseTo(Math.PI / 2, 12);
  });
});

describe("base-n", () => {
  it("parses and formats values in different bases", () => {
    expect(parseInBase("FF", 16)).toBe(255);
    expect(parseInBase("1010", 2)).toBe(10);
    expect(formatInBase(255, 16)).toBe("FF");
    expect(formatInBase(10, 2)).toBe("1010");
  });

  it("applies logic operations on a 32-bit word", () => {
    expect(applyOperation(0b1100, 0b1010, "and")).toBe(0b1000);
    expect(applyOperation(0b1100, 0b1010, "or")).toBe(0b1110);
    expect(applyOperation(0b1100, 0b1010, "xor")).toBe(0b0110);
    expect(applyOperation(1, 4, "shl")).toBe(16);
  });

  it("shows negative values in two's complement", () => {
    const reps = representations(-1);
    expect(reps.HEX).toBe("FFFFFFFF");
  });
});

describe("statistics", () => {
  it("computes one-variable statistics", () => {
    const stats = oneVariableStats([1, 2, 3, 4, 5]);
    expect(stats.n).toBe(5);
    expect(stats.sum).toBe(15);
    expect(stats.mean).toBe(3);
    expect(stats.median).toBe(3);
    expect(stats.q1).toBeCloseTo(1.5, 12);
    expect(stats.q3).toBeCloseTo(4.5, 12);
    expect(stats.populationStdDev).toBeCloseTo(Math.SQRT2, 12);
    expect(stats.sampleStdDev).toBeCloseTo(Math.sqrt(2.5), 12);
  });

  it("honours frequencies", () => {
    const stats = oneVariableStats([1, 2], [3, 1]);
    expect(stats.n).toBe(4);
    expect(stats.mean).toBeCloseTo(1.25, 12);
  });

  it("computes a perfect linear regression", () => {
    const regression = linearRegression([1, 2, 3], [2, 4, 6]);
    expect(regression.a).toBeCloseTo(0, 12);
    expect(regression.b).toBeCloseTo(2, 12);
    expect(regression.r).toBeCloseTo(1, 12);
  });
});

describe("distribution", () => {
  it("computes normal density and cumulative probability", () => {
    expect(normalPdf(0, 0, 1)).toBeCloseTo(0.3989422804, 9);
    expect(normalCdf(0, 1, 0, 1)).toBeCloseTo(0.3413447461, 8);
  });

  it("inverts the normal cumulative distribution", () => {
    expect(inverseNormal(0.975, 0, 1)).toBeCloseTo(1.959963985, 6);
  });

  it("computes binomial probabilities", () => {
    expect(binomialPdf(2, 5, 0.5)).toBeCloseTo(0.3125, 12);
    expect(binomialCdf(2, 5, 0.5)).toBeCloseTo(0.5, 12);
  });

  it("computes Poisson probabilities", () => {
    expect(poissonPdf(2, 3)).toBeCloseTo(0.2240418077, 9);
  });
});

describe("equation", () => {
  it("solves a simultaneous linear system", () => {
    expect(
      solveLinearSystem(
        [
          [2, 1],
          [1, -1],
        ],
        [5, 1],
      ),
    ).toEqual([2, 1]);
  });

  it("finds real roots of a quadratic", () => {
    const roots = polynomialRoots([1, -3, 2])
      .map((root) => root.re)
      .sort((a, b) => a - b);
    expect(roots[0]).toBeCloseTo(1, 9);
    expect(roots[1]).toBeCloseTo(2, 9);
  });

  it("finds complex roots", () => {
    const roots = polynomialRoots([1, 0, 1]);
    expect(roots.every((root) => Math.abs(Math.abs(root.im) - 1) < 1e-6)).toBe(
      true,
    );
  });
});

describe("inequality", () => {
  it("solves a quadratic inequality", () => {
    const intervals = solvePolynomialInequality([1, -4, 3], ">=");
    expect(formatIntervals(intervals)).toBe("x ≤ 1  or  x ≥ 3");
  });

  it("solves a strict inequality with open endpoints", () => {
    const intervals = solvePolynomialInequality([1, -4, 3], ">");
    expect(formatIntervals(intervals)).toBe("x < 1  or  x > 3");
  });

  it("handles a double root", () => {
    expect(formatIntervals(solvePolynomialInequality([1, -2, 1], ">="))).toBe(
      "all real numbers",
    );
    expect(formatIntervals(solvePolynomialInequality([1, -2, 1], "<"))).toBe(
      "no solution",
    );
  });
});

describe("ratio", () => {
  it("simplifies ratios", () => {
    expect(simplifyRatio(4, 6)).toEqual([2, 3]);
    expect(ratioText(10, 5)).toBe("2:1");
  });

  it("solves a proportion for the missing term", () => {
    expect(solveProportion([1, 2, 3, null])).toEqual([1, 2, 3, 6]);
    expect(solveProportion([null, 2, 3, 6])).toEqual([1, 2, 3, 6]);
  });
});

describe("spreadsheet", () => {
  it("converts between reference names and coordinates", () => {
    expect(parseRef("A1")).toEqual({ column: 0, row: 0 });
    expect(refName(1, 2)).toBe("B3");
    expect(expandRange("A1", "A3")).toEqual(["A1", "A2", "A3"]);
  });

  it("evaluates formulas with references and ranges", () => {
    const result = evaluateSheet({
      A1: "1",
      A2: "2",
      A3: "=A1+A2",
      B1: "=SUM(A1:A3)",
      B2: "=AVERAGE(A1:A3)",
      B3: "=A3*2",
    });
    expect(result.errors).toEqual({});
    expect(result.values.A3).toBe(3);
    expect(result.values.B1).toBe(6);
    expect(result.values.B2).toBe(2);
    expect(result.values.B3).toBe(6);
  });

  it("detects circular references", () => {
    const result = evaluateSheet({ A1: "=A2", A2: "=A1" });
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });
});
