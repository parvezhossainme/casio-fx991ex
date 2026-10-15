"use client";

import { useRef, useState } from "react";
import { ErrorNote, Field, ModePanel, ResultRow, SlotInput } from "./shared";
import { Button } from "@/components/ui/button";
import { formatNumberText, isCalculatorError } from "@/lib/engine";
import {
  binomialCdf,
  binomialPdf,
  inverseNormal,
  normalCdf,
  normalPdf,
  poissonCdf,
  poissonPdf,
} from "@/lib/modes/distribution";

type Distribution = "normal" | "binomial" | "poisson";
type Func = "pd" | "cd" | "inverse";

const DISTRIBUTIONS: { id: Distribution; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "binomial", label: "Binomial" },
  { id: "poisson", label: "Poisson" },
];

function num(data: FormData, key: string, fallback?: number): number {
  const raw = String(data.get(key) ?? "").trim();
  if (raw === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing ${key}`);
  }
  const value = Number(raw);
  if (Number.isNaN(value)) throw new Error(`Invalid ${key}`);
  return value;
}

export function DistributionMode() {
  const formRef = useRef<HTMLFormElement>(null);
  const [distribution, setDistribution] = useState<Distribution>("normal");
  const [func, setFunc] = useState<Func>("pd");
  const [result, setResult] = useState<{ label: string; value: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const compute = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    setError(null);
    setResult([]);
    try {
      if (distribution === "normal") {
        const mu = num(data, "mu", 0);
        const sigma = num(data, "sigma", 1);
        if (func === "pd") {
          const x = num(data, "x");
          setResult([
            {
              label: "P(X = x)",
              value: formatNumberText(normalPdf(x, mu, sigma)),
            },
          ]);
        } else if (func === "cd") {
          const lower = num(data, "lower");
          const upper = num(data, "upper");
          setResult([
            {
              label: "P(lower ≤ X ≤ upper)",
              value: formatNumberText(normalCdf(lower, upper, mu, sigma)),
            },
          ]);
        } else {
          const p = num(data, "p");
          setResult([
            {
              label: "x (inverse)",
              value: formatNumberText(inverseNormal(p, mu, sigma)),
            },
          ]);
        }
        return;
      }

      if (distribution === "binomial") {
        const n = num(data, "n");
        const p = num(data, "p");
        const k = num(data, "x");
        setResult([
          func === "pd"
            ? {
                label: "P(X = k)",
                value: formatNumberText(binomialPdf(k, n, p)),
              }
            : {
                label: "P(X ≤ k)",
                value: formatNumberText(binomialCdf(k, n, p)),
              },
        ]);
        return;
      }

      const lambda = num(data, "lambda");
      const k = num(data, "x");
      setResult([
        func === "pd"
          ? {
              label: "P(X = k)",
              value: formatNumberText(poissonPdf(k, lambda)),
            }
          : {
              label: "P(X ≤ k)",
              value: formatNumberText(poissonCdf(k, lambda)),
            },
      ]);
    } catch (caught) {
      setError(isCalculatorError(caught) ? caught.code : "Error");
    }
  };

  const supportsInverse = distribution === "normal";

  return (
    <ModePanel
      title="Distribution"
      subtitle="Normal, binomial and Poisson probability density and cumulative distributions."
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        {DISTRIBUTIONS.map((entry) => (
          <Button
            key={entry.id}
            type="button"
            size="xs"
            variant={distribution === entry.id ? "default" : "outline"}
            onClick={() => {
              setDistribution(entry.id);
              setFunc("pd");
            }}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {(
          [
            "pd",
            "cd",
            ...(supportsInverse ? (["inverse"] as const) : []),
          ] as Func[]
        ).map((entry) => (
          <Button
            key={entry}
            type="button"
            size="xs"
            variant={func === entry ? "default" : "outline"}
            onClick={() => setFunc(entry)}
          >
            {entry === "pd" ? "P(x)" : entry === "cd" ? "P(≤)" : "Inverse"}
          </Button>
        ))}
      </div>

      <form
        ref={formRef}
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          compute();
        }}
      >
        {distribution === "normal" && func === "pd" && (
          <>
            <Field label="x">
              <SlotInput label="x" name="x" defaultValue="0" />
            </Field>
            <div className="flex gap-2">
              <Field label="μ" className="flex-1">
                <SlotInput label="Mean" name="mu" defaultValue="0" />
              </Field>
              <Field label="σ" className="flex-1">
                <SlotInput
                  label="Standard deviation"
                  name="sigma"
                  defaultValue="1"
                />
              </Field>
            </div>
          </>
        )}
        {distribution === "normal" && func === "cd" && (
          <>
            <div className="flex gap-2">
              <Field label="lower" className="flex-1">
                <SlotInput label="Lower bound" name="lower" defaultValue="0" />
              </Field>
              <Field label="upper" className="flex-1">
                <SlotInput label="Upper bound" name="upper" defaultValue="1" />
              </Field>
            </div>
            <div className="flex gap-2">
              <Field label="μ" className="flex-1">
                <SlotInput label="Mean" name="mu" defaultValue="0" />
              </Field>
              <Field label="σ" className="flex-1">
                <SlotInput
                  label="Standard deviation"
                  name="sigma"
                  defaultValue="1"
                />
              </Field>
            </div>
          </>
        )}
        {distribution === "normal" && func === "inverse" && (
          <>
            <Field label="probability">
              <SlotInput label="Probability" name="p" defaultValue="0.95" />
            </Field>
            <div className="flex gap-2">
              <Field label="μ" className="flex-1">
                <SlotInput label="Mean" name="mu" defaultValue="0" />
              </Field>
              <Field label="σ" className="flex-1">
                <SlotInput
                  label="Standard deviation"
                  name="sigma"
                  defaultValue="1"
                />
              </Field>
            </div>
          </>
        )}
        {distribution === "binomial" && (
          <>
            <div className="flex gap-2">
              <Field label="k" className="flex-1">
                <SlotInput label="k" name="x" defaultValue="0" />
              </Field>
              <Field label="n" className="flex-1">
                <SlotInput label="n" name="n" defaultValue="10" />
              </Field>
            </div>
            <Field label="p">
              <SlotInput
                label="Probability of success"
                name="p"
                defaultValue="0.5"
              />
            </Field>
          </>
        )}
        {distribution === "poisson" && (
          <div className="flex gap-2">
            <Field label="k" className="flex-1">
              <SlotInput label="k" name="x" defaultValue="0" />
            </Field>
            <Field label="λ" className="flex-1">
              <SlotInput label="Mean rate" name="lambda" defaultValue="1" />
            </Field>
          </div>
        )}

        <Button type="submit" size="sm">
          Execute
        </Button>
      </form>

      <ErrorNote message={error} />

      {result.length > 0 && (
        <div className="mt-4" data-testid="distribution-result">
          {result.map((row) => (
            <ResultRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      )}
    </ModePanel>
  );
}
