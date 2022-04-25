// This implementation is a fork of @reach/auto-id
// https://github.com/reach/reach-ui/
// MIT License Copyright (c) React Training

import * as React from "react";
import { useIsomorphicLayoutEffect as useLayoutEffect } from "./use-isomorphic-layout-effect";

let serverHandoffComplete = false;
let id = 0;
function genId() {
	return ++id;
}

function useIdReact18(
	providedId?: string | number | null | undefined
): string | number {
	let id = React.useId();
	return providedId ?? id;
}

function useIdReactLegacy(
	providedId?: string | number | null | undefined
): string | number | null {
	// If this instance isn't part of the initial render, we don't have to do the
	// double render/patch-up dance. We can just generate the ID and return it.
	let initialId = serverHandoffComplete ? String(genId()) : null;
	let [id, setId] = React.useState(initialId);

	useLayoutEffect(() => {
		if (id === null) {
			// Patch the ID after render. We do this in `useLayoutEffect` to avoid any
			// rendering flicker, though it'll make the first render slower (unlikely
			// to matter, but you're welcome to measure your app and let us know if
			// it's a problem).
			setId(String(genId()));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	React.useEffect(() => {
		if (serverHandoffComplete === false) {
			// Flag all future uses of `useId` to skip the update dance. This is in
			// `useEffect` because it goes after `useLayoutEffect`, ensuring we don't
			// accidentally bail out of the patch-up dance prematurely.
			serverHandoffComplete = true;
		}
	}, []);

	return providedId ?? id ?? null;
}

/**
 * useId
 *
 * Autogenerate IDs to facilitate WAI-ARIA.
 *
 * The returned ID will initially be `null` and will update after a component
 * mounts. Users will need to supply their own ID if they need consistent values
 * for SSR.
 *
 * @see Docs https://TODO.com
 */
function useId(): string | null;
function useId(idFromProps: string): string;
function useId(idFromProps: number): number;
function useId(idFromProps: string | number): string | number;
function useId(idFromProps: string | undefined | null): string | null;
function useId(idFromProps: number | undefined | null): number | null;
function useId(
	idFromProps: string | number | undefined | null
): string | number | null;

function useId(
	providedId?: number | string | undefined | null
): string | number | null {
	if ("useId" in React) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useIdReact18(providedId);
	}
	// eslint-disable-next-line react-hooks/rules-of-hooks
	return useIdReactLegacy(providedId);
}

export { useId };
