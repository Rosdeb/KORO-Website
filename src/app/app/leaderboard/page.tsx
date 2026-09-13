"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context";
import { Button } from "@/components/ui/button";
import { canViewAdminLeaderboard, leaderboardApi, type AdminFilters, type SubmissionStatus } from "@/features/leaderboard/api";

const control = "mt-1 block rounded-xl border border-border bg-background px-3 py-2 text-sm";

export default function AdminLeaderboardPage() {
  const { user, isLoading } = useAuth();
  const allowed = canViewAdminLeaderboard(user?.roles);
  const [filters, setFilters] = useState<AdminFilters>({ limit: 50 });
  const [selected, setSelected] = useState<string | null>(null);
  const invalidDates = !!(filters.from && filters.to && filters.from > filters.to);
  const contributors = useQuery({
    queryKey: ["admin-leaderboard", user?.id, filters],
    queryFn: ({ signal }) => leaderboardApi.contributors(filters, signal),
    enabled: !isLoading && allowed && !invalidDates,
    gcTime: 0,
  });
  const audit = useQuery({
    queryKey: ["leaderboard-audit", user?.id, selected],
    queryFn: ({ signal }) => leaderboardApi.audit(selected!, signal),
    enabled: !isLoading && allowed && !!selected,
    gcTime: 0,
  });
  function updateFilters(next: Partial<AdminFilters>) {
    setFilters(previous => ({ ...previous, ...next }));
    setSelected(null);
  }
  if (isLoading) return <p role="status">Loading…</p>;
  if (!allowed) return <p role="alert">Contributor administration is available to admins and moderators only.</p>;
  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Contributor leaderboard</h1><p className="mt-2 text-muted-foreground">Review submission counts, translation activity, and contributor audits.</p></div>
    <div className="flex flex-wrap gap-4">
      <label className="text-sm font-medium">Submission status<select className={control} value={filters.status ?? ""} onChange={e => updateFilters({ status: (e.target.value || undefined) as SubmissionStatus | undefined })}><option value="">All statuses</option><option value="APPROVED">Approved</option><option value="PENDING">Pending</option><option value="REJECTED">Rejected</option></select></label>
      <label className="text-sm font-medium">From<input className={control} type="date" value={filters.from ?? ""} max={filters.to} onChange={e => updateFilters({ from: e.target.value || undefined })} /></label>
      <label className="text-sm font-medium">To<input className={control} type="date" value={filters.to ?? ""} min={filters.from} onChange={e => updateFilters({ to: e.target.value || undefined })} /></label>
      <label className="text-sm font-medium">Show<select className={control} value={filters.limit} onChange={e => updateFilters({ limit: Number(e.target.value) })}>{[50, 100, 250, 500].map(n => <option key={n} value={n}>Top {n}</option>)}</select></label>
    </div>
    {invalidDates ? <p role="alert">The end date must be on or after the start date.</p> : contributors.isPending ? <p role="status">Loading contributors…</p> : contributors.isError ? <div role="alert"><p>{contributors.error.message}</p><Button className="mt-3" onClick={() => contributors.refetch()}>Try again</Button></div> : contributors.data.length === 0 ? <p>No contributors match these filters.</p> : <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Contributor rankings and submission statuses</caption>
        <thead className="bg-muted"><tr>{["Rank", "Contributor", "Account", "Approved", "Pending", "Rejected", "Total", "Translations", "Score", "Audit"].map(label => <th scope="col" className="whitespace-nowrap p-3" key={label}>{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">{contributors.data.map(entry => <tr key={entry.userId}>
          <td className="p-3">{entry.rank}</td><th scope="row" className="p-3 font-normal"><span className="block font-semibold">{entry.name}</span><span className="text-muted-foreground">{entry.email}</span></th>
          <td className="p-3"><span className="block">{entry.status}</span><span className="block text-xs text-muted-foreground">{entry.roles.join(", ")}</span><span className="text-xs text-muted-foreground">Joined {entry.createdAt.slice(0, 10)}</span></td>
          {[entry.approvedSubmissions, entry.pendingSubmissions, entry.rejectedSubmissions, entry.totalSubmissions, entry.translationActivities, entry.score].map((count, i) => <td key={i} className="p-3">{count.toLocaleString()}</td>)}
          <td className="p-3"><Button size="sm" variant="outline" aria-label={`View audit for ${entry.name}`} aria-pressed={selected === entry.userId} onClick={() => setSelected(entry.userId)}>View audit</Button></td>
        </tr>)}</tbody>
      </table>
    </div>}
    {selected && <section aria-labelledby="audit-heading" aria-live="polite" className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3"><h2 id="audit-heading" className="text-xl font-bold">Contributor audit</h2><Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Close</Button></div>
      <p className="mt-1 text-sm text-muted-foreground">Full user breakdown; list filters do not apply to this audit.</p>
      {audit.isPending ? <p role="status" className="mt-4">Loading audit…</p> : audit.isError ? <div role="alert"><p>{audit.error.message}</p><Button onClick={() => audit.refetch()}>Try again</Button></div> : audit.data && <>
        <h3 className="mt-5 font-semibold">{audit.data.name}</h3><p className="text-sm text-muted-foreground">{audit.data.email}</p>
        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">{[["Total submissions", audit.data.totalSubmissions], ["Approved", audit.data.approvedSubmissions], ["Pending", audit.data.pendingSubmissions], ["Rejected", audit.data.rejectedSubmissions], ["Calculated score", audit.data.calculatedScore]].map(([label, value]) => <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="text-lg font-bold">{value.toLocaleString()}</dd></div>)}</dl>
        <h3 className="mt-6 font-semibold">Activity breakdown</h3>
        {Object.keys(audit.data.activityTypeBreakdown).length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No activity recorded.</p> : <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">{Object.entries(audit.data.activityTypeBreakdown).map(([type, count]) => <div key={type}><dt className="text-sm text-muted-foreground">{type.replaceAll("_", " ")}</dt><dd className="font-bold">{count.toLocaleString()}</dd></div>)}</dl>}
      </>}
    </section>}
  </div>;
}
