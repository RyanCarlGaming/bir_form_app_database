import { ClipboardList } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";

export default function AuditLog() {
  return (
    <>
      <PageHeader title="Audit Log" sub="Coming soon." />
      <EmptyState
        icon={ClipboardList}
        title="Audit log not yet implemented"
        sub="Activity tracking will appear here in a future release."
      />
    </>
  );
}
