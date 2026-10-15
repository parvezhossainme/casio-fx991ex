"use client";

import { useState } from "react";
import { ErrorNote, ModePanel } from "./shared";
import { Button } from "@/components/ui/button";
import { formatNumberText } from "@/lib/engine";
import { evaluateSheet, refName, type Cells } from "@/lib/modes/spreadsheet";

const COLUMNS = 5;
const ROWS = 8;

export function SpreadsheetMode() {
  const [cells, setCells] = useState<Cells>({});
  const [values, setValues] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const compute = () => {
    const result = evaluateSheet(cells);
    setValues(result.values);
    setErrors(result.errors);
  };

  const update = (ref: string, raw: string) => {
    setCells((current) => {
      const next = { ...current };
      if (raw.trim() === "") delete next[ref];
      else next[ref] = raw;
      return next;
    });
  };

  return (
    <ModePanel
      title="Spreadsheet"
      subtitle="Enter values or formulas (start with =). Supports cell references, SUM, AVERAGE, MIN, MAX, COUNT and ranges like A1:A4."
    >
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="w-8" />
              {Array.from({ length: COLUMNS }, (_, column) => (
                <th
                  key={column}
                  className="px-1 pb-1 font-normal text-foreground/60"
                >
                  {refName(column, 0).replace("1", "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, row) => (
              <tr key={row}>
                <th className="pr-1 text-right font-normal text-foreground/60">
                  {row + 1}
                </th>
                {Array.from({ length: COLUMNS }, (_, column) => {
                  const ref = refName(column, row);
                  const value = values[ref];
                  const cellError = errors[ref];
                  return (
                    <td key={column} className="p-0.5 align-top">
                      <input
                        className="calc-slot w-24"
                        aria-label={`Cell ${ref}`}
                        name={ref}
                        defaultValue={cells[ref] ?? ""}
                        onChange={(event) => update(ref, event.target.value)}
                        inputMode="text"
                        autoComplete="off"
                      />
                      <div
                        className={`px-1 pt-0.5 font-mono text-[0.65rem] ${cellError ? "text-[var(--neon-red)]" : "text-foreground/60"}`}
                        data-testid={`cell-value-${ref}`}
                      >
                        {cellError
                          ? "ERR"
                          : value === undefined
                            ? ""
                            : formatNumberText(value)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <Button type="button" size="sm" onClick={compute}>
          Recalculate
        </Button>
      </div>

      <ErrorNote
        message={
          Object.keys(errors).length > 0 ? "Some cells contain errors" : null
        }
      />
    </ModePanel>
  );
}
