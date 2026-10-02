"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { authApi } from "@/lib/api/endpoints";
import { useI18n } from "@/features/i18n/context";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  nativeLanguage: z.string().optional(),
  preferredLanguage: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterFlow() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  // Step 1 = Form, Step 2 = OTP verification, Step 3 = Verified Success
  const [step, setStep] = useState<"form" | "verify" | "success">("form");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function onRegisterSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      await authApi.register({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        nativeLanguage: values.nativeLanguage || undefined,
        preferredLanguage: values.preferredLanguage || undefined,
      });
      setEmail(values.email.trim().toLowerCase());
      setStep("verify");
      setResendCooldown(60);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "We couldn't create your account. Please try again.";
      setFormError(message);
    }
  }

  async function onVerifyOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (otp.length !== 6) {
      setVerifyError("Please enter the 6-digit verification code.");
      return;
    }

    setVerifyError(null);
    setIsVerifying(true);
    try {
      await authApi.verifyEmail(email, otp);
      setStep("success");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid or expired verification code. Please check and try again.";
      setVerifyError(message);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setVerifyError(null);
    setResendSuccess(null);
    try {
      const res = await authApi.resendVerification(email);
      setResendSuccess(res.message || "A new verification code has been sent.");
      setResendCooldown(60);
      setOtp("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not resend code. Please try again.";
      setVerifyError(message);
    } finally {
      setIsResending(false);
    }
  }

  if (step === "success") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-6 text-success" />
          </div>
          <h2 className="text-xl font-semibold">Email verified!</h2>
          <p className="text-sm text-muted-foreground">
            Your account is now ready. Log in to start saving words and building language books.
          </p>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              const query = new URLSearchParams({ email, verified: "true" });
              if (returnTo) query.set("returnTo", returnTo);
              router.push(`/login?${query.toString()}`);
            }}
          >
            {t("auth.login")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "verify") {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-5" />
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>. Enter it below to
            activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onVerifyOtp} className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-2">
              <OtpInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  if (verifyError) setVerifyError(null);
                }}
                error={!!verifyError}
                disabled={isVerifying}
              />
              {verifyError && <p className="text-center text-xs text-danger">{verifyError}</p>}
              {resendSuccess && <p className="text-center text-xs text-success">{resendSuccess}</p>}
            </div>

            <Button type="submit" loading={isVerifying} disabled={otp.length !== 6} className="w-full">
              Verify Email
            </Button>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setVerifyError(null);
                  setResendSuccess(null);
                }}
                className="inline-flex items-center gap-1 font-medium hover:text-foreground hover:underline"
              >
                <ArrowLeft className="size-3.5" /> Change email
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isResending}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                <RefreshCw className={`size-3.5 ${isResending ? "animate-spin" : ""}`} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle className="text-2xl">{t("auth.createAccount")}</CardTitle>
        <CardDescription>{t("auth.registerSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onRegisterSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t("auth.fullName")}</Label>
            <Input id="name" placeholder="Your name" {...register("name")} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input id="password" type="password" placeholder="At least 8 characters" {...register("password")} />
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
          </div>

          {formError && <p className="text-sm text-danger">{formError}</p>}

          <Button type="submit" loading={isSubmitting} className="mt-2">
            {t("auth.register")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("auth.signIn")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterFlow />
    </Suspense>
  );
}
