export type InvitationStatus = "NOT_SENT" | "SENT" | "FAILED";
export type ResponseStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "MAYBE";

export interface Guest {
  id: number;
  name: string;
  mobile_number: string;
  email: string;
  family_member_count: number;
  invitation_status: InvitationStatus;
  response_status: ResponseStatus;
  responded_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

// The backend doesn't slim this down for the list endpoint (unlike Events),
// so it's the same shape - kept as a distinct alias for call-site clarity.
export type GuestListItem = Guest;

export interface CreateGuestPayload {
  name: string;
  mobile_number: string;
  email?: string;
  family_member_count?: number;
  notes?: string;
}

export type UpdateGuestPayload = Partial<CreateGuestPayload>;

export interface CSVImportSkippedRow {
  row: number;
  reason: string;
}

export interface CSVImportResult {
  created_count: number;
  skipped_count: number;
  skipped_rows: CSVImportSkippedRow[];
}
