import { Check } from "lucide-react";
import { cn } from "../lib/utils";

const LABELS = ["Personal Info", "Address", "Employer", "Spouse", "Review"];

interface StepsProps { current: number; }

export default function Steps({ current }: StepsProps) {
  return (
    <div className="flex items-start">
      {LABELS.map((label, i) => {
        const step = i + 1;
        const done   = step < current;
        const active = step === current;

        return (
          <div key={step} className="flex items-start">
            {i > 0 && (
              <div className={cn("h-px w-10 mt-4", done ? "bg-navy" : "bg-border")} />
            )}
            <div className="flex flex-col items-center w-16">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                done   && "bg-navy text-white",
                active && "bg-blue text-white",
                !done && !active && "bg-surface border-2 border-navy text-navy",
              )}>
                {done ? <Check size={14} /> : step}
              </div>
              <span className={cn(
                "text-xs mt-1.5 text-center leading-tight",
                active ? "text-text font-medium" : "text-muted",
              )}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
