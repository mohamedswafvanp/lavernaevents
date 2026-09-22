import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { FormError } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { guestSchema, type GuestFormInput, type GuestFormValues } from "@/schemas/guest.schema";
import { useCreateGuestMutation, useUpdateGuestMutation } from "@/queries/useGuestQueries";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/utils";
import type { CreateGuestPayload, Guest } from "@/types/guest.types";

interface GuestFormDesktopProps {
  eventId: number;
  open: boolean;
  existingGuest?: Guest;
  onClose: () => void;
}

export default function GuestFormDesktop({
  eventId,
  open,
  existingGuest,
  onClose,
}: GuestFormDesktopProps) {
  const isEditMode = !!existingGuest;
  const createMutation = useCreateGuestMutation(eventId);
  const updateMutation = useUpdateGuestMutation(eventId);
  const activeMutation = isEditMode ? updateMutation : createMutation;

  const [limitError, setLimitError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<GuestFormInput, unknown, GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: existingGuest?.name ?? "",
      mobile_number: existingGuest?.mobile_number ?? "",
      email: existingGuest?.email ?? "",
      family_member_count: existingGuest?.family_member_count ?? 3,
      notes: existingGuest?.notes ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: existingGuest?.name ?? "",
        mobile_number: existingGuest?.mobile_number ?? "",
        email: existingGuest?.email ?? "",
        family_member_count: existingGuest?.family_member_count ?? 3,
        notes: existingGuest?.notes ?? "",
      });
      setLimitError(null);
      setDuplicateError(null);
    }
  }, [open, existingGuest, reset]);

  const familyCount = watch("family_member_count");

  const onSubmit = (values: GuestFormValues) => {
    setLimitError(null);
    setDuplicateError(null);

    const payload: CreateGuestPayload = { ...values };

    const onError = (error: unknown) => {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const message = getApiErrorMessage(error, "");

        // The backend reports both "guest limit reached" and "duplicate
        // mobile number" as 409, with no machine-readable error code in
        // the response body (only used server-side to pick the status) -
        // so telling them apart means matching the message text itself.
        if (status === 409 && message.toLowerCase().includes("already on the guest list")) {
          setDuplicateError(message);
          return;
        }

        if (status === 402 || status === 409) {
          setLimitError(message || "You've reached your plan's guest limit.");
          return;
        }
      }
    };

    if (isEditMode) {
      updateMutation.mutate(
        { guestId: existingGuest.id, payload },
        { onSuccess: onClose, onError }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: onClose, onError });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="premium-card relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-8"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-xl font-bold text-[var(--brand-navy)]">
              {isEditMode ? "Edit guest" : "Add a guest"}
            </h2>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" hasError={!!errors.name} {...register("name")} />
                <FormError message={errors.name?.message} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mobile_number">Mobile number</Label>
                  <Input
                    id="mobile_number"
                    inputMode="numeric"
                    placeholder="9876543210"
                    hasError={!!errors.mobile_number}
                    {...register("mobile_number")}
                  />
                  <FormError message={errors.mobile_number?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Optional"
                    hasError={!!errors.email}
                    {...register("email")}
                  />
                  <FormError message={errors.email?.message} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="family_member_count">Family members</Label>
                <Input
                  id="family_member_count"
                  type="number"
                  min={0}
                  max={50}
                  hasError={!!errors.family_member_count}
                  {...register("family_member_count")}
                />
                {typeof familyCount === "number" && familyCount >= 40 && !errors.family_member_count && (
                  <p className="text-xs text-amber-600">That's a big party - just checking this is right.</p>
                )}
                <FormError message={errors.family_member_count?.message} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  rows={2}
                  className={cn(
                    "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-[var(--brand-navy)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]/40",
                    errors.notes
                      ? "border-rose-300 focus:ring-rose-300/40"
                      : "border-slate-200 focus:border-[var(--brand-pink)]"
                  )}
                  placeholder="Dietary preferences, seating notes, etc."
                  {...register("notes")}
                />
                <FormError message={errors.notes?.message} />
              </div>

              {limitError && (
                <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">{limitError}</p>
                    <Link
                      to="/pricing"
                      className="mt-2 inline-block text-sm font-semibold text-[var(--brand-pink)]"
                    >
                      View plans
                    </Link>
                  </div>
                </div>
              )}

              {duplicateError && <FormError message={duplicateError} />}

              {!limitError && !duplicateError && activeMutation.isError && (
                <FormError
                  message={getApiErrorMessage(
                    activeMutation.error,
                    "Couldn't save this guest. Please try again."
                  )}
                />
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={activeMutation.isPending}>
                  {isEditMode ? "Save changes" : "Add guest"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
