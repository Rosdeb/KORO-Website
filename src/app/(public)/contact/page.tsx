import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Korot with questions, feedback, language corrections, or collaboration enquiries.",
};

const TOPICS = [
  {
    title: "Questions & support",
    description: "Need help using Korot? Tell us what you were trying to do and where you got stuck.",
  },
  {
    title: "Feedback & corrections",
    description: "Found an issue with a word or translation? Include the language, the page link, and your suggested correction.",
  },
  {
    title: "Work with us",
    description: "Interested in contributing language knowledge or collaborating on the project? Tell us a little about your work.",
  },
];

export default function ContactPage() {
  return (
    <div className="container-koro py-10 sm:py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact us</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Have a question, a correction, or an idea for Korot? We would like to hear from you.
        </p>
      </div>

      <div className="mt-10 grid gap-10 sm:mt-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <section aria-labelledby="message-heading" className="min-w-0">
          <h2 id="message-heading" className="text-xl font-semibold">Send a message</h2>
          <ContactForm />
        </section>

        <section aria-label="What we can help with" className="divide-y divide-border border-y border-border">
          {TOPICS.map(topic => (
            <div key={topic.title} className="py-6">
              <h2 className="text-base font-semibold">{topic.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{topic.description}</p>
            </div>
          ))}
        </section>
      </div>

      <div className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground sm:mt-16">
        Want to know more about the project?{" "}
        <Link href="/about" className="inline-flex min-h-11 items-center gap-1 rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          About Korot <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
