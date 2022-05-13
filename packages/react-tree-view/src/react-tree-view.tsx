/**
 * Tree View
 *
 * @see Docs     https://TODO.com
 * @see Source   https://github.com/TODO
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#TreeView
 */

/* eslint-disable */

import * as React from "react";
import {
	createComponentHook,
	createContext,
	createPolymorphicComponent,
	useComposedRefs,
	useControlledState,
	useId,
	unstable_useEvent as useEvent,
} from "@chance/react-utils";
import { createDescendantContext } from "@chance/react-descendants";
import { composeEventHandlers } from "@chance/dom";
import { isFunction, findFromEnd } from "@chance/utils";

const noop = () => {};

export default noop;

// const [DescendantsProvider, useDescendants, useDescendant] =
// 	createDescendantContext<{
// 		isLink: boolean;
// 		triggerRef: React.MutableRefObject<HTMLElement | null>;
// 		disabled: boolean;
// 	}>("TreeView");

// const [TreeViewProvider, useTreeViewCtx] =
// 	createContext<TreeViewContextValue>("TreeView");
// const [TreeViewItemProvider, useTreeViewItemCtx] =
// 	createContext<TreeViewItemContextValue>("TreeViewItem");

// const STATE_EXPANDED = "expanded";
// const STATE_COLLAPSED = "collapsed";
// type TreeViewItemState = typeof STATE_EXPANDED | typeof STATE_COLLAPSED;

// const SELECTION_MODE_SINGLE = "single";
// const SELECTION_MODE_MULTIPLE = "multiple";
// type TreeViewSelectionMode =
// 	| typeof SELECTION_MODE_SINGLE
// 	| typeof SELECTION_MODE_MULTIPLE;

// type TreeViewItemId = string | number;

// const EMPTY_ARRAY: any[] = [];

// interface TreeViewItemNode {
// 	disabled: boolean;
// 	expandable: boolean;
// 	id: TreeViewItemId;
// 	index: number;
// 	parentId: TreeViewItemId | null;
// 	// TODO: Implement proper typeahead
// 	firstChar: string;
// }

// const useTreeViewFF = createComponentHook<
// 	"ul",
// 	TreeViewProps,
// 	TreeViewContextValue
// >((props) => {
// 	let {
// 		defaultExpanded = EMPTY_ARRAY as TreeViewItemId[],
// 		defaultSelected = EMPTY_ARRAY as TreeViewItemId[],
// 		disabledItemsFocusable = false,
// 		disableSelection = false,
// 		expanded: expandedProp,
// 		selectionMode = SELECTION_MODE_SINGLE,
// 		selected: selectedProp,
// 		id: idProp,
// 		onBlur,
// 		onFocus,
// 		onKeyDown,
// 		...domProps
// 	} = props;

// 	// TODO:
// 	let isRtl = false;

// 	let ownerState = {
// 		defaultExpanded,
// 		defaultSelected,
// 		disabledItemsFocusable,
// 		disableSelection,
// 		selectionMode,
// 	};

// 	let treeId = useId(idProp);
// 	let treeRef = React.useRef<HTMLElement | null>(null);
// 	let ref = useComposedRefs(treeRef, domProps.ref);

// 	let [focusedNodeId, setFocusedNodeId] = React.useState<TreeViewItemId | null>(
// 		null
// 	);

// 	let nodeMap = React.useRef<Map<TreeViewItemId, TreeViewItemNode>>(null!);
// 	if (!nodeMap.current) {
// 		nodeMap.current = new Map<TreeViewItemId, TreeViewItemNode>();
// 	}

// 	let [expanded, setExpandedState] = useControlledState({
// 		controlledValue: Array.isArray(expandedProp)
// 			? expandedProp
// 			: (expandedProp && [expandedProp]) || undefined,
// 		defaultValue: Array.isArray(defaultExpanded)
// 			? defaultExpanded
// 			: [defaultExpanded],
// 		calledFrom: "TreeView",
// 	});

// 	let [selected, setSelectedState] = useControlledState({
// 		controlledValue: Array.isArray(selectedProp)
// 			? selectedProp
// 			: (selectedProp && [selectedProp]) || undefined,
// 		defaultValue: Array.isArray(defaultSelected)
// 			? defaultSelected
// 			: [defaultSelected],
// 		calledFrom: "TreeView",
// 	});

// 	let getNode = React.useCallback((id: TreeViewItemId | null | undefined) => {
// 		if (id == null) {
// 			return null;
// 		}
// 		return nodeMap.current.get(id) || null;
// 	}, []);

// 	let isExpanded = React.useCallback(
// 		(id: TreeViewItemId | null | undefined) => {
// 			return Array.isArray(expanded) && id != null
// 				? expanded.indexOf(id) !== -1
// 				: false;
// 		},
// 		[expanded]
// 	);

// 	let isExpandable = React.useCallback(
// 		(id: TreeViewItemId | null | undefined) => {
// 			return !!(id != null && getNode(id)?.expandable);
// 		},
// 		[getNode]
// 	);

// 	let isSelected = React.useCallback(
// 		(id: TreeViewItemId | null | undefined) => {
// 			if (id == null) {
// 				return false;
// 			}
// 			return selected.indexOf(id) !== -1;
// 		},
// 		[selected]
// 	);

// 	let isDisabled = React.useCallback(
// 		(id: TreeViewItemId | null | undefined) => {
// 			if (id == null) {
// 				return false;
// 			}
// 			let node = nodeMap.current.get(id);
// 			if (!node) {
// 				return false;
// 			}
// 			if (node.disabled) {
// 				return true;
// 			}
// 			while (node.parentId != null) {
// 				node = nodeMap.current.get(node.parentId)!;
// 				if (node.disabled) {
// 					return true;
// 				}
// 			}
// 			return false;
// 		},
// 		[]
// 	);

