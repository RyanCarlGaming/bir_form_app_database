import PageHeader from "../components/PageHeader";
import { Link } from "wouter";

export default function ApplicationsList() {
  return (
    <>
      <PageHeader
        title="Applications"
        sub="All BIR Form 1902 submissions"
        actions={
          <Link href="/applications/new" className="px-4 py-2 bg-blue text-white text-sm font-medium rounded hover:opacity-90 transition-opacity">
            + New Application
          </Link>
        }
      />
      <p className="text-muted text-sm">Applications list — coming in Plan 03</p>
    </>
  );
}
