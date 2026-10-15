# Casio fx-991EX ClassWiz — Web Emulator

A production-quality, **browser-only** scientific calculator emulator inspired by the
Casio fx-991EX ClassWiz, built with Next.js, React, TypeScript and Tailwind CSS.

> **Educational project. Not affiliated with, endorsed by, or produced by Casio.** The device's
> firmware is not emulated and no Casio assets are redistributed. See
> [`docs/DISCLAIMER.md`](docs/DISCLAIMER.md).

Everything runs locally in the browser — no backend, account, database, API key or paid service.

---

## Features

- **12 calculation modes** with working operations and their own workspaces:
  Calculate · Complex · Base-N · Matrix · Vector · Statistics · Distribution · Spreadsheet ·
  Table · Equation/Func · Inequality · Ratio.
- **Natural-textbook display** — stacked fractions, superscript powers, radicals with an overline,
  logarithm bases, integral/summation bounds — rendered structurally, never as a plain string.
- **A keypad that matches the device**: six narrow function columns over five wider numeric columns,
  pale-grey numeric keys with dark legends, blue AC/DEL, a round replay pad, and yellow SHIFT / red
  ALPHA / blue Base-N legends printed above and beside the keys. The page shows the calculator and
  nothing else.
- **Device-level functions**: MENU (SHIFT for SETUP), OPTN, CALC (SHIFT for SOLVE), S⇔D, ENG, x⁻¹,
  ENG/Pol/Rec/nPr/nCr/Rnd/Ran#/RanInt shift functions, `×10ˣ`, `°′″` degree-minute-second conversion,
  M+ memory, and CONST (SHIFT + 7) / CONV (SHIFT + 8) tools.
- **Full physical-keyboard support**, with preferences and calculation history persisted to
  `localStorage`.
- **A typed, React-free math engine** with a tolerant parser, explicit Casio-style error taxonomy,
  10-digit display formatting, exact-form (S⇔D) handling, and numerical ∫ / d-dx / Σ / SOLVE.
- **119 unit tests and 52 end-to-end tests** passing across desktop and mobile viewports.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Press `7 × 8 =` on the keypad (or type it) — you should see `56`.

## Available scripts

| Command                    | Description                                 |
| -------------------------- | ------------------------------------------- |
| `npm run dev`              | Start the development server                |
| `npm run build`            | Production build                            |
| `npm run start`            | Serve the production build                  |
| `npm run lint`             | ESLint                                      |
| `npm run typecheck`        | TypeScript, `--noEmit`                      |
| `npm test`                 | Vitest unit tests                           |
| `npm run test:coverage`    | Unit tests with coverage                    |
| `npm run test:e2e`         | Playwright end-to-end tests                 |
| `npm run test:e2e:install` | Install the Chromium browser for Playwright |
| `npm run format`           | Prettier                                    |

## Project structure

```
app/                     routes, layout, global styles
components/
  calculator/            case, LCD, keypad, keys, directional pad, MENU/SETUP/CONST/CONV dialogs
  display/               natural-textbook expression renderer
  modes/                 one workspace panel per mode
  ui/                    shadcn/ui primitives
lib/
  engine/                tokens, parser, serializer, evaluator, formatting, numerics
  modes/                 pure logic for the mode-specific features
  keyboard/              keymap registry, physical-keyboard listener, input routing
  constants/             scientific constants and unit-conversion data
hooks/                   calculator reducer with localStorage persistence
types/                   shared application types
tests/unit/              Vitest tests
tests/e2e/               Playwright tests
docs/                    research, architecture, feature matrix, deployment, disclaimer
```

Details of the engine and data flow are in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md); an honest
per-feature status table is in [`docs/FEATURE_MATRIX.md`](docs/FEATURE_MATRIX.md).

## Keyboard shortcuts

| Keys                        | Action                           |
| --------------------------- | -------------------------------- |
| `0`–`9`, `.`, `,`           | Digits, decimal point, separator |
| `+` `-` `*` `/` `^` `(` `)` | Operators and parentheses        |
| `Enter` or `=`              | Evaluate                         |
| `Backspace` / `Delete`      | Delete before the cursor         |
| `Escape`                    | All clear                        |
| `←` `→`                     | Move the cursor                  |
| `↑` `↓`                     | Replay previous calculations     |
| `p` `q`                     | π and square root                |
| `s` `c` `t`                 | sin, cos, tan                    |
| `l` `n`                     | log and ln                       |

Modifier combinations (`Ctrl`/`Cmd`/`Alt`) and unmapped keys are never intercepted, so normal
browser shortcuts keep working.

## Modes at a glance

| Mode          | Highlights                                                                |
| ------------- | ------------------------------------------------------------------------- |
| Calculate     | Arithmetic, scientific functions, fractions, memory, ∫ / d-dx / Σ, SOLVE  |
| Complex       | `a+bi` arithmetic, modulus, argument, conjugate, Re/Im                    |
| Base-N        | DEC/HEX/OCT/BIN, bitwise logic, shifts, 32-bit two's-complement display   |
| Matrix        | 1×1–4×4, add/subtract/multiply, determinant, inverse, transpose, identity |
| Vector        | 2D/3D, sum, difference, dot, cross, magnitude, angle, unit vector         |
| Statistics    | 1-variable statistics and linear regression                               |
| Distribution  | Normal (pdf/cdf/inverse), binomial, Poisson                               |
| Spreadsheet   | Cells, formulas, references, ranges, SUM/AVERAGE/MIN/MAX/COUNT            |
| Table         | f(X) over a start/end/step                                                |
| Equation/Func | Simultaneous linear systems (2/3/4) and polynomials (degree 2/3/4)        |
| Inequality    | Quadratic and cubic polynomial inequalities with interval output          |
| Ratio         | `a : b = c : d` solving and simplification                                |

## Tech stack

Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui ·
[mathjs](https://mathjs.org) for expression evaluation · Vitest · Playwright.

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). In short: push to GitHub, import the repository into
Vercel, accept the auto-detected settings and deploy. No environment variables are needed.

## Licence and attribution

Original code is released under the [MIT licence](LICENSE). Research notes and the third-party
licence list are in [`docs/RESEARCH.md`](docs/RESEARCH.md) and [`NOTICE`](NOTICE).
