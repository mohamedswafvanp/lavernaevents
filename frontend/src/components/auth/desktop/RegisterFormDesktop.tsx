import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import logo from "@/assets/laverna-logo.png";
import { Card, FormError } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema";
import { useRegisterMutation } from "@/queries/useAuthQueries";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/apiError";

export default function RegisterFormDesktop() {
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
    <div className="grid min-h-screen grid-cols-2">
      <div className="gradient-hero-warm relative flex flex-col justify-between overflow-hidden p-12 text-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/10" />

        <Link to="/" className="relative z-10 inline-flex w-fit rounded-2xl bg-white/90 p-2">
          <img src={logo} alt="LavernaEvents" className="h-9 w-auto object-contain" />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Join LavernaEvents
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight">
            Celebrate beautifully. Connect meaningfully.
          </h1>
          <p className="mt-4 text-white/85">
            Create your organizer account to start planning events, sending invites, and
            managing guests, all from one beautifully simple dashboard.
          </p>
        </motion.div>

        <p className="relative z-10 text-sm text-white/70">
          © {new Date().getFullYear()} LavernaEvents
        </p>
      </div>

      <div className="flex items-center justify-center overflow-y-auto p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-[var(--brand-navy)]">Create your account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[var(--brand-pink)]">
              Sign in
            </Link>
          </p>

          <Card className="mt-8 p-8">
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {registerMutation.isError && (
                <FormError message={getApiErrorMessage(registerMutation.error, "Registration failed. Please try again.")} />
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={registerMutation.isPending}
              >
                Create account
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
