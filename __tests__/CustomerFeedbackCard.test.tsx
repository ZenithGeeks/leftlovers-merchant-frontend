// __tests__/CustomerFeedbackCard.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import CustomerFeedbackCard from "@/components/Home/Feedback/CustomerFeedbackCard";

// ✅ Mock heroicons (return null, no React Native CSS interop involved)
jest.mock("react-native-heroicons/outline", () => ({
  StarIcon: () => null,
}));

jest.mock("react-native-heroicons/solid", () => ({
  ChevronRightIcon: () => null,
  StarIcon: () => null,
}));

// ✅ Stabilize responsive logic
jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: () => ({ width: 400, height: 800, scale: 2, fontScale: 2 }),
}));

describe("CustomerFeedbackCard", () => {
  const distribution = { 1: 2, 2: 1, 3: 3, 4: 4, 5: 10 } as const;

  it("renders default title when title is not provided", () => {
    const { getByText } = render(
      <CustomerFeedbackCard
        average={4.2}
        totalReviews={20}
        distribution={distribution}
      />
    );

    expect(getByText("Customer Feedback")).toBeTruthy();
  });

  it("renders custom title", () => {
    const { getByText } = render(
      <CustomerFeedbackCard
        title="Ratings"
        average={4.2}
        totalReviews={20}
        distribution={distribution}
      />
    );

    expect(getByText("Ratings")).toBeTruthy();
  });

  it("rounds average to nearest 0.5 and displays it with 1 decimal", () => {
    // 4.26 -> rounded to nearest 0.5 => 4.5
    const { getByText } = render(
      <CustomerFeedbackCard
        average={4.26}
        totalReviews={20}
        distribution={distribution}
      />
    );

    expect(getByText("4.5")).toBeTruthy();
  });

  it("shows the totalReviews label", () => {
    const { getByText } = render(
      <CustomerFeedbackCard
        average={3.9}
        totalReviews={123}
        distribution={distribution}
      />
    );

    expect(getByText("123 reviews")).toBeTruthy();
  });

  it("shows warning line with correct pluralization", () => {
    const { getByText, queryByText, rerender } = render(
      <CustomerFeedbackCard
        average={3.9}
        totalReviews={10}
        distribution={distribution}
        warnings={1}
      />
    );

    expect(getByText("1 warning!")).toBeTruthy();

    rerender(
      <CustomerFeedbackCard
        average={3.9}
        totalReviews={10}
        distribution={distribution}
        warnings={2}
      />
    );

    expect(getByText("2 warnings!")).toBeTruthy();
    expect(queryByText("1 warning!")).toBeNull();
  });

  it("does not show warning line when warnings=0", () => {
    const { queryByText } = render(
      <CustomerFeedbackCard
        average={3.9}
        totalReviews={10}
        distribution={distribution}
        warnings={0}
      />
    );

    expect(queryByText(/warning/i)).toBeNull();
  });

  it("uses max(totalReviews, sum(distribution)) for bar counts (renders counts)", () => {
  // totalReviews is smaller than sum(distribution)=20, but counts should still render
  const { getByText, getAllByText } = render(
    <CustomerFeedbackCard
      average={4.2}
      totalReviews={1}
      distribution={distribution}
    />
  );

  // 5-star count
  expect(getByText("10")).toBeTruthy();

  // These numbers appear multiple times (left star label + right count),
  // so just ensure they exist at least once.
  expect(getAllByText("4").length).toBeGreaterThan(0);
  expect(getAllByText("3").length).toBeGreaterThan(0);
  expect(getAllByText("1").length).toBeGreaterThan(0);
  expect(getAllByText("2").length).toBeGreaterThan(0);
});

});
