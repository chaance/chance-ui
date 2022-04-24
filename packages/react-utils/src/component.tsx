import { forwardRef } from "react";
import type * as React from "react";
import { hasOwn } from "@chance/utils";

// Most of the types and abstractions here are derived from types in Ariakit.
// https://github.com/ariakit/ariakit/
// MIT License Copyright (c) Diego Haz

// Creating a polymorphic component:
//
// const useCool = createComponentHook<"button", { customProp: number }>(
// 	(props) => {
// 		let { ref, customProp = "whatever", ...rest } = props;
// 		let ctx = {
// 			val1: true,
// 			val2: false,
// 		};
// 		// let myRef = useRef(null);
// 		return [
// 			{
// 				"data-custom": customProp,
// 				ref,
// 				...rest,
// 			},
// 			ctx,
// 		];
// 	}
// );
//
//
// This could be abstracted further to reduce the boilerplate a tiny bit, but I
// want it to still look like a React component so it's easier to read.
//
// const Cool = createPolymorphicComponent<"button", { customProp: number }>(
// 	(props) => {
// 		let { render, as: Comp = "button" } = props;
// 		let [domProps, Provider] = useCool(props);
// 		return typeof render === "function" ? (
// 			render(props)
// 		) : (
// 			<Provider>
// 				<Comp {...domProps} />
// 			</Provider>
// 		);
// 	}
// );
// Cool.displayName = "Cool";

export function createComponentHook<
	DOMType extends As<any>,
	Props extends {} = {}
	// Ctx extends never = never
>(
	useProps: (
		props: PolymorphicProps<Props & AsProps<DOMType>>
	) => [DOMProps: HTMLProps<Props & AsProps<DOMType>>]
): ComponentHook<Props & AsProps<DOMType>>;

export function createComponentHook<
	DOMType extends As<any>,
	Props extends {} = {},
	Ctx = any
>(
	useProps: (
		props: PolymorphicProps<Props & AsProps<DOMType>>
	) => [DOMProps: HTMLProps<Props & AsProps<DOMType>>, ContextType: Ctx]
): ComponentHookWithContext<Props & AsProps<DOMType>, Ctx>;

export function createComponentHook<
	DOMType extends As<any>,
	Props extends {} = {},
	Ctx = any
>(
	useProps: (
		props: PolymorphicProps<Props & AsProps<DOMType>>
	) => [DOMProps: HTMLProps<Props & AsProps<DOMType>>, ContextType?: Ctx]
):
	| ComponentHook<Props & AsProps<DOMType>>
	| ComponentHookWithContext<Props & AsProps<DOMType>, Ctx> {
	type AllProps = Props & AsProps<DOMType>;
	type P = PolymorphicProps<AllProps>;
	function useCompProps(props: P = {} as P) {
		let [htmlProps, ctx] = useProps(props);
		let copy = {} as typeof htmlProps;
		for (let prop in htmlProps) {
			if (hasOwn(htmlProps, prop) && htmlProps[prop] !== undefined) {
				copy[prop] = htmlProps[prop] as any;
			}
		}
		return [copy, ctx];
	}
	return useCompProps as any;
}

export function createPolymorphicComponent<
	DOMType extends As<any>,
	Props extends {} = {}
>(
	render: (
		props: PolymorphicProps<Props & AsProps<DOMType>>
	) => React.ReactNode | null
) {
	return forwardRef(function Component(
		props: PolymorphicProps<Props & AsProps<DOMType>>,
		ref: React.Ref<any>
	) {
		return render({ ref, ...props }) as React.ReactElement;
	}) as unknown as PolymorphicComponent<Props & AsProps<DOMType>>;
}

// Love/hate the `as` prop, but when looking at other options for polymorphic
// components it still feels like the most natural API despite the headaches
// with TypeScript. Thankfully other folks smarter than me have solved the types
// so I don't have to (thanks again Diego for all of your great work!)

type As<Props> = React.ElementType<Props>;
type AsProps<DOMType extends As<any>> = { as?: DOMType };
type RequiredAs<Props extends AsProps<any>> = NonNullable<Props["as"]>;

type HTMLProps<OwnProps extends AsProps<any>> = {
	children?: React.ReactNode;
	render?: (
		props: React.HTMLAttributes<any> & React.RefAttributes<any>
	) => React.ReactNode;
	[index: `data-${string}`]: unknown;
} & Omit<
	React.ComponentPropsWithRef<RequiredAs<OwnProps>>,
	keyof OwnProps | "children"
>;

type PolymorphicProps<OwnProps extends AsProps<any>> = OwnProps &
	HTMLProps<OwnProps>;

type PolymorphicComponent<Props extends AsProps<any>> = {
	<T extends As<any>>(
		props: Omit<Props, "as"> &
			Omit<HTMLProps<AsProps<T>>, keyof Props> &
			Required<AsProps<T>>
	): JSX.Element | null;
	(props: PolymorphicProps<Props>): JSX.Element | null;

	readonly $$typeof: symbol;
	displayName?: string;
	/** don't use propTypes or defaultProps internally! */
};

type ComponentHook<Props extends AsProps<any>> = {
	<DOMType extends As<any> = RequiredAs<Props>>(
		props?: Omit<Props, "as"> &
			Omit<HTMLProps<AsProps<DOMType>>, keyof Props> &
			AsProps<DOMType>
	): [DOMProps: Omit<HTMLProps<AsProps<DOMType>>, "render" | "children">];
	displayName?: string;
};

type ComponentHookWithContext<Props extends AsProps<any>, Ctx> = {
	<DOMType extends As<any> = RequiredAs<Props>>(
		props?: Omit<Props, "as"> &
			Omit<HTMLProps<AsProps<DOMType>>, keyof Props> &
			AsProps<DOMType>
	): [
		DOMProps: Omit<HTMLProps<AsProps<DOMType>>, "render" | "children">,
		ContextType: Ctx
	];
	displayName?: string;
};

export type {
	As,
	AsProps,
	ComponentHook,
	ComponentHookWithContext,
	PolymorphicComponent,
};
