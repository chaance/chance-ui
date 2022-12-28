import * as React from "react";
import { type LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { parse as parsePath } from "path-browserify";
import { json } from "react-router-dom";
import { importStories } from "~/lib/utils";
import type { Story } from "~/types";

export const path = "stories/:storyId";

export async function loader({ params }: LoaderFunctionArgs) {
	let { storyId } = params;
	if (!storyId) {
		throw Error("Story ID is required");
	}
	let stories = await importStories({
		getId: (path) => parsePath(path).name,
		getModuleMap: () => import.meta.glob("../stories/*.(js|jsx|ts|tsx)"),
	});
	let story = stories.find((story) => story.id === storyId);
	if (!story) {
		throw json(null, { status: 404 });
	}
	return json<LoaderData>({ story });
}

export default function StoryRoute() {
	let { story } = useLoaderData() as LoaderData;
	const Story = React.useMemo(
		() => React.lazy(async () => import(story.moduleMeta.path)),
		[story.moduleMeta.path]
	);
	return (
		<div>
			<h1>Hello</h1>
			<React.Suspense fallback={<div>Loading...</div>}>
				<Story />
			</React.Suspense>
		</div>
	);
}

interface LoaderData {
	story: Story;
}
