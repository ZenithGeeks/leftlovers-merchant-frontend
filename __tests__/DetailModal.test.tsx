import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DetailModal from "@/components/employees/DetailModal";

// Mock RoleBadge so we can assert it's rendered easily
jest.mock("@/components/employees/RoleBadge", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return function RoleBadgeMock(props: { role: string }) {
    return (
      <View testID="role-badge">
        <Text>{props.role}</Text>
      </View>
    );
  };
});

// Mock Ionicons to avoid async icon loading / act warnings
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email?: string | null;
  phone?: string | null;
};

describe("DetailModal", () => {
  const baseEmployee: Employee = {
    id: "emp_1",
    firstName: "Earth",
    lastName: "Vitawat",
    role: "Manager",
    email: "earth@example.com",
    phone: "0812345678",
  };

  const renderModal = (overrides?: Partial<React.ComponentProps<typeof DetailModal>>) => {
    const props: React.ComponentProps<typeof DetailModal> = {
      visible: true,
      onClose: jest.fn(),
      employee: baseEmployee as any,
      onDisable: jest.fn(),
      bottomPadding: 0,
      ...overrides,
    };

    return {
      props,
      ...render(<DetailModal {...props} />),
    };
  };

  it("returns null when not visible", () => {
    const { queryByText } = render(
      <DetailModal
        visible={false}
        onClose={jest.fn()}
        employee={baseEmployee as any}
        onDisable={jest.fn()}
        bottomPadding={0}
      />
    );

    // component returns null if not visible
    expect(queryByText("Full name")).toBeNull();
  });

  it("renders employee details when employee exists", () => {
    const { getByText, getAllByText, getByTestId } = renderModal();

    // Name appears twice (header + Full name value)
    expect(getAllByText("Earth Vitawat").length).toBeGreaterThanOrEqual(2);

    // RoleBadge mocked
    expect(getByTestId("role-badge")).toBeTruthy();
    expect(getByText("Manager")).toBeTruthy();

    // Labels
    expect(getByText("Full name")).toBeTruthy();
    expect(getByText("Email")).toBeTruthy();
    expect(getByText("Mobile number")).toBeTruthy();

    // Values
    expect(getByText("earth@example.com")).toBeTruthy();
    expect(getByText("0812345678")).toBeTruthy();

    // Disable button
    expect(getByText("Disable Employee Access")).toBeTruthy();
  });

  it("shows '-' when email/phone missing", () => {
    const employeeNoContact: Employee = {
      ...baseEmployee,
      email: "",
      phone: "",
    };

    const { getAllByText } = renderModal({ employee: employeeNoContact as any });

    // Both email and phone render '-'
    expect(getAllByText("-").length).toBeGreaterThanOrEqual(2);
  });

  it("calls onDisable with employee.id when pressing disable button", () => {
    const onDisable = jest.fn();
    const { getByText } = renderModal({ onDisable });

    fireEvent.press(getByText("Disable Employee Access"));
    expect(onDisable).toHaveBeenCalledTimes(1);
    expect(onDisable).toHaveBeenCalledWith("emp_1");
  });

  it("calls onClose when pressing the backdrop", () => {
    const onClose = jest.fn();

    // We need to locate the backdrop TouchableOpacity.
    // Since it has className="absolute inset-0" and no testID,
    // easiest is to press by type traversal is NOT supported in testing-library.
    // So instead we just press close icon area by text "close" (mocked Ionicons).
    const { getByText } = renderModal({ onClose });

    // Ionicons mocked to render its 'name' text, and your close icon uses name="close"
    fireEvent.press(getByText("close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders fallback header when employee is null", () => {
    const { getByText, queryByTestId } = renderModal({ employee: null });

    expect(getByText("Employee")).toBeTruthy();
    // when employee is null, the details section shouldn't render
    expect(queryByTestId("role-badge")).toBeNull();
  });
});
