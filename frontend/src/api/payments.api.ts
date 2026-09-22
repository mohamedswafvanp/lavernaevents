import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api.types";
import type { CreateCheckoutSessionResponse, Payment } from "@/types/payment.types";

export async function createCheckoutSession(
  planSlug: string
): Promise<CreateCheckoutSessionResponse> {
  const { data } = await apiClient.post<ApiResponse<CreateCheckoutSessionResponse>>(
    "/payments/create-checkout-session/",
    { plan_slug: planSlug }
  );
  return data.data;
}

export async function getPaymentStatus(sessionId: string): Promise<Payment> {
  const { data } = await apiClient.get<ApiResponse<Payment>>(
    `/payments/status/${sessionId}/`
  );
  return data.data;
}
