/*
 * This is a fork of https://github.com/discord/focus-layers. I may eventually
 * decide to nuke this package and use focus-layers directly, as I imagine
 * Discord will have plenty of resources to maintain it well and improve it for
 * the long haul. That said, that package does not support focus groups, which
 * is something I'd like to tackle. I'm also hesitant to tie internal APIs to
 * any API changes they decide to make in the future. That said, it's an
 * extremely thorough and well-implemented library and I'd like to tinker with
 * it a bit here to see if we can find opportunities for improvement or new
 * features.
 */

import * as React from "react";
import { useLockLayer } from "./use-lock-layer";
import { wrapFocus } from "./utils";

export default function useFocusLock(
	containerRef: React.RefObject<HTMLElement>,
	options: {
		disableReturn?: boolean;
		attachTo?: HTMLElement | Document;
		disable?: boolean;
	} = {}
) {
	const { disableReturn, attachTo = document, disable } = options;
	// Create a new layer for this lock to occupy
	const enabledRef = useLockLayer();

	// Allow the caller to override the lock and force it to be disabled.
	React.useEffect(() => {
		if (!disable) {
			return;
		}
		enabledRef.current = false;
	}, [disable, enabledRef]);

	// Apply the actual lock logic to the container.
	React.useLayoutEffect(() => {
		// Move focus into the container if it is not already, or if an element
		// inside of the container will automatically receive focus, it won't be moved.
		const container = containerRef.current;
		if (
			container != null &&
			document.activeElement != null &&
			!container.contains(document.activeElement) &&
			container.querySelector("[autofocus]") == null
		) {
			wrapFocus(container, document.activeElement, true);
		}

		function handleFocusIn(event: FocusEvent) {
			if (!enabledRef.current) return;

			const root = containerRef.current;
			if (root == null) return;

			const newFocusElement = (event.target as Element | null) || document.body;
			if (root.contains(newFocusElement)) return;

			event.preventDefault();
			event.stopImmediatePropagation();
			wrapFocus(root, newFocusElement);
		}

		function handleFocusOut(event: FocusEvent) {
			if (!enabledRef.current) return;

			const root = containerRef.current;
			if (root == null) return;

			if (
				event.relatedTarget == null ||
				event.relatedTarget === document.body
			) {
				event.preventDefault();
				root.focus();
			}

			const newFocusElement = (event.target as Element | null) || document.body;
			if (root.contains(newFocusElement)) return;

			wrapFocus(root, newFocusElement);
		}

		attachTo.addEventListener("focusin", handleFocusIn as EventListener, {
			capture: true,
		});
		attachTo.addEventListener("focusout", handleFocusOut as EventListener, {
			capture: true,
		});
		return () => {
			attachTo.removeEventListener("focusin", handleFocusIn as EventListener, {
				capture: true,
			});
			attachTo.removeEventListener(
				"focusout",
				handleFocusOut as EventListener,
				{ capture: true }
			);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [containerRef]);

	// Set up a focus return after the container is unmounted.
	// This happens at the end to absolutely ensure that the return is the last
	// thing that will run as part of this hook (i.e., that the focus handlers
	// have been fully detached).
	useFocusReturn(disableReturn);
}

/**
 * Return focus to where it was before the caller component was mounted.
 */
function useFocusReturn(disabled?: boolean) {
	// This isn't necessarily safe, but realistically it's sufficient.
	const [target] = React.useState(() => document?.activeElement as HTMLElement);

	React.useLayoutEffect(() => {
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			if (disabled) {
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
