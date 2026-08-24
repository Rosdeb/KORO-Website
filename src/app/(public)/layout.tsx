import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { OfflineBanner } from "@/components/state/offline-banner";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <OfflineBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
