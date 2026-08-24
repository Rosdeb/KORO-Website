import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="container-koro flex h-16 items-center">
        <Logo />
        <Link
          href="/"
          className="ml-auto text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Back to Koro
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
