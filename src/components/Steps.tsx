import { Check } from "lucide-react";
import { cn } from "../lib/utils";
import { useWizard } from "../lib/wizard";

const LABELS = ["Personal Info", "Address", "Employer", "Spouse", "Review"];

interface StepsProps { current: number; }

export default function Steps({ current }: StepsProps) {
  const ctx = useWizard();
  const completedSteps = ctx.state.completedSteps;
  const goTo = ctx.goTo;

  return (
    <div className="flex items-center justify-center">
      {LABELS.map((label, i) => {
        const step = i + 1;
        const done   = completedSteps.includes(step) && step !== current;
        const active = step === current;
        const future = !done && !active;
        const clickable = done && goTo;

        return (
          <div key={step} className="flex items-center">
            {i > 0 && (
              <div className={cn("h-px w-10", done ? "bg-navy" : "bg-border")} />
            )}
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && goTo(step)}
              className={cn(
                "flex flex-col items-center w-16",
                clickable ? "cursor-pointer" : "cursor-default",
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                done   && "bg-navy text-white",
                active && "bg-blue text-white",
                future && "bg-surface border-2 border-navy text-navy",
              )}>
                {done ? <Check size={14} /> : step}
              </div>
              <span className={cn(
                "text-xs mt-1.5 text-center leading-tight transition-colors",
                active ? "text-text font-medium" : "text-muted",
              )}>
                {label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
