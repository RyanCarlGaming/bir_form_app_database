import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, Bell, Sun, Moon } from "lucide-react";
import { api } from "../lib/api";
import { useTheme } from "../lib/useTheme";

const tabs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Applications", href: "/applications" },
  { label: "Records", href: "/records" },
  { label: "Reports", href: "/reports" },
];

function activeTab(location: string): string {
  if (location === "/dashboard") return "/dashboard";
  if (location.startsWith("/applications")) return "/applications";
  if (
    location.startsWith("/registry") ||
    location.startsWith("/issued-tins") ||
    location.startsWith("/verification-queue") ||
    location.startsWith("/drafts") ||
    location.startsWith("/records")
  ) return "/records";
  if (location.startsWith("/reports")) return "/reports";
  return "";
}

export default function Topbar() {
  const [location, navigate] = useLocation();
  const current = activeTab(location);
  const { theme, toggle } = useTheme();
  const [search, setSearch] = useState("");
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: api.profile.get,
  });

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    if (query) sessionStorage.setItem("applicationSearch", query);
    else sessionStorage.removeItem("applicationSearch");
    window.dispatchEvent(new Event("application-search"));
    navigate("/applications");
  }

  return (
    <div style={{
      height: 56, flexShrink: 0,
      padding: "0 24px",
      display: "flex", alignItems: "center", gap: 4,
      borderBottom: "1px solid var(--color-border)",
      background: "var(--color-canvas)",
    }}>
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
        <span style={{ fontWeight: 600 }}>{profile?.companyName ?? "Default Company"}</span>
        <span style={{ color: "var(--color-muted)", margin: "0 2px" }}>·</span>
        <span style={{ color: "var(--color-muted)" }}>{profile?.office ?? "QC"}</span>
      </div>

      <form onSubmit={submitSearch} style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "5px 14px",
        border: "1px solid var(--color-border)",
        borderRadius: 999,
        width: 220, flexShrink: 0,
        fontSize: 13, color: "var(--color-muted)",
      }}>
        <Search size={13} style={{ flexShrink: 0 }} />
        <input
          aria-label="Search forms or TIN"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search forms, TIN..."
          style={{
            width: "100%",
            minWidth: 0,
            border: 0,
            outline: 0,
            background: "transparent",
            color: "var(--color-text)",
            fontSize: 13,
          }}
        />
      </form>

      <button
        type="button"
        aria-label="Notifications"
        title="Notifications"
        style={{
          position: "relative",
          width: 36,
          height: 36,
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          flexShrink: 0,
          border: 0,
          background: "transparent",
          color: "var(--color-text)",
        }}
      >
        <Bell size={17} style={{ color: "var(--color-text)" }} />
        <span style={{
          position: "absolute", top: 7, right: 8,
          width: 7, height: 7, borderRadius: "50%",
          background: "#EF4444",
          border: "2px solid var(--color-canvas)",
        }} />
      </button>

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
