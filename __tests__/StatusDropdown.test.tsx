// __tests__/StatusDropdown.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import * as RN from "react-native";
import type { OpenStatus } from "@/types/types";

// ✅ Prevent nativewind/react-native-css-interop from running in this test file
// (fixes Appearance.getColorScheme crash + _ReactNativeCSSInterop hoist issues)
jest.mock("react-native-css-interop/src/runtime/jsx-runtime", () =>
  require("react/jsx-runtime")
);
jest.mock("react-native-css-interop/src/runtime/jsx-dev-runtime", () =>
  require("react/jsx-dev-runtime")
);

// ✅ Icons
jest.mock("react-native-heroicons/mini", () => ({
  ChevronDownIcon: () => null,
  ChevronUpIcon: () => null,
}));

import ShopStatusDropdown from "@/components/Home/Status-Dropdown";

// Helper: climb up from a Text node to the nearest element that has onPress
function findPressableAncestor(node: any): any {
  let cur = node;
  while (cur && !cur.props?.onPress) cur = cur.parent;
  return cur;
}

describe("ShopStatusDropdown", () => {
  beforeEach(() => {
    // Make sure measureInWindow exists and returns stable coordinates
    (RN.UIManager as any).measureInWindow = jest.fn(
      (_node: any, cb: (x: number, y: number, w: number, h: number) => void) =>
        cb(10, 20, 180, 44)
    );

    // findNodeHandle must return a truthy node id so measureInWindow runs
    jest.spyOn(RN, "findNodeHandle").mockReturnValue(1 as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders selected label", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <ShopStatusDropdown value={"OPEN" as OpenStatus} onChange={onChange} />
    );

    expect(getByText("Open")).toBeTruthy();
  });

  it("opens menu and selecting an option calls onChange and closes menu", () => {
    const onChange = jest.fn();
    const { getByText, queryByText } = render(
      <ShopStatusDropdown value={"CLOSED" as OpenStatus} onChange={onChange} />
    );

    // Open: press the main button by pressing the ancestor that has onPress
    fireEvent.press(findPressableAncestor(getByText("Closed")));

    // Menu visible
    expect(getByText("Open")).toBeTruthy();
    expect(getByText("Busy")).toBeTruthy();

    // Select Busy: press ancestor with onPress
    fireEvent.press(findPressableAncestor(getByText("Busy")));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("BUSY");

    // Menu should close after select
    expect(queryByText("Pause")).toBeNull();
  });

  it("pressing backdrop closes menu", () => {
    const onChange = jest.fn();
    const { getByText, queryByText, UNSAFE_getByProps } = render(
      <ShopStatusDropdown value={"OPEN" as OpenStatus} onChange={onChange} />
    );

    // Open
    fireEvent.press(findPressableAncestor(getByText("Open")));
    expect(getByText("Closed")).toBeTruthy();

    // Backdrop is this exact element in your component:
    // <Pressable className="absolute inset-0" onPress={() => setOpen(false)} />
    const backdrop = UNSAFE_getByProps({ className: "absolute inset-0" });

    fireEvent.press(backdrop);

    expect(queryByText("Closed")).toBeNull();
  });

  it("does nothing when disabled", () => {
    const onChange = jest.fn();
    const { getByText, queryByText } = render(
      <ShopStatusDropdown
        value={"OPEN" as OpenStatus}
        onChange={onChange}
        disabled
      />
    );

    fireEvent.press(findPressableAncestor(getByText("Open")));

    // Menu should not open
    expect(queryByText("Closed")).toBeNull();
  });
});
