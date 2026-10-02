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
import { useI18n } from "@/features/i18n/context";
import type { Submission, SubmissionStatus } from "@/types";

export default function SubmissionsPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(0);
  const { data: submissionPage, isLoading, isError, refetch } = useMySubmissions(page, 20);
  const [tab, setTab] = useState<"ALL" | SubmissionStatus>("ALL");

  const filtered = (submissionPage?.content ?? []).filter((s) => tab === "ALL" || s.status === tab);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("submissions.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("submissions.subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/app/submissions/new">
            <Plus className="size-4" /> {t("submissions.suggestBtn")}
          </Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); setPage(0); }}>
        <TabsList>
          <TabsTrigger value="ALL">{t("submissions.tabAll")}</TabsTrigger>
          <TabsTrigger value="PENDING">{t("submissions.tabPending")}</TabsTrigger>
          <TabsTrigger value="APPROVED">{t("submissions.tabApproved")}</TabsTrigger>
          <TabsTrigger value="REJECTED">{t("submissions.tabRejected")}</TabsTrigger>
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
              title={t("submissions.emptyTitle")}
              description={t("submissions.emptyDesc")}
              action={
                <Link href="/app/submissions/new" className="text-sm font-medium text-primary hover:underline">
                  {t("submissions.suggestBtn")}
                </Link>
              }
            />
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {filtered.map((s) => (
                  <SubmissionCard key={s.id} submission={s} />
                ))}
              </div>
              {submissionPage && submissionPage.totalPages > 1 && (
                <div className="flex items-center justify-between gap-3">
                  <Button variant="outline" size="sm" disabled={!submissionPage.hasPrevious} onClick={() => setPage((current) => current - 1)}>
                    {t("activity.previous")}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t("activity.page")} {submissionPage.page + 1} {t("activity.of")} {submissionPage.totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={!submissionPage.hasNext} onClick={() => setPage((current) => current + 1)}>
                    {t("activity.next")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SubmissionCard({ submission }: { submission: Submission }) {
  const { t } = useI18n();

  const statusConfig: Record<SubmissionStatus, { label: string; variant: "warning" | "success" | "danger"; icon: typeof Clock }> = {
    PENDING: { label: t("submissions.pendingLabel"), variant: "warning", icon: Clock },
    APPROVED: { label: t("submissions.approvedLabel"), variant: "success", icon: CheckCircle2 },
    REJECTED: { label: t("submissions.rejectedLabel"), variant: "danger", icon: XCircle },
  };

  const status = statusConfig[submission.status];
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
            <p className="font-semibold">{submission.sourceWord || t("suggest.newWord")}</p>
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
                <span className="text-muted-foreground">{t("common.bangla")}: </span>
                <span className="font-medium">{submission.banglaTranslation}</span>
              </span>
            )}
            {submission.englishTranslation && (
              <span>
                <span className="text-muted-foreground">{t("common.english")}: </span>
                <span className="font-medium">{submission.englishTranslation}</span>
              </span>
            )}
          </div>
        )}

        {submission.pronunciation && (
          <p className="text-xs text-muted-foreground">{t("suggest.pronunciation")}: {submission.pronunciation}</p>
        )}
        {submission.note && <p className="text-xs text-muted-foreground">{t("suggest.note")}: {submission.note}</p>}
        {submission.status === "REJECTED" && rejectionMessage && (
          <p className="rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">
            {t("submissions.rejectionReason")}: {rejectionMessage}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{new Date(submission.createdAt).toLocaleDateString()}</p>
      </div>
    </Card>
  );
}
