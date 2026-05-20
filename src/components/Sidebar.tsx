import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, Plus, FileText, FolderOpen,
  CreditCard, Clock, Users, BookOpen, ClipboardList,
  Settings, type LucideIcon,
} from "lucide-react";
import { api } from "../lib/api";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const sections: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "WORKSPACE",
    items: [
      { href: "/",                   label: "Dashboard",           icon: LayoutDashboard },
      { href: "/applications/new",   label: "New Application",     icon: Plus },
      { href: "/drafts",             label: "My Drafts",           icon: FileText },
    ],
  },
  {
    label: "RECORDS",
    items: [
      { href: "/applications",       label: "All Applications",    icon: FolderOpen },
      { href: "/issued-tins",        label: "Issued TINs",         icon: CreditCard },
      { href: "/verification-queue", label: "Verification Queue",  icon: Clock },
      { href: "/registry",           label: "Taxpayer Registry",   icon: Users },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { href: "/data-dictionary",    label: "Data Dictionary",     icon: BookOpen },
      { href: "/audit-log",          label: "Audit Log",           icon: ClipboardList },
      { href: "/settings",           label: "Settings",            icon: Settings },
    ],
  },
];

function isActive(href: string, location: string) {
  if (href === "/") return location === "/";
  if (href === "/applications") return location === "/applications";
  return location.startsWith(href);
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "RO";
}

export default function Sidebar() {
  const [location] = useLocation();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: api.profile.get,
  });
  const officerName = profile?.officerName ?? "Daniel Flor";
  const role = profile?.role ?? "Revenue Officer";
  const companyName = profile?.companyName ?? "Default Company";

  return (
    <div
      className="flex flex-col h-screen shrink-0"
      style={{ width: 240, background: "#0B1220", padding: "16px 12px" }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px 20px" }}>
        <div style={{
          width: 38, height: 38, background: "#fff", borderRadius: 8,
          display: "grid", placeItems: "center", color: "#0B1220", flexShrink: 0,
        }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="2"/>
            <line x1="8" y1="8" x2="16" y2="8"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="8" y1="16" x2="13" y2="16"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>BIR Online Registration</div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Portal Application</div>
        </div>
      </div>

      {/* Sections */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
        {sections.map(({ label, items }) => (
          <div key={label}>
            <div style={{
              fontSize: 10.5, fontWeight: 600, color: "#475569",
              letterSpacing: "0.07em", padding: "0 8px 6px",
            }}>
              {label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {items.map(({ href, label: itemLabel, icon: Icon }) => {
                const active = isActive(href, location);
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 10px",
                      color: active ? "#fff" : "rgba(255,255,255,0.6)",
                      fontSize: 13.5, fontWeight: active ? 500 : 400,
                      borderRadius: 7,
                      textDecoration: "none",
                      background: active ? "rgba(255,255,255,0.1)" : "transparent",
                      transition: "background .12s ease, color .12s ease",
                    }}
                  >
                    <Icon size={16} style={{ flexShrink: 0 }} />
                    {itemLabel}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <Link
        href="/settings"
        style={{
        padding: "12px 8px 4px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: 10,
        textDecoration: "none",
      }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "#334155", color: "#fff",
          fontWeight: 600, fontSize: 12,
          display: "grid", placeItems: "center", flexShrink: 0,
          overflow: "hidden",
        }}>
          {profile?.photoDataUrl ? (
            <img src={profile.photoDataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            initials(officerName)
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{officerName}</div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>{companyName}</div>
          <div style={{ fontSize: 10.5, color: "#475569", marginTop: 1 }}>{role}</div>
        </div>
        <Settings size={16} style={{ color: "#475569", flexShrink: 0, cursor: "pointer" }} />
      </Link>
    </div>
  );
}
