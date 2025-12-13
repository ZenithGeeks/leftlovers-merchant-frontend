import { InputBox } from "@/components/Authen/InputBox"; // ✅ ปรับ path ให้ตรงโปรเจกต์
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { TextInput } from "react-native";

describe("InputBox", () => {
  it("renders label", () => {
    const { getByText } = render(
      <InputBox label="Email" value="" onChangeText={() => {}} />
    );

    expect(getByText("Email")).toBeTruthy();
  });

  it("renders errorText when provided", () => {
    const { getByText } = render(
      <InputBox
        label="Email"
        value=""
        onChangeText={() => {}}
        errorText="Email is required"
      />
    );

    expect(getByText("Email is required")).toBeTruthy();
  });

  it("does not render errorText when not provided", () => {
    const { queryByText } = render(
      <InputBox label="Email" value="" onChangeText={() => {}} />
    );

    expect(queryByText("Email is required")).toBeNull();
  });

  it("calls onChangeText when typing", () => {
    const onChangeText = jest.fn();

    const { UNSAFE_getByType } = render(
      <InputBox label="Email" value="" onChangeText={onChangeText} />
    );

    const input = UNSAFE_getByType(TextInput);
    fireEvent.changeText(input, "test@example.com");

    expect(onChangeText).toHaveBeenCalledWith("test@example.com");
  });

  it("applies containerTop to outer container marginTop", () => {
    const { UNSAFE_getByType } = render(
      <InputBox label="Email" value="" onChangeText={() => {}} containerTop={40} />
    );

    // Outer container is first View in component tree
    const container = UNSAFE_getByType(require("react-native").View);
    expect(container.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ marginTop: 40 })])
    );
  });

  it("applies labelBottom to label Text marginBottom", () => {
    const { getByText } = render(
      <InputBox label="Email" value="" onChangeText={() => {}} labelBottom={20} />
    );

    const labelNode = getByText("Email");
    expect(labelNode.props.style).toEqual(expect.objectContaining({ marginBottom: 20 }));
  });
});
