// __tests__/OwnerContactForm.test.tsx

import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import OwnerContactForm from "@/components/store/OwnerContactForm";

// IMPORTANT: mock without React/Text/JSX to avoid _ReactNativeCSSInterop out-of-scope error
jest.mock("@/components/add-item/FieldLabel", () => ({
  __esModule: true,
  default: () => null,
}));

function renderForm(
  overrides?: Partial<React.ComponentProps<typeof OwnerContactForm>>
) {
  const setPhone = overrides?.setPhone ?? jest.fn();
  const setEmail = overrides?.setEmail ?? jest.fn();
  const onSave = overrides?.onSave ?? jest.fn();

  const utils = render(
    <OwnerContactForm
      phone={overrides?.phone ?? ""}
      setPhone={setPhone}
      email={overrides?.email ?? ""}
      setEmail={setEmail}
      canSave={overrides?.canSave ?? false}
      saving={overrides?.saving ?? false}
      onSave={onSave}
      error={overrides?.error ?? null}
      bottomPadding={overrides?.bottomPadding ?? 0}
    />
  );

  return { ...utils, setPhone, setEmail, onSave };
}

describe("OwnerContactForm", () => {
  it("renders inputs and save button", () => {
    const { getByPlaceholderText, getByLabelText } = renderForm();

    expect(getByPlaceholderText("Enter owner mobile number")).toBeTruthy();
    expect(getByPlaceholderText("Enter owner email")).toBeTruthy();

    const saveBtn = getByLabelText("save-owner-contact");
    expect(saveBtn).toBeTruthy();
    expect(saveBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it("renders error message when error exists", () => {
    const { getByText } = renderForm({ error: "Something went wrong" });
    expect(getByText("Something went wrong")).toBeTruthy();
  });

  it("calls setters when typing", () => {
    const { getByPlaceholderText, setPhone, setEmail } = renderForm();

    fireEvent.changeText(
      getByPlaceholderText("Enter owner mobile number"),
      "0812345678"
    );
    expect(setPhone).toHaveBeenCalledWith("0812345678");

    fireEvent.changeText(
      getByPlaceholderText("Enter owner email"),
      "owner@leftlovers.com"
    );
    expect(setEmail).toHaveBeenCalledWith("owner@leftlovers.com");
  });

  it("when canSave=false: save is disabled and does not call onSave", () => {
    const { getByLabelText, onSave } = renderForm({ canSave: false });

    const saveBtn = getByLabelText("save-owner-contact");
    expect(saveBtn.props.accessibilityState?.disabled).toBe(true);

    fireEvent.press(saveBtn);
    expect(onSave).toHaveBeenCalledTimes(0);
  });

  it("when canSave=true: save is enabled and calls onSave", () => {
    const { getByLabelText, onSave } = renderForm({ canSave: true });

    const saveBtn = getByLabelText("save-owner-contact");
    expect(saveBtn.props.accessibilityState?.disabled).toBe(false);

    fireEvent.press(saveBtn);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("shows Saving... when saving=true", () => {
    const { getByText } = renderForm({ saving: true, canSave: true });
    expect(getByText("Saving...")).toBeTruthy();
  });
});
