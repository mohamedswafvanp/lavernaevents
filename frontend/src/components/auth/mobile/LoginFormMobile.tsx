import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import logo from "@/assets/laverna-logo.png";
import { FormError } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { useLoginMutation } from "@/queries/useAuthQueries";
import { getApiErrorMessage } from "@/lib/apiError";

export default function LoginFormMobile() {
  const navigate = useNavigate();
  const location = useLocation();
  const justVerified = Boolean((location.state as { verified?: boolean } | null)?.verified);
  const [searchParams] = useSearchParams();
  const planSlug = searchParams.get("plan");
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: (user) => {
        const planParam = planSlug ? `&plan=${planSlug}` : "";

        if (!user.is_verified) {
          navigate(`/verify-mobile?mobile=${user.mobile_number}${planParam}`);
        } else if (planSlug) {
          navigate(`/pricing?plan=${planSlug}`);
        } else {
          navigate("/portal");
        }
      },
    });
  };

  return (
    <div className="gradient-mesh-subtle mobile-safe-bottom flex min-h-screen flex-col justify-center px-5 pb-10 pt-8">
      <div className="flex items-center justify-center">
        <img src={logo} alt="LavernaEvents" className="h-10 w-auto object-contain" />
      </div>

      <div className="mt-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to continue planning</p>
      </div>

      {justVerified && (
        <div className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Mobile verified. You can now sign in.
        </div>
      )}

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            hasError={!!errors.password}
            {...register("password")}
          />
          <FormError message={errors.password?.message} />
        </div>

        {loginMutation.isError && (
          <FormError message={getApiErrorMessage(loginMutation.error, "Invalid mobile number or password.")} />
        )}

        <Button type="submit" className="w-full" size="lg" isLoading={loginMutation.isPending}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to LavernaEvents?{" "}
        <Link to="/register" className="font-semibold text-[var(--brand-pink)]">
          Create an account
        </Link>
      </p>
    </div>
  );
}
