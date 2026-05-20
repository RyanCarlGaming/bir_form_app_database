import { useState } from "react";
import { useLocation } from "wouter";
import { fieldInputCls, Checkbox } from "../components/Fields";

export default function SignIn() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepMe, setKeepMe] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("authed", "1");
    navigate("/");
  }

  return (
    <div className="flex h-screen">
      {/* Left panel */}
      <div className="w-[46%] bg-navy flex flex-col justify-between p-10 shrink-0">
        {/* Brand block */}
        <div className="flex items-center gap-3">
          <svg
            width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <line x1="8" y1="8" x2="16" y2="8" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="8" y1="16" x2="13" y2="16" />
          </svg>
          <div>
            <p className="text-white font-bold text-lg leading-none">BIR Online Registration</p>
            <p className="text-xs leading-none mt-0.5" style={{ color: "var(--color-navy-muted)" }}>Portal Application</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-slate-400 text-xs uppercase tracking-widest">
            BIR Form 1902 · Employee TIN Registration
          </p>
          <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
            A digital home<br />for Form 1902.
          </h1>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-xs">
            Replace the paper application for employee TIN registration with a structured, normalized record — searchable, verifiable, and shareable across offices.
          </p>
          <div className="flex gap-10">
            {[
              { val: "3NF", label: "Normalized schema" },
              { val: "10 days", label: "Filing window" },
              { val: "9-digit", label: "TIN issued" },
            ].map(({ val, label }) => (
              <div key={val} className="flex flex-col gap-1">
                <span className="font-mono text-white text-lg font-semibold">{val}</span>
                <span className="text-slate-400 text-xs">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-xs uppercase tracking-widest">
            PUP · CCIS · COMP 010 · Group 2
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-canvas flex items-center justify-center">
        <div className="w-[400px] flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green shrink-0" />
            <span className="text-xs text-muted uppercase tracking-widest">Sign in</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-text tracking-tight">Welcome back.</h2>
            <p className="mt-2 text-sm text-muted">Use your office credentials to continue.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                placeholder="d.flor@infoman.gov.ph"
                onChange={(e) => setEmail(e.target.value)}
                className={fieldInputCls}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className={fieldInputCls}
              />
            </div>
            <div className="flex items-center justify-between">
              <Checkbox checked={keepMe} onChange={setKeepMe} label="Keep me signed in" />
              <button type="button" className="text-xs text-blue underline">
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              className="h-10 rounded bg-navy text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
