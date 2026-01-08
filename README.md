# React 19.2 - Lesson 60 - cache()

Tiny repo to experiment with **Lesson 60 - `cache`**, using **React 19.2.x** in a **React Server Components** environment (Next.js App Router).

## 1.  Features (with code)

All memoized functions live in `lib/cached.ts` (module scope) so they can be shared across components.

<img width="1413" height="774" alt="image" src="https://github.com/user-attachments/assets/3575ea85-80e1-4d96-bd4d-8a9a7e3ff16a" />

<img width="1172" height="455" alt="image" src="https://github.com/user-attachments/assets/8e58189f-df19-4905-add5-a8c30876e5cc" />

<img width="1170" height="559" alt="image" src="https://github.com/user-attachments/assets/53d12f0e-b8f0-4e8e-b381-e0622f9902c7" />

### 2.1. Cache an expensive computation (sync)

```ts
export const computePricingModel = cache((companyId: string, tier: "basic" | "pro") => {
  console.log("[computePricingModel] RUN", { companyId, tier });
  let score = 0;
  for (let i = 0; i < 2_000_00; i++) {
    score = (score + i) % 97;
  }
  return { companyId, tier, score, computedAt: new Date().toISOString() };
});
```

Used twice with the same args in `app/page.tsx`, so the second call is a cache hit:

```tsx
const modelA = computePricingModel(companyId, tier);
const modelB = computePricingModel(companyId, tier); // cache hit
```

### 2.2. Share a snapshot of data (cached async fetch)

```ts
export const getUserProfile = cache(async (userId: string) => {
  console.log("[getUserProfile] RUN", { userId });
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch user ${userId}: ${res.status}`);
  const user = (await res.json()) as { id: number; name: string; email: string; company?: { name: string } };
  return { id: user.id, name: user.name, email: user.email, company: user.company?.name ?? "-", fetchedAt: new Date().toISOString() };
});
```

Both call sites await the same promise in `app/page.tsx`:

```tsx
const userHeader = await getUserProfile("1");
const userSidebar = await getUserProfile("1"); // cache hit
```

### 2.3. Preload data (prime the cache)

```ts
export const getReport = cache(async (reportId: string) => { /* ... */ });
export function preloadReport(reportId: string) {
  void getReport(reportId);
}
```

In `app/preload/page.tsx`, the report is kicked off early and reused later:

```tsx
preloadReport(reportId);
const report = await getReport(reportId);
```

## 4. Troubleshooting: object identity pitfall

```ts
export const getByObject = cache(async (query: { userId: string }) => {
  console.log("[getByObject] RUN", query);
  return { userId: query.userId, at: Date.now() };
});
```

In `app/page.tsx`, two objects with identical content are different references, so they usually miss the cache:

```tsx
const q1 = { userId: "1" };
const q2 = { userId: "1" };
const obj1 = await getByObject(q1);
const obj2 = await getByObject(q2); // likely MISS
```

## 5. How to run

```bash
npm install
npm run dev
```

Then open:

- Home: http://localhost:3000
- Preload demo: http://localhost:3000/preload

## 6. File-by-file purpose

- `app/layout.tsx`: App Router root layout, shared header/nav/footer, and metadata.
- `app/page.tsx`: Home page showing cache examples for sync compute, cached fetch, and object identity pitfall.
- `app/preload/page.tsx`: Preload demo that primes a cached fetch before awaiting it.
- `app/globals.css`: Global styles for layout, cards, and typography.
- `lib/cached.ts`: All `cache()` examples and helpers (compute, fetch, preload, pitfall).
- `package.json`: Dependencies and npm scripts for Next.js.
- `package-lock.json`: Locked dependency tree for reproducible installs.
- `next.config.mjs`: Next.js configuration (empty default export).
- `tsconfig.json`: TypeScript compiler options for the Next.js project.
- `jsconfig.json`: JS tooling config (baseUrl).
- `next-env.d.ts`: Generated Next.js TypeScript types.
- `.gitignore`: Git ignore rules.
- `.next/`: Next.js build output (generated).
- `node_modules/`: Installed dependencies (generated).

## 7. Notes

- `cache()` is intended for **Server Components**. This repo uses Next.js App Router to run RSC.
- React's server cache is **per request**. Reloading the page triggers a new server request, so you'll see fresh timestamps.
- Watch the terminal logs (`RUN`) to see when work is executed vs served from cache within the same request.

## 8. Versions

- React: 19.2.3
- Next.js: 15.2.0
