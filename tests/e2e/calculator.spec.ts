import { expect, test, type Page } from "@playwright/test";

async function pressKeys(page: Page, ids: string[]): Promise<void> {
  for (const id of ids) {
    await page.locator(`[data-key="${id}"]`).click();
  }
}

async function openMode(page: Page, mode: string): Promise<void> {
  await page.locator('[data-key="menu"]').click();
  await page.locator(`[data-mode="${mode}"]`).click();
}

test.describe("calculate mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("lcd")).toBeVisible();
  });

  test("multiplies using the keypad", async ({ page }) => {
    await pressKeys(page, ["7", "mul", "8", "equals"]);
    await expect(page.getByTestId("result-value")).toHaveText("56");
  });

  test("evaluates sin(30) in degree mode", async ({ page }) => {
    await pressKeys(page, ["sin", "3", "0", "equals"]);
    await expect(page.getByTestId("result-value")).toHaveText("0.5");
  });

  test("reports a math error when dividing by zero", async ({ page }) => {
    await pressKeys(page, ["1", "div", "0", "equals"]);
    await expect(page.getByTestId("error-message")).toHaveText("Math Error");
  });

  test("clears the display with AC", async ({ page }) => {
    await pressKeys(page, ["9", "9", "ac"]);
    await expect(page.getByTestId("expression")).toHaveText("");
  });

  test("deletes the last character with DEL", async ({ page }) => {
    await pressKeys(page, ["1", "2", "3", "del"]);
    await expect(page.getByTestId("expression")).toHaveText("12");
  });

  test("activates the SHIFT indicator", async ({ page }) => {
    const shift = page.locator('[data-key="shift"]');
    await shift.click();
    await expect(shift).toHaveAttribute("aria-pressed", "true");
    await pressKeys(page, ["square"]);
    await expect(page.getByTestId("expression")).toContainText("3");
  });

  test("accepts input from the physical keyboard", async ({ page }) => {
    // Interact once first: a click can only land after the shell has hydrated.
    await page.locator('[data-key="ac"]').click();
    await expect(page.getByTestId("expression")).toHaveText("");
    await page.keyboard.type("12+30");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("result-value")).toHaveText("42");
  });

  test("replays the previous calculation with the replay pad", async ({
    page,
  }) => {
    await pressKeys(page, ["2", "add", "2", "equals"]);
    await pressKeys(page, ["ac"]);
    await pressKeys(page, ["pad-up"]);
    await expect(page.getByTestId("expression")).toHaveText("2+2");
  });

  test("switches between decimal and fraction with S⇔D", async ({ page }) => {
    await pressKeys(page, ["1", "div", "4", "equals"]);
    await expect(page.getByTestId("result-value")).toHaveText("0.25");
    await pressKeys(page, ["sd"]);
    await expect(page.getByTestId("result-value")).toHaveText("1/4");
  });
});

test.describe("modes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("opens the mode menu and switches to Matrix", async ({ page }) => {
    await openMode(page, "matrix");
    await expect(page.getByTestId("mode-panel")).toContainText("Matrix");
  });

  test("computes a matrix determinant", async ({ page }) => {
    await openMode(page, "matrix");
    await page
      .locator('[data-testid="mode-panel"] input[name="a0-0"]')
      .fill("1");
    await page
      .locator('[data-testid="mode-panel"] input[name="a0-1"]')
      .fill("2");
    await page
      .locator('[data-testid="mode-panel"] input[name="a1-0"]')
      .fill("3");
    await page
      .locator('[data-testid="mode-panel"] input[name="a1-1"]')
      .fill("4");
    await page.getByRole("button", { name: "detA" }).click();
    await page.getByRole("button", { name: "Execute" }).click();
    await expect(page.getByTestId("matrix-result")).toHaveText("-2");
  });

  test("solves a simultaneous linear system", async ({ page }) => {
    await openMode(page, "equation");
    const panel = page.getByTestId("mode-panel");
    await panel.locator('input[name="a00"]').fill("2");
    await panel.locator('input[name="a01"]').fill("1");
    await panel.locator('input[name="a10"]').fill("1");
    await panel.locator('input[name="a11"]').fill("-1");
    await panel.locator('input[name="b0"]').fill("5");
    await panel.locator('input[name="b1"]').fill("1");
    await panel.getByRole("button", { name: "Solve" }).click();
    await expect(page.getByTestId("equation-result")).toContainText("X");
  });

  test("generates a table from f(X)", async ({ page }) => {
    await openMode(page, "table");
    await pressKeys(page, ["xvar", "square"]);
    await page
      .getByTestId("mode-panel")
      .getByRole("button", { name: "Generate table" })
      .click();
    await expect(page.getByTestId("table-result")).toContainText("25");
  });

  test("evaluates a normal cumulative probability", async ({ page }) => {
    await openMode(page, "distribution");
    const panel = page.getByTestId("mode-panel");
    await panel.getByRole("button", { name: "P(≤)" }).click();
    await panel.locator('input[name="lower"]').fill("0");
    await panel.locator('input[name="upper"]').fill("1");
    await panel.getByRole("button", { name: "Execute" }).click();
    await expect(page.getByTestId("distribution-result")).toContainText(
      "0.3413447461",
    );
  });

  test("evaluates a spreadsheet formula", async ({ page }) => {
    await openMode(page, "spreadsheet");
    const panel = page.getByTestId("mode-panel");
    await panel.locator('input[name="A1"]').fill("2");
    await panel.locator('input[name="A2"]').fill("3");
    await panel.locator('input[name="A3"]').fill("=SUM(A1:A2)");
    await panel.getByRole("button", { name: "Recalculate" }).click();
    await expect(page.getByTestId("cell-value-A3")).toHaveText("5");
  });

  test("solves a ratio proportion", async ({ page }) => {
    await openMode(page, "ratio");
    const panel = page.getByTestId("mode-panel");
    await panel.locator('input[name="a"]').fill("1");
    await panel.locator('input[name="b"]').fill("2");
    await panel.locator('input[name="c"]').fill("3");
    await panel.getByRole("button", { name: "Solve" }).click();
    await expect(page.getByTestId("ratio-result")).toContainText("6");
  });

  test("converts between number bases", async ({ page }) => {
    await openMode(page, "base-n");
    const panel = page.getByTestId("mode-panel");
    await panel.getByRole("button", { name: "HEX" }).click();
    await panel.locator('input[name="a"]').fill("FF");
    await panel.getByRole("button", { name: "Execute" }).click();
    await expect(panel).toContainText("255");
  });
});

