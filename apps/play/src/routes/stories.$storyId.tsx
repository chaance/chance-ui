import * as React from "react";
import { type LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { parse as parsePath } from "path-browserify";
import { json } from "react-router-dom";
import { importStories } from "~/lib/utils";
import type { Story } from "~/types";
import { ErrorBoundary } from "~/ui/error-boundary";

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
	let [readyToShowLoadingIndicator, setReadyToShowLoadingIndicator] =
		React.useState(false);
	let { story } = useLoaderData() as LoaderData;

	// probably could run into race conditions here if route switches fast between
	// huge-ass stories or slow-ass connections, but whatever, it's fine for now.
	let Story = React.useMemo(
		() => React.lazy(() => import(story.moduleMeta.path)),
		[story.moduleMeta.path]
	);

	return (
		<div>
			<h1>Hello</h1>
			<React.Suspense
				fallback={
					<>
						<Delayed
							delay={150}
							ready={readyToShowLoadingIndicator}
							setReady={setReadyToShowLoadingIndicator}
						>
							<div aria-hidden>Loading story…</div>
						</Delayed>
						<div aria-live="polite" className="sr-only">
							Loading story
						</div>
					</>
				}
			>
				<ErrorBoundary fallback={<h1>We fucked up</h1>}>
					<Story />
				</ErrorBoundary>
			</React.Suspense>
		</div>
	);
}

interface LoaderData {
	story: Story;
}

function Delayed({
	delay,
	children,
	ready,
	setReady,
}: {
	delay: number;
	children: React.ReactElement;
	ready: boolean;
	setReady: (ready: boolean) => void;
}) {
	React.useEffect(() => {
		let to = window.setTimeout(() => setReady(true), delay);
		return () => window.clearTimeout(to);
	}, [delay, setReady]);
	return ready ? children : null;
}