// 	function isFocused(id: TreeViewItemId | null | undefined) {
// 		return focusedNodeId === id;
// 	}

// 	function getChildNodes(
// 		id: TreeViewItemId | null | undefined
// 	): TreeViewItemNode[] {
// 		let keys = Array.from(nodeMap.current.keys());
// 		let ids: TreeViewItemNode[] = [];
// 		for (let key of keys) {
// 			let node = getNode(key);
// 			if (node && node.parentId == (id ?? null)) {
// 				ids.push(node);
// 			}
// 		}
// 		return ids.sort((a, b) => a.index - b.index);
// 	}

// 	function getNavigableChildNodes(
// 		id: TreeViewItemId | null | undefined
// 	): TreeViewItemNode[] {
// 		let children = getChildNodes(id);
// 		if (children.length === 0) {
// 			return children;
// 		}
// 		if (!disabledItemsFocusable) {
// 			children = children.filter((node) => !isDisabled(node.id));
// 		}
// 		return children;
// 	}

// 	function getNextNode(id: TreeViewItemId | null | undefined) {
// 		// If expanded get first child
// 		let nodes = getNavigableChildNodes(id);
// 		if (nodes.length > 0 && isExpanded(id)) {
// 			return nodes[0]!;
// 		}

// 		let node = getNode(id);
// 		while (node != null) {
// 			let id = node.id;
// 			let siblings =
// 				node.parentId != null ? getNavigableChildNodes(node.parentId)! : [];
// 			let currentIndex = siblings.findIndex((n) => n.id === id);
// 			let nextSibling = currentIndex > -1 ? siblings[currentIndex + 1] : null;

// 			if (nextSibling) {
// 				return nextSibling;
// 			}

// 			// If the sibling does not exist, go up a level to the parent and try
// 			// again.
// 			node = getNode(node.parentId);
// 		}

// 		return null;
// 	}

// 	function getPreviousNode(id: TreeViewItemId | null | undefined) {
// 		let node = getNode(id);
// 		if (!node) {
// 			return null;
// 		}
// 		let siblings = getNavigableChildNodes(node.parentId);
// 		let nodeIndex = siblings.findIndex((n) => n.id === id);

// 		if (nodeIndex < 1) {
// 			return node;
// 		}

// 		let currentNode = siblings[nodeIndex - 1]!;
// 		let childNodes: TreeViewItemNode[];
// 		while (
// 			isExpanded(currentNode.id) &&
// 			(childNodes = getNavigableChildNodes(currentNode.id)).length > 0
// 		) {
// 			currentNode = [...childNodes].pop()!;
// 		}
// 		return currentNode || null;
// 	}

// 	function getLastNode() {
// 		let lastNode = getNavigableChildNodes(null).pop();
// 		while (lastNode && isExpanded(lastNode.id)) {
// 			lastNode = getNavigableChildNodes(lastNode.id).pop();
// 		}
// 		return lastNode;
// 	}

// 	function getFirstNode() {
// 		return getNavigableChildNodes(null)[0];
// 	}

// 	function getParentNode(id: TreeViewItemId | null | undefined) {
// 		return getNode(id)?.parentId ?? null;
// 	}

// 	/**
// 	 * This is used to determine the start and end of a selection range so we can
// 	 * get the nodes between the two border nodes.
// 	 *
// 	 * It finds the nodes' common ancestor using a naive implementation of a
// 	 * lowest common ancestor algorithm
// 	 * (https://en.wikipedia.org/wiki/Lowest_common_ancestor). Then compares the
// 	 * ancestor's 2 children that are ancestors of nodeA and NodeB so we can
// 	 * compare their indexes to work out which node comes first in a depth first
// 	 * search. (https://en.wikipedia.org/wiki/Depth-first_search)
// 	 *
// 	 * Another way to put it is which node is shallower in a trémaux tree
// 	 * https://en.wikipedia.org/wiki/Tr%C3%A9maux_tree
// 	 */
// 	function findOrderInTremauxTree(
// 		nodeAId: TreeViewItemId,
// 		nodeBId: TreeViewItemId
// 	): [TreeViewItemNode, TreeViewItemNode] {
// 		let nodeA = getNode(nodeAId);
// 		let nodeB = getNode(nodeBId);
// 		if (!nodeA || !nodeB) {
// 			// TODO: Gracefully fail instead of throwing here
// 			throw Error("Something went wrong ordering nodes");
// 		}

// 		if (nodeAId === nodeBId) {
// 			return [nodeA, nodeB];
// 		}

// 		if (nodeA.parentId === nodeB.id || nodeB.parentId === nodeA.id) {
// 			return nodeB.parentId === nodeA.id ? [nodeA, nodeB] : [nodeB, nodeA];
// 		}

// 		let aFamily = [nodeA];
// 		let bFamily = [nodeB];

// 		let aAncestor = getNode(nodeA.parentId);
// 		let bAncestor = getNode(nodeB.parentId);

// 		let aAncestorIsCommon =
// 			bFamily.findIndex((b) => b.id === aAncestor?.id) !== -1;
// 		let bAncestorIsCommon =
// 			aFamily.findIndex((a) => a.id === bAncestor?.id) !== -1;

// 		let continueA = true;
// 		let continueB = true;

// 		while (!bAncestorIsCommon && !aAncestorIsCommon) {
// 			if (continueA) {
// 				aFamily.push(aAncestor!);
// 				let aAncestorId = aAncestor?.id ?? null;
// 				aAncestorIsCommon =
// 					bFamily.findIndex((b) => b.id === aAncestorId) !== -1;
// 				continueA = aAncestorId != null;
// 				if (!aAncestorIsCommon && continueA) {
// 					aAncestor = getNode(aAncestor?.parentId) ?? null;
// 				}
// 			}

