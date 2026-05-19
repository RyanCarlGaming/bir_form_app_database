import { type ReactNode } from "react";
import Steps from "./Steps";
import PageHeader from "./PageHeader";

interface FormShellProps {
  step: number;
  title: string;
  sub?: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function FormShell({ step, title, sub, children, footer }: FormShellProps) {
  return (
    <div className="flex flex-col min-h-full">
      <div className="mb-8">
        <Steps current={step} />
      </div>
      <PageHeader title={title} sub={sub} />
      <div className="flex-1 pb-24">{children}</div>
      <div className="sticky bottom-0 bg-surface border-t border-border py-4 px-6 flex items-center justify-between -mx-6">
        {footer}
      </div>
    </div>
  );
}
