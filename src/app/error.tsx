"use client";

import { ErrorState } from "@/components/state/error-state";

export default function RouteError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="container-koro py-12" role="alert">
      <ErrorState title="This page couldn't load." description="Please try again to continue." onRetry={retry} />
    </div>
  );
}
