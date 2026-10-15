"use client";

import { useRef, useState } from "react";
import { ErrorNote, Field, ModePanel, ResultRow, SlotInput } from "./shared";
import { Button } from "@/components/ui/button";
import { formatNumberText, isCalculatorError } from "@/lib/engine";
import {
  linearRegression,
  oneVariableStats,
  parseDataList,
} from "@/lib/modes/stats";

export function StatisticsMode() {
  const formRef = useRef<HTMLFormElement>(null);
  const [rows, setRows] = useState<{ label: string; value: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const compute = (mode: "one" | "two") => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    setError(null);
    setRows([]);
    try {
      const x = parseDataList(String(data.get("x") ?? ""));
      const y = parseDataList(String(data.get("y") ?? ""));

      if (mode === "one") {
        const stats = oneVariableStats(x);
        setRows([
          { label: "n", value: String(stats.n) },
          { label: "Σx", value: formatNumberText(stats.sum) },
          { label: "Σx²", value: formatNumberText(stats.sumSquares) },
          { label: "x̄", value: formatNumberText(stats.mean) },
          {
            label: "σx (population)",
            value: formatNumberText(stats.populationStdDev),
          },
          { label: "sx (sample)", value: formatNumberText(stats.sampleStdDev) },
          { label: "median", value: formatNumberText(stats.median) },
          { label: "Q1", value: formatNumberText(stats.q1) },
          { label: "Q3", value: formatNumberText(stats.q3) },
          { label: "min", value: formatNumberText(stats.min) },
          { label: "max", value: formatNumberText(stats.max) },
        ]);
      } else {
        const regression = linearRegression(x, y);
        setRows([
          { label: "a (intercept)", value: formatNumberText(regression.a) },
          { label: "b (slope)", value: formatNumberText(regression.b) },
          { label: "r (correlation)", value: formatNumberText(regression.r) },
          {
            label: "y = a + bx",
            value: `${formatNumberText(regression.a)} + ${formatNumberText(regression.b)}x`,
          },
        ]);
      }
    } catch (caught) {
      setError(isCalculatorError(caught) ? caught.code : "Error");
    }
  };

  return (
    <ModePanel
      title="Statistics"
      subtitle="One-variable statistics and two-variable linear regression. Separate values with spaces or commas."
    >
      <form
        ref={formRef}
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          compute("one");
        }}
      >
        <Field label="x values">
          <SlotInput label="x values" name="x" placeholder="1 2 3 4 5" />
        </Field>
        <Field label="y values (2-variable only)">
          <SlotInput label="y values" name="y" placeholder="2 4 5 8 10" />
        </Field>
        <div className="flex gap-2">
          <Button type="submit" size="sm">
            1-variable
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => compute("two")}
          >
            2-variable regression
          </Button>
        </div>
      </form>

      <ErrorNote message={error} />

      {rows.length > 0 && (
        <div className="mt-4" data-testid="stats-result">
          {rows.map((row) => (
            <ResultRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      )}
    </ModePanel>
  );
}
