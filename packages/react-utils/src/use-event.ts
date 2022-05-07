// See https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md

/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
import * as React from "react";
import { useIsomorphicLayoutEffect as useLayoutEffect } from "./use-isomorphic-layout-effect";

let useEffect = useLayoutEffect;
if ("useInsertionEffect" in React) {
	useEffect = React.useInsertionEffect;
}

/**
 * Converts a callback to a ref to avoid triggering re-renders when passed as a
 * prop and exposed as a stable function to avoid executing effects when passed
 * as a dependency.
 */
function useEvent<T extends (...args: any[]) => any>(
	callback: T | null | undefined
): T {
	if ("useEvent" in React) {
		try {
			// @ts-expect-error
			return React.useEvent(callback || (() => {}));
		} catch (_) {}
	}
	let callbackRef = React.useRef(callback);
	useEffect(() => {
		callbackRef.current = callback;
	});

	return React.useCallback(
		((...args) => {
			let fn = callbackRef.current;
			fn?.(...args);
		}) as T,
		[]
	);
}

export { useEvent as unstable_useEvent };
