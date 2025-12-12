// __tests__/TransactionTab.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { TransactionTab } from "@/components/finance/TransactionTab";
import type { Transaction } from "@/types/finance";

describe("TransactionTab", () => {
  it("renders empty state when no transactions found", () => {
    const onDateChange = jest.fn();

    const { getByText } = render(
      <TransactionTab date="Today" onDateChange={onDateChange} data={[]} />
    );

    // DatePills still visible
    expect(getByText("Today")).toBeTruthy();
    expect(getByText("No transactions found")).toBeTruthy();
  });

  it("renders transaction rows with short order id + amount", () => {
    const onDateChange = jest.fn();

    const data: Transaction[] = [
      {
        id: "12345678abcdef", // short => 12345678
        date: "2025-12-12",
        amountTHB: 100,
      } as Transaction,
      {
        id: "abcd", // short => abcd
        date: "2025-12-11",
        amountTHB: 55.5,
      } as Transaction,
    ];

    const { getByText, queryByText } = render(
      <TransactionTab date="Today" onDateChange={onDateChange} data={data} />
    );

    // not empty state
    expect(queryByText("No transactions found")).toBeNull();

    // rows
    expect(getByText("Order #12345678")).toBeTruthy();
    expect(getByText("2025-12-12")).toBeTruthy();
    expect(getByText("100.00 ฿")).toBeTruthy();

    expect(getByText("Order #abcd")).toBeTruthy();
    expect(getByText("2025-12-11")).toBeTruthy();
    expect(getByText("55.50 ฿")).toBeTruthy();
  });

  it("calls onDateChange when a pill is pressed", () => {
    const onDateChange = jest.fn();

    const { getByText } = render(
      <TransactionTab date="Today" onDateChange={onDateChange} data={[]} />
    );

    fireEvent.press(getByText("This month"));
    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect(onDateChange).toHaveBeenCalledWith("This month");
  });
});
