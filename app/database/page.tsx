'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sources } from '@/data/sources';

export default function DatabasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'author' | 'date' | 'category'>('author');

  const filteredAndSortedSources = useMemo(() => {
    let filtered = sources;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (source) =>
          source.author.toLowerCase().includes(term) ||
          source.work.toLowerCase().includes(term) ||
          source.quoteEnglish.toLowerCase().includes(term) ||
          source.passageSummary.toLowerCase().includes(term) ||
          source.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter((source) => source.category === categoryFilter);
    }

    // Sort
    const sorted = [...filtered];
    if (sortBy === 'author') {
      sorted.sort((a, b) => a.author.localeCompare(b.author));
    } else if (sortBy === 'date') {
      sorted.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sortBy === 'category') {
      sorted.sort((a, b) => a.category.localeCompare(b.category));
    }

    return sorted;
  }, [searchTerm, categoryFilter, sortBy]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold">Evidence Database</h2>
              <p className="mt-1 text-sm text-slate-400">
                {filteredAndSortedSources.length} of {sources.length} sources
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-300 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Author, work, quote, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-300 mb-2">
                Category
              </label>
              <select
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Roman">Roman</option>
                <option value="Jewish">Jewish</option>
                <option value="Christian">Christian</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'author' | 'date' | 'category')}
                className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
              >
                <option value="author">Author</option>
                <option value="date">Date</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAndSortedSources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No sources match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/80">
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Author</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Work</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Language</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Quote (English)</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Tags</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSources.map((source, idx) => (
                  <tr
                    key={source.id}
                    className={`border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-slate-800/30' : ''
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-sky-300">{source.author}</div>
                      {source.authorLifespan && (
                        <div className="text-[11px] text-slate-400">{source.authorLifespan}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium">
                        <span className="italic">{source.work}</span>
                        {source.section && <span> {source.section}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          source.category === 'Roman'
                            ? 'bg-red-500/20 text-red-300'
                            : source.category === 'Jewish'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-green-500/20 text-green-300'
                        }`}
                      >
                        {source.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-300">{source.date}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-300">{source.language}</td>
                    <td className="px-4 py-4 max-w-md">
                      <p className="text-slate-300 line-clamp-2">{source.quoteEnglish}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {source.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block rounded-full bg-slate-700/60 px-2 py-1 text-[10px] text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
