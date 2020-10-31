/**
 * @see Docs   TODO:
 * @see Source https://github.com/chaance/chance-ui/tree/main/packages/portal
 * @see React  https://reactjs.org/docs/portals.html
 */

import * as React from "react";
import { useLayoutEffect } from "@chance/utils/use-layout-effect";
import { useForceUpdate } from "@chance/utils";
import { createPortal } from "react-dom";

/**
 * Portal
 *
 * @see Docs https://reach.tech/portal#portal
 */
const Portal: React.FC<PortalProps> = ({ children, type = "reach-portal" }) => {
	let mountNode = React.useRef<HTMLDivElement | null>(null);
	let portalNode = React.useRef<HTMLElement | null>(null);
	let forceUpdate = useForceUpdate();

	useLayoutEffect(() => {
		// This ref may be null when a hot-loader replaces components on the page
		if (!mountNode.current) return;
		// It's possible that the content of the portal has, itself, been portaled.
		// In that case, it's important to append to the correct document element.
		const ownerDocument = mountNode.current!.ownerDocument;
		portalNode.current = ownerDocument?.createElement(type)!;
		ownerDocument!.body.appendChild(portalNode.current);
		forceUpdate();
		return () => {
			if (portalNode.current && portalNode.current.ownerDocument) {
				portalNode.current.ownerDocument.body.removeChild(portalNode.current);
			}
		};
	}, [type, forceUpdate]);

	return portalNode.current ? (
		createPortal(children, portalNode.current)
	) : (
		<span ref={mountNode} />
	);
};

/**
 * @see Docs https://reach.tech/portal#portal-props
 */
export type PortalProps = {
	/**
	 * Regular React children.
	 *
	 * @see Docs https://reach.tech/portal#portal-children
	 */
	children: React.ReactNode;
	/**
	 * The DOM element type to render.
	 *
	 * @see Docs https://reach.tech/portal#portal-type
	 */
	type?: string;
};

if (__DEV__) {
	Portal.displayName = "Portal";
}

export default Portal;
