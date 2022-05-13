import { useEffect } from "react";

export default function useConsoleEffect(
	method: "log" | "warn" | "error",
	...args: any[]
) {
	useEffect(() => {
		console[method](...args);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [method, ...args]);
}
