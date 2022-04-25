/**
 * Accordion
 *
 * @see Docs     https://TODO.com
 * @see Source   https://github.com/TODO
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
 */

import * as React from "react";
import {
	createContext,
	createComponentHook,
	createPolymorphicComponent,
	useComposedRefs,
	useControlledState,
	useStatefulRefValue,
} from "@chance/react-utils";
import { createDescendantContext } from "@chance/react-descendants";
import { composeEventHandlers } from "@chance/dom";
import { isFunction, findFromEnd } from "@chance/utils";

// TODO:
const noop = () => {};
const useId = (id: string | number | null | undefined) =>
	id != null ? String(id) : "fake-id";

const [DescendantsProvider, useDescendants, useDescendant] =
	createDescendantContext<{
		buttonRef: React.MutableRefObject<HTMLElement | null>;
		disabled: boolean;
	}>("Accordion");

const [AccordionProvider, useAccordionCtx] =
	createContext<AccordionContextValue>("Accordion");
const [AccordionItemProvider, useAccordionItemCtx] =
	createContext<AccordionItemContextValue>("AccordionItem");

const STATE_OPEN = "open";
const STATE_COLLAPSED = "collapsed";
type AccordionState = typeof STATE_OPEN | typeof STATE_COLLAPSED;

const ORIENTATION_VERTICAL = "vertical";
const ORIENTATION_HORIZONTAL = "horizontal";
type Orientation = typeof ORIENTATION_VERTICAL | typeof ORIENTATION_HORIZONTAL;

const useAccordion = createComponentHook<
	"div",
	AccordionProps,
	AccordionContextValue
>((props) => {
	let {
		defaultIndex,
		index: controlledIndex,
		onChange,
		readOnly = false,
		collapsible = false,
		multiple = false,
		keyboardNavigable = true,
		cycleKeyboardNavigation = false,
		orientation = "vertical",
		...domProps
	} = props;

	let id = useId(props.id);

	let [openPanels, setOpenPanels] = useControlledState({
		controlledValue: controlledIndex,
		defaultValue: () => {
			if (defaultIndex != null) {
				// If multiple is set to true, we need to make sure the `defaultIndex`
				// is an array (and vice versa).
				if (multiple) {
					return Array.isArray(defaultIndex) ? defaultIndex : [defaultIndex];
				}
				return Array.isArray(defaultIndex)
					? defaultIndex[0] ?? 0
					: defaultIndex!;
			}

			if (collapsible) {
				// Collapsible accordions with no defaultIndex will start with all
				// panels collapsed.
				return multiple ? [] : -1;
			}

			// Otherwise the first panel will be our default.
			return multiple ? [0] : 0;
		},
		calledFrom: "Tabs",
	});

	let onSelectPanel = React.useCallback(
		(index: number) => {
			onChange && onChange(index);

			setOpenPanels((prevOpenPanels) => {
				/*
				 * If we're dealing with an uncontrolled component, the index arg
				 * in selectChange will always be a number rather than an array.
				 */
				index = index as number;
				// multiple allowed
				if (multiple) {
					// state will always be an array here
					prevOpenPanels = prevOpenPanels as number[];
					if (
						// User is clicking on an already-open button
						prevOpenPanels.includes(index as number)
					) {
						// Other panels are open OR accordion is allowed to collapse
						if (prevOpenPanels.length > 1 || collapsible) {
							// Close the panel by filtering it from the array
							return prevOpenPanels.filter((i) => i !== index);
						}
					} else {
						// Open the panel by adding it to the array.
						return [...prevOpenPanels, index].sort();
					}
				} else {
					prevOpenPanels = prevOpenPanels as number;
					return prevOpenPanels === index && collapsible ? -1 : index;
				}
				return prevOpenPanels;
			});
		},
		[collapsible, multiple, onChange, setOpenPanels]
	);

	domProps["data-ui-accordion"] = "";

	return [
		domProps,
		{
			accordionId: id,
			openPanels,
			onSelectPanel: readOnly ? noop : onSelectPanel,
			readOnly,
			keyboardNavigable,
			cycleKeyboardNavigation,
			orientation,
		},
	];
});

const CombinedAccordionProvider: React.FC<
	React.PropsWithChildren<{ value: AccordionContextValue }>
