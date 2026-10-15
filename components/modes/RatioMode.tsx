"use client";

import { useRef, useState } from "react";
import { ErrorNote, ModePanel, ResultRow } from "./shared";
import { Button } from "@/components/ui/button";
import { isCalculatorError } from "@/lib/engine";
import {
  formatProportion,
  ratioText,
  solveProportion,
  type Proportion,
} from "@/lib/modes/ratio";

const KEYS = ["a", "b", "c", "d"] as const;

export function RatioMode() {
  const formRef = useRef<HTMLFormElement>(null);
  const [rows, setRows] = useState<{ label: string; value: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const solve = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    setError(null);
    setRows([]);
    try {
      const values = KEYS.map((key) => {
        const raw = String(data.get(key) ?? "").trim();
        return raw === "" ? null : Number(raw);
      }) as Proportion;

      const solved = solveProportion(values);
      const [a, b, c, d] = solved as [number, number, number, number];

      const output: { label: string; value: string }[] = [
        { label: "Solved proportion", value: formatProportion(solved) },
      ];

      const missingIndex = values.findIndex((value) => value === null);
      if (missingIndex >= 0) {
        output.push({
          label: `Value of ${KEYS[missingIndex]}`,
          value: String(solved[missingIndex]),
        });
      }

      try {
        output.push({ label: "a : b simplified", value: ratioText(a, b) });
        output.push({ label: "c : d simplified", value: ratioText(c, d) });
      } catch {
        // Non-integer ratios simply skip the simplification rows.
      }

      const scale = a !== 0 ? d / a : 0;
      if (Number.isFinite(scale) && Math.abs(scale) > 1e-12) {
        output.push({
          label: "Scale factor d/a",
          value: String(Number(scale.toFixed(10))),
        });
      }

      setRows(output);
    } catch (caught) {
      setError(isCalculatorError(caught) ? caught.code : "Error");
    }
  };

  return (
    <ModePanel
      title="Ratio"
      subtitle="Solve a proportion a : b = c : d. Leave exactly one field blank to solve for it."
    >
      <form
        ref={formRef}
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          solve();
        }}
      >
        <div className="flex flex-wrap items-end gap-2">
          <Field name="a" label="a" />
          <span className="pb-2 font-mono">:</span>
          <Field name="b" label="b" />
          <span className="pb-2 font-mono">=</span>
          <Field name="c" label="c" />
          <span className="pb-2 font-mono">:</span>
          <Field name="d" label="d" />
        </div>
        <Button type="submit" size="sm">
          Solve
        </Button>
      </form>

      <ErrorNote message={error} />

      {rows.length > 0 && (
        <div className="mt-4" data-testid="ratio-result">
          {rows.map((row) => (
            <ResultRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      )}
    </ModePanel>
  );
}

function Field({ name, label }: { name: string; label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[0.7rem] uppercase tracking-wide text-foreground/60">
        {label}
      </span>
      <input
        className="calc-slot w-20 text-center"
        name={name}
        aria-label={`Ratio value ${label}`}
        inputMode="text"
        autoComplete="off"
      />
    </label>
  );
}
