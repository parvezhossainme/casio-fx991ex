# Architecture

## Overview

The emulator is a **client-only** Next.js App Router application. There is no backend, database,
API key or external service: every calculation runs in the browser. The only third-party runtime
dependency used for maths is `mathjs` (Apache-2.0); everything above it — the input model, the
natural-textbook renderer, the keypad, the modes and the numeric routines — is original code.

```
┌─────────────────────────────────────────────────────────────────────┐
│ UI (React)                                                          │
│  components/calculator/*  → body, LCD, keypad, menus                 │
│  components/display/*     → natural-textbook renderer                │
│  components/modes/*       → one workspace panel per mode             │
├─────────────────────────────────────────────────────────────────────┤
│ State                                                               │
│  hooks/useCalculator.ts   → reducer + localStorage persistence       │
│  types/index.ts           → ModeId, CalculatorState, actions         │
├─────────────────────────────────────────────────────────────────────┤
│ Input                                                               │
│  lib/keyboard/keymap.ts         → single source of truth for keys    │
│  lib/keyboard/usePhysicalKeyboard.ts → one global key listener       │
│  lib/keyboard/route.ts          → plain-input routing for form modes │
├─────────────────────────────────────────────────────────────────────┤
│ Engine (no React, deterministic, unit-tested)                       │
│  tokens → ast/parse → serialize → evaluate (mathjs) → format         │
│  numeric, fraction, result, errors                                   │
├─────────────────────────────────────────────────────────────────────┤
│ Mode logic (pure functions, unit-tested)                            │
│  lib/modes/{matrix,vector,basen,stats,distribution,equation,         │
│             inequality,ratio,spreadsheet,complex}.ts                 │
└─────────────────────────────────────────────────────────────────────┘
```

## The input model

The buffer the user edits is a **flat list of tokens** (`lib/engine/tokens.ts`). Structural maths is
recovered at parse time rather than stored, which keeps editing trivial: the caret is an integer
index into the list.

```ts
type Token =
  | { kind: "number"; text: string } // one character: 0-9 or .
  | { kind: "symbol"; name: SymbolName } // π, e, i, Ans, PreAns, A-F, X, Y, M
  | { kind: "op"; op: OperatorToken } // + - * / ^ E
  | { kind: "func"; name: string } // sin, log, integ, …
  | { kind: "lparen" }
  | { kind: "rparen" }
  | { kind: "comma" }
  | { kind: "postfix"; op: PostfixToken } // ! % ⁻¹
  | { kind: "root"; name: "sqrt" | "cbrt" };
```

Pressing a function key inserts `func ( … )` and places the caret **inside** the parentheses, so the
buffer stays balanced while typing.

## Parse → serialize → evaluate

1. **`parseTokens`** (`lib/engine/ast.ts`) is a precedence-climbing parser producing an `AstNode`
   tree. It is deliberately **tolerant**: incomplete input yields `empty` placeholders instead of
   throwing, so the display always has something to draw. Precedence, right-associative `^`/`ᴇ`,
   unary signs, postfix operators and implicit multiplication are handled here.
2. **`toMathString`** (`lib/engine/serialize.ts`) turns the AST into a mathjs expression string.
   Children are parenthesised so re-association cannot occur, trig arguments are wrapped with the
   active angle-unit factor (e.g. `sin((30)*pi/180)` in DEG mode), and Casio names are mapped to
   mathjs names (`log` → `log10`, `ln` → `log`, `nPr` → `permutations`, `ˣ√` → `nthRoot`).
3. **`evaluateAst`** (`lib/engine/evaluate.ts`) evaluates that string against a **locked scope**
   (variables, `Ans`/`PreAns`, `Pol`/`Rec`/`RanInt`/`Ran`) using a `mathjs` instance created with
   `create(all)`. The calculator never calls `eval`/`new Function`, and the only strings handed to
   mathjs come from our own serialiser over a **closed token vocabulary** — user input cannot
   introduce an arbitrary function name.