> = ({ children, value }) => {
	return (
		<AccordionProvider value={value}>
			<DescendantsProvider>{children}</DescendantsProvider>
		</AccordionProvider>
	);
};
CombinedAccordionProvider.displayName = "AccordionProvider";

/**
 * Accordion
 *
 * The wrapper component for all other accordion components. Each accordion
 * component will consist of accordion items whose buttons are keyboard
 * navigable using arrow keys.
 */
const Accordion = createPolymorphicComponent<"div", AccordionProps>((props) => {
	let { render, as: Comp = "div" } = props;
	let [domProps, ctx] = useAccordion(props);
	return (
		<AccordionProvider value={ctx}>
			<DescendantsProvider>
				{isFunction(render) ? render(domProps) : <Comp {...domProps} />}
			</DescendantsProvider>
		</AccordionProvider>
	);
});
Accordion.displayName = "Accordion";

/**
 * @see Docs https://TODO.com
 */
interface AccordionProps {
	/**
	 * Whether or not all panels of an uncontrolled accordion can be toggled
	 * to a closed state. By default, an uncontrolled accordion will have an open
	 * panel at all times, meaning a panel can only be closed if the user opens
	 * another panel. This prop allows the user to collapse all open panels.
	 *
	 * It's important to note that this prop has no impact on controlled
	 * components, since the state of any given accordion panel is managed solely
	 * by the index prop.
	 */
	collapsible?: boolean;
	/**
	 * A default value for the open panel's index or indices in an uncontrolled
	 * accordion component when it is initially rendered.
	 *
	 * @see Docs https://TODO.com
	 */
	defaultIndex?: AccordionIndex;
	/**
	 * The index or array of indices for open accordion panels. The `index` props
	 * should be used along with `onChange` to create controlled accordion
	 * components.
	 *
	 * @see Docs https://TODO.com
	 */
	index?: AccordionIndex;
	/**
	 * The callback that is fired when an accordion item's open state is changed.
	 *
	 * @see Docs https://TODO.com
	 */
	onChange?(index?: number): void;
	/**
	 * Whether or not an uncontrolled accordion is read-only or controllable by a
	 * user interaction.
	 *
	 * Generally speaking you probably want to avoid this, as it can be confusing
	 * especially when navigating by keyboard. However, this may be useful if you
	 * want to lock an accordion under certain conditions (perhaps user
	 * authentication is required to access the content). In these instances, you
	 * may want to include a live region when a user tries to activate a read-only
	 * accordion panel to let them know why it does not toggle as may be expected.
	 *
	 * @see Docs https://TODO.com
	 */
	readOnly?: boolean;
	/**
	 * Whether or not multiple panels in an uncontrolled accordion can be opened
	 * at the same time. By default, when a user opens a new panel, the previously
	 * opened panel will close. This prop prevents that behavior.
	 *
	 * It's important to note that this prop has no impact on controlled
	 * components, since the state of any given accordion panel is managed solely
	 * by the index prop.
	 */
	multiple?: boolean;
	/**
	 * Whether or not a user can move focus to the next accordion item by pressing
	 * directional keys. WAI-ARIA Authoring Practices 1.2 specifies that this
	 * behavior is optional and context-dependent. This is `true` by default.
	 */
	keyboardNavigable?: boolean;
	/**
	 * When navigating accordion item buttons by keyboard, this prop determines if
	 * the focus should reset bavk to the first or last focusable button when the
	 * current focus is on the last or first button respectively. This is `false`
	 * by default, so keyboard navigation will stop at either edge of the
	 * accordion.
	 *
	 * If keyboardNavigable is `false`, this prop has no effect.
	 */
	cycleKeyboardNavigation?: boolean;
	/**
	 * The visual orientation of the accordion items. The orientation is
	 * "horizontal" when items are stacked from left-to-right (or right-to-left if
	 * the `rtl` prop is used), and "vertical" when items are stacked from
	 * top-to-bottom. This is "vertical" by default.
	 *
	 * The orientation is based purely on the visual orientation of the items and
	 * by itself does not alter the experience with screen readers, as the
	 * accordion does not use a role that supports `aria-orientation`. It does,
	 * however, change how focus is moved with the arrow keys when
	 * `keyboardNavigable` is true. It is recommended to add this context either
	 * via a visually-hidden description element with `aria-describedby` or a live
	 * region announcement when an item is focused.
	 */
	orientation?: Orientation;
}

