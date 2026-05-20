import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { FileText } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusPill from "../components/StatusPill";
import { Skeleton } from "../components/Skeleton";
import { ErrorCard } from "../components/ErrorCard";
import { EmptyState } from "../components/EmptyState";
import { api, type FormSubmission, type TaxpayerStatus } from "../lib/api";

const STATUSES: Array<{ key: TaxpayerStatus | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "submitted", label: "Submitted" },
  { key: "filed", label: "Filed" },
  { key: "amended", label: "Amended" },
];

function useFormsList(status: TaxpayerStatus | "all") {
  return useQuery({
    queryKey: ["forms", { status }],
    queryFn: () =>
      api.forms.list(status !== "all" ? { status } : undefined),
  });
}

function useStats() {
  return useQuery({ queryKey: ["dashboard-stats"], queryFn: api.forms.stats });
}

function formatRef(form: FormSubmission) {
  const year = new Date(form.createdAt).getFullYear();
  return `APP-${year}-${String(form.id).padStart(4, "0")}`;
}

function ApplicationsListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-24" />)}
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  );
}

export default function ApplicationsList() {
  const [activeStatus, setActiveStatus] = useState<TaxpayerStatus | "all">("all");
  const [search, setSearch] = useState(() => sessionStorage.getItem("applicationSearch") ?? "");
  const [rdoFilter, setRdoFilter] = useState("");
  const [, navigate] = useLocation();

  useEffect(() => {
    function syncGlobalSearch() {
      setSearch(sessionStorage.getItem("applicationSearch") ?? "");
    }

    window.addEventListener("application-search", syncGlobalSearch);
    return () => window.removeEventListener("application-search", syncGlobalSearch);
  }, []);

  const { data: forms, isLoading, isError, refetch } = useFormsList(activeStatus);
  const { data: stats } = useStats();

  if (isLoading) return <ApplicationsListSkeleton />;
  if (isError) return <ErrorCard message="Could not load applications." onRetry={refetch} />;

  const filtered = (forms ?? [])
    .filter((f) => {
      if (rdoFilter && String(f.taxpayer?.rdoCode) !== rdoFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (f.taxpayer?.fullName ?? "").toLowerCase().includes(q) ||
          (f.taxpayer?.tin ?? "").includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const byStatus = stats?.byStatus ?? {};

  return (
    <>
      <PageHeader
        title="Form Submissions"
        sub="Manage and track all BIR Form 1902 applications."
        actions={
          <Link
            href="/applications/new"
            className="px-4 py-2 bg-blue text-white text-sm font-medium rounded hover:opacity-90 transition-opacity"
          >
            + New Application
          </Link>
        }
      />

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-border mb-5">
        {STATUSES.map(({ key, label }) => {
          const count = key === "all"
            ? Object.values(byStatus).reduce((s, n) => s + (n ?? 0), 0)
            : (byStatus[key] ?? 0);
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveStatus(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeStatus === key
                  ? "border-blue text-blue"
                  : "border-transparent text-muted hover:text-text"
              }`}
            >
              {label}
              {stats && (
                <span className="ml-1.5 text-xs font-mono opacity-70">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 mb-4">
        <select
          value={rdoFilter}
          onChange={(e) => setRdoFilter(e.target.value)}
          className="h-9 px-3 rounded border border-border bg-surface text-text text-sm focus:outline-none focus:border-blue"
        >
          <option value="">All RDOs</option>
          {["044", "039", "051", "060", "033"].map((r) => (
            <option key={r} value={r}>RDO {r}</option>
          ))}
        </select>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or TIN…"
          className="ml-auto h-9 px-3 rounded border border-border bg-surface text-text text-sm focus:outline-none focus:border-blue w-64"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found."
          sub="Try a different filter or start a new application."
          action={{ label: "New Application →", onClick: () => navigate("/applications/new") }}
        />
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Form Info</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Taxpayer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">TIN</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">RDO</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Last Updated</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((form) => (
                <tr
                  key={form.id}
                  onClick={() => navigate(`/applications/${form.id}`)}
                  className="border-b border-border last:border-0 hover:bg-canvas cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3">
                    <p className="font-semibold text-text text-sm">{form.formType ?? "1902"}</p>
                    <p className="text-xs text-muted">Year {new Date(form.createdAt).getFullYear()}</p>
                  </td>
                  <td className="px-6 py-3 font-medium text-text">{form.taxpayer?.fullName ?? "—"}</td>
                  <td className="px-6 py-3 font-mono text-xs text-muted">{form.taxpayer?.tin ?? "—"}</td>
                  <td className="px-6 py-3 font-mono text-xs text-muted">{form.taxpayer?.rdoCode ?? "—"}</td>
                  <td className="px-6 py-3"><StatusPill status={form.status} variant="pipeline" /></td>
                  <td className="px-6 py-3 font-mono text-xs text-muted">{form.createdAt.slice(0, 10)}</td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/applications/${form.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-blue hover:underline"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-border flex items-center justify-between text-xs text-muted">
            <span>Showing {filtered.length} of {filtered.length} records</span>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-border transition-colors">‹</button>
              <button className="w-7 h-7 flex items-center justify-center rounded bg-navy text-white text-xs font-medium">1</button>
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-border transition-colors">›</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
