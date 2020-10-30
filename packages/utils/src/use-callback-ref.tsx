import * as React from "react";

export function useCallbackRef<T extends (...args: any[]) => any>(
	callback?: T
): T {
	const callbackRef = React.useRef(callback!);

	React.useEffect(() => {
		callbackRef.current = callback!;
	});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	return React.useCallback(
		((...args) => {
			callbackRef.current && callbackRef.current(...args);
		}) as T,
		[]
	);
}
