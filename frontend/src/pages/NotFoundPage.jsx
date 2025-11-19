// NotFoundPage.tsx (or 404.tsx)
export default function NotFoundPage() {
  return (
    <div className="app-shell">
      {/* Top nav */}
      

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-24 pt-4">
        <section className="w-full max-w-3xl flex flex-col items-center text-center gap-8">
          {/* Icon */}
          <div className="icon-circle">
            {/* Search icon */}
            <svg
              className="w-9 h-9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="6" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </div>

          {/* Title + subtitle */}
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              404 – Page Not Found
            </h1>
            <p className="mt-3 max-w-xl mx-auto text-sm md:text-base text-[color:var(--color-muted)]">
              Oops! Looks like this page wandered off. Just like a friend you
              haven&apos;t talked to in a while, it seems to have gotten lost.
              But don&apos;t worry, we can help you get back on track!
            </p>
          </div>

          {/* “What can you do?” card */}
          <div className="card w-full max-w-2xl px-6 py-6 md:px-10 md:py-7 text-left">
            <h2 className="text-sm md:text-base font-semibold mb-4">
              What can you do?
            </h2>
            <ol className="space-y-4 text-sm md:text-base">
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[rgba(124,58,237,0.2)] text-xs font-bold flex items-center justify-center text-primary-200">
                  1
                </div>
                <p>Head back to the homepage and start fresh</p>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[rgba(124,58,237,0.2)] text-xs font-bold flex items-center justify-center text-primary-200">
                  2
                </div>
                <p>Check your connections and catch up with friends</p>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[rgba(124,58,237,0.2)] text-xs font-bold flex items-center justify-center text-primary-200">
                  3
                </div>
                <p>Double-check the URL you entered</p>
              </li>
            </ol>
          </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
            <a href="/" className="btn btn-primary">
                {/* Home icon */}
                <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 rounded-full bg-[rgba(255,255,255,0.12)] items-center justify-center text-sm">
                        🏠
                    </span>
                    <span>Go Home</span>
                </span>
            </a>
        </div>

        {/* Footer note */}
          <p className="mt-4 text-xs md:text-sm text-[color:var(--color-muted)]">
            Remember: Every friendship is worth finding your way back to.
          </p>
        </section>
      </main>

      
    </div>
  );
}
