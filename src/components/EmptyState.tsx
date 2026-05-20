import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  sub?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, sub, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-border text-muted">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-text">{title}</p>
        {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
      </div>
      {action && (
        <button onClick={action.onClick} className="mt-1 text-xs font-medium text-blue underline">
          {action.label}
        </button>
      )}
    </div>
  );
}
