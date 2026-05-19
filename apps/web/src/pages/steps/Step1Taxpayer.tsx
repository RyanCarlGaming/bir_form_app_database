import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import FormShell from "../../components/FormShell";
import DarkSection from "../../components/DarkSection";
import { Field, fieldInputCls } from "../../components/Fields";
import { step1Schema, type Step1Values } from "../../lib/schemas/wizard";
import { useWizard, type StepProps } from "../../lib/wizard";
import { cn } from "../../lib/utils";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];
const CIVIL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
];
const TYPE_OPTIONS = ["local", "resident", "alien"] as const;
const TYPE_LABELS: Record<string, string> = { local: "Local", resident: "Resident", alien: "Alien" };

export default function Step1Taxpayer({ onNext }: StepProps) {
  const { state, dispatch } = useWizard();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      tin: state.tin,
      birRegDate: state.birRegDate,
      pcn: state.pcn,
      taxpayerType: state.taxpayerType,
      fullName: state.fullName,
      gender: (state.gender as "male" | "female") || undefined,
      civilStatus: (state.civilStatus as Step1Values["civilStatus"]) || undefined,
      dateOfBirth: state.dateOfBirth,
      placeOfBirth: state.placeOfBirth,
      citizenship: state.citizenship,
      otherCitizenship: state.otherCitizenship,
      motherFullName: state.motherFullName,
      fatherFullName: state.fatherFullName,
    },
  });

  const taxpayerType = watch("taxpayerType");

  function onSubmit(data: Step1Values) {
    dispatch({ type: "SET_STEP1", payload: data });
    onNext();
  }

  return (
    <FormShell
      step={1}
      title="Taxpayer Information"
      sub="Step 1 of 5 — BIR Form 1902"
      footer={
        <>
          <span />
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
      <DarkSection icon={<FileText size={16} />} title="Part I — Taxpayer Information (items 5–14)">
        <div className="grid grid-cols-6 gap-x-4 gap-y-5">
          {/* TIN / BIR Reg Date / PCN */}
          <div className="col-span-2">
            <Field label="TIN" req error={errors.tin?.message} help="9 or 12 digits">
              <input
                {...register("tin")}
                className={cn(fieldInputCls, "font-mono")}
                placeholder="000-000-000"
              />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="BIR Registration Date" req error={errors.birRegDate?.message}>
              <input type="date" {...register("birRegDate")} className={cn(fieldInputCls, "font-mono")} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="PCN" error={errors.pcn?.message} help="Permanent Control Number">
              <input {...register("pcn")} className={cn(fieldInputCls, "font-mono")} placeholder="000-000-000" />
            </Field>
          </div>

          {/* Taxpayer Type toggle */}
          <div className="col-span-6">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2 mb-2">
              Taxpayer Type
            </p>
            <div className="flex gap-2">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("taxpayerType", t)}
                  className={cn(
                    "px-4 py-2 rounded text-sm font-medium border transition-colors",
                    taxpayerType === t
                      ? "bg-navy text-white border-navy"
                      : "bg-surface text-text-2 border-border hover:border-navy-muted",
                  )}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div className="col-span-6">
            <Field label="Full Name" req error={errors.fullName?.message} help="Last Name, First Name Middle Initial">
              <input
                {...register("fullName")}
                className={fieldInputCls}
                placeholder="DELA CRUZ, JUAN SANTOS"
              />
            </Field>
          </div>

          {/* Gender / Civil Status / Citizenship */}
          <div className="col-span-2">
            <Field label="Gender" req error={errors.gender?.message}>
              <select
                {...register("gender")}
                className={cn(fieldInputCls, "appearance-none cursor-pointer")}
              >
                <option value="">Select…</option>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Civil Status" req error={errors.civilStatus?.message}>
              <select
                {...register("civilStatus")}
                className={cn(fieldInputCls, "appearance-none cursor-pointer")}
              >
                <option value="">Select…</option>
                {CIVIL_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Citizenship" req error={errors.citizenship?.message}>
              <input
                {...register("citizenship")}
                className={fieldInputCls}
                placeholder="Filipino"
              />
            </Field>
          </div>

          {/* DOB / Place of Birth / Other Citizenship */}
          <div className="col-span-2">
            <Field label="Date of Birth" req error={errors.dateOfBirth?.message}>
              <input type="date" {...register("dateOfBirth")} className={cn(fieldInputCls, "font-mono")} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Place of Birth" req error={errors.placeOfBirth?.message}>
              <input {...register("placeOfBirth")} className={fieldInputCls} placeholder="Manila" />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Other Citizenship" error={errors.otherCitizenship?.message} help="If applicable">
              <input {...register("otherCitizenship")} className={fieldInputCls} />
            </Field>
          </div>

          <div className="col-span-6 border-t border-border" />

          {/* Mother / Father */}
          <div className="col-span-3">
            <Field label="Mother's Maiden Name" req error={errors.motherFullName?.message}>
              <input
                {...register("motherFullName")}
                className={fieldInputCls}
                placeholder="SANTOS, MARIA DELA CRUZ"
              />
            </Field>
          </div>
          <div className="col-span-3">
            <Field label="Father's Name" req error={errors.fatherFullName?.message}>
              <input
                {...register("fatherFullName")}
                className={fieldInputCls}
                placeholder="DELA CRUZ, JOSE SANTOS"
              />
            </Field>
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-blue/5 border border-blue/20 px-4 py-3">
          <p className="text-xs text-blue">
            Items 1, 3, 4 and 17 are filled by the BIR receiving office.
          </p>
        </div>
      </DarkSection>
    </FormShell>
  );
}
