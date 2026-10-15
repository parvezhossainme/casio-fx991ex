"use client";

import { ModePanel, ResultRow } from "./shared";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/engine";
import type { CalculatorAction, CalculatorState } from "@/types";

const VARIABLES = ["A", "B", "C", "D", "E", "F", "X", "Y", "M"] as const;

const QUICK: { label: string; action: CalculatorAction }[] = [
  {
    label: "π",
    action: { type: "insertToken", token: { kind: "symbol", name: "pi" } },
  },
  {
    label: "e",
    action: { type: "insertToken", token: { kind: "symbol", name: "e" } },
  },
  {
    label: "√",
    action: { type: "insertToken", token: { kind: "root", name: "sqrt" } },
  },
  {
    label: "x!",
    action: { type: "insertToken", token: { kind: "postfix", op: "!" } },
  },
  {
    label: "x⁻¹",
    action: { type: "insertToken", token: { kind: "postfix", op: "^-1" } },
  },
  { label: "∫dx", action: { type: "insertFunction", name: "integ", args: 3 } },
  { label: "d/dx", action: { type: "insertFunction", name: "deriv", args: 2 } },
  { label: "Σ", action: { type: "insertFunction", name: "sum", args: 3 } },
  { label: "Abs", action: { type: "insertFunction", name: "abs", args: 1 } },
  { label: "GCD", action: { type: "insertFunction", name: "gcd", args: 2 } },
  {
    label: "RanInt",
    action: { type: "insertFunction", name: "RanInt", args: 2 },
  },
];

export function CalculateMode({
  state,
  dispatch,
}: {
  state: CalculatorState;
  dispatch: (action: CalculatorAction) => void;
}) {
  return (
    <ModePanel
      title="Calculate"
      subtitle="Type on the keypad or the physical keyboard. Results update when you press =."
    >
      <div className="grid gap-x-6 sm:grid-cols-2">
        {VARIABLES.map((name) => (
          <ResultRow
            key={name}
            label={`Memory ${name}`}
            value={formatNumber(state.variables[name] ?? 0).text}
          />
        ))}
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[0.7rem] uppercase tracking-wide text-muted-foreground">
          Quick insert
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((entry) => (
            <Button
              key={entry.label}
              type="button"
              variant="outline"
              size="xs"
              onClick={() => dispatch(entry.action)}
            >
              {entry.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
        <p>
          <span className="text-foreground">STO</span> then a variable key
          stores the current answer.
          <span className="text-foreground"> RCL</span> then a variable key
          recalls it (or press ALPHA plus the letter).
        </p>
        <p>
          <span className="text-foreground">CALC</span> evaluates with the
          stored variables; <span className="text-foreground">SOLVE</span>{" "}
          (SHIFT+CALC) numerically solves the expression for X.
        </p>
      </div>
    </ModePanel>
  );
}
