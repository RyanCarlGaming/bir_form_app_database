import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, Building, Users } from "lucide-react";
import FormShell from "../../components/FormShell";
import DarkSection from "../../components/DarkSection";
import { Field, fieldInputCls } from "../../components/Fields";
import { step3Schema, type Step3Values } from "../../lib/schemas/wizard";
import { useWizard, type EmployerInput, type StepProps } from "../../lib/wizard";
import { cn } from "../../lib/utils";

const SECONDARY_TYPES = ["concurrent", "successive"] as const;
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

function blankEmployer(employmentType: EmployerInput["employmentType"]): EmployerInput {
  return {
    employerTin: "",
    employerFullName: "",
    employerFullAddress: "",
    empLandline: "",
    munCode: "",
    employerZipCode: "",
    registeringOfficeType: "head",
    employmentType,
    hireDate: "",
  };
}

function employerWithType(employer: EmployerInput | undefined, employmentType: EmployerInput["employmentType"]) {
  return { ...blankEmployer(employmentType), ...employer, employmentType };
}

export default function Step3Employer({ onNext, onBack }: StepProps) {
  const { state, dispatch } = useWizard();

  const primaryEmployer = employerWithType(
    state.employers.find((employer) => employer.employmentType === "primary") ?? state.employers[0],
    "primary",
  );
  const secondaryEmployer = state.employers.find((employer) => employer.employmentType !== "primary");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      taxType: state.taxType || "Income Tax",
      formType: state.formType || "1700",
      atc: state.atc || "II 011",
      employers: secondaryEmployer
        ? [primaryEmployer, employerWithType(secondaryEmployer, secondaryEmployer.employmentType)]
        : [primaryEmployer],
    },
  });

  const employers = watch("employers") ?? [];
  const hasSecondary = employers.length > 1;
  const secondaryType = employers[1]?.employmentType;

  function setSecondaryType(type?: "concurrent" | "successive") {
    const primary = employerWithType(watch("employers.0"), "primary");

    if (!type) {
      setValue("employers", [primary], { shouldDirty: true, shouldValidate: true });
      return;
    }

    const currentSecondary = watch("employers.1");
    const nextSecondary = currentSecondary?.employmentType === type
      ? employerWithType(currentSecondary, type)
      : blankEmployer(type);

    setValue("employers", [primary, nextSecondary], { shouldDirty: true, shouldValidate: true });
  }

  function onSubmit(data: Step3Values) {
    dispatch({
      type: "SET_STEP3",
      payload: {
        ...data,
        taxType: "Income Tax",
        formType: "1700",
        atc: "II 011",
        employers: data.employers.map((employer, index) => ({
          ...employer,
          employmentType: index === 0 ? "primary" : employer.employmentType,
        })),
      },
    });
    onNext();
  }

  function renderEmployer(index: number, title: string) {
    const empErrors = errors.employers?.[index];

    return (
      <DarkSection
        key={index}
        icon={index === 0 ? <Building size={16} /> : <Users size={16} />}
        title={title}
      >
        <div className="flex flex-col gap-4">
          <Field label="Registering Office Type" req error={empErrors?.registeringOfficeType?.message}>
            <select
              {...register(`employers.${index}.registeringOfficeType`)}
              className={cn(fieldInputCls, "appearance-none cursor-pointer")}
            >
              {OFFICE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-2">
              <Field label="Employer TIN" req error={empErrors?.employerTin?.message}>
                <input
                  {...register(`employers.${index}.employerTin`)}
                  className={cn(fieldInputCls, "font-mono")}
                  placeholder="000-000-000"
                />
              </Field>
            </div>
            <div className="col-span-4">
              <Field label="Employer Full Name" req error={empErrors?.employerFullName?.message}>
                <input
                  {...register(`employers.${index}.employerFullName`)}
                  className={fieldInputCls}
                  placeholder="Acme Corporation"
                />
              </Field>
            </div>
            <div className="col-span-4">
              <Field label="Employer Address" req error={empErrors?.employerFullAddress?.message}>
                <input
                  {...register(`employers.${index}.employerFullAddress`)}
                  className={fieldInputCls}
                  placeholder="123 Business Ave, Makati City"
                />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Employer Landline" error={empErrors?.empLandline?.message}>
                <input
                  {...register(`employers.${index}.empLandline`)}
                  className={cn(fieldInputCls, "font-mono")}
                  placeholder="02-8888-8888"
                />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Municipality Code" error={empErrors?.munCode?.message}>
                <input
                  {...register(`employers.${index}.munCode`)}
                  className={cn(fieldInputCls, "font-mono")}
                  placeholder="137601"
                />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Hire Date" req error={empErrors?.hireDate?.message}>
                <input
                  type="date"
                  {...register(`employers.${index}.hireDate`)}
                  className={cn(fieldInputCls, "font-mono")}
                />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="ZIP Code" req error={empErrors?.employerZipCode?.message}>
                <input
                  {...register(`employers.${index}.employerZipCode`)}
                  className={cn(fieldInputCls, "font-mono")}
                  placeholder="1200"
                />
              </Field>
            </div>
          </div>
        </div>
      </DarkSection>
    );
  }

  return (
    <FormShell
      step={3}
      title="Employer & Tax"
      sub="Step 3 of 5 - BIR Form 1700"
      footer={
        <>
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2 border border-border text-sm font-medium rounded hover:bg-border transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="px-5 py-2 bg-blue text-white text-sm font-medium rounded hover:opacity-90 transition-opacity"
          >
            Next
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <DarkSection icon={<Badge size={16} />} title="Part I - Tax Classification (items 18-20)">
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
              Tax Type, Form Type, and ATC are pre-filled with the required defaults.
            </p>
          </div>
        </DarkSection>

        {renderEmployer(0, "Part IV - Primary Employer (items 30-37)")}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2 mb-2">
            Additional Employer
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSecondaryType(undefined)}
              className={cn(
                "px-4 py-2 rounded text-sm font-medium border transition-colors",
                !hasSecondary
                  ? "bg-navy text-white border-navy"
                  : "bg-surface text-text-2 border-border hover:border-navy-muted",
              )}
            >
              Primary
            </button>
            {SECONDARY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSecondaryType(type)}
                className={cn(
                  "px-4 py-2 rounded text-sm font-medium border transition-colors",
                  secondaryType === type
                    ? "bg-navy text-white border-navy"
                    : "bg-surface text-text-2 border-border hover:border-navy-muted",
                )}
              >
                {EMP_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {hasSecondary && renderEmployer(1, `Part IV - ${EMP_TYPE_LABELS[secondaryType ?? "concurrent"]} Employer`)}
      </div>
    </FormShell>
  );
}
