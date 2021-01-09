import * as React from "react";
import { useId } from "@reach/auto-id";
import { useFocusLock } from "@chance/focus-layers/use-focus-lock";
import { makeId } from "@chance/ui-utils/ids";
import { polymorphicForwardRef } from "@chance/ui-utils/polymorphic";
import { composeEvents } from "@chance/ui-utils/events";
import { useComposedRefs } from "@chance/ui-utils/refs";

interface DialogContextValue {
	id: string;
	isOpen: boolean;
}

const DialogContext = React.createContext<DialogContextValue>({
	id: "",
	isOpen: false,
});
if (__DEV__) {
	DialogContext.displayName = "DialogContext";
}

interface DialogOwnProps {
	id?: string;
	isOpen: boolean;
}

const Dialog: React.FC<DialogOwnProps> = (props) => {
	const { children, id: idProp, isOpen } = props;
	const generatedId = makeId("dialog", useId());
	const id = idProp || generatedId;
	const context = React.useMemo(() => ({ id, isOpen }), [id, isOpen]);
	return (
		<DialogContext.Provider value={context}>{children}</DialogContext.Provider>
	);
};

type DialogOverlayProps = {
	/**
	 * Accepts any renderable content.
	 */
	children?: React.ReactNode;
	/**
	 * By default the dialog locks the focus inside it. Normally this is what you
	 * want. This prop is provided so that this feature can be disabled. This,
	 * however, is strongly discouraged.
	 *
	 * The reason it is provided is not to disable the focus lock entirely.
	 * Rather, there are certain situations where you may need more control on how
	 * the focus lock works. This should be complemented by setting up a focus
	 * lock yourself that would allow more flexibility for your specific use case.
	 *
	 * If you do set this prop to `true`, make sure you set up your own mechanism
	 * for managing focus when the dialog is open.
	 */
	dangerouslyBypassFocusLock?: boolean;
	/**
	 * This function is called whenever the user hits "Escape" or clicks outside
	 * the dialog. _It's important to close the dialog `onDismiss`_.
	 *
	 * The only time you shouldn't close the dialog on dismiss is when the dialog
	 * requires a choice and none of them are "cancel". For example, perhaps two
	 * records need to be merged and the user needs to pick the surviving record.
	 * Neither choice is less destructive than the other, so in these cases you
	 * may want to alert the user they need to a make a choice on dismiss instead
	 * of closing the dialog.
	 */
	onDismiss?: (event?: React.SyntheticEvent) => void;
};

const DEFAULT_OVERLAY_ELEMENT = "div";

const DialogOverlay = polymorphicForwardRef<
	DialogOverlayProps,
	typeof DEFAULT_OVERLAY_ELEMENT
>((props, forwardedRef) => {
	const { isOpen } = React.useContext(DialogContext);
	useDisableTooltipsOnImmediateFocus(isOpen);
	return isOpen ? <DialogInner {...props} ref={forwardedRef} /> : null;
});

if (__DEV__) {
	DialogOverlay.displayName = "DialogOverlay";
}

const DialogInner = polymorphicForwardRef<
	DialogOverlayProps,
	typeof DEFAULT_OVERLAY_ELEMENT
>(
	(
		{
			as: Comp = DEFAULT_OVERLAY_ELEMENT,
			dangerouslyBypassFocusLock = false,
			// initialFocusRef,
			onClick,
			onDismiss = noop,
			onKeyDown,
			onMouseDown,
			// unstable_lockFocusAcrossFrames = true,
			...props
		},
		forwardedRef
	) => {
		const ownRef = React.useRef<HTMLDivElement>(null);
		const ref = useComposedRefs(forwardedRef, ownRef);
		const mouseDownTarget = React.useRef<EventTarget | null>(null);

		useFocusLock(ownRef, { disabled: dangerouslyBypassFocusLock });

		// TODO:
		// const activateFocusLock = React.useCallback(() => {
		// 	if (initialFocusRef && initialFocusRef.current) {
		// 		initialFocusRef.current.focus();
		// 	}
		// }, [initialFocusRef]);

		function handleClick(event: React.MouseEvent) {
			if (mouseDownTarget.current === event.target) {
				event.stopPropagation();
				onDismiss(event);
			}
		}

		function handleKeyDown(event: React.KeyboardEvent) {
			if (event.key === "Escape") {
				event.stopPropagation();
				onDismiss(event);
			}
		}

		function handleMouseDown(event: React.MouseEvent) {
			mouseDownTarget.current = event.target;
		}

		// TODO:
		// React.useEffect(() => {
		// 	return ownRef.current ? createAriaHider(ownRef.current) : void null;
		// }, []);

		return (
			<Comp
				{...props}
				ref={ref}
				/*
				 * We can ignore the `no-static-element-interactions` warning here
				 * because our overlay is only designed to capture any outside
				 * clicks, not to serve as a clickable element itself.
				 */
				onClick={composeEvents(onClick, handleClick)}
				onKeyDown={composeEvents(onKeyDown, handleKeyDown)}
				onMouseDown={composeEvents(onMouseDown, handleMouseDown)}
			/>
		);
	}
);

if (__DEV__) {
	DialogInner.displayName = "DialogInner";
}

const CONTENT_DEFAULT_TAG = "div";

/**
 * DialogContent
 *
 * Low-level component if you need more control over the styles or rendering of
 * the dialog content.
 *
 * Note: Must be a child of `DialogOverlay`.
 *
 * Note: You only need to use this when you are also styling `DialogOverlay`,
 * otherwise you can use the high-level `Dialog` component and pass the props
 * to it. Any props passed to `Dialog` component (besides `isOpen` and
 * `onDismiss`) will be spread onto `DialogContent`.
 */
const DialogContent = polymorphicForwardRef<
	DialogContentProps,
	typeof CONTENT_DEFAULT_TAG
>(function DialogContent(
	{ as: Comp = CONTENT_DEFAULT_TAG, onClick, onKeyDown, ...props },
	forwardedRef
) {
	return (
		<Comp
			aria-modal="true"
			role="dialog"
			tabIndex={-1}
			{...props}
			ref={forwardedRef}
			onClick={composeEvents(onClick, (event) => {
				event.stopPropagation();
			})}
		/>
	);
});

if (__DEV__) {
	DialogContent.displayName = "DialogContent";
}

interface DialogContentProps {
	/**
	 * Accepts any renderable content.
	 */
	children?: React.ReactNode;
}

export { Dialog, DialogOverlay, DialogContent };

/* ------------------------------------------------------------------------- */

function noop() {}

function useDisableTooltipsOnImmediateFocus(shouldDisable: boolean) {
	// We want to ignore the immediate focus of a tooltip so it doesn't pop
	// up again when the menu closes, only pops up when focus returns again
	// to the tooltip (like native OS tooltips).
	React.useEffect(() => {
		if (shouldDisable) {
			// @ts-ignore
			window.__CHANCE_DISABLE_TOOLTIPS = true;
		} else {
			window.requestAnimationFrame(() => {
				// Wait a frame so that this doesn't fire before tooltip does
				// @ts-ignore
				window.__CHANCE_DISABLE_TOOLTIPS = false;
			});
		}
	}, [shouldDisable]);
}
