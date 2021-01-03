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
import LockStack, { LockListener } from "./lock-stack";

// This global ensures that only one stack exists in the document. Having
// multiple active stacks does not make sense, as documents are only capable of
// having one activeElement at a time.
export const LOCK_STACK = new LockStack();

let lockCount = 0;
function newLockUID() {
	return `lock-${lockCount++}`;
}

/**
 * Creates a subscription to the lock stack that is bound to the lifetime of the
 * caller, based on `useEffect`.
 */
export function useLockSubscription(callback: LockListener) {
	// `subscribe` returns an `unsubscribe` function that `useEffect` can invoke
	// to clean up the subscription.
	React.useEffect(() => LOCK_STACK.subscribe(callback), [callback]);
}

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

/**
 * Create and push a new lock onto the global LOCK_STACK, tied to the lifetime
 * of the caller. Returns a ref containing the current enabled state of the
 * layer, to be used for enabling/disabling the caller's lock logic.
 */
export function useLockLayer(controlledUID?: string) {
	const [uid] = React.useState(() => controlledUID || newLockUID());
	const enabledRef = React.useRef(false);

	React.useLayoutEffect(() => {
		LOCK_STACK.add(uid, (enabled) => (enabledRef.current = enabled));
		return () => LOCK_STACK.remove(uid);
	}, [uid]);

	return enabledRef;
}

export default function useFocusLock(
	containerRef: React.RefObject<HTMLElement>,
	options: {
		disableReturnRef?: React.RefObject<boolean>;
		attachTo?: HTMLElement | Document;
		disable?: boolean;
	} = {}
) {
	const { disableReturnRef, attachTo = document, disable } = options;
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
	useFocusReturn(disableReturnRef);
}

function createFocusWalker(root: HTMLElement) {
	return document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
		acceptNode: (node: HTMLElement) =>
			// `.tabIndex` is not the same as the `tabindex` attribute. It works on
			// the runtime's understanding of tabbability, so this automatically
			// accounts for any kind of element that could be tabbed to.
			node.tabIndex >= 0 && !(node as any).disabled
				? NodeFilter.FILTER_ACCEPT
				: NodeFilter.FILTER_SKIP,
	});
}

/**
 * Given a `root` container element and a `target` that is outside of that
 * container and intended to receive focus, force the DOM focus to wrap around
 * such that it remains within `root`.
 *
 * If `forceFirst` is set to `true`, the wrap will always attempt to focus the
 * first viable element in `root`, rather than wrapping to the end.
 */
function wrapFocus(
	root: HTMLElement,
	target: Element,
	forceFirst: boolean = false
) {
	const walker = createFocusWalker(root);
	const position = target.compareDocumentPosition(root);
	let wrappedTarget: HTMLElement | null = null;

	if (position & Node.DOCUMENT_POSITION_PRECEDING || forceFirst) {
		wrappedTarget = walker.firstChild() as HTMLElement | null;
	} else if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
		wrappedTarget = walker.lastChild() as HTMLElement | null;
	}

	const newFocus = wrappedTarget != null ? wrappedTarget : root;
	newFocus.focus();
}
