import feedbackData from "@/mockupData/feedback.json";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import CustomerFeedbackCard from "./CustomerFeedbackCard";

export default function FeedbackWrapper() {
  const router = useRouter();
  const { reviews, warnings } = feedbackData;
  const average = useMemo(() => {
    if (!reviews?.length) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const distribution = useMemo(() => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<
      1 | 2 | 3 | 4 | 5,
      number
    >;
    reviews.forEach((r) => {
      const rating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
      dist[rating] += 1;
    });
    return dist;
  }, [reviews]);
  const warningCount = useMemo(() => {
    const now = new Date();
    return warnings.filter((w) => !w.expiresAt || new Date(w.expiresAt) > now)
      .length;
  }, [warnings]);

  return (
    <CustomerFeedbackCard
      average={average}
      totalReviews={reviews.length}
      distribution={distribution}
      warnings={warningCount}
      onPress={() => router.push("/reviews")}
    />
  );
}
