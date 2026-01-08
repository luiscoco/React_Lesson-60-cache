"use client";

import { memo, useMemo, useState } from "react";

const ExpensiveView = memo(function ExpensiveView({ value }: { value: number }) {
  console.log("[ExpensiveView] render", value);
  return <div className="pill">Rendered value: {value}</div>;
});

export default function ClientMemoDemo() {
  const [n, setN] = useState(2);
  const [tick, setTick] = useState(0);

  const squared = useMemo(() => {
    let acc = 0;
    for (let i = 0; i < 150_000; i++) {
      acc = (acc + i) % 97;
    }
    return n * n;
  }, [n]);

  return (
    <div className="row" style={{ alignItems: "center" }}>
      <button className="pill" onClick={() => setN((x) => x + 1)}>
        Increment n (recompute)
      </button>
      <button className="pill" onClick={() => setTick((x) => x + 1)}>
        Rerender parent (tick {tick})
      </button>
      <ExpensiveView value={squared} />
    </div>
  );
}
