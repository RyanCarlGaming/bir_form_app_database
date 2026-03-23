import { Menu, Search, Bell } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Revenue Region No. 7</span>
          <span className="mx-2">•</span>
          <span>Quezon City</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search forms, TIN..." 
            className="pl-9 pr-4 py-2 w-64 bg-muted border-transparent rounded-full text-sm focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
        <button className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
        </button>
      </div>
    </header>
  );
}
