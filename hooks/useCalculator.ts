"use client";

import { useCallback, useEffect, useReducer } from "react";
import {
  type AngleUnit,
  type AstNode,
  type Token,
  DEFAULT_FORMAT,
  isComplete,
  isCalculatorError,
  parseTokens,
  evaluateAst,
  compileInX,
  formatResult,
  solve,
  toDegreesMinutesSeconds,
  tokensToPlainText,
  type EvalResult,
} from "@/lib/engine";
import {
  type CalculatorAction,
  type CalculatorState,
  type HistoryEntry,
} from "@/types";

const STORAGE_KEY = "casio-calc:state:v1";
const HISTORY_LIMIT = 100;

export const initialState: CalculatorState = {
  mode: "calculate",
  tokens: [],
  cursor: 0,
  shift: false,
  alpha: false,
  hyp: false,
  angleUnit: "DEG",
  format: DEFAULT_FORMAT,
  variables: {},
  ans: 0,
  preAns: 0,
  history: [],
  result: null,
  resultAlternate: null,
  showingAlternate: false,
  error: null,
  pendingStore: false,
  pendingRecall: false,
  insertMode: true,
  replayIndex: null,
  hydrated: false,
};

function nextAngleUnit(unit: AngleUnit): AngleUnit {
  if (unit === "DEG") return "RAD";
  if (unit === "RAD") return "GRA";
  return "DEG";
}

function functionInsertion(
  name: string,
  args: number,
): { list: Token[]; cursorOffset: number } {
  const list: Token[] = [{ kind: "func", name }, { kind: "lparen" }];
  for (let i = 0; i < Math.max(0, args - 1); i += 1)
    list.push({ kind: "comma" });
  list.push({ kind: "rparen" });
  // Place the caret inside the parentheses, in the first argument slot.
  return { list, cursorOffset: 2 };
}

function insertTokens(
  state: CalculatorState,
  incoming: Token[],
  cursorOffset?: number,
): CalculatorState {
  const at = Math.max(0, Math.min(state.cursor, state.tokens.length));
  const before = state.tokens.slice(0, at);
  const after = state.insertMode
    ? state.tokens.slice(at)
    : state.tokens.slice(at + 1);
  const tokens = [...before, ...incoming, ...after];
  const cursor = at + (cursorOffset ?? incoming.length);
  return { ...state, tokens, cursor, error: null, replayIndex: null };
}

const isVariableName = (name: string): boolean =>
  ["A", "B", "C", "D", "E", "F", "X", "Y", "M"].includes(name);

function evaluateState(state: CalculatorState): Partial<CalculatorState> {
  const ast = parseTokens(state.tokens);
  if (state.tokens.length === 0) {
    return { result: null, resultAlternate: null, error: null };
  }
  if (!isComplete(ast)) {
    return { error: "Syntax Error", result: null, resultAlternate: null };
  }

  try {
    const value: EvalResult = evaluateAst(ast, {
      angleUnit: state.angleUnit,
      variables: state.variables,
      ans: state.ans,
      preAns: state.preAns,
    });
    const formatted = formatResult(value, state.format);
    const entry: HistoryEntry = {
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mode: state.mode,
      expression: tokensToPlainText(state.tokens),
      result: formatted.text,
      tokens: state.tokens,
      at: Date.now(),
    };
    return {
      result: formatted.text,
      resultAlternate: formatted.alternate,
      showingAlternate: false,
      error: null,
      ans: typeof value === "number" ? value : state.ans,
      preAns: state.ans,
      history: [...state.history, entry].slice(-HISTORY_LIMIT),
      replayIndex: null,
    };
  } catch (error) {
    const code = isCalculatorError(error) ? error.code : "Math Error";
    return { error: code, result: null, resultAlternate: null };
  }
}

