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
import { LOCK_STACK } from "./lock-stack";
import { newLockUID } from "./utils";

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
