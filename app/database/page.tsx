'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { EvidenceSource, CategoryType } from '@/lib/types/sources';

// Category configuration for consistent styling
const categoryConfig: Record<CategoryType, { bg: string; text: string }> = {
  Roman: { bg: 'bg-red-100', text: 'text-red-700' },
  Jewish: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Christian: { bg: 'bg-green-100', text: 'text-green-700' },
  Nature: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Healing: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Resurrection: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Demons: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

export default function DatabasePage() {
  const [sources, setSources] = useState<EvidenceSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'author' | 'date' | 'category'>('author');

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/sources');
        const data = await res.json();
        setSources(data);
      } catch (error) {
        console.error('Error fetching sources:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Get unique categories from the data
  const availableCategories = useMemo(() => {
    return Array.from(new Set(sources.map((s) => s.category))).sort();
  }, [sources]);

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
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navigation handled in layout.tsx (Credo Verum) */}

      {/* Page Header */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold">Evidence Database</h2>
              <p className="mt-1 text-sm text-slate-600">
                {filteredAndSortedSources.length} of {sources.length} sources
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Author, work, quote, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'author' | 'date' | 'category')}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
            <p className="text-slate-600">No sources match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Author</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Work</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Language</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Quote (English)</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Tags</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSources.map((source, idx) => (
                  <tr
                    key={source.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      idx % 2 === 0 ? 'bg-slate-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-sky-600">{source.author}</div>
                      {source.authorLifespan && (
                        <div className="text-[11px] text-slate-500">{source.authorLifespan}</div>
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
                          categoryConfig[source.category].bg
                        } ${categoryConfig[source.category].text}`}
                      >
                        {source.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-700">{source.date}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-700">{source.language}</td>
                    <td className="px-4 py-4 max-w-md">
                      <p className="text-slate-700 line-clamp-2">{source.quoteEnglish}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {source.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block rounded-full bg-slate-200 px-2 py-1 text-[10px] text-slate-700"
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
