// __tests__/EmployeeRow.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EmployeeRow from "@/components/employees/EmployeeRow";

jest.mock("@/components/employees/AvatarInitial", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return function AvatarInitialMock({ name }: { name: string }) {
    return (
      <View testID="avatar-initial">
        <Text>{name}</Text>
      </View>
    );
  };
});

jest.mock("@/components/employees/RoleBadge", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return function RoleBadgeMock({ role }: { role: string }) {
    return (
      <View testID="role-badge">
        <Text>{role}</Text>
      </View>
    );
  };
});

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

describe("EmployeeRow", () => {
  const emp: Employee = {
    id: "emp_1",
    firstName: "Earth",
    lastName: "Vitawat",
    role: "Manager",
    email: "earth@example.com",
    phone: "0812345678",
  };

  it("renders name, avatar, role badge, and chevron icon", () => {
    const onPress = jest.fn();
    const { getByText, getByTestId } = render(
      <EmployeeRow item={emp as any} onPress={onPress} />
    );

    expect(getByText("Earth Vitawat")).toBeTruthy();
    expect(getByTestId("avatar-initial")).toBeTruthy();
    expect(getByTestId("role-badge")).toBeTruthy();
    expect(getByText("Manager")).toBeTruthy();

    // Ionicons mocked renders its name as text
    expect(getByText("chevron-forward")).toBeTruthy();
  });

  it("calls onPress with employee when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(<EmployeeRow item={emp as any} onPress={onPress} />);

    fireEvent.press(getByText("Earth Vitawat"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(emp);
  });
});
