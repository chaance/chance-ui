import * as React from "react";
import { polymorphicForwardRef } from "@chance/ui-utils/polymorphic";
import { useVisuallyHidden } from "./use-visually-hidden";

const DEFAULT_ELEMENT = "span";

/**
 * Provides text for screen readers that is visually hidden. It is the logical
 * opposite of the `aria-hidden` attribute.
 *
 * @see https://snook.ca/archives/html_and_css/hiding-content-for-accessibility
 * @see https://a11yproject.com/posts/how-to-hide-content/
 * @see Docs   TODO:
 * @see Source https://github.com/chaance/chance-ui/tree/main/packages/visually-hidden
 */
const VisuallyHidden = polymorphicForwardRef<{}, typeof DEFAULT_ELEMENT>(
	function VisuallyHidden({ as: Comp = DEFAULT_ELEMENT, ...props }, ref) {
		return <Comp ref={ref} {...props} {...useVisuallyHidden(props)} />;
	}
);

if (__DEV__) {
	VisuallyHidden.displayName = "VisuallyHidden";
}

export { VisuallyHidden };
