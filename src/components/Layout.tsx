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
      <div className="flex-1 flex flex-col overflow-auto bg-canvas" style={{ scrollbarGutter: "stable" }}>
        <Topbar />
        <main className="pt-20 px-6">{children}</main>
      </div>
    </div>
  );
}
