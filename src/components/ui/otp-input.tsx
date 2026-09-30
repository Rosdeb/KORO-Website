"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  error?: boolean;
}

export function OtpInput({
  value = "",
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
  className,
  error = false,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const char = e.target.value;
    // Extract only the latest entered character or pasted string
    const sanitized = char.replace(/\D/g, "");
    if (!sanitized) {
      // User deleted
      const next = digits.slice();
      next[index] = "";
      onChange(next.join(""));
      return;
    }

    if (sanitized.length > 1) {
      // Pasted multiple digits into single input
      handlePasteString(sanitized, index);
      return;
    }

    const next = digits.slice();
    next[index] = sanitized[sanitized.length - 1];
    const newOtp = next.join("");
    onChange(newOtp);

    // Focus next input
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
      inputsRef.current[index + 1]?.select();
    }
  }

  function handlePasteString(pasted: string, startIndex = 0) {
    const digitsOnly = pasted.replace(/\D/g, "").slice(0, length);
    const next = digits.slice();
    for (let i = 0; i < digitsOnly.length; i++) {
      if (startIndex + i < length) {
        next[startIndex + i] = digitsOnly[i];
      }
    }
    onChange(next.join(""));
    const focusTarget = Math.min(startIndex + digitsOnly.length, length - 1);
    inputsRef.current[focusTarget]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const next = digits.slice();
        next[index - 1] = "";
        onChange(next.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain");
    handlePasteString(pasted, 0);
  }

  return (
    <div className={cn("flex items-center justify-center gap-2 sm:gap-3", className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6} // Allow paste detection
          disabled={disabled}
          value={digits[index] || ""}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${index + 1} of verification code`}
          className={cn(
            "size-11 sm:size-12 rounded-lg border text-center font-mono text-xl font-bold tracking-tight shadow-xs transition-colors",
            "bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-danger text-danger focus:ring-danger" : "border-input",
          )}
        />
      ))}
    </div>
  );
}
