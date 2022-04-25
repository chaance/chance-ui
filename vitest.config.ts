/// <reference types="vitest" />

import * as path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: path.join(__dirname, "test/setup.ts"),
	},
});
