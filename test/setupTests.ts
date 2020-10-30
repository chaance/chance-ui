// import { checkStyles } from "@reach/utils";
import "@testing-library/jest-dom/extend-expect";
import "jest-axe/extend-expect";
import { axe, toHaveNoViolations } from "jest-axe";
import { act } from "react-dom/test-utils";
import { AxeResults } from "./types";

expect.extend({
	/**
	 * Wrapper for axe's `expect.toHaveNoViolations` to simplify individual test
	 * implementation for most cases.
	 *
	 * @param received
	 */
	async toHaveNoAxeViolations(received: Element) {
		const check = toHaveNoViolations.toHaveNoViolations.bind(this);
		let axeResults: AxeResults | null;
		await act(async () => {
			axeResults = await axe(received);
		});
		return check(axeResults!);
	},
});

beforeEach(() => {
	// jest.unmock("@chance/pkg");
	// const pkg = require("@chance/pkg");
	// pkg.funcToMock = jest.fn();
});
