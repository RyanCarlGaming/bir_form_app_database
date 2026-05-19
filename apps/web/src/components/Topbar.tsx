import { Sun, Moon } from "lucide-react";
import { useTheme } from "../lib/useTheme";

export default function Topbar() {
  const { theme, toggle } = useTheme();

  return (
    <div style={{
      height: 64, flexShrink: 0,
      padding: "0 32px",
      display: "flex", alignItems: "center", gap: 16,
      borderBottom: "1px solid var(--color-border)",
      background: "var(--color-canvas)",
    }}>
      {/* Region */}
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap" }}>
        Revenue Region No. 7
        <span style={{ color: "var(--color-muted)", margin: "0 8px", fontWeight: 400 }}>•</span>
        <span style={{ color: "var(--color-muted)", fontWeight: 400 }}>Quezon City</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Search pill */}
      <div style={{
        width: 240, height: 38,
        background: "#EEF2F7",
        borderRadius: 999,
        display: "flex", alignItems: "center",
        gap: 10, padding: "0 16px",
        color: "var(--color-muted)",
        fontSize: 13.5, cursor: "text", userSelect: "none",
        flexShrink: 0,
      }}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span>Search forms, TIN…</span>
      </div>

      {/* Bell with red dot */}
      <div style={{ position: "relative", width: 38, height: 38, display: "grid", placeItems: "center", color: "var(--color-text-2)", cursor: "pointer" }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span style={{
          position: "absolute", top: 8, right: 9,
          width: 7, height: 7, borderRadius: "50%",
          background: "#EF4444",
          border: "2px solid var(--color-canvas)",
        }} />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: "50%", color: "var(--color-text-2)", background: "none", border: "none", cursor: "pointer" }}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}
