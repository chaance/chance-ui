export const canUseDOM = !!(
	typeof window !== "undefined" &&
	window.document &&
	window.document.createElement
);

export function composeEventHandlers<
	EventType extends { defaultPrevented: boolean }
>(
	...handlers: Array<((event: EventType) => any) | undefined>
): (event: EventType) => any {
	return (event) => {
		for (let handler of handlers) {
			handler?.(event);
			if (event.defaultPrevented) {
				break;
			}
		}
	};
}

/**
 * Get an element's owner document. Useful when components are used in iframes
 * or other environments like dev tools.
 *
 * @param element
 */
export function getOwnerDocument<T extends Element>(
	element: T | null | undefined
): Document {
	if (!canUseDOM) {
		throw new Error(
			"You can only access `document` or `window` in a browser environment"
		);
	}
	return element ? element.ownerDocument : document;
}

export function getOwnerWindow<T extends Element>(
	element: T | null | undefined
): Window & typeof globalThis {
	return getOwnerDocument(element).defaultView || window;
}

export function getComputedStyles(
	element: Element,
	pseudoElt?: string | null | undefined
): CSSStyleDeclaration | null {
	return getOwnerWindow(element).getComputedStyle(element, pseudoElt || null);
}

/**
 * Get the size of the working document minus the scrollbar offset.
 *
 * @param element
 */
export function getDocumentDimensions(
	element?: HTMLElement | null | undefined
) {
	let ownerDocument = getOwnerDocument(element)!;
	let ownerWindow = ownerDocument.defaultView || window;
	if (!ownerDocument) {
		return {
			width: 0,
			height: 0,
		};
	}

	return {
		width: ownerDocument.documentElement.clientWidth ?? ownerWindow.innerWidth,
		height:
			ownerDocument.documentElement.clientHeight ?? ownerWindow.innerHeight,
	};
}

/**
 * Get the scoll position of the global window object relative to a given node.
 *
 * @param element
 */
export function getScrollPosition(element?: HTMLElement | null | undefined) {
	let ownerWindow = getOwnerWindow(element);
	if (!ownerWindow) {
		return {
			scrollX: 0,
			scrollY: 0,
		};
	}

	return {
		scrollX: ownerWindow.scrollX,
		scrollY: ownerWindow.scrollY,
	};
}

export function isRightClick(
	nativeEvent: MouseEvent | PointerEvent | TouchEvent
) {
	return "which" in nativeEvent
		? nativeEvent.which === 3
		: "button" in nativeEvent
		? (nativeEvent as any).button === 2
		: false;
}

export function log() {
	console.log("log");
}
