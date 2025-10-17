import SelectBox from "@/components/add-item/SelectBox";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

it("opens on press and shows value/placeholder", () => {
  const onPress = jest.fn();
  const { getByLabelText, getByText, rerender } = render(
    <SelectBox a11yLabel="open-category" placeholder="Select a category" value={undefined} onPress={onPress} />
  );
  getByText("Select a category");
  fireEvent.press(getByLabelText("open-category"));
  expect(onPress).toHaveBeenCalled();

  rerender(<SelectBox a11yLabel="open-category" placeholder="Select a category" value="Rice Bowls" onPress={onPress} />);
  getByText("Rice Bowls");
});
