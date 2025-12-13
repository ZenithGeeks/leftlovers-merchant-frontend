// __tests__/InformationCard.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

import InformationCard from "@/components/Home/InformationCard";

// ✅ keep fonts simple for Jest
jest.mock("@/constants/theme", () => ({
  Fonts: { bold: "bold", medium: "medium", regular: "regular" },
}));

const DummyIcon = (props: any) => (
  <Text testID="dummy-icon">{String(props.color ?? "")}</Text>
);

const findPressableAncestor = (node: any) => {
  let cur = node;
  while (cur) {
    if (typeof cur?.props?.onPress === "function") return cur;
    cur = cur.parent;
  }
  return null;
};

describe("InformationCard", () => {
  it("renders count, label, footer, and icon", () => {
    const { getByText, getByTestId } = render(
      <InformationCard
        icon={DummyIcon}
        count={12}
        label="Orders"
        footer="Last 7 days"
        iconColor="#FF00AA"
      />
    );

    expect(getByText("12")).toBeTruthy();
    expect(getByText("Orders")).toBeTruthy();
    expect(getByText("Last 7 days")).toBeTruthy();

    // icon receives iconColor
    expect(getByTestId("dummy-icon").props.children).toBe("#FF00AA");
  });

  it("shows chevron and calls onPress when provided", () => {
    const onPress = jest.fn();

    const { getByText } = render(
      <InformationCard
        icon={DummyIcon}
        count="5"
        label="Menu items"
        onPress={onPress}
      />
    );

    // chevron exists only when pressable
    const chevron = getByText("›");
    const pressable = findPressableAncestor(chevron);

    expect(pressable).toBeTruthy();

    fireEvent.press(pressable);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not show chevron when onPress is not provided", () => {
    const { getByText, queryByText } = render(
      <InformationCard icon={DummyIcon} count={1} label="Anything" />
    );

    expect(getByText("1")).toBeTruthy();
    expect(getByText("Anything")).toBeTruthy();
    expect(queryByText("›")).toBeNull();
  });
});
