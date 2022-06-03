import { useRef, useEffect } from "react";

/**
 * Returns the previous value of a reference after a component update.
 *
 * @param value
 */
export function usePrevious<ValueType = any>(value: ValueType) {
	console.log("usePrevious is unsafe, probably!");
	const ref = useRef<ValueType | null>(null);
	useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
}
