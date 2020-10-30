import { buildPackage, getPackageDirectoryMap } from "./build";
import { NPM_SCOPE } from "./constants";
import { logError } from "./utils";

async function buildSinglePackage() {
	let args = process.argv.slice(2);
	try {
		let packageName = `${NPM_SCOPE}/${args[0]}`;
		let topoPackageMap = await getPackageDirectoryMap();
		let packagePath = topoPackageMap[packageName];

		if (!packagePath) {
			logError("Invalid package passed as the CLI argument");
			process.exit(1);
		}
		buildPackage(packageName, packagePath);
	} catch (err) {
		logError("🤯 🤯 🤯");
		logError(err);
		process.exit(1);
	}
}

buildSinglePackage();
