import * as React from "react";
import { LockListener, LOCK_STACK } from "./lock-stack";

/**
 * Creates a subscription to the lock stack that is bound to the lifetime of the
 * caller, based on `useEffect`.
 */
export function useLockSubscription(callback: LockListener) {
	// `subscribe` returns an `unsubscribe` function that `useEffect` can invoke
	// to clean up the subscription.
	React.useEffect(() => LOCK_STACK.subscribe(callback), [callback]);
}
