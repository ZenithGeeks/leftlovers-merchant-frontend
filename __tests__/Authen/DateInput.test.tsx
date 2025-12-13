import { DobPickerHybrid, toBEStringForStorage } from "@/components/Authen/DateInput";
import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

// ✅ mock icon (avoid native vector icon issues)
jest.mock("@expo/vector-icons", () => ({
  FontAwesome: () => null,
}));

// ✅ mock DateTimePicker so we can trigger onChange ourselves
jest.mock("@react-native-community/datetimepicker", () => {
  const React = require("react");
  const { View } = require("react-native");
  return function MockDateTimePicker(props: any) {
    return <View testID="date-picker" onChange={props.onChange} />;
  };
});

/**
 * Helper: start from any element (like the TextInput),
 * walk up until we find a parent with onPress, then press it.
 */
function pressNearestPressable(node: any) {
  let cur = node;
  while (cur && !cur.props?.onPress) cur = cur.parent;
  if (!cur) throw new Error("No pressable parent found");
  fireEvent.press(cur);
}

describe("DobPickerHybrid", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    // fix "today" so age logic is deterministic
    jest.setSystemTime(new Date(2025, 0, 1)); // 01 Jan 2025
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders placeholder when dob is undefined", () => {
    const setDob = jest.fn();
    const { getByPlaceholderText, queryByText } = render(
      <DobPickerHybrid dob={undefined} setDob={setDob} />
    );

    expect(getByPlaceholderText("dd/mm/yyyy")).toBeTruthy();
    expect(queryByText(/Thai year \(BE\):/)).toBeNull();
  });

  it("opens modal when pressing the field", () => {
    const setDob = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <DobPickerHybrid dob={undefined} setDob={setDob} />
    );

    pressNearestPressable(getByPlaceholderText("dd/mm/yyyy"));

    expect(getByText("Select Date of Birth")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("Confirm")).toBeTruthy();

    // default preview should show year 2000 / 2543
    expect(getByText("AD: 01/01/2000")).toBeTruthy();
    expect(getByText("BE: 01/01/2543")).toBeTruthy();
  });

  it("selects a date and confirms -> calls setDob with AD format and closes modal", () => {
    const setDob = jest.fn();
    const { getByPlaceholderText, getByTestId, getByText, queryByText } =
      render(<DobPickerHybrid dob={undefined} setDob={setDob} />);

    pressNearestPressable(getByPlaceholderText("dd/mm/yyyy"));

    act(() => {
      fireEvent(getByTestId("date-picker"), "onChange", { type: "set" }, new Date(2001, 1, 2));
      // 02 Feb 2001 (month is 0-based)
    });

    expect(getByText("AD: 02/02/2001")).toBeTruthy();
    expect(getByText("BE: 02/02/2544")).toBeTruthy();

    act(() => {
      fireEvent.press(getByText("Confirm"));
    });

    expect(setDob).toHaveBeenCalledWith("02/02/2001");
    expect(queryByText("Select Date of Birth")).toBeNull(); // modal closed
  });

  it("blocks future date (shows Alert) and does not call setDob", () => {
    const setDob = jest.fn();
    const { getByPlaceholderText, getByTestId, getByText } = render(
      <DobPickerHybrid dob={undefined} setDob={setDob} />
    );

    pressNearestPressable(getByPlaceholderText("dd/mm/yyyy"));

    act(() => {
      fireEvent(getByTestId("date-picker"), "onChange", { type: "set" }, new Date(2026, 0, 1));
    });

    act(() => {
      fireEvent.press(getByText("Confirm"));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Age Restriction",
      "Date of birth cannot be in the future."
    );
    expect(setDob).not.toHaveBeenCalled();
    // modal should remain open because onConfirm returns early
    expect(getByText("Select Date of Birth")).toBeTruthy();
  });

  it("blocks too-young age (minAge) and does not call setDob", () => {
    const setDob = jest.fn();
    const { getByPlaceholderText, getByTestId, getByText } = render(
      <DobPickerHybrid dob={undefined} setDob={setDob} minAge={15} />
    );

    pressNearestPressable(getByPlaceholderText("dd/mm/yyyy"));

    act(() => {
      // Jan 1 2015 -> age 10 on Jan 1 2025
      fireEvent(getByTestId("date-picker"), "onChange", { type: "set" }, new Date(2015, 0, 1));
    });

    act(() => {
      fireEvent.press(getByText("Confirm"));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Age Restriction",
      "You must be at least 15 years old."
    );
    expect(setDob).not.toHaveBeenCalled();
  });

  it("shows Thai BE hint when dob is set (AD stored -> BE displayed)", () => {
    const setDob = jest.fn();
    const { getByText } = render(
      <DobPickerHybrid dob={"02/02/2001"} setDob={setDob} />
    );

    expect(getByText("Thai year (BE): 02/02/2544")).toBeTruthy();
  });

  it("handles BE input parsing (dob is BE string) and previews correctly", () => {
    const setDob = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <DobPickerHybrid dob={"01/01/2540"} setDob={setDob} />
    );

    pressNearestPressable(getByPlaceholderText("dd/mm/yyyy"));

    // If dob is BE 2540, tempDate should be AD 1997
    expect(getByText("AD: 01/01/1997")).toBeTruthy();
    expect(getByText("BE: 01/01/2540")).toBeTruthy();
  });
});

describe("toBEStringForStorage", () => {
  it("converts AD string to BE string", () => {
    expect(toBEStringForStorage("31/12/2000")).toBe("31/12/2543");
  });

  it("returns empty string for invalid input", () => {
    expect(toBEStringForStorage("99/99/9999")).toBe("");
    expect(toBEStringForStorage("")).toBe("");
  });
});
