import * as path from "path";
import * as fsp from "fs/promises";
import chalk from "chalk";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const packagesDir = path.resolve(rootDir, "packages");
const args = process.argv.slice(2);
const IS_DEV = args.includes("--dev");

main();

async function main() {
	let packages = await fsp.readdir(packagesDir);
	/** @type {Map<string, Entrypoints>} */
	let entrypointMap = (
		await Promise.all(
			packages.map(async (packageName) => {
				let entrypoints = await getPackageEntrypoints(packageName);
				return { packageName, entrypoints };
			})
		)
	).reduce((map, curr) => {
		map.set(curr.packageName, curr.entrypoints);
		return map;
	}, new Map());

	await Promise.all(
		packages.map(async (packageName) => {
			await transformPackageJson(packageName, (packageJson) => {
				let entrypoints = entrypointMap.get(packageName);
				if (!entrypoints) {
					return packageJson;
				}

				let newEntrypoints = IS_DEV
					? getDevEntrypoints(packageName)
					: getPublishedEntrypoints(packageName);

				/** @type {typeof packageJson} */
				let packageJsonCopy = { ...packageJson };
				for (let [entrypointType, entrypoint] of Object.entries(entrypoints)) {
					if (entrypoint && entrypointType in newEntrypoints) {
						// @ts-expect-error
						packageJsonCopy[entrypointType] = newEntrypoints[entrypointType];
					}
				}
				return packageJsonCopy;
			});
		})
	);

	console.log(chalk.green("\n✅ All entrypoints updated\n"));
}

/**
 * @param {string} packageName
 */
function packageJson(packageName) {
	return path.join(packagesDir, packageName, "package.json");
}

/**
 * @param {string} packageName
 * @returns {Promise<string>}
 */
async function getPackageJsonContents(packageName) {
	try {
		let file = packageJson(packageName);
		return await fsp.readFile(file, "utf8");
	} catch (_) {
		throw Error(
			`Could not read package.json for ${packageName}. Check to ensure the package exists.`
		);
	}
}

/**
 * @param {string} packageName
 * @returns {Promise<Entrypoints>}
 */
async function getPackageEntrypoints(packageName) {
	let json = JSON.parse(await getPackageJsonContents(packageName));
	return {
		main: json.main,
		module: json.module,
		types: json.types,
	};
}

/**
 * @param {string} packageName
 * @param {(json: PackageJson) => PackageJson} transform
 */
async function transformPackageJson(packageName, transform) {
	let json = await getPackageJsonContents(packageName);
	let transformed = transform(JSON.parse(json));
	await fsp.writeFile(
		packageJson(packageName),
		JSON.stringify(transformed),
		"utf-8"
	);

	await new Promise((accept, reject) => {
		spawn("pnpm", ["prettier", "--write", "**/package.json"], {
			stdio: "ignore",
			cwd: rootDir,
		})
			.on("error", reject)
			.on("close", accept);
	});
}

/**
 * @param {string} packageName
 */
function getDevEntrypoints(packageName) {
	return {
		main: `./src/${packageName}.ts`,
		module: `./src/${packageName}.ts`,
		types: `./src/${packageName}.ts`,
	};
}

/**
 * @param {string} packageName
 */
function getPublishedEntrypoints(packageName) {
	return {
		main: `./dist/${packageName}.js`,
		module: `./dist/${packageName}.mjs`,
		types: `./dist/${packageName}.d.ts`,
	};
}

/**
 * @typedef {import('type-fest').PackageJson} PackageJson
 */

/**
 * @typedef {Record<"main" | "module" | "types", string | undefined>} Entrypoints
 */
