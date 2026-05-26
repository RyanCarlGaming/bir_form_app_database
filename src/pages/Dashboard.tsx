import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  FileText,
  Users,
  AlertCircle,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
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
    {
      label: "Total Applications",
      value: total,
      sub: `${byStatus.draft ?? 0} draft`,
      icon: FileText,
    },
    {
      label: "Registered Taxpayers",
      value: totalTaxpayers ?? 0,
      sub: "Unique TIN holders",
      icon: Users,
    },
    {
      label: "Pending Verification",
      value: byStatus.submitted ?? 0,
      sub: "Awaiting review",
      icon: AlertCircle,
    },
    {
      label: "Returned for Correction",
      value: byStatus.amended ?? 0,
      sub: "Awaiting correction",
      icon: RotateCcw,
    },
  ] as Array<{ label: string; value: number; sub: string; icon: LucideIcon }>;
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-[1fr_1.4fr] gap-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}

/* ─── Reusable card component matching the screenshot style ─── */
interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

function DashboardCard({ title, icon: Icon, children, className = "" }: DashboardCardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface overflow-hidden flex flex-col ${className}`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface">
        <div className="flex items-center gap-2.5">
          <Icon size={18} className="text-primary" />
          <span className="text-sm font-semibold text-primary">{title}</span>
        </div>
        <button className="text-muted hover:text-text transition-colors">
          <ChevronDown size={18} />
        </button>
      </div>
      {/* Card body */}
      <div className="flex-1 p-0">{children}</div>
    </div>
  );
}

/* ─── Mini Calendar Component ─── */
function MiniCalendar() {
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  // Simple calendar grid for demo (March 2026 from screenshot)
  const days = [
    [null, null, null, null, null, "01", null],
    ["02", "03", "04", "05", "06", "07", "08"],
    ["09", "10", "11", "12", "13", "14", "15"],
    ["16", "17", "18", "19", "20", "21", "22"],
    ["23", "24", "25", "26", "27", "28", "29"],
    ["30", "31", null, null, null, null, null],
  ];

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="p-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <button className="p-1 hover:bg-canvas rounded transition-colors">
          <ChevronLeft size={16} className="text-muted" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">
            {currentMonth} {currentYear}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted">
            Today
          </span>
        </div>
        <button className="p-1 hover:bg-canvas rounded transition-colors">
          <ChevronRight size={16} className="text-muted" />
        </button>
      </div>



      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.flat().map((day, idx) => (
          <div
            key={idx}
            className={`text-center text-sm py-1.5 rounded cursor-default transition-colors ${
              day === "23"
                ? "bg-primary text-white font-semibold"
                : day
                ? "text-text hover:bg-canvas"
                : ""
            }`}
          >
            {day || ""}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Pending Applications List ─── */
interface PendingApp {
  id: string;
  name: string;
  status: string;
  statusVariant: "default" | "warning" | "success" | "info";
  icon: LucideIcon;
}

function PendingApplicationsList() {
  const apps: PendingApp[] = [
    {
      id: "1",
      name: "Business Permit",
      status: "In Review",
      statusVariant: "default",
      icon: FileText,
    },
    {
      id: "2",
      name: "Real Property Tax",
      status: "Awaiting Payment",
      statusVariant: "warning",
      icon: CreditCard,
    },
    {
      id: "3",
      name: "QCitizen ID",
      status: "For Releasing",
      statusVariant: "info",
      icon: Users,
    },
  ];

  const statusStyles: Record<string, string> = {
    default: "bg-gray-100 text-gray-600",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    success: "bg-green-50 text-green-700 border border-green-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  return (
    <div className="divide-y divide-border">
      {apps.map((app) => (
        <div key={app.id} className="px-5 py-4 hover:bg-canvas/50 transition-colors">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <app.icon size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text truncate">{app.name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-muted">Status:</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    statusStyles[app.statusVariant]
                  }`}
                >
                  {app.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Recent Payments Chart (Line Chart) ─── */
function RecentPaymentsChart() {
  // Demo data matching the screenshot
  const data = [
    { month: "Jan", value: 500 },
    { month: "Feb", value: 800 },
    { month: "Mar", value: 600 },
    { month: "Apr", value: 1200 },
    { month: "May", value: 900 },
    { month: "Jun", value: 1000 },
  ];

  const maxValue = Math.max(...data.map((d) => d.value));
  const padding = 40;
  const chartWidth = 320;
  const chartHeight = 160;
  const plotWidth = chartWidth - padding * 2;
  const plotHeight = chartHeight - padding * 2;

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * plotWidth,
    y: padding + plotHeight - (d.value / maxValue) * plotHeight,
    value: d.value,
    month: d.month,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    padding + plotHeight
  } L ${points[0].x} ${padding + plotHeight} Z`;

  return (
    <div className="p-4">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        style={{ maxHeight: "180px" }}
      >
        {/* Grid lines */}
        {[0, 500, 1000, 1500].map((val, i) => {
          const y = padding + plotHeight - (val / maxValue) * plotHeight;
          return (
            <g key={val}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={padding - 8}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-muted"
                style={{ fontSize: "10px" }}
              >
                ₱{val}
              </text>
            </g>
          );
        })}

        {/* Area under the line */}
        <path d={areaPath} fill="var(--color-primary)" fillOpacity="0.08" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="var(--color-primary)"
              stroke="white"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text
            key={`label-${i}`}
            x={p.x}
            y={padding + plotHeight + 16}
            textAnchor="middle"
            className="text-xs fill-muted"
            style={{ fontSize: "10px" }}
          >
            {p.month}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ─── Welcome Banner ─── */
function WelcomeBanner({ userName }: { userName?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-text">
          Hi, {userName || "User"}
        </h1>
        <p className="text-sm text-muted mt-1">
          Welcome back to your dashboard
        </p>
      </div>
      <Link
        href="/applications"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
      >
        <ClipboardList size={16} />
        MY APPLICATIONS
      </Link>
    </div>
  );
}

/* ─── Alert Banner ─── */
function AlertBanner() {
  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/80 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle
          size={20}
          className="text-amber-600 shrink-0 mt-0.5"
        />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            Page is currently work in progress.
          </p>
          <div className="mt-2 rounded-md bg-white/60 border border-amber-100 px-3 py-2">
            <p className="text-xs text-amber-700">
              <span className="font-semibold">Disclaimer:</span>{" "}
              <span className="italic">
                The data shown below is for demonstration purposes only.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const statsQ = useDashboardStats();
  const formsQ = useRecentForms();
  const profileQ = useQuery({ queryKey: ["profile"], queryFn: api.profile.get });

  if (statsQ.isLoading || formsQ.isLoading) return <DashboardSkeleton />;
  if (statsQ.isError)
    return (
      <ErrorCard
        message="Could not load dashboard data."
        onRetry={statsQ.refetch}
      />
    );

  const stats = statsQ.data!;
  const forms = [...(formsQ.data ?? [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  const donutSegments = [
    {
      label: "Issued",
      value: stats.byStatus.filed ?? 0,
      color: "var(--color-navy)",
    },
    {
      label: "Verifying",
      value: stats.byStatus.submitted ?? 0,
      color: "var(--color-blue)",
    },
    {
      label: "Draft",
      value: stats.byStatus.draft ?? 0,
      color: "var(--color-border-strong)",
    },
    {
      label: "Returned",
      value: stats.byStatus.amended ?? 0,
      color: "var(--color-red)",
    },
  ];

  const barBars = Object.entries(stats.byRdo)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([label, value]) => ({ label: `RDO ${label}`, value }));

  return (
    <>
      <PageHeader
        title="System Dashboard"
        sub={`Overview of BIR Form 1902 applications for ${
          stats.companyName ?? "the selected company"
        }.`}
      />

      {/* Alert Banner */}
      <AlertBanner />

      {/* Welcome Section */}
      <WelcomeBanner userName={profileQ.data?.officerName ?? stats.companyName} />

      {/* ─── Three Column Card Layout (matching screenshot) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Pending Applications */}
        <DashboardCard
          title="Pending Applications"
          icon={ClipboardList}
        >
          <PendingApplicationsList />
        </DashboardCard>

        {/* Upcoming Appointments */}
        <DashboardCard title="Upcoming Appointments" icon={Calendar}>
          <MiniCalendar />
        </DashboardCard>

        {/* Recent Payments */}
        <DashboardCard title="Recent Payments" icon={CreditCard}>
          <RecentPaymentsChart />
        </DashboardCard>
      </div>

      {/* ─── Original KPI strip (preserved from your code) ─── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpiCards(stats).map(({ label, value, sub, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">
                {label}
              </p>
              <Icon size={20} className="text-muted" />
            </div>
            <p className="text-3xl font-bold font-mono text-text">{value}</p>
            <p className="mt-1 text-xs text-muted">{sub}</p>
          </div>
        ))}
      </div>

      {/* ─── Original Charts row (preserved from your code) ─── */}
      <div className="grid grid-cols-[1fr_1.4fr] gap-4 mb-6">
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-semibold text-text mb-4">
            Applications by Status
          </p>
          <div className="flex items-center gap-6">
            <DonutChart segments={donutSegments} />
            <div className="flex flex-col gap-2.5 min-w-0">
              {donutSegments.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: s.color }}
                  />
                  <span className="text-xs text-muted truncate">
                    {s.label}
                  </span>
                  <span className="text-xs font-mono text-text ml-auto pl-2">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-semibold text-text mb-4">
            Applications by RDO
          </p>
          {barBars.length > 0 ? (
            <BarChart bars={barBars} />
          ) : (
            <p className="text-sm text-muted py-8 text-center">No data yet.</p>
          )}
        </div>
      </div>

      {/* ─── Original Recent activity table (preserved from your code) ─── */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-text">Recent Activity</p>
          <Link
            href="/applications"
            className="text-xs text-blue hover:underline"
          >
            View all →
          </Link>
        </div>
        {forms.length === 0 ? (
          <p className="px-6 py-10 text-sm text-muted text-center">
            No applications yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas">
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">
                  Ref
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">
                  RDO
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-[0.04em]">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr
                  key={form.id}
                  className="border-b border-border last:border-0 hover:bg-canvas transition-colors cursor-default"
                >
                  <td className="px-6 py-3 font-mono text-xs text-text-2">
                    {formatRef(form)}
                  </td>
                  <td className="px-6 py-3 font-medium text-text">
                    {form.taxpayer?.fullName ?? "—"}
                  </td>
                  <td className="px-6 py-3">
                    <StatusPill status={form.status} variant="pipeline" />
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-muted">
                    {form.taxpayer?.rdoCode ?? "—"}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-muted">
                    {form.createdAt.slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}