import ClientMemoDemo from "./client-demo";
import { computePricingModel, getUserProfile, getByObject } from "../lib/cached";
import { outsideProfilePromise } from "../lib/outside";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

// Server Component page (RSC)
export default async function Page() {
  const companyId = "apd-001";
  const tier = "pro" as const;

  // 2.1 — same args, multiple call sites => shared result
  const modelA = computePricingModel(companyId, tier);
  const modelB = computePricingModel(companyId, tier); // cache hit

  // 2.2 - cached fetch (promise shared)
  const userHeader = await getUserProfile("1");
  const userSidebar = await getUserProfile("1"); // cache hit

  // 3.2 - outside component call (module scope)
  const outsideProfile = await outsideProfilePromise;

  // 4C - object identity pitfall
  const q1 = { userId: "1" };
  const q2 = { userId: "1" };
  const obj1 = await getByObject(q1);
  const obj2 = await getByObject(q2); // likely MISS (different object reference)

  return (
    <main>
      <Card title="2.1 Cache an expensive computation">
        <p>
          Two calls to <code>computePricingModel(companyId, tier)</code> with the same args share one computation (per request).
          Check your terminal: it should log one <code>RUN</code> for that pair.
        </p>
        <div className="row">
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ marginBottom: 6 }}>Call A</h3>
            <pre>{JSON.stringify(modelA, null, 2)}</pre>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ marginBottom: 6 }}>Call B (same args)</h3>
            <pre>{JSON.stringify(modelB, null, 2)}</pre>
          </div>
        </div>
      </Card>

      <Card title="2.2 Share a snapshot of data (cached fetch)">
        <p>
          Two components (or call sites) awaiting <code>getUserProfile('1')</code> share the same in-flight promise and result.
          The JSON includes a <code>fetchedAt</code> timestamp so you can see it's the same data snapshot.
        </p>
        <div className="row">
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ marginBottom: 6 }}>Header</h3>
            <pre>{JSON.stringify(userHeader, null, 2)}</pre>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ marginBottom: 6 }}>Sidebar</h3>
            <pre>{JSON.stringify(userSidebar, null, 2)}</pre>
          </div>
        </div>
      </Card>

      <Card title="3.2 Pitfall - calling cache() outside a component">
        <p>
          The cache context is only available during Server Component rendering. A call made at module load time happens outside
          that context and will not use or update the per-request cache.
        </p>
        <div className="row">
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ marginBottom: 6 }}>Outside component (module scope)</h3>
            <pre>{JSON.stringify(outsideProfile, null, 2)}</pre>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ marginBottom: 6 }}>Inside component (RSC)</h3>
            <pre>{JSON.stringify(userHeader, null, 2)}</pre>
          </div>
        </div>
      </Card>

      <Card title="3.3 cache vs memo vs useMemo (Client Component)">
        <p>
          <code>useMemo</code> caches computations per component instance, while <code>memo</code> skips child re-renders if props
          do not change. Click the buttons and watch the console log for <code>ExpensiveView</code>.
        </p>
        <ClientMemoDemo />
      </Card>

      <Card title="4. Troubleshooting - non-primitive args (object identity)">
        <p>
          React cache keys use shallow equality. Two objects with identical contents are not equal unless they are the same reference.
          So <code>{`{ userId: "1" }`}</code> created twice usually results in two cache entries.
        </p>
        <div className="row">
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ marginBottom: 6 }}>Object q1</h3>
            <pre>{JSON.stringify(obj1, null, 2)}</pre>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ marginBottom: 6 }}>Object q2 (same values, new ref)</h3>
            <pre>{JSON.stringify(obj2, null, 2)}</pre>
          </div>
        </div>
        <p style={{ marginTop: 12 }}>
          Fix: prefer primitive keys (e.g., <code>getUserProfile(userId)</code>) or reuse the same object reference when appropriate.
        </p>
      </Card>
    </main>
  );
}
