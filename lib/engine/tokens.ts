/**
 * Token model for the calculator input buffer.
 *
 * The input buffer is a flat, linear list of tokens. Structural maths (fractions, powers,
 * roots, function arguments) is recovered at parse time, which keeps cursor editing simple:
 * the caret is just an index into this list.
 */

export type OperatorToken = "+" | "-" | "*" | "/" | "^" | "E";

export type PostfixToken = "!" | "%" | "^-1";

export type SymbolName =
  | "pi"
  | "e"
  | "i"
  | "Ans"
  | "PreAns"
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "X"
  | "Y"
  | "M";

export type Token =
  | { kind: "number"; text: string }
  | { kind: "symbol"; name: SymbolName }
  | { kind: "op"; op: OperatorToken }
  | { kind: "func"; name: string }
  | { kind: "lparen" }
  | { kind: "rparen" }
  | { kind: "comma" }
  | { kind: "postfix"; op: PostfixToken }
  | { kind: "root"; name: "sqrt" | "cbrt" };

export const numberToken = (text: string): Token => ({ kind: "number", text });
export const symbolToken = (name: SymbolName): Token => ({
  kind: "symbol",
  name,
});
export const opToken = (op: OperatorToken): Token => ({ kind: "op", op });
export const funcToken = (name: string): Token => ({ kind: "func", name });
export const postfixToken = (op: PostfixToken): Token => ({
  kind: "postfix",
  op,
});
export const rootToken = (name: "sqrt" | "cbrt"): Token => ({
  kind: "root",
  name,
});

export const LPAREN: Token = { kind: "lparen" };
export const RPAREN: Token = { kind: "rparen" };
export const COMMA: Token = { kind: "comma" };

/** Glyphs used when a token has to be shown as plain text (serialisation/aria/plain mode). */
export const TOKEN_GLYPH: Record<OperatorToken, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
  "^": "^",
  E: "ᴇ",
};

export const POSTFIX_GLYPH: Record<PostfixToken, string> = {
  "!": "!",
  "%": "%",
  "^-1": "⁻¹",
};

export const SYMBOL_GLYPH: Record<SymbolName, string> = {
  pi: "π",
  e: "e",
  i: "i",
  Ans: "Ans",
  PreAns: "PreAns",
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  X: "X",
  Y: "Y",
  M: "M",
};

const DIGITS = "0123456789";

export const isDigitToken = (t: Token): boolean =>
  t.kind === "number" && t.text.length === 1 && DIGITS.includes(t.text);

export const isNumberToken = (t: Token): boolean => t.kind === "number";

/** True when a token may begin a primary expression (used for implicit multiplication). */
export function startsPrimary(t: Token | undefined): boolean {
  if (!t) return false;
  switch (t.kind) {
    case "number":
    case "symbol":
    case "func":
    case "lparen":
    case "root":
      return true;
    default:
      return false;
  }
}

/** Plain-text rendering of the whole buffer, used for fallbacks and accessibility labels. */
export function tokensToPlainText(tokens: Token[]): string {
  let out = "";
  for (const t of tokens) {
    switch (t.kind) {
      case "number":
        out += t.text;
        break;
      case "symbol":
        out += SYMBOL_GLYPH[t.name];
        break;
      case "op":
        out += TOKEN_GLYPH[t.op];
        break;
      case "func":
        out += t.name;
        break;
      case "lparen":
        out += "(";
        break;
      case "rparen":
        out += ")";
        break;
      case "comma":
        out += ",";
        break;
      case "postfix":
        out += POSTFIX_GLYPH[t.op];
        break;
      case "root":
        out += t.name === "sqrt" ? "√" : "∛";
        break;
    }
  }
  return out;
}
