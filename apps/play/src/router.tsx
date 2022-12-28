import * as React from "react";
import { createBrowserRouter } from "react-router-dom";

import * as Root from "~/root";
import * as StoryRoute from "~/routes/stories.$storyId";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Root.default />,
		errorElement: <Root.ErrorBoundary />,
		loader: Root.loader,
		children: [
			{
				path: StoryRoute.path,
				element: <StoryRoute.default />,
				loader: StoryRoute.loader,
			},
		],
	},
]);
