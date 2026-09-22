export interface InvitationTemplate {
  id: number;
  name: string;
  description: string;
  preview_image: string | null;
  display_order: number;
}

export type InvitationStatus = "GENERATED" | "FAILED";

export interface Invitation {
  id: number;
  guest: number;
  guest_name: string;
  template: number;
  template_name: string;
  response_token: string;
  image_file: string | null;
  pdf_file: string | null;
  status: InvitationStatus;
  created_at: string;
}
