import type { ReactNode } from "react";
import { cn } from "../lib/utils";

const labelCls = "text-xs font-semibold uppercase tracking-[0.04em] text-text-2";
export const fieldInputCls = "h-10 px-3 rounded border border-border bg-surface text-text text-sm focus:outline-none focus:border-blue disabled:opacity-50 disabled:cursor-not-allowed w-full";

// ── Field ─────────────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  req?: boolean;
  error?: string;
  help?: string;
  children: ReactNode;
}

export function Field({ label, req, error, help, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>
        {label}{req && <span className="text-red ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red">{error}</p>}
      {!error && help && <p className="text-xs text-muted">{help}</p>}
    </div>
  );
}

// ── SelectField ───────────────────────────────────────────────────────────────

interface SelectFieldProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (v: string) => void;
  help?: string;
  req?: boolean;
}

export function SelectField({ label, options, value, onChange, help, req }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>
        {label}{req && <span className="text-red ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(fieldInputCls, "appearance-none pr-8 cursor-pointer")}
        >
          <option value="" disabled>Select…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs">▾</span>
      </div>
      {help && <p className="text-xs text-muted">{help}</p>}
    </div>
  );
}

// ── DateField ─────────────────────────────────────────────────────────────────

interface DateFieldProps {
  label: string;
  value?: string;
  onChange?: (v: string) => void;
  req?: boolean;
}

export function DateField({ label, value, onChange, req }: DateFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>
        {label}{req && <span className="text-red ml-0.5">*</span>}
      </label>
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(fieldInputCls, "font-mono")}
      />
    </div>
  );
}

// ── Checkbox ──────────────────────────────────────────────────────────────────

interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => e.key === " " && onChange(!checked)}
        className={cn(
          "w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
          checked ? "bg-blue border-blue" : "border-border bg-surface",
        )}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-text select-none">{label}</span>
    </label>
  );
}