test.describe("layout", () => {
  test("keeps the keypad usable on a small viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await page.goto("/");
    await expect(page.locator('[data-key="equals"]')).toBeVisible();
    await pressKeys(page, ["1", "add", "1", "equals"]);
    await expect(page.getByTestId("result-value")).toHaveText("2");
  });

  test("renders without console or page errors", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(message.text());
    });
    page.on("pageerror", (error) => problems.push(error.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await pressKeys(page, ["sqrt", "9", "equals"]);
    await expect(page.getByTestId("result-value")).toHaveText("3");

    expect(problems).toEqual([]);
  });

  test("shows only the calculator on the default screen", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("lcd")).toBeVisible();
    await expect(page.getByTestId("mode-panel")).toHaveCount(0);
    await expect(page.locator("h1")).toHaveCount(0);
    await expect(page.getByTestId("history-list")).toHaveCount(0);
  });

  test("keeps the keypad grid even when the stylesheet fails to load", async ({
    page,
  }) => {
    // Regression guard: the keypad structure is declared inline, so a missing or stale
    // stylesheet must not collapse the keys into a single column.
    await page.route("**/*.css*", (route) => route.abort());
    await page.goto("/");
    await expect(page.locator('[data-key="equals"]')).toBeVisible();

    const distinctRows = await page.evaluate(() => {
      const tops = [...document.querySelectorAll(".calc-key")].map(
        (el) => el.getBoundingClientRect().top,
      );
      const rows: number[] = [];
      for (const top of tops.sort((a, b) => a - b)) {
        if (!rows.some((existing) => Math.abs(existing - top) < 8))
          rows.push(top);
      }
      return rows.length;
    });

    expect(distinctRows).toBe(9);
    await expect(page.locator(".calc-pad")).toBeVisible();
  });

  test("lays the keypad out as the physical device does", async ({ page }) => {
    await page.goto("/");
    for (const id of [
      "shift",
      "alpha",
      "menu",
      "on",
      "optn",
      "calc",
      "7",
      "del",
      "ac",
      "equals",
    ]) {
      await expect(page.locator(`[data-key="${id}"]`)).toBeVisible();
    }
    await expect(page.locator('[data-key="pad-up"]')).toBeVisible();
  });
});

test.describe("device functions", () => {
  test("opens SETUP with SHIFT + MENU", async ({ page }) => {
    await page.goto("/");
    await pressKeys(page, ["shift", "menu"]);
    await expect(page.getByText("Angle unit")).toBeVisible();
  });

  test("inserts a scientific constant from SHIFT + 7", async ({ page }) => {
    await page.goto("/");
    await pressKeys(page, ["shift", "7"]);
    await page.getByRole("button", { name: /Speed of light/ }).click();
    await pressKeys(page, ["equals"]);
    await expect(page.getByTestId("result-value")).toContainText("299792458");
  });

  test("converts units from SHIFT + 8", async ({ page }) => {
    await page.goto("/");
    await pressKeys(page, ["shift", "8"]);
    await page.getByLabel("Value to convert").fill("1");
    // Default: 1 mm → cm
    await expect(page.getByTestId("conversion-result")).toHaveText("0.1");
  });

  test("switches to engineering notation with ENG", async ({ page }) => {
    await page.goto("/");
    await pressKeys(page, ["eng"]);
    await pressKeys(page, ["1", "2", "3", "4", "5", "equals"]);
    await expect(page.getByTestId("lcd")).toContainText("Eng");
  });

  test("adds to memory with STO and shows the M indicator", async ({
    page,
  }) => {
    await page.goto("/");
    await pressKeys(page, ["5", "equals", "sto", "alpha", "eng"]);
    await expect(page.getByTestId("lcd")).toContainText("M");
  });
});
