// __tests__/StoreNameField.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import StoreNameField from "@/components/store/StoreNameField";

// keep consistent with your other tests (avoid CSS interop issues)
jest.mock("@/components/add-item/FieldLabel", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function FieldLabelMock(props: any) {
    return <Text>{props?.label ?? "FieldLabel"}</Text>;
  };
});

describe("StoreNameField", () => {
  it("renders label and TextInput", () => {
    const { getByText, getByPlaceholderText } = render(
      <StoreNameField storeName="" setStoreName={jest.fn()} />
    );

    expect(getByText("Store Name")).toBeTruthy();
    expect(getByPlaceholderText("Your store name")).toBeTruthy();
  });

  it("calls setStoreName when typing", () => {
    const setStoreName = jest.fn();

    const { getByPlaceholderText } = render(
      <StoreNameField storeName="" setStoreName={setStoreName} />
    );

    fireEvent.changeText(getByPlaceholderText("Your store name"), "LeftLovers");
    expect(setStoreName).toHaveBeenCalledWith("LeftLovers");
  });

  it("shows current storeName value", () => {
    const { getByDisplayValue } = render(
      <StoreNameField storeName="My Store" setStoreName={jest.fn()} />
    );

    expect(getByDisplayValue("My Store")).toBeTruthy();
  });
});
