// __tests__/Row.test.tsx
import React from "react";
import { Text } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import Row from "@/components/store/Row";

// Avoid svg / native issues in Jest
jest.mock("react-native-heroicons/outline", () => ({
  __esModule: true,
  ChevronRightIcon: () => null,
}));

describe("Row", () => {
  it("renders title and icon", () => {
    const { getByText } = render(
      <Row icon={<Text>ICON</Text>} title="Business hours" />
    );

    expect(getByText("ICON")).toBeTruthy();
    expect(getByText("Business hours")).toBeTruthy();
  });

  it("renders subtitle only when provided", () => {
    const { getByText, queryByText, rerender } = render(
      <Row icon={<Text>ICON</Text>} title="Title" subtitle="Sub" />
    );

    expect(getByText("Sub")).toBeTruthy();

    rerender(<Row icon={<Text>ICON</Text>} title="Title" />);
    expect(queryByText("Sub")).toBeNull();
  });

  it("calls onPress when provided", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Row icon={<Text>ICON</Text>} title="Go" onPress={onPress} />
    );

    fireEvent.press(getByText("Go"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not crash when onPress is missing", () => {
    const { getByText } = render(
      <Row icon={<Text>ICON</Text>} title="Static Row" />
    );

    fireEvent.press(getByText("Static Row"));
    // no assertion needed: just ensure no throw
    expect(getByText("Static Row")).toBeTruthy();
  });

  it("renders rightSlot when provided", () => {
    const { getByText, queryByText } = render(
      <Row
        icon={<Text>ICON</Text>}
        title="Row"
        onPress={() => {}}
        rightSlot={<Text>RIGHT</Text>}
      />
    );

    expect(getByText("RIGHT")).toBeTruthy();
    // ChevronRightIcon is mocked to null; this mainly ensures rightSlot is present
    expect(queryByText("Row")).toBeTruthy();
  });
});
