// __tests__/OptionList.test.tsx
import React from "react";
import { fireEvent, render, act, waitFor } from "@testing-library/react-native";

import OptionList, { type OptionItem } from "@/components/Menu/Option-List";

// ✅ mock icon to avoid native/react-native-svg issues
jest.mock("react-native-heroicons/outline", () => ({
  TrashIcon: () => null,
}));

const makeOpt = (
  o: Partial<OptionItem> & Pick<OptionItem, "id" | "name">
): OptionItem => ({
  id: o.id,
  name: o.name,
  priceDelta: o.priceDelta ?? 0,
  active: o.active ?? false,
});

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// RN sometimes exposes "disabled" either on props.disabled or props.accessibilityState.disabled
function isDisabled(node: any): boolean {
  return Boolean(node?.props?.disabled ?? node?.props?.accessibilityState?.disabled);
}

describe("OptionList", () => {
  it("renders empty state when no options", () => {
    const onToggleAvailability = jest.fn(async () => {});
    const { getByText } = render(
      <OptionList options={[]} onToggleAvailability={onToggleAvailability} />
    );

    expect(getByText("No options available")).toBeTruthy();
  });

  it("renders each option fields", () => {
    const onToggleAvailability = jest.fn(async () => {});
    const options: OptionItem[] = [
      makeOpt({ id: "o1", name: "Cheese", priceDelta: 10, active: true }),
      makeOpt({ id: "o2", name: "Bacon", priceDelta: 5.5, active: false }),
    ];

    const { getByText } = render(
      <OptionList options={options} onToggleAvailability={onToggleAvailability} />
    );

    expect(getByText("Cheese")).toBeTruthy();
    expect(getByText("10.00 THB")).toBeTruthy();
    expect(getByText("Available")).toBeTruthy();

    expect(getByText("Bacon")).toBeTruthy();
    expect(getByText("5.50 THB")).toBeTruthy();
    expect(getByText("Unavailable")).toBeTruthy();
  });

  it("toggles by pressing the row (toggle-<name>) without act warnings", async () => {
    const gate = deferred<void>();
    const onToggleAvailability = jest.fn(() => gate.promise);

    const options: OptionItem[] = [makeOpt({ id: "o1", name: "Cheese", active: true })];

    const { getByLabelText } = render(
      <OptionList options={options} onToggleAvailability={onToggleAvailability} />
    );

    // start toggle inside act
    await act(async () => {
      fireEvent.press(getByLabelText("toggle-Cheese"));
    });

    expect(onToggleAvailability).toHaveBeenCalledTimes(1);
    expect(onToggleAvailability).toHaveBeenCalledWith("o1", false);

    // resolve async work inside act so setPendingId(null) is also inside act
    await act(async () => {
      gate.resolve();
      await gate.promise;
    });
  });

  it("calls onDelete when delete button pressed", () => {
    const onToggleAvailability = jest.fn(async () => {});
    const onDelete = jest.fn();

    const options: OptionItem[] = [makeOpt({ id: "o1", name: "Cheese", active: true })];

    const { getByLabelText } = render(
      <OptionList
        options={options}
        onToggleAvailability={onToggleAvailability}
        onDelete={onDelete}
      />
    );

    fireEvent.press(getByLabelText("delete-Cheese"));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("o1");
  });

  it("disables row + switch + delete when deletingId matches (do not fire disabled switch valueChange)", () => {
    const onToggleAvailability = jest.fn(async () => {});
    const onDelete = jest.fn();

    const options: OptionItem[] = [makeOpt({ id: "o1", name: "Cheese", active: true })];

    const { getByLabelText } = render(
      <OptionList
        options={options}
        onToggleAvailability={onToggleAvailability}
        onDelete={onDelete}
        deletingId="o1"
      />
    );

    const row = getByLabelText("toggle-Cheese");
    const sw = getByLabelText("Cheese-switch");
    const del = getByLabelText("delete-Cheese");

    expect(isDisabled(row)).toBe(true);
    expect(isDisabled(sw)).toBe(true);
    expect(isDisabled(del)).toBe(true);

    // Pressables should not fire when disabled
    fireEvent.press(row);
    fireEvent.press(del);

    expect(onToggleAvailability).toHaveBeenCalledTimes(0);
    expect(onDelete).toHaveBeenCalledTimes(0);

    // IMPORTANT: don't do fireEvent(sw, "valueChange", ...) when disabled,
    // because tests may still call handler even if disabled.
  });

  it("prevents double toggle while pending (second press ignored)", async () => {
    const gate = deferred<void>();
    const onToggleAvailability = jest.fn(() => gate.promise);

    const options: OptionItem[] = [makeOpt({ id: "o1", name: "Cheese", active: true })];

    const { getByLabelText } = render(
      <OptionList options={options} onToggleAvailability={onToggleAvailability} />
    );

    const row = getByLabelText("toggle-Cheese");

    await act(async () => {
      fireEvent.press(row);
    });

    expect(onToggleAvailability).toHaveBeenCalledTimes(1);

    // wait until pending state is reflected (row becomes disabled)
    await waitFor(() => {
      expect(isDisabled(getByLabelText("toggle-Cheese"))).toBe(true);
    });

    // this press should do nothing because Pressable is disabled
    fireEvent.press(getByLabelText("toggle-Cheese"));
    expect(onToggleAvailability).toHaveBeenCalledTimes(1);

    await act(async () => {
      gate.resolve();
      await gate.promise;
    });
  });
});
