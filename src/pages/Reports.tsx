import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CreditCard, FileText, FolderOpen, Users } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Skeleton } from "../components/Skeleton";
import { ErrorCard } from "../components/ErrorCard";
import { api } from "../lib/api";

const cards = [
  { label: "All Applications", href: "/applications", icon: FolderOpen, value: "total" },
  { label: "My Drafts", href: "/drafts", icon: FileText, value: "draft" },
  { label: "Issued TINs", href: "/issued-tins", icon: CreditCard, value: "filed" },
  { label: "Taxpayer Registry", href: "/registry", icon: Users, value: "taxpayers" },
] as const;

export default function Reports() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.forms.stats,
  });

  if (isLoading) return <Skeleton className="h-[420px]" />;
  if (isError) return <ErrorCard message="Could not load reports." onRetry={refetch} />;

  const statusRows = Object.entries(stats?.byStatus ?? {});
  const rdoRows = Object.entries(stats?.byRdo ?? {}).sort(([, a], [, b]) => b - a);

  function valueFor(key: (typeof cards)[number]["value"]) {
    if (!stats) return 0;
    if (key === "total") return stats.total;
    if (key === "taxpayers") return stats.totalTaxpayers;
    return stats.byStatus[key] ?? 0;
  }

  return (
    <>
      <PageHeader title="Records & Reports" sub="Jump into application records and operational totals." />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, href, icon: Icon, value }) => (
          <Link key={href} href={href} className="rounded-xl border border-border bg-surface p-5 hover:bg-canvas transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">{label}</p>
              <Icon size={19} className="text-muted" />
            </div>
            <p className="mt-3 text-3xl font-bold font-mono text-text">{valueFor(value)}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          ["Applications", stats?.total ?? 0],
          ["Taxpayers", stats?.totalTaxpayers ?? 0],
          ["Tax Due", stats?.totalTaxDue ?? 0],
          ["Tax Payable", stats?.totalTaxPayable ?? 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">{label}</p>
            <p className="mt-2 text-3xl font-bold font-mono text-text">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-canvas">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">By Status</p>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {statusRows.map(([label, value]) => (
                <tr key={label} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 capitalize text-text">{label}</td>
                  <td className="px-5 py-3 text-right font-mono text-muted">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-canvas">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">By RDO</p>
          </div>
          {rdoRows.length === 0 ? (
            <p className="px-5 py-10 text-sm text-muted text-center">No RDO data yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {rdoRows.map(([label, value]) => (
                  <tr key={label} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-text">RDO {label}</td>
                    <td className="px-5 py-3 text-right font-mono text-muted">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
