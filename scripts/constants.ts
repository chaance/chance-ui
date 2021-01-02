import path from "path";

export const PROJECT_ROOT = path.resolve(__dirname, "../");
export const NPM_SCOPE = "@chance";
export const PROJECT_NAME = "chance-ui";

export const PATHS = {
	PROJECT_ROOT,
	PACKAGES: path.join(PROJECT_ROOT, "packages"),
	TESTS_SETUP: path.join(PROJECT_ROOT, "test/setupTests.ts"),
	PROJECT_CACHE: path.join(PROJECT_ROOT, ".cache"),
};
