import type { MutableRefObject } from "react";

/**
 * React.Ref uses the readonly type `React.RefObject` instead of
 * `React.MutableRefObject`, We pretty much always assume ref objects are
 * mutable (at least when we create them), so this type is a workaround so some
 * of the weird mechanics of using refs with TS.
 */
export type AssignableRef<ValueType> =
	| {
			bivarianceHack(instance: ValueType | null): void;
	  }["bivarianceHack"]
	| MutableRefObject<ValueType | null>;
