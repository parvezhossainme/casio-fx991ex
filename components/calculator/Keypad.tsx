"use client";

import { KeyTile } from "./Key";
import {
  DIRECTIONAL_PAD,
  FUNCTION_COLUMNS,
  FUNCTION_KEYS,
  NUMERIC_COLUMNS,
  NUMERIC_KEYS,
} from "@/lib/keyboard/keymap";
import type { CalculatorAction } from "@/types";

/**
 * The keypad's structure (grid blocks, key placement and the 2x2 pad area) is declared here as
 * inline styles rather than in the stylesheet. Layout therefore cannot collapse into a single
 * column if a stylesheet is missing, stale or fails to load — only the skin comes from CSS.
 */

const BLOCK_STYLE = (columns: number): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  columnGap: "0.3rem",
  rowGap: "0.34rem",
  alignItems: "stretch",
});

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
    area: string;
  }[] = [
    {
      id: "pad-up",
      glyph: "▲",
      action: up,
      label: "Up",
      area: "1 / 2 / 2 / 3",
    },
    {
      id: "pad-left",
      glyph: "◀",
      action: left,
      label: "Left",
      area: "2 / 1 / 3 / 2",
    },
    {
      id: "pad-right",
      glyph: "▶",
      action: right,
      label: "Right",
      area: "2 / 3 / 3 / 4",
    },
    {
      id: "pad-down",
      glyph: "▼",
      action: down,
      label: "Down",
      area: "3 / 2 / 4 / 3",
    },
  ];

  return (
    <div
      className="calc-pad"
      style={{
        gridColumn: `${DIRECTIONAL_PAD.col} / span ${DIRECTIONAL_PAD.width}`,
        gridRow: `${DIRECTIONAL_PAD.row} / span ${DIRECTIONAL_PAD.height}`,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr",
        alignSelf: "stretch",
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
          className="calc-pad-zone"
          style={{ gridArea: zone.area }}
          onClick={() => onAction(zone.action)}
        >
          {zone.glyph}
        </button>
      ))}
      <span
        className="calc-pad-hub"
        aria-hidden="true"
        style={{
          gridArea: "2 / 2 / 3 / 3",
          justifySelf: "center",
          alignSelf: "center",
        }}
      />
    </div>
  );
}

export function Keypad({ shift, alpha, onAction }: KeypadProps) {
  return (
    <div
      className="calc-keypad"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginTop: "0.7rem",
      }}
    >
      <div
        className="calc-key-block"
        style={BLOCK_STYLE(FUNCTION_COLUMNS)}
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
        style={BLOCK_STYLE(NUMERIC_COLUMNS)}
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
