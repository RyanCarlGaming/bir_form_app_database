import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CheckCircle, XCircle } from "lucide-react";
import FormShell from "../../components/FormShell";
import { Checkbox } from "../../components/Fields";
import { useWizard, type StepProps, type WizardState } from "../../lib/wizard";
import { api } from "../../lib/api";
import { cn } from "../../lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toIso(dateStr: string) {
  return dateStr ? new Date(dateStr + "T00:00:00.000Z").toISOString() : "";
}

function daysSince(dateStr: string) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function buildPayload(state: WizardState, status: "draft" | "submitted") {
  const employer = state.employers[0];
  return {
    taxpayer: {
      tin: state.tin,
      birRegDate: toIso(state.birRegDate),
      pcn: state.pcn,
      taxpayerType: state.taxpayerType,
      fullName: [state.lastName, state.firstName, state.middleName]
        .filter(Boolean).join(", ").trim() || state.fullName,
      gender: state.gender as "male" | "female",
      civilStatus: state.civilStatus as "single" | "married" | "widowed" | "separated",
      dateOfBirth: toIso(state.dateOfBirth),
      placeOfBirth: state.placeOfBirth,
      citizenship: state.citizenship,
      otherCitizenship: state.otherCitizenship || undefined,
      motherFullName: state.motherFullName,
      fatherFullName: state.fatherFullName,
      addrStreet: state.addrStreet,
      addrBarangay: state.addrBarangay || undefined,
      addrTownDistrict: state.addrTownDistrict || undefined,
      addrCity: state.addrCity,
      foreignAddress: state.foreignAddress || undefined,
      munCode: state.munCode || undefined,
      landline: state.landline || undefined,
      fax: state.fax || undefined,
      mobile: state.mobile,
      email: state.email,
      taxType: state.taxType,
      formType: state.formType,
      atc: state.atc,
      idType: state.idType,
      idNumber: state.idNumber,
      idEffectivity: toIso(state.idEffectivity),
      idExpiry: toIso(state.idExpiry),
      idIssuer: state.idIssuer,
      idPlace: state.idPlace,
      rdoCode: state.rdoCode,
      zipCode: state.zipCode,
    },
    spouse:
      state.civilStatus === "married" && state.spouseFullName
        ? {
            spouseTin: state.spouseTin || undefined,
            spouseFullName: state.spouseFullName,
            spouseEmployment: state.spouseEmployment,
            exemptionClaimant: (state.exemptionClaimant || "husband") as "husband" | "wife",
          }
        : undefined,
    employers: state.employers.map((e) => ({
      employerTin: e.employerTin,
      employerFullName: e.employerFullName,
      employerFullAddress: e.employerFullAddress,
      empLandline: e.empLandline || undefined,
      munCode: e.munCode || undefined,
      registeringOfficeType: e.registeringOfficeType,
      employmentType: e.employmentType,
      hireDate: toIso(e.hireDate),
    })),
    dependents: state.dependents.map((d) => ({
      fullName: d.fullName,
      dateOfBirth: toIso(d.dateOfBirth),
      isIncapacitated: d.isIncapacitated,
    })),
    form: {
      formType: state.formType,
      status,
    },
  };
}

// ── Summary helpers ────────────────────────────────────────────────────────────

