// __tests__/AddressForm.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import AddressForm from "@/components/store/AddressForm";

jest.mock("@/components/Authen/LocationPicker.native", () => {
  const React = require("react");
  const { View, Text, Pressable } = require("react-native");

  return function LocationPickerMock(props: {
    lat: string;
    lng: string;
    onChange: (lat: string, lng: string) => void;
  }) {
    return (
      <View testID="location-picker">
        <Text>
          {props.lat},{props.lng}
        </Text>
        <Pressable
          testID="location-change"
          onPress={() => props.onChange("13.7563", "100.5018")}
        >
          <Text>change</Text>
        </Pressable>
      </View>
    );
  };
});

function renderForm(overrides?: Partial<React.ComponentProps<typeof AddressForm>>) {
  const setLine1 = jest.fn();
  const setLine2 = jest.fn();
  const setCity = jest.fn();
  const setProvince = jest.fn();
  const setPostalCode = jest.fn();
  const setLat = jest.fn();
  const setLng = jest.fn();
  const onSave = jest.fn();

  const utils = render(
    <AddressForm
      error={null}
      line1=""
      setLine1={setLine1}
      line2=""
      setLine2={setLine2}
      city=""
      setCity={setCity}
      province=""
      setProvince={setProvince}
      postalCode=""
      setPostalCode={setPostalCode}
      lat="0"
      lng="0"
      setLat={setLat}
      setLng={setLng}
      canSave={false}
      saving={false}
      onSave={onSave}
      bottomPadding={0}
      {...overrides}
    />
  );

  return {
    ...utils,
    setLine1,
    setLine2,
    setCity,
    setProvince,
    setPostalCode,
    setLat,
    setLng,
    onSave,
  };
}

describe("AddressForm", () => {
  it("renders LocationPicker and basic fields", () => {
    const { getByTestId, getByText } = renderForm();

    expect(getByTestId("location-picker")).toBeTruthy();

    // ✅ because it's rendered as "Address Line 1 " + nested "*"
    expect(getByText(/Address Line 1/)).toBeTruthy();

    expect(getByText("Address Line 2 (optional)")).toBeTruthy();
    expect(getByText("City")).toBeTruthy();
    expect(getByText("Province")).toBeTruthy();
    expect(getByText("Postal Code")).toBeTruthy();
  });

  it("shows error banner when error exists", () => {
    const { getByText } = renderForm({ error: "Something went wrong" });
    expect(getByText("Something went wrong")).toBeTruthy();
  });

  it("calls setLat/setLng when LocationPicker changes", () => {
    const { getByTestId, setLat, setLng } = renderForm();

    fireEvent.press(getByTestId("location-change"));
    expect(setLat).toHaveBeenCalledWith("13.7563");
    expect(setLng).toHaveBeenCalledWith("100.5018");
  });

  it("calls setters when typing into inputs", () => {
    const {
      getByPlaceholderText,
      getAllByPlaceholderText,
      setLine1,
      setLine2,
      setCity,
      setProvince,
      setPostalCode,
    } = renderForm();

    fireEvent.changeText(
      getByPlaceholderText("Street, building, house no."),
      "123 ถนนสุขุมวิท"
    );
    expect(setLine1).toHaveBeenCalledWith("123 ถนนสุขุมวิท");

    fireEvent.changeText(getByPlaceholderText("Apartment, floor, unit"), "Floor 9");
    expect(setLine2).toHaveBeenCalledWith("Floor 9");

    // ✅ 2 inputs share the same placeholder
    const [cityInput, provinceInput] = getAllByPlaceholderText("e.g., Bangkok");

    fireEvent.changeText(cityInput, "Bangkok");
    expect(setCity).toHaveBeenCalledWith("Bangkok");

    fireEvent.changeText(provinceInput, "Bangkok");
    expect(setProvince).toHaveBeenCalledWith("Bangkok");

    fireEvent.changeText(getByPlaceholderText("e.g., 10140"), "10140");
    expect(setPostalCode).toHaveBeenCalledWith("10140");
  });

  it("save button is disabled when canSave=false", () => {
    const { getByLabelText } = renderForm({ canSave: false });
    const btn = getByLabelText("save-address");

    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it("calls onSave when canSave=true and pressed", () => {
    const { getByLabelText, onSave } = renderForm({ canSave: true });

    fireEvent.press(getByLabelText("save-address"));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows "Saving..." text when saving=true', () => {
    const { getByText } = renderForm({ saving: true, canSave: true });
    expect(getByText("Saving...")).toBeTruthy();
  });
});
