export type PaymentStatus = "CREATED" | "PAID" | "FAILED";

export interface Payment {
  id: number;
  plan_name: string;
  stripe_checkout_session_id: string;
  // DRF DecimalField serializes as a string (e.g. "49.00"), not a number.
  amount: string;
  currency: string;
  status: PaymentStatus;
  created_at: string;
}

export interface CreateCheckoutSessionResponse {
  checkout_url: string;
  stripe_checkout_session_id: string;
}
