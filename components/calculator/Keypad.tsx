"use client";

import { cn } from "@/lib/utils";
import { KeyTile } from "./Key";
import {
  DIRECTIONAL_PAD,
  FUNCTION_COLUMNS,
  FUNCTION_KEYS,
  NUMERIC_COLUMNS,
  NUMERIC_KEYS,
} from "@/lib/keyboard/keymap";
import type { CalculatorAction } from "@/types";

export interface KeypadProps {
  shift: boolean;
  alpha: boolean;
  onAction: (action: CalculatorAction) => void;
}

/** The 4-way replay pad that sits at the top of the function block. */
function DirectionalPad({
  onAction,
}: {
  onAction: (action: CalculatorAction) => void;
}) {
  const { up, down, left, right } = DIRECTIONAL_PAD.directions;
  const zones: {
    id: string;
    glyph: string;
    action: CalculatorAction;
    label: string;
  }[] = [
    { id: "pad-up", glyph: "▲", action: up, label: "Up" },
    { id: "pad-left", glyph: "◀", action: left, label: "Left" },
    { id: "pad-right", glyph: "▶", action: right, label: "Right" },
    { id: "pad-down", glyph: "▼", action: down, label: "Down" },
  ];

  return (
    <div
      className="calc-pad"
      style={{
        gridColumn: `${DIRECTIONAL_PAD.col} / span ${DIRECTIONAL_PAD.width}`,
        gridRow: `${DIRECTIONAL_PAD.row} / span ${DIRECTIONAL_PAD.height}`,
      }}
      role="group"
      aria-label="Replay pad"
    >
      {zones.map((zone) => (
        <button
          key={zone.id}
          type="button"
          data-key={zone.id}
          aria-label={zone.label}
          className={cn(
            "calc-pad-zone",
            `calc-pad-zone--${zone.id.split("-")[1]}`,
          )}
          onClick={() => onAction(zone.action)}
        >
          {zone.glyph}
        </button>
      ))}
      <span className="calc-pad-hub" aria-hidden="true" />
    </div>
  );
}

export function Keypad({ shift, alpha, onAction }: KeypadProps) {
  return (
    <div className="calc-keypad">
      <div
        className="calc-key-block"
        style={{
          gridTemplateColumns: `repeat(${FUNCTION_COLUMNS}, minmax(0, 1fr))`,
        }}
        role="group"
        aria-label="Function keys"
      >
        {FUNCTION_KEYS.map((def) => (
          <KeyTile
            key={def.id}
            def={def}
            shift={shift}
            alpha={alpha}
            onAction={onAction}
          />
        ))}
        <DirectionalPad onAction={onAction} />
      </div>

      <div
        className="calc-key-block"
        style={{
          gridTemplateColumns: `repeat(${NUMERIC_COLUMNS}, minmax(0, 1fr))`,
        }}
        role="group"
        aria-label="Numeric keys"
      >
        {NUMERIC_KEYS.map((def) => (
          <KeyTile
            key={def.id}
            def={def}
            shift={shift}
            alpha={alpha}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
}
