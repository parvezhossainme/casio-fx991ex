"use client";

import { useState } from "react";
import { ErrorNote, ModePanel, ResultRow } from "./shared";
import { Button } from "@/components/ui/button";
import { formatNumberText, isCalculatorError } from "@/lib/engine";
import {
  angleBetween,
  cross,
  dot,
  magnitude,
  unitVector,
  vAdd,
  vSub,
  type Vector,
} from "@/lib/modes/vector";

type Operation = "add" | "sub" | "dot" | "cross" | "mag" | "angle" | "unit";

const OPERATIONS: { id: Operation; label: string }[] = [
  { id: "add", label: "A + B" },
  { id: "sub", label: "A − B" },
  { id: "dot", label: "A · B" },
  { id: "cross", label: "A × B" },
  { id: "mag", label: "|A|" },
  { id: "angle", label: "angle" },
  { id: "unit", label: "Â" },
];

function readVector(data: FormData, prefix: string, size: number): Vector {
  const out: number[] = [];
  for (let i = 0; i < size; i += 1) {
    const raw = String(data.get(`${prefix}${i}`) ?? "0").trim();
    const value = raw === "" ? 0 : Number(raw);
    out.push(Number.isNaN(value) ? 0 : value);
  }
  return out;
}

export function VectorMode({ angleUnit }: { angleUnit: string }) {
  const [size, setSize] = useState(2);
  const [operation, setOperation] = useState<Operation>("dot");
  const [rows, setRows] = useState<{ label: string; value: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);
    setRows([]);
    try {
      const a = readVector(data, "a", size);
      const b = readVector(data, "b", size);
      const format = (value: number): string => formatNumberText(value);
      switch (operation) {
        case "add":
          setRows(
            vAdd(a, b).map((value, index) => ({
              label: `Component ${index + 1}`,
              value: format(value),
            })),
          );
          break;
        case "sub":
          setRows(
            vSub(a, b).map((value, index) => ({
              label: `Component ${index + 1}`,
              value: format(value),
            })),
          );
          break;
        case "dot":
          setRows([{ label: "Dot product", value: format(dot(a, b)) }]);
          break;
        case "cross":
          setRows(
            cross(a, b).map((value, index) => ({
              label: `Component ${index + 1}`,
              value: format(value),
            })),
          );
          break;
        case "mag":
          setRows([{ label: "|A|", value: format(magnitude(a)) }]);
          break;
        case "angle": {
          const radians = angleBetween(a, b);
          const converted =
            angleUnit === "RAD"
              ? radians
              : angleUnit === "GRA"
                ? (radians * 200) / Math.PI
                : (radians * 180) / Math.PI;
          setRows([
            { label: `Angle (${angleUnit})`, value: format(converted) },
          ]);
          break;
        }
        case "unit":
          setRows(
            unitVector(a).map((value, index) => ({
              label: `Component ${index + 1}`,
              value: format(value),
            })),
          );
          break;
      }
    } catch (caught) {
      setError(isCalculatorError(caught) ? caught.code : "Error");
    }
  };

  return (
    <ModePanel
      title="Vector"
      subtitle="2D and 3D vectors: sum, difference, dot, cross, magnitude and angle."
    >
      <div className="mb-3 flex gap-2">
        {[2, 3].map((entry) => (
          <Button
            key={entry}
            type="button"
            size="xs"
            variant={size === entry ? "default" : "outline"}
            onClick={() => setSize(entry)}
          >
            {entry}D
          </Button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="flex flex-wrap gap-4">
          {(["a", "b"] as const).map((prefix) => (
            <div key={prefix}>
              <p className="mb-1 text-[0.7rem] uppercase tracking-wide text-foreground/60">
                Vector {prefix.toUpperCase()}
              </p>
              <div className="flex gap-1">
                {Array.from({ length: size }, (_, index) => (
                  <input
                    key={index}
                    className="calc-slot w-16 text-center"
                    name={`${prefix}${index}`}
                    defaultValue="0"
                    aria-label={`Vector ${prefix.toUpperCase()} component ${index + 1}`}
                    inputMode="text"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-1 text-[0.7rem] uppercase tracking-wide text-foreground/60">
            Operation
          </p>
          <div className="flex flex-wrap gap-1.5">
            {OPERATIONS.map((entry) => (
              <Button
                key={entry.id}
                type="button"
                size="xs"
                variant={operation === entry.id ? "default" : "outline"}
                onClick={() => setOperation(entry.id)}
              >
                {entry.label}
              </Button>
            ))}
          </div>
        </div>

        <Button type="submit" size="sm">
          Execute
        </Button>
      </form>

      <ErrorNote message={error} />

      {rows.length > 0 && (
        <div className="mt-4" data-testid="vector-result">
          {rows.map((row) => (
            <ResultRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      )}
    </ModePanel>
  );
}
