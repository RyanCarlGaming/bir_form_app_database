import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { FileText, Users, AlertCircle, RotateCcw, type LucideIcon } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { DonutChart, BarChart } from "../components/Charts";
import StatusPill from "../components/StatusPill";
import { Skeleton } from "../components/Skeleton";
import { ErrorCard } from "../components/ErrorCard";
import { api, type FormSubmission, type StatsSummary } from "../lib/api";

function useDashboardStats() {
  return useQuery({ queryKey: ["dashboard-stats"], queryFn: api.forms.stats });
}

function useRecentForms() {
  return useQuery({ queryKey: ["recent-forms"], queryFn: () => api.forms.list() });
}

function formatRef(form: FormSubmission) {
  const year = new Date(form.createdAt).getFullYear();
  return `APP-${year}-${String(form.id).padStart(4, "0")}`;
}

function kpiCards(stats: StatsSummary) {
  const { total, totalTaxpayers, byStatus } = stats;
  return [
    { label: "Total Applications",      value: total,                    sub: `${byStatus.draft ?? 0} draft`,      icon: FileText },
    { label: "Registered Taxpayers",    value: totalTaxpayers ?? 0,      sub: "Unique TIN holders",                icon: Users },
    { label: "Pending Verification",    value: byStatus.submitted ?? 0,  sub: "Awaiting review",                   icon: AlertCircle },
    { label: "Returned for Correction", value: byStatus.amended ?? 0,    sub: "Awaiting correction",               icon: RotateCcw },
  ] as Array<{ label: string; value: number; sub: string; icon: LucideIcon }>;
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-[1fr_1.4fr] gap-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}

export default function Dashboard() {
  const statsQ = useDashboardStats();
  const formsQ = useRecentForms();

  if (statsQ.isLoading || formsQ.isLoading) return <DashboardSkeleton />;
  if (statsQ.isError) return <ErrorCard message="Could not load dashboard data." onRetry={statsQ.refetch} />;

  const stats = statsQ.data!;
  const forms = [...(formsQ.data ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const donutSegments = [
    { label: "Issued", value: stats.byStatus.filed ?? 0, color: "var(--color-navy)" },
    { label: "Verifying", value: stats.byStatus.submitted ?? 0, color: "var(--color-blue)" },
    { label: "Draft", value: stats.byStatus.draft ?? 0, color: "var(--color-border-strong)" },
    { label: "Returned", value: stats.byStatus.amended ?? 0, color: "var(--color-red)" },
  ];

  const barBars = Object.entries(stats.byRdo)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([label, value]) => ({ label: `RDO ${label}`, value }));

  return (
    <>
      <PageHeader
        title="System Dashboard"
        sub={`Overview of BIR Form 1902 applications for ${stats.companyName ?? "the selected company"}.`}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpiCards(stats).map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">{label}</p>
              <Icon size={20} className="text-muted" />
            </div>
            <p className="text-3xl font-bold font-mono text-text">{value}</p>
            <p className="mt-1 text-xs text-muted">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-[1fr_1.4fr] gap-4 mb-6">
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-semibold text-text mb-4">Applications by Status</p>
          <div className="flex items-center gap-6">
            <DonutChart segments={donutSegments} />
            <div className="flex flex-col gap-2.5 min-w-0">
              {donutSegments.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: s.color }}
                  />
                  <span className="text-xs text-muted truncate">{s.label}</span>
                  <span className="text-xs font-mono text-text ml-auto pl-2">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-semibold text-text mb-4">Applications by RDO</p>
          {barBars.length > 0 ? (
            <BarChart bars={barBars} />
          ) : (
            <p className="text-sm text-muted py-8 text-center">No data yet.</p>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-text">Recent Activity</p>
          <Link href="/applications" className="text-xs text-blue hover:underline">
            View all →
          </Link>
        </div>
        {forms.length === 0 ? (
          <p className="px-6 py-10 text-sm text-muted text-center">No applications yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Ref</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">RDO</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Date</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr
                  key={form.id}
                  className="border-b border-border last:border-0 hover:bg-canvas transition-colors cursor-default"
                >
                  <td className="px-6 py-3 font-mono text-xs text-text-2">{formatRef(form)}</td>
                  <td className="px-6 py-3 font-medium text-text">{form.taxpayer?.fullName ?? "—"}</td>
                  <td className="px-6 py-3"><StatusPill status={form.status} variant="pipeline" /></td>
                  <td className="px-6 py-3 font-mono text-xs text-muted">{form.taxpayer?.rdoCode ?? "—"}</td>
                  <td className="px-6 py-3 font-mono text-xs text-muted">{form.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
