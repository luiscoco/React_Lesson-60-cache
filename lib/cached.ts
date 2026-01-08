import { cache } from "react";

// -------------------------------------------------------
// 2.1 Cache an expensive computation
// -------------------------------------------------------
export const computePricingModel = cache((companyId: string, tier: "basic" | "pro") => {
  console.log("[computePricingModel] RUN", { companyId, tier });

  // Simulate expensive CPU work
  let score = 0;
  for (let i = 0; i < 2_000_00; i++) {
    score = (score + i) % 97;
  }

  return {
    companyId,
    tier,
    score,
    computedAt: new Date().toISOString(),
  };
});

// -------------------------------------------------------
// 2.2 Share a snapshot of data (cache async work)
// -------------------------------------------------------
export const getUserProfile = cache(async (userId: string) => {
  console.log("[getUserProfile] RUN", { userId });

  // Use a public JSON API just as a demo (no secrets).
  // In a real app, you'd call your internal DB or service.
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
    headers: { Accept: "application/json" },
    // IMPORTANT: in Next you can also control caching of fetch itself.
    // Here we keep it simple and demonstrate React cache().
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user ${userId}: ${res.status}`);
  }

  const user = (await res.json()) as { id: number; name: string; email: string; company?: { name: string } };
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    company: user.company?.name ?? "—",
    fetchedAt: new Date().toISOString(),
  };
});

// -------------------------------------------------------
// 2.3 Preload data
// -------------------------------------------------------
export const getReport = cache(async (reportId: string) => {
  console.log("[getReport] RUN", { reportId });

  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${reportId}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`Failed to fetch report ${reportId}: ${res.status}`);

  const r = (await res.json()) as { id: number; title: string; body: string };
  return { ...r, fetchedAt: new Date().toISOString() };
});

export function preloadReport(reportId: string) {
  // Kick off the async work and store the promise in the cache.
  void getReport(reportId);
}

// -------------------------------------------------------
// Troubleshooting (non-primitive args pitfall)
// -------------------------------------------------------
export const getByObject = cache(async (query: { userId: string }) => {
  console.log("[getByObject] RUN", query);
  return { userId: query.userId, at: Date.now() };
});
