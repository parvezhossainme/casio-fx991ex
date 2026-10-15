"use client";

import { useState } from "react";
import { ErrorNote, ModePanel } from "./shared";
import { Button } from "@/components/ui/button";
import { formatNumberText, isCalculatorError } from "@/lib/engine";
import {
  createMatrix,
  determinant,
  identity,
  inverse,
  matAdd,
  matMul,
  matSub,
  matTranspose,
  type Matrix,
} from "@/lib/modes/matrix";

type Operation = "A+B" | "A-B" | "AxB" | "detA" | "invA" | "trnA" | "I";

const OPERATIONS: Operation[] = [
  "A+B",
  "A-B",
  "AxB",
  "detA",
  "invA",
  "trnA",
  "I",
];

function MatrixGrid({
  prefix,
  rows,
  cols,
}: {
  prefix: string;
  rows: number;
  cols: number;
}) {
  const grid = createMatrix(rows, cols);
  return (
    <div className="inline-block">
      {grid.map((row, i) => (
        <div key={i} className="flex gap-1 pb-1">
          {row.map((_, j) => (
            <input
              key={j}
              className="calc-slot w-16 text-center"
              name={`${prefix}${i}-${j}`}
              defaultValue={prefix === "a" && i === j ? "1" : "0"}
              aria-label={`Matrix ${prefix.toUpperCase()} row ${i + 1} column ${j + 1}`}
              inputMode="text"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function readMatrix(
  data: FormData,
  prefix: string,
  rows: number,
  cols: number,
): Matrix {
  const matrix = createMatrix(rows, cols);
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      const raw = String(data.get(`${prefix}${i}-${j}`) ?? "0").trim();
      const value = raw === "" ? 0 : Number(raw);
      matrix[i]![j] = Number.isNaN(value) ? 0 : value;
    }
  }
  return matrix;
}

export function MatrixMode() {
  const [rowsA, setRowsA] = useState(2);
  const [colsA, setColsA] = useState(2);
  const [rowsB, setRowsB] = useState(2);
  const [colsB, setColsB] = useState(2);
  const [operation, setOperation] = useState<Operation>("A+B");
  const [result, setResult] = useState<{
    label: string;
    matrix?: Matrix;
    scalar?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);
    try {
      const a = readMatrix(data, "a", rowsA, colsA);
      const b = readMatrix(data, "b", rowsB, colsB);
      switch (operation) {
        case "A+B":
          setResult({ label: "A + B", matrix: matAdd(a, b) });
          break;
        case "A-B":
          setResult({ label: "A − B", matrix: matSub(a, b) });
          break;
        case "AxB":
          setResult({ label: "A × B", matrix: matMul(a, b) });
          break;
        case "detA":
          setResult({ label: "det(A)", scalar: determinant(a) });
          break;
        case "invA":
          setResult({ label: "A⁻¹", matrix: inverse(a) });
          break;
        case "trnA":
          setResult({ label: "Aᵀ", matrix: matTranspose(a) });
          break;
        case "I":
          setResult({ label: "Identity", matrix: identity(rowsA) });
          break;
      }
    } catch (caught) {
      setResult(null);
      setError(isCalculatorError(caught) ? caught.code : "Error");
    }
  };

  return (
    <ModePanel
      title="Matrix"
      subtitle="Up to 4×4. A + B, A − B, A × B, determinant, inverse, transpose."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="mb-1 text-[0.7rem] uppercase tracking-wide text-foreground/60">
              Matrix A
            </p>
            <div className="mb-2 flex items-center gap-1">
              <SizeSelect label="Rows A" value={rowsA} onChange={setRowsA} />
              <span className="text-xs text-foreground/60">×</span>
              <SizeSelect label="Columns A" value={colsA} onChange={setColsA} />
            </div>
            <MatrixGrid prefix="a" rows={rowsA} cols={colsA} />
          </div>

          <div>
            <p className="mb-1 text-[0.7rem] uppercase tracking-wide text-foreground/60">
              Matrix B
            </p>
            <div className="mb-2 flex items-center gap-1">
              <SizeSelect label="Rows B" value={rowsB} onChange={setRowsB} />
              <span className="text-xs text-foreground/60">×</span>
              <SizeSelect label="Columns B" value={colsB} onChange={setColsB} />
            </div>
            <MatrixGrid prefix="b" rows={rowsB} cols={colsB} />
          </div>
        </div>

        <div>
          <p className="mb-1 text-[0.7rem] uppercase tracking-wide text-foreground/60">
            Operation
          </p>
          <div className="flex flex-wrap gap-1.5">
            {OPERATIONS.map((entry) => (
              <Button
                key={entry}
                type="button"
                size="xs"
                variant={operation === entry ? "default" : "outline"}
                onClick={() => setOperation(entry)}
              >
                {entry}
              </Button>
            ))}
          </div>
        </div>

        <Button type="submit" size="sm">
          Execute
        </Button>
      </form>

      <ErrorNote message={error} />

      {result && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-foreground/60">{result.label}</p>
          {result.scalar !== undefined && (
            <p className="font-mono text-lg" data-testid="matrix-result">
              {formatNumberText(result.scalar)}
            </p>
          )}
          {result.matrix && (
            <div className="font-mono text-sm" data-testid="matrix-result">
              {result.matrix.map((row, i) => (
                <div key={i} className="flex gap-4">
                  {row.map((value, j) => (
                    <span key={j} className="w-20 text-right">
                      {formatNumberText(value)}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ModePanel>
  );
}

function SizeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <select
      aria-label={label}
      className="calc-slot w-14"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      {[1, 2, 3, 4].map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
  );
}
