"use client";

import { useCallback, useState } from "react";
import { Keypad } from "./Keypad";
import { LCD } from "./LCD";
import { IntroOverlay } from "./IntroOverlay";
import { ModeMenu } from "./ModeMenu";
import { SetupMenu } from "./SetupMenu";
import { ConstantsDialog } from "./ConstantsDialog";
import { ConversionsDialog } from "./ConversionsDialog";
import { ModeHost } from "@/components/modes/ModeHost";
import { useCalculator } from "@/hooks/useCalculator";
import { numberToTokens } from "@/lib/engine";
import {
  actionToInsertText,
  clearFocusedField,
  deleteFromFocusedField,
  hasFocusedField,
  writeToFocusedField,
} from "@/lib/keyboard/route";
import { usePhysicalKeyboard } from "@/lib/keyboard/usePhysicalKeyboard";
import { modeInfo, type CalculatorAction, type ModeId } from "@/types";

export function CalculatorShell() {
  const { state, dispatch } = useCalculator();
  const [menuOpen, setMenuOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [constantsOpen, setConstantsOpen] = useState(false);
  const [conversionsOpen, setConversionsOpen] = useState(false);

  const mode = modeInfo(state.mode);
  const showWorkspace = state.mode !== "calculate";

  const handleAction = useCallback(
    (action: CalculatorAction) => {
      if (action.type === "control") {
        switch (action.control) {
          case "mode":
            setMenuOpen(true);
            dispatch({ type: "control", control: "mode" });
            return;
          case "setup":
          case "optn":
            setSetupOpen(true);
            dispatch({ type: "control", control: "setup" });
            return;
          case "const":
            setConstantsOpen(true);
            dispatch({ type: "control", control: "const" });
            return;
          case "conv":
            setConversionsOpen(true);
            dispatch({ type: "control", control: "conv" });
            return;
          case "off":
            setMenuOpen(false);
            setSetupOpen(false);
            setConstantsOpen(false);
            setConversionsOpen(false);
            return;
          case "delete":
            if (!mode.expressionBased && deleteFromFocusedField()) {
              dispatch({ type: "control", control: "on" });
              return;
            }
            break;
          case "clear":
            if (!mode.expressionBased && clearFocusedField()) {
              dispatch({ type: "control", control: "on" });
              return;
            }
            break;
          default:
            break;
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
    <>
      <IntroOverlay />

      <main className="calc-page">
        <div className="calc-hud" aria-hidden="true">
          <span className="calc-hud-dot" />
          <span>SYS.READY</span>
          <span className="calc-hud-rule" />
          <span className="calc-hud-value">{mode.shortName}</span>
        </div>

        <div className="calc-frame">
          <div className="calc-case">
            <div className="calc-brand">
              <span className="calc-brand-mark">CASIO</span>
              <span className="calc-brand-model">fx-991EX</span>
              <span className="calc-brand-sub">ClassWiz</span>
            </div>

            <LCD
              state={state}
              showExpression={mode.expressionBased}
              hint={mode.name}
            />

            <Keypad
              shift={state.shift}
              alpha={state.alpha}
              onAction={handleAction}
            />
          </div>
        </div>

        {showWorkspace ? (
          <div className="calc-workspace">
            <ModeHost state={state} dispatch={dispatch} />
          </div>
        ) : null}

        <footer className="calc-footer">
          <span className="calc-footer-credit">
            dev by{" "}
            <a
              className="calc-footer-link"
              href="https://github.com/parvezhossainme"
              rel="noreferrer"
              target="_blank"
            >
              @parvezhossainme
            </a>
          </span>
          <span className="calc-footer-dot" aria-hidden="true">
            ·
          </span>
          <span className="calc-footer-note">not affiliated with Casio</span>
        </footer>

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
        <ConstantsDialog
          open={constantsOpen}
          onOpenChange={setConstantsOpen}
          onSelect={(value) => {
            dispatch({ type: "insertTokens", tokens: numberToTokens(value) });
            setConstantsOpen(false);
          }}
        />
        <ConversionsDialog
          open={conversionsOpen}
          onOpenChange={setConversionsOpen}
          onInsert={(value) => {
            dispatch({ type: "insertTokens", tokens: numberToTokens(value) });
            setConversionsOpen(false);
          }}
        />
      </main>
    </>
  );
}
