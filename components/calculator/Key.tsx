"use client";

import { cn } from "@/lib/utils";
import { type KeyDef, type KeyTone } from "@/lib/keyboard/keymap";
import type { CalculatorAction } from "@/types";

const TONE_CLASS: Record<KeyTone, string> = {
  "modifier-shift": "calc-key--shift",
  "modifier-alpha": "calc-key--alpha",
  function: "calc-key--function",
  numeric: "calc-key--numeric",
  blue: "calc-key--blue",
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
  const isModifier =
    def.tone === "modifier-shift" || def.tone === "modifier-alpha";
  const active =
    (def.tone === "modifier-shift" && shift) ||
    (def.tone === "modifier-alpha" && alpha);

  return (
    <button
      type="button"
      data-key={def.id}
      aria-label={def.ariaLabel ?? def.label}
      aria-pressed={isModifier ? active : undefined}
      className={cn(
        "calc-key",
        TONE_CLASS[def.tone],
        active && "calc-key--active",
      )}
      onClick={() => onAction(resolveKeyAction(def, shift, alpha))}
    >
      <span className="calc-key-label">{def.label}</span>
      {def.subLabel ? (
        <span className="calc-key-sub">{def.subLabel}</span>
      ) : null}
    </button>
  );
}

/** A key plus the coloured legends printed on the case above and beside it. */
export function KeyTile({ def, shift, alpha, onAction }: KeyProps) {
  return (
    <div
      className="calc-key-tile"
      style={{ gridColumn: String(def.col), gridRow: String(def.row) }}
    >
      <span className="calc-key-legends" aria-hidden="true">
        {def.shiftLabel ? (
          <span className="calc-legend calc-legend--shift">
            {def.shiftLabel}
          </span>
        ) : null}
        {def.alphaLabel ? (
          <span className="calc-legend calc-legend--alpha">
            {def.alphaLabel}
          </span>
        ) : null}
      </span>
      {def.blueLabel ? (
        <span className="calc-legend calc-legend--base" aria-hidden="true">
          {def.blueLabel}
        </span>
      ) : null}
      <Key def={def} shift={shift} alpha={alpha} onAction={onAction} />
    </div>
  );
}
