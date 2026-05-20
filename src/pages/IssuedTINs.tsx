import ApplicationStatusPage from "./ApplicationStatusPage";

export default function IssuedTINs() {
  return (
    <ApplicationStatusPage
      title="Issued TINs"
      sub="Filed applications with issued taxpayer identification numbers."
      status="filed"
      emptyTitle="No issued TINs yet."
      emptySub="Filed applications will appear here once verification is complete."
    />
  );
}
