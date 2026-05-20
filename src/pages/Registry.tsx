import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Users } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusPill from "../components/StatusPill";
import { Skeleton } from "../components/Skeleton";
import { ErrorCard } from "../components/ErrorCard";
import { EmptyState } from "../components/EmptyState";
import { api, type Taxpayer } from "../lib/api";

function useTaxpayers() {
  return useQuery({ queryKey: ["taxpayers"], queryFn: api.taxpayers.list });
}

function useStats() {
  return useQuery({ queryKey: ["dashboard-stats"], queryFn: api.forms.stats });
}

function RegistrySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  );
}

export default function Registry() {
  const [search, setSearch] = useState("");
  const [rdoFilter, setRdoFilter] = useState("");
  const [civilFilter, setCivilFilter] = useState("");
  const [, navigate] = useLocation();

  const { data: taxpayers, isLoading, isError, refetch } = useTaxpayers();
  const { data: stats } = useStats();

  if (isLoading) return <RegistrySkeleton />;
  if (isError) return <ErrorCard message="Could not load registry." onRetry={refetch} />;

  const all = taxpayers ?? [];

  const filtered = all.filter((tp) => {
    if (civilFilter && tp.civilStatus !== civilFilter) return false;
    if (rdoFilter && String(tp.rdoCode) !== rdoFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return tp.fullName.toLowerCase().includes(q) || tp.tin.includes(q);
    }
    return true;
  });

  const byStatus = stats?.byStatus ?? {};
  const kpis = [
    { label: "Total Registered", value: all.length },
    { label: "Active TINs", value: byStatus.filed ?? 0 },
    { label: "Verifying", value: byStatus.submitted ?? 0 },
    { label: "Returned", value: byStatus.amended ?? 0 },
  ];

  function getStatus(tp: Taxpayer) {
    const latest = tp.formSubmissions?.[0];
    return latest?.status ?? ("draft" as const);
  }

  return (
    <>
      <PageHeader
        title="Taxpayer Registry"
        sub="All registered taxpayers and their TIN status."
      />

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">{label}</p>
            <p className="mt-2 text-3xl font-bold font-mono text-text">{value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 mb-4">
        <select
          value={civilFilter}
          onChange={(e) => setCivilFilter(e.target.value)}
          className="h-9 px-3 rounded border border-border bg-surface text-text text-sm focus:outline-none focus:border-blue"
        >
          <option value="">All Civil Status</option>
          {["single", "married", "widowed", "separated"].map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
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
          icon={Users}
          title="No taxpayers found."
          sub="Registered taxpayers will appear here after application submission."
        />
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">TIN</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Taxpayer Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Employer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Civil Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">RDO</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((tp) => {
                const employer = tp.employers?.[0];
                const status = getStatus(tp);
                return (
                  <tr
                    key={tp.id}
                    onClick={() => {
                      const formId = tp.formSubmissions?.[0]?.id;
                      if (formId) navigate(`/applications/${formId}`);
                    }}
                    className="border-b border-border last:border-0 hover:bg-canvas cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3 font-mono text-xs text-muted">{tp.tin}</td>
                    <td className="px-6 py-3 font-medium text-text">{tp.fullName}</td>
                    <td className="px-6 py-3 text-xs text-text-2">{employer?.employerFullName ?? "—"}</td>
                    <td className="px-6 py-3 text-xs text-muted capitalize">{tp.civilStatus}</td>
                    <td className="px-6 py-3 text-xs text-muted capitalize">{tp.taxpayerType}</td>
                    <td className="px-6 py-3 font-mono text-xs text-muted">{tp.rdoCode}</td>
                    <td className="px-6 py-3">
                      <StatusPill status={status} variant="registry" />
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-blue hover:underline">
                      View →
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
