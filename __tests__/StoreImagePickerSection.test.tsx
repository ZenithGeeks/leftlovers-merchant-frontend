// __tests__/StoreImagePickerSection.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import StoreImagePickerSection from "@/components/store/StoreImagePickerSection";

jest.mock("@/components/ImagePickerField", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return function MockImagePickerField(props: any) {
    // Expose props + simple triggers
    return (
      <View testID="image-picker-field">
        <Text testID="image-picker-value">
          {props.value === undefined ? "undefined" : String(props.value)}
        </Text>

        {/* Trigger various shapes that StoreImagePickerSection supports */}
        <Text
          testID="trigger-null"
          onPress={() => props.onChange(null)}
          accessibilityRole="button"
        >
          trigger-null
        </Text>
        <Text
          testID="trigger-string"
          onPress={() => props.onChange("file:///img.jpg")}
          accessibilityRole="button"
        >
          trigger-string
        </Text>
        <Text
          testID="trigger-object-uri"
          onPress={() => props.onChange({ uri: "file:///obj.jpg" })}
          accessibilityRole="button"
        >
          trigger-object-uri
        </Text>
        <Text
          testID="trigger-weird"
          onPress={() => props.onChange({ nope: true })}
          accessibilityRole="button"
        >
          trigger-weird
        </Text>
      </View>
    );
  };
});

describe("StoreImagePickerSection", () => {
  const baseProps = {
    title: "Store logo",
    description: "Upload your store logo",
    value: null as string | null,
    onChange: jest.fn() as (uri: string | null) => void,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title + description", () => {
    const { getByText } = render(<StoreImagePickerSection {...baseProps} />);
    expect(getByText("Store logo")).toBeTruthy();
    expect(getByText("Upload your store logo")).toBeTruthy();
  });

  it("passes value as undefined when value=null", () => {
    const { getByTestId } = render(
      <StoreImagePickerSection {...baseProps} value={null} />
    );
    expect(getByTestId("image-picker-value").props.children).toBe("undefined");
  });

  it("passes value when value is a string", () => {
    const { getByTestId } = render(
      <StoreImagePickerSection {...baseProps} value={"file:///existing.png"} />
    );
    expect(getByTestId("image-picker-value").props.children).toBe(
      "file:///existing.png"
    );
  });

  it("onChange(null) when picker returns null", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <StoreImagePickerSection {...baseProps} onChange={onChange} />
    );

    fireEvent.press(getByTestId("trigger-null"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("onChange(string) when picker returns a string", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <StoreImagePickerSection {...baseProps} onChange={onChange} />
    );

    fireEvent.press(getByTestId("trigger-string"));
    expect(onChange).toHaveBeenCalledWith("file:///img.jpg");
  });

  it("onChange(val.uri) when picker returns { uri }", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <StoreImagePickerSection {...baseProps} onChange={onChange} />
    );

    fireEvent.press(getByTestId("trigger-object-uri"));
    expect(onChange).toHaveBeenCalledWith("file:///obj.jpg");
  });

  it("onChange(null) when picker returns unexpected object", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <StoreImagePickerSection {...baseProps} onChange={onChange} />
    );

    fireEvent.press(getByTestId("trigger-weird"));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
