import { test, expect } from "@playwright/test";

test.describe("CRUD Operations", () => {
  test("should add and display a client in workspace", async ({ page }) => {
    await page.goto("/himo/workspace");
    await page.getByRole("button", { name: /إضافة عميل|Add Client/i }).click();
    await page.getByLabel(/اسم العميل|Name/i).fill("E2E Test Client");
    await page.getByLabel(/الشركة|Company/i).fill("E2E Corp");
    await page.getByRole("button", { name: /حفظ|إضافة|Save|Add/i }).click();
    await expect(page.getByText("E2E Test Client")).toBeVisible();
  });

  test("should add income entry in finance", async ({ page }) => {
    await page.goto("/himo/finance");
    await page.getByRole("button", { name: /إضافة دخل|Add Income/i }).click();
    await page.getByLabel(/المبلغ|Amount/i).fill("500");
    await page.getByRole("button", { name: /حفظ|إضافة|Save|Add/i }).click();
    await expect(page.getByText("500")).toBeVisible();
  });
});
