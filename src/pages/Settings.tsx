import { useEffect, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Save } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { ErrorCard } from "../components/ErrorCard";
import { Skeleton } from "../components/Skeleton";
import { fieldInputCls } from "../components/Fields";
import { api, type OfficeProfile } from "../lib/api";
import { useTheme } from "../lib/useTheme";
import { cn } from "../lib/utils";

type ProfileForm = Omit<OfficeProfile, "id" | "updatedAt">;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "RO";
}

function profileToForm(profile: OfficeProfile): ProfileForm {
  return {
    officerName: profile.officerName ?? "",
    companyName: profile.companyName ?? "Default Company",
    role: profile.role ?? "",
    region: profile.region ?? "",
    office: profile.office ?? "",
    phone: profile.phone ?? "",
    email: profile.email ?? "",
    street: profile.street ?? "",
    barangay: profile.barangay ?? "",
    city: profile.city ?? "",
    province: profile.province ?? "",
    zipCode: profile.zipCode ?? "",
    photoDataUrl: profile.photoDataUrl ?? "",
  };
}

function ProfileField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className={fieldInputCls} />
    </label>
  );
}

export default function Settings() {
  const { theme, toggle } = useTheme();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: api.profile.get,
  });

  useEffect(() => {
    if (profile) setForm(profileToForm(profile));
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: (body: ProfileForm) => api.profile.update(body),
    onSuccess(updated) {
      setForm(profileToForm(updated));
      setSaveMessage("Profile saved.");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-forms"] });
    },
  });

  function setField<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    if (!form) return;
    setForm({ ...form, [key]: value });
    setSaveMessage("");
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !form) return;

    const reader = new FileReader();
    reader.onload = () => {
      setField("photoDataUrl", String(reader.result ?? ""));
    };
    reader.readAsDataURL(file);
  }

  if (isLoading || !form) {
    return (
      <>
        <PageHeader title="Settings" sub="Workspace preferences for the registration portal." />
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-4">
          <Skeleton className="h-[520px]" />
          <Skeleton className="h-40" />
        </div>
      </>
    );
  }

  if (isError) {
    return <ErrorCard message="Could not load profile settings." onRetry={refetch} />;
  }

  const address = [form.street, form.barangay, form.city, form.province, form.zipCode]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <PageHeader title="Settings" sub="Workspace preferences and officer profile." />
      <div className="grid grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-canvas">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">Profile Shown</p>
          </div>

          <div className="p-5 flex items-start gap-5">
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full bg-navy text-white grid place-items-center overflow-hidden text-2xl font-semibold">
                {form.photoDataUrl ? (
                  <img src={form.photoDataUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials(form.officerName)
                )}
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-border text-sm rounded hover:bg-border cursor-pointer transition-colors">
                <Camera size={15} />
                Change Photo
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
              <ProfileField label="Officer Name" value={form.officerName} onChange={(v) => setField("officerName", v)} />
              <ProfileField label="Company" value={form.companyName} onChange={(v) => setField("companyName", v)} />
              <ProfileField label="Role" value={form.role} onChange={(v) => setField("role", v)} />
              <ProfileField label="Region" value={form.region} onChange={(v) => setField("region", v)} />
              <ProfileField label="Office" value={form.office} onChange={(v) => setField("office", v)} />
              <ProfileField label="Phone Number" value={form.phone ?? ""} onChange={(v) => setField("phone", v)} />
              <ProfileField label="Email" value={form.email ?? ""} onChange={(v) => setField("email", v)} />
              <ProfileField label="Street" value={form.street ?? ""} onChange={(v) => setField("street", v)} />
              <ProfileField label="Barangay" value={form.barangay ?? ""} onChange={(v) => setField("barangay", v)} />
              <ProfileField label="City" value={form.city ?? ""} onChange={(v) => setField("city", v)} />
              <ProfileField label="Province" value={form.province ?? ""} onChange={(v) => setField("province", v)} />
              <ProfileField label="ZIP Code" value={form.zipCode ?? ""} onChange={(v) => setField("zipCode", v)} />
            </div>
          </div>

          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <p className={cn("text-xs", saveMutation.isError ? "text-red" : "text-muted")}>
              {saveMutation.isError ? (saveMutation.error as Error).message : saveMessage || "Profile is saved in the database."}
            </p>
            <button
              type="button"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate(form)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-medium rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Save size={15} />
              {saveMutation.isPending ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2 mb-4">Visible Profile</p>
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-blue mb-2">{form.companyName}</p>
            <p className="text-lg font-semibold text-text">{form.officerName}</p>
            <p className="text-sm text-muted mt-1">{form.role}</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-text-2">
              <span>{form.region}</span>
              <span>{form.office}</span>
              {form.phone && <span>{form.phone}</span>}
              {form.email && <span>{form.email}</span>}
              {address && <span>{address}</span>}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2 mb-4">Appearance</p>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-text capitalize">{theme} mode</p>
                <p className="text-xs text-muted mt-1">Applies to the current browser.</p>
              </div>
              <button
                type="button"
                onClick={toggle}
                className="px-4 py-2 border border-border text-sm font-medium rounded hover:bg-border transition-colors"
              >
                Toggle Theme
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
