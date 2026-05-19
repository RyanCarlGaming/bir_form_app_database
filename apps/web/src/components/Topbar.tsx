import { Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "../lib/useTheme";

interface TopbarProps { section?: string; }

export default function Topbar({ section }: TopbarProps) {
  const { isDark, toggle } = useTheme();

  return (
    <div className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
      <span className="text-sm font-medium text-text-2">{section}</span>
      <div className="flex items-center gap-1">
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-border text-muted transition-colors">
          <Bell size={16} />
        </button>
        <button
          onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-border text-muted transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center text-white text-xs font-semibold ml-1">
          DZ
        </div>
      </div>
    </div>
  );
}
