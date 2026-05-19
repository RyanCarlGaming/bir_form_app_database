import PageHeader from "../components/PageHeader";

interface Props { id: string; }

export default function ApplicationDetail({ id }: Props) {
  return (
    <>
      <PageHeader
        title={`Application #${id}`}
        back={{ href: "/applications", label: "Back to Applications" }}
      />
      <p className="text-muted text-sm">Application detail — coming in Plan 03</p>
    </>
  );
}
