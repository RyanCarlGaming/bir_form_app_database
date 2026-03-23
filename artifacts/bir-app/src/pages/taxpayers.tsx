import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { 
  useListTaxpayers, 
  useCreateTaxpayer, 
  useUpdateTaxpayer, 
  useDeleteTaxpayer,
  type Taxpayer,
  type CreateTaxpayerRequest
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, MoreVertical, Edit, Trash2, Loader2, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Form Schema
const taxpayerSchema = z.object({
  tin: z.string().min(9, "TIN must be at least 9 characters"),
  registeredName: z.string().min(2, "Registered name is required"),
  tradeName: z.string().optional().nullable(),
  taxpayerType: z.enum(["individual", "corporation", "partnership", "estate", "trust"]),
  address: z.string().min(5, "Address is required"),
  zipCode: z.string().min(4, "Zip code is required"),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  rdoCode: z.string().min(3, "RDO Code is required"),
  lineOfBusiness: z.string().optional().nullable(),
});

export default function TaxpayersList() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: taxpayers, isLoading } = useListTaxpayers();
  const createMutation = useCreateTaxpayer({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/taxpayers'] });
        toast({ title: "Success", description: "Taxpayer created successfully." });
        handleCloseModal();
      }
    }
  });
  const updateMutation = useUpdateTaxpayer({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/taxpayers'] });
        toast({ title: "Success", description: "Taxpayer updated successfully." });
        handleCloseModal();
      }
    }
  });
  const deleteMutation = useDeleteTaxpayer({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/taxpayers'] });
        toast({ title: "Success", description: "Taxpayer deleted." });
      }
    }
  });

  const form = useForm<z.infer<typeof taxpayerSchema>>({
    resolver: zodResolver(taxpayerSchema),
    defaultValues: {
      taxpayerType: "individual"
    }
  });

  const filteredTaxpayers = taxpayers?.filter(t => 
    t.registeredName.toLowerCase().includes(search.toLowerCase()) || 
    t.tin.includes(search)
  ) || [];

  const handleOpenModal = (taxpayer?: Taxpayer) => {
    if (taxpayer) {
      setEditingId(taxpayer.id);
      form.reset({
        tin: taxpayer.tin,
        registeredName: taxpayer.registeredName,
        tradeName: taxpayer.tradeName || "",
        taxpayerType: taxpayer.taxpayerType,
        address: taxpayer.address,
        zipCode: taxpayer.zipCode,
        email: taxpayer.email || "",
        phone: taxpayer.phone || "",
        rdoCode: taxpayer.rdoCode,
        lineOfBusiness: taxpayer.lineOfBusiness || "",
      });
    } else {
      setEditingId(null);
      form.reset({ taxpayerType: "individual", tin: "", registeredName: "", address: "", zipCode: "", rdoCode: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof taxpayerSchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: values as CreateTaxpayerRequest });
    } else {
      createMutation.mutate({ data: values as CreateTaxpayerRequest });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Taxpayer Registry</h1>
          <p className="text-muted-foreground mt-1">Manage registered taxpayers and businesses.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Register Taxpayer
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/20">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by Name or TIN..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">TIN</th>
                <th className="px-6 py-4 font-medium">Taxpayer Details</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">RDO</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                    <span className="text-muted-foreground">Loading taxpayers...</span>
                  </td>
                </tr>
              ) : filteredTaxpayers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-foreground font-medium">No taxpayers found</p>
                    <p className="text-muted-foreground text-sm mt-1">Adjust your search or register a new taxpayer.</p>
                  </td>
                </tr>
              ) : (
                filteredTaxpayers.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-official whitespace-nowrap">{t.tin}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{t.registeredName}</div>
                      {t.tradeName && <div className="text-xs text-muted-foreground">{t.tradeName}</div>}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-secondary-border">
                        {t.taxpayerType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-official text-muted-foreground">{t.rdoCode}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(t)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this taxpayer?")) {
                              deleteMutation.mutate({ id: t.id });
                            }
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Normally would use a real Dialog component from shadcn, building a robust custom one here to ensure it works beautifully without relying on complex radix dependencies */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-border animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingId ? "Edit Taxpayer" : "Register Taxpayer"}</h2>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="taxpayer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">TIN <span className="text-destructive">*</span></label>
                      <input 
                        {...form.register("tin")} 
                        className={cn("w-full px-3 py-2 bg-background border rounded-md text-sm font-official focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all", form.formState.errors.tin ? "border-destructive" : "border-input")} 
                        placeholder="000-000-000-000"
                      />
                      {form.formState.errors.tin && <p className="text-destructive text-xs mt-1">{form.formState.errors.tin.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Registered Name <span className="text-destructive">*</span></label>
                      <input 
                        {...form.register("registeredName")} 
                        className={cn("w-full px-3 py-2 bg-background border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all", form.formState.errors.registeredName ? "border-destructive" : "border-input")} 
                      />
                      {form.formState.errors.registeredName && <p className="text-destructive text-xs mt-1">{form.formState.errors.registeredName.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Trade Name</label>
                      <input 
                        {...form.register("tradeName")} 
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Taxpayer Type <span className="text-destructive">*</span></label>
                      <select 
                        {...form.register("taxpayerType")} 
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all capitalize"
                      >
                        <option value="individual">Individual</option>
                        <option value="corporation">Corporation</option>
                        <option value="partnership">Partnership</option>
                        <option value="estate">Estate</option>
                        <option value="trust">Trust</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Line of Business</label>
                      <input 
                        {...form.register("lineOfBusiness")} 
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">RDO Code <span className="text-destructive">*</span></label>
                      <input 
                        {...form.register("rdoCode")} 
                        className={cn("w-full px-3 py-2 bg-background border rounded-md text-sm font-official focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all", form.formState.errors.rdoCode ? "border-destructive" : "border-input")} 
                        placeholder="039"
                      />
                      {form.formState.errors.rdoCode && <p className="text-destructive text-xs mt-1">{form.formState.errors.rdoCode.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Address <span className="text-destructive">*</span></label>
                      <textarea 
                        {...form.register("address")} 
                        rows={3}
                        className={cn("w-full px-3 py-2 bg-background border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none", form.formState.errors.address ? "border-destructive" : "border-input")} 
                      />
                      {form.formState.errors.address && <p className="text-destructive text-xs mt-1">{form.formState.errors.address.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Zip Code <span className="text-destructive">*</span></label>
                      <input 
                        {...form.register("zipCode")} 
                        className={cn("w-full px-3 py-2 bg-background border rounded-md text-sm font-official focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all", form.formState.errors.zipCode ? "border-destructive" : "border-input")} 
                      />
                      {form.formState.errors.zipCode && <p className="text-destructive text-xs mt-1">{form.formState.errors.zipCode.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                        <input 
                          {...form.register("email")} 
                          type="email"
                          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                        <input 
                          {...form.register("phone")} 
                          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3 rounded-b-xl">
              <button 
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="taxpayer-form"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-6 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Save Changes" : "Register Taxpayer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
