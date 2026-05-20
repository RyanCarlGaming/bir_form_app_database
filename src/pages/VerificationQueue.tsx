import ApplicationStatusPage from "./ApplicationStatusPage";

export default function VerificationQueue() {
  return (
    <ApplicationStatusPage
      title="Verification Queue"
      sub="Submitted applications waiting for officer review."
      status="submitted"
      emptyTitle="Nothing waiting for verification."
      emptySub="Submitted applications will appear here when taxpayers are ready for review."
    />
  );
}
