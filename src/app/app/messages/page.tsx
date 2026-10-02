"use client";

import { useState } from "react";
import {
  Mail,
  Search,
  User,
  Calendar,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state/empty-state";
import { ErrorState } from "@/components/state/error-state";
import { useAuth } from "@/features/auth/context";
import { useAdminContactMessages } from "@/features/contact/hooks";
import type { ContactMessage, ContactMessageStatus } from "@/types";

const STATUS_FILTERS: { label: string; value: ContactMessageStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Read", value: "READ" },
  { label: "Replied", value: "REPLIED" },
  { label: "Archived", value: "ARCHIVED" },
];

export default function AdminMessagesPage() {
  const { isModerator } = useAuth();

  if (!isModerator) {
    return (
      <EmptyState
        icon={Mail}
        title="Moderators & Admins Only"
        description="This inbox is reserved for administrators and moderators to review contact submissions."
      />
    );
  }

  return <MessagesInbox />;
}

function MessagesInbox() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<ContactMessageStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const {
    data: messagePage,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useAdminContactMessages({
    page,
    size: 20,
    status,
    search: searchQuery,
  });

  const messages = messagePage?.content ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(0);
  };

  const handleStatusChange = (newStatus: ContactMessageStatus | "") => {
    setStatus(newStatus);
    setPage(0);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Contact Inquiries
            </h1>
            <Badge variant="primary" className="gap-1">
              <ShieldCheck className="size-3" /> Admin & Mod
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and manage public messages and support inquiries sent via the Contact page.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-muted/60 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value || "all"}
              type="button"
              onClick={() => handleStatusChange(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                status === f.value
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search name, email, subject..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 text-sm"
          />
        </form>
      </div>

      {isError && <ErrorState onRetry={() => refetch()} />}

      {isLoading && !isError && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !isError && messages.length === 0 && (
        <EmptyState
          icon={Mail}
          title="No messages found"
          description={
            searchQuery || status
              ? "No contact messages matched your search or status filter."
              : "There are no contact messages in the inbox yet."
          }
        />
      )}

      {!isLoading && !isError && messages.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>

          {/* Pagination */}
          {messagePage && messagePage.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={!messagePage.hasPrevious || isFetching}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {messagePage.page + 1} of {messagePage.totalPages} ({messagePage.totalElements} total)
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!messagePage.hasNext || isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageCard({ message }: { message: ContactMessage }) {
  const statusBadgeVariant = (status: ContactMessageStatus) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "READ":
        return "primary";
      case "REPLIED":
        return "success";
      case "ARCHIVED":
        return "outline";
      default:
        return "default";
    }
  };

  const formattedDate = new Date(message.createdAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="transition-all hover:border-primary/40">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                {message.subject || "No Subject"}
              </CardTitle>
              <Badge variant={statusBadgeVariant(message.status)}>
                {message.status}
              </Badge>
            </div>
            <CardDescription className="mt-1 flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <User className="size-3 text-muted-foreground" />
                {message.name}
              </span>
              <a
                href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent("Re: " + message.subject)}`}
                className="text-primary hover:underline"
              >
                {message.email}
              </a>
              {message.userId && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Registered User
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            <time dateTime={message.createdAt}>{formattedDate}</time>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="rounded-xl bg-muted/40 p-3.5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {message.message}
        </div>

        {message.replyMessage && (
          <div className="rounded-xl border border-success/30 bg-success/5 p-3.5 text-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-success mb-1.5">
              <span>Reply by {message.repliedBy || "Moderator"}</span>
              {message.repliedAt && (
                <span className="text-muted-foreground font-normal">
                  {new Date(message.repliedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            {message.replySubject && (
              <p className="text-xs font-semibold text-foreground mb-1">
                {message.replySubject}
              </p>
            )}
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {message.replyMessage}
            </p>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <a
            href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent("Re: " + message.subject)}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Mail className="size-3.5" />
            <span>Reply via Email</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
