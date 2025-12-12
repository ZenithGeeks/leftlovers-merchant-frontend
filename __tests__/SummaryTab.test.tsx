// __tests__/SummaryTab.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { SummaryTab } from "@/components/finance/SummaryTab";
import type { Summary } from "@/types/finance";

// ✅ Mock icon (prevents native/vector-icons issues in Jest)
jest.mock("react-native-vector-icons/FontAwesome5", () => "FontAwesome5");

describe("SummaryTab", () => {
  const sample: Summary = {
    netSales: 1234.5,
    earnings: 999.9,
    deduction: 12.345,
    netEarnings: 987.65,
  };

  it("renders date info and summary values", () => {
    const onDateChange = jest.fn();

    const { getByText } = render(
      <SummaryTab selectedDate="Today" onDateChange={onDateChange} data={sample} />
    );

    // Date pills + info line
    expect(getByText("Today")).toBeTruthy();
    expect(getByText("Showing data for Today")).toBeTruthy();

    // Top numbers (with + prefix and toFixed(2))
    expect(getByText("+ 1234.50 ฿")).toBeTruthy();
    expect(getByText("+ 999.90 ฿")).toBeTruthy();

    // Section header
    expect(getByText("Summary Details")).toBeTruthy();

    // Card values
    expect(getByText("1234.50 ฿")).toBeTruthy(); // Net Sales (card)
    expect(getByText("-12.35 ฿")).toBeTruthy();  // Deduction
    expect(getByText("+987.65 ฿")).toBeTruthy(); // Net Earnings
  });

  it("calls onDateChange when a pill is pressed", () => {
    const onDateChange = jest.fn();

    const { getByText } = render(
      <SummaryTab selectedDate="Today" onDateChange={onDateChange} data={sample} />
    );

    fireEvent.press(getByText("This month"));
    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect(onDateChange).toHaveBeenCalledWith("This month");
  });
});
