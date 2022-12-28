import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/ui-test-utils.ts", "src/react.tsx"],
	format: ["esm", "cjs"],
	dts: true,
});
