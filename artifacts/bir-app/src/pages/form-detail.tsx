import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { 
  useGetFormSubmission,
  useUpdateFormSubmission,
  type UpdateFormSubmissionRequest
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, CheckCircle2, FileText, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

const updateFormSchema = z.object({
  grossIncome: z.coerce.number().optional().nullable(),
  allowableDeductions: z.coerce.number().optional().nullable(),
  taxableIncome: z.coerce.number().optional().nullable(),
  taxDue: z.coerce.number().optional().nullable(),
  taxWithheld: z.coerce.number().optional().nullable(),
  taxPayable: z.coerce.number().optional().nullable(),
  penaltiesAndInterest: z.coerce.number().optional().nullable(),
  totalAmountDue: z.coerce.number().optional().nullable(),
  status: z.enum(["draft", "submitted", "filed", "amended"]),
  remarks: z.string().optional().nullable(),
});

export default function FormDetail() {
  const [, params] = useRoute("/forms/:id");
  const id = Number(params?.id);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: form, isLoading, error } = useGetFormSubmission(id);
  
  const updateMutation = useUpdateFormSubmission({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/forms/${id}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/forms`] });
        toast({ title: "Saved", description: "Form updated successfully." });
      }
    }
  });

  const rhf = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
  });

  // Load data into form when available
  useEffect(() => {
    if (form) {
      rhf.reset({
        grossIncome: form.grossIncome,
        allowableDeductions: form.allowableDeductions,
        taxableIncome: form.taxableIncome,
        taxDue: form.taxDue,
        taxWithheld: form.taxWithheld,
        taxPayable: form.taxPayable,
        penaltiesAndInterest: form.penaltiesAndInterest,
        totalAmountDue: form.totalAmountDue,
        status: form.status,
        remarks: form.remarks,
      });
    }
  }, [form, rhf]);

  const onSubmit = (values: z.infer<typeof updateFormSchema>) => {
    updateMutation.mutate({ id, data: values as UpdateFormSubmissionRequest });
  };

  // Simple auto-computation logic for convenience
  const computeValues = () => {
    const vals = rhf.getValues();
    const gross = vals.grossIncome || 0;
    const ded = vals.allowableDeductions || 0;
    const taxable = Math.max(0, gross - ded);
    
    // Very dummy 20% flat tax for demonstration of interaction
    const due = taxable * 0.20; 
    const withheld = vals.taxWithheld || 0;
    const payable = Math.max(0, due - withheld);
    const penalties = vals.penaltiesAndInterest || 0;
    const total = payable + penalties;

    rhf.setValue("taxableIncome", taxable, { shouldDirty: true });
    rhf.setValue("taxDue", due, { shouldDirty: true });
    rhf.setValue("taxPayable", payable, { shouldDirty: true });
    rhf.setValue("totalAmountDue", total, { shouldDirty: true });
    
    toast({ title: "Computed", description: "Tax values automatically calculated." });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !form) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground">Form Not Found</h2>
          <p className="text-muted-foreground mt-2 mb-6">The requested form could not be loaded.</p>
          <Link href="/forms" className="text-primary hover:underline">Return to Forms List</Link>
        </div>
      </Layout>
    );
  }

  const isReadOnly = form.status === 'filed';

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/forms" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Forms
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">BIR Form {form.formType}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                form.status === 'draft' ? "bg-slate-100 text-slate-700 border-slate-200" :
                form.status === 'submitted' ? "bg-blue-100 text-blue-700 border-blue-200" :
                form.status === 'filed' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                "bg-amber-100 text-amber-700 border-amber-200"
              )}>
                {form.status}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">
              Reference No. #{String(form.id).padStart(6, '0')} • Created {formatDate(form.createdAt)}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {!isReadOnly && (
              <button 
                type="button"
                onClick={computeValues}
                className="px-4 py-2 bg-secondary text-secondary-foreground border border-secondary-border rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Auto-Compute
              </button>
            )}
            <button 
              onClick={rhf.handleSubmit(onSubmit)}
              disabled={updateMutation.isPending || isReadOnly}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Form
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Form Content */}
        <div className="xl:col-span-2 space-y-6">
          <form id="detail-form" onSubmit={rhf.handleSubmit(onSubmit)}>
            {/* Computation Section */}
            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex items-center gap-2">
                <FileText className="w-5 h-5 opacity-70" />
                <h2 className="font-semibold tracking-wide">Part II - Computation of Tax</h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <FormInput label="1. Gross Income" name="grossIncome" register={rhf.register} disabled={isReadOnly} />
                  <FormInput label="2. Less: Allowable Deductions" name="allowableDeductions" register={rhf.register} disabled={isReadOnly} />
                  
                  <div className="col-span-1 md:col-span-2 border-t border-dashed border-border my-2 pt-4"></div>
                  
                  <FormInput label="3. Taxable Income (1 less 2)" name="taxableIncome" register={rhf.register} disabled={isReadOnly} highlight />
                  <FormInput label="4. Tax Due" name="taxDue" register={rhf.register} disabled={isReadOnly} highlight />
                  
                  <div className="col-span-1 md:col-span-2 border-t border-dashed border-border my-2 pt-4"></div>
                  
                  <FormInput label="5. Less: Tax Withheld/Paid" name="taxWithheld" register={rhf.register} disabled={isReadOnly} />
                  <FormInput label="6. Tax Payable/(Overpayment)" name="taxPayable" register={rhf.register} disabled={isReadOnly} highlight />
                  
                  <div className="col-span-1 md:col-span-2 border-t border-dashed border-border my-2 pt-4"></div>
                  
                  <FormInput label="7. Add: Penalties & Interest" name="penaltiesAndInterest" register={rhf.register} disabled={isReadOnly} />
                  
                  <div className="col-span-1 md:col-span-2 bg-primary/5 -mx-6 px-6 py-6 border-y border-primary/20 mt-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <label className="text-base font-bold text-foreground">8. Total Amount Payable</label>
                      <div className="relative w-full md:w-1/2">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-official">₱</span>
                        <input 
                          type="number" step="0.01"
                          {...rhf.register("totalAmountDue")}
                          disabled={isReadOnly}
                          className="w-full pl-8 pr-4 py-3 bg-background border-2 border-primary/30 rounded-lg text-lg font-bold font-official amount-input focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-70 disabled:bg-muted"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Section */}
            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden mt-6">
              <div className="bg-muted p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Status & Remarks</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Filing Status</label>
                  <select 
                    {...rhf.register("status")}
                    disabled={isReadOnly && form.status === 'filed'} // Once filed, only an admin action (outside this scope) should amend
                    className="w-full max-w-md px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none capitalize"
                  >
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted (Awaiting Review)</option>
                    <option value="filed">Filed (Official)</option>
                    <option value="amended">Amended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Remarks / Notes</label>
                  <textarea 
                    {...rhf.register("remarks")}
                    disabled={isReadOnly}
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none disabled:opacity-70"
                    placeholder="Internal notes regarding this submission..."
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
            <div className="bg-muted p-4 border-b border-border flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <h3 className="font-semibold text-foreground">Taxpayer Details</h3>
            </div>
            <div className="p-5 space-y-4">
              {form.taxpayer ? (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">TIN</p>
                    <p className="text-lg font-official font-medium text-foreground mt-0.5">{form.taxpayer.tin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Registered Name</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{form.taxpayer.registeredName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">RDO Code</p>
                    <p className="text-sm font-official text-foreground mt-0.5">{form.taxpayer.rdoCode}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-border">
                    <Link href={`/taxpayers?search=${form.taxpayer.tin}`} className="text-sm text-primary hover:underline font-medium">
                      View full profile
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">Taxpayer details unavailable.</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-blue-900 shadow-sm">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Validation Status
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Ensure all computational fields are correctly encoded. The "Auto-Compute" button applies basic formulas, but manual verification is required before marking as "Filed".
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function FormInput({ label, name, register, disabled, highlight }: { label: string, name: string, register: any, disabled?: boolean, highlight?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <label className={cn("text-sm text-foreground", highlight ? "font-bold" : "font-medium")}>
        {label}
      </label>
      <div className="relative w-full sm:w-1/2 md:w-2/3 lg:w-1/2">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-official text-sm">₱</span>
        <input 
          type="number" step="0.01"
          {...register(name)}
          disabled={disabled}
          className={cn(
            "w-full pl-8 pr-3 py-2 bg-background border rounded-md text-sm font-official amount-input outline-none transition-all disabled:opacity-70 disabled:bg-muted",
            highlight ? "border-slate-400 bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20" : "border-input focus:border-primary focus:ring-1 focus:ring-primary"
          )}
        />
      </div>
    </div>
  );
}
