import * as React from "react";
// import { vi } from "vitest";
// import { waitFor, fireEvent } from "@testing-library/react";
import { render } from "@chance/ui-test-utils";
import { createDescendantContext } from "../dist/react-descendants";

function ForceUpdater({
	children,
}: {
	children: (props: { update: React.Dispatch<any> }) => React.ReactElement;
}) {
	let [, update] = React.useReducer((state: any, action: any) => {
		return Object.create(null);
	}, {});
	return children({ update });
}

describe("React Descendants", () => {
	describe("basic context", () => {
		let [DescendantsProvider, , useDescendant] =
			createDescendantContext("List");

		function List({
			children,
			...props
		}: React.ComponentPropsWithoutRef<"ul">) {
			return (
				<ul {...props}>
					<DescendantsProvider>{children}</DescendantsProvider>
				</ul>
			);
		}

		function ListItem({
			children,
			...props
		}: React.ComponentPropsWithoutRef<"li">) {
			let ref = React.useRef<HTMLElement | null>(null);
			let index = useDescendant("ListItem", {
				ref,
			});
			return (
				<li data-index={index} {...props}>
					{children}
				</li>
			);
		}

		it("initially renders -1 index", async () => {
			let { getByText } = render(
				<ForceUpdater>
					{({ update }) => {
						return (
							<div>
								<List>
									<ListItem>One</ListItem>
									<ListItem>Two</ListItem>
									<ListItem>Three</ListItem>
									<ListItem>Four</ListItem>
								</List>
								<button onClick={update}>Update</button>
							</div>
						);
					}}
				</ForceUpdater>
			);

			for (let num of ["One", "Two", "Three", "Four"]) {
				let item = getByText(num);
				expect(item).toHaveAttribute("data-index", "-1");
			}
		});

		it.todo("renders the correct index based on DOM");
		it.todo("renders the correct index after re-order");
	});
});
