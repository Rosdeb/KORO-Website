"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, KeyRound, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { authApi } from "@/lib/api/endpoints";

const schema = z
  .object({
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: emailParam,
    },
  });

  const currentEmail = watch("email");

  useEffect(() => {
    if (emailParam) {
      setValue("email", emailParam);
    }
  }, [emailParam, setValue]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleResendCode() {
    if (!currentEmail || !currentEmail.includes("@")) {
      setFormError("Please enter a valid email address to resend the code.");
      return;
    }
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setFormError(null);
    setResendSuccess(null);
    try {
      const res = await authApi.forgotPassword(currentEmail.trim().toLowerCase());
      setResendSuccess(res.message || "A new reset code has been sent to your email.");
      setResendCooldown(60);
      setOtp("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not resend code. Please try again.";
      setFormError(message);
    } finally {
      setIsResending(false);
    }
  }

  async function onSubmit(values: FormValues) {
    if (otp.length !== 6) {
      setFormError("Please enter the 6-digit reset code sent to your email.");
      return;
    }

    setFormError(null);
    try {
      await authApi.resetPassword(values.email.trim().toLowerCase(), otp, values.password);
      setDone(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "This reset code is invalid or has expired. Please request a new one.";
      setFormError(message);
    }
  }

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-6 text-success" />
          </div>
          <h2 className="text-xl font-semibold">Password reset</h2>
          <p className="text-sm text-muted-foreground">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
          <Button
            className="mt-4 w-full"
            onClick={() => router.push(`/login?reset=true&email=${encodeURIComponent(currentEmail)}`)}
          >
            Go to login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-5" />
        </div>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>Enter the 6-digit code sent to your email and choose a new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col items-center gap-2 pt-1">
            <div className="flex w-full items-center justify-between">
              <Label>6-digit Reset Code</Label>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isResending || !currentEmail}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                <RefreshCw className={`size-3 ${isResending ? "animate-spin" : ""}`} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </div>
            <OtpInput
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (formError) setFormError(null);
              }}
              error={!!formError && otp.length !== 6}
            />
            {resendSuccess && <p className="text-center text-xs text-success">{resendSuccess}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" placeholder="At least 8 characters" {...register("password")} />
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && <p className="text-xs text-danger">{errors.confirmPassword.message}</p>}
          </div>

          {formError && <p className="text-sm text-danger">{formError}</p>}

          <Button type="submit" loading={isSubmitting} disabled={otp.length !== 6} className="mt-2">
            Reset password
          </Button>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
