import { type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface LayoutProps {
  children: ReactNode;
  section?: string;
}

export default function Layout({ children, section }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto bg-canvas">
        <Topbar />
        <main className="flex-1 overflow-auto" style={{ padding: "36px 40px" }}>{children}</main>
      </div>
    </div>
  );
}
