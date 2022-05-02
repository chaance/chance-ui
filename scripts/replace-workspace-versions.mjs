import * as path from "path";
import * as fsp from "fs/promises";
import chalk from "chalk";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const packagesDir = path.resolve(rootDir, "packages");

main();

async function main() {
	let packages = await fsp.readdir(packagesDir);
	let versionMap = await Promise.all(
		packages.map(async (packageName) => {
			let version = await getPackageVersion(packageName);
			return { packageName, version };
		})
	);

	await Promise.all(
		packages.map(async (packageName) => {
			await transformPackageJson(packageName, (packageJson) => {
				/** @type {["dependencies", "devDependencies"]} */
				let dependencyTypes = ["dependencies", "devDependencies"];
				/** @type {*} */
				let packageJsonCopy = { ...packageJson };
				for (const dependencyType of dependencyTypes) {
					let dependencies = packageJsonCopy[dependencyType];
					if (!dependencies) {
						continue;
					}
					for (let dependency in dependencies) {
						if (
							dependencies[dependency] !== "workspace:*" &&
							dependencies[dependency] !== "*"
						) {
							continue;
						}
						let replacement = versionMap.find(
							(x) => x.packageName === unscopePackageName(dependency)
						);
						if (replacement) {
							// TODO: Use CLI flags for pinned versions
							packageJsonCopy[dependencyType][dependency] = replacement.version;
						}
					}
				}
				return packageJsonCopy;
			});
		})
	);

	console.log(chalk.green("\n✅ All package versions updated\n"));
}

/**
 * @param {string} packageName
 * @returns
 */
function scopePackageName(packageName) {
	return "@chance/" + packageName;
}

/**
 * @param {string} packageName
 * @returns
 */
function unscopePackageName(packageName) {
	return packageName.replace(/^@chance\//, "");
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
 * @returns {Promise<string>}
 */
async function getPackageVersion(packageName) {
	let json = JSON.parse(await getPackageJsonContents(packageName));
	if (!json.version) {
		throw Error(
			`Could not find version for ${packageName}. Check to ensure the package.json has a valid version.`
		);
	}
	return json.version;
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
 * @typedef {import('type-fest').PackageJson} PackageJson
 */