4. **Numeric routines** (`lib/engine/numeric.ts`): ∫ uses adaptive Gauss–Kronrod (G7–K15+embedded
   G7 error estimate), d/dx a five-point central difference, Σ a bounded series, and SOLVE a
   Newton iteration with a bisection fallback. `integ`, `deriv` and `sum` are _special_ AST nodes
   resolved during serialisation — the integrand is compiled once and sampled numerically.
5. **`formatResult`** (`lib/engine/result.ts`) renders reals with the 10-digit display model, complex
   values as `a+bi`, and computes the exact alternate used by S⇔D (π-multiple → surd → fraction).

## Errors

`lib/engine/errors.ts` defines a `CalculatorError` carrying a Casio-style code (`Syntax Error`,
`Math Error`, `Domain Error`, `Dimension Error`, `Variable Error`, …). Anything thrown by mathjs is
mapped onto that taxonomy, and non-finite results are rejected explicitly rather than shown as NaN.

## Natural-textbook display

`components/display/Expression.tsx` renders the AST directly (it does **not** use `innerHTML`):

- `/` becomes a stacked fraction, `^` a superscript, `ᴇ` a `×10` power, `√`/`∛` a radical with an
  overline, `∫`/`Σ` bounds, `logₐb` a subscript base.
- The caret is threaded through the recursive render as a `CaretState`; each node requests the caret
  before (or after) itself, so the caret lands in the correct structural slot — numerator,
  denominator, exponent, radicand — without a second layout pass.

## State and persistence

`hooks/useCalculator.ts` holds a single reducer (`{ mode, tokens, cursor, shift, alpha, hyp,
angleUnit, format, variables, ans, preAns, history, … }`). Results, history and preferences are
persisted to `localStorage` behind a `try/catch`, guarded by a `hydrated` flag so the initial
server render is deterministic and hydration cannot mismatch. Storage being unavailable is a
supported state, not an error.

## Keyboard

`lib/keyboard/keymap.ts` is the single source of truth for the physical layout. It models two blocks,
the way the device is built:

- **Function block** — 5 rows × 6 narrow columns (`FUNCTION_KEYS`, `FUNCTION_COLUMNS = 6`). The
  `SHIFT` and `ALPHA` modifier keys sit in row 1 next to a 2×2 `DIRECTIONAL_PAD` (rows 1–2,
  columns 3–4), which is rendered as a single round pad with four clickable zones.
- **Numeric block** — 4 rows × 5 wider columns (`NUMERIC_KEYS`, `NUMERIC_COLUMNS = 5`).

Every key carries `row`/`col` placement plus its printed legends — `label` (on the cap),
`shiftLabel` (yellow, printed on the case above), `alphaLabel` (red, above) and `blueLabel` (Base-N
notation, beside) — and a `tone` that selects its look (`function`, `numeric`, `blue` for AC/DEL,
`modifier-shift`, `modifier-alpha`). `KeyTile` renders the case legends, `Key` renders the cap.
`resolveKeyAction` picks the SHIFT/ALPHA variant; keys without a variant fall back to `primary`.

`usePhysicalKeyboard` registers **one** global listener in the shell; `keyboardEventToAction` is a
pure function (unit-tested), ignores modified keys so browser shortcuts keep working, and ignores
events whose target is a text field.

Form-based modes expose plain inputs. When such a mode is active the keypad writes into the
focused field (`lib/keyboard/route.ts`) instead of the expression buffer.

## Constants and conversions

`lib/constants/physical.ts` holds the scientific constants surfaced by CONST (SHIFT + 7) and
`lib/constants/conversions.ts` the unit tables behind CONV (SHIFT + 8). Both are plain data plus
pure helpers, so they are unit-tested without a DOM. Selected values are inserted into the display
via `numberToTokens`, which emits `×10ˣ` tokens for extreme magnitudes.

## Modes

Each mode is a pure module in `lib/modes/` plus a panel in `components/modes/`. The panel is mounted
by `ModeHost`. Expression-based modes (Calculate, Complex, Table) drive the shared buffer; the rest
are workspace panels with their own inputs, shown below the calculator only while that mode is
active — so the Calculate screen is just the calculator, as on the device. The MODE/MENU, SETUP,
CONST and CONV surfaces are dialogs opened from the keypad.
