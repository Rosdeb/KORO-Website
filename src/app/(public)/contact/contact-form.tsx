"use client";

import { useState, useEffect, type FormEvent } from "react";
import { CheckCircle2, Loader2, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/context";
import { useSubmitContact } from "@/features/contact/hooks";
import { useI18n } from "@/features/i18n/context";

export function ContactForm() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const submitMutation = useSubmitContact();

  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user, name, email]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      return;
    }

    submitMutation.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      },
      {
        onSuccess: (data) => {
          setSubmittedMessage(
            data?.message || "Your message has been received. We will get back to you soon."
          );
          setSubject("");
          setMessage("");
        },
      }
    );
  }

  function handleReset() {
    setSubmittedMessage(null);
    setSubject("");
    setMessage("");
    submitMutation.reset();
  }

  if (submittedMessage) {
    return (
      <div className="mt-6 rounded-2xl border border-success/30 bg-success/5 p-6 text-foreground animate-scale-in">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="size-6 shrink-0 text-success" />
          <div className="space-y-2">
            <h3 className="font-semibold text-base">{t("contact.thankYou")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {submittedMessage}
            </p>
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                {t("contact.sendAnother")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div className="space-y-2">
        <label htmlFor="contact-name" className="block text-sm font-medium">
          {t("contact.name")} <span className="text-danger">*</span>
        </label>
        <Input
          id="contact-name"
          name="name"
          autoComplete="name"
          placeholder={t("contact.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          required
          className="text-base sm:text-sm"
          disabled={submitMutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-email" className="block text-sm font-medium">
          {t("contact.email")} <span className="text-danger">*</span>
        </label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("contact.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={254}
          required
          className="text-base sm:text-sm"
          disabled={submitMutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-subject" className="block text-sm font-medium">
          {t("contact.subject")} <span className="text-danger">*</span>
        </label>
        <Input
          id="contact-subject"
          name="subject"
          placeholder={t("contact.subjectPlaceholder")}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          required
          className="text-base sm:text-sm"
          disabled={submitMutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="contact-message" className="block text-sm font-medium">
            {t("contact.message")} <span className="text-danger">*</span>
          </label>
          <span className="text-xs text-muted-foreground">
            {message.length}/5000
          </span>
        </div>
        <Textarea
          id="contact-message"
          name="message"
          placeholder={t("contact.messagePlaceholder")}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={5000}
          required
          className="resize-y text-base sm:text-sm"
          disabled={submitMutation.isPending}
        />
      </div>

      {submitMutation.isError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>
            {submitMutation.error?.message ||
              "Failed to send message. Please try again later."}
          </span>
        </div>
      )}

      <Button
        type="submit"
        disabled={submitMutation.isPending}
        className="min-h-12 w-full gap-2 sm:w-auto"
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>{t("contact.sending")}</span>
          </>
        ) : (
          <>
            <Send className="size-4" />
            <span>{t("contact.send")}</span>
          </>
        )}
      </Button>
    </form>
  );
}
