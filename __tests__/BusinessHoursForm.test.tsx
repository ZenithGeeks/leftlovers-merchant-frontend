// __tests__/BusinessHoursForm.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import BusinessHoursForm, { type DayHour } from "@/components/store/BusinessHoursForm";

const mkDate = (hh: number, mm: number) => new Date(2025, 0, 1, hh, mm, 0, 0);

function renderForm(overrides?: Partial<React.ComponentProps<typeof BusinessHoursForm>>) {
  const openPicker = jest.fn();
  const setClosedState = jest.fn();
  const onSave = jest.fn();

  const hours: DayHour[] = [
    { day: "Monday", open: mkDate(9, 0), close: mkDate(18, 0), closed: false },
    { day: "Tuesday", open: mkDate(10, 0), close: mkDate(19, 0), closed: true },
  ];

  const fmtTime = jest.fn((d: Date) => {
    const h = `${d.getHours()}`.padStart(2, "0");
    const m = `${d.getMinutes()}`.padStart(2, "0");
    return `${h}:${m}`;
  });

  const utils = render(
    <BusinessHoursForm
      hours={hours}
      error={null}
      canSave={false}
      saving={false}
      onSave={onSave}
      openPicker={openPicker}
      setClosedState={setClosedState}
      bottomPadding={0}
      fmtTime={fmtTime}
      {...overrides}
    />
  );

  return { ...utils, openPicker, setClosedState, onSave, fmtTime, hours };
}

describe("BusinessHoursForm", () => {
  it("renders error banner when error exists", () => {
    const { getByText } = renderForm({ error: "Invalid hours" });
    expect(getByText("Invalid hours")).toBeTruthy();
  });

  it("renders each day name", () => {
    const { getByText } = renderForm();
    expect(getByText("Monday")).toBeTruthy();
    expect(getByText("Tuesday")).toBeTruthy();
  });

  it("shows closed message when a day is closed", () => {
    const { getByText } = renderForm();
    expect(getByText("This day is closed.")).toBeTruthy();
  });

  it("calls setClosedState when pressing OPEN/CLOSED toggles", () => {
    const { getAllByText, setClosedState } = renderForm();

    // Monday (index 0): press CLOSED
    fireEvent.press(getAllByText("CLOSED")[0]);
    expect(setClosedState).toHaveBeenCalledWith(0, true);

    // Tuesday (index 1): press OPEN
    fireEvent.press(getAllByText("OPEN")[1]);
    expect(setClosedState).toHaveBeenCalledWith(1, false);
  });

  it("renders open/close time for open day and calls openPicker when pressed", () => {
    const { getByText, openPicker } = renderForm();

    // Monday is open -> shows its open/close time labels
    const openTime = getByText("09:00");
    const closeTime = getByText("18:00");

    fireEvent.press(openTime);
    expect(openPicker).toHaveBeenCalledWith(0, "open");

    fireEvent.press(closeTime);
    expect(openPicker).toHaveBeenCalledWith(0, "close");
  });

  it("does not render time pickers for closed day", () => {
    const { queryByText } = renderForm();

    // Tuesday is closed; its times should NOT be shown
    expect(queryByText("10:00")).toBeNull();
    expect(queryByText("19:00")).toBeNull();
  });

  it("disables save when canSave=false (and does not call onSave when pressed)", () => {
    const { getByText, onSave } = renderForm({ canSave: false });

    // still pressable in tests sometimes; we assert it doesn't call
    fireEvent.press(getByText("Save"));
    expect(onSave).toHaveBeenCalledTimes(0);
  });

  it("enables save when canSave=true and calls onSave", () => {
    const { getByText, onSave } = renderForm({ canSave: true });

    fireEvent.press(getByText("Save"));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows "Saving..." when saving=true', () => {
    const { getByText } = renderForm({ saving: true, canSave: true });
    expect(getByText("Saving...")).toBeTruthy();
  });
});
