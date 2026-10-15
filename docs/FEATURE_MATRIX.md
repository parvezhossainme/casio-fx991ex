# Feature matrix

Status legend — **a button existing is not proof a feature works**:

| Status                                 | Meaning                                                              |
| -------------------------------------- | -------------------------------------------------------------------- |
| ✅ Implemented and tested              | Covered by an automated unit test (and end-to-end where applicable). |
| 🟡 Implemented but not fully validated | Works in manual/browser checks; coverage is partial.                 |
| 🔶 Partially implemented               | A documented subset only.                                            |
| ⬜ Not implemented                     | Absent, or explicitly out of scope.                                  |

## Modes

| #   | Mode          | Feature                                                            | Status | Notes                                                                                    |
| --- | ------------- | ------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------- |
| 1   | Calculate     | Arithmetic, precedence, parentheses, unary signs                   | ✅     | Unit-tested (`tests/unit/engine.test.ts`)                                                |
| 1   | Calculate     | Powers, roots (`√`, `∛`, `ˣ√`), square/cube                        | ✅     |                                                                                          |
| 1   | Calculate     | Trig / inverse trig / hyperbolic, DEG-RAD-GRA                      | ✅     |                                                                                          |
| 1   | Calculate     | `log`, `ln`, arbitrary-base `logₐb`                                | ✅     |                                                                                          |
| 1   | Calculate     | Factorial, `nPr`, `nCr`, `gcd`, `lcm`, `mod`, `Abs`                | ✅     |                                                                                          |
| 1   | Calculate     | Percent key                                                        | 🔶     | Treated as `÷100`; the device's contextual `%` (e.g. `200+10%` → 220) is not emulated    |
| 1   | Calculate     | π, e, `Ans`, `PreAns`                                              | ✅     |                                                                                          |
| 1   | Calculate     | Memory A–F, X, Y, M with STO / RCL                                 | ✅     |                                                                                          |
| 1   | Calculate     | Fractions, decimal↔fraction, S⇔D                                   | ✅     |                                                                                          |
| 1   | Calculate     | π-multiple / surd exact form                                       | 🔶     | Simple cases only (e.g. `π/2`, `√2`, `7/2`); deep surd simplification is not implemented |
| 1   | Calculate     | Number formats Norm1/Norm2/Fix/Sci/Eng                             | ✅     |                                                                                          |
| 1   | Calculate     | Definite integral ∫                                                | ✅     | Adaptive Gauss–Kronrod G7–K15                                                            |
| 1   | Calculate     | Derivative d/dx                                                    | ✅     | Five-point central difference                                                            |
| 1   | Calculate     | Summation Σ                                                        | ✅     | Unit step, bounded term count                                                            |
| 1   | Calculate     | SOLVE (numeric root of f(X))                                       | 🟡     | Newton + bisection fallback; smoke-tested, few edge cases covered                        |
| 1   | Calculate     | CALC (evaluate with stored variables)                              | ✅     |                                                                                          |
| 1   | Calculate     | History list + REPLAY (↑/↓)                                        | ✅     |                                                                                          |
| 1   | Calculate     | Degrees-minutes-seconds (`°′″`) entry                              | ⬜     | Key is repurposed as the DRG angle-unit key                                              |
| 2   | Complex       | `+ − × ÷`, modulus, argument, conjugate, Re, Im                    | ✅     | mathjs complex arithmetic                                                                |
| 2   | Complex       | Polar ⇄ rectangular result conversion                              | ⬜     | Use `Abs` / `Arg` instead                                                                |
| 3   | Base-N        | DEC / HEX / OCT / BIN input and display                            | ✅     |                                                                                          |
| 3   | Base-N        | AND, OR, XOR, XNOR, NOT, NEG, `<<`, `>>`                           | ✅     | 32-bit word, two's-complement negatives                                                  |
| 3   | Base-N        | Arithmetic `+ − × ÷` in the active base                            | ✅     | Integer/truncating division                                                              |
| 4   | Matrix        | 1×1 … 4×4 entry                                                    | ✅     |                                                                                          |
| 4   | Matrix        | A+B, A−B, A×B                                                      | ✅     | Dimension errors reported                                                                |
| 4   | Matrix        | Determinant, inverse, transpose, identity                          | ✅     | LU / Gauss–Jordan                                                                        |
| 4   | Matrix        | Scalar multiplication, Augment, MatAns chain                       | ⬜     |                                                                                          |
| 5   | Vector        | 2D/3D entry                                                        | ✅     |                                                                                          |
| 5   | Vector        | A+B, A−B, dot, cross,                                              | A      | , angle, unit vector                                                                     | ✅  |     |
| 5   | Vector        | VctA…VctD memory organisation of the device                        | ⬜     | Two named vectors instead                                                                |
| 6   | Statistics    | 1-variable: n, Σx, Σx², mean, σ, s, median, Q1/Q3, min/max         | ✅     |                                                                                          |
| 6   | Statistics    | 2-variable linear regression (a, b, r)                             | ✅     |                                                                                          |
| 6   | Statistics    | Frequency column in the UI                                         | 🔶     | Supported by the module and unit-tested; no dedicated UI control yet                     |
| 6   | Statistics    | Quadratic / exponential / logarithmic / power / inverse regression | ⬜     |                                                                                          |
| 7   | Distribution  | Normal pdf, cdf, inverse                                           | ✅     |                                                                                          |
| 7   | Distribution  | Binomial pdf, cdf                                                  | ✅     |                                                                                          |
| 7   | Distribution  | Poisson pdf, cdf                                                   | ✅     |                                                                                          |
| 8   | Spreadsheet   | Editable cells with values and `=` formulas                        | ✅     |                                                                                          |
| 8   | Spreadsheet   | Cell references, ranges (`A1:A4`)                                  | ✅     |                                                                                          |
| 8   | Spreadsheet   | SUM, AVERAGE, MIN, MAX, COUNT, ABS, SQRT, ROUND                    | ✅     |                                                                                          |
| 8   | Spreadsheet   | Circular-reference detection                                       | ✅     |                                                                                          |
| 8   | Spreadsheet   | Device-specific cell functions / Fill / copy-paste                 | ⬜     |                                                                                          |
| 9   | Table         | f(X) over start/end/step                                           | ✅     |                                                                                          |
| 9   | Table         | Second function g(X)                                               | ⬜     |                                                                                          |
| 10  | Equation/Func | Simultaneous linear, 2/3/4 unknowns                                | ✅     | Gaussian elimination with partial pivoting                                               |
| 10  | Equation/Func | Polynomial degree 2/3/4, including complex roots                   | ✅     | Durand–Kerner                                                                            |
| 10  | Equation/Func | Full on-device coefficient-entry workflow                          | 🔶     | Form-based entry instead of the device's screen sequence                                 |
| 11  | Inequality    | Quadratic and cubic polynomial inequalities (>, ≥, <, ≤)           | ✅     | Interval output                                                                          |
| 11  | Inequality    | Quartic inequalities                                               | ⬜     | UI offers degree 2 and 3                                                                 |
| 12  | Ratio         | `a : b = c : d` with one unknown                                   | ✅     |                                                                                          |
| 12  | Ratio         | Ratio simplification                                               | ✅     |                                                                                          |

