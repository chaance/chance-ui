import * as React from "react";

/**
 * Provides text for screen readers that is visually hidden. It is the logical
 * opposite of the `aria-hidden` attribute.
 *
 * @see https://snook.ca/archives/html_and_css/hiding-content-for-accessibility
 * @see https://a11yproject.com/posts/how-to-hide-content/
 * @see Docs   TODO:
 * @see Source https://github.com/chaance/chance-ui/tree/main/packages/visually-hidden
 */
function useVisuallyHidden(props?: {
	style?: React.CSSProperties | undefined;
}): { style: React.CSSProperties } {
	return {
		style: {
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
			...(props?.style || {}),
		},
	};
}

export { useVisuallyHidden };
