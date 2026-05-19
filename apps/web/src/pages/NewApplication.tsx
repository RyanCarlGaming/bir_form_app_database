import FormShell from "../components/FormShell";

export default function NewApplication() {
  return (
    <FormShell
      step={1}
      title="Personal Information"
      sub="BIR Form 1902 — Step 1 of 5"
      footer={
        <>
          <span />
          <button className="px-5 py-2 bg-blue text-white text-sm font-medium rounded hover:opacity-90 transition-opacity">
            Next
          </button>
        </>
      }
    >
      <p className="text-muted text-sm">Wizard steps — coming in Plan 03</p>
    </FormShell>
  );
}
