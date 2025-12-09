import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Show nicely nested describe/test blocks (Jest-style)
    reporters: ["default", "verbose"],

    // Group console.log output under the test that produced it
    captureConsole: true,
  },
});
