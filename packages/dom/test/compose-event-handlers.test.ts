import { describe, it, beforeEach, afterAll, expect, vi } from "vitest";
import { composeEventHandlers } from "../src/dom";

describe("dom/compose-event-handlers", () => {
	let event = new MouseEvent("click", {
		view: window,
		bubbles: true,
		cancelable: true,
	});
	let elem = document.createElement("button");
	let listeners = {
		internal: vi.fn(),
		external: vi.fn(),
	};

	function external() {
		listeners.external();
	}

	function internal() {
		listeners.internal();
	}

	function externalPreventDefaulted(event: MouseEvent) {
		event.preventDefault();
		listeners.external();
	}

	let composed = composeEventHandlers(external, internal);
	let composedWithPreventDefault = composeEventHandlers(
		externalPreventDefaulted,
		internal
	);

	beforeEach(() => {
		listeners.internal = vi.fn();
		listeners.external = vi.fn();
	});

	afterAll(() => {
		elem.parentElement?.removeChild(elem);
	});

	it("calls external handler", () => {
		elem.addEventListener("click", composed);
		elem.dispatchEvent(event);
		expect(listeners.external).toHaveBeenCalledTimes(1);
		elem.removeEventListener("click", composed);
	});

	it("calls internal handler", () => {
		elem.addEventListener("click", composed);
		elem.dispatchEvent(event);
		expect(listeners.internal).toHaveBeenCalledTimes(1);
		elem.removeEventListener("click", composed);
	});

	describe("when external handler calls event.preventDefault", () => {
		it("calls external handler", () => {
			elem.addEventListener("click", composedWithPreventDefault);
			elem.dispatchEvent(event);
			expect(listeners.external).toHaveBeenCalledTimes(1);
			elem.removeEventListener("click", composedWithPreventDefault);
		});

		it("does not call internal handler", () => {
			elem.addEventListener("click", composedWithPreventDefault);
			elem.dispatchEvent(event);
			expect(listeners.internal).not.toHaveBeenCalled();
			elem.removeEventListener("click", composedWithPreventDefault);
		});
	});
});
