import { type ReactNode } from "react";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  sub?: string;
  status?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}

export default function PageHeader({ title, sub, status, actions, back }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        {back && (
          <Link
            href={back.href}
            className="flex items-center gap-1 text-xs text-muted hover:text-text-2 mb-2 transition-colors"
          >
            <ChevronLeft size={14} />
            {back.label}
          </Link>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text">{title}</h1>
          {status}
        </div>
        {sub && <p className="text-sm text-muted mt-1">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
