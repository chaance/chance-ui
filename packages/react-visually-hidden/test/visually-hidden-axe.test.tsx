import * as React from "react";
import { vi } from "vitest";
import { render } from "@chance/ui-test-utils/react";
import { axe } from "jest-axe";
import VisuallyHidden from "../dist/react-visually-hidden";

describe("<VisuallyHidden /> with axe", () => {
	it("Should not have ARIA violations", async () => {
		vi.useRealTimers();
		const { container } = render(
			<button onClick={() => void null}>
				<VisuallyHidden>Click Me</VisuallyHidden>
				<span aria-hidden>👏</span>
			</button>
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