// 			if (continueB && !aAncestorIsCommon) {
// 				bFamily.push(bAncestor!);
// 				let bAncestorId = bAncestor?.id ?? null;
// 				bAncestorIsCommon =
// 					aFamily.findIndex((a) => a.id === bAncestorId) !== -1;
// 				continueB = bAncestorId != null;
// 				if (!bAncestorIsCommon && continueB) {
// 					bAncestor = getNode(bAncestor?.parentId) ?? null;
// 				}
// 			}
// 		}

// 		let commonAncestor = aAncestorIsCommon ? aAncestor : bAncestor;
// 		let ancestorFamily = getChildNodes(commonAncestor?.id);

// 		let aSide =
// 			aFamily[aFamily.findIndex((a) => a.id === commonAncestor?.id) - 1];
// 		let bSide =
// 			bFamily[bFamily.findIndex((b) => b.id === commonAncestor?.id) - 1];

// 		return ancestorFamily.findIndex((a) => a.id === aSide?.id) <
// 			ancestorFamily.findIndex((b) => b.id === bSide?.id)
// 			? [nodeA, nodeB]
// 			: [nodeB, nodeA];
// 	}

// 	function getNodesInRange(nodeA: TreeViewItemId, nodeB: TreeViewItemId) {
// 		let [first, last] = findOrderInTremauxTree(nodeA, nodeB);
// 		let nodes = [first];
// 		let current = first;

// 		while (current.id !== last.id) {
// 			current = getNextNode(current.id)!;
// 			nodes.push(current);
// 		}

// 		return nodes;
// 	}

// 	/*
// 	 * Focus Helpers
// 	 */

// 	function focus(
// 		event: React.FocusEvent,
// 		id: TreeViewItemId | null | undefined
// 	) {
// 		if (id != null && event.defaultPrevented) {
// 			setFocusedNodeId(id);
// 		}
// 	}

// 	function focusNextNode(
// 		event: React.FocusEvent,
// 		id: TreeViewItemId | null | undefined
// 	) {
// 		return focus(event, getNextNode(id)?.id);
// 	}
// 	function focusPreviousNode(
// 		event: React.FocusEvent,
// 		id: TreeViewItemId | null | undefined
// 	) {
// 		return focus(event, getPreviousNode(id)?.id);
// 	}
// 	function focusFirstNode(event: React.FocusEvent) {
// 		return focus(event, getFirstNode()?.id);
// 	}
// 	function focusLastNode(event: React.FocusEvent) {
// 		return focus(event, getLastNode()?.id);
// 	}

// 	function focusByFirstCharacter(
// 		event: React.FocusEvent,
// 		id: TreeViewItemId,
// 		char: string
// 	) {
// 		let start;
// 		let index;
// 		let lowercaseChar = char.toLowerCase();

// 		let firstCharIds: TreeViewItemId[] = [];
// 		let firstChars: string[] = [];
// 		// This really only works since the ids are strings
// 		for (let [nodeId, node] of nodeMap.current.entries()) {
// 			let firstChar = node.firstChar;
// 			let visible = node.parentId ? isExpanded(node.parentId) : true;
// 			let shouldBeSkipped = disabledItemsFocusable ? false : isDisabled(nodeId);
// 			if (visible && !shouldBeSkipped) {
// 				firstCharIds.push(nodeId);
// 				firstChars.push(firstChar);
// 			}
// 		}

// 		// Get start index for search based on position of currentItem
// 		start = firstCharIds.indexOf(id) + 1;
// 		if (start >= firstCharIds.length) {
// 			start = 0;
// 		}

// 		// Check remaining slots in the menu
// 		index = findNextFirstChar(firstChars, start, lowercaseChar);

// 		// If not found in remaining slots, check from beginning
// 		if (index === -1) {
// 			index = findNextFirstChar(firstChars, 0, lowercaseChar);
// 		}

// 		// If match was found...
// 		if (index > -1) {
// 			focus(event, firstCharIds[index]);
// 		}
// 	}

// 	/*
// 	 * Expansion Helpers
// 	 */

// 	const toggleExpansion = (event, value = focusedNodeId) => {
// 		let newExpanded;

// 		if (expanded.indexOf(value) !== -1) {
// 			newExpanded = expanded.filter((id) => id !== value);
// 		} else {
// 			newExpanded = [value].concat(expanded);
// 		}

// 		if (onNodeToggle) {
// 			onNodeToggle(event, newExpanded);
// 		}

// 		setExpandedState(newExpanded);
// 	};

// 	const expandAllSiblings = (event, id) => {
// 		const map = nodeMap.current[id];
// 		const siblings = getChildrenIds(map.parentId);

// 		const diff = siblings.filter(
// 			(child) => isExpandable(child) && !isExpanded(child)
// 		);

// 		const newExpanded = expanded.concat(diff);

// 		if (diff.length > 0) {
// 			setExpandedState(newExpanded);

// 			if (onNodeToggle) {
// 				onNodeToggle(event, newExpanded);
// 			}
// 		}
// 	};

// 	/*
// 	 * Selection Helpers
// 	 */

// 	const lastSelectedNode = React.useRef(null);
// 	const lastSelectionWasRange = React.useRef(false);
// 	const currentRangeSelection = React.useRef([]);

// 	const handleRangeArrowSelect = (event, nodes) => {
// 		let base = selected.slice();
// 		const { start, next, current } = nodes;

// 		if (!next || !current) {
// 			return;
// 		}

// 		if (currentRangeSelection.current.indexOf(current) === -1) {
// 			currentRangeSelection.current = [];
// 		}

