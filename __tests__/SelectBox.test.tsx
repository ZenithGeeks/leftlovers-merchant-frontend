import SelectBox from "@/components/add-item/SelectBox";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

jest.mock("react-native-heroicons/outline", () => ({
  ChevronDownIcon: () => null,
}));

describe("<SelectBox />", () => {
  it("shows placeholder when value is undefined and calls onPress", () => {
    const onPress = jest.fn();

    const { getByText, getByLabelText } = render(
      <SelectBox
        a11yLabel="open-category"
        placeholder="Select a category"
        value={undefined}
        onPress={onPress}
      />
    );

    // placeholder visible
    expect(getByText("Select a category")).toBeTruthy();

    // press triggers handler
    fireEvent.press(getByLabelText("open-category"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows value instead of placeholder when value is provided", () => {
    const onPress = jest.fn();

    const { getByText, queryByText } = render(
      <SelectBox
        a11yLabel="open-category"
        placeholder="Select a category"
        value="Rice Bowls"
        onPress={onPress}
      />
    );

    // value visible
    expect(getByText("Rice Bowls")).toBeTruthy();

    // placeholder hidden
    expect(queryByText("Select a category")).toBeNull();
  });

  it("uses accessibility label correctly", () => {
    const onPress = jest.fn();

    const { getByLabelText } = render(
      <SelectBox
        a11yLabel="open-category"
        placeholder="Select a category"
        value="Noodles"
        onPress={onPress}
      />
    );

    fireEvent.press(getByLabelText("open-category"));
    expect(onPress).toHaveBeenCalled();
  });
});
