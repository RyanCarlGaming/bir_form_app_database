import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Taxpayers", href: "/taxpayers", icon: Users },
  { name: "BIR Forms", href: "/forms", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xl z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary-foreground text-primary p-2 rounded-lg">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight">BIR Forms</h1>
          <p className="text-xs text-sidebar-foreground/60 font-medium">Portal Application</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href}>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group cursor-pointer",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                )} />
                {item.name}
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/70">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center font-bold text-xs text-sidebar-accent-foreground">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-medium text-sidebar-foreground">Admin User</p>
            <p className="truncate text-xs text-sidebar-foreground/50">Revenue Officer</p>
          </div>
          <Settings className="w-4 h-4 text-sidebar-foreground/50 cursor-pointer hover:text-sidebar-foreground transition-colors" />
        </div>
      </div>
    </div>
  );
}
