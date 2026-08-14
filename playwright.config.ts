import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3000",
    colorScheme: "dark",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000/pt",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
