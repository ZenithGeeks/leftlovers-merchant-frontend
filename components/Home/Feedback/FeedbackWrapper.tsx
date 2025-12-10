import feedbackData from "@/mockupData/feedback.json";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import CustomerFeedbackCard from "./CustomerFeedbackCard";

type FeedbackReview = {
  rating: number;
};

type FeedbackWarning = {
  expiresAt?: string | null;
};

interface FeedbackWrapperProps {
  reviews?: FeedbackReview[] | null;
  warnings?: FeedbackWarning[] | null;
}

export default function FeedbackWrapper({
  reviews,
  warnings,
}: FeedbackWrapperProps) {
  const router = useRouter();
  const safeReviews = reviews ?? [];
  const safeWarnings = warnings ?? [];

  const average = useMemo(() => {
    if (!safeReviews.length) return 0;
    return (
      safeReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
      safeReviews.length
    );
  }, [safeReviews]);

  const distribution = useMemo(() => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<
      1 | 2 | 3 | 4 | 5,
      number
    >;

    safeReviews.forEach((r) => {
      const n = Math.round(Number(r.rating) || 0);
      const rating = Math.min(5, Math.max(1, n)) as 1 | 2 | 3 | 4 | 5;
      dist[rating] += 1;
    });

    return dist;
  }, [safeReviews]);

  const activeWarnings = useMemo(() => {
    const now = new Date();
    return safeWarnings.filter((w) => {
      if (!w.expiresAt) return true;
      const d = new Date(w.expiresAt);
      return !Number.isNaN(d.getTime()) && d > now;
    }).length;
  }, [safeWarnings]);

  return (
    <CustomerFeedbackCard
      average={average}
      totalReviews={safeReviews.length}
      distribution={distribution}
      warnings={activeWarnings}
      onPress={() => router.push('/(pages)/reviews')}
    />
  );
}