// 		if (lastSelectionWasRange.current) {
// 			if (currentRangeSelection.current.indexOf(next) !== -1) {
// 				base = base.filter((id) => id === start || id !== current);
// 				currentRangeSelection.current = currentRangeSelection.current.filter(
// 					(id) => id === start || id !== current
// 				);
// 			} else {
// 				base.push(next);
// 				currentRangeSelection.current.push(next);
// 			}
// 		} else {
// 			base.push(next);
// 			currentRangeSelection.current.push(current, next);
// 		}

// 		if (onNodeSelect) {
// 			onNodeSelect(event, base);
// 		}

// 		setSelectedState(base);
// 	};

// 	const handleRangeSelect = (event, nodes) => {
// 		let base = selected.slice();
// 		const { start, end } = nodes;
// 		// If last selection was a range selection ignore nodes that were selected.
// 		if (lastSelectionWasRange.current) {
// 			base = base.filter(
// 				(id) => currentRangeSelection.current.indexOf(id) === -1
// 			);
// 		}

// 		let range = getNodesInRange(start, end);
// 		range = range.filter((node) => !isDisabled(node));
// 		currentRangeSelection.current = range;
// 		let newSelected = base.concat(range);
// 		newSelected = newSelected.filter((id, i) => newSelected.indexOf(id) === i);

// 		if (onNodeSelect) {
// 			onNodeSelect(event, newSelected);
// 		}

// 		setSelectedState(newSelected);
// 	};

// 	const handleMultipleSelect = (event, value) => {
// 		let newSelected;
// 		if (selected.indexOf(value) !== -1) {
// 			newSelected = selected.filter((id) => id !== value);
// 		} else {
// 			newSelected = [value].concat(selected);
// 		}

// 		if (onNodeSelect) {
// 			onNodeSelect(event, newSelected);
// 		}

// 		setSelectedState(newSelected);
// 	};

// 	const handleSingleSelect = (event, value) => {
// 		const newSelected = multiSelect ? [value] : value;

// 		if (onNodeSelect) {
// 			onNodeSelect(event, newSelected);
// 		}

// 		setSelectedState(newSelected);
// 	};

// 	const selectNode = (event, id, multiple = false) => {
// 		if (id) {
// 			if (multiple) {
// 				handleMultipleSelect(event, id);
// 			} else {
// 				handleSingleSelect(event, id);
// 			}
// 			lastSelectedNode.current = id;
// 			lastSelectionWasRange.current = false;
// 			currentRangeSelection.current = [];

// 			return true;
// 		}
// 		return false;
// 	};

// 	const selectRange = (event, nodes, stacked = false) => {
// 		const { start = lastSelectedNode.current, end, current } = nodes;
// 		if (stacked) {
// 			handleRangeArrowSelect(event, { start, next: end, current });
// 		} else if (start != null && end != null) {
// 			handleRangeSelect(event, { start, end });
// 		}
// 		lastSelectionWasRange.current = true;
// 	};

// 	const rangeSelectToFirst = (event, id) => {
// 		if (!lastSelectedNode.current) {
// 			lastSelectedNode.current = id;
// 		}

// 		const start = lastSelectionWasRange.current ? lastSelectedNode.current : id;

// 		selectRange(event, {
// 			start,
// 			end: getFirstNode(),
// 		});
// 	};

// 	const rangeSelectToLast = (event, id) => {
// 		if (!lastSelectedNode.current) {
// 			lastSelectedNode.current = id;
// 		}

// 		const start = lastSelectionWasRange.current ? lastSelectedNode.current : id;

// 		selectRange(event, {
// 			start,
// 			end: getLastNode(),
// 		});
// 	};

// 	const selectNextNode = (event, id) => {
// 		if (!isDisabled(getNextNode(id))) {
// 			selectRange(
// 				event,
// 				{
// 					end: getNextNode(id),
// 					current: id,
// 				},
// 				true
// 			);
// 		}
// 	};

// 	const selectPreviousNode = (event, id) => {
// 		if (!isDisabled(getPreviousNode(id))) {
// 			selectRange(
// 				event,
// 				{
// 					end: getPreviousNode(id),
// 					current: id,
// 				},
// 				true
// 			);
// 		}
// 	};

// 	const selectAllNodes = (event) => {
// 		selectRange(event, { start: getFirstNode(), end: getLastNode() });
// 	};

// 	/*
// 	 * Mapping Helpers
// 	 */
// 	const registerNode = React.useCallback((node) => {
// 		const { id, index, parentId, expandable, idAttribute, disabled } = node;

// 		nodeMap.current[id] = {
// 			id,
// 			index,
// 			parentId,
// 			expandable,
// 			idAttribute,
// 			disabled,
// 		};
// 	}, []);

// 	const unregisterNode = React.useCallback((id) => {
// 		const newMap = { ...nodeMap.current };
// 		delete newMap[id];
// 		nodeMap.current = newMap;

// 		setFocusedNodeId((oldFocusedNodeId) => {
// 			if (
// 				oldFocusedNodeId === id &&
// 				treeRef.current === ownerDocument(treeRef.current).activeElement
// 			) {
// 				return getChildrenIds(null)[0];
// 			}
// 			return oldFocusedNodeId;
// 		});
// 	}, []);

// 	const mapFirstChar = React.useCallback((id, firstChar) => {
// 		firstCharMap.current[id] = firstChar;
// 	}, []);

// 	const unMapFirstChar = React.useCallback((id) => {
// 		const newMap = { ...firstCharMap.current };
// 		delete newMap[id];
// 		firstCharMap.current = newMap;
// 	}, []);

// 	/**
// 	 * Event handlers and Navigation
// 	 */

