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
      addrUnit:         state.addrUnit,
      addrBuilding:     state.addrBuilding,
      addrLot:          state.addrLot,
      addrStreet:       state.addrStreet,
      addrSubdivision:  state.addrSubdivision,
      addrBarangay:     state.addrBarangay,
      addrTownDistrict: state.addrTownDistrict,
      addrCity:         state.addrCity,
      province:         state.province,
      zipCode:          state.zipCode,
      munCode:          state.munCode,
      rdoCode:          state.rdoCode,
      foreignAddress:   state.foreignAddress,
      foreignCountry:   state.foreignCountry,
      foreignPostalCode: state.foreignPostalCode,
      mobile:           state.mobile,
      email:            state.email,
      landline:         state.landline,
      fax:              state.fax,
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
      sub="Step 2 of 5 — local residence (broken out per BIR Item 15), foreign address, and contact. Part I, items 15–17 and 22."
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

            {/* 15. Local Residence Address */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-text-2 uppercase tracking-[0.06em]">
                  15. Local Residence Address
                </p>
                <span className="text-xs bg-red/10 text-red px-2 py-0.5 rounded font-medium">Required</span>
              </div>

              {/* Row 1: Unit / Building / Lot */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Unit / Room / Floor / Building No." error={errors.addrUnit?.message}>
                  <input {...register("addrUnit")} className={fieldInputCls} placeholder="14-B" />
                </Field>
                <Field label="Building Name / Tower" error={errors.addrBuilding?.message}>
                  <input {...register("addrBuilding")} className={fieldInputCls} placeholder="—" />
                </Field>
                <Field label="Lot / Block / Phase / House No." error={errors.addrLot?.message}>
                  <input {...register("addrLot")} className={fieldInputCls} placeholder="Lot 4, Blk 12" />
                </Field>
              </div>

              {/* Row 2: Street / Subdivision */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Street Name" req error={errors.addrStreet?.message}>
                  <input {...register("addrStreet")} className={fieldInputCls} placeholder="Camia Street" />
                </Field>
                <Field label="Subdivision / Village / Zone" error={errors.addrSubdivision?.message}>
                  <input {...register("addrSubdivision")} className={fieldInputCls} placeholder="Phase 2, Bagong Pag-asa Subdivision" />
                </Field>
              </div>

              {/* Row 3: Barangay / Town / Municipality */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Barangay" req error={errors.addrBarangay?.message}>
                  <input {...register("addrBarangay")} className={fieldInputCls} placeholder="Brgy. Bagong Pag-asa" />
                </Field>
                <Field label="Town / District" error={errors.addrTownDistrict?.message}>
                  <input {...register("addrTownDistrict")} className={fieldInputCls} placeholder="District 1" />
                </Field>
                <Field label="Municipality / City" req error={errors.addrCity?.message}>
                  <input {...register("addrCity")} className={fieldInputCls} placeholder="Quezon City" />
                </Field>
              </div>

              {/* Row 4: Province / ZIP / Mun. Code / RDO Code */}
              <div className="grid grid-cols-4 gap-4">
                <Field label="Province" req error={errors.province?.message}>
                  <input {...register("province")} className={fieldInputCls} placeholder="Metro Manila" />
                </Field>
                <Field label="ZIP Code" req error={errors.zipCode?.message}>
                  <input {...register("zipCode")} className={cn(fieldInputCls, "font-mono")} placeholder="1105" />
                </Field>
                <Field label="17. Mun. Code" help="Auto · Location Table" error={errors.munCode?.message}>
                  <input
                    {...register("munCode")}
                    className={cn(fieldInputCls, "font-mono bg-canvas")}
                    placeholder="137404"
                    readOnly
                    tabIndex={-1}
                  />
                </Field>
                <Field label="4. RDO Code" help="Auto · derived from address" error={errors.rdoCode?.message}>
                  <input
                    {...register("rdoCode")}
                    className={cn(fieldInputCls, "font-mono bg-canvas")}
                    placeholder="044"
                    readOnly
                    tabIndex={-1}
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* 16. Foreign Address */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-text-2 uppercase tracking-[0.06em]">
                  16. Foreign Address
                </p>
                <span className="text-xs bg-border text-muted px-2 py-0.5 rounded font-medium">Optional</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <Field label="Full foreign address" error={errors.foreignAddress?.message}>
                    <input
                      {...register("foreignAddress")}
                      className={fieldInputCls}
                      placeholder="Leave empty if not applicable"
                    />
                  </Field>
                </div>
                <Field label="Country" error={errors.foreignCountry?.message}>
                  <input {...register("foreignCountry")} className={fieldInputCls} placeholder="—" />
                </Field>
                <Field label="Postal code" error={errors.foreignPostalCode?.message}>
                  <input {...register("foreignPostalCode")} className={cn(fieldInputCls, "font-mono")} placeholder="—" />
                </Field>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* 22. Contact Details */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-text-2 uppercase tracking-[0.06em]">
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
