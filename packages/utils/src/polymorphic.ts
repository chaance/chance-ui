import * as React from "react";

export function polymorphicForwardRef<
	Props,
	DefaultComponentType extends As = "div"
>(render: PolymorphicForwardRefRenderFunction<DefaultComponentType, Props>) {
	return React.forwardRef(render) as PolymorphicForwardRefExoticComponent<
		DefaultComponentType,
		Props
	>;
}

export function polymorphicMemo<Props, DefaultComponentType extends As = "div">(
	Component: PolymorphicFunctionComponent<DefaultComponentType, Props>,
	propsAreEqual?: (
		prevProps: Readonly<React.PropsWithChildren<Props>>,
		nextProps: Readonly<React.PropsWithChildren<Props>>
	) => boolean
) {
	return React.memo(Component, propsAreEqual) as PolymorphicMemoExoticComponent<
		DefaultComponentType,
		Props
	>;
}

export type As<BaseProps = any> = React.ElementType<BaseProps>;

export type PolymorphicProps<
	ComponentType extends As,
	ComponentProps
> = ComponentProps &
	Omit<
		React.ComponentPropsWithRef<ComponentType>,
		"as" | keyof ComponentProps
	> & {
		as?: ComponentType;
	};

export type PropsFromAs<
	ComponentType extends As,
	ComponentProps
> = (PolymorphicProps<ComponentType, ComponentProps> & { as: ComponentType }) &
	PolymorphicProps<ComponentType, ComponentProps>;

export interface PolymorphicFunctionComponent<
	DefaultComponentType extends As,
	ComponentProps
> {
	/**
	 * Inherited from React.FunctionComponent with modifications to support `as`
	 */
	<ComponentType extends As>(
		props: PolymorphicProps<ComponentType, ComponentProps>,
		context?: any
	): React.ReactElement<any, any> | null;
	(
		props: PolymorphicProps<DefaultComponentType, ComponentProps>,
		context?: any
	): React.ReactElement<any, any> | null;

	/**
	 * Inherited from React.FunctionComponent
	 */
	displayName?: string;
	propTypes?: React.WeakValidationMap<
		PolymorphicProps<DefaultComponentType, ComponentProps>
	>;
	contextTypes?: React.ValidationMap<any>;
	defaultProps?: Partial<
		PolymorphicProps<DefaultComponentType, ComponentProps>
	>;
}

interface PolymorphicExoticComponent<
	DefaultComponentType extends As,
	ComponentProps
> {
	/**
	 * **NOTE**: Exotic components are not callable.
	 * Inherited from React.ExoticComponent with modifications to support `as`
	 */
	(
		props: PolymorphicProps<DefaultComponentType, ComponentProps>
	): React.ReactElement | null;
	<ComponentType extends As>(
		props: PolymorphicProps<ComponentType, ComponentProps> & {
			as: ComponentType;
		}
	): React.ReactElement | null;

	/**
	 * Inherited from React.ExoticComponent
	 */
	readonly $$typeof: symbol;
}

interface PolymorphicNamedExoticComponent<
	DefaultComponentType extends As,
	ComponentProps
> extends PolymorphicExoticComponent<DefaultComponentType, ComponentProps> {
	/**
	 * Inherited from React.NamedExoticComponent
	 */
	displayName?: string;
}

export interface PolymorphicForwardRefExoticComponent<
	DefaultComponentType extends As,
	ComponentProps
> extends PolymorphicNamedExoticComponent<
		DefaultComponentType,
		ComponentProps
	> {
	/**
	 * Inherited from React.ForwardRefExoticComponent
	 * Will show `ForwardRef(${Component.displayName || Component.name})` in devtools by default,
	 * but can be given its own specific name
	 */
	defaultProps?: Partial<
		PolymorphicProps<DefaultComponentType, ComponentProps>
	>;
	propTypes?: React.WeakValidationMap<
		PolymorphicProps<DefaultComponentType, ComponentProps>
	>;
}

export interface PolymorphicMemoExoticComponent<
	DefaultComponentType extends As,
	ComponentProps
> extends PolymorphicNamedExoticComponent<
		DefaultComponentType,
		ComponentProps
	> {
	readonly type: DefaultComponentType extends React.ComponentType
		? DefaultComponentType
		: PolymorphicFunctionComponent<DefaultComponentType, ComponentProps>;
}

export interface PolymorphicForwardRefRenderFunction<
	DefaultComponentType extends As,
	ComponentProps = {}
> {
	(
		props: React.PropsWithChildren<
			PropsFromAs<DefaultComponentType, ComponentProps>
		>,
		ref:
			| ((
					instance:
						| (DefaultComponentType extends keyof ElementTagNameMap
								? ElementTagNameMap[DefaultComponentType]
								: any)
						| null
			  ) => void)
			| React.MutableRefObject<
					| (DefaultComponentType extends keyof ElementTagNameMap
							? ElementTagNameMap[DefaultComponentType]
							: any)
					| null
			  >
			| null
	): React.ReactElement | null;
	displayName?: string;
	// explicit rejected with `never` required due to
	// https://github.com/microsoft/TypeScript/issues/36826
	/**
	 * defaultProps are not supported on render functions
	 */
	defaultProps?: never;
	/**
	 * propTypes are not supported on render functions
	 */
	propTypes?: never;
}

export type ElementTagNameMap = HTMLElementTagNameMap &
	Pick<
		SVGElementTagNameMap,
		Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>
	>;
