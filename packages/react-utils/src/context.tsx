import * as React from "react";

// TODO:
const __DEV__ = true;

type ContextProvider<T> = React.FC<React.PropsWithChildren<{ value: T }>>;

type ChildContext<T extends {}> = T & {
	contextIndex: number;
	parentContext: T | undefined;
};

function createContext<ContextValueType extends {}>(
	rootName: string,
	defaultContext?: ContextValueType | null | undefined
): [
	ContextProvider<ContextValueType>,
	(childName: string) => ChildContext<ContextValueType>
] {
	let Ctx = React.createContext<ChildContext<ContextValueType> | null>(
		defaultContext
			? {
					...defaultContext,
					contextIndex: -1,
					parentContext: undefined,
			  }
			: null
	);

	function Provider(
		props: React.PropsWithChildren<{ value: ContextValueType }>
	) {
		let parentContext = React.useContext(Ctx) || undefined;
		let contextIndex = (parentContext?.contextIndex ?? -1) + 1;
		let { children, value: givenValue } = props;
		let value = React.useMemo(
			() => ({
				...givenValue,
				parentContext,
				contextIndex,
			}),
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[parentContext, contextIndex, ...Object.values(givenValue || {})]
		);
		return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
	}

	function useContext(childName: string): ChildContext<ContextValueType> {
		let context = React.useContext(Ctx);
		if (context) {
			return context;
		}
		if (defaultContext) {
			return {
				...defaultContext,
				contextIndex: -1,
				parentContext: undefined,
			};
		}
		throw Error(
			`${childName} must be rendered inside of a ${rootName} component.`
		);
	}

	if (__DEV__) {
		Ctx.displayName = `${rootName}Context`;
		Provider.displayName = `${rootName}Provider`;
	}

	return [Provider, useContext];
}

export { createContext };
export type { ContextProvider };
