import { getReport, preloadReport } from "../../lib/cached";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

export default async function PreloadPage() {
  const reportId = "1";

  // 2.3 Preload data
  preloadReport(reportId);

  // Pretend we do other server work while the report fetch is running.
  const serverWork = Array.from({ length: 6 }, (_, i) => `Work item ${i + 1}`);

  const report = await getReport(reportId);

  return (
    <main>
      <Card title="2.3 Preload data">
        <p>
          <code>preloadReport(id)</code> triggers <code>getReport(id)</code> early (without awaiting). Later, awaiting{" "}
          <code>getReport(id)</code> reuses the same promise/result.
        </p>
        <h3 style={{ marginBottom: 6 }}>Some other server work</h3>
        <ul>
          {serverWork.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>

        <h3 style={{ marginBottom: 6, marginTop: 16 }}>Report</h3>
        <pre>{JSON.stringify(report, null, 2)}</pre>
      </Card>
    </main>
  );
}
