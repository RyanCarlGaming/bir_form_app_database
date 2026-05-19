import { Link, useLocation } from "wouter";
import { LayoutDashboard, FilePlus, FolderOpen, Users, FileText } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { href: "/",                label: "Dashboard",       icon: LayoutDashboard },
  { href: "/applications/new", label: "New Application", icon: FilePlus },
  { href: "/applications",    label: "Applications",    icon: FolderOpen },
  { href: "/registry",        label: "Registry",        icon: Users },
];

function isActive(href: string, location: string) {
  if (href === "/") return location === "/";
  if (href === "/applications/new") return location.startsWith("/applications/new");
  if (href === "/applications") return location.startsWith("/applications") && !location.startsWith("/applications/new");
  return location.startsWith(href);
}

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col w-56 h-screen bg-navy shrink-0">
      {/* Logo */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3 mb-1">
          <FileText size={20} className="text-white shrink-0" />
          <span className="text-white font-bold text-lg leading-none">InfoMan</span>
        </div>
        <span className="text-xs ml-[35px]" style={{ color: "var(--color-navy-muted)" }}>
          Portal Application
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
              isActive(href, location)
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5",
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            DZ
          </div>
          <span className="text-slate-400 text-xs truncate">davezachary.macarayo@gmail.com</span>
        </div>
      </div>
    </div>
  );
}
