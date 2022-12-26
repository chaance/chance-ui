import * as path from "path";
import * as fsp from "fs/promises";
import chalk from "chalk";
import { performance } from "perf_hooks";

const rootDir = process.cwd();
const packagesDir = path.join(rootDir, "packages");

main();

async function main() {
	let start = performance.now();
	let [packages, licenseContents] = await Promise.all([
		fsp.readdir(packagesDir),
		fsp.readFile(path.join(rootDir, "LICENSE"), "utf8"),
	]);
	if (!licenseContents) {
		throw new Error("No license file found");
	}
	for (let packageName of packages) {
		let packageDir = path.join(packagesDir, packageName);
		let licenseFilePath = path.join(packageDir, "LICENSE");
		await fsp.writeFile(licenseFilePath, licenseContents);
	}

	console.log(chalk.green("✅ Copied LICENSE to all packages"));
}
