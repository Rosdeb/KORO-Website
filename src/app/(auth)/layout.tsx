import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { GuestGuard } from "@/components/auth/guest-guard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="container-koro flex h-16 items-center">
        <Logo />
        <Link
          href="/"
          className="ml-auto text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Back to Korot
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Suspense fallback={null}>
            <GuestGuard>{children}</GuestGuard>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