export function reducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case "insertToken": {
      const token = action.token;

      if (
        (state.pendingStore || state.pendingRecall) &&
        token.kind === "symbol"
      ) {
        if (state.pendingStore && isVariableName(token.name)) {
          return {
            ...state,
            pendingStore: false,
            shift: false,
            alpha: false,
            variables: { ...state.variables, [token.name]: state.ans },
            result: state.result ?? String(state.ans),
            error: null,
          };
        }
        if (state.pendingRecall) {
          return insertTokens(
            { ...state, pendingRecall: false, shift: false, alpha: false },
            [token],
          );
        }
      }

      const consumed = { ...state, shift: false, alpha: false };
      return insertTokens(consumed, [token]);
    }

    case "insertTokens": {
      const consumed = { ...state, shift: false, alpha: false };
      return insertTokens(consumed, action.tokens);
    }

    case "insertFunction": {
      const consumed = {
        ...state,
        shift: false,
        alpha: false,
        pendingStore: false,
        pendingRecall: false,
      };
      const { list, cursorOffset } = functionInsertion(
        action.name,
        action.args,
      );
      return insertTokens(consumed, list, cursorOffset);
    }

    case "insertText": {
      return { ...state, result: action.text || state.result };
    }

    case "control": {
      switch (action.control) {
        case "equals":
        case "calc": {
          const base = { ...state, shift: false, alpha: false };
          return { ...base, ...evaluateState(base) };
        }

        case "solve": {
          const consumed = { ...state, shift: false, alpha: false };
          const ast = parseTokens(consumed.tokens);
          try {
            const solution = solveForX(ast, consumed);
            return {
              ...consumed,
              variables: { ...consumed.variables, X: solution },
              result: formatResult(solution, consumed.format).text,
              error: null,
            };
          } catch (error) {
            return {
              ...consumed,
              error: isCalculatorError(error) ? error.code : "Math Error",
            };
          }
        }

        case "clear":
          return {
            ...state,
            tokens: [],
            cursor: 0,
            result: null,
            resultAlternate: null,
            error: null,
            shift: false,
            alpha: false,
            showingAlternate: false,
            replayIndex: null,
          };

        case "delete": {
          if (state.cursor === 0)
            return { ...state, shift: false, alpha: false };
          const tokens = [
            ...state.tokens.slice(0, state.cursor - 1),
            ...state.tokens.slice(state.cursor),
          ];
          return {
            ...state,
            tokens,
            cursor: state.cursor - 1,
            error: null,
            shift: false,
            alpha: false,
          };
        }

        case "left":
          return {
            ...state,
            cursor: Math.max(0, state.cursor - 1),
            shift: false,
            alpha: false,
          };

        case "right":
          return {
            ...state,
            cursor: Math.min(state.tokens.length, state.cursor + 1),
            shift: false,
            alpha: false,
          };

        case "up":
          return replaysHistory(state, -1);

        case "down":
          return replaysHistory(state, 1);

        case "sd": {
          if (!state.resultAlternate)
            return { ...state, shift: false, alpha: false };
          const showingAlternate = !state.showingAlternate;
          return {
            ...state,
            showingAlternate,
            result: showingAlternate ? state.resultAlternate : state.result,
            resultAlternate: showingAlternate
              ? state.result
              : state.resultAlternate,
            shift: false,
            alpha: false,
          };
        }

        case "sto":
          return {
            ...state,
            pendingStore: true,
            pendingRecall: false,
            shift: false,
            alpha: false,
          };

        case "rcl":
          return {
            ...state,
            pendingRecall: true,
            pendingStore: false,
            shift: false,
            alpha: false,
          };

        case "drg":
          return {
            ...state,
            angleUnit: nextAngleUnit(state.angleUnit),
            shift: false,
            alpha: false,
          };

        case "ins":
          return {
            ...state,
            insertMode: !state.insertMode,
            shift: false,
            alpha: false,
          };

        case "mplus":
          return {
            ...state,
            variables: {
              ...state.variables,
              M: (state.variables.M ?? 0) + state.ans,
            },
            shift: false,
            alpha: false,
          };

        case "dms":
          try {
            return {
              ...state,
              result: toDegreesMinutesSeconds(state.ans, state.format),
              resultAlternate: null,
              showingAlternate: false,
              error: null,
              shift: false,
              alpha: false,
            };
          } catch (error) {
            return {
              ...state,
              error: isCalculatorError(error) ? error.code : "Math Error",
              shift: false,
              alpha: false,
            };
          }

        case "reset":
          return {
            ...initialState,
            history: [],
            hydrated: state.hydrated,
            mode: state.mode,
          };

        case "const":
        case "conv":
          // Handled by the shell, which opens the corresponding dialog.
          return { ...state, shift: false, alpha: false };

        case "on":
          return {
            ...state,
            error: null,
            shift: false,
            alpha: false,
            hyp: false,
            showingAlternate: false,
          };

        case "off":
        case "mode":
        case "optn":
        case "setup":
          return { ...state, shift: false, alpha: false };

        default:
          return state;
      }
    }

    case "toggleShift":
      return { ...state, shift: !state.shift, alpha: false };

    case "toggleAlpha":
      return { ...state, alpha: !state.alpha, shift: false };

    case "toggleHyp":
      return { ...state, hyp: !state.hyp };

    case "setMode":
      return {
        ...state,
        mode: action.mode,
        tokens: [],
        cursor: 0,
        result: null,
        resultAlternate: null,
        error: null,
        shift: false,
        alpha: false,
        hyp: false,
        showingAlternate: false,
        replayIndex: null,
      };

    case "setAngleUnit":
      return { ...state, angleUnit: action.unit, shift: false, alpha: false };

    case "setFormat":
      return { ...state, format: action.format };

    case "storeVariable":
      return {
        ...state,
        variables: { ...state.variables, [action.name]: state.ans },
        pendingStore: false,
        shift: false,
        alpha: false,
      };

    case "recallVariable": {
      const consumed = {
        ...state,
        pendingRecall: false,
        shift: false,
        alpha: false,
      };
      return insertTokens(consumed, [{ kind: "symbol", name: action.name }]);
    }

    case "clearHistory":
      return { ...state, history: [], replayIndex: null };

    case "toggleSd": {
      if (!state.resultAlternate) return state;
      const showingAlternate = !state.showingAlternate;
      return {
        ...state,
        showingAlternate,
        result: showingAlternate ? state.resultAlternate : state.result,
        resultAlternate: showingAlternate
          ? state.result
          : state.resultAlternate,
      };
    }

    case "setError":
      return { ...state, error: action.message };

    case "hydrate":
      return { ...state, ...action.partial, hydrated: true };

    default:
      return state;
  }
}

