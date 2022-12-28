import * as React from "react";
import { render as tlRender, fireEvent } from "@testing-library/react";
import type {
	RenderOptions as TLRenderOptions,
	RenderResult as TLRenderResult,
} from "@testing-library/react";

export function render<
	P extends React.HTMLAttributes<T>,
	T extends HTMLElement
>(
	element: React.ReactElement<any>,
	options: RenderOptions = {}
): RenderResult<P, T> {
	let { baseElement, strict = false } = options;
	let result = tlRender(element, {
		baseElement,
		wrapper: strict ? React.StrictMode : React.Fragment,
	}) as unknown as RenderResult<P, T>;

	// These handy functions courtesy of https://github.com/mui-org/material-ui
	result.setProps = function setProps(props: P) {
		result.rerender(React.cloneElement(element, props));
		return result;
	} as any;

	result.forceUpdate = function forceUpdate() {
		result.rerender(
			React.cloneElement(element, {
				"data-force-update": String(Math.random()),
			})
		);
		return result;
	};

	return result;
}

export type RenderOptions = Omit<TLRenderOptions, "queries"> & {
	strict?: boolean;
};

export type RenderResult<
	P extends React.HTMLAttributes<T>,
	T extends HTMLElement
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
> = TLRenderResult<typeof import("@testing-library/react").queries> & {
	setProps(props: P): RenderResult<P, T>;
	forceUpdate(): RenderResult<P, T>;
};

export { fireEvent };
