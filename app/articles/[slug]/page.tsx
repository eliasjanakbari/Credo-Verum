'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'dompurify';

interface Article {
  ArticleID: string;
  Title: string;
  Slug: string;
  Content: string;
  AuthorName: string;
  PublishedDate: string;
  Status: string;
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/articles/${slug}`);
        if (!res.ok) {
          setArticle(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setArticle(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching article:', error);
        setArticle(null);
        setLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F3EEEA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden p-8 md:p-12">
            <p>Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!article) {
    notFound();
  }

  // Sanitize HTML content (client-side only)
  const sanitizedContent = DOMPurify.sanitize(article.Content);

  return (
    <main className="min-h-screen bg-[#F3EEEA]">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Article Header */}
          <article className="p-8 md:p-12">
            <header className="mb-8 pb-8 border-b border-slate-200">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-cinzel">
                {article.Title}
              </h1>

              <div className="flex items-center text-slate-600 text-sm">
                <span className="font-medium">{article.AuthorName}</span>
                <span className="mx-2">•</span>
                <time dateTime={new Date(article.PublishedDate).toISOString()}>
                  {new Date(article.PublishedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </header>

            {/* Article Content */}
            <div
              className="prose prose-slate max-w-none
                prose-headings:font-bold prose-headings:text-slate-900
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-[#776b5d] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-slate-900 prose-strong:font-bold
                prose-em:italic
                prose-blockquote:border-l-4 prose-blockquote:border-[#776b5d] prose-blockquote:italic prose-blockquote:pl-4 prose-blockquote:text-slate-700
                prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-slate-900 prose-pre:text-slate-100
                prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                prose-li:mb-2
                prose-img:rounded-lg prose-img:shadow-lg
                [&_p]:mb-6"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </article>

          {/* CTA Card */}
          <div className="px-8 md:px-12 pb-8 md:pb-12">
            <Link
              href="/"
              className="block w-full rounded-2xl btn-main hover:opacity-95 shadow-xl transition-all duration-200 ease-out hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#776B5D]/30"
            >
              <div className="flex flex-col items-center px-8 py-8 text-slate-900 text-center">
                <div className="mb-3">
                  <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                  Explore the Evidence for Jesus
                </h2>
                <p className="text-sm md:text-base text-slate-700 max-w-xl mb-4">
                  Discover ancient manuscripts, historical sources, and Gospel accounts that document the life, miracles, and divinity of Jesus Christ.
                </p>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-2 text-sm md:text-base font-semibold shadow-md">
                  View Evidence
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
