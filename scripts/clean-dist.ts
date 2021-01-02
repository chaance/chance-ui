import fs from "fs-extra";
import { directoryExists, getPackageDistPaths, getPackages } from "./utils";

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

cleanDistDirectories();
