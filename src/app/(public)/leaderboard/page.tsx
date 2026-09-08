import { Award, BookOpenText, CheckCircle2, Languages, Medal, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatedStat } from "@/components/leaderboard/animated-stat";

export const metadata = {
  title: "Community Leaderboard",
  description: "Meet the contributors helping preserve and grow Koro's language knowledge.",
};

const LEADERS = [
  {
    rank: 1,
    name: "Rosdeb Koch",
    initials: "RK",
    role: "Language contributor",
    languages: ["Bangla", "Koch"],
    contributions: 128,
    verified: 94,
    collections: 8,
    featured: true,
  },
  {
    rank: 2,
    name: "Mithun Koch",
    initials: "MK",
    role: "Community translator",
    languages: ["Koch", "Bangla"],
    contributions: 104,
    verified: 81,
    collections: 6,
  },
  {
    rank: 3,
    name: "Maya Tripura",
    initials: "MT",
    role: "Culture researcher",
    languages: ["Kokborok", "English"],
    contributions: 89,
    verified: 76,
    collections: 5,
  },
  {
    rank: 4,
    name: "Tenzin Chakma",
    initials: "TC",
    role: "Dictionary editor",
    languages: ["Chakma", "Bangla"],
    contributions: 73,
    verified: 62,
    collections: 4,
  },
  {
    rank: 5,
    name: "Mri Sangma",
    initials: "MS",
    role: "Language learner",
    languages: ["Bangla", "Garo"],
    contributions: 61,
    verified: 49,
    collections: 4,
  },
];

const IMPACT = [
  { icon: Users, value: 250, suffix: "+", label: "community contributors" },
  { icon: CheckCircle2, value: 1400, suffix: "+", label: "verified translations" },
  { icon: Languages, value: 12, label: "languages represented" },
];

function RankMark({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="size-5 text-warning" aria-label="First place" />;
  if (rank === 2) return <Medal className="size-5 text-muted-foreground" aria-label="Second place" />;
  if (rank === 3) return <Award className="size-5 text-warning" aria-label="Third place" />;
  return <span className="w-5 text-center text-sm font-bold text-muted-foreground">{rank}</span>;
}

export default function LeaderboardPage() {
  const featured = LEADERS[0];
  const others = LEADERS.slice(1);

  return (
    <div>
      <section className="border-b border-border bg-primary-50/60">
        <div className="container-koro py-14 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <Trophy className="size-3.5" /> Community leaderboard
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">The people behind the words</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              A public portfolio of the community members who help document, translate, and preserve language knowledge on Koro.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {IMPACT.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-center gap-3 px-5 py-5 text-center sm:flex-col sm:gap-1">
                  <Icon className="size-5 text-primary" />
                  <div>
                    <AnimatedStat value={item.value} suffix={item.suffix} />
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <main className="container-koro py-12 sm:py-16">
        <section aria-labelledby="featured-contributor" className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-md transition-all duration-300 hover:shadow-lg sm:p-8">
  {/* Top Background Glow Effect */}
  <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-3xl" />

  <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
    {/* Left Info Section */}
    <div className="flex items-center gap-5">
      <div className="relative">
        {/* Avatar Made Fully Circle */}
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-lg font-black text-primary-foreground shadow-md ring-4 ring-background">
          {featured.initials}
        </div>
        <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-amber-500 text-white shadow ring-2 ring-background">
          <Trophy className="size-3.5" />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            Featured Contributor
          </span>
        </div>
        <h2 id="featured-contributor" className="mt-1 text-2xl font-extrabold tracking-tight">
          {featured.name}
        </h2>
        <p className="text-sm font-medium text-muted-foreground">{featured.role}</p>
        
        <div className="mt-3 flex flex-wrap gap-1.5">
          {featured.languages.map((language) => (
            <Badge 
              key={language} 
              variant="secondary" 
              className="bg-muted/80 hover:bg-muted text-xs px-2.5 py-0.5 font-medium transition-colors"
            >
              {language}
            </Badge>
          ))}
        </div>
      </div>
    </div>

    {/* Right Stats Container */}
    <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border/80 bg-background/60 backdrop-blur-sm p-1 text-center shadow-inner">
      <PortfolioStat value={featured.contributions} label="published" />
      <PortfolioStat value={featured.verified} label="verified" />
      <PortfolioStat value={featured.collections} label="collections" />
    </div>
  </div>
</section>

        <section className="mt-12" aria-labelledby="rankings-heading">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Contributor portfolios</p>
              <h2 id="rankings-heading" className="mt-1 text-2xl font-bold">Top contributors this season</h2>
            </div>
            <p className="text-sm text-muted-foreground">Ranked by published, community-reviewed contributions.</p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <ol className="divide-y divide-border">
              {others.map((leader) => (
                <li key={leader.rank} className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-5">
                  <div className="flex items-center gap-4 sm:contents">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <RankMark rank={leader.rank} />
                    </div>
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary">
                      {leader.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{leader.name}</h3>
                      <p className="text-sm text-muted-foreground">{leader.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:max-w-52 sm:justify-end">
                    {leader.languages.map((language) => <Badge key={language}>{language}</Badge>)}
                  </div>
                  <div className="flex gap-5 text-sm sm:w-48 sm:justify-end">
                    <span><strong className="block font-bold">{leader.contributions}</strong><span className="text-muted-foreground">published</span></span>
                    <span><strong className="block font-bold">{leader.verified}</strong><span className="text-muted-foreground">verified</span></span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-border bg-muted/50 p-7 text-center sm:p-10">
          <BookOpenText className="mx-auto size-6 text-primary" />
          <h2 className="mt-3 text-xl font-bold">Every contribution has a story</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Leaderboard profiles celebrate published work while keeping the focus on the languages, communities, and knowledge each contributor helps preserve.
          </p>
        </section>
      </main>
    </div>
  );
}

function PortfolioStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-20 px-3 py-3">
      <p className="text-lg font-extrabold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
