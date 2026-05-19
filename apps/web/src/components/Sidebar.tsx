import { Link, useLocation } from "wouter";
import { LayoutDashboard, FolderOpen, Users, ClipboardList, Settings, type LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

const navItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/",             label: "Dashboard",         icon: LayoutDashboard },
  { href: "/applications", label: "Applications",      icon: FolderOpen },
  { href: "/registry",     label: "Taxpayer Registry", icon: Users },
  { href: "/audit-log",    label: "Audit Log",         icon: ClipboardList },
];

function isActive(href: string, location: string) {
  if (href === "/") return location === "/";
  if (href === "/applications") return location.startsWith("/applications");
  return location.startsWith(href);
}

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div
      className="flex flex-col h-screen shrink-0"
      style={{ width: 248, background: "#0B1220", borderRight: "1px solid #000", padding: "18px 14px" }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 8px 22px" }}>
        <div style={{
          width: 42, height: 42, background: "#fff", borderRadius: 10,
          display: "grid", placeItems: "center", color: "#0B1220", flexShrink: 0,
        }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="2"/>
            <line x1="8" y1="8" x2="16" y2="8"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="8" y1="16" x2="13" y2="16"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: "#fff", lineHeight: 1.1 }}>InfoMan</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Portal Application</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "6px 0", flex: 1 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, location);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 12px",
                color: "#fff",
                fontSize: 14, fontWeight: 500,
                borderRadius: 8,
                textDecoration: "none",
                opacity: active ? 1 : 0.78,
                background: active ? "#1E293B" : "transparent",
                transition: "opacity .15s ease, background .15s ease",
              }}
            >
              <span style={{ width: 18, height: 18, display: "inline-grid", placeItems: "center", flexShrink: 0 }}>
                <Icon size={18} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        marginTop: "auto", padding: "14px 8px 4px",
        borderTop: "1px solid #1E293B",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#334155", color: "#fff",
          fontWeight: 600, fontSize: 12,
          display: "grid", placeItems: "center", flexShrink: 0,
        }}>
          DZ
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>Dave Zachary</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>Revenue Officer</div>
        </div>
        <Settings size={18} style={{ color: "#94A3B8", opacity: 0.7, flexShrink: 0 }} />
      </div>
    </div>
  );
}
