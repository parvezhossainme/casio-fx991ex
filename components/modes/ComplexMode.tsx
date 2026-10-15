"use client";

import { ModePanel, ResultRow } from "./shared";
import { Button } from "@/components/ui/button";
import type { CalculatorAction, CalculatorState } from "@/types";

const INSERT: { label: string; action: CalculatorAction; hint: string }[] = [
  {
    label: "i",
    action: { type: "insertToken", token: { kind: "symbol", name: "i" } },
    hint: "Imaginary unit",
  },
  {
    label: "Conjg",
    action: { type: "insertFunction", name: "conj", args: 1 },
    hint: "Complex conjugate",
  },
  {
    label: "Abs",
    action: { type: "insertFunction", name: "abs", args: 1 },
    hint: "Modulus",
  },
  {
    label: "Arg",
    action: { type: "insertFunction", name: "arg", args: 1 },
    hint: "Argument",
  },
  {
    label: "Re",
    action: { type: "insertFunction", name: "re", args: 1 },
    hint: "Real part",
  },
  {
    label: "Im",
    action: { type: "insertFunction", name: "im", args: 1 },
    hint: "Imaginary part",
  },
];

export function ComplexMode({
  state,
  dispatch,
}: {
  state: CalculatorState;
  dispatch: (action: CalculatorAction) => void;
}) {
  return (
    <ModePanel
      title="Complex"
      subtitle="Complex arithmetic. Results are shown in rectangular form a+bi."
    >
      <div className="flex flex-wrap gap-2">
        {INSERT.map((entry) => (
          <Button
            key={entry.label}
            type="button"
            variant="outline"
            size="xs"
            title={entry.hint}
            onClick={() => dispatch(entry.action)}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
        <ResultRow label="Angle unit" value={state.angleUnit} />
        <ResultRow label="Last answer" value={state.result ?? "—"} />
      </div>

      <div className="mt-4 space-y-1 text-xs text-foreground/60">
        <p>
          Enter expressions such as{" "}
          <span className="font-mono text-foreground">(2+3i)×(1−i)</span> and
          press =. The imaginary unit is inserted with the{" "}
          <span className="text-foreground">i</span> button.
        </p>
        <p>
          Modulus uses <span className="font-mono text-foreground">Abs</span>,
          argument uses <span className="font-mono text-foreground">Arg</span>{" "}
          (returned in the current angle unit).
        </p>
        <p className="text-[var(--neon-magenta)]/80">
          Polar ⇄ rectangular conversion shortcuts are not implemented; use Abs
          and Arg instead.
        </p>
      </div>
    </ModePanel>
  );
}
