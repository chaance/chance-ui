import * as React from "react";
import { useId } from "@reach/auto-id";
import { makeId } from "@chance/ui-utils/ids";

function Dialog({ children }: { children: React.ReactNode }) {
	const containerRef = React.useRef<HTMLElement>();
	useFocusLock(containerRef);

	return (
		<div ref={containerRef} tabIndex={-1}>
			{children}
		</div>
	);
}

type DialogOwnProps = {
	id?: string;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
};

const Dialog: React.FC<DialogOwnProps> = (props) => {
	const {
		children,
		id: idProp,
		open: openProp,
		defaultOpen,
		onOpenChange,
	} = props;
	const triggerRef = React.useRef<HTMLButtonElement>(null);
	const generatedId = makeId("dialog", useId());
	const id = idProp || generatedId;
	const [open = false, setOpen] = useControlledState({
		prop: openProp,
		defaultProp: defaultOpen,
		onChange: onOpenChange,
	});
	const context = React.useMemo(() => ({ triggerRef, id, open, setOpen }), [
		id,
		open,
		setOpen,
	]);

	return (
		<DialogContext.Provider value={context}>{children}</DialogContext.Provider>
	);
};
