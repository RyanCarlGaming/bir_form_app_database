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

export default function Records() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.forms.stats,
  });

  if (isLoading) return <Skeleton className="h-[360px]" />;
  if (isError) return <ErrorCard message="Could not load records." onRetry={refetch} />;

  function valueFor(key: (typeof cards)[number]["value"]) {
    if (!stats) return 0;
    if (key === "total") return stats.total;
    if (key === "taxpayers") return stats.totalTaxpayers;
    return stats.byStatus[key] ?? 0;
  }

  return (
    <>
      <PageHeader title="Records" sub="Jump into application records, taxpayer files, and issued TINs." />
      <div className="grid grid-cols-4 gap-4">
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
    </>
  );
}
