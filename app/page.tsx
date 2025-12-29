'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sources, EvidenceSource } from '@/data/sources';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [showOriginalLanguage, setShowOriginalLanguage] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Helper function to render manuscript witness section
  const renderManuscriptWitness = (source: EvidenceSource, categoryIndex: number) => {
    if (categoryIndex !== 0) return null; // Only show for featured (first) source

    const manuscript = source.manuscripts?.[0];
    const imageFromLink = source.links.find((l) => l.type === 'image')?.url;
    const manuscriptImage = manuscript?.imageUrl ?? imageFromLink ?? manuscript?.digitizedUrl;

    if (!manuscript || !manuscriptImage) return null;

    return (
      <div className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-900/60 p-3">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-400">
          Manuscript Witness
        </p>

        <button
          type="button"
          onClick={() => setFullscreenImage(manuscriptImage)}
          className="group mt-2 block w-full text-left hover:opacity-90 transition-opacity"
        >
          <div className="overflow-hidden rounded-xl border border-slate-700/80 cursor-pointer">
            <img
              src={manuscriptImage}
              alt={`${source.work} manuscript thumbnail`}
              className="w-full max-h-72 object-cover md:object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400 text-center">
            {manuscript.shelfmark}, {manuscript.library} ({manuscript.date}) – click to view full folio
          </p>
        </button>

      
      </div>
    );
  };

  // Helper function to render source card
  const renderSourceCard = (source: EvidenceSource, categoryIndex: number, categoryLabel: string) => {
    return (
      <div key={source.id} className="rounded-3xl border border-slate-700 bg-slate-800/90 px-5 py-4 shadow-lg transition-all duration-300 ease-out">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400">
            {categoryIndex === 0 ? `Featured ${categoryLabel} Source` : `${categoryLabel} Source`}
          </div>

          {/* Desktop hover tooltip */}
          <div className="hidden md:block relative group">
            <button
              type="button"
              className="text-[10px] font-semibold rounded-full bg-slate-700/80 px-3 py-1 uppercase tracking-[0.18em] text-slate-200"
            >
              {source.author.split(' ')[0]} • Info
            </button>

            <div className="pointer-events-none absolute right-0 z-20 mt-2 hidden w-72 rounded-2xl bg-slate-900/95 p-4 text-left shadow-2xl ring-1 ring-slate-700 group-hover:block">
              <p className="text-xs font-semibold text-slate-100">
                {source.author}
                {source.authorLifespan ? ` (${source.authorLifespan})` : ''}
              </p>
              <p className="mt-1 text-[11px] text-slate-300">
                {source.authorDescription}
              </p>
              <p className="mt-2 text-[11px] font-semibold text-slate-200">
                Work: <span className="italic">{source.work}</span>
                {source.section ? ` ${source.section}` : ''}
              </p>
              <p className="mt-1 text-[11px] text-slate-300">
                {source.workDescription}
              </p>
            </div>
          </div>

          {/* Mobile "Source details" toggle */}
          <button
            type="button"
            onClick={() => setShowMobileDetails((prev) => !prev)}
            className="md:hidden text-[10px] font-semibold rounded-full bg-slate-700/80 px-3 py-1 uppercase tracking-[0.18em] text-slate-200"
          >
            {showMobileDetails ? 'Hide details' : 'Source details'}
          </button>
        </div>

        {/* Mobile details block */}
        {showMobileDetails && (
          <div className="mt-3 rounded-2xl bg-slate-900/80 p-3 text-left md:hidden">
            <p className="text-xs font-semibold text-slate-100">
              {source.author}
              {source.authorLifespan ? ` (${source.authorLifespan})` : ''}
            </p>
            <p className="mt-1 text-[11px] text-slate-300">
              {source.authorDescription}
            </p>
            <p className="mt-2 text-[11px] font-semibold text-slate-200">
              Work: <span className="italic">{source.work}</span>
              {source.section ? ` ${source.section}` : ''}
            </p>
            <p className="mt-1 text-[11px] text-slate-300">
              {source.workDescription}
            </p>
          </div>
        )}

        {/* Main source content */}
        <h2 className="mt-2 text-sm font-semibold text-slate-100">
          {source.author},{' '}
          <span className="italic">{source.work}</span>
          {source.section ? ` ${source.section}` : null}
        </h2>

        <p className="mt-1 text-xs text-slate-400">{source.date}</p>

        {/* Quote */}
        <p className="mt-3 text-sm text-slate-100">
          "{showOriginalLanguage ? source.quoteOriginal : source.quoteEnglish}"
        </p>

        {/* View original language button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowOriginalLanguage(!showOriginalLanguage)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-sm font-semibold text-slate-200 transition-colors"
          >
            <span className="text-lg">
              {showOriginalLanguage ? '🇬🇧' : source.language === 'Latin' ? '🇮🇹' : source.language === 'Greek' ? '🇬🇷' : '🌐'}
            </span>
            {showOriginalLanguage ? `View English` : `View Original (${source.language})`}
          </button>
        </div>

        {/* Manuscript witness section */}
        {renderManuscriptWitness(source, categoryIndex)}

        {/* Summary */}
        <p className="mt-3 text-xs text-slate-400">
          {source.passageSummary}
        </p>

        {/* Source links */}
        <div className="mt-3 flex flex-wrap gap-3">
          {source.links
            .filter((link) => link.type === 'translation')
            .map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/50 text-sm font-semibold text-sky-200 transition-colors"
              >
                <span>📖</span>
                Source to Text
              </a>
            ))}

          {source.manuscripts.length > 0 && source.manuscripts[0].digitizedUrl && (
            <a
              href={source.manuscripts[0].digitizedUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-sm font-semibold text-amber-200 transition-colors"
            >
              <span>📜</span>
              View Digitized Manuscript
            </a>
          )}
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {source.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-700/80 px-3 py-1 text-[11px] font-medium text-slate-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Derived counts from the data model
  const categoryCounts = sources.reduce(
    (acc, source) => {
      acc[source.category] = (acc[source.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const romanCount = categoryCounts['Roman'] ?? 0;
  const jewishCount = categoryCounts['Jewish'] ?? 0;
  const christianCount = categoryCounts['Christian'] ?? 0;

  const romanSources = sources.filter((s) => s.category === 'Roman');
  const primaryRomanSource = romanSources[0];
  const jewishSources = sources.filter((s) => s.category === 'Jewish');
  const christianSources = sources.filter((s) => s.category === 'Christian');

  return (
    <main className="min-h-screen bg-slate-900 px-4">
      

      {/* Steps / Stepper (centered, constrained width) */}
      <div className="my-6">
        <h2 className="sr-only">Steps</h2>

        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full bg-[#B0A695] transition-all`}
              style={{ width: activeStep === 0 ? '25%' : activeStep === 1 ? '50%' : activeStep === 2 ? '75%' : '100%' }}
            />
          </div>

          <ol className="mt-4 grid grid-cols-1 gap-2 text-sm font-medium text-gray-600 sm:grid-cols-4">
            <li
              onClick={() => setActiveStep(0)}
              className={`flex cursor-pointer items-center justify-start gap-3 rounded-lg px-3 py-2 ${activeStep === 0 ? 'text-[#B0A695]' : 'text-gray-400'}`}
            >
              <svg className="h-6 w-6 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span className="text-xs sm:text-sm">Jesus Christ existed & was crucified</span>
            </li>

            <li
              onClick={() => setActiveStep(1)}
              className={`flex cursor-pointer items-center justify-center gap-3 rounded-lg px-3 py-2 ${activeStep === 1 ? 'text-[#B0A695]' : 'text-gray-400'}`}
            >
              <svg className="h-6 w-6 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs sm:text-sm">Jesus Christ is God</span>
            </li>

            <li
              onClick={() => setActiveStep(2)}
              className={`flex cursor-pointer items-center justify-center gap-3 rounded-lg px-3 py-2 ${activeStep === 2 ? 'text-[#B0A695]' : 'text-gray-400'}`}
            >
              <svg className="h-6 w-6 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs sm:text-sm">Jesus Christ starts his Church</span>
            </li>

            <li
              onClick={() => setActiveStep(3)}
              className={`flex cursor-pointer items-center justify-end gap-3 rounded-lg px-3 py-2 ${activeStep === 3 ? 'text-[#B0A695]' : 'text-gray-400'}`}
            >
              <svg className="h-6 w-6 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3m0 0a3 3 0 006 0m-6 0v4h6v-4" />
              </svg>
              <span className="text-xs sm:text-sm">Jesus' Teachings</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Main Content (shown only for step 0) */}
      <div className={`flex items-center justify-center min-h-[40vh] my-8 ${activeStep !== 0 ? 'hidden' : ''}`}>
        <div className="w-full max-w-3xl flex flex-col items-center">
          {/* Main CTA card */}
          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev);
              if (isOpen) {
                setActiveCategory(null);
                setShowMobileDetails(false);
              }
            }}
            aria-expanded={isOpen}
            className="w-full max-w-xl rounded-3xl btn-main hover:opacity-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#776B5D]/30 shadow-xl transition-transform duration-200 ease-out active:scale-95"
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
                {sources.length} Sources
              </span>
            </div>
          </button>

          {/* Animated reveal section */}
          <div
  className={`mt-6 w-full max-w-xl transition-all duration-300 ease-out ${
    isOpen ? 'opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'
  }`}
>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Roman sources */}
              <button
                type="button"
                onClick={() => {
                  setActiveCategory((prev) => (prev === 'Roman' ? null : 'Roman'));
                  setShowMobileDetails(false);
                }}
                className={`flex flex-col items-center rounded-3xl border px-6 py-5 text-center shadow-lg transition-colors ${
                  activeCategory === 'Roman'
                    ? 'border-[#b0a695] bg-slate-800'
                    : 'border-[#776b5d] bg-slate-800/80 hover:border-[#b0a695]'
                }`}
              >
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-300">
                  Roman Sources
                </span>
                <span className="mt-3 text-3xl font-extrabold text-white">
                  {romanCount}
                </span>
              </button>

              {/* Jewish sources */}
              <button
                type="button"
                onClick={() => {
                  setActiveCategory((prev) => (prev === 'Jewish' ? null : 'Jewish'));
                  setShowMobileDetails(false);
                }}
                className={`flex flex-col items-center rounded-3xl border px-6 py-5 text-center shadow-lg transition-colors ${
                  activeCategory === 'Jewish'
                    ? 'border-[#b0a695] bg-slate-800'
                    : 'border-[#776b5d] bg-slate-800/80 hover:border-[#b0a695]'
                }`}
              >
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-300">
                  Jewish Sources
                </span>
                <span className="mt-3 text-3xl font-extrabold text-white">
                  {jewishCount}
                </span>
              </button>

              {/* Christian sources */}
              <button
                type="button"
                onClick={() => {
                  setActiveCategory((prev) => (prev === 'Christian' ? null : 'Christian'));
                  setShowMobileDetails(false);
                }}
                className={`flex flex-col items-center rounded-3xl border px-6 py-5 text-center shadow-lg transition-colors ${
                  activeCategory === 'Christian'
                    ? 'border-[#b0a695] bg-slate-800'
                    : 'border-[#776b5d] bg-slate-800/80 hover:border-[#b0a695]'
                }`}
              >
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-300">
                  Christian Sources
                </span>
                <span className="mt-3 text-3xl font-extrabold text-white">
                  {christianCount}
                </span>
              </button>
            </div>
            {/* Roman sources preview – only after clicking "Roman Sources" */}
            {activeCategory === 'Roman' && romanSources.length > 0 && (
              <div className="mt-5 space-y-4">
                {romanSources.map((source, idx) => renderSourceCard(source, idx, 'Roman'))}
              </div>
            )}

            {/* Jewish sources preview */}
            {activeCategory === 'Jewish' && jewishSources.length > 0 && (
              <div className="mt-5 space-y-4">
                {jewishSources.map((source, idx) => renderSourceCard(source, idx, 'Jewish'))}
              </div>
            )}

            {/* Christian sources preview */}
            {activeCategory === 'Christian' && christianSources.length > 0 && (
              <div className="mt-5 space-y-4">
                {christianSources.map((source, idx) => renderSourceCard(source, idx, 'Christian'))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-slate-300 text-2xl font-bold z-10"
            onClick={() => setFullscreenImage(null)}
            aria-label="Close fullscreen image"
          >
            ×
          </button>
          <div className="max-w-4xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={fullscreenImage}
              alt="Fullscreen manuscript view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </main>
  );
}
