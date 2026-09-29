import Link from "next/link";
import { ArrowRight, Compass, BookOpenText, BookmarkPlus, Globe2, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About",
  description: "Discover Korot, a community-powered language dictionary for exploring words, learning translations, and preserving indigenous language knowledge.",
};

const VALUES = [
  {
    icon: Globe2,
    title: "Every language matters",
    description:
      "Languages carry stories, identity, and everyday knowledge. Korot makes space for languages and communities that are often underrepresented online.",
  },
  {
    icon: Users,
    title: "Knowledge grows together",
    description:
      "Speakers and learners bring different perspectives. By suggesting translations, the community helps make language knowledge more useful and accessible.",
  },
  {
    icon: ShieldCheck,
    title: "Care in every contribution",
    description:
      "Suggested translations go through review. Pending contributions are kept distinct from reviewed entries, so learners can understand what they are reading.",
  },
];

const STEPS = [
  { icon: Compass, title: "Explore", description: "Browse languages and dictionary categories, or search for a word. You can start without an account.", href: "/languages", label: "Browse languages" },
  { icon: BookOpenText, title: "Learn", description: "Discover meanings and translations, with pronunciation and examples where available.", href: "/dictionary", label: "Explore the dictionary" },
  { icon: BookmarkPlus, title: "Make it yours", description: "Create an account to save words in personal books and return to what you want to learn.", href: "/register", label: "Create an account" },
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-border bg-muted/30">
        <div className="container-koro grid gap-8 py-10 sm:gap-10 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">About Korot</p>
            <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              A home for words.<br className="hidden sm:block" />{" "}A connection to culture.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 sm:mt-6 text-muted-foreground">
              Korot helps people discover, learn, and preserve language knowledge.
              We bring words, meanings, and translations together, with a focus on
              indigenous languages and the communities that keep them alive.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Button className="min-h-12 w-full sm:w-auto" asChild>
                <Link href="/dictionary">Explore Dictionary <ArrowRight aria-hidden="true" className="size-4" /></Link>
              </Button>
              <Button variant="outline" className="min-h-12 w-full sm:w-auto" asChild>
                <Link href="/languages">Browse Languages</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 sm:rounded-3xl sm:p-8">
            <Globe2 aria-hidden="true" className="size-8 text-primary" />
            <h2 className="mt-6 text-xl font-semibold">More than a word and its meaning</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              A language connects people to family, place, and tradition. Making
              that knowledge easier to find gives more people a way to learn,
              share, and stay connected to it.
            </p>
            <div className="mt-6 border-t border-border pt-5">
              <p className="text-sm font-medium">Open to explore. Built with community.</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Start with a familiar word. Discover where it takes you.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-koro py-10 sm:py-20" aria-labelledby="values-heading">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Our purpose</p>
        <h2 id="values-heading" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Language knowledge belongs within reach.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          We want to make it easier to discover a language, learn from its speakers,
          and help preserve the knowledge they share. These principles guide Korot.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-5 md:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-primary">
                <value.icon aria-hidden="true" className="size-5" />
              </div>
              <h3 className="mt-5 font-semibold">{value.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/40 py-10 sm:py-20" aria-labelledby="steps-heading">
        <div className="container-koro">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Getting started</p>
          <h2 id="steps-heading" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Follow your curiosity.</h2>
          <ol className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 md:grid-cols-3 md:gap-10">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <step.icon aria-hidden="true" className="size-6 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-7 text-muted-foreground">{step.description}</p>
                <Link href={step.href} className="mt-3 inline-flex min-h-12 sm:mt-5 items-center gap-2 self-start rounded-sm text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                  {step.label} <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-koro py-10 sm:py-20" aria-labelledby="community-heading">
        <div className="grid gap-6 rounded-2xl border border-border bg-card p-5 sm:gap-8 sm:rounded-3xl sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">The community</p>
            <h2 id="community-heading" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Your knowledge can help someone learn.</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Know a translation? Want to reconnect with a language or discover a
              new one? There is a place for you here. Explore the dictionary,
              build your own books, or suggest translations for review.
            </p>
          </div>
          <div className="flex min-w-0 flex-col items-start gap-4 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <h3 className="text-lg font-semibold">Start with one word.</h3>
            <p className="text-sm leading-7 text-muted-foreground">
              Browsing is open to everyone. Create an account when you are ready
              to save words or contribute.
            </p>
            <Button className="min-h-12 w-full sm:w-auto" asChild>
              <Link href="/register">Join Korot <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
