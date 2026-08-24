"use client";

import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { useScanHistory } from "@/features/scan/hooks";

export default function ScanHistoryPage() {
  const { data, isLoading, isError, refetch } = useScanHistory();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/app/scan" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Scan
      </Link>
      <h1 className="text-2xl font-extrabold sm:text-3xl">Scan History</h1>

      {isError && <ErrorState onRetry={() => refetch()} />}

      {isLoading && !isError && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !isError && (data ?? []).length === 0 && (
        <EmptyState
          icon={History}
          title="No scans yet"
          description="Objects you scan will appear here with their detected match."
        />
      )}

      {!isLoading && !isError && (data ?? []).length > 0 && (
        <div className="flex flex-col gap-3">
          {data!.map((scan) => (
            <Card key={scan.id}>
              <div className="flex items-center gap-4 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={scan.imageUrl}
                  alt={scan.detectedLabel}
                  className="size-16 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{scan.detectedLabel}</p>
                  <p className="text-sm text-muted-foreground">
                    {scan.conceptName ?? "No match"} · {new Date(scan.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="primary">{Math.round(scan.confidence * 100)}%</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
