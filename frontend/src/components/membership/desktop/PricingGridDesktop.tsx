import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  Check,
  HardDrive,
  Images,
  LayoutTemplate,
  Tag,
  Users,
  X,
} from "lucide-react";
import { Card, FormError } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlans, useSubscribeMutation } from "@/queries/useMembershipQueries";
import { useCreateCheckoutSessionMutation } from "@/queries/usePaymentQueries";
import { useAuthStore } from "@/stores/auth.store";
import { formatPrice, formatStorage } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/utils";
import type { MembershipPlan } from "@/types/membership.types";

function FeatureRow({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {enabled ? (
        <Check className="h-4 w-4 shrink-0 text-emerald-500" />
      ) : (
        <X className="h-4 w-4 shrink-0 text-slate-300" />
      )}
      <span className={enabled ? "text-slate-600" : "text-slate-400"}>{label}</span>
    </div>
  );
}

export default function PricingGridDesktop() {
  const { data: plans, isLoading, isError } = usePlans();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightedSlug = searchParams.get("plan");

  const subscribeMutation = useSubscribeMutation();
  const checkoutMutation = useCreateCheckoutSessionMutation();

  const handleSelectPlan = (plan: MembershipPlan) => {
    if (Number(plan.price) === 0) {
      subscribeMutation.mutate(plan.slug, {
        onSuccess: () => navigate("/portal"),
      });
    } else {
      checkoutMutation.mutate(plan.slug, {
        onSuccess: (result) => {
          window.location.href = result.checkout_url;
        },
      });
    }
  };

  return (
    <div className="gradient-mesh-subtle min-h-[70vh] px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-6xl text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)]">
            <Tag className="h-6 w-6" />
          </span>
          <h1 className="mt-6 text-4xl font-bold text-[var(--brand-navy)]">Pricing</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-500">
            Choose the plan that fits how you're planning. Upgrade any time as your event
            grows.
          </p>
        </motion.div>

        {isError && (
          <p className="mt-10 text-sm text-rose-600">
            Couldn't load plans right now. Please refresh the page.
          </p>
        )}

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-8 text-left">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="mt-4 h-9 w-32" />
                <Skeleton className="mt-6 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <Skeleton className="mt-8 h-11 w-full rounded-full" />
              </Card>
            ))}

          {!isLoading &&
            plans?.map((plan) => {
              const isFree = Number(plan.price) === 0;
              const isHighlighted = plan.slug === highlightedSlug;
              const isSubscribePending =
                subscribeMutation.isPending && subscribeMutation.variables === plan.slug;
              const isCheckoutPending =
                checkoutMutation.isPending && checkoutMutation.variables === plan.slug;
              const cardError =
                (subscribeMutation.isError && subscribeMutation.variables === plan.slug
                  ? getApiErrorMessage(subscribeMutation.error, "Couldn't select this plan.")
                  : null) ??
                (checkoutMutation.isError && checkoutMutation.variables === plan.slug
                  ? getApiErrorMessage(checkoutMutation.error, "Couldn't start checkout.")
                  : null);

              return (
                <motion.div
                  key={plan.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4 }}
                >
                  <Card
                    className={cn(
                      "flex h-full flex-col p-8 text-left",
                      isHighlighted && "border-2 border-[var(--brand-pink)] soft-shadow-lg"
                    )}
                  >
                    {isHighlighted && (
                      <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-[var(--brand-pink)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-pink)]">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Recommended for you
                      </span>
                    )}

                    <h3 className="text-lg font-semibold text-[var(--brand-navy)]">
                      {plan.name}
                    </h3>
                    <p className="mt-3 text-3xl font-bold text-[var(--brand-navy)]">
                      {formatPrice(plan.price)}
                      {!isFree && (
                        <span className="text-base font-medium text-slate-400">
                          {" "}
                          / {plan.duration_days} days
                        </span>
                      )}
                    </p>
                    {plan.description && (
                      <p className="mt-3 text-sm text-slate-500">{plan.description}</p>
                    )}

                    <div className="mt-6 space-y-2.5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4 shrink-0 text-slate-400" />
                        Up to {plan.guest_limit} guests
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                        {plan.event_limit} active event{plan.event_limit === 1 ? "" : "s"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <HardDrive className="h-4 w-4 shrink-0 text-slate-400" />
                        {formatStorage(plan.storage_limit_mb)} storage
                      </div>
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <LayoutTemplate className="h-4 w-4 shrink-0 translate-y-0.5 text-slate-400" />
                        <span>
                          {plan.template_names.length > 0
                            ? plan.template_names.slice(0, 3).join(", ") +
                              (plan.template_names.length > 3
                                ? ` +${plan.template_names.length - 3} more`
                                : "")
                            : "No templates included"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2 border-t border-slate-100 pt-6">
                      <FeatureRow enabled={plan.gallery_enabled} label="Photo gallery" />
                      <FeatureRow enabled={plan.qr_code_enabled} label="QR guest passes" />
                      <FeatureRow
                        enabled={plan.photographer_access_enabled}
                        label="Photographer access"
                      />
                    </div>

                    <div className="mt-8">
                      {!user ? (
                        <Link
                          to={`/register?plan=${plan.slug}`}
                          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--brand-pink)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-pink-dark)]"
                        >
                          Get started
                        </Link>
                      ) : (
                        <Button
                          className="w-full"
                          variant={isFree ? "primary" : "navy"}
                          isLoading={isSubscribePending || isCheckoutPending}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          {isFree ? "Select this plan" : "Choose plan"}
                        </Button>
                      )}
                      {cardError && <FormError message={cardError} />}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
        </div>

        {!isLoading && plans && plans.length === 0 && (
          <p className="mt-10 text-sm text-slate-500">
            No plans are available right now. Check back soon.
          </p>
        )}

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Camera className="h-4 w-4" />
          <Images className="h-4 w-4" />
          All plans include secure event photo storage.
        </div>
      </div>
    </div>
  );
}
