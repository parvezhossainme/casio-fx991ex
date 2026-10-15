# Disclaimer and attribution

## Independent educational project

This is an **independent, educational emulator inspired by** the Casio fx-991EX ClassWiz. It is
**not affiliated with, endorsed by, sponsored by, or produced by Casio Computer Co., Ltd.**

- The firmware of the physical calculator is **not** emulated, extracted, decompiled or included.
  No proprietary ROM, binary blob or firmware dump is used anywhere in this project.
- No Casio manual, logo, product photography, font or other copyrighted asset is redistributed.
  "Casio", "ClassWiz" and "fx-991EX" are trademarks of Casio Computer Co., Ltd. and are used here
  only to describe what the project is compatible with.
- Results are produced by open-source and original code and will not always match the physical
  device exactly. Floating-point behaviour, exact-form handling and workflow differences are
  documented in [`FEATURE_MATRIX.md`](./FEATURE_MATRIX.md).
- Do not use this project to misrepresent a calculation as originating from genuine Casio hardware.

## Source-code provenance

The following public repositories were inspected during research
(see [`RESEARCH.md`](./RESEARCH.md)):

- `Akhinoor14/fx991exCalculator`
- `Akhinoor14/fx991ex`
- `eliyas2199/casio-fx-991EX-ui-clone`
- `VincentCapek/vue-scientific-calculator`

None of them contains a `LICENSE` file, and the GitHub API reports no licence for any of them, which
means _all rights reserved_. **No code from these repositories was copied, ported or adapted.** They
were used only to understand what a ClassWiz emulator needs to contain; every line in this project
was written for it. Ideas that are not copyrightable (for example "use Gauss–Kronrod quadrature",
or "store per-key SHIFT/ALPHA legends") informed the design, but the implementations are original.

## Third-party libraries

This project depends on open-source packages. Their licences are listed in
[`NOTICE`](../NOTICE). The most significant ones:

| Package             | Licence    | Role                              |
| ------------------- | ---------- | --------------------------------- |
| mathjs              | Apache-2.0 | Expression parsing and evaluation |
| Next.js / React     | MIT        | Application framework             |
| Tailwind CSS        | MIT        | Styling                           |
| shadcn/ui + Base UI | MIT        | UI primitives                     |
| lucide-react        | ISC        | Icons                             |
| Vitest              | MIT        | Unit testing                      |
| Playwright          | Apache-2.0 | End-to-end testing                |

## Legal notice for this repository's own code

Original code in this repository is released under the MIT licence — see [`LICENSE`](../LICENSE).
Because no third-party calculator source was reused, the MIT licence can be applied without
inheriting any conflicting terms. If you intend to reuse this project, you are responsible for
ensuring your own use of the Casio name and any derived visual identity is lawful in your
jurisdiction.
