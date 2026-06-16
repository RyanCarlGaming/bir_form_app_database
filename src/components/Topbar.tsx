


function activeTab(location: string): string {
  if (location === "/dashboard") return "/dashboard";
  if (location.startsWith("/applications")) return "/applications";
  if (
    location.startsWith("/registry") ||
    location.startsWith("/issued-tins") ||
    location.startsWith("/verification-queue") ||
    location.startsWith("/drafts") ||
    location.startsWith("/records") ||
    location.startsWith("/reports")
  ) return "/reports";
  return "";
}

export default function Topbar() {
  return (
    <div
      style={{
        height: 1,
        background: "var(--color-border)",
      }}
    />
  );
}
