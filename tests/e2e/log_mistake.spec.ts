import { test, expect } from "@playwright/test";
test("mistake form loads", async ({ page }) => { await page.goto("/log/new"); await expect(page.getByText("Log a mistake")).toBeVisible(); });
