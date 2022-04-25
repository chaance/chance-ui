/**
 * VisuallyHidden
 *
 * Provides text for screen readers that is visually hidden.
 * It is the logical opposite of the `aria-hidden` attribute.
 *
 * @see https://snook.ca/archives/html_and_css/hiding-content-for-accessibility
 * @see https://a11yproject.com/posts/how-to-hide-content/
 * @see Docs     https://TODO.com
 * @see Source   https://TODO.com
 */

import * as React from "react";
import {
	createComponentHook,
	createPolymorphicComponent,
} from "@chance/react-utils";
import { isFunction } from "@chance/utils";

const useVisuallyHidden = createComponentHook<"span", VisuallyHiddenProps>(
	(props) => {
		return [
			{
				"data-ui-visually-hidden": "",
				...props,
				style: {
					// TODO: Modernize
					border: 0,
					clip: "rect(0 0 0 0)",
					height: "1px",
					margin: "-1px",
					overflow: "hidden",
					padding: 0,
					position: "absolute",
					width: "1px",

					// https://medium.com/@jessebeach/beware-smushed-off-screen-accessible-text-5952a4c2cbfe
					whiteSpace: "nowrap",
					wordWrap: "normal",
					...props.style,
				},
			},
		];
	}
);

/**
 * VisuallyHidden
 *
 * Provides text for screen readers that is visually hidden.
 * It is the logical opposite of the `aria-hidden` attribute.
 */
const VisuallyHidden = createPolymorphicComponent<"span", VisuallyHiddenProps>(
	(props) => {
		let { render, as: Comp = "span" } = props;
		let [domProps] = useVisuallyHidden(props);
		return isFunction(render) ? render(domProps) : <Comp {...domProps} />;
	}
);
VisuallyHidden.displayName = "VisuallyHidden";

/**
 * @see Docs https://TODO.com
 */
interface VisuallyHiddenProps {
	/**
	 * @see Docs https://TODO.com
	 */
	children: React.ReactNode;
}

export type { VisuallyHiddenProps };
export { VisuallyHidden };
export default VisuallyHidden;
