import { useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createCheckoutSession, getPaymentStatus } from "@/api/payments.api";
import type { Payment } from "@/types/payment.types";

export function useCreateCheckoutSessionMutation() {
  return useMutation({
    mutationFn: (planSlug: string) => createCheckoutSession(planSlug),
  });
}

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 8;

interface PaymentStatusPollingResult {
  payment: Payment | null;
  isPolling: boolean;
  hasTimedOut: boolean;
}

// Polls GET /payments/status/<session_id>/ every 2s (up to 8 attempts, ~15s
// total) because activation happens via Stripe webhook, which can land
// slightly after the browser's redirect back from Checkout - so the first
// read right after redirect may still show CREATED.
export function usePaymentStatusPolling(
  sessionId: string | undefined
): PaymentStatusPollingResult {
  const attemptsRef = useRef(0);

  const query = useQuery<Payment>({
    queryKey: ["payments", "status", sessionId],
    queryFn: () => {
      attemptsRef.current += 1;
      return getPaymentStatus(sessionId as string);
    },
    enabled: !!sessionId,
    retry: false,
    refetchInterval: (currentQuery) => {
      const currentStatus = currentQuery.state.data?.status;
      const settled = currentStatus === "PAID" || currentStatus === "FAILED";
      const exhausted = attemptsRef.current >= MAX_ATTEMPTS;
      return settled || exhausted ? false : POLL_INTERVAL_MS;
    },
  });

  const settled = query.data?.status === "PAID" || query.data?.status === "FAILED";
  const hasTimedOut = !!sessionId && !settled && attemptsRef.current >= MAX_ATTEMPTS;
  const isPolling = !!sessionId && !settled && !hasTimedOut;

  return {
    payment: query.data ?? null,
    isPolling,
    hasTimedOut,
  };
}
