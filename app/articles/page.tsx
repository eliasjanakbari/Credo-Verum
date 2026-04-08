'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

interface Article {
  ArticleID: string;
  Title: string;
  Slug: string;
  Content: string;
  AuthorName: string;
  PublishedDate: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/articles');
        const data = await res.json();
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  // Extract plain text from HTML for preview
  const getPreview = (html: string, maxLength = 200) => {
    if (typeof window === 'undefined') return '';
    const div = document.createElement('div');
    div.innerHTML = DOMPurify.sanitize(html);
    const text = div.textContent || div.innerText || '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p>Loading articles...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Page Header */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-extrabold mb-2">Articles</h1>
          <p className="text-lg text-slate-600">
            Insights, research, and perspectives on early Christianity
          </p>
        </div>
      </div>

      {/* Articles List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No articles published yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {articles.map((article) => (
              <article
                key={article.ArticleID}
                className="border-b border-slate-200 pb-8 last:border-b-0"
              >
                <Link href={`/articles/${article.Slug}`}>
                  <h2 className="text-2xl font-bold text-slate-900 hover:text-sky-600 mb-2 transition-colors">
                    {article.Title}
                  </h2>
                </Link>

                <div className="text-sm text-slate-600 mb-3">
                  <span>{article.AuthorName}</span>
                  <span className="mx-2">•</span>
                  <time dateTime={article.PublishedDate}>
                    {new Date(article.PublishedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>

                <p className="text-slate-700 mb-4">
                  {getPreview(article.Content)}
                </p>

                <Link
                  href={`/articles/${article.Slug}`}
                  className="inline-flex items-center text-sky-600 hover:text-sky-700 font-medium"
                >
                  Read more
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
