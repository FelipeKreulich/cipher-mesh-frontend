import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { name: "phone-320", width: 320, height: 720 },
  { name: "phone-375", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 },
] as const;

const PAGES = [
  "/pt",
  "/pt/security",
  "/pt/getting-started",
  "/pt/features",
  "/pt/commands",
  "/pt/changelog",
  "/pt/status",
  "/pt/support",
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(viewport.name, () => {
    test.use({ viewport });

    for (const path of PAGES) {
      test(`${path} has no horizontal overflow`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("main")).toBeVisible();
        const widths = await page.evaluate(() => ({
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
        }));
        expect(widths.document).toBeLessThanOrEqual(widths.viewport);
      });
    }
  });
}
