// Forked and simplified from https://github.com/jaredpalmer/tsdx
import * as jest from "jest";
import jestConfig from "./config/jest";
import path from "path";
import { NPM_SCOPE, PATHS } from "./constants";

const cwd = process.cwd();

process.env.BABEL_ENV = "test";
process.env.NODE_ENV = "test";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
	throw err;
});

const argv = process.argv.slice(2);

// Test individual package or packages with the --pkg argument
if (argv.includes("--pkg")) {
	let i = argv.indexOf("--pkg");
	argv.splice(
		i,
		2,
		`packages/(${argv[i + 1]
			.split(",")
			.map((str) => str.trim())
			.join("|")})`
	);
} else if (
	// If we are in a package directory, only test that package
	PATHS.PROJECT_ROOT !== cwd &&
	path.basename(path.resolve(cwd, "../")) === "packages"
) {
	argv.push(`packages/(${path.basename(cwd)})`);
}

let moduleNameMapper: Record<string, string> = jestConfig.moduleNameMapper;

if (!process.env.CI) {
	moduleNameMapper = {
		...moduleNameMapper,
		[`${NPM_SCOPE}/(.*)`]: "<rootDir>/packages/$1/src",
	};
}

argv.push(
	"--verbose",
	"--config",
	JSON.stringify({
		...jestConfig,
		moduleNameMapper,
	})
);

const [...argsToPassToJestCli] = argv;
jest.run(argsToPassToJestCli);
