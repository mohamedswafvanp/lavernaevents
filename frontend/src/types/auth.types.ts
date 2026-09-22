export type UserRole = "ADMIN" | "ORGANIZER" | "PHOTOGRAPHER" | "GUEST";

export interface User {
  id: number;
  full_name: string;
  email: string;
  mobile_number: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  mobile_number: string;
  password: string;
  password_confirm: string;
}

export interface LoginPayload {
  mobile_number: string;
  password: string;
}

export interface VerifyMobilePayload {
  mobile_number: string;
  code: string;
}

export interface ResendOtpPayload {
  mobile_number: string;
}

export interface VerifyMobileResult {
  id: number;
  mobile_number: string;
  is_verified: boolean;
}
