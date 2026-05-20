import { useQuery } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import { Skeleton } from "../components/Skeleton";
import { ErrorCard } from "../components/ErrorCard";
import { api } from "../lib/api";

export default function Reports() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.forms.stats,
  });

  if (isLoading) return <Skeleton className="h-[420px]" />;
  if (isError) return <ErrorCard message="Could not load reports." onRetry={refetch} />;

  const statusRows = Object.entries(stats?.byStatus ?? {});
  const rdoRows = Object.entries(stats?.byRdo ?? {}).sort(([, a], [, b]) => b - a);

  return (
    <>
      <PageHeader title="Reports" sub="Operational totals for BIR Form 1902 processing." />
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
