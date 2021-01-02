import * as React from "react";

export function useForceUpdate() {
	let [, dispatch] = React.useState<{}>(Object.create(null));
	return React.useCallback(() => {
		dispatch(Object.create(null));
	}, []);
}
