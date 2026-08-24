"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/endpoints";

const schema = z
  .object({
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
  const token = searchParams.get("token") ?? "";
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await authApi.resetPassword(token, values.password);
      setDone(true);
    } catch {
      setFormError("This reset link is invalid or has expired.");
    }
  }

  if (!token) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <h2 className="text-lg font-semibold">Invalid reset link</h2>
          <p className="text-sm text-muted-foreground">
            This password reset link is missing or invalid. Please request a new one.
          </p>
          <Link href="/forgot-password" className="mt-2 text-sm font-medium text-primary hover:underline">
            Request a new link
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-6 text-success" />
          </div>
          <h2 className="text-lg font-semibold">Password reset</h2>
          <p className="text-sm text-muted-foreground">Your password has been updated. You can now log in.</p>
          <Button className="mt-2" onClick={() => router.push("/login")}>
            Go to login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle className="text-2xl">Set a new password</CardTitle>
        <CardDescription>Choose a strong password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" placeholder="At least 8 characters" {...register("password")} />
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" placeholder="Re-enter your password" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-danger">{errors.confirmPassword.message}</p>}
          </div>

          {formError && <p className="text-sm text-danger">{formError}</p>}

          <Button type="submit" loading={isSubmitting} className="mt-2">
            Reset password
          </Button>
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
