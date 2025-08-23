console.log("Starting build process...");

import { execSync } from "child_process";

try {
  console.log("Building with Vite...");
  execSync("npx vite build", {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      ROLLUP_NO_NATIVE: "true",
    },
  });
  console.log("✅ Build completed successfully!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
