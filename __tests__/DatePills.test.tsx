import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { DatePills } from "@/components/finance/DatePills";

describe("DatePills", () => {
  const options = [
    "Today",
    "Yesterday",
    "This week",
    "This month",
    "This year",
    "Last year",
  ] as const;

  it("renders all date options", () => {
    const onChange = jest.fn();

    const { getByText } = render(
      <DatePills value="Today" onChange={onChange} />
    );

    options.forEach((opt) => {
      expect(getByText(opt)).toBeTruthy();
    });
  });

  it("calls onChange with the pressed option", () => {
    const onChange = jest.fn();

    const { getByText } = render(
      <DatePills value="Today" onChange={onChange} />
    );

    fireEvent.press(getByText("This month"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("This month");
  });

  it("does not call onChange on initial render", () => {
    const onChange = jest.fn();

    render(<DatePills value="Today" onChange={onChange} />);

    expect(onChange).not.toHaveBeenCalled();
  });
});
