import ApplicationStatusPage from "./ApplicationStatusPage";

export default function MyDrafts() {
  return (
    <ApplicationStatusPage
      title="My Drafts"
      sub="Draft BIR Form 1902 applications waiting to be completed."
      status="draft"
      emptyTitle="No draft applications."
      emptySub="Drafts will appear here after you save or submit a new application."
    />
  );
}
