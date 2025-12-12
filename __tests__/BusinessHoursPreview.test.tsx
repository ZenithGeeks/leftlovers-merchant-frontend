// __tests__/BusinessHoursPreview.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import BusinessHoursPreview from "@/components/store/BusinessHoursPreview";

// Mock Row so we can click it reliably
jest.mock("@/components/store/Row", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");
  return function RowMock(props: { title: string; onPress?: () => void }) {
    return (
      <Pressable accessibilityLabel="row-business-hours" onPress={props.onPress}>
        <View>
          <Text>{props.title}</Text>
        </View>
      </Pressable>
    );
  };
});

// Mock heroicons (avoid native bits)
jest.mock("react-native-heroicons/outline", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    ClockIcon: () => <View testID="clock-icon" />,
  };
});

describe("BusinessHoursPreview", () => {
  it('renders "Business hours" header row and calls onPressEdit when pressed', () => {
    const onPressEdit = jest.fn();
    const { getByText, getByLabelText } = render(
      <BusinessHoursPreview weekly={null} onPressEdit={onPressEdit} />
    );

    expect(getByText("Business hours")).toBeTruthy();

    fireEvent.press(getByLabelText("row-business-hours"));
    expect(onPressEdit).toHaveBeenCalledTimes(1);
  });

  it('renders "Not configured yet." when weekly is null/undefined', () => {
    const { getByText } = render(
      <BusinessHoursPreview weekly={undefined} onPressEdit={() => {}} />
    );

    expect(getByText("Not configured yet.")).toBeTruthy();
  });

  it('renders 7 day rows and shows "Closed" when day has no slots', () => {
    const weekly = {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    };

    const { getByText, getAllByText } = render(
      <BusinessHoursPreview weekly={weekly} onPressEdit={() => {}} />
    );

    // day labels
    expect(getByText("Mon")).toBeTruthy();
    expect(getByText("Tue")).toBeTruthy();
    expect(getByText("Wed")).toBeTruthy();
    expect(getByText("Thu")).toBeTruthy();
    expect(getByText("Fri")).toBeTruthy();
    expect(getByText("Sat")).toBeTruthy();
    expect(getByText("Sun")).toBeTruthy();

    // each day should be "Closed"
    expect(getAllByText("Closed")).toHaveLength(7);
  });

  it("renders slot text for days with slots and joins multiple slots with comma", () => {
    const weekly = {
      mon: [{ open: "09:00", close: "18:00" }],
      tue: [
        { open: "10:00", close: "12:00" },
        { open: "13:00", close: "17:00" },
      ],
      // omit rest -> should become closed
    };

    const { getByText, getAllByText } = render(
      <BusinessHoursPreview weekly={weekly} onPressEdit={() => {}} />
    );

    // single slot
    expect(getByText("09:00-18:00")).toBeTruthy();

    // multiple slots joined
    expect(getByText("10:00-12:00, 13:00-17:00")).toBeTruthy();

    // remaining days (5) should be closed
    expect(getAllByText("Closed").length).toBe(5);
  });
});
