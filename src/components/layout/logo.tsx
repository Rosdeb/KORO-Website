import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex h-14 w-14 shrink-0 items-center", className)}>
      <Image src="/korot-logo.png" alt="Korot" width={56} height={56} className="h-14 w-14 object-contain" priority />
    </Link>
  );
}
