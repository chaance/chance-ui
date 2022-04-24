import * as React from "react";

// TODO:
const __DEV__ = true;

type ContextProvider<T> = React.FC<React.PropsWithChildren<{ value: T }>>;

function createContext<ContextValueType extends object | null>(
	rootName: string,
	defaultContext?: ContextValueType
): [
	ContextProvider<ContextValueType>,
	(childName: string) => ContextValueType
] {
	let Ctx = React.createContext<ContextValueType | undefined>(defaultContext);

	function Provider(
		props: React.PropsWithChildren<{ value: ContextValueType }>
	) {
		let { children, value: givenValue } = props;
		let value = React.useMemo(
			() => givenValue,
			// eslint-disable-next-line react-hooks/exhaustive-deps
			Object.values(givenValue || [])
		) as ContextValueType;
		return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
	}

	function useContext(childName: string) {
		let context = React.useContext(Ctx);
		if (context) {
			return context;
		}
		if (defaultContext) {
			return defaultContext;
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
