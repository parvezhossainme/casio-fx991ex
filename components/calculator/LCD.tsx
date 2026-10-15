"use client";

import { Expression } from "@/components/display/Expression";
import { formatLabel } from "@/lib/engine";
import { modeInfo, type CalculatorState } from "@/types";

export interface LCDProps {
  state: CalculatorState;
  /** When false the expression line shows a hint instead of the input buffer. */
  showExpression?: boolean;
  hint?: string;
}

export function LCD({
  state,
  showExpression = true,
  hint: displayHint,
}: LCDProps) {
  const mode = modeInfo(state.mode);
  const memoryUsed =
    typeof state.variables.M === "number" && state.variables.M !== 0;

  const hint = state.pendingStore
    ? "STO → press a variable key"
    : state.pendingRecall
      ? "RCL → press a variable key"
      : displayHint;

  return (
    <div className="calc-lcd-shell">
      <div className="calc-lcd" data-testid="lcd">
        <div className="calc-status" aria-hidden="true">
          <span className="calc-status-flag" data-active={state.shift}>
            SHIFT
          </span>
          <span className="calc-status-flag" data-active={state.alpha}>
            ALPHA
          </span>
          <span className="calc-status-flag" data-active={state.hyp}>
            HYP
          </span>
          <span className="calc-status-spacer" />
          {memoryUsed ? (
            <span className="calc-status-flag" data-active="true">
              M
            </span>
          ) : null}
          <span>{formatLabel(state.format)}</span>
          <span data-testid="angle-unit">{state.angleUnit}</span>
          <span>{mode.shortName}</span>
        </div>

        <div className="calc-expr-line">
          {showExpression ? (
            <Expression tokens={state.tokens} cursor={state.cursor} />
          ) : (
            <span className="calc-hint" data-testid="mode-hint">
              {mode.name} mode
            </span>
          )}
        </div>

        <div
          className="calc-result-line"
          data-testid="result-line"
          data-error={state.error ? "true" : "false"}
        >
          {state.error ? (
            <span data-testid="error-message">{state.error}</span>
          ) : state.result !== null ? (
            <span data-testid="result-value">{state.result}</span>
          ) : (
            <span className="calc-hint">{hint ?? "0"}</span>
          )}
        </div>
      </div>
    </div>
  );
}
