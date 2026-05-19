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
      addrUnit: state.addrUnit,
      addrBuilding: state.addrBuilding,
      addrLot: state.addrLot,
      addrStreet: state.addrStreet,
      addrSubdivision: state.addrSubdivision,
      addrBarangay: state.addrBarangay,
      addrTownDistrict: state.addrTownDistrict,
      addrCity: state.addrCity,
      munCode: state.munCode,
      rdoCode: state.rdoCode,
      zipCode: state.zipCode,
      foreignAddress: state.foreignAddress,
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
          <div className="flex flex-col gap-5">
            {/* Local address */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-semibold text-text-2 uppercase tracking-[0.04em]">
                  15. Local Residence Address
                </p>
                <span className="text-xs bg-red/10 text-red px-2 py-0.5 rounded font-medium">Required</span>
              </div>
              <div className="grid grid-cols-6 gap-x-4 gap-y-4">
                <div className="col-span-2">
                  <Field label="Unit / Floor" error={errors.addrUnit?.message}>
                    <input {...register("addrUnit")} className={fieldInputCls} placeholder="Unit 4B" />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Building Name" error={errors.addrBuilding?.message}>
                    <input {...register("addrBuilding")} className={fieldInputCls} placeholder="Sunrise Bldg" />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Lot / Block / Phase" error={errors.addrLot?.message}>
                    <input {...register("addrLot")} className={fieldInputCls} placeholder="Lot 12 Block 3" />
                  </Field>
                </div>
                <div className="col-span-3">
                  <Field label="Street Name" req error={errors.addrStreet?.message}>
                    <input {...register("addrStreet")} className={fieldInputCls} placeholder="Rizal Avenue" />
                  </Field>
                </div>
                <div className="col-span-3">
                  <Field label="Subdivision / Zone" error={errors.addrSubdivision?.message}>
                    <input {...register("addrSubdivision")} className={fieldInputCls} placeholder="Loyola Grand Villas" />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Barangay" req error={errors.addrBarangay?.message}>
                    <input {...register("addrBarangay")} className={fieldInputCls} placeholder="Barangay 123" />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Town / District" error={errors.addrTownDistrict?.message}>
                    <input {...register("addrTownDistrict")} className={fieldInputCls} placeholder="District V" />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Municipality / City" req error={errors.addrCity?.message}>
                    <input {...register("addrCity")} className={fieldInputCls} placeholder="Quezon City" />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Municipality Code" error={errors.munCode?.message}>
                    <input {...register("munCode")} className={cn(fieldInputCls, "font-mono")} placeholder="137601" />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="RDO Code" req error={errors.rdoCode?.message}>
                    <input {...register("rdoCode")} className={cn(fieldInputCls, "font-mono")} placeholder="044" />
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="ZIP Code" req error={errors.zipCode?.message}>
                    <input {...register("zipCode")} className={cn(fieldInputCls, "font-mono")} placeholder="1100" />
                  </Field>
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Foreign address */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-semibold text-text-2 uppercase tracking-[0.04em]">
                  16. Foreign Address
                </p>
                <span className="text-xs bg-border text-muted px-2 py-0.5 rounded font-medium">Optional</span>
              </div>
              <Field label="Foreign Address" error={errors.foreignAddress?.message}>
                <input
                  {...register("foreignAddress")}
                  className={fieldInputCls}
                  placeholder="123 Main St, New York, NY 10001, USA"
                />
              </Field>
              <div className="mt-3 rounded-lg border border-dashed border-border px-4 py-3">
                <p className="text-xs text-muted">
                  Foreign-address details follow 2NF separation in our schema.
                </p>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Contact */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-semibold text-text-2 uppercase tracking-[0.04em]">
                  22. Preferred Contact
                </p>
                <span className="text-xs bg-red/10 text-red px-2 py-0.5 rounded font-medium">Email required</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Field label="Landline" error={errors.landline?.message}>
                  <input {...register("landline")} className={cn(fieldInputCls, "font-mono")} placeholder="02-8123-4567" />
                </Field>
                <Field label="Fax" error={errors.fax?.message}>
                  <input {...register("fax")} className={cn(fieldInputCls, "font-mono")} placeholder="02-8123-4568" />
                </Field>
                <Field label="Mobile" req error={errors.mobile?.message}>
                  <input {...register("mobile")} className={cn(fieldInputCls, "font-mono")} placeholder="09171234567" />
                </Field>
                <Field label="Email" req error={errors.email?.message}>
                  <input type="email" {...register("email")} className={fieldInputCls} placeholder="j.delacruz@email.com" />
                </Field>
              </div>
            </div>
          </div>
        </DarkSection>
      </div>
    </FormShell>
  );
}
