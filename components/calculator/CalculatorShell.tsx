"use client";

import { useCallback, useState } from "react";
import { Keypad } from "./Keypad";
import { LCD } from "./LCD";
import { ModeMenu } from "./ModeMenu";
import { SetupMenu } from "./SetupMenu";
import { ModeHost } from "@/components/modes/ModeHost";
import { Button } from "@/components/ui/button";
import { useCalculator } from "@/hooks/useCalculator";
import {
  actionToInsertText,
  clearFocusedField,
  deleteFromFocusedField,
  hasFocusedField,
  writeToFocusedField,
} from "@/lib/keyboard/route";
import { usePhysicalKeyboard } from "@/lib/keyboard/usePhysicalKeyboard";
import {
  modeInfo,
  type CalculatorAction,
  type HistoryEntry,
  type ModeId,
} from "@/types";

const KEYBOARD_HELP: [string, string][] = [
  ["0-9 . ,", "Digits, decimal point, separator"],
  ["+ - * / ^ ( )", "Operators and parentheses"],
  ["Enter / =", "Evaluate"],
  ["Backspace", "Delete the character before the cursor"],
  ["Escape", "All clear"],
  ["← →", "Move the cursor"],
  ["↑ ↓", "Replay previous calculations"],
  ["p q", "π and square root"],
  ["s c t", "sin, cos, tan"],
  ["l n", "log and ln"],
];

function HistoryPanel({
  entries,
  onSelect,
  onClear,
}: {
  entries: HistoryEntry[];
  onSelect: (index: number) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">History</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={entries.length === 0}
        >
          Clear
        </Button>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Calculations you run will appear here.
        </p>
      ) : (
        <ol
          className="max-h-64 space-y-1 overflow-y-auto pr-1"
          data-testid="history-list"
        >
          {entries
            .slice()
            .reverse()
            .map((entry, reversedIndex) => {
              const index = entries.length - 1 - reversedIndex;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(index)}
                    className="w-full rounded-md px-2 py-1 text-left font-mono text-xs hover:bg-white/5"
                  >
                    <span className="block truncate text-muted-foreground">
                      {entry.expression}
                    </span>
                    <span className="block truncate">= {entry.result}</span>
                  </button>
                </li>
              );
            })}
        </ol>
      )}
    </div>
  );
}

function HelpPanel() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <h2 className="mb-3 text-sm font-semibold">Physical keyboard</h2>
      <dl className="grid gap-1 text-xs sm:grid-cols-2">
        {KEYBOARD_HELP.map(([keys, description]) => (
          <div key={keys} className="flex items-baseline gap-2">
            <dt className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 font-mono">
              {keys}
            </dt>
            <dd className="text-muted-foreground">{description}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function CalculatorShell() {
  const { state, dispatch } = useCalculator();
  const [menuOpen, setMenuOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const mode = modeInfo(state.mode);

  const handleAction = useCallback(
    (action: CalculatorAction) => {
      if (action.type === "control") {
        if (action.control === "mode") {
          setMenuOpen(true);
          dispatch({ type: "control", control: "mode" });
          return;
        }
        if (action.control === "setup") {
          setSetupOpen(true);
          dispatch({ type: "control", control: "setup" });
          return;
        }
        if (action.control === "off") {
          setMenuOpen(false);
          setSetupOpen(false);
          return;
        }
        if (!mode.expressionBased) {
          if (action.control === "delete" && deleteFromFocusedField()) {
            dispatch({ type: "control", control: "on" });
            return;
          }
          if (action.control === "clear" && clearFocusedField()) {
            dispatch({ type: "control", control: "on" });
            return;
          }
        }
      }

      if (!mode.expressionBased) {
        const text = actionToInsertText(action);
        if (text !== null && hasFocusedField()) {
          writeToFocusedField(text);
          dispatch({ type: "control", control: "on" });
          return;
        }
      }

      dispatch(action);
    },
    [dispatch, mode.expressionBased],
  );

  usePhysicalKeyboard(handleAction);

  const selectMode = useCallback(
    (next: ModeId) => {
      dispatch({ type: "setMode", mode: next });
      setMenuOpen(false);
    },
    [dispatch],
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Casio fx-991EX ClassWiz — Web Emulator
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            An independent, browser-only emulator inspired by the Casio fx-991EX
            ClassWiz. It is an educational project and is not affiliated with,
            endorsed by, or produced by Casio. It reproduces behaviour
            approximately and does not emulate the device&apos;s firmware.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          <section
            aria-label="Calculator"
            className="mx-auto w-full max-w-[24rem]"
          >
            <div className="calc-body">
              <div className="calc-brand">
                <div>
                  <div className="calc-brand-mark">CASIO</div>
                  <div className="calc-brand-model">fx-991EX · CLASSWIZ</div>
                </div>
                <div className="calc-solar" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, index) => (
                    <span key={index} className="calc-solar-cell" />
                  ))}
                </div>
              </div>

              <LCD
                state={state}
                showExpression={mode.expressionBased}
                hint="Press MODE to change mode"
              />

              <Keypad
                shift={state.shift}
                alpha={state.alpha}
                onAction={handleAction}
              />

              <div className="mt-3 flex items-center justify-between px-1">
                <span className="text-[0.6rem] uppercase tracking-[0.18em] text-neutral-500">
                  Natural-V.P.A.M. display
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setMenuOpen(true)}
                  >
                    MODE
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setSetupOpen(true)}
                  >
                    SETUP
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6" aria-label="Mode workspace">
            <ModeHost state={state} dispatch={dispatch} />
            <HistoryPanel
              entries={state.history}
              onSelect={(index) => {
                const entry = state.history[index];
                if (!entry) return;
                dispatch({ type: "control", control: "clear" });
                dispatch({ type: "insertTokens", tokens: entry.tokens });
              }}
              onClear={() => dispatch({ type: "clearHistory" })}
            />
            <HelpPanel />
          </section>
        </div>
      </div>

      <ModeMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        current={state.mode}
        onSelect={selectMode}
      />
      <SetupMenu
        open={setupOpen}
        onOpenChange={setSetupOpen}
        angleUnit={state.angleUnit}
        format={state.format}
        insertMode={state.insertMode}
        onAngleUnit={(unit) => dispatch({ type: "setAngleUnit", unit })}
        onFormat={(format) => dispatch({ type: "setFormat", format })}
        onInsertMode={() => dispatch({ type: "control", control: "ins" })}
        onClearHistory={() => dispatch({ type: "clearHistory" })}
      />
    </main>
  );
}
