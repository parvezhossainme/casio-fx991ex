"use client";

import { useRef, useState } from "react";
import { ErrorNote, Field, ModePanel, SlotInput } from "./shared";
import { Button } from "@/components/ui/button";
import {
  compileInX,
  formatNumberText,
  isCalculatorError,
  isComplete,
  parseTokens,
  tokensToPlainText,
} from "@/lib/engine";
import type { CalculatorState } from "@/types";

function readNumber(data: FormData, key: string): number {
  const raw = String(data.get(key) ?? "").trim();
  const value = Number(raw);
  if (raw === "" || Number.isNaN(value)) throw new Error(`Invalid ${key}`);
  return value;
}

export function TableMode({ state }: { state: CalculatorState }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [rows, setRows] = useState<{ x: string; f: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generate = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    setError(null);
    setRows([]);
    try {
      if (state.tokens.length === 0)
        throw new Error("Enter a function of X on the calculator first");
      const ast = parseTokens(state.tokens);
      if (!isComplete(ast)) throw new Error("Syntax Error");

      const start = readNumber(data, "start");
      const end = readNumber(data, "end");
      const step = readNumber(data, "step");
      if (step === 0) throw new Error("Step cannot be zero");

      const count = Math.floor((end - start) / step);
      if (count < 0)
        throw new Error("End must be beyond the start for this step");
      if (count > 2000) throw new Error("Too many rows");

      const fn = compileInX(ast, {
        angleUnit: state.angleUnit,
        variables: state.variables,
        ans: state.ans,
        preAns: state.preAns,
      });

      const out: { x: string; f: string }[] = [];
      for (let i = 0; i <= count; i += 1) {
        const x = start + i * step;
        let value: string;
        try {
          value = formatNumberText(fn(x));
        } catch {
          value = "ERROR";
        }
        out.push({ x: formatNumberText(x), f: value });
      }
      setRows(out);
    } catch (caught) {
      setError(
        isCalculatorError(caught)
          ? caught.code
          : caught instanceof Error
            ? caught.message
            : "Error",
      );
    }
  };

  return (
    <ModePanel
      title="Table"
      subtitle="Enter f(X) using the calculator keypad, then choose a start, end and step."
    >
      <div className="mb-3 rounded-md border border-white/10 bg-black/20 px-3 py-2 font-mono text-sm">
        f(X) ={" "}
        {state.tokens.length > 0 ? (
          tokensToPlainText(state.tokens)
        ) : (
          <span className="text-foreground/60">—</span>
        )}
      </div>

      <form
        ref={formRef}
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          generate();
        }}
      >
        <div className="flex gap-2">
          <Field label="Start" className="flex-1">
            <SlotInput label="Start" name="start" defaultValue="1" />
          </Field>
          <Field label="End" className="flex-1">
            <SlotInput label="End" name="end" defaultValue="5" />
          </Field>
          <Field label="Step" className="flex-1">
            <SlotInput label="Step" name="step" defaultValue="1" />
          </Field>
        </div>
        <Button type="submit" size="sm">
          Generate table
        </Button>
      </form>

      <ErrorNote message={error} />

      {rows.length > 0 && (
        <div
          className="mt-4 max-h-72 overflow-y-auto"
          data-testid="table-result"
        >
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="text-foreground/60">
                <th className="text-left font-normal">X</th>
                <th className="text-right font-normal">f(X)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-white/5">
                  <td className="py-0.5">{row.x}</td>
                  <td className="py-0.5 text-right">{row.f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ModePanel>
  );
}
