// __tests__/PayoutTab.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import dayjs from "dayjs";

import { PayoutTab } from "@/components/finance/PayoutTab";
import { filterByDateRange } from "@/utils/financeFilters";
import type { Payout } from "@/types/finance";

// ✅ Mock filter util so tests don't depend on current date/time logic
jest.mock("@/utils/financeFilters", () => ({
  filterByDateRange: jest.fn(),
}));

// ✅ Mock icon to avoid react-native-svg / native issues in Jest
jest.mock("react-native-heroicons/outline", () => ({
  CheckIcon: () => null,
}));

const mockFilter = filterByDateRange as unknown as jest.Mock;

// ✅ helper input type: allow processedAt to be null for tests
type PayoutInput = Omit<Partial<Payout>, "processedAt"> & {
  id: string;
  processedAt?: string | null;
};

const makePayout = (p: PayoutInput): Payout =>
  ({
    id: p.id,
    detailDate: p.detailDate ?? "2025-12-12",
    processedAt: p.processedAt ?? null, // ✅ now allowed in input type
    status: p.status ?? "Pending",
    amountTHB: p.amountTHB ?? 0,
  } as Payout);

describe("PayoutTab", () => {
  beforeEach(() => {
    mockFilter.mockReset();
  });

  it("renders empty state when no payouts found", () => {
    mockFilter.mockReturnValue([]);

    const onDateChange = jest.fn();
    const { getByText } = render(
      <PayoutTab date="Today" onDateChange={onDateChange} data={[]} />
    );

    expect(getByText("Today")).toBeTruthy();
    expect(getByText("No payouts found")).toBeTruthy();
  });

  it("renders payouts and shows correct status labels + amounts", () => {
    const payouts: Payout[] = [
      makePayout({
        id: "p1",
        detailDate: "2025-12-12",
        status: "Transferred",
        processedAt: null,
        amountTHB: 100,
      }),
      makePayout({
        id: "p2",
        detailDate: "2025-12-10",
        status: "Pending",
        amountTHB: 55.5,
      }),
      makePayout({
        id: "p3",
        detailDate: "2025-12-09",
        status: "Failed",
        amountTHB: 12.345,
      }),
    ];

    mockFilter.mockReturnValue(payouts);

    const onDateChange = jest.fn();
    const { getByText, getAllByText, queryByText } = render(
      <PayoutTab date="Today" onDateChange={onDateChange} data={payouts} />
    );

    expect(queryByText("No payouts found")).toBeNull();

    expect(getByText("2025-12-12")).toBeTruthy();
    expect(getByText("2025-12-10")).toBeTruthy();
    expect(getByText("2025-12-09")).toBeTruthy();

    expect(getByText("100.00 ฿")).toBeTruthy();
    expect(getByText("55.50 ฿")).toBeTruthy();
    expect(getByText("12.35 ฿")).toBeTruthy();

    expect(getAllByText("Transferred")).toHaveLength(2);
    expect(getByText("Pending")).toBeTruthy();
    expect(getByText("Failed")).toBeTruthy();

    expect(
      getByText(`Scheduled for ${dayjs("2025-12-10").format("DD/MM/YYYY")}`)
    ).toBeTruthy();
    expect(
      getByText(`Scheduled for ${dayjs("2025-12-09").format("DD/MM/YYYY")}`)
    ).toBeTruthy();
  });

  it("calls onDateChange when a pill is pressed", () => {
    mockFilter.mockReturnValue([]);

    const onDateChange = jest.fn();
    const { getByText } = render(
      <PayoutTab date="Today" onDateChange={onDateChange} data={[]} />
    );

    fireEvent.press(getByText("This month"));
    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect(onDateChange).toHaveBeenCalledWith("This month");
  });

  it("renders processed timestamp when status is Transferred and processedAt is valid", () => {
    const payouts: Payout[] = [
      makePayout({
        id: "p1",
        detailDate: "2025-12-12",
        status: "Transferred",
        processedAt: "2025-12-12T08:30:00.000Z",
        amountTHB: 100,
      }),
    ];

    mockFilter.mockReturnValue(payouts);

    const onDateChange = jest.fn();
    const { getByText, queryByText } = render(
      <PayoutTab date="Today" onDateChange={onDateChange} data={payouts} />
    );

    expect(getByText("Transferred")).toBeTruthy();

    const formatted = dayjs("2025-12-12T08:30:00.000Z").format(
      "DD/MM/YYYY hh:mma"
    );
    expect(getByText(formatted)).toBeTruthy();

    expect(queryByText(/^Scheduled for /)).toBeNull();
  });
});
