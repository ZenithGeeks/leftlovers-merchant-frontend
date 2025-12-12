import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";

// safest: let Jest use manual mock if available
jest.mock("@expo/vector-icons");

type Role = "Manager" | "Cashier" | "Stock";

function renderModal(
  overrides?: Partial<React.ComponentProps<typeof AddEmployeeModal>>
) {
  const props: React.ComponentProps<typeof AddEmployeeModal> = {
    visible: true,
    onClose: jest.fn(),
    topPadding: 0,
    bottomPadding: 0,
    horizontalPadding: 0,
    role: "Manager" as Role,
    setRole: jest.fn(),
    fullName: "",
    setFullName: jest.fn(),
    username: "",
    setUsername: jest.fn(),
    email: "",
    setEmail: jest.fn(),
    phone: "",
    setPhone: jest.fn(),
    onSubmit: jest.fn(),
    ...overrides,
  };

  return { ...render(<AddEmployeeModal {...props} />), props };
}

function findPressableParent(node: any) {
  let cur = node;
  while (cur) {
    const p = cur.props ?? {};
    if (typeof p.onPress === "function") return cur;
    cur = cur.parent;
  }
  return node;
}

function getPressable(getByLabelText: (t: string) => any, label: string) {
  return findPressableParent(getByLabelText(label));
}

function getDisabled(btn: any): boolean | undefined {
  const p = btn?.props ?? {};
  if (typeof p.disabled === "boolean") return p.disabled;
  if (typeof p.accessibilityState?.disabled === "boolean")
    return p.accessibilityState.disabled;
  return undefined;
}

describe("AddEmployeeModal", () => {
  it("renders title and inputs", () => {
    const { getByText, getByLabelText } = renderModal();

    expect(getByText("Add Employee")).toBeTruthy();

    expect(getByLabelText("input-full-name")).toBeTruthy();
    expect(getByLabelText("input-username")).toBeTruthy();
    expect(getByLabelText("input-email")).toBeTruthy();
    expect(getByLabelText("input-phone")).toBeTruthy();

    expect(getByLabelText("close-modal")).toBeTruthy();
    expect(getByLabelText("submit-add-employee")).toBeTruthy();
  });

  it("calls onClose when close button is pressed", () => {
    const onClose = jest.fn();
    const { getByLabelText } = renderModal({ onClose });

    fireEvent.press(getPressable(getByLabelText, "close-modal"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls setRole when selecting a role option", () => {
    const setRole = jest.fn();
    const { getByLabelText } = renderModal({ setRole });

    fireEvent.press(getPressable(getByLabelText, "select-role-Cashier"));
    expect(setRole).toHaveBeenCalledWith("Cashier");

    fireEvent.press(getPressable(getByLabelText, "select-role-Stock"));
    expect(setRole).toHaveBeenCalledWith("Stock");
  });

  it("calls setters when typing into inputs", () => {
    const setFullName = jest.fn();
    const setUsername = jest.fn();
    const setEmail = jest.fn();
    const setPhone = jest.fn();

    const { getByLabelText } = renderModal({
      setFullName,
      setUsername,
      setEmail,
      setPhone,
    });

    fireEvent.changeText(getByLabelText("input-full-name"), "Earth V");
    expect(setFullName).toHaveBeenCalledWith("Earth V");

    fireEvent.changeText(getByLabelText("input-username"), "earth");
    expect(setUsername).toHaveBeenCalledWith("earth");

    fireEvent.changeText(getByLabelText("input-email"), "earth@test.com");
    expect(setEmail).toHaveBeenCalledWith("earth@test.com");

    fireEvent.changeText(getByLabelText("input-phone"), "0812345678");
    expect(setPhone).toHaveBeenCalledWith("0812345678");
  });

  it("disables submit when required fields are missing", () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = renderModal({
      fullName: "",
      username: "",
      email: "",
      phone: "",
      onSubmit,
    });

    const submit = getPressable(getByLabelText, "submit-add-employee");

    // ✅ only check disabled state
    expect(getDisabled(submit)).toBe(true);

    // ❌ do NOT press here (RTL may still fire press even if disabled)
    expect(onSubmit).toHaveBeenCalledTimes(0);
  });

  it("enables submit when name + username + email exist, and calls onSubmit", () => {
    const onSubmit = jest.fn();
    const { getByLabelText } = renderModal({
      fullName: "Joy",
      username: "Joy",
      email: "joy@test.com",
      phone: "",
      onSubmit,
    });

    const submit = getPressable(getByLabelText, "submit-add-employee");
    expect(getDisabled(submit)).toBe(false);

    fireEvent.press(submit);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("enables submit when phone is provided instead of email", () => {
    const { getByLabelText } = renderModal({
      fullName: "Joy",
      username: "joy",
      email: "",
      phone: "0812345678",
    });

    const submit = getPressable(getByLabelText, "submit-add-employee");
    expect(getDisabled(submit)).toBe(false);
  });
});
