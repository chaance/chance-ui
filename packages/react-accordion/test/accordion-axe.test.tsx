import * as React from "react";
import { vi, describe, expect, it } from "vitest";
import { render, fireEvent } from "@chance/ui-test-utils";
import { axe } from "jest-axe";
import {
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
} from "../dist/react-accordion";

describe("<Accordion /> with axe", () => {
	it("Should not have ARIA violations", async () => {
		vi.useRealTimers();
		let { getByText, container } = render(
			<Accordion data-testid="wrapper">
				<AccordionItem data-testid="item1">
					<AccordionButton>Button One</AccordionButton>
					<AccordionPanel>Panel One</AccordionPanel>
				</AccordionItem>
				<AccordionItem data-testid="item2">
					<AccordionButton>Button Two</AccordionButton>
					<AccordionPanel>Panel Two</AccordionPanel>
				</AccordionItem>
				<AccordionItem data-testid="item3">
					<AccordionButton>Button Three</AccordionButton>
					<AccordionPanel>Panel Three</AccordionPanel>
				</AccordionItem>
			</Accordion>
		);

		let results = await axe(container);

		expect(results).toHaveNoViolations();

		// Toggle to another panel and check again
		fireEvent.click(getByText("Button Two"));
		results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
