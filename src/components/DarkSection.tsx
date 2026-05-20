import { type ReactNode } from "react";
import { cn } from "../lib/utils";

interface DarkSectionProps {
  icon?: ReactNode;
  title: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function DarkSection({ icon, title, badge, children, className }: DarkSectionProps) {
  return (
    <div className={cn("rounded-xl border border-border overflow-hidden", className)}>
      <div className="bg-navy text-white px-6 py-4 flex items-center gap-3">
        {icon && <span className="text-white/70 shrink-0">{icon}</span>}
        <span className="font-semibold text-sm flex-1">{title}</span>
        {badge && <span>{badge}</span>}
      </div>
      <div className="bg-surface p-6">{children}</div>
    </div>
  );
}