// 	const handleNextArrow = (event) => {
// 		if (isExpandable(focusedNodeId)) {
// 			if (isExpanded(focusedNodeId)) {
// 				focusNextNode(event, focusedNodeId);
// 			} else if (!isDisabled(focusedNodeId)) {
// 				toggleExpansion(event);
// 			}
// 		}
// 		return true;
// 	};

// 	const handlePreviousArrow = (event) => {
// 		if (isExpanded(focusedNodeId) && !isDisabled(focusedNodeId)) {
// 			toggleExpansion(event, focusedNodeId);
// 			return true;
// 		}

// 		const parent = getParent(focusedNodeId);
// 		if (parent) {
// 			focus(event, parent);
// 			return true;
// 		}
// 		return false;
// 	};

// 	const handleKeyDown = (event) => {
// 		let flag = false;
// 		const key = event.key;

// 		// If the tree is empty there will be no focused node
// 		if (
// 			event.altKey ||
// 			event.currentTarget !== event.target ||
// 			!focusedNodeId
// 		) {
// 			return;
// 		}

// 		const ctrlPressed = event.ctrlKey || event.metaKey;
// 		switch (key) {
// 			case " ":
// 				if (!disableSelection && !isDisabled(focusedNodeId)) {
// 					if (multiSelect && event.shiftKey) {
// 						selectRange(event, { end: focusedNodeId });
// 						flag = true;
// 					} else if (multiSelect) {
// 						flag = selectNode(event, focusedNodeId, true);
// 					} else {
// 						flag = selectNode(event, focusedNodeId);
// 					}
// 				}
// 				event.stopPropagation();
// 				break;
// 			case "Enter":
// 				if (!isDisabled(focusedNodeId)) {
// 					if (isExpandable(focusedNodeId)) {
// 						toggleExpansion(event);
// 						flag = true;
// 					} else if (multiSelect) {
// 						flag = selectNode(event, focusedNodeId, true);
// 					} else {
// 						flag = selectNode(event, focusedNodeId);
// 					}
// 				}
// 				event.stopPropagation();
// 				break;
// 			case "ArrowDown":
// 				if (multiSelect && event.shiftKey && !disableSelection) {
// 					selectNextNode(event, focusedNodeId);
// 				}
// 				focusNextNode(event, focusedNodeId);
// 				flag = true;
// 				break;
// 			case "ArrowUp":
// 				if (multiSelect && event.shiftKey && !disableSelection) {
// 					selectPreviousNode(event, focusedNodeId);
// 				}
// 				focusPreviousNode(event, focusedNodeId);
// 				flag = true;
// 				break;
// 			case "ArrowRight":
// 				if (isRtl) {
// 					flag = handlePreviousArrow(event);
// 				} else {
// 					flag = handleNextArrow(event);
// 				}
// 				break;
// 			case "ArrowLeft":
// 				if (isRtl) {
// 					flag = handleNextArrow(event);
// 				} else {
// 					flag = handlePreviousArrow(event);
// 				}
// 				break;
// 			case "Home":
// 				if (
// 					multiSelect &&
// 					ctrlPressed &&
// 					event.shiftKey &&
// 					!disableSelection &&
// 					!isDisabled(focusedNodeId)
// 				) {
// 					rangeSelectToFirst(event, focusedNodeId);
// 				}
// 				focusFirstNode(event);
// 				flag = true;
// 				break;
// 			case "End":
// 				if (
// 					multiSelect &&
// 					ctrlPressed &&
// 					event.shiftKey &&
// 					!disableSelection &&
// 					!isDisabled(focusedNodeId)
// 				) {
// 					rangeSelectToLast(event, focusedNodeId);
// 				}
// 				focusLastNode(event);
// 				flag = true;
// 				break;
// 			default:
// 				if (key === "*") {
// 					expandAllSiblings(event, focusedNodeId);
// 					flag = true;
// 				} else if (
// 					multiSelect &&
// 					ctrlPressed &&
// 					key.toLowerCase() === "a" &&
// 					!disableSelection
// 				) {
// 					selectAllNodes(event);
// 					flag = true;
// 				} else if (
// 					!ctrlPressed &&
// 					!event.shiftKey &&
// 					isPrintableCharacter(key)
// 				) {
// 					focusByFirstCharacter(event, focusedNodeId, key);
// 					flag = true;
// 				}
// 		}

// 		if (flag) {
// 			event.preventDefault();
// 			event.stopPropagation();
// 		}

// 		if (onKeyDown) {
// 			onKeyDown(event);
// 		}
// 	};

// 	const handleFocus = (event) => {
// 		// if the event bubbled (which is React specific) we don't want to steal focus
// 		if (event.target === event.currentTarget) {
// 			const firstSelected = Array.isArray(selected) ? selected[0] : selected;
// 			focus(event, firstSelected || getNavigableChildrenIds(null)[0]);
// 		}

// 		if (onFocus) {
// 			onFocus(event);
// 		}
// 	};

// 	const handleBlur = (event) => {
// 		setFocusedNodeId(null);

// 		if (onBlur) {
// 			onBlur(event);
// 		}
// 	};
// });

// const useTreeView = createComponentHook<
// 	"ul",
// 	TreeViewProps,
// 	TreeViewContextValue
// >((props) => {
// 	let {
// 		onChange,
// 		readOnly = false,
// 		selectionMode = SELECTION_MODE_MULTIPLE,
// 		selectOnFocus = false,
// 		...domProps
// 	} = props;

// 	let id = useId(props.id);

// 	let onStateChange = useEvent(onChange);

// 	domProps["data-ui-tree-view"] = "";
// 	domProps.role = "tree";

// 	return [
// 		domProps,
// 		{
// 			treeViewId: id,
// 			onStateChange: readOnly ? noop : onStateChange,
// 			readOnly,
// 			selectionMode,
// 			selectOnFocus,
// 		},
// 	];
// });

