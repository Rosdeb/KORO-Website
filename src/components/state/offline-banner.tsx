"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Read after mount, not during the lazy initializer, so the server-
    // rendered markup (which has no `navigator`) matches the client's first
    // render and hydration doesn't mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOffline(!navigator.onLine);
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-warning/15 px-4 py-2 text-sm font-medium text-warning">
      <WifiOff className="size-4" />
      You&apos;re offline. Please check your internet connection.
    </div>
  );
}
