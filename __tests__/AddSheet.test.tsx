// __tests__/AddSheet.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import AddSheet from "@/components/Menu/AddSheet";

jest.mock("react-native-heroicons/outline", () => ({
  PlusIcon: () => null,
}));

describe("<AddSheet />", () => {
  const onClose = jest.fn();
  const onAddItem = jest.fn();
  const onAddOption = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls onClose when backdrop pressed", () => {
    const { getByTestId } = render(
      <AddSheet visible onClose={onClose} />
    );

    fireEvent.press(getByTestId("backdrop"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose and onAddItem", () => {
    const { getByTestId } = render(
      <AddSheet visible onClose={onClose} onAddItem={onAddItem} />
    );

    fireEvent.press(getByTestId("add-item"));
    expect(onClose).toHaveBeenCalled();
    expect(onAddItem).toHaveBeenCalled();
  });

  it("calls onClose and onAddOption", () => {
    const { getByTestId } = render(
      <AddSheet visible onClose={onClose} onAddOption={onAddOption} />
    );

    fireEvent.press(getByTestId("add-option"));
    expect(onClose).toHaveBeenCalled();
    expect(onAddOption).toHaveBeenCalled();
  });
});
