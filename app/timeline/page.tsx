'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sources } from '@/data/sources';

// Key historical events to display on the timeline
const keyEvents = [
  {
    year: 30,
    period: 'AD 30–33',
    event: "Jesus' Crucifixion",
    description: 'Jesus is crucified under Pontius Pilate during the reign of Tiberius',
    color: 'bg-red-500/20 border-red-500/50 text-red-300',
  },
  {
    year: 64,
    period: 'AD 64',
    event: 'Great Fire of Rome',
    description: 'Nero persecutes Christians, blaming them for the fire',
    color: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
  },
];

// Parse year from date string (e.g., "c. AD 116" → 116)
function parseYear(dateStr: string): number | null {
  const match = dateStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Combine and sort all timeline items
function getTimelineItems() {
  const items: Array<{
    type: 'event' | 'source';
    year: number;
    period?: string;
    event?: string;
    description?: string;
    color?: string;
    source?: (typeof sources)[0];
  }> = [];

  // Add key events
  keyEvents.forEach((event) => {
    items.push({
      type: 'event',
      year: event.year,
      period: event.period,
      event: event.event,
      description: event.description,
      color: event.color,
    });
  });

  // Add sources
  sources.forEach((source) => {
    const year = parseYear(source.date);
    if (year) {
      items.push({
        type: 'source',
        year,
        source,
      });
    }
  });

  // Sort by year
  return items.sort((a, b) => a.year - b.year);
}

export default function TimelinePage() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const timelineItems = getTimelineItems();

  const minYear = Math.min(...timelineItems.map((item) => item.year));
  const maxYear = Math.max(...timelineItems.map((item) => item.year));
  const yearRange = maxYear - minYear;

  const getPositionPercent = (year: number) => {
    return ((year - minYear) / yearRange) * 100;
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16 gap-4">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sm font-semibold text-slate-300 hover:text-sky-300 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/timeline"
              className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sm font-semibold text-slate-300 hover:text-sky-300 transition-colors"
            >
              Timeline
            </Link>
            <Link
              href="/database"
              className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sm font-semibold text-slate-300 hover:text-sky-300 transition-colors"
            >
              Database
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h2 className="text-3xl font-extrabold">Historical Timeline</h2>
            <p className="mt-1 text-sm text-slate-400">
              {sources.length} historical sources spanning key events in Christian history
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main timeline line */}
        <div className="relative">
          {/* Central vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-700 via-sky-500 to-slate-700 transform -translate-x-1/2"></div>

          {/* Timeline items */}
          <div className="space-y-12">
            {timelineItems.map((item, idx) => {
              const isEvent = item.type === 'event';
              const isLeft = idx % 2 === 0;

              return (
                <div key={idx} className="relative">
                  {/* Dot on the line */}
                  <div
                    className={`absolute left-1/2 top-6 w-5 h-5 rounded-full border-4 transform -translate-x-1/2 z-10 ${
                      isEvent
                        ? 'bg-slate-900 border-yellow-400 shadow-lg shadow-yellow-400/50'
                        : 'bg-slate-900 border-sky-400 shadow-lg shadow-sky-400/50'
                    }`}
                  ></div>

                  {/* Content container */}
                  <div className={`grid grid-cols-2 gap-8 ${isLeft ? '' : 'text-right'}`}>
                    {isLeft && (
                      <div
                        className={`${
                          isEvent
                            ? 'bg-yellow-500/10 border-yellow-500/30'
                            : 'bg-slate-800/50 border-slate-700'
                        } rounded-xl border p-4 pr-6`}
                      >
                        {isEvent ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-yellow-300">
                              {item.period}
                            </p>
                            <h3 className="mt-2 text-lg font-bold text-yellow-200">
                              {item.event}
                            </h3>
                            <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-semibold text-slate-400">
                              {item.source?.date}
                            </p>
                            <h3 className="mt-1 text-sm font-semibold text-sky-300">
                              {item.source?.author}
                            </h3>
                            <p className="mt-1 text-xs text-slate-400">
                              <span className="italic">{item.source?.work}</span>
                              {item.source?.section && ` ${item.source.section}`}
                            </p>
                            <p className="mt-2 text-xs text-slate-300 line-clamp-3">
                              {item.source?.quoteEnglish}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {item.source?.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-block rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSource(
                                  selectedSource === item.source?.id ? null : item.source?.id || null
                                )
                              }
                              className="mt-3 text-[11px] font-semibold text-sky-300 hover:text-sky-200 transition-colors"
                            >
                              {selectedSource === item.source?.id ? 'Hide details' : 'View details'} →
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {!isLeft && (
                      <div></div>
                    )}

                    {!isLeft && (
                      <div
                        className={`${
                          isEvent
                            ? 'bg-yellow-500/10 border-yellow-500/30'
                            : 'bg-slate-800/50 border-slate-700'
                        } rounded-xl border p-4 pl-6`}
                      >
                        {isEvent ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-yellow-300">
                              {item.period}
                            </p>
                            <h3 className="mt-2 text-lg font-bold text-yellow-200">
                              {item.event}
                            </h3>
                            <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-semibold text-slate-400">
                              {item.source?.date}
                            </p>
                            <h3 className="mt-1 text-sm font-semibold text-sky-300">
                              {item.source?.author}
                            </h3>
                            <p className="mt-1 text-xs text-slate-400">
                              <span className="italic">{item.source?.work}</span>
                              {item.source?.section && ` ${item.source.section}`}
                            </p>
                            <p className="mt-2 text-xs text-slate-300 line-clamp-3">
                              {item.source?.quoteEnglish}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1 justify-end">
                              {item.source?.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-block rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSource(
                                  selectedSource === item.source?.id ? null : item.source?.id || null
                                )
                              }
                              className="mt-3 text-[11px] font-semibold text-sky-300 hover:text-sky-200 transition-colors"
                            >
                              {selectedSource === item.source?.id ? 'Hide details' : 'View details'} →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expanded details */}
                  {!isEvent && selectedSource === item.source?.id && item.source && (
                    <div className="mt-4 rounded-xl bg-slate-800 border border-slate-700 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400 mb-2">
                            Author
                          </h4>
                          <p className="font-semibold text-sky-300">{item.source.author}</p>
                          {item.source.authorLifespan && (
                            <p className="text-xs text-slate-400 mt-1">{item.source.authorLifespan}</p>
                          )}
                          <p className="text-xs text-slate-300 mt-2">{item.source.authorDescription}</p>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400 mb-2">
                            Work
                          </h4>
                          <p className="font-semibold">
                            <span className="italic">{item.source.work}</span>
                            {item.source.section && ` ${item.source.section}`}
                          </p>
                          <p className="text-xs text-slate-300 mt-2">{item.source.workDescription}</p>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400 mb-2">
                            Details
                          </h4>
                          <p className="text-xs text-slate-300">
                            <span className="font-semibold">Language:</span> {item.source.language}
                          </p>
                          <p className="text-xs text-slate-300 mt-1">
                            <span className="font-semibold">Category:</span> {item.source.category}
                          </p>
                          <p className="text-xs text-slate-300 mt-1">
                            <span className="font-semibold">Type:</span> {item.source.evidenceType}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-slate-700 pt-4">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400 mb-2">
                          Summary
                        </h4>
                        <p className="text-sm text-slate-300">{item.source.passageSummary}</p>
                      </div>

                      {item.source.manuscripts.length > 0 && (
                        <div className="mt-4 border-t border-slate-700 pt-4">
                          <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400 mb-2">
                            Manuscript Witness
                          </h4>
                          {item.source.manuscripts.map((ms, msIdx) => (
                            <div key={msIdx} className="text-xs text-slate-300">
                              <p className="font-semibold">{ms.library}</p>
                              <p>{ms.shelfmark}</p>
                              <p>Date: {ms.date}</p>
                              {ms.notes && <p className="mt-1">{ms.notes}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
