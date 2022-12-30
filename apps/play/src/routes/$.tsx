import * as React from "react";
import {
	type LoaderFunctionArgs,
	isRouteErrorResponse,
	useRouteError,
} from "react-router-dom";
import { json } from "react-router-dom";

export const path = "*";

export async function loader({ params }: LoaderFunctionArgs) {
	throw json(null, { status: 404 });
}

export default function CatchAllRoute() {
	return null;
}

export function ErrorBoundary() {
	let error = useRouteError();
	if (isRouteErrorResponse(error)) {
		return (
			<>
				<h1>Oh No!</h1>
				<p>Status: {error.status}</p>
			</>
		);
	}
	return (
		<>
			<h1>Oh No!</h1>
			<p>Something went wrong!</p>
		</>
	);
}
