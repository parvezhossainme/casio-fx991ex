"use client";

import { Key } from "./Key";
import { KEYS } from "@/lib/keyboard/keymap";
import type { CalculatorAction } from "@/types";

export interface KeypadProps {
  shift: boolean;
  alpha: boolean;
  onAction: (action: CalculatorAction) => void;
}

export function Keypad({ shift, alpha, onAction }: KeypadProps) {
  return (
    <div className="calc-keypad" role="group" aria-label="Calculator keypad">
      {KEYS.map((def) => (
        <Key
          key={def.id}
          def={def}
          shift={shift}
          alpha={alpha}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
