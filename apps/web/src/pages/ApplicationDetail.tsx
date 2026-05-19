import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CheckCircle, XCircle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusPill from "../components/StatusPill";
import { Skeleton } from "../components/Skeleton";
import { ErrorCard } from "../components/ErrorCard";
import { api, type FormSubmission, type Taxpayer } from "../lib/api";
import { cn } from "../lib/utils";

interface Props { id: string; }

function useForm(id: string) {
  return useQuery({
    queryKey: ["form", id],
    queryFn: () => api.forms.get(Number(id)),
    enabled: !!id,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso?: string) {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

function daysSince(iso?: string) {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: string | number | undefined }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-canvas">
        <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">{title}</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 px-5 py-4 text-xs">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-muted">{label}</dt>
            <dd className="text-text font-medium">{value ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ValidationChecks({ form }: { form: FormSubmission }) {
  const tp = form.taxpayer;
  if (!tp) return null;

  const employer = tp.employers?.[0];
  const checks = [
    {
      label: "All required fields filled",
      pass: !!tp.tin && !!tp.fullName && !!tp.mobile && !!tp.email,
    },
    {
      label: "Valid email format",
      pass: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tp.email ?? ""),
    },
    {
      label: "ID expiry after effectivity",
      pass:
        !tp.idEffectivity || !tp.idExpiry || tp.idExpiry >= tp.idEffectivity,
    },
    {
      label: "Filed within 10-day window",
      pass: !employer?.hireDate || daysSince(employer.hireDate) <= 10,
    },
    {
      label: "Tax type, Form, ATC locked",
      pass:
        tp.taxType === "Compensation" && tp.formType === "1902" && tp.atc === "QC",
    },
  ];

  const allPass = checks.every((c) => c.pass);

  if (allPass) {
    return (
      <div className="rounded-xl p-5" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={16} className="text-blue-600 shrink-0" style={{ color: "#2563EB" }} />
          <p className="text-xs font-semibold text-blue-700" style={{ color: "#1D4ED8" }}>Validation Status</p>
        </div>
        <p className="text-xs" style={{ color: "#1E40AF" }}>All checks passed. This application is ready for filing.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2 mb-4">Validation</p>
      <div className="flex flex-col gap-3">
        {checks.map(({ label, pass }) => (
          <div key={label} className="flex items-start gap-2">
            {pass ? (
              <CheckCircle size={15} className="text-green shrink-0 mt-0.5" />
            ) : (
              <XCircle size={15} className="text-red shrink-0 mt-0.5" />
            )}
            <span className={cn("text-xs leading-relaxed", pass ? "text-text" : "text-red")}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilingTimeline({ form }: { form: FormSubmission }) {
  const steps = [
    { label: "Draft", date: formatDate(form.createdAt), done: true },
    {
      label: "Submitted",
      date: form.status !== "draft" ? formatDate(form.updatedAt) : "—",
      done: form.status !== "draft",
    },
    {
      label: form.status === "amended" ? "Returned" : "Filed",
      date: form.status === "filed" || form.status === "amended"
        ? formatDate(form.filedDate ?? form.updatedAt)
        : "—",
      done: form.status === "filed" || form.status === "amended",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2 mb-4">Timeline</p>
      <div className="flex flex-col gap-3">
        {steps.map(({ label, date, done }) => (
          <div key={label} className="flex items-center gap-3">
            <span className={cn(
              "w-2.5 h-2.5 rounded-full shrink-0",
              done ? "bg-navy" : "bg-border",
            )} />
            <span className={cn("text-xs flex-1", done ? "text-text" : "text-muted")}>
              {label}
            </span>
            <span className="text-xs font-mono text-muted">{date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaxpayerMiniCard({ tp }: { tp: Taxpayer }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2 mb-3">Taxpayer</p>
      <p className="text-2xl font-mono font-bold text-text mb-1">{tp.tin}</p>
      <p className="text-sm font-medium text-text">{tp.fullName}</p>
      <div className="mt-3 flex flex-col gap-1 text-xs text-muted">
        <span>RDO {tp.rdoCode}</span>
        {tp.mobile && <span>{tp.mobile}</span>}
        {tp.email && <span>{tp.email}</span>}
      </div>
      <Link
        href={`/registry`}
        className="mt-3 inline-block text-xs text-blue hover:underline"
      >
        View full profile →
      </Link>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-16" />
      <div className="grid grid-cols-[1.6fr_1fr] gap-6">
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-48" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ApplicationDetail({ id }: Props) {
  const { data: form, isLoading, isError, refetch } = useForm(id);

  if (isLoading) return <DetailSkeleton />;
  if (isError) return <ErrorCard message="Could not load application." onRetry={refetch} />;
  if (!form) return <ErrorCard message="Application not found." />;

  const tp = form.taxpayer;
  const year = new Date(form.createdAt).getFullYear();
  const ref = `APP-${year}-${String(form.id).padStart(4, "0")}`;
  const employer = tp?.employers?.[0];

  return (
    <>
      <PageHeader
        title={tp?.fullName ?? ref}
        sub={ref}
        status={<StatusPill status={form.status} variant="pipeline" />}
        back={{ href: "/applications", label: "Applications" }}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 border border-border text-sm rounded hover:bg-border transition-colors"
            >
              Print
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-[1.6fr_1fr] gap-6 mt-4">
        {/* Left — data display */}
        <div className="flex flex-col gap-4">
          <DetailCard
            title="Part I · Taxpayer"
            rows={[
              { label: "Taxpayer Type", value: tp?.taxpayerType },
              { label: "Full Name", value: tp?.fullName },
              { label: "Gender", value: tp?.gender },
              { label: "Civil Status", value: tp?.civilStatus },
              { label: "Date of Birth", value: formatDate(tp?.dateOfBirth) },
              { label: "Place of Birth", value: tp?.placeOfBirth },
              { label: "Citizenship", value: tp?.citizenship },
              { label: "PCN", value: tp?.pcn },
            ]}
          />
          <DetailCard
            title="Part I · Address"
            rows={[
              {
                label: "Local Address",
                value: [tp?.addrStreet, tp?.addrBarangay, tp?.addrCity]
                  .filter(Boolean)
                  .join(", "),
              },
              { label: "Mun. Code", value: tp?.munCode },
              { label: "RDO Code", value: tp?.rdoCode },
              { label: "ZIP", value: tp?.zipCode },
              { label: "Foreign Address", value: tp?.foreignAddress },
              { label: "Mobile", value: tp?.mobile },
              { label: "Email", value: tp?.email },
            ]}
          />
          <DetailCard
            title="Part I · Tax & ID"
            rows={[
              { label: "Tax Type", value: tp?.taxType },
              { label: "Form Type", value: tp?.formType },
              { label: "ATC", value: tp?.atc },
              { label: "ID Type", value: tp?.idType },
              { label: "ID Number", value: tp?.idNumber },
              { label: "Issuer", value: tp?.idIssuer },
              { label: "Effectivity", value: formatDate(tp?.idEffectivity) },
              { label: "Expiry", value: formatDate(tp?.idExpiry) },
            ]}
          />
          <DetailCard
            title="Part II · Spouse"
            rows={
              tp?.civilStatus !== "married"
                ? [{ label: "Status", value: `N/A — ${tp?.civilStatus ?? "—"}` }]
                : [
                    { label: "Spouse Name", value: tp.spouse?.spouseFullName },
                    { label: "Spouse TIN", value: tp.spouse?.spouseTin },
                    { label: "Employment", value: tp.spouse?.spouseEmployment },
                    { label: "Exemption Claimant", value: tp.spouse?.exemptionClaimant },
                  ]
            }
          />
          <DetailCard
            title="Part IV · Employer"
            rows={
              employer
                ? [
                    { label: "Office Type", value: employer.registeringOfficeType },
                    { label: "Employer TIN", value: employer.employerTin },
                    { label: "Employer Name", value: employer.employerFullName },
                    { label: "Address", value: employer.employerFullAddress },
                    { label: "Hire Date", value: formatDate(employer.hireDate) },
                    { label: "Employment Type", value: employer.employmentType },
                  ]
                : [{ label: "Employer", value: "Not provided" }]
            }
          />

          {/* Dependents */}
          {tp?.dependents && tp.dependents.length > 0 && (
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-canvas">
                <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">
                  Dependents
                </p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-2 text-left text-muted font-semibold">Name</th>
                    <th className="px-5 py-2 text-left text-muted font-semibold">Date of Birth</th>
                    <th className="px-5 py-2 text-left text-muted font-semibold">Incapacitated</th>
                  </tr>
                </thead>
                <tbody>
                  {tp.dependents.map((d, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-5 py-2 text-text">{d.fullName}</td>
                      <td className="px-5 py-2 font-mono text-muted">{formatDate(d.dateOfBirth)}</td>
                      <td className="px-5 py-2 text-muted">{d.isIncapacitated ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right — mini-card, timeline, validation */}
        <div className="flex flex-col gap-4">
          {tp && <TaxpayerMiniCard tp={tp} />}
          <FilingTimeline form={form} />
          <ValidationChecks form={form} />
        </div>
      </div>
    </>
  );
}
