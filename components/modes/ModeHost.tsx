"use client";

import { BaseNMode } from "./BaseNMode";
import { CalculateMode } from "./CalculateMode";
import { ComplexMode } from "./ComplexMode";
import { DistributionMode } from "./DistributionMode";
import { EquationMode } from "./EquationMode";
import { InequalityMode } from "./InequalityMode";
import { MatrixMode } from "./MatrixMode";
import { RatioMode } from "./RatioMode";
import { SpreadsheetMode } from "./SpreadsheetMode";
import { StatisticsMode } from "./StatisticsMode";
import { TableMode } from "./TableMode";
import { VectorMode } from "./VectorMode";
import type { CalculatorAction, CalculatorState } from "@/types";

export interface ModeHostProps {
  state: CalculatorState;
  dispatch: (action: CalculatorAction) => void;
}

/** Renders the workspace panel for the active mode. */
export function ModeHost({ state, dispatch }: ModeHostProps) {
  switch (state.mode) {
    case "calculate":
      return <CalculateMode state={state} dispatch={dispatch} />;
    case "complex":
      return <ComplexMode state={state} dispatch={dispatch} />;
    case "base-n":
      return <BaseNMode />;
    case "matrix":
      return <MatrixMode />;
    case "vector":
      return <VectorMode angleUnit={state.angleUnit} />;
    case "statistics":
      return <StatisticsMode />;
    case "distribution":
      return <DistributionMode />;
    case "spreadsheet":
      return <SpreadsheetMode />;
    case "table":
      return <TableMode state={state} />;
    case "equation":
      return <EquationMode />;
    case "inequality":
      return <InequalityMode />;
    case "ratio":
      return <RatioMode />;
    default:
      return null;
  }
}
