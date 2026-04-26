import { test, expect } from "@playwright/test";
test("practice page loads", async ({ page }) => { await page.goto("/practice"); await expect(page.getByText("Practice")).toBeVisible(); });
