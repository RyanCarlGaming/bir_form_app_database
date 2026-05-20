import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { FileText } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusPill from "../components/StatusPill";
import { Skeleton } from "../components/Skeleton";
import { ErrorCard } from "../components/ErrorCard";
import { EmptyState } from "../components/EmptyState";
import { api, type FormSubmission, type TaxpayerStatus } from "../lib/api";

interface Props {
  title: string;
  sub: string;
  status: TaxpayerStatus;
  emptyTitle: string;
  emptySub: string;
}

function formatRef(form: FormSubmission) {
  const year = new Date(form.createdAt).getFullYear();
  return `APP-${year}-${String(form.id).padStart(4, "0")}`;
}

function StatusPageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-16" />
      <Skeleton className="h-[360px]" />
    </div>
  );
}

export default function ApplicationStatusPage({ title, sub, status, emptyTitle, emptySub }: Props) {
  const [, navigate] = useLocation();
  const { data: forms, isLoading, isError, refetch } = useQuery({
    queryKey: ["forms", { status }],
    queryFn: () => api.forms.list({ status }),
  });

  if (isLoading) return <StatusPageSkeleton />;
  if (isError) return <ErrorCard message={`Could not load ${title.toLowerCase()}.`} onRetry={refetch} />;

  const rows = [...(forms ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      <PageHeader
        title={title}
        sub={sub}
        actions={
          <Link
            href="/applications/new"
            className="px-4 py-2 bg-blue text-white text-sm font-medium rounded hover:opacity-90 transition-opacity"
          >
            + New Application
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState icon={FileText} title={emptyTitle} sub={emptySub} />
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Ref</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Taxpayer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">TIN</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">RDO</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Updated</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((form) => (
                <tr
                  key={form.id}
                  onClick={() => navigate(`/applications/${form.id}`)}
                  className="border-b border-border last:border-0 hover:bg-canvas cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3 font-mono text-xs text-text-2">{formatRef(form)}</td>
                  <td className="px-6 py-3 font-medium text-text">{form.taxpayer?.fullName ?? "—"}</td>
                  <td className="px-6 py-3 font-mono text-xs text-muted">{form.taxpayer?.tin ?? "—"}</td>
                  <td className="px-6 py-3 font-mono text-xs text-muted">{form.taxpayer?.rdoCode ?? "—"}</td>
                  <td className="px-6 py-3"><StatusPill status={form.status} variant="pipeline" /></td>
                  <td className="px-6 py-3 font-mono text-xs text-muted">{form.updatedAt.slice(0, 10)}</td>
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
        </div>
      )}
    </>
  );
}
