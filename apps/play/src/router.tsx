import * as React from "react";
import { createBrowserRouter } from "react-router-dom";
import type {
	RouteObject,
	ActionFunction,
	LoaderFunction,
	ShouldRevalidateFunction,
} from "react-router-dom";

import * as Root from "~/root";
import * as StoryRoute from "~/routes/stories.$storyId";
import * as CatchAllRoute from "~/routes/$";

export const router = createBrowserRouter([
	createRoute({
		...Root,
		children: [createRoute(StoryRoute), createRoute(CatchAllRoute)],
	}),
]);

function createRoute(routeModule: {
	default: React.ComponentType<any>;
	path: string;
	ErrorBoundary?: React.ComponentType<any>;
	action?: ActionFunction;
	loader?: LoaderFunction;
	shouldRevalidate?: ShouldRevalidateFunction;
	children?: RouteObject[];
}): RouteObject {
	return {
		path: routeModule.path,
		element: <routeModule.default />,
		action: routeModule.action || undefined,
		loader: routeModule.loader || undefined,
		shouldRevalidate: routeModule.shouldRevalidate || undefined,
		children: routeModule.children || undefined,
		errorElement: routeModule.ErrorBoundary ? (
			<routeModule.ErrorBoundary />
		) : undefined,
	};
}
