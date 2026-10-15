"use client";

import { useRef, useState } from "react";
import { ErrorNote, ModePanel } from "./shared";
import { Button } from "@/components/ui/button";
import { isCalculatorError } from "@/lib/engine";
import {
  formatIntervals,
  solvePolynomialInequality,
  type InequalityOperator,
} from "@/lib/modes/inequality";

const OPERATORS: { id: InequalityOperator; label: string }[] = [
  { id: ">", label: ">" },
  { id: ">=", label: "≥" },
  { id: "<", label: "<" },
  { id: "<=", label: "≤" },
];

export function InequalityMode() {
  const formRef = useRef<HTMLFormElement>(null);
  const [degree, setDegree] = useState(2);
  const [operator, setOperator] = useState<InequalityOperator>(">=");
  const [solution, setSolution] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const solve = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    setError(null);
    setSolution(null);
    try {
      const coefficients: number[] = [];
      for (let i = 0; i <= degree; i += 1) {
        const raw = String(data.get(`c${i}`) ?? "0").trim();
        coefficients.push(raw === "" ? 0 : Number(raw));
      }
      const intervals = solvePolynomialInequality(coefficients, operator);
      setSolution(formatIntervals(intervals));
    } catch (caught) {
      setError(isCalculatorError(caught) ? caught.code : "Error");
    }
  };

  return (
    <ModePanel
      title="Inequality"
      subtitle="Solve polynomial inequalities and display the valid intervals."
    >
      <div className="mb-2 flex gap-1.5">
        {[2, 3].map((entry) => (
          <Button
            key={entry}
            type="button"
            size="xs"
            variant={degree === entry ? "default" : "outline"}
            onClick={() => {
              setDegree(entry);
              setSolution(null);
            }}
          >
            degree {entry}
          </Button>
        ))}
      </div>

      <div className="mb-3 flex gap-1.5">
        {OPERATORS.map((entry) => (
          <Button
            key={entry.id}
            type="button"
            size="xs"
            variant={operator === entry.id ? "default" : "outline"}
            onClick={() => setOperator(entry.id)}
          >
            {entry.label}
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
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: degree + 1 }, (_, i) => (
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
        <p className="text-xs text-foreground/60">
          Enter coefficients highest power first, e.g. for ax² + bx + c enter a,
          b, c.
        </p>
        <Button type="submit" size="sm">
          Solve
        </Button>
      </form>

      <ErrorNote message={error} />

      {solution && (
        <p className="mt-4 font-mono text-sm" data-testid="inequality-result">
          {solution}
        </p>
      )}
    </ModePanel>
  );
}
