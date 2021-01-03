import * as React from "react";
import { useLockSubscription } from "./use-lock-subscription";

/**
 * A convenience component for rendering "guard elements" that ensure there is
 * always a tabbable element either before or after (or both) an active lock.
 * These are most easily rendered right at the edges of the React rendering root
 * so that all locks can utilize the same guards.
 *
 * When no lock is active, `FocusGuard` is completely invisible, both visually
 * and in the focus order. When active, it gets a tabindex, but always remains
 * visually hidden.
 */
export const FocusGuard = React.memo(() => {
	const [active, setActive] = React.useState(false);
	useLockSubscription(setActive);

	return (
		<div
			tabIndex={active ? 0 : undefined}
			style={{ position: "fixed", opacity: 0, pointerEvents: "none" }}
		/>
	);
});
