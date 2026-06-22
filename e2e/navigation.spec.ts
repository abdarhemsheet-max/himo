import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should load dashboard with correct title", async ({ page }) => {
    await page.goto("/himo/");
    await expect(page.locator("h1")).toContainText(/حِمو|الملخص|Dashboard/i);
  });

  test("should navigate to finance page", async ({ page }) => {
    await page.goto("/himo/finance");
    await expect(page).toHaveURL(/\/himo\/finance/);
    await expect(page.locator("h1")).toContainText(/المالية|Finance/i);
  });

  test("should open command palette with Ctrl+K", async ({ page }) => {
    await page.goto("/himo/");
    await page.keyboard.press("Control+k");
    await expect(page.locator('[data-testid="command-palette"]')).toBeVisible();
  });
});