## Display, input and application

| Feature                                                                            | Status | Notes                                                                                   |
| ---------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| Natural-textbook rendering of fractions, powers, roots, logs, integrals, sums      | ✅     | Component tests assert the rendered structure                                           |
| Complex/vector/matrix results rendered structurally                                | ⬜     | Shown as text in the mode panel                                                         |
| LCD status indicators (SHIFT, ALPHA, HYP, DEG/RAD/GRA, Norm/Fix/Sci/Eng, memory M) | ✅     |                                                                                         |
| SHIFT / ALPHA / HYP state and colour-coded legends                                 | ✅     |                                                                                         |
| Cursor editing with ←/→, DEL, AC, INS/overwrite mode                               | ✅     |                                                                                         |
| MENU with all 12 modes                                                             | ✅     | Opened by the MENU key; SHIFT + MENU is SETUP                                           |
| SETUP dialog (angle unit, number format, insert mode, clear history)               | ✅     | Also reachable from OPTN                                                                |
| Physical keyboard input                                                            | ✅     | Digits, operators, parentheses, Enter, Backspace, Escape, arrows, plus letter shortcuts |
| On-screen keypad drives form-based mode inputs                                     | ✅     | Writes to the focused field                                                             |
| Responsive layout (desktop + mobile)                                               | ✅     | Playwright projects for Desktop Chrome and Pixel 7                                      |
| Accessible focus states, ARIA labels, reduced-motion support                       | 🟡     | Implemented; no automated accessibility audit yet                                       |
| Preferences and history persisted to `localStorage`                                | ✅     | Fails gracefully when storage is unavailable                                            |
| Works with JavaScript disabled                                                     | ⬜     | Calculator requires JS (as expected for a client-only app)                              |
| Offline / installable PWA                                                          | ⬜     | Not configured                                                                          |

