import { cn } from "../lib/utils";
import type { TaxpayerStatus } from "../lib/api";

const config: Record<TaxpayerStatus, { bg: string; text: string; label: string }> = {
  draft:     { bg: "bg-slate-100",  text: "text-slate-600",  label: "Draft" },
  submitted: { bg: "bg-blue-50",    text: "text-blue-700",   label: "Submitted" },
  filed:     { bg: "bg-green-50",   text: "text-green-700",  label: "Filed" },
  amended:   { bg: "bg-amber-50",   text: "text-amber-700",  label: "Amended" },
};

interface StatusPillProps {
  status: TaxpayerStatus;
  variant?: "pipeline" | "registry";
}

export default function StatusPill({ status, variant }: StatusPillProps) {
  const { bg, text, label: base } = config[status];
  let label = base;
  if (variant === "pipeline" && status === "submitted") label = "Verifying";
  if (variant === "registry"  && status === "filed")    label = "Issued";

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", bg, text)}>
      {label}
    </span>
  );
}