const useAccordionItem = createComponentHook<
	"div",
	AccordionItemProps,
	AccordionItemContextValue
>((props) => {
	let { disabled = false, index: indexProp, ...domProps } = props;

	let { accordionId, openPanels, readOnly } = useAccordionCtx("AccordionItem");
	let buttonRef: ButtonRef = React.useRef(null);

	// TODO: Hmmmmmmmmmm
	let [, handleButtonRefSet] = useStatefulRefValue<HTMLElement | null>(
		buttonRef,
		null
	);

	// TODO
	let ownRef = React.useRef<HTMLElement | null>(null);
	let index = useDescendant("AccordionItem", {
		ref: ownRef,
		disabled,
		buttonRef,
	});
	let ref = useComposedRefs(ownRef, domProps.ref);

	// We need unique IDs for the panel and button to point to one another
	let itemId = makeId(accordionId, index);
	let panelId = makeId("panel", itemId);
	let buttonId = makeId("button", itemId);

	const state =
		(Array.isArray(openPanels)
			? openPanels.includes(index) && STATE_OPEN
			: openPanels === index && STATE_OPEN) || STATE_COLLAPSED;

	domProps.ref = ref;
	domProps["data-ui-accordion-item"] = "";
	domProps["data-state"] = state;
	domProps["data-disabled"] = disabled ? "" : undefined;
	domProps["data-read-only"] = readOnly ? "" : undefined;

	return [
		domProps,
		{
			buttonId,
			buttonRef,
			disabled,
			handleButtonRefSet,
			index,
			itemId,
			panelId,
			state,
		},
	];
});

/**
 * AccordionItem
 *
 * A group that wraps a an accordion's button and panel components.
 *
 * @see Docs https://TODO.com
 */
const AccordionItem = createPolymorphicComponent<"div", AccordionItemProps>(
	(props) => {
		let { render, as: Comp = "div" } = props;
		let [domProps, ctx] = useAccordionItem(props);
		return (
			<AccordionItemProvider value={ctx}>
				{isFunction(render) ? render(domProps) : <Comp {...domProps} />}
			</AccordionItemProvider>
		);
	}
);
AccordionItem.displayName = "AccordionItem";

/**
 * @see Docs https://TODO.com
 */
interface AccordionItemProps {
	/**
	 * An `AccordionItem` expects to receive an `AccordionButton` and
	 * `AccordionPanel` components as its children, though you can also nest other
	 * components within an `AccordionItem` if you want some persistant content
	 * that is relevant to the section but not collapsible when the
	 * `AccordionButton` is toggled.
	 *
	 * @see Docs https://TODO.com
	 */
	children: React.ReactNode;
	/**
	 * Whether or not an accordion panel is disabled from user interaction.
	 *
	 * @see Docs https://TODO.com
	 */
	disabled?: boolean;
	/**
	 * TODO: Document this!
	 */
	index?: number;
}

////////////////////////////////////////////////////////////////////////////////

