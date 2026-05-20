import PageHeader from "../components/PageHeader";

const groups = [
  {
    title: "Application Status",
    rows: [
      ["draft", "Application is saved but not yet under review."],
      ["submitted", "Application is waiting for officer verification."],
      ["filed", "Application has passed verification and TIN issuance."],
      ["amended", "Application was returned for correction."],
    ],
  },
  {
    title: "Taxpayer Fields",
    rows: [
      ["tin", "Taxpayer Identification Number"],
      ["rdoCode", "Revenue District Office code"],
      ["pcn", "Pre-generated control number"],
      ["atc", "Alphanumeric tax code"],
    ],
  },
  {
    title: "Employment Type",
    rows: [
      ["primary", "Main employer record"],
      ["concurrent", "Concurrent employment"],
      ["successive", "Successive employment"],
    ],
  },
];

export default function DataDictionary() {
  return (
    <>
      <PageHeader title="Data Dictionary" sub="Reference values used by the BIR Form 1902 workflow." />
      <div className="grid grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.title} className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-canvas">
              <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-2">{group.title}</p>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {group.rows.map(([key, description]) => (
                  <tr key={key} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-mono text-xs text-text">{key}</td>
                    <td className="px-5 py-3 text-xs text-muted">{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
}
