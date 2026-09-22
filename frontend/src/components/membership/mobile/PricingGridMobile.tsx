import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  HardDrive,
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

export default function PricingGridMobile() {
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
    <div className="gradient-mesh-subtle mobile-safe-bottom min-h-[70vh] px-4 pb-10 pt-12">
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)]">
          <Tag className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-[var(--brand-navy)]">Pricing</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
          Swipe to compare plans. Upgrade any time as your event grows.
        </p>
      </div>

      {isError && (
        <p className="mt-8 text-center text-sm text-rose-600">
          Couldn't load plans right now. Please refresh the page.
        </p>
      )}

      <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
        {isLoading &&
          Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="w-[85vw] shrink-0 snap-center p-6">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="mt-4 h-8 w-28" />
              <Skeleton className="mt-6 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
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
              <Card
                key={plan.slug}
                className={cn(
                  "w-[85vw] shrink-0 snap-center p-6",
                  isHighlighted && "border-2 border-[var(--brand-pink)] soft-shadow-lg"
                )}
              >
                {isHighlighted && (
                  <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-[var(--brand-pink)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-pink)]">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Recommended
                  </span>
                )}

                <h3 className="text-lg font-semibold text-[var(--brand-navy)]">{plan.name}</h3>
                <p className="mt-2 text-2xl font-bold text-[var(--brand-navy)]">
                  {formatPrice(plan.price)}
                  {!isFree && (
                    <span className="text-sm font-medium text-slate-400">
                      {" "}
                      / {plan.duration_days} days
                    </span>
                  )}
                </p>
                {plan.description && (
                  <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
                )}

                <div className="mt-5 space-y-2">
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

                <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">
                  <FeatureRow enabled={plan.gallery_enabled} label="Photo gallery" />
                  <FeatureRow enabled={plan.qr_code_enabled} label="QR guest passes" />
                  <FeatureRow
                    enabled={plan.photographer_access_enabled}
                    label="Photographer access"
                  />
                </div>

                <div className="mt-6">
                  {!user ? (
                    <Link
                      to={`/register?plan=${plan.slug}`}
                      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--brand-pink)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-pink-dark)]"
                    >
                      Get started
                    </Link>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
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
            );
          })}
      </div>

      {!isLoading && plans && plans.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-500">
          No plans are available right now. Check back soon.
        </p>
      )}
    </div>
  );
}