const useAccordionButton = createComponentHook<"button", AccordionButtonProps>(
	(props) => {
		// NOTE: This implementation assumes that the calling component always
		// renders an HTML button. If this is not the case, the element needs to
		// shim the button's functionality, ie. responding to clicks from
		// touch/keyboard, setting focus, etc.
		let {
			onClick,
			onKeyDown,
			onMouseDown,
			onPointerDown,
			tabIndex,
			ref: forwardedRef,
			...domProps
		} = props;

		let {
			onSelectPanel,
			cycleKeyboardNavigation,
			keyboardNavigable,
			orientation,
		} = useAccordionCtx("AccordionButton");

		let {
			disabled,
			buttonId,
			buttonRef: ownRef,
			handleButtonRefSet,
			index,
			panelId,
			state,
		} = useAccordionItemCtx("AccordionButton");
		let descendants = useDescendants("AccordionButton");

		let ref = useComposedRefs(forwardedRef, handleButtonRefSet);

		function handleClick(event: React.MouseEvent) {
			event.preventDefault();
			if (disabled) {
				return;
			}
			ownRef.current.focus();
			onSelectPanel(index);
		}

		function shouldFocus(descendant: typeof descendants[number]) {
			return !descendant.disabled;
		}

		function handleKeyDown(event: React.KeyboardEvent) {
			let prevKey =
				orientation === ORIENTATION_VERTICAL ? "ArrowUp" : "ArrowLeft";
			let nextKey =
				orientation === ORIENTATION_VERTICAL ? "ArrowDown" : "ArrowRight";

			if (
				event.key === nextKey ||
				(event.key === "PageDown" && event.ctrlKey)
			) {
				event.preventDefault();
				let next: typeof descendants[number] | undefined;
				if (cycleKeyboardNavigation) {
					let focusable: typeof descendants = [];
					let currentIndex = -1;
					for (let i = 0; i < descendants.length; i++) {
						let item = descendants[i]!;
						if (item.index === index) {
							currentIndex = focusable.length;
						}
						if (shouldFocus(item)) {
							focusable.push(item);
						}
					}
					next = focusable[(currentIndex + 1) % focusable.length];
				} else {
					next = descendants.find(
						(descendant) => shouldFocus(descendant) && descendant.index > index
					);
				}
				next?.buttonRef.current?.focus();
				return;
			}

			if (event.key === prevKey || (event.key === "PageUp" && event.ctrlKey)) {
				event.preventDefault();
				let next: typeof descendants[number] | undefined;
				if (cycleKeyboardNavigation) {
					let focusable: typeof descendants = [];
					let currentIndex = -1;
					for (let i = 0; i < descendants.length; i++) {
						let item = descendants[i]!;
						if (item.index === index) {
							currentIndex = focusable.length;
						}
						if (shouldFocus(item)) {
							focusable.push(item);
						}
					}
					next =
						focusable[(currentIndex - 1 + focusable.length) % focusable.length];
				} else {
					next = findFromEnd(
						descendants,
						(descendant) => shouldFocus(descendant) && descendant.index < index
					);
				}
				next?.buttonRef.current?.focus();
				return;
			}

			if (event.key === "Home" || event.key === "PageUp") {
				event.preventDefault();
				let next = descendants.find(shouldFocus);
				next?.buttonRef.current?.focus();
				return;
			}

			if (event.key === "End" || event.key === "PageDown") {
				event.preventDefault();
				let next = findFromEnd(descendants, shouldFocus);
				next?.buttonRef.current?.focus();
				return;
			}
		}

		return [
			{
				// Each accordion header `button` is wrapped in an element with role
				// `heading` that has a value set for `aria-level` that is appropriate
				// for the information architecture of the page.
				// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
				// I believe this should be left for apps to handle, since headings
				// are necessarily context-aware. An app can wrap a button inside any
				// arbitrary tag(s).
				// TODO: Revisit documentation and examples
				// @example
				// <div>
				//   <h3>
				//     <AccordionButton>Click Me</AccordionButton>
				//   </h3>
				//   <SomeComponent />
				// </div>

				// The title of each accordion header is contained in an element with
				// role `button`. We use an HTML button by default, so we can omit
				// this attribute.
				// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
				// role="button"

				// The accordion header `button` element has `aria-controls` set to the
				// ID of the element containing the accordion panel content.
				// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
				"aria-controls": panelId,

				// If the accordion panel associated with an accordion header is
				// visible, the header `button` element has `aria-expanded` set to
				// `true`. If the panel is not visible, `aria-expanded` is set to
				// `false`.
				// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
				"aria-expanded": state === STATE_OPEN,

				tabIndex: disabled ? -1 : tabIndex,

				...domProps,

				ref,
				"data-ui-accordion-button": "",
				"data-state": state,

				// If the accordion panel associated with an accordion header is
				// visible, and if the accordion does not permit the panel to be
				// collapsed, the header `button` element has `aria-disabled` set to
				// `true`. We can use `disabled` since we opt for an HTML5 `button`
				// element.
				// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion
				disabled: disabled || undefined,

				id: buttonId,
				onClick: composeEventHandlers(onClick, handleClick),
				onKeyDown: keyboardNavigable
					? composeEventHandlers(onKeyDown, handleKeyDown)
					: onKeyDown,
			},
		];
	}
);

