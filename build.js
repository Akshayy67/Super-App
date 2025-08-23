#!/usr/bin/env node

// Ultra simplified build script using ES modules
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Set environment variables to avoid native rollup issues
process.env.ROLLUP_SKIP_NATIVE = "true";
process.env.ROLLUP_NO_NATIVE = "1";
process.env.NODE_OPTIONS = "--max-old-space-size=4096";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting build process...");
console.log("Environment variables set:");
console.log("- ROLLUP_SKIP_NATIVE:", process.env.ROLLUP_SKIP_NATIVE);
console.log("- ROLLUP_NO_NATIVE:", process.env.ROLLUP_NO_NATIVE);
console.log("- NODE_OPTIONS:", process.env.NODE_OPTIONS);

// Try different methods to run vite build
try {
  console.log("Trying to run vite build using direct node path...");

  const vitePath = path.resolve(__dirname, "node_modules/vite/bin/vite.js");
  if (fs.existsSync(vitePath)) {
    console.log(`Found vite at ${vitePath}, running directly...`);
    execSync(`node "${vitePath}" build`, {
      stdio: "inherit",
      env: { ...process.env },
    });
    console.log("Build completed successfully!");
    process.exit(0);
  } else {
    console.log("Vite not found in node_modules, trying npx...");
    execSync("npx vite build", {
      stdio: "inherit",
      env: { ...process.env },
    });
    console.log("Build completed successfully!");
    process.exit(0);
  }
} catch (err) {
  console.error("Build failed:", err.message);
  console.error("Error details:", err);
  process.exit(1);
}

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
