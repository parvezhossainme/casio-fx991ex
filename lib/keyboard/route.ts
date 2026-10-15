import { type CalculatorAction } from "@/types";
import { FUNCTIONS, tokensToPlainText, type Token } from "@/lib/engine";

/** Text representation of a token for the plain inputs used by form-based modes. */
export function tokenToInputText(token: Token): string {
  if (token.kind === "op" && token.op === "E") return "*10^";
  return tokensToPlainText([token]);
}

/** The text a key action would type, or null when the action is not an insertion. */
export function actionToInsertText(action: CalculatorAction): string | null {
  switch (action.type) {
    case "insertToken":
      return tokenToInputText(action.token);
    case "insertTokens":
      return action.tokens.map(tokenToInputText).join("");
    case "insertFunction":
      return `${FUNCTIONS[action.name]?.label ?? action.name}(`;
    default:
      return null;
  }
}

function focusedField(): HTMLInputElement | HTMLTextAreaElement | null {
  if (typeof document === "undefined") return null;
  const el = document.activeElement;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
    return el;
  return null;
}

/** Insert text into the focused plain input (form-based modes). Returns false when none is focused. */
export function writeToFocusedField(text: string): boolean {
  const el = focusedField();
  if (!el) return false;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  el.value = el.value.slice(0, start) + text + el.value.slice(end);
  const caret = start + text.length;
  el.setSelectionRange(caret, caret);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

export function deleteFromFocusedField(): boolean {
  const el = focusedField();
  if (!el) return false;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  if (start === end && start === 0) return true;
  const from = start === end ? start - 1 : start;
  el.value = el.value.slice(0, from) + el.value.slice(end);
  el.setSelectionRange(from, from);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

export function clearFocusedField(): boolean {
  const el = focusedField();
  if (!el) return false;
  el.value = "";
  el.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

export function hasFocusedField(): boolean {
  return focusedField() !== null;
}