function SummaryCard({
  title,
  step,
  onEdit,
  rows,
}: {
  title: string;
  step: number;
  onEdit: () => void;
  rows: Array<{ label: string; value: string | undefined }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-blue underline"
        >
          Edit (Step {step})
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 px-5 py-4 text-xs">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-muted">{label}</dt>
            <dd className="text-text font-medium">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ── Validation ────────────────────────────────────────────────────────────────

function computeChecks(state: WizardState) {
  const employer = state.employers[0];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return [
    {
      label: "All required fields filled",
      pass:
        !!state.tin &&
        !!state.lastName &&
        !!state.firstName &&
        !!state.gender &&
        !!state.civilStatus &&
        !!state.dateOfBirth &&
        !!state.addrStreet &&
        !!state.addrBarangay &&
        !!state.addrCity &&
        !!state.mobile &&
        !!state.email &&
        !!state.idType &&
        !!state.idNumber &&
        !!employer?.employerTin,
    },
    {
      label: "Valid email format",
      pass: emailRegex.test(state.email),
    },
    {
      label: "ID expiry after effectivity date",
      pass:
        !state.idEffectivity ||
        !state.idExpiry ||
        state.idExpiry >= state.idEffectivity,
    },
    {
      label: "Filed within 10-day window of hire date",
      pass: !employer?.hireDate || daysSince(employer.hireDate) <= 10,
    },
    {
      label: "Tax type, Form, ATC locked to 1902 defaults",
      pass:
        state.taxType === "Compensation" &&
        state.formType === "1902" &&
        state.atc === "QC",
    },
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props extends StepProps {
  onGoTo?: (step: number) => void;
}

export default function Step5Review({ onBack, clearWizard, onGoTo }: Props) {
  const { state } = useWizard();
  const [, navigate] = useLocation();
  const [declared, setDeclared] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const queryClient = useQueryClient();

  const employer = state.employers[0];
  const checks = computeChecks(state);
  const allPass = checks.every((c) => c.pass);

  const submitMutation = useMutation({
    mutationFn: (status: "draft" | "submitted") => api.applications.create(buildPayload(state, status)),
    onSuccess({ formId }) {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-forms"] });
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["taxpayers"] });
      clearWizard?.();
      navigate(`/applications/${formId}`);
    },
    onError(err: Error) {
      setSubmitError(err.message);
    },
  });

  const canSubmit = allPass && declared && !submitMutation.isPending;
  const canSaveDraft = !submitMutation.isPending;

  return (
    <FormShell
      step={5}
      title="Review & Submit"
      sub="Step 5 of 5 — BIR Form 1902"
      footer={
        <>
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2 border border-border text-sm font-medium rounded hover:bg-border transition-colors"
          >
            ← Back
          </button>
          <button
            type="button"
            disabled={!canSaveDraft}
            onClick={() => submitMutation.mutate("draft")}
            className={cn(
              "px-5 py-2 border border-border text-sm font-medium rounded transition-colors",
              canSaveDraft ? "hover:bg-border" : "opacity-40 cursor-not-allowed",
            )}
          >
            {submitMutation.isPending ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => submitMutation.mutate("submitted")}
            className={cn(
              "px-5 py-2 bg-navy text-white text-sm font-medium rounded transition-opacity",
              canSubmit ? "hover:opacity-90" : "opacity-40 cursor-not-allowed",
            )}
          >
            {submitMutation.isPending ? "Submitting…" : "Submit Application"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-[1.6fr_1fr] gap-6">
        {/* Left — summary cards */}
        <div className="flex flex-col gap-4">
          <SummaryCard
            title="Part I · Taxpayer"
            step={1}
            onEdit={() => onGoTo?.(1)}
            rows={[
              { label: "Type", value: state.taxpayerType },
              { label: "Last Name", value: state.lastName },
              { label: "First Name", value: state.firstName },
              { label: "Middle Name", value: state.middleName || "—" },
              { label: "Gender / Civil Status", value: `${state.gender} / ${state.civilStatus}` },
              { label: "Date of Birth", value: state.dateOfBirth },
              { label: "Place of Birth", value: state.placeOfBirth },
              { label: "Citizenship", value: state.citizenship },
              { label: "PCN", value: state.pcn },
            ]}
          />
          <SummaryCard
            title="Part I · Address"
            step={2}
            onEdit={() => onGoTo?.(2)}
            rows={[
              {
                label: "Local Address",
                value: [state.addrStreet, state.addrBarangay, state.addrCity, state.province]
                  .filter(Boolean)
                  .join(", "),
              },
              { label: "ZIP / Mun. Code / RDO", value: `${state.zipCode || "—"} / ${state.munCode || "—"} / ${state.rdoCode || "—"}` },
              { label: "Foreign Address", value: state.foreignAddress },
              { label: "Mobile", value: state.mobile },
              { label: "Email", value: state.email },
            ]}
          />
          <SummaryCard
            title="Part I · Tax & ID"
            step={3}
            onEdit={() => onGoTo?.(3)}
            rows={[
              { label: "Tax Type / Form / ATC", value: `${state.taxType} / ${state.formType} / ${state.atc}` },
              { label: "ID Type + Number", value: `${state.idType} ${state.idNumber}` },
              { label: "Issuer", value: state.idIssuer },
              { label: "Effective", value: state.idEffectivity },
              { label: "Expiry", value: state.idExpiry },
            ]}
          />
          <SummaryCard
            title="Part II · Spouse"
            step={4}
            onEdit={() => onGoTo?.(4)}
            rows={
              state.civilStatus !== "married"
                ? [{ label: "Status", value: `N/A — ${state.civilStatus}` }]
                : [
                    { label: "Name", value: state.spouseFullName },
                    { label: "TIN", value: state.spouseTin },
                    { label: "Employment", value: state.spouseEmployment },
                    { label: "Exemption Claimant", value: state.exemptionClaimant },
                  ]
            }
          />
          <SummaryCard
            title="Part IV · Employer"
            step={3}
            onEdit={() => onGoTo?.(3)}
            rows={employer
              ? [
                  {
                    label: "Office Type / TIN",
                    value: `${employer.registeringOfficeType} / ${employer.employerTin}`,
                  },
                  { label: "Name", value: employer.employerFullName },
                  { label: "Address", value: employer.employerFullAddress },
                  { label: "Hire Date", value: employer.hireDate },
                  { label: "Employment Type", value: employer.employmentType },
                ]
              : [{ label: "Employer", value: "Not provided" }]
            }
          />
        </div>

        {/* Right — validation + declaration */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2 mb-4">
              Validation
            </p>
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

          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2 mb-4">
              Declaration
            </p>
            <Checkbox
              checked={declared}
              onChange={setDeclared}
              label="I certify that the information above is true and correct (item 29)."
            />
          </div>

          {submitError && (
            <div className="rounded-lg border border-red/30 bg-red/5 p-4">
              <p className="text-xs text-red">{submitError}</p>
            </div>
          )}
        </div>
      </div>
    </FormShell>
  );
}
