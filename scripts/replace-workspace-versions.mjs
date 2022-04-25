import * as path from "path";
import * as fsp from "fs/promises";
import { fileURLToPath } from "url";
import jsonfile from "jsonfile";
import prettier from "prettier";

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
				let copy = { ...packageJson };
				for (const dependencyType of dependencyTypes) {
					let dependencies = packageJson[dependencyType];
					if (!dependencies) {
						continue;
					}
					if (dependencies[packageName]) {
						let nextVersion = versionMap.find(
							(m) => m.packageName === packageName
						)?.version;
						// TODO: Use CLI flags to force a specific version if needed
						copy[dependencyType][packageName] = "^" + nextVersion;
					}
				}
				return copy;
			});
		})
	);

	console.log("DONE");
}

/**
 * @param {string} packageName
 */
function packageJson(packageName) {
	return path.join(packagesDir, packageName, "package.json");
}

/**
 * @param {string} packageName
 * @returns {Promise<PackageJson>}
 */
async function getPackageJsonContents(packageName) {
	try {
		let file = packageJson(packageName);
		return await jsonfile.readFile(file);
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
	let json = await getPackageJsonContents(packageName);
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
	let output = prettier.format(JSON.stringify(transform(json)), {
		parser: "json",
	});
	await jsonfile.writeFile(packageJson(packageName), output);
}

/**
 * @typedef {import('type-fest').PackageJson} PackageJson
 */
