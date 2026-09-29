"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [showError, setShowError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowError(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div className="space-y-2">
        <label htmlFor="contact-name" className="block text-sm font-medium">Name</label>
        <Input id="contact-name" name="name" autoComplete="name" placeholder="Your name" maxLength={120} required className="text-base sm:text-sm" />
      </div>
      <div className="space-y-2">
        <label htmlFor="contact-email" className="block text-sm font-medium">Email</label>
        <Input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required className="text-base sm:text-sm" />
      </div>
      <div className="space-y-2">
        <label htmlFor="contact-message" className="block text-sm font-medium">Message</label>
        <Textarea id="contact-message" name="message" placeholder="How can we help?" rows={6} maxLength={5000} required className="resize-y text-base sm:text-sm" />
      </div>
      {showError && (
        <p id="contact-error" role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm leading-6 text-danger">
          Coming soon. Contact messaging is not available yet. Your message has not been sent.
        </p>
      )}
      <Button type="submit" aria-describedby={showError ? "contact-error" : undefined} className="min-h-12 w-full sm:w-auto">Send message</Button>
    </form>
  );
}
