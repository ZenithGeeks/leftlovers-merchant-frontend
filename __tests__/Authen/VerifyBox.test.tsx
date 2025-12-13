// __tests__/Authen/OtpInput.test.tsx
import { OtpInput } from "@/components/Authen/VerifyBox";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

describe("OtpInput", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders with placeholder", () => {
    const { getByPlaceholderText } = render(
      <OtpInput value="" setValue={() => {}} />
    );

    expect(getByPlaceholderText("xxxxxx")).toBeTruthy();
  });

  it("calls setValue with digits only (removes non-digits)", () => {
    const setValue = jest.fn();
    const { getByPlaceholderText } = render(
      <OtpInput value="" setValue={setValue} />
    );

    const input = getByPlaceholderText("xxxxxx");
    fireEvent.changeText(input, "12a-3b");

    expect(setValue).toHaveBeenCalledWith("123");
  });

  it("limits length to default maxLength=6", () => {
    const setValue = jest.fn();
    const { getByPlaceholderText } = render(
      <OtpInput value="" setValue={setValue} />
    );

    const input = getByPlaceholderText("xxxxxx");
    fireEvent.changeText(input, "123456789");

    expect(setValue).toHaveBeenCalledWith("123456");
  });

  it("limits length to custom maxLength", () => {
    const setValue = jest.fn();
    const { getByPlaceholderText } = render(
      <OtpInput value="" setValue={setValue} maxLength={4} />
    );

    const input = getByPlaceholderText("xxxxxx");
    fireEvent.changeText(input, "123456");

    expect(setValue).toHaveBeenCalledWith("1234");
  });

  it("applies style prop", () => {
    const { getByPlaceholderText } = render(
      <OtpInput value="" setValue={() => {}} style={{ color: "red" }} />
    );

    const input = getByPlaceholderText("xxxxxx");
    const styles = Array.isArray(input.props.style) ? input.props.style : [input.props.style];

    // หา style ที่ถูก merge
    const merged = Object.assign({}, ...styles.filter(Boolean));
    expect(merged.color).toBe("red");
  });
});
