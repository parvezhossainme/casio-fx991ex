"use client";

import { cn } from "@/lib/utils";
import { type KeyDef, type KeyTone } from "@/lib/keyboard/keymap";
import type { CalculatorAction } from "@/types";

const TONE_CLASS: Record<KeyTone, string> = {
  shift: "calc-key--shift",
  alpha: "calc-key--alpha",
  number: "calc-key--number",
  operator: "calc-key--operator",
  function: "calc-key--function",
  control: "calc-key--control",
  equals: "calc-key--equals",
};

/** Choose the action a key performs given the current SHIFT/ALPHA state. */
export function resolveKeyAction(
  key: KeyDef,
  shift: boolean,
  alpha: boolean,
): CalculatorAction {
  if (shift && key.shift) return key.shift;
  if (alpha && key.alpha) return key.alpha;
  return key.primary;
}

export interface KeyProps {
  def: KeyDef;
  shift: boolean;
  alpha: boolean;
  onAction: (action: CalculatorAction) => void;
}

export function Key({ def, shift, alpha, onAction }: KeyProps) {
  const isModifier = def.tone === "shift" || def.tone === "alpha";
  const active =
    (def.tone === "shift" && shift) || (def.tone === "alpha" && alpha);

  return (
    <button
      type="button"
      data-key={def.id}
      aria-label={def.ariaLabel ?? def.label}
      aria-pressed={isModifier ? active : undefined}
      className={cn(
        "calc-key",
        TONE_CLASS[def.tone],
        active && "active-modifier",
      )}
      onClick={() => onAction(resolveKeyAction(def, shift, alpha))}
    >
      {def.shiftLabel ? (
        <span className="calc-key-shift">{def.shiftLabel}</span>
      ) : null}
      {def.alphaLabel ? (
        <span className="calc-key-alpha">{def.alphaLabel}</span>
      ) : null}
      <span className="calc-key-label">{def.label}</span>
      {def.subLabel ? (
        <span className="calc-key-sub">{def.subLabel}</span>
      ) : null}
    </button>
  );
}
