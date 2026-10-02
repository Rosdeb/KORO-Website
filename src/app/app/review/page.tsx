"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardList, Languages, User, XCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/context";
import { useApproveSubmission, useRejectSubmission, useReviewQueue } from "@/features/review/hooks";
import { useI18n } from "@/features/i18n/context";
import type { Submission } from "@/types";

export default function ReviewQueuePage() {
  const { t } = useI18n();
  const { isReviewer } = useAuth();

  if (!isReviewer) {
    return (
      <EmptyState
        icon={ClipboardList}
        title={t("review.reviewersOnlyTitle")}
        description={t("review.reviewersOnlyDesc")}
      />
    );
  }

  return <ReviewQueue />;
}

function ReviewQueue() {
  const { t } = useI18n();
  const [page, setPage] = useState(0);
  const { data: submissionPage, isLoading, isError, refetch } = useReviewQueue(page, 20);
  const submissions = submissionPage?.content ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("review.title")}</h1>
          <Badge variant="accent">{t("review.reviewer")}</Badge>
        </div>
        <p className="mt-1 text-muted-foreground">
          {t("review.subtitle")}
        </p>
      </div>

      {isError && <ErrorState onRetry={() => refetch()} />}

      {isLoading && !isError && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !isError && (submissions ?? []).length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title={t("review.emptyTitle")}
          description={t("review.emptyDesc")}
        />
      )}

      {!isLoading && !isError && (submissions ?? []).length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {submissions.map((s) => (
              <ReviewCard key={s.id} submission={s} />
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
    </div>
  );
}

function ReviewCard({ submission }: { submission: Submission }) {
  const { t } = useI18n();
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);

  return (
    <Card>
      <div className="flex gap-4 p-5 pb-0">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
          <Languages className="size-5" />
        </div>

        <CardHeader className="flex-1 p-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle>{submission.sourceWord || t("suggest.newWord")}</CardTitle>
            <Badge variant="warning">{t("review.pendingBadge")}</Badge>
          </div>
          <CardDescription>
            {submission.categoryName && <span>{submission.categoryName} · </span>}
            {t("review.sourceWordIn")}{" "}
            <span className="font-medium text-foreground">{submission.sourceLanguageName}</span>
          </CardDescription>
        </CardHeader>
      </div>

      <CardContent className="flex flex-col gap-2">
        {(submission.banglaTranslation || submission.englishTranslation || submission.pronunciation) && (
          <div className="flex flex-wrap gap-3 rounded-xl bg-muted/60 px-4 py-3">
            {submission.banglaTranslation && (
              <div className="min-w-32 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("review.banglaMeaning")}</p>
                <p className="mt-0.5 font-semibold">{submission.banglaTranslation}</p>
              </div>
            )}
            {submission.englishTranslation && (
              <div className="min-w-32 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("review.englishMeaning")}</p>
                <p className="mt-0.5 font-semibold">{submission.englishTranslation}</p>
              </div>
            )}
            {submission.pronunciation && (
              <div className="min-w-32 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("review.pronunciation")}</p>
                <p className="mt-0.5 font-semibold">{submission.pronunciation}</p>
              </div>
            )}
          </div>
        )}
        {submission.exampleSentence && (
          <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
            {t("review.example")}: &quot;{submission.exampleSentence}&quot;
          </p>
        )}
        {submission.note && (
          <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
            {t("review.submitterNote")}: {submission.note}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="size-3.5" />
          <span>
            {submission.submittedByName ?? "A community member"}
            {submission.submittedByEmail && ` (${submission.submittedByEmail})`} · {t("review.submittedBy")}{" "}
            {new Date(submission.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setDialog("reject")}>
            <XCircle className="size-4" /> {t("review.reject")}
          </Button>
          <Button size="sm" onClick={() => setDialog("approve")}>
            <CheckCircle2 className="size-4" /> {t("review.approve")}
          </Button>
        </div>
      </CardFooter>

      <ReviewActionDialog submission={submission} action={dialog} onClose={() => setDialog(null)} />
    </Card>
  );
}

function ReviewActionDialog({
  submission,
  action,
  onClose,
}: {
  submission: Submission;
  action: "approve" | "reject" | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [note, setNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState(false);
  const approve = useApproveSubmission();
  const reject = useRejectSubmission();
  const { toast } = useToast();

  const mutation = action === "approve" ? approve : reject;

  function handleOpenChange(open: boolean) {
    if (!open) {
      setNote("");
      setRejectionReason("");
      setRejectionReasonError(false);
      onClose();
    }
  }

  function handleConfirm() {
    if (action === "approve") {
      approve.mutate(
        { id: submission.id, reviewerNote: note.trim() || undefined },
        {
          onSuccess: (result) => {
            const saved = result.translationsSaved ?? [];
            toast({
              title: "Submission approved",
              description:
                saved.length > 0
                  ? `${saved.length} dictionary ${saved.length === 1 ? "entry" : "entries"} created — ${saved.join(", ")}`
                  : undefined,
              variant: "success",
            });
            handleOpenChange(false);
          },
          onError: (error) =>
            toast({
              title: "Couldn't approve this submission",
              description: error instanceof Error ? error.message : "Please try again.",
              variant: "error",
            }),
        },
      );
      return;
    }
    if (action === "reject") {
      if (!rejectionReason.trim()) {
        setRejectionReasonError(true);
        return;
      }
      reject.mutate(
        { id: submission.id, rejectionReason: rejectionReason.trim(), reviewerNote: note.trim() || undefined },
        {
          onSuccess: () => {
            toast({ title: "Submission rejected", variant: "success" });
            handleOpenChange(false);
          },
          onError: (error) =>
            toast({
              title: "Couldn't reject this submission",
              description: error instanceof Error ? error.message : "Please try again.",
              variant: "error",
            }),
        },
      );
    }
  }

  return (
    <Dialog open={action !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action === "approve" ? t("review.approveTitle") : t("review.rejectTitle")}</DialogTitle>
          <DialogDescription>
            {submission.sourceWord || t("suggest.newWord")} — {submission.sourceLanguageName}
            {submission.englishTranslation && <>: &quot;{submission.englishTranslation}&quot;</>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {action === "reject" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="rejection-reason">
                {t("review.rejectionReason")} <span className="text-danger">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (e.target.value.trim()) setRejectionReasonError(false);
                }}
                placeholder={t("review.rejectionReasonPlaceholder")}
              />
              {rejectionReasonError && (
                <p className="text-xs text-danger">{t("review.rejectionReasonRequired")}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="reviewer-note">{t("review.reviewerNoteOptional")}</Label>
            <Textarea
              id="reviewer-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                action === "approve" ? t("review.reviewerNoteApprovePlaceholder") : t("review.reviewerNoteRejectPlaceholder")
              }
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("review.cancel")}</Button>
          </DialogClose>
          <Button
            variant={action === "reject" ? "danger" : "primary"}
            loading={mutation.isPending}
            onClick={handleConfirm}
          >
            {action === "approve" ? t("review.approve") : t("review.reject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
