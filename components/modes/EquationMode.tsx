"use client";

import { useRef, useState } from "react";
import { ErrorNote, ModePanel, ResultRow } from "./shared";
import { Button } from "@/components/ui/button";
import { isCalculatorError, formatNumberText } from "@/lib/engine";
import { polynomialRoots, solveLinearSystem } from "@/lib/modes/equation";
import type { Cx } from "@/lib/modes/complex";

type Kind = "simultaneous" | "polynomial";

function formatRoot(root: Cx): string {
  if (Math.abs(root.im) < 1e-9) return formatNumberText(root.re);
  const imaginary = formatNumberText(Math.abs(root.im));
  const coefficient = Math.abs(root.im) === 1 ? "" : imaginary;
  return `${formatNumberText(root.re)} ${root.im < 0 ? "−" : "+"} ${coefficient}i`;
}

export function EquationMode() {
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<Kind>("simultaneous");
  const [count, setCount] = useState(2);
  const [results, setResults] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);

  const solve = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    setError(null);
    setResults([]);
    try {
      const read = (name: string): number => {
        const raw = String(data.get(name) ?? "0").trim();
        const value = raw === "" ? 0 : Number(raw);
        return Number.isNaN(value) ? 0 : value;
      };

      if (kind === "simultaneous") {
        const matrix: number[][] = [];
        const vector: number[] = [];
        for (let i = 0; i < count; i += 1) {
          const row: number[] = [];
          for (let j = 0; j < count; j += 1) row.push(read(`a${i}${j}`));
          matrix.push(row);
          vector.push(read(`b${i}`));
        }
        const solution = solveLinearSystem(matrix, vector);
        const names = ["X", "Y", "Z", "W"];
        setResults(
          solution.map((value, index) => ({
            label: `Variable ${names[index] ?? index + 1}`,
            value: formatNumberText(value),
          })),
        );
        return;
      }

      const degree = count;
      const coefficients: number[] = [];
      for (let i = 0; i <= degree; i += 1) coefficients.push(read(`c${i}`));
      const roots = polynomialRoots(coefficients);
      setResults(
        roots.map((root, index) => ({
          label: `Root ${index + 1}`,
          value: formatRoot(root),
        })),
      );
    } catch (caught) {
      setError(isCalculatorError(caught) ? caught.code : "Error");
    }
  };

  return (
    <ModePanel
      title="Equation/Func"
      subtitle="Simultaneous linear equations and polynomial equations with real or complex roots."
    >
      <div className="mb-2 flex gap-1.5">
        {(["simultaneous", "polynomial"] as Kind[]).map((entry) => (
          <Button
            key={entry}
            type="button"
            size="xs"
            variant={kind === entry ? "default" : "outline"}
            onClick={() => {
              setKind(entry);
              setCount(2);
              setResults([]);
            }}
          >
            {entry === "simultaneous" ? "Simultaneous" : "Polynomial"}
          </Button>
        ))}
      </div>

      <div className="mb-3 flex gap-1.5">
        {(kind === "simultaneous" ? [2, 3, 4] : [2, 3, 4]).map((entry) => (
          <Button
            key={entry}
            type="button"
            size="xs"
            variant={count === entry ? "default" : "outline"}
            onClick={() => {
              setCount(entry);
              setResults([]);
            }}
          >
            {kind === "simultaneous" ? `${entry} unknowns` : `degree ${entry}`}
          </Button>
        ))}
      </div>

      <form
        ref={formRef}
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          solve();
        }}
      >
        {kind === "simultaneous" ? (
          <div className="space-y-1">
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="flex items-center gap-1">
                {Array.from({ length: count }, (_, j) => (
                  <input
                    key={j}
                    className="calc-slot w-16 text-center"
                    name={`a${i}${j}`}
                    defaultValue={i === j ? "1" : "0"}
                    aria-label={`Coefficient row ${i + 1} column ${j + 1}`}
                    inputMode="text"
                  />
                ))}
                <span className="px-1 font-mono text-sm">=</span>
                <input
                  className="calc-slot w-16 text-center"
                  name={`b${i}`}
                  defaultValue="0"
                  aria-label={`Constant row ${i + 1}`}
                  inputMode="text"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: count + 1 }, (_, i) => (
              <input
                key={i}
                className="calc-slot w-16 text-center"
                name={`c${i}`}
                defaultValue={i === 0 ? "1" : "0"}
                aria-label={`Coefficient ${i}`}
                inputMode="text"
              />
            ))}
          </div>
        )}

        <Button type="submit" size="sm">
          Solve
        </Button>
      </form>

      <ErrorNote message={error} />

      {results.length > 0 && (
        <div className="mt-4" data-testid="equation-result">
          {results.map((row) => (
            <ResultRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      )}
    </ModePanel>
  );
}
