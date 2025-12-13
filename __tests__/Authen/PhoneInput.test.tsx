import { PhoneInput } from "@/components/Authen/PhoneInput";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

describe("PhoneInput", () => {
  it("renders country code +66", () => {
    const { getByText } = render(
      <PhoneInput localPhone="" onChangeLocal={() => {}} />
    );
    expect(getByText("+66")).toBeTruthy();
  });

  it("formats displayed value as xx-xxx-xxxx", () => {
    const { getByLabelText } = render(
      <PhoneInput localPhone="123456789" onChangeLocal={() => {}} />
    );

    const input = getByLabelText("Thai phone number input");
    expect(input.props.value).toBe("12-345-6789");
  });

  it("calls onChangeLocal with digits only (max 9 digits)", () => {
    const onChangeLocal = jest.fn();

    const { getByLabelText } = render(
      <PhoneInput localPhone="" onChangeLocal={onChangeLocal} />
    );

    const input = getByLabelText("Thai phone number input");
    fireEvent.changeText(input, "12-3a45-67890xxx");
    expect(onChangeLocal).toHaveBeenCalledWith("123456789");
  });

  it("handles backspace when current value ends with '-' (removes dash)", () => {
    const onChangeLocal = jest.fn();

    const { getByLabelText } = render(
      <PhoneInput localPhone={"12-"} onChangeLocal={onChangeLocal} />
    );

    const input = getByLabelText("Thai phone number input");
    fireEvent(input, "keyPress", { nativeEvent: { key: "Backspace" } });
    expect(onChangeLocal).toHaveBeenCalledWith("12");
  });

  it("does not call onChangeLocal on backspace when not ending with '-'", () => {
    const onChangeLocal = jest.fn();

    const { getByLabelText } = render(
      <PhoneInput localPhone={"123"} onChangeLocal={onChangeLocal} />
    );

    const input = getByLabelText("Thai phone number input");
    fireEvent(input, "keyPress", { nativeEvent: { key: "Backspace" } });
    expect(onChangeLocal).toHaveBeenCalledTimes(0);
  });

  it("renders error text when error provided", () => {
    const { getByText } = render(
      <PhoneInput localPhone="" onChangeLocal={() => {}} error="Invalid phone" />
    );
    expect(getByText("Invalid phone")).toBeTruthy();
  });

  it("calls onSubmit when submitting", () => {
    const onSubmit = jest.fn();

    const { getByLabelText } = render(
      <PhoneInput localPhone="123" onChangeLocal={() => {}} onSubmit={onSubmit} />
    );

    const input = getByLabelText("Thai phone number input");
    fireEvent(input, "submitEditing");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});