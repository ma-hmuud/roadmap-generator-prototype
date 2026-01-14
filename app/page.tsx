import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <span className="text-zinc-100 font-semibold">Roadmap</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-zinc-100 tracking-tight leading-tight">
            Learn anything,
            <br />
            <span className="text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
              step by step
            </span>
          </h1>

          <p className="mt-6 text-lg text-zinc-500 max-w-md mx-auto">
            AI creates personalized learning roadmaps tailored to your goals and experience level.
          </p>

          <div className="mt-10">
            <Link href="/signin">
              <button
                className="px-8 py-3.5 rounded-lg text-white font-medium text-base transition-transform hover:scale-105 active:scale-100"
                style={{ background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)' }}
              >
                Get started — it&apos;s free
              </button>
            </Link>
          </div>

          {/* Minimal feature hints */}
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-zinc-600">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Any topic
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Personalized
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Track progress
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-zinc-700 text-xs">
        Powered by AI
      </footer>
    </div>
  );
}
