import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import logo from "@/assets/laverna-logo.png";
import { FormError } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { verifyMobileSchema, type VerifyMobileFormValues } from "@/schemas/auth.schema";
import { useResendOtpMutation, useVerifyMobileMutation } from "@/queries/useAuthQueries";
import { getApiErrorMessage } from "@/lib/apiError";

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyMobileFormMobile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mobileFromQuery = searchParams.get("mobile") ?? "";
  const planSlug = searchParams.get("plan");

  const verifyMutation = useVerifyMobileMutation();
  const resendMutation = useResendOtpMutation();
  const [cooldown, setCooldown] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyMobileFormValues>({
    resolver: zodResolver(verifyMobileSchema),
    defaultValues: { mobile_number: mobileFromQuery, code: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = (values: VerifyMobileFormValues) => {
    verifyMutation.mutate(values, {
      onSuccess: () => {
        const planParam = planSlug ? `?plan=${planSlug}` : "";
        navigate(`/login${planParam}`, { state: { verified: true } });
      },
    });
  };

  const handleResend = () => {
    if (cooldown > 0 || !mobileFromQuery) return;

    resendMutation.mutate(
      { mobile_number: mobileFromQuery },
      { onSuccess: () => setCooldown(RESEND_COOLDOWN_SECONDS) }
    );
  };

  return (
    <div className="gradient-mesh-subtle mobile-safe-bottom flex min-h-screen flex-col justify-center px-5 pb-10 pt-8">
      <div className="flex justify-center">
        <Link to="/">
          <img src={logo} alt="LavernaEvents" className="h-10 w-auto object-contain" />
        </Link>
      </div>

      <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)]">
        <ShieldCheck className="h-7 w-7" />
      </div>

      <div className="mt-4 text-center">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Verify your mobile</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-[var(--brand-navy)]">
            {mobileFromQuery || "your mobile number"}
          </span>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <OtpInput
                value={field.value}
                onChange={field.onChange}
                hasError={!!errors.code}
                autoFocus
              />
              <FormError message={errors.code?.message} />
            </div>
          )}
        />

        {verifyMutation.isError && (
          <FormError message={getApiErrorMessage(verifyMutation.error, "Invalid or expired code.")} />
        )}

        <Button type="submit" className="w-full" size="lg" isLoading={verifyMutation.isPending}>
          Verify mobile
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-sm text-slate-500">
        Didn't get a code?
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resendMutation.isPending}
          className="font-semibold text-[var(--brand-pink)] disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}
