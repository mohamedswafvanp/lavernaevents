export interface MembershipPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  // DRF DecimalField serializes as a string (e.g. "49.00"), not a number.
  price: string;
  duration_days: number;
  guest_limit: number;
  event_limit: number;
  template_names: string[];
  storage_limit_mb: number;
  gallery_enabled: boolean;
  qr_code_enabled: boolean;
  photographer_access_enabled: boolean;
  display_order: number;
}

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface Subscription {
  id: number;
  plan: MembershipPlan;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string;
  cancelled_at: string | null;
}

export interface UsageSummary {
  plan_name: string;
  has_active_plan: boolean;
  guest_limit: number | null;
  event_limit: number | null;
  template_count: number | null;
  storage_limit_mb: number | null;
  gallery_enabled: boolean;
  qr_code_enabled: boolean;
  photographer_access_enabled: boolean;
}

export type PortalNextStep = "verify_mobile" | "select_plan" | null;

export interface PortalAccess {
  can_access_portal: boolean;
  next_step: PortalNextStep;
}

export type PlanChangeType = "upgrade" | "downgrade" | "same";

export interface ChangePlanResult {
  change_type: PlanChangeType;
  subscription: Subscription;
}
