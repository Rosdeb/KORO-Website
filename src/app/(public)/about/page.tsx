import Link from "next/link";
import { Compass, BookOpenText, BookmarkPlus, Globe2, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About",
  description: "Why Koro exists and how it helps discover, learn, and preserve language knowledge.",
};

const VALUES = [
  {
    icon: Globe2,
    title: "Every language matters",
    description:
      "From widely spoken languages to indigenous languages with few remaining speakers, Koro treats every language as worth discovering and preserving.",
  },
  {
    icon: Users,
    title: "Community-powered",
    description:
      "Speakers and learners can suggest translations. Every contribution is reviewed before it becomes part of the official record.",
  },
  {
    icon: ShieldCheck,
    title: "Trust in every word",
    description:
      "Community submissions are always clearly labeled as pending until reviewed — never blended with verified translations.",
  },
];

const STEPS = [
  { icon: Compass, title: "Explore", description: "Browse languages and dictionary categories — no account needed." },
  { icon: BookOpenText, title: "Learn", description: "See translations, pronunciation, and examples for any word." },
  { icon: BookmarkPlus, title: "Save", description: "Create an account to save words and build personal books." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-border bg-primary-50/60">
        <div className="container-koro flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">About Koro</h1>
          <p className="max-w-xl text-muted-foreground">
            Koro is a home for discovering, learning, and preserving language knowledge —
            starting with the languages and communities that need it most.
          </p>
        </div>
      </section>

      <section className="container-koro py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
                <v.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{v.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/40 py-16">
        <div className="container-koro">
          <h2 className="text-center text-2xl font-bold">How it works</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center gap-3 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-card shadow-sm">
                  <step.icon className="size-6 text-primary" />
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary-700">
                  <span>{i + 1}</span>
                  <span className="h-1 w-1 rounded-full bg-primary-700" />
                  <span>{step.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-koro py-16">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-card p-10 text-center shadow-sm">
          <h2 className="text-2xl font-bold">Ready to start exploring?</h2>
          <p className="max-w-md text-muted-foreground">
            No account is required to browse. Create one only when you want to save words and
            build your own language books.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/dictionary">Explore Dictionary</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">Create an Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
