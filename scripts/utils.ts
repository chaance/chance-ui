import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { PATHS } from "./constants";
import type { Package, PackageJson } from "./types";

export function getPackageJSON(rootPath: string): PackageJson | undefined {
	try {
		return require(path.join(rootPath, "package.json"));
	} catch (err) {
		return undefined;
	}
}

export function warn(name: string, message: string) {
	console.log(chalk.yellow(`[${chalk.bold(name)}]: ${message}`));
}

export async function getPackages(): Promise<Package[]> {
	const packages: Package[] = [];
	const paths = await getDirectoryPaths(PATHS.PACKAGES);
	for (const possiblePackagePath of paths) {
		const packageJSON = getPackageJSON(possiblePackagePath);
		if (packageJSON?.name) {
			packages.push({
				rootPath: possiblePackagePath,
				packageJSON,
			});
		}
	}

	return packages;
}

export function getPackageEntrypointEntries(pkg: Package): string[] {
	return pkg.packageJSON.preconstruct?.entrypoints || ["index.ts"];
}

export function getPackageEntrypointSourcePaths(pkg: Package): string[] {
	return getPackageEntrypointEntries(pkg).map((entry) =>
		path.join(pkg.rootPath, "src", entry)
	);
}

export function getPackageDistPaths(pkg: Package): string[] {
	return getPackageEntrypointEntries(pkg).map((entry) =>
		entry === "index.ts"
			? path.join(pkg.rootPath, "dist")
			: path.join(pkg.rootPath, removeExtension(entry))
	);
}

export async function cleanDistDirectories() {
	const packages = await getPackages();
	for (const pkg of packages) {
		for (const entrypointPath of getPackageDistPaths(pkg)) {
			if (await directoryExists(entrypointPath)) {
				await fs.remove(entrypointPath);
			}
		}
	}
}

export function removeExtension(filename: string) {
	return filename.split(".").slice(0, -1).join(".");
}

export async function directoryExists(pathname: string) {
	try {
		return await isDirectory(pathname);
	} catch (err) {
		return false;
	}
}

export async function isDirectory(pathname: string) {
	return (await fs.lstat(pathname)).isDirectory();
}

export async function getDirectoryPaths(pathname: string): Promise<string[]> {
	try {
		const sourcePaths = await fs.readdir(pathname);
		const paths: string[] = [];
		for (const source of sourcePaths) {
			const fullPath = path.join(pathname, source);
			if (await directoryExists(fullPath)) {
				paths.push(fullPath);
			}
		}
		return paths;
	} catch (err) {
		return [];
	}
}
