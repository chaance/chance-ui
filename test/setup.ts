import "@testing-library/jest-dom";
import { vi } from "vitest";
import { toHaveNoViolations } from "jest-axe";

// https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#configuring-your-testing-environment
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.useFakeTimers();
expect.extend(toHaveNoViolations);
