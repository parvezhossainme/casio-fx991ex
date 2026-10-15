"use client";

import { useEffect } from "react";
import type { CalculatorAction } from "@/types";

const OPERATOR_KEYS: Record<string, "+" | "-" | "*" | "/" | "^"> = {
  "+": "+",
  "-": "-",
  "*": "*",
  x: "*",
  "/": "/",
  "^": "^",
};

const LETTER_FUNCTIONS: Record<string, { name: string; args: number }> = {
  s: { name: "sin", args: 1 },
  c: { name: "cos", args: 1 },
  t: { name: "tan", args: 1 },
  l: { name: "log", args: 1 },
  n: { name: "ln", args: 1 },
  q: { name: "sqrt", args: 1 },
};

/**
 * Map a browser key event to a calculator action. Returns null for anything the calculator
 * should not swallow, so ordinary browser navigation keeps working.
 */
export function keyboardEventToAction(event: {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}): CalculatorAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  const { key } = event;

  if (key.length === 1 && key >= "0" && key <= "9") {
    return { type: "insertToken", token: { kind: "number", text: key } };
  }
  if (key === "." || key === ",") {
    return {
      type: "insertToken",
      token: key === "." ? { kind: "number", text: "." } : { kind: "comma" },
    };
  }
  if (key === "(") return { type: "insertToken", token: { kind: "lparen" } };
  if (key === ")") return { type: "insertToken", token: { kind: "rparen" } };

  const operator = OPERATOR_KEYS[key];
  if (operator)
    return { type: "insertToken", token: { kind: "op", op: operator } };

  switch (key) {
    case "Enter":
    case "=":
      return { type: "control", control: "equals" };
    case "Backspace":
    case "Delete":
      return { type: "control", control: "delete" };
    case "Escape":
      return { type: "control", control: "clear" };
    case "ArrowLeft":
      return { type: "control", control: "left" };
    case "ArrowRight":
      return { type: "control", control: "right" };
    case "ArrowUp":
      return { type: "control", control: "up" };
    case "ArrowDown":
      return { type: "control", control: "down" };
    default:
      break;
  }

  const lower = key.toLowerCase();
  if (lower === "p")
    return { type: "insertToken", token: { kind: "symbol", name: "pi" } };
  const fn = LETTER_FUNCTIONS[lower];
  if (fn) return { type: "insertFunction", name: fn.name, args: fn.args };

  return null;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/** Register the single global physical-keyboard listener for the calculator. */
export function usePhysicalKeyboard(
  handler: (action: CalculatorAction) => void,
): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const action = keyboardEventToAction(event);
      if (!action) return;
      event.preventDefault();
      handler(action);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handler]);
}
