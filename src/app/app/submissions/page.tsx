"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MessageSquarePlus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { useMySubmissions } from "@/features/submissions/hooks";
import type { Submission, SubmissionStatus } from "@/types";

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; variant: "warning" | "success" | "danger"; icon: typeof Clock }> = {
  PENDING: { label: "Community submission — Pending", variant: "warning", icon: Clock },
  APPROVED: { label: "Approved", variant: "success", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", variant: "danger", icon: XCircle },
};

export default function SubmissionsPage() {
  const { data: submissions, isLoading, isError, refetch } = useMySubmissions();
  const [tab, setTab] = useState<"ALL" | SubmissionStatus>("ALL");

  const filtered = (submissions ?? []).filter((s) => tab === "ALL" || s.status === tab);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">My Submissions</h1>
          <p className="mt-1 text-muted-foreground">Track the translations you&apos;ve suggested to Koro.</p>
        </div>
        <Button asChild>
          <Link href="/app/submissions/new">
            <Plus className="size-4" /> Suggest a Translation
          </Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {isError && <ErrorState onRetry={() => refetch()} />}

          {isLoading && !isError && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <EmptyState
              icon={MessageSquarePlus}
              title="No submissions here"
              description="Suggest a translation to help grow Koro's dictionary."
              action={
                <Link href="/app/submissions/new" className="text-sm font-medium text-primary hover:underline">
                  Suggest a Translation
                </Link>
              }
            />
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className="flex flex-col gap-3">
              {filtered.map((s) => (
                <SubmissionCard key={s.id} submission={s} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SubmissionCard({ submission }: { submission: Submission }) {
  const status = STATUS_CONFIG[submission.status];
  const Icon = status.icon;
  // A handful of submissions predate the source-word model and only ever
  // carried pronunciation/notes — degrade gracefully instead of showing
  // blank fields for those.
  const rejectionMessage = submission.rejectionReason ?? submission.reviewerNote;

  return (
    <Card>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{submission.sourceWord || "Untitled submission"}</p>
            <p className="text-sm text-muted-foreground">
              {submission.sourceLanguageName} · {submission.categoryName}
            </p>
          </div>
          <Badge variant={status.variant}>
            <Icon className="size-3" /> {status.label}
          </Badge>
        </div>

        {(submission.banglaTranslation || submission.englishTranslation) && (
          <div className="flex flex-wrap gap-4 rounded-xl bg-muted/60 px-4 py-2.5 text-sm">
            {submission.banglaTranslation && (
              <span>
                <span className="text-muted-foreground">Bangla: </span>
                <span className="font-medium">{submission.banglaTranslation}</span>
              </span>
            )}
            {submission.englishTranslation && (
              <span>
                <span className="text-muted-foreground">English: </span>
                <span className="font-medium">{submission.englishTranslation}</span>
              </span>
            )}
          </div>
        )}

        {submission.pronunciation && (
          <p className="text-xs text-muted-foreground">Pronunciation: {submission.pronunciation}</p>
        )}
        {submission.note && <p className="text-xs text-muted-foreground">Note: {submission.note}</p>}
        {submission.status === "REJECTED" && rejectionMessage && (
          <p className="rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">
            Rejection reason: {rejectionMessage}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{new Date(submission.createdAt).toLocaleDateString()}</p>
      </div>
    </Card>
  );
}
