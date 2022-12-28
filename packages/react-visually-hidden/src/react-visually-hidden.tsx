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
	({ visibleOnFocus = false, ...props }) => {
		return [
			{
				"data-chance-ui-comp": "visually-hidden",
				"data-visible-on-focus": visibleOnFocus || undefined,
				...props,
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
	children: React.ReactNode;
	/**
	 * Whether or not the element should be visible on focus.
	 *
	 * @see Docs https://TODO.com
	 */
	visibleOnFocus?: boolean;
}

export type { VisuallyHiddenProps };
export { VisuallyHidden };
export default VisuallyHidden;
