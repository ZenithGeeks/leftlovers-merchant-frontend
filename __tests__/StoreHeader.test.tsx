// __tests__/StoreHeader.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import StoreHeader from "@/components/store/StoreHeader";

// Avoid svg/native issues in Jest
jest.mock("react-native-heroicons/outline", () => ({
  __esModule: true,
  ChevronLeftIcon: () => null,
}));

describe("StoreHeader", () => {
  it("renders title", () => {
    const { getByText } = render(
      <StoreHeader title="Store Info" onBack={() => {}} />
    );

    expect(getByText("Store Info")).toBeTruthy();
  });

  it("calls onBack when back button is pressed", () => {
    const onBack = jest.fn();
    const { getByLabelText } = render(
      <StoreHeader title="Store Info" onBack={onBack} />
    );

    fireEvent.press(getByLabelText("back"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