// const CombinedAccordionProvider: React.FC<
// 	React.PropsWithChildren<{ value: TreeViewContextValue }>
// > = ({ children, value }) => {
// 	return (
// 		<TreeViewProvider value={value}>
// 			<DescendantsProvider>{children}</DescendantsProvider>
// 		</TreeViewProvider>
// 	);
// };
// CombinedAccordionProvider.displayName = "AccordionProvider";

// /**
//  * Accordion
//  *
//  * The wrapper component for all other accordion components. Each accordion
//  * component will consist of accordion items whose buttons are keyboard
//  * navigable using arrow keys.
//  */
// const TreeView = createPolymorphicComponent<"ul", TreeViewProps>((props) => {
// 	let { render, as: Comp = "ul" } = props;
// 	let [domProps, ctx] = useTreeView(props);
// 	return (
// 		<TreeViewProvider value={ctx}>
// 			<DescendantsProvider>
// 				{isFunction(render) ? render(domProps) : <Comp {...domProps} />}
// 			</DescendantsProvider>
// 		</TreeViewProvider>
// 	);
// });
// TreeView.displayName = "Accordion";

// /**
//  * @see Docs https://TODO.com
//  */
// interface TreeViewProps {
// 	/**
// 	 * The callback that is fired when an accordion item's open state is changed.
// 	 *
// 	 * @see Docs https://TODO.com
// 	 */
// 	// onChange?(indices: TreeViewItemIndices): void;

// 	/**
// 	 * Whether or not an uncontrolled tree view is read-only or controllable by a
// 	 * user interaction.
// 	 *
// 	 * Generally speaking you probably want to avoid this, as it can be confusing
// 	 * especially when navigating by keyboard. However, this may be useful if you
// 	 * want to lock a tree under certain conditions (perhaps user authentication
// 	 * is required to access the content). In these instances, you may want to
// 	 * include a live region when a user tries to activate a read-only tree item
// 	 * to let them know why it does not toggle as may be expected.
// 	 *
// 	 * @see Docs https://TODO.com
// 	 */
// 	readOnly?: boolean;

// 	/**
// 	 * **Important:** This only works when selectionMode is set to `"single"`. It has no effect on tree view links.
// 	 */
// 	selectOnFocus?: boolean;

// 	defaultExpanded?: TreeViewItemId | TreeViewItemId[];
// 	defaultSelected?: TreeViewItemId | TreeViewItemId[];
// 	disabledItemsFocusable?: boolean;
// 	disableSelection?: boolean;
// 	expanded?: TreeViewItemId | TreeViewItemId[];
// 	selectionMode?: TreeViewSelectionMode;
// 	selected?: TreeViewItemId | TreeViewItemId[];
// }

// const useTreeViewItem = createComponentHook<
// 	"li",
// 	TreeViewItemProps,
// 	TreeViewItemContextValue
// >((props) => {
// 	let {
// 		disabled = false,
// 		expandable = false,
// 		expanded: expandedProp,
// 		defaultExpanded,
// 		selected: selectedProp,
// 		defaultSelected,
// 		...domProps
// 	} = props;

// 	let [selected, setSelected] = useControlledState({
// 		controlledValue: selectedProp,
// 		defaultValue: defaultSelected || false,
// 		calledFrom: "TreeViewItem",
// 	});

// 	let [expanded, _setExpanded] = useControlledState({
// 		controlledValue: expandedProp,
// 		defaultValue: defaultExpanded || false,
// 		calledFrom: "TreeViewItem",
// 	});

// 	let setExpanded: typeof _setExpanded = React.useCallback(
// 		(s) => (expandable ? _setExpanded(s) : void 0),
// 		[_setExpanded, expandable]
// 	);

// 	let { treeViewId, readOnly } = useTreeViewCtx("TreeViewItem");

// 	let ownRef = React.useRef<HTMLElement | null>(null);
// 	let { index } = useDescendant("TreeViewItem", {
// 		disabled,
// 		isLink: false,
// 		ref: ownRef,
// 		triggerRef: ownRef,
// 	});
// 	let ref = useComposedRefs(ownRef, domProps.ref);

// 	let itemId = makeId(treeViewId, index);
// 	let subTreeId = makeId("subtree", itemId);

// 	const state = expanded ? STATE_EXPANDED : STATE_COLLAPSED;

// 	function select() {
// 		if (readOnly || disabled) {
// 			return;
// 		}
// 		setSelected((s) => !s);
// 		setExpanded((e) => !e);
// 	}

// 	let onKeyDown = useEvent((event: React.KeyboardEvent) => {
// 		switch (event.key) {
// 			case " ":
// 				// TODO: Might need more robust checks here
// 				if (ownRef.current?.tagName.toLowerCase() === "button") {
// 					return;
// 				}
// 				event.preventDefault();
// 				select();
// 				return;
// 			case "Enter":
// 				event.preventDefault();
// 				select();
// 				return;
// 			default:
// 				return;
// 		}
// 	});

// 	domProps.ref = ref;
// 	domProps["data-ui-tree-view-item"] = "";
// 	domProps["data-index"] = index;
// 	domProps["data-expandable"] = expandable ? "" : undefined;
// 	domProps["data-selected"] = selected ? "" : undefined;
// 	domProps["data-disabled"] = disabled ? "" : undefined;
// 	domProps["data-read-only"] = readOnly ? "" : undefined;
// 	if (expandable) {
// 		domProps["data-state"] = state;
// 	}

// 	return [
// 		domProps,
// 		{
// 			triggerId: itemId,
// 			triggerRef: ownRef,
// 			disabled,
// 			index,
// 			itemId,
// 			subTreeId,
// 			state,
// 		},
// 	];
// });

