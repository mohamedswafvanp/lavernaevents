import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  Mail,
  MessageCircle,
  Smartphone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/card";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useInvitationTemplates } from "@/queries/useInvitationQueries";
import {
  useMarkWhatsAppSentMutation,
  useSendInvitationMutation,
} from "@/queries/useNotificationQueries";
import { toastStore } from "@/stores/toast.store";
import { resolveMediaUrl } from "@/lib/media";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/utils";
import type { Guest } from "@/types/guest.types";
import type { NotificationChannel, NotificationLog } from "@/types/notification.types";

interface SendInvitationDialogProps {
  eventId: number;
  guest: Guest;
  open: boolean;
  onClose: () => void;
}

const CHANNELS: { value: NotificationChannel; label: string; icon: typeof Mail }[] = [
  { value: "WHATSAPP", label: "WhatsApp", icon: MessageCircle },
  { value: "EMAIL", label: "Email", icon: Mail },
  { value: "SMS", label: "SMS", icon: Smartphone },
];

export default function SendInvitationDialog({
  eventId,
  guest,
  open,
  onClose,
}: SendInvitationDialogProps) {
  const isDesktop = useIsDesktop();
  const { data: templates, isLoading: templatesLoading } = useInvitationTemplates();
  const sendMutation = useSendInvitationMutation(eventId);
  const markSentMutation = useMarkWhatsAppSentMutation(eventId);

  const [templateId, setTemplateId] = useState<number | null>(null);
  const [channel, setChannel] = useState<NotificationChannel | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [whatsAppResult, setWhatsAppResult] = useState<NotificationLog | null>(null);

  useEffect(() => {
    if (open) {
      setTemplateId(null);
      setChannel(null);
      setErrorMessage(null);
      setWhatsAppResult(null);
    }
  }, [open]);

  const hasTemplates = !templatesLoading && (templates?.length ?? 0) > 0;
  const canSend = hasTemplates && !!templateId && !!channel;

  const handleSend = () => {
    if (!templateId || !channel) return;
    setErrorMessage(null);

    sendMutation.mutate(
      { guest_id: guest.id, template_id: templateId, channel },
      {
        onSuccess: (log) => {
          if (log.channel === "WHATSAPP" && log.status === "LINK_GENERATED") {
            setWhatsAppResult(log);
            return;
          }

          toastStore.show(
            `Invitation sent via ${log.channel === "EMAIL" ? "Email" : "SMS"}.`
          );
          onClose();
        },
        onError: (error) => {
          setErrorMessage(getApiErrorMessage(error, "Couldn't send this invitation."));
        },
      }
    );
  };

  const handleOpenWhatsApp = () => {
    if (whatsAppResult?.wa_link) {
      window.open(whatsAppResult.wa_link, "_blank");
    }
  };

  const handleMarkSent = () => {
    if (!whatsAppResult) return;

    markSentMutation.mutate(whatsAppResult.id, {
      onSuccess: () => {
        toastStore.show("Invitation marked as sent.");
        onClose();
      },
      onError: (error) => {
        setErrorMessage(getApiErrorMessage(error, "Couldn't mark this as sent."));
      },
    });
  };

  const content = whatsAppResult ? (
    <div className="p-6 sm:p-8">
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-bold text-[var(--brand-navy)]">Open WhatsApp to send</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        LavernaEvents doesn't send WhatsApp messages directly (no Business API) - click
        below to open WhatsApp with the invitation pre-filled for <strong>{guest.name}</strong>,
        then hit send yourself.
      </p>

      <Button className="mt-5 w-full" onClick={handleOpenWhatsApp}>
        <ExternalLink className="h-4 w-4" />
        Open WhatsApp
      </Button>

      <div className="mt-6 border-t border-slate-100 pt-5 text-center">
        <p className="text-sm text-slate-500">Already sent it?</p>
        <Button
          className="mt-3 w-full"
          variant="outline"
          onClick={handleMarkSent}
          isLoading={markSentMutation.isPending}
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark as sent
        </Button>
      </div>

      {errorMessage && <FormError message={errorMessage} />}
    </div>
  ) : (
    <div className="p-6 sm:p-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--brand-navy)]">Send invitation</h2>
          <p className="mt-1 text-sm text-slate-500">To {guest.name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-[var(--brand-navy)]">Template</p>

        {templatesLoading && (
          <p className="mt-2 text-sm text-slate-400">Loading templates...</p>
        )}

        {!templatesLoading && !hasTemplates && (
          <div className="mt-3 rounded-2xl bg-amber-50 p-4">
            <p className="text-sm text-amber-800">No templates available on your plan.</p>
            <Link
              to="/pricing"
              className="mt-2 inline-block text-sm font-semibold text-[var(--brand-pink)]"
            >
              View plans
            </Link>
          </div>
        )}

        {hasTemplates && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {templates!.map((template) => {
              const previewUrl = resolveMediaUrl(template.preview_image);
              const selected = template.id === templateId;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setTemplateId(template.id)}
                  className={cn(
                    "overflow-hidden rounded-xl border-2 text-left transition-colors",
                    selected ? "border-[var(--brand-pink)]" : "border-transparent"
                  )}
                >
                  <div className="flex aspect-[3/4] items-center justify-center bg-slate-100">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={template.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-slate-300" />
                    )}
                  </div>
                  <p className="truncate px-1.5 py-1 text-xs font-medium text-[var(--brand-navy)]">
                    {template.name}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-[var(--brand-navy)]">Channel</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {CHANNELS.map((option) => {
            const disabled = option.value === "EMAIL" && !guest.email;
            const selected = option.value === channel;

            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                onClick={() => setChannel(option.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-3 text-xs font-medium transition-colors",
                  disabled
                    ? "cursor-not-allowed border-slate-100 text-slate-300"
                    : selected
                      ? "border-[var(--brand-pink)] bg-[var(--brand-pink)]/5 text-[var(--brand-pink)]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                <option.icon className="h-5 w-5" />
                {option.label}
              </button>
            );
          })}
        </div>
        {!guest.email && (
          <p className="mt-2 text-xs text-slate-400">No email on file for this guest.</p>
        )}
      </div>

      {errorMessage && <div className="mt-5"><FormError message={errorMessage} /></div>}

      <Button
        className="mt-6 w-full"
        onClick={handleSend}
        disabled={!canSend}
        isLoading={sendMutation.isPending}
      >
        Send
      </Button>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40"
            onClick={onClose}
          />

          {isDesktop ? (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="premium-card relative max-h-[90vh] w-full max-w-lg overflow-y-auto"
              >
                {content}
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mobile-safe-bottom absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white"
            >
              {content}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
