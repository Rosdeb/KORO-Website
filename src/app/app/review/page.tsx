"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardList, ImageOff, User, XCircle } from "lucide-react";
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
import { useAuth } from "@/features/auth/context";
import { useApproveSubmission, useRejectSubmission, useReviewQueue } from "@/features/review/hooks";
import type { Submission } from "@/types";

export default function ReviewQueuePage() {
  const { isReviewer } = useAuth();

  if (!isReviewer) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Reviewers only"
        description="This page is reserved for language reviewers and admins. Ask an admin for reviewer access if you think you should be here."
      />
    );
  }

  return <ReviewQueue />;
}

function ReviewQueue() {
  const { data: submissions, isLoading, isError, refetch } = useReviewQueue();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold sm:text-3xl">Review Queue</h1>
          <Badge variant="accent">Reviewer</Badge>
        </div>
        <p className="mt-1 text-muted-foreground">
          Community-suggested translations waiting on approval or rejection.
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
          title="Queue is empty"
          description="There are no pending submissions to review right now."
        />
      )}

      {!isLoading && !isError && (submissions ?? []).length > 0 && (
        <div className="flex flex-col gap-3">
          {submissions!.map((s) => (
            <ReviewCard key={s.id} submission={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ submission }: { submission: Submission }) {
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);

  return (
    <Card>
      <div className="flex gap-4 p-5 pb-0">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
          {submission.conceptImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- backend-hosted, not a next/image-known domain
            <img src={submission.conceptImageUrl} alt={submission.conceptName} className="size-full object-cover" />
          ) : (
            <ImageOff className="size-5 text-muted-foreground" />
          )}
        </div>

        <CardHeader className="flex-1 p-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle>{submission.conceptName}</CardTitle>
            <Badge variant="warning">Pending review</Badge>
          </div>
          <CardDescription>
            {submission.categoryName && <span>{submission.categoryName} · </span>}
            Suggested translation for <span className="font-medium text-foreground">{submission.languageName}</span>
          </CardDescription>
          {submission.conceptDescription && (
            <CardDescription className="italic">&quot;{submission.conceptDescription}&quot;</CardDescription>
          )}
        </CardHeader>
      </div>

      <CardContent className="flex flex-col gap-2">
        <div className="rounded-xl bg-muted/60 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Suggested text</p>
          <p className="mt-0.5 font-semibold">{submission.suggestedText}</p>
          {submission.pronunciation && (
            <p className="mt-1 text-sm text-muted-foreground">Pronunciation: {submission.pronunciation}</p>
          )}
        </div>
        {submission.note && (
          <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
            Submitter&apos;s note: {submission.note}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="size-3.5" />
          <span>
            {submission.submittedByName ?? "A community member"}
            {submission.submittedByEmail && ` (${submission.submittedByEmail})`} · submitted{" "}
            {new Date(submission.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setDialog("reject")}>
            <XCircle className="size-4" /> Reject
          </Button>
          <Button size="sm" onClick={() => setDialog("approve")}>
            <CheckCircle2 className="size-4" /> Approve
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
  const [note, setNote] = useState("");
  const approve = useApproveSubmission();
  const reject = useRejectSubmission();

  const mutation = action === "approve" ? approve : reject;

  function handleOpenChange(open: boolean) {
    if (!open) {
      setNote("");
      onClose();
    }
  }

  function handleConfirm() {
    if (!action) return;
    mutation.mutate(
      { id: submission.id, reviewerNote: note.trim() || undefined },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={action !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action === "approve" ? "Approve submission" : "Reject submission"}</DialogTitle>
          <DialogDescription>
            {submission.conceptName} — {submission.languageName}: &quot;{submission.suggestedText}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="reviewer-note">Reviewer note (optional)</Label>
          <Textarea
            id="reviewer-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              action === "approve" ? "Verified by community linguist." : "Explain why this is being rejected."
            }
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant={action === "reject" ? "danger" : "primary"}
            loading={mutation.isPending}
            onClick={handleConfirm}
          >
            {action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
