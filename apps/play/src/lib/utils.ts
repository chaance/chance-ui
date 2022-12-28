import kebabCase from "lodash/kebabCase";
import type { Story, StoryMeta, StoryModule, StoryModuleMeta } from "~/types";

export { kebabCase };

export function toStoryMeta({
	name,
	group,
	description,
}: {
	name: string;
	group: string;
	description?: string;
}): StoryModuleMeta {
	return {
		name,
		group,
		description: description || "",
		get title() {
			return this.name + " — " + this.group;
		},
	};
}

export function isStoryModule(val: any): val is StoryModule {
	return (
		val != null &&
		typeof val === "object" &&
		isReactComponent(val.default) &&
		isStoryModuleMeta(val.meta)
	);
}

export function isStoryModuleMeta(val: any): val is StoryMeta {
	return (
		val != null &&
		typeof val === "object" &&
		typeof val.title === "string" &&
		typeof val.name === "string" &&
		typeof val.group === "string" &&
		(val.description === undefined || typeof val.description === "string")
	);
}

export function isStoryMeta(val: any): val is StoryMeta {
	return (
		val != null &&
		typeof val === "object" &&
		typeof val.id === "string" &&
		typeof val.title === "string" &&
		typeof val.name === "string" &&
		typeof val.group === "string" &&
		(val.description === undefined || typeof val.description === "string")
	);
}

export function isReactComponent(val: any): val is React.FunctionComponent {
	return (
		typeof val === "function"
		// && String(val).includes("return React.createElement")
	);
}

export async function importStories({
	getModuleMap,
	getId,
}: {
	getModuleMap: () => Record<string, () => Promise<unknown>>;
	getId: (storyPath: string) => string;
}) {
	let moduleMap = getModuleMap();
	let storiesToLoad: Array<Promise<Story | null>> = [];
	for (let path in moduleMap) {
		storiesToLoad.push(
			new Promise(async (res) => {
				let storyModule = await moduleMap[path]();
				if (!isStoryModule(storyModule)) {
					console.error(`Invalid story module at ${path}`, module);
					return res(null);
				}
				return res({
					id: getId(path),
					module: storyModule,
					moduleMeta: {
						path: path,
						ext: path.split(".").pop()!,
					},
				});
			})
		);
	}
	return (await Promise.all(storiesToLoad)).filter((v): v is Story => !!v);
}
