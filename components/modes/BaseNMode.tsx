"use client";

import { useState } from "react";
import { ErrorNote, Field, ModePanel, ResultRow, SlotInput } from "./shared";
import { Button } from "@/components/ui/button";
import { BASE_LABEL, isCalculatorError, type NumberBase } from "@/lib/engine";
import {
  applyOperation,
  isUnaryOperator,
  parseInBase,
  representations,
  type BaseNOperator,
} from "@/lib/modes/basen";

const BASES: NumberBase[] = [10, 16, 8, 2];
const OPERATORS: { id: BaseNOperator; label: string }[] = [
  { id: "+", label: "+" },
  { id: "-", label: "−" },
  { id: "*", label: "×" },
  { id: "/", label: "÷" },
  { id: "and", label: "AND" },
  { id: "or", label: "OR" },
  { id: "xor", label: "XOR" },
  { id: "xnor", label: "XNOR" },
  { id: "not", label: "NOT" },
  { id: "neg", label: "NEG" },
  { id: "shl", label: "<<" },
  { id: "shr", label: ">>" },
];

export function BaseNMode() {
  const [base, setBase] = useState<NumberBase>(10);
  const [operator, setOperator] = useState<BaseNOperator>("+");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unary = isUnaryOperator(operator);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);
    try {
      const a = parseInBase(String(data.get("a") ?? ""), base);
      const b = unary ? 0 : parseInBase(String(data.get("b") ?? ""), base);
      setResult(applyOperation(a, b, operator));
    } catch (caught) {
      setResult(null);
      setError(isCalculatorError(caught) ? caught.code : "Error");
    }
  };

  const values = result === null ? null : representations(result);

  return (
    <ModePanel
      title="Base-N"
      subtitle="Binary, octal, decimal and hexadecimal calculations on a 32-bit word."
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {BASES.map((entry) => (
          <Button
            key={entry}
            type="button"
            size="xs"
            variant={base === entry ? "default" : "outline"}
            onClick={() => setBase(entry)}
          >
            {BASE_LABEL[entry]}
          </Button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        <Field label={`Operand A (${BASE_LABEL[base]})`}>
          <SlotInput
            label="Operand A"
            name="a"
            placeholder="0"
            defaultValue="0"
          />
        </Field>

        <div>
          <p className="mb-1 text-[0.7rem] uppercase tracking-wide text-muted-foreground">
            Operator
          </p>
          <div className="flex flex-wrap gap-1.5">
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
        </div>

        {!unary && (
          <Field label={`Operand B (${BASE_LABEL[base]})`}>
            <SlotInput
              label="Operand B"
              name="b"
              placeholder="0"
              defaultValue="0"
            />
          </Field>
        )}

        <Button type="submit" size="sm">
          Execute
        </Button>
      </form>

      <ErrorNote message={error} />

      {values && (
        <div className="mt-4">
          <ResultRow label="DEC" value={values.DEC} />
          <ResultRow label="HEX" value={values.HEX} />
          <ResultRow label="OCT" value={values.OCT} />
          <ResultRow label="BIN" value={values.BIN} />
        </div>
      )}
    </ModePanel>
  );
}
