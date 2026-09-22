import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import logo from "@/assets/laverna-logo.png";
import { FormError } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema";
import { useRegisterMutation } from "@/queries/useAuthQueries";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/apiError";

export default function RegisterFormMobile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planSlug = searchParams.get("plan");
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values, {
      onSuccess: (user) => {
        const planParam = planSlug ? `&plan=${planSlug}` : "";
        navigate(`/verify-mobile?mobile=${user.mobile_number}${planParam}`);
      },
      onError: (error) => {
        const fieldErrors = getApiFieldErrors(error);

        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in values) {
            setError(field as keyof RegisterFormValues, { message });
          }
        }
      },
    });
  };

  return (
    <div className="gradient-mesh-subtle mobile-safe-bottom min-h-screen px-5 pb-10 pt-8">
      <div className="flex items-center justify-center">
        <img src={logo} alt="LavernaEvents" className="h-10 w-auto object-contain" />
      </div>

      <div className="mt-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Start planning events that connect people, beautifully.
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            placeholder="Jane Doe"
            hasError={!!errors.full_name}
            {...register("full_name")}
          />
          <FormError message={errors.full_name?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="jane@example.com"
            hasError={!!errors.email}
            {...register("email")}
          />
          <FormError message={errors.email?.message} />
        </div>

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

        <div className="space-y-1.5">
          <Label htmlFor="password_confirm">Confirm password</Label>
          <Input
            id="password_confirm"
            type="password"
            placeholder="••••••••"
            hasError={!!errors.password_confirm}
            {...register("password_confirm")}
          />
          <FormError message={errors.password_confirm?.message} />
        </div>

        {registerMutation.isError && (
          <FormError message={getApiErrorMessage(registerMutation.error, "Registration failed. Please try again.")} />
        )}

        <Button type="submit" className="w-full" size="lg" isLoading={registerMutation.isPending}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[var(--brand-pink)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
