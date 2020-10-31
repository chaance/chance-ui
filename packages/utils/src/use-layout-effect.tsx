import * as React from "react";
import { canUseDOM } from "./can-use-dom";

export const useLayoutEffect = canUseDOM
	? React.useLayoutEffect
	: React.useEffect;
