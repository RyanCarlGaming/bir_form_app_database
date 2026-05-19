import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import FormShell from "../../components/FormShell";
import DarkSection from "../../components/DarkSection";
import { Field, fieldInputCls } from "../../components/Fields";
import { step2Schema, type Step2Values } from "../../lib/schemas/wizard";
import { useWizard, type StepProps } from "../../lib/wizard";
import { cn } from "../../lib/utils";

export default function Step2Address({ onNext, onBack }: StepProps) {
  const { state, dispatch } = useWizard();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      addrStreet: state.addrStreet,
      addrCity: state.addrCity,
      province: state.province,
      munCode: state.munCode,
      zipCode: state.zipCode,
      rdoCode: state.rdoCode,
      foreignAddress: state.foreignAddress,
      foreignCountry: state.foreignCountry,
      foreignPostalCode: state.foreignPostalCode,
      landline: state.landline,
      fax: state.fax,
      mobile: state.mobile,
      email: state.email,
    },
  });

  function onSubmit(data: Step2Values) {
    dispatch({ type: "SET_STEP2", payload: data });
    onNext();
  }

  return (
    <FormShell
      step={2}
      title="Address & Contact"
      sub="Step 2 of 5 — BIR Form 1902"
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
        <DarkSection
          icon={<MapPin size={16} />}
          title="Part I — Address (item 15) & Contact (item 22)"
        >
          <div className="flex flex-col gap-6">
            {/* Local / Foreign side-by-side */}
            <div className="grid grid-cols-2 gap-6">
              {/* Local address */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-text-2 uppercase tracking-[0.04em]">
                    15. Local Residence Address
                  </p>
                  <span className="text-xs bg-red/10 text-red px-2 py-0.5 rounded font-medium">Required</span>
                </div>
                <Field label="House / Lot / Unit, Street" req error={errors.addrStreet?.message}>
                  <input
                    {...register("addrStreet")}
                    className={fieldInputCls}
                    placeholder="123 Rizal Ave, Unit 4B"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Town / Municipality" req error={errors.addrCity?.message}>
                    <input {...register("addrCity")} className={fieldInputCls} placeholder="Quezon City" />
                  </Field>
                  <Field label="Province" req error={errors.province?.message}>
                    <input {...register("province")} className={fieldInputCls} placeholder="Metro Manila" />
                  </Field>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <Field label="Mun. Code" error={errors.munCode?.message} help="Auto-filled from Location Table">
                      <input
                        {...register("munCode")}
                        className={cn(fieldInputCls, "font-mono bg-canvas")}
                        placeholder="137601"
                        readOnly
                        tabIndex={-1}
                      />
                    </Field>
                  </div>
                  <Field label="ZIP" req error={errors.zipCode?.message}>
                    <input {...register("zipCode")} className={cn(fieldInputCls, "font-mono")} placeholder="1100" />
                  </Field>
                  <Field label="RDO" req error={errors.rdoCode?.message}>
                    <input {...register("rdoCode")} className={cn(fieldInputCls, "font-mono")} placeholder="044" />
                  </Field>
                </div>
              </div>

              {/* Foreign address */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-text-2 uppercase tracking-[0.04em]">
                    16. Foreign Address
                  </p>
                  <span className="text-xs bg-border text-muted px-2 py-0.5 rounded font-medium">Optional</span>
                </div>
                <Field label="Full foreign address" error={errors.foreignAddress?.message}>
                  <input
                    {...register("foreignAddress")}
                    className={fieldInputCls}
                    placeholder="123 Main St, New York, NY 10001, USA"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Country" error={errors.foreignCountry?.message}>
                    <input {...register("foreignCountry")} className={fieldInputCls} placeholder="United States" />
                  </Field>
                  <Field label="Postal code" error={errors.foreignPostalCode?.message}>
                    <input {...register("foreignPostalCode")} className={cn(fieldInputCls, "font-mono")} placeholder="10001" />
                  </Field>
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Contact row */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-xs font-semibold text-text-2 uppercase tracking-[0.04em]">
                  22. Contact Details
                </p>
                <span className="text-xs bg-red/10 text-red px-2 py-0.5 rounded font-medium">Mobile + Email required</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Field label="Mobile" req error={errors.mobile?.message}>
                  <input {...register("mobile")} className={cn(fieldInputCls, "font-mono")} placeholder="09171234567" />
                </Field>
                <Field label="Email" req error={errors.email?.message}>
                  <input type="email" {...register("email")} className={fieldInputCls} placeholder="j.delacruz@email.com" />
                </Field>
                <Field label="Landline" error={errors.landline?.message}>
                  <input {...register("landline")} className={cn(fieldInputCls, "font-mono")} placeholder="02-8123-4567" />
                </Field>
                <Field label="Fax" error={errors.fax?.message}>
                  <input {...register("fax")} className={cn(fieldInputCls, "font-mono")} placeholder="02-8123-4568" />
                </Field>
              </div>
            </div>
          </div>
        </DarkSection>
      </div>
    </FormShell>
  );
}