## Case, keypad and device keys

| Feature                                                                         | Status | Notes                                                       |
| ------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------- |
| Dark case with rounded corners, brand lettering and a solar strip               | ✅     | Case aspect ratio ≈ 0.51 (device ≈ 0.47)                    |
| Dot-matrix-style LCD (pale grey-green) with annunciators                        | ✅     | Status line: SHIFT, ALPHA, HYP, M, format, angle unit, mode |
| Two-block keypad: 6 narrow function columns over 5 wider numeric columns        | ✅     | Asserted by a unit test                                     |
| Round 4-way replay pad occupying a 2×2 area                                     | ✅     | ↑ ↓ ← →, plus REPLAY via the physical arrow keys            |
| Pale-grey numeric keys with dark legends; dark function keys with light legends | ✅     | Matches the device's two-tone front                         |
| Blue AC and DEL keys                                                            | ✅     | The device's only blue keys                                 |
| Yellow SHIFT, red ALPHA and blue Base-N legends printed on the case             | ✅     | 26 SHIFT, 10 ALPHA and 4 blue legends                       |
| MENU, ON, OPTN, CALC, ENG, STO, S⇔D, `x` and the nine function/log/trig keys    | ✅     | Every key has a working action                              |
| CONST (SHIFT + 7) — scientific constants                                        | ✅     | 23 constants, searchable, inserts the value                 |
| CONV (SHIFT + 8) — unit conversion                                              | ✅     | 9 categories incl. temperature offsets                      |
| RESET (SHIFT + 9)                                                               | ✅     | Clears variables, history and preferences                   |
| `°′″` degrees/minutes/seconds conversion                                        | ✅     | Converts the displayed answer                               |
| M+ (ALPHA + ENG)                                                                | ✅     | Adds the answer to memory M                                 |
| ENG display notation                                                            | ✅     | From the ENG key                                            |
| Pol / Rec (SHIFT + × and SHIFT + ÷)                                             | ✅     | Insert the two-argument functions                           |
| nPr / nCr (SHIFT + + and SHIFT + −)                                             | ✅     |                                                             |
| Rnd, Ran#, RanInt, %, ≈ (SHIFT legends)                                         | ✅     | `≈` is the S⇔D decimal toggle                               |
| QR code display (SHIFT + OPTN)                                                  | ⬜     | Not implemented; no legend printed                          |
| UNDO (ALPHA + DEL), CONST/CONV lists in-device                                  | ⬜     | Not implemented; no legend printed                          |

## Known divergences from the physical device

- The device's **firmware is not emulated**; results come from mathjs and our numeric routines.
- **Some SHIFT/ALPHA legends differ from the device.** `x`, `y` and `M` are assigned to the `x`,
  `(` and ENG keys respectively; the `d/c` (mixed/improper) legend is omitted; only legends whose
  function is actually implemented are printed.
- **The `°′″` key converts a result to degrees/minutes/seconds** rather than entering DMS literals;
  the angle unit itself is changed in SETUP, as on the device.
- **The `xⁿ` key is the general power** (`^`), with `ʸ√x` on SHIFT; the device's separate `x□`
  template behaves the same way for our purposes.
- **Base-N, Matrix, Vector, Statistics, Distribution, Equation, Inequality and Ratio** use
  form/workspace panels below the calculator rather than reproducing the exact key-by-key screen
  sequence. Those panels appear only while their mode is active, so the Calculate screen shows the
  calculator alone.
- The display shows a **10-digit mantissa**, matching the device's display width, but internal
  arithmetic is IEEE-754 double precision rather than the device's internal 15-digit BCD.
