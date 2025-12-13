import { PasswordInput } from "@/components/Authen/PasswordInput";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

jest.mock("@/components/Authen/InputBox", () => {
    
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text, TextInput, View } = require("react-native");

  return {
    InputBox: ({ label, errorText, ...props }: any) => (
      <View>
        <Text>{label}</Text>
        {!!errorText && <Text>{errorText}</Text>}
        <TextInput testID="password-input" {...props} />
      </View>
    ),
  };
});

describe("PasswordInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders label", () => {
    const { getByText } = render(
      <PasswordInput value="" onChangeText={() => {}} />
    );

    expect(getByText("Password")).toBeTruthy();
  });

  it("calls onChangeText when typing", () => {
    const onChangeText = jest.fn();

    const { getByTestId } = render(
      <PasswordInput value="" onChangeText={onChangeText} />
    );

    fireEvent.changeText(getByTestId("password-input"), "Abc123!!");
    expect(onChangeText).toHaveBeenCalledWith("Abc123!!");
  });

  it("shows Show toggle only when value is not empty", () => {
    const { queryByText, rerender, getByText } = render(
      <PasswordInput value="" onChangeText={() => {}} />
    );

    expect(queryByText("Show")).toBeNull();
    expect(queryByText("Hide")).toBeNull();

    rerender(<PasswordInput value="abc" onChangeText={() => {}} />);
    expect(getByText("Show")).toBeTruthy();
  });

  it("toggles secureTextEntry when pressing Show/Hide", () => {
    const { getByTestId, getByText } = render(
      <PasswordInput value="Abc123!!" onChangeText={() => {}} />
    );

    expect(getByTestId("password-input").props.secureTextEntry).toBe(true);

    fireEvent.press(getByText("Show"));
    expect(getByTestId("password-input").props.secureTextEntry).toBe(false);

    fireEvent.press(getByText("Hide"));
    expect(getByTestId("password-input").props.secureTextEntry).toBe(true);
  });

  it("shows rules when value length > 0 (default behavior)", () => {
    const { getByText } = render(
      <PasswordInput value="a" onChangeText={() => {}} minLength={8} />
    );

    expect(getByText("• At least 8 characters")).toBeTruthy();
  });

  it("calls onValidityChange(true) when password meets policy", () => {
    const onValidityChange = jest.fn();

    const { rerender } = render(
      <PasswordInput value="" onChangeText={() => {}} onValidityChange={onValidityChange} />
    );

    rerender(
      <PasswordInput
        value="Abcdef1!"
        onChangeText={() => {}}
        onValidityChange={onValidityChange}
      />
    );

    expect(onValidityChange).toHaveBeenCalledWith(true);
  });

  it("calls onValidityChange(false) when password does not meet policy", () => {
    const onValidityChange = jest.fn();

    render(
      <PasswordInput
        value="abcdefg"
        onChangeText={() => {}}
        onValidityChange={onValidityChange}
      />
    );

    expect(onValidityChange).toHaveBeenCalledWith(false);
  });

  it("disabled=true makes input not editable and toggle not pressable", () => {
    const { getByTestId, getByText } = render(
      <PasswordInput value="Abc123!!" onChangeText={() => {}} disabled />
    );

    expect(getByTestId("password-input").props.editable).toBe(false);

    // กดแล้วไม่ควร toggle
    expect(getByTestId("password-input").props.secureTextEntry).toBe(true);
    fireEvent.press(getByText("Show"));
    expect(getByTestId("password-input").props.secureTextEntry).toBe(true);
  });

  it("respects custom policy flags (e.g., no special required)", () => {
    const onValidityChange = jest.fn();

    render(
      <PasswordInput
        value="Abcdef12" // no special
        onChangeText={() => {}}
        requireSpecial={false}
        onValidityChange={onValidityChange}
      />
    );

    expect(onValidityChange).toHaveBeenCalledWith(true);
  });
});
