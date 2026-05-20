import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { CheckCircle, XCircle, Pencil, Save, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusPill from "../components/StatusPill";
import { Skeleton } from "../components/Skeleton";
import { ErrorCard } from "../components/ErrorCard";
import { fieldInputCls } from "../components/Fields";
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

interface EditState {
  fullName: string;
  tin: string;
  mobile: string;
  email: string;
  addrStreet: string;
  addrBarangay: string;
  addrCity: string;
  province: string;
  zipCode: string;
  rdoCode: string;
  remarks: string;
}

function makeEditState(form: FormSubmission): EditState {
  const tp = form.taxpayer;
  return {
    fullName: tp?.fullName ?? "",
    tin: tp?.tin ?? "",
    mobile: tp?.mobile ?? "",
    email: tp?.email ?? "",
    addrStreet: tp?.addrStreet ?? "",
    addrBarangay: tp?.addrBarangay ?? "",
    addrCity: tp?.addrCity ?? "",
    province: tp?.province ?? "",
    zipCode: tp?.zipCode ?? "",
    rdoCode: String(tp?.rdoCode ?? ""),
    remarks: form.remarks ?? "",
  };
}

function EditField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldInputCls}
      />
    </label>
  );
}

function EditApplicationPanel({
  value,
  onChange,
  onCancel,
  onSave,
  saving,
  error,
}: {
  value: EditState;
  onChange: (next: EditState) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  error: string;
}) {
  function setField<K extends keyof EditState>(key: K, nextValue: EditState[K]) {
    onChange({ ...value, [key]: nextValue });
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-canvas">
        <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">Edit Taxpayer Record</p>
      </div>
      <div className="grid grid-cols-2 gap-4 p-5">
        <EditField label="Full Name" value={value.fullName} onChange={(v) => setField("fullName", v)} />
        <EditField label="TIN" value={value.tin} onChange={(v) => setField("tin", v)} />
        <EditField label="Mobile Number" value={value.mobile} onChange={(v) => setField("mobile", v)} />
        <EditField label="Email" value={value.email} onChange={(v) => setField("email", v)} />
        <EditField label="Street" value={value.addrStreet} onChange={(v) => setField("addrStreet", v)} />
        <EditField label="Barangay" value={value.addrBarangay} onChange={(v) => setField("addrBarangay", v)} />
        <EditField label="City" value={value.addrCity} onChange={(v) => setField("addrCity", v)} />
        <EditField label="Province" value={value.province} onChange={(v) => setField("province", v)} />
        <EditField label="ZIP Code" value={value.zipCode} onChange={(v) => setField("zipCode", v)} />
        <EditField label="RDO Code" value={value.rdoCode} onChange={(v) => setField("rdoCode", v)} />
        <label className="col-span-2 flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">Remarks</span>
          <textarea
            value={value.remarks}
            onChange={(event) => setField("remarks", event.target.value)}
            className={cn(fieldInputCls, "h-24 py-2 resize-none")}
          />
        </label>
      </div>
      {error && <p className="px-5 pb-3 text-xs text-red">{error}</p>}
      <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 border border-border text-sm rounded hover:bg-border transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy text-white text-sm rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Save size={15} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
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
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (form) setEditState(makeEditState(form));
  }, [form]);

  const saveMutation = useMutation({
    mutationFn: async (next: EditState) => {
      if (!form?.taxpayer) throw new Error("Taxpayer record is missing.");

      await api.taxpayers.update(form.taxpayer.id, {
        fullName: next.fullName,
        tin: next.tin,
        mobile: next.mobile,
        email: next.email,
        addrStreet: next.addrStreet,
        addrBarangay: next.addrBarangay,
        addrCity: next.addrCity,
        province: next.province,
        zipCode: next.zipCode,
        rdoCode: next.rdoCode,
      });

      return api.forms.update(form.id, { remarks: next.remarks });
    },
    onSuccess() {
      setEditing(false);
      setActionError("");
      queryClient.invalidateQueries({ queryKey: ["form", id] });
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["taxpayers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError(err: Error) {
      setActionError(err.message);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: "draft" | "submitted" | "filed") =>
      api.forms.update(Number(id), {
        status,
        filedDate: status === "filed" ? new Date().toISOString() : "",
      }),
    onSuccess() {
      setActionError("");
      queryClient.invalidateQueries({ queryKey: ["form", id] });
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["taxpayers"] });
    },
    onError(err: Error) {
      setActionError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.forms.delete(Number(id)),
    onSuccess() {
      setActionError("");
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["taxpayers"] });
      navigate("/applications");
    },
    onError(err: Error) {
      setActionError(err.message);
    },
  });

  if (isLoading) return <DetailSkeleton />;
  if (isError) return <ErrorCard message="Could not load application." onRetry={refetch} />;
  if (!form) return <ErrorCard message="Application not found." />;

  const tp = form.taxpayer;
  const year = new Date(form.createdAt).getFullYear();
  const ref = `APP-${year}-${String(form.id).padStart(4, "0")}`;
  const employer = tp?.employers?.[0];
  const busy = saveMutation.isPending || statusMutation.isPending || deleteMutation.isPending;

  function beginEdit() {
    setEditState(makeEditState(form));
    setEditing(true);
    setActionError("");
  }

  function deleteRecord() {
    if (window.confirm("Delete this application from the database? This cannot be undone.")) {
      deleteMutation.mutate();
    }
  }

  return (
    <>
      <PageHeader
        title={tp?.fullName ?? ref}
        sub={ref}
        status={<StatusPill status={form.status} variant="pipeline" />}
        back={{ href: "/applications", label: "Applications" }}
        actions={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={busy || form.status === "draft"}
              onClick={() => statusMutation.mutate("draft")}
              className="px-3 py-1.5 border border-border text-sm rounded hover:bg-border disabled:opacity-40 transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={busy || form.status === "submitted"}
              onClick={() => statusMutation.mutate("submitted")}
              className="px-3 py-1.5 border border-border text-sm rounded hover:bg-border disabled:opacity-40 transition-colors"
            >
              Submit
            </button>
            <button
              type="button"
              disabled={busy || form.status === "filed"}
              onClick={() => statusMutation.mutate("filed")}
              className="px-3 py-1.5 bg-green text-white text-sm rounded hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Mark Filed
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={beginEdit}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-border text-sm rounded hover:bg-border disabled:opacity-40 transition-colors"
            >
              <Pencil size={15} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 border border-border text-sm rounded hover:bg-border transition-colors"
            >
              Print
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={deleteRecord}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-red/40 text-red text-sm rounded hover:bg-red/5 disabled:opacity-40 transition-colors"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        }
      />

      {actionError && !editing && (
        <div className="mb-4 rounded-lg border border-red/30 bg-red/5 p-4">
          <p className="text-xs text-red">{actionError}</p>
        </div>
      )}

      <div className="grid grid-cols-[1.6fr_1fr] gap-6 mt-4">
        {/* Left — data display */}
        <div className="flex flex-col gap-4">
          {editing && editState && (
            <EditApplicationPanel
              value={editState}
              onChange={setEditState}
              onCancel={() => {
                setEditing(false);
                setActionError("");
              }}
              onSave={() => saveMutation.mutate(editState)}
              saving={saveMutation.isPending}
              error={actionError}
            />
          )}
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
