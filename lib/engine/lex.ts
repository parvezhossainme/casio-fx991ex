import { FUNCTIONS } from "./functions";
import {
  type SymbolName,
  type Token,
  type OperatorToken,
  type PostfixToken,
} from "./tokens";
import { syntaxError } from "./errors";

/**
 * Small string → token lexer. Used by tests, the spreadsheet/table formula parser, and paste
 * handling. Typing on the keypad bypasses this and pushes tokens directly.
 */

const OP_GLYPHS: Record<string, OperatorToken> = {
  "+": "+",
  "-": "-",
  "−": "-",
  "*": "*",
  "×": "*",
  "/": "/",
  "÷": "/",
  "^": "^",
  ᴇ: "E",
};

const SINGLE_LETTER_SYMBOLS = new Set<SymbolName>([
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "X",
  "Y",
  "M",
]);
const POSTFIX_GLYPHS: Record<string, PostfixToken> = {
  "!": "!",
  "%": "%",
  "⁻¹": "^-1",
};

export function lex(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < source.length) {
    const ch = source[i]!;

    if (ch === " ") {
      i += 1;
      continue;
    }

    if ((ch >= "0" && ch <= "9") || ch === ".") {
      tokens.push({ kind: "number", text: ch });
      i += 1;
      continue;
    }

    if (ch === "⁻" && source.slice(i, i + 2) === "⁻¹") {
      tokens.push({ kind: "postfix", op: "^-1" });
      i += 2;
      continue;
    }

    if (ch === "√") {
      tokens.push({ kind: "root", name: "sqrt" });
      i += 1;
      continue;
    }
    if (ch === "∛") {
      tokens.push({ kind: "root", name: "cbrt" });
      i += 1;
      continue;
    }

    if (ch === "π") {
      tokens.push({ kind: "symbol", name: "pi" });
      i += 1;
      continue;
    }

    if (ch === "(") {
      tokens.push({ kind: "lparen" });
      i += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({ kind: "rparen" });
      i += 1;
      continue;
    }
    if (ch === ",") {
      tokens.push({ kind: "comma" });
      i += 1;
      continue;
    }

    const op = OP_GLYPHS[ch];
    if (op) {
      tokens.push({ kind: "op", op });
      i += 1;
      continue;
    }

    const postfix = POSTFIX_GLYPHS[ch];
    if (postfix) {
      tokens.push({ kind: "postfix", op: postfix });
      i += 1;
      continue;
    }

    if (/[A-Za-z]/.test(ch)) {
      let word = "";
      while (i < source.length && /[A-Za-z]/.test(source[i]!)) {
        word += source[i];
        i += 1;
      }
      tokens.push(lexWord(word));
      continue;
    }

    throw syntaxError(`Unexpected character ${JSON.stringify(ch)}`);
  }

  return tokens;
}

function lexWord(word: string): Token {
  if (word === "Ans" || word === "PreAns") {
    return { kind: "symbol", name: word };
  }
  if (word === "pi") return { kind: "symbol", name: "pi" };
  if (word === "e") return { kind: "symbol", name: "e" };
  if (word === "i") return { kind: "symbol", name: "i" };
  if (word.length === 1 && SINGLE_LETTER_SYMBOLS.has(word as SymbolName)) {
    return { kind: "symbol", name: word as SymbolName };
  }
  if (word === "sqrt") return { kind: "root", name: "sqrt" };
  if (word === "cbrt") return { kind: "root", name: "cbrt" };
  if (word === "Ran") return { kind: "func", name: "Ran" };
  if (word in FUNCTIONS) return { kind: "func", name: word };
  throw syntaxError(`Unknown name ${JSON.stringify(word)}`);
}
