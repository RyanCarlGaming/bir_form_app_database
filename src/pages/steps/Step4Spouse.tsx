import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, CreditCard, Plus, Trash2 } from "lucide-react";
import FormShell from "../../components/FormShell";
import DarkSection from "../../components/DarkSection";
import { Field, Checkbox, fieldInputCls } from "../../components/Fields";
import { step4Schema, type Step4Values } from "../../lib/schemas/wizard";
import { useWizard, type StepProps } from "../../lib/wizard";
import { cn } from "../../lib/utils";

const SPOUSE_EMP_OPTIONS = ["Unemployed", "Employed Locally", "Employed Abroad", "Business"];
const EXEMPTION_OPTIONS = ["husband", "wife"] as const;
const ID_TYPE_OPTIONS = [
  "Passport",
  "Driver's License",
  "SSS ID",
  "GSIS ID",
  "PhilHealth ID",
  "Postal ID",
  "Voter's ID",
  "PRC ID",
  "Other",
];

export default function Step4Spouse({ onNext, onBack }: StepProps) {
  const { state, dispatch } = useWizard();
  const isMarried = state.civilStatus === "married";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      spouseTin: state.spouseTin,
      spouseFullName: state.spouseFullName,
      spouseEmployment: state.spouseEmployment,
      exemptionClaimant: (state.exemptionClaimant as Step4Values["exemptionClaimant"]) || "",
      dependents: state.dependents,
      idType: state.idType,
      idNumber: state.idNumber,
      idIssuer: state.idIssuer,
      idPlace: state.idPlace,
      idEffectivity: state.idEffectivity,
      idExpiry: state.idExpiry,
    },
  });

  const { fields: depFields, append: appendDep, remove: removeDep } = useFieldArray({
    control,
    name: "dependents",
  });

  const exemptionClaimant = watch("exemptionClaimant");
  const spouseEmployment = watch("spouseEmployment");

  function onSubmit(data: Step4Values) {
    dispatch({ type: "SET_STEP4", payload: data });
    onNext();
  }

  return (
    <FormShell
      step={4}
      title="Spouse & Identification"
      sub="Step 4 of 5 — BIR Form 1902"
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
        {/* Spouse */}
        <DarkSection
          icon={<Users size={16} />}
          title="Part II — Spouse Information (items 23–27)"
          badge={
            !isMarried ? (
              <span className="text-xs bg-surface/20 text-white/60 px-2 py-0.5 rounded">
                N/A — {state.civilStatus || "not married"}
              </span>
            ) : null
          }
        >
          {!isMarried ? (
            <p className="text-sm text-muted">Not applicable — taxpayer is not married.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Employment Status toggle */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2 mb-2">
                  23. Spouse Employment Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {SPOUSE_EMP_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setValue("spouseEmployment", opt)}
                      className={cn(
                        "px-3 py-1.5 rounded text-sm font-medium border transition-colors",
                        spouseEmployment === opt
                          ? "bg-navy text-white border-navy"
                          : "bg-surface text-text-2 border-border hover:border-navy-muted",
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <Field label="Spouse Full Name" error={errors.spouseFullName?.message}>
                    <input
                      {...register("spouseFullName")}
                      className={fieldInputCls}
                      placeholder="DELA CRUZ, MARIA SANTOS"
                    />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Spouse TIN" error={errors.spouseTin?.message}>
                    <input
                      {...register("spouseTin")}
                      className={cn(fieldInputCls, "font-mono")}
                      placeholder="000-000-000"
                    />
                  </Field>
                </div>
              </div>

              {/* Exemption Claimant */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2 mb-2">
                  Exemption Claimant
                </p>
                <div className="flex gap-2">
                  {EXEMPTION_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setValue("exemptionClaimant", opt)}
                      className={cn(
                        "px-4 py-2 rounded text-sm font-medium border capitalize transition-colors",
                        exemptionClaimant === opt
                          ? "bg-navy text-white border-navy"
                          : "bg-surface text-text-2 border-border hover:border-navy-muted",
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-border px-4 py-3">
                <p className="text-xs text-muted">
                  Spouse table is extracted (3NF) to remove transitive dependency on Taxpayer.
                </p>
              </div>
            </div>
          )}
        </DarkSection>

        {/* Dependents */}
        <DarkSection
          icon={<Users size={16} />}
          title="Dependents"
          badge={
            <button
              type="button"
              onClick={() => appendDep({ fullName: "", dateOfBirth: "", isIncapacitated: false })}
              className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white border border-white/30 hover:border-white/60 px-2 py-0.5 rounded transition-colors"
            >
              <Plus size={11} />
              Add
            </button>
          }
        >
          {depFields.length === 0 ? (
            <p className="text-sm text-muted text-center py-2">No dependents added.</p>
          ) : (
            <table className="tbl w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-xs text-muted font-semibold w-12">#</th>
                  <th className="px-3 py-2 text-left text-xs text-muted font-semibold">Full Name</th>
                  <th className="px-3 py-2 text-left text-xs text-muted font-semibold">Date of Birth</th>
                  <th className="px-3 py-2 text-left text-xs text-muted font-semibold">Incapacitated</th>
                  <th className="px-3 py-2 w-8" />
                </tr>
              </thead>
              <tbody>
                {depFields.map((field, i) => (
                  <tr key={field.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-mono text-xs text-muted">
                      D-{String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        {...register(`dependents.${i}.fullName`)}
                        className={cn(fieldInputCls, "text-sm py-1")}
                        placeholder="DELA CRUZ, JUAN"
                      />
                      {errors.dependents?.[i]?.fullName && (
                        <p className="text-xs text-red mt-0.5">{errors.dependents[i]!.fullName!.message}</p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        {...register(`dependents.${i}.dateOfBirth`)}
                        className={cn(fieldInputCls, "font-mono text-sm py-1")}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={watch(`dependents.${i}.isIncapacitated`)}
                        onChange={(v) => setValue(`dependents.${i}.isIncapacitated`, v)}
                        label="Yes"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeDep(i)}
                        className="text-muted hover:text-red transition-colors"
                        aria-label="Remove dependent"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DarkSection>

        {/* Identification */}
        <DarkSection icon={<CreditCard size={16} />} title="Part I — Identification (item 21)">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-3">
              <Field label="ID Type" req error={errors.idType?.message}>
                <select {...register("idType")} className={cn(fieldInputCls, "appearance-none cursor-pointer")}>
                  <option value="">Select…</option>
                  {ID_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="col-span-3">
              <Field label="ID Number" req error={errors.idNumber?.message}>
                <input
                  {...register("idNumber")}
                  className={cn(fieldInputCls, "font-mono")}
                  placeholder="P1234567A"
                />
              </Field>
            </div>
            <div className="col-span-3">
              <Field label="Issuer" req error={errors.idIssuer?.message}>
                <input
                  {...register("idIssuer")}
                  className={fieldInputCls}
                  placeholder="Department of Foreign Affairs"
                />
              </Field>
            </div>
            <div className="col-span-3">
              <Field label="Place / Country of Issue" req error={errors.idPlace?.message}>
                <input
                  {...register("idPlace")}
                  className={fieldInputCls}
                  placeholder="Manila, Philippines"
                />
              </Field>
            </div>
            <div className="col-span-3">
              <Field label="Effectivity Date" req error={errors.idEffectivity?.message}>
                <input
                  type="date"
                  {...register("idEffectivity")}
                  className={cn(fieldInputCls, "font-mono")}
                />
              </Field>
            </div>
            <div className="col-span-3">
              <Field label="Expiry Date" req error={errors.idExpiry?.message}>
                <input
                  type="date"
                  {...register("idExpiry")}
                  className={cn(fieldInputCls, "font-mono")}
                />
              </Field>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-border/30 border border-border px-4 py-3 flex items-center gap-3">
            <p className="text-xs text-muted flex-1">
              Attach one (1) valid government-issued photo ID. Upload functionality will be available in a future release.
            </p>
            <button
              type="button"
              className="shrink-0 text-xs px-3 py-1.5 rounded border border-border bg-surface hover:bg-border transition-colors"
            >
              Choose file
            </button>
          </div>
        </DarkSection>
      </div>
    </FormShell>
  );
}
