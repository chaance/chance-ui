import * as React from "react";
import { render } from "@chance/ui-test-utils/react";
import VisuallyHidden from "../dist/react-visually-hidden";

describe("<VisuallyHidden />", () => {
	describe("rendering", () => {
		it("renders as any HTML element", async () => {
			const hiddenMessage = "Hidden Message";
			const { getByText } = render(
				<VisuallyHidden as="div">{hiddenMessage}</VisuallyHidden>
			);
			let visuallyHidden = getByText(hiddenMessage);
			expect(visuallyHidden.tagName).toBe("DIV");
		});
	});
});
