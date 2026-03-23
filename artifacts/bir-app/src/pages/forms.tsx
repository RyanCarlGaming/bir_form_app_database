import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { 
  useListForms,
  useListTaxpayers,
  useCreateFormSubmission,
  useDeleteFormSubmission,
  type CreateFormSubmissionRequest
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, FileText, ArrowRight, Trash2, Loader2, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const newFormSchema = z.object({
  taxpayerId: z.coerce.number().min(1, "Select a taxpayer"),
  formType: z.string().min(1, "Select form type"),
  taxableYear: z.coerce.number().min(1900).max(2100).optional().nullable(),
  taxablePeriod: z.string().optional().nullable(),
  status: z.enum(["draft", "submitted", "filed", "amended"])
});

export default function FormsList() {
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: forms, isLoading } = useListForms({
    formType: filterType || undefined,
    status: filterStatus || undefined
  });
  
  const { data: taxpayers } = useListTaxpayers();
  
  const createMutation = useCreateFormSubmission({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
        toast({ title: "Success", description: "Form draft created successfully." });
        setIsModalOpen(false);
        form.reset();
      }
    }
  });

  const deleteMutation = useDeleteFormSubmission({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
        toast({ title: "Success", description: "Form deleted." });
      }
    }
  });

  const form = useForm<z.infer<typeof newFormSchema>>({
    resolver: zodResolver(newFormSchema),
    defaultValues: {
      status: "draft",
      taxableYear: new Date().getFullYear()
    }
  });

  const onSubmit = (values: z.infer<typeof newFormSchema>) => {
    createMutation.mutate({ data: values as CreateFormSubmissionRequest });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'submitted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'filed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'amended': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Form Submissions</h1>
          <p className="text-muted-foreground mt-1">Manage and track all BIR tax return forms.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          New Form
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center gap-4 bg-muted/20">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary transition-all"
          >
            <option value="">All Form Types</option>
            <option value="1700">1700</option>
            <option value="1701">1701</option>
            <option value="1701A">1701A</option>
            <option value="1702-RT">1702-RT</option>
            <option value="2550M">2550M</option>
            <option value="2550Q">2550Q</option>
            <option value="1601C">1601C</option>
          </select>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary transition-all capitalize"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="filed">Filed</option>
            <option value="amended">Amended</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Form Info</th>
                <th className="px-6 py-4 font-medium">Taxpayer</th>
                <th className="px-6 py-4 font-medium text-right">Tax Due</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium">Last Updated</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                    <span className="text-muted-foreground">Loading forms...</span>
                  </td>
                </tr>
              ) : forms?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-foreground font-medium">No forms found</p>
                    <p className="text-muted-foreground text-sm mt-1">Create a new form to get started.</p>
                  </td>
                </tr>
              ) : (
                forms?.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground flex items-center gap-2">
                        BIR Form {f.formType}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {f.taxableYear ? `Year ${f.taxableYear}` : (f.taxablePeriod || 'N/A')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium truncate max-w-[200px]" title={f.taxpayer?.registeredName}>
                        {f.taxpayer?.registeredName || 'Unknown'}
                      </div>
                      <div className="font-official text-xs text-muted-foreground">{f.taxpayer?.tin}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-official font-medium">
                      {formatCurrency(f.taxDue)}
                    </td>
                    <td className="px-6 py-4 text-center capitalize">
                      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", getStatusColor(f.status))}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(f.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this form?")) {
                              deleteMutation.mutate({ id: f.id });
                            }
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link href={`/forms/${f.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors border border-border">
                          Open <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-border animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-bold">Create New Form</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            
            <div className="p-5">
              <form id="new-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Select Taxpayer <span className="text-destructive">*</span></label>
                  <select 
                    {...form.register("taxpayerId")} 
                    className={cn("w-full px-3 py-2 bg-background border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all", form.formState.errors.taxpayerId ? "border-destructive" : "border-input")}
                  >
                    <option value="">-- Select --</option>
                    {taxpayers?.map(t => (
                      <option key={t.id} value={t.id}>{t.registeredName} ({t.tin})</option>
                    ))}
                  </select>
                  {form.formState.errors.taxpayerId && <p className="text-destructive text-xs mt-1">{form.formState.errors.taxpayerId.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Form Type <span className="text-destructive">*</span></label>
                  <select 
                    {...form.register("formType")} 
                    className={cn("w-full px-3 py-2 bg-background border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all", form.formState.errors.formType ? "border-destructive" : "border-input")}
                  >
                    <option value="">-- Select --</option>
                    <option value="1700">1700 - Annual Income Tax (Individuals Earning Purely Compensation)</option>
                    <option value="1701">1701 - Annual Income Tax (Self-Employed, Professionals)</option>
                    <option value="1701A">1701A - Annual Income Tax (Individuals under 8% IT Rate)</option>
                    <option value="1702-RT">1702-RT - Annual Income Tax (Corporations, Partnerships)</option>
                    <option value="2550M">2550M - Monthly Value-Added Tax</option>
                    <option value="2550Q">2550Q - Quarterly Value-Added Tax</option>
                  </select>
                  {form.formState.errors.formType && <p className="text-destructive text-xs mt-1">{form.formState.errors.formType.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Taxable Year</label>
                    <input 
                      type="number"
                      {...form.register("taxableYear")} 
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm font-official focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Period</label>
                    <input 
                      type="text"
                      placeholder="e.g. Q1, Jan"
                      {...form.register("taxablePeriod")} 
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-border bg-muted/30 flex justify-end gap-3 rounded-b-xl">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"
                disabled={createMutation.isPending}
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="new-form"
                disabled={createMutation.isPending}
                className="px-6 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