function replaysHistory(
  state: CalculatorState,
  direction: -1 | 1,
): CalculatorState {
  if (state.history.length === 0)
    return { ...state, shift: false, alpha: false };

  const base =
    state.replayIndex === null
      ? direction < 0
        ? state.history.length
        : 0
      : state.replayIndex;

  const index = base + direction;
  if (index < 0 || index >= state.history.length) {
    return { ...state, shift: false, alpha: false, replayIndex: null };
  }
  const entry = state.history[index];
  if (!entry) return state;

  return {
    ...state,
    tokens: entry.tokens,
    cursor: entry.tokens.length,
    replayIndex: index,
    error: null,
    shift: false,
    alpha: false,
  };
}

function solveForX(ast: AstNode, state: CalculatorState): number {
  if (!isComplete(ast)) throw new Error("Syntax Error");
  const fn = compileInX(ast, {
    angleUnit: state.angleUnit,
    variables: state.variables,
    ans: state.ans,
    preAns: state.preAns,
  });
  return solve(fn, state.variables.X ?? 0);
}

interface PersistedState {
  angleUnit?: AngleUnit;
  format?: CalculatorState["format"];
  variables?: CalculatorState["variables"];
  history?: HistoryEntry[];
}

/** Calculator state with localStorage-backed preferences and history. */
export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let persisted: PersistedState | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) persisted = JSON.parse(raw) as PersistedState;
    } catch {
      persisted = null;
    }
    dispatch({
      type: "hydrate",
      partial: {
        angleUnit: persisted?.angleUnit ?? initialState.angleUnit,
        format: persisted?.format ?? initialState.format,
        variables: persisted?.variables ?? {},
        history: Array.isArray(persisted?.history) ? persisted.history : [],
      },
    });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      const payload: PersistedState = {
        angleUnit: state.angleUnit,
        format: state.format,
        variables: state.variables,
        history: state.history,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage unavailable (private mode / SSR) — preferences simply are not persisted.
    }
  }, [
    state.hydrated,
    state.angleUnit,
    state.format,
    state.variables,
    state.history,
  ]);

  const dispatchKey = useCallback(
    (action: CalculatorAction) => dispatch(action),
    [],
  );

  return { state, dispatch, dispatchKey };
}