// /**
//  * TreeViewItem
//  *
//  * A selectable item that expands if it has children.
//  *
//  * @see Docs https://TODO.com
//  */
// const TreeViewItem = createPolymorphicComponent<"li", TreeViewItemProps>(
// 	(props) => {
// 		let { render, as: Comp = "li" } = props;
// 		let [domProps, ctx] = useTreeViewItem(props);
// 		return (
// 			<TreeViewItemProvider value={ctx}>
// 				{isFunction(render) ? render(domProps) : <Comp {...domProps} />}
// 			</TreeViewItemProvider>
// 		);
// 	}
// );
// TreeViewItem.displayName = "TreeViewItem";

// /**
//  * @see Docs https://TODO.com
//  */
// interface TreeViewItemProps {
// 	children: React.ReactNode;
// 	/**
// 	 * Whether or not a tree view item is disabled from user interaction.
// 	 *
// 	 * @see Docs https://TODO.com
// 	 */
// 	disabled?: boolean;

// 	expandable?: boolean;
// 	selected?: boolean;
// 	defaultSelected?: boolean;
// 	expanded?: boolean;
// 	defaultExpanded?: boolean;
// }

// ////////////////////////////////////////////////////////////////////////////////

// const useAccordionButton = createComponentHook<"button", AccordionButtonProps>(
// 	(props) => {
// 		// NOTE: This implementation assumes that the calling component always
// 		// renders an HTML button. If this is not the case, the element needs to
// 		// shim the button's functionality, ie. responding to clicks from
// 		// touch/keyboard, setting focus, etc.
// 		let {
// 			onClick,
// 			onKeyDown,
// 			onMouseDown,
// 			onPointerDown,
// 			tabIndex,
// 			ref: forwardedRef,
// 			...domProps
// 		} = props;

// 		let { onStateChange, cycleKeyboardNavigation, keyboardNavigable } =
// 			useTreeViewCtx("AccordionButton");

// 		let {
// 			disabled,
// 			triggerId,
// 			triggerRef: ownRef,
// 			index,
// 			subTreeId,
// 			state,
// 		} = useTreeViewItemCtx("AccordionButton");
// 		let descendants = useDescendants("AccordionButton");

// 		let ref = useComposedRefs(forwardedRef, ownRef);

// 		function handleClick(event: React.MouseEvent) {
// 			event.preventDefault();
// 			if (disabled) {
// 				return;
// 			}
// 			ownRef.current.focus();
// 			onStateChange(index);
// 		}

// 		function shouldFocus(descendant: typeof descendants[number]) {
// 			return !descendant.disabled;
// 		}

// 		function handleKeyDown(event: React.KeyboardEvent) {
// 			let prevKey = "ArrowUp";
// 			let nextKey = "ArrowDown";

// 			if (
// 				event.key === nextKey ||
// 				(event.key === "PageDown" && event.ctrlKey)
// 			) {
// 				event.preventDefault();
// 				let next: typeof descendants[number] | undefined;
// 				if (cycleKeyboardNavigation) {
// 					let focusable: typeof descendants = [];
// 					let currentIndex = -1;
// 					for (let i = 0; i < descendants.length; i++) {
// 						let item = descendants[i]!;
// 						if (item.index === index) {
// 							currentIndex = focusable.length;
// 						}
// 						if (shouldFocus(item)) {
// 							focusable.push(item);
// 						}
// 					}
// 					next = focusable[(currentIndex + 1) % focusable.length];
// 				} else {
// 					next = descendants.find(
// 						(descendant) => shouldFocus(descendant) && descendant.index > index
// 					);
// 				}
// 				next?.triggerRef.current?.focus();
// 				return;
// 			}

// 			if (event.key === prevKey || (event.key === "PageUp" && event.ctrlKey)) {
// 				event.preventDefault();
// 				let next: typeof descendants[number] | undefined;
// 				if (cycleKeyboardNavigation) {
// 					let focusable: typeof descendants = [];
// 					let currentIndex = -1;
// 					for (let i = 0; i < descendants.length; i++) {
// 						let item = descendants[i]!;
// 						if (item.index === index) {
// 							currentIndex = focusable.length;
// 						}
// 						if (shouldFocus(item)) {
// 							focusable.push(item);
// 						}
// 					}
// 					next =
// 						focusable[(currentIndex - 1 + focusable.length) % focusable.length];
// 				} else {
// 					next = findFromEnd(
// 						descendants,
// 						(descendant) => shouldFocus(descendant) && descendant.index < index
// 					);
// 				}
// 				next?.triggerRef.current?.focus();
// 				return;
// 			}

// 			if (event.key === "Home" || event.key === "PageUp") {
// 				event.preventDefault();
// 				let next = descendants.find(shouldFocus);
// 				next?.triggerRef.current?.focus();
// 				return;
// 			}

// 			if (event.key === "End" || event.key === "PageDown") {
// 				event.preventDefault();
// 				let next = findFromEnd(descendants, shouldFocus);
// 				next?.triggerRef.current?.focus();
// 				return;
// 			}
// 		}

// 		return [
// 			{
// 				// Each accordion header `button` is wrapped in an element with role
// 				// `heading` that has a value set for `aria-level` that is appropriate
// 				// for the information architecture of the page.
// 				// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
// 				// I believe this should be left for apps to handle, since headings
// 				// are necessarily context-aware. An app can wrap a button inside any
// 				// arbitrary tag(s).
// 				// TODO: Revisit documentation and examples
// 				// @example
// 				// <div>
// 				//   <h3>
// 				//     <AccordionButton>Click Me</AccordionButton>
// 				//   </h3>
// 				//   <SomeComponent />
// 				// </div>

// 				// The title of each accordion header is contained in an element with
// 				// role `button`. We use an HTML button by default, so we can omit
// 				// this attribute.
// 				// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
// 				// role="button"

