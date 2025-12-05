'use client';

import { useState } from 'react';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col items-center">
          {/* Main CTA card */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="w-full max-w-xl rounded-3xl bg-sky-400/90 hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 shadow-xl transition-transform duration-200 ease-out active:scale-95"
          >
            <div className="flex flex-col items-center px-8 py-6 text-slate-900">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase">
                Evidence Dashboard
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-center">
                Jesus Christ Existed
              </h1>

              <span className="mt-4 inline-flex items-center rounded-full bg-white/90 px-6 py-2 text-sm sm:text-base font-semibold shadow-md">
                Show Me
              </span>

              <span className="mt-3 text-xs font-semibold tracking-[0.25em] uppercase">
                40 Sources
              </span>
            </div>
          </button>

          {/* Animated reveal section */}
          <div
            className={`mt-6 w-full max-w-xl overflow-hidden transition-all duration-300 ease-out ${
              isOpen ? 'max-h-96 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'
            }`}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Roman sources */}
              <div className="flex flex-col items-center rounded-3xl border border-slate-700 bg-slate-800/80 px-6 py-5 text-center shadow-lg">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-300">
                  Roman Sources
                </span>
                <span className="mt-3 text-3xl font-extrabold text-white">7</span>
              </div>

              {/* Jewish sources */}
              <div className="flex flex-col items-center rounded-3xl border border-slate-700 bg-slate-800/80 px-6 py-5 text-center shadow-lg">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-300">
                  Jewish Sources
                </span>
                <span className="mt-3 text-3xl font-extrabold text-white">3</span>
              </div>

              {/* Christian sources */}
              <div className="flex flex-col items-center rounded-3xl border border-slate-700 bg-slate-800/80 px-6 py-5 text-center shadow-lg">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-300">
                  Christian Sources
                </span>
                <span className="mt-3 text-3xl font-extrabold text-white">30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
