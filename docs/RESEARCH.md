# Research & Repository Audit

> Goal: build a browser-based, fx-991EX ClassWiz-inspired scientific calculator emulator.
> This document records the reconnaissance of candidate repositories, the licence audit, the
> math-engine landscape, and the resulting reuse decisions. **No third-party calculator source
> code was copied into this project.**

Investigation date: 2026-10-15. Methods: GitHub REST API (`/repos`, `/git/trees?recursive=1`),
`raw.githubusercontent.com` source reads, and web search. Claims are marked **verified** (read from
source) or **inferred**.

## 1. Headline legal finding

All four target repositories report `"license": null` through the GitHub API and contain **no
`LICENSE` file** in their git tree. Absence of a licence means _all rights reserved_ by default.
Two repositories _claim_ "MIT" in prose (README / `package.json`) but immediately qualify it with
"personal / educational / portfolio use", which is **not** MIT (MIT grants unrestricted use). Treat
those grants as informal and ambiguous. **Decision: reimplement; copy no code from these repos.**

## 2. Target repository comparison

| Repository                               | What it actually is                                                                     | Licence (verified)                              | Activity                        | Parser / engine                                                                       | Functions that work                                                                                                                                                                                                                                                                                                                                                                                                             | Tests                                       | Vercel         | Reuse verdict                                                                                                                                                                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Akhinoor14/fx991exCalculator`           | Vite 5 + React 18 SPA (`fx991ex-classwiz`); also ships Electron/Capacitor/PWA           | none (README claims MIT, qualified)             | single-day burst 2026-05-07; 1★ | **mathjs `^12.4`** + custom `preprocess()` string layer; **no `eval`/`new Function`** | Broad: DEG/RAD/GRAD with domain checks, trig/hyp/inverse, logs, roots, factorial (n≤69 guard), nPr/nCr, gcd/lcm/mod, Ans/PreAns, M+/M−, STO/RCL A–F,M,x,y, fraction detection, **adaptive Gauss–Kronrod G7-K15** integration, 5-point derivative, Σ, factorize, Ran#/RanInt, Pol/Rec. `lim()` is **faked**. "552 functions / all 12 modes" claim is marketing; the same README elsewhere lists SHIFT/S⇔D/STO/CALC as still TODO | **none**                                    | static SPA, OK | **Reference only.** Useful ideas: `keyLayout` data shape (`shiftLabel`/`alphaLabel`/`subLabel`), angle-aware scope, error taxonomy ("Math Error"/"Domain Error"/"Syntax Error"), G7-K15 integrator. Uses regex **look-behind** → breaks Safari <16.4 |
| `Akhinoor14/fx991ex`                     | Near-duplicate snapshot of the above (branch `master`) + committed Capacitor `android/` | none                                            | 2026-05-07; 0★                  | same (mathjs `^12.4`)                                                                 | same as above                                                                                                                                                                                                                                                                                                                                                                                                                   | none                                        | static         | **Skip — duplicate.** `fx991exCalculator` is the more built-out copy; nothing unique to reuse                                                                                                                                                        |
| `eliyas2199/casio-fx-991EX-ui-clone`     | Static **HTML + CSS mockup**, _no JavaScript at all_; display text hard-coded           | none (README: "educational/demonstration only") | 2025-05-30; 0★                  | **none**                                                                              | **none** (buttons have no handlers)                                                                                                                                                                                                                                                                                                                                                                                             | none                                        | static         | **Layout/label reference only.** Neat CSS sub-label technique (nested `<span>` for shift/α/base legends). Reimplement, do not copy. Loads Google Fonts from CDN                                                                                      |
| `VincentCapek/vue-scientific-calculator` | Vue 3 + Vite + TS SPA, **from-scratch** evaluator (explicitly no mathjs)                | none (README claims MIT, qualified)             | 2026-01-12; 0★                  | custom **tokenize → shunting-yard → RPN stack**; no `eval`                            | Real but narrow: `+ − × ÷ ^ %`, parens, abs/sqrt/square/pow10/exp/ln/log10/fact, trig + inverses, hyp + inverses, π, e, RAN#, ANS. No GRAD, no nPr/nCr/gcd/log(a,b), no implicit multiplication, no variables/STO, no complex/matrix/stats/solver                                                                                                                                                                               | **Vitest** evaluator suite (~57 assertions) | static         | **Pattern reference.** Clean typed-evaluator + Vitest structure to emulate. Unlicensed-by-file → read, don't copy                                                                                                                                    |

### Additional open-source calculator projects found

| Project                             | What it is                                                                            | Licence | Note                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------ |
| `1szco1/casio-ex991fx-classwiz-pwa` | Single 225 KB `index.html` PWA claiming "552 functions", exact-form S⇔D, TABLE, ∫/Σ/∏ | none    | Feature-rich but unlicensed → checklist reference only |
| `Team-Dim/fx-991EX-Sim`             | C++/Qt desktop simulator                                                              | none    | Not web                                                |
| `JHollandaise/jCalc`                | Objective-C / iOS                                                                     | none    | Not web                                                |
| `mondalsurojit/Casio-fx-991ES_Plus` | fx-991**ES Plus** (different model), plain JS/CSS                                     | **MIT** | Permissively licensed, but a different model           |

**No permissively-licensed (with a `LICENSE` file) fx-991EX web emulator was found.** Every ClassWiz
clone located is effectively _all rights reserved_.

## 3. Math-engine & rendering library landscape

| Library                         | Licence        | Provides                                                                                       | Checked (verified)                                                                                                                                       |
| ------------------------------- | -------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **mathjs** (`josdejong/mathjs`) | **Apache-2.0** | Infix **parser**, numbers, BigNumber, **Fraction**, **Complex**, **Matrix**, units, derivative | The one do-it-all fit. Pin the latest release and restrict the evaluation scope (`create({...})`); mathjs documents that `evaluate` is **not** a sandbox |
| Nerdamer                        | Apache-2.0     | Symbolic CAS (simplify/solve/calculus/LA/LaTeX)                                                | npm build is stale vs the GitHub rewrite — weaker numeric eval                                                                                           |
| Algebrite                       | MIT            | JS CAS (Eigenmath port)                                                                        | Heavy, sporadic maintenance                                                                                                                              |
| CortexJS compute-engine         | MIT            | MathJSON AST, LaTeX↔MathJSON, symbolic+numeric eval                                            | Pre-1.0 API churn                                                                                                                                        |
| MathLive                        | MIT            | `<math-field>` web component for WYSIWYG math input                                            | Excellent for textbook input; heavyweight, fights a fixed LCD                                                                                            |
| KaTeX                           | MIT            | LaTeX → HTML/CSS rendering (fast, sync)                                                        | Rendering only                                                                                                                                           |
| MathJax                         | Apache-2.0     | Broadest LaTeX/MathML/AsciiMath rendering                                                      | Rendering only, heavier                                                                                                                                  |
| `jdan/98.css`                   | MIT            | Raised/sunken bevel technique for keys                                                         | Attribution required                                                                                                                                     |

## 4. Decision (recorded in the plan)

- **Engine:** `mathjs` (pinned, Apache-2.0) for parsing/evaluation, wrapped by our **own** glyph
  preprocessor and a **whitelisted, locked** evaluation scope. No `eval()` / `new Function()`.
- **Display:** our **own** Casio-style fixed LCD renderer built from a mathjs AST + Casio glyphs —
  not MathLive — to keep the authentic fixed-width LCD and full control of cursor editing.
- **UI:** our own React + Tailwind keypad driven by a single keymap registry. The audited repos
  inform the _data shape_ and _layout_, never the source.
- **No code copied** from the four target repositories (unlicensed). Only permissively-licensed
  libraries are reused, with attribution (see `NOTICE` / `README` and `docs/DISCLAIMER.md`).

## 5. Caveats carried into implementation

1. `mathjs` — pin the latest release and restrict the evaluation scope; never expose `import`,
   `createUnit`, or raw `evaluate` over untrusted input.
2. Avoid regex **look-behind** (Safari < 16.4 support).
3. Do **not** redistribute Casio's manual, logo, or any firmware; ship an independent visual
   identity and a clear educational disclaimer.
4. "552 functions" style claims are unverified by their own projects' tests — this project instead
   tracks honest per-feature status in `docs/FEATURE_MATRIX.md`.

## 6. Sources verified

`github.com/Akhinoor14/fx991exCalculator` · `github.com/Akhinoor14/fx991ex` ·
`github.com/eliyas2199/casio-fx-991EX-ui-clone` · `github.com/VincentCapek/vue-scientific-calculator` ·
`github.com/1szco1/casio-ex991fx-classwiz-pwa` · `github.com/Team-Dim/fx-991EX-Sim` ·
`github.com/JHollandaise/jCalc` · `github.com/josdejong/mathjs` · `github.com/jiggzson/nerdamer` ·
`github.com/davidedc/Algebrite` · `github.com/cortex-js/compute-engine` · `github.com/arnog/mathlive` ·
`github.com/KaTeX/KaTeX` · `github.com/mathjax/MathJax` · `github.com/jdan/98.css` ·
`github.com/ManzDev/twitch-casio-fx39` · `github.com/mondalsurojit/Casio-fx-991ES_Plus`.
