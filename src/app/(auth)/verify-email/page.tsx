"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Mail, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { authApi } from "@/lib/api/endpoints";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleVerify(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setVerifyError("Please provide your email address.");
      return;
    }
    if (otp.length !== 6) {
      setVerifyError("Please enter the 6-digit verification code.");
      return;
    }

    setVerifyError(null);
    setIsVerifying(true);
    try {
      await authApi.verifyEmail(email.trim().toLowerCase(), otp);
      setVerified(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid or expired verification code. Please check and try again.";
      setVerifyError(message);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendCode() {
    if (!email.trim()) {
      setVerifyError("Enter your email above to resend the code.");
      return;
    }
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setVerifyError(null);
    setResendSuccess(null);
    try {
      const res = await authApi.resendVerification(email.trim().toLowerCase());
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

  if (verified) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="size-6 text-success" />
          </div>
          <h2 className="text-xl font-semibold">Email verified!</h2>
          <p className="text-sm text-muted-foreground">
            Your account is now verified. Log in to start learning and saving words.
          </p>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              router.push(`/login?verified=true&email=${encodeURIComponent(email)}`);
            }}
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
          <Mail className="size-5" />
        </div>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>Enter the 6-digit verification code sent to your email address.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setVerifyError(null);
              }}
              disabled={isVerifying}
            />
          </div>

          <div className="flex flex-col items-center gap-2 pt-2">
            <Label className="self-start">6-digit Verification Code</Label>
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

          <Button type="submit" loading={isVerifying} disabled={otp.length !== 6 || !email.trim()} className="mt-2 w-full">
            Verify Email
          </Button>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Link href="/login" className="font-medium hover:text-foreground hover:underline">
              Back to login
            </Link>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || isResending || !email.trim()}
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
