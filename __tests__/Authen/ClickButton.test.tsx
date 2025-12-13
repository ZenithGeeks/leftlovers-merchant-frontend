import { ClickButton } from "@/components/Authen/ClickButton"; // ✅ ปรับ path ให้ตรงโปรเจกต์
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

describe("ClickButton", () => {
  it("renders label when not loading", () => {
    const { getByText } = render(<ClickButton label="Submit" onPress={() => {}} />);
    expect(getByText("Submit")).toBeTruthy();
  });

  it("shows Loading… when loading=true", () => {
    const { getByText, queryByText } = render(
      <ClickButton label="Submit" loading onPress={() => {}} />
    );

    expect(getByText("Loading…")).toBeTruthy();
    expect(queryByText("Submit")).toBeNull();
  });

  it("calls onPress when enabled", () => {
    const onPress = jest.fn();
    const { getByText } = render(<ClickButton label="Submit" onPress={onPress} />);

    fireEvent.press(getByText("Submit"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled=true", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ClickButton label="Submit" disabled onPress={onPress} />
    );

    fireEvent.press(getByText("Submit"));
    expect(onPress).toHaveBeenCalledTimes(0);
  });

  it("does not call onPress when loading=true", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ClickButton label="Submit" loading onPress={onPress} />
    );

    fireEvent.press(getByText("Loading…"));
    expect(onPress).toHaveBeenCalledTimes(0);
  });
});
