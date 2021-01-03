import * as React from "react";

/**
 * Set up a return of focus to the target element specified by `returnTo` to
 * occur at the end of the lifetime of the caller component. In other words,
 * return focus to where it was before the caller component was mounted.
 */
export function useFocusReturn(disabledRef?: React.RefObject<boolean>) {
	// This isn't necessarily safe, but realistically it's sufficient.
	const [target] = React.useState(() => document?.activeElement as HTMLElement);

	React.useLayoutEffect(() => {
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			if (disabledRef != null && disabledRef.current) {
				return;
			}
			// Happens on next tick to ensure it is not overwritten by focus lock.
			requestAnimationFrame(() => {
				target != null && target.focus();
			});
		};
		// Explicitly only want this to run on unmount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
}
