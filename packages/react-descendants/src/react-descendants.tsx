import * as React from "react";
import {
	createContext,
	useControlledState,
	useIsomorphicLayoutEffect as useLayoutEffect,
} from "@chance/react-utils";
import { getOwnerDocument } from "@chance/dom";

// This is a vast simplification of the error-prone descendants implementation
// in Reach UI, with a slightly different (and cleaner) API. It also takes a lot
// of ideas from Ariakit on more efficient sorting and storing of descendants,
// and using an IntersectionObserver to detect DOM changes that affect indices.
//
// https://github.com/reach/reach-ui/
// MIT License Copyright (c) React Training
//
// https://github.com/ariakit/ariakit/
// MIT License Copyright (c) Diego Haz

type WithIndex<T> = T & { index: number };

type DescendantContextProvider<
	O extends {} = {},
	T extends O & Descendant = O & Descendant
> = React.FC<
	React.PropsWithChildren<{
		items?: WithIndex<T>[];
		onItemsChange?: (
			i: WithIndex<T>[] | ((prev: WithIndex<T>[]) => WithIndex<T>[])
		) => void;
	}>
>;

type UseDescendantsHook<
	O extends {} = {},
	T extends O & Descendant = O & Descendant
> = (childName: string) => WithIndex<T>[];

type UseDescendantHook<
	O extends {} = {},
	T extends O & Descendant = O & Descendant
> = (childName: string, descendant: T) => WithIndex<{}>;

/**
 * Creates new context for registering descendants and returns a tuple with:
 *   - `DescendantsProvider`: provide state to a collection of descendants
 *   - `useDescendants`: hook for getting descendants
 *   - `useDescendant`: hook for registering a descendant and retrieving its index
 */
function createDescendantContext<
	O extends {} = {},
	T extends O & Descendant = O & Descendant
>(
	rootName: string,
	defaultContext?: DescendantContextValue<O, T>
): [
	DescendantContextProvider<O, T>,
	UseDescendantsHook<O, T>,
	UseDescendantHook<O, T>
] {
	let [ProviderInternal, useDescendantsContext] = createContext(
		rootName,
		defaultContext
	);

	let Provider: DescendantContextProvider<O, T> = ({
		children,
		items: itemsProp,
		onItemsChange,
	}) => {
		let [descendants, setDescendantsState] = useControlledState({
			controlledValue: itemsProp,
			defaultValue: [],
			calledFrom: rootName,
		});
		let setDescendants: typeof setDescendantsState = React.useCallback(
			(prevItems) => {
				onItemsChange?.(prevItems);
				return setDescendantsState(prevItems);
			},
			[onItemsChange, setDescendantsState]
		);

		useSortDescendants(descendants, setDescendants);

		let register = React.useCallback(
			(item: T) => {
				setDescendants((prevItems) => {
					let newItem = item as WithIndex<T>;
					let index = getIndexFromDOM(prevItems, item);
					newItem.index = index;
					return addItemAtIndex(prevItems, newItem, index);
				});
				let unregister = () => {
					setDescendants((prevItems) => {
						let nextItems: WithIndex<T>[] = [];
						let i = 0;
						for (let prevItem of prevItems) {
							if (prevItem.ref !== item.ref) {
								continue;
							}
							prevItem.index = i++;
							nextItems.push(prevItem);
						}
						if (prevItems.length === nextItems.length) {
							return prevItems;
						}
						return nextItems;
					});
				};
				return unregister;
			},
			[setDescendants]
		);

		return (
			<ProviderInternal value={{ descendants, register }}>
				{children}
			</ProviderInternal>
		);
	};

	function useDescendants(childName: string) {
		let ctx = useDescendantsContext(childName);
		return ctx.descendants;
	}

	/**
	 * This hook registers our descendant by passing it into an array. We can then
	 * search that array by to find its index when registering it in the
	 * component. We use this for focus management, keyboard navigation, and
	 * typeahead functionality for some components.
	 *
	 * The hook accepts the element node and (optionally) a key. The key is useful
	 * if multiple descendants have identical text values and we need to
	 * differentiate siblings for some reason.
	 *
	 * Our main goals with this are:
	 *   1) maximum composability,
	 *   2) minimal API friction
	 *   3) SSR compatibility*
	 *   4) concurrent safe
	 *   5) index always up-to-date with the tree despite changes
	 *   6) works with memoization of any component in the tree (hopefully)
	 *
	 * As for SSR, the good news is that we don't actually need the index on the
	 * server for most use-cases, as we are only using it to determine the order
	 * of composed descendants for keyboard navigation. However, in the few cases
	 * where this is not the case, we can require an explicit index from the app.
	 */
	function useDescendant(childName: string, descendant: T): WithIndex<{}> {
		let { register, descendants } = useDescendantsContext(childName);
		let memoed = React.useMemo(
			() => descendant,
			// eslint-disable-next-line react-hooks/exhaustive-deps
			Object.values(descendant)
		);
		useLayoutEffect(() => {
			return register(memoed);
		}, [register, memoed]);

		// Return the index of the item
		return {
			index:
				descendants.find((item) => item.ref === descendant.ref)?.index ?? -1,
		};
	}

	return [Provider, useDescendants, useDescendant];
}