// 				// The accordion header `button` element has `aria-controls` set to the
// 				// ID of the element containing the accordion panel content.
// 				// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
// 				"aria-controls": subTreeId,

// 				// If the accordion panel associated with an accordion header is
// 				// visible, the header `button` element has `aria-expanded` set to
// 				// `true`. If the panel is not visible, `aria-expanded` is set to
// 				// `false`.
// 				// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
// 				"aria-expanded": state === STATE_EXPANDED,

// 				tabIndex: disabled ? -1 : tabIndex,

// 				...domProps,

// 				ref,
// 				"data-ui-accordion-button": "",
// 				"data-state": state,

// 				// If the accordion panel associated with an accordion header is
// 				// visible, and if the accordion does not permit the panel to be
// 				// collapsed, the header `button` element has `aria-disabled` set to
// 				// `true`. We can use `disabled` since we opt for an HTML5 `button`
// 				// element.
// 				// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
// 				disabled: disabled || undefined,

// 				id: triggerId,
// 				onClick: composeEventHandlers(onClick, handleClick),
// 				onKeyDown: keyboardNavigable
// 					? composeEventHandlers(onKeyDown, handleKeyDown)
// 					: onKeyDown,
// 			},
// 		];
// 	}
// );

// /**
//  * AccordionButton
//  *
//  * The trigger button a user clicks to interact with an accordion.
//  *
//  * @see Docs https://TODO.com
//  */
// const AccordionButton = createPolymorphicComponent<
// 	"button",
// 	AccordionButtonProps
// >((props) => {
// 	let { render, as: Comp = "button" } = props;
// 	let [domProps] = useAccordionButton(props);
// 	return isFunction(render) ? render(domProps) : <Comp {...domProps} />;
// });
// AccordionButton.displayName = "AccordionButton";

// /**
//  * @see Docs https://TODO.com
//  */
// interface AccordionButtonProps {
// 	/**
// 	 * Typically a text string that serves as a label for the accordion, though
// 	 * nested DOM nodes can be passed as well so long as they are valid children
// 	 * of interactive elements.
// 	 *
// 	 * @see https://github.com/w3c/html-aria/issues/54
// 	 * @see Docs https://TODO.com
// 	 */
// 	children: React.ReactNode;
// }

// ////////////////////////////////////////////////////////////////////////////////

// const useAccordionPanel = createComponentHook<"div", AccordionPanelProps>(
// 	(props) => {
// 		let { disabled, subTreeId, triggerId, state } =
// 			useTreeViewItemCtx("AccordionPanel");
// 		return [
// 			{
// 				hidden: state === STATE_COLLAPSED,

// 				// Optionally, each element that serves as a container for panel content
// 				// has role `region` and `aria-labelledby` with a value that refers to
// 				// the button that controls display of the panel.
// 				// Role `region` is especially helpful to the perception of structure by
// 				// screen reader users when panels contain heading elements or a nested
// 				// accordion.
// 				// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion

// 				// Avoid using the region role in circumstances that create landmark
// 				// region proliferation, e.g., in an accordion that contains more than
// 				// approximately 6 panels that can be expanded at the same time.
// 				// A user can override this with `role="none"` or `role="presentation"`
// 				// TODO: Add to docs
// 				role: "region",

// 				"aria-labelledby": triggerId,

// 				...props,

// 				"data-ui-accordion-panel": "",
// 				"data-disabled": disabled || undefined,
// 				"data-state": state,
// 				id: subTreeId,
// 			},
// 		];
// 	}
// );

// /**
//  * AccordionPanel
//  *
//  * The collapsible panel in which inner content for an accordion item is
//  * rendered.
//  *
//  * @see Docs https://TODO.com
//  */
// const AccordionPanel = createPolymorphicComponent<"div", AccordionPanelProps>(
// 	(props) => {
// 		let { render, as: Comp = "div" } = props;
// 		let [domProps] = useAccordionPanel(props);
// 		return isFunction(render) ? render(domProps) : <Comp {...domProps} />;
// 	}
// );
// AccordionPanel.displayName = "AccordionPanel";

// /**
//  * @see Docs https://TODO.com
//  */
// interface AccordionPanelProps {
// 	/**
// 	 * Inner collapsible content for the accordion item.
// 	 *
// 	 * @see Docs https://TODO.com
// 	 */
// 	children: React.ReactNode;
// }

// ////////////////////////////////////////////////////////////////////////////////

// type TriggerRef = React.MutableRefObject<any>;

// type TreeViewItemIndices = number[];

// interface TreeViewContextValue {
// 	treeViewId: string | null;
// 	onStateChange(index: TreeViewItemIndices): void;
// 	readOnly: boolean;
// 	selectionMode: TreeViewSelectionMode;
// 	selectOnFocus: boolean;
// }

// interface TreeViewItemContextValue {
// 	disabled: boolean;
// 	index: number;
// 	itemId: string;
// 	state: TreeViewItemState;
// 	subTreeId: string;
// 	triggerId: string;
// 	triggerRef: TriggerRef;
// }

// export type {
// 	AccordionButtonProps,
// 	TreeViewContextValue,
// 	TreeViewItemContextValue,
// 	TreeViewItemProps,
// 	AccordionPanelProps,
// 	TreeViewProps,
// };
// export {
// 	TreeView,
// 	AccordionButton,
// 	TreeViewItem,
// 	AccordionPanel,
// 	CombinedAccordionProvider,
// 	TreeViewItemProvider,
// 	useTreeView,
// 	useAccordionButton,
// 	useTreeViewItem,
// 	useAccordionPanel,
// };

// function makeId(...args: (string | number | null | undefined)[]) {
// 	return args.filter((val) => val != null).join("--");
// }
