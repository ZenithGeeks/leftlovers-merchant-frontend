import SelectModal from "@/components/add-item/SelectModal";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

const options = [
  { label: "A", value: "CAT001" },
  { label: "B", value: "CAT002" },
];

it("selects an option and closes on backdrop", () => {
  const onSelect = jest.fn();
  const onClose = jest.fn();

  const { getByLabelText, getByTestId } = render(
    <SelectModal
      visible
      options={options}
      onSelect={onSelect}
      onClose={onClose}
      a11yPrefix="category"
    />
  );

  fireEvent.press(getByLabelText("category-option-CAT002"));
  expect(onSelect).toHaveBeenCalledWith({ label: "B", value: "CAT002" });

  fireEvent.press(getByTestId("category-backdrop"));
  expect(onClose).toHaveBeenCalled();
});
