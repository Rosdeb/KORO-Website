import Link from "next/link";
import { Logo } from "@/components/layout/logo";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/languages", label: "Languages" },
      { href: "/dictionary", label: "Dictionary" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    title: "Koro",
    links: [
      { href: "/about", label: "About" },
      { href: "/register", label: "Create an account" },
      { href: "/login", label: "Login" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/40 pb-24 md:pb-0">
      <div className="container-koro grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Discover languages, learn words, and help preserve indigenous language knowledge for
            generations to come.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-3 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-koro border-t border-border py-5 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Koro. Built to discover, learn, and preserve language knowledge.
      </div>
    </footer>
  );
}
