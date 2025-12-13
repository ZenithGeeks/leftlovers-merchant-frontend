// __tests__/Tabs.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import Tabs from "@/components/finance/Tabs";

describe("Finance Tabs", () => {
  it("renders tabs and calls onChange when pressed", () => {
    const onChange = jest.fn();

    const { getByTestId, getByLabelText, getByText } = render(
      <Tabs
        active="Summary"
        onChange={onChange}
        animated={false}
        containerWidth={300}
        testID="finance-tabs"
      />
    );

    expect(getByText("Summary")).toBeTruthy();
    expect(getByText("Transactions")).toBeTruthy();
    expect(getByText("Payout")).toBeTruthy();

    fireEvent.press(getByLabelText("Transactions-tab"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("Transaction");

    expect(getByTestId("finance-tabs-underline")).toBeTruthy();
  });

  it("sets accessibilityState.selected correctly based on active tab", () => {
    const onChange = jest.fn();

    const { getByTestId } = render(
      <Tabs
        active="Payout"
        onChange={onChange}
        animated={false}
        containerWidth={300}
        testID="finance-tabs"
      />
    );

    expect(getByTestId("finance-tabs-tab-Summary").props.accessibilityState).toEqual(
      { selected: false }
    );
    expect(
      getByTestId("finance-tabs-tab-Transaction").props.accessibilityState
    ).toEqual({ selected: false });
    expect(getByTestId("finance-tabs-tab-Payout").props.accessibilityState).toEqual(
      { selected: true }
    );
  });

  it("moves underline in static mode (animated=false) using containerWidth", () => {
    const onChange = jest.fn();

    const { getByTestId, rerender } = render(
      <Tabs
        active="Summary"
        onChange={onChange}
        animated={false}
        containerWidth={300}
        testID="finance-tabs"
      />
    );

    // width/segment = 300/3 = 100
    const underline1 = getByTestId("finance-tabs-underline");
    expect(underline1.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 100 }),
        expect.objectContaining({ left: 0 }),
      ])
    );

    // move to index 2 (Payout) => left = 200
    rerender(
      <Tabs
        active="Payout"
        onChange={onChange}
        animated={false}
        containerWidth={300}
        testID="finance-tabs"
      />
    );

    const underline2 = getByTestId("finance-tabs-underline");
    expect(underline2.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 100 }),
        expect.objectContaining({ left: 200 }),
      ])
    );
  });

  it("has transform.translateX in animated mode (animated=true)", () => {
    const onChange = jest.fn();

    const { getByTestId, getByLabelText } = render(
      <Tabs
        active="Summary"
        onChange={onChange}
        animated={true}
        containerWidth={300}
        testID="finance-tabs"
      />
    );

    // Press a tab -> just verify callback fires
    fireEvent.press(getByLabelText("Payout-tab"));
    expect(onChange).toHaveBeenCalledWith("Payout");

    const underline = getByTestId("finance-tabs-underline");

    // In Jest, style often comes out flattened as an object, not an array.
    expect(underline.props.style).toEqual(
      expect.objectContaining({
        width: 100,
        transform: expect.arrayContaining([
          expect.objectContaining({
            // can be number (0) or Animated.Value-like object
            translateX: expect.anything(),
          }),
        ]),
      })
    );
  });
});
