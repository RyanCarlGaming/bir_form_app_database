import { Link, useLocation } from "wouter";
import { MapPin, Search, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "../lib/useTheme";

const tabs = [
  { label: "Dashboard",    href: "/" },
  { label: "Applications", href: "/applications" },
  { label: "Records",      href: "/records" },
  { label: "Reports",      href: "/reports" },
];

function activeTab(location: string): string {
  if (location === "/") return "/";
  if (location.startsWith("/applications")) return "/applications";
  if (
    location.startsWith("/registry") ||
    location.startsWith("/issued-tins") ||
    location.startsWith("/verification-queue") ||
    location.startsWith("/records")
  ) return "/records";
  if (location.startsWith("/reports")) return "/reports";
  return "";
}

export default function Topbar() {
  const [location] = useLocation();
  const current = activeTab(location);
  const { theme, toggle } = useTheme();

  return (
    <div style={{
      height: 56, flexShrink: 0,
      padding: "0 24px",
      display: "flex", alignItems: "center", gap: 4,
      borderBottom: "1px solid var(--color-border)",
      background: "var(--color-canvas)",
    }}>
      {/* Tab pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {tabs.map(({ label, href }) => {
          const active = current === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 13.5, fontWeight: active ? 600 : 400,
                color: active ? "#fff" : "var(--color-text)",
                background: active ? "#0B1220" : "transparent",
                textDecoration: "none",
                transition: "background .12s ease, color .12s ease",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Location pill */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 12px",
        border: "1px solid var(--color-border)",
        borderRadius: 999,
        fontSize: 13, color: "var(--color-text)",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        <MapPin size={13} style={{ color: "var(--color-muted)", flexShrink: 0 }} />
        <span style={{ fontWeight: 500 }}>Revenue Region No. 7</span>
        <span style={{ color: "var(--color-muted)", margin: "0 2px" }}>·</span>
        <span style={{ color: "var(--color-muted)" }}>QC</span>
      </div>

      {/* Search pill */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "5px 14px",
        border: "1px solid var(--color-border)",
        borderRadius: 999,
        width: 200, flexShrink: 0,
        fontSize: 13, color: "var(--color-muted)",
        cursor: "text",
      }}>
        <Search size={13} style={{ flexShrink: 0 }} />
        <span>Search forms, TIN…</span>
      </div>

      {/* Bell with red dot */}
      <div style={{ position: "relative", width: 36, height: 36, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
        <Bell size={17} style={{ color: "var(--color-text)" }} />
        <span style={{
          position: "absolute", top: 7, right: 8,
          width: 7, height: 7, borderRadius: "50%",
          background: "#EF4444",
          border: "2px solid var(--color-canvas)",
        }} />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        style={{
          width: 36, height: 36, display: "grid", placeItems: "center",
          borderRadius: "50%", background: "none", border: "none",
          cursor: "pointer", color: "var(--color-text)", flexShrink: 0,
        }}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}
