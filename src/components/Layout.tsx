import { type ReactNode } from "react";
import Navbar from "./Navbar";
import Topbar from "./Topbar";

interface LayoutProps {
  children: ReactNode;
  section?: string;
}

export default function Layout({ children, section }: LayoutProps) {
  void section;

  return (
    <div className="flex min-h-dvh overflow-hidden">
      <Navbar />
      <div className="flex-1 flex flex-col overflow-auto bg-canvas">
        <Topbar />
        <main className="flex-1 overflow-auto px-4 py-5 sm:px-6 lg:px-10 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
