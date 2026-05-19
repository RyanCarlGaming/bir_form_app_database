import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, Building, Users } from "lucide-react";
import FormShell from "../../components/FormShell";
import DarkSection from "../../components/DarkSection";
import { Field, fieldInputCls } from "../../components/Fields";
import { step3Schema, type Step3Values } from "../../lib/schemas/wizard";
import { useWizard, type StepProps } from "../../lib/wizard";
import { cn } from "../../lib/utils";

const EMP_TYPE_OPTIONS = ["primary", "concurrent", "successive"] as const;
const EMP_TYPE_LABELS: Record<string, string> = {
  primary: "Primary",
  concurrent: "Concurrent",
  successive: "Successive",
};
const OFFICE_TYPE_OPTIONS = [
  { value: "head", label: "Head Office" },
  { value: "branch", label: "Branch" },
  { value: "rdo", label: "RDO" },
  { value: "ltdo", label: "LTDO" },
];

export default function Step3Employer({ onNext, onBack }: StepProps) {
  const { state, dispatch } = useWizard();

  const defaultEmployer = state.employers[0] ?? {
    employerTin: "",
    employerFullName: "",
    employerFullAddress: "",
    empLandline: "",
    munCode: "",
    registeringOfficeType: "head" as const,
    employmentType: "primary" as const,
    hireDate: "",
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      taxType:  state.taxType  || "Compensation",
      formType: state.formType || "1902",
      atc:      state.atc      || "QC",
      employers: [defaultEmployer],
    },
  });

  const employers = watch("employers");
  const employer = employers?.[0];
  const empErrors = errors.employers?.[0];

  function onSubmit(data: Step3Values) {
    dispatch({ type: "SET_STEP3", payload: data });
    onNext();
  }

  return (
    <FormShell
      step={3}
      title="Employer & Tax"
      sub="Step 3 of 5 — BIR Form 1902"
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
            onClick={handleSubmit(onSubmit)}
            className="px-5 py-2 bg-blue text-white text-sm font-medium rounded hover:opacity-90 transition-opacity"
          >
            Next →
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Tax Classification */}
        <DarkSection icon={<Badge size={16} />} title="Part I — Tax Classification (items 18–20)">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Tax Type" req error={errors.taxType?.message}>
              <input
                {...register("taxType")}
                readOnly
                className={cn(fieldInputCls, "opacity-60 cursor-not-allowed bg-surface")}
              />
            </Field>
            <Field label="Form Type" req error={errors.formType?.message}>
              <input
                {...register("formType")}
                readOnly
                className={cn(fieldInputCls, "font-mono opacity-60 cursor-not-allowed bg-surface")}
              />
            </Field>
            <Field label="ATC" req error={errors.atc?.message}>
              <input
                {...register("atc")}
                readOnly
                className={cn(fieldInputCls, "font-mono opacity-60 cursor-not-allowed bg-surface")}
              />
            </Field>
          </div>
          <div className="mt-4 rounded-lg border border-dashed border-border px-4 py-3">
            <p className="text-xs text-muted">
              Tax Type, Form, and ATC are fixed for all 1902 applicants (pre-filled above).
            </p>
          </div>
        </DarkSection>

        {/* Primary Employer */}
        <DarkSection icon={<Building size={16} />} title="Part IV — Primary Employer (items 30–37)">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4">
                <Field label="Registering Office Type" req error={empErrors?.registeringOfficeType?.message}>
                  <select
                    {...register("employers.0.registeringOfficeType")}
                    className={cn(fieldInputCls, "appearance-none cursor-pointer")}
                  >
                    {OFFICE_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-2">
                <Field label="Employer TIN" req error={empErrors?.employerTin?.message}>
                  <input
                    {...register("employers.0.employerTin")}
                    className={cn(fieldInputCls, "font-mono")}
                    placeholder="000-000-000"
                  />
                </Field>
              </div>
              <div className="col-span-4">
                <Field label="Employer Full Name" req error={empErrors?.employerFullName?.message}>
                  <input
                    {...register("employers.0.employerFullName")}
                    className={fieldInputCls}
                    placeholder="Acme Corporation"
                  />
                </Field>
              </div>
              <div className="col-span-4">
                <Field label="Employer Address" req error={empErrors?.employerFullAddress?.message}>
                  <input
                    {...register("employers.0.employerFullAddress")}
                    className={fieldInputCls}
                    placeholder="123 Business Ave, Makati City"
                  />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Employer Landline" error={empErrors?.empLandline?.message}>
                  <input
                    {...register("employers.0.empLandline")}
                    className={cn(fieldInputCls, "font-mono")}
                    placeholder="02-8888-8888"
                  />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Municipality Code" error={empErrors?.munCode?.message}>
                  <input
                    {...register("employers.0.munCode")}
                    className={cn(fieldInputCls, "font-mono")}
                    placeholder="137601"
                  />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Hire Date" req error={empErrors?.hireDate?.message}>
                  <input
                    type="date"
                    {...register("employers.0.hireDate")}
                    className={cn(fieldInputCls, "font-mono")}
                  />
                </Field>
              </div>
            </div>

            {/* Employment Type toggle */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2 mb-2">
                Employment Type
              </p>
              <div className="flex gap-2">
                {EMP_TYPE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue("employers.0.employmentType", t)}
                    className={cn(
                      "px-4 py-2 rounded text-sm font-medium border transition-colors",
                      employer?.employmentType === t
                        ? "bg-navy text-white border-navy"
                        : "bg-surface text-text-2 border-border hover:border-navy-muted",
                    )}
                  >
                    {EMP_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              {empErrors?.employmentType && (
                <p className="mt-1 text-xs text-red">{empErrors.employmentType.message}</p>
              )}
            </div>
          </div>
        </DarkSection>

        {/* Multiple employments (stub) */}
        <DarkSection icon={<Users size={16} />} title="Part III — Multiple Employments (item 28)">
          <p className="text-sm text-muted text-center py-4">
            Only applicable for concurrent or successive employment.
          </p>
        </DarkSection>
      </div>
    </FormShell>
  );
}
