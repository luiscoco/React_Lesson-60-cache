import "./globals.css";

export const metadata = {
  title: "React cache playground (RSC)",
  description: "Tiny playground showing React Server Components cache() examples.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="card">
            <h1 style={{ margin: 0 }}>React <code>cache()</code> playground</h1>
            <p style={{ margin: "8px 0 0 0" }}>
              Examples for Lesson 60 — <code>cache</code> (React Server Components).
            </p>
            <nav className="row" style={{ marginTop: 12 }}>
              <a className="pill" href="/">Home</a>
              <a className="pill" href="/preload">Preload</a>
            </nav>
          </header>
          {children}
          <footer className="card" style={{ marginTop: 24 }}>
            <small>
              Tip: Open your terminal logs to see when work runs vs when it is served from cache.
            </small>
          </footer>
        </div>
      </body>
    </html>
  );
}
