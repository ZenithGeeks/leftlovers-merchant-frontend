import React from "react";
import { render } from "@testing-library/react-native";

import FeedbackWrapper from "@/components/Home/Feedback/FeedbackWrapper";

// ✅ Mock child so we can inspect props passed into it

const mockCustomerFeedbackCard = jest.fn((props: any) => null);

jest.mock("@/components/Home/Feedback/CustomerFeedbackCard", () => {
  return {
    __esModule: true,
    default: (props: any) => mockCustomerFeedbackCard(props),
  };
});

describe("FeedbackWrapper", () => {
  beforeEach(() => {
    mockCustomerFeedbackCard.mockClear();
    jest.useRealTimers();
  });

  it("passes zeros when reviews is null/undefined and warnings is null/undefined", () => {
    render(<FeedbackWrapper reviews={null} warnings={null} />);

    expect(mockCustomerFeedbackCard).toHaveBeenCalledTimes(1);
    const props = mockCustomerFeedbackCard.mock.calls[0][0];

    expect(props.average).toBe(0);
    expect(props.totalReviews).toBe(0);
    expect(props.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    expect(props.warnings).toBe(0);
    expect(typeof props.onPress).toBe("function");
  });

  it("computes average using Number(rating)||0", () => {
    render(
      <FeedbackWrapper
        reviews={[
          { rating: 5 },
          { rating: 4 },
          { rating: Number.NaN as any }, // -> 0
        ]}
        warnings={[]}
      />
    );

    const props = mockCustomerFeedbackCard.mock.calls[0][0];

    // (5 + 4 + 0) / 3 = 3
    expect(props.average).toBe(3);
    expect(props.totalReviews).toBe(3);
  });

  it("builds distribution using rounded ratings clamped to 1..5", () => {
    render(
      <FeedbackWrapper
        reviews={[
          { rating: 4.2 }, // round -> 4
          { rating: 4.6 }, // round -> 5
          { rating: 0 }, // round -> 0 -> clamp -> 1
          { rating: 10 }, // round -> 10 -> clamp -> 5
          { rating: 2.4 }, // round -> 2
        ]}
        warnings={[]}
      />
    );

    const props = mockCustomerFeedbackCard.mock.calls[0][0];

    expect(props.distribution).toEqual({
      1: 1,
      2: 1,
      3: 0,
      4: 1,
      5: 2,
    });
    expect(props.totalReviews).toBe(5);
  });

  it("counts active warnings: keeps ones with no expiresAt, filters expired/invalid dates", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));

    render(
      <FeedbackWrapper
        reviews={[]}
        warnings={[
          { expiresAt: null }, // ✅ counted (no expiresAt)
          {}, // ✅ counted (no expiresAt)
          { expiresAt: "invalid-date" }, // ❌ not counted
          { expiresAt: "2024-12-31T23:59:59.000Z" }, // ❌ expired
          { expiresAt: "2025-01-01T00:00:01.000Z" }, // ✅ active
        ]}
      />
    );

    const props = mockCustomerFeedbackCard.mock.calls[0][0];

    expect(props.warnings).toBe(3); // null + missing + future
  });

  it("always passes onPress={() => null}", () => {
    render(<FeedbackWrapper reviews={[]} warnings={[]} />);

    const props = mockCustomerFeedbackCard.mock.calls[0][0];

    expect(typeof props.onPress).toBe("function");
    expect(props.onPress()).toBeNull();
  });
});
