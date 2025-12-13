import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Animated } from "react-native";

import ToggleButton from "@/components/Order/ToggleButton";

// ✅ mock heroicon safely (no JSX inside factory)
jest.mock("react-native-heroicons/solid", () => ({
  ChevronUpIcon: () => null,
}));

describe("ToggleButton", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  const mockInstantTiming = () => {
    return jest
      .spyOn(Animated, "timing")
      .mockImplementation((): any => ({ start: (cb?: any) => cb?.() }));
  };

  it("calls onToggle when pressed", () => {
    mockInstantTiming();

    const onToggle = jest.fn();
    const { UNSAFE_getByProps } = render(
      <ToggleButton expanded={false} onToggle={onToggle} />
    );

    // Pressable might be wrapped by css-interop/nativewind, so find it by a stable prop
    const btn = UNSAFE_getByProps({ hitSlop: 8 });

    fireEvent.press(btn);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("animates when expanded changes (toValue 1 then 0)", () => {
    const timingSpy = mockInstantTiming();

    const onToggle = jest.fn();
    const { rerender } = render(
      <ToggleButton expanded={false} onToggle={onToggle} />
    );

    rerender(<ToggleButton expanded={true} onToggle={onToggle} />);
    expect(timingSpy.mock.calls.some((c) => c[1]?.toValue === 1)).toBe(true);

    rerender(<ToggleButton expanded={false} onToggle={onToggle} />);
    expect(timingSpy.mock.calls.some((c) => c[1]?.toValue === 0)).toBe(true);
  });
});
