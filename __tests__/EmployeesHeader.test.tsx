// __tests__/EmployeesHeader.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EmployeesHeader from "@/components/employees/EmployeesHeader";

describe("EmployeesHeader", () => {
  it("renders title, subtitle, and add button", () => {
    const onAdd = jest.fn();
    const { getByText } = render(<EmployeesHeader onAdd={onAdd} />);

    expect(getByText("Your employees")).toBeTruthy();
    expect(getByText("Manage what others can access")).toBeTruthy();
    expect(getByText("+ Add")).toBeTruthy();
  });

  it("calls onAdd when + Add is pressed", () => {
    const onAdd = jest.fn();
    const { getByText } = render(<EmployeesHeader onAdd={onAdd} />);

    fireEvent.press(getByText("+ Add"));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