/**
 * AccordionButton
 *
 * The trigger button a user clicks to interact with an accordion.
 *
 * @see Docs https://TODO.com
 */
const AccordionButton = createPolymorphicComponent<
	"button",
	AccordionButtonProps
>((props) => {
	let { render, as: Comp = "button" } = props;
	let [domProps] = useAccordionButton(props);
	return isFunction(render) ? render(domProps) : <Comp {...domProps} />;
});
AccordionButton.displayName = "AccordionButton";

/**
 * @see Docs https://TODO.com
 */
interface AccordionButtonProps {
	/**
	 * Typically a text string that serves as a label for the accordion, though
	 * nested DOM nodes can be passed as well so long as they are valid children
	 * of interactive elements.
	 *
	 * @see https://github.com/w3c/html-aria/issues/54
	 * @see Docs https://TODO.com
	 */
	children: React.ReactNode;
}

////////////////////////////////////////////////////////////////////////////////

const useAccordionPanel = createComponentHook<"div", AccordionPanelProps>(
	(props) => {
		let { disabled, panelId, buttonId, state } =
			useAccordionItemCtx("AccordionPanel");
		return [
			{
				hidden: state === STATE_COLLAPSED,

				// Optionally, each element that serves as a container for panel content
				// has role `region` and `aria-labelledby` with a value that refers to
				// the button that controls display of the panel.
				// Role `region` is especially helpful to the perception of structure by
				// screen reader users when panels contain heading elements or a nested
				// accordion.
				// https://www.w3.org/TR/wai-aria-practices-1.2/#accordion

				// Avoid using the region role in circumstances that create landmark
				// region proliferation, e.g., in an accordion that contains more than
				// approximately 6 panels that can be expanded at the same time.
				// A user can override this with `role="none"` or `role="presentation"`
				// TODO: Add to docs
				role: "region",

				"aria-labelledby": buttonId,

				...props,

				"data-ui-accordion-panel": "",
				"data-disabled": disabled || undefined,
				"data-state": state,
				id: panelId,
			},
		];
	}
);

/**
 * AccordionPanel
 *
 * The collapsible panel in which inner content for an accordion item is
 * rendered.
 *
 * @see Docs https://TODO.com
 */
const AccordionPanel = createPolymorphicComponent<"div", AccordionPanelProps>(
	(props) => {
		let { render, as: Comp = "div" } = props;
		let [domProps] = useAccordionPanel(props);
		return isFunction(render) ? render(domProps) : <Comp {...domProps} />;
	}
);
AccordionPanel.displayName = "AccordionPanel";

/**
 * @see Docs https://TODO.com
 */
interface AccordionPanelProps {
	/**
	 * Inner collapsible content for the accordion item.
	 *
	 * @see Docs https://TODO.com
	 */
	children: React.ReactNode;
}

////////////////////////////////////////////////////////////////////////////////

type ButtonRef = React.MutableRefObject<any>;

type AccordionIndex = number | number[];

interface AccordionContextValue {
	accordionId: string | undefined;
	openPanels: AccordionIndex;
	onSelectPanel(index: AccordionIndex): void;
	readOnly: boolean;
	keyboardNavigable: boolean;
	cycleKeyboardNavigation: boolean;
	orientation: Orientation;
}

interface AccordionItemContextValue {
	disabled: boolean;
	buttonId: string;
	index: number;
	itemId: string;
	handleButtonRefSet(refValue: HTMLElement): void;
	buttonRef: ButtonRef;
	panelId: string;
	state: AccordionState;
}

export type {
	AccordionButtonProps,
	AccordionContextValue,
	AccordionItemContextValue,
	AccordionItemProps,
	AccordionPanelProps,
	AccordionProps,
};
export {
	Accordion,
	AccordionButton,
	AccordionItem,
	AccordionPanel,
	CombinedAccordionProvider as AccordionProvider,
	AccordionItemProvider,
	useAccordion,
	useAccordionButton,
	useAccordionItem,
	useAccordionPanel,
};

function makeId(...args: (string | number | null | undefined)[]) {
	return args.filter((val) => val != null).join("--");
}