interface DescendantContextValue<
	O extends {} = {},
	T extends O & Descendant = O & Descendant
> {
	descendants: WithIndex<T>[];
	register(descendant: T): void;
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type { Descendant, DescendantContextValue };
export { createDescendantContext };

function addItemAtIndex<T extends any[]>(
	array: T,
	item: T[number],
	index: number
): T {
	if (!(index in array)) {
		return [...array, item] as T;
	}
	return [...array.slice(0, index), item, ...array.slice(index)] as T;
}

type Descendant = { ref: React.MutableRefObject<HTMLElement | null> };

function getIndexFromDOM(items: Descendant[], item: Descendant) {
	if (!item.ref.current) {
		// TODO: Dev warning
		return -1;
	}

	if (items.length === 0) {
		return 0;
	}

	let length = items.length;
	while (length--) {
		let index = length;
		let currentItem = items[index];
		if (!currentItem?.ref.current) {
			continue;
		}
		if (isElementPreceding(currentItem.ref.current, item.ref.current)) {
			return index + 1;
		}
	}

	// something went haywire!
	return -1;
}

function sortByDOMPosition<
	O extends {} = {},
	T extends O & Descendant = O & Descendant
>(items: T[]) {
	let pairs = items.map((item, index) => [index, item] as const);
	let isOrderDifferent = false;
	pairs.sort(([indexA, a], [indexB, b]) => {
		let elementA = a.ref.current;
		let elementB = b.ref.current;
		if (elementA === elementB) return 0;
		if (!elementA || !elementB) return 0;
		if (isElementPreceding(elementA, elementB)) {
			if (indexA > indexB) {
				isOrderDifferent = true;
			}
			return -1;
		}
		if (indexA < indexB) {
			isOrderDifferent = true;
		}
		return 1;
	});
	if (isOrderDifferent) {
		return pairs.map(([_, item]) => item);
	}
	return items;
}

function setDescendantsByDOMPosition<
	O extends {} = {},
	T extends O & Descendant = O & Descendant
>(items: WithIndex<T>[], setItems: (items: WithIndex<T>[]) => any) {
	let sortedItems = sortByDOMPosition(items);
	if (items !== sortedItems) {
		setItems(
			sortedItems.map((item, index) => {
				item.index = index;
				return item;
			})
		);
	}
}

function getCommonParent(items: Descendant[]) {
	let firstItem = items[0];
	let lastItem = items[items.length - 1];
	let parentElement = firstItem?.ref.current?.parentElement;
	while (parentElement) {
		let parent = parentElement;
		if (lastItem && parent.contains(lastItem.ref.current)) {
			return parentElement;
		}
		parentElement = parentElement.parentElement;
	}
	return getOwnerDocument(parentElement).body;
}

function useTimeoutObserver<
	O extends {} = {},
	T extends O & Descendant = O & Descendant
>(descendants: WithIndex<T>[], setDescendants: (items: WithIndex<T>[]) => any) {
	React.useEffect(() => {
		let timeout = setTimeout(() =>
			setDescendantsByDOMPosition(descendants, setDescendants)
		);
		return () => clearTimeout(timeout);
	});
}

function useSortDescendants<
	O extends {} = {},
	T extends O & Descendant = O & Descendant
>(
	descendants: WithIndex<T>[],
	setDescendants: (descendants: WithIndex<T>[]) => any
) {
	/* eslint-disable react-hooks/rules-of-hooks */
	if (typeof IntersectionObserver === "undefined") {
		useTimeoutObserver(descendants, setDescendants);
		return;
	}
	let previousItems = React.useRef<T[]>([]);
	React.useEffect(() => {
		let root = getCommonParent(descendants);
		let observer = new IntersectionObserver(
			() => {
				let hasPreviousItems = !!previousItems.current.length;
				previousItems.current = descendants;
				if (!hasPreviousItems) {
					return;
				}
				setDescendantsByDOMPosition(descendants, setDescendants);
			},
			{ root }
		);
		descendants.forEach((item) => {
			if (item.ref.current) {
				observer.observe(item.ref.current);
			}
		});
		return () => {
			observer.disconnect();
		};
	}, [descendants, setDescendants]);
	/* eslint-enable react-hooks/rules-of-hooks */
}

function isElementPreceding(elementA: Element, elementB: Element) {
	return Boolean(
		elementB.compareDocumentPosition(elementA) &
			Node.DOCUMENT_POSITION_PRECEDING
	);
}
